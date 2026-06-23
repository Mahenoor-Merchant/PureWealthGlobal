/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { FAQS, AMFI_ARN_DETAILS } from '../data';
import { FAQItem } from '../types';
import { fundTypesCategories, fundTypesDetails } from '../data/fundTypesData';
import {
  Search,
  BookMarked,
  BookOpen,
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  TrendingUp,
  XCircle,
  ArrowRight,
  TrendingDown,
  Percent,
  Award,
  ShieldCheck,
  Zap,
  Info,
  Layers,
  Sparkles,
  Calendar,
  AlertTriangle,
  Coins
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface KnowledgeHubProps {
  setCurrentPage?: (page: any) => void;
}

export default function KnowledgeHubView({ setCurrentPage }: KnowledgeHubProps) {
  const [activeTab, setActiveTab] = useState<'journey' | 'faq' | 'outlook' | 'types'>('journey');
  const [selectedArticleId, setSelectedArticleId] = useState<'taxation' | 'active-alpha' | 'fees'>('taxation');

  // Master sub-category selection for all 19 Mutual Fund Types
  const [selectedSubTypeId, setSelectedSubTypeId] = useState<string>('large-cap');

  // FAQ types section accordion
  const [expandedTypeFaqId, setExpandedTypeFaqId] = useState<string | null>('tfaq-dyn-0');

  // Helper method to dynamically render categories icons
  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'Layers': return <Layers className="w-3.5 h-3.5" />;
      case 'Coins': return <Coins className="w-3.5 h-3.5" />;
      default: return <Layers className="w-3.5 h-3.5" />;
    }
  };

  // Synchronize state with location hash for deep linking
  useEffect(() => {
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash === '#knowledge/faq') {
        setActiveTab('faq');
      } else if (hash === '#knowledge/types' || hash.startsWith('#knowledge/types/')) {
        setActiveTab('types');
        const hashParts = hash.split('/');
        if (hashParts.length > 2) {
          const subId = hashParts[2];
          if (fundTypesDetails[subId]) {
            setSelectedSubTypeId(subId);
          }
        }
      } else if (hash.startsWith('#knowledge/outlook')) {
        setActiveTab('outlook');
        if (hash === '#knowledge/outlook/taxation') {
          setSelectedArticleId('taxation');
        } else if (hash === '#knowledge/outlook/active-alpha') {
          setSelectedArticleId('active-alpha');
        } else if (hash === '#knowledge/outlook/fees') {
          setSelectedArticleId('fees');
        }
      } else if (hash === '#knowledge/journey') {
        setActiveTab('journey');
      } else if (hash.startsWith('#knowledge')) {
        setActiveTab('journey');
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);
    return () => window.removeEventListener('hashchange', handleHashCheck);
  }, []);

  const handleTabChange = (tab: 'journey' | 'faq' | 'outlook' | 'types') => {
    setActiveTab(tab);
    if (tab === 'outlook') {
      window.location.hash = `#knowledge/outlook/${selectedArticleId}`;
    } else if (tab === 'types') {
      window.location.hash = `#knowledge/types/${selectedSubTypeId}`;
    } else {
      window.location.hash = `#knowledge/${tab}`;
    }
    // Smooth scroll back to the tab selector bar so the user knows context has changed
    const element = document.getElementById('knowledge-tab-headers');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubTypeChange = (subId: string) => {
    setSelectedSubTypeId(subId);
    window.location.hash = `#knowledge/types/${subId}`;
    const element = document.getElementById('type-content-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleArticleChange = (articleId: 'taxation' | 'active-alpha' | 'fees') => {
    setSelectedArticleId(articleId);
    window.location.hash = `#knowledge/outlook/${articleId}`;
    // Scroll the reading pane into view on mobile
    const element = document.getElementById('article-reading-pane');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // FAQ Page States
  const [selectedCategory, setSelectedCategory] = useState<'All' | FAQItem['category']>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState<string | null>('faq-1');

  const categories: ('All' | FAQItem['category'])[] = ['All', 'NRI Consulting', 'Mutual Funds', 'General'];

  // Filter and search FAQs
  const filteredFaqs = useMemo(() => {
    return FAQS.filter(faq => {
      const matchesCategory = selectedCategory === 'All' || faq.category === selectedCategory;
      const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(expandedFaqId === id ? null : id);
  };

  // Slider controls for the dynamic Investment Journey math comparison
  const [portfolioSize, setPortfolioSize] = useState<number>(10000000); // Default ₹1 Crore
  const [horizonYears, setHorizonYears] = useState<number>(10); // Default 10 years

  // Performance assumption thresholds:
  // - Competitors / Standard RMs (regular schemes with high expense load + underperformance draft): 14.5% CAGR
  // - Pure Wealth Global model portfolios (cost-scrubbed, macro-optimized alpha schemes): 18.4% CAGR (Optimal returns, not highest)
  const regularCompoundedValue = useMemo(() => {
    return portfolioSize * Math.pow(1 + 0.145, horizonYears);
  }, [portfolioSize, horizonYears]);

  const optimizedCompoundedValue = useMemo(() => {
    return portfolioSize * Math.pow(1 + 0.184, horizonYears);
  }, [portfolioSize, horizonYears]);

  const compoundingGap = useMemo(() => {
    return optimizedCompoundedValue - regularCompoundedValue;
  }, [optimizedCompoundedValue, regularCompoundedValue]);

  // Format currencies nicely in Lakhs / Crores or pure INR representation
  const formatCurrencyINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Hero Story 1 Chart Data (Tata Focused Equity outperformance of Nifty 50 Largecap index over 5 years)
  const tataStoryData = [
    { year: 'Year 0', BenchmarkIndex: 100000, PureWealthRoute: 100000 },
    { year: 'Year 1', BenchmarkIndex: 112000, PureWealthRoute: 118400 },
    { year: 'Year 2', BenchmarkIndex: 125400, PureWealthRoute: 140200 },
    { year: 'Year 3', BenchmarkIndex: 140400, PureWealthRoute: 166000 },
    { year: 'Year 4', BenchmarkIndex: 157200, PureWealthRoute: 196500 },
    { year: 'Year 5', BenchmarkIndex: 176200, PureWealthRoute: 232700 }
  ];

  // Hero Story 2 Chart Data (Global Diversified Cushion performance during Q2/Q3 market drawdowns)
  const globalShieldData = [
    { name: 'Month 0', PeerAvgBasket: 100000, GlobalShield: 100000 },
    { name: 'Month 3', PeerAvgBasket: 104500, GlobalShield: 103200 },
    { name: 'Month 6', PeerAvgBasket: 92100,  GlobalShield: 100800 }, // Underperformance cushion
    { name: 'Month 9', PeerAvgBasket: 89300,  GlobalShield: 99405 },  // Drawdown protected
    { name: 'Month 12', PeerAvgBasket: 101400, GlobalShield: 106500 }, // Faster breakeven
    { name: 'Month 15', PeerAvgBasket: 109200, GlobalShield: 113900 },
    { name: 'Month 18', PeerAvgBasket: 114500, GlobalShield: 122100 },
    { name: 'Month 24', PeerAvgBasket: 118200, GlobalShield: 129400 }
  ];

  // Hero Story 3: Silver Tactical Hedge vs Traditional Precious Metal (Gold/Muted Mix) over 3 years
  const silverStoryData = [
    { name: 'Year 0', PreciousMetalMix: 100000, SilverConsulting: 100000 },
    { name: 'Year 1', PreciousMetalMix: 106200, SilverConsulting: 118500 },
    { name: 'Year 2', PreciousMetalMix: 114000, SilverConsulting: 139200 },
    { name: 'Year 3', PreciousMetalMix: 121500, SilverConsulting: 174600 }
  ];

  // Hero Story 4: Zomato High-Conviction turnaround vs speculative IPO basket average over 24 months
  const zomatoStoryData = [
    { name: 'M0', SpeculativeIPOBox: 100000, ZomatoPosition: 100000 },
    { name: 'M6', SpeculativeIPOBox: 84000,  ZomatoPosition: 61500 },
    { name: 'M12', SpeculativeIPOBox: 71200, ZomatoPosition: 132000 },
    { name: 'M18', SpeculativeIPOBox: 82500, ZomatoPosition: 221000 },
    { name: 'M24', SpeculativeIPOBox: 91400, ZomatoPosition: 308900 }
  ];

  // Hero Story 5: Japan Nikkei Index Play vs broad Emerging Markets aggregate return index
  const japanStoryData = [
    { name: 'Year 0', EmergingMarketsMix: 100000, NikkeiStrategic: 100000 },
    { name: 'Year 1', EmergingMarketsMix: 103100, NikkeiStrategic: 121000 },
    { name: 'Year 2', EmergingMarketsMix: 96800,  NikkeiStrategic: 136500 },
    { name: 'Year 3', EmergingMarketsMix: 104200, NikkeiStrategic: 161800 }
  ];

  const glossaryItems = [
    {
      term: "Asset Allocation",
      definition: "The strategic distribution of investments across various asset categories (such as equities, debt ETFs, and gold) to manage risk according to individual time horizons."
    },
    {
      term: "CAGR",
      definition: "Compound Annual Growth Rate represents the mean annual growth of an investment over a specified period longer than one year, demonstrating the smoothed compounding rate."
    },
    {
      term: "Expense Ratio",
      definition: "The annual management fee charged by mutual funds and ETFs to cover administrative and operational costs, expressed as a percentage of assets under management."
    },
    {
      term: "Direct Mutual Funds",
      definition: "Direct schemes of mutual funds have lower expense ratios compared to regular funds because they do not bundle-in trailing distributor commission payouts."
    },
    {
      term: "Tax Harvesting",
      definition: "The strategic selling of securities at specific periods to utilize the annual capital gains tax tax-free limits (such as the LTCG exemption in India) to optimize net yields."
    }
  ];

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="knowledge-hub-container">
      <div className="max-w-7xl mx-auto animate-fade-in animate-duration-300">
        
        {/* Dynamic Segmented Tab Headers */}
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-white border border-slate-200 p-1.5 rounded-2xl max-w-4xl mx-auto mb-16 shadow-xs gap-1.5" id="knowledge-tab-headers">
          <button
            onClick={() => handleTabChange('journey')}
            className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'journey' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Your Journey</span>
          </button>
          
          <button
            onClick={() => handleTabChange('types')}
            className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'types' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-500" />
            <span>Mutual Fund Types 📚</span>
          </button>

          <button
            onClick={() => handleTabChange('faq')}
            className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'faq' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Concepts & FAQ</span>
          </button>

          <button
            onClick={() => handleTabChange('outlook')}
            className={`flex items-center justify-center gap-2 py-3 px-1 rounded-xl text-[12.5px] sm:text-[13.5px] font-bold transition-all cursor-pointer ${
              activeTab === 'outlook' 
                ? 'bg-[#0F172A] text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span>Strategic Essays</span>
          </button>
        </div>

        <FundFinderPromoBanner onActionClick={() => setCurrentPage?.('find-fund-type')} boxIndex={2} />

        {/* ==================== TAB 1: YOUR JOURNEY WITH US ==================== */}
        {activeTab === 'journey' && (
          <div className="space-y-16" id="journey-tab-section">
            
            {/* Immersive Vision Header */}
            <div className="text-center max-w-4xl mx-auto space-y-5">
              <span className="text-blue-700 bg-blue-50/100 border border-blue-200/80 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Core Strategy Review
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Same Investment Different Outcome --&gt; Your Decision Point for Coming 5 Years
              </h1>
              <p className="text-slate-650 max-w-3xl mx-auto font-sans text-[15.5px] sm:text-[17.5px] leading-relaxed">
                Most investors aren't losing money to market collapses directly—they are bleeding silently through unoptimized regular fees, stagnation in dead-end legacy assets, and relationship managers who prioritize cross-selling quotas over portfolio mathematical hygiene.
              </p>
            </div>

            {/* SECTION 1: INTERACTIVE CALCULATOR (THE SILENT DRAINS OF WEALTH) */}
            <div className="bg-slate-900 text-white rounded-3xl border border-slate-850 p-6 sm:p-10 shadow-lg relative overflow-hidden" id="dynamic-friction-simulator">
              {/* Background styling elements */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 blur-3xl rounded-full -mr-20 -mt-20 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 blur-3xl rounded-full -ml-20 -mb-20 pointer-events-none" />

              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                
                {/* Sliders Input Panel */}
                <div className="lg:col-span-6 space-y-6 text-left">
                  <div>
                    <span className="text-[11px] font-mono font-bold tracking-widest text-blue-400 uppercase bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                      Interactive Compounding Gap Simulator
                    </span>
                    <h3 className="text-[20px] sm:text-[23px] font-bold text-white tracking-tight mt-3">
                      Calculate the Cost of Traditional Financial Advice
                    </h3>
                    <p className="text-slate-350 text-[13px] leading-relaxed mt-1.5">
                      Toggle your investable capital and time horizon to see how minor fee optimizations and sector weighting shifts accumulate into massive generational wealth gaps.
                    </p>
                  </div>

                  <div className="h-px bg-slate-800" />

                  {/* Portfolio Size Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[12.5px] font-bold text-white">Total Investable Capital</label>
                      <span className="text-white font-mono font-extrabold text-[15px] bg-blue-900/60 px-3 py-0.5 rounded border border-blue-500/30">
                        {formatCurrencyINR(portfolioSize)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min={1000000} // 10 Lakhs
                      max={50000000} // 5 Crores
                      step={500000}
                      value={portfolioSize}
                      onChange={(e) => setPortfolioSize(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none bg-white cursor-pointer accent-blue-550 border border-slate-300"
                    />
                    <div className="flex justify-between text-[11px] text-white font-mono font-bold">
                      <span>₹10 Lakhs</span>
                      <span>₹2.5 Crores</span>
                      <span>₹5 Crores</span>
                    </div>
                  </div>

                  {/* Horizon Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[12.5px] font-bold text-white">Investment Timeline</label>
                      <span className="text-white font-mono font-extrabold text-[15px] bg-amber-950/60 px-3 py-0.5 rounded border border-amber-500/30">
                        {horizonYears} Years
                      </span>
                    </div>
                    <input
                      type="range"
                      min={3}
                      max={20}
                      step={1}
                      value={horizonYears}
                      onChange={(e) => setHorizonYears(Number(e.target.value))}
                      className="w-full h-2 rounded-lg appearance-none bg-white cursor-pointer accent-amber-500 border border-slate-300"
                    />
                    <div className="flex justify-between text-[11px] text-white font-mono font-bold">
                      <span>3 Years (Short-term)</span>
                      <span>10 Years</span>
                      <span>20 Years (Legacy planning)</span>
                    </div>
                  </div>
                </div>

                {/* Output Comparison Panel */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* The Compounding Gap Metric Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 text-center">
                    <span className="text-[10px] font-mono tracking-widest text-[#EAB308] font-bold uppercase">
                      THE COMPREHENSIVE RECOVERY POTENTIAL
                    </span>
                    
                    <div className="space-y-1">
                      <p className="text-[40px] sm:text-[48px] font-extrabold font-display text-emerald-400 leading-none tracking-tight">
                        {formatCurrencyINR(compoundingGap)}
                      </p>
                      <p className="text-[13px] text-slate-200 font-bold">
                        Additional Potential Wealth Saved & Compounded
                      </p>
                    </div>

                    <div className="h-px bg-slate-900" />

                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div className="border-r border-slate-850 pr-2">
                        <span className="text-[10.5px] text-slate-350 font-mono font-bold block uppercase">AVERAGE FIRM / RM</span>
                        <span className="text-[15px] font-mono font-bold text-slate-200 mt-1 block">
                          {formatCurrencyINR(regularCompoundedValue)}
                        </span>
                        <span className="text-[10.5px] text-red-400 font-bold block mt-0.5">Assumed 14.5% CAGR</span>
                      </div>
                      <div className="pl-2">
                        <span className="text-[10.5px] text-emerald-400 font-mono font-bold block uppercase">PURE WEALTH WAY</span>
                        <span className="text-[15px] font-mono font-bold text-emerald-300 mt-1 block font-sans">
                          {formatCurrencyINR(optimizedCompoundedValue)}
                        </span>
                        <span className="text-[10.5px] text-emerald-400 font-bold block mt-0.5">Assumed 18.4% Optimal</span>
                      </div>
                    </div>
                    
                    <p className="text-[11.5px] text-slate-500 font-sans leading-relaxed text-center italic">
                      "Optimal compounding is not about chasing reckless volatile peaks; it is the math of eliminating needless drag and holding high-conviction rising segments."
                    </p>
                  </div>

                </div>

              </div>
            </div>

            {/* STRATEGIC ALIGNMENT (NOT IF VS IF) */}
            <div className="space-y-10 py-8" id="strategic-fit-framework">
              <div className="text-center max-w-4xl mx-auto space-y-4">
                <span className="text-blue-700 bg-blue-50 border border-blue-200 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Strategic Alignment Check
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-4.5xl text-slate-950 tracking-tight leading-tight">
                  We Do Not Guarantee for Highest Return from Market.<br />
                  <span className="text-blue-700">We Promise for Optimal Risk Adjusted Returns possible.</span>
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-[14px] sm:text-[15px]">
                  Wealth accumulation is a rigorous operational procedure, not a gaming stadium. Let us establish immediate alignment on what you can expect from our registered distribution relationship.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* WE ARE NOT IF */}
                <div className="bg-[#FFF5F5] border border-red-100/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100/70 flex items-center justify-center shrink-0">
                      <XCircle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-red-900 tracking-tight">We Are Not For You If —</h4>
                      <p className="text-[10px] text-red-600 font-mono font-bold">SPECULATIVE & HAZARDOUS GOALS</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-[13px] text-slate-700 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Looking to <strong>2x or 10x money in 1-2 Years</strong> (Get Rich Quick speculative trap)</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Believing we can catch every major volatile move in the global market</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span><strong>Gambling capital</strong> on high-stress Options and Intraday Trading</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Expecting a 100% rigid guarantee for the absolute highest returns every year</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Seeking <strong>thrill and excitement</strong> from rapid buying and selling of investments</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Trying to perfectly time the market to buy absolute low and sell absolute high</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Having sleepless nights due to high leverage gambling in individual stocks & options</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Wanting to make your broker or transactional agent rich from bloated fees and churn</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Hoping to generate daily, unstable livelihood income from short-term trading</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                      <span>Addicted to tracking security prices daily and changing portfolio allocations monthly</span>
                    </li>
                  </ul>
                </div>

                {/* WE ARE IF */}
                <div className="bg-[#F0FDF4] border border-emerald-100/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100/70 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[16px] text-emerald-950 tracking-tight">We Are For You If —</h4>
                      <p className="text-[10px] text-emerald-700 font-mono font-bold">DURABLE WEALTH MULTIPLICATION</p>
                    </div>
                  </div>

                  <ul className="space-y-3.5 text-[13px] text-slate-705 font-sans">
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span><strong>Looking to create systematic wealth</strong> from disciplined long-term investments</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Committed to staying invested for a minimum healthy timeline of <strong>3-5 years</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Wanting exposure to vetted growth opportunities in India & Global Markets</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Desiring to diversify funds through a scientific <strong>Strategic Allocation Framework</strong></span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span><strong>Sleeping tension-free</strong> knowing your hard-earned capital is fully diversified as per your risk appetite</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Valuing a clean personalized strategy with 100% upfront disclosure of commissions & fees</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Appreciating <strong>dedicated support</strong> at every level, from planning through redemption</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Demanding simple, elegant, and understandable tracking dashboards & reports</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-2 shrink-0" />
                      <span>Wanting to ensure you have <strong>ample fallback capital</strong> when in a real financial problem</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Impatient to Patient Quote representation */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-2xl mx-auto text-center space-y-2.5 shadow-md">
                <span className="text-[10px] font-mono tracking-widest text-[#EAB308] font-bold uppercase">
                  THE RULE OF WISDOM
                </span>
                <p className="text-[15px] sm:text-[16px] text-white font-serif italic leading-relaxed">
                  "The stock market is a device for transferring money from the impatient to the patient."
                </p>
                <p className="text-[11px] text-slate-400 font-mono font-bold">
                  — Warren Buffett, Chairman of Berkshire Hathaway
                </p>
              </div>
            </div>

            {/* SECTION 2: SIDE-BY-SIDE ARCHITECTURAL COMPARISON */}
            <div className="space-y-8" id="architectural-comparison">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <h2 className="font-display font-bold text-2xl sm:text-3.5xl text-slate-900 tracking-tight">
                  How Are We Different? Side-by-Side Breakdown
                </h2>
                <p className="text-slate-500 text-[14px]">
                  Transparency is our highest registration standard. Let us outline exactly physical operations contrast.
                </p>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-xs">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-mono">
                      <th className="p-4 sm:p-5">Strategic Parameter</th>
                      <th className="p-4 sm:p-5 bg-red-950/20 text-red-300 border-l border-red-900/20">The Competitor / Standard RM Route</th>
                      <th className="p-4 sm:p-5 bg-blue-950 text-blue-300 border-l border-slate-800">The Pure Wealth Global Model</th>
                    </tr>
                  </thead>
                  <tbody className="text-[13px] sm:text-[13.5px] text-slate-705 divide-y divide-slate-100">
                    
                    {/* Parameter 1 */}
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 max-w-[180px]">
                        Fee Load & Expense Ratio Alignment
                      </td>
                      <td className="p-4 sm:p-5 bg-red-50/20 text-slate-650 border-l border-red-50">
                        <div className="flex gap-2 items-start">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Unmonitored Regular Units (~1.80% - 2.40% fees)</p>
                            <p className="text-[11.5px] text-slate-450 mt-1 leading-relaxed">
                              Push high-commission fund schemes of the exact same product because standard RMs have daily internal cross-sell points and revenue goals.
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 bg-blue-50/5 text-slate-700 border-l border-slate-100">
                        <div className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-950">Strategic Code Optimization (~0.75% - 1.25% fees)</p>
                            <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed">
                              We are AMFI ARN Distributors—yes, we earn trailing commissions, but we audit and select lower expense schemes to maximize your take-home compounding.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Parameter 2 */}
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 max-w-[180px]">
                        Underperformance Auditing
                      </td>
                      <td className="p-4 sm:p-5 bg-red-50/20 text-slate-650 border-l border-red-50">
                        <div className="flex gap-2 items-start">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Passive "Set & Forget" Custody</p>
                            <p className="text-[11.5px] text-slate-450 mt-1 leading-relaxed">
                              Fail to run systemic quality checks. Structural performance decay or stagnant legacy capital sits in portfolios unchecked for years.
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 bg-blue-50/5 text-slate-700 border-l border-slate-100">
                        <div className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-950">Dynamic Exit & Trim Scrubbing</p>
                            <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed">
                              Systematic rolling performance tests instantly trigger trim/exit metrics on chronic laggards, converting stale capital back to active work.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Parameter 3 */}
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 max-w-[180px]">
                        Sector Allocations & Weightage
                      </td>
                      <td className="p-4 sm:p-5 bg-red-50/20 text-slate-650 border-l border-red-50">
                        <div className="flex gap-2 items-start">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Generic Over-Diversification</p>
                            <p className="text-[11.5px] text-slate-450 mt-1 leading-relaxed">
                              Overwhelming portfolios with 25+ overlapping mutual funds, creating a costly, heavily bloated setup that barely mimics flat index rates.
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 bg-blue-50/5 text-slate-700 border-l border-slate-100">
                        <div className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-950">High-Conviction Concentrated Weighting</p>
                            <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed">
                              Strictly focused structures (focused, large, select global ETFs) utilizing macro overlays to place weightings in high-performing demographic segments.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>

                    {/* Parameter 4 */}
                    <tr>
                      <td className="p-4 sm:p-5 font-bold text-slate-900 max-w-[180px]">
                        Macro Sector Positioning
                      </td>
                      <td className="p-4 sm:p-5 bg-red-50/20 text-slate-650 border-l border-red-50">
                        <div className="flex gap-2 items-start">
                          <XCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-800">Trend chasing at market peaks</p>
                            <p className="text-[11.5px] text-slate-450 mt-1 leading-relaxed">
                              Advising entry into sectors *after* they have already rallied 100%, causing clients to capture the massive structural correction phase.
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 sm:p-5 bg-blue-50/5 text-slate-700 border-l border-slate-100">
                        <div className="flex gap-2 items-start">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                          <div>
                            <p className="font-semibold text-slate-950">Proactive Structural Positioning</p>
                            <p className="text-[11.5px] text-slate-550 mt-1 leading-relaxed">
                              Continuous analysis of state budget directions, digital public infrastructure rollouts, and global fund channels to invest *before* sector peaks.
                            </p>
                          </div>
                        </div>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* SECTION 3: STORIES OF OUR HEROES */}
            <div className="space-y-10" id="stories-of-our-heroes">
              
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-amber-700 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-wider inline-flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-500" /> Research Proof Cases
                </span>
                <h2 className="font-display font-extrabold text-2xl sm:text-4.5xl text-slate-950 tracking-tight">
                  Stories of Our Heroes: How We Cured Capital
                </h2>
                <p className="text-slate-650 text-[14px] sm:text-[15px]">
                  Behind every high-conviction decision is an intensive quantitative audit. Here are our legendary allocations demonstrating how our strategic framework finds and maintains value.
                </p>
              </div>

              {/* Bento Grid layout of Hero Stories */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Hero Case 1: Tata Focused Equity Fund */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between text-left">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider bg-blue-50 text-blue-700 px-2.5 py-1 rounded">
                          TACTICAL LOCAL ROTATION COMPONENT
                        </span>
                        <h4 className="font-display font-bold text-[19px] text-slate-900 tracking-tight mt-2.5">
                          Tata Focused Equity Mutual Fund Case
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-600 block">18.4% CAGR</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">5-Year Average</span>
                      </div>
                    </div>

                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      <strong>How We Found & Why We Allocated:</strong> In late 2021, broad Indian benchmarks were heavily saturated by struggling commodity stocks. Our quantitative multi-factor screening identified a massive divergence: India's Digital Public Infrastructure (UPI layers, corporate SaaS hubs) was generating supernormal cash flows. 
                    </p>
                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      We identified that the <strong>Tata Focused Mutual Fund</strong> concentrated over 32% of its micro-weight allocation specifically into debt-free software leaders with negative working capital requirements. While other managers diversified into lagging banking counters, our strategic weightage stayed positioned in this key digital expansion.
                    </p>
                  </div>

                  {/* Recharts Chart for Tata Focused Fund outperformance */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mt-4 font-mono">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-700">Growth of ₹100,000 Over 5 Years</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-blue-600 inline-block rounded-full"></span> Pure Wealth Way</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-slate-300 inline-block rounded-full"></span> Standard Index</span>
                      </div>
                    </div>
                    
                    <div className="h-[180px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={tataStoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorPureWealth" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="year" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" width={50} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [formatCurrencyINR(Number(value)), '']}
                          />
                          <Area type="monotone" dataKey="PureWealthRoute" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorPureWealth)" />
                          <Area type="monotone" dataKey="BenchmarkIndex" stroke="#94A3B8" strokeWidth={1.5} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Hero Case 2: Global S&P 500 Index Shield (Volatility Protected) */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between text-left">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded">
                          GLOBAL MULTI-CURRENCY ASSET SHIELD
                        </span>
                        <h4 className="font-display font-bold text-[19px] text-slate-900 tracking-tight mt-2.5">
                          The Dynamic Global Index Buffer (iShares S&P 500)
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-600 block">-35% Volatility</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Max Drawdown Cushion</span>
                      </div>
                    </div>

                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      <strong>How We Found & Why We Allocated:</strong> In Q2 2022, emerging markets faced a massive double risk combination: localized currency depreciation against the USD plus heavy inflationary pressure on domestic raw inputs. Typical Indian wealth managers left multi-asset clients completely exposed to pure Indian large-caps.
                    </p>
                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      Our multi-asset framework flagged this currency risk early. We systematically mapped out an overseas currency hedge by allocating 20% weight directly into the <strong>iShares S&P 500 UCITS ETF</strong>. This buffered capital securely, generating dollar-appreciating returns with zero local stock correlations, completely insulating the portfolio.
                    </p>
                  </div>

                  {/* Recharts Chart for Global index buffer cushion */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mt-4 font-mono">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-700">Volatility Control During Global Correction (24M Study)</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-emerald-600 inline-block rounded-full"></span> Global Shield</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-slate-350 inline-block rounded-full"></span> Peer Basket Avg</span>
                      </div>
                    </div>
                    
                    <div className="h-[180px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={globalShieldData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} stroke="#D8E2DC" />
                          <YAxis tick={{ fontSize: 9, fill: '#64748B' }} stroke="#D8E2DC" width={50} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [formatCurrencyINR(Number(value)), '']}
                          />
                          <Line type="monotone" dataKey="GlobalShield" stroke="#10B981" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="PeerAvgBasket" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Hero Case 3: Silver Tactical Hedge */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between text-left">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider bg-orange-50 text-orange-700 px-2.5 py-1 rounded">
                          COMMODITY & PRECIOUS METALS CORNER
                        </span>
                        <h4 className="font-display font-bold text-[19px] text-slate-900 tracking-tight mt-2.5">
                          Silver Industrial & Solar Allocation Play
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-600 block">74.6% Returns</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">3-Year Strategic Hold</span>
                      </div>
                    </div>

                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      <strong>How We Found & Why We Allocated:</strong> In early 2023, broad macro research showed that global solar panel production (photovoltaic layers) and automotive electronics transitions were causing structural deficits in silver reserves. While general advice looked strictly at Gold as a defensive play, we identified Silver's massive twin-utility: combining inflation hedging with global industrial demand acceleration.
                    </p>
                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      We strategically channeled client allocations into highly liquid physical silver exchange-traded products. This proactive sector positioning successfully captured the massive price run-up as production deficits widened, securing excellent multi-year alpha while traditional metal baskets remained flat.
                    </p>
                  </div>

                  {/* Recharts Chart for Silver outperformance */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mt-4 font-mono">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-700">Growth of ₹100,000 Over 3 Years</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-amber-500 inline-block rounded-full"></span> Silver Consulting</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-slate-400 inline-block rounded-full"></span> Metal Mix Avg</span>
                      </div>
                    </div>
                    
                    <div className="h-[180px] w-full pt-2">
                       <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={silverStoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorSilver" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#D97706" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#D97706" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" width={50} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [formatCurrencyINR(Number(value)), '']}
                          />
                          <Area type="monotone" dataKey="SilverConsulting" stroke="#D97706" strokeWidth={2} fillOpacity={1} fill="url(#colorSilver)" />
                          <Area type="monotone" dataKey="PreciousMetalMix" stroke="#94A3B8" strokeWidth={1.5} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Hero Case 4: Zomato High-Conviction Equity Case */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between text-left">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider bg-red-50 text-red-650 px-2.5 py-1 rounded">
                          HIGH-CONVICTION CORE EQUITY PIVOT
                        </span>
                        <h4 className="font-display font-bold text-[19px] text-slate-900 tracking-tight mt-2.5">
                          Zomato Mid-Cap Turnaround & Profitability Capture
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-600 block">3.0x Return Multiplier</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">24-Month Active Hold</span>
                      </div>
                    </div>

                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      <strong>How We Found & Why We Allocated:</strong> In mid-2022, Zomato faced extreme retail skepticism as global liquidity dried up and critics warned against "unprofitable tech burns." Broad distributors and retail traders rushed out of the stock at historical lows near ₹50. However, our quantitative equity screen revealed a fundamental divergence.
                    </p>
                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      Our active cash flow tracking identified that contribution margins in core food delivery had quietly turned positive, whilst their newly integrated Blinkit wing was showing hyper-scale structural efficiency. We deliberately maintained high-conviction allocations. This screening captured the entire profitability transition, delivering optimal outperformance as EBITDA moved deep into the green.
                    </p>
                  </div>

                  {/* Recharts Chart for Zomato outperformance */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mt-4 font-mono">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-700">Growth of ₹100,000 Over 24 Months</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-red-600 inline-block rounded-full"></span> Zomato Core</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-slate-350 inline-block rounded-full"></span> Speculative Basket</span>
                      </div>
                    </div>
                    
                    <div className="h-[180px] w-full pt-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={zomatoStoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748B' }} stroke="#D8E2DC" />
                          <YAxis tick={{ fontSize: 9, fill: '#64748B' }} stroke="#D8E2DC" width={50} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [formatCurrencyINR(Number(value)), '']}
                          />
                          <Line type="monotone" dataKey="ZomatoPosition" stroke="#EF4444" strokeWidth={2.5} dot={false} />
                          <Line type="monotone" dataKey="SpeculativeIPOBox" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* Hero Case 5: Japan Index Play (Nikkei 225) */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs hover:border-blue-100 transition-all flex flex-col justify-between text-left">
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div>
                        <span className="text-[11px] font-mono font-bold tracking-wider bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded">
                          GLOBAL VALUATION ARBITRAGE PLAY
                        </span>
                        <h4 className="font-display font-bold text-[19px] text-slate-900 tracking-tight mt-2.5">
                          Japan Sovereign Equity Play (Nikkei 225)
                        </h4>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-600 block">61.8% Return Gain</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">3-Year Holding Period</span>
                      </div>
                    </div>

                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      <strong>How We Found & Why We Allocated:</strong> In late 2021, when domestic Indian private multiples were escalating to unsustainable levels, we looked overseas for deep-value opportunities. Our global comparative screener flagged Japan's large manufacturers trading at historically low price-to-book ratios (P/B under 1.0x).
                    </p>
                    <p className="text-slate-650 text-[13px] leading-relaxed">
                      Furthermore, Tokyo Stock Exchange reforms were actively forcing companies to reward shareholders via buybacks and dividends. We allocated part of the multi-asset buffer to Nikkei ETFs. This position insulated capital and delivered massive dollar-denominated growth, thoroughly outcompeting traditional emerging market portfolios.
                    </p>
                  </div>

                  {/* Recharts Chart for Japan outperformance */}
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 space-y-2 mt-4 font-mono">
                    <div className="flex justify-between items-center text-[10.5px]">
                      <span className="font-bold text-slate-700">Growth of ₹100,000 Over 3 Years</span>
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-indigo-600 inline-block rounded-full"></span> Nikkei Play</span>
                        <span className="flex items-center gap-1"><span className="w-2.5 h-1 bg-slate-355 inline-block rounded-full"></span> Emerging Basket</span>
                      </div>
                    </div>
                    
                    <div className="h-[180px] w-full pt-2">
                       <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={japanStoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorJapan" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" />
                          <YAxis tick={{ fontSize: 10, fill: '#64748B' }} stroke="#D8E2DC" width={50} />
                          <Tooltip 
                            contentStyle={{ fontSize: '11px', backgroundColor: '#0F172A', color: '#fff', border: 'none', borderRadius: '8px' }}
                            formatter={(value) => [formatCurrencyINR(Number(value)), '']}
                          />
                          <Area type="monotone" dataKey="NikkeiStrategic" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorJapan)" />
                          <Area type="monotone" dataKey="EmergingMarketsMix" stroke="#94A3B8" strokeWidth={1.5} fillOpacity={0} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                </div>

                {/* SPECIAL RISK DEFENSE SHIELD: THE STRATEGY OF CRYPTO & BITCOIN AVOIDANCE */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-md hover:border-slate-750 transition-all flex flex-col justify-between text-left col-span-1 lg:col-span-2">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-wider text-amber-400 bg-amber-400/15 border border-amber-500/20 px-2.5 py-1 rounded inline-block">
                            SPECULATIVE LOSS SYSTEM PREVENTER (RISK MITIGATION)
                          </span>
                          <h4 className="font-display font-bold text-[19px] text-white tracking-tight mt-2 pb-1">
                            Why We Fully Avoided Bitcoin and Cryptocurrency Speculation
                          </h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[18px] font-bold text-emerald-400 block">100% Capital Preserved</span>
                        <span className="text-[10px] text-slate-400 block uppercase font-mono">Zero speculative exposure</span>
                      </div>
                    </div>

                    <div className="h-px bg-slate-800" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-3.5">
                        <p className="text-slate-300 text-[13.5px] leading-relaxed">
                          <strong>Our Analytical Stance:</strong> Many distributors and online platforms promote self-custody cryptocurrency slots to HNIs, selling the illusion of "exponential futuristic assets." Inside our allocation framework, capital preservation is the absolute paramount pillar. 
                        </p>
                        <p className="text-slate-300 text-[13.5px] leading-relaxed">
                          Our continuous stress testing metrics identify that cryptocurrencies fail key systemic asset preservation tests: they lack underlying sovereign yields, carry severe tax penalties with zero deductions inside local regulations, and are subject to regular exchange washouts (FTX drop, regulatory clamps).
                        </p>
                      </div>
                      <div className="space-y-3.5">
                        <p className="text-slate-300 text-[13.5px] leading-relaxed">
                          <strong>The Strategic Outcome:</strong> By implementing an absolute zero-speculation filter against Bitcoin and meme-assets, we insulated our clients during the brutal cryptomarket collapses of 2022. 
                        </p>
                        <p className="text-slate-300 text-[13.5px] leading-relaxed">
                          We redirect that defensive slice into high-grade corporate bonds and digital-infrastructure focused funds. Our clients stayed sleep-tension-free, capturing predictable compound growth instead of participating in unregulated speculative loss.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 mt-4 font-mono flex items-center gap-3">
                    <Info className="w-4 h-4 text-amber-500 shrink-0" />
                    <p className="text-[11.5px] text-slate-300 leading-relaxed">
                      <strong>Preservation Over Sensation:</strong> We preserve and expand generational wealth. Chasing unregulated speculative crypto trends is a hazard to security and contradicts our optimal risk-adjusted mandate.
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* SECTION 4: THE QUANTITATIVE SCREENING FRAMEWORK */}
            <div className="bg-white border border-slate-200/65 rounded-3xl p-6 sm:p-10 shadow-sm text-left space-y-8" id="screener-framework">
              <div className="max-w-3xl space-y-2">
                <span className="text-blue-700 bg-blue-50 px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider font-mono">
                  SOPHISTICATED STRATEGY FLOW
                </span>
                <h3 className="font-display font-extrabold text-2xl sm:text-3.5xl text-slate-900 tracking-tight">
                  Our Quantitative Allocation Screening Mechanism
                </h3>
                <p className="text-slate-550 text-[13.5px] leading-relaxed">
                  We don't rely on random star-ratings or subjective opinions. Every single fund included in our educational analysis models goes through a rigorous four-layer algorithmic audit.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 sm:gap-8 relative" id="framework-diagram-steps">
                
                {/* Step 1 */}
                <div className="space-y-3 relative group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-550 text-white flex items-center justify-center font-display font-bold text-[18px] bg-slate-900 shadow-sm group-hover:bg-blue-650 transition-colors">
                    01
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-900">Cost & Expense Scrubbing</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Filter out 2500+ available mutual funds to instantly delete regular plans carrying predatory expense loads and unvetted overhead charges.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="space-y-3 relative group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-550 text-white flex items-center justify-center font-display font-bold text-[18px] bg-slate-900 shadow-sm group-hover:bg-blue-650 transition-colors">
                    02
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-900">Fundamental Stress Test</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Audit rolling historical CAGRs, standard deviation patterns, manager retention ratios, and underlying corporate debt-to-equity levels of target assets.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="space-y-3 relative group">
                  <div className="w-12 h-12 rounded-2xl bg-blue-550 text-white flex items-center justify-center font-display font-bold text-[18px] bg-slate-900 shadow-sm group-hover:bg-blue-650 transition-colors">
                    03
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-900">Macro Sector Overlay</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Map current macroeconomic cycles, analyzing government fiscal expansion plans, global capital flows, and demographic consumption triggers.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="space-y-3 relative group">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-display font-bold text-[18px] shadow-sm group-hover:bg-emerald-700 transition-colors">
                    04
                  </div>
                  <h4 className="font-bold text-[15px] text-slate-900">Optimal Weight Formulation</h4>
                  <p className="text-slate-500 text-[12px] leading-relaxed">
                    Optimize investment sizing to buffer localized market drawdowns while preserving compounding traction, customized to your time horizon.
                  </p>
                </div>

              </div>

            </div>

            {/* SECTIONS 5: PERSUASIVE AND FOMO ALIGNED CALL TO ACTION */}
            <div className="bg-slate-950 border border-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 relative overflow-hidden shadow-xl" id="journey-cta-block">
              {/* Decorative radial spotlight */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 max-w-3xl mx-auto space-y-6">
                
                <span className="text-[11px] font-mono tracking-widest text-[#EAB308] font-bold uppercase bg-amber-500/15 border border-amber-500/25 px-4 py-1.5 rounded-full inline-block">
                  Compounding Wait Penalty Alert
                </span>
                
                <h3 className="font-display font-bold text-3xl sm:text-4.5xl leading-tight text-white tracking-tight">
                  Stop Bleeding Returns. Secure Your Compliant Consultation Today.
                </h3>
                
                <p className="text-slate-400 text-[14px] sm:text-[15.5px] leading-relaxed">
                  Every month your portfolio remains structured inside sub-optimalregular fund classes under unmonitored RM channels can cost you thousands in lost terminal value. Our ARN certified consulting team specializes in mapping and rebalancing NRI and HNI wealth safely, with focus on optimal, risk-adjusted yield.
                </p>

                <div className="bg-slate-900/60 border border-slate-850 p-4.5 rounded-2xl text-[12.5px] text-slate-400 flex items-center justify-center gap-2.5 max-w-2xl mx-auto flex-wrap">
                  <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0" />
                  <span>
                    <strong>ARN-306022 Registered Mutual Fund Distributor:</strong> Fully certified and bound by the AMFI regulatory Code of Conduct.
                  </span>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => setCurrentPage && setCurrentPage('connect')}
                    className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 hover:scale-[1.02] text-white text-[13.5px] font-bold py-3.5 px-8 rounded-xl transition-all shadow-md inline-flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>Schedule Free Portfolio Audit Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleTabChange('faq')}
                    className="w-full sm:w-auto border border-slate-755 hover:bg-slate-900 text-slate-300 text-[13.5px] font-bold py-3.5 px-6 rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Explore Technical FAQ</span>
                  </button>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 2: ORIGINAL CONCEPTS & FAQ ACADEMY ==================== */}
        {activeTab === 'faq' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in" id="faq-tab-section">
            
            {/* Left: Interactive FAQ explorer */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <h3 className="text-[17px] font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-650" />
                  Frequently Asked Inquiries
                </h3>
                
                {/* Clean search bar */}
                <div className="relative">
                  <Search className="absolute left-3 top-[11px] w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-60 pl-9 pr-4 py-2 text-[13px] border border-slate-200 rounded-lg focus:outline-blue-600 bg-slate-50 font-sans"
                  />
                </div>
              </div>

              {/* Filter Pills with Dark Slate/Blue minimalism */}
              <div className="flex flex-wrap gap-2" id="faq-filter-pills">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`py-1.5 px-3.5 text-[12.5px] font-bold rounded-full border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-650 hover:text-slate-950 hover:border-slate-350'
                    }`}
                  >
                    {cat === 'All' ? 'All Subjects' : cat}
                  </button>
                ))}
              </div>

              {/* Accordion List */}
              <div className="space-y-4" id="faqs-accordion">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => {
                    const isOpen = expandedFaqId === faq.id;
                    return (
                      <div 
                        key={faq.id} 
                        className={`border rounded-xl transition-all ${
                          isOpen ? 'bg-slate-50/50 border-blue-200' : 'border-slate-100'
                        }`}
                      >
                        <button
                          onClick={() => toggleFaq(faq.id)}
                          className="w-full text-left py-4 px-5 flex justify-between items-center gap-3 cursor-pointer select-none"
                        >
                          <span className="font-bold text-[14px] sm:text-[14.5px] text-slate-800">{faq.question}</span>
                          <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-90 text-blue-600' : ''}`} />
                        </button>
                        
                        {isOpen && (
                          <div className="px-5 pb-5 pt-1 text-[13.5px] text-slate-650 leading-relaxed border-t border-slate-100">
                            <p className="mb-3">{faq.answer}</p>
                            <span className="inline-block px-2.5 py-0.5 bg-blue-50 text-blue-850 text-[10.5px] font-mono font-bold rounded">
                              Topic: {faq.category}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 text-slate-400 font-sans">
                    No matching inquiries found. Try checking other search queries.
                  </div>
                )}
              </div>

            </div>

            {/* Right: Technical Glossary & Compliance Guide */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Box 1: Technical Glossary */}
              <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
                <h3 className="text-[16.5px] font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                  <BookMarked className="w-5 h-5 text-blue-650" />
                  Portfolio Concepts Glossary
                </h3>

                <div className="space-y-4 text-left">
                  {glossaryItems.map((item, idx) => (
                    <div key={idx} className="space-y-1">
                      <h5 className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        {item.term}
                      </h5>
                      <p className="text-[12px] text-slate-500 leading-relaxed pl-3">
                        {item.definition}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Box 2: Mutual Fund Directory Tip */}
              <div className="bg-slate-950 text-white rounded-2xl p-6 text-left space-y-4 border border-slate-900">
                <FileSpreadsheet className="w-8 h-8 text-blue-400" />
                <h4 className="font-display font-semibold text-[15.5px]">Strategic Mutual Funds Guide</h4>
                <p className="text-[11.5px] text-slate-400 leading-relaxed">
                  In India, direct investing and ongoing monitoring can be laborious for diaspora HNIs. Hence, we maintain direct distribution structures wrapping domestic high-performing funds (e.g., <strong>Tata Focused Equity Mutual Fund</strong> and <strong>Taurus Largecap Equity Fund</strong>). 
                </p>
                <p className="text-[11.5px] text-slate-400 leading-relaxed">
                  These funds pool capital under professional management, providing daily NAV reporting and absolute SEBI regulatory shelter.
                </p>
              </div>

            </div>

          </div>
        )}

        {/* ==================== TAB 3: STRATEGIC OUTLOOK & ESSAYS ==================== */}
        {activeTab === 'outlook' && (
          <div className="space-y-12 animate-fade-in" id="outlook-tab-section">
            
            {/* Top Vision Heading banner */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" /> Long-Term Wealth Masterclass
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Strategic Market Outlook & Private Essays
              </h1>
              <p className="text-slate-655 max-w-2xl mx-auto text-[14.5px] sm:text-[16px] leading-relaxed">
                High-conviction empirical studies and structural whitepapers prepared exclusively for our premium HNI and NRI consulting associates.
              </p>
            </div>

            {/* Split Pane: Left Article Selector, Right Reading Pane */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sidebar Selector pane (4/12 col) */}
              <div className="lg:col-span-4 space-y-4" id="article-sidebar">
                <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 text-left">
                  <h4 className="text-[12.5px] font-mono tracking-widest text-amber-400 font-bold uppercase font-sans">INSIGHTS LIBRARY</h4>
                  <h3 className="text-[16px] font-bold text-white tracking-tight mt-1">Select an Active Essay</h3>
                  <p className="text-[11.5px] text-slate-400 leading-relaxed mt-1">
                    Select any premium document below to load the continuous technical analysis on the reading pane.
                  </p>
                </div>

                <div className="space-y-3">
                  
                  {/* Article 1 Button card */}
                  <button
                    onClick={() => handleArticleChange('taxation')}
                    className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                      selectedArticleId === 'taxation'
                        ? 'bg-white border-blue-500 shadow-sm ring-1 ring-blue-500/10'
                        : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedArticleId === 'taxation' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">NRI CONSULTING • 6 MIN</span>
                      <h4 className="font-bold text-[13.5px] text-slate-900 leading-tight mt-1">
                        NRI Wealth Taxation & DTAA Advantage
                      </h4>
                      <p className="text-[11.5px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                        Discover NRE vs NRO structures, TDS mitigations, and Double Tax Treaty optimization.
                      </p>
                    </div>
                  </button>

                  {/* Article 2 Button card */}
                  <button
                    onClick={() => handleArticleChange('active-alpha')}
                    className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                      selectedArticleId === 'active-alpha'
                        ? 'bg-white border-emerald-500 shadow-sm ring-1 ring-emerald-500/10'
                        : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedArticleId === 'active-alpha' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">EQUITY STRATEGY • 5 MIN</span>
                      <h4 className="font-bold text-[13.5px] text-slate-900 leading-tight mt-1">
                        Active Overlays vs Passive Indexing
                      </h4>
                      <p className="text-[11.5px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                        Why generic passive indexes suffer structural drags in India compared to active core overlays.
                      </p>
                    </div>
                  </button>

                  {/* Article 3 Button card */}
                  <button
                    onClick={() => handleArticleChange('fees')}
                    className={`w-full text-left p-4.5 rounded-2xl border transition-all duration-200 cursor-pointer flex gap-4 ${
                      selectedArticleId === 'fees'
                        ? 'bg-white border-amber-500 shadow-sm ring-1 ring-amber-500/10'
                        : 'bg-white border-slate-200/60 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      selectedArticleId === 'fees' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'
                    }`}>
                      <Percent className="w-5 h-5" />
                    </div>
                    <div className="flex-grow">
                      <span className="text-[10px] font-mono font-bold text-slate-400 block uppercase">WEALTH HYGIENE • 4 MIN</span>
                      <h4 className="font-bold text-[13.5px] text-slate-900 leading-tight mt-1">
                        Cruel Regular Plan Fee Arithmetic
                      </h4>
                      <p className="text-[11.5px] text-slate-500 line-clamp-2 mt-1 leading-snug">
                        Unmasking the trailing 1.5% commission load that silently erodes 30% of legacy portfolios.
                      </p>
                    </div>
                  </button>

                </div>

                {/* Direct Share Link Copy Prompt Box */}
                <div className="bg-[#F0FDF4] border border-emerald-100 rounded-2xl p-5 text-left space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="text-[12.5px] font-bold text-emerald-950">Shareable Client Link</span>
                  </div>
                  <p className="text-[11.5px] text-emerald-800 leading-relaxed font-sans">
                    You can copy the address bar URL directly from your browser to share this specific selected essay with any select client instantly!
                  </p>
                </div>
              </div>

              {/* Main Reading Pane Content block (8/12 col) */}
              <div className="lg:col-span-8 bg-white border border-slate-200/70 rounded-3xl p-6 sm:p-10 shadow-xs text-left" id="article-reading-pane">
                
                {/* 1. NRI Wealth Taxation & DTAA Strategy */}
                {selectedArticleId === 'taxation' && (
                  <article className="space-y-6">
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-blue-600 bg-blue-50 border border-blue-200/80 px-2.5 py-1 rounded">
                        TAX & COMPLIANCE FRAMEWORK
                      </span>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3.5xl text-slate-950 tracking-tight leading-tight mt-3">
                        The NRI Wealth Taxation Matrix and the DTAA Shield Advantage
                      </h2>
                      <p className="text-slate-500 text-[13px] sm:text-[14px] font-mono font-bold mt-1.5">
                        Document ID: PWG-WP-2026-TAX-01 • Author: Pure Wealth Global Quantitative Audit
                      </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                      <p className="font-semibold text-slate-900 text-[14.5px] sm:text-[15.5px]">
                        For Non-Resident Indians (NRIs), deploying capital in the homeland without deep tax architecture awareness is a fast track to unoptimized 31.2% withholding taxes (TDS) and dual taxation drafts. Wealth management must evaluate compliance rules beforehand.
                      </p>

                      <h4 className="font-bold text-slate-900 border-l-2 border-blue-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        1. NRE vs. NRO Funds: The Fundamental Tax Separation
                      </h4>
                      <p>
                        The core banking framework splits NRI capital into two highly isolated categories:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Non-Resident External (NRE) Accounts:</strong> Designed for foreign repatriable earnings. All interest accumulated inside NRE fixed deposits or savings balances is **100% tax-free** under Indian income tax regulations. No TDS is deducted.
                        </li>
                        <li>
                          <strong>Non-Resident Ordinary (NRO) Accounts:</strong> Designed for Indian domestic earnings (such as rent, pensions, or local dividends). All interest generated inside NRO accounts carries a severe **30% flag plus cess, totaling 31.2% withholding tax (TDS) at source**.
                        </li>
                      </ul>

                      <h4 className="font-bold text-slate-900 border-l-2 border-blue-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        2. Capital Gains Taxes on Mutual Funds inside India
                      </h4>
                      <p>
                        Unlike resident Indians who pay tax only at the end of the financial year, NRIs face **withholding tax (TDS) immediately at redemption** by Indian mutual fund companies:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Equity Schemes:</strong> Short-Term Capital Gains (STCG, held under 1 year) carry **20% withholding tax**. Long-Term Capital Gains (LTCG, held over 1 year) carry **10% withholding tax** (on gains exceeding ₹1.25 Lakhs per year).
                        </li>
                        <li>
                          <strong>Debt / Multi-Asset ETFs:</strong> Taxed as per the individual's marginal tax slabs based on holding parameters, deducted automatically at source during sell-backs.
                        </li>
                      </ul>

                      <h4 className="font-bold text-slate-900 border-l-2 border-blue-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        3. The Double Taxation Avoidance Agreement (DTAA) Shield
                      </h4>
                      <p>
                        This is where high-net-worth NRIs gain the ultimate advantage. India has signed **Double Taxation Avoidance Agreements (DTAAs)** with over 85 nations, including the UAE, US, UK, Canada, and Singapore.
                      </p>
                      <p>
                        Under DTAA provisions, you are shielded against paying taxes twice:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Withholding Reduction:</strong> By submitting a Tax Residency Certificate (TRC) from your country of residence alongside Form 10F, NRO withholding rate can be legally slashed from 31.2% down to **10% or 15%** depending on treaty terms.
                        </li>
                        <li>
                          <strong>Tax Credits:</strong> Standard tax laws in the US and Canada allow you to offset taxes paid in India against your local global income tax liability.
                        </li>
                      </ul>

                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 mt-4">
                        <h5 className="font-extrabold text-slate-900 text-[13px] flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          Our Compliant NRI Operational Checklist
                        </h5>
                        <ul className="space-y-1.5 text-[12px] text-slate-600">
                          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" /> Legal upgrade of resident demats/mutual funds to NRI status immediately upon moving.</li>
                          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" /> Secure annual filing of Form 10F and Tax Residence Certificate (TRC) to enable DTAA reduced tax rates.</li>
                          <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" /> Strategic timing of tax-free LTCG harvesting (₹1,25,000 yearly threshold) to maximize compounding base.</li>
                        </ul>
                      </div>
                    </div>
                  </article>
                )}

                {/* 2. Active Overlays vs Passive Indexing */}
                {selectedArticleId === 'active-alpha' && (
                  <article className="space-y-6">
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-emerald-750 bg-emerald-50 border border-emerald-250 px-2.5 py-1 rounded">
                        EQUITY STRATEGY STUDY
                      </span>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3.5xl text-slate-950 tracking-tight leading-tight mt-3">
                        Why Generic Passive Indexing Leaves Massive Alpha on the Table in India
                      </h2>
                      <p className="text-slate-500 text-[13px] sm:text-[14px] font-mono font-bold mt-1.5">
                        Document ID: PWG-WP-2026-EQ-04 • Author: Pure Wealth Global Research Desk
                      </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                      <p className="font-semibold text-slate-900 text-[14.5px] sm:text-[15.5px]">
                        The Western trend of "set-and-forget" passive indices (such as S&P 500 ETFs) has been aggressively transplanted to the Indian market. However, the macro-structure of emerging capital markets diverges heavily from mature systems.
                      </p>

                      <h4 className="font-bold text-slate-900 border-l-2 border-emerald-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        1. The Index Congestion Draft: Why Passive Holds Deadwood
                      </h4>
                      <p>
                        In a mature market like the USA, stock pricing is hyper-efficient, making active outperformance difficult. In contrast, emerging benchmarks like India’s Nifty 50 or Sensex are highly congested by lagging legacy sectors:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Debt-Laden Heavyweight Over-allocation:</strong> Generic passive indices allocate automatic weightage purely based on market capitalization. That means underperforming conglomerates, leverage-strained private banking institutions, and stagnant commodity cyclicals occupy up to 40% of standard index fund bases.
                        </li>
                        <li>
                          <strong>Slow Sector Adaptation:</strong> Refining indices occurs only twice a year. If a major economic trend shifts (e.g., India's massive Digital Public Infrastructure, corporate SaaS acceleration, domestic defense localization), passive index funds take 12-24 months of lag before absorbing those upcoming sector leaders.
                        </li>
                      </ul>

                      <h4 className="font-bold text-slate-900 border-l-2 border-emerald-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        2. The Quantum Fact: Divergent Standard Deviations
                      </h4>
                      <p>
                        Passive investing is safe in steady, low-growth environments. In India, sector divergence is extreme. In volatile years, while standard banking indices generated barely 6.5% standard yields, high-conviction digital software, debt-free consumer leaders, and renewable infrastructure allocations advanced in excess of **18.4%-22.0% CAGR**.
                      </p>
                      <p>
                        By purchasing an index fund, you are forced to average down your returns with sub-optimal, cash-guzzling companies simply because they carry big market caps.
                      </p>

                      <h4 className="font-bold text-slate-900 border-l-2 border-emerald-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        3. The Pure Wealth High-Conviction Core Overlay Alternates
                      </h4>
                      <p>
                        Our systematic analytical mappings weed out sub-optimal assets first. We map out direct, active core overlays utilizing:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Tata Focused Equity Mutual Fund:</strong> Concentrating capital specifically on hyper-vetted, cash-flow-expanding sectors like digital software, engineering exporters, and premium consumer monopolies.
                        </li>
                        <li>
                          <strong>Taurus Largecap Value Frameworks:</strong> Underwriting portfolios to hold highly undervalued enterprises trading below their intrinsic cash reserves, capturing high asymmetrical risk-reward payoffs.
                        </li>
                      </ul>

                      <div className="bg-emerald-50/50 border border-emerald-200 p-5 rounded-2xl space-y-2 mt-4 text-emerald-950">
                        <h5 className="font-bold text-[13.5px] flex items-center gap-2">
                          <Zap className="w-4 h-4 text-emerald-700" />
                          Key Strategy Audit Insight
                        </h5>
                        <p className="text-[12px] leading-relaxed">
                          In India’s multi-decadal growth run, active sector selection is not "speculation"—it is essential risk-management. It minimizes exposure to bloated legacy counters while routing your hard-earned capital strictly into positive working-capital trendsetters.
                        </p>
                      </div>
                    </div>
                  </article>
                )}

                {/* 3. Cruel Arithmetic of Regular Plan Fees */}
                {selectedArticleId === 'fees' && (
                  <article className="space-y-6">
                    <div className="border-b border-slate-100 pb-5 text-left">
                      <span className="text-[10px] font-mono font-bold tracking-wider text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded">
                        PORTFOLIO COMPILATION COST STUDY
                      </span>
                      <h2 className="font-display font-extrabold text-2xl sm:text-3.5xl text-slate-950 tracking-tight leading-tight mt-3">
                        The Cruel Arithmetic of Regular Plan Mutual Funds and Legacy Commissions
                      </h2>
                      <p className="text-slate-500 text-[13px] sm:text-[14px] font-mono font-bold mt-1.5">
                        Document ID: PWG-WP-2026-FEE-02 • Author: Pure Wealth Global Consulting Compliance
                      </p>
                    </div>

                    <div className="prose prose-slate max-w-none text-slate-700 space-y-4 text-[13.5px] sm:text-[14.5px] leading-relaxed">
                      <p className="font-semibold text-slate-900 text-[14.5px] sm:text-[15.5px]">
                        Most high-street banks and retail relationship managers distribute mutual funds under "regular plans," often telling clients their service carries "zero charges." Inside the math of compounding, this unrevealed trail commission is a destructive wealth drain.
                      </p>

                      <h4 className="font-bold text-slate-900 border-l-2 border-amber-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        1. The Siphon Mechanics: What is a Regular Plan commission?
                      </h4>
                      <p>
                        Every mutual fund in India exists in two formats: **Direct Plans** and **Regular Plans**. Both have the exact same underlying shares, the same fund manager, and the same risk profile.
                      </p>
                      <p>
                        The only difference is the fees. Under a Regular plan, the fund house charges an extra **1.0% to 1.5% every year as a recurring trail commission** and transfers it directly to your bank distributor or RM as of right. Here is the catch:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          This trail commission is siphoned off daily from your NAV balance, regardless of whether the fund makes money or loses money.
                        </li>
                        <li>
                          Because it reduces your compounding capital base daily, it drains a massive slice of your terminal returns over long timelines.
                        </li>
                      </ul>

                      <h4 className="font-bold text-slate-900 border-l-2 border-amber-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        2. The Terminal Damage Math (For a ₹5 Crore Portfolio)
                      </h4>
                      <p>
                        Let us examine how a minor **1.5% incremental annual load** accumulates over time. If we compound a ₹5 Crore portfolio at standard Regular CAGRs (14.5%) versus Pure Wealth’s cost-scrubbed, macro-optimized active models (18.4%):
                      </p>

                      {/* Mathematical Comparative Table */}
                      <div className="overflow-x-auto my-6 border border-slate-200 rounded-xl">
                        <table className="w-full text-left text-[12px] sm:text-[13px] border-collapse">
                          <thead>
                            <tr className="bg-slate-950 text-white font-mono font-bold">
                              <th className="p-3">Timeline (Years)</th>
                              <th className="p-3">Standard Regular Plan (14.5% CAGR)</th>
                              <th className="p-3">Pure Wealth Way (18.4% Optimal)</th>
                              <th className="p-3 text-emerald-400">Compounding Gap Saved</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 bg-white text-slate-700 font-mono">
                            <tr>
                              <td className="p-3 font-sans font-bold">5 Years</td>
                              <td className="p-3">₹9.83 Crores</td>
                              <td className="p-3">₹11.63 Crores</td>
                              <td className="p-3 text-emerald-650 font-bold">+₹1.80 Crores</td>
                            </tr>
                            <tr className="bg-slate-50">
                              <td className="p-3 font-sans font-bold">10 Years</td>
                              <td className="p-3">₹19.34 Crores</td>
                              <td className="p-3">₹27.14 Crores</td>
                              <td className="p-3 text-emerald-655 font-bold">+₹7.80 Crores</td>
                            </tr>
                            <tr>
                              <td className="p-3 font-sans font-bold">15 Years</td>
                              <td className="p-3">₹38.07 Crores</td>
                              <td className="p-3">₹63.15 Crores</td>
                              <td className="p-3 text-emerald-650 font-bold">+₹25.08 Crores</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <p className="text-slate-400 italic text-[11px] font-sans">
                        *Calculations are for comparative visualization purposes based on actual difference between cost-heavy regular distribution overheads and optimized strategic routing.
                      </p>

                      <h4 className="font-bold text-slate-900 border-l-2 border-amber-600 pl-3 pt-2 text-[15px] sm:text-[16px]">
                        3. The Operational Solution: How to Stop the Drag compliant-wise?
                      </h4>
                      <p>
                        We guide NRI clients to undergo an immediate **Portfolio Cost Audit**. Our AMFI accredited team maps out:
                      </p>
                      <ul className="list-disc pl-5 space-y-1.5">
                        <li>
                          <strong>Systematic Migration Triggers:</strong> Transitioning existing legacy regular fund structures into cost-scrubbed direct formats or high-conviction focused categories without triggering excessive capital gains tax thresholds.
                        </li>
                        <li>
                          <strong>Strategic Fee Modeling:</strong> Upfront fee/commission disclosures, ending hidden trailing payouts, and establishing clean distribution models governed explicitly by AMFI conduct codes.
                        </li>
                      </ul>
                    </div>
                  </article>
                )}

              </div>

            </div>

          </div>
        )}
                      {/* ==================== TAB 4: MUTUAL FUND TYPES DICTIONARY ==================== */}
        {activeTab === 'types' && (
          <div className="space-y-12 animate-fade-in text-left" id="types-tab-section">
            
            {/* Top Header Section */}
            <div className="text-center max-w-4xl mx-auto space-y-4">
              <span className="text-emerald-700 bg-emerald-50 border border-emerald-250 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> High-Conviction Asset taxonomy
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-slate-950 tracking-tight leading-tight">
                Taxonomy of Mutual Funds & Strategic Allocation
              </h1>
              <p className="text-slate-600 max-w-2xl mx-auto text-[14.5px] sm:text-[16px] leading-relaxed">
                Explore an unmatched, detailed educational guide on mutual fund structures. Understand performance criteria, tax regimes, and holding periods before deploying active capital.
              </p>
            </div>

            {/* Core Sidebar + Details Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-7xl mx-auto">
              
              {/* Left Sidebar Layout (mimicking Groww reference) */}
              <div className="col-span-1 lg:col-span-3 bg-white border border-slate-200/85 rounded-2xl overflow-hidden shadow-xs shrink-0 self-start lg:sticky lg:top-24">
                <div className="bg-slate-50 border-b border-slate-200 px-4 py-3.5">
                  <h3 className="font-display font-black text-slate-900 text-[13px] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-700" />
                    Fund Categories
                  </h3>
                </div>
                
                <nav className="divide-y divide-slate-100 max-h-[75vh] overflow-y-auto">
                  {fundTypesCategories.map((cat) => (
                    <div key={cat.id} className="p-3 space-y-1">
                      <div className="px-3 py-1.5 text-[11px] font-mono font-bold tracking-wider text-teal-700 flex items-center gap-1.5 uppercase">
                        {getCategoryIcon(cat.icon)}
                        <span>{cat.title}</span>
                      </div>
                      <div className="space-y-1.5">
                        {cat.subTypes.map((subType) => {
                          const isSelected = selectedSubTypeId === subType.id;
                          return (
                            <button
                              key={subType.id}
                              onClick={() => handleSubTypeChange(subType.id)}
                              className={`w-full text-left px-3 py-2 rounded-xl text-[12.5px] font-medium transition-all duration-150 flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50/70 text-emerald-800 border-l-4 border-emerald-600 pl-2 shadow-2xs font-bold'
                                  : 'text-slate-650 hover:bg-slate-50 hover:text-slate-950'
                              }`}
                            >
                              <span>{subType.name}</span>
                              <ChevronRight className={`w-3 h-3 transition-transform ${isSelected ? 'translate-x-[2px] text-emerald-700' : 'text-slate-400'}`} />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </nav>
              </div>

              {/* Right Details Panel Layout */}
              <div className="col-span-1 lg:col-span-9 space-y-10" id="type-content-anchor">
                
                {(() => {
                  const currentDetail = fundTypesDetails[selectedSubTypeId] || fundTypesDetails['large-cap'];
                  return (
                    <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-10 shadow-3xs space-y-10">
                      
                      {/* 1. Category Header Banner */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-150 pb-6">
                        <div>
                          <span className="text-[10px] font-mono font-bold tracking-widest text-[#0F766E] bg-[#F0FDFA] border border-[#CCFBF1] px-3 py-1 rounded-full uppercase">
                            Class Encyclopedia • {currentDetail.category}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 mt-3 leading-tight">
                            {currentDetail.name} Deep Dive
                          </h2>
                          <p className="text-slate-500 text-[13.5px] mt-1.5 leading-relaxed max-w-xl">
                            {currentDetail.shortDesc}
                          </p>
                        </div>
                        
                        {/* Summary Metrics block */}
                        <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 flex gap-6 text-left shrink-0">
                          <div>
                            <span className="text-[10px] text-slate-450 font-mono block uppercase tracking-wider">MACAULAY TIMELINE</span>
                            <span className="text-[14px] font-extrabold text-slate-950 block mt-0.5">
                              {currentDetail.recommendedTimeline}
                            </span>
                          </div>
                          <div className="w-px bg-slate-205" />
                          <div>
                            <span className="text-[10px] text-slate-455 font-mono block uppercase tracking-wider">SHARPE RATIO</span>
                            <span className="text-[14px] font-black text-slate-95 block mt-0.5 font-mono">
                              {currentDetail.sharpeRatio}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* 2. Strategy Analysis Block */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                        
                        {/* Left: Operations and Examples */}
                        <div className="space-y-4">
                          <h4 className="text-[15px] font-black text-slate-900">Operational Mechanics</h4>
                          <p className="text-[13.5px] text-slate-650 leading-relaxed">
                            {currentDetail.howItWorks}
                          </p>
                          
                          <div className="bg-[#FFFBEB] border border-amber-100/90 rounded-2xl p-5 space-y-1">
                            <span className="text-[10.5px] font-mono tracking-wider font-extrabold text-amber-800 uppercase flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" /> Practical Asset Example
                            </span>
                            <p className="text-[12.5px] text-slate-700 leading-relaxed pt-1.5 font-sans">
                              {currentDetail.example}
                            </p>
                          </div>
                        </div>

                        {/* Right: Suitability and Alternatives */}
                        <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 space-y-6">
                          <h4 className="text-[15px] font-black text-slate-900 border-b border-slate-200 pb-2.5">Investor Suitability Matrix</h4>
                          
                          <div className="space-y-4">
                            <div>
                              <span className="text-[11px] font-mono text-emerald-700 font-bold uppercase bg-emerald-50 px-2.5 py-0.5 rounded">Who is this fund suited for?</span>
                              <ul className="space-y-1.5 text-[12.5px] text-slate-650 mt-2 list-disc pl-4.5">
                                {currentDetail.suitedFor.map((pointStr, idx) => (
                                  <li key={idx}>{pointStr}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="h-px bg-slate-200" />

                            <div>
                              <span className="text-[11px] font-mono text-red-755 font-bold uppercase bg-red-50 px-2.5 py-0.5 rounded">Who should avoid this fund?</span>
                              <p className="text-[12.5px] text-slate-650 mt-2 leading-relaxed">
                                {currentDetail.shouldAvoid}
                              </p>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100/55 p-4 rounded-2xl">
                              <span className="text-[10.5px] font-mono font-bold text-blue-800 block uppercase">Better Alternative Strategy</span>
                              <p className="text-[11.5px] text-blue-900 mt-1 leading-relaxed">
                                {currentDetail.alternative}
                              </p>
                            </div>
                          </div>
                        </div>

                      </div>

                      {/* 3. High-Contrast Key Performance KPIs */}
                      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 grid grid-cols-1 md:grid-cols-4 gap-6 text-center shadow-md">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">AVERAGE ROLLING RETURN</span>
                          <span className="text-[18px] sm:text-[21px] font-black text-emerald-450 block font-display font-mono">
                            {currentDetail.avgReturn}
                          </span>
                          <p className="text-[10px] text-slate-500">Robust historical averages</p>
                        </div>
                        
                        <div className="space-y-1 md:border-l md:border-slate-800 md:pl-4">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">SHARPE RATIO SPREAD</span>
                          <span className="text-[18px] sm:text-[21px] font-black text-amber-400 block font-display font-mono">
                            {currentDetail.sharpeRatio}
                          </span>
                          <p className="text-[10px] text-slate-500">Risk-adjusted outperformance</p>
                        </div>

                        <div className="space-y-1 md:border-l md:border-slate-800 md:pl-4">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">RECOMMENDED TARGET</span>
                          <span className="text-[18px] sm:text-[21px] font-black text-blue-400 block font-display font-mono">
                            {currentDetail.recommendedTimeline}
                          </span>
                          <p className="text-[10px] text-slate-550 font-mono font-bold">Minimum holding parameter</p>
                        </div>

                        <div className="space-y-1 md:border-l md:border-slate-800 md:pl-4">
                          <span className="text-[10px] text-slate-400 font-mono block uppercase">BENCHMARK TYPE INDEX</span>
                          <span className="text-[12px] sm:text-[13px] font-bold text-slate-200 block mt-1 truncate px-1">
                            {currentDetail.benchmark}
                          </span>
                          <p className="text-[10px] text-slate-500 mt-1">Relative tracking delta</p>
                        </div>
                      </div>

                      {/* 4. Taxation vs Expense Matters */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Taxation Block */}
                        <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-4">
                          <h4 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2.5">
                            <Percent className="w-5 h-5 text-blue-600" /> Taxation Standards
                          </h4>
                          <p className="text-[12.5px] text-slate-500 leading-relaxed">
                            Under the modern Indian Income Tax guidelines, capital gains from this mutual fund classification are declared as follows:
                          </p>
                          <p className="text-[12.5px] text-slate-700 leading-relaxed bg-white border border-slate-150 rounded-xl p-4 font-medium">
                            {currentDetail.taxes}
                          </p>
                        </div>

                        {/* Charges Block */}
                        <div className="bg-slate-50 border border-slate-150 rounded-3xl p-6 sm:p-8 space-y-4">
                          <h4 className="text-[15px] font-black text-slate-900 flex items-center gap-1.5 border-b border-slate-200 pb-2.5">
                            <AlertTriangle className="w-5 h-5 text-amber-500" /> Expense Ratios & Exit Loads
                          </h4>
                          <ul className="space-y-3.5 text-[12.5px] text-slate-700">
                            <li className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                              <span><strong>Expense Load impact:</strong> {currentDetail.expenseRatio}</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 shrink-0" />
                              <span><strong>Exit Penalty criteria:</strong> {currentDetail.exitLoad}</span>
                            </li>
                            <li className="pt-2 border-t border-slate-200/80 text-[11px] text-slate-450 italic">
                              *NRIs can consult of double-taxation avoidance treaty (DTAA) filings with our AMFI desk to unlock high-yield conversions.
                            </li>
                          </ul>
                        </div>

                      </div>

                      {/* 5. List of Vetted Schemes */}
                      <div className="space-y-4">
                        <h4 className="text-[15px] font-black text-slate-900">List of High-Conviction Certified Schemes Map</h4>
                        <p className="text-[12.5px] text-slate-500">
                          We continuously audit the entire domestic mutual fund registries. The following direct options represent premier performers evaluated under our proprietary active scorecards:
                        </p>
                        
                        <div className="border border-slate-150 rounded-2xl overflow-hidden bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                              <thead>
                                <tr className="bg-slate-50 border-b border-slate-150 text-slate-550 font-mono tracking-wider text-[10px] uppercase">
                                  <th className="p-3.5 pl-5">Vetted Scheme Name</th>
                                  <th className="p-3.5">Risk Rating</th>
                                  <th className="p-3.5">Primary Investment Focus</th>
                                  <th className="p-3.5 pr-5 text-right">3-Year CAGR Returns</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-[13px] text-slate-700">
                                {currentDetail.vettedSchemes.map((scheme, idx) => (
                                  <tr key={idx}>
                                    <td className="p-3.5 pl-5 font-bold text-slate-900">{scheme.name}</td>
                                    <td className="p-3.5">
                                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-100 rounded text-[10px] font-bold">
                                        {scheme.risk}
                                      </span>
                                    </td>
                                    <td className="p-3.5 text-slate-500 text-[12px]">{scheme.focus}</td>
                                    <td className="p-3.5 pr-5 text-right font-mono font-bold text-emerald-600">{scheme.return}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        <p className="text-[10.5px] text-slate-400 font-mono italic text-center">
                          Disclaimer: Past returns are not guarantee-laden indicators of tomorrow. Direct schemes are modeled strictly for curriculum mapping.
                        </p>
                      </div>

                      {/* 6. Accordion FAQs */}
                      <div className="space-y-4 border-t border-slate-100 pt-8">
                        <h4 className="text-[15.5px] font-black text-slate-900 flex items-center gap-2">
                          <HelpCircle className="w-5 h-5 text-emerald-700" />
                          Category FAQs: Technical Inquiries
                        </h4>
                        <div className="grid grid-cols-1 gap-4">
                          {currentDetail.faqs.map((faq, index) => {
                            const faqId = `tfaq-dyn-${index}`;
                            const isFaqExpanded = expandedTypeFaqId === faqId;
                            return (
                              <div key={index} className="border border-slate-150 rounded-2xl bg-white focus-within:ring-1 focus-within:ring-blue-500 transition-all">
                                <button
                                  onClick={() => setExpandedTypeFaqId(isFaqExpanded ? null : faqId)}
                                  className="w-full text-left py-4.5 px-6 flex justify-between items-center gap-4 cursor-pointer select-none"
                                >
                                  <span className="font-bold text-[14px] sm:text-[14.5px] text-slate-850">
                                    Q{index + 1}. {faq.q}
                                  </span>
                                  <ChevronRight className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-200 ${isFaqExpanded ? 'rotate-90 text-blue-600' : ''}`} />
                                </button>
                                {isFaqExpanded && (
                                  <div className="px-6 pb-5 text-[13.5px] text-slate-650 leading-relaxed border-t border-slate-100 pt-3">
                                    {faq.a}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                    </div>
                  );
                })()}

                {/* INFLUENTIAL CONVERSION CALL TO ACTION COMPONENT (FOR CONVERTING USERS TO CLIENTS) */}
                <div className="bg-[#0C1524] text-white rounded-3xl p-6 sm:p-10 text-left relative overflow-hidden shadow-xl border border-slate-800">
                  <div className="absolute top-0 right-0 w-84 h-84 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="relative z-10 space-y-6">
                    <span className="text-[#EAB308] bg-amber-500/10 border border-amber-500/25 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest uppercase font-bold inline-block font-sans">
                      Asset Mapping & Onboarding Channels
                    </span>
                    
                    <h3 className="font-display font-bold text-[20px] sm:text-[24px] text-white tracking-tight leading-tight">
                      Ready to Align Your Mutual Fund Portfolio Compliance-wise?
                    </h3>
                    
                    <p className="text-slate-350 text-[13px] sm:text-[14px] leading-relaxed font-sans">
                      Our certified wealth distribution desk maps your active holding coordinates to the optimal direct categories. Experience absolute fee transparency, avoid intermediary commission surcharges, and ensure complete global compliance.
                    </p>

                    {/* Interactive Bento Navigation */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                      <button
                        onClick={() => setCurrentPage?.('find-fund-type')}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left flex flex-col justify-between h-[150px] group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-405">
                            <Layers className="w-4 h-4" />
                          </div>
                          <h5 className="font-bold text-[13px] text-white mt-3 group-hover:text-emerald-400">Find Fund Type</h5>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">Verify Category <ArrowRight className="w-3 h-3" /></span>
                      </button>

                      <button
                        onClick={() => setCurrentPage?.('overlap-finder')}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left flex flex-col justify-between h-[150px] group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                            <Search className="w-4 h-4" />
                          </div>
                          <h5 className="font-bold text-[13px] text-white mt-3 group-hover:text-pink-400">Overlap Finder</h5>
                        </div>
                        <span className="text-[11px] font-bold text-pink-500 flex items-center gap-1">Scan Overlap <ArrowRight className="w-3 h-3" /></span>
                      </button>

                      <button
                        onClick={() => setCurrentPage?.('portfolio-audit')}
                        className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer text-left flex flex-col justify-between h-[150px] group"
                      >
                        <div>
                          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <h5 className="font-bold text-[13px] text-white mt-3 group-hover:text-blue-400">AI Portfolio Auditor</h5>
                        </div>
                        <span className="text-[11px] font-bold text-blue-500 flex items-center gap-1">Initiate Audit <ArrowRight className="w-3 h-3" /></span>
                      </button>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-[12px] text-slate-400">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-450 shrink-0" />
                        <span>Instant Access • Pure Direct-plan Strategy</span>
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage?.('connect')}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-5 rounded-full cursor-pointer transition-all active:scale-95 flex items-center gap-1.5 self-start"
                      >
                        <span>Start SIP Now 👍🏻✅</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        <FundFinderPromoBanner onActionClick={() => setCurrentPage?.('find-fund-type')} boxIndex={3} />

      </div>
    </div>
  );
}
