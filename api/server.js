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

// --- Relevance Scoring ---
// Compare product title to search query to filter irrelevant results
function relevanceScore(title, query) {
  if (!title || !query) return 0;
  const titleLower = title.toLowerCase();
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 1);
  
  // Exact match
  if (titleLower.includes(queryLower)) return 1.0;
  
  // Word overlap
  let matched = 0;
  for (const word of queryWords) {
    if (titleLower.includes(word)) matched++;
  }
  return queryWords.length > 0 ? matched / queryWords.length : 0;
}

// Minimum relevance threshold — product must match at least 50% of query words
const MIN_RELEVANCE = 0.5;

const RETAILERS = [
  { name: 'Amazon', emoji: '📦', color: '#FF9900',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    parse: ($page) => extractAmazon($page) },
  { name: 'Target', emoji: '🎯', color: '#CC0000',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    parse: ($page, q) => extractTarget($page, q) },
  { name: 'Newegg', emoji: '🥚', color: '#FF6600',
    searchUrl: (q) => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`,
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

app.get('/health', (req, res) => res.json({ status: 'ok' }));

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
    return { title, price, url: href };
  });
  return product;
}

async function extractWalmart(page, query) {
  // Walmart frequently shows CAPTCHA — check immediately
  const blocked = await page.evaluate(() => {
    return document.title.includes('Robot') || document.body.innerText.includes('Robot or human');
  });
  if (blocked) {
    console.log('[Walmart] CAPTCHA detected — blocked');
    return null;
  }
  
  // Wait for product cards to render
  await page.waitForSelector('[data-automation-id="product-price"], a[href*="/ip/"]', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2000);
  
  const product = await page.evaluate(() => {
    // Strategy: Find product-price elements and walk up to find the product container
    const priceEls = document.querySelectorAll('[data-automation-id="product-price"]');
    
    for (const priceEl of priceEls) {
      const priceText = priceEl.innerText?.trim();
      // Parse "current price $229.00" or just "$229.00"
      const priceMatch = priceText.match(/current price\s*\$?([\d,.]+)/i) || 
                          priceText.match(/Now\s*\$?([\d,.]+)/i) ||
                          priceText.match(/\$([\d,.]+)/);
      if (!priceMatch) continue;
      const price = parseFloat(priceMatch[1].replace(/,/g, ''));
      if (price < 1 || price > 5000) continue;
      
      // Walk up the DOM to find a container with a product link
      let container = priceEl;
      for (let d = 0; d < 20; d++) {
        container = container.parentElement;
        if (!container) break;
        const link = container.querySelector('a[href*="/ip/"]');
        if (link) {
          // Get clean title (just the link text, not surrounding prices/badges)
          let title = '';
          // Try to find a dedicated title element
          const titleEl = container.querySelector('[data-automation-id="product-title"]');
          if (titleEl) {
            title = titleEl.innerText?.trim();
          } else {
            // Use the link text but clean it
            title = link.innerText?.trim()?.split('\n')[0];
          }
          
          if (title && !title.startsWith('$')) {
            // Remove price text from title if accidentally included
            title = title.replace(/\$[\d,.]+/g, '').replace(/Was\s*/g, '').replace(/Now\s*/g, '').trim();
          }
          
          let href = link.getAttribute('href');
          if (href && !href.startsWith('http')) href = 'https://www.walmart.com' + href;
          
          if (title && title.length > 3) {
            return { title: title.substring(0, 200), price, url: href };
          }
        }
      }
    }
    
    // Fallback: just find first /ip/ link with any nearby price
    const links = document.querySelectorAll('a[href*="/ip/"]');
    for (const link of links) {
      const title = link.innerText?.trim();
      if (!title || title.length < 5 || title.startsWith('$')) continue;
      let href = link.getAttribute('href');
      if (href && !href.startsWith('http')) href = 'https://www.walmart.com' + href;
      // Return with no price — at least the link is correct
      return { title: title.split('\n')[0].substring(0, 200), price: null, url: href };
    }
    
    return null;
  });
  return product;
}

async function extractTarget(page, query) {
  // Target fires multiple APIs on search:
  // 1. product_summary (1st call) — real products but often NO prices
  // 2. product_summary (2nd/3rd) — recommendations/accessories WITH prices
  // 3. plp_search_v2 — accessories with prices
  //
  // Strategy: Collect ALL product data from all API responses,
  // then pick the best match using relevance + accessory filtering.
  
  return new Promise(async (resolve) => {
    let resolved = false;
    const allProducts = []; // {title, price, url, tcin, source}
    let apiResponseCount = 0;
    
    // Accessory keywords — these indicate the product is FOR the queried item, not the item itself
    const ACCESSORY_WORDS = ['case', 'cover', 'strap', 'sleeve', 'holder', 'stand', 'mount',
      'charger', 'cable', 'adapter', 'screen protector', 'skin', 'pouch', 'dock', 'cradle',
      'replacement tip', 'ear tip', 'ear hook', 'clip', 'lanyard', 'keychain',
      'kit', 'accessory', 'accessories', 'protector', 'film', 'cleaning', 'silicone tip',
      'protection plan', 'warranty', 'applecare'];
    
    function isAccessory(title) {
      const lower = title.toLowerCase();
      // If query itself contains an accessory word, don't filter it
      const queryLower = query.toLowerCase();
      for (const word of ACCESSORY_WORDS) {
        if (lower.includes(word) && !queryLower.includes(word)) return true;
      }
      return false;
    }
    
    function extractProductsFromSummary(json, source) {
      const summaries = json?.data?.product_summaries || [];
      for (const p of summaries) {
        const title = p?.item?.product_description?.title || '';
        const price = p?.price?.current_retail || p?.price?.reg_retail || null;
        const tcin = p?.tcin || p?.item?.tcin || '';
        const url = p?.item?.enrichment?.buy_url || 
                    (tcin ? `https://www.target.com/p/-/A-${tcin}` : null);
        if (title) {
          allProducts.push({ title: title.substring(0, 200), price, url, tcin, source });
        }
      }
    }
    
    function extractProductsFromSearch(json, source) {
      const products = json?.data?.search?.products || [];
      for (const p of products) {
        const title = p?.item?.product_description?.title || p?.title || '';
        const price = p?.price?.current_retail || p?.price?.reg_retail || null;
        const tcin = p?.item?.tcin || p?.tcin || '';
        const url = p?.item?.enrichment?.buy_url || 
                    (tcin ? `https://www.target.com/p/-/A-${tcin}` : null);
        if (title) {
          allProducts.push({ title: title.substring(0, 200), price, url, tcin, source });
        }
      }
    }
    
    page.on('response', async (response) => {
      if (resolved) return;
      const url = response.url();
      
      if (url.includes('product_summary') || url.includes('plp_search_v2')) {
        try {
          const text = await response.text();
          const json = JSON.parse(text);
          apiResponseCount++;
          
          if (url.includes('product_summary')) {
            extractProductsFromSummary(json, `summary-${apiResponseCount}`);
          } else {
            extractProductsFromSearch(json, `search-${apiResponseCount}`);
          }
        } catch {}
      }
    });
    
    // Navigate
    await page.goto(`https://www.target.com/s?searchTerm=${encodeURIComponent(query)}`, {
      waitUntil: 'domcontentloaded', timeout: 15000
    }).catch(() => {});
    
    // Wait for API responses to come in
    await page.waitForTimeout(8000);
    
    if (!resolved) {
      resolved = true;
      
      if (allProducts.length === 0) {
        console.log('[Target] No products found from any API');
        resolve(null);
        return;
      }
      
      console.log(`[Target] Collected ${allProducts.length} products from ${apiResponseCount} API calls`);
      
      // Score and rank all products
      const scored = allProducts.map(p => {
        let score = relevanceScore(p.title, query);
        
        // Penalize accessories heavily
        if (isAccessory(p.title)) score *= 0.1;
        
        // Bonus: title starts with query words (e.g. "Apple AirPods Pro" for "airpods pro")
        // This helps the actual product beat accessories that mention it
        const titleWords = p.title.toLowerCase().split(/\s+/);
        const queryWords = query.toLowerCase().split(/\s+/);
        const startsWithQuery = queryWords.every((qw, i) => 
          titleWords.some((tw, ti) => tw.includes(qw) && ti < queryWords.length + 2));
        if (startsWithQuery && score >= 0.5) score += 0.2;
        
        // Small bonus for having a price (but not enough to beat relevance)
        if (p.price && p.price > 1) score += 0.02;
        
        return { ...p, score };
      });
      
      // Sort by score descending
      scored.sort((a, b) => b.score - a.score);
      
      // Log top candidates
      for (const s of scored.slice(0, 5)) {
        console.log(`[Target]   ${s.score.toFixed(2)} ${s.price ? '$'+s.price : 'no$'} "${s.title.substring(0,80)}" (${s.source})`);
      }
      
      const best = scored[0];
      if (!best || best.score < 0.1) {
        resolve(null);
        return;
      }
      
      // If best match has no price, try to find price from another product with same TCIN
      if (!best.price && best.tcin) {
        const withPrice = scored.find(p => p.tcin === best.tcin && p.price);
        if (withPrice) best.price = withPrice.price;
      }
      
      // If still no price, try fetching the product page directly
      if (!best.price && best.url) {
        try {
          console.log(`[Target] No price for best match, fetching product page: ${best.url}`);
          await page.goto(best.url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});
          await page.waitForTimeout(3000);
          
          const pdpPrice = await page.evaluate(() => {
            // Try multiple price selectors on the PDP
            const selectors = [
              '[data-test="product-price"]',
              '[data-test="product-price-sale"]',
              'span[class*="CurrentPrice"]',
              'span[data-test="product-price"]',
            ];
            for (const sel of selectors) {
              const el = document.querySelector(sel);
              if (el) {
                const match = el.innerText?.match(/\$([\d,]+\.?\d*)/);
                if (match) return parseFloat(match[1].replace(/,/g, ''));
              }
            }
            // Generic: find first $ amount on page that looks like a product price
            const allText = document.body.innerText;
            const prices = [...allText.matchAll(/\$([\d,]+\.\d{2})/g)].map(m => parseFloat(m[1].replace(/,/g, '')));
            // Filter reasonable prices
            const reasonable = prices.filter(p => p > 5 && p < 5000);
            return reasonable.length > 0 ? reasonable[0] : null;
          });
          
          if (pdpPrice) {
            console.log(`[Target] Got price from PDP: $${pdpPrice}`);
            best.price = pdpPrice;
          }
        } catch (e) {
          console.log(`[Target] PDP price fetch failed: ${e.message}`);
        }
      }
      
      resolve([best]);
    }
  });
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
    return { title, price, url };
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
      
      return { title: title.substring(0, 200), price, url, isBuyNow };
    }
    
    return null;
  }, page.url().includes('_nkw=') ? decodeURIComponent(page.url().split('_nkw=')[1].split('&')[0]) : '');
  return product;
}

