/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Building, AlertCircle, PhoneCall, CheckCircle2, Calendar, Clock, Shield } from 'lucide-react';
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
  { value: "05:00 PM - 07:00 PM", label: "Evening (05:00 PM - 07:00 PM)", startHour: 17.0 },
  { value: "07:00 PM - 08:30 PM", label: "Night (07:00 PM - 08:30 PM)", startHour: 19.0 },
  { value: "08:30 PM - 09:30 PM", label: "Night (08:30 PM - 09:30 PM)", startHour: 20.5 },
];

export default function ConnectView({ setCurrentPage }: ConnectViewProps) {
  const [callName, setCallName] = useState('');
  const [callMobile, setCallMobile] = useState('');

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getNext7Days = () => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date();
      nextDate.setDate(today.getDate() + i);
      list.push(nextDate);
    }
    return list;
  };

  const formatDateValue = (d: Date) => {
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

  const whatsappMsg = encodeURIComponent(
    `Hi! I would like to schedule a consultation call with a certified consultant.\n\n` +
    `Name: ${callName}\n` +
    `Mobile: ${callMobile}\n` +
    `Preferred Date: ${callDate}\n` +
    `Preferred Slot: ${callTime || 'Flexible Time / As soon as possible'}\n\n` +
    `Please call me at my preferred time. Thanks!`
  );
  const whatsappLink = `https://wa.me/917718860398?text=${whatsappMsg}`;

  const directWhatsappMsg = encodeURIComponent("Hi! I would like to get in touch with Pure Wealth Global for a portfolio consultation.");
  const directWhatsappLink = `https://wa.me/917718860398?text=${directWhatsappMsg}`;

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8 font-sans" id="connect-container">
      <div className="max-w-7xl mx-auto animate-fade-in">
        
        {/* Header Summary */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            Secure Consultations
          </span>
          <h2 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl text-slate-900 mt-5 tracking-tight leading-tight">
            Analyze Your Portfolio for <span className="bg-blue-600 text-white font-extrabold text-[85%] px-3 py-0.5 rounded-lg shadow-sm mx-1.5 inline-block tracking-wider uppercase">FREE</span> with Certified Analyst. Book a Call Now
          </h2>
          <p className="text-slate-650 mt-3 text-[14.5px] sm:text-[15.5px] leading-relaxed">
            Book a direct, live <span className="text-blue-600 font-extrabold bg-blue-100/50 px-2 py-0.5 rounded border border-blue-200/40">15-25 mins</span> appointment below. NO Form filling No profiling surveys required.
          </p>
          
          {/* Encouraging Trust Indicators */}
          <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 mt-5 text-[12.5px] font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
              100% Confidential
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              Zero Spam Guarantee
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-full border border-blue-100/30">
              ⚡ Complimentary Support
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Column: Premium Instructions & Support info */}
          <div className="lg:col-span-5 flex flex-col space-y-6">
            
            {/* Quick Call Box styled exactly like the provided screenshot */}
            <div className="bg-[#0B1528] border border-slate-850 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden group text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[64px] -mr-10 -mt-10 opacity-15 relative z-0 pointer-events-none"></div>
              
              <div className="flex items-center gap-3 relative z-10">
                <div className="bg-[#1C2C4E] p-3.5 rounded-xl shrink-0 border border-slate-700/30">
                  <PhoneCall className="w-5.5 h-5.5 text-blue-400" />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 text-[10.5px] font-mono font-bold tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase leading-none">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Zero Spam Guarantee
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 relative z-10 mt-4.5">
                <h3 className="font-display font-medium text-[20px] sm:text-[21px] text-white leading-tight font-sans tracking-tight">
                  Request a Private Callback on your comfortable time
                </h3>
                <p className="text-[12.5px] text-slate-400 leading-relaxed">
                  Connect on your comfortable schedule. Experience a secure, high-integrity advisory discussion with an AMFI-registered specialist.
                </p>
              </div>
              
              <div className="space-y-4 relative z-10 pt-5">
                {/* 2-column Input Grid for Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                      Your Name
                    </label>
                    <input 
                      type="text" 
                      placeholder="Name" 
                      value={callName}
                      onChange={(e) => setCallName(e.target.value)}
                      className="w-full text-[13.5px] px-4 py-3 rounded-xl border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:bg-[#121927] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                      Contact Number
                    </label>
                    <input 
                      type="tel" 
                      placeholder="Mobile Number" 
                      value={callMobile}
                      onChange={(e) => setCallMobile(e.target.value)}
                      className="w-full text-[13.5px] px-4 py-3 rounded-xl border border-slate-800 bg-[#121927] text-white placeholder-slate-500 focus:bg-[#121927] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>

                {/* 2-column Date & Slot Selector Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                      Select Date
                    </label>
                    <input 
                      type="date" 
                      value={callDate}
                      min={getLocalDateString()}
                      onChange={(e) => {
                        setCallDate(e.target.value);
                        setCallTime(''); // Reset selection on date change
                      }}
                      className="w-full text-[13px] px-4 py-3 rounded-xl border border-slate-800 bg-[#121927] text-white focus:bg-[#121927] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 tracking-widest uppercase block mb-1">
                      Preferred Time Slot
                    </label>
                    <div className="relative">
                      <select
                        value={callTime}
                        onChange={(e) => setCallTime(e.target.value)}
                        className="w-full text-[13px] px-4 py-3 pr-10 rounded-xl border border-slate-800 bg-[#121927] text-white appearance-none focus:bg-[#121927] focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-colors cursor-pointer"
                      >
                        {filteredSlots.length === 0 ? (
                          <option value="Flexible ASAP">Call me ASAP (Flexible Time)</option>
                        ) : (
                          <>
                            <option value="">Choose preferred slot</option>
                            <option value="Flexible ASAP">Flexible / Call as soon as possible</option>
                            {filteredSlots.map(slot => (
                              <option key={slot.value} value={slot.value}>
                                {slot.label}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-450">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {callDate === getLocalDateString() && filteredSlots.length === 0 && (
                    <div className="col-span-1 sm:col-span-2 text-[11.5px] text-amber-500 bg-amber-500/10 border border-amber-500/15 p-3 rounded-xl flex items-start gap-2.5 mt-1">
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-slate-300 leading-normal">
                        All specific slots for today have passed. Select tomorrow for active slots, or choose <span className="text-amber-400 font-semibold">"Call me ASAP"</span> and we'll reach out at the earliest moment!
                      </span>
                    </div>
                  )}
                </div>

                {formError && (
                  <p className="text-red-400 text-[12px] font-medium">{formError}</p>
                )}

                {/* Secure Guarantee Box exact from layout */}
                <div className="bg-[#050A14] border border-[#1E2E4A]/40 rounded-2xl p-4.5 space-y-3.5 mt-2">
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-450 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-300 leading-normal">
                      <strong className="text-white font-bold">100% Secure Guarantee:</strong> Encrypted & visible strictly to your assigned wealth professional.
                    </p>
                  </div>
                  <div className="flex gap-3 items-start">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-450 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-slate-300 leading-normal">
                      <strong className="text-white font-bold">No Spam Protection:</strong> No cold sales or automated promos. We call strictly at your confirmed slot.
                    </p>
                  </div>
                </div>

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
                  className="w-full flex justify-center py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-[14px] font-bold cursor-pointer transition-all duration-150 relative z-10 text-center shadow-lg active:scale-[0.98] mt-3"
                >
                  Confirm Slot & Connect on WhatsApp
                </a>
              </div>
            </div>

            {/* Dedicated WhatsApp Card Option */}
            <div className="bg-white border border-[#25D366]/20 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4.5 relative overflow-hidden group/wa">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#25D366]/5 rounded-full blur-[32px] -mr-6 -mt-6"></div>
              
              <div className="flex items-start gap-4 relative z-10">
                <div className="bg-[#25D366]/10 p-2.5 rounded-xl shrink-0">
                  <svg className="w-5 h-5 text-[#25D366] fill-current animate-pulse" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.022-.008-1.15-.567-1.321-.63-.171-.064-.296-.096-.42.096-.124.192-.482.607-.59.728-.108.12-.216.136-.437.026a8.11 8.11 0 0 1-2.732-1.684c-1.025-.914-1.717-2.043-1.918-2.388-.201-.345-.021-.531.15-.701.153-.153.342-.4.513-.6.171-.2.228-.34.341-.567.114-.228.057-.427-.028-.597-.085-.17-.791-2.13-1.082-2.83-.284-.683-.573-.591-.785-.601-.202-.009-.434-.01-.667-.01-.233 0-.612.087-.932.434-.32.348-1.22 1.192-1.22 2.91 0 1.717 1.25 3.376 1.427 3.614.178.238 2.457 3.752 5.952 5.26.83.359 1.48.574 1.986.734.835.265 1.595.228 2.196.138.67-.101 2.057-.84 2.348-1.652.29-.813.29-1.507.204-1.653-.086-.145-.316-.233-.531-.345zM12 2C6.477 2 2 6.477 2 12a9.96 9.96 0 0 0 2.622 6.779l-1.722 5.035 5.234-1.693A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18a7.962 7.962 0 0 1-4.062-1.114l-.291-.173-3.024.978.995-2.916-.19-.303A7.957 7.957 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-bold text-[15.5px] text-slate-900 leading-tight">
                    Or Connect Directly
                  </h3>
                  <p className="text-[12.5px] text-slate-500 mt-1 leading-normal">
                    Connect on WhatsApp directly with our certified mutual fund distribution consultants. Bypasses form inputs entirely.
                  </p>
                </div>
              </div>
 
              <a 
                href={directWhatsappLink}
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

          </div>

          {/* Right Column: Embedded Google Calendar Scheduler (Premium Slate Card layout) */}
          <div className="lg:col-span-7 bg-slate-950 text-white border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-xl text-left space-y-6 flex flex-col h-full justify-between min-h-[580px]">
            
            <div className="space-y-2 border-b border-slate-900 pb-5">
              <span className="text-[10.5px] text-blue-400 font-mono font-bold uppercase tracking-wider">SECURE LIVE PORTAL</span>
              <h3 className="font-display font-bold text-[22px] text-white">Direct Live Appointment Booking</h3>
              <p className="text-[12.5px] text-slate-400 leading-relaxed">
                Connect seamlessly with specialized Google Calendar integration. Secure your slot dynamically in under 2 minutes.
              </p>
            </div>

            {/* Premium Interactive Option Container */}
            <div className="flex-1 flex flex-col justify-center py-6 space-y-6">
              <div className="bg-[#0b101b] border border-slate-900 rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-600/10 p-2.5 rounded-xl text-blue-400 relative">
                    <Calendar className="w-5.5 h-5.5" />
                  </div>
                  <div>
                    <h4 className="text-[14.5px] font-bold text-white">Google Calendar Scheduler Portal</h4>
                    <p className="text-[11.5px] text-slate-400">Directly sync your call with an authorized Certified Analyst's planner</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-2 border-t border-slate-900/50 text-[12.5px] text-slate-300">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>15-25 Minutes</strong> personalized micro-session slot.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Instant link</strong> generated for Zoom or Google Meet securely.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>No registration needed:</strong> Synchronize with your actual calendar without friction.</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <a
                  href="https://calendar.app.google/PYXL2TddCCKk9cZ98"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2.5 w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white text-center rounded-xl text-[14px] font-bold transition-all cursor-pointer shadow-lg shadow-blue-500/15 duration-150 transform hover:-translate-y-0.5"
                >
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-100 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-200"></span>
                  </span>
                  Schedule a Call on Google Calendar Portal
                </a>
                
                <p className="text-center text-[10px] text-slate-500 font-mono tracking-widest uppercase">
                  🔒 Secured via Authorized Google OAuth Authentication
                </p>
              </div>
            </div>

            {/* Explanatory security notification */}
            <div className="bg-slate-900/30 border border-slate-900/60 rounded-2xl p-4.5 gap-3 text-[11px] text-slate-450 leading-normal flex items-start">
              <AlertCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                Standard sandboxed browsers can occasionally restrict inline authentication widgets. For a premium, secure, and hassle-free scheduling experience, use the official portal button above to book in a safe new tab.
              </span>
            </div>

          </div>

        </div>

        <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund')} boxIndex={3} />

      </div>
    </div>
  );
}
