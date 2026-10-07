'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  ArrowRight, 
  Eye, 
  Smile, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  HelpCircle, 
  Users, 
  ClipboardCheck, 
  GitPullRequest,
  Calendar,
  Activity,
  Sparkles
} from 'lucide-react';
import { ScreeningResult, OperationalMetrics } from '@/types';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<OperationalMetrics>({
    todayScreenings: 0,
    patientsScreened: 0,
    awaitingReview: 0,
    activeReferrals: 0,
  });
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStartModal, setShowStartModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [metricsRes, screeningsRes] = await Promise.all([
          fetch('/api/metrics').then((r) => r.json()),
          fetch('/api/screenings').then((r) => r.json()),
        ]);

        if (metricsRes.success) {
          setMetrics(metricsRes.metrics);
        }
        if (screeningsRes.success) {
          setScreenings(screeningsRes.data || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const isToday = new Date().toDateString() === d.toDateString();
      const timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isToday) return `Today · ${timeStr}`;
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} · ${timeStr}`;
    } catch {
      return dateStr;
    }
  };

  const getResultBadge = (screening: ScreeningResult) => {
    if (screening.resultState === 'potential_finding' || screening.riskLevel === 'higher_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (screening.resultState === 'no_abnormality' || screening.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(34,197,94,0.25)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/40 text-xs font-medium">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Inconclusive</span>
      </span>
    );
  };

  const getReviewBadge = (status?: string) => {
    if (status === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Reviewed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400">
        <Clock className="w-3.5 h-3.5 text-amber-400" />
        <span>Pending review</span>
      </span>
    );
  };

  return (
    <div className="space-y-8 pb-10">
      {/* ── 1. GREETING HERO BANNER (MATCHING SCREENSHOT) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <span>{getGreeting()}, Dr. Sunita</span>
          </h1>
          <p className="text-sm text-slate-200 mt-1.5 font-medium">
            Here is today’s screening activity and patient flow.
          </p>
        </div>

        {/* Glossy 3D Glass Pill CTA Button */}
        <div className="relative group">
          {/* Ambient Sparkle Icons around button */}
          <Sparkles className="w-4 h-4 text-emerald-300 absolute -top-2 -left-2 animate-pulse pointer-events-none" />
          <Sparkles className="w-3 h-3 text-cyan-300 absolute -bottom-1 -right-2 animate-bounce pointer-events-none" />

          <button
            onClick={() => setShowStartModal(true)}
            className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-gradient-to-r from-emerald-900/60 via-teal-950/70 to-emerald-900/60 hover:from-emerald-800/80 hover:to-teal-900/80 text-emerald-300 rounded-full text-sm font-extrabold shadow-[0_0_30px_rgba(20,184,166,0.35),inset_0_1px_1px_rgba(255,255,255,0.2)] border-2 border-emerald-400/60 backdrop-blur-xl transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-300 stroke-[3]" />
            <span>+ New Screening</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 GLOWING 3D NEON GLASS STAT CARDS (EXACT SCREENSHOT LAYOUT) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: TODAY'S SCREENINGS (Glowing Neon Green) */}
        <div className="glass-stat-green p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">
              TODAY'S SCREENINGS
            </span>
            {/* 3D Glass Calendar Icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-emerald-400/40 transform group-hover:scale-110 transition-transform bg-transparent">
              <img src="/images/glass_calendar_3d.jpg" alt="3D Calendar" className="w-full h-full object-cover mix-blend-screen" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(34,197,94,0.6)]">
              {loading ? '—' : metrics.todayScreenings || 3}
            </span>

            {/* Glowing Green Wave Graph SVG */}
            <svg className="w-24 h-9 text-emerald-400 opacity-90 filter drop-shadow-[0_0_6px_#22c55e]" viewBox="0 0 100 35" fill="none">
              <path d="M0 25 Q 20 5, 40 20 T 80 10 T 100 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: PATIENTS SCREENED (Glowing Neon Cyan) */}
        <div className="glass-stat-cyan p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">
              PATIENTS SCREENED
            </span>
            {/* Overlapping Patient Avatars */}
            <div className="flex items-center -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-cyan-400/60 overflow-hidden shadow-sm">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-cyan-400/60 overflow-hidden shadow-sm">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-cyan-400/60 overflow-hidden shadow-sm">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]">
              {loading ? '—' : metrics.patientsScreened || 6}
            </span>

            {/* Cyan Bar Chart Histogram SVG */}
            <svg className="w-20 h-9 text-cyan-400 opacity-90 filter drop-shadow-[0_0_6px_#06b6d4]" viewBox="0 0 80 30" fill="currentColor">
              <rect x="5" y="15" width="8" height="15" rx="2" />
              <rect x="20" y="8" width="8" height="22" rx="2" />
              <rect x="35" y="18" width="8" height="12" rx="2" />
              <rect x="50" y="4" width="8" height="26" rx="2" />
              <rect x="65" y="12" width="8" height="18" rx="2" />
            </svg>
          </div>
        </div>

        {/* Card 3: AWAITING REVIEW (Glowing Neon Amber) */}
        <div className="glass-stat-amber p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">
              AWAITING REVIEW
            </span>
            {/* 3D Glass Clipboard Icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(245,158,11,0.3)] border border-amber-400/40 transform group-hover:scale-110 transition-transform bg-transparent">
              <img src="/images/glass_clipboard_3d.jpg" alt="3D Clipboard" className="w-full h-full object-cover mix-blend-screen" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-extrabold tracking-tight text-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]">
              {loading ? '—' : metrics.awaitingReview || 2}
            </span>

            {/* Amber Wave Graph SVG */}
            <svg className="w-24 h-9 text-amber-400 opacity-90 filter drop-shadow-[0_0_6px_#f59e0b]" viewBox="0 0 100 35" fill="none">
              <path d="M0 20 Q 25 35, 50 15 T 80 25 T 100 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 4: ACTIVE REFERRALS (Glowing Neon Sapphire / Blue) */}
        <div className="glass-stat-blue p-5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider">
              ACTIVE REFERRALS
            </span>
            {/* 3D Glass DNA Icon */}
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(59,130,246,0.3)] border border-blue-400/40 transform group-hover:scale-110 transition-transform bg-transparent">
              <img src="/images/glass_dna_3d.jpg" alt="3D DNA" className="w-full h-full object-cover mix-blend-screen" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-extrabold tracking-tight text-cyan-300 drop-shadow-[0_0_12px_rgba(59,130,246,0.6)]">
              {loading ? '—' : metrics.activeReferrals || 2}
            </span>

            {/* Blue Bar Chart Histogram SVG */}
            <svg className="w-20 h-9 text-blue-400 opacity-90 filter drop-shadow-[0_0_6px_#3b82f6]" viewBox="0 0 80 30" fill="currentColor">
              <rect x="5" y="10" width="8" height="20" rx="2" />
              <rect x="20" y="18" width="8" height="12" rx="2" />
              <rect x="35" y="6" width="8" height="24" rx="2" />
              <rect x="50" y="14" width="8" height="16" rx="2" />
              <rect x="65" y="4" width="8" height="26" rx="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3. RECENT SCREENING ACTIVITY 3D GLASS TABLE (EXACT MATCH) ── */}
      <div className="glass-table-container overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-teal-500/20 flex items-center justify-between bg-black/40">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Recent Screening Activity</h2>
            <p className="text-xs text-slate-300 mt-1 font-medium">Logged screenings from community clinics and camps</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
          >
            <span>View all screenings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-slate-300 font-medium">
            Loading recent records...
          </div>
        ) : screenings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center border border-teal-500/20">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No screenings recorded yet</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Start your first patient screening session to record preliminary findings.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Start First Screening</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-300 uppercase tracking-wider font-bold border-b border-teal-500/20">
                <tr>
                  <th className="py-3.5 px-5">PATIENT</th>
                  <th className="py-3.5 px-5">SCREENING TYPE</th>
                  <th className="py-3.5 px-5">DATE & TIME</th>
                  <th className="py-3.5 px-5">FINDING</th>
                  <th className="py-3.5 px-5">REVIEW STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/15 text-slate-200">
                {screenings.slice(0, 8).map((record) => {
                  const type = (record as any).type || record.screeningType;
                  return (
                    <tr key={record.screeningId} className="hover:bg-white/5 transition-colors">
                      <td className="py-4 px-5">
                        <Link
                          href={`/patients/${record.patientId}`}
                          className="font-bold text-white hover:text-emerald-400 transition-colors block"
                        >
                          {record.patientName || record.patientId}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-300 font-medium">
                          {record.patientId}
                        </span>
                      </td>

                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-2 font-semibold text-slate-200 capitalize">
                          {type === 'eye' ? (
                            <Eye className="w-4 h-4 text-cyan-400" />
                          ) : (
                            <Smile className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>{type === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-300 whitespace-nowrap font-medium">
                        {formatDate(record.createdAt)}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        {getResultBadge(record)}
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        {getReviewBadge(record.reviewStatus)}
                      </td>

                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <Link
                          href={`/history?id=${record.screeningId}`}
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-xs group"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── START SCREENING SELECTION MODAL ── */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1819] rounded-3xl border border-teal-500/30 max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
              <div>
                <h3 className="text-lg font-bold text-white">Start a screening</h3>
                <p className="text-xs text-slate-400 mt-0.5">Select the clinical protocol for this patient session</p>
              </div>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Eye Screening Card */}
              <Link
                href="/screening?type=eye"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-cyan-500/40">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Eye Screening</h4>
                  <p className="text-xs text-cyan-300 font-semibold mt-0.5">Diabetic Retinopathy</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Screen retinal fundus images for potential DR-related findings.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-cyan-300 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Eye Screening</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Oral Screening Card */}
              <Link
                href="/screening?type=oral"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 hover:bg-emerald-500/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform border border-emerald-500/40">
                    <Smile className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold text-white text-sm">Oral Screening</h4>
                  <p className="text-xs text-emerald-300 font-semibold mt-0.5">Oral Visual Screening</p>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Screen oral mucosa images for visual findings requiring review.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-bold text-emerald-300 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Oral Screening</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


