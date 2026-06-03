/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = '', showText = true }: LogoProps) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Sleek, Clean Monogram Brand Mark */}
      <div className="w-10 h-10 bg-[#0F172A] flex items-center justify-center rounded-lg flex-shrink-0 shadow-sm">
        <span className="text-white font-bold text-xl italic font-display">P</span>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <span className="text-[15px] sm:text-[18px] font-bold tracking-tight text-slate-800">
            PURE WEALTH <span className="text-blue-600">GLOBAL</span>
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-slate-400 tracking-[0.14em] uppercase font-semibold mt-1">
            Wealth Consultants
          </span>
        </div>
      )}
    </div>
  );
}
