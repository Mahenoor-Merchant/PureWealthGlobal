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
      {/* Sleek, Clean Vector Growth Chart Brand Mark matching user image */}
      <div className="w-10 h-10 flex-shrink-0">
        <svg 
          viewBox="0 0 512 512" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
        >
          {/* COLUMN 1 */}
          {/* Bar 1 (Green) */}
          <polygon points="70,365 110,325 110,180 70,220" fill="#00B050" />

          {/* COLUMN 2 */}
          {/* Bar 2 (Green) */}
          <polygon points="185,365 225,325 225,90 185,130" fill="#00B050" />

          {/* COLUMN 3 */}
          {/* Bar 3 (Red) */}
          <polygon points="300,365 340,325 340,140 300,180" fill="#FF3D00" />

          {/* COLUMN 4 */}
          {/* Bar 4 (Green) */}
          <polygon points="415,365 455,325 455,20 415,60" fill="#00B050" />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col justify-center text-left leading-none">
          <span className="text-[15px] sm:text-[18px] font-bold tracking-tight text-slate-800">
            PURE WEALTH <span className="text-blue-600">GLOBAL</span>
          </span>
          <span className="text-[9.5px] sm:text-[10px] text-slate-400 tracking-[0.14em] uppercase font-semibold mt-1">
            Investment Solutions
          </span>
        </div>
      )}
    </div>
  );
}
