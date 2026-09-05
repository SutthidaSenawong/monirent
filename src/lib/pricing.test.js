import { describe, expect, it } from "vitest";
import {
  calculateDailyPrice,
  formatBreakdown,
  priceItem,
  splitDuration,
} from "./pricing";

// Every weekly / monthly pair currently in the shop, monthly-to-weekly
// ratios from 2.50 (chairs, mice) up to 4.00 (MX Keyboard)
const CATALOG = [
  { name: "LG 27 Full HD", price: 300, PricePerMonth: 900 },
  { name: "Samsung 55 4K TV", price: 800, PricePerMonth: 2200 },
  { name: "Xiaomi 34 4K", price: 750, PricePerMonth: 2000 },
  { name: "Logitech M331", price: 50, PricePerMonth: 150 },
  { name: "PlayStation 5", price: 1200, PricePerMonth: 3600 },
  { name: "Magic Mouse", price: 200, PricePerMonth: 500 },
  { name: "MSI 24.5 Full HD", price: 200, PricePerMonth: 750 },
  { name: "MX Keyboard", price: 200, PricePerMonth: 800 },
  { name: "HARU chair", price: 400, PricePerMonth: 1000 },
  { name: "Manual table", price: 300, PricePerMonth: 800 },
  { name: "Electric desk", price: 350, PricePerMonth: 1000 },
];

describe("priceItem", () => {
  it("bills 30 days as exactly one month", () => {
    for (const item of CATALOG) {
      const billed = priceItem(item, 30);
      expect(billed.total, item.name).toBe(item.PricePerMonth);
      expect(billed).toMatchObject({ months: 1, weeks: 0, days: 0 });
    }
  });

  it("bills 60 days as exactly two months", () => {
    for (const item of CATALOG) {
      const billed = priceItem(item, 60);
      expect(billed.total, item.name).toBe(item.PricePerMonth * 2);
      expect(billed).toMatchObject({ months: 2, weeks: 0, days: 0 });
    }
  });

  it("adds leftover weeks and days on top of whole months", () => {
    const item = { price: 200, PricePerMonth: 500 };
    expect(priceItem(item, 31)).toMatchObject({
      months: 1,
      weeks: 0,
      days: 1,
      total: 500 + 29,
    });
    expect(priceItem(item, 37)).toMatchObject({
      months: 1,
      weeks: 1,
      days: 0,
      total: 500 + 200,
    });
    expect(priceItem(item, 39)).toMatchObject({
      months: 1,
      weeks: 1,
      days: 2,
      total: 500 + 200 + 58,
    });
  });

  it("charges a whole month when the leftover days cost more than one", () => {
    const item = { price: 200, PricePerMonth: 500 };
    // 29 days of weeks and days would be 800 + 29 = 829, a month is 500
    expect(priceItem(item, 29)).toMatchObject({
      months: 1,
      weeks: 0,
      days: 0,
      capped: true,
      total: 500,
    });
    // same one month up, past the first month boundary
    expect(priceItem(item, 59)).toMatchObject({
      months: 2,
      capped: true,
      total: 1000,
    });
  });

  it("never charges more than the next whole month", () => {
    for (const item of CATALOG) {
      for (let days = 1; days <= 70; days++) {
        const ceilingMonths = Math.floor(days / 30) + 1;
        expect(
          priceItem(item, days).total,
          `${item.name} at ${days} days`
        ).toBeLessThanOrEqual(ceilingMonths * item.PricePerMonth);
      }
    }
  });

  it("never gets cheaper as the rental gets longer", () => {
    for (const item of CATALOG) {
      let previous = 0;
      for (let days = 1; days <= 70; days++) {
        const total = priceItem(item, days).total;
        expect(total, `${item.name} at ${days} days`).toBeGreaterThanOrEqual(
          previous
        );
        previous = total;
      }
    }
  });

  it("falls back to daily pricing for items with no monthly rate", () => {
    const item = { price: 700 };
    expect(priceItem(item, 45)).toMatchObject({
      months: 0,
      weeks: 0,
      days: 45,
      capped: false,
      total: 100 * 45,
    });
  });
});

describe("splitDuration", () => {
  it("uses 30 day months", () => {
    expect(splitDuration(29)).toEqual({ months: 0, weeks: 4, days: 1 });
    expect(splitDuration(30)).toEqual({ months: 1, weeks: 0, days: 0 });
    expect(splitDuration(37)).toEqual({ months: 1, weeks: 1, days: 0 });
    expect(splitDuration(69)).toEqual({ months: 2, weeks: 1, days: 2 });
  });
});

describe("formatBreakdown", () => {
  it("lists only the tiers that are billed", () => {
    expect(formatBreakdown({ months: 1, weeks: 0, days: 0 })).toBe("1 month");
    expect(formatBreakdown({ months: 2, weeks: 1, days: 2 })).toBe(
      "2 months 1 week 2 days"
    );
    expect(formatBreakdown({ months: 0, weeks: 0, days: 1 })).toBe("1 day");
    expect(formatBreakdown({ months: 0, weeks: 0, days: 0 })).toBe("0 days");
  });
});

describe("calculateDailyPrice", () => {
  it("is the weekly price divided by seven, rounded", () => {
    expect(calculateDailyPrice(700)).toBe(100);
    expect(calculateDailyPrice(200)).toBe(29);
    expect(calculateDailyPrice(50)).toBe(7);
  });
});
