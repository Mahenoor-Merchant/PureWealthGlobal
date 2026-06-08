/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { NavPage } from '../types';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';
import { 
  ShieldCheck, 
  TrendingUp, 
  Globe2, 
  ArrowRight, 
  HelpCircle, 
  Users, 
  LineChart, 
  Briefcase, 
  CheckCircle2, 
  ArrowUpRight,
  GraduationCap,
  Laptop,
  ClipboardCheck,
  UserCheck,
  MessageSquare,
  Clock,
  RefreshCw,
  Unlock,
  Sparkles,
  Target
} from 'lucide-react';
import { TESTIMONIALS, AMFI_ARN_DETAILS } from '../data';
import FundFinderPromoBanner from './FundFinderPromoBanner';

const HEROES_DATA = [
  {
    id: 'spx500',
    ticker: 'SPX500',
    name: 'SPX500 (Oct 2022 Allocation)',
    multiplier: '2.11X (+111%)',
    chartData: [
      { date: 'Oct 22', value: 0, benchmark: 0 },
      { date: 'Jan 23', value: 12, benchmark: 5 },
      { date: 'Jul 23', value: 28, benchmark: 10 },
      { date: 'Jan 24', value: 45, benchmark: 15 },
      { date: 'Jul 24', value: 68, benchmark: 18 },
      { date: 'Jan 25', value: 82, benchmark: 22 },
      { date: 'Jul 25', value: 95, benchmark: 26 },
      { date: 'Jan 26', value: 111, benchmark: 31 },
    ]
  },
  {
    id: 'japan',
    ticker: 'Japan Index',
    name: 'Japan Index Fund (Apr 2025 Allocation)',
    multiplier: '1.82X (+82%)',
    chartData: [
      { date: 'Apr 25', value: 0, benchmark: 0 },
      { date: 'Jul 25', value: 22, benchmark: 6 },
      { date: 'Oct 25', value: 55, benchmark: 9 },
      { date: 'Jan 26', value: 82, benchmark: 12 },
    ]
  },
  {
    id: 'zomato',
    ticker: 'Zomato',
    name: 'Eternal (Zomato / Jul 2023 Allocation)',
    multiplier: '4.23X (+322.92%)',
    chartData: [
      { date: 'Jul 23', value: 0, benchmark: 0 },
      { date: 'Oct 23', value: 38, benchmark: 5 },
      { date: 'Jan 24', value: 95, benchmark: 12 },
      { date: 'Apr 24', value: 135, benchmark: 16 },
      { date: 'Jul 24', value: 178, benchmark: 19 },
      { date: 'Oct 24', value: 215, benchmark: 22 },
      { date: 'Jan 25', value: 242, benchmark: 25 },
      { date: 'Jul 25', value: 288, benchmark: 29 },
      { date: 'Jan 26', value: 322.92, benchmark: 34 },
    ]
  },
  {
    id: 'glenmark',
    ticker: 'Glenmark',
    name: 'Glenmark (Jan 2023 Entry)',
    multiplier: '6.44X (+544.27%)',
    chartData: [
      { date: 'Jan 23', value: 0, benchmark: 0 },
      { date: 'Jul 23', value: 95, benchmark: 8 },
      { date: 'Jan 24', value: 195, benchmark: 18 },
      { date: 'Jul 24', value: 298, benchmark: 23 },
      { date: 'Jan 25', value: 412, benchmark: 31 },
      { date: 'Jul 25', value: 485, benchmark: 35 },
      { date: 'Jan 26', value: 544.27, benchmark: 40 },
    ]
  },
  {
    id: 'gold',
    ticker: 'Gold ETF',
    name: 'Gold ETF (Sep 2023 Allocation)',
    multiplier: '3.03X (+203.42%)',
    chartData: [
      { date: 'Sep 23', value: 0, benchmark: 0 },
      { date: 'Jan 24', value: 35, benchmark: 6 },
      { date: 'Jul 24', value: 72, benchmark: 11 },
      { date: 'Jan 25', value: 128, benchmark: 16 },
      { date: 'Jul 25', value: 168, benchmark: 21 },
      { date: 'Jan 26', value: 203.42, benchmark: 25 },
    ]
  },
  {
    id: 'silver_etf',
    ticker: 'Silver ETF',
    name: 'Silver ETF (Sep 2023 Allocation)',
    multiplier: '5.88X (+487.78%)',
    chartData: [
      { date: 'Sep 23', value: 0, benchmark: 0 },
      { date: 'Jan 24', value: 65, benchmark: 6 },
      { date: 'Jul 24', value: 160, benchmark: 11 },
      { date: 'Jan 25', value: 275, benchmark: 16 },
      { date: 'Jul 25', value: 390, benchmark: 21 },
      { date: 'Jan 26', value: 487.78, benchmark: 25 },
    ]
  },
  {
    id: 'cnx_realty',
    ticker: 'CNX Realty',
    name: 'CNX Realty Index (Dec 2024 Entry)',
    multiplier: '1.60X (+60.39%)',
    chartData: [
      { date: 'Dec 24', value: 0, benchmark: 0 },
      { date: 'Mar 25', value: 15, benchmark: 3 },
      { date: 'Jul 25', value: 32, benchmark: 7 },
      { date: 'Oct 25', value: 48, benchmark: 9 },
      { date: 'Jan 26', value: 60.39, benchmark: 11 },
    ]
  },
  {
    id: 'nasdaq_etf',
    ticker: 'Nasdaq 100',
    name: 'Motilal Oswal Nasdaq 100 ETF (Apr 2025)',
    multiplier: '1.98X (+98.23%)',
    chartData: [
      { date: 'Apr 25', value: 0, benchmark: 0 },
      { date: 'Jul 25', value: 30, benchmark: 6 },
      { date: 'Oct 25', value: 65, benchmark: 9 },
      { date: 'Jan 26', value: 98.23, benchmark: 12 },
    ]
  },
];

interface HomeViewProps {
  setCurrentPage: (page: NavPage['id']) => void;
  setSelectedServiceId?: (serviceId: string | null) => void;
}

