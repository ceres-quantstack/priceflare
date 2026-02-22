const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { chromium } = require('playwright-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

// Apply stealth patches (evades bot detection)
chromium.use(StealthPlugin());

const app = express();
const PORT = 8095;
const CHROMIUM_PATH = '/snap/bin/chromium';

// --- Result Cache ---
// Cache search results for 10 minutes to avoid redundant scraping
const searchCache = new Map(); // key: normalized query, value: { results, timestamp }
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

function getCached(query) {
  const key = query.toLowerCase().trim();
  const entry = searchCache.get(key);
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL_MS) {
    return entry;
  }
  if (entry) searchCache.delete(key); // expired
  return null;
}

function setCache(query, results) {
  const key = query.toLowerCase().trim();
  searchCache.set(key, { results, timestamp: Date.now() });
  // Prune old entries (keep max 100)
  if (searchCache.size > 100) {
    const oldest = [...searchCache.entries()].sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
    if (oldest) searchCache.delete(oldest[0]);
  }
}

// --- Relevance Scoring ---
// Compare product title to search query to filter irrelevant results
function relevanceScore(title, query) {
  if (!title || !query) return 0;
  const titleLower = title.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  
  // Accessory detection — penalize titles that are clearly accessories/cases/covers for the product
  const accessoryWords = ['case', 'cover', 'screen protector', 'charger', 'cable', 'adapter', 'stand', 'mount', 'skin', 'decal', 'sticker', 'holder', 'grip', 'strap', 'bag', 'pouch', 'sleeve', 'dock', 'tempered glass', 'film', 'kit'];
  const titleWords = titleLower.split(/\s+/);
  for (const acc of accessoryWords) {
    if (titleLower.includes(acc) && !queryLower.includes(acc)) {
      // Title contains an accessory keyword not in the query — likely an accessory
      return 0.15;
    }
  }

  // Exact phrase match — best possible score
  if (titleLower.includes(queryLower)) return 1.0;
  
  // Check for consecutive word sequences (phrase proximity)
  // e.g. "nintendo switch 2" should match "Nintendo Switch 2 Console" but NOT "Garfield 2-in-1... Nintendo Switch"
  let longestConsecutive = 0;
  for (let start = 0; start < queryWords.length; start++) {
    for (let end = queryWords.length; end > start; end--) {
      const phrase = queryWords.slice(start, end).join(' ');
      if (titleLower.includes(phrase)) {
        longestConsecutive = Math.max(longestConsecutive, end - start);
        break;
      }
    }
  }
  
  // Word overlap
  let matched = 0;
  for (const word of queryWords) {
    if (titleLower.includes(word)) matched++;
  }
  
  const wordScore = queryWords.length > 0 ? matched / queryWords.length : 0;
  const phraseScore = queryWords.length > 0 ? longestConsecutive / queryWords.length : 0;
  
  // For multi-word queries, require high phrase match
  // The full query (or nearly all of it) must appear as consecutive words in the title
  if (queryWords.length >= 2) {
    if (longestConsecutive < queryWords.length) {
      // Not an exact phrase match — penalize heavily
      // Only pass if the product title is clearly about the queried product
      return wordScore * 0.25;
    }
  }
  return phraseScore * 0.6 + wordScore * 0.4;
}

// Minimum relevance threshold — product must match well as a phrase, not just scattered words
const MIN_RELEVANCE = 0.6;

