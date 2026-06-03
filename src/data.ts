/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InvestmentAsset, Testimonial, FAQItem } from './types';

export const AMFI_ARN_DETAILS = {
  arnNumber: "306022",
  holderName: "Pure Wealth Global Private Limited",
  validity: "Dec 15, 2028",
  disclaimer: "Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Pure Wealth Global is an AMFI-registered Mutual Fund Distributor."
};

export const DEMO_ASSETS: InvestmentAsset[] = [
  {
    id: "as-1",
    name: "Tata Focused Equity Mutual Fund",
    category: "Mutual Fund",
    region: "India",
    annualReturn: 18.4,
    riskLevel: "Aggressive",
    symbol: "TEF-GR"
  },
  {
    id: "as-2",
    name: "Taurus Largecap Equity Fund",
    category: "Mutual Fund",
    region: "India",
    annualReturn: 16.9,
    riskLevel: "Moderate",
    symbol: "TLCEF-GR"
  },
  {
    id: "as-3",
    name: "Nippon India Nifty 50 BeES ETF",
    category: "ETF",
    region: "India",
    annualReturn: 15.2,
    riskLevel: "Moderate",
    symbol: "NIFTYBEES"
  },
  {
    id: "as-4",
    name: "iShares Core S&P 500 UCITS ETF",
    category: "ETF",
    region: "Global",
    annualReturn: 14.8,
    riskLevel: "Moderate",
    symbol: "IVV"
  },
  {
    id: "as-5",
    name: "Vanguard S&P 500 Index ETF",
    category: "ETF",
    region: "Global",
    annualReturn: 15.6,
    riskLevel: "Aggressive",
    symbol: "VOO"
  },
  {
    id: "as-6",
    name: "LTIMindtree Limited",
    category: "Stock",
    region: "India",
    annualReturn: 21.2,
    riskLevel: "Aggressive",
    symbol: "LTIM"
  },
  {
    id: "as-7",
    name: "Infosys Ltd.",
    category: "Stock",
    region: "India",
    annualReturn: 14.3,
    riskLevel: "Moderate",
    symbol: "INFY"
  },
  {
    id: "as-8",
    name: "Maruti Suzuki India Ltd",
    category: "Stock",
    region: "India",
    annualReturn: 11.5,
    riskLevel: "Moderate",
    symbol: "MARUTI"
  },
  {
    id: "as-9",
    name: "Embassy Office Parks REIT",
    category: "REIT",
    region: "India",
    annualReturn: 9.8,
    riskLevel: "Conservative",
    symbol: "EMBASSY"
  }
];

export const SERVICES_DATA = [
  {
    id: "srv-1",
    title: "Customized Global Asset Allocation",
    subtitle: "High-Conviction, Multi-Asset Portfolios",
    description: "Custom design and monitoring of globally diversified portfolios. We build high-yield conventional portfolios and diversified allocations based on your unique risk tolerance, return objectives, and specific wealth strategies.",
    features: [
      "Rigorous quantitative, fundamental and financial screening parameters",
      "Diversified asset selection across direct equities, mutual funds, gold, and custom models",
      "Strict regular monitoring and automated rebalancing to optimize risk-adjusted returns"
    ],
    bgPattern: "from-emerald-500/10 to-teal-500/5"
  },
  {
    id: "srv-2",
    title: "NRI Wealth Management",
    subtitle: "Tailored to Indian Expatriates Globally & HNIs",
    description: "End-to-end investment assistance for Non-Resident Indians (NRIs) in Gulf countries (UAE, KSA, Qatar, Kuwait, Oman), Singapore, US, and UK. Seamless bank setup advice (NRE/NRO accounts), KYC compilation, and tax-efficient portfolio mapping.",
    features: [
      "Frictionless overseas funds repatriation and compliance consulting",
      "NRE/NRO banking setup guidance and PIS channel routing",
      "Double Tax Avoidance Agreement (DTAA) tax-efficiency mapping"
    ],
    bgPattern: "from-blue-500/10 to-emerald-500/5"
  },
  {
    id: "srv-3",
    title: "Personalized Wealth Planning",
    subtitle: "Custom Financial Plans for HNIs & Families",
    description: "Comprehensive financial modeling centered on your long-term goals — children's higher global education, customized retirement allocations, philanthropic family trusts, and generational legacy transfers.",
    features: [
      "Deep risk profiling & personalized target planning tools",
      "Consolidated multi-asset wealth dashboards (Mutual Funds, ETFs, Stocks)",
      "Dedicated senior investment consultant alignment"
    ],
    bgPattern: "from-amber-500/10 to-emerald-500/5"
  },
  {
    id: "srv-4",
    title: "Portfolio Auditing & Rebalancing",
    subtitle: "Risk Mitigation & Optimization",
    description: "Ensure your investments remain aligned with your long-term wealth objectives. We offer deep business/financial ratio audits, tax-efficiency reporting, and precise calculation of rebalancing metrics for your global accounts.",
    features: [
      "Detailed company-by-company financial statement analysis",
      "Calculated risk-reward ratios on liquid, tradeable, and structural holdings",
      "Quarterly governance frameworks for asset allocation and rebalancing"
    ],
    bgPattern: "from-rose-500/10 to-emerald-500/5"
  }
];

