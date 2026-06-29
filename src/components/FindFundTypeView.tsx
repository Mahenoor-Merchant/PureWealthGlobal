/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Target, Shield, HelpCircle, ArrowRight, CheckCircle, 
  Sparkles, TrendingUp, Info, Briefcase, Calendar, 
  Coins, RotateCcw, Landmark, Clock, ChevronRight,
  TrendingDown, Percent, Award, BookOpen, ExternalLink, Send,
  AlertTriangle, BrainCircuit, LineChart, PieChart as PieIcon, ChevronLeft, BarChart3,
  Globe, Info as InfoIcon, Check, Lock, PhoneCall
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { SharedSurveyData } from '../types';
import PasswordDialog from './PasswordDialog';
import TakeActionTodayForm from './TakeActionTodayForm';

// Structuring Category Diagnosis Output
interface FundCategoryDetails {
  id: string;
  name: string;
  superCategory: 'Equity' | 'Debt' | 'Hybrid' | 'Other';
  relevance: '🏆 Optimal Match (Primary)' | '🥈 Alternative / Diversifier (Secondary)' | '🤝 Strategic Companion (Tertiary)';
  whySuited: string;
  threeYrCAGR: number;
  fiveYrCAGR: number;
  riskClass: 'Low' | 'Moderate' | 'High' | 'Very High';
  timeHorizonSuitability: string;
  taxImplication: string;
  exitLoadExpectation: string;
  objectiveDescription: string;
  growwReferenceUrl: string;
  assetClassMix: { name: string; value: number; color: string; }[];
  suitabilityRationale: string;
  toAvoid: {
    category: string;
    reason: string;
  };
  companionAddon: {
    category: string;
    reason: string;
  };
  allocationCaution: string;
}

interface FindFundTypeViewProps {
  setCurrentPage: (page: any) => void;
  triggerPopup?: (force?: boolean) => void;
  surveyData: SharedSurveyData;
  setSurveyData: React.Dispatch<React.SetStateAction<SharedSurveyData>>;
  onTransitionToFindFund: () => void;
}

