import { Product, PriceTrend } from '../types';

/**
 * Returns the 30-day price trend for a product.
 * Uses explicit product.priceTrend30d if provided, or computes a realistic
 * deterministic trend based on originalPrice / product characteristics.
 */
export function getProductPriceTrend(product: Product): PriceTrend {
  if (product.priceTrend30d) {
    return product.priceTrend30d;
  }

  // If product has originalPrice higher than current price, deduce a drop
  if (product.originalPrice && product.originalPrice > product.price) {
    // 30 days ago price was roughly halfway between originalPrice and current price
    const diff = product.originalPrice - product.price;
    const estPastPrice = Math.round(product.price + diff * 0.5);
    const amount = estPastPrice - product.price;
    const percentage = Number(((amount / estPastPrice) * 100).toFixed(1));

    return {
      direction: 'down',
      changeAmount: amount,
      changePercentage: percentage,
      previousPrice: estPastPrice,
      timeframe: '30 days',
    };
  }

  // Deterministic fallback based on product id
  const charSum = product.id
    .split('')
    .reduce((acc, c) => acc + c.charCodeAt(0), 0);

  if (charSum % 3 === 0) {
    // Slight rise
    const percent = 5.5 + (charSum % 4);
    const prev = Math.round(product.price / (1 + percent / 100));
    const amount = product.price - prev;
    return {
      direction: 'up',
      changeAmount: amount,
      changePercentage: Number(percent.toFixed(1)),
      previousPrice: prev,
      timeframe: '30 days',
    };
  } else {
    // Slight drop
    const percent = 7.0 + (charSum % 5);
    const prev = Math.round(product.price * (1 + percent / 100));
    const amount = prev - product.price;
    return {
      direction: 'down',
      changeAmount: amount,
      changePercentage: Number(percent.toFixed(1)),
      previousPrice: prev,
      timeframe: '30 days',
    };
  }
}
