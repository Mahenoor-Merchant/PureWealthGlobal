/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NavPage {
  id: 'home' | 'about' | 'services' | 'calculators' | 'knowledge' | 'connect' | 'privacy' | 'find-fund' | 'find-fund-type' | 'overlap-finder' | 'portfolio-audit' | 'database-portal' | 'retirement-calculator';
  label: string;
}

export interface InvestmentAsset {
  id: string;
  name: string;
  category: 'Mutual Fund' | 'ETF' | 'REIT' | 'Stock';
  region: 'India' | 'Global';
  annualReturn: number; // 5-year average annual return as percentage
  riskLevel: 'Conservative' | 'Moderate' | 'Aggressive';
  symbol: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  residence: 'India' | 'NRI';
  location: string;
  content: string;
  rating: number;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'NRI Consulting' | 'Mutual Funds' | 'General';
}

export interface SharedSurveyData {
  capitalType: 'SIP' | 'Lumpsum';
  capitalAmount: number;
  inflowStability: 'Stable' | 'Variable' | 'Windfall';
  timeHorizon: '1-3' | '3-5' | '5+';
  goal: 'Wealth' | 'Retirement' | 'Education' | 'TaxSaving' | 'RegularIncome';
  withdrawalNeeds: 'No' | 'Emergency' | 'Planned';
  riskCapacity: 'Conservative' | 'Moderate' | 'Aggressive';
  marketShock: 'Panic' | 'DoNothing' | 'BuyMore';
  burdenLevel: 'Low' | 'Moderate' | 'High';
  objective: 'Growth' | 'InflationHedge' | 'Stability' | 'Preservation';
  dividendMode: 'Reinvest' | 'SWP';
  shariahOnly: boolean;
}

export interface CalculatorState {
  sipAmount: number;
  years: number;
  expectedReturn: number;
  sipFrequency: 'Monthly' | 'Quarterly';
  lumpSumAmount: number;
}
