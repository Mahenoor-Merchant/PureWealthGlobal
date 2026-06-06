import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X, ShieldCheck, Zap, PhoneCall } from 'lucide-react';

interface InvestmentStartupPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function InvestmentStartupPopup({
  isOpen,
  onClose,
  onConfirm
}: InvestmentStartupPopupProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 24, stiffness: 380 }}
            className="relative w-full max-w-[440px] max-h-[90vh] overflow-y-auto bg-white border border-slate-100 rounded-xl shadow-2xl z-10 text-left flex flex-col"
            id="investment-startup-popup-modal"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close dialog"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {/* Accent Header Pattern */}
            <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 w-full shrink-0" />

            {/* Content Body - optimized padding and spacing for professional shorter appearance */}
            <div className="p-4 sm:p-5 space-y-3.5 flex-1">
              {/* Badge & Title */}
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-100/60 text-emerald-700">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider">
                    Start investing • 15 Min Setup
                  </span>
                </div>
                
                <h3 className="font-display font-extrabold text-lg text-slate-900 leading-snug">
                  <span className="text-blue-650 bg-blue-50/80 px-1 py-0.5 rounded border border-blue-100/40">Start</span> Investing in <span className="text-blue-650 bg-blue-50/80 px-1 py-0.5 rounded border border-blue-100/40">Your</span> Selected Mutual Fund Now.
                </h3>
                
                <p className="text-[11px] leading-normal text-slate-600 font-sans">
                  The <span className="text-slate-900 font-semibold bg-amber-50 px-1 py-0.5 rounded border border-amber-200/30">Hard Work</span> of finding the perfect calibrated funds is Complete. The critical <span className="text-blue-700 font-bold">Next Step</span> is to turn these insights into live, high-yield compound wealth.
                </p>
              </div>

              {/* Confidence-Building 3 Easy Steps to start in next less than 15 mins */}
              <div className="space-y-2 pt-1.5 border-t border-slate-50">
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  📊 3 Easy Steps to start Your Investment in next less than 15 Mins
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-blue-50 text-blue-700 font-mono font-bold text-[9.5px] shrink-0 mt-0.5 border border-blue-100">
                    1
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">
                      Verified Allocation Coach Call (5 Mins)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      Confirm tax optimization and direct portfolio allocation parameters.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-indigo-50 text-indigo-700 font-mono font-bold text-[9.5px] shrink-0 mt-0.5 border border-indigo-100">
                    2
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">
                      Instant Regulatory Paperless Link (5 Mins)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      Frictionless setup linking NRE/NRO or local Indian bank accounts.
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 items-start">
                  <div className="flex items-center justify-center w-4.5 h-4.5 rounded-full bg-emerald-50 text-emerald-700 font-mono font-bold text-[9.5px] shrink-0 mt-0.5 border border-emerald-100">
                    3
                  </div>
                  <div>
                    <h4 className="text-[11.5px] font-bold text-slate-800 leading-tight">
                      Account Setup | Fund Deposit | Fund Allocation to SIP or Lumpsum (5 Mins)
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-normal">
                      Deploy funds into automated high-yield SIP or custom lumpsum allocations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Actions - tighter padding and layout */}
              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full inline-flex items-center justify-between py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-[13px] rounded-lg transition-all cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.99] ring-2 ring-emerald-500/20 hover:ring-emerald-500/40 relative overflow-hidden group"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-100 animate-bounce" />
                    <span>Request a Secure Callback</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[8.5px] uppercase tracking-wider text-emerald-100 bg-emerald-800/60 font-black px-2 py-0.5 rounded">
                      No Spam
                    </span>
                    <span className="text-[8.5px] uppercase tracking-wider text-amber-300 bg-slate-900 border border-slate-800 font-black px-1.5 py-0.5 rounded">
                      ★ Preferred
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onConfirm}
                  className="w-full inline-flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-[11px] rounded-md transition-all cursor-pointer active:scale-[0.99]"
                >
                  <span>Connect with team online</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-1 bg-transparent hover:bg-slate-50 text-slate-400 hover:text-slate-500 font-semibold text-[10.5px] rounded transition-all cursor-pointer text-center"
                >
                  Dismiss & Review My Calibrated Funds
                </button>
              </div>

              {/* Regulatory Assurance Code */}
              <p className="text-center text-[8px] font-mono text-slate-400 tracking-wider">
                🛡️ AMFI Registered Distributor Coordination • Regulatory Compliant Support
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
