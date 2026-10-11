'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  LayoutDashboard,
  Eye,
  Smile,
  Users,
  GitPullRequest,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Database,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  FileText,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';

export default function CommunityScreeningHero() {
  const [activeTab, setActiveTab] = useState<'eye' | 'oral'>('eye');

  return (
    <div id="hero" className="w-full bg-[#fff9ec] text-[#5d2a42] px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* ── HERO SECTION: 2-COLUMN BALANCED HEALTHCARE LAYOUT ── */}
      <section className="py-12 sm:py-16 lg:py-20 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* ── LEFT COLUMN: HEADLINE, DESCRIPTION, CTAS & CAPABILITY BAR ── */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Platform Label */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ffdccc]/70 border border-[#d8e2dc] text-xs font-bold text-[#5d2a42]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#5d2a42]" />
              <span>HealthScreen AI · Community Health Platform</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#5d2a42] leading-[1.18]">
              Early Disease Detection for Community Healthcare
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-[#5d2a42]/85 leading-relaxed font-normal max-w-2xl">
              An offline-first clinical decision support system empowering frontline health workers to perform preliminary screening for diabetic retinopathy and oral mucosal lesions in remote and low-resource settings.
            </p>

            {/* Primary & Secondary Calls to Action */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                href="/dashboard"
                id="hero-cta-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-xl text-sm font-bold shadow-sm transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#ffdccc]" />
                <span>Enter Clinical Dashboard</span>
                <ArrowRight className="w-4 h-4 text-[#ffdccc]" />
              </Link>

              <Link
                href="/screening"
                id="hero-cta-screening"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-white hover:bg-[#fff9ec] border border-[#d8e2dc] text-[#5d2a42] rounded-xl text-sm font-bold shadow-xs transition-colors"
              >
                <Eye className="w-4 h-4 text-[#5d2a42]" />
                <span>Start Patient Screening</span>
              </Link>
            </div>

            {/* Grounded Capability & Trust Indicator */}
            <div className="pt-4 border-t border-[#d8e2dc]/60 grid grid-cols-3 gap-4 max-w-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5d2a42]">
                  <Cpu className="w-3.5 h-3.5 text-[#5d2a42]" />
                  <span>100% Offline</span>
                </div>
                <p className="text-[11px] text-[#5d2a42]/70 font-medium leading-tight">
                  Local INT8 neural inference on camp tablets
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5d2a42]">
                  <Layers className="w-3.5 h-3.5 text-[#5d2a42]" />
                  <span>Dual Modality</span>
                </div>
                <p className="text-[11px] text-[#5d2a42]/70 font-medium leading-tight">
                  Retinal fundus &amp; oral mucosal evaluation
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5d2a42]">
                  <Database className="w-3.5 h-3.5 text-[#5d2a42]" />
                  <span>Encrypted Store</span>
                </div>
                <p className="text-[11px] text-[#5d2a42]/70 font-medium leading-tight">
                  Protected local patient data &amp; records
                </p>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: CLEAN SCREENING INTERFACE PREVIEW CARD ── */}
          <div className="lg:col-span-5 w-full">
            <div className="bg-white rounded-2xl border border-[#d8e2dc] shadow-md overflow-hidden">
              
              {/* Encounter Header Bar */}
              <div className="px-5 py-3.5 bg-[#fdfbf7] border-b border-[#d8e2dc] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-xs font-extrabold text-[#5d2a42] tracking-tight">
                    Encounter #DR-2026-084
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[#5d2a42]/75 font-semibold">
                  <span className="px-2 py-0.5 rounded bg-[#ffdccc]/70 text-[#5d2a42] font-bold">
                    Field Camp Mode
                  </span>
                </div>
              </div>

              {/* Modality Selector Tabs */}
              <div className="px-5 pt-4">
                <div className="flex items-center gap-2 p-1 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]/80">
                  <button
                    onClick={() => setActiveTab('eye')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === 'eye'
                        ? 'bg-[#5d2a42] text-[#fff9ec] shadow-xs'
                        : 'text-[#5d2a42]/80 hover:text-[#5d2a42]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Diabetic Retinopathy</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('oral')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                      activeTab === 'oral'
                        ? 'bg-[#5d2a42] text-[#fff9ec] shadow-xs'
                        : 'text-[#5d2a42]/80 hover:text-[#5d2a42]'
                    }`}
                  >
                    <Smile className="w-3.5 h-3.5" />
                    <span>Oral Mucosal Lesion</span>
                  </button>
                </div>
              </div>

              {/* Card Body: Realistic Triage Encounter Data */}
              <div className="p-5 space-y-4">
                
                {/* Visual Inspection Preview Area */}
                <div className="rounded-xl border border-[#d8e2dc] bg-[#fff9ec]/60 p-4 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-extrabold text-[#5d2a42]">
                      {activeTab === 'eye' ? 'Retinal Fundus Image · Right Eye (OD)' : 'Oral Mucosa · Right Buccal Cavity'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Quality Check: Passed</span>
                    </span>
                  </div>

                  {/* Anatomical / Inspection Matrix Display */}
                  <div className="p-3 bg-white rounded-lg border border-[#d8e2dc]/80 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#5d2a42]/80">
                      <span>Sharpness Score (Laplacian)</span>
                      <span className="font-bold text-[#5d2a42]">91.4 / 100</span>
                    </div>
                    <div className="w-full bg-[#d8e2dc]/50 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#5d2a42] h-1.5 rounded-full" style={{ width: '91.4%' }} />
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      <div className="flex items-center justify-between px-2 py-1 bg-[#fff9ec] rounded border border-[#d8e2dc]/60">
                        <span className="text-[#5d2a42]/70 font-medium">Illumination:</span>
                        <span className="font-bold text-[#5d2a42]">Optimal</span>
                      </div>
                      <div className="flex items-center justify-between px-2 py-1 bg-[#fff9ec] rounded border border-[#d8e2dc]/60">
                        <span className="text-[#5d2a42]/70 font-medium">Field Focus:</span>
                        <span className="font-bold text-[#5d2a42]">Centered</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Screening Findings Box */}
                <div className="p-4 rounded-xl bg-[#ffdccc]/30 border border-[#ffdccc] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-[#5d2a42]">
                      Preliminary AI Assessment
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-bold">
                      <AlertTriangle className="w-3 h-3 text-amber-700" />
                      <span>{activeTab === 'eye' ? 'Moderate Finding' : 'Mild Leukoplakic Area'}</span>
                    </span>
                  </div>

                  <p className="text-xs text-[#5d2a42]/90 leading-relaxed font-medium">
                    {activeTab === 'eye'
                      ? 'Microaneurysms detected in temporal periphery; early dot hemorrhages suspected. Recommend formal ophthalmic evaluation within 30 days.'
                      : 'Circumscribed whitish plaque identified on mucosal border without deep induration. Recommend specialist clinical examination.'}
                  </p>

                  <div className="pt-2 border-t border-[#5d2a42]/10 flex items-center justify-between text-[11px] font-bold text-[#5d2a42]/80">
                    <span className="flex items-center gap-1">
                      <Cpu className="w-3 h-3 text-[#5d2a42]" />
                      <span>INT8 MobileNetV3</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#5d2a42]" />
                      <span>Local Inference: 2.1s</span>
                    </span>
                  </div>
                </div>

                {/* Next Step Action in Preview */}
                <div className="pt-1 flex items-center justify-between text-xs">
                  <span className="text-[#5d2a42]/75 font-semibold">
                    Referral Status: <strong className="text-[#5d2a42]">District Hospital Queue</strong>
                  </span>
                  <Link
                    href={activeTab === 'eye' ? '/screening?type=eye' : '/screening?type=oral'}
                    className="inline-flex items-center gap-1 font-bold text-[#5d2a42] hover:underline"
                  >
                    <span>Open Module</span>
                    <ArrowRight className="w-3 h-3 text-[#5d2a42]" />
                  </Link>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── SEGMENT 2: CLINICAL WORKFLOWS & PLATFORM MODULES ── */}
      <section id="modules" className="py-16 sm:py-20 border-t border-[#d8e2dc]/70">
        
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdccc]/70 border border-[#d8e2dc] text-xs font-bold text-[#5d2a42]">
            <Activity className="w-3.5 h-3.5 text-[#5d2a42]" />
            <span>Clinical Screening Workflows</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#5d2a42] tracking-tight">
            Purpose-Built for Frontline Health Camps
          </h2>

          <p className="text-sm sm:text-base text-[#5d2a42]/85 leading-relaxed font-normal">
            Streamlined tools designed for community health workers to capture visual findings, perform automated quality assurance, and escalate cases.
          </p>
        </div>

        {/* 4-Card Module Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Diabetic Retinopathy */}
          <div className="bg-white rounded-2xl border border-[#d8e2dc] p-6 flex flex-col justify-between shadow-xs hover:border-[#5d2a42]/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold">
                <Eye className="w-5 h-5 text-[#ffdccc]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-[#5d2a42]">
                  Diabetic Retinopathy
                </h3>
                <p className="text-xs text-[#5d2a42]/80 leading-relaxed font-medium">
                  Automated preliminary triage of fundus examinations for microaneurysms, hemorrhages, and vascular exudates.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/screening?type=eye"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#fff9ec] hover:bg-[#ffdccc]/50 text-xs font-bold text-[#5d2a42] border border-[#d8e2dc] transition-colors"
              >
                <span>Launch DR Screener</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5d2a42]" />
              </Link>
            </div>
          </div>

          {/* Card 2: Oral Mucosal Screening */}
          <div className="bg-white rounded-2xl border border-[#d8e2dc] p-6 flex flex-col justify-between shadow-xs hover:border-[#5d2a42]/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold">
                <Smile className="w-5 h-5 text-[#ffdccc]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-[#5d2a42]">
                  Oral Mucosal Lesions
                </h3>
                <p className="text-xs text-[#5d2a42]/80 leading-relaxed font-medium">
                  Torchlight-optimized visual screening for suspicious leukoplakia, erythroplakia, and mucosal abnormalities.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/screening?type=oral"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#fff9ec] hover:bg-[#ffdccc]/50 text-xs font-bold text-[#5d2a42] border border-[#d8e2dc] transition-colors"
              >
                <span>Launch Oral Screener</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5d2a42]" />
              </Link>
            </div>
          </div>

          {/* Card 3: Patient Directory */}
          <div className="bg-white rounded-2xl border border-[#d8e2dc] p-6 flex flex-col justify-between shadow-xs hover:border-[#5d2a42]/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold">
                <Users className="w-5 h-5 text-[#ffdccc]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-[#5d2a42]">
                  Patient Directory
                </h3>
                <p className="text-xs text-[#5d2a42]/80 leading-relaxed font-medium">
                  Longitudinal patient profiles, screening history, and local records stored securely on the field unit.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/patients"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#fff9ec] hover:bg-[#ffdccc]/50 text-xs font-bold text-[#5d2a42] border border-[#d8e2dc] transition-colors"
              >
                <span>Open Directory</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5d2a42]" />
              </Link>
            </div>
          </div>

          {/* Card 4: Specialist Referrals */}
          <div className="bg-white rounded-2xl border border-[#d8e2dc] p-6 flex flex-col justify-between shadow-xs hover:border-[#5d2a42]/40 transition-colors">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center font-bold">
                <GitPullRequest className="w-5 h-5 text-[#ffdccc]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-black text-[#5d2a42]">
                  Specialist Referrals
                </h3>
                <p className="text-xs text-[#5d2a42]/80 leading-relaxed font-medium">
                  Direct escalation protocols connecting camp findings with district ophthalmology and oncology departments.
                </p>
              </div>
            </div>

            <div className="pt-6">
              <Link
                href="/referrals"
                className="inline-flex items-center justify-between w-full px-3.5 py-2.5 rounded-xl bg-[#fff9ec] hover:bg-[#ffdccc]/50 text-xs font-bold text-[#5d2a42] border border-[#d8e2dc] transition-colors"
              >
                <span>Manage Referrals</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#5d2a42]" />
              </Link>
            </div>
          </div>

        </div>

        {/* ── TECHNICAL & CLINICAL BENCHMARKS STRIP ── */}
        <div className="mt-12 bg-white rounded-2xl border border-[#d8e2dc] p-6 sm:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#5d2a42]" />
                <h4 className="text-sm font-black text-[#5d2a42]">Offline Edge Inference</h4>
              </div>
              <p className="text-xs text-[#5d2a42]/80 font-medium leading-relaxed">
                Zero cloud latency during screening. Runs quantized INT8 models locally on consumer field laptops and tablets without internet access.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#5d2a42]" />
                <h4 className="text-sm font-black text-[#5d2a42]">Research Cohort Validation</h4>
              </div>
              <p className="text-xs text-[#5d2a42]/80 font-medium leading-relaxed">
                Trained and evaluated on established cohorts including Kaggle APTOS 2019, Messidor-2, and verified oral lesion datasets.
              </p>
              <Link href="/datasets" className="inline-flex items-center gap-1 text-[11px] font-bold text-[#5d2a42] hover:underline">
                <span>View Dataset Documentation</span>
                <ArrowRight className="w-3 h-3 text-[#5d2a42]" />
              </Link>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#5d2a42]" />
                <h4 className="text-sm font-black text-[#5d2a42]">Field Data Protection</h4>
              </div>
              <p className="text-xs text-[#5d2a42]/80 font-medium leading-relaxed">
                Local-first encrypted storage ensures patient privacy is preserved in camp environments before asynchronous synchronization.
              </p>
            </div>

          </div>
        </div>

      </section>

    </div>
  );
}
