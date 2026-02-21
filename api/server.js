const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { chromium } = require('playwright-core');

const app = express();
const PORT = 8095;
const CHROMIUM_PATH = '/snap/bin/chromium';

const RETAILERS = [
  { name: 'Amazon', emoji: '📦', color: '#FF9900',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    parse: ($page) => extractAmazon($page) },
  { name: 'Walmart', emoji: '🏪', color: '#0071CE',
    searchUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
    parse: ($page) => extractWalmart($page) },
  { name: 'Target', emoji: '🎯', color: '#CC0000',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    parse: ($page) => extractTarget($page) },
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

async function extractWalmart(page) {
  // Walmart shows CAPTCHA ("Robot or human?") to headless browsers
  // Check if we got blocked
  const blocked = await page.evaluate(() => {
    return document.title.includes('Robot') || document.body.innerText.includes('Robot or human');
  });
  if (blocked) return null;
  
  await page.waitForSelector('[data-item-id], [data-testid="list-view"]', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('[data-item-id]');
    if (!item) return null;
    const linkEl = item.querySelector('a[href*="/ip/"]');
    const title = linkEl?.innerText?.trim() || item.querySelector('[data-automation-id="product-title"]')?.innerText?.trim();
    // Find price
    let price = null;
    const spans = item.querySelectorAll('span');
    for (const span of spans) {
      const text = span.innerText?.trim();
      if (text && /^\$[\d,]+\.?\d*$/.test(text)) {
        price = parseFloat(text.replace(/[$,]/g, ''));
        break;
      }
    }
    const url = linkEl?.href;
    return { title: title?.substring(0, 200), price, url };
  });
  return product;
}

async function extractTarget(page) {
  await page.waitForSelector('[data-test="product-card"], a[href*="/p/"]', { timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(2000); // Let results fully render
  
  const product = await page.evaluate(() => {
    // Get all product cards and find the first one with a real price
    const cards = document.querySelectorAll('[data-test="product-card"], [data-test*="ProductCard"]');
    
    for (const card of cards) {
      const linkEl = card.querySelector('a[href*="/p/"]');
      const title = linkEl?.innerText?.trim() || card.querySelector('[data-test="product-title"]')?.innerText?.trim();
      
      // Find price - look for the current (non-strikethrough) price
      let price = null;
      const priceEls = card.querySelectorAll('[data-test="current-price"], span');
      for (const el of priceEls) {
        const text = el.innerText?.trim();
        if (text && /^\$[\d,]+\.?\d*$/.test(text)) {
          price = parseFloat(text.replace(/[$,]/g, ''));
          break;
        }
      }
      
      let url = linkEl?.getAttribute('href');
      if (url && !url.startsWith('http')) url = 'https://www.target.com' + url;
      
      // Skip items that seem irrelevant (accessories/cases priced under $20 for electronics)
      if (title && price && price > 5) {
        return { title: title.substring(0, 200), price, url };
      }
    }
    
    // Fallback: look for any product link with a nearby price
    const links = document.querySelectorAll('a[href*="/p/"]');
    for (const link of links) {
      const parent = link.closest('div');
      if (!parent) continue;
      const text = parent.innerText;
      const priceMatch = text.match(/\$(\d+\.?\d*)/);
      if (priceMatch) {
        let url = link.getAttribute('href');
        if (url && !url.startsWith('http')) url = 'https://www.target.com' + url;
        return {
          title: link.innerText?.trim()?.substring(0, 200),
          price: parseFloat(priceMatch[1]),
          url,
        };
      }
    }
    
    return null;
  });
  return product;
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
    const url = retailer.searchUrl(query);
    
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    
    // Give JS time to render (some sites need more time)
    const waitTime = ['Walmart', 'eBay', 'Best Buy'].includes(retailer.name) ? 4000 : 2000;
    await page.waitForTimeout(waitTime);
    
    const product = await retailer.parse(page);
    await context.close();
    
    if (product && (product.price || product.url)) {
      // Sanity check: filter absurd prices (likely scams or bid prices)
      let price = product.price;
      if (price && price > 5000) price = null; // Probably wrong
      if (price && price < 1) price = null;
      
      return {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: (product.title && product.title.length > 5) ? product.title : query,
        price,
        url: product.url || url,
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
