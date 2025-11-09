#!/usr/bin/env node

/**
 * MTG Card Price Scraper
 * Fetches current prices from multiple retailers for Magic cards
 * Supports: TCGPlayer, Cardmarket, eBay
 */

import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

const DELAY_MS = 500; // Delay between requests to be respectful

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Scrape TCGPlayer for card prices
 * TCGPlayer is the largest Magic card marketplace in North America
 */
export async function scrapeTCGPlayer(cardName, setName) {
  try {
    // TCGPlayer search URL
    const searchUrl = `https://www.tcgplayer.com/search/magic/product?q=${encodeURIComponent(cardName)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MTGCardShop/1.0 (+https://mtg-card-shop.com)',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract price data from TCGPlayer
    const prices = [];
    $('.product-listing').each((i, elem) => {
      const name = $(elem).find('.product-name').text().trim();
      const price = $(elem).find('.product-price').text().trim();
      const url = $(elem).find('a').attr('href');

      if (name && price) {
        prices.push({
          retailer: 'TCGPlayer',
          name,
          price: parseFloat(price.replace('$', '')),
          url: `https://www.tcgplayer.com${url}`,
          condition: 'NM', // Near Mint default
        });
      }
    });

    return prices.length > 0 ? prices[0] : null;
  } catch (error) {
    console.error('TCGPlayer scrape error:', error.message);
    return null;
  }
}

/**
 * Scrape Cardmarket for card prices
 * Cardmarket is the largest Magic card marketplace in Europe
 */
export async function scrapeCardmarket(cardName, setName) {
  try {
    const searchUrl = `https://www.cardmarket.com/en/Magic/Products/Search?searchString=${encodeURIComponent(cardName)}`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MTGCardShop/1.0 (+https://mtg-card-shop.com)',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract price data from Cardmarket
    let price = null;
    let url = null;

    $('.product-name').each((i, elem) => {
      const name = $(elem).text().trim();
      if (name.toLowerCase().includes(cardName.toLowerCase())) {
        const priceElem = $(elem).closest('.product-row').find('.price-tag');
        price = parseFloat(priceElem.text().replace('€', '').trim());
        url = $(elem).attr('href');
      }
    });

    if (price && url) {
      return {
        retailer: 'Cardmarket',
        name: cardName,
        price,
        currency: 'EUR',
        url: `https://www.cardmarket.com${url}`,
        condition: 'NM',
      };
    }

    return null;
  } catch (error) {
    console.error('Cardmarket scrape error:', error.message);
    return null;
  }
}

/**
 * Scrape eBay for card prices
 * eBay has many individual sellers offering Magic cards
 */
export async function scrapeEBay(cardName, setName) {
  try {
    const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(cardName + ' magic card')}&_sacat=19126`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'MTGCardShop/1.0 (+https://mtg-card-shop.com)',
      },
    });

    if (!response.ok) return null;

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract price data from eBay
    let lowestPrice = null;
    let lowestUrl = null;

    $('.s-item').each((i, elem) => {
      const title = $(elem).find('.s-item__title').text().trim();
      const priceText = $(elem).find('.s-item__price').text().trim();
      const price = parseFloat(priceText.replace('$', '').split(' ')[0]);
      const url = $(elem).find('a.s-item__link').attr('href');

      if (title.toLowerCase().includes(cardName.toLowerCase()) && price) {
        if (!lowestPrice || price < lowestPrice) {
          lowestPrice = price;
          lowestUrl = url;
        }
      }
    });

    if (lowestPrice && lowestUrl) {
      return {
        retailer: 'eBay',
        name: cardName,
        price: lowestPrice,
        url: lowestUrl,
        condition: 'Unknown',
      };
    }

    return null;
  } catch (error) {
    console.error('eBay scrape error:', error.message);
    return null;
  }
}

/**
 * Get all prices for a card from multiple retailers
 */
export async function getAllPrices(cardName, setName) {
  console.log(`Fetching prices for: ${cardName}`);

  const prices = [];

  // Scrape TCGPlayer
  console.log('  Scraping TCGPlayer...');
  const tcgPrice = await scrapeTCGPlayer(cardName, setName);
  if (tcgPrice) prices.push(tcgPrice);
  await delay(DELAY_MS);

  // Scrape Cardmarket
  console.log('  Scraping Cardmarket...');
  const cmPrice = await scrapeCardmarket(cardName, setName);
  if (cmPrice) prices.push(cmPrice);
  await delay(DELAY_MS);

  // Scrape eBay
  console.log('  Scraping eBay...');
  const ebayPrice = await scrapeEBay(cardName, setName);
  if (ebayPrice) prices.push(ebayPrice);
  await delay(DELAY_MS);

  // Find cheapest
  if (prices.length > 0) {
    const cheapest = prices.reduce((min, current) => {
      const minPrice = min.currency === 'EUR' ? min.price * 1.1 : min.price; // Rough USD conversion
      const currPrice = current.currency === 'EUR' ? current.price * 1.1 : current.price;
      return currPrice < minPrice ? current : min;
    });

    return {
      cardName,
      prices,
      cheapest,
    };
  }

  return null;
}

/**
 * Example usage
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const cardName = process.argv[2] || 'Black Lotus';
  const setName = process.argv[3] || 'Limited Edition Alpha';

  getAllPrices(cardName, setName).then(result => {
    if (result) {
      console.log('\n=== Price Comparison ===');
      console.log(`Card: ${result.cardName}`);
      console.log('\nAll Prices:');
      result.prices.forEach(p => {
        console.log(`  ${p.retailer}: $${p.price} - ${p.url}`);
      });
      console.log(`\nCheapest: ${result.cheapest.retailer} - $${result.cheapest.price}`);
      console.log(`Link: ${result.cheapest.url}`);
    } else {
      console.log('No prices found');
    }
  });
}
