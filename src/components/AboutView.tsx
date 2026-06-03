/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Target, ShieldCheck, Lightbulb, Heart, Eye, BookOpen, CheckCircle, Clock } from 'lucide-react';
import { AMFI_ARN_DETAILS } from '../data';

export default function AboutView() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans" id="about-us-container">
      
      {/* 1. Header Banner */}
      <section className="bg-slate-950 text-white py-16 px-4 relative overflow-hidden" id="about-hero">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.1),transparent_65%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-blue-400 bg-blue-400/10 border border-blue-400/25 px-4 py-1.5 rounded-full text-[11.5px] font-bold uppercase tracking-widest">
            Institutional Heritage
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-[45px] leading-tight text-white mt-4 tracking-tight">
            Redefining Wealth, Honoring Values
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-[14px] sm:text-[16px] leading-relaxed">
            Pure Wealth Global stands at the intersection of competitive financial compounding and uncompromised ethical standards for HNIs & NRIs.
          </p>
        </div>
      </section>

      {/* 2. Core Corporate Mission Statement */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="corporate-purpose">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-6 text-left space-y-6">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 tracking-tight leading-snug">
              India's Trust-Centered Boutique Consulting Firm for Wealth Management
            </h2>
            
            <p className="text-slate-600 text-[14.5px] leading-relaxed">
              Founded to fill a vital vacuum in the premium wealth ecosystem, Pure Wealth Global helps families channel capital into fully compliant, certified global vehicles. As an <strong>AMFI registered ARN Holder</strong>, we operate with maximum regulatory oversight under Indian and international capital parameters.
            </p>

            <p className="text-slate-600 text-[14.5px] leading-relaxed">
              We understand that HNIs and NRIs require sophisticated, diversified asset plans. We eliminate the friction of overseas capital routing, tax reporting, and spiritual balance reconciliations by acting as your dedicated consulting and distribution agency.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="flex gap-2 text-[13px] text-slate-600 items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>Quarterly board certifications</span>
              </div>
              <div className="flex gap-2 text-[13px] text-slate-600 items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>Asset-backed, high-conviction portfolios</span>
              </div>
              <div className="flex gap-2 text-[13px] text-slate-600 items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>100% Digital client channels</span>
              </div>
              <div className="flex gap-2 text-[13px] text-slate-600 items-start">
                <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <span>Certified AMFI-ARN distributor compliance</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pb-6">
            
            {/* Box 1: Client-First */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-left space-y-4 shadow-sm hover:border-blue-100/80 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 animate-pulse">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-[17.5px] text-slate-900">Client-First Alignment</h3>
              <p className="text-[13px] text-slate-550 leading-relaxed font-sans">
                Every investment choice or plan we illustrate maps perfectly to your long-term success. No corporate benchmarks, no biased pushing—just absolute interest alignment with you.
              </p>
            </div>

            {/* Box 2: Transparency */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-left space-y-4 shadow-sm hover:border-blue-100/80 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-[17.5px] text-slate-900">Genuine Transparency</h3>
              <p className="text-[13px] text-slate-550 leading-relaxed font-sans">
                No hidden brokerage kickbacks, zero exit-load surprises, and 100% upfront commissions disclosure. Expect complete clarity on every single rupee or dollar you invest.
              </p>
            </div>

            {/* Box 3: Discipline */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-left space-y-4 shadow-sm hover:border-blue-100/80 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Lightbulb className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-[17.5px] text-slate-900">Rigorous Discipline</h3>
              <p className="text-[13px] text-slate-550 leading-relaxed font-sans">
                Defeating market noise, option gambling, and emotional panic through our objective, stress-tested screening mechanism to grow key capital steadily.
              </p>
            </div>

            {/* Box 4: Empathy */}
            <div className="bg-white border border-slate-100 p-6 rounded-2xl text-left space-y-4 shadow-sm hover:border-blue-100/80 transition-all">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="font-display font-bold text-[17.5px] text-slate-900">Empathetic Consultation</h3>
              <p className="text-[13px] text-slate-550 leading-relaxed font-sans">
                We respect the hard-earned struggle behind building your capital. We handle your family or corporate wealth with human care, direct support, and clear communication.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. The Regulatory Distributorship Status (AMFI) */}
      <section className="bg-white py-16 border-y border-slate-100" id="regulatory-distributorship">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left">
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-8 sm:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-6">
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-bold font-mono text-[11px] uppercase tracking-wider px-3.5 py-1.5 rounded">
                Official Distributorship Licensing Status
              </div>
              
              <h2 className="font-display font-bold text-2.5xl sm:text-3xl text-slate-950 tracking-tight leading-snug">
                Verified AMFI Registration Details
              </h2>
              
              <p className="text-slate-600 text-[14px] leading-relaxed">
                Legitimate wealth management is rooted in regulatory transparency. Pure Wealth Global operates as a qualified and registered Mutual Fund Distributor with the <strong>Association of Mutual Funds in India (AMFI)</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[13px] font-mono">
                <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                  <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-1">Registration Identifier</span>
                  <strong className="text-slate-900 text-[15.5px]">ARN - {AMFI_ARN_DETAILS.arnNumber}</strong>
                </div>
                <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-xs">
                  <span className="text-slate-400 block text-[10.5px] uppercase font-bold tracking-wider mb-1">Holder Validation Entity</span>
                  <strong className="text-slate-900 text-[14.5px]">{AMFI_ARN_DETAILS.holderName}</strong>
                </div>
              </div>

              <div className="text-[12.5px] text-slate-500 leading-relaxed border-t border-slate-200 pt-5 flex gap-2">
                <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                <span>
                  Our registrations are held in complete active standing in capital distribution registers. Pure Wealth Global serves exclusively as a professional distributor, offering premium, non-discretionary consulting on mutual funds, equities, and global assets.
                </span>
              </div>
            </div>

            <div className="lg:col-span-4 bg-slate-900 text-white rounded-2xl p-6 shadow-md space-y-4 border border-slate-800">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <h4 className="font-display font-semibold text-[17.5px]">AMFI Code of Conduct</h4>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                We stringently comply with the AMFI Code of Conduct and transparency guidelines:
              </p>
              <ul className="space-y-2 text-[11px] text-slate-300">
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Transparent representation of historical returns without guarantee declarations</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Clear full-disclosure of distribution commission details upon request</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Prohibition of high-risk speculative model templates without profile alignment</span>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Strategic Guidance & Investment Committee */}
      <section className="py-20 bg-[#F8FAFC]" id="governance-board">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
              Strategic Consulting
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
              Strategic Portfolio & Guidance Committee
            </h2>
            <p className="text-slate-600 mt-3 text-[14.5px] sm:text-[15.5px]">
              We execute our modeling and asset allocation curation utilizing robust research frameworks verified by seasoned global market experts.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            
            <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-4 shadow-sm hover:border-blue-100/50 transition-colors">
              <span className="text-[34px] font-display font-medium text-blue-600 block leading-none">01</span>
              <h4 className="font-display font-bold text-[18px] text-slate-900">Dr. Habib Al-Sayed, Ph.D.</h4>
              <p className="text-blue-600 text-[12.5px] font-semibold">Global Macro Strategist</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Holding a Ph.D. in Macroeconomics from London, Dr. Habib consults with international asset managers on global capital flows, asset allocation guidelines, and high-net-worth portfolio structures in Dubai and Singapore.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-4 shadow-sm hover:border-blue-100/50 transition-colors">
              <span className="text-[34px] font-display font-medium text-blue-600 block leading-none">02</span>
              <h4 className="font-display font-bold text-[18px] text-slate-900">Siddharth Mehta, CA</h4>
              <p className="text-blue-600 text-[12.5px] font-semibold">Valuation & Risk Auditor</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                Mehta directs the Indian valuation and corporate audit desk, checking corporate balance sheets, debt-to-equity structures, and cash flow margins of BSE and NSE listed entities.
              </p>
            </div>

            <div className="bg-white border border-slate-100 p-8 rounded-2xl space-y-4 shadow-sm hover:border-blue-100/50 transition-colors">
              <span className="text-[34px] font-display font-medium text-blue-600 block leading-none">03</span>
              <h4 className="font-display font-bold text-[18px] text-slate-900">Prof. Imran Farooqui, CFA</h4>
              <p className="text-blue-600 text-[12.5px] font-semibold">Strategic Portfolio Consultant, India Desk</p>
              <p className="text-[13px] text-slate-600 leading-relaxed">
                As a chartered financial analyst in Mumbai, Imran governs domestic mutual fund clearances, designing tax-efficient capital strategies and guiding on rebalancing ratios.
              </p>
            </div>

          </div>

        </div>
      </section>

    </div>
  );
}