const RETAILERS = [
  { name: 'Amazon', emoji: '📦', color: '#FF9900',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent('"' + q + '"')}`,
    parse: ($page) => extractAmazon($page) },
  { name: 'Target', emoji: '🎯', color: '#CC0000',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    parse: ($page, q) => extractTarget($page, q) },
  { name: 'Newegg', emoji: '🥚', color: '#FF6600',
    searchUrl: (q) => `https://www.newegg.com/p/pl?d=${encodeURIComponent('"' + q + '"')}`,
    parse: ($page) => extractNewegg($page) },
  { name: 'eBay', emoji: '🛒', color: '#E53238',
    searchUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    parse: ($page) => extractEbay($page) },
  { name: 'Best Buy', emoji: '⚡', color: '#0046BE',
    searchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`,
    parse: ($page) => extractBestBuy($page) },
];

app.use(cors({
  origin: ['http://192.168.1.100:8094', 'http://localhost:3000', 'http://localhost:8094'],
  credentials: true
}));

const limiter = rateLimit({ windowMs: 60 * 1000, max: 10, message: { error: 'Rate limit exceeded' } });
app.use('/api', limiter);
app.use(express.json());

app.get('/health', (req, res) => res.json({ 
  status: 'ok', 
  cache: { entries: searchCache.size, ttlMinutes: CACHE_TTL_MS / 60000 },
  uptime: Math.floor(process.uptime()) + 's',
}));
app.post('/api/cache/clear', (req, res) => { searchCache.clear(); res.json({ cleared: true }); });

// Shared browser instance (reuse across requests)
let browser = null;
async function getBrowser() {
  if (!browser || !browser.isConnected()) {
    console.log('Launching browser...');
    browser = await chromium.launch({
      executablePath: CHROMIUM_PATH,
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run',
      ]
    });
    console.log('Browser launched');
  }
  return browser;
}

// Extract price from text  
function extractPrice(text) {
  if (!text) return null;
  const m = text.match(/\$\s*([\d,]+\.?\d*)/);
  return m ? parseFloat(m[1].replace(/,/g, '')) : null;
}

// --- Retailer-specific extractors ---

async function extractAmazon(page) {
  await page.waitForSelector('[data-component-type="s-search-result"]', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('[data-component-type="s-search-result"]');
    if (!item) return null;
    
    // Get product title from the first link containing /dp/ with substantial text
    let title = null;
    let href = null;
    const dpLinks = item.querySelectorAll('a[href*="/dp/"]');
    for (const link of dpLinks) {
      const text = link.innerText?.trim();
      // Skip links that are just prices
      if (text && text.length > 15 && !text.startsWith('$')) {
        title = text.split('\n')[0].trim(); // First line only (before price)
        href = link.getAttribute('href');
        break;
      }
    }
    if (href && !href.startsWith('http')) href = 'https://www.amazon.com' + href;
    try { href = href.split('/ref=')[0]; } catch(e) {}
    
    // Get price
    const priceWhole = item.querySelector('.a-price:not([data-a-strike]) .a-price-whole');
    const priceFrac = item.querySelector('.a-price:not([data-a-strike]) .a-price-fraction');
    let price = null;
    if (priceWhole) {
      const whole = priceWhole.textContent.replace(/[,\.]/g, '');
      const frac = priceFrac?.textContent || '00';
      price = parseFloat(`${whole}.${frac}`);
    }
    // Get product image
    const imgEl = item.querySelector('img.s-image');
    const image = imgEl?.src || null;
    
    return { title, price, url: href, image };
  });
  return product;
}

// Walmart removed — consistently CAPTCHA'd even with stealth plugin

async function extractTarget(page, query) {
  // Direct Redsky API — no browser needed, fast and accurate.
  // Uses Target's public API key + a physical store ID for pricing.
  const REDSKY_KEY = '9f36aeafbe60771e321a7cc95a78140772ab3e96';
  const STORE_ID = '1375'; // Physical Target store (NYC area)
  
  const ACCESSORY_PATTERNS = [
    /\bcases?\b/i, /\bcovers?\b/i, /\bstraps?\b/i, /\bsleeves?\b/i, /\bholders?\b/i,
    /\bstands?\b/i, /\bmounts?\b/i, /\bchargers?\b/i, /\bcables?\b/i, /\badapters?\b/i,
    /\bscreen protector\b/i, /\bskins?\b/i, /\bpouch/i, /\bdocks?\b/i, /\bcradle\b/i,
    /\bkits?\b/i, /\baccessor/i, /\bfilms?\b/i, /\bcleaning\b/i, /\btips?\b/i,
    /\bprotection plan\b/i, /\bwarranty\b/i, /\bapplecare\b/i, /\btempered glass\b/i,
    /\blanyard\b/i, /\bkeychain\b/i, /\bclips?\b/i, /\bhooks?\b/i,
  ];
  
  function isAccessory(title) {
    const lower = title.toLowerCase();
    const queryLower = query.toLowerCase();
    for (const pattern of ACCESSORY_PATTERNS) {
      const match = lower.match(pattern);
      if (match && !queryLower.includes(match[0].toLowerCase())) return true;
    }
    return false;
  }
  
  try {
    const exactQuery = `"${query}"`;
    const searchUrl = `https://redsky.target.com/redsky_aggregations/v1/web/plp_search_v2?key=${REDSKY_KEY}&channel=WEB&count=20&default_purchasability_filter=true&keyword=${encodeURIComponent(exactQuery)}&offset=0&page=%2Fs%2F${encodeURIComponent(exactQuery)}&pricing_store_id=${STORE_ID}&store_ids=${STORE_ID}&visitor_id=pf_${Date.now()}`;
    
    const resp = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      signal: AbortSignal.timeout(20000),
    });
    
    if (!resp.ok) {
      console.log(`[Target] Redsky search returned ${resp.status}`);
      return null;
    }
    
    const json = await resp.json();
    const products = json?.data?.search?.products || [];
    
    if (products.length === 0) {
      console.log('[Target] No products from Redsky search');
      return null;
    }
    
    // Score and rank products
    const scored = products.map((p, i) => {
      const title = p?.item?.product_description?.title || '';
      const price = p?.price?.current_retail || p?.price?.current_retail_min || p?.price?.reg_retail || null;
      const tcin = p?.tcin || '';
      const url = p?.item?.enrichment?.buy_url || (tcin ? `https://www.target.com/p/-/A-${tcin}` : null);
      
      // Relevance score
      const tLower = title.toLowerCase();
      const qLower = query.toLowerCase();
      const qWords = qLower.split(/\s+/).filter(w => w.length > 1);
      let score = 0;
      if (qWords.length > 0) {
        let matched = 0;
        for (const w of qWords) { if (tLower.includes(w)) matched++; }
        score = matched / qWords.length;
        if (tLower.includes(qLower)) score = Math.max(score, 1.0);
      }
      
      // Penalize accessories
      if (isAccessory(title)) score *= 0.05;
      if (/\bfor\b/i.test(tLower) && !qLower.includes('for')) score *= 0.15;
      
      // Bonus for early position (Target's own relevance)
      if (i < 3) score += 0.1;
      
      const image = p?.item?.enrichment?.images?.primary_image_url || null;
      return { title: title.substring(0, 200), price, url, tcin, score, position: i, image };
    });
    
    scored.sort((a, b) => b.score - a.score);
    
    for (const s of scored.slice(0, 5)) {
      console.log(`[Target]   ${s.score.toFixed(3)} ${s.price ? '$'+s.price : 'no$'} "${s.title.substring(0,80)}" (#${s.position})`);
    }
    
    const best = scored[0];
    if (!best || best.score < 0.5) {
      console.log(`[Target] No relevant product (best: ${best?.score?.toFixed(3) || 0})`);
      return null;
    }
    
    // Always verify/fetch price via PDP API for best accuracy
    if (best.tcin) {
      try {
        const pdpUrl = `https://redsky.target.com/redsky_aggregations/v1/web/pdp_client_v1?key=${REDSKY_KEY}&tcin=${best.tcin}&pricing_store_id=${STORE_ID}&has_pricing_store_id=true`;
        const pdpResp = await fetch(pdpUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
          signal: AbortSignal.timeout(15000),
        });
        if (pdpResp.ok) {
          const pdpJson = await pdpResp.json();
          const priceObj = pdpJson?.data?.product?.price;
          const pdpPrice = priceObj?.current_retail || priceObj?.current_retail_min || priceObj?.reg_retail || null;
          if (pdpPrice) {
            console.log(`[Target] PDP price: $${pdpPrice}${best.price && pdpPrice !== best.price ? ` (search had $${best.price})` : ''}`);
            best.price = pdpPrice; // PDP price is most accurate
          }
        }
      } catch (e) {
        console.log(`[Target] PDP fetch error: ${e.message}`);
      }
    }
    
    console.log(`[Target] Result: "${best.title.substring(0,60)}" $${best.price || 'none'}`);
    return [best];
    
  } catch (e) {
    console.log(`[Target] Error: ${e.message}`);
    return null;
  }
}

