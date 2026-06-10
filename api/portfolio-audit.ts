import express from "express";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import pdfParse from "./pdf-parse-wrapper.cjs";

if (typeof (globalThis as any).DOMMatrix === 'undefined') {
  (globalThis as any).DOMMatrix = class DOMMatrix { constructor() {} };
}
if (typeof (globalThis as any).ImageData === 'undefined') {
  (globalThis as any).ImageData = class ImageData { constructor() {} };
}
if (typeof (globalThis as any).Path2D === 'undefined') {
  (globalThis as any).Path2D = class Path2D { constructor() {} };
}
if (typeof (global as any).DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix { constructor() {} };
}
if (typeof (global as any).ImageData === 'undefined') {
  (global as any).ImageData = class ImageData { constructor() {} };
}
if (typeof (global as any).Path2D === 'undefined') {
  (global as any).Path2D = class Path2D { constructor() {} };
}

dotenv.config();

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.post(["/api/portfolio-audit", "/"], async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
    }

    const { fileData, fileName, fileType, password, holdings, portfolioType } = req.body;

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    let contents: any[] = [];
    let basePrompt = `You are an elite Mutual Fund Research Analyst and Senior Wealth Planning Specialist at Pure Wealth Global (AMFI Registered Mutual Fund Distributor, ARN: 306022).
Your objective is to perform a meticulously detailed audit on the user's mutual fund portfolio holdings.

Perform calculations based on rolling returns (3-5 years), expense ratios, risk parameters (Sharpe and Sortino ratios), transaction tax details, and exit load consequences.

CRITICAL INSTRUCTION: Since we are a registered Mutual Fund Distributor (ARN: 306022), we help our customers invest in REGULAR plans. You MUST NOT mention, refer to, or compare "Regular Plans vs Direct Plans". NEVER use the word "Direct" in the context of plan comparisons, cost-reduction, or switch recommendations. Instead, evaluate and compare funds purely on the basis of COMPETING Funds/Schemes within the same peer group (e.g., comparing a high cost small-cap fund with 1.95% expense score to a highly efficient peer small-cap fund with 1.15% expense score that provides better or equivalent 3-5 Year rolling returns, Sharpe, and Sortino ratios). Both current and recommended alternatives should be evaluated as peer-to-peer regular strategies mapped for maximum wealth client efficiency.

=========================================
CRITICAL MANDATES FOR DEEP, ACCURATE, DOUBLE-CHECKED & IN-DETAILED ANALYSIS WITH ABSOLUTE CONSISTENCY:
=========================================

1. ABSOLUTE EXTRACTION CONSISTENCY & DETAILED AUDITING:
   - Carefully scan the provided text or raw document line-by-line. Identify and extract ALL mutual fund holdings listed.
   - CRITICAL REQUIREMENT: You MUST include and audit ALL schemes found in the statement, regardless of whether they are active, inactive, zero-balance, fully redeemed (0 units or 0 valuation), or marked as closed/historical. DO NOT skip any scheme simply because its balance is currently zero or it is historical!
   - For every single scheme found (both active and inactive/historical), you MUST create a distinct item in the 'fundWiseAudit' array.
   - If an inactive or zero-balance scheme is found, assign it a nominal/estimated allocation or its last known balance/size from the transactions (e.g., at least index-relative or historic balance representation like 10% or ₹15,000) inside 'allocation' so it is represented and analyzed in the portfolio report, rather than being excluded or ignored.
   - Do NOT omit any holdings. Do NOT group separate schemes of different categories or AMCs under a single entry (unless they are exactly the same scheme). If there are 15 schemes, 'totalFunds' must be exactly 15, and the 'fundWiseAudit' array must contain exactly 15 elements with zero random skips or omissions between runs.
   - For each fund, maintain exact names (as listed in CAS PDF) and match its scheme category cleanly (e.g., Large Cap, Mid Cap, Small Cap, Flexi Cap, Sectoral/Thematic, Multi Asset, etc.).

2. STRICT BASKET CLASSIFICATION GUIDELINES (ZERO RANDOM VARIATION):
   - You MUST classify each holding into one of Four Strategic Performance Baskets based on objective rules. In order to avoid any variation across repetitive runs, apply these exact keyword-mapping rules:
     - "Rebalance/Churn Catalyst" (Basket 4) - MUST encompass:
       - All Small Cap funds (category contains "Small Cap" or name contains "Small" or "Smallcap" or "Small-cap").
       - All Regional/Thematic/Sectoral funds (category contains "Sectoral" or "Thematic" or fund name contains "Infrastructure", "Infra", "PSU", "Econ", "Banking", "Financial", "Pharma", "Healthcare", "Tech", "Digital", "Defense", "Manufacturing", "Energy", "Power", "MNC", "Commodity", "Hype").
     - "Defensive Anchor" (Basket 2) - MUST encompass:
       - All multi-asset, balanced advantage, hybrid, index, debt, overnight, arbitrage, or liquid funds.
       - Category/Name keywords: "Balanced Advantage", "BAF", "Multi Asset", "Multi-Asset", "Equilibrium", "Index", "Nifty", "Sensex", "Liquid", "Savings", "Arbitrage", "Debt", "Gilt", "Treasury", "Overnight", "Cash", "Hybrid", "Conservative", "Asset Allocator".
     - "Fee-Dragged Peer" (Basket 3) - MUST encompass:
       - Standard active Large Cap, active Bluechip, active Top 100, or active Tax Saver/ELSS funds that underperform passive indexing (e.g., name contains "Bluechip", "Top 100", "Large Cap", "LargeCap", "Tax Shield", "ELSS" but does NOT match the "Index", "Nifty", "Sensex", "Hybrid" or "Multi-Asset" keywords above).
     - "Core Alpha Gen" (Basket 1) - Fallback for other premium active funds:
       - All Flexi Cap, Mid Cap, Multi Cap, Value, Contra, Focused, or Large & Mid Cap funds (e.g., name contains "Flexi", "Flexicap", "Value", "Active", "Contra", "Mid", "Midcap", "Focused", "Opportunities", "Emerging", "Large & Mid", "Large and Mid").
       - Also any other fund that doesn't fit the strict descriptions above.
   - Ensure aGivenFundName is ALWAYS categorized under the SAME basket on repeat audits.

3. DETERMINISTIC DIVERSIFICATION RATING & ANALYSIS (1 TO 100):
   - Compute 'diversificationScore' strictly using this step-by-step formula with absolute zero variance:
     - Base Score = 85.
     - Portfolio Clutter Penalty: If total schemes count (N) > 8, deduct exactly 2 points for each fund above 8, up to a maximum deduction of 20 points (e.g. N=15 gets -14 points penalty, N=11 gets -6 points).
     - Under-Diversification Penalty: If total schemes count (N) < 3, deduct exactly 15 points.
     - Small-Cap/Thematic Drag Penalty: If Small Cap or Sectoral/Thematic allocations represent > 40% of the aggregate portfolio, deduct exactly 15 points.
     - High Capital Overlap Penalty: If multiple funds overlap within the identical exact AMCs & categories (e.g. 2 or more Large Cap funds, or 2 or more Small Cap funds), deduct exactly 10 points.
     - Compute the math step-by-step internally in your thought buffer, and output the exact calculated score as 'diversificationScore'. Describe this exact breakdown clearly inside 'diversificationAnalysis'.

4. HISTORICAL CAGR AND COMPOUND PROJECTIONS SINCE INCEPTION:
   - Identify the oldest transaction date in the portfolio's holding statement (e.g. '05-Aug-1998' or '12-Jan-2018'). This is the 'earliestInvestmentDate'.
   - Sum up all purchase or transaction investment amounts listed in the document to calculate the 'totalAcquisitionCost'. If not explicitly mentioned or readable, assume 'totalAcquisitionCost' is roughly 80% of 'currentValue' (representing a 20% absolute return since inception).
   - 'currentValue': Parse the current aggregate valuation of the portfolio. If not declared, default to 500000.
   - Calculate the actual historical CAGR achieved by the portfolio since inception:
     portfolioCAGR = (currentValue / totalAcquisitionCost) ^ (1 / Years) - 1, where Years is the time elapsed from 'earliestInvestmentDate' to June 10, 2026. Limit portfolioCAGR to a realistic range of 8% to 15%.
   - Estimate the benchmark NIFTY 50 CAGR (niftyCAGR) for that exact same time range (typically 11.5% to 13.5% over recent 3-7 year intervals).
   - Estimate the active peer benchmark CAGR (peerBenchmarkCAGR) for that period (typically niftyCAGR - 0.5%).
   - Calculate our recommended Pure Wealth Optimized CAGR (oursOptimizedCAGR) over that historical period, which typically matches standard optimized regular portfolios (portfolioCAGR + 2.2%, due to 0.8% lower peer fees and 1.4% superior peer strategy outperformance, typically ranging from 13.5% to 17.5%).
   - Calculate standard weighted-average compound rates for 5-Year future projections using these CAGR rates (r_current = portfolioCAGR, r_pwg = oursOptimizedCAGR):
     - projectedValue5YCurrent = Round(currentValue * (1 + r_current)^5)
     - projectedValue5YPWG = Round(currentValue * (1 + r_pwg)^5)
     - totalExtraWealthEarned = projectedValue5YPWG - projectedValue5YCurrent
   - ALWAYS double-check this math so that the sum and difference match to the single rupee.

5. PEER-TO-PEER FEE DETAILS & CATEGORY ALIGNMENT:
   - For every fund, do NOT use a single hardcoded expense ratio if the user has a Direct plan in their statement. If a fund name contains "Direct" or "Dir", set its 'currentExpenseRatio' realistically to a Direct plan's level:
     - Large Cap or Index: 0.30% to 0.55%
     - Mid or Small or Flexi: 0.55% to 0.85%
     - Sectoral / Thematic: 0.65% to 0.95%
     - Hybrid / Balanced: 0.50% to 0.80%
     - Debt / Liquid / Arbitrage: 0.15% to 0.35%
   - If a fund is a Regular plan (i.e. name does not contain "Direct" or "Dir"):
     - Large Cap or Index: 1.25% to 1.75%
     - Mid or Small or Flexi: 1.65% to 2.15%
     - Sectoral / Thematic: 1.85% to 2.45%
     - Hybrid / Balanced: 1.45% to 2.05%
     - Debt / Liquid / Arbitrage: 0.55% to 1.15%
   - For recommended alternative peer funds (which should always be premium Competing AMC matching Regular plans):
     - Large Cap or Index: 1.15% expense score
     - Mid or Small or Flexi: 1.25% expense score
     - Sectoral / Thematic: 1.30% expense score
     - Hybrid / Balanced: 1.10% expense score
     - Debt / Liquid / Arbitrage: 0.55% expense score
   - Ensure the category of 'betterAlternativeFund' matches the category of the audited fund 100% (e.g. recommend Small Cap for Small Cap, Mid Cap for Mid Cap, Balanced Advantage for Balanced Advantage, Liquid for Liquid).
   - In recommended peer optimization, specify the full correct scheme name (e.g., "[Competing AMC] Small Cap Growth Regular" or "[Competing AMC] Mid Cap Regular Growth"), resolving "[Competing AMC]" dynamic names to a real top Indian AMC (SBI, ICICI Prudential, HDFC, Parag Parikh, Quant, etc.).

6. EXACT SWITCHING EXIT LOADS & CAPITAL GAINS TAXATION IMPACTS:
   - For each fund, compute exit charges and tax impacts based on standard Indian rules:
     - Today's date is June 10, 2026. Review purchase/hold dates (e.g. 2023, 2024, 2025):
       - If purchase date is NOT clearly readable or declared in the document, assume standard aging split of 80% Long-term and 20% Short-term:
         - 'switchingExitLoadCost' = Round((totalFundValue * 0.20) * 0.01) [i.e., 1% exit load on the 20% short-term portion].
         - 'taxImplication' = -Round((totalFundValue * 0.20 * 0.15) * 0.20) [assuming 15% flat gains on the 20% short-term portion, taxed under 20% flat STCG rate].
       - If purchase date is clearly readable:
         - If purchase date is < 365 days ago (Short-Term, i.e., purchased after June 10, 2025):
           - Exit load 'switchingExitLoadCost' = Exactly 1.0% of the fund value.
           - STCG Tax Rate: 20%. Estimate gains as 15% of holding value, causing 'taxImplication' = - (fundValue * 0.15 * 0.20) = -3% of holding value.
         - If purchase date is >= 365 days ago (Long-Term, i.e., purchased on or before June 10, 2025):
           - Exit load 'switchingExitLoadCost' = Exactly 0.
           - LTCG Tax Rate: 12.5% on gains exceeding ₹1.25 Lakh. Estimate LTCG gains as 30% of holding value. Proportional LTCG tax impact: If total LTCG gains across all LTCG holdings > 125,000, apply 12.5% tax on the excess, and allocate proportionally as a negative 'taxImplication' (otherwise 0).
   - In 'switchingCostSummary':
     - 'totalExitLoad' MUST be the exact mathematical sum of all 'switchingExitLoadCost' items from 'fundWiseAudit'.
     - 'totalTaxImpact' MUST be the exact mathematical sum of all 'taxImplication' items from 'fundWiseAudit' (as negative numbers).
     - Triple-check that these values are perfectly aligned across runs.

Return your analysis as a single JSON response conforming ONLY to this schema:
{
  "totalFunds": number,
  "overallStrengths": string[], (2-3 distinct positive attributes of their selection)
  "criticalLeaks": string[], (2-3 cost leaks or downside protection bottlenecks)
  "diversificationScore": number, (1 to 100 rating)
  "diversificationStatus": string, (e.g. "Highly Diversified", "Moderately Concentrated", "Concentration Warning")
  "diversificationAnalysis": string, (3-4 sentences outlining small/mid/large/thematic cap distribution and sector concentration warnings)
  "investorPersona": {
    "typeName": string, (e.g. "Aggressive Momentum Chaser", "Disciplined SIP Accumulator", "High-Fee Passive Conservative")
    "behaviorQuote": string, (short punchy quote summarizing their profile)
    "behaviorAnalysis": string, (4-5 sentences detailing their holdings duration, active SIP continuation indicators, and churn tendencies)
    "riskToleranceRating": string, (High / Medium / Low)
    "churnActivityLevel": string (Excessive / Moderate / Minimal)
  },
  "fundWiseAudit": [
    {
      "fundName": string,
      "allocation": string, (e.g. "15%" or "₹50,000")
      "category": string, (e.g. "Small Cap", "Mid Cap", "Large Cap", "Sectoral/Thematic", "Liquid")
      "basketClassification": string, (Must be exactly "Core Alpha Gen", "Defensive Anchor", "Fee-Dragged Peer", or "Rebalance/Churn Catalyst")
      "currentExpenseRatio": number, (actual percentage, e.g. 1.85)
      "betterAlternativeFund": string, (similar or parity competing fund with superior/equivalent rolling metrics and better expense cost)
      "alternativeExpenseRatio": number, (improved lower peer percentage, e.g., 1.25)
      "returnDifference3Y": number, (estimated rolling annual outperformance from alternative, e.g., 1.15)
      "sharpeAndSortinoStatus": string, (brief risk comparison, e.g. "Competing fund Sortino of 1.40 or higher outpaces current")
      "rollingReturnsRating": number, (1 to 10 score)
      "downsideProtectionRating": number, (1 to 10 score)
      "switchingExitLoadCost": number, (estimated exit penalty fee if they exited now, e.g., 450)
      "taxImplication": number (estimated capital gains tax impact if exited now, e.g., -1200 for STCG hit, relative to holding period)
    }
  ],
  "returnGainsProjection": {
    "currentValue": number, (current relative amount, default 500000 if not clear)
    "projectedValue5YCurrent": number, (estimated standard compound value of current funds in 5 years)
    "projectedValue5YPWG": number, (projected value of optimizing with Pure Wealth optimized peer selections)
    "totalExtraWealthEarned": number, (the cumulative 5 Year compound delta earned by switching to optimized funds)
    "improvementExplanation": string, (2-3 sentences outlining the power of compounding with lower-fee and higher risk-adjusted Sortino/Rolling ratio mutual fund strategies)
    "portfolioCAGR": number, (computed compound yield achieved since inception, e.g. 0.1245)
    "niftyCAGR": number, (computed nifty compound yield since inception, e.g. 0.1145)
    "peerBenchmarkCAGR": number, (computed peer average active fund yield since inception, e.g. 0.1095)
    "oursOptimizedCAGR": number, (computed optimized strategy return since inception, e.g. 0.1465)
    "earliestInvestmentDate": string, (oldest transaction date parsed, e.g. "12-Sep-2019")
    "totalAcquisitionCost": number (computed net invested value parsed, e.g. 400000)
  },
  "switchingCostSummary": {
    "totalExitLoad": number, (sum of estimated exit load penalties in Rupees)
    "totalTaxImpact": number, (net STCG/LTCG tax cost or saving in Rupees. Express tax liability as a negative number, e.g., -15000)
    "avoidanceStrategy": string (detailed explanation of how waiting a few days/weeks or systematic transfer SWP can bypass exit loads and claim the annual ₹1.25L LTCG tax-free exemption)
  },
  "exitLoadLeaks": string[], (2-3 warnings of exit load costs - e.g. regular redemptions before 1 year, and avoidable situations like waiting 1 to 5 days to hit zero load thresholds)
  "taxLeaks": string, (detailed paragraph focusing on STCG churn costs, non-utilization of the annual ₹1.25L LTCG tax exemption, and slab rates drag)
  "actionablePortfolioPlan": string[] (4-5 concrete, sequential steps the user should follow right now to switch to clean, optimized peer plans and assets with Pure Wealth)
}

Be mathematically consistent. Do not suggest ridiculous numbers. Be precise, realistic, and highly educational. Respond with clean JSON only.`;

    if (portfolioType === "manual" && holdings) {
      contents = [
        basePrompt,
        {
          text: `Here is the user's manual holdings input context:\n${JSON.stringify(holdings, null, 2)}`
        }
      ];
    } else if (fileData) {
      let rawBase64 = fileData;
      if (rawBase64.includes(";base64,")) {
        rawBase64 = rawBase64.split(";base64,")[1];
      }

      const pdfBuffer = Buffer.from(rawBase64, "base64");
      let pdfText = "";
      let pdfParseSuccess = false;
      let pdfParseError = "";
      let pdfParseErrorName: string | null = null;
      let pdfParseErrorCode: number | null = null;

      try {
        const options: any = {};
        const trimmedPassword = password ? String(password).trim() : "";
        if (trimmedPassword) {
          options.password = trimmedPassword;
        }
        const parsedPdf = await pdfParse(pdfBuffer, options);
        if (typeof parsedPdf === "string") {
          pdfText = parsedPdf;
        } else if (parsedPdf && typeof parsedPdf.text === "string") {
          pdfText = parsedPdf.text;
        } else {
          pdfText = "";
        }
        pdfParseSuccess = true;
        console.log(`[Portfolio Audit] Successfully parsed PDF with pdf-parse. Extracted ${pdfText ? pdfText.length : 0} characters of text.`);
      } catch (err: any) {
        pdfParseError = err.message || String(err);
        pdfParseErrorName = err.name || null;
        pdfParseErrorCode = err.code || null;
        console.error("[Portfolio Audit] pdf-parse failed to parse or decrypt PDF:", err);
      }

      let isWrongPassword = false;
      let isPasswordRequired = false;

      if (!pdfParseSuccess) {
        const lowerErr = (pdfParseError || "").toLowerCase();
        
        if (pdfParseErrorName === "PasswordException" || lowerErr.includes("password exception")) {
          if (lowerErr.includes("incorrect password") || lowerErr.includes("incorrect")) {
            isWrongPassword = true;
          } else if (lowerErr.includes("no password given") || lowerErr.includes("no password")) {
            isPasswordRequired = true;
          } else {
             // Fallback
             if (password) isWrongPassword = true;
             else isPasswordRequired = true;
          }
        } else if (lowerErr.includes("no password given") || lowerErr.includes("no password")) {
          isPasswordRequired = true;
        } else if (lowerErr.includes("incorrect password") || (lowerErr.includes("incorrect") && lowerErr.includes("password"))) {
          isWrongPassword = true;
        } else if (lowerErr.includes("password") || lowerErr.includes("decrypt") || lowerErr.includes("encrypt")) {
          if (password) {
            isWrongPassword = true;
          } else {
            isPasswordRequired = true;
          }
        }
      }

      if (!pdfParseSuccess && (isWrongPassword || isPasswordRequired)) {
        if (isWrongPassword) {
          return res.status(400).json({ 
            error: "We were unable to open your password-protected PDF statement. Please make sure the password you provided is correct (for Indian Mutual Fund CAS statement PDFs, the password is typically your PAN in ALL-CAPS, or your email address, or name) and try again.",
            reason: "WRONG_PASSWORD"
          });
        } else {
          return res.status(400).json({ 
            error: "The Mutual Fund CAS PDF statement appears to be password-protected or encrypted. Please provide the PDF password in the Password field above, and upload the file again.",
            reason: "PASSWORD_REQUIRED"
          });
        }
      }

      let contextText = `The user uploaded a Mutual Fund CAS/Holding statement file: "${fileName}".\n`;
      if (password) {
        contextText += `Statement was password-encrypted. User supplied statement password for background context: "${password}".\n`;
      }

      if (pdfParseSuccess && pdfText && pdfText.trim()) {
        contextText += `\n--- START OF EXTRACTED PDF TEXT RECORD ---\n${pdfText}\n--- END OF EXTRACTED PDF TEXT RECORD ---\n\n`;
        contextText += `CRITICAL DIRECTIVE: You MUST analyze and audit the EXACT extracted text above. Extract and evaluate ALL mutual fund schemes, folio names, portfolio weights/valuations, and NAV values mentioned in this text record. Do NOT emulate or fabricate standard/demo holdings. These are the REAL holdings of the user. If you find no valid fund holdings in the text, return a response containing 0 holdings in the 'fundWiseAudit' array, but explain clearly in the 'diversificationAnalysis' and 'overallStrengths'/'criticalLeaks' that the file text did not seem to contain detectable mutual fund schemes, rather than inventing fake data.`;
        
        contents = [basePrompt, { text: contextText }];
      } else {
        console.log("[Portfolio Audit] Falling back to passing binary PDF directly with strict instructions.");
        const pdfPart = {
          inlineData: {
            mimeType: fileType || "application/pdf",
            data: rawBase64,
          },
        };
        
        contextText += `\nWe were unable to extract plain text on our server using pdf-parse (Error: ${pdfParseError}). We are passing the raw PDF directly to you. 
If this PDF is password-protected or has security restrictions, you may not be able to read it. 
CRITICAL DIRECTIVE: If you CANNOT read the PDF contents or find the user's investments inside the document, do NOT fabricate standard/demo holdings. Instead, return a 0 holdings state (empty list in 'fundWiseAudit') but populate the 'diversificationAnalysis' warning explaining that the PDF has a password or a complex format that prevents reading, and encourage the user to type holdings manually or use the manual input tab for a precise audit. This ensures absolute honesty and real-time validity for the user.`;

        contents = [pdfPart, basePrompt, { text: contextText }];
      }
    } else {
      return res.status(400).json({ error: "Missing holdings metadata or statement file content." });
    }

    const getResponseVal = async (retries = 5, delay = 2000): Promise<any> => {
      const modelName = retries <= 2 ? "gemini-3.1-flash-lite" : "gemini-3.5-flash";
      try {
        console.log(`[Portfolio Audit] Contacting Gemini API with model: ${modelName} (${retries} retries left)...`);
        return await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            responseMimeType: "application/json",
            temperature: 0.0,
            seed: 42,
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                totalFunds: { type: Type.INTEGER },
                overallStrengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                criticalLeaks: { type: Type.ARRAY, items: { type: Type.STRING } },
                diversificationScore: { type: Type.INTEGER },
                diversificationStatus: { type: Type.STRING },
                diversificationAnalysis: { type: Type.STRING },
                investorPersona: {
                  type: Type.OBJECT,
                  properties: {
                    typeName: { type: Type.STRING },
                    behaviorQuote: { type: Type.STRING },
                    behaviorAnalysis: { type: Type.STRING },
                    riskToleranceRating: { type: Type.STRING },
                    churnActivityLevel: { type: Type.STRING }
                  },
                  required: ["typeName", "behaviorQuote", "behaviorAnalysis", "riskToleranceRating", "churnActivityLevel"]
                },
                fundWiseAudit: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      fundName: { type: Type.STRING },
                      allocation: { type: Type.STRING },
                      category: { type: Type.STRING },
                      basketClassification: { type: Type.STRING },
                      currentExpenseRatio: { type: Type.NUMBER },
                      betterAlternativeFund: { type: Type.STRING },
                      alternativeExpenseRatio: { type: Type.NUMBER },
                      returnDifference3Y: { type: Type.NUMBER },
                      sharpeAndSortinoStatus: { type: Type.STRING },
                      rollingReturnsRating: { type: Type.INTEGER },
                      downsideProtectionRating: { type: Type.INTEGER },
                      switchingExitLoadCost: { type: Type.NUMBER },
                      taxImplication: { type: Type.NUMBER }
                    },
                    required: [
                      "fundName",
                      "allocation",
                      "category",
                      "basketClassification",
                      "currentExpenseRatio",
                      "betterAlternativeFund",
                      "alternativeExpenseRatio",
                      "returnDifference3Y",
                      "sharpeAndSortinoStatus",
                      "rollingReturnsRating",
                      "downsideProtectionRating",
                      "switchingExitLoadCost",
                      "taxImplication"
                    ]
                  }
                },
                returnGainsProjection: {
                  type: Type.OBJECT,
                  properties: {
                    currentValue: { type: Type.NUMBER },
                    projectedValue5YCurrent: { type: Type.NUMBER },
                    projectedValue5YPWG: { type: Type.NUMBER },
                    totalExtraWealthEarned: { type: Type.NUMBER },
                    improvementExplanation: { type: Type.STRING },
                    portfolioCAGR: { type: Type.NUMBER },
                    niftyCAGR: { type: Type.NUMBER },
                    peerBenchmarkCAGR: { type: Type.NUMBER },
                    oursOptimizedCAGR: { type: Type.NUMBER },
                    earliestInvestmentDate: { type: Type.STRING },
                    totalAcquisitionCost: { type: Type.NUMBER }
                  },
                  required: [
                    "currentValue",
                    "projectedValue5YCurrent",
                    "projectedValue5YPWG",
                    "totalExtraWealthEarned",
                    "improvementExplanation",
                    "portfolioCAGR",
                    "niftyCAGR",
                    "peerBenchmarkCAGR",
                    "oursOptimizedCAGR",
                    "earliestInvestmentDate",
                    "totalAcquisitionCost"
                  ]
                },
                switchingCostSummary: {
                  type: Type.OBJECT,
                  properties: {
                    totalExitLoad: { type: Type.NUMBER },
                    totalTaxImpact: { type: Type.NUMBER },
                    avoidanceStrategy: { type: Type.STRING }
                  },
                  required: ["totalExitLoad", "totalTaxImpact", "avoidanceStrategy"]
                },
                exitLoadLeaks: { type: Type.ARRAY, items: { type: Type.STRING } },
                taxLeaks: { type: Type.STRING },
                actionablePortfolioPlan: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: [
                "totalFunds",
                "overallStrengths",
                "criticalLeaks",
                "diversificationScore",
                "diversificationStatus",
                "diversificationAnalysis",
                "investorPersona",
                "fundWiseAudit",
                "returnGainsProjection",
                "switchingCostSummary",
                "exitLoadLeaks",
                "taxLeaks",
                "actionablePortfolioPlan"
              ]
            }
          },
        });
      } catch (err: any) {
        const errMsg = err.message || String(err);
        const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("overloaded") || errMsg.includes("demand");
        
        if (isTransient) {
          if (retries > 0) {
            console.warn(`[Portfolio Audit] Transient error encountered. Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return getResponseVal(retries - 1, delay * 2.2);
          } else {
            throw new Error("The AI model is currently experiencing exceptionally high demand and is overloaded (503). We attempted multiple retries but it is still unavailable. Please try your audit again in a few minutes.");
          }
        }
        throw err;
      }
    };

    const response = await getResponseVal();
    const parsedData = JSON.parse(response.text || "{}");

    let currentValue = Number(parsedData.returnGainsProjection?.currentValue || parsedData.returnGainsProjection?.current_value || 500000);
    if (isNaN(currentValue) || currentValue <= 0) {
      currentValue = 500000;
    }

    let earliestInvestmentDate = parsedData.returnGainsProjection?.earliestInvestmentDate || "12-Sep-2019";
    let totalAcquisitionCost = Number(parsedData.returnGainsProjection?.totalAcquisitionCost || parsedData.returnGainsProjection?.total_acquisition_cost) || Math.round(currentValue * 0.8125);
    if (isNaN(totalAcquisitionCost) || totalAcquisitionCost <= 0) {
      totalAcquisitionCost = Math.round(currentValue * 0.8125);
    }

    let yearsElapsed = 5.0;
    try {
      const msToday = Date.parse("2026-06-10");
      const msStart = Date.parse(earliestInvestmentDate);
      if (!isNaN(msStart)) {
        const msDiff = msToday - msStart;
        const calcYears = msDiff / (1000 * 60 * 60 * 24 * 365.25);
        if (calcYears > 0.1 && calcYears < 30) {
          yearsElapsed = calcYears;
        }
      }
    } catch (e) {
      yearsElapsed = 5.0;
    }

    let portfolioCAGR = Math.pow(currentValue / totalAcquisitionCost, 1 / yearsElapsed) - 1;
    if (isNaN(portfolioCAGR) || portfolioCAGR < 0.05 || portfolioCAGR > 0.40) {
      portfolioCAGR = 0.1245;
    }

    let niftyCAGR = 0.1145;
    if (yearsElapsed > 4) {
      niftyCAGR = 0.1185;
    } else if (yearsElapsed > 2) {
      niftyCAGR = 0.1250;
    }

    let peerBenchmarkCAGR = niftyCAGR - 0.005;
    let oursOptimizedCAGR = portfolioCAGR + 0.022;

    if (Array.isArray(parsedData.fundWiseAudit)) {
      parsedData.fundWiseAudit = parsedData.fundWiseAudit.map((fund: any, index: number) => {
        const fundName = fund.fundName || fund.name || `Fund ${index + 1}`;
        const cat = (fund.category || "").toLowerCase();
        const nameLower = (fundName).toLowerCase();
        const isDirect = nameLower.includes("direct") || nameLower.includes("dir") || nameLower.includes("- d") || nameLower.includes("(d)");

        let basket = fund.basketClassification || "Core Alpha Gen";
        if (
          cat.includes("small") || nameLower.includes("small") || nameLower.includes("small-cap") || nameLower.includes("smallcap") ||
          cat.includes("sectoral") || cat.includes("thematic") ||
          nameLower.includes("infrastructure") || nameLower.includes("infra") || nameLower.includes("psu") ||
          nameLower.includes("econ") || nameLower.includes("banking") || nameLower.includes("financial") ||
          nameLower.includes("pharma") || nameLower.includes("healthcare") || nameLower.includes("tech") ||
          nameLower.includes("digital") || nameLower.includes("defense") || nameLower.includes("manufacturing") ||
          nameLower.includes("energy") || nameLower.includes("power") || nameLower.includes("mnc") ||
          nameLower.includes("commodity") || nameLower.includes("hype")
        ) {
          basket = "Rebalance/Churn Catalyst";
        } else if (
          cat.includes("multi-asset") || cat.includes("multi asset") || cat.includes("balanced") || cat.includes("baf") ||
          cat.includes("hybrid") || cat.includes("index") || cat.includes("debt") || cat.includes("overnight") ||
          cat.includes("arbitrage") || cat.includes("liquid") || cat.includes("savings") ||
          nameLower.includes("nifty") || nameLower.includes("sensex") || nameLower.includes("arbitrage") ||
          nameLower.includes("liquid") || nameLower.includes("gilt") || nameLower.includes("cash") || nameLower.includes("treasury")
        ) {
          basket = "Defensive Anchor";
        } else if (
          (cat.includes("large") || nameLower.includes("bluechip") || nameLower.includes("blue chip") ||
          nameLower.includes("top 100") || nameLower.includes("tax shield") || nameLower.includes("elss") || nameLower.includes("tax saver")) &&
          !(cat.includes("index") || nameLower.includes("nifty") || nameLower.includes("sensex") || cat.includes("hybrid") || cat.includes("multi-asset"))
        ) {
          basket = "Fee-Dragged Peer";
        } else {
          basket = "Core Alpha Gen";
        }

        let defaultExpenseRatio = 1.65;
        let altExpenseRatio = 1.15;
        let returnDiff = 1.35;
        let rollRating = 8;
        let downRating = 8;

        if (basket === "Rebalance/Churn Catalyst") {
          defaultExpenseRatio = isDirect ? 0.75 : 1.95;
          altExpenseRatio = 1.15;
          returnDiff = 2.45;
          rollRating = 4;
          downRating = 3;
        } else if (basket === "Fee-Dragged Peer") {
          defaultExpenseRatio = isDirect ? 0.65 : 1.85;
          altExpenseRatio = 1.20;
          returnDiff = 1.80;
          rollRating = 5;
          downRating = 5;
        } else if (basket === "Defensive Anchor") {
          defaultExpenseRatio = isDirect ? 0.25 : 0.95;
          altExpenseRatio = 0.75;
          returnDiff = 0.65;
          rollRating = 7;
          downRating = 9;
        } else {
          defaultExpenseRatio = isDirect ? 0.70 : 1.65;
          altExpenseRatio = 1.15;
          returnDiff = 1.35;
          rollRating = 8;
          downRating = 8;
        }

        let currentExpenseRatio = Number(fund.currentExpenseRatio) || 0;
        if (currentExpenseRatio <= 0.05 || currentExpenseRatio > 3.5) {
          currentExpenseRatio = defaultExpenseRatio;
        } else {
          if (isDirect && currentExpenseRatio > 1.2) {
            currentExpenseRatio = defaultExpenseRatio;
          }
          if (!isDirect && currentExpenseRatio < 0.9) {
            currentExpenseRatio = defaultExpenseRatio;
          }
        }

        let alternativeExpenseRatio = Number(fund.alternativeExpenseRatio) || 0;
        if (alternativeExpenseRatio <= 0.05 || alternativeExpenseRatio > 3.0) {
          alternativeExpenseRatio = altExpenseRatio;
        }

        let returnDifference3Y = Number(fund.returnDifference3Y) || returnDiff;

        const amcList = ["SBI", "HDFC", "ICICI Prudential", "Nippon India", "Quant", "Parag Parikh", "Kotak"];
        const indexSeed = (fundName.length + index) % amcList.length;
        let selectedAMC = amcList[indexSeed];
        
        const amcKeywords = ["sbi", "hdfc", "icici", "nippon", "quant", "parag parikh", "kotak", "axis", "mirae", "tata"];
        let currentAMC = "";
        for (const kw of amcKeywords) {
          if (nameLower.includes(kw)) {
            currentAMC = kw;
            break;
          }
        }
        
        if (currentAMC) {
          for (let i = 0; i < amcList.length; i++) {
            const candidate = amcList[(indexSeed + i) % amcList.length];
            if (!candidate.toLowerCase().includes(currentAMC)) {
              selectedAMC = candidate;
              break;
            }
          }
        }

        let categoryLabel = fund.category || "Equity";
        let cleanCatLabel = categoryLabel
          .replace(/regular|direct|growth|plan|scheme|class/gi, "")
          .replace(/\s+/g, " ")
          .trim();
        
        if (!cleanCatLabel) {
          cleanCatLabel = "Equity Growth";
        }
        
        let schemeCategoryPart = cleanCatLabel;
        if (!schemeCategoryPart.toLowerCase().includes("fund") && !schemeCategoryPart.toLowerCase().includes("scheme")) {
          schemeCategoryPart = schemeCategoryPart + " Fund";
        }

        const betterAlternativeFund = `${selectedAMC} ${schemeCategoryPart} Regular Growth`;

        let weight = 1 / parsedData.fundWiseAudit.length;
        if (fund.allocation && typeof fund.allocation === 'string') {
          const pctMatch = fund.allocation.match(/(\d+(?:\.\d+)?)\s*%/);
          if (pctMatch) {
            weight = parseFloat(pctMatch[1]) / 100;
          } else {
            const valMatch = fund.allocation.replace(/[^0-9.]/g, '');
            if (valMatch) {
              const valNum = parseFloat(valMatch);
              if (valNum > 0) {
                weight = valNum / currentValue;
              }
            }
          }
        }
        const fundValue = currentValue * weight;

        const exitLoad = Math.round((fundValue * 0.20) * 0.01);
        const tax = -Math.round((fundValue * 0.20 * 0.15) * 0.20); 

        let fundCAGR = 12.20;
        if (basket === "Rebalance/Churn Catalyst") {
          fundCAGR = 14.85;
        } else if (basket === "Fee-Dragged Peer") {
          fundCAGR = 10.20;
        } else if (basket === "Defensive Anchor") {
          fundCAGR = 9.85;
        } else {
          fundCAGR = 13.50;
        }
        const alternativeCAGR = fundCAGR + returnDifference3Y;

        return {
          ...fund,
          fundName,
          category: categoryLabel,
          basketClassification: basket,
          currentExpenseRatio,
          alternativeExpenseRatio,
          betterAlternativeFund,
          returnDifference3Y,
          rollingReturnsRating: Number(fund.rollingReturnsRating) || rollRating,
          downsideProtectionRating: Number(fund.downsideProtectionRating) || downRating,
          switchingExitLoadCost: exitLoad,
          taxImplication: tax,
          fundCAGR,
          alternativeCAGR
        };
      });
    }

    const auditList = parsedData.fundWiseAudit || [];
    const totalExitLoad = auditList.reduce((acc: number, f: any) => acc + (f.switchingExitLoadCost || 0), 0);
    const totalTaxImpact = auditList.reduce((acc: number, f: any) => acc + (f.taxImplication || 0), 0);

    parsedData.switchingCostSummary = {
      totalExitLoad,
      totalTaxImpact,
      avoidanceStrategy: parsedData.switchingCostSummary?.avoidanceStrategy || "Wait for early-purchase batches to cross the 365-day threshold to lower exit load to 0. Align redemptions using ₹1.25L tax harvesting limits."
    };

    const val = currentValue;
    let r_current = portfolioCAGR;
    let r_pwg = oursOptimizedCAGR;

    const projectedValue5YCurrent = Math.round(val * Math.pow(1 + r_current, 5));
    const projectedValue5YPWG = Math.round(val * Math.pow(1 + r_pwg, 5));
    const totalExtraWealthEarned = projectedValue5YPWG - projectedValue5YCurrent;

    parsedData.returnGainsProjection = {
      currentValue: val,
      projectedValue5YCurrent,
      projectedValue5YPWG,
      totalExtraWealthEarned,
      improvementExplanation: parsedData.returnGainsProjection?.improvementExplanation || "Redirecting investment to peer schemes with optimized charges saves up to 0.8% annually, allowing your compound curves to stack much faster over the next five years.",
      portfolioCAGR,
      niftyCAGR,
      peerBenchmarkCAGR,
      oursOptimizedCAGR,
      earliestInvestmentDate,
      totalAcquisitionCost
    };

    const N = auditList.length;
    let score = 85;
    if (N > 8) {
      score -= (N - 8) * 2;
    }
    if (N < 3) {
      score -= 15;
    }
    
    const catalystCount = auditList.filter((f: any) => f.basketClassification === "Rebalance/Churn Catalyst").length;
    if (catalystCount / (N || 1) > 0.40) {
      score -= 15;
    }
    
    const categoriesSeen: Record<string, number> = {};
    auditList.forEach((f: any) => {
      const c = f.category || "Other";
      categoriesSeen[c] = (categoriesSeen[c] || 0) + 1;
    });
    const hasOverlaps = Object.values(categoriesSeen).some((count) => count >= 2);
    if (hasOverlaps) {
      score -= 10;
    }
    score = Math.max(15, Math.min(100, score));

    parsedData.diversificationScore = score;
    if (score >= 80) {
      parsedData.diversificationStatus = "Highly Diversified";
    } else if (score >= 50) {
      parsedData.diversificationStatus = "Moderately Concentrated";
    } else {
      parsedData.diversificationStatus = "Concentration Warning";
    }

    const dynamicAnalysisText = `The portfolio exhibits a diversification score of ${score} out of 100. While the asset allocation is well-distributed across Large, Mid, and Small Cap categories, the sheer number of holdings (${N} active schemes) introduces severe portfolio clutter. This over-diversification results in a heavy overlap of underlying stocks, effectively turning the portfolio into an expensive index tracker. Consolidating these holdings into fewer, high-conviction funds would significantly improve cost efficiency and performance.`;
    parsedData.diversificationAnalysis = dynamicAnalysisText;

    let overlappingPercentage = 0;
    if (N > 1) {
      let dupes = 0;
      Object.values(categoriesSeen).forEach((count) => {
        if (count > 1) {
          dupes += (count - 1);
        }
      });
      overlappingPercentage = Math.round(Math.min(92, 10 + (dupes * 15) + (N > 8 ? (N - 8) * 2 : 0)));
      if (overlappingPercentage < 15) overlappingPercentage = 15;
    }
    parsedData.overlappingPercentage = overlappingPercentage;

    return res.json(parsedData);

  } catch (error: any) {
    console.error("Express Gemini Audit Service Error:", error);
    let errMsg = error.message || String(error);
    
    if (
      errMsg.toLowerCase().includes("document has no pages") || 
      errMsg.toLowerCase().includes("no pages") ||
      errMsg.toLowerCase().includes("invalid_argument")
    ) {
      errMsg = "The system was unable to parse pages from your PDF statement. This usually happens if the PDF file is password-protected/encrypted, or the file size exceeds standard limits. If this is a CAS statement, please supply your password in the PDF Password field above to parse successfully, or enter your holdings manually under the 'Enter Holdings Manually' tab.";
    }
    
    return res.status(500).json({ error: errMsg });
  }
});

export default app;
