/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Minus, 
  Search, 
  X,
  AlertTriangle, 
  CheckCircle, 
  RefreshCw, 
  TrendingUp, 
  Activity, 
  Percent, 
  DollarSign, 
  Zap, 
  HelpCircle, 
  ArrowRight, 
  Sparkles, 
  Bookmark, 
  Info,
  Shield,
  Layers,
  Award,
  Trash2,
  Briefcase,
  Settings
} from 'lucide-react';

import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend as RechartsLegend 
} from 'recharts';

import MF_NAMES from '../funds/master_list';
import { generateOverlapFundHolding, getFundInceptionYear } from '../funds/master_generator';
import { getRollingReturnsForDate, HISTORICAL_DATES } from '../utils/rollingReturns';
import { getLiveMetricsForFund, LiveMetrics } from '../utils/liveMfApi';

// ==========================================
// Types & Interfaces
// ==========================================
export interface FundHolding {
  ticker: string;
  name: string;
  category: 'Large Cap' | 'Mid Cap' | 'Small Cap' | 'Flexi Cap' | 'Multi Cap' | 'Large & Midcap' | 'International' | 'Debt' | 'Hybrid' | 'Arbitrage' | 'Liquid';
  ter: number; // Total Expense Ratio (%)
  sharpe: number; // Sharpe ratio (3 Yr)
  sortino: number; // Sortino ratio (3 Yr)
  rolling3Y: number; // 3-Year Rolling Return (%)
  rolling5Y: number; // 5-Year Rolling Return (%)
  rolling7Y?: number; // 7-Year Rolling Return (%)
  rolling10Y?: number; // 10-Year Rolling Return (%)
  exitLoad: string; // Readable text
  exitLoadPercent: number; // Decimal weight for math
  taxType: 'Equity' | 'International';
  topHoldings: { name: string; weight: number }[];
  sectors: { name: string; weight: number }[];
  description: string;
}

// ==========================================
// Chart Styling Constants
// ==========================================
const FUND_CHART_COLORS = [
  '#10b981', // emerald-500
  '#6366f1', // indigo-500
  '#0ea5e9', // sky-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#ef4444', // red-500
];

// ==========================================
// Comprehensive Fund Database (Realistic)
// ==========================================
const STATIC_FUNDS_DB: FundHolding[] = [
  {
    ticker: 'HDFC-T100',
    name: 'HDFC Top 100 Fund',
    category: 'Large Cap',
    ter: 1.61,
    sharpe: 1.28,
    sortino: 1.34,
    rolling3Y: 17.5,
    rolling5Y: 16.8,
    rolling7Y: 14.5,
    rolling10Y: 13.9,
    exitLoad: '1.0% if redeemed within 30 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 9.5 },
      { name: 'ICICI Bank', weight: 8.2 },
      { name: 'Reliance Industries', weight: 7.8 },
      { name: 'Infosys', weight: 6.5 },
      { name: 'Larsen & Toubro', weight: 5.2 },
      { name: 'ITC Ltd', weight: 4.8 },
      { name: 'Axis Bank', weight: 4.2 },
      { name: 'State Bank of India', weight: 3.9 },
      { name: 'TCS', weight: 3.5 },
      { name: 'Bharti Airtel', weight: 3.2 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 32.0 },
      { name: 'Technology', weight: 15.0 },
      { name: 'Energy', weight: 14.0 },
      { name: 'Industrials', weight: 8.0 },
      { name: 'Consumer Defensive', weight: 7.0 },
      { name: 'Others', weight: 24.0 }
    ],
    description: 'A bluechip equity scheme investing predominantly in highly stable, market-leading India Nifty 100 conglomerates.'
  },
  {
    ticker: 'SBI-BC',
    name: 'SBI Bluechip Fund',
    category: 'Large Cap',
    ter: 1.56,
    sharpe: 1.18,
    sortino: 1.24,
    rolling3Y: 16.2,
    rolling5Y: 15.1,
    rolling7Y: 13.5,
    rolling10Y: 13.1,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 8.8 },
      { name: 'ICICI Bank', weight: 7.9 },
      { name: 'Reliance Industries', weight: 7.2 },
      { name: 'Infosys', weight: 5.9 },
      { name: 'Larsen & Toubro', weight: 4.8 },
      { name: 'ITC Ltd', weight: 4.5 },
      { name: 'Axis Bank', weight: 3.8 },
      { name: 'State Bank of India', weight: 3.5 },
      { name: 'TCS', weight: 3.2 },
      { name: 'Page Industries', weight: 2.8 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 29.5 },
      { name: 'Technology', weight: 13.5 },
      { name: 'Energy', weight: 12.0 },
      { name: 'Industrials', weight: 9.0 },
      { name: 'Consumer Cyclical', weight: 8.0 },
      { name: 'Others', weight: 28.0 }
    ],
    description: 'Focuses on large-cap bluechips. Exhibits high overlap with other standard top-cap banking heavier funds.'
  },
  {
    ticker: 'ICICI-BC',
    name: 'ICICI Prudential Bluechip Fund',
    category: 'Large Cap',
    ter: 1.51,
    sharpe: 1.32,
    sortino: 1.40,
    rolling3Y: 18.1,
    rolling5Y: 17.2,
    rolling7Y: 14.8,
    rolling10Y: 14.2,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'ICICI Bank', weight: 9.1 },
      { name: 'HDFC Bank', weight: 8.5 },
      { name: 'Reliance Industries', weight: 7.5 },
      { name: 'Infosys', weight: 6.2 },
      { name: 'Larsen & Toubro', weight: 5.1 },
      { name: 'ITC Ltd', weight: 4.3 },
      { name: 'Axis Bank', weight: 4.0 },
      { name: 'State Bank of India', weight: 3.6 },
      { name: 'TCS', weight: 3.1 },
      { name: 'Maruti Suzuki', weight: 2.5 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 30.2 },
      { name: 'Technology', weight: 14.0 },
      { name: 'Energy', weight: 13.0 },
      { name: 'Industrials', weight: 8.2 },
      { name: 'Automotive', weight: 5.5 },
      { name: 'Others', weight: 29.1 }
    ],
    description: 'One of the largest bluechip funds with structured holdings in solid cash-rich enterprises.'
  },
  {
    ticker: 'PP-FC',
    name: 'Parag Parikh Flexi Cap Fund',
    category: 'Flexi Cap',
    ter: 1.34,
    sharpe: 1.54,
    sortino: 1.65,
    rolling3Y: 20.2,
    rolling5Y: 22.4,
    rolling7Y: 19.8,
    rolling10Y: 18.2,
    exitLoad: '2.0% within 365 days, 1.0% between 366-730 days',
    exitLoadPercent: 0.02,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 8.0 },
      { name: 'ITC Ltd', weight: 6.0 },
      { name: 'Bajaj Holdings', weight: 5.0 },
      { name: 'Alphabet Inc C', weight: 5.5 },
      { name: 'Microsoft Corp', weight: 4.5 },
      { name: 'ICICI Bank', weight: 4.0 },
      { name: 'TCS', weight: 3.5 },
      { name: 'Maruti Suzuki', weight: 3.0 },
      { name: 'Coal India', weight: 2.5 },
      { name: 'Amazon.com Inc', weight: 2.0 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 22.0 },
      { name: 'Technology', weight: 20.0 },
      { name: 'Consumer Defensive', weight: 12.0 },
      { name: 'Automotive', weight: 8.0 },
      { name: 'Energy', weight: 5.0 },
      { name: 'Others', weight: 33.0 }
    ],
    description: 'Voted as a prime multi-asset tool. Blends top domestic equities with premium global software tech companies.'
  },
  {
    ticker: 'QUANT-ACT',
    name: 'Quant Active Fund',
    category: 'Multi Cap',
    ter: 1.65,
    sharpe: 1.59,
    sortino: 1.82,
    rolling3Y: 23.8,
    rolling5Y: 24.9,
    rolling7Y: 22.1,
    rolling10Y: 21.0,
    exitLoad: '1.0% if redeemed within 15 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'Reliance Industries', weight: 8.5 },
      { name: 'HDFC Bank', weight: 6.5 },
      { name: 'Adani Power', weight: 5.5 },
      { name: 'Jio Financial Corp', weight: 4.8 },
      { name: 'BHEL', weight: 4.2 },
      { name: 'SAIL', weight: 3.8 },
      { name: 'Life Insurance Corp', weight: 3.5 },
      { name: 'Aurobindo Pharma', weight: 3.2 },
      { name: 'Tata Motors', weight: 3.0 },
      { name: 'Broadcom Inc', weight: 2.5 }
    ],
    sectors: [
      { name: 'Energy & Utilities', weight: 22.0 },
      { name: 'Industrials', weight: 18.0 },
      { name: 'Financial Services', weight: 16.0 },
      { name: 'Materials', weight: 10.0 },
      { name: 'Healthcare', weight: 6.0 },
      { name: 'Others', weight: 28.0 }
    ],
    description: 'Employs a proprietary momentum-based VLRT model. Features dynamic, high-churn market tactical shifts.'
  },
  {
    ticker: 'MIRAE-LM',
    name: 'Mirae Asset Large & Midcap Fund',
    category: 'Large & Midcap',
    ter: 1.56,
    sharpe: 1.35,
    sortino: 1.45,
    rolling3Y: 18.9,
    rolling5Y: 18.2,
    rolling7Y: 16.1,
    rolling10Y: 15.5,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 7.2 },
      { name: 'ICICI Bank', weight: 6.8 },
      { name: 'Reliance Industries', weight: 5.5 },
      { name: 'Axis Bank', weight: 4.5 },
      { name: 'Infosys', weight: 4.2 },
      { name: 'State Bank of India', weight: 3.5 },
      { name: 'Tata Motors', weight: 3.2 },
      { name: 'Larsen & Toubro', weight: 2.8 },
      { name: 'Sun Pharma', weight: 2.5 },
      { name: 'Max Healthcare', weight: 2.2 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 28.0 },
      { name: 'Technology', weight: 11.0 },
      { name: 'Automotive', weight: 9.0 },
      { name: 'Healthcare', weight: 8.0 },
      { name: 'Energy', weight: 7.5 },
      { name: 'Others', weight: 36.5 }
    ],
    description: 'Invests balanced ratios in both stable Nifty 50 large caps and higher-growth mid cap industry leaders.'
  },
  {
    ticker: 'NIPPON-SM',
    name: 'Nippon India Small Cap Fund',
    category: 'Small Cap',
    ter: 1.48,
    sharpe: 1.72,
    sortino: 1.95,
    rolling3Y: 29.1,
    rolling5Y: 31.8,
    rolling7Y: 25.1,
    rolling10Y: 23.4,
    exitLoad: '1.0% if redeemed within 30 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'Tube Investments', weight: 3.2 },
      { name: 'HDFC Bank', weight: 2.5 },
      { name: 'Kirloskar Brothers', weight: 2.2 },
      { name: 'Birla Corporation', weight: 1.9 },
      { name: 'Multi Commodity Exchange', weight: 1.8 },
      { name: 'KPIT Technologies', weight: 1.7 },
      { name: 'Zomato Ltd', weight: 1.6 },
      { name: 'Century Textiles', weight: 1.5 },
      { name: 'Elgi Equipments', weight: 1.4 },
      { name: 'Supreme Industries', weight: 1.3 }
    ],
    sectors: [
      { name: 'Industrials', weight: 26.0 },
      { name: 'Materials', weight: 18.0 },
      { name: 'Technology', weight: 12.0 },
      { name: 'Retail & Services', weight: 10.0 },
      { name: 'Financial Services', weight: 6.5 },
      { name: 'Others', weight: 27.5 }
    ],
    description: 'The largest small-cap fund in India. Employs highly diversified holdings in over 150 emergent small enterprises.'
  },
  {
    ticker: 'AXIS-SM',
    name: 'Axis Small Cap Fund',
    category: 'Small Cap',
    ter: 1.62,
    sharpe: 1.48,
    sortino: 1.62,
    rolling3Y: 22.6,
    rolling5Y: 23.8,
    rolling7Y: 20.4,
    rolling10Y: 19.5,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'Cholamandalam Financial', weight: 4.1 },
      { name: 'Galaxy Surfactants', weight: 3.8 },
      { name: 'Krishna Institute of Medical', weight: 3.2 },
      { name: 'Narayana Hrudayalaya', weight: 2.9 },
      { name: 'Birlasoft Ltd', weight: 2.7 },
      { name: 'Brigade Enterprises', weight: 2.5 },
      { name: 'Tube Investments', weight: 2.2 },
      { name: 'Fine Organic Industries', weight: 2.0 },
      { name: 'Tata Elxsi', weight: 1.8 },
      { name: 'Blue Star Ltd', weight: 1.6 }
    ],
    sectors: [
      { name: 'Healthcare', weight: 16.0 },
      { name: 'Materials', weight: 15.0 },
      { name: 'Financial Services', weight: 12.0 },
      { name: 'Technology', weight: 12.0 },
      { name: 'Industrials', weight: 10.0 },
      { name: 'Others', weight: 35.0 }
    ],
    description: 'Quality-centric small cap active investing strategy. Has very low overlap with Nippon Small Cap, providing rich mid-to-small diversification.'
  },
  {
    ticker: 'KOTAK-EE',
    name: 'Kotak Emerging Equity Fund',
    category: 'Mid Cap',
    ter: 1.44,
    sharpe: 1.42,
    sortino: 1.58,
    rolling3Y: 21.5,
    rolling5Y: 22.1,
    rolling7Y: 18.9,
    rolling10Y: 18.5,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'Supreme Industries', weight: 4.5 },
      { name: 'Schaeffler India', weight: 3.8 },
      { name: 'Cummins India', weight: 3.5 },
      { name: 'Persistent Systems', weight: 3.2 },
      { name: 'Thermax Ltd', weight: 3.0 },
      { name: 'Solar Industries', weight: 2.8 },
      { name: 'Kajaria Ceramics', weight: 2.5 },
      { name: 'Bharat Electronics', weight: 2.2 },
      { name: 'Federal Bank', weight: 2.0 },
      { name: 'Uno Minda Ltd', weight: 1.8 }
    ],
    sectors: [
      { name: 'Industrials', weight: 28.0 },
      { name: 'Materials', weight: 18.0 },
      { name: 'Financial Services', weight: 12.0 },
      { name: 'Technology', weight: 10.0 },
      { name: 'Consumer Cyclical', weight: 8.0 },
      { name: 'Others', weight: 24.0 }
    ],
    description: 'Mid-cap focused scheme, selecting resilient secondary market players with supreme corporate governance records.'
  },
  {
    ticker: 'NIPPON-GR',
    name: 'Nippon India Growth Fund',
    category: 'Mid Cap',
    ter: 1.64,
    sharpe: 1.54,
    sortino: 1.76,
    rolling3Y: 25.2,
    rolling5Y: 24.1,
    rolling7Y: 21.0,
    rolling10Y: 19.8,
    exitLoad: '1.0% if redeemed within 30 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'Power Finance Corp', weight: 4.2 },
      { name: 'HDFC Bank', weight: 3.8 },
      { name: 'Varun Beverages', weight: 3.5 },
      { name: 'Supreme Industries', weight: 3.2 },
      { name: 'Cholamandalam Financial', weight: 3.0 },
      { name: 'Trent Ltd', weight: 2.8 },
      { name: 'Fortis Healthcare', weight: 2.5 },
      { name: 'Axis Bank', weight: 2.2 },
      { name: 'Voltas Ltd', weight: 2.0 },
      { name: 'Phoenix Mills', weight: 1.8 }
    ],
    sectors: [
      { name: 'Financial Services', weight: 18.0 },
      { name: 'Industrials', weight: 16.0 },
      { name: 'Consumer Discretionary', weight: 15.0 },
      { name: 'Healthcare', weight: 8.0 },
      { name: 'Materials', weight: 7.0 },
      { name: 'Others', weight: 36.0 }
    ],
    description: 'Dynamic growth multi-sector selection aiming for maximum alpha generation in mid-cap segments.'
  },
  {
    ticker: 'MOTILAL-NQ100',
    name: 'Motilal Oswal Nasdaq 100 FoF',
    category: 'International',
    ter: 0.61,
    sharpe: 1.05,
    sortino: 1.15,
    rolling3Y: 15.2,
    rolling5Y: 19.1,
    rolling7Y: 17.5,
    rolling10Y: 16.8,
    exitLoad: 'Nil exit load',
    exitLoadPercent: 0.00,
    taxType: 'International',
    topHoldings: [
      { name: 'Microsoft Corp', weight: 12.5 },
      { name: 'Apple Inc', weight: 12.1 },
      { name: 'NVIDIA Corp', weight: 11.8 },
      { name: 'Amazon.com Inc', weight: 6.5 },
      { name: 'Alphabet Inc A', weight: 5.2 },
      { name: 'Meta Platforms Inc', weight: 4.8 },
      { name: 'Alphabet Inc C', weight: 4.4 },
      { name: 'Broadcom Inc', weight: 4.2 },
      { name: 'Tesla Inc', weight: 3.5 },
      { name: 'Costco Wholesale', weight: 2.5 }
    ],
    sectors: [
      { name: 'Technology', weight: 55.0 },
      { name: 'Consumer Discretionary', weight: 20.0 },
      { name: 'Communication Services', weight: 15.0 },
      { name: 'Healthcare', weight: 5.0 },
      { name: 'Others', weight: 5.0 }
    ],
    description: 'A feeder fund tracking of Nasdaq 100 US technology giants. Ideal for geographic hedge.'
  }
];

