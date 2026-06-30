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
    subtitle: "Tailored to Indian NRIs Globally & HNIs",
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
  },
  {
    id: "faq-7",
    question: "Is my money safe?",
    answer: "Yes, your money is completely safe and secure. When you invest in mutual funds, your capital goes directly to the Asset Management Company (AMC) registered with SEBI (Securities and Exchange Board of India). It is never held in our personal or distributor bank accounts. Mutual fund houses are highly regulated by SEBI, and your investments are held securely in a custodian bank account under your sole name.",
    category: "General"
  },
  {
    id: "faq-8",
    question: "Where does this money get invested?",
    answer: "Your money is invested in diversified portfolios of market instruments such as publicly-traded stocks, government or corporate bonds, and other short-term liquid securities. The exact allocation depends entirely on the fund scheme you choose (e.g., Equity funds invest in company stocks, Debt funds invest in bonds, and Hybrid funds invest in a combination of both).",
    category: "Mutual Funds"
  },
  {
    id: "faq-9",
    question: "How is a mutual fund different from stocks?",
    answer: "Buying a stock means purchasing ownership in a single specific company, which carries high risk if that company underperforms. A mutual fund pools money from thousands of investors to buy a highly diversified portfolio of dozens of stocks or bonds managed by professional fund managers. This instant diversification significantly mitigates individual company risk.",
    category: "Mutual Funds"
  },
  {
    id: "faq-10",
    question: "How risky is mutual fund investing?",
    answer: "Mutual funds carry varying degrees of market risk depending on their underlying assets. Equity funds are subject to stock market volatility and are higher risk but offer superior long-term inflation-beating returns. Debt funds are lower risk but offer more conservative, stable returns. By working with a distributor, we help match your investments with your specific risk tolerance to mitigate unnecessary downside.",
    category: "Mutual Funds"
  },
  {
    id: "faq-11",
    question: "What is a mutual fund?",
    answer: "A mutual fund is a professionally managed financial vehicle that pools money from many investors to purchase a diversified portfolio of securities like stocks, bonds, gold, or short-term debt instruments. It allows retail investors access to professionally managed, diversified portfolios with relatively small amounts of capital.",
    category: "Mutual Funds"
  },
  {
    id: "faq-12",
    question: "What does a 'fund' mean?",
    answer: "A 'fund' simply refers to a collective pool of capital set aside for a specific investment objective. In mutual funds, this pool of money is handled by a SEBI-registered Asset Management Company (AMC) and managed by a professional fund manager according to a predefined mandate (e.g., small-cap, large-cap, or banking sector).",
    category: "Mutual Funds"
  },
  {
    id: "faq-13",
    question: "What are the different types of Indian and other global funds to invest in?",
    answer: "Indian mutual funds are broadly categorized into Equity Funds (for high growth), Debt Funds (for stable income), and Hybrid Funds (for balanced growth). On a global scale, you can invest in international funds, US-focused funds, sector-specific global funds (like technology or ESG), and global commodity ETFs. We help structure a mix of domestic and global assets based on your citizenship status (Resident/NRI) and tax laws.",
    category: "Mutual Funds"
  },
  {
    id: "faq-14",
    question: "Can we invest in US funds from India?",
    answer: "Yes, Resident Indian investors can easily invest in US and other international markets through Indian Mutual Funds that run 'Fund of Funds' (FoF) schemes or actively managed international funds investing directly in overseas stocks. This allows you to gain exposure to global giants like Apple, Microsoft, and Alphabet in INR without needing a foreign brokerage account.",
    category: "Mutual Funds"
  },
  {
    id: "faq-15",
    question: "Do you charge fees separately?",
    answer: "No, we do not charge any separate advisory or service fees to our clients. As AMFI-registered Mutual Fund Distributors (MFDs), we earn our compensation directly from the fund houses through a small commission built into the scheme's Expense Ratio. You get professional portfolio design, regular auditing, and hands-on administrative support at no out-of-pocket cost.",
    category: "General"
  },
  {
    id: "faq-16",
    question: "Can I see my invested money in the app?",
    answer: "Yes! In addition to tracking your consolidated goals and using our portfolio audit diagnostic tool, you will receive official Consolidated Account Statements (CAS) directly from national registries like CAMS and KFintech. Your actual units are held under your unique PAN and folio, making them fully transparent and viewable across all official channels.",
    category: "General"
  },
  {
    id: "faq-17",
    question: "When can I withdraw my money back if I want it?",
    answer: "For most open-ended equity and debt funds, you can withdraw (redeem) your money at any time. Once a redemption is placed, the funds are electronically transferred directly to your registered bank account, typically within 1 to 3 business days depending on the fund type. Only tax-saving ELSS schemes have a mandatory 3-year lock-in period.",
    category: "General"
  },
  {
    id: "faq-18",
    question: "How much will 10k SIP become in 10 years?",
    answer: "At an estimated average long-term growth rate of 12% per annum, a regular monthly SIP of ₹10,000 (total investment of ₹12,00,000) will grow to approximately ₹23,23,391 in 10 years. At a premium rate of 15% per annum, it can reach approximately ₹27,86,573. You can use our interactive SIP calculator in the app to simulate different rates and step-up options!",
    category: "Mutual Funds"
  },
  {
    id: "faq-19",
    question: "Will I lose money if I invest for 1 year?",
    answer: "Equity markets can be volatile in the short term, so investing in equity mutual funds for just 1 year does carry a risk of short-term capital loss. For short-term horizons of 1 year or less, we strongly recommend conservative debt funds or liquid funds, which prioritize capital preservation and offer stable returns rather than high volatility.",
    category: "Mutual Funds"
  },
  {
    id: "faq-20",
    question: "What is the minimum investment time required?",
    answer: "Technically, there is no legal minimum holding time for open-ended funds, but for equity-oriented funds, a minimum investment horizon of 3 to 5+ years is highly recommended to average out market volatility and experience the true power of compounding. For short-term needs, liquid and debt funds are suitable for horizons ranging from 1 day to 2 years.",
    category: "Mutual Funds"
  },
  {
    id: "faq-21",
    question: "How will I get my money back?",
    answer: "Getting your money back is a fully automated, secure process. When you initiate a redemption request, the Mutual Fund house processes the transaction and deposits the redemption proceeds directly into your verified and linked bank account via secure electronic bank transfer (NEFT/RTGS/IMPS). No physical cheques or manual steps are required.",
    category: "General"
  },
  {
    id: "faq-22",
    question: "Can I withdraw anytime I want?",
    answer: "Yes, with open-ended mutual funds, you have the flexibility to withdraw your money partially or fully at any time without any restriction, subject to standard exit loads (usually 1% if withdrawn within 1 year for specific equity funds) and tax obligations. Only close-ended schemes or tax-saving ELSS funds have specific lock-in periods.",
    category: "General"
  },
  {
    id: "faq-23",
    question: "What if I want to increase or decrease my SIP amount?",
    answer: "You have absolute flexibility over your investments. You can increase (step-up) or decrease your SIP amount at any time by filling out a simple digital request. We can also set up an automatic 'Step-up SIP' which automatically increases your monthly contribution by a fixed percentage or amount every year as your income grows.",
    category: "Mutual Funds"
  },
  {
    id: "faq-24",
    question: "What if I want to start or stop my SIP?",
    answer: "Starting or stopping an active SIP is simple and penalty-free. If you face a temporary cash flow constraint, you can pause or stop your SIP completely without any fine or charge from the fund house. You can resume it whenever your finances permit.",
    category: "Mutual Funds"
  },
  {
    id: "faq-25",
    question: "What if I have lumpsum to invest?",
    answer: "If you have a lump sum of money to invest (e.g., from a bonus, inheritance, or business sale), we can invest it as a single transaction. To manage market volatility, we often recommend a 'Systematic Transfer Plan' (STP), where the lump sum is initially parked in a safe liquid fund and automatically transferred in small, regular portions into equity funds over 6 to 12 months.",
    category: "Mutual Funds"
  },
  {
    id: "faq-26",
    question: "What if I have lumpsum and SIP both to invest?",
    answer: "We can easily build a hybrid investment plan for you. The lump sum can be deployed immediately (or via an STP for risk management) to capture current market valuations, while a monthly SIP runs in parallel to benefit from rupee cost averaging. This dual approach maximizes compounding over time.",
    category: "Mutual Funds"
  },
  {
    id: "faq-27",
    question: "What is the difference between direct and regular funds?",
    answer: "Direct funds require you to research, select, monitor, rebalance, and tax-optimize your portfolio completely on your own, exposing you to costly mistakes and administrative burdens. Regular funds, which you buy through an AMFI-registered distributor, include professional handholding, active portfolio monitoring, regular rebalancing, and expert guidance. This comprehensive support helps you avoid emotional decision-making and ensures your portfolio stays aligned with your goals—making the net value and peace of mind far superior to trying to manage direct funds alone.",
    category: "Mutual Funds"
  },
  {
    id: "faq-28",
    question: "With what amount can I start a SIP?",
    answer: "You can start your wealth-building journey with very small amounts. Many mutual fund schemes allow you to start a monthly SIP with as little as ₹500 or ₹1,000, making disciplined investing highly accessible to everyone.",
    category: "Mutual Funds"
  },
  {
    id: "faq-29",
    question: "Does money get deducted automatically from my bank account?",
    answer: "Yes, for your convenience, we set up a secure One-Time Mandate (OTM) with your bank. Once registered, your designated SIP amount will be deducted automatically on your selected date each month and transferred directly to the AMC. You will receive an SMS and email confirmation for every transaction.",
    category: "General"
  },
  {
    id: "faq-30",
    question: "Do I have to pay you the SIP amount?",
    answer: "No, you never pay any investment money to us directly. All financial transactions are processed securely through official BSE/NSE payment gateways or bank mandates, transferring funds directly from your personal bank account to the official bank account of the respective Asset Management Company (SEBI-registered AMC).",
    category: "General"
  },
  {
    id: "faq-31",
    question: "How are you different from others? Why should we go with you?",
    answer: "Unlike transaction-focused DIY apps or impersonal banking channels, we provide a personalized, comprehensive, high-touch consultation experience. We don't just sell products; we audit your existing assets, design customized goal-based portfolios, manage tax-harvesting opportunities, and provide continuous personal handholding. We act as your dedicated wealth partners to ensure your money works as hard as you do.",
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
