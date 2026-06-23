/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AlertCircle, PhoneCall, CheckCircle2, Calendar, Shield, Sparkles, Check, ArrowRight } from 'lucide-react';
import { AMFI_ARN_DETAILS } from '../data';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface ConnectViewProps {
  setCurrentPage: (page: any) => void;
}

const ALL_TIME_SLOTS = [
  { value: "09:00 AM - 11:05 AM", label: "Morning (09:00 AM - 11:00 AM)", startHour: 9.0 },
  { value: "11:00 AM - 01:00 PM", label: "Morning (11:00 AM - 01:00 PM)", startHour: 11.0 },
  { value: "01:00 PM - 03:00 PM", label: "Afternoon (01:00 PM - 03:00 PM)", startHour: 13.0 },
  { value: "03:00 PM - 05:00 PM", label: "Afternoon (03:00 PM - 05:00 PM)", startHour: 15.0 },
  { value: "05:00 PM - 07:05 PM", label: "Evening (05:00 PM - 07:00 PM)", startHour: 17.0 },
  { value: "07:00 PM - 08:30 PM", label: "Night (07:00 PM - 08:30 PM)", startHour: 19.0 },
  { value: "08:30 PM - 09:30 PM", label: "Night (08:30 PM - 09:30 PM)", startHour: 20.5 },
];

