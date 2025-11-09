import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { getCards, getCardById, getCardByScryfallId, getUserCartItems, addToCart, removeFromCart, getUserWishlist, addToWishlist, getUserOrders, getLatestPrices, getCheapestPrice, upsertCard, getAllUsers, searchScryfallCards, getUserByOpenId, deleteCard, updateCard, searchCardsForGame } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      console.log('[Auth/Me] User:', ctx.user ? { openId: ctx.user.openId, role: ctx.user.role } : null);
      return ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    adminLogin: publicProcedure
      .input((val: any) => ({
        openId: typeof val.openId === 'string' ? val.openId : '',
      }))
      .mutation(async ({ ctx, input }) => {
        console.log('[AdminLogin] Attempting login for:', input.openId);
        // Simple admin login for development
        const user = await getUserByOpenId(input.openId);
        console.log('[AdminLogin] User found:', user ? { openId: user.openId, role: user.role } : null);
        if (!user || user.role !== 'admin') {
          console.log('[AdminLogin] Login failed - invalid credentials');
          throw new Error('Invalid admin credentials');
        }
        
        // Set session cookie (simplified for development)
        const cookieOptions = getSessionCookieOptions(ctx.req);
        const cookieValue = user.openId; // openId already has 'admin-' prefix
        console.log('[AdminLogin] Setting cookie:', cookieValue, 'with options:', cookieOptions);
        ctx.res.cookie(COOKIE_NAME, cookieValue, cookieOptions);
        
        console.log('[AdminLogin] Login successful');
        return { success: true, user };
      }),
  }),

  cards: router({
    search: publicProcedure
      .input((val: any) => ({
        search: typeof val.search === 'string' ? val.search : '',
        rarity: typeof val.rarity === 'string' ? val.rarity : undefined,
        limit: typeof val.limit === 'number' ? val.limit : 20,
        offset: typeof val.offset === 'number' ? val.offset : 0,
      }))
      .query(async ({ input }) => {
        return getCards({
          search: input.search || undefined,
          rarity: input.rarity,
          limit: input.limit,
          offset: input.offset,
        });
      }),

    getById: publicProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .query(async ({ input }) => {
        return getCardById(input);
      }),

    getByScryfallId: publicProcedure
      .input((val: any) => typeof val === 'string' ? val : '')
      .query(async ({ input }) => {
        return getCardByScryfallId(input);
      }),
  }),

  cart: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getUserCartItems(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input((val: any) => ({
        cardId: typeof val.cardId === 'number' ? val.cardId : 0,
        quantity: typeof val.quantity === 'number' ? val.quantity : 1,
        priceAtAddTime: typeof val.priceAtAddTime === 'string' ? val.priceAtAddTime : '0',
      }))
      .mutation(async ({ ctx, input }) => {
        return addToCart(ctx.user.id, input.cardId, input.quantity, input.priceAtAddTime);
      }),

    removeItem: protectedProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .mutation(async ({ input }) => {
        return removeFromCart(input);
      }),
  }),

  wishlist: router({
    getItems: protectedProcedure.query(async ({ ctx }) => {
      return getUserWishlist(ctx.user.id);
    }),

    addItem: protectedProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .mutation(async ({ ctx, input }) => {
        return addToWishlist(ctx.user.id, input);
      }),
  }),

  orders: router({
    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return getUserOrders(ctx.user.id);
    }),
  }),

  prices: router({
    getLatest: publicProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .query(async ({ input }) => {
        return getLatestPrices(input);
      }),

    getCheapest: publicProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .query(async ({ input }) => {
        return getCheapestPrice(input);
      }),
  }),

  admin: router({
    // Get all users (admin only)
    getUsers: adminProcedure.query(async () => {
      return getAllUsers();
    }),

    // Add a new card to the database
    addCard: adminProcedure
      .input((val: any) => ({
        scryfallId: typeof val.scryfallId === 'string' ? val.scryfallId : '',
        name: typeof val.name === 'string' ? val.name : '',
        manaCost: typeof val.manaCost === 'string' ? val.manaCost : '',
        cmc: typeof val.cmc === 'number' ? val.cmc : 0,
        typeLine: typeof val.typeLine === 'string' ? val.typeLine : '',
        oracleText: typeof val.oracleText === 'string' ? val.oracleText : '',
        power: typeof val.power === 'string' ? val.power : null,
        toughness: typeof val.toughness === 'string' ? val.toughness : null,
        colors: typeof val.colors === 'string' ? val.colors : '',
        colorIdentity: typeof val.colorIdentity === 'string' ? val.colorIdentity : '',
        rarity: typeof val.rarity === 'string' ? val.rarity : '',
        setCode: typeof val.setCode === 'string' ? val.setCode : '',
        setName: typeof val.setName === 'string' ? val.setName : '',
        collectorNumber: typeof val.collectorNumber === 'string' ? val.collectorNumber : '',
        releaseDate: typeof val.releaseDate === 'string' ? val.releaseDate : '',
        imageUrl: typeof val.imageUrl === 'string' ? val.imageUrl : '',
        priceUsd: typeof val.priceUsd === 'string' ? val.priceUsd : null,
        priceEur: typeof val.priceEur === 'string' ? val.priceEur : null,
        priceFoil: typeof val.priceFoil === 'string' ? val.priceFoil : null,
        costBenefitScore: typeof val.costBenefitScore === 'string' ? val.costBenefitScore : null,
        edhrecRank: typeof val.edhrecRank === 'number' ? val.edhrecRank : null,
        keywords: typeof val.keywords === 'string' ? val.keywords : '[]',
        legalities: typeof val.legalities === 'string' ? val.legalities : '{}',
      }))
      .mutation(async ({ input }) => {
        return upsertCard(input);
      }),

    // Search external sources for cheap cards
    searchExternalCards: adminProcedure
      .input((val: any) => ({
        cardName: typeof val.cardName === 'string' ? val.cardName : '',
        maxPrice: typeof val.maxPrice === 'number' ? val.maxPrice : 100,
        game: typeof val.game === 'string' ? val.game : 'mtg',
      }))
      .query(async ({ input }) => {
        console.log('[SearchCards] Starting search for:', input.cardName, 'max price:', input.maxPrice, 'game:', input.game);
        try {
          // This will search for cards based on the selected game
          const results = await searchCardsForGame(input.cardName, input.maxPrice, input.game);
          console.log('[SearchCards] Found', results?.length || 0, 'cards');
          return results;
        } catch (error) {
          console.error('[SearchCards] Error:', error);
          throw error;
        }
      }),

    // Get all cards in inventory with pagination and filters
    getInventory: adminProcedure
      .input((val: any) => ({
        search: typeof val.search === 'string' ? val.search : undefined,
        rarity: typeof val.rarity === 'string' ? val.rarity : undefined,
        setCode: typeof val.setCode === 'string' ? val.setCode : undefined,
        colors: typeof val.colors === 'string' ? val.colors : undefined,
        minPrice: typeof val.minPrice === 'number' ? val.minPrice : undefined,
        maxPrice: typeof val.maxPrice === 'number' ? val.maxPrice : undefined,
        limit: typeof val.limit === 'number' ? val.limit : 20,
        offset: typeof val.offset === 'number' ? val.offset : 0,
        sortBy: typeof val.sortBy === 'string' ? val.sortBy : 'name',
        sortOrder: typeof val.sortOrder === 'string' ? val.sortOrder : 'asc',
      }))
      .query(async ({ input }) => {
        return getCards({
          search: input.search,
          rarity: input.rarity,
          setCode: input.setCode,
          colors: input.colors,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          limit: input.limit,
          offset: input.offset,
          sortBy: input.sortBy,
          sortOrder: input.sortOrder,
        });
      }),

    // Delete a card from inventory
    deleteCard: adminProcedure
      .input((val: any) => typeof val === 'number' ? val : 0)
      .mutation(async ({ input }) => {
        // Add deleteCard function to db.ts
        return deleteCard(input);
      }),

    // Update card information
    updateCard: adminProcedure
      .input((val: any) => ({
        id: typeof val.id === 'number' ? val.id : 0,
        priceUsd: typeof val.priceUsd === 'string' ? val.priceUsd : null,
        priceEur: typeof val.priceEur === 'string' ? val.priceEur : null,
        priceFoil: typeof val.priceFoil === 'string' ? val.priceFoil : null,
      }))
      .mutation(async ({ input }) => {
        // Add updateCard function to db.ts
        return updateCard(input);
      }),
  }),
});

export type AppRouter = typeof appRouter;
