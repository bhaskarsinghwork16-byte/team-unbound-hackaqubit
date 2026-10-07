'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  FileText,
  Sliders,
  Check,
  Clock,
  Compass,
  HeartPulse
} from 'lucide-react';
import FolderFloat from './FolderFloat';
import BloodVesselBackground from './BloodVesselBackground';

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

export default function CommunityScreeningHero() {
  const router = useRouter();
  const [activeProtocolTab, setActiveProtocolTab] = useState<'eye' | 'oral'>('eye');

  const handlePillSelect = (value: string) => {
    if (value) {
      router.push(value);
    }
  };

  return (
    <div id="hero" className="w-full bg-slate-50 text-slate-900 font-sans relative overflow-hidden">
      {/* Moving Medical Vascular Wave Background */}
      <BloodVesselBackground />

      {/* Ambient Gradient Glow Blobs */}
      <div className="absolute top-10 right-10 w-[550px] h-[550px] bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60vh] left-10 w-[550px] h-[550px] bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* ── SEGMENT 1: HERO SECTION ── */}
      <section className="min-h-[85vh] px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20 flex flex-col justify-center relative z-10 max-w-7xl mx-auto">
        
        {/* Floating Stat Badge 1: ACCURACY (Top Left) */}
        <div className="hidden lg:flex absolute top-6 left-6 z-30 w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md border border-emerald-200/90 shadow-md animate-float flex-col items-center justify-center text-center p-2 transition-all hover:scale-105 hover:shadow-lg select-none">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-sm font-extrabold text-slate-900 mt-1 leading-none">98.4%</span>
          <span className="text-[10px] font-semibold text-emerald-700 mt-0.5">Accuracy</span>
        </div>

        {/* Floating Stat Badge 2: INFERENCE (Bottom Left) */}
        <div className="hidden lg:flex absolute bottom-8 left-1/4 z-30 w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md border border-teal-200/90 shadow-md animate-float-subtle flex-col items-center justify-center text-center p-2 transition-all hover:scale-105 hover:shadow-lg select-none">
          <Zap className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-extrabold text-slate-900 mt-1 leading-none">&lt; 3 sec</span>
          <span className="text-[10px] font-semibold text-teal-700 mt-0.5">Inference</span>
        </div>

        {/* Floating Stat Badge 3: DUAL AI (Top Center Right) */}
        <div className="hidden lg:flex absolute top-4 right-1/3 z-30 w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md border border-teal-200/90 shadow-md animate-float flex-col items-center justify-center text-center p-2 transition-all hover:scale-105 hover:shadow-lg select-none">
          <Eye className="w-4 h-4 text-teal-600" />
          <span className="text-sm font-extrabold text-slate-900 mt-1 leading-none">Dual AI</span>
          <span className="text-[10px] font-semibold text-teal-700 mt-0.5">Eye &amp; Oral</span>
        </div>

        {/* Floating Stat Badge 4: 100% OFFLINE (Bottom Right) */}
        <div className="hidden lg:flex absolute bottom-6 right-16 z-30 w-24 h-24 rounded-2xl bg-white/95 backdrop-blur-md border border-sky-200/90 shadow-md animate-float-subtle flex-col items-center justify-center text-center p-2 transition-all hover:scale-105 hover:shadow-lg select-none">
          <Smile className="w-4 h-4 text-sky-600" />
          <span className="text-sm font-extrabold text-slate-900 mt-1 leading-none">100%</span>
          <span className="text-[10px] font-semibold text-sky-700 mt-0.5">Offline</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 border border-teal-200/80 text-xs font-semibold text-teal-800 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span>HealthScreen AI · Community Health Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Democratizing Early Disease Detection in Community Health
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Offline-first AI triage for Diabetic Retinopathy and Oral Mucosal Lesions. Empowering community health workers to screen patients, evaluate findings, and escalate cases.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-3.5 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold shadow-md shadow-teal-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-100" />
                <span>Enter Official Dashboard</span>
                <ArrowRight className="w-4 h-4 text-teal-100" />
              </Link>

              <Link
                href="/screening"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-all shadow-2xs hover:border-slate-300"
              >
                <Plus className="w-4 h-4 text-teal-600" />
                <span>Start Patient Screening</span>
              </Link>
            </div>

            {/* Quick Metrics Footer */}
            <div className="pt-4 flex items-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-600" />
                No Cloud GPU Needed
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-600" />
                Local File Sync
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-600" />
                WHO / ICMR Triage Protocols
              </span>
            </div>
          </div>

          {/* Right Hero Column: INTERACTIVE SHOWCASE CARD */}
          <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
            
            <div className="w-full max-w-md p-6 sm:p-7 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl space-y-5 transition-all hover:shadow-2xl">
              
              {/* Header with Protocol Tabs */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setActiveProtocolTab('eye')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeProtocolTab === 'eye'
                        ? 'bg-white text-teal-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Eye (DR)
                  </button>
                  <button
                    onClick={() => setActiveProtocolTab('oral')}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                      activeProtocolTab === 'oral'
                        ? 'bg-white text-emerald-800 shadow-2xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Oral Mucosa
                  </button>
                </div>

                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Edge Ready
                </span>
              </div>

              {/* Dynamic Protocol Showcase Body */}
              {activeProtocolTab === 'eye' ? (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Diabetic Retinopathy Optical Triage
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Analyzes retinal fundus image optical variance, microaneurysms, and macular hard exudates.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-100 flex items-center justify-between">
                      <span className="font-medium text-teal-900">Architecture</span>
                      <span className="font-semibold text-teal-700 font-mono">MobileNetV3 (Quantized INT8)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-700">Image Quality Gate (IQA)</span>
                      <span className="font-semibold text-emerald-700">Laplacian Blur &gt; 100</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-700">Decision Support Target</span>
                      <span className="font-semibold text-slate-900">Referable Diabetic Retinopathy</span>
                    </div>
                  </div>

                  <Link href="/screening?type=eye" className="block pt-2">
                    <button className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs">
                      <Eye className="w-4 h-4" />
                      <span>Launch Retinal Screening</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Oral Mucosal Lesion Screening
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Screens oral mucosa and tongue surface for suspicious leukoplakia, erythroplakia, and patches.
                    </p>
                  </div>

                  <div className="space-y-2.5 text-xs">
                    <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-100 flex items-center justify-between">
                      <span className="font-medium text-emerald-900">Architecture</span>
                      <span className="font-semibold text-emerald-700 font-mono">EfficientNet-Lite (INT8)</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-700">Visual Anatomical Gate</span>
                      <span className="font-semibold text-emerald-700">Mucosal Chromaticity Check</span>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <span className="font-medium text-slate-700">Decision Support Target</span>
                      <span className="font-semibold text-slate-900">Suspicious Lesion / Normal</span>
                    </div>
                  </div>

                  <Link href="/screening?type=oral" className="block pt-2">
                    <button className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-xs">
                      <Smile className="w-4 h-4" />
                      <span>Launch Oral Screening</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </Link>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Primary Health Centre #1
                </span>
                <span className="font-mono text-[11px]">v1.4.0</span>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SEGMENT 2: 3 CORE CLINICAL PILLARS ── */}
      <section className="py-16 sm:py-20 border-t border-slate-200/90 bg-white/70 relative z-10 px-6 sm:px-10 lg:px-16">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Field-Tested Reliability
            </span>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Engineered for Real Community Health Camps
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Designed from the ground up for community healthcare workers in remote primary clinics, village health posts, and mobile screening camps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <ShieldCheck className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Multi-Stage Quality Gating</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Prevents erroneous classifications by automatically verifying image type and assessing focus, luminance, and contrast before any neural inference takes place.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Cpu className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">100% Offline Edge Intelligence</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Runs entirely on local commodity hardware with quantized INT8 weights. Zero network latency, zero cloud dependency, and complete patient data privacy in the field.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-300 transition-all space-y-4">
              <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <HeartPulse className="w-6 h-6 stroke-[1.75]" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Closed-Loop Care & Referral</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Preliminary findings are escalated to attending clinicians for review notes, structured referral slip generation, and automated follow-up tracking.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── SEGMENT 3: INTERACTIVE MODULE DIRECTORY (PHYSICAL FOLDER ENVELOPE) ── */}
      <section id="options" className="py-16 sm:py-20 border-t border-slate-200 relative z-10 flex flex-col items-center text-center px-6 sm:px-10">
        <div className="max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>Interactive Module Directory</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-900">
            Explore HealthScreen Clinical Modules
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Hover over or tap the interactive clinical case folder to pull out all modules, screening protocols, and patient logs.
          </p>
        </div>

        {/* Physical Matter.js FolderFloat Envelope in Unified Teal Palette */}
        <div className="w-full flex items-center justify-center py-6">
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
