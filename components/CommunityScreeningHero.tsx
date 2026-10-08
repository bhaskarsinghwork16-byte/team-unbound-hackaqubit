'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  Sparkle,
  Activity,
  Scan,
  Compass
} from 'lucide-react';
import FolderFloat from './FolderFloat';
import BloodVesselBackground from './BloodVesselBackground';
import FlexCarousel from './FlexCarousel';

const FOLDER_ITEMS = [
  { label: '📊 Clinical Overview', value: '/dashboard' },
  { label: '👁️ New AI Screening', value: '/screening' },
  { label: '👥 Patient Directory', value: '/patients' },
  { label: '📋 Screening History', value: '/history' },
  { label: '⚕️ Specialist Referrals', value: '/referrals' },
  { label: '📈 Operational Reports', value: '/reports' },
  { label: '🧬 Dataset Docs', value: '/datasets' },
  { label: '⚙️ System Settings', value: '/settings' }
];

const SPOTLIGHT_R = 240;

interface ClinicalSpotlightProps {
  cursorX: number;
  cursorY: number;
}

function ClinicalSpotlightLayer({ cursorX, cursorY }: ClinicalSpotlightProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || 400;
    const height = canvas.height || 400;

    ctx.clearRect(0, 0, width, height);

    if (cursorX >= 0 && cursorY >= 0) {
      const grad = ctx.createRadialGradient(cursorX, cursorY, 0, cursorX, cursorY, SPOTLIGHT_R);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.65, 'rgba(255, 255, 255, 0.75)');
      grad.addColorStop(0.85, 'rgba(255, 255, 255, 0.35)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    try {
      const dataUrl = canvas.toDataURL();
      layer.style.maskImage = `url(${dataUrl})`;
      layer.style.webkitMaskImage = `url(${dataUrl})`;
      layer.style.maskSize = '100% 100%';
      layer.style.webkitMaskSize = '100% 100%';
    } catch {
      // Fallback
    }
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div
        ref={layerRef}
        className="absolute inset-0 pointer-events-none z-20 rounded-3xl transition-opacity duration-300 overflow-hidden shadow-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(93,42,66,0.96) 0%, rgba(254,200,154,0.9) 100%)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="absolute inset-0 p-8 flex flex-col justify-between text-[#fff9ec] z-10">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdccc] text-[#5d2a42] text-xs font-black">
              <Scan className="w-3.5 h-3.5 text-[#5d2a42]" />
              <span>AI Neural Heatmap Layer</span>
            </span>
            <span className="px-2.5 py-1 rounded-md bg-[#5d2a42] text-[#fff9ec] text-[10px] font-black border border-[#ffdccc]/30">
              98.4% Confidence
            </span>
          </div>

          <div className="space-y-3 bg-[#5d2a42]/40 backdrop-blur-md p-4 rounded-2xl border border-[#ffdccc]/30">
            <h4 className="text-base font-black text-[#ffdccc]">
              Microvascular Retinal &amp; Lesion Segmentation
            </h4>
            <p className="text-xs text-[#fff9ec]/90 leading-relaxed font-medium">
              Real-time edge INT8 neural network model highlighting vascular exudates, hemorrhages, and mucosal pattern anomalies.
            </p>
            <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-[#ffdccc]">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#ffdccc]" /> &lt; 2.8ms Inference
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-[#ffdccc]" /> 100% Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function CommunityScreeningHero() {
  const router = useRouter();
  const cardContainerRef = useRef<HTMLDivElement | null>(null);

  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const card = cardContainerRef.current;
    if (card) {
      const rect = card.getBoundingClientRect();
      const initialX = rect.width / 2;
      const initialY = rect.height / 2;
      mouseRef.current = { x: initialX, y: initialY };
      smoothRef.current = { x: initialX, y: initialY };
      setCursorPos({ x: initialX, y: initialY });
    }

    const updateLoop = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;

      setCursorPos({
        x: Math.round(smoothRef.current.x * 100) / 100,
        y: Math.round(smoothRef.current.y * 100) / 100,
      });

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    rafRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardContainerRef.current) return;
    const rect = cardContainerRef.current.getBoundingClientRect();
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

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

const CLINICAL_MODULES = [
  {
    title: 'Diabetic Retinopathy Optical Screening',
    tag: 'AI Protocol #1',
    description: 'Autonomous retinal fundus screening with automated Laplacian blur verification and 5-tier DR severity staging.',
    href: '/screening?type=eye',
    icon: Eye,
    iconBg: 'bg-teal-50 border-teal-200 text-teal-700',
    tagColor: 'bg-teal-50 text-teal-800 border-teal-200',
  },
  {
    title: 'Oral Mucosal Lesion Screening',
    tag: 'AI Protocol #2',
    description: 'Visual screening of oral mucosa and tongue for suspicious leukoplakia, erythroplakia, and mucosal abnormalities.',
    href: '/screening?type=oral',
    icon: Smile,
    iconBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    tagColor: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  {
    title: 'Community Patient Directory',
    tag: 'Records & Intake',
    description: 'Longitudinal health records, demographic search, and past screening encounters for registered community members.',
    href: '/patients',
    icon: Users,
    iconBg: 'bg-sky-50 border-sky-200 text-sky-700',
    tagColor: 'bg-sky-50 text-sky-800 border-sky-200',
  },
  {
    title: 'Screening History & Audit Trail',
    tag: 'Encounters',
    description: 'Historical archive of completed screenings, optical confidence scores, and clinician review stamps.',
    href: '/history',
    icon: ClipboardList,
    iconBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    tagColor: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  },
  {
    title: 'Closed-Loop Specialist Referrals',
    tag: 'Secondary Care',
    description: 'Escalate higher-risk findings to district ophthalmologists and oncologists with printable referral slips.',
    href: '/referrals',
    icon: GitPullRequest,
    iconBg: 'bg-rose-50 border-rose-200 text-rose-700',
    tagColor: 'bg-rose-50 text-rose-800 border-rose-200',
  },
  {
    title: 'Operational Reports & CSV Export',
    tag: 'Health Dept Analytics',
    description: 'Real-time community health camp metrics, disease prevalence breakdowns, and one-click data export.',
    href: '/reports',
    icon: BarChart2,
    iconBg: 'bg-amber-50 border-amber-200 text-amber-700',
    tagColor: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    title: 'Validation Datasets & Evidence',
    tag: 'Model Robustness',
    description: 'Clinical validation cohorts (APTOS 2019, Messidor-2, and Indian rural camps) with sensitivity metrics.',
    href: '/datasets',
    icon: Database,
    iconBg: 'bg-cyan-50 border-cyan-200 text-cyan-700',
    tagColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  },
  {
    title: 'Edge System & Diagnostics',
    tag: 'Field Operations',
    description: 'PyTorch INT8 inference status, offline JSON store synchronization, and judge evaluation demo mode.',
    href: '/settings',
    icon: Sliders,
    iconBg: 'bg-slate-100 border-slate-200 text-slate-700',
    tagColor: 'bg-slate-100 text-slate-800 border-slate-200',
  },
];

export default function CommunityScreeningHero() {
  const [selectedCaseId, setSelectedCaseId] = useState<string>('case-eye-normal');

  const activeCase = DEMO_CASES.find((c) => c.id === selectedCaseId) || DEMO_CASES[0];

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

            {/* Main Title (#5d2a42) with Staggered Entrance Animation */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#5d2a42] leading-[1.15]">
              <span className="block hero-anim hero-reveal" style={{ animationDelay: '0.2s' }}>
                Democratizing Early
              </span>
              <span className="block hero-anim hero-reveal" style={{ animationDelay: '0.35s' }}>
                Disease Detection in Community Health
              </span>
            </h1>

            {/* Subtitle Copy */}
            <p className="text-base sm:text-lg text-[#5d2a42]/85 max-w-2xl leading-relaxed font-medium hero-anim hero-fade" style={{ animationDelay: '0.5s' }}>
              Offline-first AI triage for Diabetic Retinopathy and Oral Mucosal Lesions. Empowering community health workers to screen patients, evaluate findings, and escalate cases.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4 hero-anim hero-fade" style={{ animationDelay: '0.65s' }}>
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

          {/* Right Hero Column: SHOWCASE CARD WITH CURSOR SPOTLIGHT REVEAL MECHANIC */}
          <div className="lg:col-span-5 relative min-h-[460px] flex flex-col items-center justify-center">
            
            {/* Central Glass Showcase Card with Interactive AI Layer Spotlight */}
            <div
              ref={cardContainerRef}
              onMouseMove={handleCardMouseMove}
              className="w-full max-w-md p-8 rounded-3xl bg-[#d8e2dc]/40 backdrop-blur-xl border border-[#d8e2dc] shadow-2xl space-y-5 relative overflow-hidden group cursor-crosshair"
            >
              {/* Clinical Spotlight Layer revealing AI diagnostic scan underneath */}
              <ClinicalSpotlightLayer cursorX={cursorPos.x} cursorY={cursorPos.y} />

              <div className="flex items-center justify-between relative z-10">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5d2a42]/80">
                  Clinical Decision Support
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5d2a42] animate-ping" />
              </div>

              <h3 className="text-xl font-black text-[#5d2a42] leading-snug relative z-10">
                Instant AI Screening for Diabetic Retinopathy &amp; Oral Lesions
              </h3>

              <p className="text-xs text-[#5d2a42]/85 leading-relaxed font-medium relative z-10">
                Deployed directly on low-power tablets and laptops without requiring cloud connectivity during field camps.
              </p>

              <div className="p-3.5 rounded-xl bg-[#ffdccc] border border-[#d8e2dc] flex items-center justify-between text-xs font-extrabold text-[#5d2a42] relative z-10">
                <span>Ready for Camp Operations</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#5d2a42] text-[#fff9ec] text-[10px]">Active</span>
              </div>

              {/* Cursor Spotlight Hint Pill */}
              <div className="pt-2 flex items-center gap-1.5 text-[11px] font-extrabold text-[#5d2a42]/70 relative z-10">
                <Sparkle className="w-3.5 h-3.5 text-[#5d2a42] animate-spin" />
                <span>Move cursor over card to reveal AI Diagnostic Layer</span>
              </div>
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

      {/* ── SEGMENT 3: MODERN CLINICAL WORKFLOWS DIRECTORY (REPLACED ODD FOLDER) ── */}
      <section id="modules" className="py-16 sm:py-24 border-t border-slate-200 relative z-10 px-4 sm:px-8 lg:px-12 bg-slate-50/60">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-bold text-teal-900">
              <Layers className="w-3.5 h-3.5 text-teal-600" />
              <span>Full Clinical Platform Directory</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Explore HealthScreen Workflows
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed font-normal">
              Direct access to all clinical screening protocols, longitudinal patient records, specialist escalations, and edge operational settings.
            </p>
          </div>

          {/* Clean Modern 4x2 Responsive Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {CLINICAL_MODULES.map((module) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.href}
                  href={module.href}
                  className="group p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-400 transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-transform group-hover:scale-105 ${module.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${module.tagColor}`}>
                        {module.tag}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm group-hover:text-teal-700 transition-colors leading-snug">
                        {module.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                        {module.description}
                      </p>
                    </div>
                  </div>

        {/* 3D WebGL FlexCarousel Module Options Showcase */}
        <div className="w-full max-w-5xl h-[360px] relative rounded-3xl overflow-hidden border border-[#d8e2dc] bg-[#fff9ec] shadow-xl my-8">
          <FlexCarousel
            items={[
              {
                src: '/images/eye_torchlight_exam.jpg',
                alt: 'Eye Ophthalmic Torchlight Inspection',
                title: '👁️ Ophthalmic Torchlight Exam',
                subtitle: 'Pupil & Retinal Microvascular Torch Inspection'
              },
              {
                src: '/images/tongue_torchlight_exam.jpg',
                alt: 'Oral Tongue Torchlight Examination',
                title: '👅 Oral & Tongue Torchlight Exam',
                subtitle: 'Penlight Mucosal & Tongue Lesion Screening'
              },
              {
                src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=max',
                alt: 'Clinical Dashboard Overview',
                title: '📊 Clinical Overview',
                subtitle: 'Real-time Screening Flow & Metrics'
              },
              {
                src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80&auto=format&fit=max',
                alt: 'AI Patient Screening',
                title: '👁️ AI Patient Screening',
                subtitle: 'Offline Triage for Retinal & Oral Lesions'
              },
              {
                src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1200&q=80&auto=format&fit=max',
                alt: 'Patient Directory',
                title: '👥 Patient Directory',
                subtitle: 'Encrypted Longitudinal Records'
              },
              {
                src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80&auto=format&fit=max',
                alt: 'Specialist Referrals',
                title: '⚕️ Specialist Referrals',
                subtitle: 'District Hospital Escalation Pipeline'
              },
              {
                src: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&q=80&auto=format&fit=max',
                alt: 'Dataset & Model Docs',
                title: '🧬 AI Model Specs',
                subtitle: 'Edge INT8 Quantized Architectures'
              }
            ]}
            preset="liquid"
            intro="rise"
            cardHeight={0.65}
            gap={16}
            squeeze={0.2}
            focusOnClick
            captions
            onSelect={(_idx, item) => {
              if (item.title?.includes('Overview')) router.push('/dashboard');
              else if (item.title?.includes('Screening') || item.title?.includes('Torchlight')) router.push('/screening');
              else if (item.title?.includes('Directory')) router.push('/patients');
              else if (item.title?.includes('Referrals')) router.push('/referrals');
              else if (item.title?.includes('Specs')) router.push('/datasets');
            }}
          />
        </div>

        <p className="text-xs text-[#5d2a42]/70 font-bold mt-4 flex items-center gap-1.5">
          <Sparkle className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>3D WebGL Liquid Lens Options Carousel · Drag &amp; Scroll Cards</span>
        </p>
      </section>
    </div>
  );
}
