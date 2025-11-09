# MTG Card Shop - Setup & Usage Guide

## Overview

MTG Card Shop is a full-stack e-commerce platform for Magic: The Gathering cards that helps users find cards with the best cost-benefit ratio. The application integrates with the Scryfall API to fetch real-time card data and scrapes prices from multiple retailers to show users the cheapest options available.

## Technology Stack

- **Frontend:** React 19, Tailwind CSS 4, TypeScript
- **Backend:** Express 4, tRPC 11, Node.js
- **Database:** MySQL/TiDB
- **Authentication:** Manus OAuth
- **Card Data:** Scryfall API
- **Price Data:** TCGPlayer, Cardmarket, eBay

## Features

### Implemented
- ✅ Landing page with card search interface
- ✅ Advanced card filtering by rarity
- ✅ Card detail pages with specifications and pricing
- ✅ Cost-benefit score calculation
- ✅ **Price scraping from multiple retailers** (TCGPlayer, Cardmarket, eBay)
- ✅ **Price comparison display** showing cheapest options
- ✅ **Direct links to cheapest retailers**
- ✅ Shopping cart functionality
- ✅ Checkout page with order summary
- ✅ User authentication via Manus OAuth
- ✅ Responsive mobile-first design

### In Progress / Planned
- 🔄 Stripe payment integration
- 📋 User account/profile management
- 📊 Order history and tracking
- 🎁 Wishlist functionality (backend ready)
- 📈 Admin dashboard for inventory management
- ⏰ Automated scheduled price updates

## Getting Started

### Prerequisites
- Node.js 22.13.0+
- pnpm package manager
- MySQL database

### Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   The following environment variables are automatically injected by the Manus platform:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - OAuth application ID
   - `OAUTH_SERVER_URL` - OAuth backend URL
   - `VITE_OAUTH_PORTAL_URL` - OAuth login portal

3. **Push database schema:**
   ```bash
   pnpm db:push
   ```

4. **Start development server:**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
mtg_card_shop/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── App.tsx        # Main app router
│   └── public/            # Static assets
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   ├── price-scraper.mjs  # Price scraping module
│   ├── scheduled-price-update.mjs  # Scheduled updates
│   └── _core/             # Framework plumbing
├── drizzle/               # Database schema and migrations
│   └── schema.ts          # Table definitions
└── storage/               # S3 storage helpers
```

## Database Schema

### Tables
- **users** - User accounts with Manus OAuth integration
- **cards** - MTG card data from Scryfall API
- **cartItems** - Shopping cart items per user
- **orders** - Completed orders
- **orderItems** - Individual items in orders
- **wishlist** - User wishlist items
- **priceHistory** - Historical pricing data from retailers

## API Procedures (tRPC)

### Cards
- `cards.search` - Search cards with filters
- `cards.getById` - Get card by database ID
- `cards.getByScryfallId` - Get card by Scryfall ID

### Cart (Protected)
- `cart.getItems` - Get user's cart items
- `cart.addItem` - Add item to cart
- `cart.removeItem` - Remove item from cart

### Wishlist (Protected)
- `wishlist.getItems` - Get user's wishlist
- `wishlist.addItem` - Add card to wishlist

### Orders (Protected)
- `orders.getMyOrders` - Get user's orders

### Prices (Public)
- `prices.getLatest` - Get latest prices from all retailers for a card
- `prices.getCheapest` - Get cheapest price for a card with retailer link

## Syncing Card Data

To populate the database with MTG card data from Scryfall:

```bash
node server/sync-scryfall.mjs
```

This script:
- Fetches card data from Scryfall API
- Calculates cost-benefit scores
- Stores cards in the database
- Respects Scryfall's rate limits (100ms between requests)

## Price Scraping

### Manual Price Update

To manually scrape prices for the top 100 cards:

```bash
node server/scheduled-price-update.mjs 100
```

To scrape prices for all cards:

```bash
node server/scheduled-price-update.mjs
```

### Automated Price Updates

Set up a cron job to run price updates periodically:

```bash
# Update top 100 cards every 6 hours
0 */6 * * * cd /path/to/mtg_card_shop && node server/scheduled-price-update.mjs 100
```

Or use a task scheduler:

```bash
# Windows Task Scheduler
node C:\path\to\mtg_card_shop\server\scheduled-price-update.mjs 100
```

### Supported Retailers

The price scraper currently supports:

1. **TCGPlayer** - Largest Magic marketplace in North America
   - URL: https://www.tcgplayer.com
   - Currency: USD
   - Condition: Near Mint (default)

2. **Cardmarket** - Largest Magic marketplace in Europe
   - URL: https://www.cardmarket.com
   - Currency: EUR
   - Condition: Near Mint (default)

3. **eBay** - Individual sellers
   - URL: https://www.ebay.com
   - Currency: USD
   - Condition: Varies

### Price Comparison Display

When viewing a card detail page, users see:

- **Cheapest Online** - The lowest price available with a direct link to the retailer
- **Price Comparison** - A table showing prices from all available retailers
- **Cost-Benefit Score** - Value analysis based on card stats vs mana cost

## Cost-Benefit Score Calculation

The cost-benefit score is calculated as:

```
Score = (Power + Toughness + Keywords) / Mana Cost
```

Higher scores indicate better value for the mana cost. This helps users identify cards that provide more utility relative to their mana investment.

## Mobile Optimization

The application is fully optimized for mobile devices with:
- Responsive grid layouts that adapt to screen size
- Touch-friendly button sizes
- Mobile-optimized navigation with dropdown menus
- Readable text sizes and spacing on small screens
- Price comparison displayed clearly on mobile

## Future Enhancements

1. **Payment Processing** - Integrate Stripe for secure payments
2. **User Profiles** - Account management and order history
3. **Advanced Analytics** - Price trends and card recommendations
4. **Admin Dashboard** - Inventory management and sales analytics
5. **Email Notifications** - Order confirmations and price alerts
6. **Price Alerts** - Notify users when cards drop below target price
7. **More Retailers** - Add support for additional sellers
8. **API Rate Limiting** - Prevent abuse and optimize performance

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` environment variable is set correctly
- Check database credentials and network connectivity
- Run `pnpm db:push` to ensure schema is up to date

### Scryfall API Issues
- Verify internet connectivity
- Check Scryfall API status at https://scryfall.com
- Ensure User-Agent header is properly set in requests

### Price Scraping Issues
- Verify retailer websites are accessible
- Check for network/firewall blocks
- Review scraper logs for specific errors
- Some retailers may have anti-scraping measures

### Authentication Issues
- Clear browser cookies and cache
- Verify OAuth credentials are correct
- Check that session cookie is being set properly

## Support & Resources

- **Scryfall API Documentation:** https://scryfall.com/docs/api
- **tRPC Documentation:** https://trpc.io
- **Tailwind CSS:** https://tailwindcss.com
- **Drizzle ORM:** https://orm.drizzle.team
- **TCGPlayer:** https://www.tcgplayer.com
- **Cardmarket:** https://www.cardmarket.com

## License

This project is created for demonstration purposes. Magic: The Gathering is a trademark of Wizards of the Coast.