async function extractBestBuy(page) {
  await page.waitForSelector('.product-list-item', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('.product-list-item');
    if (!item) return null;
    
    // Title: look for product link
    const titleEl = item.querySelector('a[href*="/product/"], a[href*="/site/"]');
    const title = titleEl?.innerText?.trim();
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
    
    return { title: title?.substring(0, 200), price, url };
  });
  return product;
}

// Search a single retailer using headless browser
async function searchRetailer(retailer, query) {
  let context;
  try {
    const br = await getBrowser();
    context = await br.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
      locale: 'en-US',
    });
    
    const page = await context.newPage();
    const searchUrl = retailer.searchUrl(query);
    
    let rawResult;
    if (retailer.name === 'Target') {
      // Target uses network interception — handles its own navigation
      rawResult = await retailer.parse(page, query);
    } else {
      await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
      
      // Give JS time to render (some sites need more time)
      const waitTime = ['eBay', 'Best Buy'].includes(retailer.name) ? 4000 : 2000;
      await page.waitForTimeout(waitTime);
      
      rawResult = await retailer.parse(page);
    }
    await context.close();
    
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
      // If no relevant match, fall back to first result
      if (!product && rawResult.length > 0) {
        product = rawResult[0];
      }
    } else {
      product = rawResult;
    }
    
    // Apply relevance check on single results too (skip clearly wrong products)
    if (product && product.title) {
      const score = relevanceScore(product.title, query);
      if (score < MIN_RELEVANCE) {
        console.log(`[${retailer.name}] Low relevance (${score.toFixed(2)}): "${product.title}" for query "${query}"`);
        // Still return it but mark as low relevance — better than nothing
      }
    }
    
    if (product && (product.price || product.url)) {
      let price = product.price;
      if (price && price > 5000) price = null;
      if (price && price < 1) price = null;
      
      return {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: (product.title && product.title.length > 5) ? product.title : query,
        price,
        url: product.url || searchUrl,
        description: price ? `$${price} on ${retailer.name}` : `View on ${retailer.name}`,
        inStock: true,
        source: price ? 'live' : 'live-noPrice',
      };
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

  console.log(`[${new Date().toISOString()}] SSE Search: "${query}"`);

  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  try {
    // Search all retailers concurrently and stream results as they complete
    const searchPromises = RETAILERS.map(async (retailer) => {
      try {
        const result = await searchRetailer(retailer, query);
        // Send result immediately as SSE
        res.write(`data: ${JSON.stringify(result)}\n\n`);
      } catch (error) {
        console.error(`[${retailer.name}] Stream error:`, error.message);
        // Send fallback result
        const fallback = {
          retailer: retailer.name,
          retailerEmoji: retailer.emoji,
          retailerColor: retailer.color,
          productName: query,
          price: null,
          url: retailer.searchUrl(query),
          description: `Search on ${retailer.name}`,
          inStock: true,
          source: 'error',
        };
        res.write(`data: ${JSON.stringify(fallback)}\n\n`);
      }
    });

    // Wait for all to complete
    await Promise.all(searchPromises);

    // Send completion signal
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

  console.log(`[${new Date().toISOString()}] Search: "${query}"`);
  const startTime = Date.now();

  try {
    // Search all retailers in parallel (but limit concurrency to 3 to avoid memory issues)
    const results = [];
    for (let i = 0; i < RETAILERS.length; i += 3) {
      const batch = RETAILERS.slice(i, i + 3);
      const batchResults = await Promise.allSettled(
        batch.map(r => searchRetailer(r, query))
      );
      results.push(...batchResults);
    }

    const products = results.map((r, idx) => {
      if (r.status === 'fulfilled') return r.value;
      const ret = RETAILERS[idx];
      return {
        retailer: ret.name, retailerEmoji: ret.emoji, retailerColor: ret.color,
        productName: query, price: null, url: ret.searchUrl(query),
        description: `Search on ${ret.name}`, inStock: true, source: 'error',
      };
    });

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
