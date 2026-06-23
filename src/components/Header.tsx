/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Logo from './Logo';
import { NavPage } from '../types';
import { Menu, X, Calendar, PhoneCall, Link as LinkIcon, ChevronDown } from 'lucide-react';

interface HeaderProps {
  currentPage: NavPage['id'];
  setCurrentPage: (page: NavPage['id']) => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(
    currentPage === 'calculators' || currentPage === 'knowledge' || currentPage === 'connect'
  );

  const primaryNavigationItems: { id: NavPage['id']; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio-audit', label: 'Free AI Portfolio Auditor' },
    { id: 'find-fund-type', label: 'Free Tool - Find Your Fund Type' },
  ];

  const handleNavClick = (id: NavPage['id']) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isMoreActive = currentPage === 'calculators' || currentPage === 'knowledge' || currentPage === 'connect' || currentPage === 'find-fund' || currentPage === 'overlap-finder';

  return (
    <header className="sticky top-0 z-50 w-full h-[72px] bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        
        {/* Logo at Left */}
        <div 
          onClick={() => handleNavClick('home')} 
          className="cursor-pointer hover:opacity-95 transition-opacity"
          id="hdr-logo-container"
        >
          <Logo />
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6" id="hdr-desktop-nav">
          {primaryNavigationItems.map((item) => {
            const isFundTypeTool = item.id === 'find-fund-type';
            const isAuditTool = item.id === 'portfolio-audit';
            
            if (isAuditTool) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative transition-all duration-200 cursor-pointer px-4 py-1.5 rounded-full border text-[12.5px] font-black tracking-wide ${
                    currentPage === item.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-600/25'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white border-emerald-500 shadow-md shadow-emerald-500/20 hover:scale-[1.03]'
                  }`}
                  id={`nav-btn-${item.id}`}
                >
                  <span className="flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                    ✨ AI Auditor
                  </span>
                </button>
              );
            }

            if (isFundTypeTool) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative transition-all duration-200 cursor-pointer px-4 py-1.5 rounded-full border text-[12.5px] font-black tracking-wide ${
                    currentPage === item.id
                      ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-lg shadow-amber-500/25'
                      : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-550 text-slate-950 border-amber-400 hover:border-amber-500 shadow-md shadow-amber-400/20'
                  }`}
                  id={`nav-btn-${item.id}`}
                >
                  {item.label}
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative py-2 text-[14px] font-semibold tracking-wide transition-colors ${
                  currentPage === item.id 
                    ? 'text-blue-600' 
                    : 'text-slate-550 hover:text-slate-900'
                }`}
                id={`nav-btn-${item.id}`}
              >
                {item.label}
                {currentPage === item.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}

          {/* More Master Tab (Dropdown for Calculators and Knowledge Hub) */}
          <div className="relative group py-2" id="hdr-more-dropdown-container">
            <button
              className={`flex items-center gap-1 py-1.5 text-[14px] font-semibold tracking-wide cursor-pointer transition-all duration-205 focus:outline-none ${
                isMoreActive ? 'text-blue-600' : 'text-slate-550 hover:text-slate-900'
              }`}
            >
              <span>More</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 group-hover:rotate-180 ${
                isMoreActive ? 'text-blue-600' : 'text-slate-400'
              }`} />
              {isMoreActive && (
                <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
              )}
            </button>

            {/* Dropdown Box */}
            <div className="absolute top-full left-0 mt-1.5 w-60 bg-white border border-slate-100 rounded-2xl shadow-xl py-2.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 transform origin-top scale-95 group-hover:scale-100">
              <button
                onClick={() => handleNavClick('calculators')}
                className={`w-full text-left px-4 py-2 text-[13.5px] font-medium transition-colors flex items-center justify-between ${
                  currentPage === 'calculators'
                    ? 'text-blue-600 bg-blue-50/50 font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>Calculators</span>
                {currentPage === 'calculators' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>
              
              <button
                onClick={() => handleNavClick('knowledge')}
                className={`w-full text-left px-4 py-2 text-[13.5px] font-medium transition-colors flex items-center justify-between ${
                  currentPage === 'knowledge'
                    ? 'text-blue-600 bg-blue-50/50 font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>Knowledge Hub</span>
                {currentPage === 'knowledge' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>

              <button
                onClick={() => handleNavClick('connect')}
                className={`w-full text-left px-4 py-2 text-[13.5px] font-medium transition-colors flex items-center justify-between ${
                  currentPage === 'connect'
                    ? 'text-blue-600 bg-blue-50/50 font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <span>Start SIP Now👍🏻✅</span>
                {currentPage === 'connect' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>

              <div className="my-1.5 border-t border-slate-100" />

              <button
                onClick={() => handleNavClick('overlap-finder')}
                className={`w-full text-left px-4 py-2 text-[13.5px] font-medium transition-colors flex items-center justify-between ${
                  currentPage === 'overlap-finder'
                    ? 'text-blue-600 bg-blue-50/50 font-bold'
                    : 'text-slate-600 hover:text-blue-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-amber-550/20 text-amber-800 px-1.5 py-0.5 rounded-md">New</span>
                  <span>Fund Overlap Finder</span>
                </div>
                {currentPage === 'overlap-finder' && <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
              </button>

              <div className="my-1.5 border-t border-slate-100" />

              <button
                onClick={() => handleNavClick('find-fund')}
                className={`w-full text-left px-4 py-2.5 text-[12px] font-bold transition-all flex items-center justify-between ${
                  currentPage === 'find-fund'
                    ? 'bg-slate-100 text-slate-900 border-l-2 border-slate-500'
                    : 'text-slate-500 bg-slate-50/50 hover:bg-slate-100 hover:text-slate-750'
                }`}
              >
                <div className="flex flex-col gap-0.5 max-w-[90%]">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">for Internal Team Use Only</span>
                  <span className="leading-tight break-words font-medium text-slate-650">Free Tool - Exactly Which Funds To Invest</span>
                </div>
                {currentPage === 'find-fund' && <div className="w-1.5 h-1.5 rounded-full bg-slate-500" />}
              </button>
            </div>
          </div>
        </nav>
 
        {/* Call to Action Buttons at top Right */}
        <div className="hidden sm:flex items-center gap-4" id="hdr-actions">
          <a
            href="https://linktr.ee/Purewealthglobal"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-[13px] font-semibold px-5 py-2.5 rounded-full shadow-sm transition-all duration-200 cursor-pointer text-center whitespace-nowrap active:scale-[0.98]"
          >
            <LinkIcon className="w-4 h-4 text-emerald-600" />
            LinkTree
          </a>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex lg:hidden items-center" id="hdr-hamburger">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 focus:outline-none cursor-pointer"
            id="hdr-hamburger-btn"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

      </div>      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 w-full bg-white border-b border-slate-200 shadow-xl max-h-[85vh] overflow-y-auto" id="hdr-mobile-drawer">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
            {primaryNavigationItems.map((item) => {
              const isFundTypeTool = item.id === 'find-fund-type';
              const isAuditTool = item.id === 'portfolio-audit';
              
              if (isAuditTool) {
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`py-3 px-4 text-left text-[14px] font-extrabold rounded-lg transition-all ${
                      currentPage === 'portfolio-audit'
                        ? 'text-white bg-emerald-600 border border-emerald-600/50 shadow-md'
                        : 'text-white bg-gradient-to-r from-emerald-500 to-teal-600 border border-emerald-400 font-black'
                    }`}
                    id={`mobile-nav-btn-${item.id}`}
                  >
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block w-2 h-2 rounded-full bg-white animate-ping"></span>
                      🔥 {item.label}
                    </span>
                  </button>
                );
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`py-3 px-4 text-left text-[14px] font-extrabold rounded-lg transition-all ${
                    isFundTypeTool
                      ? currentPage === 'find-fund-type'
                        ? 'text-slate-950 bg-amber-500 border border-amber-500/50 shadow-md'
                        : 'text-amber-955 bg-amber-400/20 border border-amber-400/45 text-amber-900 font-black'
                      : currentPage === item.id 
                        ? 'text-blue-700 bg-blue-50' 
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  id={`mobile-nav-btn-${item.id}`}
                >
                  {isFundTypeTool ? `🔥 ${item.label}` : item.label}
                </button>
              );
            })}

            {/* Mobile More Accordion */}
            <div className="border border-slate-100 rounded-lg overflow-hidden bg-slate-50/40">
              <button
                type="button"
                onClick={() => setMobileMoreOpen(!mobileMoreOpen)}
                className={`w-full py-3 px-4 flex items-center justify-between text-[14px] font-bold transition-all text-left ${
                  isMoreActive ? 'text-blue-700 bg-blue-50/50' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>More Services & Tools</span>
                <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${mobileMoreOpen ? 'rotate-180 text-blue-600' : 'text-slate-400'}`} />
              </button>

              {mobileMoreOpen && (
                <div className="pl-4 pr-2 py-1.5 space-y-1 border-t border-slate-100 bg-white">
                  <button
                    onClick={() => handleNavClick('calculators')}
                    className={`w-full py-2.5 px-4 text-left text-[13.5px] font-semibold rounded-lg transition-all ${
                      currentPage === 'calculators'
                        ? 'text-blue-700 bg-blue-50/80'
                        : 'text-slate-655 hover:bg-slate-50'
                    }`}
                  >
                    📈 Financial Calculators
                  </button>
                  <button
                    onClick={() => handleNavClick('knowledge')}
                    className={`w-full py-2.5 px-4 text-left text-[13.5px] font-semibold rounded-lg transition-all ${
                      currentPage === 'knowledge'
                        ? 'text-blue-700 bg-blue-50/80'
                        : 'text-slate-655 hover:bg-slate-50'
                    }`}
                  >
                    📚 Knowledge Hub
                  </button>
                  <button
                    onClick={() => handleNavClick('connect')}
                    className={`w-full py-2.5 px-4 text-left text-[13.5px] font-semibold rounded-lg transition-all ${
                      currentPage === 'connect'
                        ? 'text-blue-700 bg-blue-50/80'
                        : 'text-slate-655 hover:bg-slate-50'
                    }`}
                  >
                    📅 Start SIP Now👍🏻✅
                  </button>

                  <button
                    onClick={() => handleNavClick('overlap-finder')}
                    className={`w-full py-2.5 px-4 text-left text-[13.5px] font-semibold rounded-lg transition-all flex items-center justify-between ${
                      currentPage === 'overlap-finder'
                        ? 'text-blue-700 bg-blue-50/80 font-bold'
                        : 'text-slate-650 hover:bg-slate-55'
                    }`}
                  >
                    <span>🔍 Fund Overlap Finder</span>
                    <span className="text-[9px] font-extrabold uppercase bg-amber-500/15 text-amber-800 px-1.5 py-0.5 rounded">New</span>
                  </button>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={() => handleNavClick('find-fund')}
                    className={`w-full py-2.5 px-4 text-left text-[12.5px] font-medium rounded-lg transition-all mt-1.5 border ${
                      currentPage === 'find-fund'
                        ? 'text-slate-800 bg-slate-100 border-slate-300 shadow-sm'
                        : 'text-slate-500 bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">for Internal Team Use Only</span>
                      <span>Free Tool - Exactly Which Funds To Invest</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
              <a
                href="https://linktr.ee/Purewealthglobal"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-6 py-3.5 rounded-full text-[14px] font-semibold shadow-sm transition-all active:scale-[0.98]"
              >
                <LinkIcon className="w-4.5 h-4.5 text-emerald-600" />
                LinkTree
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
