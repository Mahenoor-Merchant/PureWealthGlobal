/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Fingerprint, RefreshCcw, Landmark, Scale, ShieldCheck } from 'lucide-react';
import { AMFI_ARN_DETAILS } from '../data';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface PrivacyViewProps {
  setCurrentPage: (page: any) => void;
}

export default function PrivacyView({ setCurrentPage }: PrivacyViewProps) {
  return (
    <div className="bg-[#F8FAFC] min-h-screen font-sans" id="privacy-disclaimer-view">
      
      {/* Banner Hero */}
      <section className="bg-slate-950 text-white py-16 px-4 relative overflow-hidden" id="privacy-hero">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.12),transparent_50%)]" />
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <span className="text-blue-400 bg-blue-400/10 border border-blue-400/25 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider">
            Legal & Compliance Vault
          </span>
          <h1 className="font-display font-bold text-3xl sm:text-[45px] leading-tight text-white mt-4 tracking-tight">
            Privacy Policy & Regulatory Disclaimers
          </h1>
          <p className="text-slate-405 text-slate-300 max-w-2xl mx-auto mt-4 text-[13.5px] sm:text-[15.5px] leading-relaxed">
            Please review the legal frameworks, data protection parameters, risk disclosures, and AMFI codes governing the Pure Wealth Global consulting and distribution services.
          </p>
        </div>
      </section>

      <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={1} />

      {/* Main Core Disclosures Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-left space-y-12" id="privacy-details">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Main Legal Clauses (Left) - Restyled with clean bento containers */}
          <div className="lg:col-span-8 space-y-10 bg-white border border-slate-100 p-6 sm:p-10 rounded-3xl shadow-xs">
            
            {/* Clause 1: Data protection */}
            <div className="space-y-3.5">
              <h3 className="text-[17.5px] font-bold text-slate-900 flex items-center gap-2">
                <Landmark className="w-5 h-5 text-blue-600 shrink-0" />
                1. Information Collection & Client KYC Alignment
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                When you register your details in our "Bespoke Portfolio Intake Profiling" systems, we record identifying information including human names, email coordinates, telephone channels, country of origin, and investment capacities. 
              </p>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                In compliance with the Securities and Exchange Board of India (SEBI) and Prevention of Money Laundering Act (PMLA), all investments processed through Pure Wealth Global require complete regulatory KYC validations (Central KYC Registry/KRA). We do not directly store or hold password credentials or personal banking transaction databases on this app's client-side layers.
              </p>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Clause 2: Cookie and tracking */}
            <div className="space-y-3.5">
              <h3 className="text-[17.5px] font-bold text-slate-900 flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-blue-600 shrink-0" />
                2. Data Integrity & Global Storage Practices
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                Your shared information is processed in modern, firewalled systems and is never rented or marketed to third-party institutions for profiling. Data is exclusively utilized by our internal AMFI certified consultants to curate custom financial allocations and issue quarterly rebalancing reviews. For NRI investors, communications adhere to the data privacy laws of their regional settlements (such as DIFC guidelines in UAE, GDPR in European jurisdictions).
              </p>
            </div>

            <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={2} />

            <div className="h-px bg-slate-100" />

            {/* Clause 3: Trailing disclosures */}
            <div className="space-y-3.5">
              <h3 className="text-[17.5px] font-bold text-slate-900 flex items-center gap-2">
                <RefreshCcw className="w-5 h-5 text-blue-600 shrink-0" />
                3. Commissions Disclosure under AMFI Rules
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                As per SEBI guidelines, we declare that Pure Wealth Global acts solely as an independent Mutual Fund Distributor holding active registration <strong>ARN-{AMFI_ARN_DETAILS.arnNumber}</strong>. We receive trailing commissions based on historic and persistent asset holdings in distributed schemes from associated Asset Management Companies (AMCs). 
              </p>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                 trailing commission schedules range typically between <strong>0.25% to 1.50% per annum</strong> of the daily net assets under management, depending on asset categories (Equity funds vs Cash/Debt equivalents). Investors can obtain the exact trailing commission sheet for any specific AMC before placing allocations.
              </p>
            </div>

            <div className="h-px bg-slate-100" />

            {/* Clause 4: Portfolio Allocation & Calculation Boundaries */}
            <div className="space-y-3.5">
              <h3 className="text-[17.5px] font-bold text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600 shrink-0" />
                4. Portfolio Modeling & Calculation Boundaries
              </h3>
              <p className="text-[13.5px] text-slate-600 leading-relaxed">
                While we strive for absolute accuracy, historical performance statistics of filters and models are subject to corporate reporting delays of underlying listed companies. Our quarterly balance sheet evaluation represents factual disclosures of targets' last declared financial audits. Any accidental breach of risk thresholds of holding companies discovered will trigger rebalancing proposals. Allocation amounts computed through our calculators are estimates designed to assist investors in voluntary asset allocation, and carry no regulatory guarantee.
              </p>
            </div>

          </div>

          {/* Core Highlights Frame (Right) */}
          <div className="lg:col-span-4 space-y-6">
            
            <div className="bg-white border border-slate-150 p-6 rounded-2xl text-left space-y-4 shadow-sm">
              <ShieldAlert className="w-8 h-8 text-amber-500" />
              <h4 className="font-display font-semibold text-[15px] text-slate-950">Regulatory Risk Warning</h4>
              <p className="text-[12px] text-slate-550 leading-relaxed">
                <strong>MUTUAL FUND INVESTMENTS ARE SUBJECT TO MARKET RISKS. READ ALL SCHEME RELATED DOCUMENTS CAREFULLY.</strong>
              </p>
              <p className="text-[11.5px] text-slate-450 leading-relaxed text-slate-500">
                Consultation parameters represent distributor insights and do not signify promised performance yields. Past results may not dictate futuristic returns. Equity markets are prone to cyclic fluctuations.
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 text-white p-6 rounded-2xl text-left space-y-4 shadow-md">
              <ShieldCheck className="w-8 h-8 text-blue-400" />
              <h4 className="font-display font-semibold text-[15px]">Active Registration Status</h4>
              <div className="text-[11.5px] space-y-2 text-slate-350 font-mono">
                <p>Distributor: <span className="font-bold text-white">Pure Wealth Global</span></p>
                <p>Register Code: <span className="font-bold text-white">ARN-{AMFI_ARN_DETAILS.arnNumber}</span></p>
                <p>Validity: <span className="font-bold text-white">{AMFI_ARN_DETAILS.validity}</span></p>
                <p>Ecosystem: <span className="font-bold text-white">AMFI Registered Desk</span></p>
              </div>
            </div>

          </div>

        </div>

      </section>

      <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={3} />

    </div>
  );
}
