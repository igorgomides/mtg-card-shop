#!/usr/bin/env node

/**
 * Add Sample Cards Script
 * Adds sample MTG cards to the database for testing
 * Run with: node server/add-sample-cards.mjs
 */

import { createConnection } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

// Sample cards data
const sampleCards = [
  {
    scryfallId: 'bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd',
    name: 'Black Lotus',
    manaCost: '',
    cmc: 0,
    typeLine: 'Artifact',
    oracleText: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
    power: null,
    toughness: null,
    colors: '',
    colorIdentity: '',
    rarity: 'special',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '232',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/b/d/bd8fa327-dd41-4737-8f19-2cf5eb1f7cdd.jpg',
    priceUsd: '27000.00',
    priceEur: '24000.00',
    priceFoil: null,
    costBenefitScore: '999.99',
    edhrecRank: 1,
    keywords: '[]',
    legalities: '{"standard":"banned","pioneer":"banned","modern":"banned","legacy":"banned","vintage":"restricted","commander":"banned","historic":"banned"}'
  },
  {
    scryfallId: '9ea8179a-d3c9-4cdc-a5b5-68cc73279050',
    name: 'Lightning Bolt',
    manaCost: '{R}',
    cmc: 1,
    typeLine: 'Instant',
    oracleText: 'Lightning Bolt deals 3 damage to any target.',
    power: null,
    toughness: null,
    colors: 'R',
    colorIdentity: 'R',
    rarity: 'common',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '161',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/9/e/9ea8179a-d3c9-4cdc-a5b5-68cc73279050.jpg',
    priceUsd: '450.00',
    priceEur: '400.00',
    priceFoil: null,
    costBenefitScore: '3.00',
    edhrecRank: 12,
    keywords: '[]',
    legalities: '{"standard":"not_legal","pioneer":"not_legal","modern":"legal","legacy":"legal","vintage":"legal","commander":"legal","historic":"legal"}'
  },
  {
    scryfallId: '0c082aa8-bf7f-47f2-baf8-43ad253fd7d7',
    name: 'Counterspell',
    manaCost: '{U}{U}',
    cmc: 2,
    typeLine: 'Instant',
    oracleText: 'Counter target spell.',
    power: null,
    toughness: null,
    colors: 'U',
    colorIdentity: 'U',
    rarity: 'common',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '55',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/0/c/0c082aa8-bf7f-47f2-baf8-43ad253fd7d7.jpg',
    priceUsd: '95.00',
    priceEur: '85.00',
    priceFoil: null,
    costBenefitScore: '1.50',
    edhrecRank: 25,
    keywords: '[]',
    legalities: '{"standard":"not_legal","pioneer":"not_legal","modern":"not_legal","legacy":"legal","vintage":"legal","commander":"legal","historic":"legal"}'
  },
  {
    scryfallId: '4b0f9599-8893-4f40-b5c6-17518cb3ad3b',
    name: 'Shivan Dragon',
    manaCost: '{4}{R}{R}',
    cmc: 6,
    typeLine: 'Creature — Dragon',
    oracleText: 'Flying',
    power: '5',
    toughness: '5',
    colors: 'R',
    colorIdentity: 'R',
    rarity: 'rare',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '175',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/4/b/4b0f9599-8893-4f40-b5c6-17518cb3ad3b.jpg',
    priceUsd: '65.00',
    priceEur: '55.00',
    priceFoil: null,
    costBenefitScore: '1.83',
    edhrecRank: 150,
    keywords: '["Flying"]',
    legalities: '{"standard":"not_legal","pioneer":"legal","modern":"legal","legacy":"legal","vintage":"legal","commander":"legal","historic":"legal"}'
  },
  {
    scryfallId: 'a3b9f589-7d44-4b25-9ac2-c3f0a5b5ad6a',
    name: 'Sol Ring',
    manaCost: '{1}',
    cmc: 1,
    typeLine: 'Artifact',
    oracleText: '{T}: Add {C}{C}.',
    power: null,
    toughness: null,
    colors: '',
    colorIdentity: '',
    rarity: 'uncommon',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '268',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/a/3/a3b9f589-7d44-4b25-9ac2-c3f0a5b5ad6a.jpg',
    priceUsd: '1.25',
    priceEur: '1.10',
    priceFoil: '3.50',
    costBenefitScore: '2.00',
    edhrecRank: 1,
    keywords: '[]',
    legalities: '{"standard":"not_legal","pioneer":"not_legal","modern":"not_legal","legacy":"legal","vintage":"legal","commander":"legal","historic":"not_legal"}'
  },
  {
    scryfallId: 'c1109e37-9c1b-4d7a-aaef-e9d9e8b0b5a6',
    name: 'Ancestral Recall',
    manaCost: '{U}',
    cmc: 1,
    typeLine: 'Instant',
    oracleText: 'Target player draws three cards.',
    power: null,
    toughness: null,
    colors: 'U',
    colorIdentity: 'U',
    rarity: 'special',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '45',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/c/1/c1109e37-9c1b-4d7a-aaef-e9d9e8b0b5a6.jpg',
    priceUsd: '8500.00',
    priceEur: '7500.00',
    priceFoil: null,
    costBenefitScore: '3.00',
    edhrecRank: 2,
    keywords: '[]',
    legalities: '{"standard":"banned","pioneer":"banned","modern":"banned","legacy":"banned","vintage":"restricted","commander":"banned","historic":"banned"}'
  },
  {
    scryfallId: 'f0e2c108-0c4f-4a5b-9c3a-0e0b7a7b0f3a',
    name: 'Time Walk',
    manaCost: '{1}{U}',
    cmc: 2,
    typeLine: 'Sorcery',
    oracleText: 'Take an extra turn after this one.',
    power: null,
    toughness: null,
    colors: 'U',
    colorIdentity: 'U',
    rarity: 'special',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '84',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/f/0/f0e2c108-0c4f-4a5b-9c3a-0e0b7a7b0f3a.jpg',
    priceUsd: '4200.00',
    priceEur: '3800.00',
    priceFoil: null,
    costBenefitScore: '5.00',
    edhrecRank: 3,
    keywords: '[]',
    legalities: '{"standard":"banned","pioneer":"banned","modern":"banned","legacy":"banned","vintage":"restricted","commander":"banned","historic":"banned"}'
  },
  {
    scryfallId: 'b8b6b7a4-7e1f-4b7a-9e5c-2f2a1e1b2c3d',
    name: 'Serra Angel',
    manaCost: '{3}{W}{W}',
    cmc: 5,
    typeLine: 'Creature — Angel',
    oracleText: 'Flying, vigilance',
    power: '4',
    toughness: '4',
    colors: 'W',
    colorIdentity: 'W',
    rarity: 'uncommon',
    setCode: 'lea',
    setName: 'Limited Edition Alpha',
    collectorNumber: '36',
    releaseDate: '1993-08-05',
    imageUrl: 'https://cards.scryfall.io/normal/front/b/8/b8b6b7a4-7e1f-4b7a-9e5c-2f2a1e1b2c3d.jpg',
    priceUsd: '15.00',
    priceEur: '12.00',
    priceFoil: '45.00',
    costBenefitScore: '1.80',
    edhrecRank: 85,
    keywords: '["Flying", "Vigilance"]',
    legalities: '{"standard":"not_legal","pioneer":"legal","modern":"legal","legacy":"legal","vintage":"legal","commander":"legal","historic":"legal"}'
  }
];

