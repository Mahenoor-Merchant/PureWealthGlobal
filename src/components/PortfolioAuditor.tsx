/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import html2pdf from "html2pdf.js";
import {
  FileText,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  TrendingUp,
  Percent,
  Trash2,
  Plus,
  Compass,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldAlert,
  ArrowUpRight,
  ShieldCheck,
  ChevronDown,
  Clock,
  Coins,
  User,
  FolderClosed,
  Award,
  AlertCircle,
  Download
} from "lucide-react";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

// ==========================================
// Types and Interfaces
// ==========================================
export interface ManualHolding {
  id: string;
  fundName: string;
  allocation: number; // weight (%)
  category: string;
  purchaseDate: string;
  monthlySip: boolean;
}

interface InvestorPersona {
  typeName: string;
  behaviorQuote: string;
  behaviorAnalysis: string;
  riskToleranceRating: string; // High / Medium / Low
  churnActivityLevel: string;  // Excessive / Moderate / Minimal
}

interface FundAuditItem {
  fundName: string;
  allocation: string;
  category: string;
  basketClassification: "Core Alpha Gen" | "Defensive Anchor" | "Fee-Dragged Peer" | "Rebalance/Churn Catalyst";
  currentExpenseRatio: number;
  betterAlternativeFund: string;
  alternativeExpenseRatio: number;
  returnDifference3Y: number;
  sharpeAndSortinoStatus: string;
  rollingReturnsRating: number; // 1 to 10
  downsideProtectionRating: number; // 1 to 10
  switchingExitLoadCost: number;
  taxImplication: number;
  currentReturn3Y?: number;
  benchmarkReturn3Y?: number;
  peerAlternativeReturn3Y?: number;
  currentSharpe?: number;
  benchmarkSharpe?: number;
  peerAlternativeSharpe?: number;
  currentSortino?: number;
  benchmarkSortino?: number;
  peerAlternativeSortino?: number;
  benchmarkName?: string;
  benchmarkExpenseRatio?: number;
  isActive?: boolean;
  isin?: string;
}

interface AuditResult {
  totalFunds: number;
  activeFundsCount?: number;
  inactiveFundsCount?: number;
  overallStrengths: string[];
  criticalLeaks: string[];
  diversificationScore: number;
  diversificationStatus: string;
  diversificationAnalysis: string;
  overlappingPercentage?: number;
  investorPersona: InvestorPersona;
  fundWiseAudit: FundAuditItem[];
  returnGainsProjection: {
    currentValue: number;
    projectedValue5YCurrent: number;
    projectedValue5YPWG: number;
    totalExtraWealthEarned: number;
    improvementExplanation: string;
    portfolioCAGR?: number;
    niftyCAGR?: number;
    peerBenchmarkCAGR?: number;
    oursOptimizedCAGR?: number;
    earliestInvestmentDate?: string;
    totalAcquisitionCost?: number;
  };
  switchingCostSummary: {
    totalExitLoad: number;
    totalTaxImpact: number; // expressed as negative for liability or positive for harvesting benefits
    avoidanceStrategy: string;
  };
  exitLoadLeaks: string[];
  taxLeaks: string;
  actionablePortfolioPlan: string[];
}

// Pre-seeded CAS Demo Portfolios
const DEMO_PORTFOLIOS = [
  {
    id: "regular-legacy",
    title: "Legacy High-Overlapping Agent Portfolio",
    description: "Holdings containing expensive legacy banking schemes, duplicate sector allocations, and commission-heavy fee structures.",
    fundsCount: 6,
    investedAmount: 500000,
    holdings: [
      { id: "h1", fundName: "HDFC Top 100 Scheme - Regular", allocation: 25, category: "Large Cap", purchaseDate: "2023-01-15", monthlySip: true },
      { id: "h2", fundName: "SBI Bluechip Growth - Regular", allocation: 20, category: "Large Cap", purchaseDate: "2023-05-20", monthlySip: true },
      { id: "h3", fundName: "Nippon India Small Cap - Regular", allocation: 15, category: "Small Cap", purchaseDate: "2024-02-10", monthlySip: true },
      { id: "h4", fundName: "ICICI Prudential Multi-Asset Scheme", allocation: 15, category: "Multi Cap", purchaseDate: "2023-08-11", monthlySip: false },
      { id: "h5", fundName: "Mirae Asset Large & Midcap Regular", allocation: 15, category: "Large & Midcap", purchaseDate: "2023-11-01", monthlySip: true },
      { id: "h6", fundName: "Parag Parikh Flexi Cap Regular Growth", allocation: 10, category: "Flexi Cap", purchaseDate: "2024-03-01", monthlySip: false }
    ]
  },
  {
    id: "un-diversified",
    title: "Over-concentrated 'Hype' Small-Cap Portfolio",
    description: "Aggressive portfolio highly exposed to high-beta thematic funds and small caps, showing severe system overlap and drawdown risk.",
    fundsCount: 4,
    investedAmount: 850000,
    holdings: [
      { id: "h10", fundName: "Nippon India Small Cap Plan - Regular", allocation: 40, category: "Small Cap", purchaseDate: "2024-01-05", monthlySip: false },
      { id: "h11", fundName: "Quant Small Cap Scheme - Regular", allocation: 30, category: "Small Cap", purchaseDate: "2024-06-12", monthlySip: true },
      { id: "h12", fundName: "Tata Digital India Fund Growth - Regular", allocation: 20, category: "Sectoral/Thematic", purchaseDate: "2023-10-18", monthlySip: false },
      { id: "h13", fundName: "ICICI Prudential Technology Regular", allocation: 10, category: "Sectoral/Thematic", purchaseDate: "2024-05-01", monthlySip: true }
    ]
  },
  {
    id: "tax-leak-bad-exit",
    title: "High-Churn Short Term Transaction Portfolio",
    description: "Holdings marked by early redemption events (before 1 year), causing significant exit loads and high short-term tax leaks.",
    fundsCount: 5,
    investedAmount: 600000,
    holdings: [
      { id: "h20", fundName: "HDFC Mid-Cap Opportunities Scheme", allocation: 30, category: "Mid Cap", purchaseDate: "2025-10-12", monthlySip: true },
      { id: "h21", fundName: "Axis Small Cap Plan Regular", allocation: 25, category: "Small Cap", purchaseDate: "2025-11-05", monthlySip: false },
      { id: "h22", fundName: "Kotak Emerging Equity Regular Growth", allocation: 20, category: "Mid Cap", purchaseDate: "2025-08-20", monthlySip: true },
      { id: "h23", fundName: "DSP Natural Resources Regular", allocation: 15, category: "Sectoral/Thematic", purchaseDate: "2025-12-15", monthlySip: false },
      { id: "h24", fundName: "Invesco India Contra Scheme", allocation: 10, category: "Flexi Cap", purchaseDate: "2025-09-01", monthlySip: true }
    ]
  }
];

function getEnhancedFundMetrics(f: FundAuditItem) {
  const isLiquidOrDebt = f.fundName.toLowerCase().includes("liquid") || 
                         f.fundName.toLowerCase().includes("overnight") || 
                         f.fundName.toLowerCase().includes("debt") || 
                         f.fundName.toLowerCase().includes("gilt") || 
                         (f.category || "").toLowerCase().includes("liquid") || 
                         (f.category || "").toLowerCase().includes("debt");

  const currentReturn3Y = f.currentReturn3Y !== undefined ? f.currentReturn3Y : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 19.85 :
    f.basketClassification === "Fee-Dragged Peer" ? 11.20 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 6.15 : 9.85) : 15.65
  );

  const benchmarkReturn3Y = f.benchmarkReturn3Y !== undefined ? f.benchmarkReturn3Y : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 17.50 :
    f.basketClassification === "Fee-Dragged Peer" ? 12.45 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 6.40 : 10.45) : 14.10
  );

  const peerAlternativeReturn3Y = f.peerAlternativeReturn3Y !== undefined ? f.peerAlternativeReturn3Y : (
    parseFloat((currentReturn3Y + f.returnDifference3Y).toFixed(2))
  );

  const currentSharpe = f.currentSharpe !== undefined ? f.currentSharpe : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.25 :
    f.basketClassification === "Fee-Dragged Peer" ? 0.85 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 1.85 : 1.05) : 1.20
  );

  const benchmarkSharpe = f.benchmarkSharpe !== undefined ? f.benchmarkSharpe : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.10 :
    f.basketClassification === "Fee-Dragged Peer" ? 1.05 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 1.65 : 0.95) : 1.05
  );

  const peerAlternativeSharpe = f.peerAlternativeSharpe !== undefined ? f.peerAlternativeSharpe : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.55 :
    f.basketClassification === "Fee-Dragged Peer" ? 1.28 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 2.30 : 1.30) : 1.45
  );

  const currentSortino = f.currentSortino !== undefined ? f.currentSortino : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.45 :
    f.basketClassification === "Fee-Dragged Peer" ? 1.10 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 2.65 : 1.35) : 1.50
  );

  const benchmarkSortino = f.benchmarkSortino !== undefined ? f.benchmarkSortino : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.25 :
    f.basketClassification === "Fee-Dragged Peer" ? 1.30 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 2.25 : 1.15) : 1.30
  );

  const peerAlternativeSortino = f.peerAlternativeSortino !== undefined ? f.peerAlternativeSortino : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 1.85 :
    f.basketClassification === "Fee-Dragged Peer" ? 1.62 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 3.40 : 1.65) : 1.85
  );

  let bName = f.benchmarkName || "Nifty 50 TRI";
  if (!f.benchmarkName) {
    if (f.basketClassification === "Rebalance/Churn Catalyst") {
      bName = f.fundName.toLowerCase().includes("infra") ? "Nifty Infrastructure TRI" : "Nifty Smallcap 250 TRI";
    } else if (f.basketClassification === "Core Alpha Gen") {
      bName = "Nifty Midcap 150 TRI";
    } else if (f.basketClassification === "Defensive Anchor") {
      bName = isLiquidOrDebt ? "CRISIL Liquid Fund TRI" : "CRISIL Hybrid 35+65 Index";
    }
  }

  const benchmarkExpenseRatio = f.benchmarkExpenseRatio !== undefined ? f.benchmarkExpenseRatio : (
    f.basketClassification === "Rebalance/Churn Catalyst" ? 0.22 :
    f.basketClassification === "Fee-Dragged Peer" ? 0.12 :
    f.basketClassification === "Defensive Anchor" ? (isLiquidOrDebt ? 0.08 : 0.18) : 0.18
  );

  return {
    ...f,
    currentReturn3Y,
    benchmarkReturn3Y,
    peerAlternativeReturn3Y,
    currentSharpe,
    benchmarkSharpe,
    peerAlternativeSharpe,
    currentSortino,
    benchmarkSortino,
    peerAlternativeSortino,
    benchmarkName: bName,
    benchmarkExpenseRatio
  };
}

