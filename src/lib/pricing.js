export const DAYS_PER_WEEK = 7;
export const DAYS_PER_MONTH = 30;

/**
 * @typedef {Object} BilledBreakdown
 * @property {number} months - Number of months actually billed
 * @property {number} weeks - Number of weeks actually billed
 * @property {number} days - Number of days actually billed
 * @property {boolean} capped - True when a whole extra month was cheaper than the leftover weeks/days
 * @property {number} total - Price for ONE unit of the item over the whole rental period
 */

/**
 * Price per day, derived from the weekly price.
 * @param {number} weeklyPrice
 * @returns {number}
 */
export function calculateDailyPrice(weeklyPrice) {
  return Math.round(weeklyPrice / DAYS_PER_WEEK);
}

/**
 * Split a rental length into calendar tiers. A month is a fixed block of 30 days.
 * @param {number} rentalDays
 * @returns {{months: number, weeks: number, days: number}}
 */
export function splitDuration(rentalDays) {
  const months = Math.floor(rentalDays / DAYS_PER_MONTH);
  const remainder = rentalDays % DAYS_PER_MONTH;
  return {
    months,
    weeks: Math.floor(remainder / DAYS_PER_WEEK),
    days: remainder % DAYS_PER_WEEK,
  };
}

/**
 * Price one unit of an item for the whole rental period.
 *
 * The rental is split into months, then weeks, then days. Because the monthly
 * rate is discounted, the leftover weeks and days can add up to more than one
 * extra month - in that case the customer is charged the extra month instead,
 * so the price never goes up as the rental gets shorter.
 *
 * @param {{price: number, PricePerMonth?: number}} item
 * @param {number} rentalDays
 * @returns {BilledBreakdown}
 */
export function priceItem(item, rentalDays) {
  const weeklyPrice = item.price;
  const monthlyPrice = item.PricePerMonth;
  const dailyPrice = calculateDailyPrice(weeklyPrice);

  // Items without a monthly rate stay on plain daily pricing
  if (!monthlyPrice) {
    return {
      months: 0,
      weeks: 0,
      days: rentalDays,
      capped: false,
      total: dailyPrice * rentalDays,
    };
  }

  const { months, weeks, days } = splitDuration(rentalDays);
  const tieredTotal =
    months * monthlyPrice + weeks * weeklyPrice + days * dailyPrice;
  const nextMonthTotal = (months + 1) * monthlyPrice;

  if (nextMonthTotal < tieredTotal) {
    return {
      months: months + 1,
      weeks: 0,
      days: 0,
      capped: true,
      total: nextMonthTotal,
    };
  }

  return { months, weeks, days, capped: false, total: tieredTotal };
}

/**
 * Human readable tier list, e.g. "1 month 1 week 2 days".
 * @param {{months: number, weeks: number, days: number}} breakdown
 * @returns {string}
 */
export function formatBreakdown({ months, weeks, days }) {
  const parts = [];
  if (months > 0) parts.push(`${months} ${months === 1 ? "month" : "months"}`);
  if (weeks > 0) parts.push(`${weeks} ${weeks === 1 ? "week" : "weeks"}`);
  if (days > 0) parts.push(`${days} ${days === 1 ? "day" : "days"}`);
  if (parts.length === 0) parts.push("0 days");
  return parts.join(" ");
}