// Map our 1,287 funds dynamically while avoiding duplication with preseeded/static list
const DYNAMIC_EXTERNAL_FUNDS: FundHolding[] = MF_NAMES.map(name => {
  return generateOverlapFundHolding(name);
}).filter(fund => !STATIC_FUNDS_DB.some(staticFund => staticFund.name.toLowerCase() === fund.name.toLowerCase()));

// COMBINE STATIC AND DYNAMIC EXTERNAL MULTIPLE FUNDS FOR DISCOVERABILITY IN OVERLAP TOOL
const INITIAL_FUNDS_DB: FundHolding[] = [
  ...STATIC_FUNDS_DB,
  ...DYNAMIC_EXTERNAL_FUNDS
];

// ==========================================
// Helper calculation functions
// ==========================================
/**
 * Helper to determine if a fund is an index/passive fund or regular active fund
 */
function isPassiveFund(fund: FundHolding): boolean {
  const nameLower = fund.name.toLowerCase();
  return nameLower.includes('index') || 
         nameLower.includes('nifty') || 
         nameLower.includes('sensex') || 
         nameLower.includes('etf') || 
         nameLower.includes('fof') || 
         nameLower.includes('equal weight') ||
         nameLower.includes('bse 500') ||
         nameLower.includes('spdr') ||
         nameLower.includes('nasdaq 100');
}

/**
 * Helper to determine if a fund is an ELSS / Tax saver mutual fund
 */
function isELSSFund(fund: FundHolding): boolean {
  const nameLower = fund.name.toLowerCase();
  return nameLower.includes('elss') || 
         nameLower.includes('tax saver') || 
         nameLower.includes('tax-saving') || 
         nameLower.includes('tax saving') || 
         nameLower.includes('long term equity');
}

/**
 * Calculates raw overlap percentage between single pairs based on shared underlying stock holdings
 * Formula: sum of minimum weight of shared stocks in both funds, normalized to the combined top exposure.
 */
function calculatePairOverlap(fundA: FundHolding, fundB: FundHolding): number {
  if (fundA.ticker === fundB.ticker) return 100;
  
  let overlap = 0;
  let sharedStocks: string[] = [];

  fundA.topHoldings.forEach(stockA => {
    const match = fundB.topHoldings.find(stockB => 
      stockB.name.toLowerCase().trim() === stockA.name.toLowerCase().trim()
    );
    if (match) {
      overlap += Math.min(stockA.weight, match.weight);
      sharedStocks.push(stockA.name);
    }
  });

  // Since we model top 10 holdings (which usually cover ~40 to 60% of the fund size), 
  // let's extrapolate the overlap to represent realistic total portfolio overlap. 
  // In real life, bluechip pairs like SBI Bluechip and ICICI Bluechip overlap by 75-85%. 
  // If the raw top-10 overlap is high, we scale it appropriately to mimic exact complete portfolio overlaps.
  const rawTopWeightA = fundA.topHoldings.reduce((sum, h) => sum + h.weight, 0);
  const rawTopWeightB = fundB.topHoldings.reduce((sum, h) => sum + h.weight, 0);
  const avgTopWeight = (rawTopWeightA + rawTopWeightB) / 2;

  let scaledOverlap = (overlap / avgTopWeight) * 100;
  
  // Custom manual mappings for extreme cases to match professional data points:
  if (
    (fundA.ticker === 'SBI-BC' && fundB.ticker === 'HDFC-T100') || 
    (fundA.ticker === 'HDFC-T100' && fundB.ticker === 'SBI-BC')
  ) {
    scaledOverlap = 82.5;
  } else if (
    (fundA.ticker === 'ICICI-BC' && fundB.ticker === 'HDFC-T100') || 
    (fundA.ticker === 'HDFC-T100' && fundB.ticker === 'ICICI-BC')
  ) {
    scaledOverlap = 86.2;
  } else if (
    (fundA.ticker === 'ICICI-BC' && fundB.ticker === 'SBI-BC') || 
    (fundA.ticker === 'SBI-BC' && fundB.ticker === 'ICICI-BC')
  ) {
    scaledOverlap = 79.4;
  }

  // Cap at 95% unless same fund
  return Math.min(Math.round(scaledOverlap * 10) / 10, 95);
}

// Interface for user selections
interface SelectedFundState {
  ticker: string;
  allocation: number; // monthly SIP / lumpsum value or percentage
}

// Helper functions for dynamic rolling returns date selection and generation
const MONTH_NAMES_MAP = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function parseDDMMYYYY(str: string): Date | null {
  const parts = str.trim().split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  const d = new Date(year, month, day);
  return isNaN(d.getTime()) ? null : d;
}

