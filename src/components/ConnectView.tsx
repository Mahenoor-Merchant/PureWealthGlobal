/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building, AlertCircle, PhoneCall, CheckCircle2 } from 'lucide-react';
import { AMFI_ARN_DETAILS } from '../data';

export default function ConnectView() {
  const [callName, setCallName] = useState('');
  const [callMobile, setCallMobile] = useState('');
  const [formError, setFormError] = useState('');

  const whatsappMsg = encodeURIComponent(`Hi! I would like to get a call from a certified consultant in 30 mins.\n\nName: ${callName}\nMobile: ${callMobile}`);
  const whatsappLink = `https://wa.me/917718860398?text=${whatsappMsg}`;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="connect-container">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        {/* Header Summary */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            Secure Consultations
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
            Schedule a Portfolio Consultation Session
          </h2>
          <p className="text-slate-600 mt-3 text-[14.5px] sm:text-[15.5px]">
            Book a direct, live appointment below. No complex double-entry forms or redundant profiling surveys required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Premium Instructions & Support info */}
          <div className="lg:col-span-4 flex flex-col space-y-6">
            
            {/* Quick Call Box */}
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[64px] -mr-10 -mt-10 opacity-30 relative z-0 transition-opacity duration-700 group-hover:opacity-40"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-blue-500/20 p-2.5 rounded-xl shrink-0">
                  <PhoneCall className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="font-display font-bold text-[18px] text-white leading-tight">
                  Would You Like to Get a Call from a Certified Consultant in 30 Mins?
                </h3>
              </div>
              
              <div className="space-y-3.5 relative z-10 pt-1">
                <input 
                  type="text" 
                  placeholder="Name" 
                  value={callName}
                  onChange={(e) => setCallName(e.target.value)}
                  className="w-full text-[13.5px] px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <input 
                  type="tel" 
                  placeholder="Mobile Number" 
                  value={callMobile}
                  onChange={(e) => setCallMobile(e.target.value)}
                  className="w-full text-[13.5px] px-4 py-3 rounded-xl border border-slate-700 bg-slate-800/80 text-white placeholder-slate-400 focus:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                {formError && (
                  <p className="text-red-400 text-[12px] font-medium">{formError}</p>
                )}
                <a 
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => {
                    if (!callName.trim() || !callMobile.trim()) {
                      e.preventDefault();
                      setFormError('Please enter both your name and mobile number.');
                    } else {
                      setFormError('');
                    }
                  }}
                  className="w-full flex justify-center py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[13.5px] font-bold cursor-pointer transition-colors mt-2 shadow-sm shadow-blue-500/20 active:scale-[0.98]"
                >
                  Yes, Call Me
                </a>
              </div>
            </div>

            {/* Dedicated WhatsApp Card Option */}
            <div className="bg-white border border-[#25D366]/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4.5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/5 rounded-full blur-[32px] -mr-6 -mt-6"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-[#25D366]/10 p-2.5 rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.022-.008-1.15-.567-1.321-.63-.171-.064-.296-.096-.42.096-.124.192-.482.607-.59.728-.108.12-.216.136-.437.026a8.11 8.11 0 0 1-2.732-1.684c-1.025-.914-1.717-2.043-1.918-2.388-.201-.345-.021-.531.15-.701.153-.153.342-.4.513-.6.171-.2.228-.34.341-.567.114-.228.057-.427-.028-.597-.085-.17-.791-2.13-1.082-2.83-.284-.683-.573-.591-.785-.601-.202-.009-.434-.01-.667-.01-.233 0-.612.087-.932.434-.32.348-1.22 1.192-1.22 2.91 0 1.717 1.25 3.376 1.427 3.614.178.238 2.457 3.752 5.952 5.26.83.359 1.48.574 1.986.734.835.265 1.595.228 2.196.138.67-.101 2.057-.84 2.348-1.652.29-.813.29-1.507.204-1.653-.086-.145-.316-.233-.531-.345zM12 2C6.477 2 2 6.477 2 12a9.96 9.96 0 0 0 2.622 6.779l-1.722 5.035 5.234-1.693A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.962 7.962 0 0 1-4.062-1.114l-.291-.173-3.024.978.995-2.916-.19-.303A7.957 7.957 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[15.5px] text-slate-900 leading-tight">
                    Connect on WhatsApp Directly
                  </h3>
                  <p className="text-[12.5px] text-slate-500 mt-1 leading-normal">
                    Chat with us instantly for queries regarding investment options, NRI assistance, or advisory sessions.
                  </p>
                </div>
              </div>

              <a 
                href="https://wa.me/917718860398?text=Hi!%20I%20would%20like%20to%20get%20in%20touch%20with%20Pure%20Wealth%20Global%20Investment%20Solutions%20for%20a%20portfolio%20consultation."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-[13.5px] font-bold cursor-pointer transition-colors shadow-sm shadow-[#25D366]/20 active:scale-[0.98]"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.022-.008-1.15-.567-1.321-.63-.171-.064-.296-.096-.42.096-.124.192-.482.607-.59.728-.108.12-.216.136-.437.026a8.11 8.11 0 0 1-2.732-1.684c-1.025-.914-1.717-2.043-1.918-2.388-.201-.345-.021-.531.15-.701.153-.153.342-.4.513-.6.171-.2.228-.34.341-.567.114-.228.057-.427-.028-.597-.085-.17-.791-2.13-1.082-2.83-.284-.683-.573-.591-.785-.601-.202-.009-.434-.01-.667-.01-.233 0-.612.087-.932.434-.32.348-1.22 1.192-1.22 2.91 0 1.717 1.25 3.376 1.427 3.614.178.238 2.457 3.752 5.952 5.26.83.359 1.48.574 1.986.734.835.265 1.595.228 2.196.138.67-.101 2.057-.84 2.348-1.652.29-.813.29-1.507.204-1.653-.086-.145-.316-.233-.531-.345zM12 2C6.477 2 2 6.477 2 12a9.96 9.96 0 0 0 2.622 6.779l-1.722 5.035 5.234-1.693A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.962 7.962 0 0 1-4.062-1.114l-.291-.173-3.024.978.995-2.916-.19-.303A7.957 7.957 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                </svg>
                Connect on WhatsApp
              </a>
            </div>

            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 flex-1">
              <div>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-wider">
                  Booking Guidelines
                </span>
                <h3 className="text-[18px] font-bold text-slate-900 mt-3 select-none">
                  Instant Verification
                </h3>
                <p className="text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                  We value your time. We have eliminated intermediate questionnaire stages to make booking quick and frictionless:
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">Choose Your Slot</h4>
                    <p className="text-[11.5px] text-slate-450 text-slate-500">Pick any available date and timezone direct on the calendar.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">Identify Yourself Once</h4>
                    <p className="text-[11.5px] text-slate-450 text-slate-500">Fill your contact coordinates solely inside the secure Google widget.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-mono text-[11px] font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">Receive Direct Coordinates</h4>
                    <p className="text-[11.5px] text-slate-450 text-slate-500">A secure video coordination link is fired instantly to your address.</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Regulatory Compliance</span>
                <p className="text-[11.5px] text-slate-550 text-slate-500 leading-normal">
                  All mutual fund distributions are strictly governed under official AMFI registration credentials <strong>(ARN-{AMFI_ARN_DETAILS.arnNumber})</strong>.
                </p>
              </div>
            </div>

            {/* Address & Direct Phone Card */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs text-left space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4.5 h-4.5 text-blue-600" />
                <h4 className="font-display font-medium text-[14px] text-slate-900">Headquarters Secretariat</h4>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                F-Wing, 18th Floor, Capital Towers,<br />
                Bandra Kurla Complex (BKC), Mumbai, India
              </p>
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[11.5px] text-slate-550">
                <span className="text-slate-400">Direct Helpline:</span>
                <a href="tel:+917718860398" className="hover:text-blue-600 font-bold font-mono text-[12px] text-slate-800">+91 7718860398</a>
              </div>
            </div>

          </div>

          {/* Right Column: Embedded Google Calendar Scheduler (Premium Slate Card layout) */}
          <div className="lg:col-span-8 bg-slate-950 text-white border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6 flex flex-col h-full min-h-[620px]">
            
            <div className="space-y-1.5 border-b border-slate-900 pb-4">
              <span className="text-[10.5px] text-blue-400 font-mono font-bold uppercase tracking-wider">Live Scheduler Terminal</span>
              <h3 className="font-display font-medium text-[19px] text-white">Direct Live Appointment Booking</h3>
              <p className="text-[11.5px] text-slate-400 leading-relaxed">
                We have integrated our live reservation system directly. Choose your preferred day and time below to immediately confirm your secure Zoom consultation.
              </p>
            </div>

            {/* Embedded Live Google Calendar Iframe */}
            <div className="flex-1 w-full bg-white rounded-2xl overflow-hidden shadow-inner relative group border border-slate-800 min-h-[480px]">
              <iframe
                src="https://calendar.app.google/PYXL2TddCCKk9cZ98"
                className="w-full h-full min-h-[485px] border-0 select-none bg-white"
                title="Pure Wealth Global Live Scheduler"
                id="live-calendar-iframe"
              />
            </div>

            {/* Direct Link Action & Backup instructions */}
            <div className="space-y-3 pt-2">
              <a
                href="https://calendar.app.google/PYXL2TddCCKk9cZ98"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white text-center rounded-xl text-[12.5px] font-bold transition-all cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] duration-150"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-200"></span>
                </span>
                📅 Open in Google Calendar (New Tab)
              </a>

              <div className="flex bg-slate-900/45 border border-slate-900 rounded-lg p-3 gap-2 text-[10.5px] text-slate-400 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>
                  Some privacy-focused browsers might restrict Google widget sign-ins. If the calendar does not load or you want a full-screen experience, click the button above to book in a new tab.
                </span>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
