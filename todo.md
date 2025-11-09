# MTG Card Shop - Project TODO

## Core Features

### Backend & Database
- [x] Design database schema for MTG cards, inventory, and orders
- [x] Integrate MTG card data source/API (Scryfall or similar)
- [x] Implement card pricing and cost-benefit analysis logic
- [x] Create inventory management system
- [x] Implement shopping cart functionality
- [ ] Set up payment processing (Stripe integration)
- [x] Create order management system

### Frontend - Pages & Navigation
- [x] Design and implement landing page with hero section
- [x] Create card search and filter interface
- [x] Build card detail page with specifications
- [x] Implement cost-benefit comparison feature
- [x] Create shopping cart page
- [x] Build checkout page
- [ ] Create user account/profile page
- [ ] Implement order history page

### User Features
- [ ] User authentication (already integrated via Manus OAuth)
- [ ] User profile management
- [ ] Wishlist/saved cards functionality
- [ ] Order tracking

### Admin Features
- [ ] Admin dashboard for inventory management
- [ ] Card inventory editor
- [ ] Order management interface
- [ ] Sales analytics

### Design & UX
- [ ] Mobile-responsive design
- [ ] Dark/light theme support
- [ ] Navigation menu (mobile-friendly dropdown)
- [ ] Loading states and error handling
- [ ] Empty states for various pages

### Technical Setup
- [ ] Research MTG card data sources and APIs
- [ ] Configure database schema
- [ ] Set up tRPC procedures for all features
- [ ] Implement error handling and validation
- [ ] Set up environment variables


### Price Scraping & Real-Time Data
- [x] Implement TCGPlayer price scraper
- [x] Implement Cardmarket price scraper
- [x] Implement eBay price scraper
- [x] Create price comparison aggregator
- [x] Add price history tracking
- [ ] Set up scheduled price updates
- [x] Display cheapest price with seller link
