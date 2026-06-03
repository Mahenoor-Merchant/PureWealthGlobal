/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Target, Shield, HelpCircle, ArrowRight, CheckCircle, 
  Sparkles, TrendingUp, Info, Briefcase, Calendar, 
  Coins, RotateCcw, Landmark, Clock, ChevronRight,
  TrendingDown, Percent, Award, BookOpen, ExternalLink, Send,
  AlertTriangle, BrainCircuit, LineChart, PieChart as PieIcon, ChevronLeft, BarChart3,
  Globe
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import { AMFI_ARN_DETAILS } from '../data';

// Real Mutual Funds Database matching various criteria under Regular Plans
interface RealFund {
  name: string;
  symbol: string;
  category: string;
  threeYrCAGR: number;
  fiveYrCAGR: number;
  aum: string;
  expenseRatio: string;
  fundManager: string;
  minInvestment: string;
  exitLoad: string;
  topHoldings: string[];
  objectiveDescription: string;
  strategyDescription: string;
  whySuited: string;
  assetClassTitle: string;
  assetClassMix: { name: string; value: number; color: string; }[];
}

// Low, Moderate, High risk portfolio types
interface PortfolioAllocation {
  fundName: string;
  weight: number;
  annualReturn: number;
}

interface PredefinedPortfolio {
  name: string;
  riskClass: 'Low-Risk' | 'Moderate-Risk' | 'High-Risk';
  expectedReturnMin: number;
  expectedReturnMax: number;
  allocations: PortfolioAllocation[];
  rationale: string;
}

