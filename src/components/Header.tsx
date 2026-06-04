/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Logo from './Logo';
import { NavPage } from '../types';
import { Menu, X, Calendar, PhoneCall, Link as LinkIcon } from 'lucide-react';

interface HeaderProps {
  currentPage: NavPage['id'];
  setCurrentPage: (page: NavPage['id']) => void;
}

export default function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigationItems: { id: NavPage['id']; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Us' },
    { id: 'services', label: 'Services' },
    { id: 'find-fund', label: 'FREE TOOL - Find Your Fund' },
    { id: 'calculators', label: 'Calculators' },
    { id: 'knowledge', label: 'Knowledge Hub' },
    { id: 'connect', label: 'Connect' },
  ];

  const handleNavClick = (id: NavPage['id']) => {
    setCurrentPage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
        <nav className="hidden lg:flex items-center gap-6" id="hdr-desktop-nav">
          {navigationItems.map((item) => {
            const isFreeTool = item.id === 'find-fund';
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative transition-all duration-200 cursor-pointer ${
                  isFreeTool
                    ? `px-3.5 py-1.5 rounded-full border text-[13px] font-black tracking-wide ${
                        currentPage === 'find-fund'
                          ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md shadow-amber-500/15'
                          : 'bg-amber-400/10 hover:bg-amber-400/20 text-amber-600 hover:text-amber-700 border-amber-500/30 animate-free-tool-pulse'
                      }`
                    : `py-2 text-[14px] font-semibold tracking-wide ${
                        currentPage === item.id 
                          ? 'text-blue-600' 
                          : 'text-slate-550 hover:text-slate-900'
                      }`
                }`}
                id={`nav-btn-${item.id}`}
              >
                {item.label}
                {currentPage === item.id && !isFreeTool && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-blue-600 rounded-full" />
                )}
              </button>
            );
          })}
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
          <button
            onClick={() => handleNavClick('connect')}
            className="flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 text-[13px] font-semibold px-6 py-2.5 rounded-full shadow-sm hover:shadow transition-all duration-200 cursor-pointer text-center whitespace-nowrap active:scale-[0.98]"
            id="hdr-cta-btn"
          >
            <Calendar className="w-4 h-4 text-blue-400" />
            Schedule a Call
          </button>
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

      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 w-full bg-white border-b border-slate-200 shadow-xl" id="hdr-mobile-drawer">
          <div className="px-4 pt-4 pb-6 space-y-2 flex flex-col">
            {navigationItems.map((item) => {
              const isFreeTool = item.id === 'find-fund';
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`py-3 px-4 text-left text-[14px] font-bold rounded-lg transition-all ${
                    isFreeTool
                      ? currentPage === 'find-fund'
                        ? 'text-slate-950 bg-amber-500 border border-amber-500/50 shadow-md'
                        : 'text-amber-700 bg-amber-500/10 border border-amber-500/20 animate-free-tool-pulse'
                      : currentPage === item.id 
                        ? 'text-blue-700 bg-blue-50' 
                        : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  id={`mobile-nav-btn-${item.id}`}
                >
                  {isFreeTool ? `🔥 ${item.label}` : item.label}
                </button>
              );
            })}
            
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
              <button
                onClick={() => handleNavClick('connect')}
                className="w-full flex items-center justify-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 px-6 py-3.5 rounded-full text-[14px] font-semibold shadow-md transition-all active:scale-[0.98]"
                id="mobile-drawer-cta"
              >
                <Calendar className="w-4.5 h-4.5 text-blue-400" />
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
