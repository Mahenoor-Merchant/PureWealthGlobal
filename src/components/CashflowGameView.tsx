/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  TrendingUp, 
  Sparkles, 
  RotateCcw, 
  Briefcase, 
  GraduationCap, 
  UserCheck, 
  ArrowRight,
  Shield,
  HelpCircle,
  Coins,
  ChevronRight,
  TrendingDown,
  Info,
  DollarSign,
  Lock,
  ExternalLink,
  Award,
  Zap,
  BookOpen,
  PieChart
} from 'lucide-react';
import { NavPage } from '../types';

interface CashflowGameViewProps {
  setCurrentPage?: (page: NavPage['id']) => void;
}

// Event interface based on Freedom Run spec
interface GameEvent {
  id: string;
  category: 'fixed' | 'lifestyle' | 'risky' | 'scam' | 'windfall' | 'sudden';
  title: string;
  description: string;
  amount: number; // Scaled off current monthly income
  isMandatory: boolean;
  promisedYield?: string;
  flawText?: string; // Visible flaw or red flag
  // Outcome when taken/paid
  outcomeMessage: string;
  successGain?: number;
  failureLoss?: number;
}

// Course interface
interface CourseOption {
  id: string;
  title: string;
  description: string;
  costMultiple: number; // 3x monthly income
  salaryBoostPercent: number; // 12-15%
}

