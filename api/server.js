const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const fetch = require('node-fetch');
const cheerio = require('cheerio');

const app = express();
const PORT = 8095;

// Retailer configuration
const RETAILERS = [
  {
    name: 'Amazon',
    emoji: '📦',
    color: '#FF9900',
    searchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:amazon.com "${q}" price`
  },
  {
    name: 'Walmart',
    emoji: '🏪',
    color: '#0071CE',
    searchUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:walmart.com "${q}" price`
  },
  {
    name: 'Target',
    emoji: '🎯',
    color: '#CC0000',
    searchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:target.com "${q}" price`
  },
  {
    name: 'Newegg',
    emoji: '🥚',
    color: '#FF6600',
    searchUrl: (q) => `https://www.newegg.com/p/pl?d=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:newegg.com "${q}" price`
  },
  {
    name: 'eBay',
    emoji: '🔨',
    color: '#E53238',
    searchUrl: (q) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:ebay.com "${q}" price`
  },
  {
    name: 'Best Buy',
    emoji: '💙',
    color: '#0046BE',
    searchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`,
    ddgQuery: (q) => `site:bestbuy.com "${q}" price`
  }
];

// CORS configuration
app.use(cors({
  origin: ['http://192.168.1.100:8094', 'http://localhost:3000', 'http://localhost:8094'],
  credentials: true
}));

// Rate limiting: 10 requests per minute per IP
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: { error: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Extract price from text
function extractPrice(text) {
  if (!text) return null;
  
  // Look for patterns like $999.99, $1,299.00, etc.
  const priceMatch = text.match(/\$\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/);
  if (priceMatch) {
    return parseFloat(priceMatch[1].replace(/,/g, ''));
  }
  
  return null;
}

// Search a single retailer using DuckDuckGo
async function searchRetailer(retailer, query, timeout = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const ddgUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(retailer.ddgQuery(query))}`;
    
    const response = await fetch(ddgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Parse DuckDuckGo results
    const results = [];
    $('.result').each((i, elem) => {
      if (i >= 3) return false; // Only check first 3 results
      
      const $result = $(elem);
      const title = $result.find('.result__a').text().trim();
      const url = $result.find('.result__url').attr('href');
      const snippet = $result.find('.result__snippet').text().trim();
      
      if (title && url) {
        // Extract actual URL from DuckDuckGo redirect
        let actualUrl = url;
        try {
          const urlObj = new URL(url);
          const uddg = urlObj.searchParams.get('uddg');
          if (uddg) {
            actualUrl = decodeURIComponent(uddg);
          }
        } catch (e) {
          // Keep original URL if parsing fails
        }
        
        // Extract price from snippet
        const price = extractPrice(snippet);
        
        if (price) {
          results.push({
            title,
            url: actualUrl,
            snippet,
            price
          });
        }
      }
    });
    
    // Return the first result with a price, or create fallback
    if (results.length > 0) {
      const best = results[0];
      return {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: best.title,
        price: best.price,
        url: best.url,
        description: best.snippet.substring(0, 200),
        inStock: true,
        source: 'search'
      };
    } else {
      // Fallback to search page URL
      return {
        retailer: retailer.name,
        retailerEmoji: retailer.emoji,
        retailerColor: retailer.color,
        productName: `${query} on ${retailer.name}`,
        price: null,
        url: retailer.searchUrl(query),
        description: `View search results for "${query}" on ${retailer.name}`,
        inStock: true,
        source: 'fallback'
      };
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    // Return fallback on error
    return {
      retailer: retailer.name,
      retailerEmoji: retailer.emoji,
      retailerColor: retailer.color,
      productName: `${query} on ${retailer.name}`,
      price: null,
      url: retailer.searchUrl(query),
      description: `View search results for "${query}" on ${retailer.name}`,
      inStock: true,
      source: 'error',
      error: error.message
    };
  }
}

// Main search endpoint
app.get('/api/search', async (req, res) => {
  const query = req.query.q;
  
  if (!query || query.trim().length === 0) {
    return res.status(400).json({
      error: 'Query parameter "q" is required'
    });
  }
  
  console.log(`[${new Date().toISOString()}] Search request: "${query}" from ${req.ip}`);
  
  try {
    // Search all retailers in parallel
    const searchPromises = RETAILERS.map(retailer => 
      searchRetailer(retailer, query)
    );
    
    const results = await Promise.allSettled(searchPromises);
    
    // Extract successful results
    const products = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        // Create fallback for rejected promises
        const retailer = RETAILERS[index];
        return {
          retailer: retailer.name,
          retailerEmoji: retailer.emoji,
          retailerColor: retailer.color,
          productName: `${query} on ${retailer.name}`,
          price: null,
          url: retailer.searchUrl(query),
          description: `View search results for "${query}" on ${retailer.name}`,
          inStock: true,
          source: 'fallback'
        };
      }
    });
    
    const response = {
      query,
      results: products,
      timestamp: new Date().toISOString()
    };
    
    console.log(`[${new Date().toISOString()}] Returning ${products.length} results for "${query}"`);
    
    res.json(response);
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error processing search:`, error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`PriceFlare API server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Search endpoint: http://localhost:${PORT}/api/search?q=<query>`);
});
