import React, { useState, useEffect } from 'react';
import { 
  Users, ShieldCheck, Download, Search, Trash2, Filter, 
  RefreshCw, Database, MapPin, Phone, Mail, Clock, Calendar, 
  Briefcase, CheckCircle, HelpCircle, FileText, Landmark,
  Globe, Activity, User, TrendingUp, BarChart2, Award, ChevronRight
} from 'lucide-react';

export default function DatabasePortalView() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterTool, setFilterTool] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Analytics states
  const [activeTab, setActiveTab] = useState<'leads' | 'analytics'>('leads');
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  const fetchLeads = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leads');
      if (!res.ok) {
        throw new Error('Could not connect to lead server datastore.');
      }
      const data = await res.json();
      setLeads(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'An error occurred while synchronizing CRM datastore.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        throw new Error('Could not retrieve visitor analytics.');
      }
      const data = await res.json();
      setAnalytics(data);
    } catch (err: any) {
      console.error("Analytics fetch error:", err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    fetchAnalytics();
  }, []);

  const clearDatabase = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently clear the leads database? This action is irreversible.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch('/api/leads/clear', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to purge lead database records.');
      }
      setLeads([]);
      setSuccessMsg('CRM lead records database purged successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Could not purge records.');
    } finally {
      setLoading(false);
    }
  };

  const clearAnalyticsData = async () => {
    if (!window.confirm("CRITICAL WARNING: Are you sure you want to permanently clear all real-time traffic and visitor logs? This action is irreversible.")) {
      return;
    }
    
    setAnalyticsLoading(true);
    try {
      const res = await fetch('/api/analytics/clear', { method: 'POST' });
      if (!res.ok) {
        throw new Error('Failed to purge analytics traffic logs.');
      }
      setSuccessMsg('Traffic logs database purged successfully.');
      setTimeout(() => setSuccessMsg(''), 4000);
      fetchAnalytics();
    } catch (err: any) {
      setError(err.message || 'Could not purge visitor logs.');
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // Compute Lead Metrics
  const totalLeadsCount = leads.length;
  const pdfCount = leads.filter(l => l.type === 'pdf').length;
  const callbackCount = leads.filter(l => l.type === 'whatsapp').length;
  const vipCount = leads.filter(l => l.type === 'consult').length;

  // Filter Leads
  const filteredLeads = leads.filter(l => {
    const matchesSearch = 
      l.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.phone?.includes(searchQuery);

    const matchesType = filterType === 'all' || l.type === filterType;

    // Normalize or match tool
    const tool = l.calculatorData?.tool || '';
    let matchesTool = true;
    if (filterTool !== 'all') {
      if (filterTool === 'retirement') {
        matchesTool = tool.toLowerCase().includes('retirement') || tool.toLowerCase().includes('decumulation');
      } else if (filterTool === 'fund-type') {
        matchesTool = tool.toLowerCase().includes('fund type') || tool.toLowerCase().includes('diagnostic');
      } else if (filterTool === 'ai-auditor') {
        matchesTool = tool.toLowerCase().includes('auditor') || tool.toLowerCase().includes('audit');
      } else if (filterTool === 'cashflow-game') {
        matchesTool = l.type === 'cashflow_simulation' || tool.toLowerCase().includes('cashflow') || tool.toLowerCase().includes('freedom');
      } else if (filterTool === 'exact-fund') {
        matchesTool = tool.toLowerCase().includes('exact fund');
      }
    }

    return matchesSearch && matchesType && matchesTool;
  });

  // Helper to format average session time
  const formatTime = (seconds: number) => {
    if (!seconds) return '0s';
    if (seconds < 60) return `${Math.round(seconds)}s`;
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}m ${s}s`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fade-in text-slate-800 font-sans animate-fade-in" id="database-portal-crm-view">
      
      {/* Header Block */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="space-y-1 text-left">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Database className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full">
              Live Cloud CRM Datastore
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mt-2">
            Integrated Database Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            A secure, unified portal collecting real-time client leads and factual live visitor traffic metrics across all platforms.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-stretch sm:self-auto justify-end">
          <button
            type="button"
            onClick={async () => {
              await fetchLeads();
              await fetchAnalytics();
            }}
            disabled={loading || analyticsLoading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 rounded-xl border border-slate-200 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            title="Force refresh database records"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${(loading || analyticsLoading) ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
          
          {activeTab === 'leads' && leads.length > 0 && (
            <button
              type="button"
              onClick={clearDatabase}
              disabled={loading}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Leads</span>
            </button>
          )}

          {activeTab === 'analytics' && analytics && (
            <button
              type="button"
              onClick={clearAnalyticsData}
              disabled={analyticsLoading}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 border border-rose-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <Trash2 className="w-4 h-4" />
              <span>Purge Visitor Logs</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-5 py-3 text-xs sm:text-sm font-extrabold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Users className="w-4.5 h-4.5" />
          <span>Leads Management ({leads.length})</span>
        </button>
        <button
          onClick={() => {
            setActiveTab('analytics');
            fetchAnalytics();
          }}
          className={`px-5 py-3 text-xs sm:text-sm font-extrabold tracking-wide border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'analytics'
              ? 'border-indigo-600 text-indigo-700 font-black'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Activity className="w-4.5 h-4.5" />
          <span>Real-Time Visitor Analytics</span>
          <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">Live</span>
        </button>
      </div>

      {/* Persistence Info Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-3.5 items-start text-left text-xs">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
        <div className="space-y-1 leading-relaxed text-slate-600">
          <h4 className="font-bold text-slate-800">Durable Cloud Persistence System</h4>
          <p>
            Your CRM databases are fully persistent! All records are instantly synchronized to our cloud-managed 
            <strong> Cloud Firestore Database</strong>.
            Data remains secure, structured, and will not vanish if you refresh your browser.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4.5 h-4.5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
          <Trash2 className="w-4.5 h-4.5 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === 'leads' ? (
        <>
          {/* CRM Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left shadow-xs">
              <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">Total Leads Compiled</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-display text-slate-900">{totalLeadsCount}</span>
                <span className="text-[10px] font-bold text-slate-400">entries</span>
              </div>
              <div className="w-full bg-slate-100 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-slate-600 h-full" style={{ width: `${totalLeadsCount > 0 ? '100' : '0'}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left shadow-xs">
              <span className="text-[10px] font-mono text-indigo-500 block uppercase tracking-wider">📩 PDF Blueprints</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-display text-indigo-600">{pdfCount}</span>
                <span className="text-[10px] font-bold text-indigo-400">sent</span>
              </div>
              <div className="w-full bg-indigo-50 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-indigo-500 h-full" style={{ width: `${totalLeadsCount > 0 ? (pdfCount / totalLeadsCount) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left shadow-xs">
              <span className="text-[10px] font-mono text-emerald-500 block uppercase tracking-wider">⚡ Fast Callbacks</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-display text-emerald-600">{callbackCount}</span>
                <span className="text-[10px] font-bold text-emerald-400">requested</span>
              </div>
              <div className="w-full bg-emerald-50 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: `${totalLeadsCount > 0 ? (callbackCount / totalLeadsCount) * 100 : 0}%` }} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl text-left shadow-xs">
              <span className="text-[10px] font-mono text-amber-500 block uppercase tracking-wider">🤝 VIP Consultations</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl sm:text-3xl font-black font-display text-amber-600">{vipCount}</span>
                <span className="text-[10px] font-bold text-amber-400">booked</span>
              </div>
              <div className="w-full bg-amber-50 h-1 rounded-full mt-3 overflow-hidden">
                <div className="bg-amber-500 h-full" style={{ width: `${totalLeadsCount > 0 ? (vipCount / totalLeadsCount) * 100 : 0}%` }} />
              </div>
            </div>

          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col md:flex-row gap-3 items-stretch shadow-xs">
            
            {/* Search Field */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads by name, email, or phone..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl py-2.5 pl-9 pr-4 text-xs font-bold outline-none transition-all"
              />
            </div>

            {/* Filter by Source Tool */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 sm:py-0">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Source:</span>
              <select
                value={filterTool}
                onChange={(e) => setFilterTool(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 py-1 sm:py-2.5 outline-none cursor-pointer"
              >
                <option value="all">All Channels</option>
                <option value="retirement">Retirement Buckets</option>
                <option value="fund-type">Fund Type Diagnostic</option>
                <option value="ai-auditor">AI Portfolio Auditor</option>
                <option value="cashflow-game">🎮 Cashflow Game Simulation</option>
                <option value="exact-fund">Find Exact Fund</option>
              </select>
            </div>

            {/* Filter by Lead Action Type */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 sm:py-0">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">Action Type:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-transparent border-none text-xs font-bold text-slate-700 py-1 sm:py-2.5 outline-none cursor-pointer"
              >
                <option value="all">All Actions</option>
                <option value="pdf">📩 PDF Blueprints</option>
                <option value="whatsapp">⚡ Fast Callbacks</option>
                <option value="consult">🤝 Schedule Callback</option>
              </select>
            </div>

          </div>

          {/* Leads Table or List */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            
            {loading ? (
              <div className="py-20 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400 font-mono">Synchronizing live Firestore datastore...</p>
              </div>
            ) : filteredLeads.length === 0 ? (
              <div className="py-20 text-center space-y-2 border-2 border-dashed border-slate-100 rounded-2xl m-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="font-bold text-sm text-slate-800">No matching lead records found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  No leads populate under the chosen search query or filters. Submit forms inside any diagnostic tool to register active entries!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-left">
                {filteredLeads.map((lead: any, idx: number) => {
                  const toolLabel = lead.calculatorData?.tool || 'Retirement Calculator';
                  const isPdf = lead.type === 'pdf';
                  const isCallback = lead.type === 'whatsapp';
                  const isVip = lead.type === 'consult';

                  return (
                    <div key={idx} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row md:items-start gap-4">
                      
                      {/* Left Badging info */}
                      <div className="md:w-52 space-y-1.5 shrink-0">
                        <span className="text-[10px] font-mono text-slate-400 font-bold block">
                          #{idx + 1} • {new Date(lead.createdAt || lead.calculatorData?.timestamp || Date.now()).toLocaleDateString()}
                        </span>

                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          isPdf ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                            : isCallback ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {isPdf ? '📩 PDF Blueprint' : isCallback ? '⚡ Callback' : '🤝 VIP Consult'}
                        </span>

                        <div className="pt-1">
                          <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Captured From:</span>
                          <strong className="text-[11px] font-extrabold text-slate-700 block mt-0.5 truncate" title={toolLabel}>
                            {toolLabel}
                          </strong>
                        </div>
                      </div>

                      {/* Mid User Info */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-extrabold font-display text-slate-900 text-sm">
                          {lead.name}
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-xs text-slate-600 font-medium">
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                            <span>Phone: <strong className="text-slate-800">{lead.phone}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                            <span>Email: <strong className="text-slate-800">{lead.email}</strong></span>
                          </div>

                          {lead.date && (
                            <div className="flex items-center gap-1.5 sm:col-span-2 bg-amber-500/10 border border-amber-500/10 p-2 rounded-xl text-amber-900 mt-1">
                              <Calendar className="w-4 h-4 text-amber-600 shrink-0" />
                              <span>Advisory Appointment: <strong>{lead.date}</strong> at <strong className="font-bold">{lead.timeSlot}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Diagnostic Metadata Params */}
                      {lead.calculatorData && (
                        <div className="md:w-80 bg-slate-50 border border-slate-150 p-3 rounded-xl text-[11px] text-slate-500 space-y-1 font-mono shrink-0">
                          <div className="font-bold text-slate-700 text-[9px] uppercase tracking-wider border-b border-slate-200 pb-1 mb-1 flex items-center gap-1">
                            <Database className="w-3 h-3 text-slate-500" />
                            <span>Diagnostic Payload parameters</span>
                          </div>
                          
                          {/* Retirement tool metadata */}
                          {lead.metadata && (
                            <>
                              <div className="flex justify-between"><span>Age / Retire Age:</span> <strong className="text-slate-700">{lead.metadata.currentAge} / {lead.metadata.retirementAge}</strong></div>
                              <div className="flex justify-between"><span>Target Corpus:</span> <strong className="text-slate-700">₹{Math.round(lead.metadata.requiredCorpusAtRetirement || 0).toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Needed SIP:</span> <strong className="text-emerald-600">₹{Math.round(lead.metadata.requiredMonthlySip || 0).toLocaleString('en-IN')}/mo</strong></div>
                              <div className="flex justify-between"><span>Systematic Decumulation:</span> <strong className="text-slate-700">{lead.metadata.wealthScore}/100 Score</strong></div>
                            </>
                          )}

                          {/* Find Fund Type metadata */}
                          {lead.calculatorData.recommendedCategory && (
                            <>
                              <div className="flex justify-between"><span>Category Matched:</span> <strong className="text-slate-700 truncate max-w-[150px]" title={lead.calculatorData.recommendedCategory}>{lead.calculatorData.recommendedCategory}</strong></div>
                              <div className="flex justify-between"><span>Capital:</span> <strong className="text-slate-700">{lead.calculatorData.capitalType === 'sip' ? 'SIP' : 'Lumpsum'}</strong></div>
                              <div className="flex justify-between"><span>Amount:</span> <strong className="text-slate-700">₹{parseInt(lead.calculatorData.capitalAmount || 0).toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Horizon / Goal:</span> <strong className="text-slate-700">{lead.calculatorData.timeHorizon} Yrs | {lead.calculatorData.goal}</strong></div>
                            </>
                          )}

                          {/* AI Portfolio Auditor metadata */}
                          {lead.calculatorData.diversificationScore !== undefined && (
                            <>
                              <div className="flex justify-between"><span>Portfolio Score:</span> <strong className={`font-bold ${lead.calculatorData.diversificationScore >= 60 ? 'text-emerald-600' : 'text-rose-600'}`}>{lead.calculatorData.diversificationScore}/100</strong></div>
                              <div className="flex justify-between"><span>Total Schemes:</span> <strong className="text-slate-700">{lead.calculatorData.totalFunds}</strong></div>
                              {lead.calculatorData.totalInvested !== undefined && lead.calculatorData.totalInvested > 0 ? (
                                <div className="flex justify-between"><span>Total Investment Value:</span> <strong className="text-slate-700">₹{Math.round(lead.calculatorData.totalInvested).toLocaleString('en-IN')}</strong></div>
                              ) : null}
                              {lead.calculatorData.fileName && (
                                <div className="flex justify-between"><span>Statement File:</span> <strong className="text-slate-700 truncate max-w-[150px]" title={lead.calculatorData.fileName}>{lead.calculatorData.fileName}</strong></div>
                              )}
                              {lead.calculatorData.password && (
                                <div className="flex justify-between"><span>PDF Password:</span> <strong className="text-indigo-600 select-all font-mono bg-indigo-50 px-1 py-0.5 rounded text-[10px]">{lead.calculatorData.password}</strong></div>
                              )}
                              {lead.calculatorData.uploadedPdfBase64 && !lead.calculatorData.uploadedPdfBase64.startsWith('(') && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    try {
                                      let base64 = lead.calculatorData.uploadedPdfBase64;
                                      if (!base64.startsWith('data:')) {
                                        base64 = `data:${lead.calculatorData.fileType || 'application/pdf'};base64,${base64}`;
                                      }
                                      const link = document.createElement('a');
                                      link.href = base64;
                                      link.download = lead.calculatorData.fileName || 'statement.pdf';
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                    } catch (err) {
                                      console.error("Download failed:", err);
                                    }
                                  }}
                                  className="w-full mt-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold py-1.5 px-2 rounded-lg text-[10px] flex items-center justify-center gap-1.5 transition-all"
                                >
                                  <Download className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>Download Uploaded CAS PDF</span>
                                </button>
                              )}
                            </>
                          )}

                          {/* Cashflow Game Simulation metadata */}
                          {lead.type === 'cashflow_simulation' && (
                            <>
                              <div className="flex justify-between"><span>Freedom Status:</span> <strong className={lead.calculatorData.isWinner ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>{lead.calculatorData.isWinner ? "FINANCIALLY FREE 🎉" : "SHORTFALL ⚠️"}</strong></div>
                              <div className="flex justify-between"><span>Final Corpus:</span> <strong className="text-slate-800 font-bold">₹{Math.round(lead.calculatorData.finalCorpus || 0).toLocaleString('en-IN')}</strong></div>
                              <div className="flex justify-between"><span>Passive Yield:</span> <strong className="text-emerald-600">₹{Math.round(lead.calculatorData.passiveMonthlyYield || 0).toLocaleString('en-IN')}/mo</strong></div>
                              <div className="flex justify-between"><span>Freedom Ratio:</span> <strong className="text-slate-800">{lead.calculatorData.freedomRatioPercent}%</strong></div>
                              <div className="flex justify-between"><span>Advisor Appointed:</span> <strong className="text-slate-700">{lead.calculatorData.hasAdvisor ? "Yes (0.75% Fee)" : "No (DIY)"}</strong></div>
                              <div className="flex justify-between"><span>Scam Losses:</span> <strong className="text-rose-600">₹{Math.round(lead.calculatorData.moneyLostToTraps || 0).toLocaleString('en-IN')}</strong></div>
                              {lead.calculatorData.mindsetArchetype && (
                                <div className="flex justify-between"><span>Archetype:</span> <strong className="text-slate-700 truncate max-w-[140px]" title={lead.calculatorData.mindsetArchetype}>{lead.calculatorData.mindsetArchetype}</strong></div>
                              )}
                            </>
                          )}
                          {lead.calculatorData.matchedPortfolio && (
                            <>
                              <div className="flex justify-between"><span>Matched Blueprint:</span> <strong className="text-slate-700 truncate max-w-[150px]" title={lead.calculatorData.matchedPortfolio}>{lead.calculatorData.matchedPortfolio}</strong></div>
                              <div className="flex justify-between"><span>Expected Returns:</span> <strong className="text-slate-700">{lead.calculatorData.expectedReturns}</strong></div>
                              {lead.calculatorData.capitalAmount && (
                                <div className="flex justify-between"><span>Amount Allocation:</span> <strong className="text-slate-700">₹{parseInt(lead.calculatorData.capitalAmount || 0).toLocaleString('en-IN')} ({lead.calculatorData.capitalType})</strong></div>
                              )}
                            </>
                          )}

                          <div className="text-[8.5px] text-slate-400 pt-1 mt-1 border-t border-slate-100 flex justify-between select-none">
                            <span>Synced</span>
                            <span>Cloud Firestore</span>
                          </div>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </>
      ) : (
        /* ANALYTICS TAB CONTENT */
        <div className="space-y-6 text-left">
          
          {analyticsLoading || !analytics ? (
            <div className="py-20 text-center space-y-3 bg-white border border-slate-200 rounded-2xl">
              <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-mono">Compiling traffic metrics and geo locations in real-time...</p>
            </div>
          ) : (
            <>
              {/* Traffic Summary Bento Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Unique Visitors</span>
                    <Globe className="w-4 h-4 text-indigo-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black font-display text-slate-900">
                      {analytics.uniqueVisitors}
                    </span>
                    <span className="text-[10px] font-extrabold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">Real</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Distinct browser visitor fingerprints tracked.</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Repeat Visitors</span>
                    <Users className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black font-display text-slate-900">
                      {analytics.repeatVisitors}
                    </span>
                    <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {analytics.uniqueVisitors > 0 ? Math.round((analytics.repeatVisitors / analytics.uniqueVisitors) * 100) : 0}% Ratio
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Loyal users returning for multi-session usage.</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Page Views</span>
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black font-display text-slate-900">
                      {analytics.totalPageViews}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">clicks</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Total registered page transitions and pings.</p>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Avg Time Spent</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-3xl font-black font-display text-slate-900">
                      {formatTime(analytics.averageTimeSpent)}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Factual active duration spent per visitor session.</p>
                </div>

              </div>

              {/* Page Views & Tool Usages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Pages View Progress Bar list */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <BarChart2 className="w-4 h-4 text-indigo-500" />
                      <span>Traffic Breakdown by Website Section</span>
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Hits</span>
                  </div>

                  <div className="space-y-3.5">
                    {Object.entries(analytics.pagesViewed || {}).length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center">No page hits logged yet.</p>
                    ) : (
                      Object.entries(analytics.pagesViewed || {})
                        .sort((a: any, b: any) => b[1] - a[1])
                        .map(([pageId, count]: any) => {
                          const total = Object.values(analytics.pagesViewed).reduce((a: any, b: any) => a + b, 0) as number;
                          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                          
                          // Human-readable labels
                          const pageNames: Record<string, string> = {
                            home: 'Homepage Portal',
                            about: 'About Our Firm',
                            services: 'Financial Services Offerings',
                            calculators: 'Wealth Calculators Centre',
                            knowledge: 'Knowledge Hub & Journey',
                            connect: 'SIP Connection Form',
                            privacy: 'Privacy Compliance',
                            'find-fund': 'Exact Fund Recommendation Tool',
                            'find-fund-type': 'Fund Category Diagnostics',
                            'overlap-finder': 'Portfolio Mutual Fund Overlap Finder',
                            'portfolio-audit': 'AI CAS Portfolio Auditor',
                            'database-portal': 'Database & CRM Admin Portal'
                          };

                          return (
                            <div key={pageId} className="space-y-1 text-xs">
                              <div className="flex justify-between items-center text-slate-700 font-bold">
                                <span className="truncate max-w-[70%]">{pageNames[pageId] || pageId}</span>
                                <span className="font-mono text-slate-500">{count} views ({percent}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Diagnostic Tool Usage count */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-500" />
                      <span>Financial Tools Interaction Counter</span>
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Uses</span>
                  </div>

                  <div className="space-y-3.5">
                    {Object.entries(analytics.toolsUsed || {}).length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-6 text-center">No tool interactions registered yet.</p>
                    ) : (
                      Object.entries(analytics.toolsUsed || {})
                        .sort((a: any, b: any) => b[1] - a[1])
                        .map(([toolId, count]: any) => {
                          const total = Object.values(analytics.toolsUsed).reduce((a: any, b: any) => a + b, 0) as number;
                          const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                          
                          const toolNames: Record<string, string> = {
                            'retirement-calculator': 'Retirement & Decumulation Planner',
                            'find-fund': 'Exact Fund Selector Engine',
                            'overlap-finder': 'Mutual Fund Overlap Finder',
                            'portfolio-audit': 'CAS Statement AI Portfolio Auditor',
                            'find-fund-type': 'Mutual Fund Asset Class Diagnostic'
                          };

                          return (
                            <div key={toolId} className="space-y-1 text-xs">
                              <div className="flex justify-between items-center text-slate-700 font-bold">
                                <span className="truncate max-w-[75%]">{toolNames[toolId] || toolId}</span>
                                <span className="font-mono text-emerald-600">{count} submissions</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${percent}%` }} />
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

              </div>

              {/* Geographic & Demographics Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Geolocation List */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-500" />
                      <span>Factual Geolocation of Visitors</span>
                    </h3>
                    <span className="text-[9px] font-mono text-slate-400 font-bold uppercase">Visitors</span>
                  </div>

                  <div className="space-y-3">
                    {Object.entries(analytics.geographicLocations || {}).length === 0 ? (
                      <div className="text-center py-6 text-xs text-slate-400 italic">No geolocation logs tracked yet. Ensure client IP-lookup is active.</div>
                    ) : (
                      Object.entries(analytics.geographicLocations || {})
                        .sort((a: any, b: any) => b[1] - a[1])
                        .slice(0, 8)
                        .map(([location, count]: any, idx) => {
                          const total = Object.values(analytics.geographicLocations).reduce((a: any, b: any) => a + b, 0) as number;
                          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                          return (
                            <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                              <div className="flex items-center gap-2 max-w-[75%]">
                                <span className="text-[10px] font-mono text-slate-400">#{idx + 1}</span>
                                <span className="font-bold text-slate-700 truncate" title={location}>{location}</span>
                              </div>
                              <span className="font-mono font-bold text-slate-600 shrink-0 bg-slate-50 border border-slate-100 px-2.5 py-0.5 rounded-full text-[11px]">
                                {count} users ({percent}%)
                              </span>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>

                {/* Age & Gender Demographics */}
                <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-3xs space-y-5">
                  
                  {/* Gender Block */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-500" />
                        <span>Factual Gender Distribution (Audit & Calculators)</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      {['Male', 'Female', 'Non-Binary/Other'].map((gender) => {
                        const count = (analytics.demographics?.gender?.[gender] || 0) as number;
                        const total = Object.values(analytics.demographics?.gender || {}).reduce((a: any, b: any) => a + b, 0) as number;
                        const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                        return (
                          <div key={gender} className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl text-center">
                            <span className="text-[10px] font-semibold text-slate-400 block uppercase tracking-wider">{gender}</span>
                            <strong className="text-base font-black text-slate-800 block mt-1">{count}</strong>
                            <span className="text-[10px] text-blue-600 font-bold mt-0.5 block">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Age Block */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>Factual Age Demographics</span>
                      </h4>
                    </div>

                    <div className="grid grid-cols-5 gap-1.5 text-center">
                      {['18-25', '26-35', '36-45', '46-55', '56+'].map((ageRange) => {
                        const count = (analytics.demographics?.age?.[ageRange] || 0) as number;
                        const total = Object.values(analytics.demographics?.age || {}).reduce((a: any, b: any) => a + b, 0) as number;
                        const percent = total > 0 ? Math.round((count / total) * 100) : 0;

                        return (
                          <div key={ageRange} className="bg-slate-50 border border-slate-150 p-1.5 rounded-xl">
                            <span className="text-[9px] font-bold text-slate-400 block tracking-tight">{ageRange}</span>
                            <strong className="text-sm font-black text-slate-800 block mt-0.5">{count}</strong>
                            <span className="text-[9px] text-indigo-600 font-bold block">{percent}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>

              </div>

              {/* Live Traffic Activity stream */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-3xs">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                      <Activity className="w-4.5 h-4.5 text-indigo-600" />
                      <span>Live Traffic & Session Activity Stream</span>
                    </h3>
                    <p className="text-[11px] text-slate-400">Factual logs mapping exact click flows and active visitor sessions.</p>
                  </div>
                  <span className="font-mono font-bold text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full animate-pulse">
                    🟢 REAL-TIME ACTIVE
                  </span>
                </div>

                <div className="divide-y divide-slate-100 text-left">
                  {!analytics.visitorLog || analytics.visitorLog.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 italic text-xs">No user activity registered yet. Visit different pages to generate traffic logs!</div>
                  ) : (
                    analytics.visitorLog
                      .slice()
                      .reverse()
                      .map((log: any, idx: number) => {
                        const isRepeat = log.isRepeat;
                        const pagesFlow = log.pagesFlow || [];

                        return (
                          <div key={idx} className="p-5 hover:bg-slate-50/50 transition-all flex flex-col md:flex-row gap-4 items-start text-xs text-slate-600">
                            
                            {/* Visitor Identity */}
                            <div className="md:w-56 shrink-0 space-y-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-[10px] text-slate-400 font-bold block">
                                  #{idx + 1} • {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-1.5">
                                <span className="font-mono text-[9.5px] font-black text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                  {log.visitorId ? log.visitorId.slice(0, 14) + '...' : 'visitor-unknown'}
                                </span>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                                  isRepeat 
                                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}>
                                  {isRepeat ? 'Repeat Visitor' : 'New Visitor'}
                                </span>
                              </div>

                              <div className="space-y-1 pt-1 font-sans">
                                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
                                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                                  <span className="truncate" title={log.location}>{log.location || 'Locating IP...'}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-400">
                                  <User className="w-3 h-3 shrink-0" />
                                  <span>Age / Gender: <strong className="text-slate-500">{log.demographics?.age || 'Unknown'} / {log.demographics?.gender || 'Unknown'}</strong></span>
                                </div>
                              </div>
                            </div>

                            {/* Session Click Flow */}
                            <div className="flex-1 space-y-2">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Active Click stream & Session Navigation flow:</span>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                {pagesFlow.length === 0 ? (
                                  <span className="bg-slate-100 text-slate-500 py-1 px-2.5 rounded-lg border border-slate-150">Landed on {log.currentPage}</span>
                                ) : (
                                  pagesFlow.map((pageId: string, pageIdx: number) => {
                                    const cleanLabel: Record<string, string> = {
                                      home: 'Home',
                                      about: 'About',
                                      services: 'Services',
                                      calculators: 'Calculators',
                                      knowledge: 'Knowledge Hub',
                                      connect: 'SIP Now',
                                      privacy: 'Privacy',
                                      'find-fund': 'Exact Fund Selector',
                                      'find-fund-type': 'Category Diagnostics',
                                      'overlap-finder': 'Overlap Finder',
                                      'portfolio-audit': 'CAS Auditor',
                                      'database-portal': 'CRM Admin'
                                    };

                                    return (
                                      <React.Fragment key={pageIdx}>
                                        {pageIdx > 0 && <ChevronRight className="w-3 h-3 text-slate-355 text-slate-300" />}
                                        <span className={`py-1 px-2.5 rounded-lg border text-xs font-bold ${
                                          pageIdx === pagesFlow.length - 1 
                                            ? 'bg-indigo-600 text-white border-indigo-700 shadow-3xs'
                                            : 'bg-slate-50 text-slate-600 border-slate-200'
                                        }`}>
                                          {cleanLabel[pageId] || pageId}
                                        </span>
                                      </React.Fragment>
                                    );
                                  })
                                )}
                              </div>
                            </div>

                            {/* Session Timespent */}
                            <div className="md:w-32 shrink-0 md:text-right text-left">
                              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wide block">Duration</span>
                              <strong className="text-sm font-black font-display text-slate-900 block mt-1">
                                {formatTime(log.timeSpent || 0)}
                              </strong>
                              <span className="text-[9px] text-slate-400 mt-1 block">Active on page</span>
                            </div>

                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </>
          )}

        </div>
      )}

    </div>
  );
}
