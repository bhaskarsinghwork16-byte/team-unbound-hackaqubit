'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Plus,
  Eye,
  Smile,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Award,
  Cpu,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Sliders,
  Check,
  Clock,
  HeartPulse,
  ScanLine,
  Database,
  ArrowUpRight,
  Shield,
  HelpCircle,
} from 'lucide-react';
import FolderFloat from './FolderFloat';

const FOLDER_ITEMS = [
  { label: '📊 Clinical Overview', value: '/dashboard' },
  { label: '👁️ New AI Screening', value: '/screening' },
  { label: '👥 Patient Directory', value: '/patients' },
  { label: '📋 Screening History', value: '/history' },
  { label: '⚕️ Specialist Referrals', value: '/referrals' },
  { label: '📈 Operational Reports', value: '/reports' },
  { label: '🧬 Dataset Docs', value: '/datasets' },
  { label: '⚙️ System Settings', value: '/settings' },
];

// Interactive demo cases for the live hero simulator
interface DemoCase {
  id: string;
  name: string;
  type: 'eye' | 'oral';
  sampleThumb: string;
  gateStatus: 'pass' | 'fail';
  gateMessage: string;
  blurScore: number;
  aiPrediction: string;
  confidence: number;
  severity: 'normal' | 'moderate' | 'suspicious' | 'invalid';
  recommendation: string;
}

const DEMO_CASES: DemoCase[] = [
  {
    id: 'case-eye-normal',
    name: 'Normal Retinal Fundus',
    type: 'eye',
    sampleThumb: '👁️ Clear Retinal Disc',
    gateStatus: 'pass',
    gateMessage: 'Valid Fundus Image · Optical Quality Passed',
    blurScore: 242,
    aiPrediction: 'No Diabetic Retinopathy (Grade 0)',
    confidence: 96.8,
    severity: 'normal',
    recommendation: 'Routine annual diabetic eye screening recommended.',
  },
  {
    id: 'case-eye-npdr',
    name: 'Retinopathy with Exudates',
    type: 'eye',
    sampleThumb: '👁️ Fundus with Microaneurysms',
    gateStatus: 'pass',
    gateMessage: 'Valid Fundus Image · Optical Quality Passed',
    blurScore: 198,
    aiPrediction: 'Moderate NPDR (Grade 2)',
    confidence: 92.4,
    severity: 'moderate',
    recommendation: 'Escalate to Tele-Ophthalmology for slit-lamp verification within 30 days.',
  },
  {
    id: 'case-oral-lesion',
    name: 'Oral Mucosal White Patch',
    type: 'oral',
    sampleThumb: '👄 Buccal Mucosa Inspection',
    gateStatus: 'pass',
    gateMessage: 'Valid Oral Cavity · Chromaticity Passed',
    blurScore: 185,
    aiPrediction: 'Suspicious Mucosal Lesion (Potential Leukoplakia)',
    confidence: 89.1,
    severity: 'suspicious',
    recommendation: 'Urgent referral to District Dental Surgeon / Oncologist for biopsy.',
  },
  {
    id: 'case-invalid-blur',
    name: 'Out-of-Focus / Defocused Image',
    type: 'eye',
    sampleThumb: '⚠️ Blurred Lens Capture',
    gateStatus: 'fail',
    gateMessage: 'Optical Gate REJECTED: Laplacian variance 42.1 (Threshold 100)',
    blurScore: 42,
    aiPrediction: 'Model Inference Blocked (Low Quality)',
    confidence: 0,
    severity: 'invalid',
    recommendation: 'Recapture image. Ensure camera lens is steady and focused on the retina.',
  },
];