async function extractNewegg(page) {
  await page.waitForSelector('.item-cell, .item-container', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('.item-cell, .item-container');
    if (!item) return null;
    const titleEl = item.querySelector('.item-title, a.item-title');
    const title = titleEl?.textContent?.trim();
    const url = titleEl?.href;
    const priceEl = item.querySelector('.price-current');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/([\d,]+)/);
    const priceSup = priceEl?.querySelector('sup')?.textContent || '';
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '') + (priceSup ? `.${priceSup}` : '')) : null;
    const imgEl = item.querySelector('.item-img img, a.item-img img');
    const image = imgEl?.src || null;
    return { title, price, url, image };
  });
  return product;
}

async function extractEbay(page) {
  await page.waitForSelector('li, [class*="s-card"]', { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(5000); // eBay needs significant render time
  
  const product = await page.evaluate((searchQuery) => {
    // eBay renders product listings in li elements
    // Find li elements that contain product info + price
    const lis = document.querySelectorAll('li');
    const queryLower = searchQuery.toLowerCase();
    const results = [];
    
    for (const li of lis) {
      const text = li.innerText?.trim();
      if (!text || text.length < 30 || text.length > 1000) continue;
      if (text.includes('Shop on eBay')) continue;
      
      // Must contain a price
      const priceMatch = text.match(/\$([\d,]+\.?\d*)/);
      if (!priceMatch) continue;
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (price < 10 || price > 5000) continue;
      
      // Should contain a product link
      const link = li.querySelector('a[href*="ebay.com/itm/"]');
      if (!link) continue;
      
      // Get title from first line of text
      const lines = text.split('\n').filter(l => l.trim().length > 10);
      const title = lines[0]?.trim();
      if (!title) continue;
      
      // Prefer "Buy It Now" listings over auctions
      const isBuyNow = text.includes('Buy It Now');
      const url = link.href.split('?')[0];
      
      // Get image
      const imgEl = li.querySelector('img');
      const image = imgEl?.src || null;
      
      results.push({ title: title.substring(0, 200), price, url, isBuyNow, image });
      if (results.length >= 8) break;
    }
    
    return results;
  }, page.url().includes('_nkw=') ? decodeURIComponent(page.url().split('_nkw=')[1].split('&')[0]) : '');
  return product; // Returns array — searchRetailer picks best match
}

async function extractBestBuy(page) {
  await page.waitForSelector('.product-list-item', { timeout: 8000 }).catch(() => {});
  
  const products = await page.evaluate(() => {
    const items = document.querySelectorAll('.product-list-item');
    const results = [];
    
    for (const item of items) {
      if (results.length >= 8) break;
      
      // Title: prefer the named product link class, fall back to href-based selectors
      let titleEl = item.querySelector('a.product-list-item-link');
      if (!titleEl || !titleEl.innerText?.trim()) {
        titleEl = item.querySelector('a[href*="/product/"], a[href*="/site/"]');
      }
      // Skip links with empty text (image-only links)
      if (titleEl && !titleEl.innerText?.trim()) {
        const allLinks = item.querySelectorAll('a[href*="/product/"], a[href*="/site/"]');
        for (const link of allLinks) {
          if (link.innerText?.trim()) { titleEl = link; break; }
        }
      }
      const title = titleEl?.innerText?.trim();
      if (!title) continue;
      let url = titleEl?.href;
      if (url && !url.startsWith('http')) url = 'https://www.bestbuy.com' + url;
      
      // Price: find spans containing $ price pattern
      let price = null;
      const spans = item.querySelectorAll('span');
      for (const span of spans) {
        const text = span.innerText?.trim();
        if (text && /^\$[\d,]+\.?\d*$/.test(text)) {
          price = parseFloat(text.replace(/[$,]/g, ''));
          break;
        }
      }
      
      // Get image
      const imgEl = item.querySelector('img.product-image, img[class*="product"], .shop-sku-list-item img, picture img');
      const image = imgEl?.src || null;
      
      results.push({ title: title.substring(0, 200), price, url, image });
    }
    return results;
  });
  return products; // Returns array — searchRetailer will pick best match
}

// Search a single retailer using headless browser
async function searchRetailer(retailer, query) {
  let context;
  try {
    let rawResult;
    
    if (retailer.name === 'Target') {
      // Target uses direct Redsky API — no browser needed
      rawResult = await retailer.parse(null, query);
    } else {
      const br = await getBrowser();
      context = await br.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        viewport: { width: 1280, height: 800 },
        locale: 'en-US',
      });
      
      const page = await context.newPage();
      const searchUrl = retailer.searchUrl(query);
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Give JS time to render (some sites need more time)
      const waitTime = ['eBay', 'Best Buy'].includes(retailer.name) ? 4000 : 2000;
      await page.waitForTimeout(waitTime);
      
      rawResult = await retailer.parse(page);
      await context.close();
    }
    
    // Handle extractors that return arrays (Target returns multiple candidates)
    let product = null;
    if (Array.isArray(rawResult)) {
      // Pick the most relevant product from the array
      let bestScore = -1;
      for (const candidate of rawResult) {
        const score = relevanceScore(candidate.title, query);
        if (score > bestScore && score >= MIN_RELEVANCE) {
          bestScore = score;
          product = candidate;
        }
      }
      // If no relevant match, skip this retailer entirely
      if (!product) {
        console.log(`[${retailer.name}] No relevant match for "${query}" — skipping`);
        return null;
      }
    } else {
      product = rawResult;
    }
    
    // Apply relevance check on single results too (skip clearly wrong products)
    if (product && product.title) {
      const score = relevanceScore(product.title, query);
      if (score < MIN_RELEVANCE) {
        console.log(`[${retailer.name}] Low relevance (${score.toFixed(2)}): "${product.title}" for query "${query}" — excluded`);
        return null;
      }
    }
    
    if (product && product.price) {
      let price = product.price;
      if (price > 5000) price = null;
      if (price < 1) price = null;
      if (!price) return null; // No valid price — skip
      
      const result = {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: (product.title && product.title.length > 5) ? product.title : query,
        price,
        url: product.url || retailer.searchUrl(query),
        description: price ? `$${price} on ${retailer.name}` : `View on ${retailer.name}`,
        inStock: true,
        source: price ? 'live' : 'live-noPrice',
      };
      if (product.image) result.image = product.image;
      return result;
    }
  } catch (err) {
    console.error(`[${retailer.name}] Error:`, err.message);
    if (context) await context.close().catch(() => {});
  }

  // Fallback
  return {
    retailer: retailer.name,
    retailerEmoji: retailer.emoji,
    retailerColor: retailer.color,
    productName: query,
    price: null,
    url: retailer.searchUrl(query),
    description: `Search "${query}" on ${retailer.name}`,
    inStock: true,
    source: 'fallback',
  };
}

