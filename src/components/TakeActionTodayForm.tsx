import React, { useState } from 'react';
import { Calendar, PhoneCall, FileText, Check, Shield, AlertTriangle } from 'lucide-react';

interface TakeActionTodayFormProps {
  toolName: string;
  customData?: any;
  onPdfAction?: (name: string, email: string, phone: string) => Promise<void> | void;
  title?: string;
  description?: string;
}

export default function TakeActionTodayForm({
  toolName,
  customData = {},
  onPdfAction,
  title = "Ready to Secure Your Investment Journey?",
  description = "Choose one of our premium, 100% confidential wealth advisory options below. Start your journey with absolute confidence."
}: TakeActionTodayFormProps) {
  const [activeLeadOption, setActiveLeadOption] = useState<'pdf' | 'whatsapp' | 'consult'>('pdf');
  const [leadFormSuccess, setLeadFormSuccess] = useState<boolean>(false);
  const [leadFormError, setLeadFormError] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Form Fields
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadDate, setLeadDate] = useState<string>('');
  const [leadTimeSlot, setLeadTimeSlot] = useState<string>('');

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLeadFormError('');
    setSubmitting(true);

    try {
      if (!leadName.trim() || !leadPhone.trim()) {
        throw new Error('Please enter both your name and phone number.');
      }

      if (activeLeadOption !== 'whatsapp' && !leadEmail.trim()) {
        throw new Error('Please enter your email address.');
      }

      if (activeLeadOption === 'consult' && (!leadDate || !leadTimeSlot)) {
        throw new Error('Please select both a date and a time slot.');
      }

      const purposeMap = {
        pdf: 'Custom Report & PDF Blueprint',
        whatsapp: 'Fast Callback Request (within 15 mins)',
        consult: '1:1 VIP Advisory Session Booking'
      };

      const payload = {
        type: activeLeadOption,
        name: leadName.trim(),
        phone: leadPhone.trim(),
        email: leadEmail.trim() || `${leadName.toLowerCase().replace(/\s+/g, '')}@noemail.com`,
        date: activeLeadOption === 'consult' ? leadDate : '',
        timeSlot: activeLeadOption === 'consult' ? leadTimeSlot : '',
        calculatorData: {
          tool: toolName,
          purpose: purposeMap[activeLeadOption],
          timestamp: new Date().toISOString(),
          ...customData
        }
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to submit. Please check your network and try again.');
      }

      // If there is a custom PDF generator, trigger it!
      if (activeLeadOption === 'pdf' && onPdfAction) {
        try {
          await onPdfAction(leadName.trim(), leadEmail.trim(), leadPhone.trim());
        } catch (pdfErr) {
          console.error('[PDF Generator] Error running tool PDF action:', pdfErr);
        }
      }

      setLeadFormSuccess(true);
      
      // Reset form fields
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
      setLeadDate('');
      setLeadTimeSlot('');

    } catch (err: any) {
      setLeadFormError(err.message || 'An unexpected error occurred during lead registration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 text-left shadow-sm mt-8 max-w-4xl mx-auto font-sans" id={`take-action-card-${toolName.toLowerCase().replace(/\s+/g, '-')}`}>
      
      {/* Title & Header info */}
      <div className="space-y-1">
        <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
          Take Action Today
        </span>
        <h4 className="text-[17px] font-bold font-display text-slate-900 mt-1.5">
          {title}
        </h4>
        <p className="text-slate-500 text-xs">
          {description}
        </p>
      </div>

      {/* Navigation Options */}
      <div className="grid grid-cols-3 gap-2 mt-4 px-1 py-1 bg-slate-100/90 rounded-xl">
        <button
          type="button"
          onClick={() => {
            setActiveLeadOption('pdf');
            setLeadFormSuccess(false);
            setLeadFormError('');
          }}
          className={`py-2 px-1 text-center rounded-lg text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeLeadOption === 'pdf' 
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          📩 PDF Blueprint
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveLeadOption('whatsapp');
            setLeadFormSuccess(false);
            setLeadFormError('');
          }}
          className={`py-2 px-1 text-center rounded-lg text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeLeadOption === 'whatsapp' 
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          ⚡ Fast Callback
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveLeadOption('consult');
            setLeadFormSuccess(false);
            setLeadFormError('');
          }}
          className={`py-2 px-1 text-center rounded-lg text-[10.5px] sm:text-xs font-bold transition-all cursor-pointer ${
            activeLeadOption === 'consult' 
              ? 'bg-white text-slate-900 shadow-xs border border-slate-200' 
              : 'text-slate-600 hover:text-slate-900 font-semibold'
          }`}
        >
          🤝 VIP Advisory
        </button>
      </div>

      {/* Body panel */}
      <div className="mt-5 bg-white border border-slate-100 p-4 rounded-2xl shadow-xs relative">
        
        {leadFormSuccess ? (
          <div className="py-6 text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-xl font-bold">
              <Check className="w-6 h-6" />
            </div>
            <h5 className="font-bold text-sm text-slate-900 font-display">Action Confirmed Successfully!</h5>
            <p className="text-[11.5px] text-slate-500 max-w-sm mx-auto leading-relaxed">
              {activeLeadOption === 'pdf' 
                ? `Your customized report blueprint has been successfully compiled and saved in the CRM system! A downloaded copy will start in a moment.`
                : activeLeadOption === 'whatsapp'
                  ? `Your callback request has been received. Our senior wealth manager will call you back within 15 minutes!`
                  : `Your 1:1 VIP Advisory session has been booked. Our Senior Advisor has been allocated your exact diagnostic details and will connect at your chosen time slot.`
              }
            </p>
            <button
              type="button"
              onClick={() => setLeadFormSuccess(false)}
              className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
            >
              Request Another Action
            </button>
          </div>
        ) : (
          <form onSubmit={handleLeadSubmit} className="space-y-3 text-left">
            
            {leadFormError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{leadFormError}</span>
              </div>
            )}

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={(e) => setLeadName(e.target.value)}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-850 outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={leadPhone}
                  onChange={(e) => setLeadPhone(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-850 outline-none transition-all"
                />
              </div>

              {activeLeadOption !== 'whatsapp' && (
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address <span className="text-rose-500">*</span></label>
                  <input
                    type="email"
                    required
                    value={leadEmail}
                    onChange={(e) => setLeadEmail(e.target.value)}
                    placeholder="e.g. rajesh@gmail.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-850 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            {/* Custom booking parameters for VIP Advisory option */}
            {activeLeadOption === 'consult' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Advisory Date <span className="text-rose-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={leadDate}
                    onChange={(e) => setLeadDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-850 outline-none transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Time Slot <span className="text-rose-500">*</span></label>
                  <select
                    required
                    value={leadTimeSlot}
                    onChange={(e) => setLeadTimeSlot(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl p-2.5 text-xs font-bold text-slate-850 outline-none transition-all"
                  >
                    <option value="">Select Time Slot</option>
                    <option value="10:00 AM - 11:30 AM">10:00 AM - 11:30 AM</option>
                    <option value="11:30 AM - 01:00 PM">11:30 AM - 01:00 PM</option>
                    <option value="02:30 PM - 04:00 PM">02:30 PM - 04:00 PM</option>
                    <option value="04:00 PM - 05:30 PM">04:00 PM - 05:30 PM</option>
                    <option value="06:00 PM - 07:30 PM">06:00 PM - 07:30 PM</option>
                  </select>
                </div>
              </div>
            )}

            {/* Submission CTA Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 disabled:bg-slate-200 disabled:text-slate-400 py-3 rounded-xl transition-all cursor-pointer shadow-sm font-display"
            >
              {submitting ? (
                <span>Registering your details...</span>
              ) : activeLeadOption === 'pdf' ? (
                <>
                  <FileText className="w-4 h-4 text-slate-900" />
                  <span>Send My PDF Report Blueprint Now</span>
                </>
              ) : activeLeadOption === 'whatsapp' ? (
                <>
                  <PhoneCall className="w-4 h-4 text-slate-900" />
                  <span>Request Callback within 15 mins</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4 text-slate-900" />
                  <span>Schedule VIP Advisory Session & Book Now</span>
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[10px] text-slate-400 flex items-center justify-center gap-1 select-none">
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
              <span>Regulated secure wealth service. No spam. 100% confidential.</span>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
