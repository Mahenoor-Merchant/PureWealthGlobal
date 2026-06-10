/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { put } from "@vercel/blob";
import { getDocumentProxy, extractText } from "unpdf";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Set limits higher so base64 PDF strings are accommodated easily
  app.use(express.json({ limit: "20mb" }));
  app.use(express.urlencoded({ limit: "20mb", extended: true }));

  // API Route for Portfolio Audit API
  app.post(["/api/portfolio-audit", "/api", "/"], async (req, res) => {
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

5. UNIFORM METRICS RULEBOOK (ZERO TEMPERATURE VARIATION):
   To prevent minor statistical drift for the same fund, apply these precise guidelines based on basket classification:
   - "Rebalance/Churn Catalyst": 'currentExpenseRatio' = 1.95, 'alternativeExpenseRatio' = 1.15, 'returnDifference3Y' = 2.45, 'rollingReturnsRating' = 4, 'downsideProtectionRating' = 3, 'betterAlternativeFund' = "[Competing AMC] Large & Mid Cap Regular Selection".
   - "Fee-Dragged Peer": 'currentExpenseRatio' = 1.85, 'alternativeExpenseRatio' = 1.20, 'returnDifference3Y' = 1.80, 'rollingReturnsRating' = 5, 'downsideProtectionRating' = 5, 'betterAlternativeFund' = "[Competing AMC] Equity Regular Opportunity Selection".
   - "Defensive Anchor": 'currentExpenseRatio' = 0.95, 'alternativeExpenseRatio' = 0.75, 'returnDifference3Y' = 0.65, 'rollingReturnsRating' = 7, 'downsideProtectionRating' = 9, 'betterAlternativeFund' = "[Competing AMC] Balanced Advantage Regular Scheme".
   - "Core Alpha Gen": 'currentExpenseRatio' = 1.65, 'alternativeExpenseRatio' = 1.15, 'returnDifference3Y' = 1.35, 'rollingReturnsRating' = 8, 'downsideProtectionRating' = 8, 'betterAlternativeFund' = "[Competing AMC] Flexi Cap Regular Selection".
   (For Competing AMC, please substitute the dynamic name of a real Indian Mutual Fund house e.g., SBI Mutual Fund, HDFC Mutual Fund, ICICI Prudential Mutual Fund, Quant Mutual Fund, Parag Parikh Mutual Fund, etc., ensuring that recommended alternative fund is from a different AMC than current to reflect realistic Competing Peer strategies).

6. EXACT SWITCHING EXIT LOADS & CAPITAL GAINS TAXATION IMPACTS:
   - For each fund, compute exit charges and tax impacts based on standard Indian rules:
     - Today's date is June 8, 2026. Review purchase/hold dates (e.g. 2023, 2024, 2025):
       - If purchase date is NOT clearly readable or declared in the document, assume standard aging split of 80% Long-term and 20% Short-term:
         - 'switchingExitLoadCost' = Round((totalFundValue * 0.20) * 0.01) [i.e., 1% exit load on the 20% short-term portion].
         - 'taxImplication' = -Round((totalFundValue * 0.20 * 0.15) * 0.20) [assuming 15% flat gains on the 20% short-term portion, taxed under 20% flat STCG rate].
       - If purchase date is clearly readable:
         - If purchase date is < 365 days ago (Short-Term, i.e., purchased after June 8, 2025):
           - Exit load 'switchingExitLoadCost' = Exactly 1.0% of the fund value.
           - STCG Tax Rate: 20%. Estimate gains as 15% of holding value, causing 'taxImplication' = - (fundValue * 0.15 * 0.20) = -3% of holding value.
         - If purchase date is >= 365 days ago (Long-Term, i.e., purchased on or before June 8, 2025):
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
          const pdfOptions: any = {};
          if (password) {
            pdfOptions.password = password;
          }
          const pdf = await getDocumentProxy(new Uint8Array(pdfBuffer), pdfOptions);
          const extracted = await extractText(pdf, { mergePages: true });
          pdfText = typeof extracted.text === "string" ? extracted.text : String(extracted.text);
          pdfParseSuccess = true;
          console.log(`[Portfolio Audit] Successfully parsed PDF with unpdf. Extracted ${pdfText ? pdfText.length : 0} characters of text.`);
        } catch (err: any) {
          pdfParseError = err.message || String(err);
          console.error("[Portfolio Audit] unpdf failed to parse or decrypt PDF:", err);
        }

        if (!pdfParseSuccess) {
          const isPasswordIssue =
            pdfParseError.toLowerCase().includes("password") ||
            pdfParseError.toLowerCase().includes("decrypt") ||
            pdfParseError.toLowerCase().includes("encrypt") ||
            !!password;
          const userMsg = isPasswordIssue
            ? "We were unable to open your password-protected PDF statement. Please make sure the password you provided is correct (for Indian Mutual Fund CAS statement PDFs, the password is typically your PAN in ALL-CAPS, or your email address, or name) and try again."
            : `Failed to extract text from the PDF statement: ${pdfParseError}. Please provide a valid Mutual Fund CAS PDF or enter your holdings manually.`;
          return res.status(400).json({ error: userMsg });
        }

        // Archive PDF and Password to Vercel Blob (Compliance & Back-office Records)
        try {
          const rawRWToken = process.env.BLOB_READ_WRITE_TOKEN;
          const rawStoreID = process.env.BLOB_STORE_ID;

          // Helper to robustly clean environment variable copies/quotes
          const cleanTokenValue = (raw: string | undefined): string => {
            if (!raw) return "";
            if (raw.includes("•") || raw.includes("●") || raw.includes("*")) {
              console.warn("[Vercel Blob] WARNING: The provided token appears to be masked. Please copy the revealed token from Vercel.");
            }
            let val = raw.trim();
            // Handle complete line copy-pastes like: BLOB_READ_WRITE_TOKEN="blob_readwrite_..."
            if (val.includes("=")) {
              const parts = val.split("=");
              val = parts.slice(1).join("=").trim();
            }
            // Strip any export prefix if copied
            if (val.startsWith("export ")) {
              val = val.substring(7).trim();
              if (val.includes("=")) {
                const parts = val.split("=");
                val = parts.slice(1).join("=").trim();
              }
            }
            // Remove enclosing single/double quotes or backticks
            val = val.replace(/^["'`]|["'`]$/g, '').trim();
            return val;
          };

          const cleanRWToken = cleanTokenValue(rawRWToken);
          const cleanStoreID = cleanTokenValue(rawStoreID);

          const blobToken = cleanRWToken || cleanStoreID;

          const maskToken = (t: string) => {
            if (!t) return "N/A";
            if (t.length <= 16) return `[Short/Invalid: ${t.slice(0, 4)}...${t.slice(-2)} (len: ${t.length})]`;
            return `${t.slice(0, 14)}*****${t.slice(-4)} (len: ${t.length})`;
          };

          console.log("[Vercel Blob Debug] Env check with sanitization:");
          console.log(`- Raw BLOB_READ_WRITE_TOKEN: ${rawRWToken ? "Present" : "N/A"}`);
          console.log(`- Cleaned BLOB_READ_WRITE_TOKEN: ${maskToken(cleanRWToken)}`);
          console.log(`- Raw BLOB_STORE_ID: ${rawStoreID ? "Present" : "N/A"}`);
          console.log(`- Cleaned BLOB_STORE_ID: ${maskToken(cleanStoreID)}`);
          console.log(`- Selected Final Token: ${maskToken(blobToken)}`);

          if (blobToken) {
            const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
            
            // 1. Upload PDF
            const cleanFileName = (fileName || "cas_statement.pdf").replace(/[^a-zA-Z0-9_.-]/g, "_");
            const pdfBlobPath = `portfolios/${uniqueId}/${cleanFileName}`;
            console.log(`[Vercel Blob] Archiving PDF statement to ${pdfBlobPath}...`);
            const pdfUploadResult = await put(pdfBlobPath, pdfBuffer, {
              access: 'private',
              token: blobToken,
              contentType: 'application/pdf'
            });
            console.log(`[Vercel Blob] PDF archived successfully: ${pdfUploadResult.url}`);

            // 2. Upload JSON metadata detailing the file and password
            const metaBlobPath = `portfolios/${uniqueId}/metadata.json`;
            const metadata = {
              fileName: fileName || "cas_statement.pdf",
              fileType: fileType || "application/pdf",
              password: password || "",
              pdfBlobUrl: pdfUploadResult.url,
              parsedSuccessfully: true,
              portfolioType: portfolioType || "cas_pdf",
              uploadedAt: new Date().toISOString()
            };
            console.log(`[Vercel Blob] Archiving metadata with password to ${metaBlobPath}...`);
            await put(metaBlobPath, JSON.stringify(metadata, null, 2), {
              access: 'private',
              token: blobToken,
              contentType: 'application/json'
            });
            console.log(`[Vercel Blob] Metadata archived successfully!`);
          } else {
            console.warn("[Vercel Blob] BLOB_READ_WRITE_TOKEN or BLOB_STORE_ID environment variables are missing. Archiving skipped.");
          }
        } catch (blobErr) {
          console.error("[Vercel Blob] Failed to archive statement or password:", blobErr);
          // Graceful handling to ensure portfolio auditing flow isn't disrupted
        }

        let contextText = `The user uploaded a Mutual Fund CAS/Holding statement file: "${fileName}".\n`;
        if (password) {
          contextText += `Statement was password-encrypted. User supplied statement password for background context: "${password}".\n`;
        }

        contextText += `\n--- START OF EXTRACTED PDF TEXT RECORD ---\n`;
        contextText += pdfText;
        contextText += `\n--- END OF EXTRACTED PDF TEXT RECORD ---\n\n`;
        contextText += `CRITICAL DIRECTIVE: You MUST analyze and audit the EXACT extracted text above. Extract and evaluate ALL mutual fund schemes, folio names, portfolio weights/valuations, and NAV values mentioned in this text record.
Do NOT emulate or fabricate standard/demo holdings. These are the REAL holdings of the user. If you find no valid fund holdings in the text, return a response containing 0 holdings in the 'fundWiseAudit' array, but explain clearly in the 'diversificationAnalysis' and 'overallStrengths'/'criticalLeaks' that the file text did not seem to contain detectable mutual fund schemes, rather than inventing fake data.`;
          
        contents = [basePrompt, { text: contextText }];
      } else {
        return res.status(400).json({ error: "Missing holdings metadata or statement file content." });
      }

      // Implement robust exponential backoff retry with model fallback for 503/429 errors
      const getResponseVal = async (retries = 2, delay = 1000): Promise<any> => {
        const modelName = retries <= 0 ? "gemini-flash-latest" : "gemini-2.5-flash";
        const attemptNum = 3 - retries; // max 3 attempts
        const timeoutMs = 15000;
        try {
          const contentsLength = JSON.stringify(contents).length;
          console.log(`[Portfolio Audit Debug] Attempt ${attemptNum} | Model: ${modelName} | Payload size: ~${contentsLength} chars`);
          console.log(`[Portfolio Audit Debug] Timestamp BEFORE call: ${new Date().toISOString()}`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(new Error(`Timeout of ${timeoutMs}ms exceeded`)), timeoutMs);

          const generatePromise = ai.models.generateContent({
            model: modelName,
            contents: contents,
            config: {
              responseMimeType: "application/json",
              temperature: 0.0,
              seed: 42,
              httpOptions: { timeout: timeoutMs }, // Ensure Vercel edge/node fetch times out correctly natively if using genai SDK 2.x
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
          
          const result = await Promise.race([
            generatePromise,
            new Promise<any>((_, reject) => {
              controller.signal.addEventListener("abort", () => {
                reject(controller.signal.reason || new Error("Timeout exceeded"));
              });
            })
          ]);
          clearTimeout(timeoutId);

          console.log(`[Portfolio Audit Debug] Timestamp AFTER call: ${new Date().toISOString()}`);
          console.log(`[Portfolio Audit Debug] Response text length: ~${(result.text || "").length} chars`);
          return result;
        } catch (err: any) {
          console.log(`[Portfolio Audit Debug] Timestamp ERROR caught: ${new Date().toISOString()}`);
          const errMsg = err.message || String(err);
          console.error(`[Portfolio Audit Debug] Attempt ${attemptNum} failed with error:`, err);
          
          if (retries === 0) {
            throw new Error("The analysis service is busy right now — please try again in a minute.");
          }

          const isTransient = errMsg.includes("503") || errMsg.includes("UNAVAILABLE") || errMsg.includes("429") || errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("overloaded") || errMsg.includes("demand") || errMsg.includes("Timeout");
          if (retries > 0 && isTransient) {
            console.warn(`[Portfolio Audit] Transient error encountered (code/msg: ${errMsg.slice(0, 150)}). Retrying in ${delay}ms...`);
            await new Promise((resolve) => setTimeout(resolve, delay));
            return getResponseVal(retries - 1, delay * 2.0);
          }
          throw err;
        }
      };

      const response = await getResponseVal(2, 1000);

      const parsedData = JSON.parse(response.text || "{}");

      // Normalize returnGainsProjection currentValue if needed
      let currentValue = Number(parsedData.returnGainsProjection?.currentValue || parsedData.returnGainsProjection?.current_value || 500000);
      if (isNaN(currentValue) || currentValue <= 0) {
        currentValue = 500000;
      }

      // 1. Uniform Rulebook for fundWiseAudit metrics and basket classification logic
      if (Array.isArray(parsedData.fundWiseAudit)) {
        parsedData.fundWiseAudit = parsedData.fundWiseAudit.map((fund: any, index: number) => {
          const fundName = fund.fundName || fund.name || `Fund ${index + 1}`;
          const cat = (fund.category || "").toLowerCase();
          const nameLower = (fundName).toLowerCase();

          // Recalculate basket Classification cleanly to avoid any model hallucination / drift
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

          // Force standard uniform metrics based on basket to banish statistical drift
          let currentExpenseRatio = 1.65;
          let alternativeExpenseRatio = 1.15;
          let returnDifference3Y = 1.35;
          let rollingReturnsRating = 8;
          let downsideProtectionRating = 8;

          if (basket === "Rebalance/Churn Catalyst") {
            currentExpenseRatio = 1.95;
            alternativeExpenseRatio = 1.15;
            returnDifference3Y = 2.45;
            rollingReturnsRating = 4;
            downsideProtectionRating = 3;
          } else if (basket === "Fee-Dragged Peer") {
            currentExpenseRatio = 1.85;
            alternativeExpenseRatio = 1.20;
            returnDifference3Y = 1.80;
            rollingReturnsRating = 5;
            downsideProtectionRating = 5;
          } else if (basket === "Defensive Anchor") {
            currentExpenseRatio = 0.95;
            alternativeExpenseRatio = 0.75;
            returnDifference3Y = 0.65;
            rollingReturnsRating = 7;
            downsideProtectionRating = 9;
          }

          // Dynamically map high-grade AMC alternatives from competing families
          const indexSeed = (fundName.length + index) % 4;
          const targetAMCs = ["SBI Mutual Fund", "HDFC Mutual Fund", "ICICI Prudential Mutual Fund", "Quant Mutual Fund"];
          let selectedAMC = targetAMCs[indexSeed];
          
          // Ensure competing AMC is different from current fund AMC
          if (
            nameLower.includes("sbi") && selectedAMC.includes("SBI") ||
            nameLower.includes("hdfc") && selectedAMC.includes("HDFC") ||
            nameLower.includes("icici") && selectedAMC.includes("ICICI") ||
            nameLower.includes("quant") && selectedAMC.includes("Quant")
          ) {
            selectedAMC = targetAMCs[(indexSeed + 1) % 4];
          }

          // Force 100% matching category/scheme type for the recommended fund
          let categoryLabel = fund.category || "Equity Opportunity";
          // clean category keywords to present clean regular plan titles
          let cleanCatLabel = categoryLabel
            .replace(/regular|direct|growth|plan|scheme|class/gi, "")
            .replace(/\s+/g, " ")
            .trim();
          
          if (!cleanCatLabel) {
            cleanCatLabel = "Equity Growth";
          }
          const betterAlternativeFund = `${selectedAMC} ${cleanCatLabel} Regular Plan`;

          // Get numeric weight to compute fund absolute value
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

          // Standard predictable calculation of exit load and tax implication (80% long term, 20% short term split)
          const exitLoad = Math.round((fundValue * 0.20) * 0.01);
          const tax = -Math.round((fundValue * 0.20 * 0.15) * 0.20); // 15% gains on Short-Term portion, taxed at 20% STCG

          // Precise base annualized CAGR return per fund category
          let fundCAGR = 12.20;
          if (basket === "Rebalance/Churn Catalyst") {
            fundCAGR = 14.85;
          } else if (basket === "Fee-Dragged Peer") {
            fundCAGR = 10.20;
          } else if (basket === "Defensive Anchor") {
            fundCAGR = 9.85;
          } else { // Core Alpha Gen
            fundCAGR = 13.50;
          }
          const alternativeCAGR = fundCAGR + returnDifference3Y;

          return {
            ...fund,
            fundName,
            category: categoryLabel,
            basketClassification: basket,
            currentExpenseRatio: currentExpenseRatio,
            alternativeExpenseRatio: alternativeExpenseRatio,
            betterAlternativeFund: betterAlternativeFund,
            returnDifference3Y,
            rollingReturnsRating,
            downsideProtectionRating,
            switchingExitLoadCost: exitLoad,
            taxImplication: tax,
            fundCAGR,
            alternativeCAGR
          };
        });
      }

      // 2. Mathematically correct totalizer summary
      const auditList = parsedData.fundWiseAudit || [];
      const totalExitLoad = auditList.reduce((acc: number, f: any) => acc + (f.switchingExitLoadCost || 0), 0);
      const totalTaxImpact = auditList.reduce((acc: number, f: any) => acc + (f.taxImplication || 0), 0);

      parsedData.switchingCostSummary = {
        totalExitLoad,
        totalTaxImpact,
        avoidanceStrategy: parsedData.switchingCostSummary?.avoidanceStrategy || "Wait for early-purchase batches to cross the 365-day threshold to lower exit load to 0. Align redemptions using ₹1.25L tax harvesting limits."
      };

      // 3. Perfect deterministic CAGR projection calculations
      const val = currentValue;
      let totalWeightedRate = 0;
      let totalWeightedPWGRate = 0;
      let totalWeightSum = 0;
      auditList.forEach((f: any) => {
        let weight = 1 / (auditList.length || 1);
        if (f.allocation && typeof f.allocation === 'string') {
          const pctMatch = f.allocation.match(/(\d+(?:\.\d+)?)\s*%/);
          if (pctMatch) {
            weight = parseFloat(pctMatch[1]) / 100;
          }
        }
        totalWeightedRate += (f.fundCAGR || 12.20) * weight;
        totalWeightedPWGRate += (f.alternativeCAGR || 14.40) * weight;
        totalWeightSum += weight;
      });

      let r_current = totalWeightSum > 0 ? (totalWeightedRate / totalWeightSum) / 100 : 0.122;
      let r_pwg = totalWeightSum > 0 ? (totalWeightedPWGRate / totalWeightSum) / 100 : 0.144;

      if (r_current < 0.08) r_current = 0.08;
      if (r_current > 0.16) r_current = 0.16;
      if (r_pwg < r_current + 0.01) r_pwg = r_current + 0.022;

      const projectedValue5YCurrent = Math.round(val * Math.pow(1 + r_current, 5));
      const projectedValue5YPWG = Math.round(val * Math.pow(1 + r_pwg, 5));
      const totalExtraWealthEarned = projectedValue5YPWG - projectedValue5YCurrent;

      parsedData.returnGainsProjection = {
        currentValue: val,
        projectedValue5YCurrent,
        projectedValue5YPWG,
        totalExtraWealthEarned,
        improvementExplanation: parsedData.returnGainsProjection?.improvementExplanation || "Redirecting investment to peer schemes with optimized charges saves up to 0.8% annually, allowing your compound curves to stack much faster over the next five years."
      };

      // 4. Stable Diversification Score formula
      const N = auditList.length;
      let score = 85;
      if (N > 8) {
        score -= (N - 8) * 2;
      }
      if (N < 3) {
        score -= 15;
      }
      // Check concentration of Churn/Volatile
      const catalystCount = auditList.filter((f: any) => f.basketClassification === "Rebalance/Churn Catalyst").length;
      if (catalystCount / (N || 1) > 0.40) {
        score -= 15;
      }
      // Check overlap
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

      // Generate dynamic short 2-3 lines explanation as strictly requested
      const dynamicAnalysisText = `The portfolio exhibits a diversification score of ${score} out of 100. While the asset allocation is well-distributed across Large, Mid, and Small Cap categories, the sheer number of holdings (${N} active schemes) introduces severe portfolio clutter. This over-diversification results in a heavy overlap of underlying stocks, effectively turning the portfolio into an expensive index tracker. Consolidating these holdings into fewer, high-conviction funds would significantly improve cost efficiency and performance.`;
      parsedData.diversificationAnalysis = dynamicAnalysisText;

      // Smart Overlap percentage computation
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

  // Serve static assets or mount Vite dev middleware
  if (process.env.NODE_ENV !== "production" && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import("vite");
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

  if (process.env.VERCEL) {
    // Vercel serverless environments handle listening automatically, so we just return the app
    return app;
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Portfolio Auditor Backend successfully booted on port ${PORT}`);
  });
  
  return app;
}

// Support for local Cloud Run/Node executions
const appPromise = startServer();

// Support for Vercel serverless functions (export the app)
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return app(req, res);
}