// SSE streaming endpoint - sends results as they complete
app.get('/api/search/stream', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Check cache first
  const cached = getCached(query);
  if (cached) {
    console.log(`[${new Date().toISOString()}] SSE Cache hit: "${query}" (${cached.results.length} results)`);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    for (const r of cached.results) {
      res.write(`data: ${JSON.stringify({ ...r, source: r.source + '-cached' })}\n\n`);
    }
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    return;
  }

  console.log(`[${new Date().toISOString()}] SSE Search: "${query}"`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    const allResults = [];
    // Search all retailers concurrently and stream results as they complete
    const searchPromises = RETAILERS.map(async (retailer) => {
      try {
        const result = await searchRetailer(retailer, query);
        if (result && result.price) {
          allResults.push(result);
          res.write(`data: ${JSON.stringify(result)}\n\n`);
        }
      } catch (error) {
        console.error(`[${retailer.name}] Stream error:`, error.message);
        // Skip failed retailers — don't send error entries to frontend
      }
    });

    await Promise.all(searchPromises);

    // Cache results
    if (allResults.length > 0) setCache(query, allResults);

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
    console.log(`[${new Date().toISOString()}] SSE stream complete: "${query}"`);

  } catch (error) {
    console.error('SSE stream error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`);
    res.end();
  }
});