export default function FindYourFundView({ setCurrentPage }: { setCurrentPage: (page: string) => void }) {
  // Survey steps state: 1 to 4
  const [step, setStep] = useState(1);
  
  // Advanced Onboarding State variables
  // Step 1: Capital Capacity & Liquidity Needs
  const [capitalType, setCapitalType] = useState<'SIP' | 'Lumpsum'>('SIP');
  const [capitalAmount, setCapitalAmount] = useState<number>(15000);
  const [inflowStability, setInflowStability] = useState<'Stable' | 'Variable' | 'Windfall'>('Stable');

  // Step 2: Time Horizon & Milestone Timelines
  const [timeHorizon, setTimeHorizon] = useState<'1-3' | '3-5' | '5+'>('3-5');
  const [goal, setGoal] = useState<'Wealth' | 'Retirement' | 'Education' | 'TaxSaving' | 'RegularIncome'>('Wealth');
  const [withdrawalNeeds, setWithdrawalNeeds] = useState<'No' | 'Emergency' | 'Planned'>('No');

  // Step 3: Emotional & Psychological Risk Index
  const [riskCapacity, setRiskCapacity] = useState<'Conservative' | 'Moderate' | 'Aggressive'>('Moderate');
  const [marketShock, setMarketShock] = useState<'Panic' | 'DoNothing' | 'BuyMore'>('DoNothing');
  const [burdenLevel, setBurdenLevel] = useState<'Low' | 'Moderate' | 'High'>('Moderate');

  // Step 4: Strategic Objective & Dividend Mode
  const [objective, setObjective] = useState<'Growth' | 'InflationHedge' | 'Stability' | 'Preservation'>('Growth');
  const [dividendMode, setDividendMode] = useState<'Reinvest' | 'SWP'>('Reinvest');

  // Submit and simulation states
  const [isSimulating, setIsSimulating] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [activePortfolioTab, setActivePortfolioTab] = useState<'Low' | 'Moderate' | 'High'>('Moderate');

  // Calculate composite financial advisor risk score (out of 10)
  const advisorScore = useMemo(() => {
    let score = 0;
    
    // 1. Capital capacity and inflow (Step 1) - Max 2 points
    if (inflowStability === 'Stable') score += 1.0;
    if (inflowStability === 'Variable') score += 0.4;
    if (inflowStability === 'Windfall') score += 0.8;
    
    // Scale slightly with capitalAmount (more capital is higher capacity)
    if (capitalType === 'SIP') {
      if (capitalAmount >= 50000) score += 1.0;
      else if (capitalAmount >= 15000) score += 0.7;
      else score += 0.4;
    } else {
      if (capitalAmount >= 1000000) score += 1.0;
      else if (capitalAmount >= 200000) score += 0.7;
      else score += 0.4;
    }

    // 2. Horizon & Goal parameters (Step 2) - Max 3 points
    if (timeHorizon === '1-3') score += 0.3;
    if (timeHorizon === '3-5') score += 1.2;
    if (timeHorizon === '5+') score += 2.0;

    if (goal === 'Wealth') score += 1.0;
    if (goal === 'TaxSaving') score += 0.8;
    if (goal === 'Education') score += 0.6;
    if (goal === 'Retirement') score += 0.5;
    if (goal === 'RegularIncome') score += 0.2;

    // 3. Behavioral risk profile (Step 3) - Max 3 points
    if (riskCapacity === 'Conservative') score += 0.5;
    if (riskCapacity === 'Moderate') score += 1.8;
    if (riskCapacity === 'Aggressive') score += 3.0;

    if (marketShock === 'Panic') score += 0.2;
    if (marketShock === 'DoNothing') score += 1.5;
    if (marketShock === 'BuyMore') score += 2.5;

    if (burdenLevel === 'High') score += 0.2;
    if (burdenLevel === 'Moderate') score += 1.0;
    if (burdenLevel === 'Low') score += 2.0;

    // 4. Strategic objective (Step 4) - Max 2 points
    if (objective === 'Growth') score += 2.0;
    if (objective === 'InflationHedge') score += 1.4;
    if (objective === 'Stability') score += 0.8;
    if (objective === 'Preservation') score += 0.2;

    // Sum is max score. Let's normalize it to exactly 1-10 scale
    const sum = score;
    const minSum = 2.4;
    const maxSum = 14.5;
    const normalized = 1.0 + ((sum - minSum) / (maxSum - minSum)) * 9.0;
    
    return Math.min(10.0, Math.max(1.0, parseFloat(normalized.toFixed(1))));
  }, [inflowStability, capitalType, capitalAmount, timeHorizon, goal, riskCapacity, marketShock, burdenLevel, objective]);

  // Generate real-time live preview blueprint of asset class mix based on advisorScore
  const liveAssetMix = useMemo(() => {
    let equity = 0;
    let gold = 10; // Default gold cushion
    
    if (timeHorizon === '1-3') {
      equity = Math.min(15, Math.round(advisorScore * 2));
    } else if (timeHorizon === '3-5') {
      equity = Math.min(65, Math.round(25 + (advisorScore - 1) * 5));
    } else {
      equity = Math.min(90, Math.round(45 + (advisorScore - 1) * 5));
    }
    
    // Adjust based on Objective
    if (objective === 'Preservation') {
      equity = Math.max(0, equity - 20);
    } else if (objective === 'Growth') {
      equity = Math.min(timeHorizon === '1-3' ? 20 : 90, equity + 10);
    } else if (objective === 'InflationHedge') {
      gold = 20; // Extra hedge
    }
    
    // Ensure sum is 100
    const remaining = 100 - equity - gold;
    const debt = remaining;
    
    // Let's determine the strategic title and risk description
    let title = "Classic Moderate Core Compactor";
    let riskLabel = "Moderate Risk Stance";
    
    if (equity <= 20) {
      title = "Sovereign Debt & Liquidity Shield";
      riskLabel = "Conservative Safety Plan";
    } else if (equity <= 45) {
      title = "Value Defensive Hybrid Index";
      riskLabel = "Moderately Conservative";
    } else if (equity <= 65) {
      title = "Classic Moderate Core Compactor";
      riskLabel = "Balanced Growth Series";
    } else if (equity <= 80) {
      if (goal === 'TaxSaving') {
        title = "Equities Tax Shield Catalyst";
        riskLabel = "Tax Saving ELSS Focus";
      } else {
        title = "Strategic Wealth Multi-Asset Expansion";
        riskLabel = "Growth Oriented Multi-Asset";
      }
    } else {
      title = "Dynasty Capital Multi-Cap Compactor";
      riskLabel = "High-Conviction Aggressive Build";
    }
    
    return {
      title,
      equity,
      debt,
      gold,
      riskLabel
    };
  }, [advisorScore, timeHorizon, goal, objective]);

  // Determine the primary suggested fund under Regular plans based on deterministic, professional rules
  const suggestedFund: RealFund = useMemo(() => {
    // Determine target primary fund name matching activePortfolio's allocations[0].fundName
    const getActivePortfolioPrimaryFundName = (): string => {
      // 1. Goal is Tax Saving
      if (goal === 'TaxSaving') {
        if (activePortfolioTab === 'Low') return "Bandhan Government Securities Fund (Regular-Growth)";
        if (activePortfolioTab === 'Moderate') return "Parag Parikh Tax Saver Fund (Regular-Growth)";
        return "Quant ELSS Tax Saver Fund (Regular-Growth)";
      }
      // 2. Horizon is 1-3 years
      if (timeHorizon === '1-3') {
        if (activePortfolioTab === 'Low') return "ICICI Prudential Ultra Short Term Fund (Regular-Growth)";
        if (activePortfolioTab === 'Moderate') return "Aditya Birla Sun Life Short Term Fund (Regular-Growth)";
        return "HDFC Balanced Advantage Mutual Fund (Regular-Growth)";
      }
      // 3. Goal is RegularIncome or SWP
      if (goal === 'RegularIncome' || dividendMode === 'SWP') {
        if (activePortfolioTab === 'Low') return "ICICI Prudential Ultra Short Term Fund (Regular-Growth)";
        return "HDFC Balanced Advantage Mutual Fund (Regular-Growth)";
      }
      // 4. Default Case (Wealth, Retirement, Education with horizon 3+ years)
      if (activePortfolioTab === 'Low') return "Bandhan Government Securities Fund (Regular-Growth)";
      if (activePortfolioTab === 'Moderate') {
        return "Parag Parikh Flexi Cap Fund (Regular-Growth)";
      }
      return "Nippon India Small Cap Fund (Regular-Growth)";
    };

    const targetFundName = getActivePortfolioPrimaryFundName();

    const getBaseFund = (): RealFund => {
      if (targetFundName === 'Bandhan Government Securities Fund (Regular-Growth)') {
        return {
          name: 'Bandhan Government Securities Fund (Regular-Growth)',
          symbol: 'BGSF-RG',
          category: 'Debt - Gilt Regular (Sovereign Safety)',
          threeYrCAGR: 7.95,
          fiveYrCAGR: 7.20,
          aum: '₹14,560 Crores',
          expenseRatio: '1.25% (Regular Plan)',
          fundManager: 'Suyash Choudhary (Tenure: 10 Years)',
          minInvestment: '₹1,000 (Lumpsum) / ₹500 (SIP)',
          exitLoad: 'Nil',
          topHoldings: [
            '7.18% GOI 2033 Sovereign Bond (35% Weight)',
            '7.26% GOI 2032 Sovereign Bond (30% Weight)',
            '91 Days Treasury Bills Sovereign (20% Weight)',
            '182 Days Treasury Bills Sovereign (15% Weight)'
          ],
          whySuited: 'Optimized for absolute capital preservation. It achieves high durability and predictability by investing 100% of capital in government securities backed directly by the Reserve Bank of India, completely eliminating corporate credit risks.',
          objectiveDescription: 'Seeks to generate optimal returns and sovereign safety by investing in government securities across various maturities.',
          strategyDescription: 'Applies active interest-rate scenario analysis and duration management backed by a veteran gilt management team.',
          assetClassTitle: 'Sovereign Debt Stability Shield',
          assetClassMix: [
            { name: 'Sovereign Bonds', value: 85, color: '#3b82f6' },
            { name: 'Sovereign Floating Rate', value: 15, color: '#10b981' }
          ]
        };
      }

      if (targetFundName === 'Parag Parikh Tax Saver Fund (Regular-Growth)') {
        return {
          name: 'Parag Parikh Tax Saver Fund (Regular-Growth)',
          symbol: 'PPTS-RG',
          category: 'Equity - ELSS Regular (Tax Benefit & Governance)',
          threeYrCAGR: 14.85,
          fiveYrCAGR: 13.90,
          aum: '₹3,450 Crores',
          expenseRatio: '1.45% (Regular Plan)',
          fundManager: 'Rajeev Thakkar (Tenure: 5 Years)',
          minInvestment: '₹500 (Min Lumpsum / SIP)',
          exitLoad: 'Nil (Mandatory 3-Year Lock-in under Section 80C)',
          topHoldings: [
            'HDFC Bank Limited (9.0% Weight)',
            'Reliance Industries Limited (8.2% Weight)',
            'ITC Limited (7.1% Weight)',
            'Bajaj Holdings & Investment (6.4% Weight)'
          ],
          whySuited: 'Combines dynamic multi-cap compounding with valuable tax deductions under Section 80C. Selected via established regular distributor channels, this plan values high-governance bluechips with conservative balance sheets to weather domestic indices.',
          objectiveDescription: 'An open-ended equity-linked saving scheme offering tax write-offs while managing long-term capital compounding.',
          strategyDescription: 'Applies a value-contrast stock-picking checklist focusing on strong business moats, structural earnings, and cash returns.',
          assetClassTitle: 'ELSS Tax Shield Core',
          assetClassMix: [
            { name: 'Indian Equities Core', value: 85, color: '#3b82f6' },
            { name: 'Fixed Income Cash', value: 15, color: '#10b981' }
          ]
        };
      }

      if (targetFundName === 'Quant ELSS Tax Saver Fund (Regular-Growth)') {
        return {
          name: 'Quant ELSS Tax Saver Fund (Regular-Growth)',
          symbol: 'QTSEC-RG',
          category: 'Equity - ELSS Regular (Tax Saving core)',
          threeYrCAGR: 23.51,
          fiveYrCAGR: 27.28,
          aum: '₹9,850 Crores',
          expenseRatio: '1.68% (Regular Plan under distributor channel)',
          fundManager: 'Sandeep Tandon (Tenure: 6 Years)',
          minInvestment: '₹500 (Min Lumpsum / SIP)',
          exitLoad: 'Nil (Mandatory 3-Year Lock-in under Section 80C)',
          topHoldings: [
            'Reliance Industries Ltd (9.2% Weight)',
            'HDFC Bank Ltd (8.5% Weight)',
            'Jio Financial Services (6.7% Weight)',
            'Tata Power Co Ltd (5.8% Weight)'
          ],
          whySuited: 'For tax exemption requirements under Section 80C, Quant ELSS Tax Saver offers outstanding compounding power. Equipped with Quant\'s predictive VLRT (Valuation, Liquidity, Risk Appetite, Time) framework, it invests dynamically in high-momentum stocks to build elite capital growth.',
          objectiveDescription: 'An open-ended equity-linked saving scheme which provides tax rebate benefits under 80C while developing a diversified equity allocation.',
          strategyDescription: 'Utilizes global quantitative algorithms to identify business turnaround cycles early and rotate sectoral bets dynamically.',
          assetClassTitle: "Equities Tax Shield Catalyst",
          assetClassMix: [
            { name: 'Domestic Equities', value: 90, color: '#3b82f6' },
            { name: 'Gold / Commodities', value: 10, color: '#f59e0b' }
          ]
        };
      }

      if (targetFundName === 'ICICI Prudential Ultra Short Term Fund (Regular-Growth)') {
        return {
          name: 'ICICI Prudential Ultra Short Term Fund (Regular-Growth)',
          symbol: 'ICIPU-RG',
          category: 'Debt - Ultra Short Duration Regular',
          threeYrCAGR: 7.20,
          fiveYrCAGR: 6.38,
          aum: '₹14,242 Crores',
          expenseRatio: '0.98% (Regular Plan)',
          fundManager: 'Ritesh Lunawat (Tenure: 5.5 Years)',
          minInvestment: '₹5,000 (Lumpsum) / ₹1,000 (Monthly SIP)',
          exitLoad: 'Nil',
          topHoldings: [
            '8.35% GOI Sovereign Floating Rate Bond (15% Weight)',
            '91 Days Treasury Bills Sovereign (12% Weight)',
            'NABARD High-Grade Corporate Bond AAA (9% Weight)',
            'Small Industries Development Bank of India Certificate of Deposit (8.5% Weight)'
          ],
          whySuited: 'Since your timeline is strictly short-term (1-3 years) and safety is paramount, capital preservation is key. To buffer your capital from volatile swings, we suggest this highly-rated corporate debt/treasury index. The yield maintains stable, positive incremental returns above standard bank accounts with zero equity volatility.',
          objectiveDescription: 'The scheme seeks to generate income through investments in a solid range of highly liquid debt and money market instruments with a dual duration targeting between 3 and 6 months.',
          strategyDescription: 'Applies rigorous risk controls to pick credit papers rated AA+ and above, ensuring high security while actively rolling assets to optimize yields.',
          assetClassTitle: "Sovereign Debt & Liquidity Shield",
          assetClassMix: [
            { name: 'Debt & Corporate Cash', value: 80, color: '#3b82f6' },
            { name: 'Sovereign Gold', value: 10, color: '#f59e0b' },
            { name: 'Arbitrage Cash', value: 10, color: '#10b981' }
          ]
        };
      }

      if (targetFundName === 'Aditya Birla Sun Life Short Term Fund (Regular-Growth)') {
        return {
          name: 'Aditya Birla Sun Life Short Term Fund (Regular-Growth)',
          symbol: 'ABSLS-RG',
          category: 'Debt - Short Duration Regular',
          threeYrCAGR: 7.85,
          fiveYrCAGR: 6.85,
          aum: '₹8,560 Crores',
          expenseRatio: '1.12% (Regular Plan)',
          fundManager: 'Kaustubh Gupta (Tenure: 7 Years)',
          minInvestment: '₹1,000 (Lumpsum) / ₹1,000 (SIP)',
          exitLoad: 'Nil',
          topHoldings: [
            '7.18% GOI Sovereign Floating Rate Bond (22% Weight)',
            'REC Limited High-Grade AAA Bond (15% Weight)',
            'National Housing Bank AAA Bond (12% Weight)',
            'Power Finance Corporation AAA Bond (10% Weight)'
          ],
          whySuited: 'For short-term timelines seeking superior yields, this short-term fund is calibrated to deliver superior returns compared to local treasury options by riding interest rate yield curves while maintaining AA+ credit safety.',
          objectiveDescription: 'Aims to generate stable yields and capital appreciation from a diversified portfolio of debt and money market instruments.',
          strategyDescription: 'Tactically adjusts portfolio duration within 1-3 years based on domestic interest rate projections by the central bank.',
          assetClassTitle: "Short Term Yield Generator",
          assetClassMix: [
            { name: 'Sovereign Securities', value: 60, color: '#3b82f6' },
            { name: 'High-Grade AAA Corporate Papers', value: 30, color: '#10b981' },
            { name: 'Cash equivalents', value: 10, color: '#f59e0b' }
          ]
        };
      }

      if (targetFundName === 'HDFC Balanced Advantage Mutual Fund (Regular-Growth)') {
        return {
          name: 'HDFC Balanced Advantage Mutual Fund (Regular-Growth)',
          symbol: 'HDFCB-RG',
          category: 'Hybrid - Dynamic Asset Allocation Regular',
          threeYrCAGR: 12.48,
          fiveYrCAGR: 11.52,
          aum: '₹89,450 Crores',
          expenseRatio: '1.38% (Regular Plan)',
          fundManager: 'Gopal Agrawal & Anil Bamboli',
          minInvestment: '₹5,000 (Lumpsum) / ₹505 (Monthly)',
          exitLoad: '1% if redeemed before 1 yr, Nil thereafter',
          topHoldings: [
            'HDFC Bank Ltd (9.4% Weight)',
            'ICICI Bank Ltd (8.1% Weight)',
            'Larsen & Toubro Ltd (5.6% Weight)',
            '7.26% GOI Sovereign Bond Reserve (Part of 32% bonds)'
          ],
          whySuited: 'An dynamic hybrid allocation structure ideal for wealth balance or supporting Systematic Withdrawal Plans (SWP). Automatically shifts weight between equities and debt papers to buffer downside market shifts successfully.',
          objectiveDescription: 'A dynamic investment strategy dynamically coordinating assets between equities, index hedges, and yields.',
          strategyDescription: 'Deploys a robust machine-driven metric framework to trim equity stakes as indices approach record high valuations, shielding capital safely.',
          assetClassTitle: "Dynamic Allocation Balance Shield",
          assetClassMix: [
            { name: 'Domestic Equities', value: 50, color: '#3b82f6' },
            { name: 'Corporate Debt', value: 40, color: '#10b981' },
            { name: 'Sovereign Gold', value: 10, color: '#f59e0b' }
          ]
        };
      }

      if (targetFundName === 'Parag Parikh Flexi Cap Fund (Regular-Growth)') {
        return {
          name: 'Parag Parikh Flexi Cap Fund (Regular-Growth)',
          symbol: 'PPFC-RG',
          category: 'Equity - Flexi Cap Regular',
          threeYrCAGR: 14.50,
          fiveYrCAGR: 12.84,
          aum: '₹66,800 Crores',
          expenseRatio: '1.31% (Regular Plan)',
          fundManager: 'Rajeev Thakkar (Tenure: 11 Years)',
          minInvestment: '₹1,000 (Min Lumpsum / SIP Target)',
          exitLoad: '2% if redeemed within 365 days, 1% up to 730 days, Nil after 2 years',
          topHoldings: [
            'HDFC Bank Limited Core Bluechip (8.4% Weight)',
            'Power Grid Corporation of India (7.2% Weight)',
            'Microsoft Corporation USA (6.4% Weight international diversification)',
            'Alphabet Inc Class A Google USA (5.1% Weight international diversification)'
          ],
          whySuited: 'For investors seeking consistent, inflation-beating long-term growth with moderate risk tolerance. It stands out by investing up to 15% directly in global tech leaders like Microsoft, protecting your portfolio from local currency depreciation while maintaining outstanding corporate governance.',
          objectiveDescription: 'An open-ended equity fund investing across large-cap, mid-cap, and small-cap stocks listed in India and high-quality international markets.',
          strategyDescription: 'Applies core value-investing principles, targeting cash-rich business leaders displaying solid defensive moats and consistent capital output.',
          assetClassTitle: "Classic Moderate Core Compactor",
          assetClassMix: [
            { name: 'Indian Prime Equities', value: 65, color: '#3b82f6' },
            { name: 'Overseas Global Equities', value: 15, color: '#8b5cf6' },
            { name: 'Cash and Treasury Reserves', value: 20, color: '#10b981' }
          ]
        };
      }

      // Default: Nippon India Small Cap Fund (Regular-Growth)
      return {
        name: 'Nippon India Small Cap Fund (Regular-Growth)',
        symbol: 'NISC-RG',
        category: 'Equity - Small Cap Regular',
        threeYrCAGR: 19.50,
        fiveYrCAGR: 13.92,
        aum: '₹53,240 Crores',
        expenseRatio: '1.42% (Regular Plan)',
        fundManager: 'Samir Rachh (Tenure: 8 Years)',
        minInvestment: '₹5,000 (Lumpsum) / ₹100 (Monthly)',
        exitLoad: '1% if redeemed within 1 month, Nil thereafter',
        topHoldings: [
          'Tube Investments of India Ltd (3.1% Weight)',
          'HDFC Bank Limited (2.8% Weight liquidity buffer)',
          'Apar Industries Ltd (2.6% Weight)',
          'Multi Commodity Exchange of India (2.4% Weight)',
        ],
        whySuited: 'With an aggressive risk appetite and a time horizon of over 5 years, high-conviction small-cap equities offer superior compounding potential. Guided by Samir Rachh, Nippon Small Cap is highly diversified across 160+ rising companies to buffer single-stock drawdowns while capturing maximum alpha.',
        objectiveDescription: 'An open-ended equity scheme investing predominantly in robust, fast-growing small-sized companies globally scalable from India.',
        strategyDescription: 'Secures early corporate allocation in emerging sectors before they are widely valued, trimming stakes once they graduate to large-cap status.',
        assetClassTitle: "Dynasty Capital Multi-Cap Compactor",
        assetClassMix: [
          { name: 'Small / Micro Cap Equities', value: 55, color: '#3b82f6' },
          { name: 'Mid & Large Cap Bluechips', value: 30, color: '#10b981' },
          { name: 'Gold / Hedging buffers', value: 15, color: '#f59e0b' }
        ]
      };
    };

    const baseFund = getBaseFund();
    return {
      ...baseFund,
      assetClassTitle: liveAssetMix.title,
      assetClassMix: [
        { name: 'Core Equities Mix', value: liveAssetMix.equity, color: '#3b82f6' },
        { name: 'Fixed Income Yields', value: liveAssetMix.debt, color: '#10b981' },
        { name: 'Sovereign Gold Overlay', value: liveAssetMix.gold, color: '#f59e0b' }
      ].filter(item => item.value > 0)
    };
  }, [timeHorizon, riskCapacity, goal, objective, dividendMode, liveAssetMix, activePortfolioTab]);

  // Portfolios allocations structure supporting realistic calibrated returns matching Regular Plans (Under 7.5% to 18.5% real CAGR range)
  const simulatedPortfolios: Record<'Low' | 'Moderate' | 'High', PredefinedPortfolio> = useMemo(() => {
    // CASE 1: Goal is TaxSaving (Section 80C)
    if (goal === 'TaxSaving') {
      return {
        Low: {
          name: "Sovereign Tax Relief Regular Portfolio",
          riskClass: "Low-Risk",
          expectedReturnMin: 8.50,
          expectedReturnMax: 9.80,
          allocations: [
            { fundName: "Bandhan Government Securities Fund (Regular-Growth)", weight: 50, annualReturn: 7.95 },
            { fundName: "Aditya Birla Sun Life Relief 96 (Tax-Benefit) (Regular-Growth)", weight: 35, annualReturn: 11.20 },
            { fundName: "ICICI Prudential Ultra Short Term Fund (Regular-Growth)", weight: 15, annualReturn: 7.20 }
          ],
          rationale: "Aligns Section 80C tax relief benefits with high sovereign bond weightage to ensure capital durability and smooth returns during high market swings."
        },
        Moderate: {
          name: "Balanced Tax Catalyst Regular Portfolio",
          riskClass: "Moderate-Risk",
          expectedReturnMin: 12.80,
          expectedReturnMax: 14.50,
          allocations: [
            { fundName: "Parag Parikh Tax Saver Fund (Regular-Growth)", weight: 40, annualReturn: 14.85 },
            { fundName: "Mirae Asset ELSS Tax Saver Fund (Regular-Growth)", weight: 35, annualReturn: 13.90 },
            { fundName: "ICICI Prudential Equity Arbitrage Fund (Regular-Growth)", weight: 25, annualReturn: 8.20 }
          ],
          rationale: "Balances dynamic middle-tier ELSS equities under Section 80C with tax-hedged arbitrage cash blocks, yielding an optimized inflation-beating return profile."
        },
        High: {
          name: "Aggressive Tax Multiplier Regular Portfolio",
          riskClass: "High-Risk",
          expectedReturnMin: 16.20,
          expectedReturnMax: 17.90,
          allocations: [
            { fundName: "Quant ELSS Tax Saver Fund (Regular-Growth)", weight: 50, annualReturn: 18.51 },
            { fundName: "SBI Long Term Equity ELSS Fund (Regular-Growth)", weight: 30, annualReturn: 16.78 },
            { fundName: "HDFC ELSS Tax Saver Fund (Regular-Growth)", weight: 20, annualReturn: 15.60 }
          ],
          rationale: "Maximizes compound wealth creation under tax exemptions by deploying 100% of capital into high-conviction momentum ELSS schemes with SEBI multi-cap mandates."
        }
      };
    }

    // CASE 2: Horizon is Short Term (1-3 years)
    if (timeHorizon === '1-3') {
      return {
        Low: {
          name: "Sovereign Liquid Shield Portfolio",
          riskClass: "Low-Risk",
          expectedReturnMin: 7.20,
          expectedReturnMax: 8.40,
          allocations: [
            { fundName: "ICICI Prudential Ultra Short Term Fund (Regular-Growth)", weight: 60, annualReturn: 7.20 },
            { fundName: "Bandhan Government Securities Fund (Regular-Growth)", weight: 30, annualReturn: 7.95 },
            { fundName: "SBI Liquid Fund (Regular-Growth)", weight: 10, annualReturn: 6.80 }
          ],
          rationale: "A fortress portfolio optimized for a 1-3 year horizon. It maintains absolute safety of principal by avoiding stock market volatility altogether."
        },
        Moderate: {
          name: "Short-Term Yield Compactor Portfolio",
          riskClass: "Moderate-Risk",
          expectedReturnMin: 8.80,
          expectedReturnMax: 10.20,
          allocations: [
            { fundName: "Aditya Birla Sun Life Short Term Fund (Regular-Growth)", weight: 50, annualReturn: 7.85 },
            { fundName: "ICICI Prudential Equity Arbitrage Fund (Regular-Growth)", weight: 30, annualReturn: 8.20 },
            { fundName: "Nippon India Sovereign Gold ETF (GOLDBEES)", weight: 20, annualReturn: 10.50 }
          ],
          rationale: "Tactically targets slightly higher yield over 1-3 years by blending short-term sovereign papers with arbitrage cash indices and a gold hedge."
        },
        High: {
          name: "Active Arbitrage Frontier Portfolio",
          riskClass: "High-Risk",
          expectedReturnMin: 11.20,
          expectedReturnMax: 12.80,
          allocations: [
            { fundName: "HDFC Balanced Advantage Mutual Fund (Regular-Growth)", weight: 45, annualReturn: 12.48 },
            { fundName: "ICICI Prudential Equity Arbitrage Fund (Regular-Growth)", weight: 35, annualReturn: 8.20 },
            { fundName: "Aditya Birla Sun Life Short Term Fund (Regular-Growth)", weight: 20, annualReturn: 7.85 }
          ],
          rationale: "Allocates capital into safe, low-drawdown dynamic allocation plans alongside corporate arbitrage structures to compound wealth defensively."
        }
      };
    }

    // CASE 3: Goal is Passive Income (RegularIncome or SWP Mode)
    if (goal === 'RegularIncome' || dividendMode === 'SWP') {
      return {
        Low: {
          name: "Preservation Cash SWP Flow Portfolio",
          riskClass: "Low-Risk",
          expectedReturnMin: 8.20,
          expectedReturnMax: 9.50,
          allocations: [
            { fundName: "ICICI Prudential Ultra Short Term Fund (Regular-Growth)", weight: 50, annualReturn: 7.20 },
            { fundName: "Bandhan Government Securities Fund (Regular-Growth)", weight: 30, annualReturn: 7.95 },
            { fundName: "HDFC Balanced Advantage Mutual Fund (Regular-Growth)", weight: 20, annualReturn: 12.48 }
          ],
          rationale: "Calibrated to protect your withdrawal principal from sudden market drops by keeping 80% in fixed yield funds while keeping a conservative SWP safety margin."
        },
        Moderate: {
          name: "Balanced Advantage Passive Core Portfolio",
          riskClass: "Moderate-Risk",
          expectedReturnMin: 11.80,
          expectedReturnMax: 13.50,
          allocations: [
            { fundName: "HDFC Balanced Advantage Mutual Fund (Regular-Growth)", weight: 50, annualReturn: 12.48 },
            { fundName: "SBI Equity Hybrid Fund (Regular-Growth)", weight: 30, annualReturn: 11.15 },
            { fundName: "ICICI Prudential Savings Fund - Floating Rate (Regular-Growth)", weight: 20, annualReturn: 7.20 }
          ],
          rationale: "Combines dynamic hybrid equity allocation and floating rate fixed yields, creating a stable monthly Systematic Withdrawal Plan payout engine."
        },
        High: {
          name: "Dynamic Yield Multiplier Active Portfolio",
          riskClass: "High-Risk",
          expectedReturnMin: 13.80,
          expectedReturnMax: 15.50,
          allocations: [
            { fundName: "HDFC Balanced Advantage Mutual Fund (Regular-Growth)", weight: 40, annualReturn: 12.48 },
            { fundName: "ICICI Prudential Equity & Debt Hybrid Fund (Regular-Growth)", weight: 35, annualReturn: 12.50 },
            { fundName: "Parag Parikh Flexi Cap Fund (Regular-Growth)", weight: 25, annualReturn: 14.50 }
          ],
          rationale: "An aggressive passive income structure designed to beat long-term inflation by reinvesting surplus and harvesting withdrawals from top hybrids and flexicap shares."
        }
      };
    }

    // CASE 4: DEFAULT (Wealth, Retirement, Education with horizon 3+ years)
    return {
      Low: {
        name: "Sovereign Shield Regular Portfolio",
        riskClass: "Low-Risk",
        expectedReturnMin: 7.80,
        expectedReturnMax: 9.20,
        allocations: [
          { fundName: "Bandhan Government Securities Fund (Regular-Growth)", weight: 45, annualReturn: 7.95 },
          { fundName: "ICICI Prudential Savings Fund - Floating Rate (Regular-Growth)", weight: 25, annualReturn: 7.20 },
          { fundName: "HDFC Balanced Advantage Mutual Fund (Regular-Growth)", weight: 20, annualReturn: 12.48 },
          { fundName: "Nippon India Nifty 50 BeES ETF Index (NIFTYBEES)", weight: 10, annualReturn: 13.80 }
        ],
        rationale: "Optimized for maximum capital stability and predictable earnings. This layout maintains 70% in high-grade government securities and floating rate instruments, completely shielding your capital while harvesting a tiny passive equity alpha."
      },
      Moderate: {
        name: "Classic Frontier Regular Portfolio",
        riskClass: "Moderate-Risk",
        expectedReturnMin: 12.20,
        expectedReturnMax: 14.50,
        allocations: [
          { fundName: "Parag Parikh Flexi Cap Fund (Regular-Growth)", weight: 40, annualReturn: 14.50 },
          { fundName: "Mirae Asset Large & Midcap Fund (Regular-Growth)", weight: 30, annualReturn: 13.80 },
          { fundName: "ICICI Prudential Equity & Debt Hybrid Fund (Regular-Growth)", weight: 20, annualReturn: 12.50 },
          { fundName: "Nippon India Sovereign Gold ETF (GOLDBEES)", weight: 10, annualReturn: 10.50 }
        ],
        rationale: "A highly dynamic portfolio designed to comfortably outperform inflation. Anchored in leading mid-cap, large-cap and multi-cap funds, it includes an gold overlay to buffer temporary corrections."
      },
      High: {
        name: "Dynasty Capital Regular Portfolio",
        riskClass: "High-Risk",
        expectedReturnMin: 15.50,
        expectedReturnMax: 18.20,
        allocations: [
          { fundName: "Nippon India Small Cap Fund (Regular-Growth)", weight: 35, annualReturn: 19.50 },
          { fundName: "HDFC Mid-Cap Opportunities Fund (Regular-Growth)", weight: 30, annualReturn: 17.80 },
          { fundName: "SBI Contra Fund (Regular-Growth)", weight: 20, annualReturn: 16.50 },
          { fundName: "Quant Active Multi-Cap Fund (Regular-Growth)", weight: 15, annualReturn: 17.20 }
        ],
        rationale: "Bespoke high-growth setup tailored for long-term compound growth over a horizon of 5+ years. This high-alpha approach invests aggressively in mid-cap, small-cap, and undervalued contrarian stocks to ride India's retail expansion."
      }
    };
  }, [goal, timeHorizon, dividendMode]);

  const activePortfolio = simulatedPortfolios[activePortfolioTab];

  // Dedicated Multi-Category Matches based on Private Consulting Discovery
  const categoryMatchedFunds = useMemo(() => {
    const items = [
      {
        id: 'Hybrid',
        categoryName: 'Hybrid Allocation (Moderate Stability)',
        fundName: 'ICICI Prudential & HDFC Hybrid Schemes (Regular-Growth)',
        pastCAGR: '12.50% p.a.',
        aum: '₹35,465 Crores',
        expense: '1.45% (Regular Plan)',
        whyMatched: 'Fits your need for moderated volatility and balanced distribution. By dynamically blending leading bluechip stocks with a 30% sovereign debt cushion, it buffers your portfolio during market corrections while participating in index growth.',
        relevanceScore: riskCapacity === 'Conservative' || goal === 'RegularIncome' || objective === 'Stability' ? '98%' : '85%',
        icon: Shield
      },
      {
        id: 'Multicap',
        categoryName: 'Multicap Growth (Dynamic Expansion)',
        fundName: 'Quant Active Multi-Cap Fund (Regular-Growth)',
        pastCAGR: '17.20% p.a.',
        aum: '₹10,210 Crores',
        expense: '1.62% (Regular Plan)',
        whyMatched: 'Ideal for your long-term wealth targets. Features a diversified and mandated multi-cap structure that coordinates allocations across large, mid, and small-cap stocks simultaneously to capture rising sectoral momentum.',
        relevanceScore: riskCapacity === 'Aggressive' || objective === 'Growth' ? '96%' : '75%',
        icon: TrendingUp
      },
      {
        id: 'Flexicap',
        categoryName: 'Flexi Cap (Opportunistic All-Cap)',
        fundName: 'Parag Parikh Flexi Cap Fund (Regular-Growth)',
        pastCAGR: '14.50% p.a.',
        aum: '₹66,800 Crores',
        expense: '1.31% (Regular Plan)',
        whyMatched: 'Matches your focus on opportunistic capital compounding. This classic flexicap scheme moves fluidly across all market cap segments and maintains an elite 15% international hedge in bluechip US tech giants like Microsoft and Alphabet.',
        relevanceScore: timeHorizon !== '1-3' ? '95%' : '60%',
        icon: Target
      },
      {
        id: 'Arbitrage',
        categoryName: 'Arbitrage Strategy (Tax-Efficient Cash Alternative)',
        fundName: 'ICICI Prudential Equity Arbitrage Fund (Regular-Growth)',
        pastCAGR: '8.20% p.a.',
        aum: '₹16,420 Crores',
        expense: '0.95% (Regular Plan)',
        whyMatched: 'Sovereign asset alternative for immediate liquid needs or short timelines. Generates low-risk returns by locks in spreads between prompt spot and futures equity markets, delivering equity tax treatment with debt-like stability.',
        relevanceScore: timeHorizon === '1-3' || objective === 'Preservation' ? '97%' : '70%',
        icon: Coins
      },
      {
        id: 'USEquity',
        categoryName: 'US Equity (Sovereign USD Opportunities)',
        fundName: 'Nippon India US Equity Opportunities Fund (Regular-Growth)',
        pastCAGR: '13.80% p.a.',
        aum: '₹1,560 Crores',
        expense: '1.75% (Regular Plan)',
        whyMatched: 'Perfect choice for severe inflation hedge demands. Aligns directly with the S&P 500 corporate index, creating an outstanding asset buffer denominated in strong USD to hedge local currency devaluation.',
        relevanceScore: objective === 'InflationHedge' || riskCapacity === 'Aggressive' ? '92%' : '65%',
        icon: Landmark
      },
      {
        id: 'JapanEquity',
        categoryName: 'Japan Equity (Specialized Global Supply-Chain)',
        fundName: 'Nippon India Japan Equity Fund (Regular-Growth)',
        pastCAGR: '12.90% p.a.',
        aum: '₹420 Crores',
        expense: '1.95% (Regular Plan)',
        whyMatched: 'Provides unique global industrial and manufacturing exposure. Concentrates on Japanese automation, automotive, and technological giants, serving as a tactical hedge against domestic cycles.',
        relevanceScore: riskCapacity === 'Aggressive' && objective === 'Growth' ? '88%' : '50%',
        icon: Globe
      },
      {
        id: 'MultiAsset',
        categoryName: 'Multi Asset Allocation (Physical & Financial Wealth Balance)',
        fundName: 'ICICI Prudential Multi Asset Allocation Fund (Regular-Growth)',
        pastCAGR: '14.20% p.a.',
        aum: '₹44,560 Crores',
        expense: '1.38% (Regular Plan)',
        whyMatched: 'An exceptional choice for physical and financial inflation protection. Coordinates dynamic allocations dynamically across domestic equities, corporate bonds, and physical gold/silver overlays.',
        relevanceScore: objective === 'InflationHedge' || riskCapacity === 'Moderate' ? '99%' : '80%',
        icon: Percent
      }
    ];

    // Sort to show highest matched elements first based on the diagnostic profiling score
    return items.sort((a, b) => parseFloat(b.relevanceScore) - parseFloat(a.relevanceScore));
  }, [timeHorizon, riskCapacity, goal, objective, dividendMode]);

  // Compute mock compounding projection based on parameters
  const projectionData = useMemo(() => {
    const yearsToProject = 25;
    // Calibrated yield points based on portfolio risk classes (strictly realistic & practical)
    const rate = (activePortfolio.expectedReturnMin + activePortfolio.expectedReturnMax) / 2 / 100; 
    const entries = [];
    
    let currentBalance = 0;
    let totalInvested = 0;
    
    // Initial lumpsum starting scenario
    if (capitalType === 'Lumpsum') {
      currentBalance = capitalAmount;
      totalInvested = capitalAmount;
    }

    for (let yr = 0; yr <= yearsToProject; yr++) {
      if (yr > 0) {
        if (capitalType === 'SIP') {
          // SIP compounded monthly during the year
          const monthlyRate = rate / 12;
          const monthlyContribution = capitalAmount;
          for (let month = 1; month <= 12; month++) {
            totalInvested += monthlyContribution;
            currentBalance = (currentBalance + monthlyContribution) * (1 + monthlyRate);
          }
        } else {
          // Lumpsum compounded annually
          currentBalance = currentBalance * (1 + rate);
        }
      }

      entries.push({
        year: `Year ${yr}`,
        Invested: Math.round(totalInvested),
        CompoundedWealth: Math.round(capitalType === 'SIP' && yr === 0 ? 0 : (currentBalance > 0 ? currentBalance : capitalAmount)),
      });
    }

    return entries;
  }, [capitalType, capitalAmount, activePortfolio]);

  // Action handlers
  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
    }
  };

  const handleStartSimulation = () => {
    setIsSimulating(true);

    // Auto-select portfolio tab based on calculated advisor score
    let matchedProfileTab: 'Low' | 'Moderate' | 'High' = 'Moderate';
    if (advisorScore < 4.0) {
      matchedProfileTab = 'Low';
    } else if (advisorScore > 7.2) {
      matchedProfileTab = 'High';
    }
    setActivePortfolioTab(matchedProfileTab);

    // Smooth scroll and loading delay to give elite advisory feels
    setTimeout(() => {
      setIsSimulating(false);
      setShowResults(true);
      // Auto-focus results segment
      setTimeout(() => {
        const resElement = document.getElementById('finder-results-section');
        if (resElement) {
          resElement.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 1200);
  };

  const handleReset = () => {
    setStep(1);
    setShowResults(false);
  };

  // Recharts colors
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#dc2626', '#8b5cf6'];

  return (
    <div className="bg-slate-50 min-h-screen pb-24 font-sans" id="find-your-fund-wrapper">
      
      {/* Premium Hero Cover */}
      <section className="relative overflow-hidden bg-[#0F172A] text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-b border-slate-900" id="finder-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_55%)] pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-slate-800" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <span className="text-blue-400 bg-blue-500/10 border border-blue-400/20 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Consultant Discovery Terminal
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-[42px] leading-tight mt-4 tracking-tight text-white">
            Find Your Optimal Regular Fund Match
          </h1>
          <p className="text-slate-300 mt-3 text-[13px] sm:text-[15px] max-w-2xl mx-auto leading-relaxed font-sans">
            Complete our rigorous multi-point financial discovery matrix. Our quantitative scoring matches your profile with high-performing, certified regular plans from leading AMFI asset managers.
          </p>
        </div>
      </section>

      {/* Main Tool Shell */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Multi-Step Input Wizard (Spans 5 cols on lg) */}
          <div className="lg:col-span-12 xl:col-span-5 bg-white border border-slate-200/80 rounded-3xl p-5 sm:p-7 shadow-md">
            
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-[17px] text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-blue-600" />
                <span>Private Consulting Discovery</span>
              </h3>
              <span className="text-[12px] font-mono bg-slate-100 text-slate-650 px-2.5 py-1 rounded-full font-bold">
                Step {step} of 4
              </span>
            </div>

            {/* Stepper Node Line indicator */}
            <div className="flex items-center gap-2 my-5" id="step-indicator-bar">
              {[1, 2, 3, 4].map((num) => (
                <div 
                  key={num} 
                  className={`h-1.5 flex-grow rounded-full transition-all duration-300 ${step >= num ? 'bg-blue-600' : 'bg-slate-100'}`} 
                />
              ))}
            </div>

            {/* STEP 1: CAPITAL SPECIFICATIONS & STATUS */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in" id="wizard-step-1">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    1. Primary Capital Deployment Style
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => { setCapitalType('SIP'); if (capitalAmount === 200000) setCapitalAmount(15000); }}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        capitalType === 'SIP' 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-3xs' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-705 bg-white'
                      }`}
                    >
                      <Coins className={`w-5 h-5 mb-3 ${capitalType === 'SIP' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-[14px] font-bold block">Monthly SIP Route</span>
                        <span className="text-[11px] text-slate-500">Disciplined incremental cash flow</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => { setCapitalType('Lumpsum'); if (capitalAmount === 15000) setCapitalAmount(200000); }}
                      className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        capitalType === 'Lumpsum' 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-900 shadow-3xs' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-705 bg-white'
                      }`}
                    >
                      <Landmark className={`w-5 h-5 mb-3 ${capitalType === 'Lumpsum' ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <span className="text-[14px] font-bold block">One-time Lumpsum</span>
                        <span className="text-[11px] text-slate-500">Deploy immediate idle reserve</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
                      {capitalType === 'SIP' ? 'Target Monthly SIP Value' : 'One-Time Deployment Value'}
                    </label>
                    <span className="text-[14px] font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded">
                      {capitalType === 'SIP' 
                        ? `₹${capitalAmount.toLocaleString('en-IN')}/mo` 
                        : `₹${capitalAmount.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  
                  <input
                    type="range"
                    min={capitalType === 'SIP' ? 2000 : 25000}
                    max={capitalType === 'SIP' ? 100000 : 2500000}
                    step={capitalType === 'SIP' ? 2000 : 25000}
                    value={capitalAmount}
                    onChange={(e) => setCapitalAmount(Number(e.target.value))}
                    className="w-full accent-blue-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                    <span>{capitalType === 'SIP' ? 'Min: ₹2,000' : 'Min: ₹25k'}</span>
                    <span>{capitalType === 'SIP' ? 'Max: ₹1 Lac/mo' : 'Max: ₹25 Lakhs'}</span>
                  </div>

                  <div className="mt-4">
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Or input custom value:</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                      <input
                        type="number"
                        min={100}
                        value={capitalAmount}
                        onChange={(e) => setCapitalAmount(Math.max(100, Number(e.target.value)))}
                        className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl py-2 px-8 text-[14px] font-mono font-bold text-slate-850 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    2. Inflow Stability & Source
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Stable', title: 'Highly Stable (Salary, rent, predictable business cash flow)', desc: 'Consistent, periodic inflows favor uninterrupted monthly SIP routes.' },
                      { id: 'Variable', title: 'Fluctuating Inflows (Consulting, business dividends)', desc: 'Surplus peaks fluctuate, requiring a tactical cash reserve asset.' },
                      { id: 'Windfall', title: 'One-time Surplus (Asset sales, inheritance, bonuses)', desc: 'Lump-sum deployment seeking immediate structural preservation.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setInflowStability(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          inflowStability === item.id 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          inflowStability === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {inflowStability === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* STEP 2: TIME HORIZON & GOAL MATRIX */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in" id="wizard-step-2">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    1. Target Investment Horizon
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: '1-3', label: '1 - 3 Years', desc: 'Short-Term Preserver' },
                      { id: '3-5', label: '3 - 5 Years', desc: 'Optimal Hybrid' },
                      { id: '5+', label: '5+ Years', desc: 'Generational Alpha' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTimeHorizon(item.id as any)}
                        className={`p-3 rounded-xl border text-center flex flex-col justify-center items-center transition-all cursor-pointer ${
                          timeHorizon === item.id 
                            ? 'border-blue-600 bg-blue-50/45 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                        }`}
                      >
                        <Clock className="w-4 h-4 mb-1 text-blue-600" />
                        <span className="text-[12px] block">{item.label}</span>
                        <span className="text-[9px] text-slate-500 font-normal mt-0.5">{item.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    2. Primary Investment Goal
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Wealth', title: 'Generational Wealth Maximization', desc: 'Compound long-term legacy assets to build significant purchasing power.' },
                      { id: 'Retirement', title: 'Target Retirement Fund Creation', desc: 'Build predictable compounding with a soft transition toward fixed income.' },
                      { id: 'Education', title: 'Global Higher Education Fund', desc: 'Match local and international student tuition inflation with currency resilience.' },
                      { id: 'TaxSaving', title: 'AMFI Regulated Tax Saving (Section 80C)', desc: 'Utilize ELSS plans with a 3-year lock-in for tax deductions.' },
                      { id: 'RegularIncome', title: 'Regular Systematic Passive Income', desc: 'Generate disciplined monthly cash flows through dynamic withdrawals.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setGoal(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          goal === item.id 
                            ? 'border-blue-600 bg-blue-50/30 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          goal === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {goal === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    3. Withdrawal & Liquidity Profile
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'No', title: 'Locked Core (Zero withdrawal needs)', desc: 'Allowing compounding to run uninterrupted without lock-in constraints.' },
                      { id: 'Emergency', title: 'Liquidity Contingency Buffer', desc: 'Need access to up to 25% of the position in case of emergencies.' },
                      { id: 'Planned', title: 'Planned Withdrawals (Milestone target)', desc: 'Expected exit strategy near the end of the investment timeline.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setWithdrawalNeeds(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          withdrawalNeeds === item.id 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          withdrawalNeeds === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {withdrawalNeeds === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: PSYCHOLOGICAL RISK PROFILE & STRUCTURAL BURDENS */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in" id="wizard-step-3">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    1. Self-Assessed Risk Capacity
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Conservative', label: 'Conservative', desc: 'Safety First', icon: Shield },
                      { id: 'Moderate', label: 'Moderate', desc: 'Balanced Core', icon: Target },
                      { id: 'Aggressive', label: 'Aggressive', desc: 'Compounding CAGR', icon: TrendingUp }
                    ].map((item) => {
                      const IconComp = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRiskCapacity(item.id as any)}
                          className={`p-3 rounded-xl border text-center flex flex-col justify-center items-center transition-all cursor-pointer ${
                            riskCapacity === item.id 
                              ? 'border-blue-600 bg-blue-50/45 text-blue-900 font-bold' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                          }`}
                        >
                          <IconComp className="w-5 h-5 mb-1 text-slate-650" />
                          <span className="text-[12px] block font-semibold">{item.label}</span>
                          <span className="text-[9px] text-slate-500 font-normal mt-0.5">{item.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    2. Market Drawdown Behavioral Reaction
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Panic', title: 'Panic & Redeem (Protect Remaining)', desc: 'I would withdraw immediately if capital dropped 25% from its peak.' },
                      { id: 'DoNothing', title: 'Hold & Monitor (Wait for recovery)', desc: 'I recognize corrections are transient and can easily wait 18-24 months.' },
                      { id: 'BuyMore', title: 'Strategic Buy-In (Double down)', desc: 'I look for discounts during steep corrections to allocate extra capital.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setMarketShock(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          marketShock === item.id 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          marketShock === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {marketShock === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    3. Dependency Level & Debt Commitments
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Low', title: 'Minimal Commitments / Low liabilities', desc: 'No active major mortgages or dependants. Can handle high short-term loss volatility.' },
                      { id: 'Moderate', title: 'Routine Commitments / Average burdens', desc: 'Standard family support liabilities and simple home payments.' },
                      { id: 'High', title: 'Maximum Commitments / High obligations', desc: 'Sole earner with large mortgages, education loans, and parent dependants.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setBurdenLevel(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          burdenLevel === item.id 
                            ? 'border-blue-600 bg-blue-50/20 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          burdenLevel === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {burdenLevel === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: STRATEGIC OBJECTIVE & COMPREHENSIVE MATCH */}
            {step === 4 && (
              <div className="space-y-6 animate-fade-in" id="wizard-step-4">
                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    1. Core Strategic Investment Objective
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'Growth', title: 'High Equities Capital Expansion', desc: 'Target highest compounded CAGR yields over long systematic horizons.' },
                      { id: 'InflationHedge', title: 'Multi-Asset Currency & Inflation Protect', desc: 'Buffer your capital from domestic purchasing devaluation using Gold overlays.' },
                      { id: 'Stability', title: 'Balanced Volatility Moderation', desc: 'Smooth out sudden drawdowns via blended debt allocations.' },
                      { id: 'Preservation', title: 'Absolute Core Preservation', desc: 'Focus strictly on secure AAA corporate bonds and floating treasury notes.' }
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setObjective(item.id as any)}
                        className={`w-full p-3 rounded-xl border text-left flex gap-3 transition-all cursor-pointer ${
                          objective === item.id 
                            ? 'border-blue-600 bg-blue-50/30 text-blue-900 font-bold' 
                            : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                          objective === item.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {objective === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[12.5px] block leading-none">{item.title}</span>
                          <span className="text-[10.5px] text-slate-500 font-normal block mt-1 leading-tight">{item.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    2. Distribution & Secondary Gains Mode
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDividendMode('Reinvest')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        dividendMode === 'Reinvest' 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                      }`}
                    >
                      <Coins className="w-4 h-4 text-blue-600 mb-2" />
                      <div>
                        <span className="text-[13px] block">Compound Growth</span>
                        <span className="text-[10px] text-slate-500">Reinvest secondary gains</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDividendMode('SWP')}
                      className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                        dividendMode === 'SWP' 
                          ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold' 
                          : 'border-slate-200 hover:border-slate-300 text-slate-705 bg-white'
                      }`}
                    >
                      <Calendar className="w-4 h-4 text-blue-600 mb-2" />
                      <div>
                        <span className="text-[13px] block">Regular SWP Payout</span>
                        <span className="text-[10px] text-slate-500">Systematic cash flows</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Stepper controls */}
            <div className="flex items-center gap-3 pt-6 border-t border-slate-100 mt-6 md:mt-8">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-3 rounded text-[13px] font-bold bg-white text-slate-700 cursor-pointer transition-all active:scale-[0.98]"
                >
                  Back
                </button>
              )}
              
              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="flex-grow flex items-center justify-center gap-1 bg-[#0F172A] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all active:scale-[0.98]"
                >
                  <span>Continue Matcher</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartSimulation}
                  disabled={isSimulating}
                  className="flex-grow flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-[13px] font-bold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {isSimulating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin" />
                      <span>Running Profiling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Analyze Profile & Fetch Funds</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>

          {/* RIGHT: Financial Planner's LIVE Sandbox Insights (Spans 7 cols on lg) */}
          <div className="lg:col-span-12 xl:col-span-7 space-y-6">
            
            {/* Live Sandbox Insights Header & Graph */}
            <div className="bg-slate-900 rounded-3xl p-6 sm:p-7 text-white border border-slate-850 shadow-sm relative overflow-hidden text-left">
              <div className="absolute top-0 right-0 w-36 h-36 bg-blue-600/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex justify-between items-center flex-wrap gap-3">
                <div>
                  <span className="text-[10px] font-mono font-bold tracking-wider text-blue-400 uppercase bg-blue-500/10 border border-blue-500/25 px-2.5 py-1 rounded">
                    Planner Sandbox Diagnostics (Live updates)
                  </span>
                  <h4 className="font-display font-medium text-[20px] text-white mt-2">Active Consulting Matrix Score</h4>
                </div>
                <div className="bg-slate-850 border border-slate-800 px-4 py-2 rounded-2xl text-center">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase leading-none">Profile Index</span>
                  <span className="text-[25px] font-mono font-bold text-emerald-400 mt-1 block leading-none">{advisorScore} <span className="text-[12px] text-slate-500">/ 10</span></span>
                </div>
              </div>

              {/* Discovery Responses Map */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
                <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-wider leading-none">Deployment</span>
                  <span className="text-[12px] font-bold text-white block mt-1.5">{capitalType === 'SIP' ? 'Monthly SIP' : 'Lumpsum'}</span>
                </div>
                <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-wider leading-none">Milestone</span>
                  <span className="text-[12px] font-bold text-white block mt-1.5">{timeHorizon === '1-3' ? '1-3 Yrs' : timeHorizon === '3-5' ? '3-5 Yrs' : '5+ Years'}</span>
                </div>
                <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-wider leading-none">Behavior Index</span>
                  <span className="text-[12px] font-bold text-white block mt-1.5">
                    {marketShock === 'Panic' ? 'Risk-Averse' : marketShock === 'DoNothing' ? 'Moderate' : 'Aggressive buy'}
                  </span>
                </div>
                <div className="bg-slate-850/60 p-3 rounded-xl border border-slate-800 text-left">
                  <span className="text-[9.5px] font-mono text-slate-400 block uppercase tracking-wider leading-none">Financial Burdens</span>
                  <span className="text-[12px] font-bold text-white block mt-1.5">{burdenLevel === 'Low' ? 'Minimal' : burdenLevel === 'Moderate' ? 'Standard' : 'High Oblig.'}</span>
                </div>
              </div>

              {/* Dynamic Asset allocation live preview */}
              <div className="mt-6 pt-5 border-t border-slate-800/80">
                <h5 className="text-[11.5px] font-bold text-slate-350 uppercase tracking-wide">Target Asset Allocation Preview:</h5>
                <p className="text-[13px] text-slate-400 mt-1">Aligned Portfolio Formula Model: <strong className="text-white font-medium">{liveAssetMix.title}</strong> ({liveAssetMix.riskLabel})</p>
                
                <div className="grid grid-cols-3 gap-3.5 mt-3.5">
                  <div className="bg-slate-850/40 p-2.5 rounded-xl border border-slate-800 border-l-4 border-l-blue-500">
                    <span className="text-[10px] text-slate-450 text-slate-400 font-mono block">Equities Mix:</span>
                    <span className="text-[14px] font-bold text-white">{liveAssetMix.equity}%</span>
                  </div>
                  <div className="bg-slate-850/40 p-2.5 rounded-xl border border-slate-800 border-l-4 border-l-emerald-500">
                    <span className="text-[10px] text-slate-450 text-slate-400 font-mono block">Fixed Yields:</span>
                    <span className="text-[14px] font-bold text-white">{liveAssetMix.debt}%</span>
                  </div>
                  <div className="bg-slate-850/40 p-2.5 rounded-xl border border-slate-800 border-l-4 border-l-amber-500">
                    <span className="text-[10px] text-slate-450 text-slate-400 font-mono block">Gold Overlay:</span>
                    <span className="text-[14px] font-bold text-white">{liveAssetMix.gold}%</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 text-[11px] text-slate-450 text-slate-400 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Scoring calibrated under real AMFI Regular models</span>
                <span>Active 2026 guidelines locked</span>
              </div>
            </div>

            {/* Empty onboarding prompt or tiny live snippet */}
            {!showResults ? (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-8 py-10 text-center space-y-6 shadow-xs min-h-[350px] flex flex-col justify-center items-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-xs">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="max-w-md mx-auto text-center space-y-2">
                  <h3 className="font-display font-bold text-[20px] text-slate-900">Run Profiling Diagnostics</h3>
                  <p className="text-[13px] text-slate-500 leading-relaxed max-w-sm mx-auto">
                    Complete all 4 Steps of the onboarding questionnaire to design a bespoke portfolio blueprint aligned with your financial capacity.
                  </p>
                </div>
                <div className="flex gap-4 text-[10.5px] font-mono text-slate-450 text-slate-400 border-t border-slate-100 pt-4 w-full justify-center">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-600/90" /> AMFI Registered Regular Schemes</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5 text-emerald-600/90" /> Calibrated Conservative Returns</span>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-600/5 border border-emerald-500/25 rounded-3xl p-6 shadow-xs animate-fade-in text-slate-800 space-y-4 text-left">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded">
                  Portfolio Profile Complete
                </span>
                <h3 className="font-display font-medium text-[19px] text-slate-900 leading-tight">
                  Suggested Anchor Regular Fund: <strong className="font-bold text-emerald-700">{suggestedFund.name}</strong>
                </h3>
                <p className="text-[13px] text-slate-650 leading-relaxed font-sans">
                  The metric planner has analyzed your risk level, horizon expectations, and financial parameters. The optimal regular plan has been identified. Check out our customized asset allocation mix below.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* BOTTOM COMPREHENSIVE OUTPUT SECTION (Triggered on ShowResults) */}
        {showResults && (
          <div className="mt-12 space-y-12 animate-fade-in border-t border-slate-200/60 pt-12" id="finder-results-section">
            
              {/* MID-PAGE CTA BOX */}
              <div className="bg-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6 text-left mb-6 shadow-md" id="mid-page-cta">
                <div className="space-y-2 max-w-2xl">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                    Regulatory Advisory Protocol
                  </span>
                  <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white mt-2">
                    Start Your Investments with AMFI Licensed Mutual Fund Distributor Now!
                  </h3>
                </div>

                <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-auto">
                  <button
                    type="button"
                    onClick={() => setCurrentPage('connect')}
                    className="bg-blue-600 hover:bg-blue-700 font-bold text-[13px] text-white px-6 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center shadow-md shadow-blue-500/10"
                  >
                    <span>Connect with Team</span>
                    <ArrowRight className="w-4 h-4 text-white" />
                  </button>
                  <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                    AMFI ARN {AMFI_ARN_DETAILS.arnNumber} ACTIVE
                  </div>
                </div>
              </div>

              {/* Header section with Reset */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-150 pb-5">
              <div className="text-left">
                <span className="text-[11.5px] font-mono font-bold uppercase text-blue-600 tracking-wider bg-blue-50 px-3 py-1 rounded-full">
                  Diagnostic Solutions Summary
                </span>
                <h2 className="font-display font-bold text-2.5xl sm:text-3.5xl text-slate-900 tracking-tight mt-2.5">
                  Calibrated Strategic Portfolio Match
                </h2>
              </div>
              
              <button
                onClick={handleReset}
                className="inline-flex items-center gap-2 hover:bg-slate-100 border border-slate-200/90 text-[12.5px] font-bold py-2 px-4 rounded-xl transition-all cursor-pointer bg-white active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Finder</span>
              </button>
            </div>

            {/* NEW SECTION: ASSET ALLOCATION EXPLANATION BEFORE THE FUND DETAIL */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 text-left shadow-sm space-y-6" id="asset-allocation-blueprint">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center shrink-0">
                  <PieIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-400 block uppercase tracking-wider font-bold">First Phase Diagnosis</span>
                  <h3 className="font-display font-bold text-[22px] text-slate-900 tracking-tight mt-1">Calibrated Asset Allocation Blueprint</h3>
                  <p className="text-[13.5px] text-slate-500 mt-2">
                    Before selecting specific funds, a professional planner balances risk using distinct asset classes. Based on your behavioral index score of <strong className="text-blue-600 font-bold">{advisorScore}/10</strong>, your capital achieves its best risk-adjusted yield using this structure:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4 items-center">
                {/* Allocations breakdown bar details (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="text-[14px] font-bold text-slate-850">Asset Allocation Strategy: <span className="text-blue-600">{suggestedFund.assetClassTitle}</span></h4>
                  
                  <div className="space-y-3.5">
                    {suggestedFund.assetClassMix.map((mixItem, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex justify-between items-center text-[12.5px]">
                          <span className="font-medium text-slate-750 flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: mixItem.color }} />
                            {mixItem.name}
                          </span>
                          <span className="font-mono font-bold text-slate-900">{mixItem.value}% Weight</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-505" 
                            style={{ width: `${mixItem.value}%`, backgroundColor: mixItem.color }} 
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-[12.5px] text-slate-500 mt-4 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <strong>Why this asset mix is selected:</strong> {timeHorizon === '1-3' 
                     ? 'Because your milestone lies within 36 months, equities are strictly limited to 10% to prevent transient drawdowns, placing 80% into short-term corporate debt for capital preservation.' 
                     : `With a ${timeHorizon === '3-5' ? 'medium' : 'long-term'} timeline of ${timeHorizon}, allocating ${suggestedFund.assetClassMix[0].value}% to Indian growth shares capitalizes on corporate expansion while keeping a gold or fixed-income barrier for market corrections.`}
                  </p>
                </div>

                {/* Pie Chart Representation (5 cols) */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-full h-[220px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={suggestedFund.assetClassMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {suggestedFund.assetClassMix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => [`${value}% Weights`, 'Asset Allocation']}
                          contentStyle={{ fontSize: '12px', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] font-mono mt-1 text-slate-500">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-blue-500" /> Equities</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-emerald-500" /> Debt / Yield</span>
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded bg-amber-500" /> Gold Shield</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION B: DETAILED SELECTED REGULAR FUND BREAKDOWN (REAL DATA) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch" id="anchored-fund-diagnostic">
              
              {/* Card 1: Main statistics card (5 cols) */}
              <div className="lg:col-span-5 bg-[#0F172A] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 flex flex-col justify-between shadow-lg relative overflow-hidden text-left">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.12),transparent_45%)]" />
                
                <div className="relative z-10 space-y-5 text-left">
                  <div className="flex justify-between items-start">
                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-400/20 text-[10.5px] font-mono font-bold px-2.5 py-1 rounded uppercase tracking-wider">
                      Optimal Match allocation Anchor
                    </span>
                    <span className="text-[12.5px] font-mono text-slate-400 font-bold">{suggestedFund.symbol}</span>
                  </div>

                  <h3 className="font-display font-bold text-2xl sm:text-[25px] leading-tight text-white tracking-tight">
                    {suggestedFund.name}
                  </h3>

                  <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">Past 3-Year CAGR (Regular)</span>
                      <span className="text-[19px] font-bold text-emerald-400">~{suggestedFund.threeYrCAGR}% p.a.</span>
                    </div>
                    <div>
                      <span className="text-[11px] font-mono text-slate-400 block uppercase">Past 5-Year CAGR (Regular)</span>
                      <span className="text-[19px] font-bold text-emerald-400">~{suggestedFund.fiveYrCAGR}% p.a.</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800 space-y-3 text-[12.5px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Scheme Category:</span>
                      <span className="font-bold text-white">{suggestedFund.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Assets Managed:</span>
                      <span className="font-bold text-white">{suggestedFund.aum}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expense Ratio:</span>
                      <span className="font-bold text-white">{suggestedFund.expenseRatio}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fund Manager:</span>
                      <span className="font-bold text-white">{suggestedFund.fundManager}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exit Load Parameters:</span>
                      <span className="font-bold text-white text-right">{suggestedFund.exitLoad}</span>
                    </div>
                  </div>
                </div>

                <div className="relative z-10 pt-6 mt-6 border-t border-slate-800 text-[11px] text-slate-400 leading-relaxed bg-slate-800/20 p-3 rounded-xl border border-slate-700/30">
                  <strong>Verification details:</strong> Returns data is sourced from historical regular plans performance. Regular plan yields account for operating/intermediary structures under active SEBI regulations. Past CAGR yields do not promise immediate future gains.
                </div>

              </div>

              {/* Card 2: Written diagnostics narrative (7 cols) */}
              <div className="lg:col-span-7 bg-white border border-slate-200/95 rounded-3xl p-6 sm:p-8 flex flex-col justify-between text-left shadow-sm">
                
                <div className="space-y-6">
                  {/* MID-PAGE CTA BOX */}
                  <div className="bg-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6 text-left mb-2 shadow-md">
                    <div className="space-y-2 max-w-2xl">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                        Regulatory Advisory Protocol
                      </span>
                      <h3 className="font-display font-bold text-[19px] sm:text-[21px] tracking-tight text-white mt-2">
                        Start Your Investments with AMFI Licensed Mutual Fund Distributor Now!
                      </h3>
                    </div>

                    <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-auto">
                      <button
                        type="button"
                        onClick={() => setCurrentPage('connect')}
                        className="bg-blue-600 hover:bg-blue-700 font-bold text-[12.5px] text-white px-5 py-3 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center shadow-md shadow-blue-500/10"
                      >
                        <span>Connect with Team</span>
                        <ArrowRight className="w-4 h-4 text-white" />
                      </button>
                      <div className="text-center font-mono text-[9px] text-slate-400 uppercase tracking-widest">
                        AMFI ARN {AMFI_ARN_DETAILS.arnNumber} ACTIVE
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-blue-600 font-bold uppercase tracking-wider text-[11px] font-mono">
                      Analytical Rationale
                    </h4>
                    <h3 className="font-display font-bold text-[22px] tracking-tight text-slate-900 mt-1">
                      Why This Asset Fits Your Plan
                    </h3>
                    <p className="text-[13.5px] text-slate-650 leading-relaxed font-sans mt-3">
                      {suggestedFund.whySuited}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 text-[13px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <Award className="w-4 h-4 text-emerald-600" />
                        <span>Core Scheme Objective</span>
                      </h5>
                      <p className="text-[12.5px] text-slate-550 leading-relaxed">
                        {suggestedFund.objectiveDescription}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h5 className="font-bold text-slate-800 text-[13px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                        <TrendingUp className="w-4 h-4 text-blue-600" />
                        <span>Investment Strategy</span>
                      </h5>
                      <p className="text-[12.5px] text-slate-550 leading-relaxed">
                        {suggestedFund.strategyDescription}
                      </p>
                    </div>
                  </div>

                  {/* Top holdings of the suggested fund */}
                  <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-100">
                    <h5 className="font-display font-bold text-[13.5px] text-slate-900 mb-3 block">
                      Target Underlying Top Allocation Holdings:
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {suggestedFund.topHoldings.map((hold, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-150">
                          <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                          <span className="text-[11.5px] text-slate-700 font-mono font-medium truncate">{hold}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-6 border-t border-slate-100">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                  <span>Calculated from active regulatory portfolios dated Q2 2026</span>
                </div>

              </div>

            </div>



            {/* NEW SECTION: DETAILED matched fund types (Hybrid, Multicap, Flexi, Arbitrage, US, Japan, Multi Asset, etc.) */}
            <div className="space-y-6" id="diverse-fund-categories-section">
              <div className="text-left max-w-3xl">
                <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-3.5 py-1 rounded-full">
                  Educational Profile Category Mapping
                </span>
                <h3 className="font-display font-bold text-[24px] text-slate-900 mt-2.5">
                  Calibrated Diagnostic Alignment by Fund Category
                </h3>
                <p className="text-slate-500 text-[13.5px] mt-2">
                  Based on your Private Solutions Discovery behavioral inputs, this dynamic mapping illustrates how distinct regular mutual fund categories align with your parameters. Review the analytical relevance and past performance metrics below.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {categoryMatchedFunds.map((item) => {
                  const IconComponent = item.icon;
                  const isHighlyRelevant = parseFloat(item.relevanceScore) >= 90;
                  return (
                    <div 
                      key={item.id} 
                      className="bg-white border border-slate-200/80 hover:border-blue-200 hover:shadow-xs transition-all duration-300 rounded-3xl p-5 flex flex-col justify-between"
                    >
                      <div className="space-y-3.5 text-left">
                        <div className="flex justify-between items-start gap-2">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-650 flex items-center justify-center shrink-0">
                            <IconComponent className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className={`text-[9 rounded-full px-2.5 py-0.5 font-mono text-[9.5px] font-bold ${
                            isHighlyRelevant 
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                              : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            {item.relevanceScore} Match Relevance
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase tracking-wider leading-none">
                            {item.categoryName}
                          </span>
                          <h4 className="font-display font-bold text-[14px] text-slate-800 mt-1.5 leading-tight">
                            {item.fundName}
                          </h4>
                        </div>

                        <p className="text-[12px] text-slate-500 leading-relaxed font-sans min-h-[96px]">
                          {item.whyMatched}
                        </p>
                      </div>

                      <div className="pt-3.5 mt-4 border-t border-slate-100 space-y-2 text-[11px] font-mono text-left shrink-0">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Assets Managed:</span>
                          <span className="font-bold text-slate-750">{item.aum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Past 3Yr Return:</span>
                          <span className="font-bold text-emerald-600">~{item.pastCAGR}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expense Ratio:</span>
                          <span className="font-bold text-slate-705 text-slate-700">{item.expense}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SECTION C: THREE POTENTIAL PORTFOLIOS TO CHOOSE AS PER RISK CAPACITY */}
            <div className="space-y-6" id="three-risk-portfolios-section">
              <div className="text-left max-w-2xl">
                <span className="text-[11px] font-mono font-bold tracking-wider text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full">
                  Comprehensive Portfolio Compounding Comparison
                </span>
                <h3 className="font-display font-bold text-[24px] text-slate-900 mt-2.5">
                  Three Potential Portfolios as per Risk Capacity & Target Yields
                </h3>
                <p className="text-slate-550 text-[13.5px] mt-2">
                  Select a portfolio to run projections on capital compounding growth. Each contains active, real Indian mutual funds with realistic, conservative regular expected returns.
                </p>
              </div>

              {/* Tabs selector */}
              <div className="flex border-b border-slate-200">
                {(['Low', 'Moderate', 'High'] as const).map((key) => {
                  const port = simulatedPortfolios[key];
                  return (
                    <button
                      key={key}
                      onClick={() => setActivePortfolioTab(key)}
                      className={`flex-1 py-3 text-center border-b-2 font-display text-[14px] sm:text-[15px] font-bold transition-all cursor-pointer ${
                        activePortfolioTab === key 
                          ? 'border-blue-600 text-blue-700' 
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {port.riskClass} ({port.expectedReturnMin}% - {port.expectedReturnMax}%)
                    </button>
                  );
                })}
              </div>

              {/* Active Portfolio Details */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in">
                
                {/* Allocations Table + Rationale (7 cols) */}
                <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 text-left space-y-6">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                      Selected High-Impact Asset Blueprint
                    </span>
                    <h4 className="font-display font-bold text-[20px] text-slate-900 mt-1">
                      {activePortfolio.name}
                    </h4>
                    <p className="text-[13px] text-slate-500 mt-2 italic font-sans leading-relaxed">
                      "{activePortfolio.rationale}"
                    </p>
                  </div>

                  {/* Component Breakdown Table */}
                  <div className="space-y-3">
                    <h5 className="font-display font-semibold text-[13.5px] text-slate-900">
                      Portfolio Core Constituents Weights:
                    </h5>
                    
                    <div className="border border-slate-150 rounded-2xl overflow-hidden divide-y divide-slate-100">
                      {activePortfolio.allocations.map((allocVal, idxVal) => (
                        <div key={idxVal} className="flex p-3 sm:p-4 items-center justify-between text-[13px]">
                          <div className="flex items-start gap-2.5">
                            <span className="w-5 h-5 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idxVal + 1}
                            </span>
                            <div>
                              <strong className="text-slate-850 font-semibold block">{allocVal.fundName}</strong>
                              <span className="text-[11px] text-slate-500 block">Plan: Regular Plan - Growth Mode</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-[14.5px] font-mono font-bold text-slate-900 block">{allocVal.weight}%</span>
                            <span className="text-[11px] text-emerald-600 font-medium block">~{allocVal.annualReturn}% past CAGR</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dynamic calculation banner */}
                  <div className="bg-blue-600/5 p-4 rounded-xl border border-blue-500/10 text-[12px] text-blue-800 flex items-start gap-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5" />
                    <div>
                      An overall blended return of <strong className="font-bold">{activePortfolio.expectedReturnMin}% to {activePortfolio.expectedReturnMax}%</strong> represents a practical and realistic return expectation. We avoid high assumptions to ensure your financial plan remains reliable across fluctuating market segments.
                    </div>
                  </div>
                </div>

                {/* Compound Growth Simulator Widget (5 cols) */}
                <div className="lg:col-span-12 xl:col-span-5 bg-[#0F172A] text-white rounded-3xl p-6 sm:p-7 border border-slate-800 text-left space-y-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="p-1 px-2.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-[10px] font-bold block uppercase">
                        Dynamic Compounding Simulator
                      </span>
                      <span className="text-[11px] font-mono text-slate-400">25-Year Outlook</span>
                    </div>

                    <h4 className="font-display font-medium text-[18px]">
                      Projected Capital Value Growth
                    </h4>

                    {/* Simple summary counts */}
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-800 text-[12px]">
                      <div>
                        <span className="text-slate-400 block uppercase font-mono text-[10px]">Total Invested:</span>
                        <strong className="text-[18px] text-white font-bold block mt-1">
                          ₹{projectionData[projectionData.length - 1].Invested.toLocaleString('en-IN')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block uppercase font-mono text-[10px]">Compounded Wealth:</span>
                        <strong className="text-[18px] text-emerald-400 font-bold block mt-1">
                          ₹{projectionData[projectionData.length - 1].CompoundedWealth.toLocaleString('en-IN')}
                        </strong>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="h-[180px] w-full mt-4">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={projectionData} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
                          <XAxis dataKey="year" stroke="#475569" style={{ fontSize: '9px', fontFamily: 'monospace' }} />
                          <YAxis stroke="#475569" style={{ fontSize: '9px', fontFamily: 'monospace' }} tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                            formatter={(value) => [ `₹${value.toLocaleString('en-IN')}`, '']}
                          />
                          <Bar dataKey="CompoundedWealth" fill="#3b82f6" name="Compounded Wealth" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="Invested" fill="#1e293b" name="Total Capital Invested" radius={[4, 4, 0, 0]} stroke="#475569" strokeWidth={1} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <p className="text-[10.5px] text-slate-450 leading-relaxed text-slate-400 font-sans p-3 bg-slate-800/40 rounded-xl border border-slate-755 border-slate-800">
                    *The projection operates under consistent periodic rate assumptions of {((activePortfolio.expectedReturnMin + activePortfolio.expectedReturnMax) / 2).toFixed(1)}% compounded over a 25-year term. Regular plan returns fluctuated slightly due to market conditions, and are presented to help visualize systematic long-term growth.
                  </p>
                </div>

              </div>

            </div>

            {/* CONSULTING APPOINTMENT CALIBRATION CTA */}
            <div className="bg-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-slate-850 flex flex-col md:flex-row justify-between items-center gap-6 text-left" id="discovery-appointment-cta">
              <div className="space-y-2 max-w-2xl">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2.5 py-1 rounded">
                  Regulatory Advisory Protocol
                </span>
                <h3 className="font-display font-bold text-xl sm:text-2xl tracking-tight text-white mt-2">
                  Ready to lock your selection compliant under Indian Tax & AMFI Laws?
                </h3>
                <p className="text-[13px] text-slate-355 text-slate-300 leading-relaxed font-sans mt-2">
                  Our accredited consulting distributors will double-audit your matched mutual funds, verify correct capital deployment limits, clear necessary KYC clearances for NRIs, and coordinate seamless routing setup.
                </p>
              </div>

              <div className="shrink-0 flex flex-col gap-2.5 w-full md:w-auto">
                <button
                  type="button"
                  onClick={() => setCurrentPage('connect')}
                  className="bg-blue-600 hover:bg-blue-700 font-bold text-[13px] text-white px-6 py-3.5 rounded-full flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 text-center shadow-md shadow-blue-500/10"
                >
                  <span>Connect with Certified Partner</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>
                <div className="text-center font-mono text-[9px] text-slate-450 text-slate-400 uppercase tracking-widest">
                  AMFI ARN {AMFI_ARN_DETAILS.arnNumber} ACTIVE
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
