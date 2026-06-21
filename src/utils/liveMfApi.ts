/**
 * Live AMFI Mutual Fund Data Engine
 * Fetches real historical daily NAV data from the public api.mfapi.in AMFI aggregator.
 * Computes exact mathematical CAGR rolling returns (1Y, 3Y, 5Y, 7Y, 10Y)
 * and risk-adjusted metrics (Sharpe Ratio, Sortino Ratio) in real-time.
 */

import { getFundInceptionYear, KNOWN_REAL_LAUNCH_YEARS } from "../funds/master_generator";
import { getRollingReturnsForDate } from "./rollingReturns";

// Scheme code maps for the most popular/flagship funds in the application (Regular Growth)
const POPULAR_SCHeme_MAPPING: Record<string, string> = {
  "nippon india small cap": "102879", // Regular Growth
  "quant small cap": "120827", // Regular Growth
  "parag parikh flexi cap": "122640", // Regular Growth
  "hdfc top 100": "101185", // Regular Growth
  "sbi bluechip": "103135", // Regular Growth
  "icici prudential bluechip": "101168", // Regular Growth
  "kotak emerging equity": "101905", // Regular Growth
  "axis small cap": "120515", // Regular Growth
  "motilal oswal nasdaq 100": "119329", // Regular Growth
  "franklin india flexi cap": "100411", // Regular Growth
  "sbi magnum midcap": "103174", // Regular Growth
  "mirae asset large cap": "107560", // Regular Growth
  "hdfc mid-cap opportunities": "101218", // Regular Growth
  "mirae asset multicap": "151757", // Regular Growth
  "motilal oswal multi cap": "152430", // Regular Growth
  "quant large & mid cap": "120822",
  "motilal oswal midcap": "127038",
  "baroda bnp paribas large & mid cap": "101157"
};

export interface LiveMetrics {
  rolling: string[]; // [1Y, 3Y, 5Y, 7Y, 10Y]
  sharpe: string;    // 3Y risk-free adjusted
  sortino: string;   // 3Y downside adjusted
  realLaunchYear: number;
}

// Global cache in sessionStorage of calculated metrics to avoid multiple API calls
const metricsCache: Record<string, Record<string, LiveMetrics>> = {};

// In-process memory caches to stop redundant network requests during multi-date and comparison evaluation
const schemeCodeGlobalCache: Record<string, string | null> = {};
const navHistoryGlobalCache: Record<string, { date: string; nav: string }[]> = {};

// Helper to parse date string in format "DD-MM-YYYY"
function parseDateStr(str: string): Date {
  const parts = str.split('-');
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
}

// Find closest NAV entry for a target date
function findClosestNavEntry(data: { date: string; nav: string }[], targetDate: Date): { entry: { date: string; nav: string } | null; index: number } {
  if (data.length === 0) return { entry: null, index: -1 };
  
  const targetTime = targetDate.getTime();
  let minDiff = Infinity;
  let closestIndex = -1;
  
  // High speed binary search or scanned minimum difference
  for (let i = 0; i < data.length; i++) {
    const entryDate = parseDateStr(data[i].date);
    const diff = Math.abs(entryDate.getTime() - targetTime);
    if (diff < minDiff) {
      minDiff = diff;
      closestIndex = i;
    }
  }
  
  // Allow a maximum deviation of 15 days to cover weekends/holidays/gaps
  if (minDiff <= 15 * 24 * 60 * 60 * 1000 && closestIndex !== -1) {
    return { entry: data[closestIndex], index: closestIndex };
  }
  return { entry: null, index: -1 };
}

/**
 * Searches for a fund's scheme code from api.mfapi.in
 */
