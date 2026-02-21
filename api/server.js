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
  // Wait for search results
  await page.waitForSelector('[data-component-type="s-search-result"], .s-result-item', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('[data-component-type="s-search-result"]');
    if (!item) return null;
    const titleEl = item.querySelector('h2 a span, h2 span');
    const linkEl = item.querySelector('h2 a, a.a-link-normal[href*="/dp/"]');
    const priceWhole = item.querySelector('.a-price-whole');
    const priceFrac = item.querySelector('.a-price-fraction');
    const title = titleEl?.textContent?.trim();
    let href = linkEl?.getAttribute('href') || linkEl?.href;
    if (href && !href.startsWith('http')) href = 'https://www.amazon.com' + href;
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
  await page.waitForSelector('[data-testid="list-view"], [data-item-id]', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('[data-item-id], [data-testid="list-view"] > div');
    if (!item) return null;
    const linkEl = item.querySelector('a[href*="/ip/"]');
    const title = linkEl?.textContent?.trim() || item.querySelector('[data-automation-id="product-title"], span[data-automation-id]')?.textContent?.trim();
    const priceEl = item.querySelector('[data-automation-id="product-price"] span, [itemprop="price"]');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    const url = linkEl?.href;
    return { title, price, url };
  });
  return product;
}

async function extractTarget(page) {
  await page.waitForSelector('[data-test="product-card"], [data-test="@web/ProductCard"]', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('[data-test="product-card"], [data-test="@web/ProductCard/ProductCardVariantDefault"]');
    if (!item) return null;
    const linkEl = item.querySelector('a[href*="/p/"]');
    const title = linkEl?.textContent?.trim() || item.querySelector('[data-test="product-title"]')?.textContent?.trim();
    const priceEl = item.querySelector('[data-test="current-price"] span, span[data-test="current-price"]');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    const url = linkEl ? `https://www.target.com${linkEl.getAttribute('href')}` : null;
    return { title: title?.substring(0, 200), price, url };
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
  await page.waitForSelector('.s-item, .srp-results .s-item', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const items = document.querySelectorAll('.s-item');
    // Skip first item (often a header/ad)
    const item = items.length > 1 ? items[1] : items[0];
    if (!item) return null;
    const titleEl = item.querySelector('.s-item__title span, .s-item__title');
    const title = titleEl?.textContent?.trim();
    if (title === 'Shop on eBay') return null;
    const priceEl = item.querySelector('.s-item__price');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/\$\s*([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    const linkEl = item.querySelector('.s-item__link');
    const url = linkEl?.href?.split('?')[0];
    return { title: title?.substring(0, 200), price, url };
  });
  return product;
}

async function extractBestBuy(page) {
  await page.waitForSelector('.sku-item, [data-sku-id]', { timeout: 8000 }).catch(() => {});
  
  const product = await page.evaluate(() => {
    const item = document.querySelector('.sku-item, [data-sku-id], .list-item');
    if (!item) return null;
    const titleEl = item.querySelector('.sku-title a, .sku-header a, h4 a');
    const title = titleEl?.textContent?.trim();
    const url = titleEl ? `https://www.bestbuy.com${titleEl.getAttribute('href')}` : null;
    const priceEl = item.querySelector('.priceView-customer-price span, [data-testid="customer-price"] span');
    const priceText = priceEl?.textContent || '';
    const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
    const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, '')) : null;
    return { title, price, url };
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
      return {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: product.title || query,
        price: product.price,
        url: product.url || url,
        description: product.price ? `$${product.price} on ${retailer.name}` : `View on ${retailer.name}`,
        inStock: true,
        source: product.price ? 'live' : 'live-noPrice',
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

// Main search endpoint
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
