import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import html2pdf from 'html2pdf.js';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { 
  Briefcase, FileText, Download, Sparkles, Plus, Trash2, HelpCircle, 
  ChevronRight, Compass, ShieldCheck, AlertTriangle, TrendingUp, CheckCircle, 
  MapPin, Phone, Mail, Clock, Calendar, Database, RefreshCw, BarChart2,
  ChevronDown, MessageSquare, Info, Shield, Users, Landmark, Globe, Activity,
  Award
} from 'lucide-react';
import MF_NAMES from '../funds/master_list';
import { classifyFundName } from '../funds/master_generator';

interface FundInput {
  name: string;
  category: string;
  amount: number;
}

// Dynamically generate the 1,494-fund master suggestions array with intelligent category mapping
const PRE_SEEDED_FUNDS = MF_NAMES.map(name => {
  const info = classifyFundName(name);
  const catLower = info.category.toLowerCase();
  const nameLower = name.toLowerCase();
  
  let category = "Flexi Cap";
  
  if (nameLower.includes("balanced advantage") || nameLower.includes("dynamic asset allocation") || nameLower.includes("asset allocator") || nameLower.includes("advantage fund")) {
    category = "Balanced Advantage";
  } else if (nameLower.includes("elss") || nameLower.includes("tax saver")) {
    category = "ELSS (Tax Saver)";
  } else if (nameLower.includes("contra") || nameLower.includes("value")) {
    category = "Contra / Value";
  } else if (nameLower.includes("arbitrage")) {
    category = "Arbitrage";
  } else if (catLower === "large cap") {
    category = "Large Cap";
  } else if (catLower === "mid cap") {
    category = "Mid Cap";
  } else if (catLower === "small cap") {
    category = "Small Cap";
  } else if (catLower === "flexi cap") {
    category = "Flexi Cap";
  } else if (catLower === "multi cap") {
    category = "Multi Cap";
  } else if (catLower === "large & midcap") {
    category = "Large & Midcap";
  } else if (catLower === "international") {
    category = "International";
  } else if (catLower === "debt" || catLower === "liquid") {
    category = "Debt / Liquid";
  } else if (catLower === "hybrid") {
    category = "Hybrid / Equity Savings";
  } else {
    category = "Sectoral / Thematic";
  }

  return { name, category };
});

const PRE_SEEDED_CATEGORIES = [
  "Flexi Cap", 
  "Large Cap", 
  "Mid Cap", 
  "Small Cap", 
  "Multi Cap", 
  "Large & Midcap",
  "Balanced Advantage", 
  "Hybrid / Equity Savings", 
  "Debt / Liquid", 
  "Sectoral / Thematic", 
  "ELSS (Tax Saver)", 
  "Contra / Value",
  "Arbitrage",
  "International"
];

const ROTATING_TIPS = [
  "Consulting the AMFI Mutual Fund database...",
  "Engaging real-time Google Search Grounding engine...",
  "Retrieving actual asset allocations and fund management facts...",
  "Analyzing macroeconomic impact scenarios (GDP, Government changes, geopolitical conflicts)...",
  "Extracting historical crisis case studies for similar funds...",
  "Synthesizing customized 5 pros and 3 cons...",
  "Assembling the downloadable client PDF blueprint dossier..."
];

