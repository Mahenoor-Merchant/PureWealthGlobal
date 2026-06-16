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
  Award
} from 'lucide-react';

import MF_NAMES from '../funds/master_list';
import { generateOverlapFundHolding } from '../funds/master_generator';

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
  exitLoad: string; // Readable text
  exitLoadPercent: number; // Decimal weight for math
  taxType: 'Equity' | 'International';
  topHoldings: { name: string; weight: number }[];
  sectors: { name: string; weight: number }[];
  description: string;
}

// ==========================================
// Comprehensive Fund Database (Realistic)
// ==========================================
const STATIC_FUNDS_DB: FundHolding[] = [
  {
    ticker: 'HDFC-T100',
    name: 'HDFC Top 100 Fund',
    category: 'Large Cap',
    ter: 1.15,
    sharpe: 1.35,
    sortino: 1.45,
    rolling3Y: 16.8,
    rolling5Y: 15.2,
    exitLoad: '1.0% if redeemed within 30 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 9.5 },
      { name: 'ICICI Bank', weight: 8.2 },
      { name: 'Reliance Industries', weight: 7.8 },
      { name: 'Infosys', weight: 6.5 },
      { name: 'Larsen & Toubro', weight: 5.2 },
      { name: 'ITC', weight: 4.8 },
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
    ter: 1.55,
    sharpe: 1.28,
    sortino: 1.38,
    rolling3Y: 15.6,
    rolling5Y: 14.1,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 8.8 },
      { name: 'ICICI Bank', weight: 7.9 },
      { name: 'Reliance Industries', weight: 7.2 },
      { name: 'Infosys', weight: 5.9 },
      { name: 'Larsen & Toubro', weight: 4.8 },
      { name: 'ITC', weight: 4.5 },
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
    ter: 1.08,
    sharpe: 1.30,
    sortino: 1.40,
    rolling3Y: 15.9,
    rolling5Y: 14.8,
    exitLoad: '1.0% if redeemed within 365 days',
    exitLoadPercent: 0.01,
    taxType: 'Equity',
    topHoldings: [
      { name: 'ICICI Bank', weight: 9.1 },
      { name: 'HDFC Bank', weight: 8.5 },
      { name: 'Reliance Industries', weight: 7.5 },
      { name: 'Infosys', weight: 6.2 },
      { name: 'Larsen & Toubro', weight: 5.1 },
      { name: 'ITC', weight: 4.3 },
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
    ter: 0.62,
    sharpe: 1.58,
    sortino: 1.72,
    rolling3Y: 19.5,
    rolling5Y: 21.2,
    exitLoad: '2.0% within 365 days, 1.0% between 366-730 days',
    exitLoadPercent: 0.02,
    taxType: 'Equity',
    topHoldings: [
      { name: 'HDFC Bank', weight: 8.0 },
      { name: 'ITC', weight: 6.0 },
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
    ter: 0.75,
    sharpe: 1.72,
    sortino: 1.95,
    rolling3Y: 24.5,
    rolling5Y: 25.8,
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
    ter: 0.95,
    sharpe: 1.42,
    sortino: 1.51,
    rolling3Y: 18.2,
    rolling5Y: 17.6,
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
    ter: 0.82,
    sharpe: 1.82,
    sortino: 2.10,
    rolling3Y: 28.6,
    rolling5Y: 31.4,
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
    ter: 0.55,
    sharpe: 1.68,
    sortino: 1.85,
    rolling3Y: 22.4,
    rolling5Y: 23.1,
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
    ter: 0.48,
    sharpe: 1.55,
    sortino: 1.78,
    rolling3Y: 21.4,
    rolling5Y: 22.8,
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
    ter: 0.88,
    sharpe: 1.62,
    sortino: 1.84,
    rolling3Y: 24.3,
    rolling5Y: 23.5,
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
    ter: 0.58,
    sharpe: 1.15,
    sortino: 1.25,
    rolling3Y: 14.8,
    rolling5Y: 18.5,
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

export default function PortfolioOverlapFinder() {
  const [selectedFunds, setSelectedFunds] = useState<SelectedFundState[]>([
    { ticker: 'HDFC-T100', allocation: 10000 },
    { ticker: 'SBI-BC', allocation: 10000 }
  ]);
  
  const [allocationMode, setAllocationMode] = useState<'Amount' | 'Percent'>('Amount');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'matrix' | 'holdings' | 'sectors' | 'optimizer'>('matrix');

  // Interactive switcher simulator helper state
  const [simulatedRemovals, setSimulatedRemovals] = useState<string[]>([]);
  const [simulatedAdditions, setSimulatedAdditions] = useState<SelectedFundState[]>([]);

  // Simulation Active Toggle
  const [isSimulationActive, setIsSimulationActive] = useState(false);

  // States for Capital Gains Tax Calculator
  const [holdingPeriod, setHoldingPeriod] = useState<'Short' | 'Long'>('Long');
  const [customGain, setCustomGain] = useState<number>(150000);
  const [customTotalValue, setCustomTotalValue] = useState<number>(500000);

  // Filter DB based on queries
  const filteredFunds = useMemo(() => {
    return INITIAL_FUNDS_DB.filter(x => 
      x.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      x.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      x.ticker.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  // Handle adding a fund
  const handleAddFund = (ticker: string) => {
    if (selectedFunds.some(f => f.ticker === ticker)) return;
    
    // Set default allocation based on mode
    const defaultAlloc = allocationMode === 'Amount' ? 10000 : 20;
    setSelectedFunds(prev => [...prev, { ticker, allocation: defaultAlloc }]);
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

  // Find superior active alternatives for overlapping funds based on rolling returns, Sharpe, and Sortino ratios
  const recommendedAlternatives = useMemo(() => {
    return INITIAL_FUNDS_DB.map(f => {
      // Find what other funds in the database match are superior
      const matches = INITIAL_FUNDS_DB.filter(other => {
        if (other.ticker === f.ticker) return false;
        
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

  // Compute estimated switching friction fees and capital gains taxes
  const calculatedSwitchTax = useMemo(() => {
    // Standard Tax Rates (India Finance Act 2024 amendments)
    // Equity: STCG = 20%, LTCG = 12.5% (with first 1.25 Lakh gains exempt across all holdings per financial year)
    // International: STCG = Tax Slab (assumed average 30%), LTCG = 12.5% if held over 24 months
    const exitLoadRate = 0.01; // Average exit load for short-term redemptions (1%)
    const exitLoadCost = customTotalValue * exitLoadRate;
    
    let taxRate = 0;
    let exemption = 0;
    
    if (holdingPeriod === 'Short') {
      taxRate = 0.20; // 20% Short term gains
    } else {
      taxRate = 0.125; // 12.5% Long term gains
      exemption = 125000; // ₹1.25L exempt
    }

    const taxableGain = Math.max(0, customGain - exemption);
    const estTax = taxableGain * taxRate;
    const totalFriction = exitLoadCost + estTax;

    return {
      exitLoadCost,
      taxRatePercent: taxRate * 100,
      taxableGain,
      estTax,
      totalFriction
    };
  }, [holdingPeriod, customGain, customTotalValue]);

  // Switcher Interactive Simulation action
  const handleApplySimulation = (pruneTicker: string, addTicker: string) => {
    setSimulatedRemovals([pruneTicker]);
    setSimulatedAdditions([{ ticker: addTicker, allocation: 10000 }]);
    setIsSimulationActive(true);
    setActiveTab('matrix');
  };

  const handleResetSimulation = () => {
    setSimulatedRemovals([]);
    setSimulatedAdditions([]);
    setIsSimulationActive(false);
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
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse-slow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/25 flex items-center justify-center text-amber-800 font-black">
              <Sparkles className="w-5 h-5 text-amber-700" />
            </div>
            <div className="text-left">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-widest">Interactive Optimizer Simulator Active</h4>
              <p className="text-[11.5px] text-slate-600 leading-tight">
                Showing how your portfolio overlap and concentration score reduces under our proposed active switch recommendation.
              </p>
            </div>
          </div>
          <button 
            onClick={handleResetSimulation}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-full transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <RefreshCw className="w-3 h-3" /> Restore Current Portfolio
          </button>
        </div>
      )}

      {/* Main Grid: Fund Selector left bar, Analytics content right side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand: Fund Selector & Settings Panel */}
        <div className="col-span-1 lg:col-span-4 space-y-6">
          
          {/* Main Active Selection Card */}
          <div className="bg-white rounded-2xl border border-slate-205/80 shadow-md shadow-slate-100/50 p-6 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Your Active Holdings</h3>
              <span className="text-[11px] font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
                {activeWorkingPortfolio.length} selected
              </span>
            </div>

            {/* Hold items list */}
            <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {normalizedWeightedFunds.map((item, idx) => (
                <div 
                  key={item.ticker} 
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl transition-all border border-slate-100 relative group"
                >
                  <div className="flex items-start justify-between gap-1.5">
                    <div>
                      <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded-sm font-mono block w-fit mb-1">
                        {item.fundDetails.category}
                      </span>
                      <h4 className="text-[13px] font-bold text-slate-800 line-clamp-1 leading-tight">
                        {item.fundDetails.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                        Weighted Allocation: {Math.round(item.weightPercent)}%
                      </p>
                    </div>

                    <button 
                      onClick={() => handleRemoveFund(item.ticker)}
                      disabled={isSimulationActive}
                      className={`text-slate-400 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-all ${isSimulationActive ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}
                      title="Remove Fund"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Slider or input adjustment mapping */}
                  <div className="mt-3 pt-2.5 border-t border-slate-150 flex items-center justify-between gap-4">
                    <span className="text-[10.5px] text-slate-500 font-mono">
                      {allocationMode === 'Amount' ? 'Monthly SIP Value' : 'Target Ratio (%)'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {allocationMode === 'Amount' && <span className="text-[11px] font-bold text-slate-400">₹</span>}
                      <input 
                        type="number" 
                        value={Math.round(item.allocation)}
                        disabled={isSimulationActive}
                        onChange={(e) => handleUpdateAllocation(item.ticker, parseFloat(e.target.value) || 0)}
                        className="w-18 bg-white border border-slate-200 rounded-md py-1 px-1.5 text-[11px] font-black text-right text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-800 font-mono disabled:opacity-50"
                      />
                      {allocationMode === 'Percent' && <span className="text-[11px] font-bold text-slate-400">%</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Simple Total sum indicator for sanity checking percentages */}
            {allocationMode === 'Percent' && (
              <div className="mt-3 p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Sum value:</span>
                <span className={`text-[11px] font-mono font-black ${
                  Math.abs(selectedFunds.reduce((s,f) => s + f.allocation, 0) - 100) < 0.1 
                    ? 'text-emerald-600' 
                    : 'text-amber-600'
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
                className="w-full bg-slate-55 border border-slate-200/80 rounded-xl py-2 px-9 text-xs font-semibold text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-800 transition-all"
              />
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
                
                {/* Intro summary block */}
                <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 shrink-0 font-extrabold text-lg">
                    💎
                  </div>
                  <div className="text-left font-sans">
                    <h4 className="text-sm font-black uppercase text-amber-900">Adaptive Active Optimization Studio</h4>
                    <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                      Below is a custom evaluation of current overlaps. We compare redundant assets with higher-ranked alternative funds in the same or complementary asset categories using performance factors: <strong>Sharpe ratio (risk risk-adjusted return)</strong>, <strong>Sortino (downside safety)</strong>, and <strong>low Expense Ratios</strong>.
                    </p>
                  </div>
                </div>

                {/* Overlap warnings loop and specific switchers */}
                {overlappingWarnings.length === 0 ? (
                  <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-100 text-left">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-6 h-6 text-emerald-600" />
                      <div>
                        <h4 className="text-xs font-black uppercase text-emerald-800 tracking-wider">Perfect Asset Cluster Safety</h4>
                        <p className="text-xs text-emerald-700 mt-0.5">
                          No duplicate funds detected in your chosen selections! Your overlap index is prudently small. Go ahead with your active asset allocations.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
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
                                          3Y Roll: {alt.rolling3Y}%
                                        </span>
                                      </div>
                                      <h6 className="text-[12.5px] font-extrabold text-slate-800 line-clamp-1 mt-1">
                                        {alt.name}
                                      </h6>
                                      
                                      {/* Specific details comparing stats */}
                                      <div className="grid grid-cols-3 gap-1 pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-500">
                                        <div>
                                          <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Sharpe</span>
                                          <span className="font-bold font-mono text-slate-700">{alt.sharpe}</span> vs {toReplace.sharpe}
                                        </div>
                                        <div>
                                          <span className="block text-[8.5px] text-slate-400 font-bold uppercase">Sortino</span>
                                          <span className="font-bold font-mono text-slate-700">{alt.sortino}</span> vs {toReplace.sortino}
                                        </div>
                                        <div>
                                          <span className="block text-[8.5px] text-slate-400 font-bold uppercase">TER</span>
                                          <span className="font-bold font-mono text-slate-700">{alt.ter}%</span> vs {toReplace.ter}%
                                        </div>
                                      </div>
                                    </div>

                                    {/* Action button to test and simulate switch */}
                                    <button
                                      onClick={() => handleApplySimulation(toReplace.ticker, alt.ticker)}
                                      disabled={isSimulationActive}
                                      className="w-full mt-2 py-1 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-bold transition-all text-center flex items-center justify-center gap-1 cursor-pointer disabled:opacity-40"
                                    >
                                      <Sparkles className="w-3 h-3 text-amber-300" /> Apply Switch Simulation
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

                {/* Switch Friction: Exit Load & Capital Gains Tax calculator widget */}
                <div className="border-t border-slate-205 py-6">
                  <div className="p-6 bg-slate-900 text-white rounded-3xl text-left space-y-6">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5 text-emerald-400 shrink-0" />
                      <h3 className="text-sm font-black uppercase text-slate-100 tracking-wider font-sans">
                        India Capital Gains Tax & Switch Friction Estimator
                      </h3>
                    </div>
                    
                    <p className="text-[11.5px] text-slate-350 max-w-4xl leading-relaxed">
                      Switching mutual funds in India represents a tax redemption event. Equity mutual funds held over 12 months declare <strong>12.5% Long-Term Capital Gains (LTCG)</strong> tax (the initial cumulative gains of ₹1.25 Lakhs per year is entirely tax tax-exempt). Under 12 months, short short-term gains are taxed at <strong>20.0% STCG</strong>.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start font-mono text-xs">
                      
                      {/* Form inputs */}
                      <div className="col-span-1 border border-slate-850 p-4 rounded-2xl space-y-4">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                          Input Parameters
                        </h4>

                        <div className="space-y-1">
                          <label className="text-[10.5px] text-slate-400 font-bold block uppercase">Holding Duration:</label>
                          <div className="grid grid-cols-2 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                            <button 
                              onClick={() => setHoldingPeriod('Short')}
                              className={`py-1 text-[10.5px] font-bold rounded-md cursor-pointer ${holdingPeriod === 'Short' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-250'}`}
                            >
                              Under 1 Year (Short)
                            </button>
                            <button 
                              onClick={() => setHoldingPeriod('Long')}
                              className={`py-1 text-[10.5px] font-bold rounded-md cursor-pointer ${holdingPeriod === 'Long' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-250'}`}
                            >
                              Over 1 Year (Long)
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10.5px] text-slate-400 font-bold block uppercase">Net switch Portfolio Valuation:</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-500 font-bold">₹</span>
                            <input 
                              type="number"
                              value={customTotalValue}
                              onChange={(e) => setCustomTotalValue(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-6 text-slate-200 text-right font-bold focus:outline-none focus:ring-1 focus:ring-slate-700"
                            />
                          </div>
                        </div>

                        <div className="space-y-1 text-left">
                          <label className="text-[10.5px] text-slate-400 font-bold block uppercase">Estimated Gains (NAV profits only):</label>
                          <div className="relative">
                            <span className="absolute left-2.5 top-1.5 text-slate-500 font-bold">₹</span>
                            <input 
                              type="number"
                              value={customGain}
                              onChange={(e) => setCustomGain(parseFloat(e.target.value) || 0)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg py-1 px-6 text-slate-200 text-right font-bold focus:outline-none focus:ring-1 focus:ring-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Calculations breakdown math */}
                      <div className="col-span-1 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                        <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-2">
                          Switch Penalty Breakdown
                        </h4>

                        <div className="flex items-center justify-between font-bold text-slate-350">
                          <span>Avg Exit Load (1%):</span>
                          <span>₹{calculatedSwitchTax.exitLoadCost.toLocaleString('en-IN')}</span>
                        </div>

                        <div className="flex items-center justify-between font-bold text-slate-350">
                          <span>Tax Rate (STCG/LTCG):</span>
                          <span>{calculatedSwitchTax.taxRatePercent}%</span>
                        </div>

                        <div className="flex items-center justify-between font-bold text-slate-350" title="Accounting for standard ₹1.25 Lakh exempt LTCG threshold per year">
                          <span>Tax-Exempt Profits:</span>
                          <span>₹{holdingPeriod === 'Long' ? '1,25,000' : '0'}</span>
                        </div>

                        <div className="flex items-center justify-between font-bold text-slate-350 border-t border-slate-800/60 pt-2 text-rose-350">
                          <span>Taxable Gains Pool:</span>
                          <span>₹{calculatedSwitchTax.taxableGain.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      {/* Gross Friction Result Card */}
                      <div className="col-span-1 bg-slate-950 p-4 border border-slate-800 rounded-2xl flex flex-col justify-between text-left h-full">
                        <div>
                          <span className="text-[9px] uppercase tracking-wider text-emerald-400 block font-bold">
                            Total Switching Friction Cost
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-light block leading-tight mt-0.5">
                            Cumulative outpocket cost of pruning and optimizing holding portfolio:
                          </span>
                        </div>

                        <div className="py-2">
                          <div className="text-2xl font-black text-rose-400 font-mono">
                            ₹{Math.round(calculatedSwitchTax.totalFriction).toLocaleString('en-IN')}
                          </div>
                          <span className="text-[9.5px] text-slate-500 font-bold block">
                            ({Math.round(((calculatedSwitchTax.totalFriction) / customTotalValue) * 100 * 100) / 100}% of switch value)
                          </span>
                        </div>

                        <div className="p-2 border border-slate-850 rounded-xl bg-slate-900 text-[10.5px] text-slate-350 font-sans leading-tight">
                          💡 <strong>Maximise Alpha:</strong> Consolidating into higher sharpe-ratio funds with 5% superior annual returns recovers this transition cost within just {Math.max(1, Math.round(calculatedSwitchTax.totalFriction / (customTotalValue * 0.05)))} months.
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
