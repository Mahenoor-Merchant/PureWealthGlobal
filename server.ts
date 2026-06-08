/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { PDFParse } from "pdf-parse";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits higher so base64 PDF strings are accommodated easily
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route for Portfolio Audit API
  app.post("/api/portfolio-audit", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY environment variable is not configured." });
      }

      const { fileData, fileName, fileType, password, holdings, portfolioType } = req.body;

      // Initialize Gemini SDK with telemetry User-Agent header
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
   - For every single scheme found, you MUST create a distinct item in the 'fundWiseAudit' array.
   - Do NOT omit any holdings. Do NOT group separate schemes of different categories or AMCs under a single entry (unless they are exactly the same scheme). If there are 15 schemes, 'totalFunds' must be exactly 15, and the 'fundWiseAudit' array must contain exactly 15 elements with zero random skips or omissions between runs.
   - For each fund, maintain exact names (as listed in CAS PDF) and match its scheme category cleanly (e.g., Large Cap, Mid Cap, Small Cap, Flexi Cap, Sectoral/Thematic, Multi Asset, etc.).

2. STRICT BASKET CLASSIFICATION GUIDELINES (ZERO RANDOM VARIATION):
   - You must evaluate and classify each holding into one of Four Strategic Performance Baskets based on objective rules:
     - "Core Alpha Gen": High-performing, active strategies that consistently beat benchmarks with top-tier returns and optimized regular structures (e.g. Parag Parikh Flexi Cap Regular, HDFC Flexi Cap Regular, Quant Active Fund, etc.).
     - "Defensive Anchor": Low-volatility anchors showing durable downside insulation, or stable hybrid/index/multi-asset setups (e.g. ICICI Prudential Multi-Asset, SBI Bluechip, HDFC Top 100, etc.).
     - "Fee-Dragged Peer": Standard active strategies with high cost ratios (e.g. >1.70%) and flat peer/benchmark rolling return performance, causing fee leakage.
     - "Rebalance/Churn Catalyst": Highly volatile, poor downmarket protection thematic/sectoral schemes, or redundant small caps, or high brokerage churn entries. Inconsistent or highly redundant index/thematic funds.
   - ALWAYS classify a given fund name to the SAME strategic basket under multiple runs of the same file.

3. DETERMINISTIC DIVERSIFICATION RATING & ANALYSIS (1 TO 100):
   - Compute 'diversificationScore' deterministically using this explicit formula:
     - Base Score = 85.
     - Portfolio Clutter Penalty: If total schemes count (N) > 10, deduct exactly 2 points for each fund above 8, up to a maximum deduction of 20 points (e.g. N=15 gets -14 points penalty).
     - Under-Diversification Penalty: If total schemes count (N) < 3, deduct 15 points.
     - Concentration Drag: If Small Cap or Sectoral/Thematic allocations represent > 40% of the aggregate portfolio, deduct 15 points.
     - High Capital Slop: If multiple funds overlap within the identical exact AMCs & categories (e.g. 3 different large cap funds), deduct 10 points for overlap redundancy.
     - Ensure this score is computed with no variance. Write down the logic in 'diversificationAnalysis'.

4. MATHEMATICALLY AIRTIGHT COMPOUND PROJECTIONS (5-YEAR TIMELINE):
   - 'currentValue': Parse aggregate valuation from PDF. If not declared, default to 500000.
   - Calculate standard weighted-average compound rates:
     - Current Portfolio CAGR (r_current): Base on asset mix using: Large Cap/Debt = 11.5% (0.115), Mid/Flexi/Multi = 13% (0.13), Small/Thematic = 14.5% (0.145). Limit r_current strictly to a range of 11% to 13.5%.
     - Pure Wealth Optimized CAGR (r_pwg): Formulate as exactly r_current + 2.2% (reflecting 0.8% CAGR expense ratio recovery and 1.4% strategic risk-adjusted peer selection outperformance).
   - Compute five-year compounding values precisely (rounded to nearest rupee):
     - projectedValue5YCurrent = Round(currentValue * (1 + r_current)^5)
     - projectedValue5YPWG = Round(currentValue * (1 + r_pwg)^5)
     - totalExtraWealthEarned = projectedValue5YPWG - projectedValue5YCurrent
   - ALWAYS double-check this math so that the sum and difference match to the single rupee.