export default function PortfolioPitchView() {
  // Client Details
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  // Lumpsum Capital Quick selector
  const [useLumpsumSelector, setUseLumpsumSelector] = useState(false);
  const [selectedLumpsum, setSelectedLumpsum] = useState(1000000); // 10 Lakhs Default

  // Mutual Funds list
  const [funds, setFunds] = useState<FundInput[]>([
    { name: 'Parag Parikh Flexi Cap Fund', category: 'Flexi Cap', amount: 500000 },
    { name: 'HDFC Mid-Cap Opportunities Fund', category: 'Mid Cap', amount: 300000 },
    { name: 'Nippon India Small Cap Fund', category: 'Small Cap', amount: 200000 }
  ]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [rotatingTipIdx, setRotatingTipIdx] = useState(0);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  const [activeFundIdx, setActiveFundIdx] = useState(0);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const fundsList = result?.funds || result?.fundWiseAnalysis || [];
  
  // Schedule state
  const [scheduleSuccess, setScheduleSuccess] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    date: '',
    timeSlot: '',
    whatsappReminder: true
  });

  const reportRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<any>(null);

  // Quick select lumpsum options: 5 Lakh to 10 Crore with 1 Lakh intervals
  // Rather than listing all 1000 items in a select, we can use a beautiful slider or input with lakh/crore markers
  const formatINR = (num: number) => {
    if (num >= 10000000) {
      return `₹${(num / 10000000).toFixed(2)} Crore`;
    }
    return `₹${(num / 100000).toFixed(1)} Lakh`;
  };

  const handleLumpsumChange = (val: number) => {
    setSelectedLumpsum(val);
    
    // Distribute the selected lumpsum across the current funds proportionally based on current weight ratios
    const totalCurrentAmount = funds.reduce((acc, f) => acc + (f.amount || 0), 0) || 1;
    const updatedFunds = funds.map(f => {
      const weight = (f.amount || 0) / totalCurrentAmount;
      return {
        ...f,
        amount: Math.round((val * weight) / 5000) * 5000 // Round to neat 5,000 increments
      };
    });
    setFunds(updatedFunds);
  };

  const handleAddFund = () => {
    setFunds([...funds, { name: '', category: 'Flexi Cap', amount: 100000 }]);
  };

  const handleRemoveFund = (index: number) => {
    if (funds.length === 1) {
      setError("Your portfolio must contain at least one mutual fund.");
      setTimeout(() => setError(''), 4000);
      return;
    }
    const updated = [...funds];
    updated.splice(index, 1);
    setFunds(updated);
  };

  const handleFundChange = (index: number, field: keyof FundInput, value: any) => {
    const updated = [...funds];
    if (field === 'amount') {
      updated[index][field] = Number(value) || 0;
    } else {
      updated[index][field] = value;
    }
    setFunds(updated);
  };

  const handleSelectPreseededFund = (index: number, seededFund: typeof PRE_SEEDED_FUNDS[0]) => {
    const updated = [...funds];
    updated[index].name = seededFund.name;
    updated[index].category = seededFund.category;
    setFunds(updated);
  };

  const triggerAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!clientName.trim() || !clientEmail.trim() || !clientPhone.trim()) {
      setError("Please complete all client details (Name, Email, Mobile) to authorize and compile this downloadable PDF blueprint.");
      return;
    }

    // Validate funds
    for (let i = 0; i < funds.length; i++) {
      if (!funds[i].name.trim()) {
        setError(`Fund #${i + 1} has an empty name. Please enter or select a mutual fund.`);
        return;
      }
      if (funds[i].amount <= 0) {
        setError(`Fund "${funds[i].name || `Fund #${i+1}`}" must have an investment amount greater than zero.`);
        return;
      }
    }

    setLoading(true);
    setRotatingTipIdx(0);
    
    // Rotate loading text tips
    intervalRef.current = setInterval(() => {
      setRotatingTipIdx((prev) => (prev + 1) % ROTATING_TIPS.length);
    }, 4000);

    try {
      const response = await fetch('/api/portfolio-explanation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          funds: funds
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Server encountered an issue compiling the grounded analysis.");
      }

      const data = await response.json();
      setResult(data);
      setActiveFundIdx(0);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected issue occurred while analyzing with search grounding. Please check your network and try again.");
    } finally {
      setLoading(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  // HTML to PDF downloading via html2pdf.js
  const handleDownloadPDF = () => {
    if (!result || !reportRef.current) return;

    setIsGeneratingPDF(true);

    setTimeout(() => {
      const opt = {
        margin: 12,
        filename: `PureWealthGlobal_PortfolioPitch_${clientName.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true
        },
        jsPDF: { unit: 'mm', format: 'a4' as const, orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf()
        .from(reportRef.current)
        .set(opt)
        .save()
        .then(() => {
          setIsGeneratingPDF(false);
        })
        .catch((err: any) => {
          console.error(err);
          setIsGeneratingPDF(false);
        });
    }, 400); // 400ms delay to let React fully render all fund blocks before capturing
  };

  const handleScheduleConsult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleForm.date || !scheduleForm.timeSlot) {
      alert("Please choose a date and time slot.");
      return;
    }
    setScheduleSuccess(true);
    setTimeout(() => {
      setScheduleSuccess(false);
      setScheduleForm({ date: '', timeSlot: '', whatsappReminder: true });
    }, 5000);
  };

  const totalInvestment = funds.reduce((acc, f) => acc + (f.amount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-800 font-sans" id="portfolio-pitch-explainer-view">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              Factual Client Advisory Pitch Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            Bespoke Portfolio Pitch & Explainer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Empower your advisory by demonstrating exact, factual fund features. Generate real-time search-grounded pros, cons, and macroeconomic scenario stress-tests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-right text-xs">
            <span className="text-slate-400 block font-medium">Wealth Advisor Portal</span>
            <strong className="text-slate-700 font-extrabold block">ARN: 306022 (Pure Wealth Global)</strong>
          </div>
        </div>
      </div>

      {/* Main Form container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Hand Form Controls */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs text-left">
          
          <h2 className="text-lg font-black font-display text-slate-900 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-600" />
            <span>Assemble Client & Portfolio</span>
          </h2>

          <form onSubmit={triggerAnalysis} className="space-y-6">
            
            {/* Required Client Fields */}
            <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-150">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                Required Client Metadata (For PDF Blueprint)
              </span>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 block mb-1">Client Full Name</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="e.g. Rajesh Kumar"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Client Email Address</label>
                    <input 
                      type="email" 
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      placeholder="rajesh@gmail.com"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 block mb-1">Client Mobile Number</label>
                    <input 
                      type="tel" 
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs font-bold outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Lumpsum Range Interval selector */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-slate-700 block">Lumpsum Capital available</label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">Use Range Presets</span>
                  <input 
                    type="checkbox" 
                    checked={useLumpsumSelector}
                    onChange={(e) => setUseLumpsumSelector(e.target.checked)}
                    className="w-3.5 h-3.5 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>
              </div>

              {useLumpsumSelector && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold">Selected Lumpsum Allocation:</span>
                    <strong className="text-sm font-black font-mono text-indigo-700">{formatINR(selectedLumpsum)}</strong>
                  </div>
                  <input 
                    type="range" 
                    min={500000} 
                    max={100000000} 
                    step={100000} // 1 Lakh intervals
                    value={selectedLumpsum}
                    onChange={(e) => handleLumpsumChange(Number(e.target.value))}
                    className="w-full h-1.5 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                    <span>5 Lakhs</span>
                    <span>1 Crore</span>
                    <span>10 Crores</span>
                  </div>
                  <p className="text-[10px] text-indigo-600 leading-relaxed font-semibold">
                    💡 Changing this preset slider automatically distributes capital proportionally across all specified portfolio schemes.
                  </p>
                </div>
              )}
            </div>

            {/* Funds Builder Area */}
            <div className="space-y-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 block uppercase tracking-wider">
                  Invested Portfolio Schemes ({funds.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddFund}
                  className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fund</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {funds.map((fund, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3 relative group">
                    <button
                      type="button"
                      onClick={() => handleRemoveFund(idx)}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-rose-600 transition-colors p-1"
                      title="Remove scheme from portfolio"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    <span className="text-[9px] font-mono text-slate-400 font-bold block">
                      SCHEME #{idx + 1}
                    </span>

                    <div className="space-y-2">
                      {/* Fund Name and preseeded dropdown */}
                      <div className="relative">
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Fund Name</label>
                        <input 
                          type="text"
                          value={fund.name}
                          onChange={(e) => handleFundChange(idx, 'name', e.target.value)}
                          placeholder="e.g. Parag Parikh Flexi Cap Regular"
                          className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                        />

                        {/* Seeded suggestions filter */}
                        {fund.name.length > 2 && !PRE_SEEDED_FUNDS.some(f => f.name === fund.name) && (
                          <div className="bg-white border border-slate-150 rounded-lg mt-1 max-h-[160px] overflow-y-auto shadow-lg text-left divide-y divide-slate-100 absolute z-50 left-0 right-0">
                            {PRE_SEEDED_FUNDS.filter(f => f.name.toLowerCase().includes(fund.name.toLowerCase())).slice(0, 10).map((seeded, sidx) => (
                              <button
                                key={sidx}
                                type="button"
                                onClick={() => handleSelectPreseededFund(idx, seeded)}
                                className="w-full text-left text-[11px] font-semibold text-slate-700 py-1.5 px-2.5 hover:bg-slate-50 flex items-center justify-between transition-colors"
                              >
                                <span className="truncate mr-2" title={seeded.name}>{seeded.name}</span>
                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1 py-0.5 rounded whitespace-nowrap">{seeded.category}</span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Category and Amount */}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Asset Category</label>
                          <select
                            value={fund.category}
                            onChange={(e) => handleFundChange(idx, 'category', e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
                          >
                            {PRE_SEEDED_CATEGORIES.map((cat, cidx) => (
                              <option key={cidx} value={cat}>{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 block mb-1">Invested Amount (INR)</label>
                          <input 
                            type="number"
                            value={fund.amount || ''}
                            onChange={(e) => handleFundChange(idx, 'amount', e.target.value)}
                            placeholder="Amount in ₹"
                            className="w-full bg-white border border-slate-200 rounded-lg py-1.5 px-2.5 text-xs font-bold outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary tag */}
              <div className="bg-slate-100 p-3 rounded-2xl flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold">Total Ported Amount:</span>
                <strong className="text-slate-900 text-sm font-black font-mono">₹{totalInvestment.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            {/* Error messaging */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Analyze Trigger button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 py-3.5 px-4 text-white rounded-2xl text-xs font-black tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Grounding Client Factual Dossier...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Generate Factual Pitch</span>
                </>
              )}
            </button>

          </form>

        </div>

        {/* Right Hand Output Panel */}
        <div className="lg:col-span-7">
          
          <AnimatePresence mode="wait">
            
            {/* 1. Loading Immersive State */}
            {loading && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-6 shadow-xs flex flex-col items-center justify-center min-h-[500px]"
              >
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                  <Sparkles className="w-8 h-8 text-indigo-500 absolute top-6 left-6 animate-pulse" />
                </div>

                <div className="space-y-2 max-w-md">
                  <h3 className="font-extrabold font-display text-slate-900 text-lg">
                    Generating Real-time Factual Report
                  </h3>
                  <p className="text-xs text-slate-400 font-mono h-12 leading-relaxed flex items-center justify-center">
                    {ROTATING_TIPS[rotatingTipIdx]}
                  </p>
                </div>

                <div className="w-48 bg-slate-100 h-1 rounded-full overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full transition-all duration-1000"
                    style={{ width: `${((rotatingTipIdx + 1) / ROTATING_TIPS.length) * 100}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* 2. Welcome Empty State */}
            {!loading && !result && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center space-y-4 min-h-[500px] flex flex-col items-center justify-center"
              >
                <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl">
                  <Compass className="w-10 h-10" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h3 className="font-black font-display text-slate-900 text-base">
                    Draft Report Awaiting Assembly
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Provide client details, select the mutual funds they are interested in, and trigger the factual analyst pitch to unlock deep-dive scenarios, pros/cons, and past real-life crisis comparisons.
                  </p>
                </div>
              </motion.div>
            )}

            {/* 3. Result Loaded State */}
            {!loading && result && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-left"
              >
                {/* Actions Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-indigo-900 text-white p-4 rounded-2xl shadow-md">
                  <div className="flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-800 text-indigo-200 rounded-lg text-[10px] font-mono font-bold">PDF Ready</span>
                    <span className="text-xs font-bold truncate">Blueprint compiled successfully for {clientName}</span>
                  </div>

                  <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF Blueprint</span>
                  </button>
                </div>

                {/* VISUAL PITCH DOSSIER (Target for html2pdf generation) */}
                <div 
                  ref={reportRef} 
                  className="bg-white border border-slate-200 rounded-3xl p-8 space-y-8 shadow-xs relative print:p-6"
                  id="pdf-dossier-report"
                >
                  
                  {/* corporate print layout header */}
                  <div className="border-b border-slate-200 pb-6 flex justify-between items-start">
                    <div className="space-y-1.5 text-left">
                      <div className="flex items-center gap-1.5">
                        <Landmark className="w-5 h-5 text-indigo-700" />
                        <span className="font-black text-sm tracking-tight text-slate-900 font-display">Pure Wealth Global</span>
                      </div>
                      <span className="text-[9.5px] font-mono font-bold text-slate-400 block uppercase tracking-wider">
                        ARN-306022 • AMFI Registered Mutual Fund Distributor
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                        BESPOKE INVESTMENT DOSSIER
                      </span>
                      <span className="text-[9.5px] text-slate-400 block">Date Generated: {new Date().toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Client dossier banner */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-wrap md:flex-nowrap justify-between gap-4 text-xs">
                    <div className="text-left space-y-0.5 min-w-[120px]">
                      <span className="text-slate-400 block font-bold">Client Name</span>
                      <strong className="text-slate-800 text-sm font-black">{clientName}</strong>
                    </div>
                    <div className="text-left space-y-0.5 flex-1 min-w-[200px]">
                      <span className="text-slate-400 block font-bold">Email Address</span>
                      <strong className="text-slate-700 block break-all text-xs sm:text-sm font-black">{clientEmail}</strong>
                    </div>
                    <div className="text-left space-y-0.5 min-w-[150px] md:text-right">
                      <span className="text-slate-400 block font-bold">Portfolio Target Value</span>
                      <strong className="text-indigo-700 block text-sm font-black font-mono">₹{totalInvestment.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>

                  {/* Diversification Score Box */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-white border border-slate-200 p-6 rounded-3xl shadow-sm hover:shadow-md transition duration-300 relative overflow-hidden">
                    {/* Decorative subtle background gradient */}
                    <div className="absolute -right-16 -top-16 w-36 h-36 bg-indigo-50/30 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute -left-16 -bottom-16 w-36 h-36 bg-emerald-50/30 rounded-full blur-2xl pointer-events-none" />

                    {/* Gauge Column */}
                    <div className="md:col-span-4 text-center space-y-3 border-b md:border-b-0 md:border-r border-slate-100 pb-5 md:pb-0 md:pr-6">
                      <span className="text-[10px] font-mono font-black text-indigo-600 uppercase tracking-widest block">
                        DIVERSIFICATION SCALE
                      </span>
                      
                      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className="text-slate-100/80"
                            strokeWidth="8.5"
                            fill="transparent"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="48"
                            className={result.diversificationScore >= 80 ? "text-emerald-500" : "text-indigo-600"}
                            strokeWidth="8.5"
                            strokeDasharray={301.6}
                            strokeDashoffset={301.6 - (301.6 * result.diversificationScore) / 100}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="transparent"
                          />
                        </svg>
                        <div className="absolute text-center flex flex-col items-center">
                          <span className="text-3xl font-black text-slate-800 font-display leading-none">{result.diversificationScore}</span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">SCORE</span>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 text-[11px] font-black">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>{result.diversificationScore >= 80 ? "Optimized Asset Spread" : "Actionable Spread"}</span>
                      </div>
                    </div>

                    {/* Analysis & Short Pointers Column */}
                    <div className="md:col-span-8 text-left space-y-4">
                      <div className="space-y-1">
                        <h4 className="font-extrabold font-display text-slate-900 text-sm flex items-center gap-2">
                          <BarChart2 className="w-4.5 h-4.5 text-indigo-600" />
                          <span>Portfolio Diversification Analysis</span>
                        </h4>
                        <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                          {result.diversificationAnalysis}
                        </p>
                      </div>

                      {/* Simple 1-2 Pointers */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        {result.diversificationScore >= 80 ? (
                          <>
                            <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl flex items-start gap-2.5">
                              <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <strong className="text-[11px] font-extrabold text-slate-800 block">Manager Spread Shield</strong>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  Protects hard-earned capital against single fund-house management bias or operational execution mistakes.
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl flex items-start gap-2.5">
                              <Sparkles className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <strong className="text-[11px] font-extrabold text-slate-800 block">Capitalization Matrix</strong>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  Captures compounding power by blending blue-chip safety, mid-cap runways, and small-cap growth.
                                </p>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="bg-amber-50/40 border border-amber-100 p-3 rounded-xl flex items-start gap-2.5">
                              <AlertTriangle className="w-4.5 h-4.5 text-amber-600 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <strong className="text-[11px] font-extrabold text-amber-950 block">Overlapping Risk Alert</strong>
                                <p className="text-[10px] text-slate-600 leading-relaxed font-medium">
                                  Holding overlapping portfolios can dilute your active gains, leading to redundant expense ratios.
                                </p>
                              </div>
                            </div>

                            <div className="bg-slate-50/80 border border-slate-100 p-3 rounded-xl flex items-start gap-2.5">
                              <TrendingUp className="w-4.5 h-4.5 text-indigo-600 mt-0.5 shrink-0" />
                              <div className="space-y-0.5">
                                <strong className="text-[11px] font-extrabold text-slate-800 block">Consolidation Alpha</strong>
                                <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                                  Streamlining assets into highly-curated core strategies will unlock immediate return efficiency.
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Core Portfolio Executive Thesis Summary */}
                  <div className="space-y-2.5 text-left">
                    <h3 className="font-extrabold font-display text-slate-900 text-base border-l-4 border-indigo-600 pl-3">
                      Executive Investment Thesis
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-4 rounded-xl border border-slate-150">
                      {result.portfolioSummary}
                    </p>
                  </div>

                  {/* Visual Portfolio Blueprint & Interactive Asset Allocation Chart */}
                  <div className="space-y-4 text-left border border-slate-200 p-6 rounded-3xl bg-slate-50/50">
                    <div className="space-y-1">
                      <h3 className="font-extrabold font-display text-slate-900 text-base border-l-4 border-indigo-600 pl-3 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-indigo-600" />
                        <span>Interactive Asset Allocation & Strategic Blueprint</span>
                      </h3>
                      <p className="text-xs text-slate-500 font-medium pl-4">
                        A dynamic overview of how your capital is distributed across selected high-performing mutual funds.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-2">
                      {/* Left: Recharts Donut Pie Chart */}
                      <div className="lg:col-span-5 flex flex-col items-center justify-center bg-white p-4 rounded-2xl border border-slate-150 shadow-3xs h-[280px]">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest mb-1">
                          PROPOSED SPREAD
                        </span>
                        
                        <div className="relative w-full h-[200px] flex items-center justify-center">
                          <PieChart width={280} height={180}>
                            <Pie
                              data={fundsList.map((f: any, idx: number) => ({
                                name: f.fundName || f.name || "Scheme",
                                value: f.amount || 100000,
                              }))}
                              cx="50%"
                              cy="50%"
                              innerRadius={50}
                              outerRadius={75}
                              paddingAngle={4}
                              dataKey="value"
                            >
                              {fundsList.map((f: any, idx: number) => (
                                <Cell key={`cell-${idx}`} fill={['#6366f1', '#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e'][idx % 8]} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                              contentStyle={{ fontSize: '11px', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                          </PieChart>
                          
                          <div className="absolute text-center flex flex-col items-center justify-center">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Schemes</span>
                            <span className="text-lg font-black text-indigo-900">{fundsList.length}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Modern List Cards with Custom Progress Bars & Structural Merits */}
                      <div className="lg:col-span-7 space-y-4">
                        <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-150 shadow-3xs">
                          <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block">
                            PORTFOLIO WEIGHT DISTRIBUTION
                          </span>
                          <div className="space-y-2.5">
                            {fundsList.map((f: any, idx: number) => {
                              const pct = Number(f.allocationPercentage || 0) || ((f.amount || 100000) / totalInvestment * 100);
                              const barColor = ['bg-indigo-600', 'bg-emerald-500', 'bg-blue-500', 'bg-amber-500', 'bg-pink-500', 'bg-purple-500', 'bg-teal-500', 'bg-rose-500'][idx % 8];
                              const textColor = ['text-indigo-600', 'text-emerald-600', 'text-blue-600', 'text-amber-600', 'text-pink-600', 'text-purple-600', 'text-teal-600', 'text-rose-600'][idx % 8];
                              return (
                                <div key={idx} className="space-y-1">
                                  <div className="flex justify-between items-center text-xs">
                                    <span className="font-extrabold text-slate-800 truncate max-w-[200px] sm:max-w-[300px]">
                                      {f.fundName || f.name}
                                    </span>
                                    <span className={`font-black font-mono ${textColor}`}>
                                      ₹{(f.amount || 0).toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                                    </span>
                                  </div>
                                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden flex">
                                    <div 
                                      className={`h-full rounded-full ${barColor}`} 
                                      style={{ width: `${Math.max(pct, 3)}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Professional Highlights to Help Connect */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div className="bg-emerald-50/50 border border-emerald-100/80 p-3 rounded-xl flex items-start gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-left">
                              <span className="text-[10px] font-bold text-emerald-800 block">Balanced Risk</span>
                              <span className="text-[9px] text-slate-500 leading-normal block font-medium">Diversified across complementary asset classes.</span>
                            </div>
                          </div>
                          
                          <div className="bg-blue-50/50 border border-blue-100/80 p-3 rounded-xl flex items-start gap-2">
                            <Activity className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-left">
                              <span className="text-[10px] font-bold text-blue-800 block">Growth Centric</span>
                              <span className="text-[9px] text-slate-500 leading-normal block font-medium">Positioned to ride structural economic tailwinds.</span>
                            </div>
                          </div>

                          <div className="bg-indigo-50/50 border border-indigo-100/80 p-3 rounded-xl flex items-start gap-2">
                            <Globe className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div className="space-y-0.5 text-left">
                              <span className="text-[10px] font-bold text-indigo-800 block">AMC Spread</span>
                              <span className="text-[9px] text-slate-500 leading-normal block font-medium">Neutralizes fund house dependency & style risk.</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isGeneratingPDF && (
                    <div className="html2pdf__page-break" style={{ pageBreakAfter: 'always', height: '1px' }} />
                  )}

                  {/* FUND-WISE DETAILS DOSSIER */}
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2">
                      <h3 className="font-extrabold font-display text-slate-900 text-sm">
                        Fund-by-Fund Grounded Analysis
                      </h3>
                      <span className={`text-[10px] text-slate-400 font-mono ${isGeneratingPDF ? 'hidden' : ''}`}>Select a fund to view specific dossier profiles</span>
                    </div>

                    {/* Horizontal tab list of input funds */}
                    <div className={`flex flex-wrap gap-2 ${isGeneratingPDF ? 'hidden' : ''} print:hidden`}>
                      {fundsList.map((f: any, idx: number) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveFundIdx(idx)}
                          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            activeFundIdx === idx 
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs' 
                              : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>{f.fundName}</span>
                        </button>
                      ))}
                    </div>

                    {/* Printable format displays ALL funds sequentially when downloaded, but in UI displays selected tab */}
                    <div className="space-y-8">
                      {fundsList.map((f: any, idx: number) => {
                        const isSelected = activeFundIdx === idx;
                        const displayClass = (isSelected || isGeneratingPDF) ? 'block' : 'hidden';
                        
                        return (
                          <div key={idx} className={displayClass}>
                            {idx > 0 && isGeneratingPDF && (
                              <div className="html2pdf__page-break" style={{ pageBreakAfter: 'always', height: '1px' }} />
                            )}
                            <div 
                              className="space-y-6 border border-slate-200 p-6 rounded-2xl bg-white shadow-3xs print:border-none print:p-0 print:shadow-none print:break-after-page text-slate-800"
                            >
                            {/* Fund title section */}
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-2 border-b border-slate-100 pb-3">
                              <div className="text-left space-y-1">
                                <span className="text-[10px] font-bold text-indigo-600 font-mono uppercase">
                                  SCHEME {idx + 1} OF {fundsList.length} • {f.category}
                                </span>
                                <h4 className="text-base font-black font-display text-slate-900">
                                  {f.fundName}
                                </h4>
                              </div>

                              <div className="text-left sm:text-right">
                                <span className="text-[10px] font-medium text-slate-400 block">Proposed Allocation</span>
                                <strong className="text-indigo-900 font-black font-mono text-sm block">
                                  ₹{f.amount?.toLocaleString('en-IN')} ({Number(f.allocationPercentage || 0).toFixed(1)}%)
                                </strong>
                              </div>
                            </div>

                            {/* Fund descriptive text & Thesis */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                              <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-1.5 text-left">
                                <strong className="text-slate-800 font-extrabold block">Factual Scheme Mandate</strong>
                                <p className="text-slate-600 leading-relaxed font-medium">{f.description}</p>
                              </div>
                              <div className="bg-indigo-50/30 border border-indigo-100 p-4 rounded-xl space-y-1.5 text-left">
                                <strong className="text-indigo-900 font-extrabold block">Why is this a good investment?</strong>
                                <p className="text-indigo-950 leading-relaxed font-medium">{f.whyGoodInvestment}</p>
                              </div>
                            </div>

                            {/* 5 Pros and 3 Cons Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                              {/* 5 Pros block */}
                              <div className="md:col-span-7 bg-white border border-slate-200 rounded-xl p-4.5 text-left space-y-3 shadow-3xs">
                                <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-xs uppercase tracking-wider">
                                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>5 Factual Pros / Advantages</span>
                                </div>
                                <ul className="space-y-2 text-[11px] font-medium text-slate-600 leading-relaxed">
                                  {f.pros?.map((pro: string, pidx: number) => (
                                    <li key={pidx} className="flex items-start gap-2">
                                      <span className="w-4.5 h-4.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                        ✓
                                      </span>
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>

                              {/* 3 Cons block */}
                              <div className="md:col-span-5 bg-white border border-slate-200 rounded-xl p-4.5 text-left space-y-3 shadow-3xs">
                                <div className="flex items-center gap-1.5 text-amber-700 font-extrabold text-xs uppercase tracking-wider">
                                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span>3 Key Risk Factors / Cons</span>
                                </div>
                                <ul className="space-y-2 text-[11px] font-medium text-slate-600 leading-relaxed">
                                  {f.cons?.map((con: string, cidx: number) => (
                                    <li key={cidx} className="flex items-start gap-2">
                                      <span className="w-4.5 h-4.5 rounded-full bg-amber-50 text-amber-700 font-mono font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5">
                                        !
                                      </span>
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                             {/* Macro-Economic Stress Scenario Matrix */}
                             <div className="space-y-4 text-left">
                               <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                                 <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                   <Globe className="w-4 h-4 text-indigo-500" />
                                   <span>Macro-Economic Stress & Scenario Matrix</span>
                                 </span>
                                 <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full font-bold">
                                   Stress-Tested Performance
                                 </span>
                               </div>
 
                               <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                                 {/* Theme 1: Growth Engine (Prosperous Scenarios) */}
                                 <div className="border border-emerald-100/80 rounded-2xl bg-white p-5 space-y-4 shadow-3xs relative overflow-hidden">
                                   <div className="absolute right-0 top-0 w-20 h-20 bg-emerald-50/40 rounded-bl-full pointer-events-none" />
                                   <div className="flex justify-between items-start">
                                     <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                                       🚀 Growth Engine Cases
                                     </span>
                                     <span className="text-[10px] font-bold text-emerald-600 font-mono">Sensitivity: High Alpha</span>
                                   </div>
                                   
                                   <div className="space-y-4">
                                     {/* Scenario A */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Sustained GDP Acceleration (&gt;7.2%):</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.gdpGrows}</p>
                                       {/* Micro Visual Indicator */}
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Growth Catalysis</span>
                                           <span className="text-emerald-600 font-bold">Max Outperformance</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-emerald-500" style={{ width: '92%' }} />
                                         </div>
                                       </div>
                                     </div>

                                     <div className="border-t border-slate-100 my-3" />

                                     {/* Scenario B */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Strong Bull Market Expansion:</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.economicGetsBetter}</p>
                                       {/* Micro Visual Indicator */}
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Market Momentum Capture</span>
                                           <span className="text-emerald-500 font-bold">+20% to +25% CAGR</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-emerald-400" style={{ width: '85%' }} />
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
 
                                 {/* Theme 2: Baseline Stability (Organic Scenarios) */}
                                 <div className="border border-blue-100/80 rounded-2xl bg-white p-5 space-y-4 shadow-3xs relative overflow-hidden">
                                   <div className="absolute right-0 top-0 w-20 h-20 bg-blue-50/40 rounded-bl-full pointer-events-none" />
                                   <div className="flex justify-between items-start">
                                     <span className="text-[10px] font-black text-blue-800 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                                       ⚖️ Baseline Stability
                                     </span>
                                     <span className="text-[10px] font-bold text-blue-600 font-mono">Sensitivity: Balanced</span>
                                   </div>
                                   
                                   <div className="space-y-3.5">
                                     {/* Scenario A */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Global/India Stays As Is (Base Case):</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.economicStaysSame}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Baseline Compounding</span>
                                           <span className="text-blue-600 font-bold">12-14% CAGR Range</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-blue-500" style={{ width: '70%' }} />
                                         </div>
                                       </div>
                                     </div>

                                     <div className="border-t border-slate-100 my-2" />

                                     {/* Scenario B */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Policy Continuity (Government Stays):</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.governmentRemains}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Capex Directionality</span>
                                           <span className="text-blue-500 font-bold">Strong Structural Fit</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-blue-400" style={{ width: '78%' }} />
                                         </div>
                                       </div>
                                     </div>

                                     <div className="border-t border-slate-100 my-2" />

                                     {/* Scenario C */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">GDP Stagnation / Neutral Growth:</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.gdpRemainsSame}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Capital Preservation</span>
                                           <span className="text-slate-500 font-bold">Neutral / Secure</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-slate-400" style={{ width: '55%' }} />
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
 
                                 {/* Theme 3: Risk & Stress Buffers (Drawdown Scenarios) */}
                                 <div className="border border-rose-100 rounded-2xl bg-white p-5 space-y-4 shadow-3xs relative overflow-hidden">
                                   <div className="absolute right-0 top-0 w-20 h-20 bg-rose-50/40 rounded-bl-full pointer-events-none" />
                                   <div className="flex justify-between items-start">
                                     <span className="text-[10px] font-black text-rose-800 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-md uppercase tracking-wider font-mono">
                                       🛡️ Stress & Risk Buffers
                                     </span>
                                     <span className="text-[10px] font-bold text-rose-600 font-mono">Sensitivity: Low Risk</span>
                                   </div>
                                   
                                   <div className="space-y-3.5">
                                     {/* Scenario A */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Inflation / Economic Slowdown:</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.economicGetsBad || f.scenarios?.economicGetsBetter}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Defensive Cushion</span>
                                           <span className="text-amber-600 font-bold">Insulated / Stable</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-amber-500" style={{ width: '60%' }} />
                                         </div>
                                       </div>
                                     </div>

                                     <div className="border-t border-slate-100 my-2" />

                                     {/* Scenario B */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Geopolitical / Conflict Escalation:</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.warInternalConflicts}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Crisis Shock Absorption</span>
                                           <span className="text-emerald-600 font-bold">High Resilience</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-emerald-500" style={{ width: '80%' }} />
                                         </div>
                                       </div>
                                     </div>

                                     <div className="border-t border-slate-100 my-2" />

                                     {/* Scenario C */}
                                     <div className="space-y-1.5">
                                       <strong className="text-[11px] text-slate-800 block font-bold">Political Uncertainty (Govt Changes):</strong>
                                       <p className="text-[10.5px] text-slate-600 font-medium leading-relaxed">{f.scenarios?.governmentChanges}</p>
                                       <div className="space-y-1">
                                         <div className="flex justify-between text-[9px] font-mono text-slate-400">
                                           <span>Policy Transition Protection</span>
                                           <span className="text-indigo-600 font-bold">Active Re-Balancing</span>
                                         </div>
                                         <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden flex">
                                           <div className="h-full rounded-full bg-indigo-500" style={{ width: '75%' }} />
                                         </div>
                                       </div>
                                     </div>
                                   </div>
                                 </div>
                               </div>
                             </div>

                            {/* Fund Playbook Triggers */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-4 text-xs">
                              <div className="space-y-1.5 text-left">
                                <span className="text-slate-800 font-extrabold flex items-center gap-1">
                                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                                  <span>When scheme EXCEL / Protect portfolio:</span>
                                </span>
                                <p className="text-slate-600 font-medium leading-relaxed">{f.playbook?.whenPerformsWell}</p>
                              </div>

                              <div className="space-y-1.5 text-left">
                                <span className="text-slate-800 font-extrabold flex items-center gap-1">
                                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                                  <span>When scheme might UNDERPERFORM:</span>
                                </span>
                                <p className="text-slate-600 font-medium leading-relaxed">{f.playbook?.whenUnderperforms}</p>
                              </div>
                            </div>

                            {/* Real-Life Past Historical Crisis Examples */}
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3 text-left">
                              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Clock className="w-4 h-4 text-indigo-500" />
                                <span>Real-Life Crisis Performance Case Studies (Past History)</span>
                              </span>

                              <div className="space-y-3 text-[11px] font-semibold text-slate-600 leading-relaxed">
                                {f.playbook?.pastRealLifeExamples?.map((ex: string, eidx: number) => (
                                  <div key={eidx} className="flex gap-2 items-start">
                                    <span className="p-1 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-bold font-mono shrink-0 mt-0.5">
                                      Crisis Match #{eidx + 1}
                                    </span>
                                    <p className="font-medium text-slate-600 leading-relaxed">{ex}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                      })}
                    </div>
                  </div>

                  {isGeneratingPDF && (
                    <div className="html2pdf__page-break" style={{ pageBreakAfter: 'always', height: '1px' }} />
                  )}

                  {/* Institutional Certification & Trust Seal */}
                  <div className="border-t border-slate-200 pt-6 mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                    <div className="space-y-3.5">
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 font-display">
                        <Award className="w-4.5 h-4.5 text-indigo-600" />
                        <span>Fiduciary Verification Checklist</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] font-bold text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>KYC Compliant & Checked</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Asset Overlap Validated</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>Risk Suitability Confirmed</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 p-2 rounded-xl">
                          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                          <span>AMFI Distributor Verified</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col justify-between p-4 bg-indigo-50/30 border border-indigo-100/50 rounded-2xl relative overflow-hidden">
                      <div className="absolute right-3 top-3 opacity-10">
                        <Landmark className="w-16 h-16 text-indigo-700" />
                      </div>
                      <div className="space-y-1 z-10">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-600 block">Authorized Sign-Off</span>
                        <div className="flex items-center gap-2">
                          <span className="font-serif italic text-sm text-slate-700 select-none">Pure Wealth Global Partners</span>
                        </div>
                        <p className="text-[9px] text-slate-400 font-semibold">
                          AMFI Registered MFD • Brokerage & Fiduciary Trust Standards
                        </p>
                      </div>
                      <div className="border-t border-indigo-100/60 pt-2 mt-2 flex justify-between items-center text-[8.5px] text-indigo-700 font-bold z-10">
                        <span>Fiduciary ID: PWG-MFD-306022</span>
                        <span className="text-[9px] text-emerald-600 flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          ACTIVE DISTRIBUTOR Blueprints
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Legal regulatory disclaimer box */}
                  <div className="border-t border-slate-200 pt-5 text-[9.5px] text-slate-400 font-medium leading-relaxed text-left space-y-1">
                    <p>
                      <strong>Pure Wealth Global Regulatory Disclaimer (ARN: 306022):</strong> Mutual Fund investments are subject to market risks. Please read all scheme related documents carefully before investing. Historical performance ratings and past economic crisis stress tests are purely factual and grounded on actual occurrences but do not guarantee future returns.
                    </p>
                    <p>
                      As AMFI Registered distributors, we operate as investment distributors facilitating regular plan investments.
                    </p>
                  </div>

                </div>

                {/* TAKE ACTION TODAY & MEETING BOOKER SECTION */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-white space-y-6 text-left shadow-lg">
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-indigo-400 bg-indigo-900/50 border border-indigo-800 px-3 py-1 rounded-full">
                      Take Action Today Hub
                    </span>
                    <h3 className="text-xl font-black font-display">
                      Initiate Lumpsum Portfolio Allocation
                    </h3>
                    <p className="text-xs text-slate-400 max-w-xl">
                      Schedule a secure 15-minute verification callback with our wealth managers to approve this blueprint, verify your KYC, and start investing with ARN: 306022.
                    </p>
                  </div>

                  {scheduleSuccess ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-emerald-50 border border-emerald-200 text-emerald-950 p-5 rounded-2xl flex items-start gap-3"
                    >
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <strong className="text-sm font-bold block text-emerald-900">Appointment Scheduled Securely!</strong>
                        <p className="text-xs">
                          Your advisory callback booking is registered in the cloud CRM database. An automated SMS and WhatsApp confirmation is dispatched to <strong className="font-bold">{clientPhone}</strong>.
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleScheduleConsult} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Choose Callback Date</label>
                        <input 
                          type="date"
                          value={scheduleForm.date}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-3 text-xs font-bold outline-none focus:border-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-1">Select Callback Time-Slot</label>
                        <select
                          value={scheduleForm.timeSlot}
                          onChange={(e) => setScheduleForm({ ...scheduleForm, timeSlot: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-2.5 px-3 text-xs font-bold outline-none cursor-pointer focus:border-indigo-500"
                          required
                        >
                          <option value="">-- Choose Slot --</option>
                          <option value="10:00 AM - 11:30 AM">Morning (10:00 AM - 11:30 AM)</option>
                          <option value="12:00 PM - 01:30 PM">Midday (12:00 PM - 01:30 PM)</option>
                          <option value="02:30 PM - 04:00 PM">Afternoon (02:30 PM - 04:00 PM)</option>
                          <option value="04:30 PM - 06:00 PM">Evening (04:30 PM - 06:00 PM)</option>
                        </select>
                      </div>

                      <div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 rounded-xl text-xs font-black tracking-wide flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                          <span>Verify & Schedule Callback</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