export default function CommunityScreeningHero() {
  const router = useRouter();
  const [activeProtocolTab, setActiveProtocolTab] = useState<'eye' | 'oral'>('eye');
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-eye-normal');

  const activeCase = DEMO_CASES.find((c) => c.id === selectedCaseId) || DEMO_CASES[0];

  const handlePillSelect = (value: string) => {
    if (value) {
      router.push(value);
    }
  };

  return (
    <div id="hero" className="w-full bg-slate-50 text-slate-900 font-sans relative overflow-hidden bg-dot-grid">
      {/* Ambient Lighting Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-mesh-radial pointer-events-none" />
      <div className="absolute top-20 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-80 left-10 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── SEGMENT 1: MODERN HERO SECTION ── */}
      <section className="px-4 sm:px-8 lg:px-12 pt-12 pb-16 lg:pt-16 lg:pb-24 relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: High-Impact Typography & Action */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Live Status Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/90 text-xs font-semibold text-teal-900 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Offline Edge Intelligence · WHO &amp; ICMR Aligned</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Clinical-Grade AI Triage for{' '}
              <span className="text-gradient-teal">Community Health</span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              Empowering frontline community health workers to screen for <strong className="text-slate-800 font-semibold">Diabetic Retinopathy</strong> and <strong className="text-slate-800 font-semibold">Oral Mucosal Lesions</strong> with local INT8 neural inference, automated optical quality gating, and structured specialist referrals.
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/screening"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-teal-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <Plus className="w-4 h-4 text-teal-100" />
                <span>Start Patient Screening</span>
                <ArrowRight className="w-4 h-4 text-teal-100" />
              </Link>

              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-slate-100/80 border border-slate-200 text-slate-800 rounded-xl text-sm font-semibold transition-all shadow-2xs hover:border-slate-300"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-600" />
                <span>Open Clinical Workspace</span>
              </Link>
            </div>

            {/* Quick Metrics Bar */}
            <div className="pt-4 grid grid-cols-3 gap-3 border-t border-slate-200/90">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Zap className="w-3.5 h-3.5 text-teal-600" />
                  <span>Latency</span>
                </div>
                <div className="text-base font-bold text-slate-900">&lt; 3.0s</div>
                <div className="text-[11px] text-slate-400">On CPU laptop</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Connectivity</span>
                </div>
                <div className="text-base font-bold text-slate-900">100% Offline</div>
                <div className="text-[11px] text-slate-400">Zero cloud reliance</div>
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <Activity className="w-3.5 h-3.5 text-sky-600" />
                  <span>Protocols</span>
                </div>
                <div className="text-base font-bold text-slate-900">Eye + Oral</div>
                <div className="text-[11px] text-slate-400">Multi-organ triage</div>
              </div>
            </div>
          </motion.div>

          {/* Right Column: INTERACTIVE CLINICAL SIMULATOR CARD */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 p-5 sm:p-6 space-y-5">
              
              {/* Simulator Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center">
                    <ScanLine className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Live Triage Pipeline Simulator
                    </h3>
                    <p className="text-[11px] text-slate-400">Interactive quality gate &amp; neural inference</p>
                  </div>
                </div>

                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Edge Ready
                </span>
              </div>

              {/* Sample Case Selector Buttons */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Select A Clinical Test Scenario:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_CASES.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedCaseId(item.id)}
                      className={`text-left p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        selectedCaseId === item.id
                          ? 'border-teal-500 bg-teal-50/70 text-teal-900 shadow-2xs ring-1 ring-teal-500/30'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="truncate">{item.sampleThumb}</div>
                      <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                        {item.type === 'eye' ? 'Retinal DR' : 'Oral Mucosa'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Interactive Pipeline Progress Box */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCase.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/80"
                >
                  {/* Step 1: Image Quality Assessment Gate */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700 flex items-center gap-1.5">
                        <span>1. Optical Quality Gate (IQA)</span>
                      </span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[11px] ${
                          activeCase.gateStatus === 'pass'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {activeCase.gateStatus === 'pass' ? 'Passed Quality Check' : 'Quality Rejected'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Laplacian Variance Score:</span>
                      <span className="font-mono font-bold text-slate-700">
                        {activeCase.blurScore} / 100 min
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          activeCase.blurScore >= 100 ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${Math.min(100, (activeCase.blurScore / 250) * 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Step 2: Edge Neural Model Inference */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">2. Neural Model Prediction</span>
                      {activeCase.gateStatus === 'pass' && (
                        <span className="font-mono text-[11px] font-bold text-teal-700">
                          {activeCase.confidence}% Conf.
                        </span>
                      )}
                    </div>

                    <div
                      className={`p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                        activeCase.severity === 'normal'
                          ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                          : activeCase.severity === 'moderate'
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : activeCase.severity === 'suspicious'
                          ? 'bg-rose-50 text-rose-900 border border-rose-200'
                          : 'bg-slate-200/80 text-slate-700 border border-slate-300'
                      }`}
                    >
                      {activeCase.severity === 'normal' && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                      {activeCase.severity === 'moderate' && <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />}
                      {activeCase.severity === 'suspicious' && <HeartPulse className="w-4 h-4 text-rose-600 shrink-0" />}
                      {activeCase.severity === 'invalid' && <XCircle className="w-4 h-4 text-slate-600 shrink-0" />}
                      <span className="truncate">{activeCase.aiPrediction}</span>
                    </div>
                  </div>

                  {/* Step 3: Clinical Protocol Action */}
                  <div className="pt-1 text-[11px] text-slate-600 leading-snug">
                    <strong className="text-slate-800">Clinical Protocol Action: </strong>
                    <span>{activeCase.recommendation}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Launch Workflow CTA Button */}
              <Link
                href={
                  activeCase.type === 'eye'
                    ? '/screening?type=eye'
                    : '/screening?type=oral'
                }
                className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
              >
                <span>Launch Full {activeCase.type === 'eye' ? 'Retinal' : 'Oral'} Screening Flow</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>

        </div>
      </section>

      {/* ── SEGMENT 2: 4 CORE CLINICAL PILLARS (BENTO GRID) ── */}
      <section id="features" className="py-16 sm:py-20 border-t border-slate-200/90 bg-white/80 relative z-10 px-4 sm:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Validated Architecture
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Primary Health Clinics
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed specifically for community health camps and rural clinics where internet connectivity is intermittent and immediate triage decisions save lives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Bento Card 1: Optical Quality Gate */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <ShieldCheck className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Stage Quality Gate</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents misclassification by rejecting unrelated objects, defocused captures, and underexposed shots before any model inference runs.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-teal-700 flex items-center gap-1">
                <span>Laplacian Blur + Color Ratio</span>
              </div>
            </div>

            {/* Bento Card 2: Offline Quantized Inference */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Cpu className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Offline Edge Models</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Runs on standard laptops with INT8 PyTorch weights. Zero cloud GPU required, ensuring patient confidentiality and instant response times.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                <span>&lt; 3s CPU Inference</span>
              </div>
            </div>

            {/* Bento Card 3: Dual Multi-Organ Screening */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Eye className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Dual Protocol Coverage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Comprehensive screening for both Diabetic Retinopathy (retinal fundus) and oral mucosal lesions (early oral cancer risk detection).
              </p>
              <div className="pt-2 text-[11px] font-semibold text-sky-700 flex items-center gap-1">
                <span>Retinal Fundus + Oral Cavity</span>
              </div>
            </div>

            {/* Bento Card 4: Closed-Loop Referral */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-indigo-300 transition-all space-y-3.5">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                <HeartPulse className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Closed-Loop Care &amp; Referrals</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Connects field workers directly to district specialists with printable referral slips, priority triage flags, and follow-up tracking.
              </p>
              <div className="pt-2 text-[11px] font-semibold text-indigo-700 flex items-center gap-1">
                <span>Specialist Tele-Consults</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEGMENT 3: INTERACTIVE MODULE DIRECTORY (PHYSICAL FOLDER ENVELOPE) ── */}
      <section id="modules" className="py-16 sm:py-20 border-t border-slate-200 relative z-10 flex flex-col items-center text-center px-4 sm:px-8">
        <div className="max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive Module Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Explore HealthScreen Workflows
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hover over or tap the interactive case folder to pull out all modules, patient logs, and clinical protocols.
          </p>
        </div>

        {/* Physical Matter.js FolderFloat Envelope in Unified Teal Palette */}
        <div className="w-full flex items-center justify-center py-4">
          <FolderFloat
            items={FOLDER_ITEMS}
            label="HealthScreen Workflows"
            sublabel="Hover / Tap to open"
            onSelect={handlePillSelect}
            trigger="hover"
            physics={true}
          />
        </div>
      </section>
    </div>
  );
}
