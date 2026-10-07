'use client';

import React from 'react';
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
  Lock,
  Layers,
  Sparkle
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

  const handlePillSelect = (value: string) => {
    if (value) {
      router.push(value);
    }
  };

  return (
    <div id="hero" className="w-full bg-[#fff9ec] text-[#5d2a42] px-6 sm:px-10 lg:px-16 font-sans relative overflow-hidden">
      {/* Moving Medical Blood Vessel SVG Background */}
      <BloodVesselBackground />

      {/* Background Decorative Glow Blobs */}
      <div className="absolute top-10 right-10 w-[500px] h-[500px] bg-[#d8e2dc]/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-[60vh] left-10 w-[500px] h-[500px] bg-[#ffdccc]/50 rounded-full blur-3xl pointer-events-none" />

      {/* ── SEGMENT 1: MAIN HERO SECTION WITH RANDOM FLOATING CIRCULAR BUTTONS ── */}
      <section className="min-h-[90vh] py-16 sm:py-20 lg:py-24 flex flex-col justify-center relative z-10 mb-16 lg:mb-24">
        
        {/* ── RANDOM FLOATING CIRCLE BUTTON 1: ACCURACY (Top Left) ── */}
        <div className="absolute -top-4 left-2 sm:left-10 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ffdccc] border-2 border-[#d8e2dc] shadow-xl animate-float flex flex-col items-center justify-center text-center p-1.5 transition-transform hover:scale-110 select-none">
          <ShieldCheck className="w-4 h-4 text-[#5d2a42]" />
          <span className="text-xs sm:text-sm font-black text-[#5d2a42] mt-0.5 leading-none">98.4%</span>
          <span className="text-[9px] font-extrabold text-[#5d2a42]/85 mt-0.5">Accuracy</span>
        </div>

        {/* ── RANDOM FLOATING CIRCLE BUTTON 2: INFERENCE (Center Bottom Left) ── */}
        <div className="absolute -bottom-8 left-6 sm:left-1/3 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#d8e2dc]/95 backdrop-blur-md border-2 border-[#5d2a42]/20 shadow-xl animate-float-slow flex flex-col items-center justify-center text-center p-1.5 transition-transform hover:scale-110 select-none">
          <Zap className="w-4 h-4 text-[#5d2a42]" />
          <span className="text-xs sm:text-sm font-black text-[#5d2a42] mt-0.5 leading-none">&lt; 3 sec</span>
          <span className="text-[9px] font-extrabold text-[#5d2a42]/85 mt-0.5">Inference</span>
        </div>

        {/* ── RANDOM FLOATING CIRCLE BUTTON 3: DUAL AI (Top Center Right) ── */}
        <div className="absolute -top-6 right-1/4 sm:right-1/3 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#ffdccc] border-2 border-[#d8e2dc] shadow-xl animate-float flex flex-col items-center justify-center text-center p-1.5 transition-transform hover:scale-110 select-none">
          <Eye className="w-4 h-4 text-[#5d2a42]" />
          <span className="text-xs sm:text-sm font-black text-[#5d2a42] mt-0.5 leading-none">Dual AI</span>
          <span className="text-[9px] font-extrabold text-[#5d2a42]/85 mt-0.5">Eye &amp; Oral</span>
        </div>

        {/* ── RANDOM FLOATING CIRCLE BUTTON 4: 100% OFFLINE (Bottom Right) ── */}
        <div className="absolute -bottom-6 right-4 sm:right-20 z-30 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#d8e2dc]/95 backdrop-blur-md border-2 border-[#5d2a42]/20 shadow-xl animate-float-slow flex flex-col items-center justify-center text-center p-1.5 transition-transform hover:scale-110 select-none">
          <Smile className="w-4 h-4 text-[#5d2a42]" />
          <span className="text-xs sm:text-sm font-black text-[#5d2a42] mt-0.5 leading-none">100%</span>
          <span className="text-[9px] font-extrabold text-[#5d2a42]/85 mt-0.5">Offline</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Hero Column */}
          <div className="lg:col-span-7 space-y-7">
            {/* Minimal Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffdccc] border border-[#d8e2dc] text-xs font-extrabold text-[#5d2a42] shadow-xs animate-float">
              <Sparkles className="w-4 h-4 text-[#5d2a42]" />
              <span>HealthScreen AI · Community Health Platform</span>
            </div>

            {/* Main Title (#5d2a42) */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#5d2a42] leading-[1.15]">
              Democratizing Early Disease Detection in Community Health
            </h1>

            {/* Subtitle Copy */}
            <p className="text-base sm:text-lg text-[#5d2a42]/85 max-w-2xl leading-relaxed font-medium">
              Offline-first AI triage for Diabetic Retinopathy and Oral Mucosal Lesions. Empowering community health workers to screen patients, evaluate findings, and escalate cases.
            </p>

            {/* Action CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2.5 px-7 py-4 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-2xl text-sm font-black shadow-lg shadow-[#5d2a42]/20 transition-all transform hover:-translate-y-0.5"
              >
                <LayoutDashboard className="w-5 h-5 text-[#ffdccc]" />
                <span>Enter Official Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#ffdccc]" />
              </Link>

              <Link
                href="/screening"
                className="inline-flex items-center gap-2 px-6 py-4 bg-[#d8e2dc]/40 hover:bg-[#d8e2dc]/70 border border-[#d8e2dc] text-[#5d2a42] rounded-2xl text-sm font-extrabold transition-all shadow-xs"
              >
                <Plus className="w-4 h-4 text-[#5d2a42]" />
                <span>Start Patient Screening</span>
              </Link>
            </div>
          </div>

          {/* Right Hero Column: SHOWCASE CARD + SPACED FLOATING BADGES */}
          <div className="lg:col-span-5 relative min-h-[460px] flex flex-col items-center justify-center">
            
            {/* Central Glass Showcase Card */}
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#d8e2dc]/40 backdrop-blur-xl border border-[#d8e2dc] shadow-2xl space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[#5d2a42]/80">
                  Clinical Decision Support
                </span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#5d2a42] animate-ping" />
              </div>

              <h3 className="text-xl font-black text-[#5d2a42] leading-snug">
                Instant AI Screening for Diabetic Retinopathy &amp; Oral Lesions
              </h3>

              <p className="text-xs text-[#5d2a42]/85 leading-relaxed font-medium">
                Deployed directly on low-power tablets and laptops without requiring cloud connectivity during field camps.
              </p>

              <div className="p-3.5 rounded-xl bg-[#ffdccc] border border-[#d8e2dc] flex items-center justify-between text-xs font-extrabold text-[#5d2a42]">
                <span>Ready for Camp Operations</span>
                <span className="px-2.5 py-0.5 rounded-md bg-[#5d2a42] text-[#fff9ec] text-[10px]">Active</span>
              </div>
            </div>

            {/* SPACED FLOATING BADGE 1 (Top Right Offset) */}
            <div className="absolute -top-4 -right-2 sm:-right-6 px-4 py-3 rounded-2xl bg-[#ffdccc] border border-[#d8e2dc] shadow-xl animate-float flex items-center gap-3 z-20">
              <div className="w-9 h-9 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold text-xs">
                <Award className="w-4.5 h-4.5 text-[#ffdccc]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#5d2a42]">98.4% AI Precision</p>
                <p className="text-[10px] text-[#5d2a42]/80 font-semibold">Gold Standard Validated</p>
              </div>
            </div>

            {/* SPACED FLOATING BADGE 2 (Center Left Offset) */}
            <div className="absolute top-1/2 -left-4 sm:-left-8 -translate-y-1/2 px-4 py-3 rounded-2xl bg-[#d8e2dc]/90 backdrop-blur-md border border-[#5d2a42]/30 shadow-xl animate-float-slow flex items-center gap-3 z-20">
              <div className="w-9 h-9 rounded-xl bg-[#ffdccc] border border-[#d8e2dc] text-[#5d2a42] flex items-center justify-center font-bold text-xs">
                <Cpu className="w-4.5 h-4.5 text-[#5d2a42]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#5d2a42]">⚡ Offline Edge Engine</p>
                <p className="text-[10px] text-[#5d2a42]/80 font-semibold">&lt;3 Sec Local Response</p>
              </div>
            </div>

            {/* SPACED FLOATING BADGE 3 (Bottom Right Offset) */}
            <div className="absolute -bottom-4 right-0 sm:right-4 px-4 py-3 rounded-2xl bg-[#ffdccc] border border-[#d8e2dc] shadow-xl animate-float flex items-center gap-3 z-20">
              <div className="w-9 h-9 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold text-xs">
                <Lock className="w-4.5 h-4.5 text-[#ffdccc]" />
              </div>
              <div>
                <p className="text-xs font-black text-[#5d2a42]">🔒 Privacy Preserved</p>
                <p className="text-[10px] text-[#5d2a42]/80 font-semibold">Local Encrypted Store</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SEGMENT 2: FOLDER FLOAT ENVELOPE SECTION (AFTER 1 SCROLL) ── */}
      <section id="options" className="min-h-[85vh] py-20 lg:py-28 border-t-2 border-[#d8e2dc]/60 flex flex-col items-center justify-center relative z-10 scroll-mt-20">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#ffdccc] border border-[#d8e2dc] text-xs font-extrabold text-[#5d2a42] shadow-xs">
            <Layers className="w-4 h-4 text-[#5d2a42]" />
            <span>Interactive Module Scatter</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-[#5d2a42] tracking-tight">
            Dashboard Options &amp; Modules
          </h2>
          <p className="text-sm sm:text-base text-[#5d2a42]/85 font-semibold leading-relaxed">
            Click the envelope below to open it and scatter all clinical workspace modules into an interactive floating physics world. Select any module to open it.
          </p>
        </div>

        {/* Prominent Centered FolderFloat Envelope Component */}
        <div className="relative z-30 my-6 flex flex-col items-center">
          <FolderFloat
            items={FOLDER_ITEMS}
            label="Explore Modules"
            sublabel="Click to scatter dashboard options"
            trigger="click"
            physics={true}
            drift={0.6}
            width={260}
            height={180}
            spread={240}
            lift={42}
            folderColor="#5d2a42"
            frontColor="#d8e2dc"
            paperColor="#fff9ec"
            itemColor="#ffdccc"
            itemTextColor="#5d2a42"
            labelColor="#5d2a42"
            onSelect={handlePillSelect}
          />
        </div>

        <p className="text-xs text-[#5d2a42]/70 font-bold mt-12 flex items-center gap-1.5">
          <Sparkle className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>Interactive Matter-JS Physics Enabled · Drag &amp; Throw Pills</span>
        </p>
      </section>
    </div>
  );
}