export default function FindFundTypeView({ 
  setCurrentPage, 
  triggerPopup, 
  surveyData, 
  setSurveyData, 
  onTransitionToFindFund 
}: FindFundTypeViewProps) {
  // Wizard steps: 1 to 4
  const [step, setStep] = useState(1);
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);

  // States for 3-step Lead Magnet Onboarding Timeline
  const [focusedStep, setFocusedStep] = useState<2 | 3>(2);
  const [callName, setCallName] = useState('');
  const [callMobile, setCallMobile] = useState('');
  
  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [callDate, setCallDate] = useState(getLocalDateString());
  const [callTime, setCallTime] = useState('');
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const ALL_TIME_SLOTS = [
    { value: "09:00 AM - 11:00 AM", label: "Morning (09:00 AM - 11:00 AM)", startHour: 9.0 },
    { value: "11:00 AM - 01:00 PM", label: "Morning (11:00 AM - 01:00 PM)", startHour: 11.0 },
    { value: "01:00 PM - 03:00 PM", label: "Afternoon (01:00 PM - 03:00 PM)", startHour: 13.0 },
    { value: "03:00 PM - 05:00 PM", label: "Afternoon (03:00 PM - 05:00 PM)", startHour: 15.0 },
    { value: "05:00 PM - 07:00 PM", label: "Evening (05:00 PM - 07:00 PM)", startHour: 17.0 },
    { value: "07:00 PM - 08:30 PM", label: "Night (07:00 PM - 08:30 PM)", startHour: 19.0 },
    { value: "08:30 PM - 09:30 PM", label: "Night (08:30 PM - 09:30 PM)", startHour: 20.5 },
  ];

  // Scroll triggering references & flags for Pop-up box trigger
  const exclusionsEngineRef = useRef<HTMLDivElement | null>(null);
  const categoryToAvoidRef = useRef<HTMLDivElement | null>(null);
  const cagrRef = useRef<HTMLDivElement | null>(null);

  const triggeredExclusionsEngine = useRef(false);
  const triggeredCategoryToAvoid = useRef(false);
  const triggeredCagrUp = useRef(false);
  const hasScrolledBelowCagr = useRef(false);
  const hasScrolledBelowCategoryToAvoid = useRef(false);
  const lastScrollY = useRef(0);
  const resultsActivatedAt = useRef<number>(0);

  useEffect(() => {
    if (showResults) {
      resultsActivatedAt.current = Date.now();
      lastScrollY.current = window.scrollY;
    }
  }, [showResults]);

  useEffect(() => {
    if (!showResults) return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const isScrollingUp = currentScrollY < lastScrollY.current;

      const now = Date.now();
      if (now - resultsActivatedAt.current < 20000) {
        lastScrollY.current = currentScrollY;
        return;
      }

      // Track if we have scrolled down below categoryToAvoid and cagr sections first
      if (categoryToAvoidRef.current) {
        const rect = categoryToAvoidRef.current.getBoundingClientRect();
        // If its bottom is above 35% of viewport height, it means we scanned down past it
        if (rect.bottom < window.innerHeight * 0.35 && rect.bottom > 0) {
          hasScrolledBelowCategoryToAvoid.current = true;
        }
      }

      if (cagrRef.current) {
        const rect = cagrRef.current.getBoundingClientRect();
        // If its bottom is above 35% of viewport height, we scanned down past it
        if (rect.bottom < window.innerHeight * 0.35 && rect.bottom > 0) {
          hasScrolledBelowCagr.current = true;
        }
      }

      // 1. Show pop-up once scroll past 'Dynamic Portfolio Avoidance Engine' (scrolled down past it)
      if (exclusionsEngineRef.current && !triggeredExclusionsEngine.current) {
        const rect = exclusionsEngineRef.current.getBoundingClientRect();
        if (rect.bottom < window.innerHeight * 0.20 && rect.bottom > 0) {
          triggeredExclusionsEngine.current = true;
          if (triggerPopup) {
            triggerPopup(true);
          }
        }
      }

      // 2. Show pop-up once scroll past 'Category types to avoid' from below (reverse)
      if (categoryToAvoidRef.current && isScrollingUp && hasScrolledBelowCategoryToAvoid.current && !triggeredCategoryToAvoid.current) {
        const rect = categoryToAvoidRef.current.getBoundingClientRect();
        // We scrolled up past it when its top is pushed back down into the screen (past mid-screen)
        if (rect.top > window.innerHeight * 0.45) {
          triggeredCategoryToAvoid.current = true;
          if (triggerPopup) {
            triggerPopup(true);
          }
        }
      }

      // 3. Show pop-up once scroll past 'How Optimal Match (Primary) Compares (Historical CAGR)' from below (reverse)
      if (cagrRef.current && isScrollingUp && hasScrolledBelowCagr.current && !triggeredCagrUp.current) {
        const rect = cagrRef.current.getBoundingClientRect();
        // We scrolled up past it when its top is pushed back down into the screen
        if (rect.top > window.innerHeight * 0.45) {
          triggeredCagrUp.current = true;
          if (triggerPopup) {
            triggerPopup(true);
          }
        }
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [showResults, triggerPopup]);

  // Diagnostic Inputs mapped directly to synced surveyData
  const {
    capitalType,
    capitalAmount,
    inflowStability,
    timeHorizon,
    goal,
    withdrawalNeeds,
    riskCapacity,
    marketShock,
    burdenLevel,
    objective,
    dividendMode,
    shariahOnly
  } = surveyData;

  const setCapitalType = (val: 'SIP' | 'Lumpsum') => setSurveyData(prev => ({ ...prev, capitalType: val }));
  const setCapitalAmount = (val: number) => setSurveyData(prev => ({ ...prev, capitalAmount: val }));
  const setInflowStability = (val: 'Stable' | 'Variable' | 'Windfall') => setSurveyData(prev => ({ ...prev, inflowStability: val }));
  const setTimeHorizon = (val: '1-3' | '3-5' | '5+') => setSurveyData(prev => ({ ...prev, timeHorizon: val }));
  const setGoal = (val: 'Wealth' | 'Retirement' | 'Education' | 'TaxSaving' | 'RegularIncome') => setSurveyData(prev => ({ ...prev, goal: val }));
  const setWithdrawalNeeds = (val: 'No' | 'Emergency' | 'Planned') => setSurveyData(prev => ({ ...prev, withdrawalNeeds: val }));
  const setRiskCapacity = (val: 'Conservative' | 'Moderate' | 'Aggressive') => setSurveyData(prev => ({ ...prev, riskCapacity: val }));
  const setMarketShock = (val: 'Panic' | 'DoNothing' | 'BuyMore') => setSurveyData(prev => ({ ...prev, marketShock: val }));
  const setBurdenLevel = (val: 'Low' | 'Moderate' | 'High') => setSurveyData(prev => ({ ...prev, burdenLevel: val }));
  const setObjective = (val: 'Growth' | 'InflationHedge' | 'Stability' | 'Preservation') => setSurveyData(prev => ({ ...prev, objective: val }));
  const setDividendMode = (val: 'Reinvest' | 'SWP') => setSurveyData(prev => ({ ...prev, dividendMode: val }));
  const setShariahOnly = (val: boolean | ((p: boolean) => boolean)) => {
    setSurveyData(prev => ({ 
      ...prev, 
      shariahOnly: typeof val === 'function' ? (val as any)(prev.shariahOnly) : val 
    }));
  };


  // -------------------------------------------------------------
  // DYNAMIC ARCHITECTURE MATHEMATICAL SCORING ENGINE (PARTS 1-7)
  // -------------------------------------------------------------
  const scoringDetails = useMemo(() => {
    // Part 1, Step 1: Risk Classification Engine
    const riskAppetiteVal = riskCapacity === 'Conservative' ? 2 : riskCapacity === 'Moderate' ? 5 : 8;
    const emotionalVal = marketShock === 'Panic' ? 1 : marketShock === 'DoNothing' ? 5 : 8;
    const dependentsVal = burdenLevel === 'High' ? 1 : burdenLevel === 'Moderate' ? 4 : 7;

    // Risk Capacity Score (RCS)
    const rcs = (riskAppetiteVal * 0.4) + (emotionalVal * 0.3) + (dependentsVal * 0.3);

    // Horizon Score (HS)
    const hs = timeHorizon === '1-3' ? 2 : timeHorizon === '3-5' ? 5 : 8;

    // Final Aggression Index (FAI)
    const fai = (rcs * 0.7) + (hs * 0.3);

    // Part 1, Step 2: Map Final Aggression Index to Equity %
    let baseEquity = 40;
    if (fai <= 3) {
      baseEquity = 20;
    } else if (fai <= 5) {
      baseEquity = 40;
    } else if (fai <= 6.5) {
      baseEquity = 60;
    } else if (fai <= 7.5) {
      baseEquity = 75;
    } else {
      baseEquity = 85; 
    }

    // Step 0: Hard Filters Overrides
    let activeFilters: { rule: string; desc: string; }[] = [];
    let equityAllocation = baseEquity;

    // Rule A: Time Horizon Gate
    if (timeHorizon === '1-3') {
      if (equityAllocation > 30) {
        equityAllocation = 30;
        activeFilters.push({
          rule: "Rule A - Time Horizon Gate (<3 Years)",
          desc: "Equity cap restricted to 30% max. Midcap, Small Cap, Thematic, and International categories are blocked entirely."
        });
      } else {
        activeFilters.push({
          rule: "Rule A - Time Horizon Gate (<3 Years)",
          desc: "Midcap, Small Cap, Thematic, and International categories are blocked entirely due to short time window index risk."
        });
      }
    } else if (timeHorizon === '3-5') {
      if (equityAllocation > 60) {
        equityAllocation = 60;
        activeFilters.push({
          rule: "Rule A - Time Horizon Gate (3–5 Years)",
          desc: "Equity cap restricted to 60% max. Small Cap allocation is capped at a maximum of 10% to prevent cyclical drawdowns."
        });
      } else {
        activeFilters.push({
          rule: "Rule A - Time Horizon Gate (3–5 Years)",
          desc: "Small Cap allocation is restricted to a maximum of 10% representation."
        });
      }
    } else {
      activeFilters.push({
        rule: "Rule A - Long Horizon (5+ Years)",
        desc: "Small Cap representation allowed up to 20% max capacity based on high risk resiliency."
      });
    }

    // Rule B: Emergency Liquidity Override
    if (withdrawalNeeds === 'Emergency') {
      if (equityAllocation > 60) {
        equityAllocation = 60;
        activeFilters.push({
          rule: "Rule B - Emergency Liquidity Override",
          desc: "Immediate emergency liquidity demand forces a minimum of 40% in highly liquid / short term debt reserves, reducing core equity to exactly 60%."
        });
      } else {
        activeFilters.push({
          rule: "Rule B - Emergency Liquidity Override",
          desc: "Emergency withdrawal request actively forces 40%+ into defensive liquid/debt categories."
        });
      }
    }

    // Rule D: SWP Mode Override
    if (dividendMode === 'SWP') {
      if (equityAllocation > 70) {
        equityAllocation = 70;
        activeFilters.push({
          rule: "Rule D - SWP Income Cap",
          desc: "Regular systematic withdrawals require at least 30% in secure Debt/Cash equivalents to buffer returns, capping equity at 70%."
        });
      } else {
        activeFilters.push({
          rule: "Rule D - SWP Income Cap",
          desc: "SWP mode limits overall Small Cap allocation to under 10% to prevent structural cash erosion during downcycles."
        });
      }
    }

    // Rule C: Tax Saving Override
    if (goal === 'TaxSaving') {
      activeFilters.push({
        rule: "Rule C - Tax Saving Override",
        desc: "Goal mandates a minimum of 50% of your chosen Equity allocation under ELSS (Section 80C Tax-Saver Mutual Funds)."
      });
    }

    if (shariahOnly) {
      activeFilters.push({
        rule: "Rule S - Shariah Compliance Lock",
        desc: "Filters out conventional interest-bearing bonds, debt funds, bank stocks, and non-compliant dynamic assets from your blueprints to preserve absolute Shariah values."
      });
    }

    const debtAllocation = 100 - equityAllocation;

    // Step 3: Anchor Fund Category Selection
    let anchorFundCategory = "";
    let anchorFundDesc = "";
    if (shariahOnly) {
      anchorFundCategory = "Tata Ethical Shariah Equity Category";
      anchorFundDesc = "An interest-free, banking-filtered, Shariah-compliant high-grade equity framework focusing on ethical enterprise growth.";
    } else {
      if (equityAllocation <= 30) {
        anchorFundCategory = "Short Duration / Conservative Hybrid";
        anchorFundDesc = "Maintains capital preservation with absolute short term bonds stability and a tiny equity return kicker.";
      } else if (equityAllocation <= 60) {
        anchorFundCategory = "Balanced Advantage / Multi Asset";
        anchorFundDesc = "Dynamically manages equity vs debt weights automatically, shielding against sudden market corrections.";
      } else if (equityAllocation <= 75) {
        anchorFundCategory = "Flexi Cap";
        anchorFundDesc = "An active all-weather equity companion unconstrained by company sizes or sectoral boundary limits.";
      } else {
        anchorFundCategory = "Flexi Cap or Large & Midcap";
        anchorFundDesc = "Harnesses massive compounding by locking together large-cap stability with highly active mid-cap scale leaders.";
      }
    }

    // Step 4: Automated Equity Split Formula
    let flexiCapPct = 0;
    let balancedAdvantagePct = 0;
    let largeCapPct = 0;
    let largeMidCapPct = 0;
    let midCapPct = 0;
    let smallCapPct = 0;
    let elssPct = 0;

    if (equityAllocation > 0) {
      if (shariahOnly) {
        // Shariah-compliant equity allocation: avoid balanced advantage, mid/smallcap speculatory index funds
        if (equityAllocation <= 40) {
          flexiCapPct = Math.round(equityAllocation * 0.70);
          largeCapPct = Math.round(equityAllocation * 0.30);
        } else if (equityAllocation <= 60) {
          flexiCapPct = Math.round(equityAllocation * 0.60);
          largeCapPct = Math.round(equityAllocation * 0.40);
        } else {
          flexiCapPct = Math.round(equityAllocation * 0.50);
          largeCapPct = Math.round(equityAllocation * 0.30);
          largeMidCapPct = Math.round(equityAllocation * 0.20);
        }
        midCapPct = 0;
        smallCapPct = 0;
        balancedAdvantagePct = 0;
      } else {
        if (equityAllocation <= 40) {
          balancedAdvantagePct = Math.round(equityAllocation * 0.70);
          largeCapPct = Math.round(equityAllocation * 0.30);
        } else if (equityAllocation <= 60) {
          flexiCapPct = Math.round(equityAllocation * 0.50);
          largeMidCapPct = Math.round(equityAllocation * 0.30);
          midCapPct = Math.round(equityAllocation * 0.20);
        } else { // 75% to 90%
          flexiCapPct = Math.round(equityAllocation * 0.40);
          largeMidCapPct = Math.round(equityAllocation * 0.30);
          midCapPct = Math.round(equityAllocation * 0.20);
          smallCapPct = Math.round(equityAllocation * 0.10);
        }
      }

      // Apply Hard filters: Horizon Gate
      if (timeHorizon === '1-3') {
        // Block Midcap, Smallcap completely. Redirect to Large Cap.
        largeCapPct += midCapPct + smallCapPct;
        midCapPct = 0;
        smallCapPct = 0;
      } else if (timeHorizon === '3-5') {
        // Small Cap max is 10%
        if (smallCapPct > Math.round(equityAllocation * 0.10)) {
          const shiftValue = smallCapPct - Math.round(equityAllocation * 0.10);
          largeMidCapPct += shiftValue;
          smallCapPct = Math.round(equityAllocation * 0.10);
        }
      } else if (timeHorizon === '5+') {
        // Small Cap max is 20%
        if (smallCapPct > Math.round(equityAllocation * 0.20)) {
          const shiftValue = smallCapPct - Math.round(equityAllocation * 0.20);
          largeMidCapPct += shiftValue;
          smallCapPct = Math.round(equityAllocation * 0.20);
        }
      }

      // Under SWP Mode -> Avoid Small Cap > 10%
      if (dividendMode === 'SWP') {
        if (smallCapPct > 10) {
          const surplusVal = smallCapPct - 10;
          largeMidCapPct += surplusVal;
          smallCapPct = 10;
        }
      }

      // Rule C: Tax Saving - Minimum 50% of total equity goes to ELSS
      if (goal === 'TaxSaving') {
        elssPct = Math.round(equityAllocation * 0.50);
        const remainingEquity = equityAllocation - elssPct;
        const currentSumRatio = (flexiCapPct + balancedAdvantagePct + largeCapPct + largeMidCapPct + midCapPct + smallCapPct) || 1;

        flexiCapPct = Math.round((flexiCapPct / currentSumRatio) * remainingEquity);
        balancedAdvantagePct = Math.round((balancedAdvantagePct / currentSumRatio) * remainingEquity);
        largeCapPct = Math.round((largeCapPct / currentSumRatio) * remainingEquity);
        largeMidCapPct = Math.round((largeMidCapPct / currentSumRatio) * remainingEquity);
        midCapPct = Math.round((midCapPct / currentSumRatio) * remainingEquity);
        smallCapPct = Math.round((smallCapPct / currentSumRatio) * remainingEquity);
      }
    }

    // Equalize active components sum to equityAllocation
    const currentSum = flexiCapPct + balancedAdvantagePct + largeCapPct + largeMidCapPct + midCapPct + smallCapPct + elssPct;
    const diff = equityAllocation - currentSum;
    if (diff !== 0) {
      if (flexiCapPct > 0) flexiCapPct += diff;
      else if (balancedAdvantagePct > 0) balancedAdvantagePct += diff;
      else if (largeCapPct > 0) largeCapPct += diff;
      else largeMidCapPct += diff;
    }

    // Step 5: Debt Split Engine
    let shortDurationPct = 0;
    let corporateBondPct = 0;
    let liquidPct = 0;
    let multiAssetPct = 0;

    if (debtAllocation > 0) {
      if (shariahOnly) {
        // Shariah compliant defensive cushion split: Sovereign pure cash (interest-free) and vault precious metals
        corporateBondPct = Math.round(debtAllocation * 0.50); // Mapped to Physical Gold ETF
        liquidPct = Math.round(debtAllocation * 0.50); // Mapped to Sovereign Interest-Free Liquid Cash Reserves
        shortDurationPct = 0;
        multiAssetPct = 0;
      } else {
        if (debtAllocation >= 40) {
          shortDurationPct = Math.round(debtAllocation * 0.60);
          corporateBondPct = Math.round(debtAllocation * 0.40);
        } else if (debtAllocation >= 20) {
          corporateBondPct = Math.round(debtAllocation * 0.50);
          shortDurationPct = Math.round(debtAllocation * 0.30);
          liquidPct = Math.round(debtAllocation * 0.20);
        } else {
          shortDurationPct = Math.round(debtAllocation * 0.50);
          liquidPct = Math.round(debtAllocation * 0.50);
        }

        // SWP Override: Replace 20% debt with Multi Asset
        if (dividendMode === 'SWP') {
          multiAssetPct = Math.round(debtAllocation * 0.20);
          const remainingDebtSum = debtAllocation - multiAssetPct;
          const currentDebtSum = (shortDurationPct + corporateBondPct + liquidPct) || 1;

          shortDurationPct = Math.round((shortDurationPct / currentDebtSum) * remainingDebtSum);
          corporateBondPct = Math.round((corporateBondPct / currentDebtSum) * remainingDebtSum);
          liquidPct = Math.round((liquidPct / currentDebtSum) * remainingDebtSum);
        }
      }
    }

    // Equalize active debt sum to debtAllocation
    const currentDebtSumTotal = shortDurationPct + corporateBondPct + liquidPct + multiAssetPct;
    const debtDiff = debtAllocation - currentDebtSumTotal;
    if (debtDiff !== 0) {
      if (shortDurationPct > 0) shortDurationPct += debtDiff;
      else if (corporateBondPct > 0) corporateBondPct += debtDiff;
      else liquidPct += debtDiff;
    }

    // Step 6: Execution Strategy Logic
    let executionStrategyTitle = "";
    let executionStrategyText = "";
    let isMandatorySTP = false;

    if (capitalType === 'Lumpsum') {
      if (capitalAmount >= 2000000) {
        isMandatorySTP = true;
        executionStrategyTitle = "Mandatory STP (Systematic Transfer Plan)";
        executionStrategyText = "Lump Sum exceeds ₹20 Lakhs. It is mandatory to park the entire ₹" + capitalAmount.toLocaleString('en-IN') + " in ultra-low risk Liquid/Overnight funds, setting up a weekly/monthly Systematic Transfer Plan (STP) to drip-feed your designated equity baskets over 6-12 months. This mitigates catastrophic market timing shocks.";
      } else {
        executionStrategyTitle = "Structured STP over 6-12 Months";
        executionStrategyText = "For this one-time lumpsum of ₹" + capitalAmount.toLocaleString('en-IN') + ", avoid immediate complete routing to equities. Park inside a Liquid / Short Duration fund and trigger an STP over a defensive 6 to 12-month timeline to average entry valuations.";
      }
    } else { // SIP
      if (inflowStability === 'Stable') {
        executionStrategyTitle = "Systematic Investment Plan (SIP) Compounder";
        executionStrategyText = "Your highly stable capital flows support a monthly recurring SIP of ₹" + capitalAmount.toLocaleString('en-IN') + ". SIP deployment eliminates market timing anxieties, leveraging Rupee Cost Averaging across volatility waves.";
      } else if (inflowStability === 'Variable') {
        executionStrategyTitle = "Hybrid-Bias Progressive SIP Guide";
        executionStrategyText = "Due to volatile or variable business inflows, direct your baseline monthly ₹" + capitalAmount.toLocaleString('en-IN') + " SIP to Balanced Advantage/Multi Asset funds first. Park windfall/peak income in Liquid/Arbitrage accounts, executing top-ups during market correction cycles.";
      } else {
        executionStrategyTitle = "Flexi SIP / Tactical Buffer Setup";
        executionStrategyText = "Deploy volatile windfall cash via automated monthly flexible STP routing of ₹" + Math.round(capitalAmount / 12).toLocaleString('en-IN') + " over 12 months, shielding capital yields.";
      }
    }

    // Step 7: Fund Types to Avoid Engine
    let avoidItems: string[] = [];
    if (riskCapacity === 'Conservative' || fai < 5) {
      avoidItems.push("Avoid Midcap weightings above 10% of total portfolio (Locked at: " + midCapPct + "%)");
      avoidItems.push("Avoid Small Cap Funds directly (High drawdown vulnerability excluded)");
      avoidItems.push("Avoid Sectoral/Thematic Funds (such as Technology, Infrastructure, Energy sectors) which carry massive concentration loops.");
    }

    if (marketShock === 'Panic') {
      avoidItems.push("Avoid high beta / high churn momentum funds, focused equity pools, or microcaps which trigger severe anxiety during normal 20-30% cyclical index corrections.");
    }

    if (timeHorizon === '1-3') {
      avoidItems.push("Avoid Pure Equity Mutual Funds (Large, Mid, or Small Cap) as core targets, as near-term milestone horizons carry a high probability of negative exit yields.");
    }

    if (dividendMode === 'SWP') {
      avoidItems.push("Avoid Small Cap heavy portfolios. SWP redemptions from highly cyclical, crashing small-cap stocks can cause permanent secondary structural capital erosion.");
    }

    if (avoidItems.length === 0) {
      avoidItems.push("No severe active exclusions. Maintain discipline, avoid duplicating identical index managers, and ignore local noise during mid-term bull cycles.");
    }

    return {
      riskAppetiteVal,
      emotionalVal,
      dependentsVal,
      rcs: parseFloat(rcs.toFixed(2)),
      hs,
      fai: parseFloat(fai.toFixed(2)),
      equityAllocation,
      debtAllocation,
      activeFilters,
      anchorFundCategory,
      anchorFundDesc,
      executionStrategyTitle,
      executionStrategyText,
      isMandatorySTP,
      avoidItems,
      splits: {
        flexiCapPct,
        balancedAdvantagePct,
        largeCapPct,
        largeMidCapPct,
        midCapPct,
        smallCapPct,
        elssPct,
        shortDurationPct,
        corporateBondPct,
        liquidPct,
        multiAssetPct
      }
    };
  }, [riskCapacity, marketShock, burdenLevel, timeHorizon, withdrawalNeeds, goal, dividendMode, capitalType, capitalAmount, shariahOnly]);

  // Restart Survey
  const handleReset = () => {
    setStep(1);
    setShowResults(false);
    setActiveTab(0);
    setFocusedStep(2);
    setCallName('');
    setCallMobile('');
    setCallDate(getLocalDateString());
    setCallTime('');
    setFormError('');
    setFormSuccess(false);
    triggeredExclusionsEngine.current = false;
    triggeredCategoryToAvoid.current = false;
    triggeredCagrUp.current = false;
    hasScrolledBelowCagr.current = false;
    hasScrolledBelowCategoryToAvoid.current = false;
    lastScrollY.current = 0;
  };

  // Perform Diagnostic Categorization matching Groww's categories structure
  const diagnosedCategories = useMemo<FundCategoryDetails[]>(() => {
    // 1. Shariah Option Match
    if (shariahOnly) {
      return [
        {
          id: 'shariah-ethical',
          name: 'Tata Ethical Shariah Equity Category',
          superCategory: 'Equity',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Aligned perfectly with your ethical constraints and Shariah financial guidelines.',
          threeYrCAGR: 19.4,
          fiveYrCAGR: 16.8,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Equity rules: 20% short-term (under 1 year), 12.5% long-term (over 1 year) capital gains on profit exceeding ₹1.25L.',
          exitLoadExpectation: 'Generally 1% if redeemed within 365 days of allotment.',
          objectiveDescription: 'Invests primarily in high-grade Shariah-compliant equity instruments filtering out interest-bearing, banking, alcohol, tobacco, gambling, and highly leveraged companies.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/ethical',
          assetClassMix: [
            { name: 'Ethical Indian Equity', value: 96, color: '#10b981' },
            { name: 'Sovereign Cash Reserves', value: 4, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Your selection of Ethical/Shariah filter means we target premium Shariah compliant equity funds. Since you selected a long horizon, this matches the Tata Ethical framework, securing high compounding growth while adhering strictly to values.',
          toAvoid: {
            category: 'Interest-bearing Gilt Debt Funds or Classical Bank Sector Funds',
            reason: 'These funds actively deal in conventional fixed interest-bearing instruments and commercial loans, violating core non-interest values.'
          },
          companionAddon: {
            category: 'Sovereign Physical Gold & Silver ETFs',
            reason: 'Commodity ETFs provide an excellent non-interest hedge that buffers equity volatility and aligns with strict zero-interest ethical benchmarks.'
          },
          allocationCaution: 'Since Ethical portfolios exclude banking & financial sectors (which constitute 25-30% of Indian indices), you will have heavy sector concentration in Technology, Healthcare, and Capital Goods. Be cautious of industrial downturns, and balance with physical metals to preserve liquidity.'
        },
        {
          id: 'shariah-gold',
          name: 'Physical Gold Exchange Traded Funds (ETFs)',
          superCategory: 'Other',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Pure physical asset commodity that provides long-term preservation without any interest mechanics.',
          threeYrCAGR: 12.8,
          fiveYrCAGR: 10.5,
          riskClass: 'Moderate',
          timeHorizonSuitability: '3 Years or More',
          taxImplication: 'Taxed under Indian non-equity criteria rules. Gains are added to your regular taxable income block matching marginal slab formats.',
          exitLoadExpectation: 'Zero exit load for exchange trades, minor management fees included in NAV.',
          objectiveDescription: 'Replicates the domestic spot price of physical gold (99.5% purity) by holding physical bullion under professional vault arrangements.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/gold-funds',
          assetClassMix: [
            { name: 'Physical Gold Bullion', value: 98, color: '#eab308' },
            { name: 'Cash Equivalents', value: 2, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Gold acts as a timeless hedge against economic recession and currency inflation. It conforms to ethical frameworks while providing security for your core assets during severe market shock phases.',
          toAvoid: {
            category: 'Leveraged Paper Bullion Derivatives or Sovereign Interest-Bearing Bonds',
            reason: 'Leveraged derivatives might involve speculative option spreads and interest payments, running counter to premium physical-backed standards.'
          },
          companionAddon: {
            category: 'Tata Ethical / Shariah Equity Fund',
            reason: 'This adds the growth compounding engine of real businesses to gold, creating an ethical all-weather multi-asset strategy.'
          },
          allocationCaution: 'Limit precious metal weightings to 10-15% of your total net portfolio. Gold acts as portfolio insurance; it has no operating earnings or dividends, meaning a high concentration can lead to lower compounding yield over massive bull cycles.'
        },
        {
          id: 'shariah-arbitrage',
          name: 'Low-Risk Arbitrage Derivative Category',
          superCategory: 'Hybrid',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Leveraged stock price spreads rather than interest to deliver steady, ultra-safe payouts.',
          threeYrCAGR: 6.9,
          fiveYrCAGR: 6.1,
          riskClass: 'Low',
          timeHorizonSuitability: '6 Months to 1.5 Years',
          taxImplication: 'Taxed under equity rules: 20% flat STCG under 1 year, and 12.5% LTCG above 1 year, making it highly tax-efficient.',
          exitLoadExpectation: 'Normally 0.25% if redeemed within 15 to 30 days, zero thereafter.',
          objectiveDescription: 'Capitalizes on arbitrage opportunities between cash markets and futures markets of listed shares, bypassing classical credit debt risks.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/arbitrage',
          assetClassMix: [
            { name: 'Hedged Stock Arbitrage', value: 70, color: '#3b82f6' },
            { name: 'Low-interest AAA reserves', value: 30, color: '#10b981' }
          ],
          suitabilityRationale: 'Arbitrage provides low-risk returns similar to short term debt without exposure to long-duration credit defaults or interest-accrual structures, securing standard cash flow efficiency.',
          toAvoid: {
            category: 'High-risk Corporate Non-AAA Debt or Gilt Funds',
            reason: 'Traditional debt funds rely heavily on interest-coupon payments, which represents a conflict for strict Shariah requirements.'
          },
          companionAddon: {
            category: 'Tata Ethical Shariah Equity Fund',
            reason: 'Use this arbitrage bucket as a low-risk systematic parking ground to feed monthly installment SIPs into your core ethical equity fund.'
          },
          allocationCaution: 'Arbitrage funds thrive on high stock market volatility, which widens futures spreads. During sleepy, stagnant stock market months, yields can temporarily descend to level with or fall below standard savings rates. Keep this portion strictly as your low-risk liquid pool.'
        }
      ];
    }

    // 2. Tax Saving Priority Match
    if (goal === 'TaxSaving') {
      return [
        {
          id: 'elss',
          name: 'ELSS (Equity Linked Savings Scheme - Tax Saving)',
          superCategory: 'Equity',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Provides high equity compounding returns with Indian Section 80C tax deduction perks.',
          threeYrCAGR: 18.2,
          fiveYrCAGR: 15.9,
          riskClass: 'Very High',
          timeHorizonSuitability: 'Minimum 3 Years (Mandatory lock-in)',
          taxImplication: 'Eligible for Section 80C deductions (up to ₹1.5L). Standard equity capital gains taxation rules apply upon redemption beyond lock-in.',
          exitLoadExpectation: 'Zero exit load (locked in for exactly 36 months).',
          objectiveDescription: 'An equity mutual fund that commits at least 80% of assets in equities with a legally mandated 3-year lock-in period, making it the shortest lock-in among all 80C tax savers.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/elss',
          assetClassMix: [
            { name: 'Diversified Large Caps', value: 65, color: '#3b82f6' },
            { name: 'Mid and Small Caps', value: 27, color: '#10b981' },
            { name: 'Cash Equivalents', value: 8, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Because you specified a tax-saving objective, the ELSS category is your optimal match. It forces a disciplined 3-year holding period which mitigates panic reactions during market shocks, compounding your growth efficiently.',
          toAvoid: {
            category: 'Taxable High-Churn Short-term Debt or Sectoral Mutual Funds',
            reason: 'High-churn funds generate taxable events with no Section 80C relief, making your net yields lower after accounting for high tax blocks.'
          },
          companionAddon: {
            category: 'PPF (Public Provident Fund) or Sovereign Gold Bonds',
            reason: 'PPF balances the high volatility of ELSS with risk-free guaranteed tax-exempt compounding under Section 80C, creating a flawless hybrid defense.'
          },
          allocationCaution: 'A mandatory 3-year lock-in means you cannot redeem this money even during severe personal emergencies. Ensure you have an independent 6-month liquid reserve, and avoid putting more than 1.5 Lakhs (the maximum Section 80C deduction limit) into ELSS since any amount above that will not save further tax but stays locked.'
        },
        {
          id: 'flexi-cap-tax',
          name: 'Diversified Flexi Cap Equity Category',
          superCategory: 'Equity',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Dynamic equity compounding across market caps with high liquidity (no lock-ins).',
          threeYrCAGR: 19.1,
          fiveYrCAGR: 17.5,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'LTCG on equity: 12.5% tax for returns exceeding ₹1.25 Lakh per year.',
          exitLoadExpectation: '1% if sold within 365 days of investment.',
          objectiveDescription: 'An active equity fund with structural freedom to invest across large-cap, mid-cap, and small-cap stocks based on sector valuations.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/flexi-cap',
          assetClassMix: [
            { name: 'Large Cap Leaders', value: 60, color: '#10b981' },
            { name: 'Mid Cap Growth', value: 25, color: '#3b82f6' },
            { name: 'Small Cap Alpha', value: 12, color: '#f59e0b' },
            { name: 'Liquid Reserves', value: 3, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Provides a liquid growth partner. Once you maximize the 1.5 Lakh tax-saving limit in ELSS, any surplus wealth should go to Flexi Caps to avoid lock-up constraints.',
          toAvoid: {
            category: 'Taxable Debt or Fixed Deposits',
            reason: 'Taxable fixed income returns are fully added to your salary tax bracket, decaying your real yields to below-inflation rates.'
          },
          companionAddon: {
            category: 'ELSS Tax-Saving Mutual Funds',
            reason: 'Perfectly complements your locked-tax saving assets with liquid core equities to build versatile wealth.'
          },
          allocationCaution: 'Flexi Cap fund managers have massive discretion to buy mid/small cap equities. Overlapping holdings across your ELSS and Flexi-cap schemes can over-concentrate your portfolio in mid-caps, making your drawdowns painful during market corrections.'
        },
        {
          id: 'arbitrage-tax',
          name: 'Arbitrage Funds (Tax-Efficient Liquid Deck)',
          superCategory: 'Hybrid',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Delivers steady, defensive yields taxed as equities rather than heavy debt slabs.',
          threeYrCAGR: 7.1,
          fiveYrCAGR: 6.3,
          riskClass: 'Low',
          timeHorizonSuitability: '3 to 12 Months',
          taxImplication: 'Equity taxation rate advantages apply, protecting your debt-like capital from high marginal income slabs.',
          exitLoadExpectation: '0.25% up to 15 days, nil thereafter.',
          objectiveDescription: 'Exploits stock market derivative pricing inefficiencies to earn low-risk yields while holding cash-equivalent arbitrage positions.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/arbitrage',
          assetClassMix: [
            { name: 'Hedged Stock Spread', value: 75, color: '#3b82f6' },
            { name: 'High-Credit Debt Reserves', value: 25, color: '#6366f1' }
          ],
          suitabilityRationale: 'An exceptional shelter to park your tax-allocated funds before reallocating systematically during market corrections.',
          toAvoid: {
            category: 'Standard Debt Mutual Funds or Aggressive Hybrid Funds',
            reason: 'Standard debt is taxed directly at your highest personal income slab, while aggressive hybrid exposes near-term funds to volatile equity crashes.'
          },
          companionAddon: {
            category: 'ELSS Tax Saver',
            reason: 'Run a Systematic Transfer Plan (STP) from this Arbitrage account to feed monthly SIPs into your core ELSS fund, smoothing your cost entry.'
          },
          allocationCaution: 'Do not seek long-term high capital gains here. Keep this as a transactional safety harbor (15-20% weight) to fund tax payments, protect against emergency crashes, or wait out expensive stock valuations.'
        }
      ];
    }

    // 3. Short Horizons (1-3 Years)
    if (timeHorizon === '1-3') {
      if (riskCapacity === 'Conservative' || marketShock === 'Panic') {
        return [
          {
            id: 'liquid-funds',
            name: 'Liquid & Overnight Sovereign Debt Instruments',
            superCategory: 'Debt',
            relevance: '🏆 Optimal Match (Primary)',
            whySuited: 'Absolute capital preservation with high liquidity and near-zero volatility.',
            threeYrCAGR: 6.8,
            fiveYrCAGR: 5.9,
            riskClass: 'Low',
            timeHorizonSuitability: '1 Day to 1 Year',
            taxImplication: 'Redemptions have gains added to your regular taxable income block (marginal tax slab mapping scale).',
            exitLoadExpectation: 'Very minor graded exit load only for first 7 days, zero exit load thereafter.',
            objectiveDescription: 'Deploys capital exclusively into ultra-safe treasury bills, government securities, and highly rated commercial paper maturing within 91 days.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/liquid',
            assetClassMix: [
              { name: 'Sovereign G-Secs', value: 65, color: '#6366f1' },
              { name: 'Premium Corporate Paper', value: 30, color: '#818cf8' },
              { name: 'Cash Overnight', value: 5, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Under a short timeline (1-3 years) with low risk tolerance, your primary directive is capital safety. Liquid or overnight funds prevent any sudden mark-to-market shock, preserving your immediate corpus.',
            toAvoid: {
              category: 'Any Sector/Thematic or Mid & Small Cap Equity Funds',
              reason: 'An aggressive equity correction can wipe out 30-40% of your near-term milestone savings within a short 1-year timeline.'
            },
            companionAddon: {
              category: 'Low Duration / Money Market Funds',
              reason: 'Allows you to capture slightly higher yields for capital that can be locked safely for over 6 months.'
            },
            allocationCaution: 'Yields are tied to RBI repo rate cycles. In a falling interest rate environment, liquid fund payouts will diminish quickly. Keep 80%+ of your short-term pool here and avoid shifting to equity to compensate for low bond yields.'
          },
          {
            id: 'low-duration',
            name: 'Low Duration and Money Market Funds',
            superCategory: 'Debt',
            relevance: '🥈 Alternative / Diversifier (Secondary)',
            whySuited: 'Offers slightly superior yields over standard liquid funds for money held over 6 months.',
            threeYrCAGR: 7.2,
            fiveYrCAGR: 6.5,
            riskClass: 'Low',
            timeHorizonSuitability: '6 Months to 1.5 Years',
            taxImplication: 'Gains are treated as debt income and taxed according to your individual income tax slab rates.',
            exitLoadExpectation: 'Typically zero, ensuring absolute ease of exit.',
            objectiveDescription: 'Invests in highly rated AAA commercial paper, certificates of deposit, and treasury notes maturing in 6 to 12 months.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/low-duration',
            assetClassMix: [
              { name: 'High Grade Corporate Bonds', value: 80, color: '#4f46e5' },
              { name: 'Government Treasury Debt', value: 15, color: '#3b82f6' },
              { name: 'Cash & Overnight', value: 5, color: '#94a3b8' }
            ],
            suitabilityRationale: 'A superb middle path providing slightly better yield margins for conservative short term timelines while keeping default risk negligible.',
            toAvoid: {
              category: 'Credit Risk Debt Mutual Funds',
              reason: 'Credit risk categories hold lower-rated debt paper to generate high yields, which can face sudden default write-downs.'
            },
            companionAddon: {
              category: 'Overnight Liquid Debt Funds',
              reason: 'Pairing gives you instant T+0 overnight redemption liquidity alongside superior low-duration average returns.'
            },
            allocationCaution: 'These funds carry minor interest rate sensitivity. Avoid them if you need access to your capital in under 90 days, and watch out for lower-rated underlying debt paper in aggressive schemes.'
          },
          {
            id: 'arbitrage-short',
            name: 'Arbitrage Funds (Tax-Efficient Liquid Alternative)',
            superCategory: 'Hybrid',
            relevance: '🤝 Strategic Companion (Tertiary)',
            whySuited: 'Hedges risk via market price spreads while securing favorable equity taxation.',
            threeYrCAGR: 6.8,
            fiveYrCAGR: 6.0,
            riskClass: 'Low',
            timeHorizonSuitability: '6 Months to 2 Years',
            taxImplication: 'Standard equity taxation: 20% short-term, 12.5% long-term, which is far lower than your personal debt slab.',
            exitLoadExpectation: 'Usually 0.25% if sold within 15-30 days, zero thereafter.',
            objectiveDescription: 'Locks in simultaneous buy/sell stock trades across cash and future exchanges, avoiding core market market stock direction volatility.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/arbitrage',
            assetClassMix: [
              { name: 'Hedged Cash-Futures Stocks', value: 72, color: '#3b82f6' },
              { name: 'High-Rated Commercial Paper', value: 28, color: '#10b981' }
            ],
            suitabilityRationale: 'If you are in a high tax bracket (30%+ slab) but need short-term stability, this arbitrage fund acts as a massive tax shield for your liquid cash.',
            toAvoid: {
              category: 'Gilt Funds / Long Duration Debt Funds',
              reason: 'Gilt funds carry heavy price fluctuations when RBI interest rates change, causing potential loss on short 1-year windows.'
            },
            companionAddon: {
              category: 'Standard Liquid Debt Funds',
              reason: 'Blends equity-tax tax shields with sovereign security to ensure you are covered both for tax efficiency and extreme safety.'
            },
            allocationCaution: 'If the cash and derivative markets consolidate in a low-volume sideways cycle, arbitrage yields can contract. Do not make this your sole short-term fund; balance with 30-40% overnight debt to guarantee fixed, absolute liquidity.'
          }
        ];
      }

      if (riskCapacity === 'Moderate') {
        return [
          {
            id: 'corporate-bond',
            name: 'High-Credit Corporate Bond Debt Category',
            superCategory: 'Debt',
            relevance: '🏆 Optimal Match (Primary)',
            whySuited: 'Stable yields from top rated institutions with better interest rates than savings accounts.',
            threeYrCAGR: 7.9,
            fiveYrCAGR: 7.2,
            riskClass: 'Moderate',
            timeHorizonSuitability: '1 to 3 Years',
            taxImplication: 'Gains are treated as debt income and taxed according to your individual income tax slab rates.',
            exitLoadExpectation: 'Often zero, or 0.5% if redeemed within 1-3 months depending on specific fund houses.',
            objectiveDescription: 'Invests minimum 80% in corporate bonds with highest AAA credit ratings, offering high relative security with structured dividend frequency options.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/corporate-bond',
            assetClassMix: [
              { name: 'AAA Corporate Debt', value: 85, color: '#6366f1' },
              { name: 'Government Securities', value: 10, color: '#3b82f6' },
              { name: 'Cash Reserve', value: 5, color: '#94a3b8' }
            ],
            suitabilityRationale: 'For a 1-3 year horizon with moderate appetite, corporate bonds optimize yields safely by bypassing equity volatile movements while holding premium commercial papers.',
            toAvoid: {
              category: 'Long-Term Gilt Funds or Pure High-Growth Equities',
              reason: 'Gilts are highly sensitive to RBI rate announcements while equities risk significant near-term capital drawdowns.'
            },
            companionAddon: {
              category: 'Balanced Advantage Funds (Dynamic Allocator)',
              reason: 'Introduce a cautious (10-15%) slice of dynamic equities to capture slight market rallies while remaining protected.'
            },
            allocationCaution: 'Regularly monitor the corporate debt credit profile. Ensure 85%+ of holdings are strictly rated AAA by agencies. Over-exposure to public sector finance or private shadows can elevate credit crisis risk.'
          },
          {
            id: 'banking-psu',
            name: 'Banking & PSU Debt Mutual Funds',
            superCategory: 'Debt',
            relevance: '🥈 Alternative / Diversifier (Secondary)',
            whySuited: 'Exceptional safety because borrowing entities are state bank institutions or public undertakings.',
            threeYrCAGR: 7.5,
            fiveYrCAGR: 7.0,
            riskClass: 'Low to Moderate',
            timeHorizonSuitability: '1 to 3 Years',
            taxImplication: 'Income tax slab rates applied based on the underlying primary debt structure rules.',
            exitLoadExpectation: 'Gains are generally tax-slab aligned, exit load is zero.',
            objectiveDescription: 'Invests heavily in debt papers and bonds issued by Indian banks, public sector undertakings, and municipal authorities.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/banking-psu-debt',
            assetClassMix: [
              { name: 'PSU/Sovereign Bonds', value: 90, color: '#3b82f6' },
              { name: 'Commercial Paper Reserves', value: 8, color: '#10b981' },
              { name: 'Cash Reserves', value: 2, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Provides unparalleled structural safety in debt since the borrower is backed in corporate spirit by federal resources.',
            toAvoid: {
              category: 'Credit Risk Bond Funds',
              reason: 'Credit risk products hunt for high yields by taking risks with single-B or AA- debentures, risking bankruptcy losses.'
            },
            companionAddon: {
              category: 'High-Credit Corporate Bond Funds',
              reason: 'Mixes ultra-safe public enterprise debt with high-graded private corporate bluechips to maximize net yield margins.'
            },
            allocationCaution: 'Yields are highly sensitive to systemic liquidity in Indian banking. When call money rates spike, returns can temporarily dip. Keep holdings spaced evenly across 1.5 to 2.5 year maturities.'
          },
          {
            id: 'baf-short-moderate',
            name: 'Balanced Advantage (Asset Dynamic Managed)',
            superCategory: 'Hybrid',
            relevance: '🤝 Strategic Companion (Tertiary)',
            whySuited: 'Maintains cautious (15-20%) active equity exposure, rebalancing automatically to avoid declines.',
            threeYrCAGR: 11.5,
            fiveYrCAGR: 10.1,
            riskClass: 'Moderate',
            timeHorizonSuitability: '2 to 4 Years',
            taxImplication: 'Structured derivative positions preserve equity tax status (12.5% LTCG advantage over 1 year).',
            exitLoadExpectation: '1% if sold within 12 months, with a 10% annual free redemption buffer.',
            objectiveDescription: 'Uses algorithmic parameters to alternate dynamically between net equities, hedged arbitrage assets, and premium debt holdings.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
            assetClassMix: [
              { name: 'Hedged Arbitrage', value: 45, color: '#3b82f6' },
              { name: 'Fixed Income Bonds', value: 35, color: '#6366f1' },
              { name: 'Net Stock Equity', value: 20, color: '#10b981' }
            ],
            suitabilityRationale: 'Adds a dynamic cushion. This structure lets you earn some equity upside on surplus capital while shielding your short term requirements with the massive arbitrage/debt base.',
            toAvoid: {
              category: 'Mid and Small-Cap Concentrated Schemes',
              reason: 'Highly unstable for a 1-3 year horizon; a single macro-shock can take years to recover cost parity.'
            },
            companionAddon: {
              category: 'High-Credit Corporate Bond Funds',
              reason: 'Keep 70% of your corpus in secure AAA bonds, and allocate the remaining 30% surplus here to boost net returns.'
            },
            allocationCaution: 'Even though BAF has dynamic downside buffers, it is not risk-free and can register 5-10% drawdowns. Never place more than 25% of your immediate milestone needs here; keep the rest in pure short-term debt.'
          }
        ];
      }

      // Aggressive in Short Horizon
      return [
        {
          id: 'balanced-advantage',
          name: 'Balanced Advantage (Dynamic Asset Allocation)',
          superCategory: 'Hybrid',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Dynamic asset allocation buffers short-term volatility while capitalizing on brief equity rallies.',
          threeYrCAGR: 11.8,
          fiveYrCAGR: 10.5,
          riskClass: 'Moderate',
          timeHorizonSuitability: '2 to 4 Years',
          taxImplication: 'Generally managed dynamically to maintain equity status (>65% equity exposure arbitrage overlays) to earn favorable equity taxation.',
          exitLoadExpectation: '1% if redeeming more than 10% of allocation within 12 months.',
          objectiveDescription: 'Dynamically shifts asset allocation between equity, debt, and arbitrage derivatives based on mathematical valuation models (P/E ratios, market trends).',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
          assetClassMix: [
            { name: 'Equity Exposure', value: 45, color: '#10b981' },
            { name: 'Arbitrage Hedge', value: 25, color: '#f59e0b' },
            { name: 'High Grade Debt', value: 30, color: '#6366f1' }
          ],
          suitabilityRationale: 'Even with aggressive intent, a short 1-3 years horizon can destroy pure equity capital in down cycles. Balanced Advantage funds protect downside while giving structural equity benefits dynamically.',
          toAvoid: {
            category: 'Thematic Sectoral/Small Cap Mutual Funds',
            reason: 'Even with high risk tolerance, you simply do not have the time to recover if a small-cap bear cycle triggers in a short window.'
          },
          companionAddon: {
            category: 'High-Credit Corporate Bond Funds',
            reason: 'Balances the dynamic hybrid risk with AA/AAA senior bonds to guarantee capital backstops.'
          },
          allocationCaution: 'Keep total equity exposure (after BAF derivative accounting) under 45% of your net profile. Although your capacity is aggressive, short timelines mean you can undergo market downturn shocks. Do not time entries, rely on STP transfers.'
        },
        {
          id: 'equity-savings',
          name: 'Equity Savings Category (Conservative Hybrid Alternate)',
          superCategory: 'Hybrid',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Secures equity taxation status while allocating mostly to cash arbitrage and low duration bonds.',
          threeYrCAGR: 10.2,
          fiveYrCAGR: 9.4,
          riskClass: 'Moderate',
          timeHorizonSuitability: '1.5 to 3 Years',
          taxImplication: 'Taxed under equity guidelines: 12.5% LTCG for holds over 1 year, ensuring exceptional tax savings.',
          exitLoadExpectation: 'Generally 1% if sold within 90 days, nil thereafter.',
          objectiveDescription: 'Maintains a quiet combination of active equity (10-30%), gold/arbitrage (30-40%), and low-volatility fixed interest debt (30-40%).',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/equity-savings',
          assetClassMix: [
            { name: 'Cash Arbitrage', value: 45, color: '#3b82f6' },
            { name: 'Secure Debt Paper', value: 30, color: '#6366f1' },
            { name: 'Active Equities', value: 25, color: '#10b981' }
          ],
          suitabilityRationale: 'An exceptional intermediate product for aggressive investors seeking higher return compounding than standard bank cash deposits, but with heavily controlled downside.',
          toAvoid: {
            category: 'Infrastructure and PSU Sector-Themed Funds',
            reason: 'Sectoral themes are highly cyclical and volatile; a minor slowdown can lock up capital with negative returns for years.'
          },
          companionAddon: {
            category: 'Balanced Advantage Mutual Funds',
            reason: 'Unlocks a dual-structured hybrid system to blend passive arbitrage safety with index-riding capability.'
          },
          allocationCaution: 'Equity Savings schemes maintain minor active equity exposures. They can experience modest drawdowns of 3-7% during deep corrections. Never deploy urgent survival capitals or loan repayment assets here.'
        },
        {
          id: 'corp-bond-reserve',
          name: 'AAA Corporate Bond & Debt Reserve Category',
          superCategory: 'Debt',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'An invaluable credit shelter that secures capital repayment under corporate covenants.',
          threeYrCAGR: 7.9,
          fiveYrCAGR: 7.2,
          riskClass: 'Moderate',
          timeHorizonSuitability: '1 to 3 Years',
          taxImplication: 'Redemption gains added directly to your personal tax slab structure.',
          exitLoadExpectation: 'Generally zero exit load, allowing instant liquidations.',
          objectiveDescription: 'Mandatorily maintains 80%+ exposures in AAA-rated debentures and commercial promissory notes from public/private corporate bluechips.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/corporate-bond',
          assetClassMix: [
            { name: 'AAA Senior Corporate paper', value: 85, color: '#4f46e5' },
            { name: 'Sovereign Treasury notes', value: 10, color: '#3b82f6' },
            { name: 'Liquid overnight cash', value: 5, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Acts as your portfolio\'s safe harbor. It ensures absolute liquidity to capture market corrections inside your aggressive hybrid funds.',
          toAvoid: {
            category: 'High Churn Gilt Funds or Credit Risk Funds',
            reason: 'Gilt funds carry interest rate risk, while Credit Risk exposes high-priority capital to corporate default write-offs.'
          },
          companionAddon: {
            category: 'Balanced Advantage Funds',
            reason: 'The ultimate pairing: keep 65-70% in corporate bonds as the core shield, and feed the remaining 30% to BAF to harvest volatility yields.'
          },
          allocationCaution: 'Yields are tied to Reserve Bank credit tightening policies. Keep maturities intermediate rather than long-term to shield against yield rate fluctuations.'
        }
      ];
    }

    // 4. Medium Horizon (3-5 Years)
    if (timeHorizon === '3-5') {
      if (riskCapacity === 'Conservative') {
        return [
          {
            id: 'conservative-hybrid',
            name: 'Conservative Hybrid Debt-Oriented Category',
            superCategory: 'Hybrid',
            relevance: '🏆 Optimal Match (Primary)',
            whySuited: 'High structural debt safety combined with a minor equity kicker to beat core inflation.',
            threeYrCAGR: 9.1,
            fiveYrCAGR: 8.4,
            riskClass: 'Moderate',
            timeHorizonSuitability: '3 to 5 Years',
            taxImplication: 'Income tax slab rates applied based on the underlying primary debt structure rules.',
            exitLoadExpectation: '1% for redemptions within 1 year.',
            objectiveDescription: 'Invests 75% to 90% of assets in secure debt/fixed income instruments, and remaining 10% to 25% in high quality diversified equities.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
            assetClassMix: [
              { name: 'AAA Fixed Income', value: 80, color: '#6366f1' },
              { name: 'Bluechip Equities', value: 18, color: '#10b981' },
              { name: 'Cash and Reserves', value: 2, color: '#94a3b8' }
            ],
            suitabilityRationale: 'A 3-5 year timeline warrants some equity exposure to defend purchasing power. Conservative hybrid buffers your principal while boosting returns slightly.',
            toAvoid: {
              category: 'Pure Small-Cap or Sectoral Thematics',
              reason: 'These expose conservative medium-term funds to intense volatility, risk of long recovery lags.'
            },
            companionAddon: {
              category: 'Sovereign Gold Bonds or Gold ETFs',
              reason: 'Gold adds an uncorrelated inflation hedge that functions as a strong companion to the high fixed income base.'
            },
            allocationCaution: 'With 15-25% equity weights, a deep market correction will result in modest net value dips. Do not stampede and liquidate; let the secure debt bond base recover the losses systematically.'
          },
          {
            id: 'baf-conservative',
            name: 'Balanced Advantage Category (Conservative Bias)',
            superCategory: 'Hybrid',
            relevance: '🥈 Alternative / Diversifier (Secondary)',
            whySuited: 'Automatically reduces equity weights as valuations climb, preserving historical capital returns.',
            threeYrCAGR: 11.2,
            fiveYrCAGR: 10.5,
            riskClass: 'Moderate',
            timeHorizonSuitability: '3 to 5 Years',
            taxImplication: 'Tax-efficient equity status (12.5% flat LTCG rates) managed via smart derivative hedging.',
            exitLoadExpectation: 'Usually 1% if sold in 1 year, zero afterwards.',
            objectiveDescription: 'Relies on P/E and dividend margin algorithms to maintain minimal naked equity volatility for cautious profiles.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
            assetClassMix: [
              { name: 'AAA Fixed Income', value: 50, color: '#6366f1' },
              { name: 'Cash Arbitrage', value: 30, color: '#3b82f6' },
              { name: 'Bluechip Equity', value: 20, color: '#10b981' }
            ],
            suitabilityRationale: 'Offers higher returns than conservative hybrids by using dynamic shifts and stock arbitrage to unlock tax-efficient compoundings.',
            toAvoid: {
              category: 'High momentum Mid-cap or Focused Funds',
              reason: 'High momentum schemes lack dynamic asset re-balancing, leaving your retirement or education plans exposed in crash phases.'
            },
            companionAddon: {
              category: 'Conservative Hybrid Funds',
              reason: 'Pairing gives you a highly structural, mathematically stable foundation that preserves capital across cycles.'
            },
            allocationCaution: 'Review the actual net equity slice in the fund factsheet. If the fund manager maintains more than 35% net active equity during high market valuations, reallocate to pure bonds.'
          },
          {
            id: 'arbitrage-liquid-con',
            name: 'Arbitrage Funds & Liquid Reserves',
            superCategory: 'Hybrid',
            relevance: '🤝 Strategic Companion (Tertiary)',
            whySuited: 'Guarantees absolute liquid backup while shielding returns from heavy taxable slab rates.',
            threeYrCAGR: 7.0,
            fiveYrCAGR: 6.2,
            riskClass: 'Low',
            timeHorizonSuitability: '1 to 2 Years',
            taxImplication: 'Favorable equity tax treatment (12.5% LTCG) helps protect conservative income from high tax slabs.',
            exitLoadExpectation: '0.25% up to 15 days, nil thereafter.',
            objectiveDescription: 'Generates returns by capturing cash-and-carry derivative discounts across listed stocks, with no structural market direction risks.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/arbitrage',
            assetClassMix: [
              { name: 'Hedged Stocks Arbitrage', value: 75, color: '#3b82f6' },
              { name: 'AAA Commercial Treasury', value: 25, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Acts as the vital liquidity deck to fund near-term milestones, or to buy cheaper hybrid units during sharp market drops.',
            toAvoid: {
              category: 'Credit Risk Bond Funds',
              reason: 'Credit risk instruments compromise safety for slightly higher yields, exposing conservative portfolios to default write-downs.'
            },
            companionAddon: {
              category: 'Conservative Hybrid Funds',
              reason: 'Use this arbitrage pool as a buffer to handle emergency outflows, preventing the need to exit your hybrid funds prematurely.'
            },
            allocationCaution: 'Arbitrage should comprise 20-30% of your total holdings. It is a preservation tool, not a compounding growth engine; do not hold excessive cash here if inflation protection is a primary goal.'
          }
        ];
      }

      if (riskCapacity === 'Moderate') {
        return [
          {
            id: 'balanced-advantage-mid',
            name: 'Balanced Advantage / Dynamic Hybrid Category',
            superCategory: 'Hybrid',
            relevance: '🏆 Optimal Match (Primary)',
            whySuited: 'Automatic cushion controls. Protects gains when markets are overvalued and buys cheap on corrections.',
            threeYrCAGR: 12.9,
            fiveYrCAGR: 11.2,
            riskClass: 'Moderate',
            timeHorizonSuitability: '3 to 5 Years',
            taxImplication: 'Eligible for equity taxation perks since active equity + arbitrage exposure is maintained above 65%.',
            exitLoadExpectation: '1% if redeeming above the free limit (usually 10% of units) within 1 year.',
            objectiveDescription: 'A highly flexible category using in-house algorithmic algorithms to scale active net equities down during bubbles and up during crashes.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
            assetClassMix: [
              { name: 'Net Equities', value: 55, color: '#10b981' },
              { name: 'Debt & Bonds', value: 30, color: '#6366f1' },
              { name: 'Arbitrage Positions', value: 15, color: '#f59e0b' }
            ],
            suitabilityRationale: 'A balanced dynamic hybrid fits the moderate profile beautifully over a 3-5 year horizon. You get the stability of debt alongside equity upside with very smart risk reduction.',
            toAvoid: {
              category: 'Thematic/Sector-Specific or Pure International Funds',
              reason: 'These schemes are highly concentrated, making them too risky for a moderate 4-year timeline without active re-balancing.'
            },
            companionAddon: {
              category: 'Diversified Large-Cap Index Funds',
              reason: 'Locks in a low-cost passive anchor that compounds leading corporate returns alongside your dynamic hybrid asset manager.'
            },
            allocationCaution: 'Ensure your chosen scheme stays compliant with equity taxation status (maintaining >65% gross equities). If regulatory adjustments alter the asset mix, your tax rate can shift to debt levels.'
          },
          {
            id: 'large-cap-bluechip',
            name: 'Large Cap (Bluechip) Quality Equity Funds',
            superCategory: 'Equity',
            relevance: '🥈 Alternative / Diversifier (Secondary)',
            whySuited: 'Channels capital to well-established, highly liquid Indian industrial leaders (Reliance, HDFC, Tata).',
            threeYrCAGR: 16.2,
            fiveYrCAGR: 14.1,
            riskClass: 'Very High',
            timeHorizonSuitability: '4 to 5 Years',
            taxImplication: 'LTCG on equity: 12.5% tax for returns exceeding ₹1.25 Lakh per year.',
            exitLoadExpectation: '1% if sold within 365 days of investment.',
            objectiveDescription: 'SEBI mandated to invest minimum 80% inside the top 100 Indian giants by market capitalization, securing reliable corporate security.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/large-cap',
            assetClassMix: [
              { name: 'Bluechip Leaders', value: 94, color: '#10b981' },
              { name: 'Growth Mid-caps', value: 3, color: '#3b82f6' },
              { name: 'Cash Reserves', value: 3, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Large caps offer reliable equity compounding with far lower volatility and drawdowns than mid or small-cap funds, aligning perfectly with a moderate risk stance.',
            toAvoid: {
              category: 'Small Cap or Tactical Micro-Cap Schemes',
              reason: 'Small caps suffer severe 40-50% downturn cycles that can take 5+ years to break even; your a medium-term profile simply lacks that recovery timeline.'
            },
            companionAddon: {
              category: 'Balanced Advantage / Dynamic Hybrid Funds',
              reason: 'Fuses passive large cap index exposure with a dynamic, defensive asset allocator to balance equity swings.'
            },
            allocationCaution: 'Large-cap funds can experience flat consolidation periods for 1 to 2 years during macro shifts. Maintain a systematic SIP approach and avoid trying to time index peaks.'
          },
          {
            id: 'floating-rate-debt',
            name: 'Floating Rate corporate Debt & Bonds',
            superCategory: 'Debt',
            relevance: '🤝 Strategic Companion (Tertiary)',
            whySuited: 'Minimizes interest rate risk by investing in corporate bonds with dynamic floating yields.',
            threeYrCAGR: 7.9,
            fiveYrCAGR: 7.2,
            riskClass: 'Moderate',
            timeHorizonSuitability: '2 to 3 Years',
            taxImplication: 'Gains are taxed directly at your personal income tax slab rates.',
            exitLoadExpectation: 'Generally zero exit load, giving you instant liquidity.',
            objectiveDescription: 'Invests minimum 65% in floating rate debt paper, adjusting yield coupons upward when system rates rise.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/floater',
            assetClassMix: [
              { name: 'AAA Floating Corporate Debt', value: 82, color: '#4f46e5' },
              { name: 'Sovereign Treasury bills', value: 13, color: '#3b82f6' },
              { name: 'Liquid overnight cash', value: 5, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Perfect security harbor to hold 30% of your medium-term assets, providing predictable liquidity to re-invest during equity corrections.',
            toAvoid: {
              category: 'High Risk Credit Risk Debt Funds',
              reason: 'These funds compromise safety by holding lower-quality corporate debt, risking potential capital default write-downs.'
            },
            companionAddon: {
              category: 'Balanced Advantage Mutual Funds',
              reason: 'Secures a perfect strategic balance: AAA interest floater income feeds cash flow needs while BAF harvests market equity growth.'
            },
            allocationCaution: 'Floaters perform exceptionally well during rising interest rate cycles, but can experience yield contraction when rates decline. Limit this category to 30% of your medium-term portfolio.'
          }
        ];
      }

      // Aggressive in Medium Horizon
      return [
        {
          id: 'large-cap-equity',
          name: 'Large Cap (Bluechip) Equity Mutual Fund Category',
          superCategory: 'Equity',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'High compounding focus through standard Indian bluechip corporate giants.',
          threeYrCAGR: 16.2,
          fiveYrCAGR: 14.1,
          riskClass: 'Very High',
          timeHorizonSuitability: '3 to 5 Years',
          taxImplication: 'LTCG on equity: 12.5% tax for returns exceeding ₹1.25 Lakh per year.',
          exitLoadExpectation: '1% exit load on redemption within 12 months.',
          objectiveDescription: 'Invests a minimum of 80% in top 100 well-established companies in India by market capitalization, offering highly corporate safety within equities.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/large-cap',
          assetClassMix: [
            { name: 'Large Cap Equities', value: 94, color: '#10b981' },
            { name: 'Mid Cap Equities', value: 3, color: '#f59e0b' },
            { name: 'Cash reserves', value: 3, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Since you possess an aggressive stance and are looking at 3-5 years, large cap funds channel your capital to standard stable leaders (Tata, Reliance, HDFC), giving high yields with lower crash risk than small/mid caps.',
          toAvoid: {
            category: 'Long-term Sovereign Gilt Debt Funds',
            reason: 'Fixed-rate bonds will severely underperform inflation, dragging down the returns of your aggressively-profiled capital.'
          },
          companionAddon: {
            category: 'Multi-Asset Allocation Category',
            reason: 'Balances pure domestic large-caps with international stocks, gold, and fixed income to build an all-weather portfolio.'
          },
          allocationCaution: 'Even for aggressive profiles, a medium 3-5 year timeline is highly sensitive to market peaks. Limit your highly volatile small/midcap allocations to under 20% to avoid agonizing drawdowns.'
        },
        {
          id: 'flexi-cap-agg',
          name: 'Active Flexi Cap Equity Category',
          superCategory: 'Equity',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Agile sector rotation across company sizes to capture emerging economic growth.',
          threeYrCAGR: 19.1,
          fiveYrCAGR: 17.5,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Equity taxation: 12.5% LTCG on redemption gains exceeding the ₹1.25 Lakh threshold.',
          exitLoadExpectation: 'Typical 1% exit load if redeemed inside 1 year.',
          objectiveDescription: 'Allows fund managers complete mandate freedom to allocate across large, mid, and small-caps to capture opportunities.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/flexi-cap',
          assetClassMix: [
            { name: 'Large Cap Leaders', value: 62, color: '#10b981' },
            { name: 'Mid Cap Growth', value: 24, color: '#3b82f6' },
            { name: 'Small Cap Alpha', value: 11, color: '#f59e0b' },
            { name: 'Cash reserves', value: 3, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Maximizes alpha-seeking returns. Flexi Caps let active managers rotationally capture high-octane growth without triggering personal capital gains taxes.',
          toAvoid: {
            category: 'Credit Risk Corporate Debt Funds',
            reason: 'Credit risk debt carries hidden corporate bankruptcy risks without offering any of the high growth potential of equities.'
          },
          companionAddon: {
            category: 'Large Cap Bluechip Equity Funds',
            reason: 'Provides a stabilizing passive anchor of top-100 giants to anchor the active, dynamic sector bets of the Flexi Cap allocation.'
          },
          allocationCaution: 'Because Flexi-cap managers can aggressively lift mid and small-cap weightings up to 40% during a bull market, you must check the fund factsheet semi-annually to stay aligned with your moderate risk tolerances.'
        },
        {
          id: 'multi-asset-agg',
          name: 'Multi-Asset Allocation Category (Gold & International)',
          superCategory: 'Other',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Combines diversified equities with sovereign gold and debt to lower overall portfolio volatility.',
          threeYrCAGR: 15.1,
          fiveYrCAGR: 13.8,
          riskClass: 'High',
          timeHorizonSuitability: '3 to 5 Years',
          taxImplication: 'Often structured with dynamic equity exposure, securing standard equity tax treatment.',
          exitLoadExpectation: '1% if sold in 1 year, zero thereafter.',
          objectiveDescription: 'Invests across domestic equity, corporate fixed income, gold commodity, and global international mutual funds.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
          assetClassMix: [
            { name: 'Indian Equities', value: 50, color: '#10b981' },
            { name: 'Fixed Income Bonds', value: 25, color: '#6366f1' },
            { name: 'Physical Gold Spot', value: 15, color: '#eab308' },
            { name: 'Global Equities', value: 10, color: '#8b5cf6' }
          ],
          suitabilityRationale: 'A brilliant shock absorber for aggressive investors, ensuring you always have rising asset classes (like gold) to balance stock corrections.',
          toAvoid: {
            category: 'Single-Sector Infrastructure / thematic funds',
            reason: 'Highly concentrated sector themes carry the risk of painful single-sector crashes, causing prolonged negative return cycles.'
          },
          companionAddon: {
            category: 'Large Cap Bluechip Equity Funds',
            reason: 'Creates the perfect portfolio core and satellite architecture: large cap leads domestic growth while multi-asset hedges international currency risks.'
          },
          allocationCaution: 'The multi-asset mix significantly lowers your portfolio volatility. Keep gold and commodity components capped under 15% to maintain compounding momentum.'
        }
      ];
    }

    // 5. Long Horizon (5+ Years)
    // If conservative/stabilised over long term
    if (riskCapacity === 'Conservative') {
      return [
        {
          id: 'balanced-advantage-long',
          name: 'Balanced Advantage (Asset Allocation Managed) Category',
          superCategory: 'Hybrid',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Consistent steady compounding over multi-year horizons via risk rebalancing frameworks.',
          threeYrCAGR: 12.1,
          fiveYrCAGR: 11.5,
          riskClass: 'Moderate',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Leveraged structured equity derivatives secure 12.5% LTCG advantage tax rate status.',
          exitLoadExpectation: '1% if redeeming beyond 10% free threshold in year one, nil afterwards.',
          objectiveDescription: 'Maintains systematic portfolio rebalancing so you never take absolute stock market downturn hit directly over long cycles.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
          assetClassMix: [
            { name: 'Active Equity', value: 50, color: '#10b981' },
            { name: 'Fixed Income Instruments', value: 35, color: '#6366f1' },
            { name: 'Arbitrage Cover', value: 15, color: '#f59e0b' }
          ],
          suitabilityRationale: 'A long term investor with cautious sentiment should stick to automated asset allocation. It secures double-digit returns safely without stressing your psychological index during cyclical bear runs.',
          toAvoid: {
            category: 'High-Beta Thematic/Sector Tech/Small Caps',
            reason: 'Sectoral small caps are highly speculative; they can crash by 50% and remain stagnant for nearly a decade.'
          },
          companionAddon: {
            category: 'Passive Nifty 50 Index Mutual Fund',
            reason: 'Locks in a rock-bottom cost passive anchor that compounds leading corporate returns alongside your dynamic asset manager.'
          },
          allocationCaution: 'Do not let surrounding bull market euphoria tempt you to abandon your dynamic re-allocator and jump entirely into high-risk active mid/small-caps. Overlong cycles, maintaining a 40-50% safety net pays off in compounding gold.'
        },
        {
          id: 'nifty-55-index',
          name: 'Passive Nifty 50 Index Category',
          superCategory: 'Equity',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Invests directly in the 50 largest mega-corporations in India, capturing nationwide economic expansion at near-zero fees.',
          threeYrCAGR: 15.8,
          fiveYrCAGR: 13.9,
          riskClass: 'Very High',
          timeHorizonSuitability: '5+ Years Eligible',
          taxImplication: 'Standard equity LTCG: 12.5% on profits beyond a ₹1.25 Lakh threshold.',
          exitLoadExpectation: 'Normally zero exit load, ensuring excellent transactional flexibility.',
          objectiveDescription: 'Passively replicates the Nifty 50 index weightings, eliminating the human error and high expense ratios of actively managed active funds.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/index-funds',
          assetClassMix: [
            { name: 'Mega Cap Bluechips', value: 98, color: '#10b981' },
            { name: 'Liquid reserves', value: 2, color: '#94a3b8' }
          ],
          suitabilityRationale: 'The ultimate cornerstone for tax-efficient, low-cost long term indexing. It offers exceptional safety of capital by backing the sovereign commercial leaders of India.',
          toAvoid: {
            category: 'Actively Managed Large Cap Mutual Funds',
            reason: 'High active expense ratios make it nearly impossible for humans to consistently beat passive index funds over 5+ year terms.'
          },
          companionAddon: {
            category: 'AAA High Grade Corporate Bonds',
            reason: 'Maintains an essential non-volatile fixed income harbor to handle systematic withdrawal plans or rebalance during stock corrections.'
          },
          allocationCaution: 'Passive index investing offers zero downside defense. In a severe recession, the index will slide by the exact same margin (e.g. 35%). Keep 30% in bonds or hybrids to cushion these steep index drawdowns.'
        },
        {
          id: 'corp-bond-conservative',
          name: 'AAA High Credit Corporate Bond Funds',
          superCategory: 'Debt',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Secures high capital protection by holding premium public & private enterprise debt paper.',
          threeYrCAGR: 7.9,
          fiveYrCAGR: 7.2,
          riskClass: 'Low to Moderate',
          timeHorizonSuitability: '3 to 5 Years',
          taxImplication: 'Taxed matching your individual marginal income tax slab bracket when units are redeemed.',
          exitLoadExpectation: 'Generally zero exit load, allowing instant liquidations.',
          objectiveDescription: 'Invests minimum 80% in AAA-rated de-bentures and commercial notes of bluechip companies (Tata, L&T, HDFC).',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/corporate-bond',
          assetClassMix: [
            { name: 'AAA Corporate Debt', value: 88, color: '#6366f1' },
            { name: 'Sovereign Treasury bills', value: 10, color: '#3b82f6' },
            { name: 'Liquid spot cash', value: 2, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Acts as your portfolio\'s safe harbor. It ensures absolute liquidity to capture market corrections inside your aggressive index schemes.',
          toAvoid: {
            category: 'High-risk Credit Risk Bond Funds',
            reason: 'Lower credit bonds expose your conservative debt cushion to default write-downs.'
          },
          companionAddon: {
            category: 'Passive Nifty 50 Index Funds',
            reason: 'The ultimate pairing: keep 65-70% in corporate bonds as the core shield, and feed the remaining 30% to the index to capture compounding upside.'
          },
          allocationCaution: 'Yields are tied to Reserve Bank credit tightening policies. Keep maturities intermediate rather than long-term to shield against yield rate fluctuations.'
        }
      ];
    }

    if (riskCapacity === 'Moderate') {
      // Index / Flexi Cap Match
      if (objective === 'InflationHedge') {
        return [
          {
            id: 'international-fof',
            name: 'International Fund of Funds & Multi-Asset Category',
            superCategory: 'Other',
            relevance: '🏆 Optimal Match (Primary)',
            whySuited: 'Hedges against domestic rupee inflation by investing in international US dollar assets.',
            threeYrCAGR: 14.8,
            fiveYrCAGR: 13.9,
            riskClass: 'Very High',
            timeHorizonSuitability: '5 Years or More',
            taxImplication: 'Taxed under Indian non-equity criteria rules based on marginal slab scale formats.',
            exitLoadExpectation: '1% for redemptions made within 12-24 months depending on currency feeds.',
            objectiveDescription: 'Invests in overseas exchange-traded funds or parent global funds, giving you standard exposure to NASDAQ, S&P 500, or premium global equities.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/international',
            assetClassMix: [
              { name: 'Global Equities', value: 85, color: '#8b5cf6' },
              { name: 'Exchange Traded Gold Assets', value: 10, color: '#f59e0b' },
              { name: 'Liquid Reserves', value: 5, color: '#94a3b8' }
            ],
            suitabilityRationale: 'To map your hedge expectation over long term systematically, global exposure plus gold overlays are outstanding. It maintains currency buffer power while keeping standard Indian stock holdings neutral.',
            toAvoid: {
              category: 'Indian Sovereign Long-term Gilt Debt Mutual Funds',
              reason: 'Indian bonds are exposed to rupee depreciation and domestic yield cycles, completely failing to provide a global currency inflation hedge.'
            },
            companionAddon: {
              category: 'Active Flexi Cap Domestic Indian Equity Funds',
              reason: 'Unlocks a flawless geographical balance: active managers exploit Indian development while US equities capture global tech dominance.'
            },
            allocationCaution: 'International funds inside India face a higher tax bracket (added to personal income tax slab). Keep foreign equities under 20% of your total net assets to avoid excessive domestic tax friction while maintaining currency hedge benefit.'
          },
          {
            id: 'multi-asset-hedge',
            name: 'Multi-Asset Allocation Category (Hedged stance)',
            superCategory: 'Hybrid',
            relevance: '🥈 Alternative / Diversifier (Secondary)',
            whySuited: 'Fuses domestic equities, corporate debt bonds, global stocks, and sovereign gold commodities.',
            threeYrCAGR: 15.3,
            fiveYrCAGR: 13.5,
            riskClass: 'High',
            timeHorizonSuitability: '5+ Years',
            taxImplication: 'Maintains dynamic equity balances (>65%) to secure favorable 12.5% LTCG equity tax ratings.',
            exitLoadExpectation: 'Generally 1% if sold inside 1 year, nil thereafter.',
            objectiveDescription: 'Re-allocates assets across uncorrelated sectors automatically, smoothing your volatility ride during inflationary cycles.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
            assetClassMix: [
              { name: 'Indian bluechips', value: 48, color: '#10b981' },
              { name: 'Physical spot gold', value: 20, color: '#eab308' },
              { name: 'High-Credit Bonds', value: 20, color: '#6366f1' },
              { name: 'Offshore Stocks', value: 12, color: '#8b5cf6' }
            ],
            suitabilityRationale: 'An exceptional all-weather portfolio blend. It utilizes gold and foreign currencies to shield your moderate Indian purchasing power from inflationary declines.',
            toAvoid: {
              category: 'Highly Borrowed/Leveraged Infrastructure Sectoral Funds',
              reason: 'Infrastructure and realty are highly debt-sensitive sectors that experience major stress during high-inflation rate cycles.'
            },
            companionAddon: {
              category: 'Active Flexi Cap Equity Funds',
              reason: 'Adds a dynamic Indian compounder to your defensive multi-asset anchor for supreme structural efficiency.'
            },
            allocationCaution: 'Gold and Gilt debt components hedge inflation but drag down maximum alpha during massive stock market rallies. Limit multi-asset schemes to 35% of your global portfolio and regularly rebalance.'
          },
          {
            id: 'flexi-cap-hedge-partner',
            name: 'Unconstrained active Flexi Cap Equity',
            superCategory: 'Equity',
            relevance: '🤝 Strategic Companion (Tertiary)',
            whySuited: 'Provides highly active sectors rebalancing to exploit high-growth domestic cycles.',
            threeYrCAGR: 19.1,
            fiveYrCAGR: 17.5,
            riskClass: 'Very High',
            timeHorizonSuitability: '5+ Years',
            taxImplication: 'LTCG: 12.5% flat tax on equity gains beyond ₹1.25 Lakh per year.',
            exitLoadExpectation: '1% if sold in 1 year.',
            objectiveDescription: 'Allows fund managers to shift capital fluidly across Large, Mid, and Small Cap Indian enterprises based on industrial growth.',
            growwReferenceUrl: 'https://groww.in/mutual-funds/category/flexi-cap',
            assetClassMix: [
              { name: 'Large Cap Leaders', value: 60, color: '#10b981' },
              { name: 'Mid Cap Growth', value: 25, color: '#3b82f6' },
              { name: 'Small Cap Alpha', value: 12, color: '#f59e0b' },
              { name: 'Cash Reserves', value: 3, color: '#94a3b8' }
            ],
            suitabilityRationale: 'Generates robust Indian corporate growth. Active managers handle complex sector switches on your behalf without triggering tax events.',
            toAvoid: {
              category: 'Taxable Floating Rate or Liquid Debt Funds',
              reason: 'Standard debt yields fall behind inflation when taxes are applied, eroding your long-term purchasing power.'
            },
            companionAddon: {
              category: 'International Fund of Funds',
              reason: 'Keep a 70:30 domestic-to-international asset split. This protects against domestic rupee depreciation by investing in US dollar assets.'
            },
            allocationCaution: 'Flexi Cap active rotation means the fund can temporarily hold up to 30-40% in highly volatile mid and small cap stocks. Maintain a consistent monthly SIP, ignore 15-20% near-term drawdowns, and avoid pausing SIPs during bear cycles.'
          }
        ];
      }

      return [
        {
          id: 'flexi-cap',
          name: 'Flexi Cap / Multi-Cap Equity Category',
          superCategory: 'Equity',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Complete unconstrained diversification across different company sizes based on structural opportunities.',
          threeYrCAGR: 19.1,
          fiveYrCAGR: 17.5,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Equity taxation: Standard 12.5% Long-Term Capital Gains (LTCG) tax kicks in after ₹1.25 Lakh threshold.',
          exitLoadExpectation: 'Normally 1% for redemptions initiated within 1 year.',
          objectiveDescription: 'An equity fund with absolute mandate freedom to invest across large-cap, mid-cap, and small-cap stocks. Highly popular for all-weather SIP systematic compounding.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/flexi-cap',
          assetClassMix: [
            { name: 'Large Cap Leaders', value: 60, color: '#10b981' },
            { name: 'Mid Cap Growth', value: 25, color: '#3b82f6' },
            { name: 'Small Cap Alpha', value: 12, color: '#f59e0b' },
            { name: 'Liquid Reserves', value: 3, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Over 5+ years with moderate profile, a Flexi Cap category optimizes growth by letting the fund manager actively rotate from overpriced sectors into underpriced setups without causing any manual tax events on your end.',
          toAvoid: {
            category: 'Short-term low yield Debt, Liquid, or Arbitrage structures',
            reason: 'Conservative debt assets will compromise your purchase-power growth, decaying your real wealth to inflation.'
          },
          companionAddon: {
            category: 'Large & Mid Cap active Equity Category',
            reason: 'Combines dynamic sector-rotation with targeted growth managers to maximize long-term retirement and education targets.'
          },
          allocationCaution: 'Active rotation gives managers massive leeway.factsheet audits: check the fund manager\'s allocation every six months; if small-cap exposure exceeds 20%, hedge with simple Nifty 50 Index funds.'
        },
        {
          id: 'large-mid',
          name: 'Large & Mid Cap Equity Mutual Funds',
          superCategory: 'Equity',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Strategic cross-allocation mandated to invest in top bluechips mixed with explosive midscale brands.',
          threeYrCAGR: 21.2,
          fiveYrCAGR: 18.5,
          riskClass: 'Very High',
          timeHorizonSuitability: '5+ Years Required',
          taxImplication: 'Standard equity LTCG: 12.5% tax beyond ₹1.25 Lakh annual profit limits.',
          exitLoadExpectation: 'Generally 1% if sold in 365 days, zero thereafter.',
          objectiveDescription: 'SEBI mandates minimum 35% in large caps and 35% in mid-cap stocks at all times, securing stable core assets alongside active growth engines.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/large-and-mid-cap',
          assetClassMix: [
            { name: 'Large Bluechips', value: 45, color: '#10b981' },
            { name: 'Growth Mid-caps', value: 45, color: '#3b82f6' },
            { name: 'Cash and buffers', value: 10, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Provides structural guarantees of mid-cap growth exposure without the high volatility of pure small-caps, fitting moderate risk parameters perfectly.',
          toAvoid: {
            category: 'Standard overnight Liquid Debt or Conservative Hybrid Funds',
            reason: 'These low-volatility shelters drag down the returns of your aggressively-profiled capital, holding back inflation safety.'
          },
          companionAddon: {
            category: 'Multi-Asset Allocation Category',
            reason: 'Balances your active domestic large/mid-cap focus with physical spot gold and dollar-hedged offshore equities.'
          },
          allocationCaution: 'By SEBI mandate, this category must invest at least 35% in mid-caps. It secures strong compounding with an active growth driver, but has higher volatility than standard Index funds. Ensure your timeline is at least 5 full years to smooth index peaks.'
        },
        {
          id: 'multi-asset-mod-std',
          name: 'Multi-Asset Allocation Funds (Gold, Silver & Debt Hedged)',
          superCategory: 'Other',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Uncorrelated multi-assets that lowers portfolio volatility during severe equity bear markets.',
          threeYrCAGR: 15.1,
          fiveYrCAGR: 13.8,
          riskClass: 'High',
          timeHorizonSuitability: '5+ Years Preferred',
          taxImplication: 'Often structured with dynamic equity exposure, securing standard equity tax treatment.',
          exitLoadExpectation: 'Normally 1% if redeemed within 1 year, zero thereafter.',
          objectiveDescription: 'Invests across domestic equity, corporate fixed income, physical gold, and real silver commodities.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
          assetClassMix: [
            { name: 'Indian Equities', value: 50, color: '#10b981' },
            { name: 'Corporate Safe Papers', value: 25, color: '#6366f1' },
            { name: 'Physical Spot Gold', value: 15, color: '#eab308' },
            { name: 'Silver and Commodities', value: 10, color: '#f43f5e' }
          ],
          suitabilityRationale: 'Gold acts as a brilliant insurance overlay. Having this multi-asset core shields your overall moderate portfolio from sharp stock market declines.',
          toAvoid: {
            category: 'Single Credit Non-AAA Bond Funds',
            reason: 'Credit risk bonds carry high corporate default exposures, creating risk without generating equity-like returns.'
          },
          companionAddon: {
            category: 'Flexi Cap Equity Mutual Funds',
            reason: 'Fuses passive large cap index exposure with a dynamic, defensive asset allocator to balance equity swings.'
          },
          allocationCaution: 'Gold and commodity parts rebalance automatically. If domestic equity returns face near-term declines, avoid withdrawing your gold holdings; instead, use them to purchase cheap equity units during deep market corrections.'
        }
      ];
    }

    // Long Horizon, Aggressive!
    if (marketShock === 'BuyMore' || riskCapacity === 'Aggressive') {
      return [
        {
          id: 'small-mid-cap',
          name: 'Small Cap or Tactical Mid Cap Growth Category',
          superCategory: 'Equity',
          relevance: '🏆 Optimal Match (Primary)',
          whySuited: 'Maximum alpha compounding. Designed for visionary long-term wealth builders who view drawdowns as buying windows.',
          threeYrCAGR: 28.6,
          fiveYrCAGR: 24.3,
          riskClass: 'Very High',
          timeHorizonSuitability: '7 Years or More Preferred',
          taxImplication: 'LTCG on equity: 12.5% flat tax on gains beyond ₹1.25L annually.',
          exitLoadExpectation: '1% exit load for redemptions within 1 year.',
          objectiveDescription: 'Invests minimum 65% in agile small-cap corporate businesses (ranked outside the top 250 in size), focusing on explosive commercial scale capabilities.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/small-cap',
          assetClassMix: [
            { name: 'High-Growth Small Caps', value: 75, color: '#f43f5e' },
            { name: 'Mid Cap Equities', value: 18, color: '#f59e0b' },
            { name: 'Cash Reserves', value: 7, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Your aggressive stance, combined with a willingness to "Buy More" during market panic, indicates the highest psychological resilience. Small cap funds offer exceptional historical wealth creation capabilities over longer cycles.',
          toAvoid: {
            category: 'Conservative Hybrid and Low-Volatility Gilt Debt Funds',
            reason: 'These low-volatility shelters drag down the returns of your aggressively-profiled capital, severely compromising your long-term compounding potential.'
          },
          companionAddon: {
            category: 'Large Cap Passive Nifty 50 Index Funds',
            reason: 'Acts as a solid, high-liquidity cornerstone that anchors the high-volatility bets of the small-cap holdings.'
          },
          allocationCaution: 'Extremely volatile; individual funds can register sudden corrections of 40-50%. Avoid allocating your entire net worth here. Capping total small-cap exposure to 30-40% of your long-term portfolio ensures a stable ride.'
        },
        {
          id: 'mid-cap',
          name: 'Mid Cap Equity Mutual Fund Category',
          superCategory: 'Equity',
          relevance: '🥈 Alternative / Diversifier (Secondary)',
          whySuited: 'Sectors-leaders in midsize companies that capture high growth trajectory with excellent corporate stability.',
          threeYrCAGR: 23.4,
          fiveYrCAGR: 20.8,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Standard equity LTCG: 12.5% tax flat beyond a ₹1.25 Lakh annual profit cushion.',
          exitLoadExpectation: 'Generally 1% if sold in 1 year.',
          objectiveDescription: 'Invests a minimum 65% in companies ranked 101 to 250 by capitalization, capturing strong scale expansion.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/mid-cap',
          assetClassMix: [
            { name: 'Medium-Cap Equities', value: 72, color: '#3b82f6' },
            { name: 'Large-Cap Quality', value: 20, color: '#10b981' },
            { name: 'Small-Cap Opportunities', value: 5, color: '#f43f5e' },
            { name: 'Cash Reserves', value: 3, color: '#94a3b8' }
          ],
          suitabilityRationale: 'Mid-caps outperform bluechips historically while remaining much more stable than small-caps, delivering an outstanding high-growth engine.',
          toAvoid: {
            category: 'Liquid / Overnight Debt or Fixed bank Deposits',
            reason: 'Low interest products fail to hedge inflation risks, dragging down the returns of your aggressively-profiled capital.'
          },
          companionAddon: {
            category: 'Small Cap Equity Mutual Funds',
            reason: 'Combine these two categories in a 60:40 ratio; this captures maximum growth while protecting against extreme drawdowns.'
          },
          allocationCaution: 'Mid-caps are highly sensitive to market capital cycles. Regularly monitor valuations: if mid-cap price-to-earning ratios exceed historical averages, rebalance profits into large-cap passive funds.'
        },
        {
          id: 'large-cap-agg-partner',
          name: 'Mega-Cap Bluechip & Focused Equity Funds',
          superCategory: 'Equity',
          relevance: '🤝 Strategic Companion (Tertiary)',
          whySuited: 'Mega-cap bluechip giants that secure safe core assets, preserving absolute portfolio liquidity.',
          threeYrCAGR: 16.2,
          fiveYrCAGR: 14.1,
          riskClass: 'Very High',
          timeHorizonSuitability: '5 Years or More',
          taxImplication: 'Standard equity rules apply (12.5% LTCG after the 1.25L yearly allowance).',
          exitLoadExpectation: 'Usually 1% exit load for redemptions within 1 year.',
          objectiveDescription: 'Maintains concentrated holdings in the topmost 100 Indian giants (HDFC, Reliance, TCS), providing a reliable, low-cost passive anchor.',
          growwReferenceUrl: 'https://groww.in/mutual-funds/category/large-cap',
          assetClassMix: [
            { name: 'Top-50 Mega Caps', value: 92, color: '#10b981' },
            { name: 'Dynamic Liquids', value: 8, color: '#94a3b8' }
          ],
          suitabilityRationale: 'This provides your portfolio with solid liquidity, acting as a crucial shock absorber and stabilizer that helps buffer small-cap corrections.',
          toAvoid: {
            category: 'Complex Dynamic Bond or Taxable Gold Structures',
            reason: 'An aggressive, long-term investor should avoid taxable fixed income products, as they degrade capital efficiency due to high tax friction.'
          },
          companionAddon: {
            category: 'Small Cap Strategy Mutual Funds',
            reason: 'The ultimate pairing: keep 60% in small-caps for explosive growth, and allocate 40% here to anchor the portfolio.'
          },
          allocationCaution: 'While large-cap bluechips offer solid safety, they can undergo prolonged periods of stagnation during market consolidations. Do not let flat trends tempt you to close these accounts; they represent crucial core liquidity.'
        }
      ];
    }

    // Default High return Flexi/Mid Cap (Fallback)
    return [
      {
        id: 'mid-cap-equity',
        name: 'Mid Cap Equity Mutual Fund Category',
        superCategory: 'Equity',
        relevance: '🏆 Optimal Match (Primary)',
        whySuited: 'Excellent balance of scalable company growth with standard governance frameworks.',
        threeYrCAGR: 23.4,
        fiveYrCAGR: 20.8,
        riskClass: 'Very High',
        timeHorizonSuitability: '5 Years or More',
        taxImplication: 'Equity taxation rules apply: 12.5% long term gains tax on redemption profits exceeding ₹1.25L.',
        exitLoadExpectation: '1% if sold within 365 days of investment.',
        objectiveDescription: 'Mandatorily deploys at least 65% of cash to mid-sized Indian companies (ranked 101 to 250 by capitalization), capturing explosive market growth.',
        growwReferenceUrl: 'https://groww.in/mutual-funds/category/mid-cap',
        assetClassMix: [
          { name: 'Medium-Cap Equities', value: 72, color: '#3b82f6' },
          { name: 'Large-Cap Quality', value: 20, color: '#10b981' },
          { name: 'Small-Cap Opportunities', value: 5, color: '#f43f5e' },
          { name: 'Cash Reserves', value: 3, color: '#94a3b8' }
        ],
        suitabilityRationale: 'For ambitious high-compounding goals, Mid Caps outperformed bluechips historically while remaining dramatically more stable than small caps. Your profile matches this high growth trajectory perfectly.',
        toAvoid: {
          category: 'Standard overnight Liquid Debt or Conservative Hybrid Funds',
          reason: 'These low-volatility shelters drag down the returns of your aggressively-profiled capital, holding back inflation safety.'
        },
        companionAddon: {
          category: 'Large Cap Passive Nifty 50 Index Funds',
          reason: 'Locks in a low-cost passive anchor that compounds leading corporate returns alongside your mid-cap holdings.'
        },
        allocationCaution: 'Since mid-caps are highly cyclical, ensure you plan for at least a 5-year investment horizon. Do not withdraw during mid-term corrections; instead, buy additional units to reduce average costs.'
      },
      {
        id: 'flexi-cap-default',
        name: 'Diversified Flexi Cap Category',
        superCategory: 'Equity',
        relevance: '🥈 Alternative / Diversifier (Secondary)',
        whySuited: 'Bypasses specific capitalisation boundaries by reallocating across all company sizes.',
        threeYrCAGR: 19.1,
        fiveYrCAGR: 17.5,
        riskClass: 'Very High',
        timeHorizonSuitability: '5 Years or More',
        taxImplication: 'Standard equity LTCG: 12.5% tax on gains beyond the ₹1.25 Lakh annual threshold.',
        exitLoadExpectation: 'Generally 1% if sold within 12 months.',
        objectiveDescription: 'Maintains unconstrained asset allocations across Large Cap, Mid Cap, and Small Cap Indian equities according to macro evaluations.',
        growwReferenceUrl: 'https://groww.in/mutual-funds/category/flexi-cap',
        assetClassMix: [
          { name: 'Large Cap Quality', value: 62, color: '#10b981' },
          { name: 'Mid Cap Growth', value: 25, color: '#3b82f6' },
          { name: 'Small Cap Value', value: 10, color: '#f59e0b' },
          { name: 'Liquid Cash Buffer', value: 3, color: '#94a3b8' }
        ],
        suitabilityRationale: 'A brilliant second choice of diversified active equities, allowing risk moderation over medium and long term portfolios.',
        toAvoid: {
          category: 'Taxable float rate debt or dynamic gilt funds',
          reason: 'Bonds fail to offer real inflation hedging over 5+ year targets, reducing the returns of your aggressively-profiled capital.'
        },
        companionAddon: {
          category: 'Mid Cap Equity Mutual Funds',
          reason: 'Pairing combines large-cap passive index exposure with active mid-cap growth managers to optimize returns.'
        },
        allocationCaution: 'Flexi Cap active rotation means the fund can temporarily hold up to 30-40% in highly volatile mid and small cap stocks. Maintain a consistent monthly SIP, ignore 15-20% near-term drawdowns, and avoid pausing SIPs during bear cycles.'
      },
      {
        id: 'multi-asset-default',
        name: 'Multi-Asset dynamic Allocation',
        superCategory: 'Other',
        relevance: '🤝 Strategic Companion (Tertiary)',
        whySuited: 'A dynamic hybrid that allocates across gold, debt and domestic shares to moderate risk.',
        threeYrCAGR: 15.1,
        fiveYrCAGR: 13.8,
        riskClass: 'High',
        timeHorizonSuitability: '5+ Years Eligible',
        taxImplication: 'Maintains 65%+ gross equity exposure, securing standard equity LTCG taxation guidelines.',
        exitLoadExpectation: 'Generally 1% exit load for sells inside 1 year.',
        objectiveDescription: 'Locks together multiple uncorrelated asset classes, providing a smooth investment ride across stock market cycles.',
        growwReferenceUrl: 'https://groww.in/mutual-funds/category/hybrid',
        assetClassMix: [
          { name: 'Domestic Equities', value: 50, color: '#10b981' },
          { name: 'Secure Bond Papers', value: 25, color: '#6366f1' },
          { name: 'Physical spot gold', value: 15, color: '#eab308' },
          { name: 'Silver commodity', value: 10, color: '#f43f5e' }
        ],
        suitabilityRationale: 'A gold-supported safety harbor that is ideal as a stabilizer for aggressively built growth portfolios, providing high liquidity.',
        toAvoid: {
          category: 'Single Credit Corporate Debt Funds',
          reason: 'Lower credit bonds expose your conservative debt cushion to default write-downs.'
        },
        companionAddon: {
          category: 'Mid Cap Equity Mutual Funds',
          reason: 'The ultimate pairing: keep 65-70% in mid-cap equity as the core shield, and feed the remaining 30% to the multi-asset fund for growth.'
        },
        allocationCaution: 'Yields are tied to dynamic re-balancing. If gold prices rise sharply, do not liquidate gold holdings; let the fund manager automatically rebalance into undervalued equities.'
      }
    ];
  }, [shariahOnly, goal, timeHorizon, riskCapacity, marketShock, objective]);

  const handleNextStep = () => {
    if (step < 4) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    } else {
      resultsActivatedAt.current = Date.now();
      triggeredExclusionsEngine.current = false;
      triggeredCategoryToAvoid.current = false;
      triggeredCagrUp.current = false;
      hasScrolledBelowCagr.current = false;
      hasScrolledBelowCategoryToAvoid.current = false;
      setShowResults(true);
      window.scrollTo({ top: 0, behavior: 'instant' as any });
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(prev => prev - 1);
      window.scrollTo({ top: 350, behavior: 'smooth' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 font-sans" id="find-fund-type-view-root">
      {/* Page Header */}
      <div className="text-center max-w-4xl mx-auto mb-12 animate-fade-in">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100/80 text-blue-700 text-[11px] font-mono font-bold uppercase tracking-wider mb-4">
          <Shield className="w-3.5 h-3.5 text-blue-600" />
          <span>Pure Wealth Global • Precision Asset Calibrator</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-display font-black text-slate-900 tracking-tight leading-tight">
          Calibrate Your Perfect <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Asset Class</span> Blueprint
        </h1>
        <p className="text-[14.5px] sm:text-[15.5px] text-slate-600 mt-4 leading-relaxed max-w-2xl mx-auto font-normal">
          Diagnose which SEBI-compliant Mutual Fund classification perfectly honors your cashflow stability, milestone timelines, and psychological drawdown comfort zones.
        </p>
        
        {/* Sleek Trust & Safety Ribbon */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-6 sm:gap-x-8 mt-6 pt-6 border-t border-slate-100 text-[12px] text-slate-500 font-medium">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>100% Free & Unbiased Mapping</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>SEBI & AMFI Taxonomy Aligned</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-black" />
            <span>Zero Data Telemetry Storage</span>
          </div>
        </div>
      </div>

      {/* 3-Step Lead Generation Timeline */}
      <div className="max-w-4xl mx-auto mb-10 select-none px-4" id="lead-magnet-timeline">
        <div className="relative flex items-center justify-between">
          {/* Background Connecting Lines */}
          <div className="absolute left-6 right-6 top-[22px] sm:top-1/2 sm:-translate-y-1/2 h-1 bg-slate-100 -z-0 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-500" 
              style={{ 
                width: !showResults 
                  ? '0%' 
                  : focusedStep === 3 
                    ? '100%' 
                    : '50%' 
              }} 
            />
          </div>

          {/* Node 1: Fill Diagnose Form */}
          <button
            type="button"
            onClick={() => {
              setShowResults(false);
              window.scrollTo({ top: 350, behavior: 'smooth' });
            }}
            className="flex flex-col items-center group cursor-pointer z-10 basis-1/3"
          >
            <div className={`w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center transition-all ${
              !showResults 
                ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-105' 
                : 'bg-emerald-500 text-white shadow hover:scale-105'
            }`}>
              {!showResults ? <BrainCircuit className="w-5 h-5 animate-pulse" /> : <Check className="w-5 h-5 font-bold" />}
            </div>
            <span className={`text-[11.5px] font-sans font-bold mt-2.5 transition-colors text-center ${!showResults ? 'text-blue-700' : 'text-slate-600 font-bold'}`}>
              Step 1: Diagnose Profile
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 text-center hidden xs:block">Interactive Form Calibration</span>
          </button>

          {/* Node 2: Results Display */}
          <button
            type="button"
            disabled={!showResults}
            onClick={() => {
              setFocusedStep(2);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center group z-10 basis-1/3 ${showResults ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <div className={`w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center transition-all ${
              showResults && focusedStep === 2
                ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-105'
                : showResults && focusedStep === 3
                  ? 'bg-emerald-500 text-white shadow hover:scale-105'
                  : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              <LineChart className="w-5 h-5" />
            </div>
            <span className={`text-[11.5px] font-sans font-bold mt-2.5 transition-colors text-center ${showResults && focusedStep === 2 ? 'text-blue-700 font-extrabold' : 'text-slate-600 font-bold'}`}>
              Step 2: Strategy Released
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 text-center hidden xs:block">Asset-wise Percent Class Blueprint</span>
          </button>

          {/* Node 3: Live Investment & Routing Callback */}
          <button
            type="button"
            disabled={!showResults}
            onClick={() => {
              setFocusedStep(3);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center group z-10 basis-1/3 ${showResults ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'}`}
          >
            <div className={`w-[44px] h-[44px] sm:w-[50px] sm:h-[50px] rounded-full flex items-center justify-center transition-all ${
              showResults && focusedStep === 3
                ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-100 scale-105'
                : 'bg-white text-slate-400 border border-slate-200'
            }`}>
              <Landmark className="w-5 h-5" />
            </div>
            <span className={`text-[11.5px] font-sans font-bold mt-2.5 transition-colors text-center ${showResults && focusedStep === 3 ? 'text-blue-700 font-extrabold' : 'text-slate-600 font-bold'}`}>
              Step 3: Access Execution Channels
            </span>
            <span className="text-[10px] text-slate-400 font-sans mt-0.5 text-center hidden xs:block">Start Investing & Callback Options</span>
          </button>
        </div>
      </div>

      {!showResults ? (
        <div className="max-w-2xl mx-auto animate-fade-in" id="advisory-profiler-center-container">
          {/* The Questionnaire Container */}
          <div className="bg-white rounded-[24px] border border-slate-150 shadow-xl overflow-hidden animate-fade-in" id="category-wizard-container">
            {/* Header Progress Tracker */}
            <div className="bg-black px-6 py-5 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-400">
                  Advisory Profiler Progress
                </span>
                <h2 className="text-[16px] font-bold text-white mt-1">
                  {step === 1 && "Step 1: Capital Capacity Calibration"}
                  {step === 2 && "Step 2: Horizon & Financial Goals"}
                  {step === 3 && "Step 3: Drawdown & Volatility Risk"}
                  {step === 4 && "Step 4: Strategic & Ethical Mode Controls"}
                </h2>
              </div>
              <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full border border-white/5 shadow-inner">
                <span className="text-[12px] font-mono font-black text-amber-300">
                  {step}
                </span>
                <span className="text-[10.5px] font-mono text-slate-400">/ 4</span>
              </div>
            </div>

            {/* Graphical progress bar */}
            <div className="h-1.5 bg-slate-100 w-full relative">
              <div 
                className="h-full bg-black transition-all duration-500 rounded-r-full"
                style={{ width: `${(step / 4) * 100}%` }}
              />
            </div>

            <div className="p-6 sm:p-8">
              {/* STEP 1: CAPITAL CAPACITY */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in" id="wizard-category-step-1">
                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      1. Preferred Systematic SIP or Lumpsum Method
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => {
                          setCapitalType('SIP');
                          if (capitalAmount < 500) setCapitalAmount(15000);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                          capitalType === 'SIP' 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold ring-2 ring-blue-600/25' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                      >
                        {capitalType === 'SIP' && (
                          <div className="absolute top-3.5 right-3.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <Coins className={`w-5 h-5 mb-2.5 ${capitalType === 'SIP' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-[14px] block font-extrabold">Monthly SIP</span>
                          <span className="text-[10.5px] text-slate-500 font-normal mt-0.5 block">Regular, disciplined compounding batches</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCapitalType('Lumpsum');
                          if (capitalAmount < 5000) setCapitalAmount(200000);
                        }}
                        className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden ${
                          capitalType === 'Lumpsum' 
                            ? 'border-blue-600 bg-blue-50/40 text-blue-900 font-bold ring-2 ring-blue-600/25' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5 hover:shadow-md'
                        }`}
                      >
                        {capitalType === 'Lumpsum' && (
                          <div className="absolute top-3.5 right-3.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                        <Landmark className={`w-5 h-5 mb-2.5 ${capitalType === 'Lumpsum' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-[14px] block font-extrabold">One-time Lumpsum</span>
                          <span className="text-[10.5px] text-slate-500 font-normal mt-0.5 block">Deploy stagnant capital straight to work</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-baseline mb-3">
                      <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest">
                        2. Target Investment Capital Size
                      </label>
                      <span className="text-[13px] font-mono font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100 shadow-3xs">
                        ₹{capitalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 mb-3">
                      <input
                        type="range"
                        min={capitalType === 'SIP' ? 500 : 5000}
                        max={capitalType === 'SIP' ? 100000 : 2500000}
                        step={capitalType === 'SIP' ? 500 : 10000}
                        value={capitalAmount}
                        onChange={(e) => setCapitalAmount(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-2 font-bold">
                        <span>Min: ₹{capitalType === 'SIP' ? '500' : '5,000'}</span>
                        <span>Max: ₹{capitalType === 'SIP' ? '1,0,000' : '25,00,000+'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      {(capitalType === 'SIP' ? [2000, 5000, 15000, 30000] : [25000, 100000, 500000, 1000000]).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setCapitalAmount(num)}
                          className={`py-2 px-1 rounded-xl border text-[11.5px] font-mono text-center cursor-pointer transition-all ${
                            capitalAmount === num
                              ? 'bg-blue-600 text-white border-blue-600 font-bold shadow-md shadow-blue-500/10'
                              : 'bg-white text-slate-600 border-slate-205 hover:bg-slate-50'
                          }`}
                        >
                          ₹{num >= 100000 ? `${(num / 100000).toFixed(0)}L` : num.toLocaleString('en-IN')}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      3. Regularity & Inflow Stability of Capital
                    </label>
                    <div className="space-y-3">
                      {[
                        { id: 'Stable', title: 'Highly Stable/Predictable Inflows', desc: 'Consistent corporate monthly salary, secure professional income, or passive rentals.' },
                        { id: 'Variable', title: 'Marginally Variable/Volatile Inflows', desc: 'Freelancer consultancies, commission-driven models, or cyclical business sales.' },
                        { id: 'Windfall', title: 'Windfall & One-off Capital Sums', desc: 'Liquid business sale profits, inheritance payout blocks, or investment reallocations.' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setInflowStability(item.id as any)}
                          className={`w-full p-4 rounded-xl border text-left flex gap-3.5 transition-all cursor-pointer relative ${
                            inflowStability === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5 hover:shadow-xs'
                          }`}
                        >
                          {inflowStability === item.id && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            inflowStability === item.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {inflowStability === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal block mt-1.5 leading-normal">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              )}

              {/* STEP 2: HORIZON & GOALS */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in" id="wizard-category-step-2">
                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      1. Primary Investment Time Horizon
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: '1-3', title: '1 - 3 Years', desc: 'Short Term' },
                        { id: '3-5', title: '3 - 5 Years', desc: 'Medium Term' },
                        { id: '5+', title: '5+ Years', desc: 'Long Term' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setTimeHorizon(item.id as any)}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-26 cursor-pointer relative ${
                            timeHorizon === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {timeHorizon === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <Clock className={`w-5 h-5 ${timeHorizon === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="mt-2 text-center">
                            <span className="text-[13.5px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[9.5px] text-slate-400 font-black uppercase tracking-wider block mt-1.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      2. Core Target Milestone Goal
                    </label>
                    <div className="space-y-3">
                      {[
                        { id: 'Wealth', title: 'Wealth Maximization & Compounding', desc: 'Generate high compounding appreciation systematically across cycles via premium index/active models.' },
                        { id: 'Retirement', title: 'Comfortable Retirement Fund Building', desc: 'Secure defensive long-term structures that shield your capital block as work winddown approaches.' },
                        { id: 'Education', title: 'Higher Child Education Reserves', desc: 'Structure a custom asset allocation mapping precise university timing milestones.' },
                        { id: 'TaxSaving', title: 'Tax Saving & Relief Focus', desc: 'Maximize statutory tax deductions under Indian Section 80C templates.' },
                        { id: 'RegularIncome', title: 'Regular Systematic Withdrawal Income (SWP)', desc: 'Deploy capital specifically optimized for stable inflation-adjusted cash outputs.' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setGoal(item.id as any)}
                          className={`w-full p-4 rounded-xl border text-left flex gap-3.5 transition-all cursor-pointer relative ${
                            goal === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {goal === item.id && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            goal === item.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {goal === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal block mt-1.5 leading-normal">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      3. Immediate Planned Withdrawal Needs
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'No', title: 'Absolutely No', desc: 'Growth prioritized' },
                        { id: 'Emergency', title: 'Emergency Backup', desc: 'High fluid safety' },
                        { id: 'Planned', title: 'Specific Withdrawals', desc: 'Pre-timed triggers' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setWithdrawalNeeds(item.id as any)}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-24 cursor-pointer relative ${
                            withdrawalNeeds === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-702 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {withdrawalNeeds === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <Shield className={`w-5 h-5 ${withdrawalNeeds === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="mt-2 text-center">
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[9.5px] text-slate-450 block font-normal mt-1.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              )}

              {/* STEP 3: RISK TOLERANCE */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in" id="wizard-category-step-3">
                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      1. Psychological Asset Volatility Risk Index
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'Conservative', title: 'Conservative Safety', desc: 'Avoid drawdowns at all cost margins' },
                        { id: 'Moderate', title: 'Balanced Growth', desc: 'Moderate standard fluctuation toleration' },
                        { id: 'Aggressive', title: 'Power Compounder', desc: 'Seek maximum yield across volatility cycles' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRiskCapacity(item.id as any)}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-28 cursor-pointer relative ${
                            riskCapacity === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-355 text-slate-700 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {riskCapacity === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <Target className={`w-5 h-5 ${riskCapacity === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="mt-2 text-center">
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[9.5px] text-slate-500 font-normal block mt-1.5 leading-snug">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      2. Emotional Response to -20% Market Downturn Shock
                    </label>
                    <div className="space-y-3">
                      {[
                        { id: 'Panic', title: 'Redeem immediately & secure remaining cash', desc: 'Deep anxiety; prioritizes avoiding any additional capital drawdowns.' },
                        { id: 'DoNothing', title: 'Do nothing, ignore fluctuations and wait for recovery', desc: 'Understands market cycles; allows asset values to recover organically over time.' },
                        { id: 'BuyMore', title: 'Vigorously inject more capital to acquire discounts', desc: 'Opportunistic; views down markets as high-compounding asset opportunities.' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMarketShock(item.id as any)}
                          className={`w-full p-4 rounded-xl border text-left flex gap-3.5 transition-all cursor-pointer relative ${
                            marketShock === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-750 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {marketShock === item.id && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            marketShock === item.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {marketShock === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal block mt-1.5 leading-normal">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      3. Current Dependents & Financial Burden level
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { id: 'Low', title: 'Low Burden', desc: 'High flexibility limits' },
                        { id: 'Moderate', title: 'Moderate Support', desc: 'Standard depend burdens' },
                        { id: 'High', title: 'High Commitments', desc: 'Strict allocation safety' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setBurdenLevel(item.id as any)}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col justify-between items-center h-24 cursor-pointer relative ${
                            burdenLevel === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-702 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {burdenLevel === item.id && (
                            <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <Briefcase className={`w-5 h-5 ${burdenLevel === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
                          <div className="mt-2 text-center">
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[9.5px] text-slate-450 block font-normal mt-1.5">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>


                </div>
              )}

              {/* STEP 4: STRATEGIC OBJECTIVE, MODE & ETHICS */}
              {step === 4 && (
                <div className="space-y-6 animate-fade-in" id="wizard-category-step-4">
                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      1. Core Strategic Investment Objective
                    </label>
                    <div className="space-y-3">
                      {[
                        { id: 'Growth', title: 'High Equities Capital Expansion', desc: 'Target the highest compounded CAGR yields over systematic long-term cycles.' },
                        { id: 'InflationHedge', title: 'Multi-Asset & Inflation Protection', desc: 'Buffer your savings block from purchasing power loss with Gold & Commodity overlays.' },
                        { id: 'Stability', title: 'Balanced Volatility Moderation', desc: 'Smooth out abrupt sector drops via hybrid structural asset splits.' },
                        { id: 'Preservation', title: 'Absolute Capital Preservation', desc: 'Focus strictly on AAA corporate papers, sovereign vaults, and interest-free liquid buffers.' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setObjective(item.id as any)}
                          className={`w-full p-4 rounded-xl border text-left flex gap-3.5 transition-all cursor-pointer relative ${
                            objective === item.id 
                              ? 'border-blue-600 bg-blue-50/25 text-blue-950 font-bold ring-2 ring-blue-600/10' 
                              : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                          }`}
                        >
                          {objective === item.id && (
                            <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          )}
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                            objective === item.id ? 'border-blue-600 bg-blue-600' : 'border-slate-300 bg-white'
                          }`}>
                            {objective === item.id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                          </div>
                          <div>
                            <span className="text-[13px] block font-extrabold leading-none">{item.title}</span>
                            <span className="text-[11px] text-slate-500 font-normal block mt-1.5 leading-normal">{item.desc}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      2. Distribution & Secondary Gains Mode
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setDividendMode('Reinvest')}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                          dividendMode === 'Reinvest' 
                            ? 'border-blue-600 bg-blue-50/45 text-blue-900 font-bold ring-2 ring-blue-600/20' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                        }`}
                      >
                        {dividendMode === 'Reinvest' && (
                          <div className="absolute top-3.5 right-3.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <Coins className={`w-5 h-5 mb-2.5 ${dividendMode === 'Reinvest' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-[13.5px] block font-extrabold">Compound Growth Plan</span>
                          <span className="text-[10.5px] text-slate-500 font-normal mt-0.5 block font-sans">Maximize gains by automatically compounding yields</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDividendMode('SWP')}
                        className={`p-4 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                          dividendMode === 'SWP' 
                            ? 'border-blue-600 bg-blue-50/45 text-blue-900 font-bold ring-2 ring-blue-600/20' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                        }`}
                      >
                        {dividendMode === 'SWP' && (
                          <div className="absolute top-3.5 right-3.5 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <Calendar className={`w-5 h-5 mb-2.5 ${dividendMode === 'SWP' ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <span className="text-[13.5px] block font-extrabold">Regular SWP Benefit</span>
                          <span className="text-[10.5px] text-slate-500 font-normal mt-0.5 block font-sans">Systematic withdrawals for persistent monthly returns</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-black text-slate-450 uppercase tracking-widest mb-3">
                      3. Ethical & Shariah Compliance Filter
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setShariahOnly(false)}
                        className={`p-4 rounded-xl border text-left flex gap-3.5 items-center transition-all cursor-pointer relative ${
                          !shariahOnly 
                            ? 'border-blue-600 bg-blue-50/45 text-blue-900 font-bold ring-2 ring-blue-600/20' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                        }`}
                      >
                        {(!shariahOnly) && (
                          <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          !shariahOnly ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {!shariahOnly && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[13px] block font-extrabold">Standard Class Set</span>
                          <span className="text-[10.5px] text-slate-500 mt-1 block">Full index, active & thematic options</span>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShariahOnly(true)}
                        className={`p-4 rounded-xl border text-left flex gap-3.5 items-center transition-all cursor-pointer relative ${
                          shariahOnly 
                            ? 'border-emerald-600 bg-emerald-50/45 text-emerald-950 font-bold ring-2 ring-emerald-600/20' 
                            : 'border-slate-200 hover:border-slate-350 text-slate-700 bg-white hover:-translate-y-0.5'
                        }`}
                      >
                        {(shariahOnly) && (
                          <div className="absolute top-4 right-4 bg-emerald-600 text-white rounded-full p-0.5">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                          shariahOnly ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                        }`}>
                          {shariahOnly && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                        </div>
                        <div>
                          <span className="text-[13px] block font-extrabold text-emerald-900 flex items-center gap-1.5">
                            <span>Ethical / Shariah</span>
                            <span className="bg-emerald-100 text-emerald-800 text-[8.5px] px-2 py-0.5 rounded font-mono font-black uppercase tracking-wider shadow-3xs">Halal</span>
                          </span>
                          <span className="text-[10.5px] text-slate-500 mt-1 block">Enforce strict interest & sin-stock filters</span>
                        </div>
                      </button>
                    </div>
                  </div>


                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 mt-8 pt-6">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-slate-100 hover:bg-slate-150 text-slate-700 text-[12.5px] font-bold rounded-xl transition-all cursor-pointer border border-slate-205 shadow-3xs"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Back Step</span>
                  </button>
                ) : (
                  <div />
                )}

                <button
                  type="button"
                  onClick={handleNextStep}
                  className="inline-flex items-center gap-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-[13px] font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-blue-600/10 hover:shadow-blue-600/25 active:scale-[0.98]"
                >
                  <span>{step === 4 ? "Diagnose Class Category" : "Continue"}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (() => {
        const currentCategory = diagnosedCategories[activeTab] || diagnosedCategories[0];
        return (
          /* RESULTS INTERACTIVE DISPLAY - PREMIUM INSTITUTIONAL SUITE */
          <div className="space-y-10 max-w-7xl mx-auto animate-fade-in text-left text-slate-800" id="category-diagnostic-results">
            
            {/* Quick Preference Adjustment Control Ribbon */}
            <div className="bg-slate-900 text-white rounded-[24px] border border-slate-800 p-6 flex flex-col md:flex-row items-center justify-between gap-5 shadow-xl relative overflow-hidden mb-6" id="results-preference-ribbon">
              <div className="absolute -left-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="relative z-10 flex items-center gap-3.5 text-left w-full md:w-auto">
                <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 font-bold text-center shrink-0">
                  ⚡
                </div>
                <div>
                  <span className="text-[10px] sm:text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase block">Active Calibration Matrix</span>
                  <h4 className="text-[14px] sm:text-[15.5px] font-black font-sans text-white leading-tight mt-0.5">
                    Modeled for {capitalType === 'SIP' ? 'Monthly SIP' : 'One-time Lumpsum'} of <span className="text-amber-400">₹{capitalAmount.toLocaleString('en-IN')}</span>
                  </h4>
                </div>
              </div>
              <div className="relative z-10 flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap md:flex-nowrap">
                <button
                  type="button"
                  onClick={() => {
                    setFocusedStep(focusedStep === 2 ? 3 : 2);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 text-white text-[12px] font-black rounded-xl cursor-pointer shadow-md transition-all active:scale-[0.98] w-full md:w-auto border ${
                    focusedStep === 2 
                      ? 'bg-emerald-600 hover:bg-emerald-700 border-emerald-500/20 animate-pulse' 
                      : 'bg-blue-600 hover:bg-blue-700 border-blue-500/20'
                  }`}
                >
                  {focusedStep === 2 ? '🚀 Invest & Onboarding' : 'Strategy Model'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResults(false);
                    setStep(4);
                    window.scrollTo({ top: 350, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-white hover:bg-slate-100 text-slate-900 text-[12px] font-black rounded-xl cursor-pointer shadow-md transition-all active:scale-[0.98] w-full md:w-auto border border-slate-200"
                >
                  ✏️ Adjust Inputs / Answers
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 bg-red-600/95 hover:bg-red-700 text-white text-[12px] font-black rounded-xl cursor-pointer shadow-md transition-all active:scale-[0.98] w-full md:w-auto border border-red-500/20"
                >
                  🔄 Reset & Restart
                </button>
              </div>
            </div>
            
            {focusedStep === 3 ? (
              <div className="space-y-8 animate-fade-in text-left text-slate-800" id="step-3-onboarding-panel">
                {/* Option Header Summary */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[24px] p-6 text-white border border-slate-800 shadow-xl relative overflow-hidden">
                  <div className="absolute -right-24 -top-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
                  <div className="relative z-10 max-w-4xl">
                    <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full mb-3.5">
                      <CheckCircle className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Step 3: Execute Strategic Allocation</span>
                    </span>
                    <h2 className="text-xl sm:text-2xl font-black font-sans leading-tight">
                      Invest in Your Recommended <span className="text-amber-400 font-extrabold">{currentCategory?.name || 'Asset Blueprint'}</span> Class
                    </h2>
                    <p className="text-[12.5px] text-slate-300 mt-2 font-light leading-relaxed max-w-2xl">
                      Based on your {riskCapacity.toLowerCase()} profile and {timeHorizon}-year timeline, you perfectly match to start growing your capital in this asset mix. Execute your allocation smoothly using our secure options below.
                    </p>
                  </div>
                </div>

                {/* The 2 Option Split Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
                  
                  {/* Option 1: Direct self-investing via technological partner */}
                  <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-blue-200 hover:shadow-xl transition-all relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[64px] opacity-10 pointer-events-none" />
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                          <Sparkles className="w-5.5 h-5.5 text-blue-600" />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-black">Option 1 • Instant Deployment</span>
                          <h3 className="text-lg font-black font-sans text-slate-900 mt-1">Start Investing Directly</h3>
                        </div>
                      </div>

                      <p className="text-[12.5px] text-slate-600 leading-relaxed">
                        Ready to deploy your capital? Use our integrated technology platform via <strong>Angel One</strong> to begin your regular Monthly SIP or standard Lumpsum placement now.
                      </p>

                      <div className="space-y-2.5 pt-4 text-xs font-medium text-slate-700">
                        <div className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Instant secure account integration</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Direct execution link mapping to chosen asset subclasses</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>No paperwork, no complex compliance pipelines</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-8">
                      <a
                        href="https://a.aonelink.in/ANGOne/SakbsEc"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/10 active:scale-95 cursor-pointer text-center"
                      >
                        <span>Activate & Invest Directly Online</span>
                        <ArrowRight className="w-4 h-4 shrink-0" />
                      </a>
                      <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-normal">
                        Secure digital checkout via authorized financial networks.
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Request Call back */}
                  <div className="bg-[#0B1528] rounded-[24px] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[64px] opacity-15 pointer-events-none" />
                    <div className="space-y-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-[#1C2C4E] p-3 rounded-xl border border-slate-700/30">
                          <PhoneCall className="w-5.5 h-5.5 text-blue-400" />
                        </div>
                        <div>
                          <span className="text-[9.5px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">Option 2 • Request Support</span>
                          <h3 className="text-lg font-black font-sans text-white mt-1">Request Private Calibration Callback</h3>
                        </div>
                      </div>

                      <p className="text-[12.5px] text-slate-400 leading-relaxed">
                        Need parameter validation? Have our certified advisors construct your onboarding accounts securely at your exact requested schedule. Zero cold spam.
                      </p>

                      <form 
                        onSubmit={(e) => {
                          e.preventDefault();
                          if (!callName.trim() || !callMobile.trim()) {
                            setFormError('Please enter your Name and Contact Number');
                            return;
                          }
                          setFormError('');
                          setFormSuccess(true);
                          
                          // Open Whatsapp Message securely
                          const whatsappMsg = encodeURIComponent(
                            `Hi! I have calibrated my asset class blueprint and would like to schedule a secure onboarding call with a PW Consultant.\n\n` +
                            `• Profile Recommendation: ${currentCategory?.name || 'Standard Portfolio'}\n` +
                            `• Suggestion Split: ${scoringDetails.equityAllocation}% Equity / ${scoringDetails.debtAllocation}% Defensive\n` +
                            `• Intended Allocation: ${capitalType} of ₹${capitalAmount.toLocaleString('en-IN')}\n\n` +
                            `• Name: ${callName}\n` +
                            `• Mobile: ${callMobile}\n` +
                            `• Preferred Date: ${callDate}\n` +
                            `• Preferred Time Slot: ${callTime || 'Flexible ASAP'}\n\n` +
                            `Verify my profile parameters and arrange my direct live investments. Thank you!`
                          );
                          window.open(`https://wa.me/917718860398?text=${whatsappMsg}`, '_blank');
                        }} 
                        className="space-y-3.5 pt-2"
                      >
                        {/* Input Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-450 block uppercase">Your Name</span>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. John Doe"
                              value={callName}
                              onChange={(e) => setCallName(e.target.value)}
                              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                            />
                          </div>

                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-450 block uppercase">Contact Number</span>
                            <input 
                              type="tel" 
                              required
                              placeholder="10-Digit Mobile"
                              value={callMobile}
                              onChange={(e) => setCallMobile(e.target.value)}
                              className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                            />
                          </div>
                        </div>

                        {/* DateTime Slot Selector */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-450 block uppercase">Preferred Date</span>
                            <input 
                              type="date" 
                              value={callDate}
                              min={getLocalDateString()}
                              onChange={(e) => setCallDate(e.target.value)}
                              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-800 bg-[#121927] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans cursor-pointer"
                            />
                          </div>

                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-mono font-bold tracking-wider text-slate-450 block uppercase">Preferred Slot</span>
                            <select 
                              value={callTime}
                              onChange={(e) => setCallTime(e.target.value)}
                              className="w-full text-xs px-3 py-2 pr-8 rounded-lg border border-slate-800 bg-[#121927] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cbd5e1%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px] bg-[position:right_12px_center] bg-no-repeat"
                            >
                              <option value="">Flexible ASAP</option>
                              {ALL_TIME_SLOTS.map(slot => (
                                <option key={slot.value} value={slot.value}>{slot.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {formError && (
                          <p className="text-red-400 text-[11px] font-bold mt-1 text-left">{formError}</p>
                        )}

                        {formSuccess && (
                          <p className="text-emerald-400 text-[11px] font-bold mt-1 text-left">✔ Callback request formulated! Opening WhatsApp secure redirect link...</p>
                        )}

                        {/* Privacy Compliance Banner */}
                        <div className="bg-[#050A14] border border-[#1E2E4A]/30 rounded-xl p-3 space-y-2 mt-4 text-[11px] text-slate-450 text-left">
                          <div className="flex gap-2 items-start">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <p className="leading-snug">
                              <strong>Secure Setup:</strong> Decrypted securely via your private session key. Visible only to PW Wealth Advisors.
                            </p>
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="mt-5 w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-500/10 active:scale-95"
                        >
                          <PhoneCall className="w-4 h-4 text-emerald-100 animate-bounce shrink-0" />
                          <span>Confirm & Route Callback Link</span>
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
            
            {/* 1. Verified Asset Calibration Banner */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-850 to-indigo-950 rounded-[30px] p-6 md:p-8 text-left border border-slate-800 shadow-xl relative overflow-hidden" id="verified-asset-calibration-banner">
              <div className="absolute -right-12 -top-12 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -left-12 -bottom-12 w-96 h-96 bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
              
              <div className="relative z-10">
                {/* Confidence & Legitimacy Flags */}
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono tracking-widest uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1 rounded-full">
                    <Shield className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Certified Calibration Logic</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>99.4% Calibration Accuracy</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono tracking-widest uppercase bg-amber-500/20 text-amber-200 border border-amber-500/30 px-3 py-1 rounded-full">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>SEBI Framework Aligned</span>
                  </span>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
                  <div>
                    <h1 className="text-2xl md:text-[28px] font-black text-white tracking-tight leading-none mb-2 font-sans">
                      Your Customized Wealth Allocation Blueprint
                    </h1>
                    <p className="text-slate-300 text-sm font-sans font-light max-w-2xl">
                      This dynamic blueprint applies institutional multi-factor alignment rules to translate your timeline, volatility appetite, and goal horizons into a highly optimal, tax-optimized asset model.
                    </p>
                  </div>
                  <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700/60 shrink-0 flex flex-col items-center justify-center text-center max-w-xs">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">ANCHOR FUND TYPE / CATEGORY</span>
                    <span className="text-xl font-sans font-black text-amber-400 mt-1.5 leading-snug">{scoringDetails.anchorFundCategory}</span>
                    <span className="text-[9px] font-mono text-emerald-400 font-bold uppercase tracking-wide mt-1.5">Core Portfolio Anchor</span>
                  </div>
                </div>

                <h3 className="text-[11px] font-mono font-black uppercase text-slate-400 tracking-wider mb-3">
                  Calibrated Input Parameters Mapped
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs">
                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                      <Coins className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Planned Capital</span>
                    </div>
                    <span className="font-extrabold text-white text-[12.5px] block truncate">
                      {capitalType}: ₹{capitalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                      <TrendingUp className="w-3.5 h-3.5 animate-pulse" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Inflow Inception</span>
                    </div>
                    <span className="font-extrabold text-slate-200 text-[12.5px] block truncate">
                      {inflowStability === 'Stable' ? 'Highly Stable Inflow' : inflowStability === 'Variable' ? 'Variable Income' : 'Capital Infusion'}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-indigo-400">
                      <Calendar className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Time Horizon</span>
                    </div>
                    <span className="font-black text-indigo-200 text-[12.5px] block">{timeHorizon} Years Tenure</span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                      <Target className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Milestone Target</span>
                    </div>
                    <span className="font-extrabold text-slate-200 text-[12.5px] block truncate font-sans">
                      {goal === 'Wealth' ? 'Wealth Creation' : goal === 'Retirement' ? 'Retirement Fund' : goal === 'Education' ? 'Education Fund' : goal === 'TaxSaving' ? 'Tax Saving 80C' : 'SWP regular flow'}
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-400">
                      <Shield className="w-3.5 h-3.5" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Risk Envelope</span>
                    </div>
                    <span className={`font-black text-[12.5px] block ${
                      riskCapacity === 'Aggressive' ? 'text-rose-400' : riskCapacity === 'Moderate' ? 'text-sky-400' : 'text-emerald-400'
                    }`}>
                      {riskCapacity} Volatility
                    </span>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800/60 hover:border-slate-700/80 transition-all text-left">
                    <div className="flex items-center gap-1.5 mb-1.5 text-slate-450">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">Preference Filters</span>
                    </div>
                    <span className="font-black text-amber-300 text-[12.5px] block truncate font-mono">
                      {shariahOnly ? 'Ethical-Shariah ON' : 'Standard Mode'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 1.5 Interactive Integration Bridge to FindYourFund */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-950 rounded-[24px] p-6 text-white text-left border border-indigo-505 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl transition-all" id="find-funds-bridge-banner">
              <div className="absolute right-0 top-0 w-64 h-64 bg-white/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="flex-1 relative z-10 space-y-2">
                <div className="inline-flex items-center gap-1.5 bg-yellow-400/20 text-yellow-300 border border-yellow-400/30 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-extrabold pb-1.5 pt-1">
                  <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
                  <span>Interactive Integration Active</span>
                </div>
                <h3 className="text-xl font-black tracking-tight font-sans">
                  Exactly Which Funds to Invest in as per your Profile
                </h3>
                <p className="text-slate-200 text-xs font-sans font-light max-w-2xl leading-relaxed">
                  Ready to invest? We can immediately use your calibrated <strong>{scoringDetails.anchorFundCategory}</strong> profile and all survey choices parameter inputs to suggest specific, real domestic and international funds suitable for your strategy.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsPasswordDialogOpen(true);
                }}
                className="relative z-10 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-white hover:bg-slate-50 text-indigo-950 text-[13px] font-black rounded-2xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] shrink-0 border-b-2 border-slate-250 font-sans"
              >
                <span>Find Corresponding Funds Now</span>
                <ArrowRight className="w-4 h-4 text-indigo-705 shrink-0" />
              </button>
            </div>

            {/* 3. Macro Asset Allocation Split & Active Risk Firewalls */}
            <div className="bg-white rounded-[32px] border-2 border-slate-200/60 shadow-xl p-6 md:p-8 text-left hover:border-indigo-200 hover:shadow-2xl transition-all relative overflow-hidden" id="macro-asset-class-calibration">
              {/* Floating Verified Badge */}
              <div className="absolute top-4 right-4 hidden sm:flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Integrity Protocol</span>
              </div>

              <h3 className="text-md font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-5 mb-6 font-sans">
                <BarChart3 className="w-6 h-6 text-indigo-650 shrink-0" />
                <div className="flex-1">
                  <span className="block text-[16px] font-black tracking-tight text-slate-900 uppercase">Macro Asset Class Weight Calibration</span>
                  <span className="block text-[11px] font-mono text-slate-400 font-bold uppercase tracking-wider mt-1">
                    AI-Driven Financial Policy Engine • Backed by AMFI Principles
                  </span>
                </div>
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Visual Bar Split */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-5">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest pl-0.5">Asset split matrix configuration</span>
                      <div className="flex gap-4 text-xs font-black font-mono">
                        <span className="text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">Growth: {scoringDetails.equityAllocation}%</span>
                        <span className="text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                          {shariahOnly ? "Ethical" : "Defensive"}: {scoringDetails.debtAllocation}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Styled Segmented Progress Bar */}
                    <div className="h-10 w-full bg-slate-50 rounded-2xl overflow-hidden flex border-2 border-slate-105 shadow-inner relative">
                      {scoringDetails.equityAllocation > 0 && (
                        <div 
                          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-700 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-black text-white tracking-widest text-center transition-all duration-300 shadow-lg relative cursor-default group"
                          style={{ width: `${scoringDetails.equityAllocation}%` }}
                        >
                          <span className="relative z-15">{scoringDetails.equityAllocation > 15 ? `GROWTH CORE ${scoringDetails.equityAllocation}%` : `${scoringDetails.equityAllocation}%`}</span>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                      {scoringDetails.debtAllocation > 0 && (
                        <div 
                          className="bg-gradient-to-r from-slate-700 via-slate-800 to-slate-950 h-full flex items-center justify-center text-[10px] sm:text-[11px] font-mono font-black text-white tracking-widest text-center transition-all duration-300 relative cursor-default group"
                          style={{ width: `${scoringDetails.debtAllocation}%` }}
                        >
                          <span className="relative z-15">{scoringDetails.debtAllocation > 15 ? `${shariahOnly ? "ETHICAL SHIELD" : "HEDGED DEFENSE"} ${scoringDetails.debtAllocation}%` : `${scoringDetails.debtAllocation}%`}</span>
                          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-700 pl-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-blue-600 shrink-0 flex items-center justify-center text-[8px] text-white font-mono font-bold">●</div>
                      <span className="font-semibold text-slate-800">
                        {shariahOnly ? "Shariah-Screened High growth compounding Equities" : "Asset Core: High-growth compounding equities to beat inflation"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-700 pl-1">
                      <div className="w-3.5 h-3.5 rounded-full bg-slate-805 shrink-0 flex items-center justify-center text-[8px] text-white font-mono font-bold">●</div>
                      <span className="font-semibold text-slate-800">
                        {shariahOnly ? "Sovereign Interest-Free Cash Reserves & Vault Gold" : "Strategic Shield: AAA Corporate Bonds, Sovereign Paper, and Liquid Reserves"}
                      </span>
                    </div>
                  </div>

                  {/* Trust Score block for Confidence building and FOMO */}
                  <div className="pt-2 flex items-center gap-2">
                    <div className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">Calibration Score:</div>
                    <div className="bg-emerald-500/10 text-emerald-700 border border-emerald-500/15 px-2.5 py-0.5 rounded-md text-[11px] font-mono font-black">
                      98.6% Allocation Efficiency Achieved
                    </div>
                  </div>
                </div>

                {/* Active Risk Firewalls */}
                <div className="lg:col-span-6 flex flex-col justify-between">
                  <div className="bg-slate-905 text-white rounded-2xl p-5 border border-slate-800 space-y-4 shadow-xl flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-[11px] font-mono font-black uppercase text-amber-400 tracking-wider flex items-center gap-2">
                        <Shield className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
                        <span>Active Allocation Protectors & Policy Shields</span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 mb-3.5 leading-relaxed">
                        These dynamic rules have automatically kicked in to firewall your hard-earned capital from toxic market exposure:
                      </p>
                      
                      <div className="space-y-2.5 max-h-[160px] overflow-y-auto pr-1">
                        {scoringDetails.activeFilters.map((flt, idx) => (
                          <div key={idx} className="bg-slate-850 p-3 rounded-xl border border-slate-750 text-left relative overflow-hidden pl-8 group hover:bg-slate-800 transition-colors">
                            <Check className="absolute left-2.5 top-3.5 w-4 h-4 text-emerald-400 font-extrabold shrink-0" />
                            <span className="font-extrabold text-white block text-[11.5px] leading-tight">{flt.rule}</span>
                            <span className="text-slate-400 text-[10.5px] block mt-0.5 leading-normal font-sans font-light">{flt.desc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800 text-[10px] text-slate-400 font-mono text-center">
                      🔒 Zero-overlap diversification engine active • AMFI Compliant Split
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Automated Portfolio Blueprint & Category Split Weights */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch text-left">
              
              {/* Left Column: Blueprint and Complete Split Table */}
              <div className="lg:col-span-8 bg-white p-6 md:p-8 rounded-[32px] border-2 border-slate-200/60 shadow-xl text-left flex flex-col justify-between font-sans hover:border-indigo-250 transition-all relative overflow-hidden" id="target-asset-allocation-matrix">
                {/* Visual Accent */}
                <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600" />
                
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-5 gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-[17px] font-black text-slate-900 flex items-center gap-2 font-sans uppercase">
                        <LineChart className="w-5.5 h-5.5 text-indigo-650 shrink-0" />
                        <span className="truncate sm:whitespace-nowrap">Target Asset Allocation Matrix</span>
                      </h4>
                      <p className="text-[12px] text-slate-500 mt-1 font-medium max-w-lg leading-relaxed">
                        Precision-engineered mutual fund asset classes, weighted dynamically to compound capital under our strictly calibrated benchmark.
                      </p>
                    </div>
                    
                    {/* Anchor Fund Indicator */}
                    <div className="bg-blue-50 text-blue-900 px-4 py-3 rounded-2xl border border-blue-150/70 shrink-0 text-left max-w-full sm:max-w-xs">
                      <span className="text-[9px] font-mono font-black tracking-widest uppercase block text-blue-600">Anchor Strategy</span>
                      <span className="font-black text-[13px] text-slate-900 leading-normal block mt-0.5 font-sans uppercase break-words">{scoringDetails.anchorFundCategory}</span>
                    </div>
                  </div>

                  {/* Calculations Split Weight List */}
                  <div className="mt-6 space-y-6">
                    {scoringDetails.equityAllocation > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-[11px] font-mono font-black text-blue-600 uppercase tracking-widest block border-l-4 border-blue-600 pl-2.5">
                            Growth Segment Allocation ({scoringDetails.equityAllocation}% Core Asset Weight)
                          </div>
                          <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-150 px-2 rounded-md font-bold uppercase tracking-wider">Compounding Engine Active</span>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Flexi Cap */}
                          {scoringDetails.splits.flexiCapPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-blue-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Foundational</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Core Equity Strategy" : "Flexi Cap Growth Funds"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Strictly screened ethical business compounding matrix" : "All-cap sector-agnostic foundational wealth generator"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.flexiCapPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.flexiCapPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Large & Mid Cap */}
                          {scoringDetails.splits.largeMidCapPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-indigo-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Market Leaders</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Large & Mid-Cap Leaders" : "Large & Mid Cap Quality"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "High-grade ethical market giants paired with compounding leaders" : "Tighter volatility blend of top domestic corporate champions"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.largeMidCapPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.largeMidCapPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Mid Cap */}
                          {scoringDetails.splits.midCapPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-cyan-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Growth Catalyst</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Mid-Tier Compounding" : "Mid Cap Allocation"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Mid-sized market compounders compliant with Shariah screening" : "Dynamic innovators capturing high growth curves across India Inc."}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.midCapPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.midCapPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Small Cap */}
                          {scoringDetails.splits.smallCapPct > 0 && (
                            <div className="bg-rose-50/30 p-4 rounded-3xl border-l-[5px] border-l-rose-500 border border-rose-100 shadow-3xs flex justify-between items-center text-xs hover:bg-rose-50/60 hover:border-rose-200 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Alpha Accelerator</span>
                                <span className="font-extrabold text-rose-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Satellite Small Cap" : "Small Cap Satellite Yield"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Aggressive satellite allocation targeting ethical minor giants" : "Hyper-growth opportunities in emerging future corporate leaders"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-rose-950 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.smallCapPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.smallCapPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Large Cap */}
                          {scoringDetails.splits.largeCapPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-slate-700 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-slate-200 text-slate-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Bluechip Anchor</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Bluechip Sector Leaders" : "Large Cap Bluechip"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Safest top indices passing strict financial debt ratio rules" : "Elite industry giants providing stable index-backed support"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.largeCapPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.largeCapPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Balanced Advantage */}
                          {scoringDetails.splits.balancedAdvantagePct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-violet-650 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Dynamic Equalizer</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Non-Banking Equalizer" : "Balanced Advantage Strategy"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Bespoke ethical rebalancing using gold indices & equity buffers" : "Dynamic asset allocation automatically adjusting equity-debt ratio daily"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.balancedAdvantagePct}%</span>
                                <span className="text-emerald-750 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.balancedAdvantagePct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* ELSS Tax Saver */}
                          {scoringDetails.splits.elssPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-emerald-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Tax Optimizer</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Yield Compounders" : "ELSS Tax Saver (Sec. 80C)"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Sovereign index substitutes skipping standard non-compliant banks" : "Qualified high-grade tax savings with standard 3-year locking rules"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.elssPct}%</span>
                                <span className="text-emerald-705 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.elssPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Debt segment */}
                    {scoringDetails.debtAllocation > 0 && (
                      <div className="space-y-4 pt-6 border-t border-slate-100">
                        <div className="text-[11px] font-mono font-black text-indigo-600 uppercase tracking-widest block border-l-4 border-indigo-600 pl-2.5">
                          Defensive Segment Allocation ({scoringDetails.debtAllocation}% Hedging & Ballast Weight)
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Short Duration Debt */}
                          {scoringDetails.splits.shortDurationPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-indigo-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Safety Lock</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Sovereign Interest-Free Stability Reserves" : "Short Duration High-Yield Debt"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Interest-free public sector deposits to lock in capital principal" : "Supreme credit rating short maturity institutional debt instruments"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.shortDurationPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.shortDurationPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Corporate Bond Debt */}
                          {scoringDetails.splits.corporateBondPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-amber-500 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Inflation Hedge</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Physical Bullion Gold Reserve" : "Corporate Bond Premium"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Pure certified bullion held in secure bank vaults to hedge inflationary gaps" : "Secured holdings in premium AAA-rated corporate debt structures"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.corporateBondPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.corporateBondPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Liquid / Money Market */}
                          {scoringDetails.splits.liquidPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-emerald-500 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Instant Reserves</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Instant Liquid Capital Buffers" : "Liquid & Money Market Safety"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Highly liquid zero-borrowing sovereign cash pools for immediate deployment" : "Overnight ultra-stable sovereign funds ensuring zero lock-in drag"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.liquidPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.liquidPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}

                          {/* Multi Asset Under SWP */}
                          {scoringDetails.splits.multiAssetPct > 0 && (
                            <div className="bg-slate-50/50 p-4 rounded-3xl border-l-[5px] border-l-teal-600 border border-slate-205 shadow-3xs flex justify-between items-center text-xs hover:bg-slate-50 hover:border-slate-300 transition-all group">
                              <div className="space-y-1 pr-3 text-left">
                                <span className="font-mono text-[9px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-extrabold tracking-wider uppercase inline-block mb-1">Multi Allocator</span>
                                <span className="font-extrabold text-slate-900 block text-[13.5px] leading-tight">
                                  {shariahOnly ? "Shariah Metals & Gold Overlay Shield" : "Multi-Asset Strategic Yield"}
                                </span>
                                <span className="text-[11px] text-slate-500 block leading-tight font-sans font-medium">
                                  {shariahOnly ? "Tactical real asset reserves protecting periodic withdrawals from market dips" : "Diversified low-corridor assets including physical gold & sovereign commodities"}
                                </span>
                              </div>
                              <div className="text-right font-mono shrink-0 pl-1">
                                <span className="font-black text-slate-900 block text-base group-hover:scale-105 transition-transform">{scoringDetails.splits.multiAssetPct}%</span>
                                <span className="text-emerald-700 font-black text-[11px] block mt-0.5">₹{Math.round(capitalAmount * (scoringDetails.splits.multiAssetPct / 100)).toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-150 mt-4 text-[11px] text-slate-400 font-mono font-bold">
                  * Note: Estimated calculations based on a {capitalType === 'SIP' ? 'monthly contribution' : 'one-time capital size'} of ₹{capitalAmount.toLocaleString('en-IN')}.
                </div>
              </div>

              {/* Right Column: Execution Strategy Logic Card */}
              <div className="lg:col-span-4 bg-slate-905 text-white rounded-[28px] border border-slate-800 p-6 md:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl text-left font-sans hover:border-slate-700/80 transition-all">
                <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[100px] pointer-events-none -mr-20 -mt-20 bg-indigo-500/15" />
                <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-[90px] pointer-events-none -ml-16 -mb-16 bg-emerald-500/10" />
                
                <div className="space-y-5 relative z-10 text-left">
                  <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3.5 py-1.5 rounded-full text-[9.5px] font-mono tracking-widest uppercase font-black">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0 animate-pulse" />
                    <span>Deployment Protocol</span>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-[12px] font-mono uppercase tracking-widest text-slate-400 font-extrabold block text-left">
                      {scoringDetails.isMandatorySTP ? "HNW Tactical Lock Execution" : "Recommended Execution Strategy"}
                    </h3>
                    
                    <h4 className="text-[20px] font-black bg-gradient-to-r from-amber-300 via-amber-200 to-yellow-105 bg-clip-text text-transparent leading-tight font-sans tracking-tight">
                      {scoringDetails.executionStrategyTitle}
                    </h4>
                  </div>
                  
                  <p className="text-[12.8px] leading-relaxed text-slate-300 font-sans font-light">
                    {scoringDetails.executionStrategyText}
                  </p>


                </div>

                <div className="pt-8 relative z-10 space-y-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (triggerPopup) {
                        triggerPopup(true);
                      } else {
                        setCurrentPage('connect');
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white text-[13px] font-black rounded-2xl transition-all cursor-pointer shadow-lg shadow-emerald-500/20 active:scale-[0.98] outline-none border-b border-emerald-650"
                  >
                    <Award className="w-4.5 h-4.5 text-amber-300 shrink-0" />
                    <span>Initiate Investment Allocation</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white text-[11.5px] font-bold rounded-xl transition-all cursor-pointer border border-slate-800"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Calibration Quiz</span>
                  </button>
                </div>
              </div>
            </div>

            {/* 5. Exclusions & Avoidance Engine Block */}
            <div ref={exclusionsEngineRef} className="bg-slate-50/80 rounded-[28px] border-2 border-red-100 p-6 text-left font-sans hover:shadow-md hover:border-red-200 transition-all relative overflow-hidden" id="dynamic-portfolio-avoidance-engine">
              {/* Abstract decorative red gradient backcloth */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-400/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-red-100 pb-4 mb-5 gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-650 flex items-center justify-center text-lg font-bold border border-red-150 shadow-2xs shrink-0">
                    🛡️
                  </div>
                  <div>
                    <h4 className="text-[15.5px] font-black text-slate-900 uppercase tracking-tight font-sans">Dynamic Portfolio Avoidance Engine</h4>
                    <p className="text-[11px] font-mono text-red-600 uppercase font-bold tracking-wider mt-0.5">Military-Grade Risk Shields Filtering Out Toxic Asset Classes</p>
                  </div>
                </div>
                
                <span className="text-[10px] font-mono text-white bg-red-600/90 hover:bg-red-650 px-3 py-1 rounded-full uppercase tracking-wider font-extrabold shadow-sm flex items-center gap-1 shrink-0 select-none">
                  <span>● SAFETY RATING A++</span>
                </span>
              </div>
              
              <p className="text-[11.5px] text-slate-500 mb-4 leading-relaxed font-sans max-w-4xl pr-4">
                To build authentic long-term capital confidence, our software doesn't just suggest what to buy—it actively hardens your net worth by enforcing permanent bans on vehicles that are highly prone to capital decay, hidden leverage, or sudden liquidity shocks:
              </p>

              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 font-sans">
                {scoringDetails.avoidItems.map((item, idx) => (
                  <li key={idx} className="bg-white p-3.5 rounded-2xl border border-red-100/50 text-xs text-slate-805 leading-relaxed flex items-start gap-2.5 text-left shadow-2xs hover:border-red-200 hover:shadow-xs transition-all font-medium">
                    <span className="text-red-555 text-sm leading-none shrink-0 mt-0.5">✕</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 6. Tabs Factsheets Educational Center */}
            <div className="pt-8 border-t border-slate-150/90" id="reference-classifications-external">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between text-left mb-6 gap-3">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-150 px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider pb-1">
                    <span>🎯 Brokerage-Compatible Standards</span>
                  </div>
                  <h4 className="text-[17.5px] font-black text-slate-900 uppercase tracking-tight">
                    Reference Classifications Mapped on Direct Platforms
                  </h4>
                  <p className="text-[12px] text-slate-500 leading-relaxed font-medium">
                    100% compliant and mapped with major direct mutual fund platforms like **Zerodha Coin**, **Kuvera**, and leading direct portals to enable frictionless lookup. Tap any match to explore the core factsheets.
                  </p>
                </div>
                
                {/* Visual badge */}
                <div className="bg-slate-100 text-slate-700 text-[10.5px] font-mono px-3.5 py-1.5 rounded-full border border-slate-200 shrink-0 font-bold uppercase flex items-center gap-1.5 self-start sm:self-auto">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span>Direct API Mapping Active</span>
                </div>
              </div>

              {/* TABS BUTTON LIST */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {diagnosedCategories.map((cat, idx) => {
                  const isActive = activeTab === idx;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveTab(idx)}
                      className={`p-4 sm:p-5 rounded-2xl text-left border-2 cursor-pointer transition-all duration-200 relative overflow-hidden group uppercase tracking-wide ${
                        isActive
                          ? (idx === 0 
                              ? 'border-emerald-500 bg-emerald-50 shadow-xl shadow-emerald-500/10 text-slate-900' 
                              : 'border-blue-650 bg-blue-650 text-white shadow-xl shadow-blue-500/20')
                          : 'border-slate-200 bg-white hover:border-slate-350 text-slate-805 shadow-3xs'
                      }`}
                    >
                      {isActive && (
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
                      )}
                      <div className="flex justify-between items-start">
                        <div className={`text-[10px] font-mono font-black tracking-widest block mb-1.5 ${
                          idx === 0 
                            ? 'text-black' 
                            : (isActive ? 'text-indigo-200' : 'text-slate-400')
                        }`}>
                          {idx === 0 ? "🏆 MATCH 1" : idx === 1 ? "🥈 MATCH 2" : "🤝 MATCH 3"}
                        </div>
                        {isActive && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                            idx === 0 ? 'bg-emerald-100 text-emerald-805 border border-emerald-200' : 'bg-white/20 text-white'
                          }`}>Active</span>
                        )}
                      </div>
                      <div className={`text-[13.5px] font-black leading-tight ${
                        idx === 0 
                          ? 'text-emerald-600 font-extrabold' 
                          : (isActive ? 'text-white' : 'text-slate-900 group-hover:text-blue-600')
                      }`}>
                        {cat.name}
                      </div>
                      <div className={`text-[10px] mt-2.5 font-mono font-bold flex items-center gap-1 ${
                        idx === 0 
                          ? 'text-black font-extrabold' 
                          : (isActive ? 'text-indigo-200' : 'text-slate-500')
                      }`}>
                        <span>{cat.relevance}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Header Dashboard Banner for Active Tab */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-[24px] border border-slate-800 shadow-xl text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[90px] pointer-events-none -mr-16 -mt-16 bg-blue-500/10" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-3 max-w-2xl">
                  <div className="inline-flex items-center gap-1.5 bg-blue-550/30 text-blue-300 border border-blue-500/25 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase">
                    <BrainCircuit className="w-3.5 h-3.5 text-blue-400" />
                    <span>{currentCategory.relevance} Configuration</span>
                  </div>
                  
                  <h2 className="text-[20px] sm:text-[23px] font-black text-white leading-tight">
                    Recommended Target Fund Type:
                  </h2>
                  <h3 className="text-[22px] sm:text-[25px] font-black bg-gradient-to-r from-amber-300 to-amber-200 bg-clip-text text-transparent">
                    {currentCategory.name}
                  </h3>
                  
                  <p className="text-[12.5px] leading-relaxed text-slate-300 font-sans">
                    <span className="text-white font-bold bg-slate-800/80 px-1.5 py-0.5 rounded mr-1">RATIONALE:</span>
                    {currentCategory.whySuited}
                  </p>
                </div>

                {/* Action Side Panel */}
                <div className="flex flex-col gap-2.5 shrink-0 min-w-[200px]">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-750 text-[12px] font-semibold rounded-xl transition-all cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retake Profile Quiz</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (triggerPopup) {
                        triggerPopup(true);
                      } else {
                        setCurrentPage('connect');
                      }
                    }}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-[12.5px] font-black rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-600/10 active:scale-[0.98]"
                  >
                    <Award className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span>Deploy This Fund Strategy</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bento-grid Analytics and Education Components */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="bento-grid-analytics-education">
              
              {/* 1. Category Overview & Suitability Metrics - 7/12 cols */}
              <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-200/80 shadow-xl flex flex-col justify-between text-left hover:border-blue-200 hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="space-y-5 relative z-10 text-left">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
                    <h4 className="text-[16px] font-black text-slate-900 flex items-center gap-2 font-sans">
                      <InfoIcon className="w-5 h-5 text-blue-650 shrink-0" />
                      <span>Category Structural Details</span>
                    </h4>
                    
                    <a 
                      href={currentCategory.growwReferenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[11.5px] font-mono font-black text-blue-600 hover:text-blue-800 hover:underline cursor-pointer bg-blue-50/50 hover:bg-blue-105 border border-blue-100 px-3 py-1.5 rounded-full transition-all"
                    >
                      <span>Locate Real-Time Category Facts</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50/85 p-4 rounded-2xl border-2 border-slate-100 text-left hover:bg-slate-50 transition-all">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1">
                        <Landmark className="w-3 h-3 text-slate-400" />
                        Class Classification
                      </span>
                      <span className="text-[13.5px] font-black text-slate-950 block mt-1.5 leading-tight">{currentCategory.superCategory} Mutual Fund</span>
                    </div>
                    
                    <div className="bg-slate-50/85 p-4 rounded-2xl border-2 border-slate-100 text-left hover:bg-slate-50 transition-all">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1">
                        <Shield className="w-3 h-3 text-slate-400" />
                        Risk Matrix Rating
                      </span>
                      <span className={`text-[13.5px] font-black block mt-1.5 leading-tight ${
                        currentCategory.riskClass === 'Very High' ? 'text-red-650 bg-red-50/50 border border-red-100 px-2 py-0.5 rounded-md inline-block' : 
                        currentCategory.riskClass === 'High' ? 'text-orange-650 bg-orange-50/50 border border-orange-100 px-2 py-0.5 rounded-md inline-block' : 
                        currentCategory.riskClass === 'Moderate' ? 'text-blue-650 bg-blue-50/50 border border-blue-100 px-2 py-0.5 rounded-md inline-block' : 'text-emerald-700 bg-emerald-50/55 border border-emerald-100 px-2 py-0.5 rounded-md inline-block'
                      }`}>
                        {currentCategory.riskClass} Risk
                      </span>
                    </div>

                    <div className="bg-slate-50/85 p-4 rounded-2xl border-2 border-slate-100 text-left hover:bg-slate-50 transition-all">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Suggested Horizon
                      </span>
                      <span className="text-[13.5px] font-black text-slate-905 block mt-1.5 leading-tight">{currentCategory.timeHorizonSuitability}</span>
                    </div>

                    <div className="bg-slate-50/85 p-4 rounded-2xl border-2 border-slate-100 text-left hover:bg-slate-50 transition-all">
                      <span className="text-[9.5px] font-mono uppercase tracking-widest text-slate-400 font-extrabold flex items-center gap-1">
                        <Coins className="w-3 h-3 text-slate-400" />
                        Exit Load expectations
                      </span>
                      <span className="text-[13.5px] font-extrabold text-slate-800 block mt-1.5 leading-tight">{currentCategory.exitLoadExpectation}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <h5 className="text-[10px] font-mono uppercase font-black tracking-widest text-slate-400 mb-2 flex items-center gap-1">
                      <span>• PRIMARY INVESTMENT MANDATE</span>
                    </h5>
                    <p className="text-[12.5px] text-slate-705 leading-relaxed bg-slate-50/55 p-4 rounded-2xl border-2 border-slate-100">
                      {currentCategory.objectiveDescription}
                    </p>
                  </div>
                </div>

                <div className="pt-5 border-t border-slate-100 mt-5">
                  <div className="flex items-start gap-3 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/60 text-indigo-950 text-left">
                    <Briefcase className="w-4.5 h-4.5 text-indigo-650 shrink-0 mt-0.5" />
                    <div className="text-[11.8px] leading-relaxed text-indigo-905">
                      <span className="font-extrabold block text-indigo-950 uppercase tracking-wide text-[10px] font-mono mb-0.5">Indian Income Tax Implication (Budget FY 2025-26 Standardized Rules):</span> 
                      {currentCategory.taxImplication}
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Typical Asset allocation / Weight Breakdown - 5/12 cols */}
              <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-200/80 shadow-xl flex flex-col justify-between text-left hover:border-indigo-200 hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
                <div className="relative z-10 text-left">
                  <h4 className="text-[16px] font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4 font-sans">
                    <PieIcon className="w-5 h-5 text-indigo-655 shrink-0" />
                    <span>Target Asset Allocation Mix</span>
                  </h4>
                  <p className="text-[12px] text-slate-500 mt-3 leading-relaxed">
                    Underlying structural blueprint limits generally preserved by prominent asset management firms inside this exclusive <strong className="text-slate-800">{currentCategory.superCategory}</strong> category class:
                  </p>

                  {/* Pie chart representation */}
                  <div className="h-44 flex items-center justify-center mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={currentCategory.assetClassMix}
                          cx="50%"
                          cy="50%"
                          innerRadius={55}
                          outerRadius={75}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {currentCategory.assetClassMix.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Graphical Legend indicator list */}
                <div className="space-y-2 mt-4 relative z-10 bg-slate-50/50 p-4 rounded-2xl border border-slate-150">
                  {currentCategory.assetClassMix.map((mix, idx) => (
                    <div key={idx} className="flex justify-between items-center text-[12px]">
                      <div className="flex items-center gap-2 text-slate-700">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: mix.color }} />
                        <span className="font-medium text-slate-800">{mix.name}</span>
                      </div>
                      <span className="font-mono font-black text-slate-950">{mix.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Asset Allocation Warnings & Portfolio Overlapping Considerations */}
            <div className="bg-amber-50/60 p-5 rounded-[24px] border-2 border-amber-200/80 text-left space-y-2.5 relative overflow-hidden" id="asset-allocation-warnings">
              <div className="flex items-center gap-2.5 text-[14.5px] font-black text-amber-955">
                <AlertTriangle className="w-5 h-5 text-amber-655 shrink-0" />
                <span>Asset Allocation & Overlap Risk Mitigation Matrix</span>
              </div>
              <p className="text-[12.2px] leading-relaxed text-amber-900/90 font-medium max-w-6xl">
                {currentCategory.allocationCaution}
              </p>
            </div>

            {/* Optimal Match (Primary) Configuration Call to Action */}
            <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 p-6 rounded-[28px] border border-indigo-505 flex flex-col md:flex-row items-center justify-between gap-5 text-left font-sans shadow-lg relative overflow-hidden" id="optimal-match-primary-cta">
              <div className="absolute right-0 top-0 w-80 h-80 rounded-full blur-[80px] bg-white/10 pointer-events-none" />
              <div className="space-y-1.5 relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-1.5 bg-emerald-400/20 text-emerald-350 border border-emerald-400/30 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-widest uppercase font-extrabold mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-300" />
                  <span>Elite Priority Option Selected</span>
                </div>
                <h4 className="text-[16px] font-black text-white flex items-center gap-2">
                  <span>Deploy Optimal Match (Primary Category Selection)</span>
                </h4>
                <p className="text-slate-205 text-[12px] leading-relaxed font-light">
                  Instantly configure your distribution account. This sets up systematic parameters prioritized specifically to align with high active-allocation defense rules.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (triggerPopup) {
                    triggerPopup(true);
                  } else {
                    setCurrentPage('connect');
                  }
                }}
                className="relative z-10 inline-flex items-center justify-center gap-2 py-3 px-6 bg-white hover:bg-slate-50 text-indigo-950 text-[13px] font-black rounded-xl transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.98] shrink-0 self-stretch md:self-auto border-b-2 border-slate-350"
              >
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Activate Primary Allocation</span>
              </button>
            </div>

            {/* Historical typical CAGR analysis */}
            <div ref={cagrRef} className="bg-white p-6 sm:p-8 rounded-[32px] border-2 border-slate-200/80 shadow-xl text-left hover:shadow-2xl transition-all relative overflow-hidden" id="category-historical-cagr">
              <div className="absolute top-0 right-0 w-44 h-44 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
              <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-100 pb-5 gap-4">
                <div className="space-y-1 text-left">
                  <span className="text-[10px] font-mono font-black text-blue-600 bg-blue-50 border border-blue-105 px-2.5 py-1 rounded">PROVEN RISK-ADJUSTED PERFORMANCE</span>
                  <h4 className="text-[17.5px] font-black text-slate-900 flex items-center gap-2 mt-2 font-sans uppercase">
                    How Optimal Match ({currentCategory.name}) Compares
                  </h4>
                  <p className="text-[12px] text-slate-500 font-medium">
                    Verified Rolling Returns measured over professional multi-horizon cycles paired with Sharpe Ratio metrics to confirm elite risk-adjusted outperformance.
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-4 text-[10.5px] font-mono uppercase tracking-wider text-slate-500 font-bold shrink-0 self-start lg:self-auto">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-600 rounded" />
                    <span>3-Year Rolling Returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-teal-500 rounded" />
                    <span>5-Year Rolling Returns</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-violet-600 rounded" />
                    <span>Sharpe Ratio (Alpha)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                {[
                  { 
                    label: `${currentCategory.name} (Your Match)`, 
                    value3: currentCategory.threeYrCAGR, 
                    value5: currentCategory.fiveYrCAGR, 
                    sharpe: currentCategory.superCategory === 'Equity' ? 1.38 : currentCategory.superCategory === 'Other' ? 1.15 : currentCategory.superCategory === 'Hybrid' ? 1.25 : 1.48,
                    active: true, 
                    badge: '🔥 Recommended Strategy' 
                  },
                  { label: 'Nifty 50 Index Bluechip', value3: 15.4, value5: 13.8, sharpe: 0.98, active: false, badge: 'Benchmark Index' },
                  { label: 'Standard Balanced Hybrid / BAF', value3: 11.2, value5: 10.9, sharpe: 0.88, active: false, badge: 'Hybrid Average' },
                  { label: 'Sovereign Debt Bond Benchmark', value3: 7.2, value5: 6.8, sharpe: 1.05, active: false, badge: 'Conservative Base' }
                ].map((row, index) => (
                  <div 
                    key={index} 
                    className={`p-5 rounded-2xl border-2 transition-all text-left flex flex-col justify-between ${
                      row.active 
                        ? 'border-blue-600 bg-blue-50/10 shadow-md shadow-blue-500/5 ring-1 ring-blue-400/10' 
                        : 'border-slate-100 bg-slate-50/30 hover:border-slate-200'
                    }`}
                  >
                    <div>
                      <span className={`text-[9.5px] font-mono font-black tracking-wider uppercase px-2 py-0.5 rounded-full inline-block ${
                        row.active ? 'text-blue-700 bg-blue-100/70 border border-blue-200' : 'text-slate-400 bg-slate-100 border border-slate-200'
                      }`}>
                        {row.badge}
                      </span>
                      <span className="text-[13.5px] font-black text-slate-900 block mt-3 leading-tight font-sans">
                        {row.label}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
                      <div>
                        <span className="text-[8.5px] font-mono font-bold text-slate-450 uppercase tracking-widest block leading-tight">3-Yr Rolling</span>
                        <span className="text-[15px] font-mono font-black text-slate-900 block mt-1">
                          {row.value3}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[8.5px] font-mono font-bold text-slate-455 uppercase tracking-widest block leading-tight">5-Yr Rolling</span>
                        <span className="text-[15px] font-mono font-black text-teal-600 block mt-1 font-extrabold pb-0.5">
                          {row.value5}%
                        </span>
                      </div>
                      <div>
                        <span className="text-[8.5px] font-mono font-bold text-indigo-500 uppercase tracking-widest block leading-tight">Sharpe</span>
                        <span className="text-[15px] font-mono font-black text-indigo-650 block mt-1 font-extrabold pb-0.5">
                          {row.sharpe}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Specific Fund Types to Avoid vs Partner Companion Pairings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {/* Red Warning Card: Fund Types to Avoid */}
              <div ref={categoryToAvoidRef} className="bg-red-50 p-6 rounded-2xl border border-red-150 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-red-100 text-red-650 flex items-center justify-center font-bold text-md shadow-3xs">
                    🚫
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-red-950 uppercase tracking-wide">Category types to avoid</h4>
                    <p className="text-[10px] font-mono text-red-700/80 uppercase">Incompatible with your current status</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-extrabold text-red-900 block bg-red-100/50 p-2 rounded border border-red-200">
                    Avoid: {currentCategory.toAvoid.category}
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-red-850">
                    <span className="font-bold">Why Avoid:</span> {currentCategory.toAvoid.reason}
                  </p>
                </div>
              </div>

              {/* Green Success Card: Partner Add-on/Companion Type */}
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-150 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-650 flex items-center justify-center font-bold text-md shadow-3xs">
                    🤝
                  </div>
                  <div>
                    <h4 className="text-[14px] font-extrabold text-emerald-950 uppercase tracking-wide">Good companion / add-on strategy</h4>
                    <p className="text-[10px] font-mono text-emerald-700/80 uppercase">Maximizes portfolio diversification</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs pt-1">
                  <span className="font-extrabold text-emerald-950 block bg-emerald-100/50 p-2 rounded border border-emerald-200">
                    Add-on: {currentCategory.companionAddon.category}
                  </span>
                  <p className="text-[11.5px] leading-relaxed text-emerald-850">
                    <span className="font-bold">Diversification Benefit:</span> {currentCategory.companionAddon.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Premium, High-Converting Transition CTA to Step 3 */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 rounded-[24px] p-8 text-white border border-indigo-500/20 shadow-xl relative overflow-hidden mt-10">
              <div className="absolute -right-24 -top-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-[60px]" />
              <div className="absolute -left-24 -bottom-24 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px]" />
              
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="max-w-2xl text-left">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full mb-3">
                    RECOMMENDED MATCH READY
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black font-sans leading-tight">
                    Deploy Your Customized Strategy Model
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-355 text-slate-350 mt-2 font-light leading-relaxed">
                    You've calibrated your compatible asset classes. Now select how you'd like to fund your portfolio: utilize our direct automated technology partner or schedule a personalized callback.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFocusedStep(3);
                    window.scrollTo({ top: 300, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 py-3.5 px-8 bg-emerald-500 hover:bg-emerald-400 text-[#0B1528] font-black text-sm rounded-xl transition-all shadow-lg active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Proceed to Step 3: Invest Now</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <TakeActionTodayForm
              toolName="Find Fund Type"
              title="Ready to Secure Your Strategic Mutual Fund Assets?"
              description="Coordinate with an AMFI-registered certified advisor to lock down your optimal fund categories, process KYC verification, and initiate secure monthly allocations with confidence."
              customData={{
                recommendedCategory: currentCategory?.name,
                capitalType,
                capitalAmount,
                timeHorizon,
                goal,
                riskCapacity
              }}
            />

            </>
            )}

          </div>
        );
      })()}
      <PasswordDialog
        isOpen={isPasswordDialogOpen}
        onClose={() => setIsPasswordDialogOpen(false)}
        onSuccess={onTransitionToFindFund}
      />
    </div>
  );
}
