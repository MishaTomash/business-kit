/**
 * Pure revenue model behind the calculator.
 * No DOM, no side effects → trivially unit-testable and reusable (e.g. in a
 * Telegram mini-app or a PDF quote generator later).
 *
 * Model (per month):
 *   payers      = traffic × payerRate
 *   stars:  gross = payers × ARPPU⭐ × payout$ × UAH/$
 *           costs = hosting + payers × API$ × UAH/$
 *   orders: gross = payers × avgOrder
 *           costs = hosting + gross × (1 − margin)      (cost of goods)
 *   net         = gross − costs
 *   payback     = price ÷ (net / 30)  days
 */

import type { MarketRates, Project, RevenueForecast } from '@/types';

const DAYS_PER_MONTH = 30;

export function forecast(
  project: Project,
  traffic: number,
  payerRate: number,
  rates: MarketRates,
): RevenueForecast {
  const payers = Math.round(traffic * payerRate);
  const econ = project.economics;

  let grossStars: number | null = null;
  let grossUah: number;
  let costsUah = project.monthlyUah;

  // Exhaustive switch over the discriminated union: adding a new economics
  // kind becomes a compile error here until it is handled.
  switch (econ.kind) {
    case 'stars': {
      grossStars = payers * econ.arppuStars;
      grossUah = grossStars * rates.starPayoutUsd * rates.uahPerUsd;
      costsUah += payers * econ.apiCostPerPayerUsd * rates.uahPerUsd;
      break;
    }
    case 'orders': {
      grossUah = payers * econ.avgOrderUah;
      costsUah += grossUah * (1 - econ.marginRate);
      break;
    }
    default: {
      const unreachable: never = econ;
      throw new Error(`Unknown economics kind: ${JSON.stringify(unreachable)}`);
    }
  }

  const netUah = grossUah - costsUah;
  const dailyNet = netUah / DAYS_PER_MONTH;
  const paybackDays = dailyNet > 0 ? Math.ceil(project.priceUah / dailyNet) : null;

  return {
    payers,
    grossStars,
    grossUah,
    costsUah,
    netUah,
    netYearUah: netUah * 12,
    paybackDays,
  };
}

/* -------------------------------------------------------------------------- */
/*  Logarithmic slider mapping                                                 */
/*  Traffic spans 50 → 5 000: a realistic range for a beginner's first months. */
/*  A log scale gives the small, achievable numbers most of the track.          */
/* -------------------------------------------------------------------------- */

export const TRAFFIC_MIN = 50;
export const TRAFFIC_MAX = 5_000;
/** Resolution of the underlying <input type="range">. */
export const SLIDER_STEPS = 1000;

const LOG_RANGE = Math.log(TRAFFIC_MAX / TRAFFIC_MIN);

/** Round to "human" numbers so the label never shows 1 237. */
function snapTraffic(value: number): number {
  const step = value < 300 ? 10 : value < 1000 ? 50 : 100;
  return Math.round(value / step) * step;
}

/** Slider position (0..SLIDER_STEPS) → traffic. */
export function sliderToTraffic(position: number): number {
  const ratio = position / SLIDER_STEPS;
  return snapTraffic(TRAFFIC_MIN * Math.exp(ratio * LOG_RANGE));
}

/** Traffic → slider position (0..SLIDER_STEPS). */
export function trafficToSlider(traffic: number): number {
  return Math.round((Math.log(traffic / TRAFFIC_MIN) / LOG_RANGE) * SLIDER_STEPS);
}

/**
 * Monthly visitors needed for net profit to reach zero (rounded up to a
 * "human" number). `null` when the product can never break even with these
 * assumptions (variable costs eat the whole margin).
 */
export function breakEvenTraffic(project: Project, rates: MarketRates): number | null {
  const econ = project.economics;
  let netPerVisitorUah: number;
  switch (econ.kind) {
    case 'stars':
      netPerVisitorUah =
        econ.payerRate * (econ.arppuStars * rates.starPayoutUsd - econ.apiCostPerPayerUsd) * rates.uahPerUsd;
      break;
    case 'orders':
      netPerVisitorUah = econ.payerRate * econ.avgOrderUah * econ.marginRate;
      break;
    default: {
      const unreachable: never = econ;
      throw new Error(`Unknown economics kind: ${JSON.stringify(unreachable)}`);
    }
  }
  if (netPerVisitorUah <= 0) return null;
  const raw = project.monthlyUah / netPerVisitorUah;
  const step = raw < 1000 ? 50 : 100;
  return Math.ceil(raw / step) * step;
}
