import React from 'react';
import { ArrowRight, Sparkles, TrendingUp } from 'lucide-react';

interface FundFinderPromoBannerProps {
  onActionClick: () => void;
  variant?: 'light' | 'dark' | 'gradient';
  boxIndex?: 1 | 2 | 3;
}

export default function FundFinderPromoBanner({ onActionClick, variant = 'gradient', boxIndex = 1 }: FundFinderPromoBannerProps) {
  const isDark = variant === 'dark';
  const isGradient = variant === 'gradient';

  const renderContent = () => {
    switch (boxIndex) {
      case 2:
        return (
          <div className="space-y-3">
            <h3 className="font-display tracking-tight leading-snug">
              <span className="text-2xl sm:text-3.5xl lg:text-[32px] text-red-600 dark:text-red-500 font-black block">
                Still Picking <span className="text-3xl sm:text-4.5xl lg:text-[38px] text-blue-600 dark:text-blue-400 font-black inline-block mx-1">Random</span> Funds to Invest ?
              </span>
            </h3>
            <p className={`text-[13px] sm:text-[14px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Stop making blind bets. Find funds scientifically matched with your <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Investment Goal</span>, <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Risk Appetite</span> & <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Horizon</span>.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-3">
            <h3 className="font-display tracking-tight leading-snug">
              <span className="text-2xl sm:text-3.5xl lg:text-[32px] text-red-600 dark:text-red-500 font-black block">
                <span className="text-3xl sm:text-4.5xl lg:text-[38px] font-black inline-block mr-1">🛑 STOP</span> Guessing Funds | Best Match Fund in <span className="text-green-600 dark:text-green-400 font-black">30 secs</span>
              </span>
            </h3>
            <p className={`text-[13px] sm:text-[14px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              No complex registration, no sign-ups, and no hidden biases. Get curated fund profiles as per <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Investment Goal</span>, <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Risk Appetite</span>, <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Amount</span> & <span className="font-bold text-slate-900 dark:text-white border-b border-dashed border-amber-400">Horizon</span>.
            </p>
          </div>
        );
      case 1:
      default:
        return (
          <div className="space-y-3">
            <h3 className="font-display tracking-tight leading-snug">
              <span className={`text-[15px] sm:text-[17px] lg:text-[19px] font-bold block sm:inline-block mr-2 ${isDark ? 'text-slate-300' : 'text-slate-650'}`}>
                💡 Mutual Funds Sahi Hai,
              </span>
              <span className="text-2xl sm:text-3.5xl lg:text-[32px] text-red-600 dark:text-red-500 font-black block sm:inline mt-1.5 sm:mt-0">
                BUT - Konsa Fund ?
              </span>
            </h3>
            <p className={`text-[13px] sm:text-[14px] leading-relaxed font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Which Fund matches your <span className="font-bold text-slate-900 border-b border-dashed border-amber-400">Investment Goal</span>, <span className="font-bold text-slate-900 border-b border-dashed border-amber-400">Risk Profile</span> & <span className="font-bold text-slate-900 border-b border-dashed border-amber-400">Capital Scale</span>?
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className={`mx-auto max-w-7xl my-10 px-4 sm:px-6 lg:px-8`}
      id={`fund-finder-promo-container-${boxIndex}`}
    >
      <div 
        className={`p-6 sm:p-8 rounded-[24px] border transition-all duration-300 relative overflow-hidden ${
          isDark 
            ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-xl' 
            : isGradient
              ? 'bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white border-amber-100 text-slate-800 shadow-md shadow-amber-500/5'
              : 'bg-white border-slate-100 text-slate-800 shadow-md shadow-slate-100'
        }`}
        id={`fund-finder-promo-card-${boxIndex}`}
      >
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[60px] pointer-events-none -mr-16 -mt-16 bg-amber-500/10" />
        <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full blur-[50px] pointer-events-none -ml-12 -mb-12 bg-orange-500/5" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 relative z-10 text-center lg:text-left">
          {/* FOMO, Hook & Value Proposition */}
          <div className="flex flex-col md:flex-row items-center lg:items-start gap-4 max-w-3xl">
            <div className="p-3.5 rounded-2xl bg-amber-500/15 text-amber-600 animate-pulse shrink-0">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            {renderContent()}
          </div>

          {/* Action CTA Button */}
          <div className="shrink-0 w-full lg:w-auto">
            <button
              onClick={onActionClick}
              className="w-full lg:w-auto inline-flex flex-col items-center justify-center gap-0.5 px-6 py-3 bg-slate-750 hover:bg-slate-850 font-bold text-white rounded-full transition-all cursor-pointer active:scale-95 text-center shadow-md"
              id={`cta-promo-find-fund-${boxIndex}`}
            >
              <span className="text-[8.5px] font-bold text-slate-350 uppercase tracking-wider">for Internal Team Use Only</span>
              <span className="text-[12px] flex items-center gap-1">
                <span>Free Tool - Exactly Which Funds To Invest</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
