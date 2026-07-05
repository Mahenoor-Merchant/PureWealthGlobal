/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import Logo from './Logo';
import { NavPage } from '../types';
import { Mail, MapPin, Phone, ShieldCheck, ChevronRight, ArrowUpRight } from 'lucide-react';
import { AMFI_ARN_DETAILS } from '../data';

interface FooterProps {
  setCurrentPage: (page: NavPage['id']) => void;
}

export default function Footer({ setCurrentPage }: FooterProps) {
  const getPageUrl = (id: NavPage['id']): string => {
    switch (id) {
      case 'home': return '/';
      case 'about': return '/#about';
      case 'services': return '/#services';
      case 'calculators': return '/#calculators';
      case 'knowledge': return '/#knowledge/journey';
      case 'connect': return '/#connect';
      case 'privacy': return '/#privacy';
      case 'find-fund-type': return '/findfund';
      case 'overlap-finder': return '/overlap';
      case 'portfolio-audit': return '/audit';
      case 'retirement-calculator': return '/retirement-calculator';
      case 'database-portal': return '/#database';
      case 'find-fund': return '/#find-fund';
      default: return '/';
    }
  };

  const handleLinkClick = (e: React.MouseEvent, id: NavPage['id']) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) {
      return;
    }
    e.preventDefault();
    setCurrentPage(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-950 text-slate-300 border-t border-slate-900 pt-16 pb-8" id="footer-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Footer Hub Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          {/* Column 1: Brand & Credentials */}
          <div className="flex flex-col gap-5 text-left">
            {/* Logo in light mode frame to preserve brand colors */}
            <div className="p-2.5 bg-white rounded-xl w-fit shadow-md">
              <Logo showText={true} />
            </div>
            <p className="text-[13px] leading-relaxed text-slate-400 font-sans">
              Pure Wealth Global is an AMFI Registered Mutual Fund Distributor. We help HNIs and NRIs simplify Mutual Fund investing through global fund options based on your goals, risk & time horizon.
            </p>
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl w-fit">
              <ShieldCheck className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <div className="text-left">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider leading-none font-sans">AMFI Registered Distributor</p>
                <p className="text-[12px] font-mono font-bold text-white mt-1 leading-none animate-pulse">ARN: {AMFI_ARN_DETAILS.arnNumber}</p>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-white text-[13.5px] font-bold tracking-wider uppercase border-l-3 border-blue-600 pl-3">
              Corporate Links
            </h4>
            <ul className="space-y-2.5 text-[13.5px]">
              {[
                { id: 'home', label: 'Home Page' },
                { id: 'about', label: 'About Our Firm' },
                { id: 'services', label: 'Financial Services' },
                { id: 'calculators', label: 'Wealth Calculators' },
                { id: 'knowledge', label: 'Knowledge Hub' },
                { id: 'connect', label: 'Start SIP Now👍🏻✅' },
              ].map((link) => (
                <li key={link.id}>
                  <a
                    href={getPageUrl(link.id as NavPage['id'])}
                    onClick={(e) => handleLinkClick(e, link.id as NavPage['id'])}
                    className="flex items-center gap-1.5 hover:text-blue-400 text-slate-400 transition-colors cursor-pointer text-left font-medium group"
                    title={link.label}
                  >
                    <ChevronRight className="w-3.5 h-3.5 text-slate-700 group-hover:text-blue-500 transition-colors" />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Global Coverage Points */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-white text-[13.5px] font-bold tracking-wider uppercase border-l-3 border-blue-600 pl-3">
              Consulting Focus
            </h4>
            <ul className="space-y-3 text-[13px] text-slate-400">
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span><strong>HNI Bespoke Mandates:</strong> Ultra-personalized asset allocations for high-net-worth families.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span><strong>NRI Strategic Channels:</strong> Tax-optimized mutual funds, ETFs, portfolio planning for NRIs.</span>
              </li>
              <li className="flex items-start gap-2 leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                <span><strong>Tax & Fee Optimization:</strong> Maximum capital retention through high-grade index configurations, debt and gold integrations.</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Pillars */}
          <div className="flex flex-col gap-4 text-left">
            <h4 className="text-white text-[13.5px] font-bold tracking-wider uppercase border-l-3 border-blue-600 pl-3">
              Reach Us Globally
            </h4>
            <ul className="space-y-4 text-[13px] text-slate-300">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4.5 h-4.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-bold text-slate-500 leading-none mb-1">Corporate Board desk</span>
                  <a href="tel:+917718860398" className="hover:text-blue-400 font-mono text-[12.5px]" title="Call Pure Wealth Global Board Desk">+91 7718860398</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <Mail className="w-4.5 h-4.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase font-bold text-slate-500 leading-none mb-1">Secure Inquiries</span>
                  <a href="mailto:connect.pwg@gmail.com" className="hover:text-blue-400 font-mono text-[12.5px]" title="Email Pure Wealth Global Support">connect.pwg@gmail.com</a>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4.5 h-4.5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="flex flex-col text-slate-400 gap-0.5">
                  <span className="text-[11px] uppercase font-bold text-blue-500 mb-1 leading-none">Consulting Presence</span>
                  <span className="text-[12.5px]">Bandra Kurla Complex (BKC), Mumbai, India</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* Regulatory Risk Panel & Legal Disclaimers */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 md:p-6 mb-8 text-[11.5px] leading-relaxed text-slate-400 text-left" id="footer-disclaimers">
          <h5 className="text-white text-[12px] font-bold flex items-center gap-2 mb-2">
            <ShieldCheck className="w-4.5 h-4.5 text-blue-500" />
            Regulatory Disclosures & Mutual Fund Risk Disclaimers
          </h5>
          <p className="mb-2">
            <strong>AMFI Registration Notice:</strong> {AMFI_ARN_DETAILS.disclaimer} Registrations are held in full validity (ARN-{AMFI_ARN_DETAILS.arnNumber}) till {AMFI_ARN_DETAILS.validity}. Performance statistics represented across individual schemes denote historic metrics only and do not signify promised or guaranteed futuristic returns.
          </p>
          <p className="mb-2">
            <strong>Portfolio Consulting Framework:</strong> Asset allocation parameters and ratios are calculated with reference to standard risk models, academic research, and macroeconomic filters. Mutual fund screening utilizes leading global and Indian stock universes to maximize risk-adjusted yields.
          </p>
          <p>
            Investors are advised to consult their certified financial planners, tax experts, and independent faith boards before placing capital in India or global markets. We act solely as a consulting distributor, and do not provide guaranteed-return assurances under any parameters.
          </p>
        </div>

        {/* Bottom copyright and legal document links */}
        <div className="border-t border-slate-900 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12.5px] text-slate-500">
          <p>
            &copy; {currentYear} Pure Wealth Global Private Limited. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <a
              href={getPageUrl('privacy')}
              onClick={(e) => handleLinkClick(e, 'privacy')}
              className="hover:text-blue-400 font-semibold cursor-pointer transition-colors flex items-center gap-1 text-slate-400"
              title="Pure Wealth Global Privacy Policy and Disclaimers"
            >
              Privacy Policy & Disclaimers
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-500" />
            </a>
            <span>|</span>
            <span className="font-mono text-[11px] text-slate-600">SEBI Registered Distributor Desk</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
