import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, X, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

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
            className="absolute inset-0 bg-slate-950/65 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.93, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg bg-white border border-slate-100 rounded-3xl shadow-2xl overflow-hidden z-10 text-left flex flex-col"
            id="investment-startup-popup-modal"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors cursor-pointer z-20"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Accent Header Pattern */}
            <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 w-full" />

            {/* Content Body */}
            <div className="p-6 sm:p-8 space-y-6">
              {/* Badge & Title */}
              <div className="space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
                  <span className="text-[10.5px] font-mono font-bold uppercase tracking-wider">
                    Successful Calibration
                  </span>
                </div>
                
                <h3 className="font-display font-extrabold text-2xl text-slate-900 leading-tight">
                  Ready to Start Your Mutual Fund Investments?
                </h3>
                
                <p className="text-[13.5px] text-slate-550 leading-relaxed text-slate-600 font-sans">
                  The hard work of finding the perfect calibrated funds is complete. The next critical step is to turn these insights into live, high-yield compound wealth.
                </p>
              </div>

              {/* Unique Support Pillars */}
              <div className="space-y-4 pt-1">
                <div className="flex gap-3.5 items-start">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                    <Zap className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">
                      3-Minute Seamless Onboarding
                    </h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      Complete standard central C-KYC and regulatory KRA documentation digitally without trailing paperwork hurdles.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0 mt-0.5">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">
                      Specialized NRI & HNI Compliance
                    </h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      Ensure clean connection path between foreign bank accounts (NRE/NRO linkage channels) and Indian capital markets.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3.5 items-start">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0 mt-0.5">
                    <TrendingUp className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-[13.5px] font-bold text-slate-800">
                      Active Guidance & Performance Reviews
                    </h4>
                    <p className="text-[12px] text-slate-500 mt-0.5 leading-relaxed">
                      Receive ongoing advisory alignments, AMFI trailing disclosures, and strategic quarterly portfolio rebalancing.
                    </p>
                  </div>
                </div>
              </div>

              {/* Call to Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={onConfirm}
                  className="flex-1 inline-flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-[13.5px] rounded-xl transition-all cursor-pointer shadow-lg active:scale-[0.98]"
                >
                  <span>Connect with Advisors</span>
                  <ArrowRight className="w-4 h-4 text-blue-400" />
                </button>
                
                <button
                  type="button"
                  onClick={onClose}
                  className="py-3.5 px-5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 hover:text-slate-800 font-semibold text-[13px] rounded-xl transition-all cursor-pointer text-center active:scale-[0.98]"
                >
                  Dismiss & Review
                </button>
              </div>

              {/* Regulatory Assurance Code */}
              <p className="text-center text-[9px] font-mono text-slate-400 tracking-wider">
                🛡️ AMFI Registered Distributor Coordination • Regulatory Compliant Support
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
