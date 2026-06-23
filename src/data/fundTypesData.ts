export interface FundTypeDetail {
  id: string;
  name: string;
  category: 'debt' | 'hybrid' | 'equity';
  shortDesc: string;
  howItWorks: string;
  example: string;
  suitedFor: string[];
  shouldAvoid: string;
  alternative: string;
  avgReturn: string;
  sharpeRatio: string;
  recommendedTimeline: string;
  benchmark: string;
  taxes: string;
  expenseRatio: string;
  exitLoad: string;
  vettedSchemes: {
    name: string;
    risk: 'Low' | 'Moderate-Low' | 'Moderate' | 'Moderate-High' | 'High' | 'Very High';
    focus: string;
    return: string;
  }[];
  faqs: {
    q: string;
    a: string;
  }[];
}

export const fundTypesCategories = [
  {
    id: 'debt',
    title: 'Debt Funds',
    icon: 'ShieldCheck',
    color: 'emerald',
    subTypes: [
      { id: 'liquid', name: 'Liquid Funds' },
      { id: 'ultra-short', name: 'Ultra Short Funds' },
      { id: 'low-duration', name: 'Low Duration Funds' },
      { id: 'medium-duration', name: 'Medium Duration Funds' },
      { id: 'dynamic-bond', name: 'Dynamic Bond Funds' },
      { id: 'gilt', name: 'Gilt Funds' },
      { id: 'credit-risk', name: 'Credit Risk Funds' }
    ]
  },
  {
    id: 'hybrid',
    title: 'Hybrid Funds',
    icon: 'Layers',
    color: 'amber',
    subTypes: [
      { id: 'arbitrage', name: 'Arbitrage Funds' },
      { id: 'conservative', name: 'Conservative Hybrid' },
      { id: 'aggressive', name: 'Aggressive Hybrid' }
    ]
  },
  {
    id: 'equity',
    title: 'Equity Funds',
    icon: 'Coins',
    color: 'blue',
    subTypes: [
      { id: 'large-cap', name: 'Large Cap Funds' },
      { id: 'mid-cap', name: 'Mid Cap Funds' },
      { id: 'small-cap', name: 'Small Cap Funds' },
      { id: 'multi-cap', name: 'Multi Cap Funds' },
      { id: 'elss', name: 'ELSS (Tax Saving)' },
      { id: 'dividend-yield', name: 'Dividend Yield Funds' },
      { id: 'sector', name: 'Sector / Thematic' },
      { id: 'contra', name: 'Contra Funds' },
      { id: 'value-oriented', name: 'Value Oriented' }
    ]
  }
];

