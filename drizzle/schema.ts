import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * MTG Card table - stores card data from Scryfall API
 */
export const cards = mysqlTable('cards', {
  id: int('id').autoincrement().primaryKey(),
  scryfallId: varchar('scryfallId', { length: 64 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  manaCost: varchar('manaCost', { length: 100 }),
  cmc: int('cmc'), // Converted mana cost
  typeLine: text('typeLine'),
  oracleText: text('oracleText'),
  power: varchar('power', { length: 10 }),
  toughness: varchar('toughness', { length: 10 }),
  colors: varchar('colors', { length: 50 }), // Stored as comma-separated
  colorIdentity: varchar('colorIdentity', { length: 50 }),
  rarity: varchar('rarity', { length: 20 }), // common, uncommon, rare, mythic
  setCode: varchar('setCode', { length: 10 }),
  setName: varchar('setName', { length: 255 }),
  collectorNumber: varchar('collectorNumber', { length: 20 }),
  releaseDate: varchar('releaseDate', { length: 20 }),
  imageUrl: text('imageUrl'),
  priceUsd: varchar('priceUsd', { length: 20 }), // Stored as string for precision
  priceEur: varchar('priceEur', { length: 20 }),
  priceFoil: varchar('priceFoil', { length: 20 }),
  costBenefitScore: varchar('costBenefitScore', { length: 20 }), // Calculated score
  edhrecRank: int('edhrecRank'),
  keywords: text('keywords'), // Stored as JSON array
  legalities: text('legalities'), // Stored as JSON
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;

/**
 * Cart items table - stores items in user shopping carts
 */
export const cartItems = mysqlTable('cartItems', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  cardId: int('cardId').notNull(),
  quantity: int('quantity').notNull().default(1),
  priceAtAddTime: varchar('priceAtAddTime', { length: 20 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;

/**
 * Orders table - stores completed orders
 */
export const orders = mysqlTable('orders', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  orderNumber: varchar('orderNumber', { length: 50 }).notNull().unique(),
  totalAmount: varchar('totalAmount', { length: 20 }).notNull(),
  status: mysqlEnum('status', ['pending', 'paid', 'shipped', 'delivered', 'cancelled']).default('pending').notNull(),
  stripePaymentIntentId: varchar('stripePaymentIntentId', { length: 255 }),
  shippingAddress: text('shippingAddress'), // Stored as JSON
  shippingMethod: varchar('shippingMethod', { length: 50 }),
  trackingNumber: varchar('trackingNumber', { length: 100 }),
  notes: text('notes'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt').defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table - stores individual items in orders
 */
export const orderItems = mysqlTable('orderItems', {
  id: int('id').autoincrement().primaryKey(),
  orderId: int('orderId').notNull(),
  cardId: int('cardId').notNull(),
  quantity: int('quantity').notNull(),
  pricePerCard: varchar('pricePerCard', { length: 20 }).notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

/**
 * Wishlist table - stores user wishlist items
 */
export const wishlist = mysqlTable('wishlist', {
  id: int('id').autoincrement().primaryKey(),
  userId: int('userId').notNull(),
  cardId: int('cardId').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type Wishlist = typeof wishlist.$inferSelect;
export type InsertWishlist = typeof wishlist.$inferInsert;

/**
 * Price history table - stores historical pricing data from retailers
 */
export const priceHistory = mysqlTable('priceHistory', {
  id: int('id').autoincrement().primaryKey(),
  cardId: int('cardId').notNull(),
  retailer: varchar('retailer', { length: 50 }).notNull(),
  price: varchar('price', { length: 20 }).notNull(),
  currency: varchar('currency', { length: 10 }).default('USD').notNull(),
  url: text('url'),
  condition: varchar('condition', { length: 50 }),
  inStock: boolean('inStock').default(true),
  scrapedAt: timestamp('scrapedAt').defaultNow().notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
});

export type PriceHistory = typeof priceHistory.$inferSelect;
export type InsertPriceHistory = typeof priceHistory.$inferInsert;