export async function fetchSchemeCode(fundName: string): Promise<string | null> {
  const normalized = fundName.toLowerCase().trim();
  
  // A. Check in-memory cache first
  if (schemeCodeGlobalCache[normalized] !== undefined) {
    return schemeCodeGlobalCache[normalized];
  }
  
  // 1. Check if we have exact regular growth mapping
  for (const [key, code] of Object.entries(POPULAR_SCHeme_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      schemeCodeGlobalCache[normalized] = code;
      return code;
    }
  }
  
  // 2. Otherwise query mfapi search
  try {
    const cleanSearchQuery = fundName
      .replace(/Direct|Regular|Growth|Dividend|-/gi, "")
      .replace(/\s+/g, " ")
      .trim();
       
    const searchUrl = `https://api.mfapi.in/mf/search?q=${encodeURIComponent(cleanSearchQuery)}`;
    const response = await fetch(searchUrl);
    if (!response.ok) {
      schemeCodeGlobalCache[normalized] = null;
      return null;
    }
    
    interface SearchItem {
      schemeCode: number;
      schemeName: string;
    }
    const results: SearchItem[] = await response.json();
    if (results && results.length > 0) {
      // Prioritize Regular Growth plans. Clear out non-growth dividend / IDCW options.
      const nonDivResults = results.filter(item => {
        const itemLower = item.schemeName.toLowerCase();
        return !itemLower.includes("dividend") && 
               !itemLower.includes("idcw") && 
               !itemLower.includes("payout") && 
               !itemLower.includes("reinvest") &&
               !itemLower.includes("income");
      });
      
      const candidates = nonDivResults.length > 0 ? nonDivResults : results;
      
      let bestMatch: SearchItem | null = null;
      let bestScore = -100;
      
      for (const item of candidates) {
        const itemLower = item.schemeName.toLowerCase();
        let score = 0;
        
        // Growth option is heavily preferred
        if (itemLower.includes("growth") || itemLower.includes("-gr ") || itemLower.includes("-gr") || itemLower.endsWith(" gr")) {
          score += 15;
        }
        
        // Regular Plan or Retail Plan is heavily preferred (Direct plan is penalized because user requested Regular)
        if (itemLower.includes("regular") || itemLower.includes("reg plan") || itemLower.includes("-reg") || itemLower.includes("retail")) {
          score += 30;
        }
        
        if (itemLower.includes("direct")) {
          score -= 50; // heavily penalize direct since user expects regular plans!
        }
        
        // Match terms
        const queryTerms = cleanSearchQuery.toLowerCase().split(" ");
        let termMatches = 0;
        for (const term of queryTerms) {
          if (term.length > 1 && itemLower.includes(term)) {
            termMatches++;
          }
        }
        score += termMatches * 5;
        
        if (score > bestScore) {
          bestScore = score;
          bestMatch = item;
        }
      }
      
      const finalItem = bestMatch || results[0];
      schemeCodeGlobalCache[normalized] = String(finalItem.schemeCode);
      return String(finalItem.schemeCode);
    }
  } catch (err) {
    console.warn("Recoverable: Error searching scheme code of " + fundName, err);
  }
  schemeCodeGlobalCache[normalized] = null;
  return null;
}

/**
 * Retrieves the full raw NAV history of a mutual fund scheme from AMFI.
 */
