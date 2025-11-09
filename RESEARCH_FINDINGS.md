# MTG Card Shop - Research Findings

## Available MTG Card Data Sources

### 1. Scryfall API (Recommended)
**URL:** https://api.scryfall.com
**Status:** Free, no authentication required
**Advantages:**
- Comprehensive card database with all Magic cards
- RESTful API with well-documented endpoints
- Includes pricing information (USD, EUR, foil prices)
- Card images and artwork available
- Bulk data downloads available for daily updates
- Supports advanced search queries

**Key Endpoints:**
- `/cards/search` - Search cards with advanced filters
- `/cards/named` - Get card by exact name
- `/cards/autocomplete` - Autocomplete for card names
- `/cards/random` - Get random card
- `/cards/:id` - Get specific card by ID

**Card Data Fields Available:**
- Card name, mana cost, type line, oracle text
- Power/toughness, color identity, rarity
- Set information, collector number, release date
- Prices (USD, EUR, foil, etched)
- Card images and artwork
- Legality across formats (Standard, Modern, Legacy, etc.)
- EDHREC rank, keywords, related cards

**Rate Limits:**
- 10 requests per second (50-100ms delay recommended)
- Bulk data files available for download (no rate limit)
- Prices updated once per day

**Usage Guidelines:**
- Must include User-Agent header in requests
- Free for use in Magic software, research, and community content
- Cannot paywall Scryfall data
- Must create additional value beyond just republishing data
- Cannot modify or misrepresent card images

### 2. MTGJSON
**URL:** https://mtgjson.com
**Status:** Open-source, free
**Advantages:**
- Portable JSON format for all Magic data
- Available as bulk downloads
- No API rate limits for downloads
- Comprehensive card information

### 3. Official Gatherer Database
**URL:** https://gatherer.wizards.com
**Status:** Official but no public API
**Limitations:**
- No programmatic API access
- Web scraping not recommended

## Cost-Benefit Analysis Strategy

To identify cards with best cost-benefit ratio, we can calculate:

1. **Mana Efficiency:** Compare mana cost to card power/toughness or effect value
2. **Format Popularity:** Use EDHREC rankings to identify popular cards
3. **Price-to-Value:** Compare current market price to card utility
4. **Rarity:** Common/uncommon cards often provide better value than rare cards

**Calculation Formula:**
```
Cost-Benefit Score = (Card Power + Card Toughness + Effect Value) / Mana Cost
Price-Value Ratio = Card Market Price / Cost-Benefit Score
```

## Implementation Plan

1. **Data Ingestion:** Use Scryfall API for real-time card data
2. **Caching:** Cache card data for 24 hours (Scryfall updates prices daily)
3. **Database:** Store card information locally for faster searches
4. **Analysis:** Calculate cost-benefit scores for all cards
5. **Display:** Show cards sorted by best cost-benefit ratio

## Next Steps

1. Design database schema to store card data
2. Create tRPC procedures to fetch and search cards
3. Build frontend interface for browsing and filtering cards
4. Implement shopping cart and checkout functionality
5. Set up payment processing with Stripe