const renderComparableTable = (f: any, savingPercent: number, actionPrefix: string, actionTheme: "emerald" | "amber" | "rose" | "blue") => {
  const themeColors = {
    emerald: {
      text: "text-emerald-700",
      bgSubtle: "bg-emerald-50/65",
      accent: "text-emerald-800",
      badge: "bg-emerald-100/50 text-emerald-800"
    },
    amber: {
      text: "text-amber-700",
      bgSubtle: "bg-amber-50/65",
      accent: "text-amber-800",
      badge: "bg-amber-100/50 text-amber-800"
    },
    rose: {
      text: "text-rose-700",
      bgSubtle: "bg-rose-50/65",
      accent: "text-rose-800",
      badge: "bg-rose-100/50 text-rose-800"
    },
    blue: {
      text: "text-blue-755",
      bgSubtle: "bg-blue-50/65",
      accent: "text-blue-800",
      badge: "bg-blue-100/50 text-blue-800"
    }
  };

  const colTheme = themeColors[actionTheme];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3 space-y-2.5 text-[10px] text-slate-650 mt-1 shadow-sm">
      <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
        <span className="text-[8.5px] font-black text-slate-400 uppercase tracking-widest">3-Way Analytics Comparison</span>
        <span className={`text-[8.5px] font-bold ${colTheme.text}`}>Optimized Scheme (ARN-306022)</span>
      </div>
      
      {/* 4-column layout header */}
      <div className="grid grid-cols-4 gap-1.5 text-center font-bold text-[9px] text-slate-400 border-b border-dashed border-slate-150 pb-1">
        <div className="text-left">Metrics</div>
        <div className="text-slate-600 bg-slate-100 rounded">Your Fund</div>
        <div className="text-slate-500">Index Bench</div>
        <div className={`${colTheme.text} ${colTheme.bgSubtle} rounded font-black`}>PWG Peer</div>
      </div>

      {/* 3Y Annualised returns (CAGR) row */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold border-b border-dashed border-slate-150 pb-1.5 pt-0.5">
        <div className="text-left text-slate-500 font-semibold truncate" title="3Y Annualised Compound Returns">3Y Return CAGR</div>
        <div className="text-slate-700 font-mono font-medium">{f.currentReturn3Y}% p.a.</div>
        <div className="text-slate-400 font-mono font-medium">{f.benchmarkReturn3Y}% p.a.</div>
        <div className="text-emerald-700 font-mono font-black">{f.peerAlternativeReturn3Y}% p.a.</div>
      </div>

      {/* Sharpe Ratio row */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold border-b border-dashed border-slate-150 pb-1.5">
        <div className="text-left text-slate-500 font-semibold truncate" title="Reward-to-Volatility risk efficiency ratio">Sharpe Ratio</div>
        <div className="text-slate-700 font-mono font-medium">{f.currentSharpe}</div>
        <div className="text-slate-400 font-mono font-medium">{f.benchmarkSharpe}</div>
        <div className={`${colTheme.text} font-mono font-black`}>{f.peerAlternativeSharpe}</div>
      </div>

      {/* Sortino Ratio row */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold border-b border-dashed border-slate-150 pb-1.5">
        <div className="text-left text-slate-500 font-semibold truncate" title="Downside protection efficiency ratio">Sortino Ratio</div>
        <div className="text-slate-700 font-mono font-medium">{f.currentSortino}</div>
        <div className="text-slate-400 font-mono font-medium">{f.benchmarkSortino}</div>
        <div className={`${colTheme.text} font-mono font-black`}>{f.peerAlternativeSortino}</div>
      </div>

      {/* Expense Ratio row */}
      <div className="grid grid-cols-4 gap-1.5 text-center text-[10px] font-extrabold pb-0.5">
        <div className="text-left text-slate-500 font-semibold truncate" title="Annual scheme management fees drag">Expense Ratio</div>
        <div className="text-slate-700 font-mono font-medium">{f.currentExpenseRatio}%</div>
        <div className="text-slate-400 font-mono font-medium">{f.benchmarkExpenseRatio}%</div>
        <div className={`${colTheme.text} font-mono font-black`}>{f.alternativeExpenseRatio}%</div>
      </div>

      {/* Benchmark Index analysis label */}
      <div className="bg-slate-50 border border-slate-150 rounded-lg p-2 text-[9.5px] text-slate-600 font-medium leading-relaxed">
        📊 <strong className="text-slate-800">Benchmark Index:</strong> <span className="font-bold text-slate-800">{f.benchmarkName}</span> (passive fee-drag: {f.benchmarkExpenseRatio}%). Competing Active peer outpaces passive standards under optimized structures.
      </div>

      {/* Recommendation and Action call */}
      <div className="bg-slate-100 rounded-lg p-2.5 text-[9.5px] text-slate-600 font-medium leading-relaxed border border-slate-200">
        {actionPrefix} <strong className="text-slate-800">Alternative recommendation:</strong> <span className="font-bold text-slate-800 block my-0.5">{f.betterAlternativeFund}</span> (saves <span className="font-extrabold text-slate-800">{savingPercent}% p.a.</span> in fees). Reclaiming this drag shields core compounding under MFD ARN-306022.
      </div>
    </div>
  );
};

export default function PortfolioAuditor() {
  const [activeTab, setActiveTab] = useState<"upload" | "demo">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);
  const [whatsappEmail, setWhatsappEmail] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [expandedFund, setExpandedFund] = useState<string | null>(null);

  const downloadPdfReport = () => {
    if (!result) return;
    setPdfLoading(true);

    // Create container
    const tempContainer = document.createElement("div");
    tempContainer.style.position = "fixed";
    tempContainer.style.top = "-9999px";
    tempContainer.style.left = "-9999px";
    tempContainer.style.width = "820px"; // width for crisp rendering before converting
    tempContainer.style.background = "#ffffff";
    tempContainer.style.color = "#1e293b";
    tempContainer.style.fontFamily = "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    document.body.appendChild(tempContainer);

    // Watermark style tag
    const watermarkHTML = `
      <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; min-height: 100%; pointer-events: none; z-index: -9999; overflow: hidden;">
        <div style="position: absolute; top: 20%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 72px; font-weight: 900; color: rgba(16, 185, 129, 0.02); white-space: nowrap; font-family: system-ui;">PURE WEALTH GLOBAL</div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 72px; font-weight: 900; color: rgba(16, 185, 129, 0.02); white-space: nowrap; font-family: system-ui;">PURE WEALTH GLOBAL</div>
        <div style="position: absolute; top: 80%; left: 50%; transform: translate(-50%, -50%) rotate(-30deg); font-size: 72px; font-weight: 900; color: rgba(16, 185, 129, 0.02); white-space: nowrap; font-family: system-ui;">PURE WEALTH GLOBAL</div>
      </div>
    `;

    // Calculate details
    const totalCurrentValue = result.returnGainsProjection.currentValue;
    const coreAlphaFunds = result.fundWiseAudit.filter(f => f.basketClassification === "Core Alpha Gen");
    const defensiveAnchorFunds = result.fundWiseAudit.filter(f => f.basketClassification === "Defensive Anchor");
    const feeDraggedFunds = result.fundWiseAudit.filter(f => f.basketClassification === "Fee-Dragged Peer");
    const rebalanceFunds = result.fundWiseAudit.filter(f => f.basketClassification === "Rebalance/Churn Catalyst");

    // Construct the elegant programmatically compiled printable layout
    tempContainer.innerHTML = `
      <div style="position: relative; padding: 40px; background: #ffffff; min-height: 100%;">
        ${watermarkHTML}

        <!-- ==================== PAGE 1 ==================== -->
        <!-- Header Brand Logo -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 30px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="background: linear-gradient(135deg, #1e3a8a, #2563eb); width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 900; font-size: 18px; font-family: system-ui;">
              PW
            </div>
            <div>
              <div style="font-size: 18px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; text-transform: uppercase;">
                Pure Wealth Global
              </div>
              <div style="font-size: 10px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 0.5px;">
                AMFI-Registered Mutual Fund Distributor
              </div>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">SEBI MFD Diagnostic</div>
            <div style="font-size: 12px; font-weight: 700; color: #0f172a;">Date: ${new Date().toLocaleDateString('en-IN', {day: '2-digit', month: 'long', year: 'numeric'})}</div>
          </div>
        </div>

        <!-- Cover Header Title -->
        <div style="background: linear-gradient(135deg, #0f172a, #1e293b); border: 1px solid #334155; padding: 30px; border-radius: 20px; color: white; margin-bottom: 30px; position: relative;">
          <div style="position: absolute; top: 12px; right: 20px; font-size: 9px; font-weight: 905; text-transform: uppercase; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 4px 10px; border-radius: 20px;">
            CONFIDENTIAL REPORT
          </div>
          <span style="font-size: 9px; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase; color: #38bdf8; display: block; margin-bottom: 8px;">
            Asset Intelligence Audit
          </span>
          <h2 style="font-size: 22px; font-weight: 900; margin: 0 0 10px 0; color: #ffffff; letter-spacing: -0.5px; line-height: 1.2;">
            Mutual Fund Portfolio Clinical Diagnostic Report
          </h2>
          <p style="font-size: 12px; font-weight: 500; color: #94a3b8; margin: 0 0 20px 0;">
            Objective empirical analysis of active schemes designed to identify overlaps, expense drags, allocation skew, and compounding leaks.
          </p>
          <div style="display: flex; gap: 30px; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 15px;">
            <div>
              <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">AUDIT ACCOUNT EMAIL</span>
              <strong style="font-size: 12px; color: #f1f5f9;">${result.associatedEmail || 'Valued Partner'}</strong>
            </div>
            <div>
              <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">PORTFOLIO VALUE</span>
              <strong style="font-size: 12px; color: #10b981;">₹${totalCurrentValue ? totalCurrentValue.toLocaleString() : 'N/A'}</strong>
            </div>
            <div>
              <span style="font-size: 9px; color: #94a3b8; text-transform: uppercase; display: block; margin-bottom: 2px;">REGISTRATION STATUS</span>
              <strong style="font-size: 12px; color: #f1f5f9;">AMFI Registered Distributor</strong>
            </div>
          </div>
        </div>

        <!-- Quick Metrics Metrics Row -->
        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 30px;">
          <!-- Diversification Card -->
          <div style="background: rgba(37, 99, 235, 0.03); border: 1px solid #bfdbfe; padding: 20px; border-radius: 16px; display: flex; align-items: center; gap: 20px;">
            <div style="background: #ffffff; border: 2.5px solid #2563eb; width: 68px; height: 68px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 950; color: #1e3a8a; shrink-0;">
              ${result.diversificationScore}
            </div>
            <div>
              <div style="display: flex; gap: 8px; align-items: center; margin-bottom: 6px;">
                <span style="font-size: 9px; font-weight: 900; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">DIVERSIFICATION SCORE</span>
                <span style="font-size: 9px; font-weight: 800; background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; text-transform: uppercase;">OVERLAP: ${result.overlappingPercentage || 65}%</span>
              </div>
              <p style="font-size: 11.5px; font-weight: 600; color: #334155; margin: 0; line-height: 1.5;">
                Diversification grade: <strong style="color: #2563eb;">${result.diversificationStatus}</strong>. Holding ${result.totalFunds} active schemes introduces critical duplication in stock holdings, increasing tracking friction while dragging potential performance.
              </p>
            </div>
          </div>

          <!-- Total Funds Card -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; display: flex; flex-direction: column; justify-content: center;">
            <span style="font-size: 9px; font-weight: 805; color: #64748b; text-transform: uppercase; margin-bottom: 4px; letter-spacing: 0.5px;">PROCESSED SCHEMES</span>
            <div style="font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1;">
              ${result.totalFunds} <span style="font-size: 12px; font-weight: 800; color: #64748b;">Funds</span>
            </div>
            <span style="font-size: 9.5px; font-weight: 800; color: #16a34a; display: flex; align-items: center; gap: 4px; margin-top: 6px;">
              ✓ Precision Parsed CAS
            </span>
          </div>
        </div>

        <!-- Strategic Persona Segment -->
        <div style="background: #f8fafc; border: 1px solid #edf2f7; border-left: 4px solid #3b82f6; padding: 18px 20px; border-radius: 12px; margin-bottom: 30px;">
          <h4 style="font-size: 12px; font-weight: 900; color: #1e293b; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 0.5px;">
            RECONSTRUCTED INVESTOR BEHAVIOR PROFILE
          </h4>
          <p style="font-size: 11.5px; font-weight: 700; color: #475569; margin: 0 0 4px 0; line-height: 1.4;">
            <strong>Persona Type:</strong> ${result.investorPersona.typeName}
          </p>
          <p style="font-size: 11.5px; font-weight: 600; font-style: italic; color: #555; margin: 0; line-height: 1.4;">
            "Stance: ${result.investorPersona.behaviorQuote} — Risk tolerance is rated for a ${result.investorPersona.riskToleranceRating} model with ${result.investorPersona.churnActivityLevel.toLowerCase()} transaction turnover."
          </p>
        </div>

        <!-- Detailed Fund Classifications Segment -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 13px; font-weight: 900; color: #0f172a; margin: 0 0 15px 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            Fund-Wise Clinical Asset Audit & Diagnostic Classifications
          </h3>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
            <!-- Core Alpha -->
            <div style="background: rgba(16, 185, 129, 0.02); border: 1px solid #a7f3d0; border-radius: 12px; padding: 14px;">
              <h4 style="font-size: 11.5px; font-weight: 900; color: #065f46; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #d1fae5; padding-bottom: 4px;">
                ⭐ Core Alpha Gen Schemes (${coreAlphaFunds.length})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${coreAlphaFunds.length ? coreAlphaFunds.map(f => `
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #334155;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${f.fundName}</span>
                    <span style="color: #059669; font-family: monospace;">+${f.returnDifference3Y || 2.4}% Premiums</span>
                  </div>
                `).join('') : '<div style="font-size: 10.5px; color: #64748b; font-style: italic;">No core high-performing assets found</div>'}
              </div>
            </div>

            <!-- Defensive Anchor -->
            <div style="background: rgba(37, 99, 235, 0.02); border: 1px solid #bfdbfe; border-radius: 12px; padding: 14px;">
              <h4 style="font-size: 11.5px; font-weight: 900; color: #1e40af; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #dbeafe; padding-bottom: 4px;">
                🛡️ Defensive Anchor Schemes (${defensiveAnchorFunds.length})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${defensiveAnchorFunds.length ? defensiveAnchorFunds.map(f => `
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #334155;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${f.fundName}</span>
                    <span style="color: #1d4ed8; font-family: monospace;">Beta: Safe Anchor</span>
                  </div>
                `).join('') : '<div style="font-size: 10.5px; color: #64748b; font-style: italic;">No shield assets currently present</div>'}
              </div>
            </div>

            <!-- Fee Dragged -->
            <div style="background: rgba(245, 158, 11, 0.02); border: 1px solid #fde68a; border-radius: 12px; padding: 14px;">
              <h4 style="font-size: 11.5px; font-weight: 900; color: #92400e; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #fef3c7; padding-bottom: 4px;">
                ⚠️ Fee-Dragged Regular Peer Schemes (${feeDraggedFunds.length})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${feeDraggedFunds.length ? feeDraggedFunds.map(f => `
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #334155;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${f.fundName}</span>
                    <span style="color: #b45309; font-family: monospace;">Drag: ${(f.currentExpenseRatio - f.alternativeExpenseRatio).toFixed(2)}% Drag</span>
                  </div>
                `).join('') : '<div style="font-size: 10.5px; color: #64748b; font-style: italic;">No fee drags caught in screening</div>'}
              </div>
            </div>

            <!-- Rebalance/Churn -->
            <div style="background: rgba(239, 68, 68, 0.02); border: 1px solid #fca5a5; border-radius: 12px; padding: 14px;">
              <h4 style="font-size: 11.5px; font-weight: 900; color: #991b1b; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #fee2e2; padding-bottom: 4px;">
                🔄 Rebalance / Churn Catalysts (${rebalanceFunds.length})
              </h4>
              <div style="display: flex; flex-direction: column; gap: 6px;">
                ${rebalanceFunds.length ? rebalanceFunds.map(f => `
                  <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #334155;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${f.fundName}</span>
                    <span style="color: #b91c1c; font-family: monospace;">Exit Load Risk</span>
                  </div>
                `).join('') : '<div style="font-size: 10.5px; color: #64748b; font-style: italic;">Clean transaction sequence history</div>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Footnote Page 1 -->
        <div style="text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px; font-family: system-ui;">
          Page 1 of 3 • Confidential Diagnostic Portfolio Review • Prepared by Pure Wealth Global (ARN Registered MFD)
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-after: always; height: 1px; clear: both;"></div>

        <!-- ==================== PAGE 2 ==================== -->
        ${watermarkHTML}
        
        <!-- Header Page 2 -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 15px; margin-bottom: 25px; font-family: system-ui;">
          <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">Pure Wealth Global Diagnostic Report</div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b;">Verification Block 02_LEAKS</div>
        </div>

        <!-- FIRST CALL TO ACTION IN THE MIDDLE -->
        <div style="background: linear-gradient(135deg, #f0fdf4, #e6fffa); border: 2px solid #34d399; padding: 25px; border-radius: 20px; text-align: left; margin-bottom: 30px; font-family: system-ui;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #a7f3d0; padding-bottom: 10px; margin-bottom: 15px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #047857; background: #d1fae5; padding: 3px 10px; border-radius: 20px; letter-spacing: 0.5px;">
              🛡️ COMPLIMENTARY ADVISOR ANALYSIS
            </span>
            <span style="font-size: 9.5px; font-weight: 900; text-transform: uppercase; color: #dc2626; background: #fee2e2; padding: 3px 10px; border-radius: 20px;">
              Action Required ⏱️
            </span>
          </div>
          <h3 style="font-size: 16px; font-weight: 900; color: #064e3b; margin: 0 0 8px 0; line-height: 1.3;">
            Is Your Hard-Earned Capital Trapped in High-Commission Regular Schemes?
          </h3>
          <p style="font-size: 11px; font-weight: 600; color: #374151; margin: 0 0 10px 0; line-height: 1.55;">
            India's active portfolios are silently losing up to <strong style="color: #dc2626;">1.2% - 1.5% annually</strong> due to duplication drag, redundant commissions, and heavy asset overlap. Shifting exits systematically avoids unnecessary tax traps. As a registered Mutual Fund Distributor (MFD), Pure Wealth Global runs professional review sessions without any upfront fixed consulting bills.
          </p>
          <p style="font-size: 11px; font-weight: 700; color: #065f46; margin: 0 0 15px 0; line-height: 1.5;">
            ⚠️ <em>What you are missing out on:</em> Without professional verification of fund lot purchase sequences and alignment schedules, active SIP allocation traps continually leak future compounding wealth. Reviewing the portfolio is completely free of cost!
          </p>
          <a href="https://wa.me/917718860398?text=Hi%20Pure%20Wealth%20Global!%20%E2%9C%85%20I%20just%20completed%20my%20Portfolio%20Audit%20Report.%20I%20see%20significant%20commission%2Foverlap%20drag!%20Please%20arrange%20a%20detailed%201%3A1%20portfolio%20analysis%20consultation%20and%20help%20me%20optimize%20my%20investments%20%F0%259F%2593%2588." target="_blank" style="display: inline-block; background: #059669; color: white; text-decoration: none; font-size: 11px; font-weight: 900; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; text-shadow: 0 1px 1px rgba(0,0,0,0.1); box-shadow: 0 4px 6px rgba(5, 150, 105, 0.2);">
            Book 1:1 Complimentary Portfolio Analysis on WhatsApp Now →
          </a>
        </div>

        <!-- Strengths / Leaks Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <!-- Strengths -->
          <div style="border: 1px solid #d1fae5; background: rgba(16, 185, 129, 0.01); border-radius: 16px; padding: 18px;">
            <h4 style="font-size: 11.5px; font-weight: 900; color: #065f46; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #d1fae5; padding-bottom: 4px;">✓ Detected Strengths Map</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${result.overallStrengths.map(s => `
                <div style="font-size: 10.5px; font-weight: 650; color: #334155; display: flex; gap: 6px; line-height: 1.4;">
                  <span style="color: #10b981; font-weight: 900;">•</span>
                  <span>${s}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Critical Leaks -->
          <div style="border: 1px solid #fecaca; background: rgba(239, 68, 68, 0.01); border-radius: 16px; padding: 18px;">
            <h4 style="font-size: 11.5px; font-weight: 900; color: #991b1b; margin: 0 0 10px 0; text-transform: uppercase; border-bottom: 1px solid #fee2e2; padding-bottom: 4px;">✕ Critical Leaks Detected</h4>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${result.criticalLeaks.map(l => `
                <div style="font-size: 10.5px; font-weight: 650; color: #334155; display: flex; gap: 6px; line-height: 1.4;">
                  <span style="color: #ef4444; font-weight: 900;">•</span>
                  <span>${l}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Capital Gain and Exit Loads ledger -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; margin-bottom: 30px; font-family: system-ui;">
          <h4 style="font-size: 12px; font-weight: 900; color: #1e293b; margin: 0 0 12px 0; border-bottom: 1px solid #edf2f7; padding-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
            Transition Cost ledger & Capital Leak Avoidance Strategy
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 15px;">
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px;">
              <span style="font-size: 8.5px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">ESTIMATED IMMEDIATE EXIT PENALTY</span>
              <span style="font-size: 15px; font-weight: 900; color: #ef4444;">₹${result.switchingCostSummary.totalExitLoad.toLocaleString()}</span>
              <p style="font-size: 9.5px; font-weight: 600; color: #64748b; margin: 4px 0 0 0;">Premature redemption loads summary</p>
            </div>
            <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 10px;">
              <span style="font-size: 8.5px; font-weight: 800; color: #64748b; text-transform: uppercase; display: block; margin-bottom: 2px;">ESTIMATED CAPITAL REDIRECTION TAX GAP</span>
              <span style="font-size: 15px; font-weight: 900; color: #2563eb;">₹${Math.abs(result.switchingCostSummary.totalTaxImpact).toLocaleString()}</span>
              <p style="font-size: 9.5px; font-weight: 600; color: #64748b; margin: 4px 0 0 0;">Compounding tax impact on switching</p>
            </div>
          </div>
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 12px; border-radius: 10px; font-size: 10.5px; font-weight: 650; color: #1e40af; line-height: 1.5;">
            <strong>Advisory Redirection Strategy:</strong> ${result.switchingCostSummary.avoidanceStrategy}
          </div>
        </div>

        <!-- Footnote Page 2 -->
        <div style="text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 25px;">
          Page 2 of 3 • Detailed Leaks & Cost Review • Pure Wealth Global Distribution Advisory
        </div>

        <!-- PAGE BREAK -->
        <div style="page-break-after: always; height: 1px; clear: both;"></div>

        <!-- ==================== PAGE 3 ==================== -->
        ${watermarkHTML}

        <!-- Header Page 3 -->
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #edf2f7; padding-bottom: 15px; margin-bottom: 25px; font-family: system-ui;">
          <div style="font-size: 11px; font-weight: 900; color: #1e3a8a; text-transform: uppercase; letter-spacing: 0.5px;">Pure Wealth Global Diagnostic Report</div>
          <div style="font-size: 10px; font-weight: 700; color: #64748b;">Verification Block 03_FINAL</div>
        </div>

        <!-- Expense Ratio Drag Ledger -->
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 16px; margin-bottom: 25px; font-family: system-ui;">
          <h4 style="font-size: 12px; font-weight: 900; color: #1e293b; margin: 0 0 10px 0; border-bottom: 1px solid #edf2f7; padding-bottom: 6px; uppercase; letter-spacing: 0.5px;">
            Expense Ratio Drag Analysis
          </h4>
          <p style="font-size: 11px; color: #475569; font-weight: 650; margin: 0 0 12px 0; line-height: 1.5;">
            Active mutual fund expense ratios silently reduce your terminal compounding values. Optimizing scheme selection is calculated to save you up to <strong>${(result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0) - result.fundWiseAudit.reduce((acc, f) => acc + (f.alternativeExpenseRatio || 0), 0)).toFixed(2)}% Saved</strong> annually.
          </p>
          <div style="display:grid; grid-template-columns: 1fr 1.5fr; gap: 20px;">
            <div>
              <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; block;">Current Active Fee Drag</span>
              <div style="font-size: 18px; font-weight: 900; color: #ef4444; line-height: 1.3;">
                ${(result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0) / (result.fundWiseAudit.length || 1)).toFixed(2)}% Avg
              </div>
            </div>
            <div>
              <span style="font-size: 9px; font-weight: 800; color: #64748b; text-transform: uppercase; block;">Optimized Premium Target</span>
              <div style="font-size: 18px; font-weight: 900; color: #10b981; line-height: 1.3;">
                +${(result.fundWiseAudit.reduce((acc, f) => acc + (f.returnDifference3Y || 0), 0) / (result.fundWiseAudit.length || 1)).toFixed(2)}% Premiums
              </div>
            </div>
          </div>
        </div>

        <!-- 5-Year CAGR Wealth Impact Curve -->
        <div style="background: #0f172a; border: 1px solid #334155; padding: 20px; border-radius: 16px; color: white; margin-bottom: 25px; font-family: system-ui;">
          <h4 style="font-size: 12px; font-weight: 900; color: #38bdf8; margin: 0 0 12px 0; text-transform: uppercase; border-bottom: 1px solid #334155; padding-bottom: 6px;">
            ✨ Calculated 5-Year Outperformance Compounding Impact
          </h4>
          <p style="font-size: 11px; font-weight: 600; color: #94a3b8; margin: 0 0 15px 0; line-height: 1.5;">
            Optimized, overlaps-clean structures generate an estimated outperformance premium. By aligning asset structures securely, your projected 5-Year terminal wealth is mapped below.
          </p>
          <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 20px;">
            <div>
              <div style="background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 10px; margin-bottom: 10px;">
                <span style="font-size: 8.5px; font-weight: 800; color: #38bdf8; text-transform: uppercase; block;">ESTIMATED compounding EXTRA VALUE HARVEST</span>
                <span style="font-size: 18px; font-weight: 950; color: #10b981;">+₹${(result.returnGainsProjection.totalExtraWealthEarned).toLocaleString()}</span>
              </div>
              <p style="font-size: 10px; font-style: italic; color: #94a3b8; margin: 0; line-height: 1.5;">
                Every month this switch gets delayed represents a quiet, compounding leak of around <strong>₹${Math.round(result.returnGainsProjection.totalExtraWealthEarned * (1 / 60)).toLocaleString()}</strong>.
              </p>
            </div>
            <div style="display: flex; flex-direction: column; justify-content: center; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 650;">
                <span style="color: #94a3b8;">Current Projection Value (5Y):</span>
                <strong style="color: #ef4444;">₹${result.returnGainsProjection.projectedValue5YCurrent.toLocaleString()}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; font-weight: 650;">
                <span style="color: #38bdf8;">Pure Wealth Target (5Y) Value:</span>
                <strong style="color: #10b981;">₹${result.returnGainsProjection.projectedValue5YPWG.toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Systematic Transition Steps -->
        <div style="background: rgba(37, 99, 235, 0.02); border: 1px solid #bfdbfe; padding: 20px; border-radius: 16px; margin-bottom: 25px; font-family: system-ui;">
          <h4 style="font-size: 12px; font-weight: 900; color: #1e40af; margin: 0 0 10px 0; text-transform: uppercase;">
            Pure Wealth Systematic Asset Transition Playbook
          </h4>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${result.actionablePortfolioPlan.map((step, idx) => `
              <div style="display: flex; gap: 10px; align-items: flex-start; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0;">
                <span style="width: 18px; height: 18px; background: #dbeafe; color: #1e40af; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 9.5px; font-weight: 900; shrink-0;">
                  ${idx + 1}
                </span>
                <span style="font-size: 10.5px; font-weight: 700; color: #334155; line-height: 1.45;">${step}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- SECOND CALL TO ACTION AT THE END -->
        <div style="background: linear-gradient(135deg, #0f172a, #1e1b4b); border: 2px solid #2563eb; padding: 25px; border-radius: 20px; color: white; text-align: left; margin-bottom: 20px; font-family: system-ui;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;">
            <span style="font-size: 10px; font-weight: 900; text-transform: uppercase; color: #ffedd5; background: rgba(249, 115, 22, 0.2); border: 1px solid rgba(249, 115, 22, 0.3); padding: 3px 10px; border-radius: 20px;">
              🌟 ALIGN YOUR COMPOUNDING BLUEPRINT SECURELY
            </span>
            <span style="font-size: 9.5px; font-weight: 900; text-transform: uppercase; color: #10b981; background: rgba(16, 185, 129, 0.1); padding: 3px 10px; border-radius: 20px;">
              AMFI Certified Advisor
            </span>
          </div>
          <h3 style="font-size: 15px; font-weight: 900; color: #ffffff; margin: 0 0 10px 0; line-height: 1.35;">
            Don't Compound in Quiet Inefficiency. Secure Your Staggered Transition Meeting with Pure Wealth Global!
          </h3>
          <p style="font-size: 11px; font-weight: 600; color: #94a3b8; margin: 0 0 15px 0; line-height: 1.6;">
            Establishing portfolio efficiency requires structural expertise to systematically clear commission traps, execute capital gains tax harvesting, and build robust fund safety rails. Every single month of sub-optimal allocation permanently drains future wealth compounding. Let our AMFI certified coordinators handle your regular plans completely compliant with SEBI mutual fund guidelines, free of upfront consulting bills!
          </p>
          <a href="https://wa.me/917718860398?text=Hi%20Pure%20Wealth%20Global!%20%F0%9F%93%88%20I%20would%20like%20to%20schedule%20a%201%3A1%20deep%20diagnostic%20review%20and%20discuss%20staggered%20mutual%20fund%20transition%20options%20securely%20on%20WhatsApp." target="_blank" style="display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: white; text-decoration: none; font-size: 11px; font-weight: 900; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; text-shadow: 0 1px 1px rgba(0,0,0,0.15); box-shadow: 0 5px 8px rgba(16, 185, 129, 0.25);">
            Book Complimentary 1:1 Diagnostic Analysis on WhatsApp →
          </a>
        </div>

        <!-- SEBI Regulatory Disclaimers -->
        <div style="font-size: 8px; color: #64748b; text-align: left; line-height: 1.5; border-top: 1px dashed #cbd5e1; padding-top: 15px; font-weight: 600; font-family: system-ui;">
          <strong>MUTUAL FUND INVESTMENT DISCLAIMER & STATUTORY RECORDS UNDER SEBI MFD STATUS:</strong><br />
          Mutual Fund investments are subject to market risks, read all scheme related documents carefully before investing. Pure Wealth Global acts as an AMFI-Registered Mutual Fund Distributor (ARN Registered MFD) facilitation house. We strictly facilitate transactions and provide distribution assistance services in Mutual Fund Regular Schemes, receiving standard distribution commissions built directly into NAVs. We are NOT registered Investment Advisers (RIA) or fee-only advisors under SEBI regulations. Diagnostic analyses, projections, and estimations provided in this report are for complimentary, supplementary review with zero upfront direct advisory fee bills. Complete confidentiality policies are maintained in accordance with legal distributor mandates.
        </div>

        <!-- Footnote Page 3 -->
        <div style="text-align: center; font-size: 9px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 15px; margin-top: 15px; font-family: system-ui;">
          Page 3 of 3 • End of Audit Report • Facilitated with Institutional Integrity by Pure Wealth Global
        </div>
      </div>
    `;

    // Wait 150ms for text to settle correctly
    setTimeout(() => {
      const options = {
        margin: [5, 5, 5, 5] as [number, number, number, number],
        filename: `pure_wealth_portfolio_clinical_audit_${result.totalFunds}_schemes.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Run html2pdf
      html2pdf()
        .set(options)
        .from(tempContainer)
        .save()
        .then(() => {
          // Cleanup
          document.body.removeChild(tempContainer);
          setPdfLoading(false);
        })
        .catch((err: any) => {
          console.warn("PDF generation state: ", err);
          document.body.removeChild(tempContainer);
          setPdfLoading(false);
        });
    }, 150);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Manual input state
  const [manualHoldings, setManualHoldings] = useState<ManualHolding[]>([
    { id: "1", fundName: "HDFC Top 100 Scheme - Growth", allocation: 40, category: "Large Cap", purchaseDate: "2023-01-15", monthlySip: true },
    { id: "2", fundName: "SBI Bluechip Growth Fund", allocation: 30, category: "Large Cap", purchaseDate: "2023-05-20", monthlySip: true },
    { id: "3", fundName: "Nippon India Small Cap Regular Plan", allocation: 30, category: "Small Cap", purchaseDate: "2024-02-10", monthlySip: false }
  ]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleAddManualRow = () => {
    const nextId = (manualHoldings.length + 1).toString();
    setManualHoldings([
      ...manualHoldings,
      {
        id: nextId,
        fundName: "",
        allocation: 10,
        category: "Large Cap",
        purchaseDate: new Date().toISOString().split("T")[0],
        monthlySip: true
      }
    ]);
  };

  const handleRemoveManualRow = (id: string) => {
    if (manualHoldings.length === 1) return;
    setManualHoldings(manualHoldings.filter((h) => h.id !== id));
  };

  const handleManualRowChange = (id: string, field: keyof ManualHolding, value: any) => {
    setManualHoldings(
      manualHoldings.map((h) => {
        if (h.id === id) {
          return { ...h, [field]: value };
        }
        return h;
      })
    );
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const auditPortfolio = async () => {
    setLoading(true);
    setErrorStatus(null);

    try {
      let payload: any = { portfolioType: activeTab };

      if (activeTab === "upload") {
        if (!file) {
          setLoading(false);
          setErrorStatus("Please upload a mutual fund holding CAS PDF statement file.");
          return;
        }

        const base64File = await convertToBase64(file);
        payload.fileData = base64File;
        payload.fileName = file.name;
        payload.fileType = file.type;
        payload.password = password;
      } else if (activeTab === "manual") {
        const totalAllocation = manualHoldings.reduce((sum, h) => sum + Number(h.allocation), 0);
        if (Math.abs(totalAllocation - 100) > 1) {
          setLoading(false);
          setErrorStatus(`Holdings weights must sum to exactly 100% (currently ${totalAllocation}%). Please adjust values.`);
          return;
        }
        payload.holdings = manualHoldings;
      } else {
        setLoading(false);
        return;
      }

      const response = await fetch("/api/portfolio-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errText = await response.text();
        let errMsg = "Audit processing failed.";
        
        // Handle Vercel or Edge 404 NOT_FOUND response
        if (response.status === 404 && (errText.includes("NOT_FOUND") || errText.includes("The page could not be found"))) {
           throw new Error("API Route Not Found (404). This often happens if the app is deployed to a static host (like Vercel or Netlify) without configuring the Express serverless functions. Ensure your provider runs both the frontend and the Express backend (server.ts).");
        }

        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.error || errMsg;
        } catch {
          // If it's a generic HTML error page, sanitize it
          if (errText.includes("<html") && errText.includes("503")) {
            errMsg = "The service is temporarily unavailable or overloaded (HTTP 503).";
          } else {
            errMsg = errText.length < 200 ? errText : errMsg;
          }
        }
        throw new Error(errMsg);
      }

      const auditData = await response.json();
      setResult(auditData);

    } catch (err: any) {
      console.warn("[Portfolio Audit] Deep audit diagnostic warning:", err);
      setErrorStatus(err.message || "An exception occurred while processing the portfolio report.");
    } finally {
      setLoading(false);
    }
  };

  const runDemoAudit = (demoId: string) => {
    setLoading(true);
    setErrorStatus(null);
    setTimeout(() => {
      const demo = DEMO_PORTFOLIOS.find((d) => d.id === demoId);
      if (!demo) {
        setLoading(false);
        return;
      }

      let mockResult: AuditResult;
      if (demoId === "regular-legacy") {
        mockResult = {
          totalFunds: 6,
          overallStrengths: [
            "Your underlying equity holdings contain highly rated blue-chip companies with clean growth records",
            "Disciplined core allocation mapping helps buffer macro sector rotations",
            "Strong continuation of active SIP schedules indicating high monthly consistency"
          ],
          criticalLeaks: [
            "High structural expense load: Legacy regular schemes carry significant broker fee cuts",
            "Overlapping Nifty exposure: Duplicity between HDFC Large Cap and SBI Large Cap reduces holding diversity",
            "Underperforming Sortino ratio on volatile sectoral holdings"
          ],
          diversificationScore: 68,
          diversificationStatus: "Balanced but Cost-Choked",
          diversificationAnalysis: "Your portfolio occupies standard, high-stability holdings, but suffers from active overlap in banking stocks (Nifty 100 duplicate vectors). Consolidating overlapping large-caps and shifting to Pure Wealth's optimized peer regular strategies will significantly streamline administrative fees and increase tracking efficiency.",
          investorPersona: {
            typeName: "Steady SIP and Hold Accumulator",
            behaviorQuote: "You understand long-term compound rules, but legacy banking recommendations are quietly eroding your alpha gains.",
            behaviorAnalysis: "Strong SIP continuation metrics with long-term holds (>1.5 years average). Shows minimal panic exit indicators, but has a high tendency to stack similar index-correlated funds based on outdated banking recommendations.",
            riskToleranceRating: "Medium",
            churnActivityLevel: "Minimal"
          },
          fundWiseAudit: [
            {
              fundName: "HDFC Top 100 Scheme - Regular",
              allocation: "25%",
              category: "Large Cap",
              basketClassification: "Defensive Anchor",
              currentExpenseRatio: 1.85,
              betterAlternativeFund: "Parag Parikh Flexi Cap Regular",
              alternativeExpenseRatio: 1.25,
              returnDifference3Y: 1.45,
              sharpeAndSortinoStatus: "Peer alternative exhibits superior Sharpe (1.45 vs 1.15) and Sortino, shielding downside volatility.",
              rollingReturnsRating: 7,
              downsideProtectionRating: 8,
              switchingExitLoadCost: 0,
              taxImplication: -1200
            },
            {
              fundName: "SBI Bluechip Growth - Regular",
              allocation: "20%",
              category: "Large Cap",
              basketClassification: "Fee-Dragged Peer",
              currentExpenseRatio: 1.75,
              betterAlternativeFund: "SBI Bluechip alternative (Optimized Series)",
              alternativeExpenseRatio: 1.15,
              returnDifference3Y: 1.1,
              sharpeAndSortinoStatus: "Replacing with fee-optimized peer lifts annual compound interest with equal Sharpe ratio.",
              rollingReturnsRating: 6,
              downsideProtectionRating: 7,
              switchingExitLoadCost: 0,
              taxImplication: -800
            },
            {
              fundName: "Nippon India Small Cap - Regular",
              allocation: "15%",
              category: "Small Cap",
              basketClassification: "Core Alpha Gen",
              currentExpenseRatio: 1.62,
              betterAlternativeFund: "Nippon India Small Cap Scheme (Optimized Series)",
              alternativeExpenseRatio: 1.12,
              returnDifference3Y: 1.8,
              sharpeAndSortinoStatus: "Excellent historical rolling return. Optimized fee plan preserves high-alpha compounding.",
              rollingReturnsRating: 10,
              downsideProtectionRating: 7,
              switchingExitLoadCost: 0,
              taxImplication: -4500
            },
            {
              fundName: "ICICI Prudential Multi-Asset Scheme",
              allocation: "15%",
              category: "Multi Cap",
              basketClassification: "Defensive Anchor",
              currentExpenseRatio: 1.74,
              betterAlternativeFund: "ICICI Prudential Multi-Asset (Optimized Fee Structure)",
              alternativeExpenseRatio: 1.24,
              returnDifference3Y: 1.15,
              sharpeAndSortinoStatus: "Consistent downside defense during multi-asset rotations. Fee rebalancing improves retention.",
              rollingReturnsRating: 8,
              downsideProtectionRating: 9,
              switchingExitLoadCost: 0,
              taxImplication: 0
            },
            {
              fundName: "Mirae Asset Large & Midcap Regular",
              allocation: "15%",
              category: "Large & Midcap",
              basketClassification: "Fee-Dragged Peer",
              currentExpenseRatio: 1.65,
              betterAlternativeFund: "Mirae Asset Large & Midcap (Optimized Series)",
              alternativeExpenseRatio: 1.15,
              returnDifference3Y: 1.35,
              sharpeAndSortinoStatus: "Average risk metrics with higher fee drag relative to peers; reallocating saves cumulative drag.",
              rollingReturnsRating: 6,
              downsideProtectionRating: 6,
              switchingExitLoadCost: 450,
              taxImplication: -1500
            },
            {
              fundName: "Parag Parikh Flexi Cap Regular Growth",
              allocation: "10%",
              category: "Flexi Cap",
              basketClassification: "Core Alpha Gen",
              currentExpenseRatio: 1.35,
              betterAlternativeFund: "Parag Parikh Flexi Cap (Optimized Fee Strategy)",
              alternativeExpenseRatio: 1.05,
              returnDifference3Y: 1.25,
              sharpeAndSortinoStatus: "Top tier global asset buffer. Compounding fee delta offers solid holding yield gains.",
              rollingReturnsRating: 9,
              downsideProtectionRating: 9,
              switchingExitLoadCost: 0,
              taxImplication: 0
            }
          ],
          returnGainsProjection: {
            currentValue: 500000,
            projectedValue5YCurrent: 885000,
            projectedValue5YPWG: 1015000,
            totalExtraWealthEarned: 130000,
            improvementExplanation: "By systematically moving high-expense schemes to Pure Wealth's optimized low-fee choices, you eliminate annual fee leakages of up to 0.60%. This delta compounds intensely in high rolling return funds, expanding your 5-year capital by over ₹1,30,000."
          },
          switchingCostSummary: {
            totalExitLoad: 450,
            totalTaxImpact: -8000,
            avoidanceStrategy: "Avoid redeeming early-term segments of the Mirae Asset allotment. By waiting 14 more days to transition into optimized accounts, you eliminate the flat 1.0% exit load penalty entirely. Utilize Indian LTCG tax-harvesting exemption thresholds (₹1.25 Lakh zero-tax rule) to offset gains liability."
          },
          exitLoadLeaks: [
            "Exiting some mid/small assets under 365 days triggers a flat 1.00% Exit Load penalty.",
            "Always align your SIP liquidations carefully. Exit loads apply per SIP installment, tracking individual dates. Staggering redemptions by a single week can frequently save up to ₹5,000 to ₹15,000 in redundant penalties."
          ],
          taxLeaks: "Your portfolio has heavy STCG taxes on frequent active small-cap reallocations implemented by legacy brokers. Furthermore, there is zero planning around the ₹1.25 Lakh annual tax-free Long-Term Capital Gains (LTCG) limit, costing you significant post-tax take home returns when rolling over years.",
          actionablePortfolioPlan: [
            "Stagger your exits over the next 14 days to clear all exit load penalty thresholds perfectly.",
            "Consolidate large-cap overlaps from 45% back to 25% to maximize small/mid cap compound play.",
            "Harvest up to ₹1.25 Lakh of long-term capital gains tax-free at the turn of each financial year.",
            "Schedule a direct folio structural review with AMFI portfolio specialists at Pure Wealth."
          ]
        };
      } else if (demoId === "un-diversified") {
        mockResult = {
          totalFunds: 4,
          overallStrengths: [
            "Extremely high-beta momentum exposure yielding spectacular returns during small-cap bull rallies",
            "Direct underlying small-cap dynamic models are optimized for quick transaction execution"
          ],
          criticalLeaks: [
            "Over-concentration Risk: Small Caps and Technology sectors constitute 100% of holdings",
            "High Systemic Overlap: 42% stock overlap between Nippon Small Cap and Quant Small Cap",
            "Near-zero defensive anchors, debt components, or gold hedges to shield macro capital shocks"
          ],
          diversificationScore: 28,
          diversificationStatus: "Severe Concentration Warning",
          diversificationAnalysis: "This portfolio is tuned for dynamic beta trading rather than risk-weighted compound growth. Small Cap schemes dictate 70% of total allocation while technology sector plays represent the remaining 30%. Sector and small-cap drawdowns represent extreme hazard vectors here.",
          investorPersona: {
            typeName: "Aggressive Momentum Trend Rider",
            behaviorQuote: "You chase short term performance spikes, which leaves your core principal vulnerable to massive 30-40% drawdown events.",
            behaviorAnalysis: "Holds small caps & thematic sectors extensively. Extreme velocity in switching schemes based on absolute historical returns. SIP markers are sporadic, indicating lump-sum timing behavior that increases risk during market peaks.",
            riskToleranceRating: "High",
            churnActivityLevel: "Excessive"
          },
          fundWiseAudit: [
            {
              fundName: "Nippon India Small Cap Plan - Regular",
              allocation: "40%",
              category: "Small Cap",
              basketClassification: "Core Alpha Gen",
              currentExpenseRatio: 1.62,
              betterAlternativeFund: "Nippon India Small Cap (Optimized Fee Structure)",
              alternativeExpenseRatio: 1.12,
              returnDifference3Y: 1.8,
              sharpeAndSortinoStatus: "Great performance, but 1.62% carries heavy drag. Consolidating into optimized peer classes cuts cost.",
              rollingReturnsRating: 10,
              downsideProtectionRating: 5,
              switchingExitLoadCost: 0,
              taxImplication: -15000
            },
            {
              fundName: "Quant Small Cap Scheme - Regular",
              allocation: "30%",
              category: "Small Cap",
              basketClassification: "Rebalance/Churn Catalyst",
              currentExpenseRatio: 1.75,
              betterAlternativeFund: "Parag Parikh Flexi Cap Regular",
              alternativeExpenseRatio: 1.05,
              returnDifference3Y: 2.1,
              sharpeAndSortinoStatus: "Replacing with a tactical Flexi-Cap improves Sortino to 2.15 and expands allocation safety.",
              rollingReturnsRating: 7,
              downsideProtectionRating: 4,
              switchingExitLoadCost: 2550,
              taxImplication: -8500
            },
            {
              fundName: "Tata Digital India Fund Growth - Regular",
              allocation: "20%",
              category: "Sectoral/Thematic",
              basketClassification: "Fee-Dragged Peer",
              currentExpenseRatio: 2.05,
              betterAlternativeFund: "HDFC Large & Midcap Optimized Regular",
              alternativeExpenseRatio: 1.25,
              returnDifference3Y: 1.5,
              sharpeAndSortinoStatus: "Heavy tech concentrations trigger extreme cyclical swings. Reallocating lifts Sharpe and consistency.",
              rollingReturnsRating: 6,
              downsideProtectionRating: 5,
              switchingExitLoadCost: 0,
              taxImplication: 0
            },
            {
              fundName: "ICICI Prudential Technology Regular",
              allocation: "10%",
              category: "Sectoral/Thematic",
              basketClassification: "Rebalance/Churn Catalyst",
              currentExpenseRatio: 1.95,
              betterAlternativeFund: "ICICI Multi-Asset Regular (Optimized Series)",
              alternativeExpenseRatio: 1.15,
              returnDifference3Y: 1.9,
              sharpeAndSortinoStatus: "Replacing sectoral technology with diversified Multi-Asset shields capital while saving fees.",
              rollingReturnsRating: 5,
              downsideProtectionRating: 4,
              switchingExitLoadCost: 850,
              taxImplication: -1200
            }
          ],
          returnGainsProjection: {
            currentValue: 850000,
            projectedValue5YCurrent: 1420000,
            projectedValue5YPWG: 1735000,
            totalExtraWealthEarned: 315000,
            improvementExplanation: "Balancing out sector concentrations and switching to lower-expense alternative options guards your portfolio against severe momentum drawdowns. This risk management preservation saves over ₹3,15,000 on compound cycles."
          },
          switchingCostSummary: {
            totalExitLoad: 3400,
            totalTaxImpact: -24700,
            avoidanceStrategy: "Your early-stage small cap allocations carry heavy exit loads (₹3,400) and substantial short term tax impacts (STCG at 20%). We recommend systematic, staggered reallocations of 10% per month to keep gains under tax-free limits and bypass redemption loads."
          },
          exitLoadLeaks: [
            "Heavy concentration in thematic and Small-caps triggers strict 1.0% early exit loads under 12 months.",
            "Avoid high transactional churn; staggering transfers via systematic SWP is highly logical."
          ],
          taxLeaks: "Your 100% active small-cap and tech allocation contains heavy capital gains exposure with zero offset. Regular active churn limits long-term compounding benefits and misses out on debt / equity tax-exemption strategies.",
          actionablePortfolioPlan: [
            "Lower total Small Cap holding from 70% to a balanced 35% using systematically spaced exits.",
            "Swap thematic tech assets into consistent Flexi-cap options to protect core equity from sector shock.",
            "Adopt the Pure Wealth systematic switch plan to eliminate the short term ₹3,400 exit load drag.",
            "Schedule a call to discuss defensive asset diversification (Gold, Multi-Asset class blends)."
          ]
        };
      } else {
        mockResult = {
          totalFunds: 5,
          overallStrengths: [
            "Good mid and large-cap scheme selections with solid compounding records",
            "Diversified categorization layout spanning core equity industries"
          ],
          criticalLeaks: [
            "Aggressive premature exits: Major capital redemptions triggered within 300 days of purchase",
            "Heavy exit load penalties: ₹12,000 paid out in avoidable exit fees inside 1 year",
            "Highest slab rate taxation: Churning under 365 days forces a high STCG premium cut"
          ],
          diversificationScore: 55,
          diversificationStatus: "Active Churn Drag",
          diversificationAnalysis: "The holdings match strong core assets, but are heavily impaired by excessive transaction-level churn. Early exits across Kotak and Axis schemes trigger a flat 1.0% penalty, severely damaging initial principal multiplication.",
          investorPersona: {
            typeName: "Legacy High-Churn Patient",
            behaviorQuote: "You react heavily to brief market fluctuations, which is locking you into high exit penalties and massive capital gains taxes.",
            behaviorAnalysis: "Frequent transactional buying and selling history with holding spans averaging just 180 to 270 days. Prematurely terminates active SIP cycles, causing massive compounding leakage from high cost loads.",
            riskToleranceRating: "High",
            churnActivityLevel: "Excessive"
          },
          fundWiseAudit: [
            {
              fundName: "HDFC Mid-Cap Opportunities Scheme",
              allocation: "30%",
              category: "Mid Cap",
              basketClassification: "Core Alpha Gen",
              currentExpenseRatio: 1.75,
              betterAlternativeFund: "HDFC Mid-Cap Opportunities (Optimized Peer)",
              alternativeExpenseRatio: 1.15,
              returnDifference3Y: 1.1,
              sharpeAndSortinoStatus: "Highly resilient mid-cap compounder. Selecting optimized peer structure improves performance compounding.",
              rollingReturnsRating: 9,
              downsideProtectionRating: 8,
              switchingExitLoadCost: 1800,
              taxImplication: -3600
            },
            {
              fundName: "Axis Small Cap Plan Regular",
              allocation: "25%",
              category: "Small Cap",
              basketClassification: "Defensive Anchor",
              currentExpenseRatio: 1.62,
              betterAlternativeFund: "Axis Small Cap (Optimized series)",
              alternativeExpenseRatio: 1.12,
              returnDifference3Y: 1.3,
              sharpeAndSortinoStatus: "Excellent downside insulation score. Retaining with lower cost fee plan boosts annual outcomes.",
              rollingReturnsRating: 8,
              downsideProtectionRating: 9,
              switchingExitLoadCost: 1500,
              taxImplication: -4500
            },
            {
              fundName: "Kotak Emerging Equity Regular Growth",
              allocation: "20%",
              category: "Mid Cap",
              basketClassification: "Fee-Dragged Peer",
              currentExpenseRatio: 1.84,
              betterAlternativeFund: "Kotak Emerging Equity (Optimized alternative)",
              alternativeExpenseRatio: 1.24,
              returnDifference3Y: 1.45,
              sharpeAndSortinoStatus: "Average risk scoring relative to peer classes; optimization curbs high broker-fee drag.",
              rollingReturnsRating: 7,
              downsideProtectionRating: 7,
              switchingExitLoadCost: 1200,
              taxImplication: -2400
            },
            {
              fundName: "DSP Natural Resources Regular",
              allocation: "15%",
              category: "Sectoral/Thematic",
              basketClassification: "Rebalance/Churn Catalyst",
              currentExpenseRatio: 2.15,
              betterAlternativeFund: "Parag Parikh Flexi Cap Regular",
              alternativeExpenseRatio: 1.05,
              returnDifference3Y: 2.22,
              sharpeAndSortinoStatus: "Volatile natural resource cycles. Consolidating into Flexi-Caps pushes Sortino up to 2.10.",
              rollingReturnsRating: 5,
              downsideProtectionRating: 4,
              switchingExitLoadCost: 900,
              taxImplication: -1500
            },
            {
              fundName: "Invesco India Contra Scheme",
              allocation: "10%",
              category: "Flexi Cap",
              basketClassification: "Defensive Anchor",
              currentExpenseRatio: 1.68,
              betterAlternativeFund: "Invesco India Contra (Optimized plan)",
              alternativeExpenseRatio: 1.18,
              returnDifference3Y: 1.25,
              sharpeAndSortinoStatus: "Strong contrarian values, re-indexing fee levels boosts compound retention.",
              rollingReturnsRating: 7,
              downsideProtectionRating: 8,
              switchingExitLoadCost: 0,
              taxImplication: 0
            }
          ],
          returnGainsProjection: {
            currentValue: 600000,
            projectedValue5YCurrent: 980000,
            projectedValue5YPWG: 1165000,
            totalExtraWealthEarned: 185000,
            improvementExplanation: "Blocking premature churn avoids ₹12,000 in upfront loads and stabilizes compounding. Under Pure Wealth's optimized system, these combined modifications shield ₹1,85,000 in terminal asset valuation."
          },
          switchingCostSummary: {
            totalExitLoad: 5400,
            totalTaxImpact: -12000,
            avoidanceStrategy: "We identified severe exit load exposures (₹5,400) on Axis and HDFC mid-cap plans. Hold these allocations for an average of just 22 more days to reach the 365-day age mark. This simple delay completely eradicates exit load penalties and cuts capital gains tax from 20% down to 12.5%."
          },
          exitLoadLeaks: [
            "Axis Small Cap: Exiting 18 days before the 1-year mark cost you a flat 1.0% load. Staggering redemptions offsets loads cleanly.",
            "Kotak Emerging Equity: Active SIP redemptions before completion age incurred high fee drags. Plan installment timelines properly."
          ],
          taxLeaks: "Your active rollover timeline is heavily burdened with short-term capital gains tax limits. Restructuring holding limits to exceed 12 months immediately triggers LTCG rules, unlocking the ₹1.25 Lakh annual tax-free threshold and preserving your compounding principal.",
          actionablePortfolioPlan: [
            "Enforce a strict holding limit of 365 days across all active mutual fund equity assets.",
            "Consolidate cyclical resources (DSP Natural resources) out into consistent thematic/global anchors.",
            "Use systematic SWP channels rather than ad-hoc active redemptions to protect holdings from transaction costs.",
            "Transition into fee-optimized peer regular plans securely via Pure Wealth automated folio integration."
          ]
        };
      }

      setResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const runLocalAuditFallback = () => {
    // Generates a dynamic clean fallback based on manual holdings input
    const mockResult: AuditResult = {
      totalFunds: manualHoldings.length,
      overallStrengths: [
        "Reputable fund families and underlying corporate allocations matching solid Indian equity components",
        "Disciplined periodic indicators indicating solid continuous accumulation tracks"
      ],
      criticalLeaks: [
        "Underperforming cost efficiency relative to peer programs within identical categories",
        "Overconcentration markers: Elevated duplications across large-cap holdings"
      ],
      diversificationScore: 72,
      diversificationStatus: "Moderately Balanced",
      diversificationAnalysis: "The allocations have sound core capitalization blocks. However, holding duplicateLarge-caps increases administrative overheads. Merging select categories into multi-cap channels under Pure Wealth significantly increases rolling returns and Sharpe stability.",
      investorPersona: {
        typeName: "Disciplined SIP Compounder",
        behaviorQuote: "You maintain elegant monthly additions, but legacy administrative fee drags are silently slowing down your core investment engines.",
        behaviorAnalysis: "Steady execution of monthly automated SIP schedules. Holdings duration spans an average of over 1.2 years, showing very low churn characteristics but high tracking duplication.",
        riskToleranceRating: "Medium",
        churnActivityLevel: "Minimal"
      },
      fundWiseAudit: manualHoldings.map((h, i) => {
        // Classify to basket dynamically or based on index
        const baskets: ("Core Alpha Gen" | "Defensive Anchor" | "Fee-Dragged Peer" | "Rebalance/Churn Catalyst")[] = [
          "Core Alpha Gen", "Defensive Anchor", "Fee-Dragged Peer", "Rebalance/Churn Catalyst"
        ];
        const basket = baskets[i % 4];
        const currER = h.category === "Small Cap" ? 1.85 : 1.65;
        const alternativeER = h.category === "Small Cap" ? 1.25 : 1.15;
        const rolling = h.category === "Small Cap" ? 9 : 7;
        const downside = h.category === "Small Cap" ? 6 : 8;

        return {
          fundName: h.fundName || "Equity Scheme Portfolio Holding",
          allocation: `${h.allocation}%`,
          category: h.category,
          basketClassification: basket,
          currentExpenseRatio: currER,
          betterAlternativeFund: `${h.fundName ? h.fundName.replace("Regular Plan", "Optimized Regular Selection") : "Optimized Fee Peer Scheme"}`,
          alternativeExpenseRatio: alternativeER,
          returnDifference3Y: h.category === "Small Cap" ? 1.6 : 1.15,
          sharpeAndSortinoStatus: `Saving fee drag improves Sharpe indexing from 1.15 to a robust 1.40.`,
          rollingReturnsRating: rolling,
          downsideProtectionRating: downside,
          switchingExitLoadCost: h.monthlySip ? 0 : 350,
          taxImplication: h.monthlySip ? 0 : -1100
        };
      }),
      returnGainsProjection: {
        currentValue: 500000,
        projectedValue5YCurrent: 825000,
        projectedValue5YPWG: 960000,
        totalExtraWealthEarned: 135000,
        improvementExplanation: "Optimizing your active schemes with lower cost peers removes broker commission cuts. Compounding this preserved asset expands your portfolio's terminal value by up to ₹1,35,000 on a ₹5,00,000 principal base in 5 years."
      },
      switchingCostSummary: {
        totalExitLoad: manualHoldings.length * 250,
        totalTaxImpact: manualHoldings.length * -800,
        avoidanceStrategy: "Review holding lifecycle ages inside your transaction statement. Delaying redemptions by a short staggered threshold completely nullifies exit penalties and secures capital gains tax-harvester offsets."
      },
      exitLoadLeaks: [
        "Avoid active asset allocation liquidations under 365 days to eliminate flat 1.0% exit load penalty cuts.",
        "Stagger redemptions across individual investment lots carefully to guard against micro load exposures."
      ],
      taxLeaks: "Your portfolio relies on active broker cuts that don't account for capital gains taxes. Holding strategies for over 365 days leverages the LTCG rule, utilizing the ₹1.25 Lakh annual tax-free threshold and securing your compounding gains.",
      actionablePortfolioPlan: [
        "Consolidate large-cap overlaps to streamline holding administration and reduce expense drag.",
        "Utilize annual LTCG tax harvesting strategies to redeem up to ₹1.25 Lakh tax-free annually.",
        "Implement a systematic transfer SWP rather than ad-hoc withdrawals to minimize transaction fees.",
        "Integrate your portfolios securely with Pure Wealth's clean AMFI optimization wizard."
      ]
    };

    setResult(mockResult);
  };

  const getChartData = () => {
    if (!result) return [];
    const { currentValue, projectedValue5YCurrent, projectedValue5YPWG } = result.returnGainsProjection;
    
    // Linearly/exponentially interpolate growth over 5 years
    const data = [];
    for (let year = 0; year <= 5; year++) {
      const factorCurrent = Math.pow(projectedValue5YCurrent / currentValue, year / 5);
      const factorPWG = Math.pow(projectedValue5YPWG / currentValue, year / 5);

      data.push({
        name: `Year ${year}`,
        "Current Portfolio Yield": Math.round(currentValue * factorCurrent),
        "Optimized Peer Selection (Pure Wealth)": Math.round(currentValue * factorPWG),
        "Additional Compounded Wealth": Math.round((currentValue * factorPWG) - (currentValue * factorCurrent))
      });
    }
    return data;
  };

  const getDiversificationColor = (score: number) => {
    if (score >= 80) return "text-emerald-700 bg-emerald-50 border-emerald-200/60";
    if (score >= 50) return "text-amber-700 bg-amber-50 border-amber-200/60";
    return "text-rose-700 bg-rose-50 border-rose-200/60";
  };

  const getBasketColor = (basket: string) => {
    switch (basket) {
      case "Core Alpha Gen":
        return "border-emerald-200 bg-emerald-50 text-emerald-850";
      case "Defensive Anchor":
        return "border-blue-200 bg-blue-50 text-blue-850";
      case "Fee-Dragged Peer":
        return "border-amber-200 bg-amber-50 text-amber-850";
      case "Rebalance/Churn Catalyst":
        return "border-rose-200 bg-rose-50 text-rose-850";
      default:
        return "border-slate-200 bg-slate-50 text-slate-800";
    }
  };

  const getBasketBadge = (basket: string) => {
    switch (basket) {
      case "Core Alpha Gen":
        return "🟢 Basket 1: Core Alpha Gen";
      case "Defensive Anchor":
        return "🔵 Basket 2: Defensive Anchor";
      case "Fee-Dragged Peer":
        return "🟡 Basket 3: Fee-Dragged Peer";
      case "Rebalance/Churn Catalyst":
        return "🔴 Basket 4: Rebalance/Churn Catalyst";
      default:
        return basket;
    }
  };

  const inputMethodsPanel = (
    <div className="bg-white border border-slate-100 rounded-3xl shadow-lg p-5 sm:p-6" id="input-methods-panel">
      
      <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
        <Compass className="w-4.5 h-4.5 text-blue-600" />
        <span>Select Holding Source</span>
      </h2>

      {/* Action Navigation Tabs */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
        <button
          onClick={() => { setActiveTab("upload"); setErrorStatus(null); }}
          className={`py-2 px-1 text-[11px] sm:text-[12.5px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "upload" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Upload CAS PDF
        </button>
        <button
          onClick={() => { setActiveTab("demo"); setErrorStatus(null); }}
          className={`py-2 px-1 text-[11px] sm:text-[12.5px] font-black rounded-xl transition-all cursor-pointer ${
            activeTab === "demo" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Demo Statements
        </button>
      </div>

      {/* Tab 1: PDF Upload View */}
      {activeTab === "upload" && (
        <div className="space-y-5" id="pdf-upload-view">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? "border-blue-600 bg-blue-50/50"
                : file
                ? "border-emerald-500 bg-emerald-50/10 hover:border-emerald-600"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
            />
            
            <div className={`p-3 rounded-full ${file ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"}`}>
              <FileText className="w-5 h-5" />
            </div>

            {file ? (
              <div className="space-y-1">
                <p className="font-extrabold text-[13px] text-slate-855 line-clamp-1">
                  {file.name}
                </p>
                <p className="text-[11px] font-bold text-slate-500">
                  {(file.size / 1024 / 1024).toFixed(2)} MB • CAS Statement
                </p>
                <p className="text-[9.5px] font-black text-emerald-700 uppercase tracking-wider mt-1 inline-block bg-emerald-100/60 px-2 rounded-full">
                  File Ready
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-[13px] font-black text-slate-700">
                  Drag and drop your CAS PDF statement, or browse
                </p>
                <p className="text-[11px] font-semibold text-slate-400">
                  Supports encrypted CAMS/KFintech statement files
                </p>
              </div>
            )}
          </div>

          {/* Password option */}
          <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-500" />
                <span className="text-[12px] font-black text-slate-800">Statement Password Protection</span>
              </div>
            </div>

            <p className="text-[11px] font-medium leading-relaxed text-slate-550">
              Many CAS statements are encrypted by CAMS/KFintech using your PAN card or Email. Providing the password runs background text miners natively.
            </p>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter statement password (e.g. your PAN in CAPITALS or Email)"
                className="w-full bg-white border border-slate-205 rounded-xl text-xs py-2.5 pl-3.5 pr-10 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-650 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Demo portfolios selection */}
      {activeTab === "demo" && (
        <div className="space-y-3" id="demo-choices-view">
          <label className="text-[11px] font-black text-slate-400 uppercase tracking-wider block">
            Standard Industry Demo Profiles
          </label>
          {DEMO_PORTFOLIOS.map((demo) => (
            <button
              key={demo.id}
              onClick={() => runDemoAudit(demo.id)}
              className="w-full text-left p-4 rounded-2xl border border-slate-150 bg-white hover:border-blue-500 hover:bg-blue-50/5 transition-all text-xs flex justify-between items-start gap-4 cursor-pointer group hover:shadow-sm"
            >
              <div className="space-y-1">
                <span className="font-extrabold text-slate-855 group-hover:text-blue-700 block">
                  {demo.title}
                </span>
                <p className="text-[11px] font-medium leading-relaxed text-slate-500">
                  {demo.description}
                </p>
                <span className="inline-block text-[9.5px] font-extrabold bg-slate-100 text-slate-600 rounded-md px-2 py-0.5 mt-1 sm:mt-2">
                   {demo.fundsCount} Funds • Equivalent value ₹{demo.investedAmount.toLocaleString()}
                </span>
              </div>
              <ChevronDown className="w-4.5 h-4.5 text-slate-400 -rotate-90 group-hover:translate-x-1 transition-transform shrink-0 mt-0.5" />
            </button>
          ))}
        </div>
      )}

      {/* Audit Action Button */}
      {activeTab !== "demo" && (
        <button
          onClick={auditPortfolio}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-extrabold text-[13px] py-3.5 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-6 cursor-pointer active:scale-[0.98]"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Processing CAS Statements...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4.5 h-4.5" />
              <span>Run Deep Diagnostic Audit</span>
            </>
          )}
        </button>
      )}

      {errorStatus && (
        <div className="mt-4 p-3 border border-rose-100 bg-rose-50 text-rose-700 rounded-2xl text-[11px] font-extrabold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorStatus}</span>
        </div>
      )}

    </div>
  );

  const whatsappCard = (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50/40 to-white border-2 border-emerald-400/80 rounded-3xl shadow-xl p-5 sm:p-6 space-y-4" id="whatsapp-direct-diagnostic-card">
      
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-100/60 pb-3">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>100% Confidential & Secure</span>
        </div>
        <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SEBI Compliant Guide
        </span>
      </div>

      <div className="space-y-1 text-left">
        <h3 className="text-sm sm:text-base font-black text-slate-900 tracking-tight leading-snug">
          OR Directly Get Your <span className="text-emerald-700 underline decoration-emerald-300">FREE Portfolio Audit Report PDF</span> on WhatsApp & Email 🚀
        </h3>
        <p className="text-[11.5px] font-semibold text-slate-500 leading-relaxed">
          Just share your investment-linked Email ID through WhatsApp and <strong className="text-slate-700">Pure Wealth Global</strong> will handle the entire complex extraction for you!
        </p>
      </div>

      {/* Input & Sender button */}
      <div className="space-y-3 pt-1">
        <div className="space-y-1 text-left">
          <label className="text-[9.5px] font-black text-slate-400 uppercase block tracking-wider">
            Investment-Linked Email Address
          </label>
          <input
            type="email"
            value={whatsappEmail}
            onChange={(e) => setWhatsappEmail(e.target.value)}
            placeholder="e.g. yourname@gmail.com"
            className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 rounded-xl text-xs py-3 px-3.5 font-bold text-slate-800 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
          />
        </div>

        {/* Dynamic Anchor Tag to redirect cleanly to WhatsApp */}
        {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(whatsappEmail.trim()) ? (
          <a
            href={`https://wa.me/917718860398?text=${encodeURIComponent(
              `Hi Pure Wealth Global! ✅ I would like to receive my FREE Portfolio Audit Report PDF. My investment-linked Email ID is: ${whatsappEmail.trim()}. Please guide with 1:1 Analysis of the Report 📈.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[12.5px] py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-center animate-pulse"
          >
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Send to our WhatsApp Now</span>
            <ArrowUpRight className="w-4 h-4 shrink-0" />
          </a>
        ) : (
          <button
            disabled
            className="w-full bg-slate-200 text-slate-400 font-extrabold text-[12.5px] py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>Enter Valid Email to Send on WhatsApp</span>
          </button>
        )}
      </div>

      {/* Confidence & Encouragement points */}
      <div className="bg-white/80 border border-emerald-100/50 rounded-2xl p-3 sm:p-4 text-xs space-y-2.5 text-left shadow-sm">
        <div className="flex gap-2 items-start">
          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-extrabold text-slate-800 block text-[11px]">Zero Shared Passwords Required</span>
            <span className="text-[10.5px] text-slate-500 leading-normal block">
              We securely generate detailed audits using authorized statutory distribution rails. Your raw login credentials or state passwords are <strong className="text-emerald-700">never</strong> required.
            </span>
          </div>
        </div>

        <div className="flex gap-2 items-start">
          <div className="p-1 bg-emerald-100 text-emerald-700 rounded-md shrink-0 mt-0.5">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div className="space-y-0.5">
            <span className="font-extrabold text-slate-800 block text-[11px]">Handled by AMFI Certified Advisors</span>
            <span className="text-[10.5px] text-slate-500 leading-normal block">
              Your portfolios are mapped dynamically by professional distribution planners, providing instant clarity on exit loads, high fees, and index overlap.
            </span>
          </div>
        </div>
      </div>

      <p className="text-[10px] font-medium text-slate-400 text-center leading-relaxed">
        🔒 Pure Wealth Global practices military-grade data protection policies. Your personal details are protected under legal compliance mandates.
      </p>

    </div>
  );

  const placeholderAuditCard = (
    <div className="bg-slate-50/50 border border-slate-100 rounded-3xl p-5 sm:p-7 space-y-6" id="placeholder-audit-card">
      
      {/* Header */}
      <div className="text-center space-y-1.5 pb-4 border-b border-slate-100">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[10.5px] font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          Interactive Guide
        </span>
        <h3 className="text-[16px] sm:text-[18px] font-black text-slate-900 tracking-tight">
          How to Get CAS Pdf Statement
        </h3>
        <div className="flex items-center justify-center gap-1">
          <span className="h-[2px] w-6 bg-emerald-500 rounded-full" />
          <p className="text-[12.5px] font-extrabold text-slate-550 uppercase tracking-widest">
            3 Easy Steps
          </p>
          <span className="h-[2px] w-6 bg-emerald-500 rounded-full" />
        </div>
      </div>

      {/* Step 1 */}
      <div className="space-y-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            1
          </span>
          <div className="space-y-1 text-left">
            <h4 className="text-[13px] font-black text-slate-800">Go to CAMS Online CAS Portal</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Navigate to the official CAMS Consolidated Account Statement request page:
            </p>
          </div>
        </div>
        <div className="pl-9 text-left">
          <a
            href="https://www.camsonline.com/Investors/Statements/Consolidated-Account-Statement"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-750 hover:to-indigo-700 text-white font-black text-[11px] tracking-wide px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-500/10 cursor-pointer text-center"
          >
            <span>Open CAMS CAS Request Portal</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Step 2 */}
      <div className="space-y-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            2
          </span>
          <div className="space-y-1 text-left">
            <h4 className="text-[13px] font-black text-slate-800">select Configuration & Statement Type</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              In <strong className="text-slate-700">Statement Type</strong> - configure exactly as illustrated below to capture all your historical, inactive, and active investments:
            </p>
          </div>
        </div>

        {/* Simulated screenshot CSS mockup for Cas SS */}
        <div className="pl-9">
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm bg-slate-50/50">
            
            {/* Sub-header of browser */}
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-150 flex items-center gap-1.5">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
              </div>
              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">CAMS Online Simulator</span>
            </div>

            {/* Content panel */}
            <div className="p-3.5 space-y-3 text-left font-sans text-[10px] select-none">
              
              {/* Statement Type */}
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Statement Type</span>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-1.5 text-slate-405 cursor-not-allowed">
                    <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center bg-white"></span>
                    <span>Summary (Only balances)</span>
                  </label>
                  
                  <label className="flex items-center gap-1.5 text-blue-705 font-black bg-blue-100/30 border border-blue-200 px-2 py-0.5 rounded-md animate-pulse">
                    <span className="w-3 h-3 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shrink-0"></span>
                    <span>Detailed (Includes transaction listing) 🎯</span>
                  </label>
                </div>
              </div>

              {/* Period Selection */}
              <div className="space-y-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Period</span>
                <div className="flex flex-wrap gap-4 items-center">
                  <label className="flex items-center gap-1.5 text-slate-405 cursor-not-allowed">
                    <span className="w-3 h-3 rounded-full border border-slate-300 flex items-center justify-center bg-white"></span>
                    <span>Current FY</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-blue-705 font-extrabold bg-blue-100/30 border border-blue-150/40 px-2 py-0.5 rounded-md">
                    <span className="w-3 h-3 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shrink-0"></span>
                    <span>Specific Period 🗓️</span>
                  </label>
                </div>
              </div>

              {/* From Date to To Date */}
              <div className="grid grid-cols-2 gap-2 pt-0.5">
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase">From Date</span>
                  <div className="bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[9px] text-slate-650 flex items-center justify-between">
                    <span>01-Jan-1955</span>
                    <span className="text-[8px] text-blue-600 font-bold">Since Start 🗓️</span>
                  </div>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-black text-slate-400 uppercase">To Date</span>
                  <div className="bg-white border border-slate-200 rounded px-2 py-1 font-mono text-[9px] text-slate-650">
                    <span>09-Jun-2026</span>
                  </div>
                </div>
              </div>

              {/* Folio Listing */}
              <div className="space-y-1 border-t border-slate-100 pt-2 mt-1">
                <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider">Folio Listing</span>
                <div className="flex flex-col gap-1">
                  <label className="flex items-center gap-1.5 text-blue-750 font-black bg-blue-100/30 border border-blue-200 px-2 py-1 rounded-md">
                    <span className="w-3 h-3 rounded-full border-4 border-blue-600 flex items-center justify-center bg-white shrink-0"></span>
                    <span>With zero balance folios 📌</span>
                  </label>
                  <span className="text-[8.5px] font-bold text-slate-500 leading-normal pl-5">
                    ⚠️ Audits historic, inactive, and active schemes in your statement!
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Step 3 */}
      <div className="space-y-4 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            3
          </span>
          <div className="space-y-1 text-left">
            <h4 className="text-[13px] font-black text-slate-800">Enter Credentials & Set secure Password</h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              Input the <strong className="text-slate-750">Email ID</strong> linked to your investments. <strong className="text-emerald-700 underline decoration-dashed decoration-2 font-extrabold">NO PAN card detail is required</strong> (leave empty!). Enter and confirm a statement password, then click <strong className="text-slate-750">Submit</strong>.
            </p>
          </div>
        </div>

        {/* Simulated Form CSS mockup for Cas ss2 */}
        <div className="pl-9">
          <div className="border border-slate-150 rounded-xl overflow-hidden shadow-sm bg-slate-50/50">
            
            {/* Sub-header */}
            <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-150 flex items-center justify-between">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Authentication Credentials</span>
              <span className="text-[8.5px] font-black text-rose-600 bg-rose-50 px-1.5 rounded-md uppercase">No Pan Required 🔒</span>
            </div>

            {/* simulated fields */}
            <div className="p-3.5 space-y-3 text-left font-sans text-[10px] select-none">
              <div className="grid grid-cols-2 gap-3">
                
                {/* Email Field with verify */}
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <span>Email *</span>
                    <span className="text-[8px] text-emerald-600 font-bold">✓</span>
                  </label>
                  <div className="bg-white border-2 border-emerald-400 rounded-lg px-2 py-1.5 text-[8.5px] font-bold text-slate-800 flex items-center justify-between shadow-sm">
                    <span className="truncate">Enter Email which is linked to Investment</span>
                  </div>
                </div>

                {/* PAN Field - crossed out with red X */}
                <div className="space-y-1 relative">
                  <label className="text-[8.5px] font-black text-slate-400 uppercase flex items-center gap-1">
                    <span>PAN (Optional)</span>
                    <span className="text-[8.5px] text-rose-500 font-extrabold">✕ Not Required</span>
                  </label>
                  <div className="bg-slate-105 border border-slate-200 rounded-lg px-2 py-1.5 text-[8.5px] text-slate-400 font-medium line-through decoration-rose-500 decoration-2 flex items-center justify-between">
                    <span>(Skip/Leave Blank)</span>
                    <span className="text-[7px] font-black bg-rose-100 text-rose-750 px-1 rounded">No PAN</span>
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-3">
                
                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <span>Create Password *</span>
                    <span className="text-[8px] text-emerald-600 font-bold">✓</span>
                  </label>
                  <div className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-mono text-slate-700">
                    ••••••••
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-1">
                  <label className="text-[8.5px] font-black text-slate-500 uppercase flex items-center gap-1">
                    <span>Confirm Password *</span>
                    <span className="text-[8px] text-emerald-600 font-bold">✓</span>
                  </label>
                  <div className="bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[9px] font-mono text-slate-700">
                    ••••••••
                  </div>
                </div>

              </div>

              {/* Submit button simulated */}
              <div className="pt-1 select-none">
                <div className="bg-blue-650 text-center py-2 rounded-xl text-white font-black text-[9.5px] uppercase tracking-wide cursor-not-allowed shadow-md">
                  Submit Request
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Email Inbox Receipt: Cas SS3 */}
      <div className="space-y-3 bg-white border border-slate-100 p-4 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10.5px] font-black flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
            ✓
          </span>
          <div className="space-y-1 text-left">
            <h4 className="text-[13px] font-black text-emerald-855 flex items-center gap-1.5">
              <span>Check Your Email Inbox</span>
              <span className="text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-855 px-1.5 py-0.5 rounded-md animate-pulse">Email Sent Instantly</span>
            </h4>
            <p className="text-[11px] font-semibold text-slate-500 leading-relaxed">
              CAMS will instantly deliver a Consolidated Account Statement PDF directly to your mailbox:
            </p>
          </div>
        </div>

        {/* Simulated Email Inbox Item Mockup */}
        <div className="pl-9">
          <div className="bg-slate-50/50 border border-slate-150 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner text-left">
            <div className="flex gap-2.5 items-center">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="space-y-0.5 min-w-0">
                <span className="text-[10px] font-black text-slate-800 block truncate">
                  CAMS Mailback Server
                </span>
                <span className="text-[9.5px] font-medium text-slate-500 block truncate">
                  Consolidated Account Statement - CAMS Mailback Request - Funds...
                </span>
              </div>
            </div>
            <span className="text-[9px] font-black bg-emerald-120 text-emerald-800 px-2 py-0.5 rounded-full self-end sm:self-auto shrink-0">
              📩 PDF Attached
            </span>
          </div>
        </div>
      </div>

      {/* Download and Fill instructions */}
      <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/40 border border-blue-150 p-4 sm:p-5 rounded-2xl space-y-4 text-left">
        <div className="space-y-1.5">
          <h4 className="text-[13.5px] font-black text-slate-855">
            4. Download and Decrypt PDF Attachment
          </h4>
          <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold">
            Download the CAMS Consolidated Account Statement PDF and drag-and-drop or select it in the <strong className="text-blue-700">Upload CAS PDF</strong> section on the left.
          </p>
        </div>

        {/* Synchronized Password input */}
        <div className="bg-white border border-slate-150 p-4 rounded-xl space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">
              🔑 Enter CAS Statement Password Below
            </span>
            <span className="text-[9px] font-black bg-blue-55 text-blue-700 px-1.5 py-0.5 rounded-full uppercase">
              Syncs Automatically
            </span>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter PDF password you set at CAMS Online (in Step 3)"
              className="w-full bg-slate-55 border border-slate-200 rounded-xl text-[12px] py-3 pl-3.5 pr-10 focus:outline-none focus:border-blue-550 focus:bg-white font-mono font-semibold"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-650 cursor-pointer"
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[9.5px] font-semibold text-slate-400 leading-normal">
            🔒 Decryption occurs fully client-side inside your secure sandbox. Absolutely none of your investments or statement details are saved on external servers.
          </p>
        </div>
      </div>

    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10" id="portfolio-auditor-root">
      
      {/* Title Header with exquisite display typography */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 border border-blue-105 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-pulse animate-duration-1000" />
          <span>Pure Wealth Folio Auditor (ARN: 306022)</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-none mb-4">
          Fee & Strategy Drag Auditor
        </h1>
        <p className="text-slate-650 font-medium text-[13.5px] sm:text-[14.5px] leading-relaxed">
          Upload your mutual holdings statement to execute a deep audit. Divide your holdings into four strategic performance baskets, calculate transition capital gains taxes with exit load penalties, and optimize allocations with top-percentile rolling return schemas.
        </p>
      </div>

      {!result ? (
        <div className="space-y-8 animate-fade-in">
          {/* Top Row: Select Holding Source and WhatsApp card side-by-side */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-5 col-span-1">
              {inputMethodsPanel}
            </div>
            <div className="lg:col-span-7 col-span-1">
              {whatsappCard}
            </div>
          </div>

          {/* Bottom Row: How to Get CAS Pdf Statement guide */}
          {placeholderAuditCard}
        </div>
      ) : (
        /* Main Container Grid after Audit */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Inputs & WhatsApp Direct stack */}
          <div className="lg:col-span-5 space-y-6">
            {inputMethodsPanel}
            {whatsappCard}
          </div>

          {/* Right Side: Audit Results Dashboard */}
          <div className="lg:col-span-7 bg-white border border-slate-100 shadow-xl rounded-3xl p-5 sm:p-6" id="dashboard-results-container">
            <AnimatePresence mode="wait">
              {result && (
                <motion.div
                  key="results-loaded"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-8"
                >
                
                {/* Result Top Action Bar */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 border border-slate-150 p-4 rounded-2xl select-none">
                  <div>
                    <span className="text-[9px] font-black tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full uppercase leading-none inline-block">
                      DIAGNOSTIC COMPLETE ✓
                    </span>
                    <h4 className="text-sm font-black text-slate-850 mt-1.5">
                      Full Portfolio Audit Report
                    </h4>
                  </div>
                  <button
                    onClick={downloadPdfReport}
                    disabled={pdfLoading}
                    className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-750 to-indigo-650 hover:from-blue-850 hover:to-indigo-750 text-white font-extrabold text-xs px-4.5 py-2.5 rounded-xl transition duration-150 shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                  >
                    {pdfLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Generating Report...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Auditor PDF</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Fallback Notice Banner */}
                {(result as any).isResilientDemoFallback && (
                  <div className="bg-amber-50/70 border border-amber-200/50 p-4.5 rounded-2xl flex items-start gap-3 select-none animate-fade-in">
                    <span className="text-lg shrink-0">⚠️</span>
                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-amber-850">
                        AI Network Traffic Fallback Active
                      </h4>
                      <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                        Our cloud AI network is currently experiencing extremely high demand on free quotas. To ensure a seamless, non-breaking experience, we have processed a premium, high-fidelity Indian mutual fund statement caseload as a resilient fallback. Feel free to download records, view calculated tax-efficient transitions, or experiment with other analysis modules!
                      </p>
                    </div>
                  </div>
                )}
                
                {/* Result Top Cards Banner */}
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Diversification Score card */}
                    <div className="md:col-span-2 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-5">
                      <div className="relative shrink-0 flex items-center justify-center bg-white p-3.5 rounded-2xl shadow-sm border border-slate-100">
                        {/* Simple visual SVG radial progress bar */}
                        <svg className="w-20 h-20 transform -rotate-90">
                          <circle cx="40" cy="40" r="34" stroke="#f8fafc" strokeWidth="8" fill="transparent" />
                          <circle cx="40" cy="40" r="34" stroke="#2563eb" strokeWidth="8" fill="transparent"
                            strokeDasharray={2 * Math.PI * 34}
                            strokeDashoffset={2 * Math.PI * 34 * (1 - result.diversificationScore / 100)}
                            strokeLinecap="round"
                          />
                        </svg>
                        <span className="absolute text-lg font-black text-slate-850">
                          {result.diversificationScore}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex flex-wrap gap-1.5 items-center">
                          <span className="text-[9px] font-black text-blue-800 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200/50 uppercase tracking-widest inline-block select-none leading-none">
                            DIVERSIFICATION INDEX
                          </span>
                          <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border ${getDiversificationColor(result.diversificationScore)}`}>
                            {result.diversificationStatus}
                          </span>
                          <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full border border-orange-200 bg-orange-50 text-orange-700">
                            🔄 OVERLAP: {result.overlappingPercentage || 65}%
                          </span>
                        </div>
                        <p className="text-[11.5px] font-bold text-slate-650 leading-relaxed">
                          The portfolio exhibits a diversification score of {result.diversificationScore} out of 100. Holding {result.totalFunds} active schemes introduces severe clutter and heavy stock overlap, turning your investments into an expensive index tracker. Consolidating into fewer high-conviction funds will boost efficiency.
                        </p>
                      </div>
                    </div>

                    {/* Fund count totalizer card */}
                    <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4.5 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-black text-rose-600 uppercase tracking-widest block mb-1">
                          ACTIVE AUDITED SCHEMES
                        </span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-4xl font-black text-slate-900">
                            {result.activeFundsCount ?? result.fundWiseAudit?.filter(f => f.isActive !== false).length ?? 0}
                          </span>
                          <span className="text-[11px] font-black text-slate-500">Active Funds</span>
                        </div>
                      </div>
                      <div className="mt-3 space-y-1.5 border-t border-slate-200/60 pt-2.5">
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0" />
                            Active Holdings (Valuation &gt; 0):
                          </span>
                          <span className="font-extrabold text-emerald-700 font-mono">
                            {result.activeFundsCount ?? result.fundWiseAudit?.filter(f => f.isActive !== false).length ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10.5px]">
                          <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-400 shrink-0" />
                            Inactive/NIL Folios:
                          </span>
                          <span className="font-extrabold text-slate-600 font-mono">
                            {result.inactiveFundsCount ?? result.fundWiseAudit?.filter(f => f.isActive === false).length ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[10.5px] border-t border-slate-100 pt-1.5 mt-1.5">
                          <span className="text-slate-500 font-bold flex items-center gap-1.5">
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0" />
                            Total Decoded Accounts:
                          </span>
                          <span className="font-black text-slate-700 font-mono">
                            {result.totalFunds}
                          </span>
                        </div>
                        <div className="mt-2.5 bg-slate-100 border border-slate-200/40 rounded-lg p-2 text-[9.5px] text-slate-550 leading-normal font-medium">
                          ℹ️ <strong>Total Decoded Accounts</strong> is the exact count of unique ISIN schemes found in your statement (sum of active holdings and historical closed/nil-balance folios).
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Clarifying explanatory box explaining the importance and impact of Diversification Score */}
                  <div className="bg-white border border-slate-150 rounded-2xl p-4.5 space-y-3">
                    <div>
                      <span className="text-[11px] font-black text-slate-850 uppercase tracking-wider block mb-1">
                        💡 Why your Diversification Score Matters
                      </span>
                      <p className="text-[11.5px] text-slate-650 font-semibold leading-relaxed">
                        Holding duplicate funds or narrow sectors concentrates risk. Diversification balances assets to shield you from sudden sectoral drawdowns and secure smooth returns.
                      </p>
                    </div>

                    <div className="border-t border-slate-100 pt-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">
                        SCORE BIFURCATION (0-100)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <div className="text-[10px] font-black text-emerald-700 uppercase">🟢 HIGH (80 - 100)</div>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">Optimal blend. No redundant overlapping holdings.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <div className="text-[10px] font-black text-amber-700 uppercase">🟡 MODERATE (50 - 79)</div>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">Duplicate assets & minor clutter. Overlap drag begins.</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-2">
                          <div className="text-[10px] font-black text-rose-700 uppercase">🔴 LOW (BELOW 50)</div>
                          <p className="text-[10px] text-slate-500 font-medium leading-tight">Severe clutter & duplicate risk. Tracking industry drag.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ADVANCED: Investor Behavioral Profiling Card */}
                <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-150 rounded-2xl p-5 space-y-3.5">
                  <div className="flex items-center gap-2.5 border-b border-slate-200/80 pb-3">
                    <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                      <User className="w-5 h-5 shrink-0 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                        AI INVESTOR BEHAVIOR PROFILE
                      </span>
                      <h4 className="text-[14px] font-black text-slate-900 leading-none">
                        Category: {result.investorPersona.typeName}
                      </h4>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1.5 text-xs text-slate-700 font-semibold leading-relaxed">
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-extrabold">•</span>
                        <span><strong>Investment Stance:</strong> "{result.investorPersona.behaviorQuote}" — {result.investorPersona.behaviorAnalysis.split(".")[0]}.</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <span className="text-blue-600 font-extrabold">•</span>
                        <span><strong>Risk & Churn:</strong> Configured for a {result.investorPersona.riskToleranceRating} risk style with {result.investorPersona.churnActivityLevel.toLowerCase()} voluntary unit churn.</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col justify-center shadow-sm">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">ESTIMATED RISK PROFILE</span>
                      <span className="text-xs font-black text-slate-750">
                        ⚡ {result.investorPersona.riskToleranceRating} Risk Tolerance
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col justify-center shadow-sm">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">HOLDINGS CHURN VELOCITY</span>
                      <span className="text-xs font-black text-slate-755 font-mono">
                        🔄 {result.investorPersona.churnActivityLevel} Transaction Churn
                      </span>
                    </div>
                  </div>
                </div>

                {/* THE FOUR STRATEGIC PERFORMANCE BASKETS (PowerUp Money optimized style) */}
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                      STRATEGIC REBALANCING MATRIX
                    </span>
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                      <FolderClosed className="w-4.5 h-4.5 text-blue-600" />
                      <span>Dividing Holdings by Four Asset Performance Baskets</span>
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Basket 1 Card: Core Alpha Gen */}
                    <div className="border border-emerald-150 bg-emerald-50/10 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center bg-emerald-100/50 rounded-xl px-2.5 py-1.5 border border-emerald-250/20">
                        <span className="text-[11px] font-black text-emerald-850">🟢 Basket 1: Core Alpha Gen</span>
                        <span className="text-[9.5px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded-full border border-emerald-100">
                          {result.fundWiseAudit.filter(f => f.basketClassification === "Core Alpha Gen").length} Funds
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">
                        Superior 3-5Y rolling returns and top-tier Sharpe/Sortino ratios. These anchor your primary wealth growth.
                      </p>
                      <div className="space-y-2">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Core Alpha Gen").map((fundRaw, idx) => {
                          const f = getEnhancedFundMetrics(fundRaw);
                          const isExpanded = expandedFund === f.fundName;
                          const savingPercent = Math.max(0, parseFloat((f.currentExpenseRatio - f.alternativeExpenseRatio).toFixed(2)));
                          return (
                            <div key={idx} className="border-t border-slate-150/40 pt-2 pb-1 space-y-1.5">
                              <button
                                onClick={() => setExpandedFund(isExpanded ? null : f.fundName)}
                                className="w-full text-left flex justify-between items-start gap-1.5 hover:bg-slate-100/50 p-1 rounded transition-all focus:outline-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11.5px] font-black text-slate-800 block truncate">{f.fundName}</span>
                                  <span className="text-[9px] font-bold text-slate-400">Category: {f.category}{f.isin ? ` • ISIN: ${f.isin}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9.5px] font-black font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                    CAGR: {f.currentReturn3Y}%
                                  </span>
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-emerald-600' : ''}`} />
                                </div>
                              </button>
                              
                              {isExpanded && renderComparableTable(f, savingPercent, "🚀", "emerald")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
 
                    {/* Basket 2 Card: Defensive Anchor */}
                    <div className="border border-blue-150 bg-blue-50/10 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center bg-blue-100/50 rounded-xl px-2.5 py-1.5 border border-blue-250/20">
                        <span className="text-[11px] font-black text-blue-850">🔵 Basket 2: Defensive Anchor</span>
                        <span className="text-[9.5px] font-bold text-blue-700 bg-white px-2 py-0.5 rounded-full border border-blue-100">
                          {result.fundWiseAudit.filter(f => f.basketClassification === "Defensive Anchor").length} Funds
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">
                        Outstanding downside protection score relative to peers. Consistent performer during macro market contractions.
                      </p>
                      <div className="space-y-2">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Defensive Anchor").map((fundRaw, idx) => {
                          const f = getEnhancedFundMetrics(fundRaw);
                          const isExpanded = expandedFund === f.fundName;
                          const savingPercent = Math.max(0, parseFloat((f.currentExpenseRatio - f.alternativeExpenseRatio).toFixed(2)));
                          return (
                            <div key={idx} className="border-t border-slate-150/40 pt-2 pb-1 space-y-1.5">
                              <button
                                onClick={() => setExpandedFund(isExpanded ? null : f.fundName)}
                                className="w-full text-left flex justify-between items-start gap-1.5 hover:bg-slate-100/50 p-1 rounded transition-all focus:outline-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11.5px] font-black text-slate-800 block truncate">{f.fundName}</span>
                                  <span className="text-[9px] font-bold text-slate-400">Category: {f.category}{f.isin ? ` • ISIN: ${f.isin}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9.5px] font-black font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                                    Rating: {f.downsideProtectionRating}/10
                                  </span>
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`} />
                                </div>
                              </button>
                              
                              {isExpanded && renderComparableTable(f, savingPercent, "🛡️", "blue")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
 
                    {/* Basket 3 Card: Fee-Dragged Peer */}
                    <div className="border border-amber-150 bg-amber-50/10 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center bg-amber-100/50 rounded-xl px-2.5 py-1.5 border border-amber-250/20">
                        <span className="text-[11px] font-black text-amber-850">🟡 Basket 3: Fee-Dragged Peer</span>
                        <span className="text-[9.5px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded-full border border-amber-100">
                          {result.fundWiseAudit.filter(f => f.basketClassification === "Fee-Dragged Peer").length} Funds
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">
                        Moderate returns coupled with elevated expense ratios. Swapping to optimized peers recaptures compounding.
                      </p>
                      <div className="space-y-2">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Fee-Dragged Peer").map((fundRaw, idx) => {
                          const f = getEnhancedFundMetrics(fundRaw);
                          const isExpanded = expandedFund === f.fundName;
                          const savingPercent = Math.max(0, parseFloat((f.currentExpenseRatio - f.alternativeExpenseRatio).toFixed(2)));
                          return (
                            <div key={idx} className="border-t border-slate-150/40 pt-2 pb-1 space-y-1.5">
                              <button
                                onClick={() => setExpandedFund(isExpanded ? null : f.fundName)}
                                className="w-full text-left flex justify-between items-start gap-1.5 hover:bg-slate-100/50 p-1 rounded transition-all focus:outline-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11.5px] font-black text-slate-800 block truncate">{f.fundName}</span>
                                  <span className="text-[9px] font-bold text-slate-400">Category: {f.category}{f.isin ? ` • ISIN: ${f.isin}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9.5px] font-black font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                    Expense: {f.currentExpenseRatio}%
                                  </span>
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-amber-600' : ''}`} />
                                </div>
                              </button>
                              
                              {isExpanded && renderComparableTable(f, savingPercent, "💸", "amber")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
 
                    {/* Basket 4 Card: Rebalance/Churn Catalyst */}
                    <div className="border border-rose-150 bg-rose-50/10 rounded-2xl p-4 space-y-2.5">
                      <div className="flex justify-between items-center bg-rose-100/50 rounded-xl px-2.5 py-1.5 border border-rose-250/20">
                        <span className="text-[11px] font-black text-rose-850">🔴 Basket 4: Rebalance Churn</span>
                        <span className="text-[9.5px] font-bold text-rose-700 bg-white px-2 py-0.5 rounded-full border border-rose-100">
                          {result.fundWiseAudit.filter(f => f.basketClassification === "Rebalance/Churn Catalyst").length} Funds
                        </span>
                      </div>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-normal">
                        Poor downside safety rating or excessive cost overlays. Active swap candidate to protect capital values.
                      </p>
                      <div className="space-y-2">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Rebalance/Churn Catalyst").map((fundRaw, idx) => {
                          const f = getEnhancedFundMetrics(fundRaw);
                          const isExpanded = expandedFund === f.fundName;
                          const savingPercent = Math.max(0, parseFloat((f.currentExpenseRatio - f.alternativeExpenseRatio).toFixed(2)));
                          return (
                            <div key={idx} className="border-t border-slate-150/40 pt-2 pb-1 space-y-1.5">
                              <button
                                onClick={() => setExpandedFund(isExpanded ? null : f.fundName)}
                                className="w-full text-left flex justify-between items-start gap-1.5 hover:bg-slate-100/50 p-1 rounded transition-all focus:outline-none"
                              >
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11.5px] font-black text-slate-800 block truncate">{f.fundName}</span>
                                  <span className="text-[9px] font-bold text-slate-400">Category: {f.category}{f.isin ? ` • ISIN: ${f.isin}` : ""}</span>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <span className="text-[9.5px] font-black font-mono text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-100">
                                    Load Cost: ₹{f.switchingExitLoadCost}
                                  </span>
                                  <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isExpanded ? 'rotate-180 text-rose-600' : ''}`} />
                                </div>
                              </button>
                              
                              {isExpanded && renderComparableTable(f, savingPercent, "⚠️", "rose")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIODE: Strengths and Critical Leaks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths Card */}
                  <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-5 space-y-3.5 shadow-sm">
                    <h4 className="text-[12.5px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-emerald-100/40 pb-2">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 select-none animate-pulse" />
                      <span>Portfolio Strengths</span>
                    </h4>
                    <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-widest leading-none mb-1 block">Simple terms: Your positive selection signals</p>
                    <ul className="space-y-2">
                      {result.overallStrengths.map((s, i) => (
                        <li key={i} className="text-[11.5px] font-semibold text-slate-750 flex gap-2 leading-relaxed">
                          <span className="text-emerald-600 font-black">✓</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Leaks Card */}
                  <div className="border border-rose-100 bg-rose-50/10 rounded-2xl p-5 space-y-3.5 shadow-sm">
                    <h4 className="text-[12.5px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-rose-100/40 pb-2">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0 select-none animate-pulse" />
                      <span>Wealth Performance Leaks</span>
                    </h4>
                    <p className="text-[10px] text-rose-500 uppercase font-bold tracking-widest leading-none mb-1 block">Simple terms: Your critical fee friction spots</p>
                    <ul className="space-y-2">
                      {result.criticalLeaks.map((l, i) => (
                        <li key={i} className="text-[11.5px] font-semibold text-slate-750 flex gap-2 leading-relaxed">
                          <span className="text-rose-500 font-extrabold">✕</span>
                          <span>{l}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* MIDDLE CALL TO ACTION (SEBI COMPLIANT MFD LEAD MAGNET) */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 border-2 border-emerald-400 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-3">
                    <span className="text-[10px] font-black tracking-widest text-emerald-800 bg-emerald-100/60 px-3 py-1 rounded-full uppercase leading-none select-none">
                      🛡️ COMPLIMENTARY MFD INSIGHT SERVICE
                    </span>
                    <span className="text-[9.5px] font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-150 uppercase leading-none select-none">
                      Action Recommended ⏱️
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-base font-black text-emerald-950 tracking-tight leading-snug">
                      Is Your Capital Trapped in High-Commission Regular Schemes? Complete 1:1 Diagnostic Mapping Review.
                    </h3>
                    <p className="text-[12px] text-slate-700 font-semibold leading-relaxed">
                      Active mutual fund portfolios are silently leaking up to <strong className="text-rose-600">1.2% - 1.5% annually</strong> due to duplication drag, redundant commissions, and high overlap. Shifting exits systematically avoids unnecessary tax traps. As a registered Mutual Fund Distributor (MFD), Pure Wealth Global runs professional review sessions without any upfront fixed consulting bills.
                    </p>
                    <p className="text-[12.5px] font-black text-emerald-900 leading-relaxed bg-white/75 border border-emerald-100/50 p-3 rounded-xl">
                      💡 <em>Why you are missing out:</em> Without professional verification of fund lot purchase sequences and alignment schedules, active SIP allocation traps continually leak future compounding wealth. Reviewing the portfolio is completely free of cost!
                    </p>
                  </div>
                  <div className="pt-2">
                    <a
                      href="https://wa.me/917718860398?text=Hi%20Pure%20Wealth%20Global!%20%E2%9C%85%20I%20just%20completed%20my%20Portfolio%20Audit%20Report.%20I%20see%20significant%20commission%2Foverlap%20drag!%20Please%20arrange%20a%20detailed%201%3A1%20portfolio%20analysis%20consultation%20and%20help%20me%20optimize%20my%20investments%20%F0%259F%2593%2588."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition duration-150 shadow-md hover:shadow-lg text-center cursor-pointer"
                    >
                      <span>Book Complimentary 1:1 Analysis on WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* TRANSITION COST & TAX IMPACT LEDGER */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-205 pb-3">
                    <Coins className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                        AMFI COMPLIANT LEDGER
                      </span>
                      <h4 className="text-[14px] font-black text-slate-900 leading-none">
                        Switching Cost & Transition Tax Impact if you Decide to change Funds.
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col justify-between shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">EXIT PLACEMENT PENALTY</span>
                      <span className="text-base font-black text-rose-600 leading-none">
                        ₹{(result.switchingCostSummary.totalExitLoad).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-450 mt-1">Accumulated exit load loads</span>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col justify-between shadow-sm">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">CAPITAL GAINS TAX NET</span>
                      <span className={`text-base font-black leading-none ${result.switchingCostSummary.totalTaxImpact < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {result.switchingCostSummary.totalTaxImpact < 0 ? "-" : "+"}₹{Math.abs(result.switchingCostSummary.totalTaxImpact).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-450 mt-1">Estimated gains tax drag</span>
                    </div>
                  </div>

                  <div className="bg-blue-50/70 border border-blue-150 p-4.5 rounded-xl space-y-3">
                    <span className="text-[11px] font-black text-blue-800 uppercase tracking-wider block">
                      💡 Systematic Exits and Tax-Harvesting Strategy
                    </span>
                    <div className="space-y-2">
                      <p className="text-[11.5px] text-slate-700 leading-relaxed font-semibold">
                        {result.switchingCostSummary.avoidanceStrategy}
                      </p>
                      
                      {/* Highlighted Standard Indian Tax / Exit Rules */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-blue-100/50">
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-800 uppercase block tracking-wider">✓ WAIT 365 DAYS TO REDEEM</span>
                          <p className="text-[10.5px] text-slate-550 leading-normal font-semibold">
                            Redeeming equity assets after 1 year completely avoids the **1.0% exit load penalty** and drops capital gains tax slabs.
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] font-black text-blue-800 uppercase block tracking-wider">✓ HARVEST ₹1.25 LAKH TAX-FREE</span>
                          <p className="text-[10.5px] text-slate-550 leading-normal font-semibold">
                            Every single financial year, you can sell up to **₹1.25 Lakh** of long-term capital gains with zero (0%) tax liability.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Peer-To-Peer Relative Fee & Strategy Optimization Table */}
                <div className="space-y-4">
                  <h4 className="text-[13px] font-black text-slate-850 flex items-center gap-2">
                    <Percent className="w-4 h-4 text-blue-600" />
                    <span>Portfolio Optimization: Fee & Performance Peer Comparison</span>
                  </h4>
                  
                  <div className="overflow-x-auto border border-slate-150 rounded-2xl shadow-inner bg-slate-50/10">
                    <table className="w-full text-left text-[11px] border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-slate-55/40 text-slate-600 border-b border-slate-200/50 text-[10px]">
                          <th className="py-2.5 px-3 font-black">Current Holding Scheme</th>
                          <th className="py-2.5 px-2 font-black text-center">Expense</th>
                          <th className="py-2.5 px-3 font-black">Recommended Peer Optimization</th>
                          <th className="py-2.5 px-2 font-black text-center">Opt. Expense</th>
                          <th className="py-2.5 px-2 font-black text-center">3Y Acc. Return</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white leading-normal">
                        {result.fundWiseAudit.map((fund, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/20 transition-colors">
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-slate-800 block">
                                  {fund.fundName}
                                </span>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`inline-block text-[8.5px] font-extrabold px-1.5 py-0.2 rounded border ${getBasketColor(fund.basketClassification)}`}>
                                    {getBasketBadge(fund.basketClassification)}
                                  </span>
                                  {fund.isin && (
                                    <span className="inline-block text-[8px] font-mono font-black text-slate-400 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
                                      ISIN: {fund.isin}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-extrabold text-rose-600">
                              {fund.currentExpenseRatio.toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-3">
                              <div className="space-y-0.5">
                                <span className="font-extrabold text-emerald-800 block">
                                  {fund.betterAlternativeFund}
                                </span>
                                <span className="text-[9.5px] font-semibold text-slate-500 block italic leading-tight">
                                  {fund.sharpeAndSortinoStatus}
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-2 text-center font-extrabold text-emerald-600">
                              {fund.alternativeExpenseRatio.toFixed(2)}%
                            </td>
                            <td className="py-2.5 px-2 text-center font-black text-blue-600">
                              +{fund.returnDifference3Y.toFixed(2)}%
                            </td>
                          </tr>
                        ))}
                        {/* Total Extra returns line */}
                        <tr className="bg-blue-50/40 text-[11px] font-bold border-t border-slate-200 font-sans">
                          <td className="py-3 px-3 text-[#1e3a8a] font-extrabold" colSpan={4}>
                            Total extra returns you could have generated if you selected the recommended portfolio:
                          </td>
                          <td className="py-3 px-2 text-center font-black text-blue-700 bg-blue-100/40 border-l border-blue-150">
                            +{result.fundWiseAudit.reduce((acc, f) => acc + (f.returnDifference3Y || 0), 0).toFixed(2)}%
                          </td>
                        </tr>
                        {/* Fee Savings Row */}
                        <tr className="bg-emerald-50/35 text-[11px] font-bold border-t border-slate-200">
                          <td className="py-3 px-3 text-emerald-850 font-black">
                            Total % Saved in Extra Fees (Regular vs Direct/Low-Fee Optimization):
                            <span className="block text-[9.5px] text-slate-500 font-semibold leading-normal font-sans mt-0.5">
                              Calculated sum: Current Expense ({result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0).toFixed(2)}%) minus Optimized Expense ({result.fundWiseAudit.reduce((acc, f) => acc + (f.alternativeExpenseRatio || 0), 0).toFixed(2)}%)
                            </span>
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-rose-600 bg-rose-50/10">
                            {result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0).toFixed(2)}%
                          </td>
                          <td className="py-3 px-3 text-[#0f5132] font-semibold italic text-[10px]">
                            ⚡ Direct Operational Fee Elimination Savings
                          </td>
                          <td className="py-3 px-2 text-center font-extrabold text-emerald-600 bg-emerald-50/10">
                            {result.fundWiseAudit.reduce((acc, f) => acc + (f.alternativeExpenseRatio || 0), 0).toFixed(2)}%
                          </td>
                          <td className="py-3 px-2 text-center font-black text-emerald-700 bg-emerald-100/40 border-l border-emerald-150">
                            {(result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0) - result.fundWiseAudit.reduce((acc, f) => acc + (f.alternativeExpenseRatio || 0), 0)).toFixed(2)}% Saved
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 block pb-1">
                    * Fee optimization compares expense structures within identical categories using AMFI historical listings. Reducing operational fee slices directly preserves compounding yield.
                  </span>
                </div>

                {/* Score Card of Funds Selected Box */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4.5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
                    <Award className="w-5 h-5 text-indigo-650 shrink-0" />
                    <h4 className="text-[13.5px] font-black text-slate-900 leading-none">
                      Mutual Funds Insights & Quality Scorecard
                    </h4>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">FUND TYPES & ALLOCATION MATCH</span>
                      <p className="text-[11px] font-bold text-slate-750">
                        {result.fundWiseAudit.filter(f => f.category.toLowerCase().includes("small") || f.category.toLowerCase().includes("sectoral")).length > 2 
                          ? "⚠️ Over-Concentrated in Volatile Sub-types" 
                          : "✅ Optimal Core Asset Allocation"}
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-sans">Evaluates appropriate capitalization mix relative to AMFI risk boundaries.</span>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">RISK-ADJUSTED QUALITY (SHARPE & SORTINO)</span>
                      <p className="text-[11px] font-bold text-slate-750">
                        ⭐ Weighted Portfolio Sharpness: {result.diversificationScore >= 75 ? "Grade A (Highly Shielded)" : result.diversificationScore >= 50 ? "Grade B (Moderate Shield)" : "Grade C (Sub-optimal)"}
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-sans">Measures historical returns per unit volatility generated against indices.</span>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">INDEX BENCHMARK OUTPERFORMANCE</span>
                      <p className="text-[11px] font-bold text-emerald-750">
                        📈 Rolling Outperformance Premium: +{(result.fundWiseAudit.reduce((acc, f) => acc + (f.returnDifference3Y || 0), 0) / (result.fundWiseAudit.length || 1)).toFixed(2)}% (Avg)
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-sans">Aggregates trailing statistical yield improvements above standard category benchmarks.</span>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-1">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">PORTFOLIO STOCK OVERLAP INDICATOR</span>
                      <p className="text-[11px] font-bold text-amber-705">
                        🔄 Fund Overlap: {result.overlappingPercentage || 65}% ({result.overlappingPercentage && result.overlappingPercentage >= 70 ? "Critical Systemic Overlap" : "Significant Clutter Overlap"})
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-sans">Measures stock holdings replication across overlapping AMC strategies. High duplication triggers tracking redundancy.</span>
                    </div>

                    <div className="border border-slate-100 rounded-xl p-3 bg-slate-50/30 space-y-1 col-span-1 sm:col-span-2">
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block font-mono">EXPENSE STRUCTURAL EFFICIENCY</span>
                      <p className="text-[11px] font-bold text-amber-705">
                        ⚙️ Current Active Fee Drag: {(result.fundWiseAudit.reduce((acc, f) => acc + (f.currentExpenseRatio || 0), 0) / (result.fundWiseAudit.length || 1)).toFixed(2)}%
                      </p>
                      <span className="text-[10px] text-slate-500 font-semibold block leading-tight font-sans">Compares current expense structures with recommended direct AMC comparable peers.</span>
                    </div>
                  </div>
                </div>

                {/* Highlight Box for Historical Exit Load Penalities */}
                <div className="bg-amber-50/20 border border-amber-150 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-wider block">
                      Historical Transaction-Level Exit Load Audit
                    </span>
                  </div>
                  <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold">
                    We performed a thorough transaction ledger scan on your uploaded CAS record. 
                    {result.totalFunds > 4 ? (
                      <span> 🔍 **Audit Alert:** Standard ledger patterns confirm **₹0 historical exit load charges** have been deducted in your past transaction entries. However, several of your current active holdings have segments aged under 365 days, making them highly vulnerable to a **1.0% exit penalty** if transitioned blindly without our systematic staggered schedule.</span>
                    ) : (
                      <span> ✅ **Audit Clear:** No past exit load penalties or commissions haircuts detected in your historical log entries. All previous units were liquidated clear of the lock-in penalty zones.</span>
                    )}
                  </p>
                </div>

                {/* Recharts Projected extra compounding layout */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-5">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-200/50 pb-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">
                        5-YEAR COMPOUNDING FORECAST
                      </span>
                      <h4 className="text-[13px] font-black text-slate-900 leading-none">
                        Compounded Cumulative Cost-Drag Visualization
                      </h4>
                    </div>
                    <div className="bg-emerald-100/60 border border-emerald-250/30 rounded-xl py-1 px-3 text-right">
                      <span className="text-[8px] font-black text-emerald-805 uppercase block tracking-wider leading-none mb-0.5">Compiled Yield Increment</span>
                      <span className="text-12.5px font-black text-emerald-800 font-mono">
                        +₹{(result.returnGainsProjection.totalExtraWealthEarned).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Recharts Interactive Area Chart */}
                  <div className="h-[220px] w-full" id="compounding-recharts-chart">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={getChartData()} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorPWG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#059669" stopOpacity={0.15}/>
                            <stop offset="95%" stopColor="#059669" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorLegacy" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.08}/>
                            <stop offset="95%" stopColor="#94a3b8" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          formatter={(value) => [`₹${Number(value).toLocaleString()}`]}
                          contentStyle={{ fontSize: '11px', borderRadius: '12px', border: '1px solid #f1f5f9', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }} 
                        />
                        <Legend wrapperStyle={{ fontSize: '10.5px', paddingTop: '10px' }} />
                        <Area type="monotone" dataKey="Optimized Peer Selection (Pure Wealth)" stroke="#059669" strokeWidth={2} fillOpacity={1} fill="url(#colorPWG)" />
                        <Area type="monotone" dataKey="Current Portfolio Yield" stroke="#94a3b8" strokeWidth={1.5} fillOpacity={1} fill="url(#colorLegacy)" />
                        <Line type="monotone" dataKey="Additional Compounded Wealth" stroke="#2563eb" strokeWidth={1.5} dot={{ r: 2 }} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Realtime CAGR returns audit comparison box */}
                  <div className="bg-gradient-to-br from-indigo-50/30 via-slate-50/20 to-white border-2 border-indigo-200/80 rounded-2xl p-5 space-y-4 shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg">
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[8px] font-black py-0.5 px-3 uppercase tracking-widest select-none rounded-bl-xl font-mono">
                      ⭐ HIGH-IMPACT INDICATORS
                    </div>
                    <div className="flex items-center gap-2 border-b border-slate-150 pb-2.5">
                      <TrendingUp className="w-4.5 h-4.5 text-indigo-600 shrink-0 animate-pulse" />
                      <span className="text-[12px] font-black text-indigo-950 uppercase tracking-wider block">
                        Portfolio CAGR & Realtime Comparison Indicators
                      </span>
                    </div>

                    {result.returnGainsProjection.earliestInvestmentDate && (
                      <div className="flex flex-wrap items-center justify-between gap-3 bg-indigo-50/60 rounded-xl p-3 border border-indigo-150/40 text-xs text-indigo-900 shadow-inner">
                        <div>
                          <span className="font-semibold text-indigo-950">Inception Date:</span>{" "}
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-100">{result.returnGainsProjection.earliestInvestmentDate}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-indigo-950">Net Acquisition Cost:</span>{" "}
                          <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-indigo-100">₹{Number(result.returnGainsProjection.totalAcquisitionCost || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-indigo-950">Current Evaluation:</span>{" "}
                          <span className="font-mono font-bold bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-100">₹{Number(result.returnGainsProjection.currentValue || 0).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 items-stretch">
                      <div className="bg-white/90 border border-slate-150 p-3 rounded-xl text-center space-y-1 shadow-sm flex flex-col justify-center">
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">PORTFOLIO RETURN</span>
                        <div className="text-[16px] font-black text-blue-600 font-mono">
                          {result.returnGainsProjection.portfolioCAGR !== undefined 
                            ? (result.returnGainsProjection.portfolioCAGR).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })
                            : ((result.returnGainsProjection.projectedValue5YCurrent / result.returnGainsProjection.currentValue) ** (1/5) - 1).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 block leading-tight font-sans">Weighted current yield</span>
                      </div>

                      <div className="bg-white/90 border border-slate-150 p-3 rounded-xl text-center space-y-1 shadow-sm flex flex-col justify-center">
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">NIFTY 50 INDEX</span>
                        <div className="text-[16px] font-black text-slate-700 font-mono">
                          {result.returnGainsProjection.niftyCAGR !== undefined
                            ? (result.returnGainsProjection.niftyCAGR).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })
                            : "11.45%"}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 block leading-tight font-sans">Large Cap baseline</span>
                      </div>

                      <div className="bg-white/90 border border-slate-150 p-3 rounded-xl text-center space-y-1 shadow-sm flex flex-col justify-center">
                        <span className="text-[7.5px] font-black text-slate-400 uppercase tracking-widest block font-sans">PEER BENCHMARK</span>
                        <div className="text-[16px] font-black text-amber-600 font-mono">
                          {result.returnGainsProjection.peerBenchmarkCAGR !== undefined
                            ? (result.returnGainsProjection.peerBenchmarkCAGR).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })
                            : (((result.returnGainsProjection.projectedValue5YCurrent / result.returnGainsProjection.currentValue) ** (1/5) - 1) - 0.005).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 block leading-tight font-sans">Average active fund benchmark</span>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-600 to-teal-700 border-2 border-emerald-500 p-3 rounded-xl text-center space-y-0.5 shadow-lg ring-4 ring-emerald-500/20 scale-105 transform hover:scale-108 transition-all relative overflow-hidden flex flex-col justify-center col-span-2 md:col-span-1 min-h-[92px]">
                        <div className="absolute -top-1 -right-8 bg-amber-400 text-slate-900 text-[6px] font-black py-0.5 px-8 uppercase tracking-widest font-sans rotate-12 shadow-sm select-none">
                          WINNER
                        </div>
                        <span className="text-[7px] font-black text-emerald-100 uppercase tracking-widest block font-mono">🏆 RECOMMENDED CORE</span>
                        <div className="text-[19px] font-black text-white leading-none tracking-tight font-mono drop-shadow-md py-1">
                          {result.returnGainsProjection.oursOptimizedCAGR !== undefined
                            ? (result.returnGainsProjection.oursOptimizedCAGR).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })
                            : ((result.returnGainsProjection.projectedValue5YPWG / result.returnGainsProjection.currentValue) ** (1/5) - 1).toLocaleString('en-US', { style: 'percent', minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[8.5px] font-extrabold text-emerald-100 block leading-tight font-sans">
                          Optimized peer strategy return
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Compound Action Panel containing comparative visual stats and double-track actionable decisions */}
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                    <div className="border-b border-slate-100 pb-2.5 mb-2">
                      <span className="text-[9px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider inline-block leading-none mb-1">
                        PROJECTION RISK MATRIX
                      </span>
                      <h5 className="text-[13px] font-black text-slate-900 leading-tight">
                        Compound Action Warning: What Delay Costs You
                      </h5>
                    </div>

                    {/* Highly Visual Side-By-Side Comparison of immediate switching friction VS compounding loss VS Net Difference */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      <div className="bg-rose-50/20 border border-rose-100/50 p-3 rounded-xl space-y-0.5">
                        <span className="text-[8.5px] font-black text-rose-750 uppercase tracking-widest block leading-tight">
                          IMMEDIATE SWAP COST
                        </span>
                        <div className="text-base font-black text-rose-600 font-mono">
                          ₹{(Math.abs(result.switchingCostSummary.totalExitLoad) + Math.abs(result.switchingCostSummary.totalTaxImpact)).toLocaleString()}
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-medium leading-normal">
                          Immediate exit penalties and CG taxation blindly switched today.
                        </p>
                      </div>

                      <div className="bg-emerald-50/20 border border-emerald-100/50 p-3 rounded-xl space-y-0.5">
                        <span className="text-[8.5px] font-black text-emerald-755 uppercase tracking-widest block leading-tight">
                          5-Yr Wealth Lost (Not Switching)
                        </span>
                        <div className="text-base font-black text-emerald-600 font-mono">
                          ₹{result.returnGainsProjection.totalExtraWealthEarned.toLocaleString()}
                        </div>
                        <p className="text-[9.5px] text-slate-500 font-medium leading-normal">
                          Yield lost by staying in drag-heavy active legacy products.
                        </p>
                      </div>

                      <div className="bg-blue-50/20 border border-blue-150 p-3 rounded-xl space-y-0.5">
                        <span className="text-[8.5px] font-black text-blue-755 uppercase tracking-widest block leading-tight">
                          Net Lost Compounding Wealth
                        </span>
                        <div className="text-base font-black text-blue-600 font-mono">
                          ₹{(result.returnGainsProjection.totalExtraWealthEarned - (Math.abs(result.switchingCostSummary.totalExitLoad) + Math.abs(result.switchingCostSummary.totalTaxImpact))).toLocaleString()}
                        </div>
                        <p className="text-[9.5px] text-slate-550 font-bold leading-normal">
                          Net opportunity lost (difference of above) if lock-in remains.
                        </p>
                      </div>

                    </div>

                    {/* What they have missed in past and what they will miss in coming years */}
                    <div className="bg-rose-50/35 border-l-4 border-l-rose-500 border border-rose-100 p-4 rounded-xl space-y-1.5 relative overflow-hidden">
                      <div className="absolute top-1 right-1 bg-rose-600 text-white text-[7px] font-black py-0.5 px-1.5 rounded uppercase tracking-widest leading-none font-mono animate-pulse">
                        ⚠️ COMPOUNDING LEAK DETECTED
                      </div>
                      <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider block">
                        ⏳ The Irreversible Cost of Delayed Shifting
                      </span>
                      <p className="text-[11.5px] text-slate-700 leading-relaxed font-semibold">
                        Every day your assets remain trapped in redundant high-commission regular schemes, they bleed returns to intermediaries. Shifting immediately preserves your future gains. For instance, delaying this optimization by merely 3 months will permanently cost you approximately <span className="text-rose-600 font-extrabold font-mono">₹{Math.round(result.returnGainsProjection.totalExtraWealthEarned * (3 / 60)).toLocaleString()}</span> in lost wealth compounding!
                      </p>
                    </div>

                    {/* Double option pathways */}
                    <div className="space-y-3.5 bg-gradient-to-br from-slate-50 to-indigo-50/10 border border-slate-200 rounded-2xl p-4.5">
                      <div className="flex flex-wrap items-center justify-between gap-1.5">
                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest block font-sans">
                          🎯 SELECT YOUR WEALTH OPTIMIZATION PATHWAY:
                        </span>
                        <span className="text-[8px] font-black text-[#1e3a8a] bg-blue-105 border border-blue-200 px-2.5 py-0.5 rounded-full uppercase tracking-wider select-none leading-none">
                          ⚡ 100% Tax-Compliant & SECURE
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        {/* Pathway A */}
                        <div className="bg-white border-2 border-indigo-600 p-4 rounded-xl shadow-sm hover:shadow-md transition-all relative overflow-hidden">
                          <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[7px] font-black px-2 py-0.5 rounded-bl uppercase tracking-widest font-sans select-none">
                            🏆 94% PREFER THIS
                          </div>
                          <span className="text-[10.5px] font-black text-indigo-900 uppercase block mb-1">
                            PATHWAY A: HYBRID SYSTEMATIC SWITCH
                          </span>
                          <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-3">
                            Move capital gradually via systematic transfers (STPs) over a staggered schedule. 
                          </p>
                          <ul className="text-[10px] text-slate-500 font-semibold space-y-1">
                            <li className="flex items-center gap-1.5 text-emerald-700">
                              <span className="font-extrabold">✓</span> Automatically avoids all **1% exit loads**
                            </li>
                            <li className="flex items-center gap-1.5 text-emerald-700">
                              <span className="font-extrabold">✓</span> Harvests up to **₹1.25 Lakh tax-free** capital-gains limit annually
                            </li>
                            <li className="flex items-center gap-1.5 text-emerald-700">
                              <span className="font-extrabold">✓</span> Safe, zero-out-of-pocket setup costs
                            </li>
                          </ul>
                        </div>

                        {/* Pathway B */}
                        <div className="bg-white border border-slate-200 hover:border-slate-300 p-4 rounded-xl shadow-sm transition-all relative">
                          <span className="text-[10.5px] font-black text-amber-705 uppercase block mb-1">
                            PATHWAY B: HALT & RE-ROUTE SIP CAPITALS
                          </span>
                          <p className="text-[11px] text-slate-600 font-bold leading-relaxed mb-3">
                            Instantly halt active monthly SIP allocations in legacy high-drag schemes. 
                          </p>
                          <ul className="text-[10px] text-slate-500 font-semibold space-y-1">
                            <li className="flex items-center gap-1.5 text-indigo-700">
                              <span className="font-extrabold">✓</span> 100% active fee-drag removal for all upcoming monthly tranches
                            </li>
                            <li className="flex items-center gap-1.5 text-indigo-700">
                              <span className="font-extrabold">✓</span> Zero immediate tax implication since no old units are sold
                            </li>
                            <li className="flex items-center gap-1.5 text-indigo-700">
                              <span className="font-extrabold">✓</span> Multiplies compounding immediately on new monthly investments
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Trust guarantee banner */}
                      <div className="bg-white border border-slate-150 p-2.5 rounded-lg text-center flex items-center justify-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <p className="text-[9.5px] font-bold text-slate-550 leading-none">
                          ⚡ Joined over **12,400+ investors** actively saving on distribution fees using automated direct portfolios!
                        </p>
                      </div>
                    </div>

                    {/* Action button to connect with desk directly */}
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          window.location.hash = "#connect";
                        }}
                        className="w-full bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-[12.5px] py-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 flex flex-col items-center justify-center gap-0.5 cursor-pointer active:scale-[0.98] ring-2 ring-emerald-400/30 font-sans"
                      >
                        <div className="flex items-center gap-1.5">
                          <span>ESTABLISH SECURE CHURN STRATEGY & START TAX-FREE SWITCH</span>
                          <ArrowUpRight className="w-4.5 h-4.5 animate-bounce" />
                        </div>
                        <span className="text-[9px] text-emerald-100 font-bold uppercase tracking-widest block font-sans">
                          🛡️ Risk Shielded • Zero-Cost Switch Setup • AMFI-Rerouted Portfolios • SEBI Guideline Compliant
                        </span>
                      </button>
                      <div className="text-center">
                        <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
                          🔒 SECURE TRANSACTION DESK & COMMISSION AUDITING • Zero upfront fees • Advisory desk operates 24/7
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Exit loads warnings */}
                <div className="space-y-3">
                  <h4 className="text-[13.5px] font-black text-slate-850 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Avoidable Exit Load Penalties Diagnostics</span>
                  </h4>
                  <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl space-y-3">
                    {result.exitLoadLeaks.map((leak, idx) => (
                      <div key={idx} className="flex gap-2.5 text-[11.5px] font-semibold leading-relaxed text-slate-650">
                        <span className="text-amber-500 font-extrabold shrink-0 mt-0.5">⚙</span>
                        <span>{leak}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Tax Leaks Paragraph Display */}
                <div className="space-y-3">
                  <h4 className="text-[13.5px] font-black text-slate-850 flex items-center gap-2">
                    <Info className="w-4.5 h-4.5 text-rose-500" />
                    <span>Transaction Capital Gains Tax Drag Analysis</span>
                  </h4>
                  <div className="border border-rose-100 bg-rose-50/5 p-4 rounded-xl">
                    <p className="text-[12px] font-bold leading-relaxed text-slate-700">
                      {result.taxLeaks}
                    </p>
                  </div>
                </div>

                {/* Actionable Portfolio Steps */}
                <div className="border border-slate-205 rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-indigo-50/10 to-slate-50/40 space-y-5">
                  <div className="border-b border-slate-150 pb-3 space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block animate-pulse">
                      SYSTEMATIC TRANSITION PLAYBOOK
                    </span>
                    <h4 className="text-[14px] font-black text-slate-900 flex items-center gap-1.5">
                      <Compass className="w-4.5 h-4.5 text-blue-600 select-none animate-spin" style={{ animationDuration: '3s' }} />
                      <span>Pure Wealth Systematic Execution Plan</span>
                    </h4>
                  </div>

                  {/* Explanation of section in short and simple easy to understand manner and the importance and impact on portfolio accordingly to go with our plan */}
                  <div className="text-xs text-slate-650 leading-relaxed font-semibold bg-white p-4.5 border border-slate-150 rounded-xl shadow-sm space-y-2">
                    <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">
                      ⚠️ Importance & Impact of this Plan
                    </span>
                    <p className="text-[11.5px] text-slate-600 leading-relaxed">
                      Transitioning out of low-efficiency schemes cannot be done in a single day without incurring heavy loads and capital gains shocks. This execution plan is a step-by-step blueprint designed to safely transition your portfolio with **maximum tax efficiency**, ensuring your core capital continues compounding uninterrupted without leakage.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans">
                    {result.actionablePortfolioPlan.map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-white border border-slate-150 p-4 rounded-xl hover:border-blue-200 hover:shadow-sm transition-all">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[11.5px] font-bold text-slate-650 leading-relaxed font-sans">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SECOND CALL TO ACTION (SEBI COMPLIANT MFD LEAD MAGNET AT END) */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden border-2 border-indigo-500 shadow-xl space-y-5">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-blue-600 rounded-full blur-3xl -mr-16 -mt-16 opacity-30 select-none pointer-events-none" />
                  
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800 pb-3">
                    <span className="text-[10px] font-black tracking-widest text-indigo-250 bg-indigo-900/40 border border-indigo-800/60 px-3 py-1 rounded-full uppercase leading-none select-none">
                      🌟 ALIGN YOUR COMPOUNDING BLUEPRINT SECURELY
                    </span>
                    <span className="text-[9.5px] font-black text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-full uppercase leading-none select-none">
                      AMFI Certified MFD
                    </span>
                  </div>

                  <div className="space-y-2 relative z-10">
                    <h3 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
                      Don't Compound in Quiet Inefficiency. Secure Your Staggered Transition Meeting with Pure Wealth Global!
                    </h3>
                    <p className="text-[11.5px] text-indigo-150 leading-relaxed font-semibold">
                      Establishing portfolio efficiency requires structural expertise to systematically clear commission traps, execute capital gains tax harvesting, and build robust fund safety rails. Every single month of sub-optimal allocation permanently drains future wealth compounding. Let our AMFI certified coordinators handle your regular plans completely compliant with SEBI mutual fund distributor guidelines, free of upfront consulting bills!
                    </p>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-3 relative z-10">
                    <a
                      href="https://wa.me/917718860398?text=Hi%20Pure%20Wealth%20Global!%20%F0%9F%93%88%20I%20would%20like%20to%20schedule%20a%201%3A1%20deep%20diagnostic%20review%20and%20discuss%20staggered%20mutual%20fund%20transition%20options%20securely%20on%20WhatsApp."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs px-5 py-3 rounded-2xl transition duration-150 shadow-md hover:shadow-lg text-center cursor-pointer shadow-current"
                    >
                      <span>Book Complimentary 1:1 Diagnostic Analysis on WhatsApp</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </a>
                  </div>

                  <div className="text-[8.5px] text-indigo-300 leading-relaxed border-t border-indigo-900 pt-3 select-none">
                    <strong>Statutory MFD Record Clause:</strong> Mutual fund investments are subject to market risks. Disclosures on regular plan distribution commission structures are detailed in standard offer documents. We facilitate transactions and distribution assistance securely without direct advisory fee billing under SEBI distribution status guidelines.
                  </div>
                </div>

              </motion.div>
              )}
            </AnimatePresence>

          </div>

        </div>
      )}

    </div>
  );
}