export async function fetchNavHistory(schemeCode: string): Promise<{ date: string; nav: string }[]> {
  if (navHistoryGlobalCache[schemeCode]) {
    return navHistoryGlobalCache[schemeCode];
  }
  try {
    const url = `https://api.mfapi.in/mf/${schemeCode}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const json = await response.json();
    const data = json.data || [];
    navHistoryGlobalCache[schemeCode] = data;
    return data;
  } catch (err) {
    console.warn("Recoverable: Error fetching NAV history for " + schemeCode, err);
    return [];
  }
}

/**
 * Deterministic helper to generate correct, real conformed fallback metrics 
 * when the public API fails or doesn't list the queried fund. Returning completely
 * empty records to guarantee no fake, mock or illustrative data is ever shown.
 */
export function getFallbackMetrics(fundName: string, asOfDateStr: string): LiveMetrics {
  const inceptionYear = getFundInceptionYear(fundName);
  
  return {
    rolling: ["-", "-", "-", "-", "-"],
    sharpe: "—",
    sortino: "—",
    realLaunchYear: inceptionYear
  };
}

/**
 * Main public entry point: gets live metrics for a fund as of a specific date.
 */
export async function getLiveMetricsForFund(fundName: string, asOfDateStr: string): Promise<LiveMetrics> {
  const cacheKey = `${fundName}::${asOfDateStr}`;
  
  // Check in-memory cache
  if (metricsCache[fundName]?.[asOfDateStr]) {
    return metricsCache[fundName][asOfDateStr];
  }
  
  const schemeCode = await fetchSchemeCode(fundName);
  if (!schemeCode) {
    const fallback = getFallbackMetrics(fundName, asOfDateStr);
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = fallback;
    return fallback;
  }
  
  const navData = await fetchNavHistory(schemeCode);
  if (navData.length === 0) {
    const fallback = getFallbackMetrics(fundName, asOfDateStr);
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = fallback;
    return fallback;
  }
  
  // Parse chronological order for math calculations (the API gives newest-first)
  // Let's copy and reverse it to make time progression natural (past to pre)
  const sortedNavData = [...navData].reverse(); // oldest to newest
  
  // Real launch date is the oldest NAV date in history
  const oldestEntry = sortedNavData[0];
  const oldestDate = parseDateStr(oldestEntry.date);
  const realLaunchYear = oldestDate.getFullYear();
  
  // Store dynamically discovered launch year so all helpers can align perfectly
  KNOWN_REAL_LAUNCH_YEARS[fundName] = realLaunchYear;
  
  // Find the NAV "as of" date selected by the user
  // Let's standardise the date string (e.g. DD-MM-YYYY vs DD-MMM-YYYY)
  // The selected dates in app are like "26-Dec-2025"
  // Let's map target date strings
  let asOfDate = new Date(); // default is current date
  if (asOfDateStr) {
    const parts = asOfDateStr.split('-');
    if (parts.length === 3) {
      // Map Month strings like Dec to numbers
      const monthMap: Record<string, number> = {
        "Jan": 0, "Feb": 1, "Mar": 2, "Apr": 3, "May": 4, "Jun": 5,
        "Jul": 6, "Aug": 7, "Sep": 8, "Oct": 9, "Nov": 10, "Dec": 11
      };
      const monthStr = parts[1];
      const mVal = isNaN(Number(monthStr)) ? (monthMap[monthStr] ?? 0) : (parseInt(monthStr) - 1);
      const dVal = parseInt(parts[0]);
      const yVal = parseInt(parts[2]);
      asOfDate = new Date(yVal, mVal, dVal);
    }
  }
  
  // RECONCILE LAUNCH DATE & April 3, 2006 Cutoff:
  const AMFI_CUTOFF_DATE = new Date(2006, 3, 3); // 03-Apr-2006
  const inceptionYear = getFundInceptionYear(fundName);

  if (asOfDate.getTime() < AMFI_CUTOFF_DATE.getTime()) {
    const blindReturns: LiveMetrics = {
      rolling: ["-", "-", "-", "-", "-"],
      sharpe: "—",
      sortino: "—",
      realLaunchYear: inceptionYear
    };
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = blindReturns;
    return blindReturns;
  }
  
  if (asOfDate.getTime() < oldestDate.getTime()) {
    const blindReturns: LiveMetrics = {
      rolling: ["-", "-", "-", "-", "-"],
      sharpe: "—",
      sortino: "—",
      realLaunchYear: realLaunchYear
    };
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = blindReturns;
    return blindReturns;
  }
  
  const currentNavState = findClosestNavEntry(sortedNavData, asOfDate);
  if (!currentNavState.entry || currentNavState.index === -1) {
    const fallback = getFallbackMetrics(fundName, asOfDateStr);
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = fallback;
    return fallback;
  }
  
  const latestNavVal = parseFloat(currentNavState.entry.nav);
  const latestDateIdx = currentNavState.index;
  const latestDateObj = parseDateStr(currentNavState.entry.date);
  
  // Strict pre-launch check: if the target year is before the fund's known inception year, it was not launched yet!
  const targetYear = latestDateObj.getFullYear();
  
  if (targetYear < inceptionYear) {
    const blindReturns: LiveMetrics = {
      rolling: ["-", "-", "-", "-", "-"],
      sharpe: "—",
      sortino: "—",
      realLaunchYear: inceptionYear
    };
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = blindReturns;
    return blindReturns;
  }

  // Calculate CAGR rolling returns
  const periods = [1, 3, 5, 7, 10];
  const rollingReturns = periods.map((years, idx) => {
    const pastTargetDate = new Date(latestDateObj.getFullYear() - years, latestDateObj.getMonth(), latestDateObj.getDate());
    
    // Strict pre-launch block: If target date is before the actual launching date
    if (pastTargetDate.getFullYear() < inceptionYear) {
      return "-";
    }
    
    // Strict cutoff check: if lookback target date is before AMFI April 3, 2006, must show "-"
    if (pastTargetDate.getTime() < AMFI_CUTOFF_DATE.getTime()) {
      return "-";
    }
    
    // If the past target date is before the oldest date in mfapi, must show "-"
    if (pastTargetDate.getTime() < oldestDate.getTime()) {
      return "-";
    }
    
    const pastNavState = findClosestNavEntry(sortedNavData, pastTargetDate);
    if (!pastNavState.entry) {
      return "-";
    }
    
    const pastNavVal = parseFloat(pastNavState.entry.nav);
    if (pastNavVal <= 0 || latestNavVal <= 0) {
      return "-";
    }
    
    const elapsedYears = (latestDateObj.getTime() - parseDateStr(pastNavState.entry.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (elapsedYears < years - 0.5) {
      return "-"; // duration guard
    }
    
    const cagr = (Math.pow(latestNavVal / pastNavVal, 1 / elapsedYears) - 1) * 100;
    return cagr.toFixed(2);
  });
  
  // Calculate risk statistics (using the past 3 years of daily NAV data)
  let sharpeStr = "—";
  let sortinoStr = "—";
  
  const threeYrsAgo = new Date(latestDateObj.getFullYear() - 3, latestDateObj.getMonth(), latestDateObj.getDate());
  
  // Only calculate and display Sharpe/Sortino ratios if fund has been active for at least 3 years and starts after cutoff
  if (threeYrsAgo.getTime() >= oldestDate.getTime() && threeYrsAgo.getTime() >= AMFI_CUTOFF_DATE.getTime()) {
    const startPoint = findClosestNavEntry(sortedNavData, threeYrsAgo);
    if (startPoint.index !== -1 && latestDateIdx > startPoint.index) {
      const activeSl = sortedNavData.slice(startPoint.index, latestDateIdx + 1);
      
      if (activeSl.length > 30) {
        // Calculate daily returns list
        const dailyReturns: number[] = [];
        for (let i = 1; i < activeSl.length; i++) {
          const prevNav = parseFloat(activeSl[i - 1].nav);
          const currNav = parseFloat(activeSl[i].nav);
          if (prevNav > 0) {
            dailyReturns.push((currNav - prevNav) / prevNav);
          }
        }
        
        if (dailyReturns.length > 0) {
          // Average return & Standard Deviation
          const avgDaily = dailyReturns.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
          const variance = dailyReturns.reduce((sum, val) => sum + Math.pow(val - avgDaily, 2), 0) / dailyReturns.length;
          const stdDevDaily = Math.sqrt(variance);
          
          // Annualized metrics
          const annStdDev = stdDevDaily * Math.sqrt(250) * 100; // in percentage
          
          // Use CAGR 3Y return for calculation of excess returns
          const cagr3YStr = rollingReturns[1];
          if (cagr3YStr !== "-") {
            const cagr3Y = parseFloat(cagr3YStr);
            const riskFreeRate = 6.5; // Standard sovereign yield rate
            
            if (annStdDev > 0) {
               const sharpe = (cagr3Y - riskFreeRate) / annStdDev;
               sharpeStr = sharpe.toFixed(2);
            }
            
            // Sortino calculation (downside deviation only)
            const dailyRiskFree = riskFreeRate / 100 / 250;
            const downsideSqrDiffs = dailyReturns.map((r) => {
              const excess = r - dailyRiskFree;
              return excess < 0 ? Math.pow(excess, 2) : 0;
            });
            const downsideVar = downsideSqrDiffs.reduce((sum, val) => sum + val, 0) / dailyReturns.length;
            const downsideDevDaily = Math.sqrt(downsideVar);
            const annDownsideDev = downsideDevDaily * Math.sqrt(250) * 100;
            
            if (annDownsideDev > 0) {
              const sortino = (cagr3Y - riskFreeRate) / annDownsideDev;
              sortinoStr = sortino.toFixed(2);
            }
          }
        }
      }
    }
  }
  
  const finalMetrics: LiveMetrics = {
    rolling: rollingReturns,
    sharpe: sharpeStr,
    sortino: sortinoStr,
    realLaunchYear: realLaunchYear
  };
  
  if (!metricsCache[fundName]) metricsCache[fundName] = {};
  metricsCache[fundName][asOfDateStr] = finalMetrics;
  
  return finalMetrics;
}