5. EXACT SWITCHING EXIT LOADS & CAPITAL GAINS TAXATION IMPACTS:
   - For each fund, compute exit charges and tax impacts based on standard Indian rules:
     - Today's date is June 8, 2026. Review purchase/hold dates (e.g. 2023, 2024, 2025):
       - If purchase date is < 365 days ago (Short-Term, i.e., purchased after June 8, 2025):
         - Exit load 'switchingExitLoadCost' = Exactly 1.0% of the fund value.
         - Short-Term Capital Gains Tax Rate: 20%. Estimate gains as 15% of holding value, causing 'taxImplication' = - (fundValue * 0.15 * 0.20) = -3% of holding value.
       - If purchase date is >= 365 days ago (Long-Term, i.e., purchased on or before June 8, 2025):
         - Exit load 'switchingExitLoadCost' = Exactly 0.
         - Long-Term Capital Gains Tax Rate: 12.5% on gains exceeding ₹1.25 Lakh. Estimate LTCG gains as 30% of holding value. Proportional LTCG tax impact: If total LTCG gains across all LTCG holdings > 125,000, apply 12.5% tax on the excess, and allocate proportionally as a negative 'taxImplication' (otherwise 0).
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
    "projectedValue5YCurrent": number, (estimated standard compound value of current funds in 5 years at e.g. 11.5% compounding)
    "projectedValue5YPWG": number, (projected value of optimizing with Pure Wealth optimized peer selections at e.g. 14.1% compounding)
    "totalExtraWealthEarned": number, (the cumulative 5 Year compound delta earned by switching to optimized funds)
    "improvementExplanation": string (2-3 sentences outlining the power of compounding with lower-fee and higher risk-adjusted Sortino/Rolling ratio mutual fund strategies)
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
            text: `Here is the user's manual holdings input context:
${JSON.stringify(holdings, null, 2)}`
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

        try {
          // pdf-parse options:
          // The optional password parameter can be sent to PDFJS via options.password
          const options: any = {
            data: pdfBuffer,
          };
          if (password) {
            options.password = password;
          }
          const parser = new PDFParse(options);
          const parsedPdf = await parser.getText();
          pdfText = parsedPdf.text;
          pdfParseSuccess = true;
          console.log(`[Portfolio Audit] Successfully parsed PDF with pdf-parse. Extracted ${pdfText ? pdfText.length : 0} characters of text.`);
        } catch (err: any) {
          pdfParseError = err.message || String(err);
          console.error("[Portfolio Audit] pdf-parse failed to parse or decrypt PDF:", err);
        }

        const isPasswordIssue =
          pdfParseError.toLowerCase().includes("password") ||
          pdfParseError.toLowerCase().includes("decrypt") ||
          pdfParseError.toLowerCase().includes("encrypt") ||
          !!password;

        if (!pdfParseSuccess && isPasswordIssue) {
          const userMsg = password
            ? "We were unable to open your password-protected PDF statement. Please make sure the password you provided is correct (for Indian Mutual Fund CAS statement PDFs, the password is typically your PAN in ALL-CAPS, or your email address, or name) and try again."
            : "The Mutual Fund CAS PDF statement appears to be password-protected or encrypted. Please provide the PDF password in the Password field above, and upload the file again.";
          return res.status(400).json({ error: userMsg });
        }

        let contextText = `The user uploaded a Mutual Fund CAS/Holding statement file: "${fileName}".\n`;
        if (password) {
          contextText += `Statement was password-encrypted. User supplied statement password for background context: "${password}".\n`;
        }

        if (pdfParseSuccess && pdfText && pdfText.trim()) {
          contextText += `\n--- START OF EXTRACTED PDF TEXT RECORD ---\n`;
          contextText += pdfText;
          contextText += `\n--- END OF EXTRACTED PDF TEXT RECORD ---\n\n`;
          contextText += `CRITICAL DIRECTIVE: You MUST analyze and audit the EXACT extracted text above. Extract and evaluate ALL mutual fund schemes, folio names, portfolio weights/valuations, and NAV values mentioned in this text record.
Do NOT emulate or fabricate standard/demo holdings. These are the REAL holdings of the user. If you find no valid fund holdings in the text, return a response containing 0 holdings in the 'fundWiseAudit' array, but explain clearly in the 'diversificationAnalysis' and 'overallStrengths'/'criticalLeaks' that the file text did not seem to contain detectable mutual fund schemes, rather than inventing fake data.`;
          
          contents = [basePrompt, { text: contextText }];
        } else {
          // Fallback: pass the base64 PDF directly to Gemini
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

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
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
                  improvementExplanation: { type: Type.STRING }
                },
                required: ["currentValue", "projectedValue5YCurrent", "projectedValue5YPWG", "totalExtraWealthEarned", "improvementExplanation"]
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

      const parsedData = JSON.parse(response.text || "{}");
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

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Auditor Backend successfully booted on port ${PORT}`);
  });
}

startServer();
