#!/usr/bin/env node

/**
 * Scheduled Price Update Script
 * Runs periodically to update prices from multiple retailers
 * Can be triggered via cron job or task scheduler
 * 
 * Usage:
 *   node scheduled-price-update.mjs          # Update all cards
 *   node scheduled-price-update.mjs 100      # Update top 100 cards
 */

import { createConnection } from 'mysql2/promise';
import { getAllPrices } from './price-scraper.mjs';
import dotenv from 'dotenv';

dotenv.config();

const BATCH_SIZE = process.argv[2] ? parseInt(process.argv[2]) : 100;
const DELAY_BETWEEN_CARDS = 2000; // 2 seconds between card scrapes

async function updatePrices() {
  console.log(`Starting price update for top ${BATCH_SIZE} cards...`);
  console.log(`Time: ${new Date().toISOString()}\n`);

  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mtg_card_shop',
  });

  try {
    // Get top cards by cost-benefit score
    const [cards] = await connection.execute(
      `SELECT id, name, setName FROM cards 
       WHERE costBenefitScore IS NOT NULL 
       ORDER BY costBenefitScore DESC 
       LIMIT ?`,
      [BATCH_SIZE]
    );

    console.log(`Found ${cards.length} cards to update\n`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      console.log(`[${i + 1}/${cards.length}] Updating prices for: ${card.name}`);

      try {
        const priceData = await getAllPrices(card.name, card.setName);

        if (priceData && priceData.prices) {
          // Save each price to database
          for (const price of priceData.prices) {
            const insertQuery = `
              INSERT INTO priceHistory 
              (cardId, retailer, price, currency, url, condition, inStock, scrapedAt)
              VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `;

            await connection.execute(insertQuery, [
              card.id,
              price.retailer,
              price.price.toString(),
              price.currency || 'USD',
              price.url || null,
              price.condition || 'NM',
              true, // Assume in stock if we found it
            ]);
          }

          console.log(`  ✓ Saved ${priceData.prices.length} prices`);
          successCount++;
        } else {
          console.log(`  ⚠ No prices found`);
        }
      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        errorCount++;
      }

      // Delay before next card to be respectful to retailers
      if (i < cards.length - 1) {
        await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_CARDS));
      }
    }

    console.log(`\n=== Update Complete ===`);
    console.log(`Successful: ${successCount}`);
    console.log(`Errors: ${errorCount}`);
    console.log(`Completion time: ${new Date().toISOString()}`);
  } catch (error) {
    console.error('Update failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the update
updatePrices().catch(console.error);
