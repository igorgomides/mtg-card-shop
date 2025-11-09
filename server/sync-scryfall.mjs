#!/usr/bin/env node

/**
 * Scryfall Card Sync Script
 * Fetches card data from Scryfall API and stores it in the database
 * Run with: node sync-scryfall.mjs
 */

import fetch from 'node-fetch';
import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const SCRYFALL_API = 'https://api.scryfall.com';
const USER_AGENT = 'MTGCardShop/1.0 (+https://mtg-card-shop.com)';
const DELAY_MS = 100; // 100ms delay between requests (10 req/sec)

// Helper to add delay between requests
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to fetch with proper headers
async function fetchScryfall(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Scryfall API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Calculate cost-benefit score
function calculateCostBenefitScore(card) {
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

// Sync cards from Scryfall
async function syncCards() {
  console.log('Starting Scryfall card sync...');

  const connection = await createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mtg_card_shop',
  });

  try {
    let pageUrl = `${SCRYFALL_API}/cards/search?q=is:booster&order=released&dir=desc&page=1`;
    let totalCards = 0;
    let pageCount = 0;

    while (pageUrl && pageCount < 5) { // Limit to 5 pages for initial sync
      console.log(`Fetching page ${pageCount + 1}...`);

      const data = await fetchScryfall(pageUrl);

      if (!data.data || data.data.length === 0) {
        break;
      }

      for (const card of data.data) {
        try {
          const priceUsd = card.prices?.usd || null;
          const priceEur = card.prices?.eur || null;
          const priceFoil = card.prices?.usd_foil || null;
          const costBenefitScore = calculateCostBenefitScore(card);

          const query = `
            INSERT INTO cards (
              scryfallId, name, manaCost, cmc, typeLine, oracleText,
              power, toughness, colors, colorIdentity, rarity,
              setCode, setName, collectorNumber, releaseDate, imageUrl,
              priceUsd, priceEur, priceFoil, costBenefitScore, edhrecRank,
              keywords, legalities, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
            ON DUPLICATE KEY UPDATE
              priceUsd = VALUES(priceUsd),
              priceEur = VALUES(priceEur),
              priceFoil = VALUES(priceFoil),
              costBenefitScore = VALUES(costBenefitScore),
              edhrecRank = VALUES(edhrecRank),
              updatedAt = NOW()
          `;

          const imageUrl = card.image_uris?.normal || card.image_uris?.large || null;
          const colors = card.colors ? card.colors.join(',') : '';
          const colorIdentity = card.color_identity ? card.color_identity.join(',') : '';
          const keywords = card.keywords ? JSON.stringify(card.keywords) : '[]';
          const legalities = card.legalities ? JSON.stringify(card.legalities) : '{}';

          await connection.execute(query, [
            card.id,
            card.name,
            card.mana_cost || '',
            card.cmc || 0,
            card.type_line || '',
            card.oracle_text || '',
            card.power || null,
            card.toughness || null,
            colors,
            colorIdentity,
            card.rarity || '',
            card.set || '',
            card.set_name || '',
            card.collector_number || '',
            card.released_at || '',
            imageUrl,
            priceUsd,
            priceEur,
            priceFoil,
            costBenefitScore,
            card.edhrec_rank || null,
            keywords,
            legalities,
          ]);

          totalCards++;
        } catch (error) {
          console.error(`Error inserting card ${card.name}:`, error.message);
        }
      }

      // Add delay before next request
      await delay(DELAY_MS);

      // Check for next page
      pageUrl = data.next_page || null;
      pageCount++;
    }

    console.log(`✓ Sync complete! Inserted/updated ${totalCards} cards.`);
  } catch (error) {
    console.error('Sync failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run sync
syncCards().catch(console.error);
