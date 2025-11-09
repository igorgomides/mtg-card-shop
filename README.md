# 🃏 DECK CORE

**The Ultimate Trading Card Marketplace**

A comprehensive trading card game management system built with React 19, TypeScript, and Express. DECK CORE supports multiple trading card games including Magic: The Gathering, Yu-Gi-Oh!, Pokémon, and more with a bright, minimalist design.

## ✨ Features

### 🎮 Multi-Game Support
- **Magic: The Gathering** (Scryfall API)
- **Yu-Gi-Oh!** (YGOPRODeck API)
- **Pokémon** (PokéTCG API)
- **Disney Lorcana** (placeholder)
- **One Piece Card Game** (placeholder)
- **Digimon Card Game** (placeholder)
- **Star Wars: Unlimited** (placeholder)
- **Flesh and Blood** (placeholder)
- **Cardfight!! Vanguard** (placeholder)
- **Weiß Schwarz** (placeholder)
- **Shadowverse: Evolve** (placeholder)
- **Godzilla Card Game** (placeholder)

### 🛠 Admin Dashboard
- **Card Sourcing**: Search and import cards from external APIs
- **Inventory Management**: Advanced filtering, sorting, and pagination
- **Purchase Link Integration**: Direct links to TCGPlayer, Cardmarket
- **Real-time Price Updates**: Live pricing from external sources
- **User Management**: Role-based authentication system

### 💳 E-commerce Features
- **Shopping Cart**: Add cards to cart functionality
- **Checkout Process**: Complete purchase workflow
- **Price Tracking**: Cost-benefit analysis and value scoring
- **Multi-currency Support**: USD, EUR pricing

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and pnpm
- MySQL database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mtg-card-shop.git
   cd mtg-card-shop
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up the database**
   ```bash
   # Run database migrations
   pnpm db:push
   
   # Create admin users
   node server/create-admin-users.mjs
   
   # Add sample cards (optional)
   node server/add-sample-cards.mjs
   ```

5. **Start the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   - Main site: `http://localhost:3000`
   - Admin dashboard: `http://localhost:3000/admin`

## 🏗 Project Structure

```
mtg_card_shop/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                 # Express backend
│   ├── _core/             # Core server functionality
│   ├── db.ts              # Database operations
│   └── routers.ts         # API routes
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── docs/                  # Documentation
```

## 🛠 Tech Stack

### Frontend
- **React 19** with TypeScript
- **Wouter** for routing
- **tRPC** for type-safe APIs
- **Tailwind CSS** for styling
- **Radix UI** for components

### Backend
- **Express.js** with TypeScript
- **tRPC** for API layer
- **Drizzle ORM** for database operations
- **MySQL** database
- **Jose** for JWT authentication

### External APIs
- **Scryfall API** (Magic: The Gathering)
- **YGOPRODeck API** (Yu-Gi-Oh!)
- **PokéTCG API** (Pokémon)

## 📱 Admin Features

### Card Sourcing (`/admin/card-sourcing`)
- Search cards across multiple games
- Real-time pricing from external APIs
- Cost-benefit analysis scoring
- One-click card import to inventory
- Purchase link generation

### Inventory Management (`/admin/inventory`)
- Advanced search and filtering
- Sort by name, price, rarity, set
- Real-time price editing
- Bulk operations
- Safe card deletion with confirmation

### Dashboard (`/admin`)
- User statistics overview
- Card inventory metrics
- Recent activity tracking
- Quick navigation to admin functions

## 🔒 Authentication

The system supports role-based authentication:
- **Admin users**: Full access to inventory and sourcing
- **Regular users**: Shopping and browsing capabilities

### Default Admin Users
- Igor Gomides (`admin-igor-gomides`)
- Rodrigo T (`admin-rodrigo-t`)

## 🎯 API Endpoints

### Public Routes
- `GET /` - Homepage
- `GET /cards` - Browse cards
- `GET /cart` - Shopping cart
- `GET /checkout` - Checkout process

### Admin Routes (Authentication Required)
- `GET /admin` - Admin dashboard
- `GET /admin/inventory` - Inventory management
- `GET /admin/card-sourcing` - Card sourcing interface

### API Routes
- `POST /api/trpc/admin.searchExternalCards` - Search external APIs
- `POST /api/trpc/admin.addCard` - Add card to inventory
- `POST /api/trpc/admin.getInventory` - Get inventory with filters
- `POST /api/trpc/admin.updateCard` - Update card information
- `POST /api/trpc/admin.deleteCard` - Remove card from inventory

## 🔧 Development

### Available Scripts
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm db:push      # Push database schema changes
pnpm db:studio    # Open Drizzle Studio
```

### Database Operations
```bash
# Create admin users
node server/create-admin-users.mjs

# Add sample cards
node server/add-sample-cards.mjs

# Update card prices (scheduled)
node server/scheduled-price-update.mjs
```

## 🚢 Deployment

### Environment Variables
```env
DATABASE_URL="mysql://user:password@localhost:3306/mtg_cards"
OAUTH_SERVER_URL="https://your-domain.com"
NODE_ENV="production"
```

### Build and Deploy
```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation as needed
- Follow the established code style

## 📋 Roadmap

### Phase 1 ✅ (Completed)
- [x] Basic MTG card management
- [x] Admin authentication system
- [x] External API integration (Scryfall)
- [x] Multi-game support (Yu-Gi-Oh!, Pokémon)
- [x] Inventory management system
- [x] Purchase link integration

### Phase 2 🔄 (In Progress)
- [ ] Complete multi-game API implementations
- [ ] Advanced search and filtering
- [ ] Price trend analysis
- [ ] Bulk import/export functionality

### Phase 3 📅 (Planned)
- [ ] Customer order management
- [ ] Payment processing integration
- [ ] Mobile app development
- [ ] Advanced analytics dashboard

## 🐛 Known Issues

- Some placeholder games don't have API implementations yet
- Price updates require manual triggering
- Mobile responsiveness could be improved

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Scryfall](https://scryfall.com/) for Magic: The Gathering data
- [YGOPRODeck](https://ygoprodeck.com/) for Yu-Gi-Oh! data
- [PokéTCG](https://pokemontcg.io/) for Pokémon data
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities

## 📞 Support

For support, email your-email@example.com or open an issue on GitHub.

---

**Built with ❤️ for trading card game enthusiasts**