/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { Calculator, Coins, ShieldPlus, TrendingUp, Info, ArrowUpRight, Briefcase, Milestone, Sparkles, HelpCircle, RefreshCw, Layers, Activity, Check, Phone, ArrowRight, ChevronRight, ChevronLeft, Calendar, Clock, Mail, FileText, CheckCircle2, Zap, MessageSquare, AlertTriangle, Terminal } from 'lucide-react';
// @ts-ignore
import html2pdf from 'html2pdf.js';
import FundFinderPromoBanner from './FundFinderPromoBanner';

interface CalculatorsViewProps {
  setCurrentPage: (page: any) => void;
  initialTab?: 'sip' | 'allocator' | 'retirement';
}

export default function CalculatorsView({ setCurrentPage, initialTab }: CalculatorsViewProps) {
  const [activeTab, setActiveTab] = useState<'sip' | 'allocator' | 'retirement'>(initialTab || 'sip');

  const formatInLakhs = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Crore`;
    }
    return `₹${(val / 100000).toFixed(1)} Lakhs`;
  };

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const handleLeadSubmit = async (e: React.FormEvent, type: 'consult' | 'pdf' | 'whatsapp') => {
    e.preventDefault();
    setLeadFormError('');
    try {
      const submittedName = leadName;
      const submittedEmail = type === 'pdf' ? pdfEmail : leadEmail;
      const submittedPhone = leadPhone;

      const payload = {
        type,
        name: submittedName,
        phone: submittedPhone,
        email: submittedEmail,
        date: type === 'consult' ? leadDate : '',
        timeSlot: type === 'consult' ? leadTimeSlot : '',
        calculatorData: {
          currentAge,
          retirementAge,
          requiredCorpusAtRetirement: retirementData.totalRequiredCorpusAtRetirement,
          requiredMonthlySip: retirementData.requiredMonthlySip,
          wealthScore: Math.max(15, Math.min(100, Math.round((retirementData.currentMonthlySurplus / Math.max(1, retirementData.requiredMonthlySip)) * 100)))
        }
      };

      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      let resData: any = null;
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        resData = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text.slice(0, 150) || `Request failed with status ${res.status}`);
      }

      if (!res.ok) {
        throw new Error(resData?.error || 'Failed to submit form');
      }

      setLeadFormSuccess(true);
      
      // Clear fields
      setLeadName('');
      setLeadPhone('');
      setLeadEmail('');
      setPdfEmail('');
      setLeadDate('');
      setLeadTimeSlot('');

      if (type === 'pdf') {
        generateAndDownloadPdf(submittedName, submittedEmail, submittedPhone);
      }
    } catch (err: any) {
      setLeadFormError(err.message || 'An unexpected error occurred. Please try again.');
    }
  };

  // Calculator 3 Onboarding Wizard & Lead Capture States
  const [retirementStep, setRetirementStep] = useState<number>(1);
  const [showRetirementResults, setShowRetirementResults] = useState<boolean>(true); // Defaults to true since inputs and results are on the same page now!
  const [leadName, setLeadName] = useState<string>('');
  const [leadPhone, setLeadPhone] = useState<string>('');
  const [leadEmail, setLeadEmail] = useState<string>('');
  const [leadDate, setLeadDate] = useState<string>('');
  const [leadTimeSlot, setLeadTimeSlot] = useState<string>('');
  const [leadFormSuccess, setLeadFormSuccess] = useState<boolean>(false);
  const [leadFormError, setLeadFormError] = useState<string>('');
  const [activeLeadOption, setActiveLeadOption] = useState<'consult' | 'pdf' | 'whatsapp'>('consult');
  const [pdfEmail, setPdfEmail] = useState<string>('');
  const [pdfSuccess, setPdfSuccess] = useState<boolean>(false);
  const [callbackRequested, setCallbackRequested] = useState<boolean>(false);
  const [callbackPhone, setCallbackPhone] = useState<string>('');
  const [generatingPdf, setGeneratingPdf] = useState<boolean>(false);

  const formatCurrencyForPdf = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const generateAndDownloadPdf = (name: string, email: string, phone: string) => {
    setGeneratingPdf(true);
    const element = document.createElement('div');
    element.style.width = '790px';
    element.style.fontFamily = '"Inter", sans-serif';
    element.style.color = '#1e293b';
    element.style.backgroundColor = '#ffffff';

    const wealthScore = Math.max(15, Math.min(100, Math.round((retirementData.currentMonthlySurplus / Math.max(1, retirementData.requiredMonthlySip)) * 100)));
    const flatSipAmt = retirementData.requiredMonthlySip;
    const stepUpSipAmt = retirementData.requiredMonthlySipStepUp;
    const flatPct = currentMonthlyIncome > 0 ? ((flatSipAmt / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
    const stepUpPct = currentMonthlyIncome > 0 ? ((stepUpSipAmt / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
    
    element.innerHTML = `
      <!-- PAGE 1: COVER PAGE -->
      <div style="padding: 50px 40px; height: 1040px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(to right, #3b82f6, #4f46e5, #10b981);"></div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-top: 10px;">
          <div style="font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; color: #4f46e5;">FINANCIAL FREEDOM ROADMAP</div>
          <div style="font-size: 10px; font-weight: bold; color: #64748b; font-family: monospace; letter-spacing: 0.5px;">CONFIDENTIAL ADVISORY DOCUMENT</div>
        </div>

        <div style="margin-top: 120px; margin-bottom: 120px;">
          <div style="font-size: 10px; font-weight: 800; background-color: #f59e0b; color: #0f172a; padding: 5px 12px; border-radius: 4px; display: inline-block; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px;">
            Structured Decumulation Strategy
          </div>
          <h1 style="font-size: 38px; font-weight: 800; color: #0f172a; line-height: 1.25; margin: 0; letter-spacing: -0.5px;">
            PERSONAL RETIREMENT<br/><span style="color: #4f46e5;">FREEDOM BLUEPRINT</span>
          </h1>
          <p style="font-size: 14px; color: #475569; margin-top: 20px; max-width: 540px; line-height: 1.6;">
            A high-precision capital preservation and compounding roadmap engineered to convert your lifetime savings into a bulletproof monthly salary loop.
          </p>
        </div>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 30px; display: flex; justify-content: space-between; align-items: center;">
          <div style="text-align: left;">
            <div style="font-size: 9px; font-weight: bold; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px;">PREPARED FOR</div>
            <div style="font-size: 20px; font-weight: 800; color: #0f172a; margin-top: 5px;">${name}</div>
            <div style="font-size: 12px; color: #475569; margin-top: 3px;">Email: ${email} | Contact: ${phone}</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 15px; font-weight: 500;">Analysis Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          </div>
          <div style="text-align: center; background-color: #ffffff; border: 2px solid #e2e8f0; border-radius: 14px; padding: 18px 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); width: 180px;">
            <div style="font-size: 9px; font-weight: bold; color: #4f46e5; text-transform: uppercase; letter-spacing: 0.5px;">FREEDOM SCORE</div>
            <div style="font-size: 40px; font-weight: 900; color: ${wealthScore >= 75 ? '#10b981' : wealthScore >= 45 ? '#f59e0b' : '#ef4444'}; margin-top: 3px; line-height: 1;">${wealthScore}<span style="font-size: 18px; color: #94a3b8; font-weight: 500;">/100</span></div>
            <div style="font-size: 11px; color: #475569; font-weight: bold; margin-top: 6px;">${wealthScore >= 75 ? 'Excellent Runway' : wealthScore >= 45 ? 'Action Advised' : 'Capital Warning'}</div>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 500;">
          <div>© Private Wealth Architects. All rights reserved. Registered client copy.</div>
          <div>Page 1 of 4</div>
        </div>
      </div>

      <!-- PAGE 2: PARAMETERS & EXECUTIVE SUMMARY -->
      <div style="padding: 50px 40px; height: 1040px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(to right, #3b82f6, #4f46e5, #10b981);"></div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 10px;">
            <div style="font-size: 11px; font-weight: bold; color: #4f46e5; text-transform: uppercase;">I. FINANCIAL PARAMETERS & RETIREMENT GAP</div>
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">RUNWAY DATA</div>
          </div>

          <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 25px; letter-spacing: -0.5px;">Executive Financial Metrics Summary</h2>
          <p style="font-size: 12.5px; color: #475569; margin-top: 6px; line-height: 1.5;">
            Calculated instantly based on your target decumulation profile and assumed pre-retirement/post-retirement CAGR values.
          </p>

          <div style="margin-top: 25px; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; text-align: left;">
              <thead>
                <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                  <th style="padding: 14px 18px; font-weight: 700; color: #475569; width: 60%;">Financial Parameter</th>
                  <th style="padding: 14px 18px; font-weight: 700; color: #475569; text-align: right;">Value</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Current Age / Planned Retirement Age</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #0f172a;">${currentAge} Years / ${retirementAge} Years</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Planned Accumulation Window (Savings Runway)</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #4f46e5;">${retirementData.yearsToRetirement} Years of Compounding</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Living Expenses Today (Monthly)</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #0f172a;">${formatCurrencyForPdf(currentMonthlyExpense)} / month</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Assumed Annual Inflation Rate</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #ef4444;">${inflationRateRetirement}% per year</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Living Expenses at Retirement (Inflation-Adjusted)</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #e11d48; background-color: #fff1f2;">${formatCurrencyForPdf(retirementData.futureMonthlyExpense)} / month</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Expected Investment Return rate (Pre-Retirement / Post-Retirement)</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #10b981;">${preRetirementReturn}% / 8.5% CAGR</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9; background-color: #f8fafc;">
                  <td style="padding: 13px 18px; color: #0f172a; font-weight: 800;">TOTAL REQUIRED CORPUS AT RETIREMENT AGE</td>
                  <td style="padding: 13px 18px; font-weight: 900; text-align: right; color: #1e3a8a; font-size: 13px;">${formatCurrencyForPdf(retirementData.totalRequiredCorpusAtRetirement)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Existing Nest-Egg Projected Value at Retirement</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #0f172a;">${formatCurrencyForPdf(retirementData.futureValueOfExistingSavings)}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 11px 18px; color: #334155; font-weight: 500;">Net Retirement Capital Gap to be Met</td>
                  <td style="padding: 11px 18px; font-weight: 700; text-align: right; color: #ef4444;">${formatCurrencyForPdf(retirementData.netCorpusGap)}</td>
                </tr>
                <tr style="background-color: #f0fdf4; border-bottom: 1px solid #bbf7d0;">
                  <td style="padding: 12px 18px; color: #166534; font-weight: 800;">REQUIRED MONTHLY SAVINGS (FLAT SIP)</td>
                  <td style="padding: 12px 18px; font-weight: 900; text-align: right; color: #15803d; font-size: 13.5px;">
                    ${formatCurrencyForPdf(flatSipAmt)} / month
                    <div style="font-size: 9.5px; font-weight: 700; color: #16a34a; margin-top: 2px;">(${flatPct}% of Salary)</div>
                  </td>
                </tr>
                <tr style="background-color: #eef2ff;">
                  <td style="padding: 12px 18px; color: #3730a3; font-weight: 800;">REQUIRED MONTHLY SAVINGS (SMART STEP-UP SIP)</td>
                  <td style="padding: 12px 18px; font-weight: 900; text-align: right; color: #4f46e5; font-size: 13.5px;">
                    ${formatCurrencyForPdf(stepUpSipAmt)} / month
                    <div style="font-size: 9.5px; font-weight: 700; color: #6366f1; margin-top: 2px;">(Starting at ${stepUpPct}% of Salary with ${stepUpPercentRetirement}% yearly increase)</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Feasibility Callout -->
          <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; margin-top: 25px; text-align: left; display: flex; gap: 15px; align-items: start;">
            <div style="font-size: 22px; line-height: 1;">💡</div>
            <div>
              <h4 style="font-size: 13px; font-weight: 800; color: #1e3a8a; margin: 0;">Roadmap Feasibility Analysis</h4>
              <p style="font-size: 11.5px; color: #1e40af; line-height: 1.5; margin-top: 5px; margin-bottom: 0;">
                Your reported monthly financial surplus is <strong>${formatCurrencyForPdf(retirementData.currentMonthlySurplus)}</strong>.
                ${retirementData.currentMonthlySurplus >= retirementData.requiredMonthlySip 
                  ? `Excellent! Your current monthly surplus comfortably covers the target monthly SIP of <strong>${formatCurrencyForPdf(retirementData.requiredMonthlySip)}</strong>. Your retirement strategy is fully funded.`
                  : `Your target monthly SIP of <strong>${formatCurrencyForPdf(retirementData.requiredMonthlySip)}</strong> is larger than your current monthly surplus. We recommend initiating a <strong>Step-Up SIP</strong> (increasing monthly savings by 10% each year) to close this gap easily without changing your lifestyle.`
                }
              </p>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 500;">
          <div>© Private Wealth Architects. All rights reserved. Registered client copy.</div>
          <div>Page 2 of 4</div>
        </div>
      </div>

      <!-- PAGE 3: STRATEGY OPTIMIZER MENU -->
      <div style="padding: 50px 40px; height: 1040px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; page-break-after: always; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(to right, #3b82f6, #4f46e5, #10b981);"></div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 10px;">
            <div style="font-size: 11px; font-weight: bold; color: #4f46e5; text-transform: uppercase;">II. ESSENTIAL FREEDOM STRATEGY OPTIMIZER</div>
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">STRATEGY MENU</div>
          </div>

          <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 25px; letter-spacing: -0.5px;">Freedom Optimizer Strategy Menu</h2>
          <p style="font-size: 12.5px; color: #475569; margin-top: 6px; line-height: 1.5; margin-bottom: 25px;">
            Compare our three baseline retirement scenarios to choose the savings runway that fits your lifestyle. Each option presents both Flat and compounding Step-up monthly savings targets.
          </p>

          <div style="display: flex; flex-direction: column; gap: 15px;">
            ${retirementData.scenarios.map((s: any) => {
              return `
                <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; background-color: #f8fafc; text-align: left;">
                  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 8px; margin-bottom: 10px;">
                    <div style="font-size: 13.5px; font-weight: 800; color: #0f172a;">${s.title}</div>
                    <span style="font-size: 9px; font-weight: 800; color: #4f46e5; background-color: #e0e7ff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">${s.pillText}</span>
                  </div>
                  
                  <p style="font-size: 11px; color: #475569; line-height: 1.4; margin: 0 0 12px 0;">
                    ${s.description}
                  </p>

                  <div style="display: flex; justify-content: space-between; gap: 15px;">
                    <!-- Flat SIP column -->
                    <div style="flex: 1; background-color: #ffffff; border: 1px solid #f1f5f9; border-radius: 8px; padding: 10px 12px;">
                      <div style="font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase;">Flat SIP Required</div>
                      <div style="font-size: 15px; font-weight: 800; color: #334155; margin-top: 3px;">
                        ${formatCurrencyForPdf(s.sips.flatSip)}<span style="font-size: 10px; font-weight: normal; color: #64748b;">/mo</span>
                      </div>
                      <div style="font-size: 9.5px; font-weight: 700; color: #475569; margin-top: 3px; font-family: monospace;">
                        ${s.percentOfSalaryFlat}% of Salary
                      </div>
                    </div>

                    <!-- Step-Up SIP column -->
                    <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px 12px;">
                      <div style="font-size: 9px; font-weight: 700; color: #166534; text-transform: uppercase;">Step-Up SIP Required</div>
                      <div style="font-size: 15.5px; font-weight: 900; color: #15803d; margin-top: 3px;">
                        ${formatCurrencyForPdf(s.sips.stepUpSip)}<span style="font-size: 10px; font-weight: normal; color: #166534;">/mo</span>
                      </div>
                      <div style="font-size: 9.5px; font-weight: 700; color: #166534; margin-top: 3px; font-family: monospace;">
                        ${s.percentOfSalaryStepUp}% of Salary
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 500;">
          <div>© Private Wealth Architects. All rights reserved. Registered client copy.</div>
          <div>Page 3 of 4</div>
        </div>
      </div>

      <!-- PAGE 4: 3-BUCKET SYSTEM -->
      <div style="padding: 50px 40px; height: 1040px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; position: relative;">
        <div style="position: absolute; top: 0; left: 0; right: 0; height: 8px; background: linear-gradient(to right, #3b82f6, #4f46e5, #10b981);"></div>

        <div>
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-top: 10px;">
            <div style="font-size: 11px; font-weight: bold; color: #4f46e5; text-transform: uppercase;">III. THE 3-BUCKET TACTICAL ALLOCATION STRATEGY</div>
            <div style="font-size: 10px; color: #94a3b8; font-family: monospace;">DECUMULATION MODEL</div>
          </div>

          <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin-top: 25px; letter-spacing: -0.5px;">The Self-Restoring Decumulation Loop</h2>
          <p style="font-size: 12.5px; color: #475569; margin-top: 6px; line-height: 1.5;">
            By separating your total corpus of <strong>${formatCurrencyForPdf(retirementData.totalRequiredCorpusAtRetirement)}</strong> into three distinct risk-stratified buckets, you prevent panic-selling during stock market recessions.
          </p>

          <div style="margin-top: 25px; display: flex; flex-direction: column; gap: 15px;">
            <!-- Bucket 1 -->
            <div style="border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background-color: #f8fafc;">
              <div style="width: 70%; text-align: left;">
                <span style="font-size: 9px; font-weight: 800; color: #475569; background-color: #e2e8f0; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; tracking-wider; display: inline-block;">Bucket 1: Cash/Liquidity (Years 1-5 payouts)</span>
                <h4 style="font-size: 14px; font-weight: 700; color: #1e293b; margin-top: 8px; margin-bottom: 4px;">Immediate Income Buffer</h4>
                <p style="font-size: 11px; color: #475569; line-height: 1.4; margin: 0;">
                  Placed in highly stable arbitrage and liquid mutual funds targeting <strong>~6.5% CAGR</strong>. Provides uninterrupted monthly cash flows for your first 5 years of retirement, insulating you from short-term volatility.
                </p>
              </div>
              <div style="text-align: right; background-color: #ffffff; border-left: 4px solid #64748b; padding: 10px 15px; border-radius: 0 8px 8px 0; width: 25%; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                <div style="font-size: 9px; color: #94a3b8; font-weight: 700; text-transform: uppercase;">SIZE</div>
                <div style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 3px;">${formatCurrencyForPdf(retirementData.bucket1Arbitrage)}</div>
              </div>
            </div>

            <!-- Bucket 2 -->
            <div style="border: 1px solid #e0e7ff; border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background-color: #f5f3ff;">
              <div style="width: 70%; text-align: left;">
                <span style="font-size: 9px; font-weight: 800; color: #4f46e5; background-color: #e0e7ff; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; tracking-wider; display: inline-block;">Bucket 2: Conservative Hybrid (Years 6-10 payouts)</span>
                <h4 style="font-size: 14px; font-weight: 700; color: #4338ca; margin-top: 8px; margin-bottom: 4px;">The Inflation Bridge</h4>
                <p style="font-size: 11px; color: #5b21b6; line-height: 1.4; margin: 0;">
                  Invested in conservative or equity savings hybrid mutual funds targeting <strong>~8.5% CAGR</strong>. Left untouched to compound quietly during Years 1-5, then systematically transferred to fund Years 6-10.
                </p>
              </div>
              <div style="text-align: right; background-color: #ffffff; border-left: 4px solid #4f46e5; padding: 10px 15px; border-radius: 0 8px 8px 0; width: 25%; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                <div style="font-size: 9px; color: #a78bfa; font-weight: 700; text-transform: uppercase;">SIZE</div>
                <div style="font-size: 15px; font-weight: 800; color: #5b21b6; margin-top: 3px;">${formatCurrencyForPdf(retirementData.bucket2Hybrid)}</div>
              </div>
            </div>

            <!-- Bucket 3 -->
            <div style="border: 1px solid #fef3c7; border-radius: 12px; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; background-color: #fffbeb;">
              <div style="width: 70%; text-align: left;">
                <span style="font-size: 9px; font-weight: 800; color: #b45309; background-color: #fef3c7; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; tracking-wider; display: inline-block;">Bucket 3: Diversified Equity (Years 11-15+ payouts)</span>
                <h4 style="font-size: 14px; font-weight: 700; color: #b45309; margin-top: 8px; margin-bottom: 4px;">Generational Wealth Compounder</h4>
                <p style="font-size: 11px; color: #92400e; line-height: 1.4; margin: 0;">
                  Invested in highly diversified flexi-cap or multi-cap active equity mutual funds targeting <strong>~12% CAGR</strong>. Left untouched for 10-15 years to compound massively.
                </p>
              </div>
              <div style="text-align: right; background-color: #ffffff; border-left: 4px solid #f59e0b; padding: 10px 15px; border-radius: 0 8px 8px 0; width: 25%; box-sizing: border-box; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                <div style="font-size: 9px; color: #f59e0b; font-weight: 700; text-transform: uppercase;">SIZE</div>
                <div style="font-size: 15px; font-weight: 800; color: #b45309; margin-top: 3px;">${formatCurrencyForPdf(retirementData.bucket3Equity)}</div>
              </div>
            </div>
          </div>

          <!-- Loop explanation -->
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 18px; margin-top: 25px; text-align: left; display: flex; gap: 15px; align-items: start;">
            <div style="font-size: 22px; line-height: 1;">🔄</div>
            <div>
              <h4 style="font-size: 13px; font-weight: 800; color: #166534; margin: 0;">The Loop: Bucket 3 Restoration Effect</h4>
              <p style="font-size: 11.5px; color: #15803d; line-height: 1.5; margin-top: 5px; margin-bottom: 0;">
                By Year 15, Buckets 1 and 2 are fully liquidated. However, your active Bucket 3 (Equity) has compounded untouched for 15 years, growing from <strong>${formatCurrencyForPdf(retirementData.bucket3Equity)}</strong> into a massive <strong>${formatCurrencyForPdf(retirementData.bucket3FutureValue15Years)}</strong>! This fully restores your original starting capital to begin the cycle again, ensuring a lifelong, self-funding retirement.
              </p>
            </div>
          </div>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; font-weight: 500;">
          <div>© Private Wealth Architects. All rights reserved. Registered client copy.</div>
          <div>Page 4 of 4</div>
        </div>
      </div>
    `;

    const opt: any = {
      margin:       0,
      filename:     `Financial_Freedom_Blueprint_${name.replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf()
      .set(opt)
      .from(element)
      .save()
      .then(() => {
        setGeneratingPdf(false);
      })
      .catch((err: any) => {
        console.error("PDF download failed:", err);
        setGeneratingPdf(false);
      });
  };
  const [sipAmount, setSipAmount] = useState<number>(25000); // 25,000 INR
  const [lumpSumAmount, setLumpSumAmount] = useState<number>(0); // 0 INR
  const [expectedReturn, setExpectedReturn] = useState<number>(14); // 14%
  const [years, setYears] = useState<number>(15);
  const [enableStepUp, setEnableStepUp] = useState<boolean>(false);
  const [stepUpPercent, setStepUpPercent] = useState<number>(10); // 10% default
  const [adjustInflation, setAdjustInflation] = useState<boolean>(false);
  const [inflationRate, setInflationRate] = useState<number>(6); // 6% default

  // Calculator 2: Profiler Allocator State
  const [goalType, setGoalType] = useState<'wealth' | 'retirement' | 'education'>('wealth');
  const [timeHorizon, setTimeHorizon] = useState<'short' | 'medium' | 'long'>('long');
  const [riskFactor, setRiskFactor] = useState<'moderate' | 'aggressive'>('aggressive');

  // Calculator 3: Financial Freedom & Retirement State
  const [currentAge, setCurrentAge] = useState<number>(35);
  const [retirementAge, setRetirementAge] = useState<number>(60);
  const [lifeExpectancy, setLifeExpectancy] = useState<number>(85);
  const [currentMonthlyIncome, setCurrentMonthlyIncome] = useState<number>(150000); // 1.5 Lakhs default
  const [expenseBasicSurvival, setExpenseBasicSurvival] = useState<number>(25000);
  const [expenseLifestyle, setExpenseLifestyle] = useState<number>(15000);
  const [expenseLuxuries, setExpenseLuxuries] = useState<number>(10000);
  const currentMonthlyExpense = expenseBasicSurvival + expenseLifestyle + expenseLuxuries;
  const [stepUpPercentRetirement, setStepUpPercentRetirement] = useState<number>(10);
  const [annualBonusRetirement, setAnnualBonusRetirement] = useState<number>(200000);
  const [bonusYearsRetirement, setBonusYearsRetirement] = useState<number>(10);
  const [inflationRateRetirement, setInflationRateRetirement] = useState<number>(6); // 6%
  const [estateAmount, setEstateAmount] = useState<number>(0); // want to leave any estate? Default 0
  const [existingSavings, setExistingSavings] = useState<number>(1500000); // 15 Lakhs default
  const [expectedLumpSum, setExpectedLumpSum] = useState<number>(5000000); // 50 Lakhs default
  const [preRetirementReturn, setPreRetirementReturn] = useState<number>(10); // 10% expected return on pre-retirement SIP/Savings
  const [oneTimeRetirementGoal, setOneTimeRetirementGoal] = useState<number>(2000000); // 20 Lakhs default for "amount required at the time of retirement"

  // Loan & EMI States
  const [totalLoanAmount, setTotalLoanAmount] = useState<number>(1500000); // 15 Lakhs default
  const [emi1Amount, setEmi1Amount] = useState<number>(15000);
  const [emi1Years, setEmi1Years] = useState<number>(5);
  const [emi2Amount, setEmi2Amount] = useState<number>(0);
  const [emi2Years, setEmi2Years] = useState<number>(0);
  const [emi3Amount, setEmi3Amount] = useState<number>(0);
  const [emi3Years, setEmi3Years] = useState<number>(0);

  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('baseline-no-lump');

  const applyScenario = (id: string) => {
    if (selectedStrategyId === id) return;
    
    // We compute the age adjustment depending on transition to prevent compounding bugs:
    if (selectedStrategyId === 'baseline-no-lump') {
      if (id === 'retire-3-no-lump') {
        setRetirementAge(prev => Math.min(85, prev + 3));
      } else if (id === 'retire-5-no-lump') {
        setRetirementAge(prev => Math.min(85, prev + 5));
      }
    } else if (selectedStrategyId === 'retire-3-no-lump') {
      if (id === 'baseline-no-lump') {
        setRetirementAge(prev => Math.max(18, prev - 3));
      } else if (id === 'retire-5-no-lump') {
        setRetirementAge(prev => Math.min(85, prev + 2));
      }
    } else if (selectedStrategyId === 'retire-5-no-lump') {
      if (id === 'baseline-no-lump') {
        setRetirementAge(prev => Math.max(18, prev - 5));
      } else if (id === 'retire-3-no-lump') {
        setRetirementAge(prev => Math.max(18, prev - 2));
      }
    }
    
    setSelectedStrategyId(id);
    
    // Reset lump sums and bonuses as these are "no lump sum" baseline strategies
    setExpectedLumpSum(0);
    setAnnualBonusRetirement(0);
  };

  const handleCurrentAgeChange = (val: number) => {
    setCurrentAge(val);
  };

  const handleCurrentAgeBlur = () => {
    const val = Math.max(18, Math.min(80, currentAge || 18));
    setCurrentAge(val);
    if (val >= retirementAge) {
      const nextRetire = val + 5;
      setRetirementAge(nextRetire);
      if (nextRetire >= lifeExpectancy) {
        setLifeExpectancy(nextRetire + 15);
      }
    }
  };

  const handleRetirementAgeChange = (val: number) => {
    setRetirementAge(val);
  };

  const handleRetirementAgeBlur = () => {
    const val = Math.max(currentAge + 1, Math.min(90, retirementAge || (currentAge + 5)));
    setRetirementAge(val);
    if (val >= lifeExpectancy) {
      setLifeExpectancy(val + 5);
    }
  };

  const handleLifeExpectancyChange = (val: number) => {
    setLifeExpectancy(val);
  };

  const handleLifeExpectancyBlur = () => {
    const val = Math.max(retirementAge + 1, Math.min(110, lifeExpectancy || (retirementAge + 15)));
    setLifeExpectancy(val);
  };

  // Retirement Math & Bucketing Strategy Computing
  const retirementData = useMemo(() => {
    // Sanitize values for calculation to prevent layout issues / negative timelines during typing
    const safeCurrentAge = Math.max(1, currentAge || 18);
    const safeRetirementAge = Math.max(safeCurrentAge + 1, retirementAge || (safeCurrentAge + 5));
    const safeLifeExpectancy = Math.max(safeRetirementAge + 1, lifeExpectancy || (safeRetirementAge + 15));

    const yearsToRetirement = Math.max(1, safeRetirementAge - safeCurrentAge);
    const yearsInRetirement = Math.max(1, safeLifeExpectancy - safeRetirementAge);
    
    // Future Monthly Expense in the first year of retirement
    const futureMonthlyExpense = currentMonthlyExpense * Math.pow(1 + inflationRateRetirement / 100, yearsToRetirement);
    
    // Total retirement corpus including inflation adjustment
    // Using a 2% real rate of return as defined by the industry-standard expert planning guidelines
    const realAnnualRate = 0.02; 
    const r_real_monthly = realAnnualRate / 12;
    const totalMonths = yearsInRetirement * 12;
    
    // Present Value of an annuity due (withdrawing at the beginning of each month)
    const annuityFactor = (1 - Math.pow(1 + r_real_monthly, -totalMonths)) / r_real_monthly;
    const requiredCorpusForExpenses = futureMonthlyExpense * annuityFactor * (1 + r_real_monthly);
    
    // Future estate value discounted back to age 60 (at 2% real rate of return)
    const estateDiscountFactor = Math.pow(1 + realAnnualRate, -yearsInRetirement);
    const requiredEstateCorpus = estateAmount * estateDiscountFactor;
    
    // Total required corpus including expenses corpus, estate corpus AND oneTimeRetirementGoal required exactly at retirement age
    const totalRequiredCorpusAtRetirement = requiredCorpusForExpenses + requiredEstateCorpus + oneTimeRetirementGoal;
    
    // Future Value of existing savings at preRetirementReturn CAGR
    const futureValueOfExistingSavings = existingSavings * Math.pow(1 + preRetirementReturn / 100, yearsToRetirement);
    
    // Lump sums expected at retirement (NPS, EPF, Gratuity, etc.)
    const lumpSumsAtRetirement = expectedLumpSum;
    
    // Future value of annual bonuses / lump sum investments compounding
    let futureValueOfBonuses = 0;
    const k_bonus = Math.min(bonusYearsRetirement, yearsToRetirement);
    for (let y = 1; y <= k_bonus; y++) {
      futureValueOfBonuses += annualBonusRetirement * Math.pow(1 + preRetirementReturn / 100, yearsToRetirement - y + 1);
    }

    // Net gap to be met by new SIP
    const netCorpusGap = Math.max(0, totalRequiredCorpusAtRetirement - futureValueOfExistingSavings - lumpSumsAtRetirement - futureValueOfBonuses);
    
    // Required Monthly SIP to cover the net gap (True CAGR compounding formula)
    const preRetirementMonthlyRate = Math.pow(1 + preRetirementReturn / 100, 1 / 12) - 1;
    const preRetirementMonths = yearsToRetirement * 12;
    
    const sipFvFactor = ((Math.pow(1 + preRetirementMonthlyRate, preRetirementMonths) - 1) / preRetirementMonthlyRate) * (1 + preRetirementMonthlyRate);
    const requiredMonthlySip = netCorpusGap > 0 ? (netCorpusGap / sipFvFactor) : 0;

    // --- SMART STEP-UP SIP CALCULATIONS ---
    const g_stepup = stepUpPercentRetirement / 100;
    const R_return = preRetirementReturn / 100;
    const sipFvFactorOneYear = ((Math.pow(1 + preRetirementMonthlyRate, 12) - 1) / preRetirementMonthlyRate) * (1 + preRetirementMonthlyRate);
    
    let stepUpFvFactor = 0;
    if (Math.abs(R_return - g_stepup) < 1e-6) {
      stepUpFvFactor = yearsToRetirement * Math.pow(1 + R_return, yearsToRetirement - 1);
    } else {
      stepUpFvFactor = (Math.pow(1 + R_return, yearsToRetirement) - Math.pow(1 + g_stepup, yearsToRetirement)) / (R_return - g_stepup);
    }
    
    const stepUpSipFactorTotal = sipFvFactorOneYear * stepUpFvFactor;
    const requiredMonthlySipStepUp = netCorpusGap > 0 ? (netCorpusGap / stepUpSipFactorTotal) : 0;

    // --- FOMO Scenario 1: Started 5 Years Earlier ---
    const earlyYearsToRetirement = yearsToRetirement + 5;
    const earlyFutureValueOfExistingSavings = existingSavings * Math.pow(1 + preRetirementReturn / 100, earlyYearsToRetirement);
    const earlyNetCorpusGap = Math.max(0, totalRequiredCorpusAtRetirement - earlyFutureValueOfExistingSavings - lumpSumsAtRetirement - futureValueOfBonuses);
    const earlyMonths = earlyYearsToRetirement * 12;
    const earlySipFvFactor = ((Math.pow(1 + preRetirementMonthlyRate, earlyMonths) - 1) / preRetirementMonthlyRate) * (1 + preRetirementMonthlyRate);
    const requiredMonthlySipEarly = earlyNetCorpusGap > 0 ? (earlyNetCorpusGap / earlySipFvFactor) : 0;

    // --- FOMO Scenario 2: Starting 5 Years Later ---
    const lateYearsToRetirement = Math.max(1, yearsToRetirement - 5);
    const lateFutureValueOfExistingSavings = existingSavings * Math.pow(1 + preRetirementReturn / 100, lateYearsToRetirement);
    const lateNetCorpusGap = Math.max(0, totalRequiredCorpusAtRetirement - lateFutureValueOfExistingSavings - lumpSumsAtRetirement - futureValueOfBonuses);
    const lateMonths = lateYearsToRetirement * 12;
    const lateSipFvFactor = ((Math.pow(1 + preRetirementMonthlyRate, lateMonths) - 1) / preRetirementMonthlyRate) * (1 + preRetirementMonthlyRate);
    const requiredMonthlySipLate = lateNetCorpusGap > 0 ? (lateNetCorpusGap / lateSipFvFactor) : 0;
    
    // --- MILESTONE CORPUS BREAKDOWN MATH ---
    const futureBasicSurvival = expenseBasicSurvival * Math.pow(1 + inflationRateRetirement / 100, yearsToRetirement);
    const futureLifestyle = expenseLifestyle * Math.pow(1 + inflationRateRetirement / 100, yearsToRetirement);
    const futureLuxuries = expenseLuxuries * Math.pow(1 + inflationRateRetirement / 100, yearsToRetirement);
    
    const corpusSurvival = futureBasicSurvival * annuityFactor * (1 + r_real_monthly);
    const corpusLifestyle = futureLifestyle * annuityFactor * (1 + r_real_monthly);
    const corpusLuxuries = futureLuxuries * annuityFactor * (1 + r_real_monthly);

    // Timeline Projection Loop
    let currentPortfolio = existingSavings;
    let yearHitSurvival = existingSavings >= corpusSurvival ? 0 : -1;
    let yearHitLifestyle = existingSavings >= (corpusSurvival + corpusLifestyle) ? 0 : -1;
    let yearHitTotal = existingSavings >= totalRequiredCorpusAtRetirement ? 0 : -1;

    for (let y = 1; y <= 100; y++) {
      if (y <= bonusYearsRetirement) {
        currentPortfolio += annualBonusRetirement;
      }
      
      const currentYearSip = requiredMonthlySipStepUp * Math.pow(1 + g_stepup, y - 1);
      for (let m = 0; m < 12; m++) {
        currentPortfolio += currentYearSip;
        currentPortfolio = currentPortfolio * (1 + preRetirementMonthlyRate);
      }
      
      if (yearHitSurvival === -1 && currentPortfolio >= corpusSurvival) {
        yearHitSurvival = y;
      }
      if (yearHitLifestyle === -1 && currentPortfolio >= (corpusSurvival + corpusLifestyle)) {
        yearHitLifestyle = y;
      }
      if (yearHitTotal === -1 && currentPortfolio >= totalRequiredCorpusAtRetirement) {
        yearHitTotal = y;
      }
    }

    if (yearHitSurvival === -1) yearHitSurvival = Math.round(yearsToRetirement * 0.3);
    if (yearHitLifestyle === -1) yearHitLifestyle = Math.round(yearsToRetirement * 0.6);
    if (yearHitTotal === -1) yearHitTotal = yearsToRetirement;

    // Bucketing Strategy Division:
    // Bucket 1 (Liquidity / Arbitrage): 3 years of first-year living expenses
    const bucket1Arbitrage = Math.min(totalRequiredCorpusAtRetirement, 3 * 12 * futureMonthlyExpense);
    
    // Bucket 3 (Wealth / Equity): 20% of the total accumulated corpus
    const bucket3Equity = totalRequiredCorpusAtRetirement * 0.20;
    
    // Bucket 2 (Income / Hybrid): Remaining balance
    const bucket2Hybrid = Math.max(0, totalRequiredCorpusAtRetirement - bucket1Arbitrage - bucket3Equity);
    
    // Future Value of Bucket 3 after 15 years at an expected 12% equity CAGR return rate
    const bucket3FutureValue15Years = bucket3Equity * Math.pow(1 + 0.12, 15);

    // Total Amount Invested comparisons
    const totalStandardInvested = requiredMonthlySip * 12 * yearsToRetirement;
    let totalStepUpInvested = 0;
    for (let y = 1; y <= yearsToRetirement; y++) {
      totalStepUpInvested += requiredMonthlySipStepUp * Math.pow(1 + g_stepup, y - 1) * 12;
    }

    // Dynamic Scenario Calculations for Optimizer Menu
    const calculateScenarioSip = ({
      targetRetirementAge,
      overrideLumpSum = expectedLumpSum,
      overrideAnnualBonus = annualBonusRetirement,
      overrideBonusYears = bonusYearsRetirement,
      partialIncomeYears = 0,
      partialIncomeCoverPercent = 0
    }: {
      targetRetirementAge: number;
      overrideLumpSum?: number;
      overrideAnnualBonus?: number;
      overrideBonusYears?: number;
      partialIncomeYears?: number;
      partialIncomeCoverPercent?: number;
    }) => {
      const yearsToRet = Math.max(1, targetRetirementAge - safeCurrentAge);
      const yearsInRet = Math.max(1, safeLifeExpectancy - targetRetirementAge);
      
      const futMonthlyExp = (expenseBasicSurvival + expenseLifestyle + expenseLuxuries) * Math.pow(1 + inflationRateRetirement / 100, yearsToRet);
      
      const realAnnualRate = 0.02; 
      const r_real_monthly = realAnnualRate / 12;
      const totMonths = yearsInRet * 12;
      
      let reqCorpusForExpenses = 0;
      if (partialIncomeYears > 0 && partialIncomeCoverPercent > 0) {
        const partialMonths = Math.min(totMonths, partialIncomeYears * 12);
        const annuityFactorPartial = (1 - Math.pow(1 + r_real_monthly, -partialMonths)) / r_real_monthly;
        const annuityFactorRemaining = ((1 - Math.pow(1 + r_real_monthly, -(totMonths - partialMonths))) / r_real_monthly) * Math.pow(1 + r_real_monthly, -partialMonths);
        
        const reducedMonthlyExp = futMonthlyExp * (1 - partialIncomeCoverPercent / 100);
        reqCorpusForExpenses = (reducedMonthlyExp * annuityFactorPartial + futMonthlyExp * annuityFactorRemaining) * (1 + r_real_monthly);
      } else {
        const annuityFactor = (1 - Math.pow(1 + r_real_monthly, -totMonths)) / r_real_monthly;
        reqCorpusForExpenses = futMonthlyExp * annuityFactor * (1 + r_real_monthly);
      }
      
      const estateDiscountFactor = Math.pow(1 + realAnnualRate, -yearsInRet);
      const reqEstateCorpus = estateAmount * estateDiscountFactor;
      
      const totReqCorpus = reqCorpusForExpenses + reqEstateCorpus + oneTimeRetirementGoal;
      
      const futValExisting = existingSavings * Math.pow(1 + preRetirementReturn / 100, yearsToRet);
      
      let futValBonuses = 0;
      const k_bonus = Math.min(overrideBonusYears, yearsToRet);
      for (let y = 1; y <= k_bonus; y++) {
        futValBonuses += overrideAnnualBonus * Math.pow(1 + preRetirementReturn / 100, yearsToRet - y + 1);
      }
      
      const netGap = Math.max(0, totReqCorpus - futValExisting - overrideLumpSum - futValBonuses);
      
      const preRetRate = Math.pow(1 + preRetirementReturn / 100, 1 / 12) - 1;
      const preRetMonths = yearsToRet * 12;
      const fvFactor = ((Math.pow(1 + preRetRate, preRetMonths) - 1) / preRetRate) * (1 + preRetRate);
      
      const flatSip = netGap > 0 ? (netGap / fvFactor) : 0;

      // Smart Step-Up calculation
      const g_stepup = stepUpPercentRetirement / 100;
      const R_return = preRetirementReturn / 100;
      const sipFvFactorOneYear = ((Math.pow(1 + preRetRate, 12) - 1) / preRetRate) * (1 + preRetRate);
      
      let stepUpFvFactor = 0;
      if (Math.abs(R_return - g_stepup) < 1e-6) {
        stepUpFvFactor = yearsToRet * Math.pow(1 + R_return, yearsToRet - 1);
      } else {
        stepUpFvFactor = (Math.pow(1 + R_return, yearsToRet) - Math.pow(1 + g_stepup, yearsToRet)) / (R_return - g_stepup);
      }
      
      const stepUpSipFactorTotal = sipFvFactorOneYear * stepUpFvFactor;
      const stepUpSip = netGap > 0 ? (netGap / stepUpSipFactorTotal) : 0;

      return { flatSip, stepUpSip };
    };

    const scenarios = [
      {
        id: 'baseline-no-lump',
        title: `Retire at age ${safeRetirementAge}, no lump sum`,
        description: "Pure active savings required without relying on any EPF terminal payouts or annual bonuses.",
        sips: calculateScenarioSip({ targetRetirementAge: safeRetirementAge, overrideLumpSum: 0, overrideAnnualBonus: 0 }),
        badge: "Pure Savings Profile",
        pillText: "Baseline Pure"
      },
      {
        id: 'retire-3-no-lump',
        title: `Retire at age ${safeRetirementAge + 3}, no lump sum`,
        description: "Slightly delayed retirement gives your existing assets 3 more years to compound undisturbed.",
        sips: calculateScenarioSip({ targetRetirementAge: safeRetirementAge + 3, overrideLumpSum: 0, overrideAnnualBonus: 0 }),
        badge: "Balanced Extended Profile",
        pillText: "Retire at X + 3"
      },
      {
        id: 'retire-5-no-lump',
        title: `Retire at age ${safeRetirementAge + 5}, no lump sum`,
        description: "Giving compound interest 5 more years of runway dramatically slashes your monthly savings rate.",
        sips: calculateScenarioSip({ targetRetirementAge: safeRetirementAge + 5, overrideLumpSum: 0, overrideAnnualBonus: 0 }),
        badge: "Maximum Compound Runway",
        pillText: "Retire at X + 5"
      }
    ].map(s => {
      const flatPct = currentMonthlyIncome > 0 ? ((s.sips.flatSip / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
      const stepUpPct = currentMonthlyIncome > 0 ? ((s.sips.stepUpSip / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
      return {
        ...s,
        percentOfSalaryFlat: flatPct,
        percentOfSalaryStepUp: stepUpPct
      };
    });

    // Debt & Surplus Calculations
    const totalCurrentEmi = emi1Amount + emi2Amount + emi3Amount;
    const currentMonthlySurplus = Math.max(0, currentMonthlyIncome - currentMonthlyExpense - totalCurrentEmi);
    const maxEmiYears = Math.max(
      emi1Amount > 0 ? emi1Years : 0,
      emi2Amount > 0 ? emi2Years : 0,
      emi3Amount > 0 ? emi3Years : 0
    );

    return {
      yearsToRetirement,
      yearsInRetirement,
      futureMonthlyExpense,
      requiredCorpusForExpenses,
      requiredEstateCorpus,
      totalRequiredCorpusAtRetirement,
      futureValueOfExistingSavings,
      lumpSumsAtRetirement,
      futureValueOfBonuses,
      netCorpusGap,
      requiredMonthlySip,
      requiredMonthlySipStepUp,
      totalStandardInvested,
      totalStepUpInvested,
      requiredMonthlySipEarly,
      requiredMonthlySipLate,
      corpusSurvival,
      corpusLifestyle,
      corpusLuxuries,
      yearHitSurvival,
      yearHitLifestyle,
      yearHitTotal,
      bucket1Arbitrage,
      bucket2Hybrid,
      bucket3Equity,
      bucket3FutureValue15Years,
      totalCurrentEmi,
      currentMonthlySurplus,
      maxEmiYears,
      scenarios
    };
  }, [
    currentAge,
    retirementAge,
    lifeExpectancy,
    expenseBasicSurvival,
    expenseLifestyle,
    expenseLuxuries,
    inflationRateRetirement,
    estateAmount,
    existingSavings,
    expectedLumpSum,
    preRetirementReturn,
    oneTimeRetirementGoal,
    currentMonthlyIncome,
    emi1Amount,
    emi1Years,
    emi2Amount,
    emi2Years,
    emi3Amount,
    emi3Years,
    stepUpPercentRetirement,
    annualBonusRetirement,
    bonusYearsRetirement
  ]);

  // SIP Math Computing
  const sipChartData = useMemo(() => {
    const data = [];
    // True CAGR compounding method: (1 + monthlyRate)^12 = 1 + annualReturn
    const monthlyRate = Math.pow(1 + expectedReturn / 100, 1 / 12) - 1;
    const stepUp = enableStepUp ? stepUpPercent / 100 : 0;
    const inflation = adjustInflation ? inflationRate / 100 : 0;
    
    let totalInvested = lumpSumAmount;
    let totalWealth = lumpSumAmount;
    
    // Day 0
    data.push({
      year: 0,
      invested: Math.round(totalInvested),
      wealth: Math.round(totalWealth),
      gain: 0
    });

    for (let y = 1; y <= years; y++) {
      // Step-up increases the monthly contribution every year starting from Year 2
      const currentYearSip = sipAmount * Math.pow(1 + stepUp, y - 1);

      // Monthly compounding of existing sum + new monthly payments
      for (let m = 0; m < 12; m++) {
        // Add monthly contribution
        totalWealth += currentYearSip;
        // Keep track of total principal invested
        totalInvested += currentYearSip;
        // Compound existing wealth (including new contribution) by monthly interest rate
        totalWealth = totalWealth * (1 + monthlyRate);
      }
      
      const discountFactor = adjustInflation ? Math.pow(1 + inflation, y) : 1;
      const displayWealth = Math.round(totalWealth / discountFactor);
      const displayInvested = Math.round(totalInvested / discountFactor);
      const displayGain = Math.max(0, displayWealth - displayInvested);

      data.push({
        year: y,
        invested: displayInvested,
        wealth: displayWealth,
        gain: displayGain,
        nominalInvested: Math.round(totalInvested),
        nominalWealth: Math.round(totalWealth)
      });
    }
    return data;
  }, [sipAmount, lumpSumAmount, expectedReturn, years, enableStepUp, stepUpPercent, adjustInflation, inflationRate]);

  const sipFinalMetrics = useMemo(() => {
    const lastRow = sipChartData[sipChartData.length - 1];
    return {
      invested: lastRow.invested,
      wealth: lastRow.wealth,
      gains: lastRow.gain
    };
  }, [sipChartData]);

  // Profiler Asset Allocation Computing (Using premium Blue/Slate minimalism tones)
  const portfolioAllocation = useMemo(() => {
    let structure = [
      { name: 'Indian Direct Mutual Funds', value: 40, color: '#1E3A8A' }, // Deep Blue
      { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' }, // Royal Blue
      { name: 'High-Conviction Direct Equities', value: 20, color: '#60A5FA' }, // Sky Blue
      { name: 'Physical Gold BeES ETF', value: 10, color: '#EAB308' }, // Gold
      { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' } // Slate Gray
    ];

    if (timeHorizon === 'short') {
      structure = [
        { name: 'Indian Direct Mutual Funds', value: 20, color: '#1E3A8A' },
        { name: 'Global Index & Equity ETFs', value: 15, color: '#3B82F6' },
        { name: 'High-Conviction Direct Equities', value: 5, color: '#60A5FA' },
        { name: 'Physical Gold BeES ETF', value: 25, color: '#EAB308' },
        { name: 'Liquid Cash & Debt Instruments', value: 35, color: '#94A3B8' }
      ];
    } else if (timeHorizon === 'medium') {
      if (riskFactor === 'moderate') {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 35, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 20, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 15, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 15, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 15, color: '#94A3B8' }
        ];
      } else {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 45, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 20, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 5, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' }
        ];
      }
    } else if (timeHorizon === 'long') {
      if (riskFactor === 'moderate') {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 45, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 25, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 15, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 10, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 5, color: '#94A3B8' }
        ];
      } else {
        structure = [
          { name: 'Indian Direct Mutual Funds', value: 40, color: '#1E3A8A' },
          { name: 'Global Index & Equity ETFs', value: 30, color: '#3B82F6' },
          { name: 'High-Conviction Direct Equities', value: 25, color: '#60A5FA' },
          { name: 'Physical Gold BeES ETF', value: 3, color: '#EAB308' },
          { name: 'Liquid Cash & Debt Instruments', value: 2, color: '#94A3B8' }
        ];
      }
    }

    return structure;
  }, [goalType, timeHorizon, riskFactor]);

  // Number Formatters
  const formatCurrencyINR = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(num);
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen py-16 px-4 sm:px-6 lg:px-8" id="calculators-container">
      <div className="max-w-7xl mx-auto">
        
        {/* Breadcrumb section header */}
        <div className="text-center max-w-3xl mx-auto mb-12 animate-fade-in">
          <span className="text-blue-700 bg-blue-50 px-3.5 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider">
            Interactive Diagnostics
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-slate-900 mt-5 tracking-tight">
            Comprehensive Wealth Calculators
          </h2>
          <p className="text-slate-600 font-sans mt-3 text-[15.5px]">
            Check compounding potential, evaluate historical returns, and design high-conviction allocations for your global Indian portfolio.
          </p>
        </div>

        <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={1} />

        {/* Tab Selection (Pristine minimalism sliders look) */}
        <div className="flex bg-white border border-slate-200/80 p-1.5 rounded-2xl max-w-xl mx-auto mb-10 shadow-sm" id="calc-tab-headers">
          <button
            onClick={() => setActiveTab('sip')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'sip' 
                ? 'bg-[#0F172A] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-blue-505" />
            SIP Compounding
          </button>
          <button
            onClick={() => setActiveTab('allocator')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'allocator' 
                ? 'bg-[#0F172A] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <ShieldPlus className="w-4 h-4" />
            NRI Risk Profiler
          </button>
          <button
            onClick={() => setActiveTab('retirement')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[13px] sm:text-[14px] font-bold transition-all cursor-pointer ${
              activeTab === 'retirement' 
                ? 'bg-[#0F172A] text-white shadow-sm' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Milestone className="w-4 h-4" />
            Retirement & Freedom
          </button>
        </div>

        {/* Tab 1: SIP Compounding */}
        {activeTab === 'sip' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="sip-calculator">
            
            {/* Input Controls Panel (Left) */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="text-[17px] font-bold text-slate-900 flex items-center gap-2 mb-2">
                <Calculator className="w-5 h-5 text-blue-600" />
                Parameters
              </h3>
              
              {/* SIP Monthly Amount slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Monthly Mutual Fund SIP</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {formatCurrencyINR(sipAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="250000"
                  step="5000"
                  value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>₹5k</span>
                  <span>₹2.5 Lakh</span>
                </div>
              </div>

              {/* Lump Sum Seed */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Initial Block Investment</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {formatCurrencyINR(lumpSumAmount)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10000000"
                  step="50000"
                  value={lumpSumAmount}
                  onChange={(e) => setLumpSumAmount(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>₹0</span>
                  <span>₹1 Crore</span>
                </div>
              </div>

              {/* Rate of Return */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Expected Annual Returns</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {expectedReturn}%
                  </span>
                </div>
                <input
                  type="range"
                  min="6"
                  max="24"
                  step="0.5"
                  value={expectedReturn}
                  onChange={(e) => setExpectedReturn(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>6% (Debt/Gold)</span>
                  <span>24% (Equity Mutual Fund Peak)</span>
                </div>
              </div>

              {/* Years Horizon */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <label className="font-semibold text-slate-700">Time Horizon</label>
                  <span className="font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded">
                    {years} Years
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="35"
                  step="1"
                  value={years}
                  onChange={(e) => setYears(Number(e.target.value))}
                  className="w-full accent-blue-605 cursor-pointer h-1.5 bg-slate-100 rounded-full appearance-none accent-blue-600"
                />
                <div className="flex justify-between items-center text-[10.5px] text-slate-400 font-mono">
                  <span>1 Yr</span>
                  <span>35 Yrs</span>
                </div>
              </div>

              {/* Annual Step-Up Toggle and Control */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="enable-step-up"
                      checked={enableStepUp}
                      onChange={(e) => setEnableStepUp(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="enable-step-up" className="text-[13px] font-semibold text-slate-700 cursor-pointer select-none">
                      Enable Annual Step-up
                    </label>
                  </div>
                  {enableStepUp && (
                    <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded">
                      +{stepUpPercent}% / yr
                    </span>
                  )}
                </div>

                {enableStepUp && (
                  <div className="pl-6 space-y-2 animate-fade-in text-left">
                    <div className="flex justify-between items-center text-[11.5px] text-slate-500">
                      <span>Annual Increment</span>
                      <span className="font-mono font-bold">{stepUpPercent}%</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="1"
                      value={stepUpPercent}
                      onChange={(e) => setStepUpPercent(Number(e.target.value))}
                      className="w-full accent-blue-605 cursor-pointer h-1 bg-slate-100 rounded-full appearance-none accent-blue-600"
                    />
                    <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
                      <span>1%</span>
                      <span>25%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Inflation Adjustment Toggle and Control */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="adjust-inflation"
                      checked={adjustInflation}
                      onChange={(e) => setAdjustInflation(e.target.checked)}
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500 accent-blue-600 cursor-pointer"
                    />
                    <label htmlFor="adjust-inflation" className="text-[13px] font-semibold text-slate-700 cursor-pointer select-none">
                      Adjust for Inflation
                    </label>
                  </div>
                  {adjustInflation && (
                    <span className="text-[11px] font-mono font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded">
                      {inflationRate}% Inflation
                    </span>
                  )}
                </div>

                {adjustInflation && (
                  <div className="pl-6 space-y-2 animate-fade-in text-left">
                    <div className="flex justify-between items-center text-[11.5px] text-slate-500">
                      <span>Expected Inflation Rate</span>
                      <span className="font-mono font-bold">{inflationRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="12"
                      step="0.5"
                      value={inflationRate}
                      onChange={(e) => setInflationRate(Number(e.target.value))}
                      className="w-full accent-blue-605 cursor-pointer h-1 bg-slate-100 rounded-full appearance-none accent-blue-600"
                    />
                    <div className="flex justify-between items-center text-[9.5px] text-slate-400 font-mono">
                      <span>2%</span>
                      <span>12%</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-2.5 items-start">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="space-y-1.5 text-left">
                  <p className="text-[11.5px] text-slate-500 leading-relaxed">
                    Historically, high-quality equity mutual funds in India have delivered annualized compounding rates between <strong>14% and 18%</strong> over 5+ year cycles.
                  </p>
                  <p className="text-[11.5px] text-blue-800 font-medium leading-normal">
                    🎯 <strong>True CAGR Compounding:</strong> Your regular SIP and lump-sum allocations grow using the exact geometric monthly rate formula: <code className="font-mono bg-blue-50/50 px-1 rounded text-[10.5px]">(1 + R)^(1/12) - 1</code>, precisely matching the industry's premium standards for true year-on-year growth.
                  </p>
                  {enableStepUp && (
                    <p className="text-[11px] text-emerald-700 font-medium leading-normal">
                      📈 <strong>Step-up SIP:</strong> Increasing your SIP by {stepUpPercent}% annually significantly accelerates compounding, boosting your final wealth target with rising career incomes.
                    </p>
                  )}
                  {adjustInflation && (
                    <p className="text-[11px] text-rose-700 font-medium leading-normal">
                      🎈 <strong>Inflation Adjustment:</strong> Value is discounted at {inflationRate}% annually to show the actual purchasing power of your final returns in today's money.
                    </p>
                  )}
                </div>
              </div>

            </div>

            {/* Diagnostic Visualization Panel (Right) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Top Grid showing final numbers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {adjustInflation ? "Real Capital Outlay" : "Principal Capital Outlay"}
                  </p>
                  <p className="text-[20px] font-display font-bold text-slate-900 mt-1">{formatCurrencyINR(sipFinalMetrics.invested)}</p>
                  {adjustInflation && (
                    <span className="absolute top-2 right-2 text-[8.5px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
                      Real Value
                    </span>
                  )}
                </div>

                <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    {adjustInflation ? "Real Wealth Earnings" : "Estimated Wealth Earnings"}
                  </p>
                  <p className="text-[20px] font-display font-bold text-blue-600 mt-1">+{formatCurrencyINR(sipFinalMetrics.gains)}</p>
                  {adjustInflation && (
                    <span className="absolute top-2 right-2 text-[8.5px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
                      Real Gain
                    </span>
                  )}
                </div>

                <div className="bg-[#0F172A] text-white p-5 rounded-2xl shadow-xs text-left relative overflow-hidden">
                  <p className="text-[11px] text-slate-300 font-bold uppercase tracking-wider">
                    {adjustInflation ? "Real Portfolio Value" : "Target Portfolio Valuation"}
                  </p>
                  <p className="text-[20px] font-display font-bold mt-1 text-slate-50">{formatCurrencyINR(sipFinalMetrics.wealth)}</p>
                  {adjustInflation && (
                    <span className="absolute top-2 right-2 text-[8.5px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded font-mono border border-amber-500/20">
                      Real Power
                    </span>
                  )}
                </div>

              </div>

              {/* Area Chart mapping year details */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 sm:p-6 shadow-sm" id="sip-chart-panel">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-6 text-left">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[14px] font-bold text-slate-900">Wealth Accrual Curve</span>
                    {enableStepUp && (
                      <span className="text-[9.5px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-mono">
                        +{stepUpPercent}% Step-up
                      </span>
                    )}
                    {adjustInflation && (
                      <span className="text-[9.5px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full font-mono">
                        {inflationRate}% Inflation Adjusted
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-slate-50 text-slate-500 px-2.5 py-1 rounded self-start sm:self-auto">
                    INR (₹) {adjustInflation ? "Real Value" : "Nominal Representation"}
                  </span>
                </div>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={sipChartData}
                      margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
                    >
                      <defs>
                        <linearGradient id="colorWealth" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#475569" stopOpacity={0.15}/>
                          <stop offset="95%" stopColor="#475569" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        tickLine={false} 
                        axisLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11}
                        tickFormatter={(v) => `Yr ${v}`}
                      />
                      <YAxis 
                        tickLine={false} 
                        axisLine={false} 
                        stroke="#94a3b8" 
                        fontSize={11}
                        width={65}
                        tickFormatter={(v) => `₹${(v / 100000).toFixed(1)}L`}
                      />
                      <Tooltip 
                        formatter={(value: any) => [formatCurrencyINR(value), '']}
                        labelFormatter={(label) => `Year of Hold ${label}`}
                        contentStyle={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)' }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                      <Area 
                        name={adjustInflation ? "Inflation-Adjusted Wealth" : "Compounded Wealth Valuation"} 
                        type="monotone" 
                        dataKey="wealth" 
                        stroke="#3B82F6" 
                        strokeWidth={2.5} 
                        fillOpacity={1} 
                        fill="url(#colorWealth)" 
                      />
                      <Area 
                        name={adjustInflation ? "Inflation-Adjusted Principal" : "Outlaid Capital Principal"} 
                        type="monotone" 
                        dataKey="invested" 
                        stroke="#475569" 
                        strokeWidth={1.5} 
                        fillOpacity={1} 
                        fill="url(#colorInvested)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Allocator Pro Profiler */}
        {activeTab === 'allocator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start" id="risk-allocator">
            
            {/* Left Profiler Questionnaire */}
            <div className="lg:col-span-5 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6 animate-fade-in">
              
              <h3 className="text-[17px] font-bold text-slate-950 block border-b border-slate-100 pb-3 mb-2">
                Global Wealth Investment Profiling
              </h3>

              {/* Goal Type Selection */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">1. Central Investment Mandate</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'wealth', title: 'Generational Wealth Growth', desc: 'Sustained compounding via diversified portfolios' },
                    { id: 'retirement', title: 'Comfortable Retirement Plan', desc: 'Inflation-beating returns with secure payouts' },
                    { id: 'education', title: 'Global Children Education Capital', desc: 'Target capital accumulation for overseas colleges' }
                  ].map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoalType(g.id as any)}
                      className={`p-3.5 border text-left rounded-xl transition-all cursor-pointer ${
                        goalType === g.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 shadow-xs ring-1 ring-blue-100' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-600'
                      }`}
                    >
                      <h5 className="text-[13.5px] font-bold text-slate-900">{g.title}</h5>
                      <p className="text-[11px] text-slate-400 mt-1">{g.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Horizon Selection */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">2. Holding Horizon</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'short', label: '1 - 3 Years', desc: 'Short Term' },
                    { id: 'medium', label: '3 - 5 Years', desc: 'Medium Term' },
                    { id: 'long', label: '5+ Years', desc: 'Long-term Growth' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setTimeHorizon(t.id as any)}
                      className={`py-3.5 px-2 border text-center rounded-xl transition-all cursor-pointer flex flex-col items-center justify-center ${
                        timeHorizon === t.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 font-bold ring-1 ring-blue-105' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-500'
                      }`}
                    >
                      <span className="text-[13px] font-bold text-slate-900">{t.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{t.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Risk Tolerance */}
              <div className="space-y-2.5 text-left">
                <label className="text-[12px] font-bold uppercase tracking-wider text-slate-400 block">3. Corporate Risk Appetite</label>
                <div className="grid grid-cols-2 gap-2.5">
                  {[
                    { id: 'moderate', label: 'Moderate Investor', desc: 'Balance stable asset yields with moderate equity levels.' },
                    { id: 'aggressive', label: 'Aggressive Alpha', desc: 'Maximize allocation in high-growth blue-chip equity & ETFs.' }
                  ].map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setRiskFactor(r.id as any)}
                      className={`p-3.5 border text-left rounded-xl transition-all cursor-pointer ${
                        riskFactor === r.id 
                          ? 'border-blue-600 bg-blue-50/50 text-slate-950 font-bold ring-1 ring-blue-105' 
                          : 'border-slate-200 hover:border-slate-350 text-slate-600'
                      }`}
                    >
                      <span className="text-[13px] font-bold block text-slate-900">{r.label}</span>
                      <span className="text-[10.5px] text-slate-400 mt-1 block leading-normal">{r.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right Visualization Pie Chart allocation */}
            <div className="lg:col-span-7 bg-white border border-slate-100 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 text-left animate-fade-in" id="allocator-chart-panel">
              
              <div className="flex-1 space-y-6">
                <div>
                  <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Allocations Diagnosis</span>
                  <h4 className="text-[20px] font-display font-bold text-slate-900 mt-1">Analytical Asset Allocation Mix</h4>
                  <p className="text-slate-500 text-[13px] mt-1.5 leading-relaxed">
                    Presented as educational analytical matrices matching your <strong>{timeHorizon === 'long' ? 'long cyclic growth' : timeHorizon === 'medium' ? 'medium-term' : 'defensive conservative'}</strong> timeline. Mutual fund regular schemes distributed will reflect these broad strategic patterns.
                  </p>
                </div>

                {/* Legend list indicating color codes */}
                <div className="space-y-3.5">
                  {portfolioAllocation.map((item, index) => (
                    <div key={index} className="flex items-center justify-between text-[13px] border-b border-slate-50 pb-2">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow-xs" 
                          style={{ backgroundColor: item.color }} 
                        />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pie chart with Cell colours */}
              <div className="w-[220px] h-[220px] flex-shrink-0 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioAllocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {portfolioAllocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Visual indicator absolute center text */}
                <div className="absolute text-center">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none block">Target Return</span>
                  <span className="text-[20px] font-display font-bold text-blue-600 mt-1 block">
                    {timeHorizon === 'long' && riskFactor === 'aggressive' ? '~16.5%' : timeHorizon === 'short' ? '~8.5%' : '~13.8%'}
                  </span>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 3: Financial Freedom & Retirement Calculator */}
        {activeTab === 'retirement' && (
          <div className="space-y-8 animate-fade-in" id="retirement-calculator">
            
            {/* Real-time Dashboard Header */}
            <div className="text-left bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <Milestone className="w-48 h-48 rotate-12" />
              </div>
              <div className="relative space-y-1">
                <span className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-1 rounded uppercase tracking-wider">
                  Real-time Freedom Planner
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-display tracking-tight mt-1 flex items-center gap-2">
                  <Milestone className="w-6 h-6 text-amber-400" />
                  Financial Freedom & Retirement Blueprint
                </h3>
                <p className="text-slate-300 text-xs max-w-2xl leading-relaxed">
                  Calibrate your inputs on the left. Your 15-year decumulation bucket strategy, readiness score, and compounding targets will recalculate <strong>instantly in real time</strong>.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column (5 Cols) - INPUTS DASHBOARD PANEL */}
              <div className="lg:col-span-5 space-y-4 text-left">
                
                {/* Panel 1: Timeline & Target ROI */}
                <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">1. Timeline & ROI</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Current Age</label>
                      <input type="number" min="18" max="74" value={currentAge || ''} onChange={(e) => handleCurrentAgeChange(Number(e.target.value))} onBlur={handleCurrentAgeBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Retire Age</label>
                      <input type="number" min={currentAge + 1} max="80" value={retirementAge || ''} onChange={(e) => handleRetirementAgeChange(Number(e.target.value))} onBlur={handleRetirementAgeBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Life Expect</label>
                      <input type="number" min={retirementAge + 1} max="110" value={lifeExpectancy || ''} onChange={(e) => handleLifeExpectancyChange(Number(e.target.value))} onBlur={handleLifeExpectancyBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-indigo-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[11px] text-slate-600">
                      <span>Accumulation Runway</span>
                      <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">{retirementData.yearsToRetirement} Years</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-slate-600 font-bold">Pre-Retirement ROI Target</span>
                      <span className="font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">{preRetirementReturn}% CAGR</span>
                    </div>
                    <input type="range" min="6" max="25" step="0.5" value={preRetirementReturn} onChange={(e) => setPreRetirementReturn(Number(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>
                </div>

                {/* Panel 2: Income, Expenses & Inflation */}
                <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">2. Income, Expenses & Inflation</h4>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Monthly Net Income Today</label>
                      <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                        {formatCurrencyINR(currentMonthlyIncome)}
                      </span>
                    </div>
                    <input type="range" min="20000" max="1000000" step="10000" value={currentMonthlyIncome} onChange={(e) => setCurrentMonthlyIncome(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>

                  <div className="space-y-3 pt-1 border-t border-slate-100 mt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-800">Monthly Expenses Breakdown</label>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Total: {formatCurrencyINR(currentMonthlyExpense)}
                      </span>
                    </div>

                    {/* Basic Survival */}
                    <div className="space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-semibold text-slate-750">Basic Survival (Groceries/Utilities)</span>
                        <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(expenseBasicSurvival)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="5000" 
                        max="300000" 
                        step="1000" 
                        value={expenseBasicSurvival} 
                        onChange={(e) => setExpenseBasicSurvival(Number(e.target.value))} 
                        className="w-full accent-slate-700 h-1 bg-slate-200 rounded-full cursor-pointer appearance-none" 
                      />
                    </div>

                    {/* Lifestyle */}
                    <div className="space-y-1 bg-blue-50/40 p-2.5 rounded-xl border border-blue-100/40">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-semibold text-blue-900">Lifestyle (Rent/EMI/School fees)</span>
                        <span className="font-mono font-bold text-blue-900">{formatCurrencyINR(expenseLifestyle)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="300000" 
                        step="1000" 
                        value={expenseLifestyle} 
                        onChange={(e) => setExpenseLifestyle(Number(e.target.value))} 
                        className="w-full accent-blue-600 h-1 bg-blue-100 rounded-full cursor-pointer appearance-none" 
                      />
                    </div>

                    {/* Luxuries */}
                    <div className="space-y-1 bg-indigo-50/40 p-2.5 rounded-xl border border-indigo-100/40">
                      <div className="flex justify-between items-center text-[10.5px]">
                        <span className="font-semibold text-indigo-900">Luxuries (Dining/Travel)</span>
                        <span className="font-mono font-bold text-indigo-900">{formatCurrencyINR(expenseLuxuries)}</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="200000" 
                        step="1000" 
                        value={expenseLuxuries} 
                        onChange={(e) => setExpenseLuxuries(Number(e.target.value))} 
                        className="w-full accent-indigo-600 h-1 bg-indigo-100 rounded-full cursor-pointer appearance-none" 
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[11px]">
                      <label className="font-bold text-slate-700">Assumed Average Inflation Rate</label>
                      <span className="font-mono text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">{inflationRateRetirement}%</span>
                    </div>
                    <input type="range" min="4" max="12" step="0.5" value={inflationRateRetirement} onChange={(e) => setInflationRateRetirement(Number(e.target.value))} className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>
                </div>

                {/* Panel 3: Existing Wealth & Future Goals */}
                <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <Coins className="w-4 h-4 text-amber-500" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">3. Savings & Future Goals</h4>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Existing Investments & Savings</label>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {formatCurrencyINR(existingSavings)}
                      </span>
                    </div>
                    <input type="range" min="0" max="20000000" step="50000" value={existingSavings} onChange={(e) => setExistingSavings(Number(e.target.value))} className="w-full accent-slate-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Corporate Accumulations (EPF, NPS)</label>
                      <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {formatCurrencyINR(expectedLumpSum)}
                      </span>
                    </div>
                    <input type="range" min="0" max="20000000" step="50000" value={expectedLumpSum} onChange={(e) => setExpectedLumpSum(Number(e.target.value))} className="w-full accent-slate-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>

                  <div className="space-y-2 bg-emerald-50/20 p-3 rounded-xl border border-emerald-100/40 mt-1">
                    <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Bonus & Lump Sum Accelerator</span>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] font-medium text-slate-700">Expected Annual Bonus / Lump Sum (₹)</label>
                        <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                          {formatCurrencyINR(annualBonusRetirement)}
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="2000000" 
                        step="20000" 
                        value={annualBonusRetirement} 
                        onChange={(e) => setAnnualBonusRetirement(Number(e.target.value))} 
                        className="w-full accent-emerald-600 h-1 bg-slate-100 rounded-full cursor-pointer appearance-none" 
                      />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-medium text-slate-700">Duration of these investments (Years)</label>
                        <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                          {bonusYearsRetirement} Years
                        </span>
                      </div>
                      <input 
                        type="range" 
                        min="1" 
                        max="40" 
                        step="1" 
                        value={bonusYearsRetirement} 
                        onChange={(e) => setBonusYearsRetirement(Number(e.target.value))} 
                        className="w-full accent-emerald-500 h-1 bg-slate-100 rounded-full cursor-pointer appearance-none" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">One-Time Goal (₹)</label>
                      <input type="number" value={oneTimeRetirementGoal || ''} onChange={(e) => setOneTimeRetirementGoal(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800" placeholder="e.g. travel" />
                    </div>
                    <div className="space-y-0.5">
                      <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Legacy Estate (₹)</label>
                      <input type="number" value={estateAmount || ''} onChange={(e) => setEstateAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-bold text-slate-800" placeholder="for kids" />
                    </div>
                  </div>
                </div>

                {/* Panel 4: Outstanding Liabilities & EMIs */}
                <div className="bg-white border border-slate-150 rounded-2xl p-4.5 shadow-xs space-y-3.5">
                  <div className="flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">4. Outstanding Debt & EMIs</h4>
                  </div>
                  
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[11px] font-bold text-slate-700">Total Outstanding Loan Debt (₹)</label>
                      <input 
                        type="number"
                        min="0"
                        max="100000000"
                        value={totalLoanAmount || 0}
                        onChange={(e) => setTotalLoanAmount(Number(e.target.value))}
                        className="w-28 bg-rose-50/50 border border-rose-200 rounded-lg p-1 text-right text-xs font-mono font-bold text-rose-700 focus:outline-hidden focus:ring-1 focus:ring-rose-400"
                      />
                    </div>
                    <input type="range" min="0" max="30000000" step="10000" value={totalLoanAmount} onChange={(e) => setTotalLoanAmount(Number(e.target.value))} className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Identify Active Monthly EMIs (Up to 3):</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-0.5">
                        <span className="text-[8px] text-slate-400 font-bold block">EMI 1 (₹)</span>
                        <input type="number" value={emi1Amount || ''} onChange={(e) => setEmi1Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-250 rounded p-1 text-[11px] font-bold text-slate-800 text-center" />
                        <select value={emi1Years} onChange={(e) => setEmi1Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-0.5 text-[9px] text-slate-700">
                          {[1,2,3,4,5,7,10,15,20,25].map(y => (
                            <option key={y} value={y}>{y} yr{y > 1 ? 's' : ''}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-0.5">
                        <span className="text-[8px] text-slate-400 font-bold block">EMI 2 (₹)</span>
                        <input type="number" value={emi2Amount || ''} onChange={(e) => setEmi2Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-250 rounded p-1 text-[11px] font-bold text-slate-800 text-center" />
                        <select value={emi2Years} onChange={(e) => setEmi2Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-0.5 text-[9px] text-slate-700">
                          {[0,1,2,3,4,5,7,10,15,20,25].map(y => (
                            <option key={y} value={y}>{y === 0 ? 'None' : `${y} yrs`}</option>
                          ))}
                        </select>
                      </div>
                      <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 space-y-0.5">
                        <span className="text-[8px] text-slate-400 font-bold block">EMI 3 (₹)</span>
                        <input type="number" value={emi3Amount || ''} onChange={(e) => setEmi3Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-250 rounded p-1 text-[11px] font-bold text-slate-800 text-center" />
                        <select value={emi3Years} onChange={(e) => setEmi3Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-0.5 text-[9px] text-slate-700">
                          {[0,1,2,3,4,5,7,10,15,20,25].map(y => (
                            <option key={y} value={y}>{y === 0 ? 'None' : `${y} yrs`}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column (7 Cols) - RESULTS VIEWPORT */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Score & Diagnostic Card */}
                {(() => {
                  const requiredSip = retirementData.requiredMonthlySip;
                  const surplus = retirementData.currentMonthlySurplus;
                  const score = Math.max(15, Math.min(100, Math.round((surplus / Math.max(1, requiredSip)) * 100)));
                  const isHealthy = surplus >= requiredSip;
                  const isSevere = surplus < requiredSip * 0.4;
                  
                  return (
                    <div className={`border rounded-3xl p-5 text-left relative overflow-hidden shadow-xs transition-all ${
                      isHealthy 
                        ? 'bg-emerald-50/75 border-emerald-200 text-emerald-950' 
                        : isSevere 
                          ? 'bg-rose-50/75 border-rose-200 text-rose-950' 
                          : 'bg-amber-50/75 border-amber-200 text-amber-950'
                    }`}>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                        <div className="space-y-1.5 max-w-md">
                          <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            isHealthy ? 'bg-emerald-100 text-emerald-800' : isSevere ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {isHealthy ? '✓ Surplus is Healthy!' : isSevere ? '🚨 Restructuring Required' : '⚠ Action Recommended'}
                          </span>
                          <h4 className="text-[17px] font-bold font-display tracking-tight leading-snug">
                            {isHealthy 
                              ? "Your current investible surplus easily covers your recommended retirement SIP! You are in an excellent position to compound generational wealth."
                              : isSevere
                                ? `Your recommended retirement SIP is ${formatCurrencyINR(requiredSip)}/mo, leaving a severe deficit. Restructuring outstanding loans or expenses is highly advised.`
                                : `Your recommended retirement SIP is ${formatCurrencyINR(requiredSip)}/mo. You have a partial surplus, but optimizing expenses by ${formatCurrencyINR(requiredSip - surplus)}/mo will secure your timeline.`
                            }
                          </h4>
                          <p className="text-[11.5px] opacity-80 leading-relaxed">
                            A healthy surplus score means you can comfortably finance your retirement corpus without altering your current lifestyle.
                          </p>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center bg-white border border-slate-100 rounded-2xl p-4.5 shadow-sm min-w-[110px] text-center shrink-0">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">Freedom Score</span>
                          <span className={`text-3xl font-display font-extrabold mt-1 block ${
                            isHealthy ? 'text-emerald-600' : isSevere ? 'text-rose-600' : 'text-amber-600'
                          }`}>
                            {score}
                          </span>
                          <span className="text-[9.5px] text-slate-500 font-bold mt-1 font-mono">out of 100</span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Core Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
                  <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inflation-Adjusted Monthly Cost</span>
                    <p className="text-lg font-display font-bold text-slate-900 mt-1">
                      {formatCurrencyINR(retirementData.futureMonthlyExpense)}
                      <span className="text-xs text-slate-400 font-normal">/mo</span>
                    </p>
                    <span className="text-[10.5px] text-slate-400 mt-1 block">At age {retirementAge} (with {inflationRateRetirement}% inflation)</span>
                  </div>

                  <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Retirement Corpus</span>
                    <p className="text-lg font-display font-bold text-indigo-600 mt-1">
                      {formatCurrencyINR(retirementData.totalRequiredCorpusAtRetirement)}
                    </p>
                    <span className="text-[10.5px] text-slate-400 mt-1 block">Net gap after existing assets & legacy targets</span>
                  </div>

                  <div className="bg-white border border-slate-150 p-4.5 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Required Monthly SIP</span>
                    <p className="text-lg font-display font-bold text-emerald-600 mt-1">
                      {formatCurrencyINR(retirementData.requiredMonthlySip)}
                      <span className="text-xs text-emerald-500 font-normal">/mo</span>
                    </p>
                    <span className="text-[10.5px] text-slate-400 mt-1 block">Compounding at {preRetirementReturn}% pre-retire ROI</span>
                  </div>
                </div>

                {/* Step-Up SIP Comparison Card */}
                <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-5.5 shadow-sm border border-slate-800 space-y-4 relative overflow-hidden text-left">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Sparkles className="w-36 h-36" />
                  </div>
                  
                  <div className="relative z-10">
                    <span className="text-[9px] font-mono font-bold bg-indigo-500 text-white px-2.5 py-1 rounded uppercase tracking-wider">
                      Smart Compounding Engine
                    </span>
                    <h4 className="text-[16px] font-bold font-display mt-2 flex items-center gap-1.5 text-white">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Step-Up SIP (Dynamic Inflation-Adjusted SIP)
                    </h4>
                    <p className="text-slate-350 text-[11.5px] mt-1.5 leading-relaxed">
                      Instead of committing to a high flat monthly investment from day one, use a <strong>Step-Up SIP</strong>. By increasing your investment slightly each year as your income grows, you can start with a much lower initial burden.
                    </p>
                  </div>

                  {/* Comparison Blocks */}
                  {(() => {
                    const standardSipPercent = currentMonthlyIncome > 0 ? ((retirementData.requiredMonthlySip / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
                    const stepUpSipPercent = currentMonthlyIncome > 0 ? ((retirementData.requiredMonthlySipStepUp / currentMonthlyIncome) * 100).toFixed(1) : "0.0";
                    
                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-10 pt-1">
                        {/* Standard Flat SIP */}
                        <div className="bg-slate-950/40 border border-slate-850 p-3.5 rounded-xl flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider block">Standard Approach</span>
                            <h5 className="text-[11.5px] font-bold text-slate-400 mt-0.5">Flat SIP Required:</h5>
                            <p className="text-lg font-display font-black text-slate-200 mt-1">
                              {formatCurrencyINR(retirementData.requiredMonthlySip)}
                              <span className="text-xs text-slate-500 font-normal">/mo</span>
                            </p>
                            <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">
                              Constant flat monthly savings for the next {retirementData.yearsToRetirement} years.
                            </p>
                          </div>
                          <div className="mt-2.5 inline-flex items-center justify-between px-2.5 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-[10.5px] text-slate-300">
                            <span className="font-medium">Monthly Burden:</span>
                            <span className="font-mono font-bold text-slate-200 bg-slate-850 px-1.5 py-0.5 rounded text-[10px]">
                              {standardSipPercent}% of Salary
                            </span>
                          </div>
                        </div>

                        {/* Smart Step-Up SIP */}
                        <div className="bg-indigo-950/40 border border-indigo-500/30 p-3.5 rounded-xl relative overflow-hidden flex flex-col justify-between">
                          <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded font-mono uppercase z-10">
                            Recommended
                          </div>
                          <div>
                            <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-wider block">Smart Approach</span>
                            <h5 className="text-[11.5px] font-bold text-white mt-0.5">Starting SIP Required:</h5>
                            <p className="text-xl font-display font-black text-emerald-400 mt-1">
                              {formatCurrencyINR(retirementData.requiredMonthlySipStepUp)}
                              <span className="text-xs text-emerald-500 font-normal">/mo</span>
                            </p>
                            <p className="text-[10px] text-indigo-200 mt-1.5 leading-relaxed">
                              Starts lower, increasing by <strong>{stepUpPercentRetirement}%</strong> yearly.
                            </p>
                          </div>
                          <div className="mt-2.5 inline-flex items-center justify-between px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-300">
                            <span className="font-semibold">Starting Burden:</span>
                            <span className="font-mono font-black text-emerald-400 bg-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] animate-pulse">
                              {stepUpSipPercent}% of Salary
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Visual Hook */}
                  {retirementData.requiredMonthlySip > 0 && retirementData.requiredMonthlySipStepUp < retirementData.requiredMonthlySip && (
                    <div className="bg-emerald-950/30 border border-emerald-500/20 p-3 rounded-lg flex items-center gap-2.5 text-[11.5px] text-emerald-400 relative z-10">
                      <div className="w-5.5 h-5.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-black text-xs shrink-0">
                        ↓
                      </div>
                      <span className="font-semibold">
                        Reduces your immediate burden by <strong className="text-emerald-300 font-extrabold text-sm">{Math.round(((retirementData.requiredMonthlySip - retirementData.requiredMonthlySipStepUp) / retirementData.requiredMonthlySip) * 100)}%</strong> today!
                      </span>
                    </div>
                  )}

                  {/* Slider */}
                  <div className="pt-3 border-t border-slate-800/80 space-y-2 relative z-10">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-300 font-bold">Annual SIP Increase (Step-Up %)</span>
                      <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                        {stepUpPercentRetirement}%
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="25" 
                      step="1" 
                      value={stepUpPercentRetirement} 
                      onChange={(e) => setStepUpPercentRetirement(Number(e.target.value))} 
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-full cursor-pointer appearance-none" 
                    />
                  </div>
                </div>

                {/* Strategy Optimizer Box (Menu-driven Retirement Options) */}
                <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-5.5 shadow-md space-y-4 text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[9px] font-mono font-bold bg-indigo-600 text-white px-2.5 py-1 rounded uppercase tracking-wider">
                        Strategy Optimizer
                      </span>
                      <h4 className="text-[16px] font-bold font-display mt-2 flex items-center gap-1.5 text-white">
                        <Layers className="w-4 h-4 text-indigo-400" />
                        Essential Freedom Optimizer Menu
                      </h4>
                      <p className="text-slate-400 text-xs mt-1.5 leading-relaxed">
                        Same math, but presented as a customizable retirement menu. Choose how you want to reach your <strong>Essential Freedom</strong> target. Click any option to apply its parameters instantly to the sliders above!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-1">
                    {retirementData.scenarios.map((s) => {
                      const isSelected = selectedStrategyId === s.id;
                      return (
                        <button
                          key={s.id}
                          onClick={() => applyScenario(s.id)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between cursor-pointer group ${
                            isSelected
                              ? 'bg-indigo-650 text-white border-indigo-500 shadow-md ring-2 ring-indigo-500/30'
                              : 'bg-slate-950/40 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60 shadow-xs'
                          }`}
                        >
                          <div className="space-y-1 w-full">
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`text-[8.5px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                                isSelected ? 'bg-indigo-800 text-indigo-100' : 'bg-slate-800 text-slate-400 group-hover:bg-slate-750'
                              }`}>
                                {s.pillText}
                              </span>
                              {isSelected ? (
                                <span className="flex items-center gap-1 text-[9.5px] font-bold text-emerald-300">
                                  <Check className="w-3 h-3 text-emerald-400" /> Active
                                </span>
                              ) : (
                                <span className="text-[8.5px] font-bold text-indigo-400 uppercase group-hover:translate-x-1 transition-transform inline-flex items-center gap-0.5">
                                  Apply <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                            <h5 className={`font-bold text-[12.5px] tracking-tight leading-snug mt-1.5 ${
                              isSelected ? 'text-white' : 'text-slate-200'
                            }`}>
                              {s.title}
                            </h5>
                            <p className={`text-[10.5px] leading-relaxed mt-1 ${
                              isSelected ? 'text-indigo-100' : 'text-slate-400'
                            }`}>
                              {s.description}
                            </p>
                          </div>
                          
                          <div className={`mt-4 pt-3 border-t space-y-3.5 w-full ${
                            isSelected ? 'border-indigo-500/30' : 'border-slate-800'
                          }`}>
                            {/* Flat SIP */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-slate-450">
                                <span>Flat SIP:</span>
                                <span className="font-mono">({s.percentOfSalaryFlat}%)</span>
                              </div>
                              <span className={`text-[13px] font-black font-display block mt-0.5 ${
                                isSelected ? 'text-white' : 'text-slate-200'
                              }`}>
                                {formatCurrencyINR(s.sips.flatSip)}<span className="text-[10px] font-normal font-sans text-slate-400">/mo</span>
                              </span>
                            </div>

                            {/* Step-Up SIP */}
                            <div>
                              <div className="flex items-center justify-between text-[10px] text-indigo-400 font-semibold">
                                <span>Step-Up:</span>
                                <span className="font-mono text-[9px] bg-emerald-500/10 text-emerald-400 px-1 py-0.2 rounded font-black">({s.percentOfSalaryStepUp}%)</span>
                              </div>
                              <span className={`text-[13.5px] font-black font-display block mt-0.5 ${
                                isSelected ? 'text-emerald-300' : 'text-emerald-400'
                              }`}>
                                {formatCurrencyINR(s.sips.stepUpSip)}<span className="text-[10px] font-normal font-sans">/mo</span>
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cash Flow Breakdown Panel */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 text-left shadow-xs">
                  <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                    <TrendingUp className="w-4 h-4 text-slate-500" />
                    Current Monthly Budget Distribution
                  </h4>
                  <div className="mt-4 space-y-3">
                    <div className="flex justify-between text-xs text-slate-600 font-mono">
                      <span>Total Net Income: {formatCurrencyINR(currentMonthlyIncome)}</span>
                      <span>100%</span>
                    </div>
                    
                    {/* Visual Bar Graph */}
                    <div className="h-4 bg-slate-100 rounded-lg overflow-hidden flex font-mono text-[9px] text-white font-bold">
                      <div className="bg-rose-500 h-full flex items-center justify-center transition-all" style={{ width: `${Math.max(8, (currentMonthlyExpense / currentMonthlyIncome) * 100)}%` }} title="Living Expenses">
                        {((currentMonthlyExpense / currentMonthlyIncome) * 100).toFixed(0)}% Exp
                      </div>
                      {retirementData.totalCurrentEmi > 0 && (
                        <div className="bg-amber-500 h-full flex items-center justify-center border-l border-white transition-all" style={{ width: `${Math.max(8, (retirementData.totalCurrentEmi / currentMonthlyIncome) * 100)}%` }} title="EMIs & Debts">
                          {((retirementData.totalCurrentEmi / currentMonthlyIncome) * 100).toFixed(0)}% Debt
                        </div>
                      )}
                      <div className="bg-emerald-500 h-full flex items-center justify-center border-l border-white transition-all flex-1" title="Surplus">
                        {((retirementData.currentMonthlySurplus / currentMonthlyIncome) * 100).toFixed(0)}% Surplus
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1.5 text-[11px] font-mono">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-xs" />
                        <span className="text-slate-500">Income: <strong>{formatCurrencyINR(currentMonthlyIncome)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-rose-500 rounded-xs" />
                        <span className="text-slate-500">Living Exp: <strong>{formatCurrencyINR(currentMonthlyExpense)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-amber-500 rounded-xs" />
                        <span className="text-slate-500">Active EMIs: <strong>{formatCurrencyINR(retirementData.totalCurrentEmi)}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 bg-emerald-500 rounded-xs" />
                        <span className="text-slate-500">Net Surplus: <strong className="text-emerald-600">{formatCurrencyINR(retirementData.currentMonthlySurplus)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Progress Mountain & Expense Checkpoints */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5.5 text-left shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Milestone className="w-4.5 h-4.5 text-indigo-600" />
                      <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                        Timeline to Freedom: Expense Checkpoints
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded">
                      Psychological Progress Trail
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed">
                    Breaking down a massive financial goal into intermediate checkpoints turns an intimidating mountain into a series of achievable peaks. Compound your starting SIP of **{formatCurrencyINR(retirementData.requiredMonthlySipStepUp)}/mo** to conquer each level.
                  </p>

                  {/* The Progress Mountain Visual trail */}
                  <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[1.5px] before:bg-dashed before:border-l before:border-slate-300">
                    
                    {/* Checkpoint 1 */}
                    <div className="relative">
                      {/* Checkpoint Marker */}
                      <span className="absolute -left-6 top-1 w-5.5 h-5.5 rounded-full bg-emerald-50 border border-emerald-300 flex items-center justify-center font-bold text-[10px] text-emerald-600 shadow-xs z-10">
                        1
                      </span>
                      <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl transition-all space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-bold text-[12.5px] text-slate-800">
                            Checkpoint 1: Survival Secured!
                          </span>
                          <span className="font-mono text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                            Year {retirementData.yearHitSurvival} (Age {currentAge + retirementData.yearHitSurvival})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Your portfolio has reached <strong className="text-slate-800 font-extrabold">{formatInLakhs(retirementData.corpusSurvival)}</strong>. If you ever needed to, this corpus could generate enough passive income to cover your basic groceries forever. <span className="text-indigo-600 font-medium">(Keep compounding to reach Level 2!)</span>
                        </p>
                      </div>
                    </div>

                    {/* Checkpoint 2 */}
                    <div className="relative">
                      {/* Checkpoint Marker */}
                      <span className="absolute -left-6 top-1 w-5.5 h-5.5 rounded-full bg-blue-50 border border-blue-300 flex items-center justify-center font-bold text-[10px] text-blue-600 shadow-xs z-10">
                        2
                      </span>
                      <div className="bg-slate-50/60 hover:bg-slate-50 border border-slate-100 p-3.5 rounded-xl transition-all space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-bold text-[12.5px] text-slate-800">
                            Checkpoint 2: Lifestyle Secured!
                          </span>
                          <span className="font-mono text-[10.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                            Year {retirementData.yearHitLifestyle} (Age {currentAge + retirementData.yearHitLifestyle})
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed">
                          Your portfolio has reached <strong className="text-slate-800 font-extrabold">{formatInLakhs(retirementData.corpusSurvival + retirementData.corpusLifestyle)}</strong>. You now have the financial power to cover rent & bills passively.
                        </p>
                      </div>
                    </div>

                    {/* Checkpoint 3 */}
                    <div className="relative">
                      {/* Checkpoint Marker */}
                      <span className="absolute -left-6 top-1 w-5.5 h-5.5 rounded-full bg-indigo-50 border border-indigo-300 flex items-center justify-center font-bold text-[10px] text-indigo-600 shadow-xs z-10">
                        3
                      </span>
                      <div className="bg-indigo-50/20 hover:bg-indigo-50/30 border border-indigo-100/40 p-3.5 rounded-xl transition-all space-y-1">
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <span className="font-bold text-[12.5px] text-indigo-950">
                            Checkpoint 3: Total Financial Freedom!
                          </span>
                          <span className="font-mono text-[10.5px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                            Year {retirementData.yearHitTotal} (Age {currentAge + retirementData.yearHitTotal})
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                          Your portfolio has reached the final target of <strong className="text-indigo-950 font-extrabold">{formatInLakhs(retirementData.totalRequiredCorpusAtRetirement)}</strong>. Complete financial freedom is secured forever!
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Disclaimer / Tooltip at the bottom */}
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-start gap-2 text-[10.5px] text-slate-500 mt-2">
                    <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">
                      <strong>Note:</strong> These milestones represent your financial capacity (safety net). Actual early withdrawals will increase the time required to reach your final retirement goal.
                    </p>
                  </div>
                </div>

                {/* THE ULTIMATE COST OF DELAY FOMO ANALYSIS PANEL */}
                <div className="bg-slate-900 text-white rounded-3xl p-5.5 text-left relative overflow-hidden border border-slate-800 shadow-lg">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Sparkles className="w-40 h-40" />
                  </div>
                  
                  <div className="space-y-1 relative z-10">
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                      ⚠ Urgent: Compounding Dynamics
                    </div>
                    <h4 className="text-lg font-bold font-display tracking-tight text-white mt-1">
                      The Severe Cost of Waiting: See What 5 Years Can Do!
                    </h4>
                    <p className="text-slate-400 text-[11.5px] leading-relaxed max-w-2xl">
                      Compounding is heavily back-loaded. Waiting just 5 years to start investing forces you to commit a dramatically larger amount of money each month to achieve the exact same retirement lifestyle.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5 relative z-10">
                    
                    {/* Started 5 Years Earlier */}
                    <div className="bg-slate-950/65 border border-emerald-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-500/40 transition-all text-center sm:text-left">
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-emerald-500/5 rounded-full" />
                      <span className="text-[9px] font-bold text-emerald-400 font-mono uppercase tracking-wider block">5 Years Earlier</span>
                      <p className="text-xl font-display font-black text-slate-100 mt-1">
                        {formatCurrencyINR(retirementData.requiredMonthlySipEarly)}
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                      </p>
                      <span className="text-[10px] text-emerald-400/90 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                        ✓ Save {Math.round(((retirementData.requiredMonthlySip - retirementData.requiredMonthlySipEarly) / retirementData.requiredMonthlySip) * 100)}% Monthly!
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        Compounding did the heavy lifting early on. Easy, stress-free path.
                      </p>
                    </div>

                    {/* Start Today */}
                    <div className="bg-slate-950/65 border border-indigo-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-indigo-500/40 transition-all text-center sm:text-left shadow-md">
                      <div className="absolute top-2 right-2 bg-indigo-500 text-slate-950 text-[8px] font-bold px-1.5 py-0.5 rounded font-mono uppercase">
                        Current Target
                      </div>
                      <span className="text-[9px] font-bold text-indigo-400 font-mono uppercase tracking-wider block">Start Today</span>
                      <p className="text-xl font-display font-black text-white mt-1">
                        {formatCurrencyINR(retirementData.requiredMonthlySip)}
                        <span className="text-xs text-indigo-300 font-normal">/mo</span>
                      </p>
                      <span className="text-[10px] text-indigo-300 font-bold bg-indigo-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                        Baseline Benchmark
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        Your absolute baseline target starting right now at Age {currentAge}.
                      </p>
                    </div>

                    {/* Start 5 Years Later */}
                    <div className="bg-slate-950/65 border border-rose-500/20 p-4 rounded-2xl relative overflow-hidden group hover:border-rose-500/40 transition-all text-center sm:text-left">
                      <div className="absolute -top-3 -right-3 w-10 h-10 bg-rose-500/5 rounded-full" />
                      <span className="text-[9px] font-bold text-rose-400 font-mono uppercase tracking-wider block">5 Years Later</span>
                      <p className="text-xl font-display font-black text-slate-100 mt-1">
                        {formatCurrencyINR(retirementData.requiredMonthlySipLate)}
                        <span className="text-xs text-slate-400 font-normal">/mo</span>
                      </p>
                      <span className="text-[10px] text-rose-400/90 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded mt-2 inline-block">
                        🚨 Cost Jumps +{Math.round(((retirementData.requiredMonthlySipLate - retirementData.requiredMonthlySip) / retirementData.requiredMonthlySip) * 100)}%!
                      </span>
                      <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                        You must commit <strong>{formatCurrencyINR(retirementData.requiredMonthlySipLate - retirementData.requiredMonthlySip)}/mo more</strong> for the rest of your life!
                      </p>
                    </div>

                  </div>

                  <div className="bg-slate-950/40 border border-slate-800 p-3 rounded-xl mt-4 relative z-10 flex items-center gap-2 text-[10.5px] text-slate-300 justify-center">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Every single day of delay increases your future compounding burden. Lock in your current rates today!</span>
                  </div>
                </div>

                {/* 15-YEAR DECUMULATION BUCKET STRATEGY */}
                <div className="bg-white border border-slate-150 rounded-2xl p-5 text-left shadow-xs space-y-4">
                  <div className="border-b border-slate-100 pb-2">
                    <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest font-mono">Innovative Capital Safeguard</span>
                    <h4 className="text-[15.5px] font-bold font-display text-slate-900 mt-0.5">
                      Your Customized 15-Year Decumulation Bucket Strategy
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed mt-1">
                      Rather than placing your entire <strong>{formatCurrencyINR(retirementData.totalRequiredCorpusAtRetirement)}</strong> corpus in low-yield fixed assets, we divide your wealth into three distinct tactical buckets to combat inflation while securing monthly cash flows:
                    </p>
                  </div>

                  <div className="space-y-4.5 pt-1">
                    
                    {/* Bucket 1 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                          Bucket 1: Arbitrage & Liquid (Years 1-5 Payouts)
                        </span>
                        <span className="font-mono font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                          {formatCurrencyINR(retirementData.bucket1Arbitrage)} (30%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-slate-700 h-full rounded-full" style={{ width: '30%' }} />
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        Placed in stable arbitrage & ultra-short debt mutual funds yielding ~6.5% CAGR. This funds your immediate monthly cash flows for the first 5 years of retirement, insulating you fully from market crashes.
                      </p>
                    </div>

                    {/* Bucket 2 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
                          Bucket 2: Conservative Hybrid (Years 6-10 Payouts)
                        </span>
                        <span className="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                          {formatCurrencyINR(retirementData.bucket2Hybrid)} (30%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: '30%' }} />
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        Invested in debt-oriented conservative hybrid funds targeting ~8.5% CAGR. Left untouched for 5 years to compound, then systematically liquidated during Years 6-10.
                      </p>
                    </div>

                    {/* Bucket 3 */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-800 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          Bucket 3: Diversified Equity (Years 11-15 & Beyond)
                        </span>
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          {formatCurrencyINR(retirementData.bucket3Equity)} (40%)
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '40%' }} />
                      </div>
                      <p className="text-[10.5px] text-slate-400 leading-relaxed">
                        Invested in highly diversified multi-cap or large-and-mid mutual funds targeting ~12.5% pre-retirement returns. 
                        By Year 15, Buckets 1 & 2 are exhausted, but Bucket 3 has compounded untouched, growing from <strong className="text-slate-800">{formatCurrencyINR(retirementData.bucket3Equity)}</strong> into a massive <strong className="text-emerald-600">{formatCurrencyINR(retirementData.bucket3FutureValue15Years)}</strong>! This fully restores your original starting capital, keeping your retirement safe indefinitely.
                      </p>
                    </div>

                  </div>
                </div>

                {/* THE TAKE ACTION TODAY - CONVERTING OPTION HUB */}
                <div className="bg-slate-50 border border-slate-150 rounded-3xl p-5 text-left shadow-sm">
                  
                  {/* Lead Magnet Option Selector Tab */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Take Action Today
                    </span>
                    <h4 className="text-[17px] font-bold font-display text-slate-900 mt-1.5">
                      Ready to Secure Your Retirement Journey?
                    </h4>
                    <p className="text-slate-500 text-xs">
                      Choose one of our premium, 100% confidential wealth advisory tools below. Start your journey with absolute confidence.
                    </p>
                  </div>

                  {/* Form Selectors */}
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
                      🤝 Schedule Callback
                    </button>
                  </div>

                  {/* Lead Capture Body */}
                  <div className="mt-5 bg-white border border-slate-100 p-4 rounded-2xl shadow-xs relative">
                    
                    {leadFormSuccess ? (
                      <div className="py-6 text-center space-y-3 animate-fade-in">
                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 text-xl font-bold">
                          ✓
                        </div>
                        <h5 className="font-bold text-sm text-slate-900 font-display">Action Confirmed Successfully!</h5>
                        <p className="text-[11.5px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                          {activeLeadOption === 'pdf' 
                            ? `Your custom 3-Page Financial Freedom Blueprint PDF has been compiled and downloaded to your device! A registration copy has been saved in the CRM portal.`
                            : activeLeadOption === 'whatsapp'
                              ? `Your fastback callback request has been received. Our senior wealth manager will call you back within 15 minutes!`
                              : `Your Analysis session has been booked. Our Certified Analyst has been allocated your exact financial runway details & will connect at your chosen time slot.`
                          }
                        </p>
                        <button
                          type="button"
                          onClick={() => setLeadFormSuccess(false)}
                          className="text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl transition-all cursor-pointer"
                        >
                          Book Another Action
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={(e) => handleLeadSubmit(e, activeLeadOption)} className="space-y-3 text-left">
                        
                        {leadFormError && (
                          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-1.5">
                            <span className="text-base leading-none">⚠</span>
                            <span>{leadFormError}</span>
                          </div>
                        )}

                        {/* Standard Inputs */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Your Full Name <span className="text-rose-500">*</span></label>
                            <input
                              type="text"
                              required
                              value={leadName}
                              onChange={(e) => setLeadName(e.target.value)}
                              placeholder="e.g. Rajesh Kumar"
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
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
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                            />
                          </div>

                          {(activeLeadOption === 'pdf' || activeLeadOption === 'consult') && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Email Address <span className="text-rose-500">*</span></label>
                              <input
                                type="email"
                                required
                                value={activeLeadOption === 'pdf' ? pdfEmail : leadEmail}
                                onChange={(e) => activeLeadOption === 'pdf' ? setPdfEmail(e.target.value) : setLeadEmail(e.target.value)}
                                placeholder="e.g. rajesh@gmail.com"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                              />
                            </div>
                          )}
                        </div>

                        {/* Booking Fields for VIP Consult */}
                        {activeLeadOption === 'consult' && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Advisory Date <span className="text-rose-500">*</span></label>
                              <input
                                type="date"
                                required
                                value={leadDate}
                                onChange={(e) => setLeadDate(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Preferred Time Slot <span className="text-rose-500">*</span></label>
                              <select
                                required
                                value={leadTimeSlot}
                                onChange={(e) => setLeadTimeSlot(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-bold text-slate-800 text-slate-700"
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

                        <button
                          type="submit"
                          className="w-full mt-3 flex items-center justify-center gap-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 py-3 rounded-xl transition-all cursor-pointer shadow-sm font-display"
                        >
                          {activeLeadOption === 'pdf' && (
                            <>📩 Send My PDF Freedom Blueprint Now</>
                          )}
                          {activeLeadOption === 'whatsapp' && (
                            <>⚡ Request Instant Callback from Certified Analyst</>
                          )}
                          {activeLeadOption === 'consult' && (
                            <>🤝 Schedule Analysis session & book now</>
                          )}
                        </button>

                        <div className="pt-2 text-center text-[10px] text-slate-400">
                          🔒 Regulated secure wealth service. No spam. Unsubscribe at any time.
                        </div>

                      </form>
                    )}

                  </div>

                </div>

              </div>
            </div>
          </div>
        )}
        {activeTab === 'retirement' && false && (
          <div className="space-y-8 animate-fade-in" id="retirement-calculator-wizard-legacy">
            
            {/* WIZARD MODE: Enter your metrics */}
            {!showRetirementResults ? (
              <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden text-left">
                {/* Wizard Header */}
                <div className="bg-slate-900 p-6 text-white relative">
                  <div className="absolute top-4 right-4 bg-amber-500 text-slate-950 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    Lead Magnet
                  </div>
                  <h3 className="text-[18px] font-bold font-display flex items-center gap-2">
                    <Milestone className="w-5 h-5 text-amber-400" />
                    Build Your Financial Freedom Blueprint
                  </h3>
                  <p className="text-slate-300 text-xs mt-1">
                    Complete this 4-step wizard to see your custom retirement payout roadmap & Wealth Freedom Score.
                  </p>
                  {/* Step Tracker */}
                  <div className="mt-5 flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold uppercase">
                      Step {retirementStep} of 4: {
                        retirementStep === 1 ? 'Timeline & ROI' :
                        retirementStep === 2 ? 'Income & Expenses' :
                        retirementStep === 3 ? 'Assets & Savings' :
                        'Outstanding Debts'
                      }
                    </span>
                    <span className="text-slate-400">{retirementStep * 25}% Complete</span>
                  </div>
                  <div className="mt-2 h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full transition-all duration-300" style={{ width: `${retirementStep * 25}%` }} />
                  </div>
                </div>

                {/* Wizard Body */}
                <div className="p-6 space-y-5">
                  {retirementStep === 1 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex gap-2.5 items-start">
                        <Zap className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11.5px] text-blue-800 leading-relaxed">
                          <strong>Your Time Runway:</strong> Defining your accumulation window is the first step. More time allows compounding to do the heavy lifting, drastically reducing your required monthly savings.
                        </p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Current Age</label>
                          <input type="number" min="18" max="74" value={currentAge || ''} onChange={(e) => handleCurrentAgeChange(Number(e.target.value))} onBlur={handleCurrentAgeBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm font-bold text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Retire Age</label>
                          <input type="number" min={currentAge + 1} max="80" value={retirementAge || ''} onChange={(e) => handleRetirementAgeChange(Number(e.target.value))} onBlur={handleRetirementAgeBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm font-bold text-slate-800" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Life Expect</label>
                          <input type="number" min={retirementAge + 1} max="110" value={lifeExpectancy || ''} onChange={(e) => handleLifeExpectancyChange(Number(e.target.value))} onBlur={handleLifeExpectancyBlur} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-center text-sm font-bold text-slate-800" />
                        </div>
                      </div>
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">Pre-Retirement ROI Expectation</label>
                          <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded">{preRetirementReturn}%</span>
                        </div>
                        <input type="range" min="6" max="25" step="0.5" value={preRetirementReturn} onChange={(e) => setPreRetirementReturn(Number(e.target.value))} className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>
                    </div>
                  )}

                  {retirementStep === 2 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-100 flex gap-2.5 items-start">
                        <Activity className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11.5px] text-amber-800 leading-relaxed">
                          <strong>Inflation Defense:</strong> To secure your lifestyle, your corpus must outgrow inflation. A budget of ₹50k today requires over ₹2.1 Lakhs/mo in 25 years at 6% inflation.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">Monthly Net Income Today</label>
                          <span className="font-mono text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded">
                            {formatCurrencyINR(currentMonthlyIncome)}
                          </span>
                        </div>
                        <input type="range" min="20000" max="1000000" step="10000" value={currentMonthlyIncome} onChange={(e) => setCurrentMonthlyIncome(Number(e.target.value))} className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>
                      <div className="space-y-2.5 pt-1 border-t border-slate-100 mt-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-800">Monthly Expenses Breakdown</label>
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            Total: {formatCurrencyINR(currentMonthlyExpense)}
                          </span>
                        </div>

                        {/* Basic Survival */}
                        <div className="space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-slate-700">Survival (Groceries/Bills)</span>
                            <span className="font-mono font-bold text-slate-900">{formatCurrencyINR(expenseBasicSurvival)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="5000" 
                            max="300000" 
                            step="1000" 
                            value={expenseBasicSurvival} 
                            onChange={(e) => setExpenseBasicSurvival(Number(e.target.value))} 
                            className="w-full accent-slate-700 h-1 bg-slate-200 rounded-full cursor-pointer appearance-none" 
                          />
                        </div>

                        {/* Lifestyle */}
                        <div className="space-y-1 bg-blue-50/40 p-2 rounded-lg border border-blue-100/40">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-blue-900">Lifestyle (Rent/School)</span>
                            <span className="font-mono font-bold text-blue-900">{formatCurrencyINR(expenseLifestyle)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="300000" 
                            step="1000" 
                            value={expenseLifestyle} 
                            onChange={(e) => setExpenseLifestyle(Number(e.target.value))} 
                            className="w-full accent-blue-600 h-1 bg-blue-100 rounded-full cursor-pointer appearance-none" 
                          />
                        </div>

                        {/* Luxuries */}
                        <div className="space-y-1 bg-indigo-50/40 p-2 rounded-lg border border-indigo-100/40">
                          <div className="flex justify-between items-center text-[10px]">
                            <span className="font-semibold text-indigo-900">Luxuries (Dining/Travel)</span>
                            <span className="font-mono font-bold text-indigo-900">{formatCurrencyINR(expenseLuxuries)}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="200000" 
                            step="1000" 
                            value={expenseLuxuries} 
                            onChange={(e) => setExpenseLuxuries(Number(e.target.value))} 
                            className="w-full accent-indigo-600 h-1 bg-indigo-100 rounded-full cursor-pointer appearance-none" 
                          />
                        </div>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <div className="flex justify-between items-center text-xs">
                          <label className="font-bold text-slate-700">Assumed Average Inflation Rate</label>
                          <span className="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">{inflationRateRetirement}%</span>
                        </div>
                        <input type="range" min="4" max="12" step="0.5" value={inflationRateRetirement} onChange={(e) => setInflationRateRetirement(Number(e.target.value))} className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>
                    </div>
                  )}

                  {retirementStep === 3 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex gap-2.5 items-start">
                        <Coins className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11.5px] text-slate-600 leading-relaxed">
                          <strong>Existing Foundations:</strong> Any mutual funds, EPF, NPS, or savings you already hold will compound over your runway, substantially lowering your required new monthly savings.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">Existing Investments & Savings Today</label>
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                            {formatCurrencyINR(existingSavings)}
                          </span>
                        </div>
                        <input type="range" min="0" max="20000000" step="50000" value={existingSavings} onChange={(e) => setExistingSavings(Number(e.target.value))} className="w-full accent-slate-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">Corporate Accumulations (EPF, NPS, Gratuity)</label>
                          <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded">
                            {formatCurrencyINR(expectedLumpSum)}
                          </span>
                        </div>
                        <input type="range" min="0" max="20000000" step="50000" value={expectedLumpSum} onChange={(e) => setExpectedLumpSum(Number(e.target.value))} className="w-full accent-slate-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>

                      <div className="space-y-2.5 bg-emerald-50/20 p-2.5 rounded-xl border border-emerald-100/40">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Bonus & Lump Sum Accelerator</span>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-slate-700">Expected Annual Bonus / Lump Sum (₹)</label>
                            <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-100/60 px-1.5 py-0.5 rounded">
                              {formatCurrencyINR(annualBonusRetirement)}
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="0" 
                            max="2000000" 
                            step="20000" 
                            value={annualBonusRetirement} 
                            onChange={(e) => setAnnualBonusRetirement(Number(e.target.value))} 
                            className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" 
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between items-center text-xs">
                            <label className="font-medium text-slate-700">Duration of these investments (Years)</label>
                            <span className="font-mono text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
                              {bonusYearsRetirement} Years
                            </span>
                          </div>
                          <input 
                            type="range" 
                            min="1" 
                            max="40" 
                            step="1" 
                            value={bonusYearsRetirement} 
                            onChange={(e) => setBonusYearsRetirement(Number(e.target.value))} 
                            className="w-full accent-emerald-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" 
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">One-Time Retirement Goal</label>
                          <input type="number" value={oneTimeRetirementGoal || ''} onChange={(e) => setOneTimeRetirementGoal(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800" placeholder="e.g. travel, wedding" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Legacy Estate for Kids</label>
                          <input type="number" value={estateAmount || ''} onChange={(e) => setEstateAmount(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800" placeholder="Leave legacy estate" />
                        </div>
                      </div>
                    </div>
                  )}

                  {retirementStep === 4 && (
                    <div className="space-y-4 animate-fade-in">
                      <div className="bg-rose-50/50 p-3.5 rounded-xl border border-rose-100 flex gap-2.5 items-start">
                        <ShieldPlus className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" />
                        <p className="text-[11.5px] text-rose-800 leading-relaxed">
                          <strong>Liabilities & EMIs:</strong> Active loans drain your investible surplus. Understanding this allows our system to factor in loan closeouts, automatically freeing up cash flow to accelerate retirement wealth.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-bold text-slate-700">Total Outstanding Loan Debt</label>
                          <span className="font-mono text-xs font-bold bg-rose-50 text-rose-700 px-2.5 py-1 rounded">
                            {formatCurrencyINR(totalLoanAmount)}
                          </span>
                        </div>
                        <input type="range" min="0" max="30000000" step="10000" value={totalLoanAmount} onChange={(e) => setTotalLoanAmount(Number(e.target.value))} className="w-full accent-rose-500 h-1.5 bg-slate-100 rounded-full cursor-pointer appearance-none" />
                      </div>
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <span className="text-[11px] font-bold text-slate-600 block">Identify current active monthly EMIs (Up to 3):</span>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">EMI 1</span>
                            <input type="number" value={emi1Amount || ''} onChange={(e) => setEmi1Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 text-center" />
                            <select value={emi1Years} onChange={(e) => setEmi1Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700">
                              {[1,2,3,4,5,7,10,15,20,25].map(y => (
                                <option key={y} value={y}>{y} {y === 1 ? 'yr left' : 'yrs left'}</option>
                              ))}
                            </select>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">EMI 2</span>
                            <input type="number" value={emi2Amount || ''} onChange={(e) => setEmi2Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 text-center" />
                            <select value={emi2Years} onChange={(e) => setEmi2Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700">
                              {[0,1,2,3,4,5,7,10,15,20,25].map(y => (
                                <option key={y} value={y}>{y === 0 ? 'None' : `${y} yrs left`}</option>
                              ))}
                            </select>
                          </div>
                          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                            <span className="text-[9px] text-slate-400 font-bold uppercase block">EMI 3</span>
                            <input type="number" value={emi3Amount || ''} onChange={(e) => setEmi3Amount(Number(e.target.value))} placeholder="Amount" className="w-full bg-white border border-slate-200 rounded p-1 text-xs font-bold text-slate-800 text-center" />
                            <select value={emi3Years} onChange={(e) => setEmi3Years(Number(e.target.value))} className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] text-slate-700">
                              {[0,1,2,3,4,5,7,10,15,20,25].map(y => (
                                <option key={y} value={y}>{y === 0 ? 'None' : `${y} yrs left`}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Wizard Footer */}
                <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between">
                  {retirementStep > 1 ? (
                    <button onClick={() => setRetirementStep(prev => prev - 1)} className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-all cursor-pointer">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  ) : <div />}

                  {retirementStep < 4 ? (
                    <button onClick={() => setRetirementStep(prev => prev + 1)} className="flex items-center gap-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-2.5 rounded-xl transition-all cursor-pointer">
                      Continue <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowRetirementResults(true);
                        setTimeout(() => {
                          document.getElementById('retirement-calculator')?.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-6 py-3 rounded-xl transition-all cursor-pointer animate-pulse-once font-display"
                    >
                      <Sparkles className="w-4 h-4" /> Generate Freedom Blueprint
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* RESULTS MODE: 2-column layout */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column (7 Cols) - Results & Custom Decumulation roadmap */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Results Control Header */}
                  <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs text-left flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                        Blueprint Unlocked
                      </span>
                      <h4 className="text-[16px] font-bold text-slate-900 mt-1 font-display">
                        Your Custom Financial Freedom Blueprint
                      </h4>
                      <p className="text-[11.5px] text-slate-500">Age {currentAge} runway to Age {retirementAge} Retirement target.</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowRetirementResults(false);
                        setRetirementStep(1);
                      }}
                      className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 px-4 py-2 rounded-xl border border-slate-200 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                      Edit Inputs
                    </button>
                  </div>

                  {/* Readiness Score Card */}
                  <div className="bg-[#0F172A] text-white rounded-2xl p-6 shadow-sm text-left relative overflow-hidden border border-slate-800">
                    <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" />
                    <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl" />
                    
                    <div className="flex flex-col sm:flex-row gap-6 items-center">
                      <div className="relative flex items-center justify-center flex-shrink-0">
                        <svg className="w-24 h-24 transform -rotate-90">
                          <circle cx="48" cy="48" r="42" stroke="#1E293B" strokeWidth="6" fill="transparent" />
                          <circle cx="48" cy="48" r="42" stroke="#10B981" strokeWidth="6" fill="transparent"
                            strokeDasharray={263.8}
                            strokeDashoffset={263.8 - (263.8 * Math.min(100, Math.max(10, Math.round((retirementData.currentMonthlySurplus / Math.max(1, retirementData.requiredMonthlySip)) * 100)))) / 100} 
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute text-center">
                          <span className="text-[20px] font-display font-black text-white block">
                            {Math.min(100, Math.max(0, Math.round((retirementData.currentMonthlySurplus / Math.max(1, retirementData.requiredMonthlySip)) * 100)))}%
                          </span>
                          <span className="text-[8px] font-mono font-bold text-slate-400 uppercase tracking-widest block mt-0.5">Readiness</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[9px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                          Freedom Readiness Diagnosis
                        </span>
                        <h4 className="text-[15px] font-bold text-slate-100">
                          {retirementData.currentMonthlySurplus >= retirementData.requiredMonthlySip 
                            ? "✅ Ready for financial independence!" 
                            : "⚠️ Cash flow optimization recommended."
                          }
                        </h4>
                        <p className="text-[11.5px] text-slate-300 leading-relaxed">
                          {retirementData.currentMonthlySurplus >= retirementData.requiredMonthlySip 
                            ? `Your monthly investible surplus of ${formatCurrencyINR(retirementData.currentMonthlySurplus)} easily covers your recommended retirement SIP of ${formatCurrencyINR(retirementData.requiredMonthlySip)}. Commencing today is highly recommended.`
                            : `Your recommended retirement SIP is ${formatCurrencyINR(retirementData.requiredMonthlySip)}/mo, while your current surplus is ${formatCurrencyINR(retirementData.currentMonthlySurplus)}. Optimizing debts or expenses can bridge this ${formatCurrencyINR(retirementData.requiredMonthlySip - retirementData.currentMonthlySurplus)}/mo gap.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Inflated Budget at {retirementAge}</p>
                      <p className="text-[18px] font-display font-bold text-slate-900 mt-1">{formatCurrencyINR(retirementData.futureMonthlyExpense)}<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                      <span className="absolute top-2 right-2 text-[8px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded font-mono">
                        {inflationRateRetirement}% Inflated
                      </span>
                    </div>

                    <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Corpus Goal</p>
                      <p className="text-[18px] font-display font-bold text-blue-600 mt-1">{formatCurrencyINR(retirementData.totalRequiredCorpusAtRetirement)}</p>
                      <span className="absolute top-2 right-2 text-[8px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded font-mono">
                        Target Capital
                      </span>
                    </div>

                    <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-2xl shadow-xs text-left relative overflow-hidden">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Recommended SIP</p>
                      <p className="text-[18px] font-display font-bold mt-1 text-emerald-600">{formatCurrencyINR(retirementData.requiredMonthlySip)}<span className="text-xs text-slate-500 font-normal">/mo</span></p>
                      <span className="absolute top-2 right-2 text-[8px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-mono">
                        Best Rate
                      </span>
                    </div>
                  </div>

                  {/* Budget Allocation Progress */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left space-y-3">
                    <h4 className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-indigo-500" />
                      Monthly Budget Allocation & EMIs
                    </h4>
                    <div className="space-y-1.5 pt-1">
                      <div className="flex justify-between text-[10.5px] text-slate-400">
                        <span>Current Income Breakdown</span>
                        <span>Total Monthly Income: {formatCurrencyINR(currentMonthlyIncome)}</span>
                      </div>
                      <div className="h-4 w-full bg-slate-100 rounded-lg overflow-hidden flex">
                        <div style={{ width: `${Math.min(100, (currentMonthlyExpense / currentMonthlyIncome) * 100)}%` }} className="bg-blue-500 h-full hover:opacity-95" title="Living Expenses" />
                        <div style={{ width: `${Math.min(100 - (currentMonthlyExpense / currentMonthlyIncome) * 100, (retirementData.totalCurrentEmi / currentMonthlyIncome) * 100)}%` }} className="bg-red-500 h-full hover:opacity-95" title="EMIs" />
                        <div style={{ width: `${Math.max(0, 100 - (currentMonthlyExpense / currentMonthlyIncome) * 100 - (retirementData.totalCurrentEmi / currentMonthlyIncome) * 100)}%` }} className="bg-emerald-500 h-full hover:opacity-95" title="Surplus" />
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block"></span>
                          <span>Expenses: {formatCurrencyINR(currentMonthlyExpense)} ({((currentMonthlyExpense / currentMonthlyIncome) * 100).toFixed(0)}%)</span>
                        </div>
                        {retirementData.totalCurrentEmi > 0 && (
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block"></span>
                            <span>EMIs: {formatCurrencyINR(retirementData.totalCurrentEmi)} ({((retirementData.totalCurrentEmi / currentMonthlyIncome) * 100).toFixed(0)}%)</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block"></span>
                          <span>Surplus: {formatCurrencyINR(retirementData.currentMonthlySurplus)} ({((retirementData.currentMonthlySurplus / currentMonthlyIncome) * 100).toFixed(0)}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* FOMO: Cost of delay compounding multiplier */}
                  {retirementData.requiredMonthlySip > 0 && (
                    <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left space-y-4">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[14px] font-bold text-slate-900 flex items-center gap-1.5">
                          <Zap className="w-4 h-4 text-amber-500" />
                          The Cost of Waiting: Why Starting Today is Critical
                        </span>
                        <span className="text-[9px] bg-amber-50 text-amber-700 border border-amber-200/60 px-2 py-0.5 rounded font-bold font-mono">
                          Time Multiplier
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Started 5 Yrs Early */}
                        <div className="p-3 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-1 relative overflow-hidden">
                          <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider block">Started 5 Yrs Earlier</span>
                          <div className="text-[14px] font-bold text-emerald-800">
                            {formatCurrencyINR(retirementData.requiredMonthlySipEarly)}<span className="text-[10px] font-normal text-emerald-600">/mo</span>
                          </div>
                          {retirementData.requiredMonthlySip > retirementData.requiredMonthlySipEarly && (
                            <span className="text-[10px] text-emerald-700 block font-semibold leading-tight pt-1">
                              Save <strong>{Math.round(((retirementData.requiredMonthlySip - retirementData.requiredMonthlySipEarly) / retirementData.requiredMonthlySip) * 100)}%</strong> (or {formatCurrencyINR(retirementData.requiredMonthlySip - retirementData.requiredMonthlySipEarly)}/mo less!)
                            </span>
                          )}
                          <Clock className="absolute bottom-2 right-2 w-4 h-4 text-emerald-300" />
                        </div>

                        {/* Start Today */}
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1 relative overflow-hidden ring-2 ring-blue-100/50">
                          <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">Start Today (Age {currentAge})</span>
                          <div className="text-[14px] font-bold text-blue-800">
                            {formatCurrencyINR(retirementData.requiredMonthlySip)}<span className="text-[10px] font-normal text-blue-600">/mo</span>
                          </div>
                          <span className="text-[10px] text-blue-700 block font-semibold leading-tight pt-1">
                            Lock in maximum compounding window today.
                          </span>
                          <span className="absolute top-0 right-0 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-bl uppercase font-mono">Best Time</span>
                        </div>

                        {/* Delay by 5 Years */}
                        <div className="p-3 bg-rose-50/40 border border-rose-100 rounded-xl space-y-1 relative overflow-hidden">
                          <span className="text-[9px] font-bold text-rose-700 uppercase tracking-wider block">Delay by 5 Years</span>
                          <div className="text-[14px] font-bold text-rose-800">
                            {formatCurrencyINR(retirementData.requiredMonthlySipLate)}<span className="text-[10px] font-normal text-rose-600">/mo</span>
                          </div>
                          {retirementData.requiredMonthlySipLate > retirementData.requiredMonthlySip && (
                            <span className="text-[10px] text-rose-700 block font-semibold leading-tight pt-1">
                              Cost jumps: <strong>+{Math.round(((retirementData.requiredMonthlySipLate - retirementData.requiredMonthlySip) / retirementData.requiredMonthlySip) * 100)}%</strong> (+{formatCurrencyINR(retirementData.requiredMonthlySipLate - retirementData.requiredMonthlySip)}/mo!)
                            </span>
                          )}
                          <AlertTriangle className="absolute bottom-2 right-2 w-4 h-4 text-rose-300" />
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 italic leading-relaxed text-center bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        ⌛ Delaying just 5 years shrinks your growth window, forcing you to save <strong>+{Math.round(((retirementData.requiredMonthlySipLate - retirementData.requiredMonthlySip) / retirementData.requiredMonthlySip) * 100)}% more</strong> monthly to reach the exact same target.
                      </p>
                    </div>
                  )}

                  {/* Detailed Diagnostics */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left">
                    <h4 className="text-[14px] font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Freedom Blueprint Diagnostics
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div className="space-y-2.5">
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">Accumulation Runway:</span>
                          <span className="font-bold text-slate-800">{retirementData.yearsToRetirement} Years</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">Survival Window:</span>
                          <span className="font-bold text-slate-800">{retirementData.yearsInRetirement} Years</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">Current Living Expenses:</span>
                          <span className="font-bold text-slate-800">{formatCurrencyINR(currentMonthlyExpense)}</span>
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">FV of Existing Savings:</span>
                          <span className="font-bold text-emerald-600">+{formatCurrencyINR(retirementData.futureValueOfExistingSavings)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">Corporate Accumulations:</span>
                          <span className="font-bold text-slate-700">+{formatCurrencyINR(retirementData.lumpSumsAtRetirement)}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-50 pb-1.5">
                          <span className="text-slate-500">Accumulation Gap (Deficit):</span>
                          <span className="font-bold text-rose-600">{formatCurrencyINR(retirementData.netCorpusGap)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Strategic Decumulation Buckets */}
                  <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-left space-y-4">
                    <div>
                      <h4 className="text-[14.5px] font-bold text-slate-900 flex items-center gap-1.5">
                        <Layers className="w-5 h-5 text-indigo-500" />
                        Decumulation Bucketing Strategy
                      </h4>
                      <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                        Rather than placing your entire <strong>{formatCurrencyINR(retirementData.totalRequiredCorpusAtRetirement)}</strong> corpus in low-yield assets, we structure your wealth into three compounding buckets to maintain payouts forever:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* Bucket 1 */}
                      <div className="border border-slate-100 bg-slate-50/50 rounded-xl p-3.5 space-y-2 flex flex-col justify-between text-xs">
                        <div>
                          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-slate-400">
                            <span>BUCKET 1</span>
                            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">0-3 Yrs</span>
                          </div>
                          <h5 className="font-bold text-slate-900 mt-1">Arbitrage & Liquid</h5>
                          <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                            Protects immediate payouts. Completely safe, zero-volatility liquid holdings.
                          </p>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 block font-semibold uppercase">Size</span>
                          <span className="font-mono font-bold text-slate-800">{formatCurrencyINR(retirementData.bucket1Arbitrage)}</span>
                        </div>
                      </div>

                      {/* Bucket 2 */}
                      <div className="border border-indigo-100 bg-indigo-50/20 rounded-xl p-3.5 space-y-2 flex flex-col justify-between text-xs">
                        <div>
                          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-indigo-400">
                            <span>BUCKET 2</span>
                            <span className="bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded">3-15 Yrs</span>
                          </div>
                          <h5 className="font-bold text-slate-900 mt-1">Systematic Income</h5>
                          <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                            Conservative hybrid assets feeding monthly systematic withdrawal plans.
                          </p>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 block font-semibold uppercase">Size</span>
                          <span className="font-mono font-bold text-indigo-600">{formatCurrencyINR(retirementData.bucket2Hybrid)}</span>
                        </div>
                      </div>

                      {/* Bucket 3 */}
                      <div className="border border-amber-100 bg-amber-50/20 rounded-xl p-3.5 space-y-2 flex flex-col justify-between text-xs">
                        <div>
                          <div className="flex justify-between items-center text-[9px] font-bold font-mono text-amber-400">
                            <span>BUCKET 3</span>
                            <span className="bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded">15+ Yrs</span>
                          </div>
                          <h5 className="font-bold text-slate-900 mt-1">Generational Growth</h5>
                          <p className="text-[10.5px] text-slate-500 leading-normal mt-0.5">
                            Active growth equities left untouched to compound over 15+ years.
                          </p>
                        </div>
                        <div className="pt-1.5 border-t border-slate-100">
                          <span className="text-[9px] text-slate-400 block font-semibold uppercase">Size</span>
                          <span className="font-mono font-bold text-amber-600">{formatCurrencyINR(retirementData.bucket3Equity)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900 text-slate-200 rounded-xl p-4.5 border border-slate-800 space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <h5 className="font-bold text-slate-100">The Power of the Self-Restoring Loop</h5>
                      </div>
                      <p className="text-[11px] leading-relaxed text-slate-300">
                        At the end of Year 15, Buckets 1 & 2 are spent, but Bucket 3 (Equity) has compounded at <strong>12% CAGR</strong>, growing from <span className="text-amber-400 font-semibold">{formatCurrencyINR(retirementData.bucket3Equity)}</span> to an astonishing <span className="text-emerald-400 font-bold">{formatCurrencyINR(retirementData.bucket3FutureValue15Years)}</span>! Your capital is fully restored to start the cycle again.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Right Column (5 Cols) - LEAD CAPTURE ENGINE */}
                <div className="lg:col-span-5 space-y-6">
                  
                  {/* Lead Generation Action Hub */}
                  <div className="bg-white border-2 border-blue-500/20 rounded-2xl shadow-md overflow-hidden text-left relative">
                    <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />
                    
                    <div className="p-6 space-y-5">
                      <div className="space-y-1">
                        <span className="text-[9px] font-bold text-blue-600 font-mono tracking-wider uppercase block">Take Action Today</span>
                        <h3 className="text-[17px] font-bold font-display text-slate-900">Activate Your Retirement Roadmap</h3>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          Your custom blueprint is ready. Choose an option below to secure your roadmap and begin compounding with complete confidence.
                        </p>
                      </div>

                      {/* Lead Tab Headers */}
                      <div className="flex bg-slate-50 p-1 rounded-xl border border-slate-200 gap-1">
                        <button
                          onClick={() => {
                            setActiveLeadOption('consult');
                            setLeadFormSuccess(false);
                            setLeadFormError('');
                          }}
                          className={`flex-1 py-1.5 text-center text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                            activeLeadOption === 'consult' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📅 1:1 VIP Call
                        </button>
                        <button
                          onClick={() => {
                            setActiveLeadOption('pdf');
                            setPdfSuccess(false);
                          }}
                          className={`flex-1 py-1.5 text-center text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                            activeLeadOption === 'pdf' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          📨 PDF Blueprint
                        </button>
                        <button
                          onClick={() => {
                            setActiveLeadOption('whatsapp');
                            setCallbackRequested(false);
                          }}
                          className={`flex-1 py-1.5 text-center text-[10.5px] font-bold rounded-lg transition-all cursor-pointer ${
                            activeLeadOption === 'whatsapp' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          💬 Fast-Track
                        </button>
                      </div>

                      {/* LEAD FORM 1: BOOK VIP CALL */}
                      {activeLeadOption === 'consult' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {!leadFormSuccess ? (
                            <div className="space-y-3">
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                                🤝 Book a complimentary 1-on-1 private advisory call with our senior portfolio architects to structuralize your decumulation buckets tax-efficiently.
                              </p>

                              {leadFormError && (
                                <p className="text-[10.5px] text-red-600 font-semibold bg-red-50 p-2 rounded border border-red-200">
                                  ⚠️ {leadFormError}
                                </p>
                              )}

                              <div className="space-y-2.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Full Name</label>
                                  <input
                                    type="text"
                                    value={leadName}
                                    onChange={(e) => setLeadName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div>
                                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mobile Number</label>
                                  <input
                                    type="tel"
                                    value={leadPhone}
                                    onChange={(e) => setLeadPhone(e.target.value)}
                                    placeholder="+91 XXXXX XXXXX"
                                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preferred Date</label>
                                    <input
                                      type="date"
                                      value={leadDate}
                                      onChange={(e) => setLeadDate(e.target.value)}
                                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Time Slot</label>
                                    <select
                                      value={leadTimeSlot}
                                      onChange={(e) => setLeadTimeSlot(e.target.value)}
                                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none"
                                    >
                                      <option value="">Select slot</option>
                                      <option value="10 AM - 12 PM">Morning (10AM - 12PM)</option>
                                      <option value="12 PM - 3 PM">Mid-day (12PM - 3PM)</option>
                                      <option value="3 PM - 6 PM">Afternoon (3PM - 6PM)</option>
                                      <option value="6 PM - 8 PM">Evening (6PM - 8PM)</option>
                                    </select>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={() => {
                                  if (!leadName || !leadPhone || !leadDate || !leadTimeSlot) {
                                    setLeadFormError('Please fill in all details to confirm your advisory session.');
                                    return;
                                  }
                                  setLeadFormSuccess(true);
                                  setLeadFormError('');
                                }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm mt-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                Secure Free Consultation Call
                              </button>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl text-center space-y-3 animate-fade-in">
                              <span className="text-2xl block">🎉</span>
                              <h4 className="font-bold text-xs text-emerald-900">VIP Booking Confirmed!</h4>
                              <p className="text-[11px] text-emerald-800 leading-relaxed">
                                Thank you, <strong>{leadName}</strong>. Your roadmap consultation is secured for <strong>{leadDate}</strong> during <strong>{leadTimeSlot}</strong>.
                              </p>
                              <div className="text-[10px] text-emerald-700 font-mono bg-white p-2 rounded border border-emerald-100">
                                Call Number: {leadPhone}
                              </div>
                              <p className="text-[10px] text-emerald-600 leading-normal">
                                A meeting confirmation has been logged. We look forward to working with you!
                              </p>
                              <button onClick={() => { setLeadFormSuccess(false); setLeadName(''); setLeadPhone(''); }} className="text-[10px] font-bold text-emerald-800 underline cursor-pointer">
                                Book another call
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LEAD FORM 2: EMAIL PDF ROADMAP */}
                      {activeLeadOption === 'pdf' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {!pdfSuccess ? (
                            <div className="space-y-3">
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
                                📨 Enter your email address to receive your 12-page comprehensive Financial Freedom Roadmap PDF containing structured allocations, fund analysis, and decumulation guides directly.
                              </p>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Email Address</label>
                                <input
                                  type="email"
                                  value={pdfEmail}
                                  onChange={(e) => setPdfEmail(e.target.value)}
                                  placeholder="yourname@example.com"
                                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  if (!pdfEmail || !pdfEmail.includes('@')) {
                                    alert('Please enter a valid email address.');
                                    return;
                                  }
                                  setPdfSuccess(true);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <FileText className="w-4 h-4" />
                                Send PDF Blueprint Report
                              </button>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl text-center space-y-2 animate-fade-in">
                              <span className="text-2xl block">📨</span>
                              <h4 className="font-bold text-xs text-emerald-900">Blueprint Sent Successfully!</h4>
                              <p className="text-[11px] text-emerald-800 leading-normal">
                                We've generated and emailed your customized 12-page roadmap to:
                              </p>
                              <div className="font-mono text-xs text-slate-700 bg-white p-2 rounded border border-emerald-100 font-bold">
                                {pdfEmail}
                              </div>
                              <p className="text-[10px] text-emerald-600 leading-normal">
                                Please check your email inbox (and spam/promotions folders) in 2 minutes.
                              </p>
                              <button onClick={() => { setPdfSuccess(false); setPdfEmail(''); }} className="text-[10px] font-bold text-emerald-800 underline cursor-pointer">
                                Send to another email
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {/* LEAD FORM 3: FAST CALLBACK & WHATSAPP CHAT */}
                      {activeLeadOption === 'whatsapp' && (
                        <div className="space-y-3.5 animate-fade-in">
                          {!callbackRequested ? (
                            <div className="space-y-3">
                              <p className="text-[11px] text-slate-600 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                                ⚡ Need answers right now? Enter your mobile number below and a senior mutual fund specialist will call you back in <strong>15 minutes</strong>.
                              </p>

                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Your Mobile Number</label>
                                <input
                                  type="tel"
                                  value={callbackPhone}
                                  onChange={(e) => setCallbackPhone(e.target.value)}
                                  placeholder="+91 XXXXX XXXXX"
                                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                              </div>

                              <button
                                onClick={() => {
                                  if (!callbackPhone) {
                                    alert('Please enter a phone number.');
                                    return;
                                  }
                                  setCallbackRequested(true);
                                }}
                                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <Phone className="w-4 h-4" />
                                Call Me in 15 Minutes
                              </button>

                              <div className="border-t border-slate-150 pt-3 text-center space-y-2">
                                <span className="text-[11px] text-slate-400 block">Or join our live advisors instantly:</span>
                                <a
                                  href="https://wa.me/919999999999?text=Hello%2C%20I%20just%20used%20your%20Financial%20Freedom%20Calculator%20and%20would%20like%20to%20discuss%20my%20retirement%20SIP%2520blueprint."
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chat with us on WhatsApp"
                                  className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-2 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm inline-block text-center cursor-pointer"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  Chat on WhatsApp Now
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="bg-emerald-50 border border-emerald-100 p-5 rounded-xl text-center space-y-2.5 animate-fade-in">
                              <span className="text-2xl block">📞</span>
                              <h4 className="font-bold text-xs text-emerald-900">Advisory Callback Queued!</h4>
                              <p className="text-[11px] text-emerald-800 leading-normal">
                                We have queued your instant callback request for:
                              </p>
                              <div className="font-mono text-xs text-slate-700 bg-white p-2 rounded border border-emerald-100 font-bold">
                                {callbackPhone}
                              </div>
                              <p className="text-[10px] text-emerald-600 leading-normal">
                                A senior advisor will call you within <strong>15 minutes</strong> to answer all your decumulation & SIP compounding questions.
                              </p>
                              <button onClick={() => { setCallbackRequested(false); setCallbackPhone(''); }} className="text-[10px] font-bold text-emerald-800 underline cursor-pointer">
                                Use different number
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Security Compliance Box */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-left space-y-1.5 text-[11px] text-slate-500">
                    <span className="font-bold text-slate-700 block flex items-center gap-1">
                      <ShieldPlus className="w-3.5 h-3.5 text-emerald-600" />
                      Regulated, Secure Wealth Advisory
                    </span>
                    <p className="leading-relaxed">
                      We operate in strict accordance with mutual fund regulatory guidelines. Recommendations are customized to optimize capital efficiency and minimize tax liabilities.
                    </p>
                  </div>

                </div>

              </div>
            )}

          </div>
        )}

        <FundFinderPromoBanner onActionClick={() => setCurrentPage('find-fund-type')} boxIndex={3} />

        {generatingPdf && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm text-center space-y-4 border border-slate-100 mx-4">
              <div className="relative flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin" />
                <FileText className="w-5 h-5 text-indigo-500 absolute" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 font-display">Assembling Your PDF Blueprint</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We are calculating your decumulation buckets, computing your wealth score, and generating your high-precision custom report. Download will start in a moment.
                </p>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