export default function ConnectView({ setCurrentPage }: ConnectViewProps) {
  const [callName, setCallName] = useState('');
  const [callMobile, setCallMobile] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [callDate, setCallDate] = useState(() => getLocalDateString());
  const [callTime, setCallTime] = useState('');
  const [formError, setFormError] = useState('');

  const getFilteredTimeSlots = () => {
    const isToday = callDate === getLocalDateString();
    if (!isToday) {
      return ALL_TIME_SLOTS;
    }
    const d = new Date();
    const currentHourDecimal = d.getHours() + (d.getMinutes() / 60);
    return ALL_TIME_SLOTS.filter(slot => slot.startHour > currentHourDecimal);
  };

  const filteredSlots = getFilteredTimeSlots();

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!callName.trim() || !callMobile.trim()) {
      setFormError('Please enter your Name and Contact Number');
      return;
    }
    setFormError('');
    setFormSuccess(true);

    const whatsappMsg = encodeURIComponent(
      `Hi! I would like to schedule a secure onboarding call with a PW Consultant to start SIP setup.\n\n` +
      `• Name: ${callName}\n` +
      `• Mobile: ${callMobile}\n` +
      `• Preferred Date: ${callDate}\n` +
      `• Preferred Time Slot: ${callTime || 'Flexible ASAP'}\n\n` +
      `Verify my database calibration configurations and prepare my systematic mutual fund onboarding. Thank you!`
    );
    window.open(`https://wa.me/917718860398?text=${whatsappMsg}`, '_blank');
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="connect-container">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        {/* Header Summary for Start SIP Now */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            Execution Gateways
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl md:text-4xl text-slate-900 mt-5 tracking-tight leading-tight">
            Start Your Systematic Investment Plan (SIP) Now 👍🏻✅
          </h2>
          <p className="text-slate-600 mt-3 text-[14.5px] sm:text-[15.5px] leading-relaxed">
            Select your preferred execution channel below. You can deploy capital directly online via our integrated technology platform, or request a certified expert to prepare your onboarding records securely.
          </p>
          
          {/* Encouraging Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-5 text-[12.5px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              100% Digital & Secure
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Verified Distributor Code
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100/30">
              ⚡ AMFI - ARN {AMFI_ARN_DETAILS.arnNumber} Reference
            </span>
          </div>
        </div>

        {/* Dynamic 2-Option Card Split Grid matching the execution step */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch pt-2 mb-16" id="execution-split-channels">
          
          {/* Option 1: Direct self-investing via technological partner */}
          <div className="bg-white rounded-[24px] border border-slate-200 p-6 sm:p-8 flex flex-col justify-between shadow-lg hover:border-blue-200 hover:shadow-xl transition-all relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[64px] opacity-10 pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-50 p-3 rounded-xl border border-blue-100">
                  <Sparkles className="w-5.5 h-5.5 text-blue-700" />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono tracking-wider text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded uppercase font-black">Option 1 • Instant Deployment</span>
                  <h3 className="text-lg font-black font-sans text-slate-900 mt-1">Start Investing Directly</h3>
                </div>
              </div>

              <p className="text-[13px] text-slate-600 leading-relaxed">
                Ready to deploy your capital? Use our integrated technology platform via <strong>Angel One</strong> to begin your regular Monthly SIP or standard Lumpsum placement now.
              </p>

              <div className="space-y-2.5 pt-4 text-xs font-medium text-slate-700">
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Instant secure account integration</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Direct execution link mapping to chosen asset subclasses</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No paperwork, no complex compliance pipelines</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Zero onboarding fees or auxiliary setup charges</span>
                </div>
              </div>
            </div>

            <div className="pt-8">
              <a
                href="https://a.aonelink.in/ANGOne/SakbsEc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-xl transition-all hover:shadow-lg hover:shadow-blue-600/10 active:scale-95 cursor-pointer text-center"
              >
                <span>Activate & Invest Directly Online 👍🏻✅</span>
                <ArrowRight className="w-4 h-4 shrink-0" />
              </a>
              <p className="text-[10px] text-slate-400 text-center mt-2.5 leading-normal">
                Secure digital checkout via authorized financial networks.
              </p>
            </div>
          </div>

          {/* Option 2: Request Support / Callback */}
          <div className="bg-[#0B1528] rounded-[24px] border border-slate-800 p-6 sm:p-8 flex flex-col justify-between shadow-xl text-white relative overflow-hidden text-left">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[64px] opacity-15 pointer-events-none" />
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <div className="bg-[#1C2C4E] p-3 rounded-xl border border-slate-700/30">
                  <PhoneCall className="w-5.5 h-5.5 text-blue-400" />
                </div>
                <div>
                  <span className="text-[9.5px] font-mono tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded uppercase font-black">Option 2 • Request Support</span>
                  <h3 className="text-lg font-black font-sans text-white mt-1">Request Private Calibration Callback</h3>
                </div>
              </div>

              <p className="text-[13px] text-slate-400 leading-relaxed">
                Need parameter validation? Have our certified advisors construct your onboarding accounts securely at your exact requested schedule. Zero cold spam.
              </p>

              <form onSubmit={handleSupportSubmit} className="space-y-3.5 pt-2">
                {/* Input Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">Your Name</span>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. John Doe"
                      value={callName}
                      onChange={(e) => setCallName(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-lg border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">Contact Number</span>
                    <input 
                      type="tel" 
                      required
                      placeholder="10-Digit Mobile"
                      value={callMobile}
                      onChange={(e) => setCallMobile(e.target.value)}
                      className="w-full text-xs px-3.5 py-3 rounded-lg border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans"
                    />
                  </div>
                </div>

                {/* DateTime Slot Selector */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">Preferred Date</span>
                    <input 
                      type="date" 
                      required
                      value={callDate}
                      min={getLocalDateString()}
                      onChange={(e) => {
                        setCallDate(e.target.value);
                        setCallTime('');
                      }}
                      className="w-full text-xs px-3.5 py-3 rounded-lg border border-slate-800 bg-[#121927] text-white focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 block uppercase">Preferred Time Slot</span>
                    <div className="relative">
                      <select
                        value={callTime}
                        onChange={(e) => setCallTime(e.target.value)}
                        className="w-full text-xs px-3.5 py-3 pr-8 rounded-lg border border-slate-800 bg-[#121927] text-white appearance-none focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all font-sans cursor-pointer"
                      >
                        {filteredSlots.length === 0 ? (
                          <option value="Flexible ASAP">Call me ASAP (Flexible Time)</option>
                        ) : (
                          <>
                            <option value="">Choose slot</option>
                            <option value="Flexible ASAP">Flexible / Call me ASAP</option>
                            {filteredSlots.map(slot => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {callDate === getLocalDateString() && filteredSlots.length === 0 && (
                  <div className="text-[11.5px] text-amber-500 bg-amber-500/10 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2.5 mt-1">
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="text-slate-300 leading-normal">
                      All specific slots for today have passed. Select tomorrow for active slots, or choose "Call me ASAP".
                    </span>
                  </div>
                )}

                {formError && (
                  <p className="text-red-400 text-xs font-semibold">{formError}</p>
                )}

                {/* Secure Trust Indicators */}
                <div className="bg-[#050A14] border border-[#1E2E4A]/30 rounded-xl p-3.5 space-y-2 text-[11px] text-slate-350 leading-relaxed mt-2">
                  <div className="flex gap-2 items-start text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>100% Secure Guarantee:</strong> Data seen strictly by your wealth manager.</span>
                  </div>
                  <div className="flex gap-2 items-start text-xs text-slate-400">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong>No-Spam Policy:</strong> Direct callback with AMFI Registered Distributor specialist.</span>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full flex items-center justify-center py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans cursor-pointer transition-all duration-150 shadow-md active:scale-[0.98] mt-3"
                >
                  Confirm Slot & Connect on WhatsApp
                </button>
              </form>
            </div>
          </div>

        </div>

        {/* Promo banner for Profiler */}
        <div className="mt-8">
          <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={3} />
        </div>

      </div>
    </div>
  );
}
