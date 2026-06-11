/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Calculator, Coins, ShieldPlus, TrendingUp, Info, ArrowUpRight } from 'lucide-react';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface CalculatorsViewProps {
  setCurrentPage: (page: any) => void;
}

export default function CalculatorsView({ setCurrentPage }: CalculatorsViewProps) {
  const [activeTab, setActiveTab] = useState<'sip' | 'allocator'>('sip');

  // Calculator 1: SIP & Lump Sum State
  const [sipAmount, setSipAmount] = useState<number>(25000); // 25,000 INR
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0); // 0 INR
  const [expectedReturn, setExpectedReturn] = useState<number>(14); // 14%
  const [years, setYears] = useState<number>(15);

  // Calculator 2: Profiler Allocator State
  const [goalType, setGoalType] = useState<'wealth' | 'retirement' | 'education'>('wealth');
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('long');
  const [riskFactor, setRiskFactor] = useState<'moderate' | 'aggressive'>('aggressive');

  // SIP Math Computing
  const sipChartData = useMemo(() => {
    const data = [];
    const monthlyRate = (expectedReturn / 100) / 12;
    
    let totalInvested = lumpSumAmount;
    let totalWealth = lumpSumAmount;
    
    // Day 0
    data.push({
      year: 0,
      invested: Math.round(totalInvested),
      wealth: Math.round(totalWealth),
      gain: 0
    });

    for (let y = 1; y <= years; y++) {
      // Monthly compounding of existing sum + new monthly payments
      for (let m = 0; m < 12; m++) {
        // Add monthly contribution
        totalWealth += sipAmount;
        // Keep track of total principal invested
        totalInvested += sipAmount;
        // Compound existing wealth (including new contribution) by monthly interest rate
        totalWealth = totalWealth * (1 + monthlyRate);
      }
      
      data.push({
        year: y,
        invested: Math.round(totalInvested),
        wealth: Math.round(totalWealth),
        gain: Math.max(0, Math.round(totalWealth - totalInvested))
      });
    }
    return data;
  }, [sipAmount, lumpSumAmount, expectedReturn, years]);

  const sipFinalMetrics = useMemo(() => {
    const lastRow = sipChartData[sipChartData.length - 1];
    return {
      invested: lastRow.invested,
      wealth: lastRow.wealth,
      gains: lastRow.gain
    };
  }, [sipChartData]);

  // Profiler Asset Allocation Computing (Using premium Blue/Slate minimalism tones)
  const portfolioAllocation = useMemo(() => {
    let structure = [
      { name: 'Indian Direct Mutual Funds', value: 40, color: '#1E3A8A' }, // Deep Blue
      { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' }, // Royal Blue
      { name: 'High-Conviction Direct Equities', value: 20, color: '#60A5FA' }, // Sky Blue
      { name: 'Physical Gold BeES ETF', value: 10, color: '#EAB308' }, // Gold
      { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' } // Slate Gray
    ];

    if (timeHorizon === 'short') {
      structure = [
        { name: 'Indian Direct Mutual Funds', value: 20, color: '#1E3A8A' },
        { name: 'Global Index & Equity ETFs', value: 15, color: '#3B82F6' },
        { name: 'High-Conviction Direct Equities', value: 5, color: '#60A5FA' },
        { name: 'Physical Gold BeES ETF', value: 25, color: '#EAB308' },
        { name: 'Liquid Cash & Debt Instruments', value: 35, color: '#94A3B8' }
      ];
    } else if (timeHorizon === 'medium') {
      if (riskFactor === 'moderate') {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 35, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 20, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 15, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 15, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 15, color: '#94A3B8' }
        ];
      } else {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 45, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 20, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 5, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' }
        ];
      }
    } else if (timeHorizon === 'long') {
      if (riskFactor === 'moderate') {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 45, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 15, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 10, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' }
        ];
      } else {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 40, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 30, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 25, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 3, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 2, color: '#94A3B8' }
        ];
      }
    }

    return structure;
  }, [goalType, timeHorizon, riskFactor]);

  // Number Formatters
  const formatCurrencyINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="calculators-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb section header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            Interactive Diagnostics
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
            Comprehensive Wealth Calculators
          </h2>
          <p className="text-slate-600 font-sans mt-3 text-[15.5px]">
            Check compounding potential, evaluate historical returns, and design high-conviction allocations for your global Indian portfolio.
          </p>
        </div>

        <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={1} />

        {/* Tab Selection (Pristine minimalism sliders look) */}
        <div className="flex bg-white border border-slate-200/80 p-1.5 rounded-2xl max-w-md mx-auto mb-10 shadow-sm" id="calc-tab-headers">
          <button
            onClick={() => setActiveTab('sip')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'sip' 
                ? 'bg-[#0F172A] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-505" />
            SIP Compounding
          </button>
          <button
            onClick={() => setActiveTab('allocator')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'allocator' 
                ? 'bg-[#0F172A] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldPlus className="w-4 h-4" />
            NRI Risk Profiler
          </button>
        </div>

        {/* Tab 1: SIP Compounding */}
        {activeTab === 'sip' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="sip-calculator">
            
            {/* Input Controls Panel (Left) */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-[17px] font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Parameters
              </h3>
              
              {/* SIP Monthly Amount slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Monthly Mutual Fund SIP</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {formatCurrencyINR(sipAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="5000"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>₹5k</span>
                  <span>₹2.5 Lakh</span>
                </div>
              </div>

              {/* Lump Sum Seed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Initial Block Investment</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {formatCurrencyINR(lumpSumAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="50000"
                  value={lumpSumAmount}
                  onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>₹0</span>
                  <span>₹1 Crore</span>
                </div>
              </div>

              {/* Rate of Return */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Expected Annual Returns</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {expectedReturn}%
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>6% (Debt/Gold)</span>
                  <span>24% (Equity Mutual Fund Peak)</span>
                </div>
              </div>

              {/* Years Horizon */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Time Horizon</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {years} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>1 Yr</span>
                  <span>35 Yrs</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-2.5 items-start">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11.5px] text-slate-500 leading-relaxed">
                  Historically, high-quality equity mutual funds in India have delivered annualized compounding rates between <strong>14% and 18%</strong> over 5+ year cycles.
                </p>
              </div>

            </div>

            {/* Diagnostic Visualization Panel (Right) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Grid showing final numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-left">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Principal Capital Outlay</p>
                  <p className="text-[20px] font-display font-bold text-slate-900 mt-1">{formatCurrencyINR(sipFinalMetrics.invested)}</p>
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-left">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Estimated Wealth Earnings</p>
                  <p className="text-[20px] font-display font-bold text-blue-600 mt-1">+{formatCurrencyINR(sipFinalMetrics.gains)}</p>
                </div>

                <div className="bg-[#0F172A] text-white p-5 rounded-2xl shadow-xs text-left">
                  <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">Target Portfolio Valuation</p>
                  <p className="text-[20px] font-display font-bold mt-1 text-slate-50">{formatCurrencyINR(sipFinalMetrics.wealth)}</p>
                </div>

              </div>

              {/* Area Chart mapping year details */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm" id="sip-chart-panel">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[14px] font-bold text-slate-900">Wealth Accrual Curve</span>
                  <span className="text-[11px] font-mono font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded">INR (₹) Representation</span>
                </div>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sipChartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        tickLine={false} 
                        axisLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11}
                        tickFormatter={(v) => `Yr ${v}`}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11}
                        width={65}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrencyINR(value), '']}
                        labelFormatter={(label) => `Year of Hold ${label}`}
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                      <Area 
                        name="Compounded Wealth Valuation" 
                        type="monotone" 
                        dataKey="wealth" 
                        stroke="#3B82F6" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorWealth)" 
                      />
                      <Area 
                        name="Outlaid Capital Principal" 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#475569" 
                        strokeWidth={1.5} 
                        fillOpacity={1} 
                        fill="url(#colorInvested)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Allocator Pro Profiler */}
        {activeTab === 'allocator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="risk-allocator">
            
            {/* Left Profiler Questionnaire */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              
              <h3 className="text-[17px] font-bold text-slate-950 block border-b border-slate-100 pb-3 mb-2">
                Global Wealth Investment Profiling
              </h3>

              {/* Goal Type Selection */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">1. Central Investment Mandate</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'wealth', title: 'Generational Wealth Growth', desc: 'Sustained compounding via diversified portfolios' },
                    { id: 'retirement', title: 'Comfortable Retirement Plan', desc: 'Inflation-beating returns with secure payouts' },
                    { id: 'education', title: 'Global Children Education Capital', desc: 'Target capital accumulation for overseas colleges' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoalType(g.id as any)}
                      className={`p-3.5 border text-left rounded-xl transition-all cursor-pointer ${
                        goalType === g.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 shadow-xs ring-1 ring-blue-100' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-600'
                      }`}
                    >
                      <h5 className="text-[13.5px] font-bold text-slate-900">{g.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon Selection */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">2. Holding Horizon</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short', label: '1 - 3 Years', desc: 'Short Term' },
                    { id: 'medium', label: '3 - 5 Years', desc: 'Medium Term' },
                    { id: 'long', label: '5+ Years', desc: 'Long-term Growth' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeHorizon(t.id as any)}
                      className={`py-3.5 px-2 border text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                        timeHorizon === t.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 font-bold ring-1 ring-blue-105' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-500'
                      }`}
                    >
                      <span className="text-[13px] font-bold text-slate-900">{t.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">3. Corporate Risk Appetite</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'moderate', label: 'Moderate Investor', desc: 'Balance stable asset yields with moderate equity levels.' },
                    { id: 'aggressive', label: 'Aggressive Alpha', desc: 'Maximize allocation in high-growth blue-chip equity & ETFs.' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRiskFactor(r.id as any)}
                      className={`p-3.5 border text-left rounded-xl transition-all cursor-pointer ${
                        riskFactor === r.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 font-bold ring-1 ring-blue-105' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-600'
                      }`}
                    >
                      <span className="text-[13px] font-bold block text-slate-900">{r.label}</span>
                      <span className="text-[10.5px] text-slate-400 mt-1 block leading-normal">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Visualization Pie Chart allocation */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 text-left animate-fade-in" id="allocator-chart-panel">
              
              <div className="flex-1 space-y-6">
                <div>
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Allocations Diagnosis</span>
                  <h4 className="text-[20px] font-display font-bold text-slate-900 mt-1">Analytical Asset Allocation Mix</h4>
                  <p className="text-slate-500 text-[13px] mt-1.5 leading-relaxed">
                    Presented as educational analytical matrices matching your <strong>{timeHorizon === 'long' ? 'long cyclic growth' : timeHorizon === 'medium' ? 'medium-term' : 'defensive conservative'}</strong> timeline. Mutual fund regular schemes distributed will reflect these broad strategic patterns.
                  </p>
                </div>

                {/* Legend list indicating color codes */}
                <div className="space-y-3.5">
                  {portfolioAllocation.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-[13px] border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart with Cell colours */}
              <div className="w-[220px] h-[220px] flex-shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {portfolioAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Visual indicator absolute center text */}
                <div className="absolute text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Target Return</span>
                  <span className="text-[20px] font-display font-bold text-blue-600 mt-1 block">
                    {timeHorizon === 'long' && riskFactor === 'aggressive' ? '~16.5%' : timeHorizon === 'short' ? '~8.5%' : '~13.8%'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={3} />

      </div>
    </div>
  );
}