// Main search endpoint (backwards compatible)
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  if (!query || !query.trim()) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  // Check cache
  const cached = getCached(query);
  if (cached) {
    console.log(`[${new Date().toISOString()}] Cache hit: "${query}"`);
    const products = cached.results.map(r => ({ ...r, source: r.source + '-cached' }));
    return res.json({
      query, results: products, timestamp: new Date().toISOString(),
      elapsed: '0ms (cached)',
      sources: {
        live: products.filter(p => p.source.includes('live')).length,
        withPrice: products.filter(p => p.price).length,
        fallback: products.filter(p => p.source.includes('fallback') || p.source.includes('error')).length,
      }
    });
  }

  console.log(`[${new Date().toISOString()}] Search: "${query}"`);
  const startTime = Date.now();

  try {
    // Search retailers: Target runs via HTTP (no browser), others use Playwright
    // Run all concurrently — Target won't consume browser resources
    const results = await Promise.allSettled(
      RETAILERS.map(r => searchRetailer(r, query))
    );

    const products = results.map((r, idx) => {
      if (r.status === 'fulfilled') return r.value;
      return null; // skip failed retailers
    }).filter(p => p !== null);

    const elapsed = Date.now() - startTime;
    const response = {
      query,
      results: products,
      timestamp: new Date().toISOString(),
      elapsed: `${elapsed}ms`,
      sources: {
        live: products.filter(p => p.source.startsWith('live')).length,
        withPrice: products.filter(p => p.price).length,
        fallback: products.filter(p => p.source === 'fallback' || p.source === 'error').length,
      }
    };

    // Cache if we got any prices
    if (products.some(p => p.price)) setCache(query, products);

    console.log(`[${new Date().toISOString()}] "${query}" → ${response.sources.withPrice} prices in ${elapsed}ms`);
    res.json(response);

  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  if (browser) await browser.close();
  process.exit(0);
});

// Pre-launch browser on startup
getBrowser().then(() => console.log('Browser ready'));

app.listen(PORT, () => {
  console.log(`PriceFlare API running on port ${PORT} (Playwright + Chromium)`);
});