export default function HomeView({ setCurrentPage, setSelectedServiceId }: HomeViewProps) {
  const [selectedHero, setSelectedHero] = useState(HEROES_DATA[0]);
  const [activeExistingIndex, setActiveExistingIndex] = useState(0);
  const [activePmsIndex, setActivePmsIndex] = useState(0);
  
  const handlePageNavigation = (page: NavPage['id']) => {
    if (setSelectedServiceId) {
      setSelectedServiceId(null); // Clear selected service by default
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageNavigationAndService = (page: NavPage['id'], serviceId: string) => {
    if (setSelectedServiceId) {
      setSelectedServiceId(serviceId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900" id="home-view-container">
      
      {/* 1. Hero Spotlight Section */}
      <section className="relative overflow-hidden bg-white text-slate-900 min-h-[82vh] flex items-center pt-20 pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-100" id="hero-spotlight">
        {/* Ambient modern gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.06),transparent_45%)]" />
        <div className="absolute -left-20 top-20 w-80 h-80 bg-blue-50/10 rounded-full blur-[100px]" />
        
        <div className="max-w-7xl mx-auto w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 text-left space-y-6 flex flex-col gap-1">
            
            {/* Trust Indicator Pill */}
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full font-sans text-[12.5px] font-bold uppercase tracking-wider w-fit">
              <ShieldCheck className="w-4.5 h-4.5 shrink-0 text-blue-600" />
              AMFI Certified ARN Holder • ARN-{AMFI_ARN_DETAILS.arnNumber}
            </div>

            {/* Giant Display Header */}
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.10] text-slate-900">
              The smarter way to <br/>grow your <span className="text-blue-600">long-term wealth</span>.
            </h1>

            {/* Explanatory Subtext */}
            <p className="font-sans text-[16.5px] sm:text-[17.5px] text-slate-600 leading-relaxed max-w-xl">
              We design and actively manage personalized wealth portfolios for HNIs & NRIs. Built on a proven, data-driven framework to achieve higher, risk-adjusted returns with absolute transparency.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
              <button
                onClick={() => handlePageNavigation('connect')}
                className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-[13.5px] px-7 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] whitespace-nowrap"
              >
                Schedule Executive Call
                <ArrowRight className="w-3.5 h-3.5 text-blue-400" />
              </button>

              <button
                onClick={() => handlePageNavigation('find-fund')}
                className="bg-slate-100 hover:bg-slate-200 border border-slate-300/60 text-slate-700 font-semibold text-[12px] px-6 py-3.5 rounded-full transition-all duration-200 cursor-pointer text-center flex flex-col items-center justify-center gap-0.5 active:scale-[0.98] lg:min-w-[220px]"
              >
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">for Internal Team Use Only</span>
                <span>Free Tool - Exactly Which Funds To Invest</span>
              </button>

              <button
                onClick={() => handlePageNavigation('find-fund-type')}
                className="bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-semibold text-[13.5px] px-7 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] whitespace-nowrap animate-pulse-slow"
              >
                Free Tool - Find Your Fund Type
                <Target className="w-3.5 h-3.5 text-pink-100" />
              </button>
              
              <button
                onClick={() => handlePageNavigation('calculators')}
                className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-[13.5px] px-6 py-3.5 rounded-full transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-1.5 active:scale-[0.98] whitespace-nowrap"
              >
                Launch Wealth Planners
                <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              </button>
            </div>

            {/* Quick stats panel */}
            <div className="flex gap-10 mt-6 pt-6 border-t border-slate-100 font-sans font-medium">
              <div>
                <p className="text-2xl font-bold text-slate-900">₹21L+</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Assets Managed</p>
              </div>
              <div className="border-l border-slate-200"></div>
              <div>
                <p className="text-2xl font-bold text-blue-600">8+</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">HNI Families</p>
              </div>
              <div className="border-l border-slate-200"></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">15+</p>
                <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-1">Global Markets</p>
              </div>
            </div>

          </div>

          {/* Hero Right Visual Interface (Mockup Card from layout) */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <div className="absolute inset-x-0 bottom-0 top-12 bg-gradient-to-tr from-blue-500/10 to-teal-500/10 rounded-3xl blur-[40px] opacity-75" />
            
            {/* Design Mockup Data Visualizer Card */}
            <div className="relative bg-white border border-slate-100 p-8 rounded-3xl shadow-xl space-y-6 text-left">
              
              <div className="flex justify-between items-end mb-4 pb-2 border-b border-slate-50">
                <div>
                  <h3 className="font-bold text-slate-800 text-[16px]">Portfolio Performance</h3>
                  <p className="text-[10px] text-slate-400 italic font-serif uppercase tracking-widest leading-none mt-1">Market Analysis Q2 2026</p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-emerald-500 font-mono">+18.3%</span>
                </div>
              </div>

              {/* Simple CSS-only SVG Chart with Clean Design settings */}
              <svg viewBox="0 0 400 200" className="w-full h-36">
                <defs>
                  <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.2 }} />
                    <stop offset="100%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                <path d="M0 180 Q 50 160 100 130 T 200 100 T 300 50 T 400 20 L 400 200 L 0 200 Z" fill="url(#grad)" />
                <path d="M0 180 Q 50 160 100 130 T 200 100 T 300 50 T 400 20" stroke="#3B82F6" strokeWidth="3" fill="transparent" strokeLinecap="round" />
                <circle cx="300" cy="50" r="5" fill="#3B82F6" />
                <rect x="280" y="10" width="40" height="20" rx="4" fill="#0F172A" />
                <text x="285" y="24" fill="white" fontSize="10" fontWeight="bold">Peak</text>
              </svg>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Equity Exposure</div>
                  <div className="font-bold text-[14px]">64.2%</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Yield Focus</div>
                  <div className="font-bold text-[14px]">12.8%</div>
                </div>
              </div>

              {/* Active data-driven performance highlights */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center text-[12px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-50">
                  <span className="font-semibold text-slate-700">PWG Alpha Focus Model</span>
                  <span className="text-blue-600 font-bold font-mono text-[11.5px]">+18.3% (CAGR)</span>
                </div>
                <div className="flex justify-between items-center text-[12px] bg-slate-50/50 p-2.5 rounded-lg border border-slate-50">
                  <span className="font-semibold text-slate-700">Nifty 50 Index</span>
                  <span className="text-slate-500 font-bold font-mono text-[11.5px]">+14.2%</span>
                </div>
              </div>

              <div 
                onClick={() => handlePageNavigation('services')}
                className="flex items-center justify-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-[12.5px] font-bold py-2 bg-slate-50 rounded-xl hover:bg-slate-100 border border-slate-100"
              >
                Explore High-Performance Models
                <ArrowUpRight className="w-4 h-4 text-blue-600" />
              </div>

            </div>

          </div>

        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => handlePageNavigation('find-fund')} boxIndex={1} />

      {/* 2. Target Investor Audiences Grid */}
      <section className="py-20 bg-[#F8FAFC] border-b border-slate-100" id="target-audiences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              Who We Serve
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
              Grow Your Wealth Like the Top 1%
            </h2>
            <p className="text-slate-600 mt-3 font-sans text-[15px] sm:text-[16.5px]">
              Stop letting inflation eat your hard-earned savings. Learn how elite investors are quietly routing capital into India's highest-conviction strategies before the next major market run.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-stretch">
            
            {/* Box 1: Non-Resident Indian (NRI) Solutions */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between text-left hover:border-blue-200 transition-all">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[22px] text-slate-900">NRI Wealth Solutions</h3>
                  <p className="text-slate-400 font-semibold text-[13px] uppercase mt-1 tracking-wider">GCC, Singapore, US & UK NRI Focus</p>
                </div>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  We bridge geographic distances by handling comprehensive banking setups for NRIs. Access clean Indian capital markets with 100% regulatory compliance.
                </p>
                <ul className="space-y-3 pt-2 text-[13.5px] text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>NRE / NRO bank account setup assistance</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>In-bound tax audit & Double Tax avoidance alignment (DTAA)</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Fully digital remote onboarding and KYC submission</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handlePageNavigationAndService('services', 'srv-2')}
                className="mt-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-[13.5px] font-bold cursor-pointer w-fit group"
              >
                Explore NRI Wealth Roadmap
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            {/* Box 2: High Net Worth (HNI) Family Office Needs */}
            <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-10 shadow-sm flex flex-col justify-between text-left hover:border-blue-200 transition-all">
              <div className="space-y-6">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-[22px] text-slate-900">HNI & Family Office Mandates</h3>
                  <p className="text-slate-400 font-semibold text-[13px] uppercase mt-1 tracking-wider">Generational Protection & Growth</p>
                </div>
                <p className="text-slate-600 text-[14px] leading-relaxed">
                  For Ultra-HNIs and family units seeking structured succession and compliance. We formulate portfolios mirroring your ethical thresholds without compromising yield benchmarks.
                </p>
                <ul className="space-y-3 pt-2 text-[13.5px] text-slate-600">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Private custom equity mandates under strict audited filters</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Wealth inheritance, Estate shielding, and family trusts setups</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <span>Dedicated senior investment consultant point-of-contact</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handlePageNavigationAndService('services', 'srv-3')}
                className="mt-8 flex items-center gap-2 text-blue-600 hover:text-blue-700 text-[13.5px] font-bold cursor-pointer w-fit group"
              >
                Inquire Over Private Custom Mandates
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 3. Our Heroes! Section (Interactive market data visualizer matching Turtle Wealth) */}
      <section className="py-20 bg-white border-b border-slate-100 animate-fade-in text-slate-800" id="our-heroes">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-blue-700 bg-blue-50 px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              High-Conviction Alpha
            </span>
            <h2 className="font-display font-bold text-3.5xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
              Our Heroes!
            </h2>
            <p className="text-slate-650 mt-3 font-sans text-[15px] sm:text-[16px] leading-relaxed">
              Investments that have contributed meaningfully to our long-term performance and growth. See how our bespoke allocations played out in the real market.
            </p>
          </div>

          {/* Interactive Chart Container */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start mb-8">
            
            {/* Left Selection Cards - Horizontal scroll on mobile, Vertical stack on desktop */}
            <div 
              className="md:col-span-4 flex flex-row md:flex-col gap-2.5 w-full overflow-x-auto md:overflow-y-auto pb-3 md:pb-0 md:pr-2 max-h-[500px]" 
              id="heroes-picker" 
              style={{ scrollbarWidth: 'thin' }}
            >
              {HEROES_DATA.map((hero) => {
                const isActive = selectedHero.id === hero.id;
                return (
                  <button
                    key={hero.id}
                    onClick={() => setSelectedHero(hero)}
                    className={`flex-shrink-0 min-w-[130px] md:w-full p-4 text-left rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row justify-between items-start md:items-center ${
                      isActive
                        ? 'bg-blue-50/40 border-[2px] border-blue-600 shadow-sm font-semibold'
                        : 'bg-white border-slate-200 hover:border-slate-350 hover:bg-slate-50/50'
                    }`}
                  >
                    <span className="font-sans font-extrabold text-[13px] sm:text-[14px] text-slate-950 uppercase">
                      {hero.ticker}
                    </span>
                    <span className={`font-mono font-black text-[12.5px] sm:text-[13.5px] mt-1 md:mt-0 ${
                      isActive ? 'text-blue-600' : 'text-amber-700'
                    }`}>
                      {hero.multiplier}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right Interactive Graph Frame */}
            <div className="md:col-span-8 bg-white border border-slate-100 p-6 sm:p-8 rounded-3xl shadow-xs space-y-6 text-left w-full" id="gpil-chart-container">
              
              <div className="space-y-1">
                <h3 className="font-display font-bold text-[20px] sm:text-[23px] text-[#C2410C]">
                  {selectedHero.name} | {selectedHero.multiplier}
                </h3>
                
                {/* Custom Legend Labels */}
                <div className="flex items-center gap-4 text-[12px] font-bold text-slate-500 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span>{selectedHero.ticker}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-600" />
                    <span>Nifty 500</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Recharts Performance Line Chart */}
              <div className="w-full h-80 sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={selectedHero.chartData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.01}/>
                      </linearGradient>
                    </defs>
                    
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                    
                    <XAxis 
                      dataKey="date" 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      fontWeight="600" 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    
                    <YAxis 
                      stroke="#94A3B8" 
                      fontSize={11} 
                      fontWeight="600" 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}%`}
                    />
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: 'white' }}
                      labelStyle={{ color: '#94A3B8', fontWeight: 'bold' }}
                      formatter={(v: any) => [`+${v}%`, 'Cumulative Gain']}
                    />
                    
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="#10B981" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorValue)" 
                      name={selectedHero.ticker} 
                    />
                    
                    <Line 
                      type="monotone" 
                      dataKey="benchmark" 
                      stroke="#3B82F6" 
                      strokeWidth={2} 
                      dot={false} 
                      activeDot={false} 
                      name="Nifty 500" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              {/* Secondary fine print disclosure notice */}
              <div className="border-t border-slate-100 pt-4 flex flex-col gap-1">
                <p className="text-[10.5px] italic text-slate-400 font-sans leading-normal">
                  Disclaimer: Past performance does not guarantee future results. This material is not intended to be investment advice or a recommendation. Data is as on April 30, 2026.
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* 4. Portfolio Asset Classes Visualization Show (Dark Section for Premium Structural Contrast) */}
      <section className="py-20 bg-slate-950 text-white relative overflow-hidden" id="asset-classes-showcase">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.08),transparent_35%)]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <span className="text-blue-400 bg-blue-400/10 border border-blue-400/20 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              Asset Class Allocation Scope
            </span>
            <h2 className="font-display font-semibold text-3.5xl sm:text-4xl text-white mt-5 tracking-tight">
              Unified Wealth Channels in India & Global Markets
            </h2>
            <p className="text-slate-400 font-sans mt-3 text-[14px] sm:text-[15.5px]">
              We consult on compliant options across all asset channels, constructing robust portfolios targeted for long-run capital preservation and wealth creation.
            </p>
          </div>

          {/* Asset Channels 4 Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {[
              {
                title: 'Mutual Funds',
                role: 'Compound Seed',
                desc: 'Access professionally managed Indian equity funds yielding substantial localized compounding gains.',
                details: 'Highly Liquid • Daily NAV Tracking • Active Fund Management'
              },
              {
                title: 'ETFs & Gold',
                role: 'Tactical Cover',
                desc: 'Secure allocations in high-grade index ETFs along with global trackers to maintain cost and liquidity advantages globally.',
                details: 'Intraday Trading • Zero Lock-in • physical gold index backing'
              },
              {
                title: 'REITs (Real Estate)',
                role: 'Passive Yields',
                desc: 'Earn regular rentals via carefully screened Real Estate Investment Trusts, with strict fundamental audits applied to lease profiles.',
                details: 'Stable Dividend • Asset Backed • Anti-Inflation Shield'
              },
              {
                title: 'Stocks & Equities',
                role: 'Alpha Generation',
                desc: 'Invest in hand-selected compliance-audited equity models in tech, manufacturing, FMCG across NSE, BSE, NYSE, and London exchanges.',
                details: 'Dynamic Alpha • Pure Ownership • Direct Shareholder Voting Rights'
              }
            ].map((asset, index) => (
              <div 
                key={index}
                className="bg-slate-900 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between text-left hover:border-blue-500/50 transition-all duration-300"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-400 text-[11px] font-bold font-mono tracking-wider uppercase bg-blue-950/40 border border-blue-900/30 px-2 py-0.5 rounded">
                      {asset.role}
                    </span>
                  </div>
                  <h3 className="font-display font-semibold text-[18px] text-white">{asset.title}</h3>
                  <p className="text-slate-400 text-[12.5px] leading-relaxed">{asset.desc}</p>
                </div>
                
                <div className="mt-6 border-t border-slate-800 pt-4 text-[10.5px] font-mono text-slate-500 leading-normal">
                  {asset.details}
                </div>
              </div>
            ))}

          </div>

          {/* Quick interactive call out banner */}
          <div className="mt-16 bg-gradient-to-r from-blue-950/20 to-slate-900/40 border border-blue-900/30 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-left max-w-5xl mx-auto">
            <div>
              <h4 className="text-[16.5px] font-bold text-white">Interested in evaluating your current mutual funds or stock portfolios?</h4>
              <p className="text-slate-400 text-[12.5px] mt-1">We provide an in-depth portfolio review of your risk-adjusted metrics, cost factors, and ethical alignment for portfolios above ₹5 Lakhs / $6k USD.</p>
            </div>
            <button
              onClick={() => handlePageNavigation('connect')}
              className="bg-[#0F172A] border border-slate-800 hover:bg-slate-900 text-white font-semibold text-[13px] px-6 py-3 rounded-full transition-all shrink-0 cursor-pointer text-center active:scale-[0.98]"
            >
              Get Free Portfolio Audit
            </button>
          </div>

        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => handlePageNavigation('find-fund')} boxIndex={2} />

      {/* How Pure Wealth Global can help you Header (Immersive Dark Banner) */}
      <section className="bg-slate-950 py-28 text-center relative overflow-hidden" id="pwg-help-banner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.12),transparent_70%)]" />
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="font-display font-medium text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-tight">
            How Pure Wealth Global <br />can help you
          </h2>
          <p className="text-slate-400 mt-6 max-w-xl mx-auto font-sans text-sm sm:text-base tracking-wide leading-relaxed">
            Whether you are auditing your existing mutual funds or seeking high-conviction active strategies, we have automated systems to optimize your returns.
          </p>
        </div>
      </section>

      {/* How Pure Wealth Global can help you Content (Light Interactive Section) */}
      <section className="py-24 bg-white text-slate-900 border-b border-slate-100" id="pwg-help-content">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
          
          {/* Sub-section 1: Existing Investments */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left selector */}
            <div className="lg:col-span-5 text-left space-y-8">
              <div className="space-y-3">
                <span className="text-teal-600 bg-teal-50 border border-teal-100 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest font-mono">
                  Existing Investments
                </span>
                <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-none">
                  Analyse & improve <br />your current portfolio
                </h3>
              </div>

              {/* Dynamic trigger list */}
              <div className="space-y-4">
                {[
                  {
                    title: "Evaluate your portfolio v/s current market",
                    desc: "Compare your current mutual funds and equity performance against standard benchmarks to identify real underperformance trends."
                  },
                  {
                    title: "Check your portfolio for risk and diversification",
                    desc: "Analyze if your wealth is concentrated in high-risk sectors or overlapping fund themes that drain your potential."
                  },
                  {
                    title: "Get all your questions answered for free in a 1-1 call",
                    desc: "Review your portfolio data live with our expert wealth managers to formulate a target-driven reallocation roadmap."
                  }
                ].map((item, idx) => {
                  const isActive = activeExistingIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActiveExistingIndex(idx)}
                      onClick={() => setActiveExistingIndex(idx)}
                      className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "bg-slate-50 border-teal-600 shadow-3xs"
                          : "bg-white border-transparent hover:border-slate-100"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold shrink-0 ${
                          isActive ? "bg-teal-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-1.5 flex-1 w-full">
                          <h4 className={`font-sans font-bold text-[15px] sm:text-[16px] transition-colors leading-snug ${
                            isActive ? "text-slate-900" : "text-slate-500"
                          }`}>
                            {item.title}
                          </h4>
                          {isActive && (
                            <p className="text-[13px] text-slate-500 leading-relaxed animate-fade-in">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Button */}
              <button
                onClick={() => handlePageNavigation('connect')}
                className="mt-6 w-full sm:w-auto bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-[13.5px] px-8 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Review my portfolio
                <ArrowRight className="w-4 h-4 text-teal-400" />
              </button>
            </div>

            {/* Right Display Graphic inside a themed panel */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-150 p-6 sm:p-10 rounded-3xl shadow-3xs flex flex-col justify-center min-h-[460px] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient(circle_at_top_right,rgba(20,184,166,0.04),transparent_45%)" />
              
              {/* Graphic State 0: Portfolio comparison VS */}
              {activeExistingIndex === 0 && (
                <div className="space-y-6 animate-fade-in relative z-10 w-full">
                  <div className="text-center font-mono text-[10px] text-teal-650 font-bold uppercase tracking-widest bg-teal-50 border border-teal-100 px-3 py-1 rounded-full w-fit mx-auto mb-2">
                    Visual Performance Audit
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-11 items-center gap-4">
                    {/* Your Portfolio Card */}
                    <div className="sm:col-span-5 bg-white border border-slate-150 p-6 rounded-2xl shadow-3xs text-left space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-200">
                          <span className="text-lg">🧑‍💼</span>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">Your Portfolio</p>
                          <p className="text-[9.5px] text-slate-400 font-mono">ESTIMATED YIELD</p>
                        </div>
                      </div>
                      <div className="border-t border-slate-50 pt-3">
                        <p className="text-3xl font-bold text-rose-500 font-mono tracking-tight">+9.23%</p>
                        <p className="text-[10px] text-slate-400 font-sans mt-1">Slight underperformance margin</p>
                      </div>
                    </div>

                    {/* VS Circle */}
                    <div className="sm:col-span-1 flex justify-center py-2 sm:py-0">
                      <div className="w-10 h-10 rounded-full bg-slate-905 text-rose-500 font-mono font-bold text-xs flex items-center justify-center shadow-md border border-slate-800">
                        VS
                      </div>
                    </div>

                    {/* Market Benchmark Card */}
                    <div className="sm:col-span-5 bg-white border border-teal-200 p-6 rounded-2xl shadow-3xs text-left space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-teal-50 overflow-hidden flex items-center justify-center border border-teal-100 text-teal-600 font-bold text-center">
                          📊
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-[13px]">Market Benchmark</p>
                          <p className="text-[9.5px] text-teal-650 font-mono uppercase tracking-wider">NIFTY 500 ALPHA</p>
                        </div>
                      </div>
                      <div className="border-t border-teal-50/55 pt-3">
                        <p className="text-3xl font-bold text-teal-600 font-mono tracking-tight">+13.11%</p>
                        <p className="text-[10px] text-slate-500 font-sans mt-1">Opportunity gap to cover: <strong className="text-teal-600 font-bold">+3.88%</strong></p>
                      </div>
                    </div>
                  </div>

                  <p className="text-center text-[11px] text-slate-400 italic">
                    Traditional distributors trap clients in low-CAGR regular schemes instead of direct compounders.
                  </p>
                </div>
              )}

              {/* Graphic State 1: Risk & Diversification scanning */}
              {activeExistingIndex === 1 && (
                <div className="space-y-6 animate-fade-in relative z-10 text-left w-full">
                  <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs space-y-5">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-700 font-mono uppercase">Analyzing Fund Assets & Ratios</span>
                      </div>
                      <span className="text-[10.5px] text-teal-600 bg-teal-50 px-2.5 py-0.5 rounded font-mono font-bold">40+ Factor Screening</span>
                    </div>

                    <div className="space-y-3.5">
                      <div className="bg-slate-50 hover:bg-slate-100 border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-[12.5px]">Mutual Fund Overlap Index</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Holding same underlying stocks across 3 funds</p>
                        </div>
                        <span className="text-rose-600 font-bold text-[11px] bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase tracking-wider font-mono">High Risk (64%)</span>
                      </div>

                      <div className="bg-slate-50 hover:bg-slate-100 border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-[12.5px]">Hidden Direct vs Regular Commission Drain</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Yearly leak payable in distributor rebates</p>
                        </div>
                        <span className="text-rose-650 font-bold text-[11px] bg-rose-50 border border-rose-150 px-2 py-0.5 rounded font-mono uppercase">1.25% Loss</span>
                      </div>

                      <div className="bg-slate-50 hover:bg-slate-100 border border-slate-150 p-3 rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-[12.5px]">Impurities & Non-ethical Exposure</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">Tobacco & conventional finance stock allocations</p>
                        </div>
                        <span className="text-amber-600 font-bold text-[11px] bg-amber-50 border border-amber-100 px-2 py-0.5 rounded font-mono uppercase">18% Leakage</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex justify-between text-[11px] text-slate-400">
                      <span>AUTOMATED VALIDATOR ENGINE</span>
                      <strong className="text-rose-500">Unbalanced Risk Alert</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Graphic State 2: 1-1 expert advice exit/invest */}
              {activeExistingIndex === 2 && (
                <div className="space-y-6 animate-fade-in relative z-10 text-left w-full">
                  <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center font-bold">
                        💼
                      </div>
                      <div>
                        <h4 className="font-sans font-bold text-[14px] text-slate-800 leading-tight">Expert Review Dashboard</h4>
                        <p className="text-[10px] text-slate-400 font-mono">1-1 OPTIMIZATION SCHEDULER</p>
                      </div>
                    </div>
                    
                    <p className="text-[13px] text-slate-650 italic bg-slate-50 border border-slate-100 p-3 rounded-xl">
                      "Hi there! Let's eliminate underperforming funds and optimize your capital pathways for cleaner, higher-compounding returns."
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Exit list */}
                      <div className="border border-red-100 bg-red-50/[0.12] rounded-xl p-3.5 space-y-2">
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-red-500 font-mono">EXIT THESE FUNDS</span>
                        <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                          <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span> Sectoral Bank Fund
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span> High Expense Regular Scheme
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-red-500 font-bold">✕</span> Non-Performing Funds
                          </li>
                        </ul>
                      </div>

                      {/* Invest list */}
                      <div className="border border-emerald-100 bg-emerald-50/[0.12] rounded-xl p-3.5 space-y-2">
                        <span className="text-[9.5px] uppercase font-bold tracking-wider text-emerald-600 font-mono">INVEST IN THESE UNITS</span>
                        <ul className="space-y-1.5 text-[11.5px] text-slate-700">
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Concentrated Alpha Allocation
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Low-cost Global Equity ETF
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="text-emerald-500 font-bold">✓</span> Direct Growth Compounders
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <span className="text-[10px] text-slate-400 italic">For analytical purposes only. Past performance doesn't guarantee future yields.</span>
                  </div>
                </div>
              )}

            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Sub-section 2: Managed Portfolios / PMS Solutions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left selector */}
            <div className="lg:col-span-5 text-left space-y-8 lg:order-last">
              <div className="space-y-3">
                <span className="text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded text-xs font-bold uppercase tracking-widest font-mono">
                  Portfolio Strategies
                </span>
                <h3 className="font-sans font-bold text-3xl sm:text-4xl text-slate-900 tracking-tight leading-none">
                  Explore our actively <br />managed strategies
                </h3>
              </div>

              {/* Dynamic trigger list */}
              <div className="space-y-4">
                {[
                  {
                    title: "We have targeted strategies for each of your goals",
                    desc: "Whether you represent an aggressive compound-seeker or conservative yield-protector, our goal blueprint cards align to your target horizons."
                  },
                  {
                    title: "Get exposure to multiple asset classes",
                    desc: "Access robust equity vectors, secure liquidity funds, compliant REITs and physical assets safely on a single integrated system."
                  },
                  {
                    title: "Actively managed based on market conditions",
                    desc: "Skip slow decision pipelines. Our fully automated rebalancing triggers hedge during high valuations and snipes opportunities on red days."
                  }
                ].map((item, idx) => {
                  const isActive = activePmsIndex === idx;
                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setActivePmsIndex(idx)}
                      onClick={() => setActivePmsIndex(idx)}
                      className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-300 ${
                        isActive
                          ? "bg-slate-50 border-blue-600 shadow-3xs"
                          : "bg-white border-transparent hover:border-slate-100"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <span className={`flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-bold shrink-0 ${
                          isActive ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"
                        }`}>
                          {idx + 1}
                        </span>
                        <div className="space-y-1.5 flex-1 w-full">
                          <h4 className={`font-sans font-bold text-[15px] sm:text-[16px] transition-colors leading-snug ${
                            isActive ? "text-slate-900" : "text-slate-500"
                          }`}>
                            {item.title}
                          </h4>
                          {isActive && (
                            <p className="text-[13px] text-slate-500 leading-relaxed animate-fade-in">
                              {item.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handlePageNavigation('services')}
                  className="bg-[#0F172A] hover:bg-slate-800 text-white font-semibold text-[13.5px] px-8 py-3.5 rounded-full shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  View all strategies
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>
                <button
                  onClick={() => handlePageNavigation('connect')}
                  className="border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-[13.5px] px-6 py-3.5 rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Talk with us
                </button>
              </div>
            </div>

            {/* Right Display Graphic */}
            <div className="lg:col-span-7 bg-slate-50 border border-slate-150 p-6 sm:p-10 rounded-3xl shadow-3xs flex flex-col justify-center min-h-[460px] relative overflow-hidden">
              <div className="absolute inset-0 bg-radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.04),transparent_45%)" />

              {/* Graphic State 0: Goal-Based Targeted Cards */}
              {activePmsIndex === 0 && (
                <div className="space-y-6 animate-fade-in relative z-10 text-left w-full">
                  <div className="text-center font-mono text-[10px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full w-fit mx-auto mb-2">
                    Tactical Goal Blueprints
                  </div>

                  <div className="space-y-4">
                    {/* Goal Card 1 */}
                    <div className="bg-white border border-slate-150 p-4 rounded-xl flex justify-between items-center shadow-3xs transition-transform hover:scale-[1.01] duration-300">
                      <div className="space-y-1">
                        <span className="text-[8px] bg-emerald-50 text-emerald-600 font-bold px-1.5 py-0.5 rounded font-mono uppercase">HIGH convicition alpha</span>
                        <h4 className="font-bold text-slate-800 text-[13.5px]">Pure Wealth Alpha Equities</h4>
                        <p className="text-[10px] text-slate-400 leading-none">Concentrated compliance-audited equity models</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-mono">CAGR EXPECTED</p>
                        <p className="text-[15.5px] font-bold text-emerald-600 font-mono">+21.2%</p>
                      </div>
                    </div>

                    {/* Goal Card 2 */}
                    <div className="bg-white border border-slate-150 p-4 rounded-xl flex justify-between items-center shadow-3xs transition-transform hover:scale-[1.01] duration-300">
                      <div className="space-y-1">
                        <span className="text-[8px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded font-mono uppercase">Passive yield cover</span>
                        <h4 className="font-bold text-slate-800 text-[13.5px]">Compliant Real Estate Trusts</h4>
                        <p className="text-[10px] text-slate-450 leading-none">Quarterly rental income with purified cash flow metrics</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-mono">ANNUALIZED YIELD</p>
                        <p className="text-[15.5px] font-bold text-blue-600 font-mono">+12.8%</p>
                      </div>
                    </div>

                    {/* Goal Card 3 */}
                    <div className="bg-white border border-slate-150 p-4 rounded-xl flex justify-between items-center shadow-3xs transition-transform hover:scale-[1.01] duration-300">
                      <div className="space-y-1">
                        <span className="text-[8px] bg-amber-50 text-amber-600 font-bold px-1.5 py-0.5 rounded font-mono uppercase">safe hedging model</span>
                        <h4 className="font-bold text-slate-800 text-[13.5px]">Digital Gold ETFs & Commodities</h4>
                        <p className="text-[10px] text-slate-450 leading-none">Absolute protection against inflation & local currency depreciation</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-slate-400 font-mono">CAGR (3Y HISTORIC)</p>
                        <p className="text-[15.5px] font-bold text-amber-600 font-mono">+15.6%</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Graphic State 1: Multiple Asset Classes Badges */}
              {activePmsIndex === 1 && (
                <div className="space-y-6 animate-fade-in relative z-10 text-center w-full">
                  <span className="font-mono text-[9.5px] text-blue-600 font-bold uppercase tracking-widest bg-blue-50 border border-blue-100 px-3 py-1 rounded-full uppercase">
                    Unified Asset Allocation Wheel
                  </span>
                  
                  {/* Floating visual representation */}
                  <div className="flex flex-wrap items-center justify-center gap-3 max-w-md mx-auto pt-4 animate-fade-in">
                    <span className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-150 text-emerald-800 font-bold text-[13px] shadow-3xs hover:-translate-y-0.5 transition-transform">
                      🟢 Equities (NSE/BSE)
                    </span>
                    <span className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-150 text-blue-800 font-bold text-[13px] shadow-3xs hover:-translate-y-0.5 transition-transform">
                      🔵 Mutual Funds
                    </span>
                    <span className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-150 text-purple-800 font-bold text-[13px] shadow-3xs hover:-translate-y-0.5 transition-transform">
                      🟣 REITs (Real Estate)
                    </span>
                    <span className="px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-150 text-amber-800 font-bold text-[13px] shadow-3xs hover:-translate-y-0.5 transition-transform">
                      🟡 Gold ETFs
                    </span>
                    <span className="px-5 py-3 rounded-2xl bg-gradient-to-r from-slate-500/10 to-slate-600/10 border border-slate-200 text-slate-800 font-bold text-[13px] shadow-3xs hover:-translate-y-0.5 transition-transform">
                      ⚪ Global Indices
                    </span>
                  </div>

                  <p className="text-slate-400 text-[11.5px] max-w-xs mx-auto italic leading-normal">
                    One relationship manager helps you execute and balance allocations seamlessly across all registered Asset Management Companies (AMCs) in India.
                  </p>
                </div>
              )}

              {/* Graphic State 2: Actively managed chart rebalancing */}
              {activePmsIndex === 2 && (
                <div className="space-y-6 animate-fade-in relative z-10 text-left w-full">
                  <div className="bg-white border border-slate-150 rounded-2xl p-6 shadow-3xs space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                      <span className="text-[10px] font-bold text-slate-700 font-mono">AUTOMATED SYSTEM BALANCER</span>
                      <span className="text-[9.5px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded leading-none">ACTIVE TIMELINE</span>
                    </div>

                    <div className="space-y-3.5">
                      {/* Event 1 */}
                      <div className="flex gap-3 items-start border-l-2 border-amber-300 pl-3.5 py-0.5">
                        <div className="text-[9px] text-amber-700 bg-amber-50 font-bold font-mono px-1.5 py-0.5 rounded">MID 2025</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[12px]">Fledgling Valuations Trigger</p>
                          <p className="text-[9.5px] text-slate-400 leading-tight">Large-caps showing overvaluation. Automatically trimmed large-cap exposure by 12.0%.</p>
                        </div>
                      </div>

                      {/* Event 2 */}
                      <div className="flex gap-3 items-start border-l-2 border-emerald-500 pl-3.5 py-0.5">
                        <div className="text-[9px] text-emerald-700 bg-emerald-50 font-bold font-mono px-1.5 py-0.5 rounded uppercase">OCT 2025</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[12px]">Opportunistic Allocation Shift</p>
                          <p className="text-[9.5px] text-slate-400 leading-tight">High-conviction small-cap valuation drop detected. Automatically raised allocation by 15.5%.</p>
                        </div>
                      </div>

                      {/* Event 3 */}
                      <div className="flex gap-3 items-start border-l-2 border-blue-500 pl-3.5 py-0.5">
                        <div className="text-[9px] text-blue-700 bg-blue-50 font-bold font-mono px-1.5 py-0.5 rounded">Q1 2026</div>
                        <div>
                          <p className="font-bold text-slate-800 text-[12px]">Latest Valuation Check Balance</p>
                          <p className="text-[9.5px] text-slate-400 leading-tight">Portfolio shielding active. Outperformance maintained despite global market correction.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* 4a. Co-Founder Quote Section (Pure Wealth Global Brand positioning) */}
      <section className="py-24 bg-slate-950 text-white relative overflow-hidden" id="fomo-statement">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="space-y-8 text-center sm:text-left">
            <span className="text-blue-400 font-mono text-[11px] font-bold uppercase tracking-widest bg-blue-950/60 border border-blue-900/40 px-3 py-1 rounded-full">
              Founders' Mandate
            </span>
            <blockquote className="font-display font-medium text-2xl sm:text-3xl lg:text-4.5xl leading-tight sm:leading-snug text-slate-100">
              "Traditional wealth management is broken & you need a better way to manage your money. While your managers invest based on gut feelings or sell you high-commission products, you are losing out on premium returns. Using unbiased data-driven models, we make sure your money is always working in the right place so you never miss out on growth."
            </blockquote>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 border-t border-slate-900">
              <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/30 flex items-center justify-center font-display font-bold text-lg text-blue-400">
                ZM
              </div>
              <div className="text-center sm:text-left">
                <p className="font-display font-bold text-[16px] text-white">Zaid Merchant</p>
                <p className="text-slate-400 text-[12px] font-medium leading-none mt-1">Co-Founder, Pure Wealth Global</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4b. Pure Wealth Global vs Traditional Firms (Comparison Matrix) */}
      <section className="py-24 bg-slate-950 text-white border-b border-slate-900 relative overflow-hidden" id="comparison-matrix">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.05),transparent_50%)]" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Title block inside the dark background */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <span className="text-blue-400 font-mono text-[11px] font-bold uppercase tracking-widest bg-blue-900/30 border border-blue-800/40 px-3.5 py-1.5 rounded-full">
              Why We Are Different
            </span>
            <h2 className="font-display font-medium text-4.5xl sm:text-5.5xl lg:text-6.5xl text-white mt-6 tracking-tight leading-[1.10]">
              How Pure Wealth Global <br className="hidden sm:inline"/> does things differently
            </h2>
            <p className="text-slate-450 mt-4 max-w-xl mx-auto font-sans text-[14.5px] sm:text-[15.5px] leading-relaxed">
              We are different than traditional RM and MFDs who invest based on gut feelings or past returns. We employ a rigorous, automatic, data-driven system.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-16">

            {/* Matrix Item 1: Daily market impact tracking */}
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group border border-slate-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[13px]">
                    01
                  </span>
                  <span className="text-blue-600 font-mono text-[10px] font-bold uppercase tracking-widest">PUREWEALTH WAY</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left content description */}
                  <div className="lg:col-span-5 space-y-3.5 text-left text-slate-900">
                    <h3 className="font-sans font-bold text-2.5xl sm:text-3.5xl leading-tight tracking-tight text-slate-900">
                      We track the market’s impact on your portfolio daily
                    </h3>
                    <p className="text-slate-500 text-[13.5px] leading-relaxed">
                      Our system automatically tracks micro-level changes in market movements every single day to shield and capture yield on your custom portfolio.
                    </p>
                  </div>

                  {/* Right graphical interface */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-3xs space-y-4 relative">
                    
                    {/* Floating Speech bubbles / annotations */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[10px] font-sans pb-1">
                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-3xs flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 text-[10px] text-left">
                        <div className="w-6 h-6 rounded-full bg-blue-600/10 flex items-center justify-center text-[10px] font-bold text-blue-600">AP</div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none text-[10px]">Driven by extreme bullishness</p>
                          <p className="text-slate-400 text-[8px] mt-0.5">Automated Monitor</p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-3xs flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 text-[10px] text-left">
                        <div className="w-6 h-6 rounded-full bg-emerald-600/10 flex items-center justify-center text-[10px] font-bold text-emerald-600">RM</div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none text-[10px]">War’s GDP impact minimal</p>
                          <p className="text-slate-400 text-[8px] mt-0.5">Stability Confirmed</p>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-2.5 shadow-3xs flex items-center gap-2 transition-all duration-300 hover:-translate-y-0.5 text-[10px] text-left">
                        <div className="w-6 h-6 rounded-full bg-amber-600/10 flex items-center justify-center text-[10px] font-bold text-amber-600">SM</div>
                        <div>
                          <p className="font-bold text-slate-800 leading-none text-[10px]">Attractive small cap valuations</p>
                          <p className="text-slate-400 text-[8px] mt-0.5">Strategic Entry Note</p>
                        </div>
                      </div>
                    </div>

                    {/* Chart Container */}
                    <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-3xs relative">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-[10.5px] font-bold text-slate-700 font-mono flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          DAILY MARKET IMPACT SCANNER
                        </span>
                        <span className="text-[9.5px] text-slate-400 font-mono">AUTOMATED STATE</span>
                      </div>

                      {/* Mock Chart Line with Points */}
                      <div className="relative h-28 w-full border-b border-l border-slate-100 pt-4 pl-2">
                        {/* Smooth Line Curve */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 112" preserveAspectRatio="none">
                          <path
                            d="M 10 90 Q 70 30 140 75 T 280 25 T 390 40"
                            fill="none"
                            stroke="#2563eb"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>

                        {/* Interactive annotated dots */}
                        <div className="absolute" style={{ left: '33%', top: '64%' }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-white animate-ping absolute" />
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-white relative" />
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-sm z-10">
                            US Banking Crisis
                          </div>
                        </div>

                        <div className="absolute" style={{ left: '68%', top: '21%' }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-white animate-ping absolute" />
                          <div className="w-2.5 h-2.5 rounded-full bg-amber-600 border border-white relative" />
                          <div className="absolute top-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-sm z-10">
                            Israel Conflict
                          </div>
                        </div>

                        <div className="absolute" style={{ left: '90%', top: '35%' }}>
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500 border border-white animate-ping absolute" />
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-600 border border-white relative" />
                          <div className="absolute top-4 right-1 whitespace-nowrap bg-slate-900 text-white text-[8.5px] font-mono px-1.5 py-0.5 rounded shadow-sm z-10 font-sans">
                            India State Elections
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-450 font-mono italic">For analytical purposes only.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* VS Divider Component */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-rose-500 px-3 mx-4 shrink-0 shadow-lg">
                  VS
                </div>
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
              </div>

              {/* Traditional Card */}
              <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 text-left">
                <span className="text-slate-500 font-mono text-[9px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">Traditional Wealth firms</span>
                <p className="mt-2 font-display text-slate-400 font-medium text-[15px] sm:text-[16px] leading-relaxed">
                  Your RM is busy searching for new clients & rarely tracks your portfolio
                </p>
              </div>
            </div>

            {/* Matrix Item 2: Instant evaluations */}
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group border border-slate-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[13px]">
                    02
                  </span>
                  <span className="text-emerald-600 font-mono text-[10px] font-bold uppercase tracking-widest">PUREWEALTH WAY</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left content description */}
                  <div className="lg:col-span-5 space-y-3.5 text-left text-slate-900">
                    <h3 className="font-sans font-bold text-2.5xl sm:text-3.5xl leading-tight tracking-tight text-slate-900">
                      Instantly evaluates if your portfolio needs a change
                    </h3>
                    <p className="text-slate-500 text-[13.5px] leading-relaxed">
                      Manual portfolios drag behind because of delays. Our engine runs atomic real-time validation checks and executes instantly.
                    </p>
                  </div>

                  {/* Right graphical interface */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-3xs space-y-4 relative">
                    
                    {/* Visual model diagram representing swapping assets */}
                    <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-3xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">AUTOMATED SWAP CONTROLLER</span>
                        <span className="text-[9.5px] text-green-600 font-mono font-bold bg-green-50 px-2 py-0.5 rounded">AUTO-APPROVED</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-3 relative">
                        {/* Outperforming segment */}
                        <div className="md:col-span-4 bg-rose-50/60 border border-rose-100 rounded-xl p-3 text-left">
                          <span className="text-[8px] bg-rose-100 text-rose-700 font-bold font-mono px-1.5 py-0.5 rounded">UNDERPERFORMING LIQUIDTY</span>
                          <h4 className="font-bold text-slate-800 text-[11px] mt-1.5 leading-tight">Lagging Index Fund</h4>
                          <div className="flex justify-between items-center text-[10px] mt-2 text-slate-500">
                            <span>CAGR Trailing</span>
                            <span className="font-bold text-rose-600 font-mono">8.2%</span>
                          </div>
                        </div>

                        {/* Animated transition lane */}
                        <div className="md:col-span-3 flex flex-col items-center justify-center py-2 md:py-0">
                          <div className="text-[10px] font-bold text-slate-400 font-mono mb-1">REALLOCATED</div>
                          <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center animate-pulse">
                            <span className="text-blue-600 font-mono text-[14px]">➜</span>
                          </div>
                        </div>

                        {/* Better segment */}
                        <div className="md:col-span-4 bg-emerald-50/65 border border-emerald-100 rounded-xl p-3 text-left">
                          <span className="text-[8px] bg-emerald-100 text-emerald-700 font-bold font-mono px-1.5 py-0.5 rounded">ALPHA SECTOR SPECIFIC</span>
                          <h4 className="font-bold text-slate-800 text-[11px] mt-1.5 leading-tight">Pure Wealth Alpha Core</h4>
                          <div className="flex justify-between items-center text-[10px] mt-2 text-slate-500">
                            <span>Target CAGR</span>
                            <span className="font-bold text-emerald-600 font-mono">15.8%</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap gap-2 justify-between items-center text-[10.5px]">
                        <span className="text-slate-600 font-sans">Computed Net Improvement: <strong className="text-slate-800 font-extrabold">+7.6% CAGR</strong></span>
                        <span className="text-blue-600 font-bold font-mono text-[10px] bg-blue-50 px-2 py-0.5 rounded">Execution time: &lt; 1 sec</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-450 font-mono italic">Automatic model realignment prevents holding onto trailing funds.</span>
                    </div>

                  </div>

                </div>
              </div>

              {/* VS Divider Component */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-rose-500 px-3 mx-4 shrink-0 shadow-lg">
                  VS
                </div>
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
              </div>

              {/* Traditional Card */}
              <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 text-left">
                <span className="text-slate-500 font-mono text-[9px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">Traditional Wealth firms</span>
                <p className="mt-2 font-display text-slate-400 font-medium text-[15px] sm:text-[16px] leading-relaxed">
                  Stuck in losing funds for months because miss out on updates, works manually and act too slowly
                </p>
              </div>
            </div>

            {/* Matrix Item 3: Auto-capitalizing */}
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group border border-slate-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50 text-blue-600 font-bold font-mono text-[13px]">
                    03
                  </span>
                  <span className="text-blue-600 font-mono text-[10px] font-bold uppercase tracking-widest">PUREWEALTH WAY</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left content description */}
                  <div className="lg:col-span-5 space-y-3.5 text-left text-slate-900">
                    <h3 className="font-sans font-bold text-2.5xl sm:text-3.5xl leading-tight tracking-tight text-slate-900">
                      Automatically capitalizes on opportunities
                    </h3>
                    <p className="text-slate-500 text-[13.5px] leading-relaxed">
                      Our system automatically capitalizes on emerging market opportunities the moment they appear, before the window closes.
                    </p>
                  </div>

                  {/* Right graphical interface */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-3xs space-y-4 relative">
                    
                    {/* Visual model diagram representing automated action */}
                    <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-3xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">DYNAMIC BALANCER STATE</span>
                        <span className="text-[9.5px] text-blue-600 font-mono font-bold bg-blue-50 px-2 py-0.5 rounded">100% AUTOMATED</span>
                      </div>

                      <div className="space-y-3 text-left">
                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] leading-tight">Small-Cap Allocation Asset Mix</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Automated opportunistic increase</p>
                          </div>
                          <span className="text-emerald-600 font-bold font-mono text-[10px] bg-emerald-50 px-2 py-0.5 rounded">
                            ▲ Raised +15.5%
                          </span>
                        </div>

                        <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div>
                            <p className="font-bold text-slate-800 text-[11px] leading-tight">Overvalued Large-Cap Stocks</p>
                            <p className="text-[9px] text-slate-400 font-mono mt-0.5">Automated asset shielding risk-reduction</p>
                          </div>
                          <span className="text-rose-600 font-bold font-mono text-[10px] bg-rose-50 px-2 py-0.5 rounded">
                            ▼ Trimmed -12.0%
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>LATEST OPTIMIZATION CYCLE ACTIVE</span>
                        <span className="text-slate-600 font-bold font-sans">No RM manual actions required</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-450 font-mono italic">Continuous execution avoids missed window pitfalls due to communication delay.</span>
                    </div>

                  </div>

                </div>
              </div>

              {/* VS Divider Component */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-rose-500 px-3 mx-4 shrink-0 shadow-lg">
                  VS
                </div>
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
              </div>

              {/* Traditional Card */}
              <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 text-left">
                <span className="text-slate-500 font-mono text-[9px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">Traditional Wealth firms</span>
                <p className="mt-2 font-display text-slate-400 font-medium text-[15px] sm:text-[16px] leading-relaxed">
                  RMs need to reach out to you for every small decision
                </p>
              </div>
            </div>

            {/* Matrix Item 4: Transparency */}
            <div className="space-y-4">
              <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden group border border-slate-100">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50/40 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
                
                <div className="flex items-center gap-2.5 mb-6">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 font-bold font-mono text-[13px]">
                    04
                  </span>
                  <span className="text-emerald-600 font-mono text-[10px] font-bold uppercase tracking-widest">PUREWEALTH WAY</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  {/* Left content description */}
                  <div className="lg:col-span-5 space-y-3.5 text-left text-slate-900">
                    <h3 className="font-sans font-bold text-2.5xl sm:text-3.5xl leading-tight tracking-tight text-slate-900">
                      Transparently reports the changes and impact to you
                    </h3>
                    <p className="text-slate-500 text-[13.5px] leading-relaxed">
                      Instead of hiding costs in multi-page fine print documents, we break down absolute yields and clear transaction details instantly.
                    </p>
                  </div>

                  {/* Right graphical interface */}
                  <div className="lg:col-span-7 bg-slate-50 border border-slate-150 rounded-2xl p-4 sm:p-6 shadow-3xs space-y-4 relative">
                    
                    {/* Visual model diagram representing absolute transparency */}
                    <div className="bg-white rounded-xl p-4 border border-slate-150 shadow-3xs">
                      <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
                        <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider font-mono">TRANSPARENT CLIENT REPORT</span>
                        <span className="text-[9.5px] text-emerald-600 font-mono font-bold bg-emerald-50 px-2 py-0.5 rounded">100% DIRECT MODELS</span>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-50 border border-slate-120 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-slate-450 font-bold font-mono uppercase tracking-wider leading-none">Net Return</p>
                          <p className="text-[15px] font-bold text-slate-800 mt-2 font-mono leading-none">+18.3%</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-120 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-slate-450 font-bold font-mono uppercase tracking-wider leading-none">Hidden Comm.</p>
                          <p className="text-[15px] font-bold text-emerald-600 mt-2 font-mono leading-none">0.0%</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-120 rounded-xl p-3 text-center">
                          <p className="text-[9px] text-slate-450 font-bold font-mono uppercase tracking-wider leading-none">Management Fee</p>
                          <p className="text-[15px] font-bold text-slate-800 mt-2 font-mono leading-none">0.75%</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span>FULL STATEMENT ACCESS LIVE ON DASHBOARD</span>
                        <span className="text-emerald-600 font-bold font-sans">Clear, unshaded view</span>
                      </div>
                    </div>

                    <div className="text-center">
                      <span className="text-[10px] text-slate-450 font-mono italic">True transaction tracking and explicit fees rather than high-commission distributor structures.</span>
                    </div>

                  </div>

                </div>
              </div>

              {/* VS Divider Component */}
              <div className="flex items-center justify-center -my-2 relative z-10">
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
                <div className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-bold text-[11px] text-rose-500 px-3 mx-4 shrink-0 shadow-lg">
                  VS
                </div>
                <div className="w-full max-w-sm h-[1px] bg-slate-900" />
              </div>

              {/* Traditional Card */}
              <div className="bg-slate-900/40 rounded-2xl p-5 border border-slate-900 text-left">
                <span className="text-slate-500 font-mono text-[9px] font-bold uppercase tracking-widest bg-slate-950 border border-slate-900 px-2 py-0.5 rounded">Traditional Wealth firms</span>
                <p className="mt-2 font-display text-slate-400 font-medium text-[15px] sm:text-[16px] leading-relaxed">
                  Send you long reports that have outdated insights
                </p>
              </div>
            </div>

          </div>

        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => handlePageNavigation('find-fund')} boxIndex={3} />

      {/* Ethical Safeguards & Excluded Sectors Section */}
      <section className="py-16 bg-white border-b border-rose-50/40" id="excluded-sectors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-10 max-w-2xl mx-auto">
            <span className="text-rose-600 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
              Capital Responsibility
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-3.5xl text-slate-900 tracking-tight mt-3">
              Ethical Governance & Excluded Sectors
            </h2>
            <p className="text-slate-500 font-sans text-[13.5px] sm:text-[14px] mt-2 leading-relaxed font-medium">
              While we design diversified, competitive, and high-growth asset models for all investors, we actively help protect capital from sectors contradicting human health, equity, and sustainability metrics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              {
                title: 'Animal Killing & Cruelty',
                desc: 'Enterprises involved in commercial animal testing, non-humane food processing factories, cosmetic cruelty operations, or secondary industrial exploitation.',
                icon: '🥓',
                color: 'from-amber-500/[0.04] to-amber-500/[0.01]',
                borderColor: 'border-amber-100/60'
              },
              {
                title: 'Liquor & Tobacco',
                desc: 'Entities operating alcohol breweries, distilleries, tobacco farms, or retailers specializing in highly addictive substances or electronic nicotine delivery systems.',
                icon: '🍷',
                color: 'from-rose-500/[0.04] to-rose-500/[0.01]',
                borderColor: 'border-rose-100/60'
              },
              {
                title: 'Casinos & Gambling',
                desc: 'Businesses in physical betting, internet gambling platforms, lottery distributions, and commercial gambling sites managing high-magnitude financial hazards.',
                icon: '🎰',
                color: 'from-purple-500/[0.04] to-purple-500/[0.01]',
                borderColor: 'border-purple-100/60'
              },
            ].map((sector, index) => (
              <div 
                key={index}
                className={`bg-gradient-to-tr ${sector.color} border ${sector.borderColor} rounded-2xl p-6 text-left space-y-3.5 hover:shadow-xs transition-all duration-300 flex flex-col justify-between`}
              >
                <div className="space-y-2.5">
                  <div className="text-2xl mt-1">{sector.icon}</div>
                  <h4 className="font-sans font-bold text-[15.5px] text-slate-800 leading-snug">
                    {sector.title}
                  </h4>
                  <p className="text-slate-500 text-[12.5px] leading-relaxed">
                    {sector.desc}
                  </p>
                </div>
                <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest pt-2 flex items-center gap-1.5 border-t border-slate-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  Portfolios Excluded
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* More Than Just a Portfolio Section */}
      <section className="py-16 bg-[#FFF7F7]/60 border-b border-rose-100/55" id="more-than-portfolio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            <h2 className="font-display font-bold text-3xl sm:text-3.5xl text-slate-900 tracking-tight">
              More Than Just a Portfolio
            </h2>
            <p className="text-slate-500 font-sans text-[14px] sm:text-[15px] font-medium mt-2">
              Included with every Scheme
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                title: 'Investing Masterclass',
                icon: GraduationCap,
              },
              {
                title: 'Digital Onboarding',
                icon: Laptop,
              },
              {
                title: 'Quarterly Review',
                icon: ClipboardCheck,
              },
              {
                title: 'Dedicated Relationship Manager',
                icon: UserCheck,
              },
              {
                title: 'WhatsApp Community & Entry/Exit Notes',
                icon: MessageSquare,
              },
              {
                title: 'Anytime Access to Portfolio',
                icon: Clock,
              },
              {
                title: 'Top-Up Anytime. Complete Flexibility',
                icon: RefreshCw,
              },
              {
                title: 'Exit Anytime. No Lock-In Period',
                icon: Unlock,
              },
            ].map((item, index) => {
              const IconComponent = item.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white border border-slate-100 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col items-center justify-center text-center space-y-4 h-40"
                >
                  <div className="w-12 h-12 bg-red-50/50 rounded-xl border border-red-100/50 flex items-center justify-center text-red-500">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h4 className="font-sans font-bold text-[14px] sm:text-[14.5px] text-slate-800 leading-snug px-2">
                    {item.title}
                  </h4>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. Heart-warming Testimonials Carousel */}
      <section className="py-20 bg-[#F8FAFC]" id="testimonials">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              Endorsements & Trust
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
              Endorsed by Accredited Professionals Worldwide
            </h2>
            <p className="text-slate-600 mt-3 font-sans text-[15px] sm:text-[16px]">
              Discover why families and corporate entities in global finance select Pure Wealth Global to supervise their financial journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 text-left">
            {TESTIMONIALS.map((t) => (
              <div 
                key={t.id}
                className="bg-white border border-slate-100 p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200"
              >
                <div className="space-y-4">
                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[...Array(t.rating)].map((_, i) => (
                      <svg key={i} className="w-4.5 h-4.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-slate-600 text-[13.5px] italic leading-relaxed">
                    "{t.content}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center">
                  <div>
                    <h5 className="font-bold text-[14px] text-slate-900">{t.name}</h5>
                    <p className="text-[11.5px] text-slate-400 mt-0.5">{t.role}</p>
                  </div>
                  
                  <div className="text-right">
                    <span className="inline-block px-2.5 py-0.5 bg-slate-50 border border-slate-100 text-slate-500 font-bold font-mono rounded text-[10px] uppercase">
                      {t.residence}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">{t.location}</p>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. Pre-Footer Call to Action (Highly Minimal Slate-950 Card Overlay) */}
      <section className="bg-slate-950 text-slate-100 py-16 text-center relative overflow-hidden" id="bottom-cta">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent_65%)]" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 space-y-6">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight">
            Ready to Purify and Multi-fold Your Portfolio Returns?
          </h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-[14px] sm:text-[15.5px] leading-relaxed">
            Consolidate and align your assets. Engage our expert Investment Solutions under safe AMFI and global compliance frameworks.
          </p>
          <div className="pt-4">
            <button
              onClick={() => handlePageNavigation('connect')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[14px] px-10 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer inline-flex items-center gap-2 active:scale-[0.98]"
            >
              Request Custom Financial Plan
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
}
