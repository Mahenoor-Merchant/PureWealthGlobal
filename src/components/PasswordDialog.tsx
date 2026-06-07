import React, { useState, useEffect } from 'react';
import { Lock, Unlock, X, AlertTriangle, CheckCircle } from 'lucide-react';

interface PasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

export default function PasswordDialog({ isOpen, onClose, onSuccess, title = "Manager Access Verification" }: PasswordDialogProps) {
  const [passwordInput, setPasswordInput] = useState('');
  const [errorText, setErrorText] = useState('');
  const [isSuccessState, setIsSuccessState] = useState(false);

  // Reset states when dialog state changes
  useEffect(() => {
    if (isOpen) {
      setPasswordInput('');
      setErrorText('');
      setIsSuccessState(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validatePassword = (input: string): boolean => {
    const cleanInput = input.trim().toLowerCase();
    if (!cleanInput) return false;

    // Helper to calculate exact password for a direct Date object
    const calculateForDate = (dateObj: Date, isUtc: boolean) => {
      const year = isUtc ? dateObj.getUTCFullYear() : dateObj.getFullYear();
      const month = isUtc ? dateObj.getUTCMonth() : dateObj.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
      const dayIndex = isUtc ? dateObj.getUTCDay() : dateObj.getDay();
      const dayStr = dayNames[dayIndex];
      
      const dateNum = isUtc ? dateObj.getUTCDate() : dateObj.getDate();
      const dateStr = dateNum < 10 ? `0${dateNum}` : `${dateNum}`;
      
      return `${daysInMonth}${dayStr}${dateStr}`;
    };

    // We check both local and UTC times for the current day, and yesterday/tomorrow to absorb skew.
    const possibleInputs: string[] = [];

    // Local checks (-1, 0, 1 days)
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      possibleInputs.push(calculateForDate(d, false));
    }

    // UTC checks (-1, 0, 1 days)
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + offset);
      possibleInputs.push(calculateForDate(d, true));
    }

    // Filter duplicates
    const uniquePossibilities = Array.from(new Set(possibleInputs));

    return uniquePossibilities.includes(cleanInput);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorText('');

    if (validatePassword(passwordInput)) {
      setIsSuccessState(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 950);
    } else {
      setErrorText('Error: Invalid manager security key. Verification declined.');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-[4px] transition-opacity" 
        onClick={onClose}
      />

      {/* Dialog container */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-205 shadow-2xl relative overflow-hidden transition-all transform scale-100 z-10 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Absolute Design Elements */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 p-2 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-6">
          {/* Lock Header Circle */}
          <div className="flex justify-center">
            <div className={`p-4 rounded-2xl ${isSuccessState ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'} border ${isSuccessState ? 'border-emerald-150' : 'border-amber-150'} transition-all duration-300`}>
              {isSuccessState ? (
                <Unlock className="w-8 h-8 animate-bounce" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>
          </div>

          {/* Heading */}
          <div className="text-center space-y-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight font-sans">
              {title}
            </h3>
            <p className="text-slate-400 text-[11px] font-mono uppercase tracking-widest font-semibold">
              Internal Clearance Protocol
            </p>
          </div>

          {/* Core Warning Notice: Required exact message */}
          <div className="bg-red-50/90 rounded-2xl p-4 sm:p-5 border border-red-150/80 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-red-650 shrink-0 mt-0.5" />
            <div className="space-y-1.5 flex-1">
              <span className="text-[12px] font-black text-red-800 uppercase tracking-wide block">
                Access Denied - Authorized Operators Only
              </span>
              <p className="text-red-750 text-xs leading-relaxed font-sans font-medium">
                This Tool is for Internal Use Only, and can be used with Password generated for Internal Manager. We are AMFI Registered Mutual Fund Distributor. We do not Provide Advisory Service.
              </p>
            </div>
          </div>

          {/* Password Input Area */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 text-left">
              <label className="text-[11px] font-mono tracking-wider text-slate-500 uppercase font-bold block">
                Enter Manager Verification Password
              </label>
              
              <div className="relative rounded-xl border border-slate-205 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all bg-white overflow-hidden shadow-2xs">
                <input
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    if (errorText) setErrorText('');
                  }}
                  disabled={isSuccessState}
                  className="w-full px-4 py-3 text-slate-800 text-[14px] font-mono focus:outline-none focus:ring-0 focus:border-transparent bg-transparent"
                  autoFocus
                  required
                />
              </div>
            </div>

            {/* Error Message */}
            {errorText && (
              <div className="text-red-600 bg-red-50/50 rounded-xl px-4 py-2.5 border border-red-100 text-[11.5px] font-mono text-center animate-shake leading-relaxed font-semibold">
                {errorText}
              </div>
            )}

            {/* Success State */}
            {isSuccessState && (
              <div className="text-emerald-700 bg-emerald-50/70 rounded-xl px-4 py-2.5 border border-emerald-150 text-[11.5px] font-mono text-center flex items-center justify-center gap-1.5 leading-none font-bold">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verification approved! Generating results...</span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSuccessState}
                className="w-full sm:w-1/3 py-3 border border-slate-200 text-slate-655 hover:bg-slate-50 rounded-xl text-xs font-bold font-sans transition-all active:scale-[0.98] cursor-pointer disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSuccessState}
                className="w-full sm:w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black font-sans shadow-md hover:shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Verify & Proceed</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