export const fundTypesDetails: Record<string, FundTypeDetail> = {
  // ================= DEBT SUB-TYPES =================
  liquid: {
    id: 'liquid',
    name: 'Liquid Funds',
    category: 'debt',
    shortDesc: 'Immediate liquidity with capital lending maturity capped at strictly 91 days.',
    howItWorks: 'Liquid funds invest in high-security short-term money market instruments such as commercial papers, treasury bills, and certificates of deposits. Because the maturity of these papers is capped at 91 days, these funds are extremely resilient to interest rate changes across the macroeconomy.',
    example: 'If you invest ₹5,00,000, your money is lent out across highly stable short-term windows: e.g., ₹2,50,000 in RBI Treasury Bills (sovereign rated) and ₹2,50,000 in short-term CDs from State Bank of India, accruing overnight rates yields.',
    suitedFor: [
      'Investors wanting to park emergency surpluses or cash fallback pools.',
      'Diaspora HNIs waiting to deploy large tranches into domestic real estate or equity markets.',
      'SaaS firms or corporates managing active treasury capital.'
    ],
    shouldAvoid: 'Avoid if your goal is long-term high-inflation wealth compounding, as yields are capped under standard overnight rates.',
    alternative: 'Arbitrage funds if you fall under high marginal taxation slabs and want tax optimization.',
    avgReturn: '6.7% - 7.5% CAGR',
    sharpeRatio: '2.10 - 2.80',
    recommendedTimeline: '1 Day to 3 Months',
    benchmark: 'Nifty Liquid Index A-I',
    taxes: 'Marginal tax slab standard rates. Capital gains are directly merged with your income and taxed according to your tax brackets.',
    expenseRatio: 'Direct Plans: 0.15% - 0.25% | Regular: 0.40% - 0.60%',
    exitLoad: 'Graduated exit penalty starting at 0.0070% on Day 1, falling to 0.0000% from Day 7 onwards.',
    vettedSchemes: [
      { name: 'ICICI Prudential Liquid Fund Direct Growth', risk: 'Low', focus: 'AAA treasury bills and institutional commercial paper', return: '7.15% CAGR' },
      { name: 'HDFC Liquid Fund Direct Plan Growth', risk: 'Low', focus: 'Vetted sovereign debt and high-grade certificates of deposit', return: '7.10% CAGR' }
    ],
    faqs: [
      { q: 'Can I redeem money from Liquid Funds instantly?', a: 'Yes. Most premium liquid schemes offer instant-redemption features allowing up to ₹50,000 or 90% of your holdings (whichever is lower) to land in your linked bank account within 30 seconds.' },
      { q: 'Is there any risk of losing principal in liquid funds?', a: 'While no investment is 100% risk-free, liquid funds have the lowest risk profile in the entire mutual fund spectrum due to the short 91-day maturity cycle of their underlying assets.' }
    ]
  },
  'ultra-short': {
    id: 'ultra-short',
    name: 'Ultra Short Funds',
    category: 'debt',
    shortDesc: 'Enhanced cash parking yield with commercial maturity periods between 3 to 6 months.',
    howItWorks: 'Ultra Short Duration Funds extend the yield curve slightly beyond liquid funds by purchasing corporate debt and commercial papers maturing between 90 to 180 days. This offers a marginal yield premium while maintaining high liquidity.',
    example: 'An allocation of ₹3,00,000 aggregates capital into corporate commercial notes from institutions like SIDBI, HDFC Bank, and LIC Housing Finance, capturing a slightly higher credit spread than overnight papers.',
    suitedFor: [
      'Investors looking to park capital for a horizon of 1 to 6 months.',
      'Savers looking for slightly better yields than standard bank deposits without taking credit risk.'
    ],
    shouldAvoid: 'Avoid matching with timelines shorter than 1 month, as market fluctuations could cause minor volatility inside shorter windows.',
    alternative: 'Liquid funds if your financial timeline is shorter than 30 days.',
    avgReturn: '6.9% - 7.8% CAGR',
    sharpeRatio: '1.80 - 2.45',
    recommendedTimeline: '1 to 6 Months',
    benchmark: 'Nifty Ultra Short Duration Debt Index',
    taxes: 'Taxed at your standard slab rates, fully consolidated with annual income streams.',
    expenseRatio: 'Direct Plans: 0.20% - 0.35% | Regular: 0.50% - 0.85%',
    exitLoad: 'Usually 0.00% (No exit load charges apply).',
    vettedSchemes: [
      { name: 'Aditya Birla Sun Life Ultra Short Term Direct Growth', risk: 'Low', focus: 'Dynamic corporate money market instruments', return: '7.45% CAGR' },
      { name: 'SBI Ultra Short Duration Fund Direct Growth', risk: 'Low', focus: 'High quality short-term public sector paper', return: '7.38% CAGR' }
    ],
    faqs: [
      { q: 'How do Ultra Short Funds differ from Liquid Funds?', a: 'Ultra Short funds holding periods are slightly longer (3-6 months vs. under 91 days). This allows them to invest in bonds with higher interest payments, but with slightly more price sensitivity to rate cycles.' },
      { q: 'Are there exit loads on Ultra Short funds?', a: 'The majority of ultra short debt funds carry zero exit load, making them excellent for highly flexible corporate capital allocation.' }
    ]
  },
  'low-duration': {
    id: 'low-duration',
    name: 'Low Duration Funds',
    category: 'debt',
    shortDesc: 'Short-term debt allocation with Macauley portfolio duration between 6 to 12 months.',
    howItWorks: 'Low Duration Funds invest in corporate debentures and commercial papers with portfolio duration matching 6 to 12 months. They harvest yield spreads from high AAA or AA+ rated corporate players requiring year-long credit facilities.',
    example: 'An investment of ₹10,00,000 is distributed across commercial assets maturing in 10 months, issued by top enterprises like Tata Projects or NABARD, hedging against local commercial rate shifts.',
    suitedFor: [
      'Capital buffers with an investment timeline of 6 months to 1 year.',
      'Investors looking to build safe funds for an upcoming vehicle purchase, tax liability, or property downpayment.'
    ],
    shouldAvoid: 'Avoid if interest rates across the local economy are rising rapidly, as longer duration debt suffers minor capital devaluation.',
    alternative: 'Arbitrage Hybrid funds for HNIs sitting at the 39% or 30% tax brackets.',
    avgReturn: '7.1% - 8.2% CAGR',
    sharpeRatio: '1.60 - 2.10',
    recommendedTimeline: '6 to 12 Months',
    benchmark: 'Nifty Low Duration Debt Index',
    taxes: 'Consolidated with marginal income tax bracket standard redemptions.',
    expenseRatio: 'Direct Plans: 0.25% - 0.45% | Regular: 0.60% - 1.05%',
    exitLoad: 'None.',
    vettedSchemes: [
      { name: 'ICICI Prudential Low Duration Fund Direct Growth', risk: 'Low', focus: 'Prime corporate debt and banking instruments', return: '7.85% CAGR' },
      { name: 'Kotak Low Duration Fund Direct Growth', risk: 'Low', focus: 'Vetted high grade commercial credit structures', return: '7.78% CAGR' }
    ],
    faqs: [
      { q: 'What is Macaulay Duration?', a: 'Macaulay duration measures how long (in years) it takes for an investor to be repaid the bond’s price by the total cash flows generated. It helps understand interest risk.' },
      { q: 'Are low duration funds safe from corporate defaults?', a: 'By focusing on highly rated AAA or sovereign public enterprise securities, default risk is minimized to almost zero across vetted parameters.' }
    ]
  },
  'medium-duration': {
    id: 'medium-duration',
    name: 'Medium Duration Funds',
    category: 'debt',
    shortDesc: 'Strategic yield accumulation with paper maturities ranging from 3 to 4 years.',
    howItWorks: 'Medium Duration Funds target corporate bonds and public debentures with a Macaulay duration between 3 to 4 years. They optimize returns by capitalising on both high regular coupon payments and coupon-rate falling cycles (generating capital gains as bond prices climb).',
    example: 'Investing ₹8,02,000 parks capital in medium-term papers issued by Indian railway finance corporations or highway authorities, locking in multi-year coupons.',
    suitedFor: [
      'HNIs looking to match custom life goals scheduled 3-4 years down the line.',
      'Conservative allocators seeking to outperform simple savings rates on a multi-year horizon.'
    ],
    shouldAvoid: 'Avoid if you require immediate, penalty-free access to your cash, as early redemptions can trigger exit loads or face cyclical rate drops.',
    alternative: 'Conservative Hybrid funds to capture a slight equity lift if timeframes permit.',
    avgReturn: '7.4% - 8.6% CAGR',
    sharpeRatio: '1.30 - 1.75',
    recommendedTimeline: '3 to 4 Years',
    benchmark: 'Nifty Medium Duration Debt Index',
    taxes: 'Income added to annual earnings, taxed as per marginal status brackets.',
    expenseRatio: 'Direct Plans: 0.35% - 0.65% | Regular: 0.80% - 1.35%',
    exitLoad: 'Often 1.00% if redeemed within 6 to 12 months, dropping to zero thereafter.',
    vettedSchemes: [
      { name: 'SBI Medium Duration Fund Direct Growth', risk: 'Moderate-Low', focus: 'AAA institutional corporate debentures', return: '8.12% CAGR' },
      { name: 'HDFC Medium Term Debt Fund Direct Growth', risk: 'Moderate-Low', focus: 'Government backed securities and leading financial corp bonds', return: '8.05% CAGR' }
    ],
    faqs: [
      { q: 'How does interest rate risk affect Medium Duration funds?', a: 'Because these funds hold bonds with maturities of 3-4 years, if the central bank raises interest rates, the price of existing bonds decreases, which can temporarily drag down the NAV of the fund.' },
      { q: 'Is there credit default risk here?', a: 'Medium duration structures holding highly capitalised private papers or sovereign assets have negligible default risks, monitored actively under AMFI compliance.' }
    ]
  },
  'dynamic-bond': {
    id: 'dynamic-bond',
    name: 'Dynamic Bond Funds',
    category: 'debt',
    shortDesc: 'All-weather debt optimization where managers trade duration depending on RBI policies.',
    howItWorks: 'Dynamic Bond Funds possess no restriction regarding maturity profiles. The fund manager acts tactically: if they expect interest rates to fall, they buy long-term 10-year gilt bonds to capture massive capital gains. If they expect rates to rise, they quickly move the entire portfolio into short-term 91-day bills to avoid capital losses.',
    example: 'An investment of ₹15,00,000 gets dynamically rebalanced: during rate cuts, this resides in 10-year central development GILTs; during rate hikes, the capital is immediately parked in safe cash pools.',
    suitedFor: [
      'Investors looking for debt allocation but unsure how to forecast central bank interest rate moves.',
      'Long-term conservative portfolios needing active capital-protection management.'
    ],
    shouldAvoid: 'Avoid if you have highly short-term timelines under 1-2 years, as tactical incorrect bets by managers can cause minor temporary drawdown cycles.',
    alternative: 'Gilt funds if you have a high-conviction view that economic inflation is crashing.',
    avgReturn: '7.5% - 8.9% CAGR',
    sharpeRatio: '1.40 - 1.95',
    recommendedTimeline: '3 to 5 Years',
    benchmark: 'Nifty Composite Debt Index',
    taxes: 'Taxed at marginal salary slab rates upon redemption.',
    expenseRatio: 'Direct Plans: 0.40% - 0.70% | Regular: 0.95% - 1.50%',
    exitLoad: 'Typically 0.50% if redemptions occur within the first 30 to 90 days.',
    vettedSchemes: [
      { name: 'ICICI Prudential All Seasons Bond Fund Direct Growth', risk: 'Moderate', focus: 'Flexible multi-duration AAA corporate debt and sovereign papers', return: '8.40% CAGR' },
      { name: 'Kotak Dynamic Bond Fund Direct Growth', risk: 'Moderate', focus: 'Active maturity credit rebalanced on monetary policy outlooks', return: '8.25% CAGR' }
    ],
    faqs: [
      { q: 'What makes Dynamic Bond funds special?', a: 'They eliminate the need for the investor to manage interest rate cycles. The fund manager does the switching between short-term and long-term securities on your behalf.' },
      { q: 'Can these funds have negative quarters?', a: 'Yes. If a fund manager anticipates a rate cut but the central bank holds or hikes rates instead, the long-term bonds held can experience a temporary price drop, impacting short-term capital performance.' }
    ]
  },
  gilt: {
    id: 'gilt',
    name: 'Gilt Funds',
    category: 'debt',
    shortDesc: 'Sovereign backing with 100% credit protection, investing in Central & State Government Securities.',
    howItWorks: 'Gilt Funds invest exclusively in government securities (G-Secs) issued by the Reserve Bank of India on behalf of the sovereign. These funds carry zero credit or default risk because the government can print currency to meet its obligations. However, they carry extreme interest rate sensitivity because maturities are typically long-term (5-10+ years).',
    example: 'A ₹25,00,000 allocation provides capital directly to major central infra projects: 100% of the portfolio is placed in 10-Year Government of India GILTs, generating fixed sovereign-backed coupon returns.',
    suitedFor: [
      'Investors seeking 100% risk-free credit assets (i.e. zero default risk).',
      ' HNIs looking to play economic recovery trends during periods of declining interest rates.'
    ],
    shouldAvoid: 'Avoid if you cannot tolerate short-term volatility or if interest rates are expected to experience an upward cycle.',
    alternative: 'Corporate Bond funds if you want stable yields and lower price sensitivity.',
    avgReturn: '7.8% - 9.2% CAGR',
    sharpeRatio: '1.20 - 1.65',
    recommendedTimeline: '3 to 5+ Years',
    benchmark: 'Nifty Gsec Index',
    taxes: 'Marginal income tax slab rate application.',
    expenseRatio: 'Direct Plans: 0.20% - 0.50% | Regular: 0.55% - 1.10%',
    exitLoad: 'None.',
    vettedSchemes: [
      { name: 'SBI Gilt Fund Direct Growth', risk: 'Moderate', focus: '100% Sovereign rated Government of India securities', return: '8.10% CAGR' },
      { name: 'ICICI Prudential Gilt Fund Direct Growth', risk: 'Moderate', focus: 'Reserve Bank of India issued treasury bonds and state developmental loans', return: '8.05% CAGR' }
    ],
    faqs: [
      { q: 'Is a Gilt Fund safer than a Bank Fixed Deposit?', a: 'In terms of credit default risk, Gilt Funds are safer as they are backed by the central government. However, their NAV changes daily with market interest rates, so they can exhibit higher price fluctuations than fixed bank deposits.' },
      { q: 'What is G-Sec?', a: 'G-Sec stands for Government Securities. They are debt papers issued by the central or state governments to fund national or municipal infrastructure growth.' }
    ]
  },
  'credit-risk': {
    id: 'credit-risk',
    name: 'Credit Risk Funds',
    category: 'debt',
    shortDesc: 'Tactical high-yield investing, capitalising on lower-rated corporate papers.',
    howItWorks: 'Credit Risk Funds must invest at least 65% of their total assets in corporate bonds rated below AA (e.g. A, BBB). Because the borrowers carry a slightly higher probability of payment delays, they pay a significant yield premium. Performance relies on ratings upgrades (where upgraded corporate ratings trigger immediate capital value spikes).',
    example: 'An investment of ₹5,00,000 is lent out across emerging corporate expansion programs (e.g., highly vetted real-estate or infrastructure concerns rated AA-), yielding coupon spreads up to 3% above standard bank bonds.',
    suitedFor: [
      'Sophisticated allocators accustomed to credit default swaps and risk distributions.',
      'Investors seeking to lock in double-digit yields inside standard corporate debt systems.'
    ],
    shouldAvoid: 'Avoid matching with any capital that cannot afford credit default hits or during severe economic slowdowns.',
    alternative: 'Corporate Bond funds containing AAA rated securities for standard, risk-free allocations.',
    avgReturn: '8.2% - 9.8% CAGR',
    sharpeRatio: '1.10 - 1.50',
    recommendedTimeline: '3 Years+',
    benchmark: 'Nifty Credit Risk Bond Index',
    taxes: 'Consolidated with marginal slab income brackets.',
    expenseRatio: 'Direct Plans: 0.50% - 0.85% | Regular: 1.10% - 1.80%',
    exitLoad: 'Usually high: 1.00% to 2.00% if redeemed within the first year, falling to 0% after 24 months.',
    vettedSchemes: [
      { name: 'HDFC Credit Risk Debt Fund Direct Growth', risk: 'High', focus: 'Vetted lower-rated corporate bonds with robust cash operational covers', return: '8.75% CAGR' },
      { name: 'ICICI Prudential Credit Risk Fund Direct Growth', risk: 'High', focus: 'Yield-yielding corporate commercial debt instruments', return: '8.68% CAGR' }
    ],
    faqs: [
      { q: 'What is the danger of Credit Risk funds?', a: 'The principal danger is default risk (where the borrowing company fails to pay back interest or principal) or downgrade risk (where a ratings agency slashes the rating of a held bond, triggering a sudden drop in NAV).' },
      { q: 'How does Pure Wealth audit these schemes?', a: 'We perform deep multi-variable quantitative audits, reviewing interest coverage ratios and leverage ratios of underlying holdings to ensure maximum safety filters are maintained.' }
    ]
  },

  // ================= HYBRID SUB-TYPES =================
  arbitrage: {
    id: 'arbitrage',
    name: 'Arbitrage Funds',
    category: 'hybrid',
    shortDesc: 'Risk-free price differences between cash and derivative markets mapped with high equity tax benefits.',
    howItWorks: 'Arbitrage Funds harvest simultaneous price differences of corporate shares between the cash spot market and the futures derivative market. For instance, if Reliance shares trade at ₹2,500 in the spot market and ₹2,510 in the futures market, the fund buys in cash and sells in futures, locking in a secure, risk-free ₹10 profit (which converges to 0 at contract expiry). Because it holds equity assets for matching positions, the structure receives equity tax treatment.',
    example: 'If you allocate ₹15,00,000, the manager continuously executes zero-directional trades on equities like TCS or HDFC, locking in fixed interest-like spreads without any stock market directional risk.',
    suitedFor: [
      'HNIs sitting under the highest tax brackets (30% to 39%) looking for safe short-term parking.',
      'Savers who want stable low-risk capital returns but with much lower tax liabilities than debt funds.'
    ],
    shouldAvoid: 'Avoid if you expect massive equity outperformance, as arbitrage returns reflect bank credit rates and do not capture stock appreciation runs.',
    alternative: 'Liquid debt funds if you are in a low or zero-income tax bracket.',
    avgReturn: '6.8% - 7.6% CAGR',
    sharpeRatio: '1.90 - 2.50',
    recommendedTimeline: '3 to 12 Months',
    benchmark: 'Nifty 50 Arbitrage Index',
    taxes: 'Taxed as Equity! STCG (under 1Y) is flat 20%. LTCG (over 1Y) is flat 10% on gains exceeding ₹1.25 Lakhs per year (significant tax savings over debt slab taxation).',
    expenseRatio: 'Direct Plans: 0.15% - 0.30% | Regular: 0.60% - 0.95%',
    exitLoad: 'Usually 0.25% if redeemed within 15 to 30 days; 0% thereafter.',
    vettedSchemes: [
      { name: 'Kotak Equity Arbitrage Fund Direct Growth', risk: 'Low', focus: 'Fully hedged spot-future index arbitrage combinations', return: '7.25% CAGR' },
      { name: 'Invesco India Arbitrage Fund Direct Growth', risk: 'Low', focus: 'Risk-free price disparity capture across corporate indices', return: '7.18% CAGR' }
    ],
    faqs: [
      { q: 'Is there direct market exposure risk in Arbitrage funds?', a: 'No. Every single stock purchase is completely offset by a futures sell position of identical quantity. This makes the portfolio 100% hedged from market crashes.' },
      { q: 'Why are Arbitrage funds taxed as equities?', a: 'Under Indian tax laws, any mutual fund maintaining an average equity allocation above 65% gets classified under equity taxation schemes. Since arbitrage uses stocks to execute hedges, it easily qualifies.' }
    ]
  },
  conservative: {
    id: 'conservative',
    name: 'Conservative Hybrid',
    category: 'hybrid',
    shortDesc: 'Fixed income core security with a controlled 10-25% active equity kicker for retail shield.',
    howItWorks: 'Conservative Hybrid Funds pool and invest 75% to 90% of your money in highly secure, interest-bearing debt instruments. The remaining 10% to 25% gets dynamically deployed into blue-chip stocks. This allows the investor’s base capital to appreciate with fixed debt-coupon safety, while the minor stock block protects them against economic inflation.',
    example: 'An investment of ₹10,00,000 allocates ₹8,00,000 directly into AAA corporate debentures and G-Secs, and ₹2,00,000 into multi-cap market heavyweights (HDFC Bank, Larsen & Toubro, TCS) for equity capital kickers.',
    suitedFor: [
      'Retirees looking to generate monthly payouts through Systematic Withdrawal Plans (SWP).',
      'Investors wanting to protect their principal capital from inflation without taking direct equity dives.'
    ],
    shouldAvoid: 'Avoid if you have active long-term multi-decade wealth compounding targets, as debt drag will slow overall portfolio expansion.',
    alternative: 'Balanced Advantage funds if your investment horizon extends past 3 years.',
    avgReturn: '8.8% - 11.2% CAGR',
    sharpeRatio: '1.25 - 1.62',
    recommendedTimeline: '2 to 3 Years',
    benchmark: 'Nifty 50 Hybrid Composite Debt 15:85 Index',
    taxes: 'Calculated and added to your individual tax slab rates.',
    expenseRatio: 'Direct Plans: 0.30% - 0.55% | Regular: 0.90% - 1.45%',
    exitLoad: '1.00% if redeemed within 12 months; 0% thereafter.',
    vettedSchemes: [
      { name: 'SBI Conservative Hybrid Fund Direct Growth', risk: 'Moderate', focus: 'Safe government debt coupled with defensive largecap stocks segment', return: '10.15% CAGR' },
      { name: 'ICICI Prudential Regular Savings Fund Direct Growth', risk: 'Moderate', focus: 'Fixed coupon accrual structures with corporate blue-chip capital overlays', return: '10.85% CAGR' }
    ],
    faqs: [
      { q: 'Can I do an SWP from a Conservative Hybrid fund?', a: 'Yes. They are the premier vehicle for retirees setting up automated Systematic Withdrawal Plans, providing highly consistent monthly cashflows with minor market capital erosion.' },
      { q: 'Are these funds safe from market stock crashes?', a: 'Because the equity exposure is capped under 25%, a severe 40% market crash will only result in a minor 8-10% temporary drawdown on the total portfolio.' }
    ]
  },
  aggressive: {
    id: 'aggressive',
    name: 'Aggressive Hybrid',
    category: 'hybrid',
    shortDesc: 'Compounding power pack with 65-80% active equity backed by a 20-35% debt crash buffer.',
    howItWorks: 'Aggressive Hybrid Funds deploy 65% to 80% of assets into growth-oriented corporate shares. The residual 20% to 35% gets systematically locked inside fixed-income bonds. This ensures that when stock markets enter structural correction cycles, the debt block acts as an immediate dry-powder shield, giving the portfolio significantly lower standard deviations than pure equity schemes.',
    example: 'A ₹20,00,000 allocation routes ₹14,00,000 into multi-cap equity leaders such as Tata Motors and Reliance, and ₹6,00,000 into secure sovereign gilt securities yielding fixed coupons.',
    suitedFor: [
      'Investors wanting large-scale equity wealth compounding but panic during sharp market drops.',
      'Portfolios targeted toward children’s higher education or retirement pots maturing in 5 years.'
    ],
    shouldAvoid: 'Avoid if you can emotionally withstand 35% market dips for long-term multi-bagger active returns, in which case pure equity is superior.',
    alternative: 'Large cap or Multi Cap Equity funds if you have an absolute 7 to 10+ year timeframe.',
    avgReturn: '12.5% - 15.6% CAGR',
    sharpeRatio: '1.30 - 1.80',
    recommendedTimeline: '3 to 5 Years',
    benchmark: 'Nifty 50 Hybrid Composite Debt 65:35 Index',
    taxes: 'Qualifies as Equity! Flat 20% STCG on redemptions below 1Y. Flat 10% LTCG on redemptions past 12 months exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.45% - 0.75% | Regular: 1.20% - 1.95%',
    exitLoad: '1.00% if redeemed before 12 months; zero thereafter.',
    vettedSchemes: [
      { name: 'ICICI Prudential Equity & Debt Fund Direct Growth', risk: 'Moderate-High', focus: 'Active consumer sector stocks backed by AAA commercial bonds', return: '15.30% CAGR' },
      { name: 'HDFC Hybrid Equity Fund Direct Growth', risk: 'Moderate-High', focus: 'High conviction blue-chip shares accompanied by government debt blocks', return: '14.85% CAGR' }
    ],
    faqs: [
      { q: 'Why do aggressive hybrids outperform most largecap stocks over time?', a: 'During market peaks, the fund manager actively books profits from equities and puts it in debt. During market crashes, they sell debt to buy cheap stocks. This automatic rebalancing boosts overall terminal value.' },
      { q: 'How are they taxed in India?', a: 'Since they maintain an average equity holding of above 65%, they are taxed under favorable equity rules, safeguarding your returns from high debt tax slabs.' }
    ]
  },

  // ================= EQUITY SUB-TYPES =================
  'large-cap': {
    id: 'large-cap',
    name: 'Large Cap Funds',
    category: 'equity',
    shortDesc: 'Blue-chip market leaders (Top 100 Indian giants) seeking stable core terminal growth.',
    howItWorks: 'Large Cap schemes must invest a minimum of 80% of their total asset pool in the top 100 companies listed on the exchanges by market capitalisation (e.g., Reliance, TCS, HDFC Bank, Infosys). These businesses hold massive cash cash reserves, pristine balance sheets, and industry monopolies, ensuring solid growth with lower volatility.',
    example: 'If you invest ₹5,00,000, your money is distributed strictly among national monopolies: e.g., ₹45,000 in ICICI Bank, ₹38,000 in Larsen & Toubro, and ₹35,000 in Reliance Industries.',
    suitedFor: [
      'Moderate-risk equity investors looking for a highly stable core foundation for their portfolio.',
      'Sip accounts for wealth building over 5+ year phases.'
    ],
    shouldAvoid: 'Avoid if you have high alpha requirements (e.g. aiming to beat average markets by 10%+), as market giants grow at steady, mature paces.',
    alternative: 'Flexi-cap or Large & Midcap funds for investors wanting higher beta allocations.',
    avgReturn: '12.2% - 15.2% CAGR',
    sharpeRatio: '1.20 - 1.55',
    recommendedTimeline: '5 to 7+ Years',
    benchmark: 'Nifty 100 TRI',
    taxes: 'STCG (under 1Y) flat 20%; LTCG (over 1Y) flat 10% on annual gains exceeding ₹1.25 Lakhs.',
    expenseRatio: 'Direct Plans: 0.35% - 0.60% | Regular: 1.00% - 1.65%',
    exitLoad: '1.00% if redeemed before 365 days; 0% thereafter.',
    vettedSchemes: [
      { name: 'Taurus Largecap Equity Fund Direct Growth', risk: 'High', focus: 'Underpriced legacy giants and monopoly market leaders', return: '15.10% CAGR' },
      { name: 'ICICI Prudential Bluechip Fund Direct Growth', risk: 'High', focus: 'Top 50 high capital efficiency corporate leaders', return: '14.80% CAGR' }
    ],
    faqs: [
      { q: 'Is there a risk of large cap companies going bust?', a: 'The top 100 Indian corporations are deeply systemic institutions backed by diverse balance sheets. The likelihood of a sudden credit systemic collapse across this sector is negligible.' },
      { q: 'Are these funds active or passive?', a: 'While passive index funds track Nifty 100, active Large Cap schemes use skilled analysts to weed out weak businesses and overweight high cash-flow giants.' }
    ]
  },
  'mid-cap': {
    id: 'mid-cap',
    name: 'Mid Cap Funds',
    category: 'equity',
    shortDesc: 'Emerging mid-sized corporations (Ranked 101 to 250) riding high margin growth curves.',
    howItWorks: 'Mid Cap mutual funds deploy at least 65% of their total capital into companies ranked between 101 to 250 by market capitalization. These are fast-growing, mid-sized enterprises (e.g., Federal Bank, Bharat Forge, Voltas) that are actively scaling operations to become the next blue-chip giants.',
    example: 'An investment of ₹10,00,000 distributes capital across expanding mid-tier leaders: e.g. ₹50,000 in Polycab India (surging cables manufacturing) and ₹48,000 in Phoenix Mills (premium retail malls developer).',
    suitedFor: [
      'Aggressive wealth compounding portfolios with an absolute 7+ year holding capacity.',
      'Sip allocators looking to capture expanding mid-tier balance sheet upgrades.'
    ],
    shouldAvoid: 'Avoid if you have short-term liquidity goals or display low tolerance for intermediate 20-25% stock corrections.',
    alternative: 'Large & Midcap blended funds for a more conservative risk footprint.',
    avgReturn: '15.8% - 21.5% CAGR',
    sharpeRatio: '1.35 - 1.70',
    recommendedTimeline: '7+ Years',
    benchmark: 'Nifty Midcap 150 TRI',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.40% - 0.75% | Regular: 1.25% - 2.10%',
    exitLoad: '1.00% if units are redeemed within the first year.',
    vettedSchemes: [
      { name: 'Motilal Oswal Midcap Fund Direct Growth', risk: 'Very High', focus: 'Niche market-dominating mid-tier industrial conglomerates', return: '21.40% CAGR' },
      { name: 'HDFC Mid-Cap Opportunities Fund Direct Growth', risk: 'Very High', focus: 'Highly liquid under-researched midcap growth models', return: '19.85% CAGR' }
    ],
    faqs: [
      { q: 'How volatile are Mid Cap funds?', a: 'Midcap companies are more susceptible to economic downturns than largecaps. During bull markets, they significantly outperform; however, during bear cycles, they can drop up to 25-30%.' },
      { q: 'What is the benchmark index for Midcaps?', a: 'The Nifty Midcap 150 Total Returns Index (TRI) tracks the performance of the mid-capitalised segment of the Indian stock exchange.' }
    ]
  },
  'small-cap': {
    id: 'small-cap',
    name: 'Small Cap Funds',
    category: 'equity',
    shortDesc: 'Hyper-growth micro-enterprises and local market disruptors (Ranked 251 onwards).',
    howItWorks: 'Small Cap funds invest a minimum of 65% of their funds in stocks ranked 251 and beyond in terms of market capitalization. These are small, agile companies with high-growth trajectories, operating in upcoming, niche sectors, seeking to scale rapidly and achieve multi-bagger scale.',
    example: 'An allocation of ₹5,00,000 puts capital into early-stage market leaders: e.g., ₹25,000 in Zen Technologies (defense drone simulations) or ₹22,000 in Neuland Labs (active pharmaceutical ingredients).',
    suitedFor: [
      'Hyper-aggressive long-term investors looking for maximum compound multiplication.',
      'Young savers run active monthly SIP schemes with 10+ year timelines.'
    ],
    shouldAvoid: 'Avoid if you require capital within 5 years or experience extreme physical distress during violent 30-40% market drawdown cycles.',
    alternative: 'Flexi-cap or Mid-cap schemes for a significantly milder volatility profile.',
    avgReturn: '18.5% - 26.8% CAGR',
    sharpeRatio: '1.40 - 1.85',
    recommendedTimeline: '7 to 10+ Years',
    benchmark: 'Nifty Smallcap 250 TRI',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.45% - 0.85% | Regular: 1.40% - 2.45%',
    exitLoad: '1.00% if redeemed within 1Y.',
    vettedSchemes: [
      { name: 'Nippon India Small Cap Fund Direct Growth', risk: 'Very High', focus: 'Highly diversified basket of micro-cap manufacturing pioneers', return: '24.80% CAGR' },
      { name: 'Quant Small Cap Fund Direct Growth', risk: 'Very High', focus: 'High conviction dynamic momentum macro plays across microcaps', return: '26.20% CAGR' }
    ],
    faqs: [
      { q: 'Can a small-cap fund lose substantial value?', a: 'Yes. During severe market bear runs, small-cap stocks suffer from liquidity dry-ups, meaning their prices can experience drops of 35% or more before recovering.' },
      { q: 'Why do they yield higher returns?', a: 'Small companies have massive leverage capacity. It is far easier for a small ₹1,000 Crore business to scale up 10x to ₹10,000 Crores than for a ₹10 Lakh Crore legacy giant to multiply by 10x.' }
    ]
  },
  'multi-cap': {
    id: 'multi-cap',
    name: 'Multi Cap Funds',
    category: 'equity',
    shortDesc: 'Disciplined multi-cap exposure across large, mid, and smallcap blocks simultaneously.',
    howItWorks: 'Multi Cap schemes operate under strict regulatory criteria. They must distribute exactly 25% of their total portfolio into Large Caps, exactly 25% into Mid Caps, and exactly 25% into Small Caps at all times. This provides a structurally diverse, all-around equity allocation, balancing stability with high growth potential.',
    example: 'An investment of ₹12,00,000 allocates ₹3,00,000 into secure large-cap leaders (TCS, Reliance), ₹3,00,000 into fast-scaling midcaps (Federal Bank), and ₹3,00,000 into fast-growing active smallcaps.',
    suitedFor: [
      'Equity allocators looking for a simple, single-fund entry point across all market segments.',
      'Investors wanting the hyper-upside of smallcaps but backed by largecap safety blocks.'
    ],
    shouldAvoid: 'Avoid if you prefer a customized allocation weightage (e.g. holding 70% largecaps for a highly conservative outlook).',
    alternative: 'Flexi-cap funds where the manager holds absolute freedom to move weightages dynamically.',
    avgReturn: '14.5% - 19.2% CAGR',
    sharpeRatio: '1.28 - 1.65',
    recommendedTimeline: '5 to 7+ Years',
    benchmark: 'Nifty 500 Multicap 50:25:25 TRI',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.40% - 0.70% | Regular: 1.15% - 1.95%',
    exitLoad: '1.0% if redeemed before 365 days.',
    vettedSchemes: [
      { name: 'Quant Active Fund Direct Growth', risk: 'Very High', focus: 'High velocity active stock picking across capitalization segments', return: '22.45% CAGR' },
      { name: 'Nippon India Multi Cap Fund Direct Growth', risk: 'Very High', focus: 'Balanced multi-cap layout focused on industrial leaders', return: '18.15% CAGR' }
    ],
    faqs: [
      { q: 'What is the main difference between Multi Cap and Flexi Cap funds?', a: 'Multi Cap funds are forced by SEBI to hold at least 25% in each of the three market cap segments. Flexi Cap funds have no restrictions and can hold 95% in large caps if the manager chooses.' },
      { q: 'Is a Multi Cap fund riskier than Large Cap?', a: 'Yes. Because a Multi Cap fund is mandated to hold at least 50% of its corpus in mid and small-cap stocks, its volatility profile is significantly higher than pure blue-chip schemes.' }
    ]
  },
  elss: {
    id: 'elss',
    name: 'ELSS (Tax Saving)',
    category: 'equity',
    shortDesc: 'Dual advantage: High equity compounding with ₹1.5 Lakhs tax deduction under Section 80C.',
    howItWorks: 'Equity Linked Savings Schemes (ELSS) are diversified equity funds with a compulsory lock-in period of 3 years. They represent the primary vehicle for taxpayers under the old tax regime to claim deductions up to ₹1,50,000 under Section 80C of the Income Tax Act.',
    example: 'Investing ₹1,50,000 before March 31st instantly slashes your annual income tax liability while putting your capital into standard high-growth equity sectors.',
    suitedFor: [
      'Salaried individuals wanting to optimize tax structures under old Indian tax guidelines.',
      'Investors wanting a disciplined, locked-in period to allow equity investments to compound uninterrupted.'
    ],
    shouldAvoid: 'Avoid if you require flexible liquidity or if you have opted for the New Tax regieme (which has no Sec 80C benefits).',
    alternative: 'Flexi-cap or Large cap schemes if liquidity is an absolute priority.',
    avgReturn: '13.5% - 17.8% CAGR',
    sharpeRatio: '1.24 - 1.60',
    recommendedTimeline: '3 to 5+ Years',
    benchmark: 'Nifty 500 TRI',
    taxes: 'Lock-in of 3 Years. Post lock-in, gains are taxed as standard LTCG: 10% flat on amounts exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.30% - 0.65% | Regular: 1.10% - 1.85%',
    exitLoad: 'Mandatory zero exit liability (as units cannot be sold inside the 3-year lock-in).',
    vettedSchemes: [
      { name: 'Mirae Asset ELSS Tax Saver Fund Direct Growth', risk: 'High', focus: 'Diversified high return large and mid-tier structural capital', return: '16.42% CAGR' },
      { name: 'Parag Parikh ELSS Tax Saver Fund Direct Growth', risk: 'High', focus: 'Value oriented multi-cap equities matching tax guidelines', return: '17.15% CAGR' }
    ],
    faqs: [
      { q: 'Can I redeem my ELSS before 3 years?', a: 'No. Under SEBI regulations, all ELSS schemes have a mandatory 3-year lock-in period during which units cannot be sold, pledged, or modified.' },
      { q: 'How does ELSS compare to PPF?', a: 'PPF offers guaranteed fixed returns (around 7.15%) with a 15-year lock-in. ELSS exposes you to market risks but has a much shorter lock-in of 3 years and historically yields much higher terminal values.' }
    ]
  },
  'dividend-yield': {
    id: 'dividend-yield',
    name: 'Dividend Yield Funds',
    category: 'equity',
    shortDesc: 'Defensive cash-flow giants with strong dividend histories and robust balance sheets.',
    howItWorks: 'Dividend Yield schemes invest a minimum of 65% of their total portfolio in shares of companies that pay high, consistent dividends (e.g. Coal India, NTPC, TCS). These businesses possess highly stable operations, robust free cash flows, and mature business models, offering excellent defensive cushions during down markets.',
    example: 'An investment of ₹10,00,000 allocates capital into utilities, engineering exporters, and mature consumer leaders that distribute regular cash dividends back to the fund NAV.',
    suitedFor: [
      'Conservative equity allocators looking for lower portfolio drawdowns.',
      'Retirees look for stable, value-preserving corporate holdings.'
    ],
    shouldAvoid: 'Avoid if you seek aggressive, hyper-growth multi-bagger smallcap expansion gains, as mature dividend paying firms rarely triple overnight.',
    alternative: 'Large cap or Hybrid aggressive schemes to capture higher growth rates.',
    avgReturn: '11.8% - 14.5% CAGR',
    sharpeRatio: '1.15 - 1.48',
    recommendedTimeline: '5 Years+',
    benchmark: 'Nifty Dividend Opportunities 50 TRI',
    taxes: 'Equity standard rates: STCG 20%, LTCG 10% above ₹1.25 Lakhs.',
    expenseRatio: 'Direct Plans: 0.35% - 0.65% | Regular: 1.10% - 1.80%',
    exitLoad: '1.0% if redeemed. before 12 months.',
    vettedSchemes: [
      { name: 'Templeton India Equity Income Fund Direct Growth', risk: 'High', focus: 'Underpriced dividend-rich monopolies and public undertaking enterprises', return: '16.10% CAGR' },
      { name: 'ICICI Prudential Dividend Yield Equity Fund Direct Growth', risk: 'High', focus: 'High cash-flow private and public sectoral dividend giants', return: '15.35% CAGR' }
    ],
    faqs: [
      { q: 'Do I receive the dividends directly in my bank account?', a: 'If you opt for the Growth option, dividends are reinvested to grow your NAV. If you choose the Income Distribution cum Capital Withdrawal (IDCW) option, payouts are sent to your bank, but are taxed at slab rates.' },
      { q: 'Why are dividend yield funds considered defensive?', a: 'Companies that pay high dividends have mature cash flows. During recessions, these cash payouts act as a baseline cushion, meaning their stocks fall significantly less than growth stocks.' }
    ]
  },
  sector: {
    id: 'sector',
    name: 'Sector / Thematic Group',
    category: 'equity',
    shortDesc: 'High-conviction, concentrated focus riding specific sectoral macros (e.g., Tech, Banking, Infra).',
    howItWorks: 'Sector or Thematic Funds invest at least 80% of their client capital into a single specific industry or theme (such as IT, Banking, Infrastructure, Defense, or Pharma). While they offer massive outperformance if that sector experiences a structural bull run, they carry extremely high concentration risk if that sector enters structural slump periods.',
    example: 'A ₹15,00,000 thematic allocation focused on Infrastructure places capital heavily in engineering, cement, and construction giants: e.g., Larsen & Toubro, UltraTech Cement, and GMR Airports.',
    suitedFor: [
      'Sophisticated thematic investors with deep insights into specific macroeconomic industry cycles.',
      'HNIs wanting to overweight specific growth sectors (e.g. India Infrastructure and Digitization).'
    ],
    shouldAvoid: 'Avoid if this is your first entry into the mutual fund markets, or if you can not handle long-term localized industry stagnation cycles.',
    alternative: 'Flexi-cap or active Multi-cap funds for broad thematic diversification.',
    avgReturn: '14.8% - 24.2% CAGR',
    sharpeRatio: '1.18 - 1.75',
    recommendedTimeline: '5 to 7+ Years',
    benchmark: 'Corresponding thematic index (e.g. Nifty Infrastructure TRI)',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.45% - 0.85% | Regular: 1.35% - 2.25%',
    exitLoad: '1.0% if redeemed within 1Y.',
    vettedSchemes: [
      { name: 'Tata Infrastructure Fund Direct Plan Growth', risk: 'Very High', focus: 'Heavy engineering, logistics, and capital equipment manufacturers', return: '24.15% CAGR' },
      { name: 'ICICI Prudential Technology Fund Direct Growth', risk: 'Very High', focus: 'Domestic software giants and offshore SaaS exporters', return: '18.42% CAGR' }
    ],
    faqs: [
      { q: 'Are defensive sectors like Pharma safe during market crashes?', a: 'Pharma and FMCG are considered defensive because people need medicines and groceries regardless of the economy. They usually decline less during recessions, but still carry sector-specific risks.' },
      { q: 'Can I build a core portfolio with Sector funds?', a: 'No. Sector funds are satellite allocations. They should ideally not occupy more than 10-15% of your total equity portfolio due to the concentration risk.' }
    ]
  },
  contra: {
    id: 'contra',
    name: 'Contra Funds',
    category: 'equity',
    shortDesc: 'Sifting out value from currently out-of-favor, beaten-down corporate gems.',
    howItWorks: 'Contra Funds follow a contrarian investing philosophy. They actively seek companies and sectors that are currently out of favor, underperforming, or facing temporary headwinds (such as regulatory shifts or product recall challenges). The manager buys cheap, waiting for structural turnarounds to unlock massive intrinsic value.',
    example: 'Investing ₹5,00,000 accumulates capital into beaten-down sectors: e.g. buying IT monoliths during brief global spending slowdowns, or pharma groups during temporary regulatory audit clearances.',
    suitedFor: [
      'Patient value-investing believers with an investment timeframe of at least 5 to 7 years.',
      'Investors wanting to hedge against overpriced, high-flying momentum stocks.'
    ],
    shouldAvoid: 'Avoid if you seek quick, rapid monthly returns, as contrarian bets take several years of consolidation before unlocking value.',
    alternative: 'Large cap or Mid-cap schemes tracking standard indices.',
    avgReturn: '14.2% - 19.5% CAGR',
    sharpeRatio: '1.34 - 1.68',
    recommendedTimeline: '5 to 7+ Years',
    benchmark: 'Nifty 500 TRI',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.40% - 0.70% | Regular: 1.20% - 1.95%',
    exitLoad: '1.0% if units are redeemed within the first year.',
    vettedSchemes: [
      { name: 'SBI Contra Fund Direct Growth', risk: 'High', focus: 'Turnaround corporate plays and deeply undervalued cyclical industries', return: '21.10% CAGR' },
      { name: 'Invesco India Contra Fund Direct Growth', risk: 'High', focus: 'Underpriced asset monopolies trading at historic lows', return: '18.52% CAGR' }
    ],
    faqs: [
      { q: 'How does a Contra fund differ from a Value fund?', a: 'Contra funds focus specifically on taking contrarian views against current popular trends (buying out-of-favor stocks). Value funds focus broadly on underpriced stocks relative to book margins and cash ratios.' },
      { q: 'Is there a risk of value traps?', a: 'Yes. Some cheap stocks remain cheap indefinitely due to structural changes in technology or corporate governance. Certified managers perform rigorous screens to avoid these "value traps."' }
    ]
  },
  'value-oriented': {
    id: 'value-oriented',
    name: 'Value Oriented',
    category: 'equity',
    shortDesc: 'Asymmetrical safety investing, targeting stocks trading below intrinsic bookkeeping value.',
    howItWorks: 'Value Funds focus on standard value investing strategies (margin of safety). They evaluate corporate earnings yields, assets on balance sheets, and dividend distributions to identify companies trading below their intrinsic value. This limits downside risks while preserving significant long-term growth opportunities.',
    example: 'A ₹10,00,000 investment buys stocks with extremely low Price-to-Earnings (P/E) ratios and strong cash balances, protecting capital against expensive stock valuation bubbles.',
    suitedFor: [
      'Long-term capital allocators looking for disciplined, valuation-conscious portfolios.',
      'Investors looking for a safe equity cushion when standard markets are trading at historic highs.'
    ],
    shouldAvoid: 'Avoid if you seek hyper-momentum growth strategies or are looking to ride hot, high-P/E retail stocks.',
    alternative: 'Mid-cap or active Flexi-cap schemes.',
    avgReturn: '13.8% - 18.8% CAGR',
    sharpeRatio: '1.25 - 1.62',
    recommendedTimeline: '5 Years+',
    benchmark: 'Nifty 500 Value 50 TRI',
    taxes: 'STCG flat 20%; LTCG flat 10% on gains exceeding ₹1.25 Lakhs per year.',
    expenseRatio: 'Direct Plans: 0.35% - 0.65% | Regular: 1.10% - 1.85%',
    exitLoad: '1.0% if redeemed before 12 months.',
    vettedSchemes: [
      { name: 'Templeton India Value Fund Direct Growth', risk: 'High', focus: 'Cash-rich undervalued conglomerate structures and utilities', return: '17.80% CAGR' },
      { name: 'ICICI Prudential Value Discovery Fund Direct Growth', risk: 'High', focus: 'High margin of safety companies with robust book values', return: '19.12% CAGR' }
    ],
    faqs: [
      { q: 'What is Margin of Safety?', a: 'Margin of Safety refers to buying an asset at a deep discount to its intrinsic worth. Under value investing, if a company is worth ₹100 inside book assets, buying its stock at ₹60 provides a safety margin of ₹40.' },
      { q: 'Why do value funds underperform in crazy bull markets?', a: 'During euphoric market cycles, investors chase hot, expensive momentum stocks, causing highly-valued companies to surge even higher. Value funds refuse to pay these peak prices, leading to brief underperformance before market corrections restore parity.' }
    ]
  }
};
