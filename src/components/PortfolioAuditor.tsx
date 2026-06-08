/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  FolderClosed
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
}

interface AuditResult {
  totalFunds: number;
  overallStrengths: string[];
  criticalLeaks: string[];
  diversificationScore: number;
  diversificationStatus: string;
  diversificationAnalysis: string;
  investorPersona: InvestorPersona;
  fundWiseAudit: FundAuditItem[];
  returnGainsProjection: {
    currentValue: number;
    projectedValue5YCurrent: number;
    projectedValue5YPWG: number;
    totalExtraWealthEarned: number;
    improvementExplanation: string;
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

export default function PortfolioAuditor() {
  const [activeTab, setActiveTab] = useState<"upload" | "demo" | "manual">("upload");
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);
  const [result, setResult] = useState<AuditResult | null>(null);

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
        try {
          const parsed = JSON.parse(errText);
          errMsg = parsed.error || errMsg;
        } catch {
          errMsg = errText || errMsg;
        }
        throw new Error(errMsg);
      }

      const auditData = await response.json();
      setResult(auditData);

    } catch (err: any) {
      console.error("[Portfolio Audit] Deep audit diagnostic error:", err);
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
          "Core Alpha Gen", "Defensive Anchor", "Fee-Dragged Peer"
        ];
        const basket = baskets[i % 3];
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

      {/* Main Container Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Inputs Panel */}
        <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl shadow-lg p-5 sm:p-6" id="input-methods-panel">
          
          <h2 className="text-base font-black text-slate-900 mb-5 flex items-center gap-2">
            <Compass className="w-4.5 h-4.5 text-blue-600" />
            <span>Select Holding Source</span>
          </h2>

          {/* Action Navigation Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-50 border border-slate-100 rounded-2xl mb-6">
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
            <button
              onClick={() => { setActiveTab("manual"); setErrorStatus(null); }}
              className={`py-2 px-1 text-[11px] sm:text-[12.5px] font-black rounded-xl transition-all cursor-pointer ${
                activeTab === "manual" ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Manual Holdings
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
                    <span className="font-extrabold text-slate-850 group-hover:text-blue-700 block">
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

          {/* Tab 3: Manual Holdings Input */}
          {activeTab === "manual" && (
            <div className="space-y-4" id="manual-holdings-view">
              <div className="flex justify-between items-center text-xs">
                <span className="font-black text-slate-400 uppercase tracking-wider">Holding Rows Registration</span>
                <button
                  onClick={handleAddManualRow}
                  className="text-blue-600 hover:text-blue-800 font-black flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Fund</span>
                </button>
              </div>

              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {manualHoldings.map((row, idx) => (
                  <div key={row.id} className="border border-slate-150 p-3.5 rounded-2xl bg-slate-55/10 space-y-3 relative">
                    <button
                      onClick={() => handleRemoveManualRow(row.id)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-rose-600 cursor-pointer disabled:opacity-40"
                      disabled={manualHoldings.length === 1}
                      title="Remove holding row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="space-y-1 pr-6">
                      <label className="text-[9.5px] font-black text-slate-405 uppercase block">Fund Name</label>
                      <input
                        type="text"
                        value={row.fundName}
                        onChange={(e) => handleManualRowChange(row.id, "fundName", e.target.value)}
                        placeholder="e.g. HDFC Mid-Cap Opportunities"
                        className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:border-blue-500 font-bold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[9.5px] font-black text-slate-405 uppercase block">Portfolio allocation (%)</label>
                        <input
                          type="number"
                          value={row.allocation}
                          onChange={(e) => handleManualRowChange(row.id, "allocation", Number(e.target.value))}
                          placeholder="e.g. 25"
                          min="1"
                          max="100"
                          className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:border-blue-500 font-bold"
                        />
                      </div>

                      <div>
                        <label className="text-[9.5px] font-black text-slate-405 uppercase block">Category Segregation</label>
                        <select
                          value={row.category}
                          onChange={(e) => handleManualRowChange(row.id, "category", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-xs p-2 focus:outline-none focus:border-blue-500 font-bold"
                        >
                          <option value="Large Cap">Large Cap</option>
                          <option value="Mid Cap">Mid Cap</option>
                          <option value="Small Cap">Small Cap</option>
                          <option value="Multi Cap">Multi Cap</option>
                          <option value="Large & Midcap">Large & Midcap</option>
                          <option value="Flexi Cap">Flexi Cap</option>
                          <option value="Sectoral/Thematic">Sectoral/Thematic</option>
                          <option value="Liquid">Liquid / Debt</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center pt-1.5 border-t border-slate-100">
                      <div>
                        <label className="text-[9.5px] font-black text-slate-405 uppercase block">Purchase Date</label>
                        <input
                          type="date"
                          value={row.purchaseDate}
                          onChange={(e) => handleManualRowChange(row.id, "purchaseDate", e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg text-[11px] p-1.5 focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-3">
                        <input
                          id={`sip-${row.id}`}
                          type="checkbox"
                          checked={row.monthlySip}
                          onChange={(e) => handleManualRowChange(row.id, "monthlySip", e.target.checked)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor={`sip-${row.id}`} className="text-[11px] font-bold text-slate-600 cursor-pointer">
                          Active Monthly SIP
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50/50 rounded-2xl p-3 border border-blue-100 flex gap-2.5 text-[11.5px] font-bold text-slate-700 leading-normal">
                <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <p>
                  Ensure weight totals equal approximately 100%. Date values help calculate holding ages and estimate potential STCG exit taxes accurately.
                </p>
              </div>
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

        {/* Right Side: Audit Results Dashboard */}
        <div className="lg:col-span-7 bg-white border border-slate-100 shadow-xl rounded-3xl p-5 sm:p-6" id="dashboard-results-container">
          
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key="results-loaded"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                
                {/* Result Top Cards Banner */}
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  
                  {/* Diversification Score card */}
                  <div className="flex-1 bg-gradient-to-br from-slate-50 to-slate-100/40 border border-slate-150 rounded-2xl p-4 flex items-center gap-4">
                    <div className="relative shrink-0 flex items-center justify-center">
                      {/* Simple visual SVG radial progress bar */}
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle cx="32" cy="32" r="28" stroke="#2563eb" strokeWidth="6" fill="transparent"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - result.diversificationScore / 100)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-sm font-black text-slate-850">
                        {result.diversificationScore}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block leading-none">
                        DIVERSIFICATION INDEX
                      </span>
                      <span className={`text-[12px] font-extrabold inline-block px-2 py-0.5 rounded-full border ${getDiversificationColor(result.diversificationScore)}`}>
                        {result.diversificationStatus}
                      </span>
                      <span className="text-[10px] text-slate-405 block">
                        Based on capitalization overlaps
                      </span>
                    </div>
                  </div>

                  {/* Fund count totalizer card */}
                  <div className="sm:w-1/3 bg-slate-50 border border-slate-150 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                      AUDITED HOLDINGS
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-black text-slate-900">{result.totalFunds}</span>
                      <span className="text-xs font-black text-slate-500">Mutual Schemes</span>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5 mt-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Data parsing synchronized</span>
                    </span>
                  </div>

                </div>

                {/* ADVANCED: Investor Behavioral Profiling Card */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
                    <User className="w-5 h-5 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                        AI INVESTOR BEHAVIOR PROFILE
                      </span>
                      <h4 className="text-[14px] font-black text-slate-900 leading-none">
                        Category: {result.investorPersona.typeName}
                      </h4>
                    </div>
                  </div>

                  <div className="border-l-2 border-blue-500 pl-4 py-1 italic text-slate-705 text-xs font-semibold leading-relaxed">
                    "{result.investorPersona.behaviorQuote}"
                  </div>

                  <p className="text-xs text-slate-650 leading-relaxed font-medium">
                    {result.investorPersona.behaviorAnalysis}
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col justify-center">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">ESTIMATED RISK PROFILE</span>
                      <span className="text-xs font-black text-slate-750">
                        ⚡ {result.investorPersona.riskToleranceRating} Risk Tolerance
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-slate-100 flex flex-col justify-center">
                      <span className="text-[8.5px] font-black text-slate-400 uppercase block tracking-wider mb-0.5">HOLDINGS CHURN VELOCITY</span>
                      <span className="text-xs font-black text-slate-750">
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
                      <div className="space-y-1">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Core Alpha Gen").map((fund, idx) => (
                          <div key={idx} className="text-[11px] font-extrabold text-slate-750 flex justify-between items-center border-t border-slate-100/70 pt-1.5">
                            <span className="truncate max-w-[170px]">{fund.fundName}</span>
                            <span className="text-emerald-700 font-mono text-[10px]">Exp. {fund.currentExpenseRatio}%</span>
                          </div>
                        ))}
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
                      <div className="space-y-1">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Defensive Anchor").map((fund, idx) => (
                          <div key={idx} className="text-[11px] font-extrabold text-slate-755 flex justify-between items-center border-t border-slate-100/70 pt-1.5">
                            <span className="truncate max-w-[170px]">{fund.fundName}</span>
                            <span className="text-blue-700 font-mono text-[10px]">DS: {fund.downsideProtectionRating}/10</span>
                          </div>
                        ))}
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
                      <div className="space-y-1">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Fee-Dragged Peer").map((fund, idx) => (
                          <div key={idx} className="text-[11px] font-extrabold text-slate-755 flex justify-between items-center border-t border-slate-100/70 pt-1.5">
                            <span className="truncate max-w-[170px]">{fund.fundName}</span>
                            <span className="text-amber-700 font-mono text-[10px]">Expense: {fund.currentExpenseRatio}%</span>
                          </div>
                        ))}
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
                      <div className="space-y-1">
                        {result.fundWiseAudit.filter(f => f.basketClassification === "Rebalance/Churn Catalyst").map((fund, idx) => (
                          <div key={idx} className="text-[11px] font-extrabold text-slate-755 flex justify-between items-center border-t border-slate-100/70 pt-1.5">
                            <span className="truncate max-w-[170px]">{fund.fundName}</span>
                            <span className="text-rose-700 font-mono text-[10px]">Load Exit: ₹{fund.switchingExitLoadCost}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIODE: Strengths and Critical Leaks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths Card */}
                  <div className="border border-emerald-100 bg-emerald-50/10 rounded-2xl p-5 space-y-3.5">
                    <h4 className="text-[12.5px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 shrink-0 select-none animate-pulse" />
                      <span>Portfolio Strengths</span>
                    </h4>
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
                  <div className="border border-rose-100 bg-rose-50/10 rounded-2xl p-5 space-y-3.5">
                    <h4 className="text-[12.5px] font-black text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldAlert className="w-4.5 h-4.5 text-rose-600 shrink-0 select-none animate-pulse" />
                      <span>Wealth Performance Leaks</span>
                    </h4>
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

                {/* TRANSITION COST & TAX IMPACT LEDGER */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-205 pb-3">
                    <Coins className="w-5 h-5 text-blue-600" />
                    <div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none mb-1">
                        AMFI COMPLIANT LEDGER
                      </span>
                      <h4 className="text-[14px] font-black text-slate-900 leading-none">
                        Switching Cost & Transition Tax Impact
                      </h4>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">EXIT PLACEMENT PENALTY</span>
                      <span className="text-base font-black text-rose-600 leading-none">
                        ₹{(result.switchingCostSummary.totalExitLoad).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-450 mt-1">Accumulated exit load loads</span>
                    </div>

                    <div className="bg-white rounded-xl p-3 border border-slate-100 flex flex-col justify-between">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">CAPITAL GAINS TAX NET</span>
                      <span className={`text-base font-black leading-none ${result.switchingCostSummary.totalTaxImpact < 0 ? "text-rose-600" : "text-emerald-600"}`}>
                        {result.switchingCostSummary.totalTaxImpact < 0 ? "-" : "+"}₹{Math.abs(result.switchingCostSummary.totalTaxImpact).toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-450 mt-1">Estimated gains tax drag</span>
                    </div>
                  </div>

                  <div className="bg-blue-100/50 border border-blue-105 p-3.5 rounded-xl space-y-1.5">
                    <span className="text-[10.5px] font-black text-blue-805 uppercase tracking-wide block">
                      💡 Systematic Exits and Tax-Harvesting Strategy
                    </span>
                    <p className="text-[11.5px] text-slate-700 leading-relaxed font-semibold">
                      {result.switchingCostSummary.avoidanceStrategy}
                    </p>
                  </div>
                </div>

                {/* Peer-To-Peer Relative Fee & Strategy Optimization Table */}
                <div className="space-y-3">
                  <h4 className="text-[13.5px] font-black text-slate-850 flex items-center gap-2">
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
                                <span className={`inline-block text-[8.5px] font-extrabold px-1.5 py-0.2 rounded border ${getBasketColor(fund.basketClassification)}`}>
                                  {getBasketBadge(fund.basketClassification)}
                                </span>
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
                      </tbody>
                    </table>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 block pb-1">
                    * Fee optimization compares expense structures within identical categories using AMFI historical listings. Reducing operational fee slices directly preserves compounding yield.
                  </span>
                </div>

                {/* Recharts Projected extra compounding layout */}
                <div className="bg-slate-50 border border-slate-150 rounded-2xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-slate-200/50 pb-4">
                    <div className="space-y-0.5">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">
                        5-YEAR COMPOUNDING FORECAST
                      </span>
                      <h4 className="text-[13px] font-black text-slate-900 leading-none">
                        Compounded Cumulative Cost-Drag Visualization
                      </h4>
                    </div>
                    <div className="bg-emerald-100/60 border border-emerald-250/30 rounded-xl py-1 px-3 text-right">
                      <span className="text-[8px] font-black text-emerald-805 uppercase block tracking-wider leading-none mb-0.5">Compiled Yield Increment</span>
                      <span className="text-12.5px font-black text-emerald-800">
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

                  <p className="text-[11.5px] text-slate-650 font-semibold leading-relaxed bg-white border border-slate-100 p-3 rounded-xl">
                    <strong>Compound Action:</strong> {result.returnGainsProjection.improvementExplanation}
                  </p>
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
                <div className="border-t border-slate-100 pt-6 space-y-4">
                  <h4 className="text-[13.5px] font-black text-slate-900 tracking-tight">
                    Pure Wealth Systematic Execution Plan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {result.actionablePortfolioPlan.map((step, idx) => (
                      <div key={idx} className="flex gap-3 bg-white border border-slate-150 p-3.5 rounded-xl hover:border-blue-200 transition-colors">
                        <span className="w-5.5 h-5.5 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <p className="text-[11px] font-bold text-slate-650 leading-relaxed">
                          {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to transition directly to connect page */}
                <div className="bg-blue-600 text-white rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-blue-500 rounded-full blur-2xl -mr-12 -mt-12 opacity-40" />
                  <div className="space-y-1.5 relative z-10 max-w-xl">
                    <h5 className="font-extrabold text-[15px]">
                      Stagger folio switches with Pure Wealth senior research desk
                    </h5>
                    <p className="text-[11.5px] text-blue-100 leading-relaxed font-semibold">
                      Avoid accidental capital gains liability, stagger exits patiently to wipe out exit load charges, and align allocations according to institutional Sortino and 5-year rolling curves.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      window.location.hash = "#connect";
                    }}
                    className="bg-white hover:bg-slate-50 text-blue-700 font-extrabold text-[12px] px-5 py-3 rounded-full transition-all flex items-center justify-center gap-1 shrink-0 relative z-10 cursor-pointer shadow-md active:scale-95"
                  >
                    <span>Connect AMFI Advisors</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 min-h-[500px] space-y-4" id="placeholder-audit-card">
                <div className="p-4 bg-slate-50 rounded-full text-slate-400">
                  <FileText className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="text-[14px] font-extrabold text-slate-800">
                    Waiting for Holding Configuration
                  </h4>
                  <p className="text-[11.5px] text-slate-500 font-semibold leading-relaxed">
                    Select a curated regular scheme demo CAS profile from the left, upload your actual CAS holding sheet, or input assets manually. Click 'Run Deep Diagnostic' to analyze your performance baskets.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>

        </div>

      </div>

    </div>
  );
}
