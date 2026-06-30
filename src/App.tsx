/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import ServicesView from './components/ServicesView';
import CalculatorsView from './components/CalculatorsView';
import KnowledgeHubView from './components/KnowledgeHubView';
import ConnectView from './components/ConnectView';
import PrivacyView from './components/PrivacyView';
import FindYourFundView from './components/FindYourFundView';
import FindFundTypeView from './components/FindFundTypeView';
import PortfolioOverlapFinder from './components/PortfolioOverlapFinder';
import PortfolioAuditor from './components/PortfolioAuditor';
import DatabasePortalView from './components/DatabasePortalView';
import InvestmentStartupPopup from './components/InvestmentStartupPopup';
import PasswordDialog from './components/PasswordDialog';
import { NavPage, SharedSurveyData } from './types';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage['id']>('home');
  const [pageHistory, setPageHistory] = useState<NavPage['id'][]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Synchronized survey data for both tools
  const [surveyData, setSurveyData] = useState<SharedSurveyData>({
    capitalType: 'SIP',
    capitalAmount: 15000,
    inflowStability: 'Stable',
    timeHorizon: '3-5',
    goal: 'Wealth',
    withdrawalNeeds: 'No',
    riskCapacity: 'Moderate',
    marketShock: 'DoNothing',
    burdenLevel: 'Moderate',
    objective: 'Growth',
    dividendMode: 'Reinvest',
    shariahOnly: false,
  });

  const [autoShowFundResults, setAutoShowFundResults] = useState(false);

  // Popup states for after user fetches/calibrates funds
  const [fundsFetched, setFundsFetched] = useState(false);
  const [hasPopupBeenShown, setHasPopupBeenShown] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [pendingPage, setPendingPage] = useState<NavPage['id'] | null>(null);
  const [isDbPasswordDialogOpen, setIsDbPasswordDialogOpen] = useState(false);

  // Synchronize path and hash routing on mount and on history navigation changes
  useEffect(() => {
    const handleRouteSync = () => {
      const pathname = window.location.pathname.toLowerCase().replace(/\/$/, ""); // Normalize trailing slashes
      const hash = window.location.hash;

      // Prioritize hash routing so that hash-based pages can be opened regardless of the current path
      if (hash.startsWith('#knowledge')) {
        setCurrentPage('knowledge');
      } else if (hash === '#about') {
        setCurrentPage('about');
      } else if (hash === '#services') {
        setCurrentPage('services');
      } else if (hash === '#calculators') {
        setCurrentPage('calculators');
      } else if (hash === '#retirement-calculator' || hash === '#retirement') {
        setCurrentPage('retirement-calculator');
      } else if (hash === '#connect') {
        setCurrentPage('connect');
      } else if (hash === '#privacy') {
        setCurrentPage('privacy');
      } else if (hash === '#find-fund') {
        setCurrentPage('find-fund');
      } else if (hash === '#find-fund-type' || hash === '#findfund') {
        setCurrentPage('find-fund-type');
      } else if (hash === '#overlap-finder' || hash === '#overlap') {
        setCurrentPage('overlap-finder');
      } else if (hash === '#portfolio-audit' || hash === '#audit') {
        setCurrentPage('portfolio-audit');
      } else if (hash === '#database-portal' || hash === '#database') {
        setCurrentPage('home');
        setIsDbPasswordDialogOpen(true);
      } else if (hash === '#home') {
        setCurrentPage('home');
      } else {
        // Fallback to path routing if there is no matching hash
        if (pathname === '/overlap' || pathname === '/overlap-finder') {
          setCurrentPage('overlap-finder');
        } else if (pathname === '/findfund' || pathname === '/find-fund-type') {
          setCurrentPage('find-fund-type');
        } else if (pathname === '/audit' || pathname === '/portfolio-audit') {
          setCurrentPage('portfolio-audit');
        } else if (pathname === '/database' || pathname === '/database-portal') {
          setCurrentPage('home');
          setIsDbPasswordDialogOpen(true);
        } else if (pathname === '/retirement-calculator' || pathname === '/retirement') {
          setCurrentPage('retirement-calculator');
        } else if (pathname === '' || pathname === '/') {
          setCurrentPage('home');
        }
      }
    };

    handleRouteSync();
    window.addEventListener('hashchange', handleRouteSync);
    window.addEventListener('popstate', handleRouteSync);
    return () => {
      window.removeEventListener('hashchange', handleRouteSync);
      window.removeEventListener('popstate', handleRouteSync);
    };
  }, []);

  // Exit intent & Webpage close prevention hook
  useEffect(() => {
    if (currentPage !== 'find-fund' || !fundsFetched || hasPopupBeenShown) return;

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY < 30) {
        setIsPopupOpen(true);
        setHasPopupBeenShown(true);
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [currentPage, fundsFetched, hasPopupBeenShown]);

  // Auto-scrolling to top on route change to guarantee standard page loading behaviour
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentPage]);

  // Dynamic SEO Meta Tags & Schema Markup synchronization for Search Engines and AI Crawlers
  useEffect(() => {
    const seoData: Record<NavPage['id'], {
      title: string;
      description: string;
      keywords: string;
      canonical: string;
      schema: any;
    }> = {
      home: {
        title: "Pure Wealth Global | Premium Wealth Advisory & Indian Mutual Fund Solutions",
        description: "Pure Wealth Global provides bespoke wealth management, personalized investment portfolios, and premium mutual fund advisory for Indian Residents and NRI investors worldwide.",
        keywords: "wealth management, indian mutual funds, mutual fund advisory, nri investment india, portfolio audit, wealth advisor mumbai, bespoke portfolios, custom asset allocation, financial advisor",
        canonical: "https://purewealth.global/",
        schema: {
          "@context": "https://schema.org",
          "@type": "FinancialService",
          "name": "Pure Wealth Global",
          "image": "https://purewealth.global/favicon.svg",
          "description": "Bespoke wealth management, personalized investment portfolios, and premium mutual fund advisory for Indian Residents and NRI investors.",
          "url": "https://purewealth.global/",
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
      about: {
        title: "About Us | Pure Wealth Global | Certified Wealth Managers",
        description: "Meet the professional wealth advisors at Pure Wealth Global. Discover our investment philosophy, commitment to financial growth, and personalized client-first advisory models.",
        keywords: "pure wealth team, investment managers, certified financial planners, mutual fund experts, wealth management philosophy",
        canonical: "https://purewealth.global/about",
        schema: {
          "@context": "https://schema.org",
          "@type": "AboutPage",
          "name": "About Pure Wealth Global",
          "description": "Meet our team of professional wealth managers and learn about our customer-centric philosophy and wealth management methodologies.",
          "url": "https://purewealth.global/about"
        }
      },
      services: {
        title: "Our Services | Comprehensive Wealth Management & Advisory",
        description: "Explore our array of professional financial services: custom mutual fund portfolios, systematic investment planning (SIP), tax-efficient planning, and expert NRI advisory.",
        keywords: "mutual fund services, sip advisory, wealth planning, tax-saving mutual funds, custom wealth solutions, nri portfolio management",
        canonical: "https://purewealth.global/services",
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
      calculators: {
        title: "SIP & Lumpsum Calculator | Plan Mutual Fund Investments | Pure Wealth",
        description: "Calculate future returns on your Systematic Investment Plans (SIP) and lumpsum investments with our interactive, accurate Indian Mutual Fund financial calculators.",
        keywords: "sip calculator, lumpsum calculator, mutual fund return calculator, future value calculator, compounding calculator, wealth planner",
        canonical: "https://purewealth.global/calculators",
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
      knowledge: {
        title: "Mutual Fund Guide & Types | Educational Investment Hub | Pure Wealth",
        description: "Learn the fundamentals of Mutual Funds in India. Comprehensive breakdown of Equity, Debt, Hybrid, Index, Sectoral, and ELSS Tax-Saving Mutual Funds to make smart investment decisions.",
        keywords: "types of mutual funds, equity mutual funds, debt funds, sectoral funds, tax-saving elss, dynamic asset allocation, investment guide",
        canonical: "https://purewealth.global/knowledge",
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
      connect: {
        title: "Book an Appointment | Premium Wealth Consultation | Pure Wealth",
        description: "Schedule a high-touch advisory session with our expert wealth managers to review your portfolio, plan your goals, and structure your long-term wealth strategy.",
        keywords: "wealth advisory appointment, financial planning call, portfolio consultation, contact wealth manager",
        canonical: "https://purewealth.global/connect",
        schema: {
          "@context": "https://schema.org",
          "@type": "ContactPage",
          "name": "Connect with Pure Wealth Advisory",
          "description": "Contact options and meeting appointment booking form for bespoke wealth and investment consultation.",
          "url": "https://purewealth.global/connect"
        }
      },
      privacy: {
        title: "Privacy Policy | Pure Wealth Global",
        description: "Learn how Pure Wealth Global handles and protects your personal financial data, CAS statement uploads, and investment preferences securely.",
        keywords: "privacy policy, data security, portfolio safety, financial compliance",
        canonical: "https://purewealth.global/privacy",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Privacy Policy"
        }
      },
      'find-fund-type': {
        title: "Mutual Fund Profiler & Recommendation Survey | Pure Wealth Global",
        description: "Take our personalized 3-minute financial profiler survey. Get tailored asset allocation strategies and mutual fund recommendation categories based on your risk profile.",
        keywords: "mutual fund recommend, investment profiler, financial survey, risk capacity test, personalized asset allocation",
        canonical: "https://purewealth.global/findfund",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Pure Wealth Personalized Fund Profiler",
          "operatingSystem": "All",
          "applicationCategory": "FinancialApplication",
          "description": "Interactive risk profiling and asset allocation analysis tool."
        }
      },
      'find-fund': {
        title: "Your Personalized Mutual Fund Categories & Schemes | Pure Wealth",
        description: "Explore the custom-selected, top-rated mutual fund categories curated for your specific time horizon, goals, and risk profile.",
        keywords: "recommended mutual funds, personalized fund portfolio, dynamic asset allocation, elite fund categories",
        canonical: "https://purewealth.global/find-fund",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "Recommended Mutual Fund Solutions"
        }
      },
      'overlap-finder': {
        title: "Portfolio Overlap Finder | Mutual Fund Diversification Tool | Pure Wealth",
        description: "Analyze mutual fund portfolio overlap. Identify duplicate stock holdings across different mutual funds to prevent over-concentration and maximize portfolio diversification.",
        keywords: "portfolio overlap finder, mutual fund overlap analyzer, diversification check, portfolio consolidation, duplicate stocks check",
        canonical: "https://purewealth.global/overlap",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Portfolio Overlap Finder",
          "operatingSystem": "All",
          "applicationCategory": "FinancialApplication",
          "description": "Check duplicate equity holdings across Indian mutual fund portfolios."
        }
      },
      'portfolio-audit': {
        title: "AI Portfolio Auditor & Review | Upload CAS Statement PDF | Pure Wealth",
        description: "Upload your Indian Mutual Fund CAS (Consolidated Account Statement) PDF securely. Our advanced AI Auditor reviews asset allocation, checks stock overlap, evaluates expense ratios, and identifies key optimization actions.",
        keywords: "ai portfolio auditor, cas statement analyzer, mutual fund portfolio review, analyze mutual fund pdf, indian cas statement audit, custom pdf portfolio checker",
        canonical: "https://purewealth.global/audit",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "AI Portfolio Auditor",
          "operatingSystem": "All",
          "applicationCategory": "FinancialApplication",
          "description": "Bespoke AI auditor for Indian Mutual Fund CAS PDF statements."
        }
      },
      'database-portal': {
        title: "CRM Database Portal | Internal Database Administration",
        description: "Internal portal for CRM leads administration, client portfolio reviews, and CAS statement download administration.",
        keywords: "crm, internal administration",
        canonical: "https://purewealth.global/database",
        schema: null
      },
      'retirement-calculator': {
        title: "Retirement Calculator & Wealth Planner | Secure Your Future | Pure Wealth",
        description: "Plan your retirement corpus, estimate inflation-adjusted living expenses, and calculate the monthly savings required to achieve full financial independence.",
        keywords: "retirement calculator, corpus planner, financial independence calculator, fire planner, inflation-adjusted retirement savings",
        canonical: "https://purewealth.global/retirement-calculator",
        schema: {
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Retirement Calculator and Wealth Planner",
          "operatingSystem": "All",
          "applicationCategory": "FinancialApplication",
          "description": "Calculate inflation-adjusted retirement savings goals."
        }
      }
    };

    const currentSeo = seoData[currentPage] || seoData.home;

    // 1. Update Document Title
    document.title = currentSeo.title;

    // 2. Update/Create Description Meta
    let descMeta = document.querySelector('meta[name="description"]');
    if (!descMeta) {
      descMeta = document.createElement('meta');
      descMeta.setAttribute('name', 'description');
      document.head.appendChild(descMeta);
    }
    descMeta.setAttribute('content', currentSeo.description);

    // 3. Update/Create Keywords Meta
    let keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (!keywordsMeta) {
      keywordsMeta = document.createElement('meta');
      keywordsMeta.setAttribute('name', 'keywords');
      document.head.appendChild(keywordsMeta);
    }
    keywordsMeta.setAttribute('content', currentSeo.keywords);

    // 4. Update/Create Canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', currentSeo.canonical);

    // 5. OpenGraph Tags (for rich visual links in social media & AI search links)
    const ogTags = [
      { property: 'og:title', content: currentSeo.title },
      { property: 'og:description', content: currentSeo.description },
      { property: 'og:url', content: currentSeo.canonical },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'Pure Wealth Global' },
      { property: 'og:image', content: 'https://purewealth.global/favicon.svg' }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });

    // 6. JSON-LD Structured Schema.org Markup (Critical for AI Engines like Google Search, Perplexity & Gemini to parse service metadata)
    let schemaScript = document.getElementById('jsonld-schema');
    if (schemaScript) {
      schemaScript.remove();
    }

    if (currentSeo.schema) {
      const script = document.createElement('script');
      script.id = 'jsonld-schema';
      script.type = 'application/ld+json';
      script.innerHTML = JSON.stringify(currentSeo.schema);
      document.head.appendChild(script);
    }
  }, [currentPage]);

  const changePage = (newPage: NavPage['id']) => {
    if (newPage !== currentPage) {
      if (newPage === 'database-portal') {
        setIsDbPasswordDialogOpen(true);
        return;
      }

      // Intercept navigation if they have fetched funds and haven't seen popup yet (except going directly to connect)
      if (currentPage === 'find-fund' && fundsFetched && !hasPopupBeenShown && newPage !== 'connect') {
        setPendingPage(newPage);
        setIsPopupOpen(true);
        setHasPopupBeenShown(true);
        return;
      }

      setPageHistory((prev) => [...prev, currentPage]);
      setCurrentPage(newPage);
      
      // Update browser URL using clean path paths or hash routing fallback
      if (newPage === 'home') {
        window.history.pushState(null, '', '/');
      } else if (newPage === 'overlap-finder') {
        window.history.pushState(null, '', '/overlap');
      } else if (newPage === 'find-fund-type') {
        window.history.pushState(null, '', '/findfund');
      } else if (newPage === 'portfolio-audit') {
        window.history.pushState(null, '', '/audit');
      } else if (newPage === 'retirement-calculator') {
        window.history.pushState(null, '', '/retirement-calculator');
      } else if (newPage === 'knowledge') {
        if (!window.location.hash.startsWith('#knowledge/')) {
          window.history.pushState(null, '', '/#knowledge/journey');
        }
      } else {
        window.history.pushState(null, '', `/#${newPage}`);
      }
    }
  };

  const handleDbPasswordSuccess = () => {
    setIsDbPasswordDialogOpen(false);
    setPageHistory((prev) => [...prev, currentPage]);
    setCurrentPage('database-portal');
    window.history.pushState(null, '', '/database');
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
      
      // Intercept back button if funds fetched
      if (currentPage === 'find-fund' && fundsFetched && !hasPopupBeenShown && prev !== 'connect') {
        setPendingPage(prev);
        setIsPopupOpen(true);
        setHasPopupBeenShown(true);
        return;
      }

      setPageHistory((prevStack) => prevStack.slice(0, -1));
      setCurrentPage(prev);
    } else {
      setCurrentPage('home');
    }
  };

  const renderActiveView = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomeView 
            setCurrentPage={changePage} 
            setSelectedServiceId={setSelectedServiceId} 
          />
        );
      case 'about':
        return <AboutView setCurrentPage={changePage} />;
      case 'services':
        return (
          <ServicesView 
            setCurrentPage={changePage as any} 
            activeServiceId={selectedServiceId} 
            clearActiveService={() => setSelectedServiceId(null)} 
          />
        );
      case 'calculators':
        return <CalculatorsView setCurrentPage={changePage} />;
      case 'retirement-calculator':
        return <CalculatorsView setCurrentPage={changePage} initialTab="retirement" />;
      case 'knowledge':
        return <KnowledgeHubView setCurrentPage={changePage} />;
      case 'connect':
        return <ConnectView setCurrentPage={changePage} />;
      case 'privacy':
        return <PrivacyView setCurrentPage={changePage} />;
      case 'find-fund':
        return (
          <FindYourFundView 
            setCurrentPage={changePage} 
            onFundsFetched={(fetched) => setFundsFetched(fetched)}
            onNewFetch={() => {
              setHasPopupBeenShown(false);
            }}
            triggerPopup={(force = false) => {
              if (force || !hasPopupBeenShown) {
                setIsPopupOpen(true);
                setHasPopupBeenShown(true);
              }
            }}
            surveyData={surveyData}
            setSurveyData={setSurveyData}
            autoShowFundResults={autoShowFundResults}
            onResetAutoShow={() => setAutoShowFundResults(false)}
          />
        );
      case 'find-fund-type':
        return (
          <FindFundTypeView 
            setCurrentPage={changePage} 
            triggerPopup={(force = false) => {
              if (force || !hasPopupBeenShown) {
                setIsPopupOpen(true);
                setHasPopupBeenShown(true);
              }
            }}
            surveyData={surveyData}
            setSurveyData={setSurveyData}
            onTransitionToFindFund={() => {
              setAutoShowFundResults(true);
              changePage('find-fund');
            }}
          />
        );
      case 'overlap-finder':
        return <PortfolioOverlapFinder />;
      case 'portfolio-audit':
        return <PortfolioAuditor />;
      case 'database-portal':
        return <DatabasePortalView />;
      default:
        return (
          <HomeView 
            setCurrentPage={changePage} 
            setSelectedServiceId={setSelectedServiceId} 
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-600 selection:text-white overflow-x-hidden w-full" id="main-app-container">
      {/* Sticky Navigation Header */}
      <Header currentPage={currentPage} setCurrentPage={changePage} />

      {/* Universal Dynamic Back Arrow Navigation bar */}
      {currentPage !== 'home' && (
        <div className="bg-white border-b border-slate-100 py-3.5 px-4 sm:px-6 lg:px-8 shadow-3xs w-full overflow-x-hidden" id="universal-navigation-bar">
          <div className="max-w-7xl mx-auto flex items-center">
            <button 
              onClick={handleBack}
              className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-600 hover:text-slate-900 text-[12px] sm:text-[12.5px] font-semibold py-1.5 px-4 rounded-full transition-all duration-205 cursor-pointer group active:scale-[0.98]"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform text-slate-500 group-hover:text-slate-800" />
              <span>Back (Previous View)</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Main Corporate Divisions Panel */}
      <main className="flex-grow w-full overflow-x-hidden">
        {renderActiveView()}
      </main>

      {/* Startup Investment Guidance Pop-up */}
      <InvestmentStartupPopup
        isOpen={isPopupOpen}
        onClose={() => {
          setIsPopupOpen(false);
          // If they close, we do not let them transition away if they intentionally clicked navigation, 
          // they stay on the page to actually review their funds as the secondary button text indicates.
          // This is fantastic UX since it prompts them for starting investments, and closing it maintains their review focus.
        }}
        onConfirm={() => {
          setIsPopupOpen(false);
          setPendingPage(null);
          changePage('connect');
        }}
      />

      {/* Corporate Compliance Footer */}
      <Footer setCurrentPage={changePage} />

      <PasswordDialog
        isOpen={isDbPasswordDialogOpen}
        onClose={() => setIsDbPasswordDialogOpen(false)}
        onSuccess={handleDbPasswordSuccess}
        title="CRM Database Access Verification"
      />
    </div>
  );
}
