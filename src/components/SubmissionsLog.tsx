import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Trash2, 
  Search, 
  Calendar, 
  Lock, 
  Unlock, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  AlertTriangle
} from 'lucide-react';

interface Submission {
  id: string;
  timestamp: string;
  fileName: string;
  fileSize: string;
  password?: string;
  status: "Success" | "Failed" | "Pending";
  error?: string;
  saveFileName: string;
}

export default function SubmissionsLog() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [actionError, setActionError] = useState('');

  // Auto-calculated dynamic key check (matches standard PasswordDialog logic)
  const validateAccessCode = (input: string): boolean => {
    const cleanInput = input.trim().toLowerCase();
    if (!cleanInput) return false;

    // Common master keys for absolute reliability & convenience of the business owner
    if (cleanInput === 'pwg2026' || cleanInput === 'merchant' || cleanInput === 'admin123') {
      return true;
    }

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

    const possibilities: string[] = [];
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date();
      d.setDate(d.getDate() + offset);
      possibilities.push(calculateForDate(d, false));
    }
    for (let offset = -1; offset <= 1; offset++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() + offset);
      possibilities.push(calculateForDate(d, true));
    }

    return possibilities.includes(cleanInput);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (validateAccessCode(passcodeInput)) {
      setIsAuthenticated(true);
      fetchSubmissions();
    } else {
      setAuthError('Invalid operator security key. Access denied.');
    }
  };

  const fetchSubmissions = async () => {
    setLoading(true);
    setActionError('');
    try {
      const res = await fetch('/api/admin/submissions');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      } else {
        throw new Error('Failed to retrieve submissions database from server.');
      }
    } catch (err: any) {
      setActionError(err.message || 'Error occurred while loading submissions.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    const confirmed = window.confirm(`Are you absolutely sure you want to permanently delete submission record for: "${fileName}"?\nThis will remove both the credentials and the raw PDF file from the disk.`);
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSubmissions(prev => prev.filter(item => item.id !== id));
      } else {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete submission.');
      }
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  const togglePasswordVisibility = (id: string) => {
    setVisiblePasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredSubmissions = submissions.filter(sub => {
    const q = searchQuery.toLowerCase();
    return (
      sub.fileName.toLowerCase().includes(q) ||
      (sub.password && sub.password.toLowerCase().includes(q)) ||
      sub.status.toLowerCase().includes(q)
    );
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-indigo-50 border border-indigo-150 rounded-2xl flex items-center justify-center text-indigo-600">
            <Lock className="w-8 h-8" />
          </div>
          
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Operator Authorization Gate</h1>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest font-mono">
              Pure Wealth Internal Security
            </p>
          </div>

          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-150 flex gap-3 text-left">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-[12px] font-black text-amber-800 uppercase tracking-wide block">Restricted Environment</span>
              <p className="text-amber-700 text-xs leading-relaxed font-medium">
                This dashboard lists raw user uploads (statements and passwords) submitted for active diagnostics. Operator authentication is strictly required.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-mono tracking-wider text-slate-500 uppercase font-bold">
                Enter Operator Security Passcode
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 rounded-xl font-mono text-[14px] text-slate-800 outline-none"
                placeholder="Manager access key..."
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                autoFocus
              />
            </div>

            {authError && (
              <p className="text-red-600 bg-red-50 py-2.5 px-4 rounded-xl text-xs font-semibold border border-red-100">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md cursor-pointer transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" />
              <span>Authenticate Operator</span>
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 animate-in fade-in duration-200">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest font-mono">
              Live Leads Sync Ledger
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            CAS Submission Logs & Credentials
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            Review matching client statements, extract pdfs, and retrieve statement decryption passwords automatically synced from Upload CAS PDF.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-205 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl cursor-pointer shadow-sm transition-all active:scale-[0.98]"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Records'}</span>
          </button>
        </div>
      </div>

      {actionError && (
        <div className="bg-red-50 border border-red-150 rounded-2xl p-4 text-red-700 flex gap-2.5 items-center text-xs font-medium">
          <AlertCircle className="w-5 h-5 text-red-650 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Query Filter and Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 relative">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-105 rounded-2xl text-[13.5px] text-slate-800 outline-none shadow-3xs"
            placeholder="Search by statement filename, extracted password, or decryption status..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="bg-slate-100 rounded-2xl px-5 py-3 border border-slate-200/60 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Total Files Vaulted</span>
            <span className="text-xl font-black text-slate-900">{filteredSubmissions.length} of {submissions.length}</span>
          </div>
          <FileText className="w-8 h-8 text-slate-400/80" />
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-20 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-slate-500 text-xs font-medium">Loading statement submissions database from server shelf...</p>
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-20 text-center space-y-4">
            <div className="mx-auto w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center text-slate-400">
              <FileText className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-slate-800 text-[14px] font-bold">No Records Discovered</p>
              <p className="text-slate-400 text-xs max-w-sm mx-auto">
                No statement submissions matching the keywords were found in the manifest log file. Ensure users have run diagnostic updates under the Instant tab.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-150/80">
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-450 font-mono">Submission Date</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-450 font-mono">Statement File Details</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-450 font-mono">Decryption Password</th>
                  <th className="px-6 py-4 text-[11px] font-extrabold uppercase tracking-widest text-slate-450 font-mono">Audit Status</th>
                  <th className="px-6 py-4 text-right text-[11px] font-extrabold uppercase tracking-widest text-slate-450 font-mono">Operator Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.map(sub => {
                  const subDate = new Date(sub.timestamp).toLocaleString();
                  const isVisible = visiblePasswords[sub.id] || false;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Timestamp Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <div>
                            <span className="text-[13px] font-semibold text-slate-800 block">{subDate.split(',')[0]}</span>
                            <span className="text-[10px] font-medium text-slate-400 block font-mono bg-slate-100/50 rounded px-1.5 py-0.5 mt-0.5 w-max">
                              {subDate.split(',')[1]}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* File Details Column */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-3 max-w-md">
                          <div className="h-9 w-9 bg-red-50 border border-red-150 rounded-lg flex items-center justify-center text-red-650 shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[13px] font-extrabold text-slate-900 block truncate" title={sub.fileName}>
                              {sub.fileName}
                            </span>
                            <span className="text-[11px] font-medium text-slate-450 block font-mono">
                              File Size: {sub.fileSize}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Decrypted Password Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 w-max shadow-3xs">
                          {isVisible ? (
                            <span className="text-[12.5px] font-bold font-mono text-indigo-700">{sub.password || "None"}</span>
                          ) : (
                            <span className="text-[12.5px] font-mono text-slate-400 select-none">••••••••</span>
                          )}
                          <button
                            onClick={() => togglePasswordVisibility(sub.id)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors cursor-pointer"
                            title={isVisible ? "Hide Password" : "Show Password"}
                          >
                            {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Decryption Status Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap">
                        {sub.status === "Success" ? (
                          <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-150/80 px-2.5 py-1 rounded-full text-xs font-bold leading-none">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Audit Complete</span>
                          </div>
                        ) : sub.status === "Failed" ? (
                          <div 
                            className="inline-flex items-center gap-1.5 bg-rose-50 text-rose-700 border border-rose-150/80 px-2.5 py-1 rounded-full text-xs font-bold leading-none cursor-help hover:bg-rose-100/70"
                            title={sub.error || "Password incorrect / format exception"}
                          >
                            <XCircle className="w-3.5 h-3.5 text-rose-600" />
                            <span>Failed Extraction</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-150/80 px-2.5 py-1 rounded-full text-xs font-bold leading-none">
                            <RefreshCw className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                            <span>In Progress</span>
                          </div>
                        )}
                      </td>

                      {/* Action Column */}
                      <td className="px-6 py-4.5 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2 text-right">
                          <a
                            href={`/api/admin/submissions/download/${sub.saveFileName}`}
                            className="p-2.5 bg-slate-50 hover:bg-indigo-50 border border-slate-205 text-slate-600 hover:text-indigo-600 rounded-xl transition-all cursor-pointer shadow-3xs"
                            title="Download Statement PDF File"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleDelete(sub.id, sub.fileName)}
                            className="p-2.5 hover:bg-red-50 border border-transparent hover:border-red-150 text-slate-400 hover:text-red-650 rounded-xl transition-all cursor-pointer"
                            title="Purge Record & Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="text-center">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 font-mono block">
          End of Ledger • Pure Wealth Secure Data Vault
        </span>
      </div>
    </div>
  );
}
