/**
 * Live AMFI Mutual Fund Data Engine
 * Fetches real historical daily NAV data from the public api.mfapi.in AMFI aggregator.
 * Computes exact mathematical CAGR rolling returns (1Y, 3Y, 5Y, 7Y, 10Y)
 * and risk-adjusted metrics (Sharpe Ratio, Sortino Ratio) in real-time.
 */

// Scheme code maps for the most popular/flagship funds in the application
const POPULAR_SCHeme_MAPPING: Record<string, string> = {
  "nippon india small cap": "119597", // Direct Growth
  "quant small cap": "120828", // Direct Growth
  "parag parikh flexi cap": "122639", // Direct Growth
  "hdfc top 100": "119062", // Direct Growth
  "sbi bluechip": "119854", // Direct Growth
  "icici prudential bluechip": "119106", // Direct Growth
  "kotak emerging equity": "119313", // Direct Growth
  "axis small cap": "120516", // Direct Growth
  "motilal oswal nasdaq 100": "119330", // Regular Growth or FoF
  "franklin india flexi cap": "119230",
  "sbi magnum midcap": "119850",
  "mirae asset large cap": "119013",
  "hdfc mid-cap opportunities": "119063",
  "mirae asset multicap": "151758", // Real-world ID (Registered in 2023)
  "motilal oswal multi cap": "152431" // Real-world ID (Registered in 2024)
};

export interface LiveMetrics {
  rolling: string[]; // [1Y, 3Y, 5Y, 7Y, 10Y]
  sharpe: string;    // 3Y risk-free adjusted
  sortino: string;   // 3Y downside adjusted
  realLaunchYear: number;
}

// Global cache in sessionStorage of calculated metrics to avoid multiple API calls
const metricsCache: Record<string, Record<string, LiveMetrics>> = {};

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
  
  // 1. Check if we have exact direct mapping
  for (const [key, code] of Object.entries(POPULAR_SCHeme_MAPPING)) {
    if (normalized.includes(key) || key.includes(normalized)) {
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
    if (!response.ok) return null;
    
    interface SearchItem {
      schemeCode: number;
      schemeName: string;
    }
    const results: SearchItem[] = await response.json();
    if (results && results.length > 0) {
      // Find the absolute best match - favor Direct & Growth if mentioned
      let bestMatch = results[0];
      const hasDirect = normalized.includes("direct");
      const hasGrowth = normalized.includes("growth") || normalized.includes("gr");
      
      for (const item of results) {
        const itemLower = item.schemeName.toLowerCase();
        if (hasDirect && itemLower.includes("direct")) {
          if (hasGrowth && itemLower.includes("growth")) {
            return String(item.schemeCode);
          }
          bestMatch = item;
        }
      }
      return String(bestMatch.schemeCode);
    }
  } catch (err) {
    console.error("Error searching scheme code of " + fundName, err);
  }
  return null;
}

/**
 * Retrieves the full raw NAV history of a mutual fund scheme from AMFI.
 */
export async function fetchNavHistory(schemeCode: string): Promise<{ date: string; nav: string }[]> {
  try {
    const url = `https://api.mfapi.in/mf/${schemeCode}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const json = await response.json();
    return json.data || [];
  } catch (err) {
    console.error("Error fetching NAV history for " + schemeCode, err);
    return [];
  }
}

/**
 * Main public entry point: gets live metrics for a fund as of a specific date.
 */
export async function getLiveMetricsForFund(fundName: string, asOfDateStr: string): Promise<LiveMetrics | null> {
  const cacheKey = `${fundName}::${asOfDateStr}`;
  
  // Check in-memory cache
  if (metricsCache[fundName]?.[asOfDateStr]) {
    return metricsCache[fundName][asOfDateStr];
  }
  
  const schemeCode = await fetchSchemeCode(fundName);
  if (!schemeCode) return null;
  
  const navData = await fetchNavHistory(schemeCode);
  if (navData.length === 0) return null;
  
  // Parse chronological order for math calculations (the API gives newest-first)
  // Let's copy and reverse it to make time progression natural (past to pre)
  const sortedNavData = [...navData].reverse(); // oldest to newest
  
  // Real launch date is the oldest NAV date in history
  const oldestEntry = sortedNavData[0];
  const oldestDate = parseDateStr(oldestEntry.date);
  const realLaunchYear = oldestDate.getFullYear();
  
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
  
  const currentNavState = findClosestNavEntry(sortedNavData, asOfDate);
  if (!currentNavState.entry || currentNavState.index === -1) {
    return null;
  }
  
  const latestNavVal = parseFloat(currentNavState.entry.nav);
  const latestDateIdx = currentNavState.index;
  const latestDateObj = parseDateStr(currentNavState.entry.date);
  
  // Check if oldest date is after target date (Meaning fund was not launched yet!)
  if (oldestDate.getTime() > latestDateObj.getTime()) {
    const blindReturns: LiveMetrics = {
      rolling: ["-", "-", "-", "-", "-"],
      sharpe: "—",
      sortino: "—",
      realLaunchYear
    };
    if (!metricsCache[fundName]) metricsCache[fundName] = {};
    metricsCache[fundName][asOfDateStr] = blindReturns;
    return blindReturns;
  }

  // Calculate CAGR rolling returns
  const periods = [1, 3, 5, 7, 10];
  const rollingReturns = periods.map((years) => {
    const pastTargetDate = new Date(latestDateObj.getFullYear() - years, latestDateObj.getMonth(), latestDateObj.getDate());
    
    // Strict pre-launch block: If target date is before the actual launching date
    if (pastTargetDate.getTime() < oldestDate.getTime()) {
      return "-";
    }
    
    const pastNavState = findClosestNavEntry(sortedNavData, pastTargetDate);
    if (!pastNavState.entry) return "-";
    
    const pastNavVal = parseFloat(pastNavState.entry.nav);
    if (pastNavVal <= 0 || latestNavVal <= 0) return "-";
    
    const elapsedYears = (latestDateObj.getTime() - parseDateStr(pastNavState.entry.date).getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    if (elapsedYears < years - 0.5) return "-"; // duration guard
    
    const cagr = (Math.pow(latestNavVal / pastNavVal, 1 / elapsedYears) - 1) * 100;
    return cagr.toFixed(2);
  });
  
  // Calculate risk statistics (using the past 3 years of daily NAV data)
  let sharpeStr = "—";
  let sortinoStr = "—";
  
  const threeYrsAgo = new Date(latestDateObj.getFullYear() - 3, latestDateObj.getMonth(), latestDateObj.getDate());
  
  // Only calculate and display Sharpe/Sortino ratios if fund has been active for at least 3 years
  if (threeYrsAgo.getTime() >= oldestDate.getTime()) {
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
    realLaunchYear
  };
  
  if (!metricsCache[fundName]) metricsCache[fundName] = {};
  metricsCache[fundName][asOfDateStr] = finalMetrics;
  
  return finalMetrics;
}
