# PriceFlare 🔥 - Product Price Trending Platform

A premium, elegant Next.js web application for tracking product prices across major retailers including Amazon, Walmart, Target, Newegg, eBay, and Best Buy.

## Features

✨ **Core Features**
- 🔍 Multi-retailer product search with real-time results
- 📊 3-year price history graphs with sale event tracking
- 🔔 Email price drop alerts ($25/$50/$75/$100 thresholds)
- 📈 Purchase predictions (best/worst time to buy)
- 🏆 Lowest price comparison across retailers
- ⭐ Product reviews, ratings, pros/cons
- 📝 Search history with localStorage
- 💬 Contact form with humorous tone
- ℹ️ About page with brand story

🎨 **Design**
- Sky blue, white, dark blue color palette
- Liquid glass effects with backdrop blur
- 3D frosted navigation menu
- Fire emoji branding 🔥
- Smooth transitions and hover effects
- Responsive grid-based layout
- Retailer-specific emojis and colors:
  - Amazon 📦 (#FF9900)
  - Walmart 🏪 (#0071CE)
  - Target 🎯 (#CC0000)
  - Newegg 🥚 (#FF6600)
  - eBay 🛒 (#E53238)
  - Best Buy ⚡ (#FFE000)

⚡ **Performance**
- Browser caching with Next.js headers
- Optimized autocomplete with 30+ products
- Client-side localStorage for search history
- Page caching and SEO optimization

🔒 **Privacy & Security**
- No user data retention
- Anonymous searches
- HTTPS required in production
- Email alerts only (no data collection)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Charts:** Recharts
- **Fonts:** Google Fonts (Inter)
- **Language:** TypeScript

## Local Development

### Prerequisites

- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/priceflare.git
cd priceflare
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Build for Production

```bash
npm run build
npm start
```

## Deployment to GoDaddy with PriceFlare.com

### Prerequisites

1. **Domain:** PriceFlare.com registered with GoDaddy
2. **Hosting:** GoDaddy Web Hosting (cPanel with Node.js support) OR GoDaddy VPS
3. **SSL Certificate:** Free SSL from GoDaddy (or Let's Encrypt)
4. **Node.js:** Version 18+ supported on hosting

### Option 1: GoDaddy cPanel Hosting (Recommended for Beginners)

#### Step 1: Build the Application Locally

```bash
# Build the production version
npm run build

# This creates a .next folder and out folder
```

#### Step 2: Export Static Files (if using static hosting)

Add to `next.config.js`:
```javascript
output: 'export',
```

Then rebuild:
```bash
npm run build
```

#### Step 3: Upload to GoDaddy via FTP/cPanel File Manager

1. Log in to your GoDaddy cPanel
2. Navigate to File Manager
3. Go to `public_html` directory
4. Upload all files from the `out` folder (for static) OR the entire project (for Node.js hosting)

#### Step 4: Configure Domain

1. In GoDaddy Domain Manager, point PriceFlare.com to your hosting
2. Wait for DNS propagation (up to 24 hours)

#### Step 5: Enable SSL (HTTPS)

1. In cPanel, go to SSL/TLS Status
2. Install free SSL certificate for PriceFlare.com
3. Enable "Force HTTPS" in .htaccess:

```apache
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

### Option 2: GoDaddy VPS (For Full Next.js Features)

#### Step 1: SSH into Your VPS

```bash
ssh root@your-vps-ip
```

#### Step 2: Install Node.js and npm

```bash
# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### Step 3: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

#### Step 4: Clone and Setup Project

```bash
# Navigate to web directory
cd /var/www

# Clone your repository
git clone https://github.com/yourusername/priceflare.git
cd priceflare

# Install dependencies
npm install

# Build the application
npm run build
```

#### Step 5: Configure PM2

Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'priceflare',
    script: 'npm',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

Start with PM2:
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### Step 6: Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/priceflare.com
```

Add configuration:
```nginx
server {
    listen 80;
    server_name priceflare.com www.priceflare.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:
```bash
sudo ln -s /etc/nginx/sites-available/priceflare.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 7: Install SSL Certificate

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d priceflare.com -d www.priceflare.com
```

#### Step 8: Configure Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Option 3: Deploy to Vercel (Alternative - Easiest)

If GoDaddy hosting doesn't support Node.js well:

1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically
4. Point PriceFlare.com to Vercel in GoDaddy DNS:
   - Add CNAME record: `www` → `cname.vercel-dns.com`
   - Add A record: `@` → Vercel IP

## Environment Variables

Create `.env.local` for development:

```env
NEXT_PUBLIC_SITE_URL=https://priceflare.com
NEXT_PUBLIC_CONTACT_EMAIL=priceflare@gmail.com
```

## Project Structure

```
priceflare/
├── app/
│   ├── about/          # About page
│   ├── alerts/         # Email alert settings
│   ├── contact/        # Contact form
│   ├── layout.tsx      # Root layout with metadata
│   ├── page.tsx        # Home page with search
│   └── globals.css     # Global styles
├── components/
│   ├── Navigation.tsx          # 3D frosted menu
│   ├── SearchBar.tsx           # Search with autocomplete
│   ├── SearchResults.tsx       # Product results grid
│   ├── PriceHistoryChart.tsx   # 3-year price graphs
│   ├── PriceAlertModal.tsx     # Alert creation modal
│   └── SearchHistory.tsx       # Recent searches
├── types/
│   └── index.ts        # TypeScript interfaces
├── public/
│   └── favicon.ico     # Site icon
└── README.md           # This file
```

## Browser Support

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimization

- Static asset caching (1 hour)
- Stale-while-revalidate (24 hours)
- Lazy-loaded charts
- Optimized autocomplete (max 8 suggestions)
- localStorage for client-side data

## SEO Features

- Semantic HTML structure
- Meta tags for all pages
- OpenGraph and Twitter Card support
- Robots.txt for crawler control
- Sitemap.xml for search engines
- Descriptive alt text
- Fast page loads (<2s)

## Future Enhancements

- [ ] Real API integration with retailers
- [ ] Email service (SendGrid/Mailgun)
- [ ] User accounts and dashboards
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Price history export (CSV)
- [ ] Wishlist functionality
- [ ] Social sharing

## Support

For questions or issues:
- Email: priceflare@gmail.com
- Website: https://priceflare.com/contact

## License

© 2024 PriceFlare. All rights reserved.

---

Built with ❤️ and 🔥 by the PriceFlare team