async function addSampleCards() {
  console.log('Adding sample cards to database...');

  // Parse DATABASE_URL to get connection details
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('DATABASE_URL environment variable not set');
    process.exit(1);
  }

  // Extract connection details from mysql://user:password@host:port/database
  const match = dbUrl.match(/mysql:\/\/([^:]+)(?::([^@]+))?@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    console.error('Invalid DATABASE_URL format');
    process.exit(1);
  }

  const [, user, password = '', host, port, database] = match;

  const connection = await createConnection({
    host,
    port: parseInt(port),
    user,
    password,
    database,
  });

  try {
    for (const card of sampleCards) {
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

      await connection.execute(query, [
        card.scryfallId,
        card.name,
        card.manaCost,
        card.cmc,
        card.typeLine,
        card.oracleText,
        card.power,
        card.toughness,
        card.colors,
        card.colorIdentity,
        card.rarity,
        card.setCode,
        card.setName,
        card.collectorNumber,
        card.releaseDate,
        card.imageUrl,
        card.priceUsd,
        card.priceEur,
        card.priceFoil,
        card.costBenefitScore,
        card.edhrecRank,
        card.keywords,
        card.legalities,
      ]);

      console.log(`✓ Added ${card.name}`);
    }

    console.log(`\n✅ Successfully added ${sampleCards.length} sample cards!`);
    console.log('You can now test the search functionality with cards like:');
    console.log('- Black Lotus');
    console.log('- Lightning Bolt');
    console.log('- Counterspell');
    console.log('- Shivan Dragon');
    console.log('- Sol Ring');
    
  } catch (error) {
    console.error('Error adding cards:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

// Run the script
addSampleCards().catch(console.error);