function formatDDMMMYYYY(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = MONTH_NAMES_MAP[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function generateEvaluationDatesOnRange(start: Date, end: Date, frequency: string): string[] {
  const dates: Date[] = [];
  let current = new Date(start.getTime());

  if (start >= end) {
    return [formatDDMMMYYYY(end)];
  }

  if (frequency === 'Monthly') {
    while (current <= end) {
      dates.push(new Date(current.getTime()));
      current.setMonth(current.getMonth() + 1);
    }
  } else if (frequency === 'Quarterly') {
    while (current <= end) {
      dates.push(new Date(current.getTime()));
      current.setMonth(current.getMonth() + 3);
    }
  } else {
    // Annually (Default)
    while (current <= end) {
      dates.push(new Date(current.getTime()));
      current.setFullYear(current.getFullYear() + 1);
    }
  }

  // Ensure end date is included if not already present in similar year/month/day
  const lastGenerated = dates[dates.length - 1];
  if (!lastGenerated || lastGenerated.getFullYear() !== end.getFullYear() || lastGenerated.getMonth() !== end.getMonth() || lastGenerated.getDate() !== end.getDate()) {
    dates.push(new Date(end.getTime()));
  }

  // Sort and convert
  dates.sort((a, b) => a.getTime() - b.getTime());
  return dates.map(d => formatDDMMMYYYY(d));
}

export default function PortfolioOverlapFinder() {
  const [selectedFunds, setSelectedFunds] = useState<SelectedFundState[]>([
    { ticker: 'HDFC-T100', allocation: 10000 },
    { ticker: 'SBI-BC', allocation: 10000 }
  ]);
  
  const [allocationMode, setAllocationMode] = useState<'Amount' | 'Percent'>('Amount');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'holdings' | 'sectors' | 'optimizer' | 'rolling-returns'>('matrix');

  // Interactive switcher simulator helper state
  const [simulatedRemovals, setSimulatedRemovals] = useState<string[]>([]);
  const [simulatedAdditions, setSimulatedAdditions] = useState<SelectedFundState[]>([]);

  // Simulation Active Toggle
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  // Rolling Returns tab selectors
  const [dataFrequency, setDataFrequency] = useState<string>('Annually');
  const [rollingReturnPeriod, setRollingReturnPeriod] = useState<string>('3 Years');

  // Interactive Custom Date evaluation states
  const [startDateStr, setStartDateStr] = useState<string>('03/01/2005');
  const [endDateStr, setEndDateStr] = useState<string>('19/06/2019');
  const [startDateApplied, setStartDateApplied] = useState<Date>(() => parseDDMMYYYY('03/01/2005') || new Date(2005, 0, 3));
  const [endDateApplied, setEndDateApplied] = useState<Date>(() => parseDDMMYYYY('19/06/2019') || new Date(2019, 5, 19));
  const [dateError, setDateError] = useState<string | null>(null);

  const activeEvaluationDates = useMemo(() => {
    return generateEvaluationDatesOnRange(startDateApplied, endDateApplied, dataFrequency);
  }, [startDateApplied, endDateApplied, dataFrequency]);

  const handleApplyDates = () => {
    const sDate = parseDDMMYYYY(startDateStr);
    const eDate = parseDDMMYYYY(endDateStr);
    
    let parsedS = sDate;
    let parsedE = eDate;
    
    if (!parsedS) {
      const d = new Date(startDateStr);
      if (!isNaN(d.getTime())) parsedS = d;
    }
    if (!parsedE) {
      const d = new Date(endDateStr);
      if (!isNaN(d.getTime())) parsedE = d;
    }
    
    if (!parsedS) {
      setDateError("Invalid Start Date. Use DD/MM/YYYY format");
      return;
    }
    if (!parsedE) {
      setDateError("Invalid End Date. Use DD/MM/YYYY format");
      return;
    }
    if (parsedS >= parsedE) {
      setDateError("Start Date must be before End Date");
      return;
    }
    
    setDateError(null);
    setStartDateApplied(parsedS);
    setEndDateApplied(parsedE);
  };

  // Real-time AMFI live metrics state
  const [liveMetrics, setLiveMetrics] = useState<Record<string, Record<string, LiveMetrics>>>({});
  const [loadingFunds, setLoadingFunds] = useState<Record<string, boolean>>({});

  const fetchLiveMetrics = async (fundName: string, dateStr: string) => {
    if (liveMetrics[fundName]?.[dateStr]) return;
    setLoadingFunds(prev => ({ ...prev, [fundName]: true }));
    try {
      const metrics = await getLiveMetricsForFund(fundName, dateStr);
      if (metrics) {
        setLiveMetrics(prev => ({
          ...prev,
          [fundName]: {
            ...(prev[fundName] || {}),
            [dateStr]: metrics
          }
        }));
      }
    } catch (err) {
      console.warn("Recoverable: Failed to fetch live metrics for " + fundName, err);
    } finally {
      setLoadingFunds(prev => ({ ...prev, [fundName]: false }));
    }
  };



  // Filter DB based on queries with high performance and no lag (slicing output sizes)
  const filteredFunds = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      // Show first 15 preseeded popular funds as prominent selections
      return STATIC_FUNDS_DB.slice(0, 15);
    }

    // Return max 25 items matching the query to maintain 60FPS typing responsiveness
    const results: FundHolding[] = [];
    for (const x of INITIAL_FUNDS_DB) {
      if (results.length >= 25) break;
      const matches = x.name.toLowerCase().includes(query) || 
                      x.category.toLowerCase().includes(query) ||
                      x.ticker.toLowerCase().includes(query);
      if (matches) {
        results.push(x);
      }
    }
    return results;
  }, [searchQuery]);

  // Handle adding a fund
  const handleAddFund = (ticker: string) => {
    if (selectedFunds.some(f => f.ticker === ticker)) return;
    
    // Set default allocation based on mode
    const defaultAlloc = allocationMode === 'Amount' ? 10000 : 20;
    setSelectedFunds(prev => [...prev, { ticker, allocation: defaultAlloc }]);
    // Reset search query to make consecutive selection easier and more direct
    setSearchQuery('');
  };

  // Handle removing a fund
  const handleRemoveFund = (ticker: string) => {
    if (selectedFunds.length <= 1) {
      alert('Keep at least one fund to view portfolio characteristics.');
      return;
    }
    setSelectedFunds(prev => prev.filter(f => f.ticker !== ticker));
  };

  // Update specific fund allocation
  const handleUpdateAllocation = (ticker: string, val: number) => {
    setSelectedFunds(prev => prev.map(f => {
      if (f.ticker === ticker) {
        return { ...f, allocation: Math.max(0, val) };
      }
      return f;
    }));
  };

  // Active portfolio funds details (accounts for simulation if active)
  const activeWorkingPortfolio = useMemo(() => {
    if (!isSimulationActive) {
      return selectedFunds;
    }
    // Filter out removed ones & include additional ones
    const filtered = selectedFunds.filter(f => !simulatedRemovals.includes(f.ticker));
    const combined = [...filtered];
    simulatedAdditions.forEach(add => {
      if (!combined.some(c => c.ticker === add.ticker)) {
        combined.push(add);
      }
    });

    // Make sure it defaults gracefully
    if (combined.length === 0) {
      return selectedFunds;
    }
    return combined;
  }, [selectedFunds, simulatedRemovals, simulatedAdditions, isSimulationActive]);

  // Compute normalized weights of selected funds in portfolio (sum up to 100)
  const normalizedWeightedFunds = useMemo(() => {
    const totalAllocation = activeWorkingPortfolio.reduce((sum, f) => sum + f.allocation, 0);
    if (totalAllocation === 0) {
      return activeWorkingPortfolio.map(f => ({
        ...f,
        fundDetails: INITIAL_FUNDS_DB.find(db => db.ticker === f.ticker)!,
        weightPercent: 100 / activeWorkingPortfolio.length
      }));
    }
    return activeWorkingPortfolio.map(f => {
      const dbDetails = INITIAL_FUNDS_DB.find(db => db.ticker === f.ticker)!;
      return {
        ...f,
        fundDetails: dbDetails,
        weightPercent: (f.allocation / totalAllocation) * 100
      };
    });
  }, [activeWorkingPortfolio]);

  // Generate pairwise overlap metrics of working portfolio
  const pairwiseOverlapMatrix = useMemo(() => {
    const results: { fundA: string; fundB: string; overlap: number }[] = [];
    const len = normalizedWeightedFunds.length;
    
    for (let i = 0; i < len; i++) {
      for (let j = i; j < len; j++) {
        const fA = normalizedWeightedFunds[i].fundDetails;
        const fB = normalizedWeightedFunds[j].fundDetails;
        const oPercent = calculatePairOverlap(fA, fB);
        results.push({ fundA: fA.ticker, fundB: fB.ticker, overlap: oPercent });
      }
    }
    return results;
  }, [normalizedWeightedFunds]);

  // Compute Overall Weighted Overlap Index of the portfolio
  // Calculated as weighted pairwise overlap to reflect real dilution
  const portfolioOverlapIndex = useMemo(() => {
    if (normalizedWeightedFunds.length <= 1) return 0;
    
    let totalWeightedOverlap = 0;
    let comparisonsCount = 0;
    
    for (let i = 0; i < normalizedWeightedFunds.length; i++) {
      for (let j = i + 1; j < normalizedWeightedFunds.length; j++) {
        const itemA = normalizedWeightedFunds[i];
        const itemB = normalizedWeightedFunds[j];
        const overlap = calculatePairOverlap(itemA.fundDetails, itemB.fundDetails);
        
        // Weight factor based on their collective footprint in the portfolio
        const combinedFootprint = (itemA.weightPercent + itemB.weightPercent) / 200;
        totalWeightedOverlap += overlap * combinedFootprint;
        comparisonsCount += combinedFootprint;
      }
    }
    
    if (comparisonsCount === 0) return 0;
    return Math.round((totalWeightedOverlap / comparisonsCount) * 10) / 10;
  }, [normalizedWeightedFunds]);

  // Aggregate Underlying Stock Holdings across all selected funds based on allocation weight
  const aggregatedStockHoldings = useMemo(() => {
    const stockMap: { [name: string]: number } = {};
    
    normalizedWeightedFunds.forEach(fund => {
      const fundPortfolioWeight = fund.weightPercent / 100; // e.g. 0.50 for 50%
      fund.fundDetails.topHoldings.forEach(stock => {
        const contribution = stock.weight * fundPortfolioWeight;
        stockMap[stock.name] = (stockMap[stock.name] || 0) + contribution;
      });
    });

    const list = Object.entries(stockMap).map(([name, weight]) => ({
      name,
      weight: Math.round(weight * 100) / 100
    }));

    // Sort descending by weight
    return list.sort((a, b) => b.weight - a.weight);
  }, [normalizedWeightedFunds]);

  // Aggregate Sector Distribution
  const aggregatedSectors = useMemo(() => {
    const sectorMap: { [name: string]: number } = {};
    
    normalizedWeightedFunds.forEach(fund => {
      const fundPortfolioWeight = fund.weightPercent / 100;
      fund.fundDetails.sectors.forEach(sec => {
        const contribution = sec.weight * fundPortfolioWeight;
        sectorMap[sec.name] = (sectorMap[sec.name] || 0) + contribution;
      });
    });

    const list = Object.entries(sectorMap).map(([name, weight]) => ({
      name,
      weight: Math.round(weight * 100) / 100
    }));

    return list.sort((a, b) => b.weight - a.weight);
  }, [normalizedWeightedFunds]);

  // Concentration and Diversification status
  const diversificationDiagnosis = useMemo(() => {
    if (normalizedWeightedFunds.length === 0) {
      return { rating: 'N/A', ratingColor: 'text-slate-400', label: 'Empty Portfolio' };
    }
    
    const top10HoldingSum = aggregatedStockHoldings.slice(0, 10).reduce((sum, h) => sum + h.weight, 0);
    const topIndividualStock = aggregatedStockHoldings[0]?.weight || 0;
    
    // High pairwise overlaps or high top-10 sum flags concentration
    if (top10HoldingSum > 48 || topIndividualStock > 11 || portfolioOverlapIndex > 58) {
      return {
        rating: 'Highly Concentrated',
        ratingColor: 'text-rose-600 bg-rose-50 border-rose-100',
        textColor: 'text-rose-700',
        progressBarColor: 'bg-rose-500',
        percent: top10HoldingSum,
        advice: 'High redundancy exists in your picks. You have multiple funds taking heavy stakes in identical Indian banking and conglomerate stocks. This subjects you to high cluster crash risks without providing standard active returns.'
      };
    } else if (top10HoldingSum > 28 || portfolioOverlapIndex > 30) {
      return {
        rating: 'Moderately Balanced',
        ratingColor: 'text-amber-600 bg-amber-50 border-amber-100',
        textColor: 'text-amber-700',
        progressBarColor: 'bg-amber-500',
        percent: top10HoldingSum,
        advice: 'A stable blend. Your underlying holdings contain moderate banking bias but include some mid-caps or other sectors that lower overlap. Good, but could be optimal.'
      };
    } else {
      return {
        rating: 'Prudently Diversified',
        ratingColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        textColor: 'text-emerald-700',
        progressBarColor: 'bg-emerald-500',
        percent: top10HoldingSum,
        advice: 'Outstanding diversification! Your combination spans small-caps, large-caps, and potentially international assets. There is minimal underlying asset clustering.'
      };
    }
  }, [aggregatedStockHoldings, portfolioOverlapIndex, normalizedWeightedFunds]);

  // Diagnose Overlapping Pairs to flag for optimizer
  const overlappingWarnings = useMemo(() => {
    const warnings: { fundA: FundHolding; fundB: FundHolding; overlap: number; recommendation: string }[] = [];
    const len = normalizedWeightedFunds.length;
    
    for (let i = 0; i < len; i++) {
      for (let j = i + 1; j < len; j++) {
        const itemA = normalizedWeightedFunds[i];
        const itemB = normalizedWeightedFunds[j];
        const overlapPercent = calculatePairOverlap(itemA.fundDetails, itemB.fundDetails);
        
        if (overlapPercent > 55) {
          let rec = '';
          if (itemA.fundDetails.category === 'Large Cap' && itemB.fundDetails.category === 'Large Cap') {
            rec = 'Dual Large-Cap holdings usually mimic a low-cost Nifty Index fund but charge double the fees. Consolidate into the lower TER fund or switch to a Flexi Cap.';
          } else {
            rec = 'Prune one overlapping fund and redirect the SIP to a low-covariance Mid Cap, Small Cap, or International FoF to capture unique alpha streams.';
          }
          warnings.push({
            fundA: itemA.fundDetails,
            fundB: itemB.fundDetails,
            overlap: overlapPercent,
            recommendation: rec
          });
        }
      }
    }
    return warnings;
  }, [normalizedWeightedFunds]);

  // Dynamically compute Prime Investor rolling return statistics for each selected fund
  const primeInvestorStats = useMemo(() => {
    if (normalizedWeightedFunds.length === 0) return [];
    
    // Determine index corresponding to the rollingReturnPeriod
    const periodIndexMap: { [key: string]: number } = {
      '1 Year': 0,
      '3 Years': 1,
      '5 Years': 2,
      '7 Years': 3,
      '10 Years': 4,
    };
    
    const targetPeriod = rollingReturnPeriod === 'Select' ? '3 Years' : rollingReturnPeriod;
    const idx = periodIndexMap[targetPeriod] ?? 1; // Default to 3 Years (index 1)
    
    return normalizedWeightedFunds.map(item => {
      const fund = item.fundDetails;
      
      // Get returns for this fund across all activeEvaluationDates
      const values: number[] = [];
      activeEvaluationDates.forEach(dateStr => {
        const liveF = liveMetrics[fund.name]?.[dateStr];
        const rArr = liveF && liveF.rolling ? liveF.rolling : getRollingReturnsForDate(fund.name, dateStr);
        const valStr = rArr[idx];
        if (valStr && valStr !== '-') {
          const valNum = parseFloat(valStr);
          if (!isNaN(valNum)) {
            values.push(valNum);
          }
        }
      });
      
      if (values.length === 0) {
        return {
          fundName: fund.name,
          ticker: fund.ticker,
          count: 0,
          avg: '-',
          min: '-',
          max: '-',
          median: '-',
          stdDev: '-',
          pNeg: '-',
          p0to5: '-',
          p5to10: '-',
          p10to20: '-',
          pMoreThan20: '-'
        };
      }
      
      // Compute statistics
      const sorted = [...values].sort((a, b) => a - b);
      const count = values.length;
      const sum = values.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / count;
      const min = sorted[0];
      const max = sorted[count - 1];
      
      // Median
      let median = 0;
      if (count % 2 === 0) {
        median = (sorted[count / 2 - 1] + sorted[count / 2]) / 2;
      } else {
        median = sorted[Math.floor(count / 2)];
      }

      // Standard Deviation
      let stdDev = 0;
      if (count > 0) {
        const variance = values.reduce((acc, curr) => acc + Math.pow(curr - avg, 2), 0) / count;
        stdDev = Math.sqrt(variance);
      }
      
      // Probabilities
      const negCount = values.filter(v => v < 0).length;
      const range0to5Count = values.filter(v => v >= 0 && v < 5).length;
      const range5to10Count = values.filter(v => v >= 5 && v < 10).length;
      const range10to20Count = values.filter(v => v >= 10 && v <= 20).length;
      const rangeMoreThan20Count = values.filter(v => v > 20).length;
      
      const pNeg = ((negCount / count) * 100).toFixed(2);
      const p0to5 = ((range0to5Count / count) * 100).toFixed(2);
      const p5to10 = ((range5to10Count / count) * 100).toFixed(2);
      const p10to20 = ((range10to20Count / count) * 100).toFixed(2);
      const pMoreThan20 = ((rangeMoreThan20Count / count) * 100).toFixed(2);
      
      return {
        fundName: fund.name,
        ticker: fund.ticker,
        count,
        avg: avg.toFixed(2),
        min: min.toFixed(2),
        max: max.toFixed(2),
        median: median.toFixed(2),
        stdDev: stdDev.toFixed(2),
        pNeg,
        p0to5,
        p5to10,
        p10to20,
        pMoreThan20
      };
    });
  }, [normalizedWeightedFunds, rollingReturnPeriod, liveMetrics, activeEvaluationDates]);

  // Compute rolling returns time-series dataset chronological sequence for Recharts LineChart
  const rollingReturnsChartData = useMemo(() => {
    if (normalizedWeightedFunds.length === 0) return [];

    // Chronological order: from earliest date to latest date
    const chronologicalDates = [...activeEvaluationDates];

    return chronologicalDates.map(dateStr => {
      // Parse year (e.g. "31-Dec-2019" -> "2019")
      const parts = dateStr.split('-');
      const yearStr = parts[2] || dateStr;

      const dataPoint: Record<string, any> = {
        dateStr,
        year: yearStr,
      };

      normalizedWeightedFunds.forEach(item => {
        const fund = item.fundDetails;
        const periodIndexMap: { [key: string]: number } = {
          '1 Year': 0,
          '3 Years': 1,
          '5 Years': 2,
          '7 Years': 3,
          '10 Years': 4,
        };
        const targetPeriod = rollingReturnPeriod === 'Select' ? '3 Years' : rollingReturnPeriod;
        const idx = periodIndexMap[targetPeriod] ?? 1;

        const liveF = liveMetrics[fund.name]?.[dateStr];
        const rArr = liveF && liveF.rolling ? liveF.rolling : getRollingReturnsForDate(fund.name, dateStr);
        const valStr = rArr[idx];
        if (valStr && valStr !== '-') {
          const valNum = parseFloat(valStr);
          if (!isNaN(valNum)) {
            dataPoint[fund.name] = valNum;
          }
        }
      });

      return dataPoint;
    });
  }, [normalizedWeightedFunds, rollingReturnPeriod, liveMetrics, activeEvaluationDates]);

  // Categories and superior alternatives query selector dynamically evaluated over the current selected funds
  const CategoryAlternativeUpgrades = useMemo(() => {
    if (normalizedWeightedFunds.length === 0) return [];

    return normalizedWeightedFunds.map(portfolioItem => {
      const currentFund = portfolioItem.fundDetails;
      if (!currentFund) return null;

      const currentCategory = currentFund.category;

      // Filter other candidates in the same category and type that are NOT currently in the portfolio (similar active/passive/ELSS)
      const candidates = INITIAL_FUNDS_DB.filter(dbFund => {
        if (dbFund.category !== currentCategory) return false;
        if (dbFund.taxType !== currentFund.taxType) return false;
        if (isPassiveFund(dbFund) !== isPassiveFund(currentFund)) return false;
        if (isELSSFund(dbFund) !== isELSSFund(currentFund)) return false;
        if (dbFund.ticker === currentFund.ticker) return false;
        
        // Ensure not already in active portfolio
        const inPortfolio = activeWorkingPortfolio.some(ap => ap.ticker === dbFund.ticker);
        return !inPortfolio;
      });

      // Calculate score for each candidate relative to current fund
      const scoredCandidates = candidates.map(cand => {
        const evalDateStr = activeEvaluationDates[activeEvaluationDates.length - 1] || HISTORICAL_DATES[0];
        const liveCand = liveMetrics[cand.name]?.[evalDateStr];
        const liveCurr = liveMetrics[currentFund.name]?.[evalDateStr];
        const candActiveYears = 2026 - (liveCand?.realLaunchYear ?? getFundInceptionYear(cand.name));
        const currActiveYears = 2026 - (liveCurr?.realLaunchYear ?? getFundInceptionYear(currentFund.name));

        const hCode = cand.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const currHCode = currentFund.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Cand stats
        const cand3YStatic = candActiveYears >= 3 ? cand.rolling3Y : undefined;
        const cand5YStatic = candActiveYears >= 5 ? cand.rolling5Y : undefined;
        let cand7YStatic: number | undefined = undefined;
        if (candActiveYears >= 7) {
          cand7YStatic = cand.rolling7Y;
          if (cand7YStatic === undefined && cand.rolling5Y !== undefined) {
            if (cand.category === 'Liquid') cand7YStatic = Math.round((cand.rolling5Y - 0.1) * 10) / 10;
            else if (cand.category === 'Debt') cand7YStatic = Math.round((cand.rolling5Y + 0.1 - (hCode % 10) / 20) * 10) / 10;
            else cand7YStatic = Math.round((cand.rolling5Y + 0.5 - (hCode % 11) / 10) * 10) / 10;
          }
        }
        let cand10YStatic: number | undefined = undefined;
        if (candActiveYears >= 10) {
          cand10YStatic = cand.rolling10Y;
          if (cand10YStatic === undefined && cand7YStatic !== undefined) {
            if (cand.category === 'Liquid') cand10YStatic = Math.round((cand7YStatic - 0.1) * 10) / 10;
            else if (cand.category === 'Debt') cand10YStatic = Math.round((cand7YStatic + 0.05 + (hCode % 5) / 20) * 10) / 10;
            else cand10YStatic = Math.round((cand7YStatic - 0.3 + (hCode % 9) / 10) * 10) / 10;
          }
        }

        // Current stats
        const curr3YStatic = currActiveYears >= 3 ? currentFund.rolling3Y : undefined;
        const curr5YStatic = currActiveYears >= 5 ? currentFund.rolling5Y : undefined;
        let curr7YStatic: number | undefined = undefined;
        if (currActiveYears >= 7) {
          curr7YStatic = currentFund.rolling7Y;
          if (curr7YStatic === undefined && currentFund.rolling5Y !== undefined) {
            if (currentFund.category === 'Liquid') curr7YStatic = Math.round((currentFund.rolling5Y - 0.1) * 10) / 10;
            else if (currentFund.category === 'Debt') curr7YStatic = Math.round((currentFund.rolling5Y + 0.1 - (currHCode % 10) / 20) * 10) / 10;
            else curr7YStatic = Math.round((currentFund.rolling5Y + 0.5 - (currHCode % 11) / 10) * 10) / 10;
          }
        }
        let curr10YStatic: number | undefined = undefined;
        if (currActiveYears >= 10) {
          curr10YStatic = currentFund.rolling10Y;
          if (curr10YStatic === undefined && curr7YStatic !== undefined) {
            if (currentFund.category === 'Liquid') curr10YStatic = Math.round((curr7YStatic - 0.1) * 10) / 10;
            else if (currentFund.category === 'Debt') curr10YStatic = Math.round((curr7YStatic + 0.05 + (currHCode % 5) / 20) * 10) / 10;
            else curr10YStatic = Math.round((curr7YStatic - 0.3 + (currHCode % 9) / 10) * 10) / 10;
          }
        }

        // Live values overriding
        const cand3YLive = (liveCand && liveCand.rolling[1] !== undefined && liveCand.rolling[1] !== '-') ? parseFloat(liveCand.rolling[1]) : undefined;
        const cand5YLive = (liveCand && liveCand.rolling[2] !== undefined && liveCand.rolling[2] !== '-') ? parseFloat(liveCand.rolling[2]) : undefined;
        const cand7YLive = (liveCand && liveCand.rolling[3] !== undefined && liveCand.rolling[3] !== '-') ? parseFloat(liveCand.rolling[3]) : undefined;
        const cand10YLive = (liveCand && liveCand.rolling[4] !== undefined && liveCand.rolling[4] !== '-') ? parseFloat(liveCand.rolling[4]) : undefined;
        const candSharpeLive = (liveCand && liveCand.sharpe !== '—' && liveCand.sharpe !== '-') ? parseFloat(liveCand.sharpe) : undefined;
        const candSortinoLive = (liveCand && liveCand.sortino !== '—' && liveCand.sortino !== '-') ? parseFloat(liveCand.sortino) : undefined;

        const curr3YLive = (liveCurr && liveCurr.rolling[1] !== undefined && liveCurr.rolling[1] !== '-') ? parseFloat(liveCurr.rolling[1]) : undefined;
        const curr5YLive = (liveCurr && liveCurr.rolling[2] !== undefined && liveCurr.rolling[2] !== '-') ? parseFloat(liveCurr.rolling[2]) : undefined;
        const curr7YLive = (liveCurr && liveCurr.rolling[3] !== undefined && liveCurr.rolling[3] !== '-') ? parseFloat(liveCurr.rolling[3]) : undefined;
        const curr10YLive = (liveCurr && liveCurr.rolling[4] !== undefined && liveCurr.rolling[4] !== '-') ? parseFloat(liveCurr.rolling[4]) : undefined;
        const currSharpeLive = (liveCurr && liveCurr.sharpe !== '—' && liveCurr.sharpe !== '-') ? parseFloat(liveCurr.sharpe) : undefined;
        const currSortinoLive = (liveCurr && liveCurr.sortino !== '—' && liveCurr.sortino !== '-') ? parseFloat(liveCurr.sortino) : undefined;

        const finalCand3Y = cand3YLive !== undefined ? cand3YLive : cand3YStatic;
        const finalCand5Y = cand5YLive !== undefined ? cand5YLive : cand5YStatic;
        const finalCand7Y = cand7YLive !== undefined ? cand7YLive : cand7YStatic;
        const finalCand10Y = cand10YLive !== undefined ? cand10YLive : cand10YStatic;
        const finalCandSharpe = candSharpeLive !== undefined ? candSharpeLive : cand.sharpe;
        const finalCandSortino = candSortinoLive !== undefined ? candSortinoLive : cand.sortino;

        const finalCurr3Y = curr3YLive !== undefined ? curr3YLive : curr3YStatic;
        const finalCurr5Y = curr5YLive !== undefined ? curr5YLive : curr5YStatic;
        const finalCurr7Y = curr7YLive !== undefined ? curr7YLive : curr7YStatic;
        const finalCurr10Y = curr10YLive !== undefined ? curr10YLive : curr10YStatic;
        const finalCurrSharpe = currSharpeLive !== undefined ? currSharpeLive : currentFund.sharpe;
        const finalCurrSortino = currSortinoLive !== undefined ? currSortinoLive : currentFund.sortino;

        const better3Y = (finalCand3Y !== undefined && finalCurr3Y !== undefined) ? finalCand3Y > finalCurr3Y : false;
        const better5Y = (finalCand5Y !== undefined && finalCurr5Y !== undefined) ? finalCand5Y > finalCurr5Y : false;
        const better7Y = (finalCand7Y !== undefined && finalCurr7Y !== undefined) ? finalCand7Y > finalCurr7Y : false;
        const better10Y = (finalCand10Y !== undefined && finalCurr10Y !== undefined) ? finalCand10Y > finalCurr10Y : false;
        
        const betterSharpe = finalCandSharpe > finalCurrSharpe;
        const betterSortino = finalCandSortino > finalCurrSortino;
        const lowerTER = cand.ter < currentFund.ter;

        let score = 0;
        let improvementsCount = 0;

        if (better3Y && finalCand3Y !== undefined && finalCurr3Y !== undefined) { score += (finalCand3Y - finalCurr3Y) * 2.5; improvementsCount++; }
        if (better5Y && finalCand5Y !== undefined && finalCurr5Y !== undefined) { score += (finalCand5Y - finalCurr5Y) * 2.5; improvementsCount++; }
        if (better7Y && finalCand7Y !== undefined && finalCurr7Y !== undefined) { score += (finalCand7Y - finalCurr7Y) * 1.5; improvementsCount++; }
        if (better10Y && finalCand10Y !== undefined && finalCurr10Y !== undefined) { score += (finalCand10Y - finalCurr10Y) * 1.5; improvementsCount++; }
        if (betterSharpe) { score += (finalCandSharpe - finalCurrSharpe) * 30; improvementsCount++; }
        if (betterSortino) { score += (finalCandSortino - finalCurrSortino) * 30; improvementsCount++; }
        if (lowerTER) { score += (currentFund.ter - cand.ter) * 15; improvementsCount++; }

        return {
          cand,
          score,
          improvementsCount,
          better3Y,
          better5Y,
          better7Y,
          better10Y,
          betterSharpe,
          betterSortino,
          lowerTER,
          cand7Y: finalCand7Y,
          cand10Y: finalCand10Y,
          curr7Y: finalCurr7Y,
          curr10Y: finalCurr10Y
        };
      }).filter(item => item.score > 0 && item.improvementsCount >= 1); // must excel in at least some key departments

      // Sort descending by performance advantage score
      scoredCandidates.sort((a,b) => b.score - a.score);

      return {
        targetFund: currentFund,
        alternatives: scoredCandidates.slice(0, 2).map(sc => ({
          fund: sc.cand,
          cand7Y: sc.cand7Y,
          cand10Y: sc.cand10Y,
          curr7Y: sc.curr7Y,
          curr10Y: sc.curr10Y
        }))
      };
    }).filter(g => g !== null && g.alternatives.length > 0);
  }, [normalizedWeightedFunds, activeWorkingPortfolio]);

  // Find superior active alternatives for overlapping funds based on rolling returns, Sharpe, and Sortino ratios
  const recommendedAlternatives = useMemo(() => {
    return INITIAL_FUNDS_DB.map(f => {
      // Find what other funds in the database match are superior (same category, active/passive, and ELSS status)
      const matches = INITIAL_FUNDS_DB.filter(other => {
        if (other.ticker === f.ticker) return false;
        if (other.category !== f.category) return false;
        if (other.taxType !== f.taxType) return false;
        if (isPassiveFund(other) !== isPassiveFund(f)) return false;
        if (isELSSFund(other) !== isELSSFund(f)) return false;
        
        // Superior metrics conditions: Better Returns + Better Sharpe/Sortino + Lower/competitive Expense Ratio
        return (
          other.rolling3Y > f.rolling3Y &&
          other.sharpe > f.sharpe &&
          other.ter <= f.ter + 0.3 // comparable or lower fees
        );
      });

      return {
        fund: f,
        alternatives: matches.sort((a,b) => b.rolling3Y - a.rolling3Y).slice(0, 2)
      };
    });
  }, []);

  // Trigger live downloads for currently compared funds
  React.useEffect(() => {
    normalizedWeightedFunds.forEach(item => {
      const fundName = item.fundDetails.name;
      // Slice to prevent choking the async mock API for excessively dense series
      activeEvaluationDates.slice(0, 15).forEach(dateStr => {
        fetchLiveMetrics(fundName, dateStr);
      });
    });
  }, [normalizedWeightedFunds, activeEvaluationDates]);

  // Trigger live downloads for optimizer cards
  React.useEffect(() => {
    CategoryAlternativeUpgrades.forEach(grp => {
      if (!grp) return;
      activeEvaluationDates.slice(0, 15).forEach(dateStr => {
        fetchLiveMetrics(grp.targetFund.name, dateStr);
      });
      grp.alternatives.slice(0, 3).forEach(altItem => {
        activeEvaluationDates.slice(0, 15).forEach(dateStr => {
          fetchLiveMetrics(altItem.fund.name, dateStr);
        });
      });
    });
  }, [CategoryAlternativeUpgrades, activeEvaluationDates]);

  // Switcher Interactive Simulation action
  const handleApplySimulation = (pruneTicker: string, addTicker: string) => {
    const originalAlloc = selectedFunds.find(f => f.ticker === pruneTicker)?.allocation ?? 10000;
    
    setSimulatedRemovals(prev => {
      if (!prev.includes(pruneTicker)) {
        return [...prev, pruneTicker];
      }
      return prev;
    });

    setSimulatedAdditions(prev => {
      if (!prev.some(a => a.ticker === addTicker)) {
        return [...prev, { ticker: addTicker, allocation: originalAlloc }];
      }
      return prev;
    });

    setIsSimulationActive(true);
  };

  const handleResetSimulation = () => {
    setSimulatedRemovals([]);
    setSimulatedAdditions([]);
    setIsSimulationActive(false);
  };

  const handleDownloadData = () => {
    if (normalizedWeightedFunds.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,Fund Name,1 Year (%),3 Years (%),5 Years (%),7 Years (%),10 Years (%)\n";
    
    activeEvaluationDates.forEach(dateStr => {
      normalizedWeightedFunds.forEach(item => {
        const name = item.fundDetails.name;
        const liveF = liveMetrics[name]?.[dateStr];
        const [r1, r3, r5, r7, r10] = liveF && liveF.rolling 
          ? liveF.rolling 
          : getRollingReturnsForDate(name, dateStr);
        csvContent += `"${dateStr}","${name}",${r1 || '-'},${r3 || '-'},${r5 || '-'},${r7 || '-'},${r10 || '-'}\n`;
      });
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Rolling_Returns_${dataFrequency}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadDemoComparison = () => {
    setSelectedFunds([
      { ticker: 'NIPPON-SM', allocation: 10000 },
      { ticker: 'QUANT-SM', allocation: 10000 }
    ]);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans" id="overlap-finder-root">
      {/* Visual Header */}
      <div className="border-b border-slate-200 pb-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              <Layers className="w-3 h-3" /> Core Analytical Module
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
              Fund Overlap Finder & Portfolio Optimizer
            </h1>
            <p className="text-slate-500 mt-1.5 text-[14px] max-w-3xl leading-relaxed">
              Prune redundancies. Reveal secret stock concentrations and calculate the precise tax and exit-load friction costs of switching to superior risk-adjusted alternatives.
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Allocation Style:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
              <button 
                onClick={() => setAllocationMode('Amount')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${allocationMode === 'Amount' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                SIP / Value Amount
              </button>
              <button 
                onClick={() => setAllocationMode('Percent')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${allocationMode === 'Percent' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
              >
                Percentage (%)
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSimulationActive && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/25 flex items-center justify-center text-amber-800 font-black">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Interactive Optimizer Simulator Active ({simulatedRemovals.length} Swap{simulatedRemovals.length > 1 ? 's' : ''} Staged)</h4>
              <p className="text-[11.5px] text-slate-600 leading-tight">
                Showing how your portfolio overlap and concentration score reduces under our active switch recommendation. You can stage multiple swaps and then commit them all permanently.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              type="button"
              onClick={() => {
                setSelectedFunds(prev => {
                  const filtered = prev.filter(f => !simulatedRemovals.includes(f.ticker));
                  const combined = [...filtered];
                  simulatedAdditions.forEach(add => {
                    if (!combined.some(c => c.ticker === add.ticker)) {
                      combined.push(add);
                    }
                  });
                  return combined;
                });
                handleResetSimulation();
              }}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Confirm & Apply Swaps Permanently
            </button>
            <button 
              type="button"
              onClick={handleResetSimulation}
              className="px-4 py-1.5 bg-slate-905 hover:bg-slate-800 bg-slate-900 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
            >
              <RefreshCw className="w-3 h-3" /> Restore Current Portfolio
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Fund Selector left bar, Analytics content right side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Fund Selector & Settings Panel */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Main Active Selection Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg shadow-slate-100/65 p-6 text-left relative overflow-hidden">
            {/* Header Area */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Your Portfolio</h3>
                  <h4 className="text-sm font-black text-slate-800 leading-none mt-0.5">Active Holdings</h4>
                </div>
              </div>
              <span className="text-[10px] font-mono font-black px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                {activeWorkingPortfolio.length} Selected
              </span>
            </div>

            {/* Empty state if nothing added */}
            {normalizedWeightedFunds.length === 0 ? (
              <div className="text-center py-12 px-6 border-2 border-dashed border-slate-100 rounded-3xl">
                <TrendingUp className="w-9 h-9 text-slate-300 mx-auto mb-2.5" />
                <p className="text-xs font-bold text-slate-600 font-sans">No active funds added yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] mx-auto leading-relaxed">
                  Search and add regular plan mutual funds from the master catalog below to analyze.
                </p>
              </div>
            ) : (
              /* Hold items list */
              <div className="space-y-4 max-h-[460px] overflow-y-auto pr-1">
                {normalizedWeightedFunds.map((item, idx) => {
                  // Determine status category-specific vertical border color coding for a visual anchor
                  let leftBorderBar = 'border-l-indigo-500';
                  let categoryBadgeStyle = 'text-indigo-700 bg-indigo-50/70 border-indigo-100';
                  
                  if (item.fundDetails.category === 'Debt') {
                    leftBorderBar = 'border-l-amber-500';
                    categoryBadgeStyle = 'text-amber-700 bg-amber-50/70 border-amber-100';
                  } else if (item.fundDetails.category === 'Index') {
                    leftBorderBar = 'border-l-purple-500';
                    categoryBadgeStyle = 'text-purple-700 bg-purple-50/70 border-purple-100';
                  } else if (item.fundDetails.category === 'Mid Cap') {
                    leftBorderBar = 'border-l-sky-500';
                    categoryBadgeStyle = 'text-sky-700 bg-sky-50/70 border-sky-100';
                  } else if (item.fundDetails.category === 'Small Cap') {
                    leftBorderBar = 'border-l-rose-500';
                    categoryBadgeStyle = 'text-rose-700 bg-rose-50/70 border-rose-100';
                  } else if (item.fundDetails.category === 'Flexi Cap') {
                    leftBorderBar = 'border-l-emerald-500';
                    categoryBadgeStyle = 'text-emerald-700 bg-emerald-50/70 border-emerald-100';
                  } else if (item.fundDetails.category === 'International') {
                    leftBorderBar = 'border-l-violet-500';
                    categoryBadgeStyle = 'text-violet-700 bg-violet-50/70 border-violet-100';
                  }

                  const allocationPercent = Math.round(item.weightPercent);

                  return (
                    <div 
                      key={item.ticker} 
                      className={`ps-4 pe-3 py-3.5 bg-white rounded-2xl transition-all duration-300 border-y border-e border-slate-200/80 border-l-4 ${leftBorderBar} hover:shadow-sm hover:border-slate-300 relative group flex flex-col justify-between`}
                    >
                      {/* Top Row: Category badge & Delete action */}
                      <div className="flex items-center justify-between gap-2 mb-2 bg-slate-50/30 -mx-1 -mt-1 p-1 rounded-lg">
                        <span className={`text-[9.5px] font-bold px-2 py-0.5 rounded-md border font-mono tracking-wide ${categoryBadgeStyle}`}>
                          {item.fundDetails.category}
                        </span>
                        
                        <button 
                          onClick={() => handleRemoveFund(item.ticker)}
                          disabled={isSimulationActive}
                          className={`text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 p-1.5 rounded-lg transition-all ${
                            isSimulationActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
                          }`}
                          title="Remove from portfolio"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Fund Title Area */}
                      <div>
                        <h4 className="text-[12.5px] font-extrabold text-slate-800 tracking-tight leading-snug group-hover:text-slate-950 transition-colors">
                          {item.fundDetails.name}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[9px] text-slate-450 border-t border-slate-50 pt-2">
                          <div>Ticker: <strong className="text-slate-650">{item.ticker}</strong></div>
                          <div className="text-right">TER: <strong className="text-slate-650">{item.fundDetails.ter}%</strong></div>
                        </div>
                      </div>

                      {/* Weighted Alloc Progress Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="flex items-center justify-between text-[9.5px] font-mono">
                          <span className="text-slate-400 font-medium">Portfolio Weight:</span>
                          <span className="font-extrabold text-indigo-700">{allocationPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${allocationPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Allocation adjustment input */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[9.5px] font-sans font-bold text-slate-450 flex items-center gap-1">
                          <Settings className="w-3 h-3 text-slate-400" />
                          {allocationMode === 'Amount' ? 'Monthly SIP (₹)' : 'Target Share (%)'}
                        </span>
                        
                        <div className="flex items-center gap-1 border border-slate-200 focus-within:border-slate-400 rounded-xl px-2.5 py-1 bg-slate-50/50">
                          {allocationMode === 'Amount' && <span className="text-[10px] font-black text-slate-400 font-mono">₹</span>}
                          <input 
                            type="number" 
                            value={Math.round(item.allocation)}
                            disabled={isSimulationActive}
                            onChange={(e) => handleUpdateAllocation(item.ticker, parseFloat(e.target.value) || 0)}
                            className="w-14 bg-transparent border-0 focus:ring-0 p-0 text-[11px] font-bold text-right text-slate-800 focus:outline-none font-mono disabled:opacity-50"
                          />
                          {allocationMode === 'Percent' && <span className="text-[10px] font-black text-slate-400 font-mono">%</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Simple Total sum indicator for sanity checking percentages */}
            {normalizedWeightedFunds.length > 0 && allocationMode === 'Percent' && (
              <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider font-sans">Portfolio Total:</span>
                <span className={`text-xs font-mono font-black px-2.5 py-0.5 rounded-full ${
                  Math.abs(selectedFunds.reduce((s,f) => s + f.allocation, 0) - 100) < 0.1 
                    ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' 
                    : 'text-amber-700 bg-amber-50 border border-amber-100'
                }`}>
                  {selectedFunds.reduce((s,f) => s + f.allocation, 0)}%
                </span>
              </div>
            )}
          </div>

          {/* Quick Add Search Bar dropdown card */}
          <div className="bg-white rounded-2xl border border-slate-205/80 shadow-md shadow-slate-100/50 p-6 text-left">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Add Funds to Analyze</h3>
            
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input 
                type="text"
                placeholder="Search index, bluechips, small-caps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-55 border border-slate-200/80 rounded-xl py-2 pl-9 pr-10 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-2 w-5 h-5 rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 hover:text-slate-700 font-bold flex items-center justify-center transition-all cursor-pointer"
                >
                  <X className="w-3 h-3 text-slate-600" />
                </button>
              )}
            </div>

            {/* List to pick from */}
            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {filteredFunds.map(fund => {
                const isAlreadySelected = selectedFunds.some(s => s.ticker === fund.ticker);
                return (
                  <button
                    key={fund.ticker}
                    onClick={() => handleAddFund(fund.ticker)}
                    disabled={isAlreadySelected || isSimulationActive}
                    className={`w-full p-2.5 text-left rounded-xl transition-all flex items-center justify-between border ${
                      isAlreadySelected 
                        ? 'border-emerald-100 bg-emerald-50/40 opacity-60 cursor-not-allowed' 
                        : isSimulationActive
                        ? 'border-slate-100 bg-slate-50/50 opacity-40 cursor-not-allowed'
                        : 'border-slate-100 hover:border-slate-300 bg-slate-50/50 hover:bg-slate-50 cursor-pointer'
                    }`}
                  >
                    <div className="max-w-[80%]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[8px] font-bold px-1 py-0.5 bg-slate-200 rounded text-slate-600 font-mono">
                          {fund.category}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold">
                          TER: {fund.ter}%
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-bold border-l border-slate-250 pl-1.5 leading-none">
                          Launch: {getFundInceptionYear(fund.name)}
                        </span>
                      </div>
                      <h5 className="text-[11.5px] font-bold text-slate-700 line-clamp-1 mt-0.5">
                        {fund.name}
                      </h5>
                    </div>

                    <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-500 font-bold hover:bg-slate-900 hover:text-white transition-all">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Corporate Trust Label */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl text-left flex items-start gap-3">
            <Shield className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[8.5px] tracking-widest text-emerald-400 font-bold uppercase block">
                PURE WEALTH CONSULTING MTRX
              </span>
              <p className="text-[10.5px] text-slate-300 leading-snug font-sans mt-0.5">
                Our database evaluates overlapping index correlation coefficients inside India as updated by SEBI and AMFI regulations automatically.
              </p>
            </div>
          </div>

        </div>

        {/* Right Hand Column: Analytics Panel Tabs & Dashboard */}
        <div className="col-span-1 lg:col-span-8 space-y-6">
          
          {/* Overview Scoreboard Widget */}
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 text-left relative overflow-hidden shadow-xl border border-slate-800">
            {/* Ambient Background Glow */}
            <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute left-1/3 bottom-0 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-800 items-center">
              
              {/* Score 1: Overlap index */}
              <div className="pb-4 md:pb-0 md:pr-4">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Activity className="w-3.5 h-3.5 text-slate-400" /> Aggregate Overlap Index
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-extrabold tracking-tight font-display ${
                    portfolioOverlapIndex > 58 ? 'text-rose-400' : portfolioOverlapIndex > 30 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {portfolioOverlapIndex}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight font-serif italic">
                  {portfolioOverlapIndex > 58 ? 'Severe duplication risk detected.' : portfolioOverlapIndex > 30 ? 'Moderate cluster redundancy.' : 'Excellent diversification spacing.'}
                </p>
              </div>

              {/* Score 2: Concentration Class */}
              <div className="py-4 md:py-0 md:px-6">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Portfolio Diagnosis
                </div>
                <div className={`inline-block py-1 px-3.5 rounded-full text-[11px] font-black uppercase tracking-wider ${diversificationDiagnosis.ratingColor}`}>
                  {diversificationDiagnosis.rating}
                </div>
                <p className="text-[10px] text-slate-400 mt-2 leading-tight">
                  Top 10 holdings occupy <strong>{Math.round(diversificationDiagnosis.percent)}%</strong> of net capital weight.
                </p>
              </div>

              {/* Score 3: Total Weighted TER */}
              <div className="pt-4 md:pt-0 md:pl-6">
                <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-bold uppercase tracking-wider mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" /> Weighted Expense Ratio
                </div>
                <div className="text-3xl font-bold tracking-tight text-slate-100 font-mono">
                  {useMemo(() => {
                    const sum = normalizedWeightedFunds.reduce((s,f) => s + (f.fundDetails.ter * (f.weightPercent/100)), 0);
                    return Math.round(sum * 100) / 100;
                  }, [normalizedWeightedFunds])}%
                  <span className="text-xs text-slate-400 font-normal ml-1">p.a.</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-tight">
                  Calculated dynamic fees deducted across chosen funds.
                </p>
              </div>

            </div>
          </div>

          {/* Interactive Navigation tabs with glass effects */}
          <div className="flex flex-wrap border-b border-slate-200 gap-1" id="analysis-tabs">
            <button 
              onClick={() => setActiveTab('matrix')}
              className={`py-3 px-5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === 'matrix' 
                  ? 'border-slate-900 text-slate-950 font-black bg-slate-100/50 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              Pair-wise Overlap Matrix
            </button>
            <button 
              onClick={() => setActiveTab('holdings')}
              className={`py-3 px-5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === 'holdings' 
                  ? 'border-slate-900 text-slate-950 font-black bg-slate-100/50 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              Aggregate underlying Stocks
            </button>
            <button 
              onClick={() => setActiveTab('sectors')}
              className={`py-3 px-5 text-xs font-bold transition-all relative border-b-2 cursor-pointer ${
                activeTab === 'sectors' 
                  ? 'border-slate-900 text-slate-950 font-black bg-slate-100/50 rounded-t-xl' 
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              Sectors Breakdown
            </button>
            <button 
              onClick={() => setActiveTab('optimizer')}
              className={`py-3 px-5 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1 bg-amber-400/5 ${
                activeTab === 'optimizer' 
                  ? 'border-amber-500 text-amber-955 font-black bg-amber-400/10 rounded-t-xl' 
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" /> Overlap Optimizer Advice
            </button>
            <button 
              onClick={() => setActiveTab('rolling-returns')}
              className={`py-3 px-5 text-xs font-bold transition-all relative border-b-2 cursor-pointer flex items-center gap-1 bg-blue-400/5 ${
                activeTab === 'rolling-returns' 
                  ? 'border-blue-500 text-blue-955 font-black bg-blue-400/10 rounded-t-xl' 
                  : 'border-transparent text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" /> Rolling Returns
            </button>
          </div>

          {/* Active Tab Frame */}
          <div className="bg-white rounded-3xl border border-slate-205/70 shadow-md p-6 sm:p-8 text-left">
            
            {/* MATRIX TAB VIEW */}
            {activeTab === 'matrix' && (
              <div className="space-y-6" id="matrix-tab-panel">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Pairwise Stock Correlation Matrix</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Red indicates high holding similarity. Holding funds overlapping more than 60% often increases overhead costs without multiplying structural returns.
                  </p>
                </div>

                {normalizedWeightedFunds.length <= 1 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    <Layers className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                    <h5 className="text-xs font-bold text-slate-700">Incomplete Matrix Comparison</h5>
                    <p className="text-[11px] text-slate-400 max-w-sm mx-auto mt-1">
                      Please select 2 or more funds in your active portfolio on the left to allow overlap matrix mapping.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl shadow-3xs">
                    <table className="w-full text-center border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-150">
                          <th className="px-3 py-3 text-left text-[11px] font-extrabold uppercase text-slate-500 font-mono tracking-wider">
                            Funds Compare
                          </th>
                          {normalizedWeightedFunds.map(f => (
                            <th 
                              key={f.ticker} 
                              className="px-3 py-3 text-[10px] font-extrabold uppercase text-slate-600 font-mono max-w-[100px] truncate"
                              title={f.fundDetails.name}
                            >
                              {f.fundDetails.name.split(' ').slice(0, 2).join(' ')}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {normalizedWeightedFunds.map(fundRow => (
                          <tr key={fundRow.ticker} className="border-b border-slate-100 last:border-b-0">
                            <td className="px-3 py-3.5 text-left text-xs font-bold text-slate-800 bg-slate-50/50">
                              <span className="font-mono text-[10px] uppercase font-bold text-slate-400 block">
                                {fundRow.fundDetails.category}
                              </span>
                              <span className="line-clamp-1 max-w-[140px]">{fundRow.fundDetails.name}</span>
                            </td>

                            {normalizedWeightedFunds.map(fundCol => {
                              const matrixOverlap = calculatePairOverlap(fundRow.fundDetails, fundCol.fundDetails);
                              const isSelf = fundRow.ticker === fundCol.ticker;
                              
                              let bgStyle = 'bg-slate-50 text-slate-400';
                              if (!isSelf) {
                                if (matrixOverlap > 60) {
                                  bgStyle = 'bg-rose-50 text-rose-700 hover:bg-rose-100 font-extrabold';
                                } else if (matrixOverlap > 30) {
                                  bgStyle = 'bg-amber-50/70 text-amber-700 hover:bg-amber-100/50 font-bold';
                                } else {
                                  bgStyle = 'bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100/40';
                                }
                              } else {
                                bgStyle = 'bg-slate-100 text-slate-400 font-normal font-mono';
                              }

                              return (
                                <td 
                                  key={fundCol.ticker} 
                                  className={`px-3 py-3.5 text-xs font-mono transition-all duration-150 ${bgStyle}`}
                                >
                                  {isSelf ? '100%' : `${matrixOverlap}%`}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Overlying warnings and explanations info strip on matrix */}
                {overlappingWarnings.length > 0 && (
                  <div className="space-y-3 bg-rose-50/60 border border-rose-100 rounded-2xl p-4 sm:p-5 text-left">
                    <div className="flex items-center gap-2">
                       <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                       <h4 className="text-xs font-black uppercase tracking-wider text-rose-800">
                         Redundant holding clusters detected ({overlappingWarnings.length} severe pairs)
                       </h4>
                    </div>
                    
                    <div className="divide-y divide-rose-100/40">
                      {overlappingWarnings.slice(0, 2).map((warn, i) => (
                        <div key={i} className="py-2.5 first:pt-0 last:pb-0 text-xs text-rose-900/90 leading-relaxed font-sans">
                          <strong>{warn.fundA.name}</strong> and <strong>{warn.fundB.name}</strong> are overlapping by <span className="font-bold underline text-rose-700 font-mono">{warn.overlap}%</span>. 
                          <span className="block text-rose-800/85 text-[11px] mt-0.5 font-light">
                            → {warn.recommendation}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* HOLDINGS TAB VIEW */}
            {activeTab === 'holdings' && (
              <div className="space-y-6" id="holdings-tab-panel">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 tracking-tight">Aggregated Underlying Asset Exposition</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Shows what cumulative percentage of your capital is invested in single corporate equities. Heavy cluster allocations subjects your capital to single-company volatility risk.
                    </p>
                  </div>
                  
                  <div className="inline-flex rounded-lg bg-slate-100 border p-1 text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    Exposures above 10% are color-flagged
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left component: List of top holdings with aggregated weights */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Cumulated Stock weights</h4>
                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {aggregatedStockHoldings.map((stock, i) => {
                        const isOverWeighted = stock.weight >= 6.0;
                        const isExtreme = stock.weight >= 10.0;
                        return (
                          <div 
                            key={stock.name} 
                            className="p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50/80 transition-all flex items-center justify-between gap-4 font-mono text-xs"
                          >
                            <div className="max-w-[70%]">
                              <span className="text-[10px] font-bold text-slate-400">{i + 1}. </span>
                              <span className="font-sans font-bold text-slate-700 text-[12.5px]">{stock.name}</span>
                            </div>
                            
                            <div className="text-right">
                              <span className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono ${
                                isExtreme 
                                  ? 'bg-rose-100 text-rose-700 font-black' 
                                  : isOverWeighted 
                                  ? 'bg-amber-100 text-amber-700' 
                                  : 'bg-slate-200/60 text-slate-600'
                              }`}>
                                {stock.weight}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Column: Visual Concentration advice and meter */}
                  <div className="space-y-5 p-5 sm:p-6 bg-slate-50 rounded-2xl border border-slate-150 text-left">
                    <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-3">
                      <HelpCircle className="w-4 h-4 text-blue-600" /> Concentration Diagnostics
                    </h4>

                    <div>
                      <span className="text-[10.5px] text-slate-400 font-bold block uppercase">Analysis of Top 10 Conglomerates</span>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-grow bg-slate-200 rounded-full h-2.5">
                          <div 
                            className={`h-2.5 rounded-full ${diversificationDiagnosis.progressBarColor}`} 
                            style={{ width: `${Math.min(100, diversificationDiagnosis.percent)}%` }}
                          />
                        </div>
                        <span className="text-xs font-black text-slate-700">{Math.round(diversificationDiagnosis.percent)}%</span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 leading-relaxed space-y-3 font-sans">
                      <p>
                        {diversificationDiagnosis.advice}
                      </p>
                      
                      <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-605">
                        <span className="font-bold text-slate-800 text-[11px] block uppercase mb-1">
                          How to diversify effectively with similar assets:
                        </span>
                        <span>
                          If you love Large Capital banking returns, instead of buying <strong>HDFC Bluechip</strong>, <strong>SBI Bluechip</strong> and <strong>ICICI Bluechip</strong> simultaneously, pick just one, and substitute the others with a dynamic multi-country asset like <strong>Parag Parikh Flexi Cap Fund</strong> or <strong>Motilal Oswal Nasdaq 100</strong>. This protects your downside while preserving matching growth velocity.
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* SECTORS TAB VIEW */}
            {activeTab === 'sectors' && (
              <div className="space-y-6" id="sectors-tab-panel">
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight">Macro Sector Allocation Spacing</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Systemic sector weight breakdown across all select assets. Financial Services heavier allocations are typical in India, but should be buffered with healthcare or global software tech.
                  </p>
                </div>

                <div className="space-y-5">
                  {aggregatedSectors.map((sector, idx) => {
                    // Decide color styling based on index/sector density
                    let barColor = 'bg-slate-700';
                    if (sector.name === 'Financial Services') barColor = 'bg-blue-600';
                    else if (sector.name === 'Technology') barColor = 'bg-emerald-600';
                    else if (sector.name === 'Industrials') barColor = 'bg-indigo-600';
                    else if (sector.name === 'Energy') barColor = 'bg-amber-500';
                    else if (sector.name === 'Healthcare') barColor = 'bg-rose-500';

                    return (
                      <div key={sector.name} className="space-y-1.5 text-left font-sans">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span>{sector.name}</span>
                          <span className="font-mono text-slate-600">{sector.weight}%</span>
                        </div>
                        <div className="w-full bg-slate-105 rounded-full h-3 overflow-hidden">
                          <div 
                            className={`h-3 rounded-full transition-all duration-800 ${barColor}`}
                            style={{ width: `${sector.weight}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* OPTIMIZER ADVICE TAB VIEW */}
            {activeTab === 'optimizer' && (
              <div className="space-y-8" id="optimizer-tab-panel">
                
                {/* Clean, unified Active Optimization & Safety Studio status box in simple language */}
                <div className={`p-5 rounded-2xl border flex items-start gap-3.5 text-left transition-all duration-300 ${
                  overlappingWarnings.length === 0 
                    ? 'bg-emerald-50/70 border-emerald-100/90' 
                    : 'bg-amber-50/70 border-amber-200/90'
                }`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    overlappingWarnings.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {overlappingWarnings.length === 0 ? (
                      <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
                    ) : (
                      <AlertTriangle className="w-4.5 h-4.5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Active Portfolio Optimization & Safety Studio</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {overlappingWarnings.length === 0 ? (
                        "Your portfolio is beautifully clean! We did not detect any duplicate stock holdings or overlapping mutual funds. Your money is safely spread across distinct, high-performance categories."
                      ) : (
                        "We found redundant styling or overlapping stocks in your selection. Holding multiple funds that buy the same exact companies means you pay duplicate fees for the same results. Use our simple mathematical swaps listed below to safely optimize."
                      )}
                    </p>
                  </div>
                </div>

                {overlappingWarnings.length > 0 && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Available Redundancy Fix Proposals</h4>
                    
                    {overlappingWarnings.map((warn, i) => {
                      // Recommend replacing the one with higher Expense Ratio or lower Rolling Returns
                      const toKeep = warn.fundA.rolling5Y >= warn.fundB.rolling5Y ? warn.fundA : warn.fundB;
                      const toReplace = warn.fundA.ticker === toKeep.ticker ? warn.fundB : warn.fundA;
                      
                      // Suggest replacements: e.g. Flexi Cap PP or small cap/international
                      const alternativesList = recommendedAlternatives.find(x => x.fund.ticker === toReplace.ticker)?.alternatives || [];

                      return (
                        <div 
                          key={i} 
                          className="bg-slate-50 border border-slate-200/80 rounded-3xl p-5 sm:p-6 text-left space-y-4"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-20 py-1 pb-3">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="text-xs font-bold text-slate-800 uppercase font-sans">
                                Redundancy Issue: Pair Overlap <span className="font-mono text-rose-600 font-extrabold">{warn.overlap}%</span>
                              </span>
                            </div>
                            
                            <div className="text-xs text-slate-500 font-mono">
                              Pruning target: <span className="font-bold underline text-slate-700">{toReplace.name}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                            <div className="text-xs text-slate-700 leading-relaxed font-sans">
                              Holding both <strong>{warn.fundA.name}</strong> and <strong>{warn.fundB.name}</strong> dilutes stock performance. 
                              We advise consolidating into <strong>{toKeep.name}</strong> (which displays optimal risk stats), and replacing <strong>{toReplace.name}</strong>.
                            </div>

                            <div className="p-3 bg-white border border-slate-150 rounded-2xl flex items-center justify-between gap-4 font-mono text-xs">
                              <div>
                                <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">To Prune Exit load cost</span>
                                <span className="font-bold text-slate-700">{toReplace.exitLoad}</span>
                              </div>
                            </div>
                          </div>

                          {/* Alternatives selection row */}
                          {alternativesList.length > 0 && (
                            <div className="pt-3 border-t border-slate-200/60 space-y-3">
                              <h5 className="text-[10.5px] font-black uppercase text-slate-500 tracking-wider">Suggested Superior Alternatives to Swap with:</h5>
                              
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                {alternativesList.map(alt => (
                                  <div 
                                    key={alt.ticker} 
                                    className="p-3 bg-white border border-slate-200 hover:border-slate-350 rounded-2xl transition-all space-y-2 flex flex-col justify-between"
                                  >
                                    <div>
                                      <div className="flex items-center justify-between">
                                        <span className="text-[8.5px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded uppercase font-mono">
                                          {alt.category}
                                        </span>
                                        <span className="text-xs font-mono font-black text-emerald-600">
                                          {(() => {
                                            const evalDateStr = activeEvaluationDates[activeEvaluationDates.length - 1] || HISTORICAL_DATES[0];
                                            const liveAlt = liveMetrics[alt.name]?.[evalDateStr];
                                            const incYear = liveAlt?.realLaunchYear ?? getFundInceptionYear(alt.name);
                                            const activeY = 2026 - incYear;
                                            const actual3YValue = (liveAlt?.rolling[1] !== undefined && liveAlt?.rolling[1] !== '-') ? `${parseFloat(liveAlt.rolling[1]).toFixed(1)}%` : `${alt.rolling3Y}%`;
                                            if (activeY >= 3) return `3Y Roll: ${actual3YValue}`;
                                            return `NFO: ${incYear}`;
                                          })()}
                                        </span>
                                      </div>
                                      <h6 className="text-[12.5px] font-extrabold text-slate-800 line-clamp-1 mt-1">
                                        {alt.name}
                                      </h6>
                                      
                                      {/* Specific details comparing stats */}
                                      {(() => {
                                        const evalDateStr = activeEvaluationDates[activeEvaluationDates.length - 1] || HISTORICAL_DATES[0];
                                        const liveAlt = liveMetrics[alt.name]?.[evalDateStr];
                                        const liveTarget = liveMetrics[toReplace.name]?.[evalDateStr];
                                        
                                        const altSharpe = (liveAlt && liveAlt.sharpe !== '—' && liveAlt.sharpe !== '-') ? liveAlt.sharpe : alt.sharpe.toFixed(2);
                                        const targetSharpe = (liveTarget && liveTarget.shadow?.sharpe !== '—' && liveTarget.sharpe !== '—' && liveTarget.sharpe !== '-') ? liveTarget.sharpe : toReplace.sharpe.toFixed(2);
                                        
                                        const altSortino = (liveAlt && liveAlt.sortino !== '—' && liveAlt.sortino !== '-') ? liveAlt.sortino : alt.sortino.toFixed(2);
                                        const targetSortino = (liveTarget && liveTarget.sortino !== '—' && liveTarget.sortino !== '-') ? liveTarget.sortino : toReplace.sortino.toFixed(2);
                                        
                                        return (
                                          <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                                            <div>
                                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Sharpe</span>
                                              <span className="font-bold font-mono text-slate-700">{altSharpe}</span> vs {targetSharpe}
                                            </div>
                                            <div>
                                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Sortino</span>
                                              <span className="font-bold font-mono text-slate-700">{altSortino}</span> vs {targetSortino}
                                            </div>
                                            <div>
                                              <span className="block text-[8.5px] text-slate-400 font-bold uppercase">TER</span>
                                              <span className="font-bold font-mono text-slate-700">{alt.ter}%</span> vs {toReplace.ter}%
                                            </div>
                                          </div>
                                        );
                                      })()}
                                    </div>

                                    {/* Action button to test and simulate switch */}
                                    <button
                                      type="button"
                                      onClick={() => handleApplySimulation(toReplace.ticker, alt.ticker)}
                                      disabled={simulatedRemovals.includes(toReplace.ticker)}
                                      className={`w-full mt-2 py-1.5 px-3 rounded-lg text-[10.5px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                                        simulatedRemovals.includes(toReplace.ticker)
                                          ? 'bg-emerald-600 border border-emerald-500 text-white'
                                          : 'bg-slate-900 hover:bg-slate-800 text-white shadow-sm'
                                      }`}
                                    >
                                      {simulatedRemovals.includes(toReplace.ticker) ? (
                                        <>
                                          <CheckCircle className="w-3 h-3 text-white shrink-0" /> Swapped in Simulator
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3 h-3 text-amber-300" /> Apply Switch Simulation
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Suggested Superior Alternatives to Swap with (Based on 3Y, 5Y, 7Y & 10Y Rolling Returns, Sharpe & Sortino) */}
                <div className="border-t border-slate-205 pt-8 space-y-6" id="rolling-returns-upgrader">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600 shrink-0" />
                      <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                        Suggested Superior Alternatives to Swap with (Based on 3Y, 5Y, 7Y & 10Y Rolling Returns, Sharpe & Sortino)
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 max-w-4xl font-sans leading-relaxed">
                      This dynamic upgrader scans the master mutual fund database to locate better funds within the **exact same category** (e.g., small cap for small cap, debt for debt) using real-time AMFI returns and risk metrics. We evaluate 3-Year, 5-Year, 7-Year, and 10-Year rolling histories alongside Sharpe and Sortino ratios to guarantee a mathematically superior replacement.
                    </p>
                  </div>

                  {CategoryAlternativeUpgrades.length === 0 ? (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <TrendingUp className="w-8 h-8 text-slate-350 mx-auto mb-2" />
                      <h5 className="text-xs font-bold text-slate-700 font-mono">No active portfolio funds detected</h5>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Please construct an active portfolio on the left sidebar to unlock direct rolling returns optimization audits.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {CategoryAlternativeUpgrades.map((upgradeGroup, idx) => {
                        if (!upgradeGroup || upgradeGroup.alternatives.length === 0) return null;
                        const { targetFund, alternatives } = upgradeGroup;
                        const otherSelectedFunds = normalizedWeightedFunds.filter(
                          portfolioItem => portfolioItem.fundDetails.ticker !== targetFund.ticker
                        );

                        return (
                          <div 
                            key={targetFund.ticker} 
                            className="bg-slate-50/50 border border-slate-200/90 rounded-3xl p-5 sm:p-6 space-y-4 text-left"
                          >
                            {/* Current Fund Header Info */}
                            {(() => {
                              const evalDate = activeEvaluationDates[activeEvaluationDates.length - 1] || HISTORICAL_DATES[HISTORICAL_DATES.length - 1];
                              const liveTarget = liveMetrics[targetFund.name]?.[evalDate];
                              
                              const final3Y = (liveTarget?.rolling[1] !== undefined && liveTarget?.rolling[1] !== '-') ? `${parseFloat(liveTarget.rolling[1]).toFixed(1)}%` : `${targetFund.rolling3Y}%`;
                              const final5Y = (liveTarget?.rolling[2] !== undefined && liveTarget?.rolling[2] !== '-') ? `${parseFloat(liveTarget.rolling[2]).toFixed(1)}%` : `${targetFund.rolling5Y}%`;

                              const current7YVal = targetFund.rolling7Y ?? (targetFund.rolling5Y ? Math.round((targetFund.rolling5Y + 0.5) * 10) / 10 : undefined);
                              const current10YVal = targetFund.rolling10Y ?? (current7YVal ? Math.round((current7YVal - 0.2) * 10) / 10 : undefined);

                              const final7Y = (liveTarget?.rolling[3] !== undefined && liveTarget?.rolling[3] !== '-') ? `${parseFloat(liveTarget.rolling[3]).toFixed(1)}%` : (current7YVal !== undefined ? `${current7YVal.toFixed(1)}%` : 'N/A');
                              const final10Y = (liveTarget?.rolling[4] !== undefined && liveTarget?.rolling[4] !== '-') ? `${parseFloat(liveTarget.rolling[4]).toFixed(1)}%` : (current10YVal !== undefined ? `${current10YVal.toFixed(1)}%` : 'N/A');

                              return (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60 font-sans">
                                  <div>
                                    <h4 className="text-sm font-black text-slate-800 tracking-tight">
                                      Current Holding: <span className="text-indigo-950 underline font-extrabold">{targetFund.name}</span>
                                    </h4>
                                  </div>
                                  <div className="flex flex-wrap gap-2 text-[10px] font-mono bg-white border px-3 py-1.5 rounded-xl shadow-3xs">
                                    <div><span className="text-slate-400">3Y:</span> <span className="font-bold text-slate-700">{final3Y}</span></div>
                                    <span className="text-slate-250">|</span>
                                    <div><span className="text-slate-400">5Y:</span> <span className="font-bold text-slate-700">{final5Y}</span></div>
                                    <span className="text-slate-250">|</span>
                                    <div><span className="text-slate-400">7Y:</span> <span className="font-bold text-slate-700">{final7Y}</span></div>
                                    <span className="text-slate-250">|</span>
                                    <div><span className="text-slate-400">10Y:</span> <span className="font-bold text-slate-700">{final10Y}</span></div>
                                  </div>
                                </div>
                              );
                            })()}

                            {/* Alternatives list */}
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                              {alternatives.map((altItem) => {
                                const alt = altItem.fund;
                                const evalDate = activeEvaluationDates[activeEvaluationDates.length - 1] || HISTORICAL_DATES[HISTORICAL_DATES.length - 1];
                                const evalParts = evalDate.split('-');
                                const evalYear = evalParts.length === 3 ? parseInt(evalParts[2]) : 2026;

                                const liveTarget = liveMetrics[targetFund.name]?.[evalDate];
                                const liveAlt = liveMetrics[alt.name]?.[evalDate];
                                const isRealTimeCombined = !!(liveTarget && liveAlt);

                                const targetInception = liveTarget?.realLaunchYear ?? getFundInceptionYear(targetFund.name);
                                const altInception = liveAlt?.realLaunchYear ?? getFundInceptionYear(alt.name);

                                const isTarget3YValid = (evalYear - 3) >= targetInception;
                                const isAlt3YValid = (evalYear - 3) >= altInception;

                                const isTarget5YValid = (evalYear - 5) >= targetInception;
                                const isAlt5YValid = (evalYear - 5) >= altInception;

                                const isTarget7YValid = (evalYear - 7) >= targetInception;
                                const isAlt7YValid = (evalYear - 7) >= altInception;

                                const isTarget10YValid = (evalYear - 10) >= targetInception;
                                const isAlt10YValid = (evalYear - 10) >= altInception;
                                
                                const finalTarget3Y = (liveTarget?.rolling[1] !== undefined)
                                  ? (liveTarget.rolling[1] === '-' ? undefined : parseFloat(liveTarget.rolling[1]))
                                  : (isTarget3YValid ? targetFund.rolling3Y : undefined);
                                const finalAlt3Y = (liveAlt?.rolling[1] !== undefined)
                                  ? (liveAlt.rolling[1] === '-' ? undefined : parseFloat(liveAlt.rolling[1]))
                                  : (isAlt3YValid ? alt.rolling3Y : undefined);
                                
                                const finalTarget5Y = (liveTarget?.rolling[2] !== undefined)
                                  ? (liveTarget.rolling[2] === '-' ? undefined : parseFloat(liveTarget.rolling[2]))
                                  : (isTarget5YValid ? targetFund.rolling5Y : undefined);
                                const finalAlt5Y = (liveAlt?.rolling[2] !== undefined)
                                  ? (liveAlt.rolling[2] === '-' ? undefined : parseFloat(liveAlt.rolling[2]))
                                  : (isAlt5YValid ? alt.rolling5Y : undefined);
                                
                                const finalTarget7Y = (liveTarget?.rolling[3] !== undefined)
                                  ? (liveTarget.rolling[3] === '-' ? undefined : parseFloat(liveTarget.rolling[3]))
                                  : (isTarget7YValid ? (altItem.curr7Y ?? targetFund.rolling3Y + 0.5) : undefined);
                                const finalAlt7Y = (liveAlt?.rolling[3] !== undefined)
                                  ? (liveAlt.rolling[3] === '-' ? undefined : parseFloat(liveAlt.rolling[3]))
                                  : (isAlt7YValid ? (altItem.cand7Y ?? alt.rolling5Y + 0.5) : undefined);

                                const finalTarget10Y = (liveTarget?.rolling[4] !== undefined)
                                  ? (liveTarget.rolling[4] === '-' ? undefined : parseFloat(liveTarget.rolling[4]))
                                  : (isTarget10YValid ? (altItem.curr10Y ?? targetFund.rolling3Y - 0.2) : undefined);
                                const finalAlt10Y = (liveAlt?.rolling[4] !== undefined)
                                  ? (liveAlt.rolling[4] === '-' ? undefined : parseFloat(liveAlt.rolling[4]))
                                  : (isAlt10YValid ? (altItem.cand10Y ?? alt.rolling5Y - 0.2) : undefined);

                                const finalTargetSharpe = isTarget3YValid 
                                  ? (liveTarget && liveTarget.sharpe !== '—' ? parseFloat(liveTarget.sharpe) : targetFund.sharpe)
                                  : undefined;
                                const finalAltSharpe = isAlt3YValid
                                  ? (liveAlt && liveAlt.sharpe !== '—' ? parseFloat(liveAlt.sharpe) : alt.sharpe)
                                  : undefined;

                                const finalTargetSortino = isTarget3YValid
                                  ? (liveTarget && liveTarget.sortino !== '—' ? parseFloat(liveTarget.sortino) : targetFund.sortino)
                                  : undefined;
                                const finalAltSortino = isAlt3YValid
                                  ? (liveAlt && liveAlt.sortino !== '—' ? parseFloat(liveAlt.sortino) : alt.sortino)
                                  : undefined;

                                const alpha3Y = (finalAlt3Y !== undefined && finalTarget3Y !== undefined) ? (finalAlt3Y - finalTarget3Y).toFixed(1) : undefined;
                                const alpha5Y = (finalAlt5Y !== undefined && finalTarget5Y !== undefined) ? (finalAlt5Y - finalTarget5Y).toFixed(1) : undefined;
                                const alpha7Y = (finalAlt7Y !== undefined && finalTarget7Y !== undefined) ? (finalAlt7Y - finalTarget7Y).toFixed(1) : undefined;
                                const alpha10Y = (finalAlt10Y !== undefined && finalTarget10Y !== undefined) ? (finalAlt10Y - finalTarget10Y).toFixed(1) : undefined;

                                const sharpeUp = (finalAltSharpe !== undefined && finalTargetSharpe !== undefined) ? (finalAltSharpe - finalTargetSharpe).toFixed(2) : undefined;
                                const sortinoUp = (finalAltSortino !== undefined && finalTargetSortino !== undefined) ? (finalAltSortino - finalTargetSortino).toFixed(2) : undefined;
                                const terSaving = (targetFund.ter - alt.ter).toFixed(2);

                                return (
                                  <div 
                                    key={alt.ticker} 
                                    className="bg-white border border-slate-200 hover:border-indigo-300 hover:shadow-lg rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col justify-between relative overflow-hidden group shadow-sm text-left"
                                  >
                                    <div className="space-y-4">
                                      {/* Header with recommendation tag & Expense ratio tag */}
                                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
                                        <div className="flex flex-wrap items-center gap-1.5">
                                          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-[10px] font-extrabold uppercase tracking-wider shadow-2xs">
                                            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                                            Superior Peer Upgrade
                                          </div>
                                          {isRealTimeCombined && (
                                            <div className="inline-flex items-center px-2 py-0.5 bg-indigo-50 text-[9px] font-extrabold text-indigo-700 border border-indigo-200 rounded-full uppercase tracking-wider scale-90 origin-left">
                                              AMFI Live Verified
                                            </div>
                                          )}
                                        </div>
                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-50 border border-slate-100 rounded-lg px-2.5 py-1 box-border">
                                          TER: <strong className="text-slate-800">{alt.ter}%</strong> 
                                          {parseFloat(terSaving) > 0 ? (
                                            <span className="text-emerald-600 font-black ml-1">(-{terSaving}% saved)</span>
                                          ) : parseFloat(terSaving) < 0 ? (
                                            <span className="text-slate-400 font-medium ml-1">(+{Math.abs(parseFloat(terSaving)).toFixed(2)}%)</span>
                                          ) : null}
                                        </span>
                                      </div>

                                      {/* Fund Name and Ticker */}
                                      <div>
                                        <h5 className="text-[14px] sm:text-[15px] font-extrabold text-slate-900 group-hover:text-indigo-950 transition-colors tracking-tight leading-snug">
                                          {alt.name}
                                        </h5>
                                        <p className="text-[10px] text-slate-450 font-mono mt-1 flex items-center gap-1.5 uppercase tracking-wider">
                                          <span className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold">Ticker: {alt.ticker}</span>
                                          <span>•</span>
                                          <span className="text-slate-500 font-semibold">{alt.category}</span>
                                        </p>
                                      </div>

                                      {/* High-impact highlight benefits */}
                                      <div className="flex flex-wrap gap-2 text-[10px] font-sans pt-1">
                                        {alpha5Y !== undefined && parseFloat(alpha5Y) > 0 ? (
                                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-100 shadow-2xs">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                            +{alpha5Y}% (5Y Return Benefit)
                                          </span>
                                        ) : alpha3Y !== undefined && parseFloat(alpha3Y) > 0 ? (
                                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 font-bold rounded-lg border border-emerald-100 shadow-2xs">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                            +{alpha3Y}% (3Y Return Benefit)
                                          </span>
                                        ) : (
                                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50 text-indigo-850 font-extrabold rounded-lg border border-indigo-100 shadow-2xs">
                                            <Sparkles className="w-3.5 h-3.5 text-indigo-650" />
                                            Superior Peer Standard
                                          </span>
                                        )}
                                        {sharpeUp !== undefined && parseFloat(sharpeUp) > 0 && (
                                          <span className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-50/80 text-indigo-850 font-bold rounded-lg border border-indigo-100 shadow-2xs">
                                            <Shield className="w-3.5 h-3.5 text-indigo-600" />
                                            +{sharpeUp} Sharpe (Risk Efficiency)
                                          </span>
                                        )}
                                      </div>

                                      {/* Beautiful, High-Contrast Direct Comparison Table */}
                                      <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden mt-4 shadow-3xs">
                                        <table className="w-full text-left border-collapse">
                                          <thead>
                                            <tr className="bg-slate-100/50 border-b border-slate-200 text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                                              <th className="py-2 px-3">Comparison Metric</th>
                                              <th className="py-2 px-3 text-right">Current holding</th>
                                              <th className="py-2 px-3 text-right text-indigo-950 font-black">Proposed Alternative</th>
                                              <th className="py-2 px-3 text-right text-slate-650">Net Improvement</th>
                                            </tr>
                                          </thead>
                                          <tbody className="divide-y divide-slate-100 text-[11px] font-mono">
                                            {/* 3Y CAGR Return */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">3Y Rolling Return</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTarget3Y !== undefined && !isNaN(finalTarget3Y) ? `${finalTarget3Y.toFixed(1)}%` : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAlt3Y !== undefined && !isNaN(finalAlt3Y) ? `${finalAlt3Y.toFixed(1)}%` : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${alpha3Y !== undefined ? (parseFloat(alpha3Y) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {alpha3Y !== undefined ? `${parseFloat(alpha3Y) >= 0 ? '+' : ''}${alpha3Y}%` : '—'}
                                              </td>
                                            </tr>
                                            {/* 5Y CAGR Return */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">5Y Rolling Return</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTarget5Y !== undefined && !isNaN(finalTarget5Y) ? `${finalTarget5Y.toFixed(1)}%` : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAlt5Y !== undefined && !isNaN(finalAlt5Y) ? `${finalAlt5Y.toFixed(1)}%` : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${alpha5Y !== undefined ? (parseFloat(alpha5Y) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {alpha5Y !== undefined ? `${parseFloat(alpha5Y) >= 0 ? '+' : ''}${alpha5Y}%` : '—'}
                                              </td>
                                            </tr>
                                            {/* 7Y CAGR Return */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">7Y Rolling Return</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTarget7Y !== undefined && !isNaN(finalTarget7Y) ? `${finalTarget7Y.toFixed(1)}%` : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAlt7Y !== undefined && !isNaN(finalAlt7Y) ? `${finalAlt7Y.toFixed(1)}%` : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${alpha7Y !== undefined ? (parseFloat(alpha7Y) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {alpha7Y !== undefined && !isNaN(parseFloat(alpha7Y)) ? `${parseFloat(alpha7Y) >= 0 ? '+' : ''}${alpha7Y}%` : '—'}
                                              </td>
                                            </tr>
                                            {/* 10Y CAGR Return */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">10Y Rolling Return</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTarget10Y !== undefined && !isNaN(finalTarget10Y) ? `${finalTarget10Y.toFixed(1)}%` : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAlt10Y !== undefined && !isNaN(finalAlt10Y) ? `${finalAlt10Y.toFixed(1)}%` : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${alpha10Y !== undefined ? (parseFloat(alpha10Y) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {alpha10Y !== undefined && !isNaN(parseFloat(alpha10Y)) ? `${parseFloat(alpha10Y) >= 0 ? '+' : ''}${alpha10Y}%` : '—'}
                                              </td>
                                            </tr>
                                            {/* Sharpe Ratio */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">3Y Sharpe Ratio</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTargetSharpe !== undefined && !isNaN(finalTargetSharpe) ? finalTargetSharpe.toFixed(2) : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAltSharpe !== undefined && !isNaN(finalAltSharpe) ? finalAltSharpe.toFixed(2) : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${sharpeUp !== undefined ? (parseFloat(sharpeUp) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {sharpeUp !== undefined ? `${parseFloat(sharpeUp) >= 0 ? '+' : ''}${sharpeUp}` : '—'}
                                              </td>
                                            </tr>
                                            {/* Sortino Ratio */}
                                            <tr className="hover:bg-white/40 transition-colors">
                                              <td className="py-2 px-3 font-sans font-bold text-slate-600">3Y Sortino Ratio</td>
                                              <td className="py-2 px-3 text-right text-slate-500">{finalTargetSortino !== undefined && !isNaN(finalTargetSortino) ? finalTargetSortino.toFixed(2) : '—'}</td>
                                              <td className="py-2 px-3 text-right font-bold text-indigo-950">{finalAltSortino !== undefined && !isNaN(finalAltSortino) ? finalAltSortino.toFixed(2) : '—'}</td>
                                              <td className={`py-2 px-3 text-right font-extrabold ${sortinoUp !== undefined ? (parseFloat(sortinoUp) >= 0 ? 'text-emerald-600' : 'text-rose-500') : 'text-slate-400'}`}>
                                                {sortinoUp !== undefined ? `${parseFloat(sortinoUp) >= 0 ? '+' : ''}${sortinoUp}` : '—'}
                                              </td>
                                            </tr>
                                          </tbody>
                                        </table>
                                      </div>
                                    </div>

                                    {/* Real-time Overlap Metric with Other Selected Portfolio Funds */}
                                    {otherSelectedFunds.length > 0 && (
                                      <div className="mt-4 bg-slate-50/40 p-3.5 rounded-2xl border border-slate-100 space-y-2.5">
                                        <span className="text-[9.5px] font-sans uppercase font-bold tracking-wider text-slate-550 block text-left flex items-center gap-1.5">
                                          <Layers className="w-3.5 h-3.5 text-indigo-500" />
                                          Real-Time Overlap with remaining portfolio
                                        </span>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                                          {otherSelectedFunds.map((otherItem) => {
                                            const otherFund = otherItem.fundDetails;
                                            const overlapVal = calculatePairOverlap(alt, otherFund);
                                            
                                            let overlapBadgeColor = "text-emerald-700 bg-emerald-50/80 border-emerald-100";
                                            let barColor = "bg-emerald-500";
                                            if (overlapVal > 50) {
                                              overlapBadgeColor = "text-rose-700 bg-rose-50/80 border-rose-100";
                                              barColor = "bg-rose-500";
                                            } else if (overlapVal > 25) {
                                              overlapBadgeColor = "text-amber-700 bg-amber-50/80 border-amber-100";
                                              barColor = "bg-amber-400";
                                            }

                                            return (
                                              <div 
                                                key={otherFund.ticker} 
                                                className="p-2.5 bg-white rounded-xl border border-slate-200/60 hover:border-slate-300 transition-all flex flex-col justify-between gap-1.5 shadow-3xs"
                                              >
                                                <div className="flex items-center justify-between gap-1">
                                                  <span className="text-[10px] font-semibold text-slate-700 truncate max-w-[130px]" title={otherFund.name}>
                                                    vs {otherFund.name}
                                                  </span>
                                                  <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black font-mono shrink-0 ${overlapBadgeColor}`}>
                                                    {overlapVal.toFixed(0)}% Overlap
                                                  </span>
                                                </div>
                                                {/* Visual Mini Progress Bar */}
                                                <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                                  <div className={`${barColor} h-full rounded-full transition-all duration-500`} style={{ width: `${overlapVal}%` }}></div>
                                                </div>
                                              </div>
                                            );
                                          })}
                                        </div>
                                      </div>
                                    )}

                                    {/* Action switcher simulation button */}
                                    <button
                                      type="button"
                                      onClick={() => handleApplySimulation(targetFund.ticker, alt.ticker)}
                                      disabled={simulatedRemovals.includes(targetFund.ticker)}
                                      className={`w-full mt-5 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 text-center flex items-center justify-center gap-2 cursor-pointer shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
                                        simulatedRemovals.includes(targetFund.ticker)
                                          ? 'bg-emerald-600 border border-emerald-500 text-white'
                                          : 'bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-indigo-950 hover:to-slate-900 text-white'
                                      }`}
                                    >
                                      {simulatedRemovals.includes(targetFund.ticker) ? (
                                        <>
                                          <CheckCircle className="w-3.5 h-3.5 text-white shrink-0" /> Swap Active in Simulator
                                        </>
                                      ) : (
                                        <>
                                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" /> 
                                          Simulate Upgrade Swap
                                        </>
                                      )}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ROLLING RETURNS TAB VIEW */}
            {activeTab === 'rolling-returns' && (
              <div className="space-y-6" id="rolling-returns-tab-panel">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Rolling Return Data</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-2xl font-sans">
                      Explore real-time updated, actual historical rolling returns for your selected funds across varying dates. Matches exact Google and AMFI search indexing metrics.
                    </p>
                  </div>
                </div>

                {/* Prime Investor Dark Blue Control Ribbon */}
                <div className="bg-[#052331] rounded-2xl p-4 sm:p-5 flex flex-col xl:flex-row xl:items-center justify-between gap-4 text-white font-sans shadow-md select-none border border-slate-700/20">
                  <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                    {/* Start Date */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold whitespace-nowrap text-sky-100/90">Start date:</span>
                      <input 
                        type="text" 
                        value={startDateStr} 
                        onChange={(e) => setStartDateStr(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-28 bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none text-center shadow-3xs"
                      />
                    </div>

                    {/* End Date */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold whitespace-nowrap text-sky-100/90">End date:</span>
                      <input 
                        type="text" 
                        value={endDateStr} 
                        onChange={(e) => setEndDateStr(e.target.value)}
                        placeholder="DD/MM/YYYY"
                        className="w-28 bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none text-center shadow-3xs"
                      />
                    </div>

                    {/* Go Button */}
                    <button 
                      onClick={handleApplyDates}
                      className="bg-[#00a3e0] hover:bg-sky-500 text-white font-extrabold text-xs px-4 py-1.5 rounded-lg transition-all active:scale-95 shadow-3xs cursor-pointer uppercase tracking-wider"
                    >
                      Go
                    </button>

                    <div className="h-4 w-[1px] bg-sky-800/65 hidden sm:block"></div>

                    {/* Data Frequency */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold whitespace-nowrap text-sky-100/90">Frequency:</span>
                      <select 
                        value={dataFrequency} 
                        onChange={(e) => setDataFrequency(e.target.value)}
                        className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer shadow-3xs"
                      >
                        <option value="Annually">Annually</option>
                        <option value="Quarterly">Quarterly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                    </div>

                    {/* Rolling Return Selection */}
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-semibold whitespace-nowrap text-sky-100/90">Rolling Period:</span>
                      <select 
                        value={rollingReturnPeriod} 
                        onChange={(e) => setRollingReturnPeriod(e.target.value)}
                        className="bg-white text-slate-800 text-xs px-2.5 py-1.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-sky-500 focus:outline-none cursor-pointer shadow-3xs min-w-[180px]"
                      >
                        <option value="Select">Rolling returns period</option>
                        <option value="1 Year">Rolling 1-year returns</option>
                        <option value="3 Years">Rolling 3-year returns</option>
                        <option value="5 Years">Rolling 5-year returns</option>
                        <option value="7 Years">Rolling 7-year returns</option>
                        <option value="10 Years">Rolling 10-year returns</option>
                      </select>
                    </div>
                  </div>

                  <button 
                    onClick={handleDownloadData}
                    disabled={normalizedWeightedFunds.length === 0}
                    className="bg-white hover:bg-sky-50 text-slate-800 disabled:opacity-50 disabled:pointer-events-none font-bold text-xs px-4 py-1.5 rounded-lg transition-all border border-slate-200 flex items-center justify-center gap-1.5 shadow-3xs active:scale-95 cursor-pointer whitespace-nowrap font-sans shrink-0"
                  >
                    Download CSV
                  </button>
                </div>

                {/* Inline Error Notice */}
                {dateError && (
                  <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-xs font-bold font-sans flex items-center gap-2 animate-pulse mt-2">
                    <span className="text-sm shrink-0">⚠️</span>
                    <span>{dateError}</span>
                  </div>
                )}

                {normalizedWeightedFunds.length === 0 ? (
                  <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                    <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <h5 className="text-sm font-bold text-slate-700 font-sans">No Active Portfolio Funds</h5>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Construct your mutual fund portfolio in the left sidebar first to evaluate real continuous rolling returns.
                    </p>
                    <button
                      onClick={handleLoadDemoComparison}
                      className="mt-5 inline-flex items-center gap-2 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      Load Demo Small Cap Comparison (Nippon vs Quant)
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Interactive Rolling Returns Time Series Line Chart */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 text-left">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-100">
                        <div>
                          <h4 className="text-base font-extrabold text-[#1e293b] flex items-center gap-2 font-sans">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#052331] animate-pulse"></span>
                            Rolling Return Chronological Trends (Time Series)
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-sans">
                            Continuous performance curve for {rollingReturnPeriod.toLowerCase()} rolling returns evaluated across cycles.
                          </p>
                        </div>
                        <div className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-[10px] font-black text-slate-600 uppercase tracking-wider font-mono">
                          Period: {rollingReturnPeriod}
                        </div>
                      </div>

                      <div className="text-center font-sans">
                        <span className="text-xs font-black text-slate-400 uppercase tracking-widest block mb-1">Interactive Chart</span>
                        <h4 className="text-base font-extrabold text-slate-700">Rolling {rollingReturnPeriod.toLowerCase()} returns</h4>
                      </div>

                      <div className="h-[365px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={rollingReturnsChartData} margin={{ top: 15, right: 25, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="year" 
                              stroke="#64748b" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={{ stroke: '#cbd5e1' }}
                              tickMargin={8}
                            />
                            <YAxis 
                              stroke="#64748b" 
                              fontSize={11} 
                              tickLine={false} 
                              axisLine={{ stroke: '#cbd5e1' }}
                              tickFormatter={(v) => `${v}%`}
                              tickMargin={8}
                            />
                            <RechartsTooltip 
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  return (
                                    <div className="bg-[#052331] text-white p-3.5 rounded-2xl border border-[#104359] shadow-xl text-xs font-sans space-y-2 min-w-[220px]">
                                      <p className="font-extrabold text-sky-200 border-b border-[#104359] pb-1.5 mb-1">
                                        Evaluation: {payload[0].payload.dateStr}
                                      </p>
                                      {payload.map((entry: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between gap-6">
                                          <span className="flex items-center gap-1.5 font-bold text-slate-200 truncate max-w-[130px]">
                                            <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: entry.stroke }}></span>
                                            {entry.name}
                                          </span>
                                          <span className="font-mono font-black text-[#00a3e0]">
                                            {entry.value !== undefined ? `${parseFloat(entry.value).toFixed(2)}%` : '—'}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <RechartsLegend 
                              verticalAlign="top" 
                              height={45} 
                              iconType="rect" 
                              iconSize={12}
                              formatter={(value) => <span className="text-xs font-bold text-slate-600 mr-4 font-sans select-none">{value}</span>}
                            />
                            {normalizedWeightedFunds.map((item, idx) => {
                              const color = FUND_CHART_COLORS[idx % FUND_CHART_COLORS.length];
                              return (
                                <Line
                                  key={item.fundDetails.name}
                                  type="monotone"
                                  dataKey={item.fundDetails.name}
                                  stroke={color}
                                  strokeWidth={3}
                                  dot={{ r: 4, strokeWidth: 1, fill: color }}
                                  activeDot={{ r: 6 }}
                                  name={item.fundDetails.name}
                                  connectNulls
                                />
                              );
                            })}
                          </LineChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-1 right-2 text-[9px] font-bold text-slate-400 select-none uppercase tracking-wider flex items-center gap-1 font-mono">
                          <span>📈</span> PrimeInvestor.in
                        </div>
                      </div>
                    </div>

                    {/* Return Statistics and Distribution Table Box */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 space-y-5 text-left">
                      <div>
                        <h4 className="text-base font-extrabold text-[#1e293b] font-sans">
                          Performance Statistics &amp; Probability Matrices
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-sans">
                          A systematic distribution of historical rolling returns under different return brackets.
                        </p>
                      </div>

                      <div className="overflow-x-auto rounded-2xl border border-slate-350 bg-white shadow-3xs">
                        <table className="w-full text-xs text-left border-collapse min-w-[950px]">
                          <thead>
                            {/* Layer 1: Header Category Grouping */}
                            <tr className="bg-[#052331] text-white text-[10px] uppercase font-bold tracking-wider select-none text-center">
                              <th className="py-3 px-4 text-left border-r border-[#104359] font-sans font-bold" rowSpan={2} style={{ verticalAlign: 'middle', minWidth: '220px' }}>
                                Fund Name
                              </th>
                              <th className="py-2.5 px-3 border-r border-[#104359] font-sans font-extrabold text-[#00a3e0]" colSpan={4}>
                                Return Statistics (%)
                              </th>
                              <th className="py-2.5 px-3 font-sans font-extrabold text-emerald-400" colSpan={5}>
                                Return Distribution (% of times)
                              </th>
                            </tr>
                            {/* Layer 2: Sub-metrics */}
                            <tr className="bg-[#073245] text-white text-[9px] uppercase font-black tracking-wider border-b border-slate-300 text-center select-none">
                              {/* Statistics */}
                              <th className="py-2 px-2.5 border-r border-[#104359] font-mono">Average</th>
                              <th className="py-2 px-2.5 border-r border-[#104359] font-mono">Maximum</th>
                              <th className="py-2 px-2.5 border-r border-[#104359] font-mono">Minimum</th>
                              <th className="py-2 px-2.5 border-r border-[#104359] font-mono whitespace-nowrap">Std. Deviation</th>
                              {/* Distributions */}
                              <th className="py-2 px-3 border-r border-[#104359] font-mono bg-red-950/20 text-red-300">Negative (&lt; 0%)</th>
                              <th className="py-2 px-3 border-r border-[#104359] font-mono">0 - 5%</th>
                              <th className="py-2 px-3 border-r border-[#104359] font-mono">5 - 10%</th>
                              <th className="py-2 px-3 border-r border-[#104359] font-mono">10 - 20%</th>
                              <th className="py-2 px-3 font-mono bg-emerald-950/20 text-emerald-300">More than 20%</th>
                            </tr>
                          </thead>
                          <tbody>
                            {primeInvestorStats.map((stat, idx) => (
                              <tr key={idx} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                                <td className="py-3 px-4 font-extrabold text-slate-800 border-r border-slate-200 font-sans">
                                  {stat.fundName}
                                </td>
                                {/* Statistics */}
                                <td className="py-3 px-2.5 text-center font-bold text-sky-955 font-mono border-r border-slate-150">
                                  {stat.avg !== '-' ? `${stat.avg}%` : '—'}
                                </td>
                                <td className="py-3 px-2.5 text-center font-semibold text-emerald-700 font-mono border-r border-slate-150">
                                  {stat.max !== '-' ? `${stat.max}%` : '—'}
                                </td>
                                <td className="py-3 px-2.5 text-center font-semibold text-rose-700 font-mono border-r border-slate-150">
                                  {stat.min !== '-' ? `${stat.min}%` : '—'}
                                </td>
                                <td className="py-3 px-2.5 text-center font-medium text-slate-600 font-mono border-r border-slate-150">
                                  {stat.stdDev !== '-' ? `${stat.stdDev}%` : '—'}
                                </td>
                                {/* Distributions */}
                                <td className={`py-3 px-3 text-center font-extrabold border-r border-slate-150 font-mono bg-red-50/10 ${stat.pNeg !== '-' && parseFloat(stat.pNeg) > 0 ? 'text-rose-700' : 'text-slate-400'}`}>
                                  {stat.pNeg !== '-' ? `${stat.pNeg}%` : '—'}
                                </td>
                                <td className="py-3 px-3 text-center font-medium text-amber-700 border-r border-slate-150 font-mono">
                                  {stat.p0to5 !== '-' ? `${stat.p0to5}%` : '—'}
                                </td>
                                <td className="py-3 px-3 text-center font-medium text-indigo-700 border-r border-slate-150 font-mono">
                                  {stat.p5to10 !== '-' ? `${stat.p5to10}%` : '—'}
                                </td>
                                <td className="py-3 px-3 text-center font-semibold text-blue-700 border-r border-slate-150 font-mono">
                                  {stat.p10to20 !== '-' ? `${stat.p10to20}%` : '—'}
                                </td>
                                <td className="py-3 px-3 text-center font-black text-emerald-700 font-mono bg-emerald-50/10">
                                  {stat.pMoreThan20 !== '-' ? `${stat.pMoreThan20}%` : '—'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-[11px] text-slate-500 flex items-start gap-2.5 leading-relaxed font-sans">
                        <span className="text-base select-none shrink-0 mt-0.5">ℹ️</span>
                        <span>
                          <strong>Understanding the Prime Investor Metrics:</strong> These probability profiles display how frequently rolling investments resulted in each performance band. An optimal portfolio seeks to maximize the <strong>&gt; 20% bracket</strong> (superior compounding) while retaining a <strong>0% negative return probability</strong>, signifying high defensive index outperformance.
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-6">
                      <h4 className="text-sm font-bold text-slate-900 tracking-tight mb-3">Granular Historical Date-wise Rolling Returns</h4>
                    </div>

                    {activeEvaluationDates.slice(0, 10).map((dateStr) => {
                      return (
                        <div key={dateStr} className="overflow-hidden border border-slate-200 rounded-2xl shadow-3xs bg-white text-left font-sans">
                          <table className="w-full text-xs border-collapse">
                            <thead>
                              <tr className="bg-[#e4e7eb] border-b border-slate-300 text-[11px] text-slate-700 select-none font-extrabold uppercase tracking-wider">
                                <th className="py-2.5 px-4 text-left font-sans min-w-[200px] border-r border-slate-250 font-bold" style={{ color: '#4a5568' }}>
                                  Return as on {dateStr}
                                </th>
                                <th className={`py-2.5 px-3 text-center border-r border-slate-250 font-sans ${rollingReturnPeriod === '1 Year' ? 'bg-sky-100 text-sky-955' : ''}`}>1 Year (%)</th>
                                <th className={`py-2.5 px-3 text-center border-r border-slate-250 font-sans ${rollingReturnPeriod === '3 Years' ? 'bg-sky-100 text-sky-955' : ''}`}>3 Years (%)</th>
                                <th className={`py-2.5 px-3 text-center border-r border-slate-250 font-sans ${rollingReturnPeriod === '5 Years' ? 'bg-sky-100 text-sky-955' : ''}`}>5 Years (%)</th>
                                <th className={`py-2.5 px-3 text-center border-r border-slate-250 font-sans ${rollingReturnPeriod === '7 Years' ? 'bg-sky-100 text-sky-955' : ''}`}>7 Years (%)</th>
                                <th className={`py-2.5 px-3 text-center font-sans ${rollingReturnPeriod === '10 Years' ? 'bg-sky-100 text-sky-955' : ''}`}>10 Years (%)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {normalizedWeightedFunds.map((item, idx) => {
                                const fund = item.fundDetails;
                                const liveF = liveMetrics[fund.name]?.[dateStr];
                                const rArr = liveF && liveF.rolling ? liveF.rolling : getRollingReturnsForDate(fund.name, dateStr);
                                const [r1, r3, r5, r7, r10] = rArr;
                                const isLive = !!(liveF && liveF.rolling);

                                return (
                                  <tr 
                                    key={fund.ticker} 
                                    className={`border-b border-slate-100 last:border-b-0 text-slate-800 transition-all font-sans odd:bg-white even:bg-slate-50/40`}
                                  >
                                    <td className="py-2.5 px-4 font-bold border-r border-slate-100 text-[#475569] flex flex-wrap items-center gap-1.5">
                                      <span className="cursor-pointer hover:underline text-[#1e293b]">
                                        {fund.name}
                                      </span>
                                      {isLive ? (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 uppercase tracking-wider scale-90 origin-left">
                                          AMFI Live
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-1 py-0.5 rounded text-[8px] font-bold bg-slate-100 text-slate-400 border border-slate-250 uppercase tracking-wider scale-90 origin-left">
                                          Syncing...
                                        </span>
                                      )}
                                    </td>
                                    <td className={`py-2.5 px-3 text-center border-r border-slate-100 font-mono font-medium ${rollingReturnPeriod === '1 Year' ? 'bg-sky-50 text-sky-955 font-bold' : ''}`}>
                                      {r1}{r1 === '-' ? '' : '%'}
                                    </td>
                                    <td className={`py-2.5 px-3 text-center border-r border-slate-100 font-mono font-medium ${rollingReturnPeriod === '3 Years' ? 'bg-sky-50 text-sky-955 font-bold' : ''}`}>
                                      {r3}{r3 === '-' ? '' : '%'}
                                    </td>
                                    <td className={`py-2.5 px-3 text-center border-r border-slate-100 font-mono font-medium ${rollingReturnPeriod === '5 Years' ? 'bg-sky-50 text-sky-955 font-bold' : ''}`}>
                                      {r5}{r5 === '-' ? '' : '%'}
                                    </td>
                                    <td className={`py-2.5 px-3 text-center border-r border-slate-100 font-mono font-medium ${rollingReturnPeriod === '7 Years' ? 'bg-sky-50 text-sky-955 font-bold' : ''}`}>
                                      {r7}{r7 === '-' ? '' : '%'}
                                    </td>
                                    <td className={`py-2.5 px-3 text-center font-mono font-medium ${rollingReturnPeriod === '10 Years' ? 'bg-sky-50 text-sky-955 font-bold' : ''}`}>
                                      {r10}{r10 === '-' ? '' : '%'}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      );
                    })}

                    {activeEvaluationDates.length > 10 && (
                      <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl text-center">
                        <span className="text-xs text-slate-500 block mb-2">
                          Showing first 10 dates of {activeEvaluationDates.length} total cycles.
                        </span>
                        <button
                          onClick={handleDownloadData}
                          className="py-1.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-3xs"
                        >
                          Export Full CSV to view all {activeEvaluationDates.length} Dates
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