export default function CashflowGameView({ setCurrentPage }: CashflowGameViewProps) {
  // Screen States: 'setup' | 'playing' | 'report'
  const [gameState, setGameState] = useState<'setup' | 'playing' | 'report'>('setup');

  // Player Onboarding Form Inputs
  const [playerName, setPlayerName] = useState('');
  const [playerPhone, setPlayerPhone] = useState('');
  const [playerEmail, setPlayerEmail] = useState('');
  const [currentAge, setCurrentAge] = useState(25);
  const [retirementAge, setRetirementAge] = useState(55);
  const [lifeExpectancy, setLifeExpectancy] = useState(85);
  const [monthlyIncome, setMonthlyIncome] = useState(100000);
  const [monthlyExpense, setMonthlyExpense] = useState(45000);
  const [hasTermInsurance, setHasTermInsurance] = useState(false);
  const [hasHealthInsurance, setHasHealthInsurance] = useState(false);

  // Active Game State
  const [simAge, setSimAge] = useState(25);
  const [simRound, setSimRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(30);
  const [cashOnHand, setCashOnHand] = useState(150000); // Initial cash = 1.5x income
  const [investedCorpus, setInvestedCorpus] = useState(0);
  const [simIncome, setSimIncome] = useState(100000);
  const [simExpense, setSimExpense] = useState(45000);
  const [monthlySip, setMonthlySip] = useState(20000);

  // Advisor State
  const [hasAdvisorPrompted, setHasAdvisorPrompted] = useState(false);
  const [hasAdvisor, setHasAdvisor] = useState(false);
  const [showAdvisorModal, setShowAdvisorModal] = useState(false);
  const [totalAdvisorFees, setTotalAdvisorFees] = useState(0);

  // Milestone Toasts State (§4)
  const [reachedMilestones, setReachedMilestones] = useState<number[]>([]);
  const [activeToast, setActiveToast] = useState<{ threshold: number; text: string } | null>(null);

  // Life-Stage Chapter Schedule (§5)
  interface LifeChapter {
    round: number;
    title: string;
    narrative: string;
    costMult: number;
    permExpenseBumpPercent: number;
  }
  const [scheduledChapters, setScheduledChapters] = useState<Record<number, LifeChapter>>({});

  // Admin Portal State (§11)
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPasscode, setAdminPasscode] = useState('');
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [adminReports, setAdminReports] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [expandedReportId, setExpandedReportId] = useState<string | null>(null);

  // Course / Upskilling State
  const [coursesTaken, setCoursesTaken] = useState<number>(0);
  const [pendingCourseRaise, setPendingCourseRaise] = useState<{ targetRound: number; boostPercent: number } | null>(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  // SIP Modal State
  const [showSipModal, setShowSipModal] = useState(false);

  // Freedom Tracking
  const [freedomAchievedRound, setFreedomAchievedRound] = useState<number | null>(null);
  const [freedomAchievedAge, setFreedomAchievedAge] = useState<number | null>(null);

  // Event Stack for Current Round
  const [roundEvents, setRoundEvents] = useState<GameEvent[]>([]);
  const [activeEventIndex, setActiveEventIndex] = useState(0);
  const [ledgerLogs, setLedgerLogs] = useState<{ round: number; text: string; isGain: boolean; amount?: number }[]>([]);

  // Sudden Expense Mechanics (determined at game start)
  const [suddenExpenseRound, setSuddenExpenseRound] = useState<number>(10);
  const [suddenExpenseFired, setSuddenExpenseFired] = useState(false);

  // Game Statistics for Report
  const [scamsAttempted, setScamsAttempted] = useState(0);
  const [scamsBlockedByAdvisor, setScamsBlockedByAdvisor] = useState(0);
  const [riskyWins, setRiskyWins] = useState(0);
  const [riskyLosses, setRiskyLosses] = useState(0);
  const [totalSipInvested, setTotalSipInvested] = useState(0);
  const [sipFundedRoundsCount, setSipFundedRoundsCount] = useState(0);

  // Post-Retirement Sustainability Simulation Results
  const [depletionAge, setDepletionAge] = useState<number | null>(null);

  // Lead Submission
  const [leadSubmitted, setLeadSubmitted] = useState(false);

  // Courses Pool
  const courseOptions: CourseOption[] = [
    {
      id: 'course_1',
      title: 'Executive Strategic Leadership Certification',
      description: 'Advanced 1-year executive program. Boosts career standing and opens senior management raises.',
      costMultiple: 3,
      salaryBoostPercent: 14
    },
    {
      id: 'course_2',
      title: 'FinTech & AI Operations Mastery',
      description: 'High-demand technological specialization. Unlocks immediate 13% domain promotion after 2 years.',
      costMultiple: 3,
      salaryBoostPercent: 13
    }
  ];

  // Initialize Game Simulation
  const handleStartGame = (e: React.FormEvent) => {
    e.preventDefault();
    if (retirementAge <= currentAge) {
      alert('Retirement age must be greater than current age!');
      return;
    }
    const rounds = Math.min(45, retirementAge - currentAge);
    setTotalRounds(rounds);
    setSimAge(currentAge);
    setSimRound(1);
    
    const initialCash = Math.round(monthlyIncome * 1.5);
    setCashOnHand(initialCash);
    setInvestedCorpus(0);
    setSimIncome(monthlyIncome);
    setSimExpense(monthlyExpense);

    // Initial SIP default: 40% of disposable cashflow
    const disposable = Math.max(5000, monthlyIncome - monthlyExpense);
    setMonthlySip(Math.round(disposable * 0.5));

    // Reset Tracking
    setFreedomAchievedRound(null);
    setFreedomAchievedAge(null);
    setHasAdvisorPrompted(false);
    setHasAdvisor(false);
    setTotalAdvisorFees(0);
    setCoursesTaken(0);
    setPendingCourseRaise(null);
    setLedgerLogs([]);
    setScamsAttempted(0);
    setScamsBlockedByAdvisor(0);
    setRiskyWins(0);
    setRiskyLosses(0);
    setTotalSipInvested(0);
    setSipFundedRoundsCount(0);
    setDepletionAge(null);
    setLeadSubmitted(false);

    // Pick Sudden Expense Round (Random round between round 2 and totalRounds - 1)
    const triggerRound = Math.floor(Math.random() * Math.max(1, rounds - 2)) + 2;
    setSuddenExpenseRound(triggerRound);
    setSuddenExpenseFired(false);

    // Schedule Life-Stage Narrative Chapters (§5)
    const chapters: Record<number, LifeChapter> = {};
    if (rounds >= 4) {
      const marriageR = Math.max(2, Math.round(rounds * 0.10));
      chapters[marriageR] = {
        round: marriageR,
        title: '💍 CHAPTER: MARRIAGE & SHARED LIFE',
        narrative: 'You step into marriage—a grand celebration with family, lights, and promises. Beyond wedding expenses, two lives merge under one roof, establishing a new higher baseline for monthly household living.',
        costMult: 2.5,
        permExpenseBumpPercent: 15
      };
    }
    if (rounds >= 6) {
      const marriageR = Math.max(2, Math.round(rounds * 0.10));
      const childR = Math.max(marriageR + 1, Math.round(rounds * 0.22));
      chapters[childR] = {
        round: childR,
        title: '👶 CHAPTER: FIRST CHILD BORN',
        narrative: 'A late-night drive to the hospital, a quiet nursery, and the sudden realization that another life depends on you. Pediatrics, clothes, and daycare permanently shift your monthly household budget.',
        costMult: 2.0,
        permExpenseBumpPercent: 15
      };
      if (childR + 6 < rounds) {
        const schoolR = childR + 6;
        chapters[schoolR] = {
          round: schoolR,
          title: '🎒 CHAPTER: FIRST DAY OF SCHOOL',
          narrative: 'Uniforms, books, tuition fees, and bus passes. School admissions begin a 12-year cycle of structured educational expenses in your monthly budget.',
          costMult: 1.5,
          permExpenseBumpPercent: 10
        };
      }
      if (childR + 16 < rounds) {
        const eduR = childR + 16;
        chapters[eduR] = {
          round: eduR,
          title: '🎓 CHAPTER: HIGHER EDUCATION & COLLEGE',
          narrative: 'College entrance exams, tuition fees, and hostel deposits. Supporting your child\'s higher degree requires a significant lump-sum outlay.',
          costMult: 4.0,
          permExpenseBumpPercent: 0
        };
      }
      if (childR + 27 < rounds) {
        const wedR = childR + 27;
        chapters[wedR] = {
          round: wedR,
          title: '🕊️ CHAPTER: CHILD\'S WEDDING',
          narrative: 'An emotional milestone decades in the making. Hosting your child\'s wedding brings generations together—a major one-time milestone expense.',
          costMult: 3.5,
          permExpenseBumpPercent: 0
        };
      }
    }
    setScheduledChapters(chapters);
    setReachedMilestones([]);
    setActiveToast(null);

    // Generate events for Round 1
    generateEventsForRound(1, currentAge, monthlyIncome, hasHealthInsurance, triggerRound, false, chapters);

    setGameState('playing');
  };

  // Generate Events for a Round
  const generateEventsForRound = (
    round: number, 
    age: number, 
    income: number, 
    hasHealth: boolean, 
    suddenRound: number,
    suddenFired: boolean,
    chaptersMap?: Record<number, LifeChapter>
  ) => {
    const events: GameEvent[] = [];
    const activeChapters = chaptersMap || scheduledChapters;

    // 0. Check Life-Stage Chapter Card (§5)
    if (activeChapters[round]) {
      const ch = activeChapters[round];
      const chCost = Math.round(income * ch.costMult);
      events.push({
        id: `chapter_${round}`,
        category: 'fixed',
        title: ch.title,
        description: ch.narrative,
        amount: chCost,
        isMandatory: true,
        outcomeMessage: `LIVED CHAPTER: Spent ₹${chCost.toLocaleString('en-IN')}${ch.permExpenseBumpPercent > 0 ? ` and increased baseline monthly living expense by +${ch.permExpenseBumpPercent}%` : ''}.`
      });
    }

    // 1. Mandatory Fixed Cost (Guaranteed at least 1)
    const fixedPool = [
      { title: 'Traffic Police E-Challan & Speed Fine', desc: 'CCTV speed camera penalty on state highway.', mult: 0.01 },
      { title: 'Home Utility & Electricity Tariff Spike', desc: 'Seasonal peak air conditioning power charges.', mult: 0.015 },
      { title: 'RWA Society Maintenance Annual Levy', desc: 'Building elevator & security infrastructure upgrade fee.', mult: 0.025 },
      { title: 'Annual Broadband & Phone Plan Renewals', desc: 'Annual family high-speed fiber internet subscription.', mult: 0.02 },
      { title: 'Family Function & Festive Gift Obligation', desc: 'Attending milestone celebration for close relative.', mult: 0.04 },
      { title: 'Home Appliance Air Conditioner Repair', desc: 'Major PCB compressor breakdown in peak summer.', mult: 0.03 },
      { title: 'Vehicle Scheduled Comprehensive Service', desc: 'Brake pads & engine oil replacement at authorized service center.', mult: 0.05 }
    ];
    const pickedFixed = fixedPool[(round + Math.floor(Math.random() * 3)) % fixedPool.length];
    const fixedAmt = Math.round(income * pickedFixed.mult);
    events.push({
      id: `fixed_${round}`,
      category: 'fixed',
      title: pickedFixed.title,
      description: pickedFixed.desc,
      amount: fixedAmt,
      isMandatory: true,
      outcomeMessage: `Paid mandatory cost of ₹${fixedAmt.toLocaleString('en-IN')}.`
    });

    // 2. Check Sudden Expense Trigger for this round
    let hitSuddenThisRound = false;
    if (!suddenFired && round === suddenRound) {
      if (!hasHealth) {
        // Guaranteed hit with no health cover
        hitSuddenThisRound = true;
        const suddenAmt = Math.round(income * (3.5 + Math.random() * 1.5)); // 3.5x to 5x
        events.push({
          id: `sudden_${round}`,
          category: 'sudden',
          title: '🏥 SUDDEN MEDICAL HOSPITALIZATION EMERGENCY',
          description: `Unforeseen critical medical procedure for family. With NO health insurance cover, the entire bill lands directly on your personal cashflow!`,
          amount: suddenAmt,
          isMandatory: true,
          outcomeMessage: `HEALTH INSURANCE FAILURE: Out-of-pocket medical shock of ₹${suddenAmt.toLocaleString('en-IN')} drained your cash reserves!`
        });
      } else {
        // Has health insurance: 40% chance overall
        const rollSudden = Math.random() < 0.40;
        if (rollSudden) {
          hitSuddenThisRound = true;
          const isMedical = Math.random() < 0.60;
          if (isMedical) {
            const outOfPocket = Math.round(income * (0.5 + Math.random() * 0.5)); // 0.5x to 1.0x
            events.push({
              id: `sudden_${round}`,
              category: 'sudden',
              title: '🏥 Emergency Medical Hospitalization (Insured)',
              description: `Family hospital stay. Your Health Insurance policy absorbed 85% of charges! Remaining copay bill lands on you.`,
              amount: outOfPocket,
              isMandatory: true,
              outcomeMessage: `INSURANCE MOAT PROTECTED YOU: Health policy covered major charges! Paid only ₹${outOfPocket.toLocaleString('en-IN')} out-of-pocket.`
            });
          } else {
            // Income / Business Shock
            const shockAmt = Math.round(income * (3 + Math.random() * 1.5));
            events.push({
              id: `sudden_${round}`,
              category: 'sudden',
              title: '💼 Sudden Employer Downsizing / Business Loss Shock',
              description: `Corporate restructuring or project contract cancellation creating an immediate income disruption.`,
              amount: shockAmt,
              isMandatory: true,
              outcomeMessage: `INCOME SHOCK: Absorbed temporary income disruption of ₹${shockAmt.toLocaleString('en-IN')} from emergency cash.`
            });
          }
        }
      }
      if (hitSuddenThisRound) {
        setSuddenExpenseFired(true);
      }
    }

    // 3. Optional Lifestyle Spends
    const lifestylePool = [
      { title: 'Weekend Luxury Hill Resort Getaway', desc: '3-day family wellness trip at a premium resort.', mult: 0.25 },
      { title: 'Flagship Smartphone Upgrade', desc: 'Latest flagship device with titanium body and AI camera.', mult: 0.80 },
      { title: 'Friend Destination Wedding Trip', desc: 'Flight tickets, traditional attire, and hotel stay for a close friend wedding.', mult: 0.60 },
      { title: 'Living Room Smart TV & Furniture Refresh', desc: 'Upgrading living room entertainment system.', mult: 1.10 },
      { title: 'Fine Dining & Gourmet Lifestyle Creep', desc: 'Frequent weekend dining and cafe visits throughout the year.', mult: 0.20 }
    ];
    const pickedLifestyle = lifestylePool[round % lifestylePool.length];
    const lifestyleAmt = Math.round(income * pickedLifestyle.mult);
    events.push({
      id: `life_${round}`,
      category: 'lifestyle',
      title: pickedLifestyle.title,
      description: pickedLifestyle.desc,
      amount: lifestyleAmt,
      isMandatory: false,
      outcomeMessage: `Spent ₹${lifestyleAmt.toLocaleString('en-IN')} on lifestyle upgrade.`
    });

    // 4. Risky / Ambiguous Investment Opportunities
    const riskyPool = [
      {
        title: '🔥 Hot Small-Cap Stock Tip from Colleague Broker',
        desc: 'Colleague insists a micro-cap battery stock will double before next quarter. Looks like a banger deal!',
        mult: 0.80,
        flaw: 'No verifiable audited track record or SEBI filing. Highly illiquid pump-and-dump candidate.'
      },
      {
        title: '🏘️ Off-Plan Plot Deal (Pre-RERA Launch Pricing)',
        desc: 'Builder offering 40% discount on pre-launch residential land plot before layout approvals.',
        mult: 2.50,
        flaw: 'Zero RERA registration. High risk of land litigation and developer insolvency.'
      },
      {
        title: '🚀 D2C Startup Friend Seed Round (No Term Sheet)',
        desc: 'Friend launching an eco-friendly D2C footwear brand asking for seed capital.',
        mult: 1.20,
        flaw: 'No audited financial statements, negative cashflows, and no clear secondary exit route.'
      },
      {
        title: '📈 Telegram Group "10x by Diwali" Crypto Token',
        desc: 'Private Telegram group shilling an AI-governed DeFi token with promised instant gains.',
        mult: 0.50,
        flaw: 'No underlying real-world cashflow generation. Late-cycle speculative hype structure.'
      },
      {
        title: '🌟 "Sure Shot" Thematic NFO Relatives Hot Pitch',
        desc: 'Relative claiming a newly launched sectoral thematic fund is guaranteed to outperform.',
        mult: 0.90,
        flaw: 'Zero historical track record on day one, concentrated sector exposure, high expense ratio.'
      }
    ];
    const pickedRisky = riskyPool[round % riskyPool.length];
    const riskyAmt = Math.round(income * pickedRisky.mult);
    events.push({
      id: `risky_${round}`,
      category: 'risky',
      title: pickedRisky.title,
      description: pickedRisky.desc,
      amount: riskyAmt,
      isMandatory: false,
      flawText: pickedRisky.flaw,
      outcomeMessage: `Evaluated risky investment opportunity.`
    });

    // 5. Unregulated Scam Scheme (Every 2-3 rounds)
    if (round % 2 === 0 || round % 3 === 0) {
      const scamPool = [
        {
          title: '🚨 "Guaranteed 3% Monthly Yield" Private Club',
          desc: 'Exclusive private club promising 36% annual guaranteed return backed by algorithmic forex bots. Looks 100% foolproof!',
          mult: 1.80,
          yield: '36% p.a. Fixed',
          flaw: 'Unregulated Ponzi scheme structure. Guaranteed high returns without SEBI registration are math impossibilities.'
        },
        {
          title: '⚡ "Double Your Money in 6 Months" Agro Venture',
          desc: 'High-yield timber plantation venture guaranteeing 100% principal doubling in 180 days.',
          mult: 2.00,
          yield: '100% Return in 6 Mos',
          flaw: 'Classic collective investment scheme fraud. Promoter disappears as soon as new capital inflow slows.'
        },
        {
          title: '📞 Insider Broker Call "Guaranteed Upper Circuit Stocks"',
          desc: 'Cold-caller claiming direct insider tips on upcoming corporate buybacks for a fixed upfront registration fee.',
          mult: 1.00,
          yield: '50% Monthly Gain',
          flaw: 'Illegal front-running phone operator scam targeting retail investors.'
        }
      ];
      const pickedScam = scamPool[round % scamPool.length];
      const scamAmt = Math.round(income * pickedScam.mult);
      events.push({
        id: `scam_${round}`,
        category: 'scam',
        title: pickedScam.title,
        description: pickedScam.desc,
        amount: scamAmt,
        isMandatory: false,
        promisedYield: pickedScam.yield,
        flawText: pickedScam.flaw,
        outcomeMessage: `Evaluated high-yield scheme.`
      });
    }

    // 6. Windfall (Bonus or Side Gig)
    if (round % 3 === 1) {
      const windfallPool = [
        { title: '🎉 Annual Employer Performance Bonus', desc: 'Received year-end corporate performance payout!', mult: 0.70 },
        { title: '💻 Independent Freelance Consulting Gig', desc: 'Completed advisory project for an international client.', mult: 0.40 }
      ];
      const pickedWindfall = windfallPool[round % windfallPool.length];
      const windfallAmt = Math.round(income * pickedWindfall.mult);
      events.push({
        id: `windfall_${round}`,
        category: 'windfall',
        title: pickedWindfall.title,
        description: pickedWindfall.desc,
        amount: windfallAmt,
        isMandatory: true,
        outcomeMessage: `Received windfall cash of +₹${windfallAmt.toLocaleString('en-IN')}!`
      });
    }

    setRoundEvents(events);
    setActiveEventIndex(0);
  };

  // Open Advisor Prompt Modal on First SIP Attempt
  const handleOpenSipModal = () => {
    if (!hasAdvisorPrompted) {
      setShowAdvisorModal(true);
    } else {
      setShowSipModal(true);
    }
  };

  // Resolve Financial Advisor Decision
  const handleAdvisorChoice = (appoint: boolean) => {
    setHasAdvisorPrompted(true);
    setHasAdvisor(appoint);
    setShowAdvisorModal(false);
    setShowSipModal(true);

    const logText = appoint 
      ? '🛡️ Appointed AMFI-Registered Financial Advisor (0.75% p.a. fee). Enabled 80/20 win ratio filter and scam shield.'
      : '👤 Chose DIY Self-Directed Investing. No advisor fee, but operating with 40/60 win ratio and full exposure to disguised scams.';

    setLedgerLogs((prev) => [{ round: simRound, text: logText, isGain: appoint }, ...prev]);
  };

  // Process Event Resolution (Accept vs Skip)
  const handleEventAction = (accept: boolean) => {
    const currentEvent = roundEvents[activeEventIndex];
    let isGain = false;
    let logMsg = '';
    let cashChange = 0;

    if (currentEvent.category === 'fixed' || currentEvent.category === 'sudden') {
      // Mandatory Expense
      cashChange = -currentEvent.amount;
      isGain = false;
      logMsg = currentEvent.outcomeMessage;
      setCashOnHand((prev) => prev - currentEvent.amount);
    } else if (currentEvent.category === 'windfall') {
      // Windfall Cash Gain
      cashChange = currentEvent.amount;
      isGain = true;
      logMsg = currentEvent.outcomeMessage;
      setCashOnHand((prev) => prev + currentEvent.amount);
    } else if (currentEvent.category === 'lifestyle') {
      if (accept) {
        cashChange = -currentEvent.amount;
        isGain = false;
        logMsg = `Spent ₹${currentEvent.amount.toLocaleString('en-IN')} on ${currentEvent.title}.`;
        setCashOnHand((prev) => prev - currentEvent.amount);
      } else {
        cashChange = 0;
        isGain = true;
        logMsg = `Skipped ${currentEvent.title}. Preserved ₹${currentEvent.amount.toLocaleString('en-IN')} cash for Mutual Fund compounding.`;
      }
    } else if (currentEvent.category === 'scam') {
      if (!accept) {
        cashChange = 0;
        isGain = true;
        logMsg = `Skipped ${currentEvent.title}. Kept capital safe from unregulated high-yield trap.`;
      } else {
        setScamsAttempted((prev) => prev + 1);
        if (hasAdvisor) {
          // ADVISOR AUTO-BLOCKS SCAMS!
          setScamsBlockedByAdvisor((prev) => prev + 1);
          cashChange = 0;
          isGain = true;
          logMsg = `🛡️ ADVISOR INTERVENED! Advisor flagged missing SEBI license & Ponzi structure. Saved your ₹${currentEvent.amount.toLocaleString('en-IN')}!`;
        } else {
          // DIY Investor falls for scam -> Total Collapse
          const recovery = Math.round(currentEvent.amount * 0.05); // 5% recovery
          const loss = currentEvent.amount - recovery;
          cashChange = -loss;
          isGain = false;
          logMsg = `🚨 SCAM COLLAPSED! ${currentEvent.title} froze withdrawals and promoter fled! Lost ₹${loss.toLocaleString('en-IN')}. Flaw: ${currentEvent.flawText}`;
          setCashOnHand((prev) => prev - loss);
        }
      }
    } else if (currentEvent.category === 'risky') {
      if (!accept) {
        if (hasAdvisor) {
          // Advisor 80/20 Roll
          const is80PercentRight = Math.random() < 0.80;
          if (is80PercentRight) {
            cashChange = 0;
            isGain = true;
            logMsg = `🛡️ ADVISOR GUIDANCE FOLLOWED: Skipped ${currentEvent.title}. Flaw verified: ${currentEvent.flawText}. Saved capital!`;
          } else {
            // 20% missed winner case
            cashChange = 0;
            isGain = true;
            logMsg = `🛡️ ADVISOR GUIDANCE: Recommended skipping ${currentEvent.title}. Project actually succeeded, but 1-in-5 cost of discipline is worth avoiding catastrophic losses.`;
          }
        } else {
          cashChange = 0;
          isGain = true;
          logMsg = `Skipped risky deal ${currentEvent.title}.`;
        }
      } else {
        // Player insists on investing
        if (cashOnHand < currentEvent.amount) {
          alert(`Insufficient liquid cash (₹${cashOnHand.toLocaleString('en-IN')}) to invest ₹${currentEvent.amount.toLocaleString('en-IN')}.`);
          return;
        }

        if (hasAdvisor) {
          // With Advisor: 80% Win / 20% Loss
          const isWin = Math.random() < 0.80;
          if (isWin) {
            setRiskyWins((prev) => prev + 1);
            const gain = Math.round(currentEvent.amount * 1.8);
            cashChange = gain - currentEvent.amount;
            isGain = true;
            logMsg = `✅ DEAL SUCCEEDED! Earned +₹${gain.toLocaleString('en-IN')} from ${currentEvent.title} under advisor due diligence!`;
            setCashOnHand((prev) => prev + (gain - currentEvent.amount));
          } else {
            setRiskyLosses((prev) => prev + 1);
            const loss = Math.round(currentEvent.amount * 0.70);
            cashChange = -loss;
            isGain = false;
            logMsg = `⚠️ INVESTMENT LOSS: ${currentEvent.title} underperformed. Lost ₹${loss.toLocaleString('en-IN')}. Flaw: ${currentEvent.flawText}`;
            setCashOnHand((prev) => prev - loss);
          }
        } else {
          // Without Advisor: 40% Win / 60% Loss
          const isWin = Math.random() < 0.40;
          if (isWin) {
            setRiskyWins((prev) => prev + 1);
            const multiplier = 1.4 + Math.random() * 1.2; // 1.4x - 2.6x
            const gain = Math.round(currentEvent.amount * multiplier);
            cashChange = gain - currentEvent.amount;
            isGain = true;
            logMsg = `🎲 LUCKY GAMBLE WIN! Earned +₹${gain.toLocaleString('en-IN')} on ${currentEvent.title} (closer to a coin flip than strategy).`;
            setCashOnHand((prev) => prev + (gain - currentEvent.amount));
          } else {
            setRiskyLosses((prev) => prev + 1);
            const recovery = Math.round(currentEvent.amount * (Math.random() * 0.25)); // 0-25% recovery
            const loss = currentEvent.amount - recovery;
            cashChange = -loss;
            isGain = false;
            logMsg = `💥 DEAL COLLAPSED! ${currentEvent.title} failed. Lost ₹${loss.toLocaleString('en-IN')}. Visible flaw missed: ${currentEvent.flawText}`;
            setCashOnHand((prev) => prev - loss);
          }
        }
      }
    }

    setLedgerLogs((prev) => [{ round: simRound, text: logMsg, isGain, amount: cashChange }, ...prev]);

    setActiveEventIndex((prev) => prev + 1);
  };

  // Enroll in Upskilling Course
  const handleEnrollCourse = (course: CourseOption) => {
    const cost = simIncome * course.costMultiple;
    if (cashOnHand < cost) {
      alert(`Insufficient cash on hand (₹${cashOnHand.toLocaleString('en-IN')}) to enroll in course costing ₹${cost.toLocaleString('en-IN')}.`);
      return;
    }
    if (coursesTaken >= 2) {
      alert('Maximum 2 upskilling courses permitted per simulation lifetime.');
      return;
    }

    setCashOnHand((prev) => prev - cost);
    setCoursesTaken((prev) => prev + 1);
    const targetRound = simRound + 2; // Applies 2 rounds later
    setPendingCourseRaise({ targetRound, boostPercent: course.salaryBoostPercent });
    setShowCourseModal(false);

    setLedgerLogs((prev) => [{
      round: simRound,
      text: `🎓 ENROLLED in ${course.title} (Cost: ₹${cost.toLocaleString('en-IN')}). Permanent +${course.salaryBoostPercent}% salary raise scheduled for Age ${simAge + 2}.`,
      isGain: true
    }, ...prev]);
  };

  // End of Round Loop Calculation
  const handleEndYear = () => {
    let currentCash = cashOnHand;
    let currentCorpus = investedCorpus;

    // 1. Fund Mutual Fund SIP
    const annualSip = monthlySip * 12;
    let actualSipFunded = annualSip;

    if (currentCash < annualSip) {
      // Check if cash would drop below -2x monthly income
      const maxNegativeLimit = -2 * simIncome;
      const maxAvailableToFund = currentCash - maxNegativeLimit;

      if (maxAvailableToFund > 0) {
        actualSipFunded = maxAvailableToFund;
        currentCash -= actualSipFunded;
        currentCorpus += actualSipFunded;
        setLedgerLogs((prev) => [{
          round: simRound,
          text: `⚠️ CASH SHORTFALL: Could only fund ₹${Math.round(actualSipFunded / 12).toLocaleString('en-IN')}/mo SIP this year due to cash constraints.`,
          isGain: false
        }, ...prev]);
      } else {
        actualSipFunded = 0;
        setLedgerLogs((prev) => [{
          round: simRound,
          text: `🚨 SIP HALTED: Zero cash available for Mutual Fund SIP this year!`,
          isGain: false
        }, ...prev]);
      }
    } else {
      currentCash -= annualSip;
      currentCorpus += annualSip;
      setSipFundedRoundsCount((prev) => prev + 1);
    }
    setTotalSipInvested((prev) => prev + actualSipFunded);

    // 2. Compound Corpus (Random 14% to 17% CAGR)
    const annualCagr = 0.14 + Math.random() * 0.03; // 14% - 17%
    currentCorpus = Math.round(currentCorpus * (1 + annualCagr));

    // 3. Deduct Financial Advisor Fee (0.75% per year if appointed)
    if (hasAdvisor) {
      const fee = Math.round(currentCorpus * 0.0075);
      currentCorpus -= fee;
      setTotalAdvisorFees((prev) => prev + fee);
    }

    // 4. Apply Pending Course Salary Boost if Due
    let newIncome = simIncome;
    let courseBoostText = '';
    if (pendingCourseRaise && simRound + 1 === pendingCourseRaise.targetRound) {
      const boostAmount = Math.round(newIncome * (pendingCourseRaise.boostPercent / 100));
      newIncome += boostAmount;
      courseBoostText = ` 🎓 Course completed! Salary boosted by +${pendingCourseRaise.boostPercent}%.`;
      setPendingCourseRaise(null);
    }

    // 5. Apply Organic Salary Growth (2.0% to 4.5% p.a.)
    const organicGrowth = 0.02 + Math.random() * 0.025;
    newIncome = Math.round(newIncome * (1 + organicGrowth));

    // Add remaining annual salary cash surplus to cash on hand (net disposable income)
    const annualLivingExpense = simExpense * 12;
    const annualSalaryNet = (newIncome * 12) - annualLivingExpense;
    if (annualSalaryNet > 0) {
      currentCash += Math.round(annualSalaryNet * 0.30); // 30% of net surplus builds cash buffer
    }

    // 6. Inflate Monthly Expense by 6%
    const newExpense = Math.round(simExpense * 1.06);

    // 7. Check Financial Freedom Threshold: Passive Monthly Return (Corpus * 8% / 12) >= Monthly Expense
    const passiveMonthlyReturn = Math.round((currentCorpus * 0.08) / 12);
    const isFree = passiveMonthlyReturn >= newExpense;

    if (isFree && freedomAchievedRound === null) {
      setFreedomAchievedRound(simRound);
      setFreedomAchievedAge(simAge);
      setLedgerLogs((prev) => [{
        round: simRound,
        text: `🎉 FINANCIAL FREEDOM ACHIEVED AT AGE ${simAge}! Passive investment yield (₹${passiveMonthlyReturn.toLocaleString('en-IN')}/mo) now fully covers monthly expenses (₹${newExpense.toLocaleString('en-IN')}/mo)!`,
        isGain: true
      }, ...prev]);
    }

    // Check Freedom Gauge Milestone Toasts (§4)
    const freedomRatioPct = Math.min(100, Math.round((passiveMonthlyReturn / Math.max(1, newExpense)) * 100));
    const milestoneLines: Record<number, string> = {
      25: "A quarter of your monthly lifestyle is now quietly funded by your investments alone.",
      50: "Half of your monthly life could now run on autopilot from your investments alone.",
      75: "Three quarters of your living expenses no longer require your labor. Freedom is in sight.",
      100: "100% FREEDOM ACHIEVED! Your passive investment yield completely covers your monthly living expenses!"
    };

    [25, 50, 75, 100].forEach((threshold) => {
      if (freedomRatioPct >= threshold && !reachedMilestones.includes(threshold)) {
        setReachedMilestones((prev) => [...prev, threshold]);
        setActiveToast({ threshold, text: milestoneLines[threshold] });
        setTimeout(() => {
          setActiveToast(null);
        }, 6000);
      }
    });

    // Update States
    setCashOnHand(currentCash);
    setInvestedCorpus(currentCorpus);
    setSimIncome(newIncome);
    setSimExpense(newExpense);

    const nextAge = simAge + 1;
    const nextRound = simRound + 1;

    if (nextRound > totalRounds) {
      // Game Complete! Run Post-Retirement Sustainability Check (§9)
      runPostRetirementSustainabilityCheck(currentCorpus, newExpense, nextAge);
      setGameState('report');
    } else {
      setSimAge(nextAge);
      setSimRound(nextRound);
      generateEventsForRound(nextRound, nextAge, newIncome, hasHealthInsurance, suddenExpenseRound, suddenExpenseFired);
    }
  };

  // §9 Post-Retirement Sustainability Year-by-Year Simulation
  const runPostRetirementSustainabilityCheck = (finalCorpus: number, finalMonthlyExpense: number, finalAge: number) => {
    const yearsInRetirement = Math.max(1, lifeExpectancy - retirementAge);
    let tempCorpus = finalCorpus;
    let tempMonthlyExpense = finalMonthlyExpense;
    let depletedAtAge: number | null = null;

    for (let y = 1; y <= yearsInRetirement; y++) {
      tempMonthlyExpense = Math.round(tempMonthlyExpense * 1.06); // 6% inflation in retirement
      const annualWithdrawal = tempMonthlyExpense * 12;
      tempCorpus -= annualWithdrawal;

      if (tempCorpus > 0) {
        tempCorpus = Math.round(tempCorpus * 1.08); // Conservative 8% CAGR in retirement phase
      } else if (depletedAtAge === null) {
        depletedAtAge = retirementAge + y;
      }
    }

    setDepletionAge(depletedAtAge);
    
    // Non-blocking auto save lead report to backend
    saveSimulationReportToDatabase(finalCorpus, finalMonthlyExpense, depletedAtAge);
  };

  // Admin Portal Actions (§1, §11)
  const handleUnlockAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPasscode.trim() === 'purewealth2026') {
      setIsAdminUnlocked(true);
      fetchAdminReports();
    } else {
      alert('Invalid admin passcode.');
    }
  };

  const fetchAdminReports = async () => {
    setAdminLoading(true);
    try {
      const res = await fetch('/api/leads');
      if (res.ok) {
        const data = await res.json();
        setAdminReports(Array.isArray(data) ? data.filter((d: any) => d.type === 'cashflow_simulation' || d.calculatorData?.freedomRatioPercent !== undefined) : []);
      }
    } catch (err) {
      console.warn('Admin fetch error:', err);
    } finally {
      setAdminLoading(false);
    }
  };

  const exportAdminCsv = () => {
    if (adminReports.length === 0) return;
    const headers = ['Date', 'Name', 'Phone', 'Email', 'CurrentAge', 'RetireAge', 'Outcome', 'FinalCorpus', 'MonthlyExpense', 'FreedomRatio', 'MindsetTag'];
    const rows = adminReports.map((r: any) => {
      const calc = r.calculatorData || {};
      return [
        r.date || '',
        `"${r.name || ''}"`,
        `"${r.phone || ''}"`,
        `"${r.email || ''}"`,
        calc.currentAge || '',
        calc.retirementAge || '',
        calc.isWinner ? 'FREE' : calc.depletionAge ? 'DEPLETED' : 'NOT FREE',
        calc.finalCorpus || 0,
        calc.finalMonthlyExpense || 0,
        `${calc.freedomRatioPercent || 0}%`,
        `"${calc.mindsetTag || ''}"`
      ].join(',');
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purewealth_freedom_run_leads_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Determine Investor Mindset Archetype (§10)
  const getInvestorMindsetTag = () => {
    const sipRatio = sipFundedRoundsCount / Math.max(1, totalRounds);
    if (hasAdvisor && sipRatio >= 0.75) {
      return {
        tag: "The Guided Compounder",
        desc: "Smart, disciplined, and leverage-oriented. By appointing professional advisory, you filtered out 100% of scams, maintained steady SIP compounding, and achieved sustainable freedom."
      };
    } else if (!hasAdvisor && scamsAttempted > 0) {
      return {
        tag: "The Thrill Seeker",
        desc: "Prone to high-yield allure and unverified pitch calls. Falling for speculative hype schemes leaked critical compounding capital away from regulated mutual funds."
      };
    } else if (!hasAdvisor && sipRatio >= 0.75) {
      return {
        tag: "The Disciplined Self-Pilot",
        desc: "Strong individual discipline and cost control. While you managed to navigate scams solo, lack of formal advisory required constant vigilance."
      };
    } else if (sipRatio < 0.40) {
      return {
        tag: "The Rat Race Runner",
        desc: "Trapped by short-term cashflow bottlenecks and lifestyle inflation. Insufficient systematic SIP allocations left your retirement vulnerable to inflation."
      };
    } else {
      return {
        tag: "The Cautious Saver",
        desc: "Conservative investor. While you avoided major trap losses, slow investment escalation delayed your financial freedom timeline."
      };
    }
  };

  // Save Completed Simulation Report to Database
  const saveSimulationReportToDatabase = async (corpus: number, expense: number, depletion: number | null) => {
    if (leadSubmitted) return;

    const passiveYield = Math.round((corpus * 0.08) / 12);
    const freedomRatioPercent = Math.round((passiveYield / expense) * 100);
    const mindset = getInvestorMindsetTag();

    const reportPayload = {
      type: 'cashflow_simulation',
      name: playerName || 'Anonymous Player',
      phone: playerPhone || 'N/A',
      email: playerEmail || 'N/A',
      date: new Date().toISOString().split('T')[0],
      timeSlot: 'Freedom Game Completed',
      calculatorData: {
        currentAge,
        retirementAge,
        lifeExpectancy,
        initialIncome: monthlyIncome,
        finalCorpus: corpus,
        finalMonthlyExpense: expense,
        passiveMonthlyYield: passiveYield,
        freedomRatioPercent,
        isWinner: freedomAchievedRound !== null && depletion === null,
        hasAdvisor,
        hasTermInsurance,
        hasHealthInsurance,
        totalSipInvested,
        totalAdvisorFees,
        scamsAttempted,
        scamsBlockedByAdvisor,
        riskyWins,
        riskyLosses,
        depletionAge: depletion,
        mindsetTag: mindset.tag,
        mindsetDesc: mindset.desc
      }
    };

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });
      if (res.ok) {
        setLeadSubmitted(true);
      }
    } catch (err) {
      console.warn('[Cashflow Simulation] Lead report save error:', err);
    }
  };

  // Passive Monthly Return Yield from Corpus (8% SWR Rule)
  const passiveMonthlyYield = Math.round((investedCorpus * 0.08) / 12);
  const freedomPercent = Math.min(100, Math.round((passiveMonthlyYield / Math.max(1, simExpense)) * 100));

  return (
    <div className="min-h-screen bg-[#10161B] text-[#E9E4D6] font-sans selection:bg-[#C9A227] selection:text-[#10161B] pb-16 text-left relative">
      
      {/* Floating Milestone Toast Banner (§4) */}
      {activeToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4 animate-bounce">
          <div className="bg-[#1A2229] border-2 border-[#C9A227] p-4 rounded-2xl shadow-2xl flex items-start justify-between gap-3 text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-[#C9A227] text-[#10161B] rounded-xl shrink-0">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="space-y-0.5 font-mono text-xs">
                <span className="text-[#C9A227] font-bold block uppercase tracking-wider">{activeToast.threshold}% Freedom Milestone Reached</span>
                <p className="text-[#E9E4D6] font-sans leading-snug">{activeToast.text}</p>
              </div>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-[#8B97A0] hover:text-white font-mono text-xs cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div className="bg-[#1A2229] border-b border-[#2E3A43] py-5 px-4 sm:px-6 lg:px-8 shadow-xl">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#C9A227]/10 text-[#C9A227] border border-[#C9A227]/30 font-mono text-[11px] font-bold uppercase rounded-md flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-[#C9A227]" />
                Pure Wealth Financial Freedom Engine
              </span>
              <span className="text-[11px] text-[#5B8AA6] bg-[#5B8AA6]/10 border border-[#5B8AA6]/30 px-2.5 py-0.5 rounded-md font-bold font-mono">
                The Freedom Run
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#E9E4D6] tracking-tight font-serif flex items-center gap-2">
              Cashflow Financial Freedom Simulator <Sparkles className="w-5 h-5 text-[#C9A227] animate-pulse" />
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setShowAdminModal(true);
                if (isAdminUnlocked) fetchAdminReports();
              }}
              className="px-3.5 py-2 bg-[#212B33] hover:bg-[#2E3A43] text-[#C9A227] border border-[#C9A227]/40 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5 text-[#C9A227]" />
              <span>Admin Leads</span>
            </button>

            {gameState !== 'setup' && (
              <button
                onClick={() => {
                  if (window.confirm('Reset simulation? Current game progress will be lost.')) {
                    setGameState('setup');
                  }
                }}
                className="px-4 py-2 bg-[#212B33] hover:bg-[#2E3A43] text-[#8B97A0] hover:text-[#E9E4D6] border border-[#2E3A43] rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 cursor-pointer shrink-0"
              >
                <RotateCcw className="w-4 h-4 text-[#C9A227]" />
                <span>Reset Game</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

        {/* SCREEN 1: SETUP PHASE */}
        {gameState === 'setup' && (
          <div className="max-w-4xl mx-auto bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 animate-fade-in">
            
            {/* Hero Section */}
            <div className="border-b border-[#2E3A43] pb-6 space-y-3">
              <h2 className="text-2xl sm:text-3xl font-black text-[#E9E4D6] font-serif">
                Live a working life in 15 minutes. Find out if you ever get free.
              </h2>
              <p className="text-xs sm:text-sm text-[#8B97A0] leading-relaxed">
                Every round in this simulation counts as 1 full working year. You will face real-life financial choices—mandatory bills, impulse luxuries, high-yield scam traps, upskilling courses, and market volatility. This game is not about ending with the highest total money—it is about generating enough passive investment income from mutual funds to replace your job and permanently escape the rat race.
              </p>
            </div>

            <form onSubmit={handleStartGame} className="space-y-6">
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="e.g. Vikram Verma"
                    className="w-full bg-[#212B33] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2.5 text-xs text-[#E9E4D6] placeholder-[#8B97A0]/50 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">WhatsApp / Phone (Optional)</label>
                  <input
                    type="tel"
                    value={playerPhone}
                    onChange={(e) => setPlayerPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full bg-[#212B33] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2.5 text-xs text-[#E9E4D6] placeholder-[#8B97A0]/50 outline-none transition-all font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={playerEmail}
                    onChange={(e) => setPlayerEmail(e.target.value)}
                    placeholder="vikram@example.com"
                    className="w-full bg-[#212B33] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2.5 text-xs text-[#E9E4D6] placeholder-[#8B97A0]/50 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Age Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-5 bg-[#212B33] rounded-2xl border border-[#2E3A43]">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] flex justify-between">
                    <span>Current Age</span>
                    <span className="text-[#C9A227] font-mono font-bold">{currentAge} yrs</span>
                  </label>
                  <input
                    type="range"
                    min="18"
                    max="60"
                    value={currentAge}
                    onChange={(e) => {
                      const newAge = parseInt(e.target.value);
                      setCurrentAge(newAge);
                      if (retirementAge <= newAge) {
                        setRetirementAge(newAge + 10);
                      }
                    }}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] flex justify-between">
                    <span>Willing Retirement Age</span>
                    <span className="text-[#C9A227] font-mono font-bold">{retirementAge} yrs</span>
                  </label>
                  <input
                    type="range"
                    min={currentAge + 5}
                    max={Math.min(75, currentAge + 45)}
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(parseInt(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8B97A0] font-mono block">Simulation duration: {retirementAge - currentAge} years</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] flex justify-between">
                    <span>Life Expectancy</span>
                    <span className="text-[#E9E4D6] font-mono">{lifeExpectancy} yrs</span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="100"
                    value={lifeExpectancy}
                    onChange={(e) => setLifeExpectancy(parseInt(e.target.value))}
                    className="w-full accent-[#C9A227] cursor-pointer"
                  />
                  <span className="text-[10px] text-[#8B97A0] font-mono block">Used to check if your freedom actually lasts, not just whether you reach it</span>
                </div>
              </div>

              {/* Monthly Income & Expense */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-[#212B33] rounded-2xl border border-[#2E3A43] space-y-2">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">Current Monthly Income (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#4C9A6A] font-mono font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="20000"
                      step="5000"
                      value={monthlyIncome}
                      onChange={(e) => setMonthlyIncome(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#10161B] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2 text-sm text-[#E9E4D6] font-mono font-bold outline-none"
                    />
                  </div>
                </div>

                <div className="p-4 bg-[#212B33] rounded-2xl border border-[#2E3A43] space-y-2">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">Current Monthly Expense (₹)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-[#C24E3E] font-mono font-bold text-sm">₹</span>
                    <input
                      type="number"
                      min="10000"
                      step="2000"
                      value={monthlyExpense}
                      onChange={(e) => setMonthlyExpense(parseInt(e.target.value) || 0)}
                      className="w-full bg-[#10161B] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2 text-sm text-[#E9E4D6] font-mono font-bold outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Insurance Toggles */}
              <div className="p-5 bg-[#212B33] rounded-2xl border border-[#2E3A43] space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#E9E4D6] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#C9A227]" />
                  <span>Risk Moat & Protection Toggles</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    hasTermInsurance
                      ? 'bg-[#4C9A6A]/10 border-[#4C9A6A]/40 text-[#E9E4D6]'
                      : 'bg-[#10161B] border-[#2E3A43] text-[#8B97A0] hover:border-[#8B97A0]/40'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasTermInsurance}
                      onChange={(e) => setHasTermInsurance(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#C9A227] rounded cursor-pointer"
                    />
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-bold text-[#E9E4D6] block">Term Life Insurance</span>
                      <span className="text-[10px] text-[#8B97A0] block leading-tight">Protects dependents' cashflow security</span>
                    </div>
                  </label>

                  <label className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer ${
                    hasHealthInsurance
                      ? 'bg-[#4C9A6A]/10 border-[#4C9A6A]/40 text-[#E9E4D6]'
                      : 'bg-[#10161B] border-[#2E3A43] text-[#8B97A0] hover:border-[#8B97A0]/40'
                  }`}>
                    <input
                      type="checkbox"
                      checked={hasHealthInsurance}
                      onChange={(e) => setHasHealthInsurance(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-[#C9A227] rounded cursor-pointer"
                    />
                    <div className="space-y-0.5 text-left">
                      <span className="text-xs font-bold text-[#E9E4D6] block">Health Insurance Policy</span>
                      <span className="text-[10px] text-[#8B97A0] block leading-tight">Covers sudden 3-5x medical hospitalization emergency shocks</span>
                    </div>
                  </label>
                </div>

                {!hasHealthInsurance && (
                  <div className="p-3 bg-[#C24E3E]/10 border border-[#C24E3E]/30 text-[#C24E3E] rounded-xl text-[11px] font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#C24E3E] shrink-0" />
                    <span>Notice: With no health insurance, a sudden 3-5x medical emergency shock is guaranteed to hit during the game!</span>
                  </div>
                )}
              </div>

              {/* Fixed Assumptions Footnote & Submit */}
              <div className="p-4 bg-[#10161B] border border-[#2E3A43] rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-[#8B97A0] space-y-1 font-mono text-left">
                  <p>• Fixed Assumptions: Inflation runs at <strong className="text-[#C9A227]">6.0% / year</strong></p>
                  <p>• Market-linked equity CAGR re-randomizes between <strong className="text-[#4C9A6A]">14% to 17% p.a.</strong> every round—same as real life!</p>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 bg-[#C9A227] hover:bg-[#b08d1f] text-[#10161B] font-black rounded-xl text-sm shadow-xl transition-all transform hover:scale-[1.02] cursor-pointer flex items-center justify-center gap-2 shrink-0 font-mono uppercase tracking-wider"
                >
                  <span>Launch Simulation</span>
                  <ArrowRight className="w-4 h-4 text-[#10161B]" />
                </button>
              </div>

            </form>
          </div>
        )}

        {/* SCREEN 2: CORE GAMEPLAY LOOP */}
        {gameState === 'playing' && (
          <div className="space-y-6 text-left animate-fade-in">
            
            {/* Round Header & Freedom Banner */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-[#1A2229] border border-[#2E3A43] p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-[#212B33] border border-[#2E3A43] font-mono font-bold text-xs text-[#C9A227] rounded-lg">
                  Round {simRound} of {totalRounds}
                </span>
                <span className="text-sm font-mono text-[#E9E4D6]">
                  Age <strong className="text-white text-base font-bold">{simAge}</strong> ({retirementAge - simAge} yrs to retirement)
                </span>
              </div>

              {freedomAchievedRound !== null && (
                <div className="px-3 py-1 bg-[#C9A227]/10 border border-[#C9A227]/40 text-[#C9A227] font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 animate-pulse">
                  <Trophy className="w-3.5 h-3.5" />
                  <span>Freedom Achieved at Age {freedomAchievedAge} (Round {freedomAchievedRound})! Bonus Years Ahead.</span>
                </div>
              )}
            </div>

            {/* Dashboard Panel: 4 Stat Tiles + Freedom Gauge */}
            <div className="bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-5 shadow-2xl space-y-5">
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                {/* 4 Stat Tiles */}
                <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  
                  {/* Tile 1: Monthly Income */}
                  <div className="bg-[#212B33] border border-[#2E3A43] p-3.5 rounded-2xl">
                    <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Monthly Income</span>
                    <div className="text-base sm:text-lg font-mono font-bold text-[#4C9A6A] mt-1">
                      ₹{simIncome.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-[#8B97A0] font-mono">Salary / Work</span>
                  </div>

                  {/* Tile 2: Monthly Expense */}
                  <div className="bg-[#212B33] border border-[#2E3A43] p-3.5 rounded-2xl">
                    <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Monthly Expense</span>
                    <div className="text-base sm:text-lg font-mono font-bold text-[#C24E3E] mt-1">
                      ₹{simExpense.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-[#8B97A0] font-mono">+6% Inflation/yr</span>
                  </div>

                  {/* Tile 3: Cash On Hand */}
                  <div className="bg-[#212B33] border border-[#2E3A43] p-3.5 rounded-2xl">
                    <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Cash On Hand</span>
                    <div className={`text-base sm:text-lg font-mono font-bold mt-1 ${cashOnHand < 0 ? 'text-[#C24E3E]' : 'text-[#E9E4D6]'}`}>
                      ₹{cashOnHand.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-[#8B97A0] font-mono">Emergency Buffer</span>
                  </div>

                  {/* Tile 4: Invested Corpus */}
                  <div className="bg-[#212B33] border border-[#2E3A43] p-3.5 rounded-2xl">
                    <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Invested Corpus</span>
                    <div className="text-base sm:text-lg font-mono font-bold text-[#C9A227] mt-1">
                      ₹{investedCorpus.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[9px] text-[#C9A227]/80 font-mono">14-17% CAGR</span>
                  </div>

                </div>

                {/* Freedom Gauge (Signature Element) */}
                <div className="lg:col-span-4 bg-[#212B33] border border-[#2E3A43] p-4 rounded-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
                  <span className="text-[10px] font-mono font-bold text-[#8B97A0] uppercase tracking-wider block mb-1">
                    Financial Freedom Gauge
                  </span>

                  {/* Semicircular SVG Gauge */}
                  <div className="relative w-48 h-24 flex items-end justify-center">
                    <svg className="w-48 h-24 overflow-visible" viewBox="0 0 200 100">
                      {/* Background Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke="#10161B"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      {/* Foreground Progress Arc */}
                      <path
                        d="M 20 100 A 80 80 0 0 1 180 100"
                        fill="none"
                        stroke={freedomPercent >= 100 ? '#C9A227' : '#4C9A6A'}
                        strokeWidth="16"
                        strokeLinecap="round"
                        strokeDasharray="251.3"
                        strokeDashoffset={251.3 * (1 - freedomPercent / 100)}
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Central Gauge Text */}
                    <div className="absolute bottom-1 flex flex-col items-center">
                      <span className="text-2xl font-mono font-black text-[#C9A227]">
                        {freedomPercent}%
                      </span>
                      <span className="text-[9px] font-mono text-[#8B97A0]">
                        Expense Covered
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] font-mono text-[#8B97A0] mt-2">
                    Passive Yield: <strong className="text-[#4C9A6A] font-mono">₹{passiveMonthlyYield.toLocaleString('en-IN')}/mo</strong> vs Expense: <strong className="text-[#C24E3E] font-mono">₹{simExpense.toLocaleString('en-IN')}/mo</strong>
                  </p>
                </div>

              </div>

              {/* Action Buttons: Invest via Mutual Fund SIP & Upskill Course */}
              <div className="flex flex-wrap gap-3 pt-2 border-t border-[#2E3A43]">
                <button
                  onClick={handleOpenSipModal}
                  className="px-5 py-2.5 bg-[#4C9A6A] hover:bg-[#3d7e56] text-[#10161B] font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Invest via Mutual Fund SIP (₹{monthlySip.toLocaleString('en-IN')}/mo)</span>
                </button>

                <button
                  onClick={() => setShowCourseModal(true)}
                  className="px-5 py-2.5 bg-[#5B8AA6] hover:bg-[#486f87] text-[#10161B] font-mono font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-md"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Upskill / Course ({coursesTaken}/2 Taken)</span>
                </button>

                {hasAdvisor && (
                  <div className="ml-auto px-3 py-1.5 bg-[#5B8AA6]/10 border border-[#5B8AA6]/30 text-[#5B8AA6] font-mono text-xs rounded-xl flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Advisor Appointed (0.75% Fee/yr)</span>
                  </div>
                )}
              </div>

            </div>

            {/* Event Stack for Current Round */}
            {roundEvents.length > 0 && activeEventIndex < roundEvents.length ? (
              <div className="bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-6 shadow-2xl space-y-4">
                {(() => {
                  const ev = roundEvents[activeEventIndex];
                  
                  // Left border color based on category
                  let borderStyle = "border-l-4 border-slate-500";
                  if (ev.category === 'fixed' || ev.category === 'sudden') borderStyle = "border-l-4 border-[#C24E3E]";
                  else if (ev.category === 'lifestyle') borderStyle = "border-l-4 border-[#5B8AA6]";
                  else if (ev.category === 'risky' || ev.category === 'scam') borderStyle = "border-l-4 border-[#C9A227]";
                  else if (ev.category === 'windfall') borderStyle = "border-l-4 border-[#4C9A6A]";

                  return (
                    <div className={`p-5 bg-[#212B33] rounded-2xl border border-[#2E3A43] ${borderStyle} space-y-4`}>
                      
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8B97A0] block">
                            Event Card {activeEventIndex + 1} of {roundEvents.length} — [{ev.category.toUpperCase()}]
                          </span>
                          <h3 className="text-lg font-bold font-serif text-[#E9E4D6]">
                            {ev.title}
                          </h3>
                        </div>

                        <div className="text-right font-mono">
                          <span className="text-xs text-[#8B97A0] block">Amount Impact</span>
                          <span className={`text-base font-bold ${ev.category === 'windfall' ? 'text-[#4C9A6A]' : 'text-[#C24E3E]'}`}>
                            {ev.category === 'windfall' ? '+' : '-'}₹{ev.amount.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs sm:text-sm text-[#E9E4D6]/90 leading-relaxed">
                        {ev.description}
                      </p>

                      {ev.promisedYield && (
                        <div className="p-2.5 bg-[#C9A227]/10 border border-[#C9A227]/30 text-[#C9A227] rounded-xl text-xs font-mono font-bold flex items-center gap-2">
                          <Zap className="w-4 h-4 text-[#C9A227]" />
                          <span>Promised Return: {ev.promisedYield}</span>
                        </div>
                      )}

                      {/* Action Buttons for Card */}
                      <div className="pt-3 border-t border-[#2E3A43] flex flex-wrap items-center justify-between gap-3">
                        
                        {ev.isMandatory ? (
                          <button
                            onClick={() => handleEventAction(true)}
                            className="px-6 py-2.5 bg-[#C9A227] hover:bg-[#b08d1f] text-[#10161B] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all"
                          >
                            Pay & Continue →
                          </button>
                        ) : (
                          <>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleEventAction(true)}
                                className="px-5 py-2.5 bg-[#4C9A6A] hover:bg-[#3d7e56] text-[#10161B] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-md transition-all"
                              >
                                {ev.category === 'lifestyle' ? 'Spend It (-₹' + ev.amount.toLocaleString('en-IN') + ')' : 'Invest / Take Deal'}
                              </button>

                              <button
                                onClick={() => handleEventAction(false)}
                                className="px-5 py-2.5 bg-[#212B33] hover:bg-[#2E3A43] text-[#8B97A0] hover:text-[#E9E4D6] border border-[#2E3A43] font-mono font-bold text-xs rounded-xl cursor-pointer transition-all"
                              >
                                {ev.category === 'lifestyle' ? 'Skip This Year' : 'Pass / Decline'}
                              </button>
                            </div>

                            {hasAdvisor && (ev.category === 'scam' || ev.category === 'risky') && (
                              <div className="text-[11px] font-mono text-[#5B8AA6] flex items-center gap-1">
                                <ShieldCheck className="w-3.5 h-3.5 text-[#5B8AA6]" />
                                <span>Advisor Shield Active</span>
                              </div>
                            )}
                          </>
                        )}

                      </div>

                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="p-6 bg-[#1A2229] border border-[#2E3A43] rounded-3xl text-center space-y-4">
                <CheckCircle2 className="w-8 h-8 text-[#4C9A6A] mx-auto" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold font-serif text-[#E9E4D6]">All Life Events Resolved for Year {simRound}!</h3>
                  <p className="text-xs text-[#8B97A0] font-mono">Click End Year below to compound your Mutual Fund corpus and advance to Age {simAge + 1}.</p>
                </div>

                <button
                  onClick={handleEndYear}
                  className="px-8 py-3.5 bg-[#C9A227] hover:bg-[#b08d1f] text-[#10161B] font-mono font-black text-sm rounded-2xl shadow-xl transition-all cursor-pointer transform hover:scale-[1.02] uppercase tracking-wider"
                >
                  End Year {simRound} & Compound →
                </button>
              </div>
            )}

            {/* This Year's Running Ledger Log Feed */}
            <div className="bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-5 shadow-xl space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#8B97A0] uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#C9A227]" />
                <span>This Year's Financial Ledger Feed</span>
              </h4>

              <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                {ledgerLogs.length === 0 ? (
                  <p className="text-xs text-[#8B97A0]/60 font-mono italic">No decision logs recorded yet for this year.</p>
                ) : (
                  ledgerLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border font-mono text-xs flex items-start justify-between gap-3 ${
                        log.isGain 
                          ? 'bg-[#4C9A6A]/10 border-[#4C9A6A]/30 text-[#E9E4D6]' 
                          : 'bg-[#C24E3E]/10 border-[#C24E3E]/30 text-[#E9E4D6]'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <span className="text-[10px] text-[#8B97A0] block">Round {log.round}</span>
                        <p className="leading-snug">{log.text}</p>
                      </div>
                      {log.amount !== undefined && log.amount !== 0 && (
                        <span className={`font-bold shrink-0 ${log.amount > 0 ? 'text-[#4C9A6A]' : 'text-[#C24E3E]'}`}>
                          {log.amount > 0 ? '+' : ''}₹{log.amount.toLocaleString('en-IN')}
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        )}

        {/* SCREEN 3: REPORT SCREEN (§10) */}
        {gameState === 'report' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-fade-in text-left">
            
            {/* Outcome Hero Section */}
            {(() => {
              const isWin = freedomAchievedRound !== null && depletionAge === null;
              const isPartial = freedomAchievedRound !== null && depletionAge !== null;
              const mindset = getInvestorMindsetTag();

              return (
                <div className="space-y-6">
                  <div className={`p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-4 ${
                    isWin
                      ? 'bg-[#1A2229] border-[#C9A227] text-[#E9E4D6]'
                      : isPartial
                      ? 'bg-[#1A2229] border-[#C24E3E]/60 text-[#E9E4D6]'
                      : 'bg-[#1A2229] border-[#C24E3E] text-[#E9E4D6]'
                  }`}>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 font-mono text-xs font-bold uppercase rounded-md ${
                        isWin ? 'bg-[#C9A227] text-[#10161B]' : 'bg-[#C24E3E] text-white'
                      }`}>
                        {isWin ? '🏆 FINANCIALLY FREE' : isPartial ? '⚠️ SUSTAINABILITY SHORTFALL' : '🚨 NOT YET FREE'}
                      </span>
                      <span className="text-xs font-mono text-[#8B97A0]">
                        Player: <strong className="text-white">{playerName || 'Player'}</strong>
                      </span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl font-black font-serif text-white">
                      {isWin
                        ? `Congratulations, ${playerName || 'Player'}! You Broke Free of the Rat Race at Age ${freedomAchievedAge}!`
                        : isPartial
                        ? `${playerName || 'Player'}, You Reached Freedom on Paper, But Your Corpus Ran Dry at Age ${depletionAge}!`
                        : `${playerName || 'Player'}, You Reached Retirement Age ${retirementAge} Without Financial Freedom.`}
                    </h2>

                    <p className="text-xs sm:text-sm text-[#8B97A0] leading-relaxed">
                      {isWin
                        ? `By maintaining disciplined Mutual Fund SIP allocations and compounding your capital through real-life market cycles, your invested corpus reached ₹${investedCorpus.toLocaleString('en-IN')}. Your passive monthly investment return of ₹${Math.round((investedCorpus * 0.08) / 12).toLocaleString('en-IN')}/mo fully covers your inflation-adjusted expenses. Working is now 100% optional for you!`
                        : isPartial
                        ? `You achieved financial freedom at Age ${freedomAchievedAge}, but post-retirement 6% inflation and living withdrawals depleted your corpus at Age ${depletionAge}. This proves that reaching the number on day one of retirement is not enough—your corpus must be structured to survive your entire life expectancy!`
                        : `At retirement age ${retirementAge}, your passive monthly investment return of ₹${Math.round((investedCorpus * 0.08) / 12).toLocaleString('en-IN')}/mo covers only ${freedomPercent}% of your ₹${simExpense.toLocaleString('en-IN')}/mo living expenses. You remain dependent on active work income to cover your monthly household bills.`}
                    </p>

                    {/* Investor Mindset Badge */}
                    <div className="p-4 bg-[#212B33] border border-[#2E3A43] rounded-2xl space-y-1 mt-4">
                      <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Investor Mindset Archetype</span>
                      <h4 className="text-base font-bold font-mono text-[#C9A227]">{mindset.tag}</h4>
                      <p className="text-xs text-[#E9E4D6]/90">{mindset.desc}</p>
                    </div>

                  </div>

                  {/* "A Day in This Life" Narrative Scene (§10) */}
                  <div className="p-6 bg-[#1A2229] border border-[#2E3A43] rounded-3xl space-y-3">
                    <h3 className="text-xs font-mono font-bold text-[#C9A227] uppercase tracking-wider flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-[#C9A227]" />
                      <span>A Day in This Life</span>
                    </h3>
                    {isWin ? (
                      <div className="space-y-3 font-serif italic text-xs sm:text-sm text-[#E9E4D6]/90 leading-relaxed">
                        <p>
                          "It is 8:30 AM on an ordinary Tuesday. No alarm goes off. You make tea in a quiet kitchen, watching the morning traffic from your balcony without needing to join it. Your monthly living expenses were already transferred automatically from your mutual fund dividend/SWP engine on the 1st of the month."
                        </p>
                        <p>
                          "If you weren't here tomorrow, the exact same structure—your invested corpus combined with your term insurance cover—continues funding your family's monthly living without asking anyone to compromise or scramble."
                        </p>
                      </div>
                    ) : isPartial ? (
                      <div className="space-y-3 font-serif italic text-xs sm:text-sm text-[#E9E4D6]/90 leading-relaxed">
                        <p>
                          "The first three years of retirement feel like pure relief. Tuesdays are unhurried, groceries get paid effortlessly, and the freedom you built carries you forward with quiet pride."
                        </p>
                        <p>
                          "By year fifteen, 6% annual inflation has quietly doubled your household bills while living withdrawals drained your corpus faster than conservative returns could replenish it. Reaching the finish line is a real triumph—what remains is structuring the portfolio to outlast inflation."
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 font-serif italic text-xs sm:text-sm text-[#E9E4D6]/90 leading-relaxed">
                        <p>
                          "The alarm rings at 6:30 AM on what was meant to be your retirement morning. You reach for your keys, knowing the monthly salary is still the single pillar holding up your household expenses."
                        </p>
                        <p>
                          "If an unexpected event stopped that paycheck tomorrow, your family would face an immediate financial cliff unless term insurance is in place to replace it. Closing this gap doesn't require a miracle—just a structured SIP plan given time to compound."
                        </p>
                      </div>
                    )}
                  </div>

                  {/* "Your Path Forward" Panel for Non-Full Win Outcomes (§10) */}
                  {!isWin && (
                    <div className="p-6 bg-[#212B33] border border-[#5B8AA6]/40 rounded-3xl space-y-4">
                      <h3 className="text-xs font-mono font-bold text-[#5B8AA6] uppercase tracking-wider flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#5B8AA6]" />
                        <span>Your Path Forward — Bridging the Gap</span>
                      </h3>
                      {(() => {
                        const targetCorpus = Math.round((simExpense * 12) / 0.08);
                        const gap = Math.max(0, targetCorpus - investedCorpus);
                        const currSip = Math.max(5000, monthlySip);
                        const yearsNeededCurr = Math.max(1, Math.ceil(gap / (currSip * 12 * 1.15)));
                        const boostedSip = Math.round(currSip * 1.5);
                        const yearsNeededBoosted = Math.max(1, Math.ceil(gap / (boostedSip * 12 * 1.15)));

                        return (
                          <div className="space-y-3 text-xs text-[#E9E4D6]">
                            <p className="text-[#8B97A0] leading-relaxed">
                              Closing your <strong className="text-[#C9A227]">₹{gap.toLocaleString('en-IN')}</strong> corpus gap is entirely achievable with disciplined adjustments:
                            </p>

                            <ol className="list-decimal list-inside space-y-2 font-mono text-xs">
                              <li>
                                <strong className="text-white">Current SIP Horizon:</strong> Continuing a ₹{currSip.toLocaleString('en-IN')}/mo SIP at 15% CAGR bridges the gap in approximately <strong className="text-[#C9A227]">{yearsNeededCurr} years</strong>.
                              </li>
                              <li>
                                <strong className="text-white">1.5x Accelerated SIP:</strong> Increasing your monthly allocation to ₹{boostedSip.toLocaleString('en-IN')}/mo reduces the time to freedom to <strong className="text-[#4C9A6A]">{yearsNeededBoosted} years</strong>.
                              </li>
                              <li>
                                <strong className="text-white">Advisory & Protection Lever:</strong> {!hasAdvisor ? 'Appointing an AMFI-registered advisor filters out costly scam leaks and keeps your asset allocation on track.' : 'Your professional advisor alignment ensures long-term tax efficiency and systematic withdrawal planning.'}
                              </li>
                            </ol>

                            <p className="text-[11px] font-serif italic text-[#8B97A0] pt-2 border-t border-[#2E3A43]">
                              "Financial freedom is not about timing the market—it is about time in the market, protected by insurance and guided by disciplined asset allocation."
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                </div>
              );
            })()}

            {/* Stat Panel */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-[#1A2229] border border-[#2E3A43] rounded-2xl">
                <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Final Invested Corpus</span>
                <span className="text-lg font-mono font-bold text-[#C9A227]">₹{investedCorpus.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-4 bg-[#1A2229] border border-[#2E3A43] rounded-2xl">
                <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Final Monthly Expense</span>
                <span className="text-lg font-mono font-bold text-[#C24E3E]">₹{simExpense.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-4 bg-[#1A2229] border border-[#2E3A43] rounded-2xl">
                <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Total Invested via SIP</span>
                <span className="text-lg font-mono font-bold text-[#4C9A6A]">₹{totalSipInvested.toLocaleString('en-IN')}</span>
              </div>

              <div className="p-4 bg-[#1A2229] border border-[#2E3A43] rounded-2xl">
                <span className="text-[10px] font-mono text-[#8B97A0] uppercase block">Advisor Fees Paid</span>
                <span className="text-lg font-mono font-bold text-[#5B8AA6]">
                  {hasAdvisor ? `₹${totalAdvisorFees.toLocaleString('en-IN')}` : 'No Advisor Used'}
                </span>
              </div>
            </div>

            {/* What Worked / What Cost You (Dynamic Lists) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="p-5 bg-[#1A2229] border border-[#2E3A43] rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#4C9A6A] uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#4C9A6A]" />
                  <span>What Worked Right in Your Game</span>
                </h4>
                <ul className="text-xs text-[#E9E4D6] space-y-2 font-mono">
                  {hasHealthInsurance && <li>• Maintained Health Insurance policy—protected capital from medical bill shocks.</li>}
                  {hasAdvisor && <li>• Appointed AMFI Financial Advisor—blocked {scamsBlockedByAdvisor} scam schemes and maintained 80/20 win ratio filter.</li>}
                  {sipFundedRoundsCount >= totalRounds * 0.75 && <li>• Consistent SIP Discipline—funded Mutual Funds in {sipFundedRoundsCount} out of {totalRounds} working years.</li>}
                  {coursesTaken > 0 && <li>• Upskilled through certifications—boosted active income stream for higher SIP power.</li>}
                  {freedomAchievedRound !== null && <li>• Reached Financial Freedom threshold at Age {freedomAchievedAge}!</li>}
                </ul>
              </div>

              <div className="p-5 bg-[#1A2229] border border-[#2E3A43] rounded-2xl space-y-3">
                <h4 className="text-xs font-mono font-bold text-[#C24E3E] uppercase flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-[#C24E3E]" />
                  <span>What Cost You Capital & Freedom Speed</span>
                </h4>
                <ul className="text-xs text-[#E9E4D6] space-y-2 font-mono">
                  {!hasHealthInsurance && <li>• No Health Insurance—forced to pay out-of-pocket medical bill shock directly from cash!</li>}
                  {!hasAdvisor && <li>• Solo DIY Investing—operated with 40/60 win ratio and full exposure to scam collapse risks.</li>}
                  {scamsAttempted > 0 && !hasAdvisor && <li>• Fell for unregulated high-yield traps—lost capital to unapproved schemes.</li>}
                  {riskyLosses > 0 && <li>• Lost money on speculative unverified pitch calls ({riskyLosses} losses).</li>}
                  {depletionAge !== null && <li>• Post-retirement inflation depleted corpus at Age {depletionAge}.</li>}
                </ul>
              </div>

            </div>

            {/* Call to Action for Pure Wealth Global */}
            <div className="p-6 bg-gradient-to-r from-[#1A2229] via-[#212B33] to-[#1A2229] border border-[#C9A227]/40 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold text-[#C9A227] uppercase tracking-wider">
                  Pure Wealth Global — AMFI Registered Advisory
                </span>
                <h3 className="text-lg sm:text-xl font-black font-serif text-white">
                  Turn Your Simulation Blueprint Into Real-World Financial Freedom
                </h3>
                <p className="text-xs text-[#8B97A0] max-w-xl">
                  Book a 1:1 confidential consultation with our AMFI-registered mutual fund advisors to calibrate your real-life SIPs, risk moats, and tax-efficient retirement portfolio.
                </p>
              </div>

              <a
                href="/#connect"
                onClick={(e) => {
                  e.preventDefault();
                  if (setCurrentPage) setCurrentPage('connect');
                }}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#C9A227] hover:bg-[#b08d1f] text-[#10161B] font-mono font-black rounded-xl text-xs shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 shrink-0 uppercase tracking-wider"
              >
                <span>Book 1:1 Advisory Session</span>
                <ExternalLink className="w-4 h-4 text-[#10161B]" />
              </a>
            </div>

          </div>
        )}

      </div>

      {/* MODAL 1: FINANCIAL ADVISOR PROMPT MODAL */}
      {showAdvisorModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-left animate-fade-in">
          <div className="bg-[#1A2229] border border-[#5B8AA6] rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-[#2E3A43] pb-4">
              <div className="p-2.5 bg-[#5B8AA6]/20 text-[#5B8AA6] rounded-2xl border border-[#5B8AA6]/40">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold font-serif text-white">Appoint a Financial Advisor?</h3>
                <p className="text-xs text-[#8B97A0] font-mono">Charges 0.75% per year on invested corpus</p>
              </div>
            </div>

            <p className="text-xs text-[#E9E4D6] leading-relaxed">
              In real life, navigating stock market investments alone leaves retail investors vulnerable to Ponzi schemes, unapproved real estate traps, and emotional panic selling.
            </p>

            <div className="p-4 bg-[#212B33] rounded-2xl border border-[#2E3A43] space-y-2 text-xs font-mono">
              <div className="text-[#5B8AA6] font-bold">🛡️ WITH ADVISOR (0.75% Fee/yr):</div>
              <p className="text-[#8B97A0]">• 80/20 win ratio on investment decisions.</p>
              <p className="text-[#8B97A0]">• Auto-blocks 100% of Ponzi schemes & scam traps.</p>
              <p className="text-[#8B97A0]">• Shows exact target corpus & SIP gap calculators.</p>

              <div className="text-[#C24E3E] font-bold pt-2">👤 WITHOUT ADVISOR (DIY):</div>
              <p className="text-[#8B97A0]">• 40/60 win ratio (60% of risky deals fail).</p>
              <p className="text-[#8B97A0]">• Full exposure to disguised scams and capital loss.</p>
              <p className="text-[#8B97A0]">• No target freedom calculator guidance.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={() => handleAdvisorChoice(true)}
                className="flex-1 px-5 py-3 bg-[#5B8AA6] hover:bg-[#486f87] text-[#10161B] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all text-center"
              >
                Hire Financial Advisor (0.75% Fee)
              </button>

              <button
                onClick={() => handleAdvisorChoice(false)}
                className="px-5 py-3 bg-[#212B33] hover:bg-[#2E3A43] text-[#8B97A0] hover:text-[#E9E4D6] border border-[#2E3A43] font-mono font-bold text-xs rounded-xl cursor-pointer transition-all text-center"
              >
                Continue DIY (Unguided)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: MUTUAL FUND SIP INVESTING MODAL */}
      {showSipModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-left animate-fade-in">
          <div className="bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2E3A43] pb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#4C9A6A]" />
                <h3 className="text-base font-bold font-serif text-white">Configure Monthly Mutual Fund SIP</h3>
              </div>
              <button
                onClick={() => setShowSipModal(false)}
                className="text-[#8B97A0] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {hasAdvisor && (
              <div className="p-4 bg-[#5B8AA6]/10 border border-[#5B8AA6]/30 rounded-2xl space-y-1.5 font-mono text-xs">
                <span className="text-[#5B8AA6] font-bold block">🛡️ Advisor Target Freedom Calculator</span>
                {(() => {
                  const targetCorpus = Math.round((simExpense * 12) / 0.08); // 8% SWR rule
                  const gap = Math.max(0, targetCorpus - investedCorpus);
                  return (
                    <div className="space-y-1 text-[#8B97A0]">
                      <p>• Target Corpus Needed at Current Expense: <strong className="text-white">₹{targetCorpus.toLocaleString('en-IN')}</strong></p>
                      <p>• Remaining Corpus Gap: <strong className="text-[#C9A227]">₹{gap.toLocaleString('en-IN')}</strong></p>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-[#8B97A0] block">Monthly SIP Amount (₹/mo)</label>
              <input
                type="number"
                min="1000"
                step="2000"
                value={monthlySip}
                onChange={(e) => setMonthlySip(parseInt(e.target.value) || 0)}
                className="w-full bg-[#10161B] border border-[#2E3A43] focus:border-[#4C9A6A] rounded-xl px-4 py-2.5 text-sm text-[#E9E4D6] font-mono font-bold outline-none"
              />
              <span className="text-[10px] font-mono text-[#8B97A0]">Annual SIP deduction: ₹{(monthlySip * 12).toLocaleString('en-IN')}/yr</span>
            </div>

            <button
              onClick={() => setShowSipModal(false)}
              className="w-full py-3 bg-[#4C9A6A] hover:bg-[#3d7e56] text-[#10161B] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all"
            >
              Save SIP Configuration
            </button>
          </div>
        </div>
      )}

      {/* MODAL 3: UPSKILLING COURSE MODAL */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-left animate-fade-in">
          <div className="bg-[#1A2229] border border-[#2E3A43] rounded-3xl p-6 max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2E3A43] pb-4">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-[#5B8AA6]" />
                <h3 className="text-base font-bold font-serif text-white">Enroll in Upskilling Certification</h3>
              </div>
              <button
                onClick={() => setShowCourseModal(false)}
                className="text-[#8B97A0] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {courseOptions.map((course) => {
                const cost = simIncome * course.costMultiple;
                const canAfford = cashOnHand >= cost && coursesTaken < 2;

                return (
                  <div key={course.id} className="p-4 bg-[#212B33] border border-[#2E3A43] rounded-2xl space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="text-xs font-bold font-serif text-[#E9E4D6]">{course.title}</h4>
                      <span className="text-xs font-mono font-bold text-[#5B8AA6]">₹{cost.toLocaleString('en-IN')}</span>
                    </div>

                    <p className="text-[11px] text-[#8B97A0] leading-snug">{course.description}</p>

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-mono text-[#4C9A6A] font-bold">+ {course.salaryBoostPercent}% Permanent Raise in 2 Years</span>
                      <button
                        disabled={!canAfford}
                        onClick={() => handleEnrollCourse(course)}
                        className={`px-4 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-[#5B8AA6] hover:bg-[#486f87] text-[#10161B] cursor-pointer'
                            : 'bg-[#10161B] text-[#8B97A0] border border-[#2E3A43] cursor-not-allowed opacity-50'
                        }`}
                      >
                        {coursesTaken >= 2 ? 'Limit Reached' : canAfford ? 'Enroll Now' : 'Insufficient Cash'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: ADMIN PORTAL MODAL (§11) */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-left animate-fade-in">
          <div className="bg-[#1A2229] border border-[#C9A227]/60 rounded-3xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#2E3A43] pb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#C9A227]" />
                <h3 className="text-base font-bold font-serif text-white">Pure Wealth Admin Lead Portal</h3>
              </div>
              <button
                onClick={() => setShowAdminModal(false)}
                className="text-[#8B97A0] hover:text-white font-mono text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {!isAdminUnlocked ? (
              <form onSubmit={handleUnlockAdmin} className="space-y-4 max-w-md mx-auto py-6">
                <p className="text-xs text-[#8B97A0] font-mono">
                  Enter the administrative passcode to access saved simulation lead reports.
                </p>
                <div className="space-y-2">
                  <label className="text-xs font-mono font-bold text-[#8B97A0] block">Passcode</label>
                  <input
                    type="password"
                    required
                    value={adminPasscode}
                    onChange={(e) => setAdminPasscode(e.target.value)}
                    placeholder="Enter admin passcode"
                    className="w-full bg-[#10161B] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2.5 text-sm text-[#E9E4D6] font-mono outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-[#C9A227] hover:bg-[#b08d1f] text-[#10161B] font-mono font-bold text-xs rounded-xl cursor-pointer shadow-lg transition-all uppercase tracking-wider"
                >
                  Unlock Admin Portal
                </button>
              </form>
            ) : (
              <div className="space-y-4 font-mono text-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-[#212B33] p-4 rounded-2xl border border-[#2E3A43]">
                  <div>
                    <span className="text-white font-bold block">Simulation Lead Reports</span>
                    <span className="text-[#8B97A0] text-[11px]">{adminReports.length} total completed player simulation reports saved</span>
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={fetchAdminReports}
                      className="px-3 py-2 bg-[#10161B] hover:bg-[#2E3A43] text-[#8B97A0] hover:text-white border border-[#2E3A43] rounded-xl text-xs font-mono transition-all cursor-pointer"
                    >
                      Refresh
                    </button>
                    <button
                      onClick={exportAdminCsv}
                      disabled={adminReports.length === 0}
                      className="px-4 py-2 bg-[#4C9A6A] hover:bg-[#3d7e56] text-[#10161B] font-bold rounded-xl text-xs font-mono transition-all cursor-pointer shadow-md disabled:opacity-50"
                    >
                      Export CSV
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  placeholder="Filter by name, phone, or email..."
                  className="w-full bg-[#10161B] border border-[#2E3A43] focus:border-[#C9A227] rounded-xl px-4 py-2 text-xs text-[#E9E4D6] outline-none"
                />

                {adminLoading ? (
                  <div className="p-8 text-center text-[#8B97A0]">Loading saved reports...</div>
                ) : adminReports.length === 0 ? (
                  <div className="p-8 text-center text-[#8B97A0] border border-[#2E3A43] rounded-2xl">No completed simulation lead reports found yet.</div>
                ) : (
                  <div className="border border-[#2E3A43] rounded-2xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-[#212B33] text-[#8B97A0] border-b border-[#2E3A43] text-[11px] uppercase">
                          <th className="p-3">Date</th>
                          <th className="p-3">Name</th>
                          <th className="p-3">Contact</th>
                          <th className="p-3">Outcome</th>
                          <th className="p-3">Final Corpus</th>
                          <th className="p-3">Archetype</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2E3A43] text-[11px] text-[#E9E4D6]">
                        {adminReports
                          .filter((r) => {
                            const q = adminSearch.toLowerCase();
                            return !q || (r.name && r.name.toLowerCase().includes(q)) || (r.phone && r.phone.includes(q)) || (r.email && r.email.toLowerCase().includes(q));
                          })
                          .map((r, idx) => {
                            const calc = r.calculatorData || {};
                            const isExpanded = expandedReportId === (r.id || String(idx));
                            return (
                              <React.Fragment key={r.id || idx}>
                                <tr
                                  onClick={() => setExpandedReportId(isExpanded ? null : (r.id || String(idx)))}
                                  className="hover:bg-[#212B33]/50 cursor-pointer transition-all"
                                >
                                  <td className="p-3 text-[#8B97A0]">{r.date || 'N/A'}</td>
                                  <td className="p-3 font-bold text-white">{r.name}</td>
                                  <td className="p-3 text-[#8B97A0]">{r.phone}<br/>{r.email}</td>
                                  <td className="p-3">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${calc.isWinner ? 'bg-[#4C9A6A]/20 text-[#4C9A6A]' : calc.depletionAge ? 'bg-[#C24E3E]/20 text-[#C24E3E]' : 'bg-[#C9A227]/20 text-[#C9A227]'}`}>
                                      {calc.isWinner ? 'FREE' : calc.depletionAge ? 'DEPLETED' : 'NOT FREE'}
                                    </span>
                                  </td>
                                  <td className="p-3 font-bold text-[#C9A227]">₹{(calc.finalCorpus || 0).toLocaleString('en-IN')}</td>
                                  <td className="p-3 text-[#5B8AA6]">{calc.mindsetTag || 'N/A'}</td>
                                </tr>
                                {isExpanded && (
                                  <tr className="bg-[#10161B]/80 text-[#8B97A0] text-[11px]">
                                    <td colSpan={6} className="p-4 space-y-2 border-b border-[#2E3A43]">
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-white">
                                        <div>Current Age: <strong>{calc.currentAge}</strong></div>
                                        <div>Retire Age: <strong>{calc.retirementAge}</strong></div>
                                        <div>Freedom Ratio: <strong>{calc.freedomRatioPercent}%</strong></div>
                                        <div>Advisor Used: <strong>{calc.hasAdvisor ? 'Yes' : 'No'}</strong></div>
                                        <div>Term Insured: <strong>{calc.hasTermInsurance ? 'Yes' : 'No'}</strong></div>
                                        <div>Health Insured: <strong>{calc.hasHealthInsurance ? 'Yes' : 'No'}</strong></div>
                                        <div>SIP Total: <strong>₹{(calc.totalSipInvested || 0).toLocaleString('en-IN')}</strong></div>
                                        <div>Scams Blocked: <strong>{calc.scamsBlockedByAdvisor || 0}</strong></div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
