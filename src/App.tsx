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
