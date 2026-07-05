/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function run() {
  // Mock browser globals so that client-only packages like html2pdf.js loaded at module evaluation do not crash inside Node
  global.window = global;
  global.self = global;
  
  Object.defineProperty(global, 'navigator', {
    value: { userAgent: 'node' },
    configurable: true,
    writable: true
  });

  global.document = {
    createElement: () => ({ style: {} }),
    getElementsByTagName: () => [],
    head: { appendChild: () => {} },
  };

  global.location = {
    href: 'https://www.purewealthglobal.com/',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://www.purewealthglobal.com',
  };

  const distPath = path.join(__dirname, 'dist');
  const templatePath = path.join(distPath, 'index.html');
  const ssrBundlePath = path.join(distPath, 'server', 'entry-server.js');

  console.log('--- Initializing Static Site Generation (SSG) Pre-renderer ---');

  // 1. Verify standard client-side build output
  if (!fs.existsSync(templatePath)) {
    console.error('CRITICAL: dist/index.html not found. Ensure standard Vite client build runs first.');
    process.exit(1);
  }
  const template = fs.readFileSync(templatePath, 'utf-8');

  // 2. Verify server-side SSR build output
  if (!fs.existsSync(ssrBundlePath)) {
    console.error('CRITICAL: dist/server/entry-server.js not found. Ensure Vite SSR build runs first.');
    process.exit(1);
  }

  // 3. Dynamic import of SSR module
  const { render } = await import(ssrBundlePath);

  // 4. Define route metadata mapping with fully structured SEO values
  const routes = [
    {
      id: 'home',
      folder: '',
      title: "Pure Wealth Global | Investment in Mutual Funds | Financial Freedom",
      description: "Pure Wealth Global (PWG) | Financial & Retirement Planning | Indian Residents & NRIs | Investing in Indian and Global Mutual Funds | ETFs | REITs | PMS | AIF | SIF | and More",
      keywords: "wealth management, indian mutual funds, mutual fund advisory, nri investment india, portfolio audit, wealth advisor mumbai, bespoke portfolios, custom asset allocation, financial advisor",
      canonical: "https://www.purewealthglobal.com/",
      schema: {
        "@context": "https://schema.org",
        "@type": "FinancialService",
        "name": "Pure Wealth Global",
        "image": "https://www.purewealthglobal.com/favicon.svg",
        "description": "Bespoke wealth management, personalized investment portfolios, and premium mutual fund advisory for Indian Residents and NRI investors.",
        "url": "https://www.purewealthglobal.com/",
        "telephone": "+91-90000-00000",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Bandra Kurla Complex",
          "addressLocality": "Mumbai",
          "addressRegion": "Maharashtra",
          "postalCode": "400051",
          "addressCountry": "IN"
        },
        "priceRange": "$$$"
      }
    },
    {
      id: 'about',
      folder: 'about',
      title: "About Us | Pure Wealth Global | Certified Wealth Managers",
      description: "Meet the professional wealth advisors at Pure Wealth Global. Discover our investment philosophy, commitment to financial growth, and personalized client-first advisory models.",
      keywords: "pure wealth team, investment managers, certified financial planners, mutual fund experts, wealth management philosophy",
      canonical: "https://www.purewealthglobal.com/about",
      schema: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        "name": "About Pure Wealth Global",
        "description": "Meet our team of professional wealth managers and learn about our customer-centric philosophy and wealth management methodologies.",
        "url": "https://www.purewealthglobal.com/about"
      }
    },
    {
      id: 'services',
      folder: 'services',
      title: "Our Services | Comprehensive Wealth Management & Advisory",
      description: "Explore our array of professional financial services: custom mutual fund portfolios, systematic investment planning (SIP), tax-efficient planning, and expert NRI advisory.",
      keywords: "mutual fund services, sip advisory, wealth planning, tax-saving mutual funds, custom wealth solutions, nri portfolio management",
      canonical: "https://www.purewealthglobal.com/services",
      schema: {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": "Bespoke Wealth Management and Advisory Services",
        "provider": {
          "@type": "FinancialService",
          "name": "Pure Wealth Global"
        },
        "serviceType": "Mutual Fund Advisory & Wealth Planning"
      }
    },
    {
      id: 'calculators',
      folder: 'calculators',
      title: "SIP & Lumpsum Calculator | Plan Mutual Fund Investments | Pure Wealth",
      description: "Calculate future returns on your Systematic Investment Plans (SIP) and lumpsum investments with our interactive, accurate Indian Mutual Fund financial calculators.",
      keywords: "sip calculator, lumpsum calculator, mutual fund return calculator, future value calculator, compounding calculator, wealth planner",
      canonical: "https://www.purewealthglobal.com/calculators",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Pure Wealth SIP and Lumpsum Investment Calculator",
        "operatingSystem": "All",
        "applicationCategory": "FinancialApplication",
        "description": "An interactive tool to calculate compound interest, SIP growth, and lumpsum financial projections.",
        "browserRequirements": "Requires JavaScript. Requires HTML5."
      }
    },
    {
      id: 'knowledge',
      folder: 'knowledge',
      title: "Mutual Fund Guide & Types | Educational Investment Hub | Pure Wealth",
      description: "Learn the fundamentals of Mutual Funds in India. Comprehensive breakdown of Equity, Debt, Hybrid, Index, Sectoral, and ELSS Tax-Saving Mutual Funds to make smart investment decisions.",
      keywords: "types of mutual funds, equity mutual funds, debt funds, sectoral funds, tax-saving elss, dynamic asset allocation, investment guide",
      canonical: "https://www.purewealthglobal.com/knowledge",
      schema: {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": "A Complete Guide to Types of Mutual Funds in India",
        "description": "Comprehensive guide detailing Equity, Debt, Hybrid, Index, Sectoral, and ELSS Tax-Saving Mutual Funds for beginners and advanced investors.",
        "inLanguage": "en",
        "author": {
          "@type": "Organization",
          "name": "Pure Wealth Global"
        }
      }
    },
    {
      id: 'connect',
      folder: 'connect',
      title: "Book an Appointment | Premium Wealth Consultation | Pure Wealth",
      description: "Schedule a high-touch advisory session with our expert wealth managers to review your portfolio, plan your goals, and structure your long-term wealth strategy.",
      keywords: "wealth advisory appointment, financial planning call, portfolio consultation, contact wealth manager",
      canonical: "https://www.purewealthglobal.com/connect",
      schema: {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Connect with Pure Wealth Advisory",
        "description": "Contact options and meeting appointment booking form for bespoke wealth and investment consultation.",
        "url": "https://www.purewealthglobal.com/connect"
      }
    },
    {
      id: 'privacy',
      folder: 'privacy',
      title: "Privacy Policy | Pure Wealth Global",
      description: "Learn how Pure Wealth Global handles and protects your personal financial data, CAS statement uploads, and investment preferences securely.",
      keywords: "privacy policy, data security, portfolio safety, financial compliance",
      canonical: "https://www.purewealthglobal.com/privacy",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Privacy Policy"
      }
    },
    {
      id: 'portfolio-audit',
      folder: 'audit',
      title: "AI Portfolio Auditor & Review | Upload CAS Statement PDF | Pure Wealth",
      description: "Upload your Indian Mutual Fund CAS (Consolidated Account Statement) PDF securely. Our advanced AI Auditor reviews asset allocation, checks stock overlap, evaluates expense ratios, and identifies key optimization actions.",
      keywords: "ai portfolio auditor, cas statement analyzer, mutual fund portfolio review, analyze mutual fund pdf, indian cas statement audit, custom pdf portfolio checker",
      canonical: "https://www.purewealthglobal.com/audit",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "AI Portfolio Auditor",
        "operatingSystem": "All",
        "applicationCategory": "FinancialApplication",
        "description": "Bespoke AI auditor for Indian Mutual Fund CAS PDF statements."
      }
    },
    {
      id: 'retirement-calculator',
      folder: 'retirement-calculator',
      title: "Retirement Calculator & Wealth Planner | Secure Your Future | Pure Wealth",
      description: "Plan your retirement corpus, estimate inflation-adjusted living expenses, and calculate the monthly savings required to achieve full financial independence.",
      keywords: "retirement calculator, corpus planner, financial independence calculator, fire planner, inflation-adjusted retirement savings",
      canonical: "https://www.purewealthglobal.com/retirement-calculator",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Retirement Calculator and Wealth Planner",
        "operatingSystem": "All",
        "applicationCategory": "FinancialApplication",
        "description": "Calculate inflation-adjusted retirement savings goals."
      }
    },
    {
      id: 'find-fund-type',
      folder: 'findfund',
      title: "Mutual Fund Profiler & Recommendation Survey | Pure Wealth Global",
      description: "Take our personalized 3-minute financial profiler survey. Get tailored asset allocation strategies and mutual fund recommendation categories based on your risk profile.",
      keywords: "mutual fund recommend, investment profiler, financial survey, risk capacity test, personalized asset allocation",
      canonical: "https://www.purewealthglobal.com/findfund",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Pure Wealth Personalized Fund Profiler",
        "operatingSystem": "All",
        "applicationCategory": "FinancialApplication",
        "description": "Interactive risk profiling and asset allocation analysis tool."
      }
    },
    {
      id: 'overlap-finder',
      folder: 'overlap',
      title: "Portfolio Overlap Finder | Mutual Fund Diversification Tool | Pure Wealth",
      description: "Analyze mutual fund portfolio overlap. Identify duplicate stock holdings across different mutual funds to prevent over-concentration and maximize portfolio diversification.",
      keywords: "portfolio overlap finder, mutual fund overlap analyzer, diversification check, portfolio consolidation, duplicate stocks check",
      canonical: "https://www.purewealthglobal.com/overlap",
      schema: {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Portfolio Overlap Finder",
        "operatingSystem": "All",
        "applicationCategory": "FinancialApplication",
        "description": "Check duplicate equity holdings across Indian mutual fund portfolios."
      }
    },
  ];
 
   console.log(`Discovered ${routes.length} paths to pre-render dynamically.`);
 
   for (const route of routes) {
     try {
       console.log(`Pre-rendering route: /${route.folder || ''} (${route.id})...`);
       
       // Execute the SSR build-time render to get the raw HTML string
       const appHtml = render(route.id);
 
       // We dynamically build clean meta tags inside <head> for search engines & preview bots
       const metaTags = `
     <title>${route.title}</title>
     <meta name="description" content="${route.description}" />
     <meta name="keywords" content="${route.keywords}" />
     <meta name="robots" content="index, follow" />
     <meta name="author" content="Pure Wealth Global (PWG) | ARN 306022" />
     <meta name="publisher" content="Pure Wealth Global (PWG) | ARN 306022" />
     <link rel="canonical" href="${route.canonical}" />
     <meta property="og:title" content="${route.title}" />
     <meta property="og:description" content="${route.description}" />
     <meta property="og:url" content="${route.canonical}" />
     <meta property="og:type" content="website" />
     <meta property="og:site_name" content="Pure Wealth Global" />
     <meta property="og:image" content="https://www.purewealthglobal.com/favicon.svg" />
     ${route.schema ? `<script type="application/ld+json" id="jsonld-schema">${JSON.stringify(route.schema)}</script>` : ''}
   `;
 
       // First replace canonical and title with our enhanced SEO blocks
       let renderedHtml = template.replace(
         /<link rel="canonical" href="https:\/\/www\.purewealthglobal\.com\/" \/>\s*<title>Pure Wealth Global<\/title>/i,
         metaTags.trim()
       );
 
       // Second, inject the server-rendered HTML into the root div
       renderedHtml = renderedHtml.replace(
         '<div id="root"></div>',
         `<div id="root">${appHtml}</div>`
       );

      // Set target path
      const targetDir = route.folder ? path.join(distPath, route.folder) : distPath;
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const targetFile = path.join(targetDir, 'index.html');
      fs.writeFileSync(targetFile, renderedHtml, 'utf-8');
      console.log(`Successfully generated static page: ${targetFile}`);
    } catch (err) {
      console.error(`ERROR: Failed to pre-render route "${route.id}":`, err);
    }
  }

  // 5. Clean up temporary SSR bundle to keep production container footprint minimal
  try {
    fs.rmSync(path.join(distPath, 'server'), { recursive: true, force: true });
    console.log('Cleaned up temporary server-build SSR directory successfully.');
  } catch (err) {
    console.warn('Notice: Non-blocking cleanup of temporary SSR directory omitted:', err.message);
  }

  console.log('--- Static Site Generation (SSG) Pre-rendering Complete! ---');
}

run().catch((err) => {
  console.error('Fatal pre-rendering error:', err);
  process.exit(1);
});
