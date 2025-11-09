import { eq, sql, and, desc, asc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, cards, InsertCard, cartItems, orders, orderItems, wishlist, priceHistory, InsertPriceHistory } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get all cards with optional filtering
 */
export async function getCards(options?: {
  search?: string;
  rarity?: string;
  setCode?: string;
  colors?: string;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  let whereConditions = [];

  if (options?.search) {
    whereConditions.push(sql`${cards.name} LIKE ${`%${options.search}%`}`);
  }

  if (options?.rarity) {
    whereConditions.push(eq(cards.rarity, options.rarity));
  }

  if (options?.setCode) {
    whereConditions.push(eq(cards.setCode, options.setCode));
  }

  if (options?.colors) {
    whereConditions.push(sql`${cards.colors} LIKE ${`%${options.colors}%`}`);
  }

  if (options?.minPrice && options?.maxPrice) {
    whereConditions.push(sql`CAST(${cards.priceUsd} AS DECIMAL(10,2)) BETWEEN ${options.minPrice} AND ${options.maxPrice}`);
  } else if (options?.minPrice) {
    whereConditions.push(sql`CAST(${cards.priceUsd} AS DECIMAL(10,2)) >= ${options.minPrice}`);
  } else if (options?.maxPrice) {
    whereConditions.push(sql`CAST(${cards.priceUsd} AS DECIMAL(10,2)) <= ${options.maxPrice}`);
  }

  let query = db.select().from(cards);

  if (whereConditions.length > 0) {
    query = query.where(and(...whereConditions)) as any;
  }

  // Add sorting
  const sortBy = options?.sortBy || 'name';
  const sortOrder = options?.sortOrder || 'asc';
  
  if (sortBy === 'name') {
    query = query.orderBy(sortOrder === 'desc' ? desc(cards.name) : asc(cards.name)) as any;
  } else if (sortBy === 'price') {
    query = query.orderBy(sortOrder === 'desc' ? desc(cards.priceUsd) : asc(cards.priceUsd)) as any;
  } else if (sortBy === 'rarity') {
    query = query.orderBy(sortOrder === 'desc' ? desc(cards.rarity) : asc(cards.rarity)) as any;
  } else if (sortBy === 'setName') {
    query = query.orderBy(sortOrder === 'desc' ? desc(cards.setName) : asc(cards.setName)) as any;
  } else if (sortBy === 'createdAt') {
    query = query.orderBy(sortOrder === 'desc' ? desc(cards.createdAt) : asc(cards.createdAt)) as any;
  }

  if (options?.limit) {
    query = query.limit(options.limit) as any;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as any;
  }

  return await query;
}

/**
 * Get a single card by ID
 */
export async function getCardById(cardId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(cards).where(eq(cards.id, cardId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Get cards by Scryfall ID
 */
export async function getCardByScryfallId(scryfallId: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(cards).where(eq(cards.scryfallId, scryfallId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

/**
 * Upsert a card (insert or update)
 */
export async function upsertCard(cardData: InsertCard) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(cards).values(cardData).onDuplicateKeyUpdate({
      set: {
        name: cardData.name,
        priceUsd: cardData.priceUsd,
        priceEur: cardData.priceEur,
        priceFoil: cardData.priceFoil,
        costBenefitScore: cardData.costBenefitScore,
        edhrecRank: cardData.edhrecRank,
        updatedAt: new Date(),
      },
    });

    return await getCardByScryfallId(cardData.scryfallId!);
  } catch (error) {
    console.error('[Database] Failed to upsert card:', error);
    throw error;
  }
}

/**
 * Get user's cart items
 */
export async function getUserCartItems(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(cartItems).where(eq(cartItems.userId, userId));
}

/**
 * Add item to cart
 */
export async function addToCart(userId: number, cardId: number, quantity: number, priceAtAddTime: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(cartItems).values({
      userId,
      cardId,
      quantity,
      priceAtAddTime,
    });

    return await getUserCartItems(userId);
  } catch (error) {
    console.error('[Database] Failed to add to cart:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 */
export async function removeFromCart(cartItemId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.delete(cartItems).where(eq(cartItems.id, cartItemId));
    return true;
  } catch (error) {
    console.error('[Database] Failed to remove from cart:', error);
    throw error;
  }
}

/**
 * Create an order
 */
export async function createOrder(userId: number, totalAmount: string, shippingAddress: object) {
  const db = await getDb();
  if (!db) return null;

  try {
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await db.insert(orders).values({
      userId,
      orderNumber,
      totalAmount,
      shippingAddress: JSON.stringify(shippingAddress),
    });

    // Get the inserted order
    const insertedOrder = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
    return insertedOrder.length > 0 ? insertedOrder[0] : null;
  } catch (error) {
    console.error('[Database] Failed to create order:', error);
    throw error;
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(orders).where(eq(orders.userId, userId));
}

/**
 * Add item to order
 */
export async function addOrderItem(orderId: number, cardId: number, quantity: number, pricePerCard: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(orderItems).values({
      orderId,
      cardId,
      quantity,
      pricePerCard,
    });

    return true;
  } catch (error) {
    console.error('[Database] Failed to add order item:', error);
    throw error;
  }
}

/**
 * Add card to wishlist
 */
export async function addToWishlist(userId: number, cardId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(wishlist).values({
      userId,
      cardId,
    });

    return true;
  } catch (error) {
    console.error('[Database] Failed to add to wishlist:', error);
    throw error;
  }
}

/**
 * Get user's wishlist
 */
export async function getUserWishlist(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(wishlist).where(eq(wishlist.userId, userId));
}


/**
 * Save price history for a card
 */
export async function savePriceHistory(priceData: InsertPriceHistory) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(priceHistory).values(priceData);
    return true;
  } catch (error) {
    console.error('[Database] Failed to save price history:', error);
    throw error;
  }
}

/**
 * Get latest prices for a card from all retailers
 */
export async function getLatestPrices(cardId: number) {
  const db = await getDb();
  if (!db) return [];

  const prices = await db
    .select()
    .from(priceHistory)
    .where(eq(priceHistory.cardId, cardId))
    .orderBy(sql`${priceHistory.retailer}, ${priceHistory.scrapedAt} DESC`);

  const latestByRetailer = new Map();
  for (const price of prices) {
    if (!latestByRetailer.has(price.retailer)) {
      latestByRetailer.set(price.retailer, price);
    }
  }

  return Array.from(latestByRetailer.values());
}

/**
 * Get cheapest price for a card
 */
export async function getCheapestPrice(cardId: number) {
  const db = await getDb();
  if (!db) return null;

  const prices = await getLatestPrices(cardId);
  if (prices.length === 0) return null;

  const pricesInUSD = prices.map(p => ({
    ...p,
    priceUSD: p.currency === 'EUR' ? parseFloat(p.price) * 1.1 : parseFloat(p.price),
  }));

  return pricesInUSD.reduce((min, current) => 
    current.priceUSD < min.priceUSD ? current : min
  );
}

/**
 * Get all users (admin only)
 */
export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(users);
}

/**
 * Search Scryfall for cards with pricing information
 */
export async function searchScryfallCards(cardName: string, maxPrice: number) {
  if (!cardName) return [];

  console.log('[Scryfall] Searching for:', cardName, 'max price:', maxPrice);

  try {
    const searchUrl = `https://api.scryfall.com/cards/search?q=${encodeURIComponent(cardName)}`;
    console.log('[Scryfall] API URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MTGCardShop/1.0',
      },
    });

    console.log('[Scryfall] Response status:', response.status);

    if (!response.ok) {
      console.log('[Scryfall] API request failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    console.log('[Scryfall] Raw data received, total cards:', data.total_cards || 0);
    
    if (!data.data) {
      console.log('[Scryfall] No data.data field found');
      return [];
    }

    // Filter cards by price and return with relevant info
    const filteredCards = data.data
      .filter((card: any) => {
        const price = parseFloat(card.prices?.usd || '999999');
        return price <= maxPrice && price > 0;
      })
      .slice(0, 20); // Limit to 20 results
      
    console.log('[Scryfall] Filtered cards count:', filteredCards.length);
    
    const mappedCards = filteredCards.map((card: any) => ({
        scryfallId: card.id,
        name: card.name,
        manaCost: card.mana_cost || '',
        cmc: card.cmc || 0,
        typeLine: card.type_line || '',
        oracleText: card.oracle_text || '',
        power: card.power || null,
        toughness: card.toughness || null,
        colors: card.colors ? card.colors.join(',') : '',
        colorIdentity: card.color_identity ? card.color_identity.join(',') : '',
        rarity: card.rarity || '',
        setCode: card.set || '',
        setName: card.set_name || '',
        collectorNumber: card.collector_number || '',
        releaseDate: card.released_at || '',
        imageUrl: card.image_uris?.normal || card.image_uris?.large || '',
        priceUsd: card.prices?.usd || null,
        priceEur: card.prices?.eur || null,
        priceFoil: card.prices?.usd_foil || null,
        costBenefitScore: calculateCostBenefitScore(card),
        edhrecRank: card.edhrec_rank || null,
        keywords: card.keywords ? JSON.stringify(card.keywords) : '[]',
        legalities: card.legalities ? JSON.stringify(card.legalities) : '{}',
        // Additional fields for admin interface
        tcgplayerUrl: card.purchase_uris?.tcgplayer || null,
        cardmarketUrl: card.purchase_uris?.cardmarket || null,
        scryfallUrl: card.scryfall_uri || null,
      }));
      
    console.log('[Scryfall] Returning', mappedCards.length, 'mapped cards');
    return mappedCards;
  } catch (error) {
    console.error('[Scryfall] Error searching:', error);
    return [];
  }
}

/**
 * Calculate cost-benefit score for a card
 */
function calculateCostBenefitScore(card: any) {
  const cmc = card.cmc || 0;
  if (cmc === 0) return '0';

  let value = 0;

  // Add power and toughness value
  if (card.power && card.toughness) {
    const power = parseInt(card.power) || 0;
    const toughness = parseInt(card.toughness) || 0;
    value += power + toughness;
  }

  // Add effect value based on keywords
  if (card.keywords && card.keywords.length > 0) {
    value += card.keywords.length * 0.5;
  }

  // Calculate score as value per mana
  const score = value / cmc;
  return score.toFixed(2);
}

/**
 * Delete a card from the database
 */
export async function deleteCard(cardId: number) {
  const db = await getDb();
  if (!db) return false;

  try {
    await db.delete(cards).where(eq(cards.id, cardId));
    return true;
  } catch (error) {
    console.error('[DB] Error deleting card:', error);
    return false;
  }
}

/**
 * Update card information (primarily pricing)
 */
export async function updateCard(input: {
  id: number;
  priceUsd?: string | null;
  priceEur?: string | null;
  priceFoil?: string | null;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const updateData: any = {};
    if (input.priceUsd !== undefined) updateData.priceUsd = input.priceUsd;
    if (input.priceEur !== undefined) updateData.priceEur = input.priceEur;
    if (input.priceFoil !== undefined) updateData.priceFoil = input.priceFoil;

    await db.update(cards).set(updateData).where(eq(cards.id, input.id));
    
    // Return the updated card
    return await getCardById(input.id);
  } catch (error) {
    console.error('[DB] Error updating card:', error);
    return null;
  }
}

/**
 * Search for cards across different trading card games
 */
export async function searchCardsForGame(cardName: string, maxPrice: number, game: string) {
  if (!cardName) return [];

  console.log('[SearchCards] Searching for:', cardName, 'max price:', maxPrice, 'game:', game);

  switch (game.toLowerCase()) {
    case 'mtg':
    case 'magic':
      return await searchScryfallCards(cardName, maxPrice);
    
    case 'yugioh':
    case 'yu-gi-oh':
      return await searchYuGiOhCards(cardName, maxPrice);
    
    case 'pokemon':
    case 'pokémon':
      return await searchPokemonCards(cardName, maxPrice);
    
    case 'lorcana':
    case 'disney-lorcana':
      return await searchLorcanaCards(cardName, maxPrice);
    
    case 'onepiece':
    case 'one-piece':
      return await searchOnePieceCards(cardName, maxPrice);
    
    case 'digimon':
      return await searchDigimonCards(cardName, maxPrice);
    
    case 'starwars':
    case 'star-wars':
      return await searchStarWarsCards(cardName, maxPrice);
    
    case 'fab':
    case 'flesh-and-blood':
      return await searchFleshAndBloodCards(cardName, maxPrice);
    
    case 'vanguard':
    case 'cardfight-vanguard':
      return await searchVanguardCards(cardName, maxPrice);
    
    case 'weiss-schwarz':
    case 'weiss':
      return await searchWeissSchwarzCards(cardName, maxPrice);
    
    case 'shadowverse':
      return await searchShadowverseCards(cardName, maxPrice);
    
    case 'godzilla':
      return await searchGodzillaCards(cardName, maxPrice);
    
    default:
      console.log('[SearchCards] Unknown game:', game, 'defaulting to MTG');
      return await searchScryfallCards(cardName, maxPrice);
  }
}

/**
 * Search Yu-Gi-Oh! cards using YGOPRODeck API
 */
async function searchYuGiOhCards(cardName: string, maxPrice: number) {
  try {
    console.log('[YuGiOh] Searching for:', cardName);
    
    const searchUrl = `https://db.ygoprodeck.com/api/v7/cardinfo.php?fname=${encodeURIComponent(cardName)}`;
    console.log('[YuGiOh] API URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'MTGCardShop/1.0' },
    });

    if (!response.ok) {
      console.log('[YuGiOh] API request failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data) {
      console.log('[YuGiOh] No cards found');
      return [];
    }

    return data.data.slice(0, 20).map((card: any) => ({
      scryfallId: `yugioh-${card.id}`,
      name: card.name,
      manaCost: '',
      cmc: 0,
      typeLine: card.type || '',
      oracleText: card.desc || '',
      power: card.atk?.toString() || null,
      toughness: card.def?.toString() || null,
      colors: '',
      colorIdentity: '',
      rarity: card.rarity || 'common',
      setCode: card.card_sets?.[0]?.set_code || '',
      setName: card.card_sets?.[0]?.set_name || '',
      collectorNumber: card.card_sets?.[0]?.set_code || '',
      releaseDate: '',
      imageUrl: card.card_images?.[0]?.image_url || '',
      priceUsd: '5.00', // Default price since YGOPRODeck doesn't provide pricing
      priceEur: null,
      priceFoil: null,
      costBenefitScore: '1.0',
      edhrecRank: null,
      keywords: '[]',
      legalities: '{}',
      // Additional fields for admin interface
      tcgplayerUrl: `https://www.tcgplayer.com/search/yugioh/product?productLineName=yugioh&q=${encodeURIComponent(card.name)}`,
      cardmarketUrl: `https://www.cardmarket.com/en/YuGiOh/Products/Search?searchString=${encodeURIComponent(card.name)}`,
      scryfallUrl: null,
    }));
  } catch (error) {
    console.error('[YuGiOh] Error searching:', error);
    return [];
  }
}

/**
 * Search Pokémon cards using PokéTCG API
 */
async function searchPokemonCards(cardName: string, maxPrice: number) {
  try {
    console.log('[Pokemon] Searching for:', cardName);
    
    const searchUrl = `https://api.pokemontcg.io/v2/cards?q=name:${encodeURIComponent(cardName)}*`;
    console.log('[Pokemon] API URL:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: { 'User-Agent': 'MTGCardShop/1.0' },
    });

    if (!response.ok) {
      console.log('[Pokemon] API request failed:', response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.data) {
      console.log('[Pokemon] No cards found');
      return [];
    }

    return data.data.slice(0, 20).map((card: any) => ({
      scryfallId: `pokemon-${card.id}`,
      name: card.name,
      manaCost: card.convertedEnergyCost?.toString() || '',
      cmc: card.convertedEnergyCost || 0,
      typeLine: card.supertype === 'Pokémon' ? `${card.supertype} - ${card.subtypes?.join(' ')}` : card.supertype,
      oracleText: card.abilities?.map((a: any) => `${a.name}: ${a.text}`).join('\n') || card.rules?.join('\n') || '',
      power: card.hp || null,
      toughness: null,
      colors: '',
      colorIdentity: '',
      rarity: card.rarity || 'common',
      setCode: card.set?.id || '',
      setName: card.set?.name || '',
      collectorNumber: card.number || '',
      releaseDate: card.set?.releaseDate || '',
      imageUrl: card.images?.large || card.images?.small || '',
      priceUsd: card.tcgplayer?.prices?.normal?.market?.toString() || card.tcgplayer?.prices?.holofoil?.market?.toString() || '3.00',
      priceEur: null,
      priceFoil: card.tcgplayer?.prices?.holofoil?.market?.toString() || null,
      costBenefitScore: '1.0',
      edhrecRank: null,
      keywords: '[]',
      legalities: '{}',
      // Additional fields for admin interface
      tcgplayerUrl: card.tcgplayer?.url || `https://www.tcgplayer.com/search/pokemon/product?productLineName=pokemon&q=${encodeURIComponent(card.name)}`,
      cardmarketUrl: `https://www.cardmarket.com/en/Pokemon/Products/Search?searchString=${encodeURIComponent(card.name)}`,
      scryfallUrl: null,
    }));
  } catch (error) {
    console.error('[Pokemon] Error searching:', error);
    return [];
  }
}

/**
 * Placeholder functions for other games (will return empty arrays for now)
 * These can be implemented later with actual APIs or data sources
 */
async function searchLorcanaCards(cardName: string, maxPrice: number) {
  console.log('[Lorcana] Search not implemented yet - returning empty results');
  return [];
}

async function searchOnePieceCards(cardName: string, maxPrice: number) {
  console.log('[OnePiece] Search not implemented yet - returning empty results');
  return [];
}

async function searchDigimonCards(cardName: string, maxPrice: number) {
  console.log('[Digimon] Search not implemented yet - returning empty results');
  return [];
}

async function searchStarWarsCards(cardName: string, maxPrice: number) {
  console.log('[StarWars] Search not implemented yet - returning empty results');
  return [];
}

async function searchFleshAndBloodCards(cardName: string, maxPrice: number) {
  console.log('[FleshAndBlood] Search not implemented yet - returning empty results');
  return [];
}

async function searchVanguardCards(cardName: string, maxPrice: number) {
  console.log('[Vanguard] Search not implemented yet - returning empty results');
  return [];
}

async function searchWeissSchwarzCards(cardName: string, maxPrice: number) {
  console.log('[WeissSchwarz] Search not implemented yet - returning empty results');
  return [];
}

async function searchShadowverseCards(cardName: string, maxPrice: number) {
  console.log('[Shadowverse] Search not implemented yet - returning empty results');
  return [];
}

async function searchGodzillaCards(cardName: string, maxPrice: number) {
  console.log('[Godzilla] Search not implemented yet - returning empty results');
  return [];
}