export const FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do you select high-performance mutual funds?",
    answer: "We screen the universe of available mutual funds in India based on historical rolling returns, expense ratios, portfolio turnover, fund manager tenure, and standard deviation score to construct resilient portfolios.",
    category: "Mutual Funds"
  },
  {
    id: "faq-2",
    question: "Can Non-Resident Indians (NRIs) invest in Indian Mutual Funds?",
    answer: "Yes, NRIs can invest in Indian Mutual Funds on a repatriable basis through Non-Resident External (NRE) accounts or a non-repatriable basis via Non-Resident Ordinary (NRO) accounts. Your KYC can be updated overseas, and transactions can be initiated fully digitally.",
    category: "NRI Consulting"
  },
  {
    id: "faq-3",
    question: "What is an AMFI ARN, and why is it important?",
    answer: "AMFI ARN (AMFI Registration Number) is a licensing identifier issued by the Association of Mutual Funds in India to qualified mutual fund distributors and consultants. It ensures the distributor has cleared regulatory certification, adheres to the established code of conduct, and is legally registered to market mutual fund schemes in India.",
    category: "General"
  },
  {
    id: "faq-4",
    question: "Is there automated tax optimization available?",
    answer: "Yes, we analyze your financial year-end statements to identify tax harvesting opportunities on long-term and short-term capital gains (LTCG/STCG) of Indian investments to maximize your net take-home returns.",
    category: "General"
  },
  {
    id: "faq-5",
    question: "How do you select Mutual Funds, ETFs and REITs?",
    answer: "We screen the universe of available mutual funds and global ETFs, selecting high-performing schemes. For REITs and Stocks, we audit their financial statements quarterly against debt levels and operational margins.",
    category: "Mutual Funds"
  },
  {
    id: "faq-6",
    question: "Is there any lock-in period for these investments?",
    answer: "Most mutual funds, ETFs, and stocks are highly liquid and do not carry lock-in periods, allowing redemption at any time. However, select options (like Tax-Saving ELSS) have designated periods, which we optimize during your personalized financial planning.",
    category: "General"
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: "t-1",
    name: "Dr. Farhan Al-Nuaimi",
    role: "Senior Orthopedic Consultant & HNI",
    residence: "NRI",
    location: "Riyadh, Saudi Arabia",
    content: "Managing assets in India while working in Saudi was stressful. Pure Wealth Global helped arrange my NRI accounts and structured a magnificent portfolio of high-growth funds and global tech stocks. Their wealth planning services are remarkably detailed and comforting.",
    rating: 5
  },
  {
    id: "t-2",
    name: "Zafar Ahmed",
    role: "Tech Lead & NRI Investor",
    residence: "NRI",
    location: "Singapore",
    content: "The custom consulting for global ETFs and Indian Mutual Funds has transformed my portfolio. As an NRI in Singapore, I sought high capital returns that are liquid and structured. Pure Wealth provided exceptional guidance, backed by regulatory AMFI code compliance.",
    rating: 5
  },
  {
    id: "t-3",
    name: "Rehana Salim",
    role: "Managing Director, Solis Care",
    residence: "India",
    location: "Mumbai, India",
    content: "For our family office wealth, we wanted a consultant who deeply respects risk-mitigation values without compromising on competitive market yields. The diversified allocation models paired with Nippon BeES has outpaced my benchmark expectations.",
    rating: 5
  },
  {
    id: "t-4",
    name: "Syed Imran",
    role: "Director of Supply Chain & NRI",
    residence: "NRI",
    location: "Dubai, UAE",
    content: "The portfolio planners and interactive SIP calculators on this platform reflect absolute commitment. Booking a video consultation was easy, and their personalized planning helped consolidate all my pre-existing scattered mutual funds.",
    rating: 5
  }
];
