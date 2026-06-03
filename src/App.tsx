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
import { NavPage } from './types';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage['id']>('home');
  const [pageHistory, setPageHistory] = useState<NavPage['id'][]>([]);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  // Synchronize hash routing on mount and on hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#knowledge')) {
        setCurrentPage('knowledge');
      } else if (hash === '#about') {
        setCurrentPage('about');
      } else if (hash === '#services') {
        setCurrentPage('services');
      } else if (hash === '#calculators') {
        setCurrentPage('calculators');
      } else if (hash === '#connect') {
        setCurrentPage('connect');
      } else if (hash === '#privacy') {
        setCurrentPage('privacy');
      } else if (hash === '#find-fund') {
        setCurrentPage('find-fund');
      } else if (hash === '#home') {
        setCurrentPage('home');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Auto-scrolling to top on route change to guarantee standard page loading behaviour
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as any });
  }, [currentPage]);

  const changePage = (newPage: NavPage['id']) => {
    if (newPage !== currentPage) {
      setPageHistory((prev) => [...prev, currentPage]);
      setCurrentPage(newPage);
      
      // Update hash matching the new route structure
      if (newPage === 'home') {
        window.location.hash = '';
      } else if (newPage === 'knowledge') {
        if (!window.location.hash.startsWith('#knowledge/')) {
          window.location.hash = '#knowledge/journey';
        }
      } else {
        window.location.hash = `#${newPage}`;
      }
    }
  };

  const handleBack = () => {
    if (pageHistory.length > 0) {
      const prev = pageHistory[pageHistory.length - 1];
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
        return <AboutView />;
      case 'services':
        return (
          <ServicesView 
            setCurrentPage={changePage as any} 
            activeServiceId={selectedServiceId} 
            clearActiveService={() => setSelectedServiceId(null)} 
          />
        );
      case 'calculators':
        return <CalculatorsView />;
      case 'knowledge':
        return <KnowledgeHubView setCurrentPage={changePage} />;
      case 'connect':
        return <ConnectView />;
      case 'privacy':
        return <PrivacyView />;
      case 'find-fund':
        return <FindYourFundView setCurrentPage={changePage} />;
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-600 selection:text-white" id="main-app-container">
      {/* Sticky Navigation Header */}
      <Header currentPage={currentPage} setCurrentPage={changePage} />

      {/* Universal Dynamic Back Arrow Navigation bar */}
      {currentPage !== 'home' && (
        <div className="bg-white border-b border-slate-100 py-3.5 px-4 sm:px-6 lg:px-8 shadow-3xs" id="universal-navigation-bar">
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
      <main className="flex-grow">
        {renderActiveView()}
      </main>

      {/* Corporate Compliance Footer */}
      <Footer setCurrentPage={changePage} />
    </div>
  );
}
