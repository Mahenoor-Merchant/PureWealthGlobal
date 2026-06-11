/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { SERVICES_DATA } from '../data';
import { CheckCircle, ShieldAlert, Award, ArrowUpRight, HelpCircle } from 'lucide-react';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface ServicesViewProps {
  setCurrentPage: (page: any) => void;
  activeServiceId?: string | null;
  clearActiveService?: () => void;
}

export default function ServicesView({ setCurrentPage, activeServiceId, clearActiveService }: ServicesViewProps) {
  
  useEffect(() => {
    if (activeServiceId) {
      const element = document.getElementById(activeServiceId);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [activeServiceId]);

  const handleConnectTrigger = () => {
    setCurrentPage('connect');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans" id="services-view-container">
      
      {/* 1. Header Hero Panel */}
      <section className="bg-slate-950 text-white py-16 px-4 relative overflow-hidden" id="services-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(59,130,246,0.12),transparent_60%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-blue-400 bg-blue-400/10 border border-blue-400/25 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Elite Consulting & Distribution
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-[45px] leading-tight text-white mt-4 tracking-tight">
            Comprehensive Financial Architectures
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto mt-4 text-[14px] sm:text-[16px] leading-relaxed font-sans">
            Explore personalized, structured solutions designed for asset protection and clean growth in Indian and global markets.
          </p>
        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={1} />

      {/* 2. Bento Services Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" id="services-grid">
        <div className="space-y-12">
          {SERVICES_DATA.map((service, index) => {
            const isEven = index % 2 === 0;
            const isSelected = service.id === activeServiceId;
            return (
              <React.Fragment key={service.id}>
                <div 
                  id={service.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center border p-6 sm:p-10 rounded-3xl transition-all duration-500 ${
                    isSelected 
                      ? 'border-blue-550 ring-4 ring-blue-500/15 bg-blue-50/[0.15] scale-[1.01] shadow-md' 
                      : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-sm shadow-xs'
                  } ${isEven ? '' : 'lg:flex-row-reverse'}`}
                >
                  
                  {/* Text Context */}
                  <div className={`lg:col-span-7 text-left space-y-6 ${isEven ? 'lg:order-1' : 'lg:order-2'}`}>
                    
                    <div className="space-y-1">
                      <span className="text-blue-700 font-mono text-[11.5px] uppercase font-bold tracking-wider bg-blue-50 px-2.5 py-1 rounded">
                        {service.subtitle}
                      </span>
                      <h3 className="font-display font-bold text-2xl sm:text-2.5xl text-slate-900 tracking-tight mt-3">
                        {service.title}
                      </h3>
                    </div>

                    <p className="text-slate-650 text-[14.5px] leading-relaxed">
                      {service.description}
                    </p>

                    <div className="space-y-3">
                      {service.features.map((feature, fidx) => (
                        <div key={fidx} className="flex items-start gap-2.5 text-[13.5px] text-slate-650">
                          <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleConnectTrigger}
                      className="inline-flex items-center gap-2 bg-[#0F172A] text-white hover:bg-slate-800 text-[13px] font-semibold px-6 py-2.5 rounded-full shadow-sm transition-all duration-150 cursor-pointer text-center whitespace-nowrap active:scale-[0.98]"
                    >
                      Select this Service
                      <ArrowUpRight className="w-4 h-4 text-blue-400" />
                    </button>

                  </div>

                  {/* Visual Graphics Board */}
                  <div className={`lg:col-span-4 h-full ${isEven ? 'lg:order-2' : 'lg:order-1'}`}>
                    <div className={`relative h-64 rounded-2xl bg-gradient-to-tr ${service.bgPattern} border border-slate-100 flex flex-col justify-center items-center p-6 space-y-4 shadow-xs overflow-hidden`}>
                      
                      {/* Floating ambient shape */}
                      <div className="absolute top-10 right-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl" />
                      
                      {service.id === 'srv-1' && (
                        <div className="text-center space-y-3 z-10 w-full px-4">
                          <span className="text-blue-800 bg-blue-50 border border-blue-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide">Optimized Asset Pool</span>
                          <div className="flex flex-wrap gap-1.5 justify-center mt-2.5">
                            {['HDFC Flexi', 'ICICI Multi-Asset', 'Nippon BeES', 'NASDAQ 100'].map((item, idx) => (
                              <span key={idx} className="bg-white border border-slate-100 text-slate-850 text-[10.5px] font-mono px-2 py-1 rounded shadow-xs font-semibold">
                                {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {service.id === 'srv-2' && (
                        <div className="text-center space-y-3 z-10 font-sans">
                          <span className="text-sky-850 bg-sky-50 border border-sky-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide">NRI Liaison Matrix</span>
                          <div className="grid grid-cols-2 gap-1.5 max-w-[200px] mx-auto mt-2.5 text-[10px] font-mono">
                            <span className="bg-white border border-slate-100 px-2 py-1.5 text-center rounded shadow-xs font-medium">NRE Channel</span>
                            <span className="bg-white border border-slate-100 px-2 py-1.5 text-center rounded shadow-xs font-medium">NRO Ordinary</span>
                            <span className="bg-white border border-slate-100 px-2 py-1.5 text-center rounded shadow-xs font-medium">DTAA Safe</span>
                            <span className="bg-white border border-slate-100 px-2 py-1.5 text-center rounded shadow-xs font-medium">PIS Route</span>
                          </div>
                        </div>
                      )}

                      {service.id === 'srv-3' && (
                        <div className="text-center space-y-3 z-10 w-full px-4">
                          <span className="text-amber-850 bg-amber-50 border border-amber-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide">Goal Calibration</span>
                          <div className="flex flex-col gap-1 w-48 mx-auto mt-2 bg-white border border-slate-100 p-3 rounded-xl shadow-xs">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600 w-3/4 rounded-full" />
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold mt-1">Education Target: 75% met</span>
                          </div>
                        </div>
                      )}

                      {service.id === 'srv-4' && (
                        <div className="text-center space-y-3 z-10 w-full px-4">
                          <span className="text-rose-850 bg-rose-50 border border-rose-100 px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide">Strategic Safeguards & Audits</span>
                          <div className="bg-white border border-slate-100 p-3.5 rounded-xl text-left text-[11px] font-mono max-w-[220px] mx-auto shadow-xs space-y-1">
                            <p className="text-slate-500">Corporate Quality Score: <strong className="text-teal-600">92/100</strong></p>
                            <p className="text-slate-500">Tax optimization: <strong className="text-slate-800">DTAA Audited</strong></p>
                            <p className="text-slate-500">Capital Gains: <strong className="text-blue-600">Tracked</strong></p>
                          </div>
                        </div>
                      )}

                    </div>
                  </div>

                </div>
                {index === 1 && (
                  <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={2} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </section>

      {/* 3. Disclaimers for Distributorship Mutual Funds */}
      <section className="bg-white py-16 border-t border-slate-100" id="distribution-commission">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-6">
          <div className="flex gap-3 text-amber-900 bg-amber-50 rounded-2xl p-6 border border-amber-100 items-start">
            <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5 text-amber-600" />
            <div>
              <h5 className="font-bold text-[14.5px]">Mutual Fund Distributorship Disclosure Notice</h5>
              <p className="text-[12.5px] leading-relaxed mt-1 text-amber-800">
                In compliance with SEBI and AMFI distributors disclosure guidelines: Pure Wealth Global acts as an AMFI registered distributor, and we earn trailing commission from mutual fund asset management companies (AMCs) for distributing and coordinating assets. Commencing client onboarding, full schematic trailing commission sheets across associated AMCs are made transparently available to investors. No upfront registration consultation fees are levied on individual scheme investments.
              </p>
            </div>
          </div>
        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={3} />

    </div>
  );
}
