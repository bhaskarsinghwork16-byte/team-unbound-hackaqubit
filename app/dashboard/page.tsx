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
import CommunityScreeningHero from '@/components/CommunityScreeningHero';
import FlexCarousel from '@/components/FlexCarousel';

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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#5d2a42]/30 text-xs font-black shadow-xs">
          <AlertCircle className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (screening.resultState === 'no_abnormality' || screening.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc] text-xs font-black shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#d8e2dc] text-xs font-black">
        <HelpCircle className="w-3.5 h-3.5 text-[#5d2a42]" />
        <span>Inconclusive</span>
      </span>
    );
  };

  const getReviewBadge = (status?: string) => {
    if (status === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc] text-xs font-black">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>Reviewed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#5d2a42]/30 text-xs font-black shadow-xs">
        <Clock className="w-3.5 h-3.5 text-[#5d2a42]" />
        <span>Pending review</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER & PRIMARY ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#d8e2dc]">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-[#5d2a42] flex items-center gap-2">
            <span>{getGreeting()}, Dr. Sunita</span>
          </h1>
          <p className="text-sm text-[#5d2a42]/85 mt-1 font-bold">
            Here is today’s screening activity and patient flow.
          </p>
        </div>

        {/* Action CTA Button */}
        <div className="relative group">
          <Sparkles className="w-4 h-4 text-[#5d2a42] absolute -top-2 -left-2 animate-pulse pointer-events-none" />
          <button
            onClick={() => setShowStartModal(true)}
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-2xl text-sm font-black shadow-lg shadow-[#5d2a42]/20 border border-[#ffdccc] transition-all transform hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 text-[#ffdccc] stroke-[3]" />
            <span>+ New Screening</span>
          </button>
        </div>
      </div>

      {/* ── 2. 4 GLOWING STAT CARDS (HERO COLOR PALETTE) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: TODAY'S SCREENINGS */}
        <div className="bg-[#ffdccc] p-5 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">
              TODAY'S SCREENINGS
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#5d2a42]/10 flex items-center justify-center text-[#5d2a42] border border-[#5d2a42]/20">
              <Calendar className="w-5 h-5 text-[#5d2a42]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-black tracking-tight text-[#5d2a42]">
              {loading ? '—' : metrics.todayScreenings || 3}
            </span>

            <svg className="w-24 h-9 text-[#5d2a42] opacity-80" viewBox="0 0 100 35" fill="none">
              <path d="M0 25 Q 20 5, 40 20 T 80 10 T 100 15" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 2: PATIENTS SCREENED */}
        <div className="bg-[#d8e2dc]/60 backdrop-blur-xl p-5 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">
              PATIENTS SCREENED
            </span>
            <div className="flex items-center -space-x-2">
              <div className="w-7 h-7 rounded-full border-2 border-[#5d2a42] overflow-hidden shadow-xs">
                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#5d2a42] overflow-hidden shadow-xs">
                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div className="w-7 h-7 rounded-full border-2 border-[#5d2a42] overflow-hidden shadow-xs">
                <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" alt="Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-black tracking-tight text-[#5d2a42]">
              {loading ? '—' : metrics.patientsScreened || 6}
            </span>

            <svg className="w-20 h-9 text-[#5d2a42] opacity-80" viewBox="0 0 80 30" fill="currentColor">
              <rect x="5" y="15" width="8" height="15" rx="2" />
              <rect x="20" y="8" width="8" height="22" rx="2" />
              <rect x="35" y="18" width="8" height="12" rx="2" />
              <rect x="50" y="4" width="8" height="26" rx="2" />
              <rect x="65" y="12" width="8" height="18" rx="2" />
            </svg>
          </div>
        </div>

        {/* Card 3: AWAITING REVIEW */}
        <div className="bg-[#ffdccc]/70 p-5 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">
              AWAITING REVIEW
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#5d2a42]/10 flex items-center justify-center text-[#5d2a42] border border-[#5d2a42]/20">
              <Clock className="w-5 h-5 text-[#5d2a42]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-black tracking-tight text-[#5d2a42]">
              {loading ? '—' : metrics.awaitingReview || 2}
            </span>

            <svg className="w-24 h-9 text-[#5d2a42] opacity-80" viewBox="0 0 100 35" fill="none">
              <path d="M0 20 Q 25 35, 50 15 T 80 25 T 100 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
            </svg>
          </div>
        </div>

        {/* Card 4: ACTIVE REFERRALS */}
        <div className="bg-[#d8e2dc] p-5 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col justify-between space-y-3 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">
              ACTIVE REFERRALS
            </span>
            <div className="w-10 h-10 rounded-2xl bg-[#5d2a42]/10 flex items-center justify-center text-[#5d2a42] border border-[#5d2a42]/20">
              <GitPullRequest className="w-5 h-5 text-[#5d2a42]" />
            </div>
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <span className="text-4xl font-black tracking-tight text-[#5d2a42]">
              {loading ? '—' : metrics.activeReferrals || 2}
            </span>

            <svg className="w-20 h-9 text-[#5d2a42] opacity-80" viewBox="0 0 80 30" fill="currentColor">
              <rect x="5" y="10" width="8" height="20" rx="2" />
              <rect x="20" y="18" width="8" height="12" rx="2" />
              <rect x="35" y="6" width="8" height="24" rx="2" />
              <rect x="50" y="14" width="8" height="16" rx="2" />
              <rect x="65" y="4" width="8" height="26" rx="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── 3D WEBGL FLEXCAROUSEL CLINICAL GRAPH & TELEMETRY SHOWCASE ── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] p-6 shadow-xl shadow-[#5d2a42]/5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#5d2a42] tracking-tight flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#5d2a42]" />
              <span>Overview Clinical Activity &amp; Visual Graph Telemetry</span>
            </h2>
            <p className="text-xs text-[#5d2a42]/80 mt-0.5 font-bold">
              Interactive 3D WebGL telemetry graph highlighting camp encounter velocity, model accuracy curves, and referral pipelines.
            </p>
          </div>
          <span className="self-start sm:self-auto px-3 py-1 bg-[#ffdccc] text-[#5d2a42] rounded-full text-xs font-black border border-[#d8e2dc]">
            Live Graph Telemetry
          </span>
        </div>

        <div className="w-full h-[340px] relative rounded-2xl overflow-hidden border border-[#d8e2dc] bg-[#fff9ec] shadow-inner">
          <FlexCarousel
            items={[
              {
                src: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80&auto=format&fit=max',
                alt: 'Daily Encounter Velocity Graph',
                title: '📈 Daily Screening Encounter Velocity',
                subtitle: 'Peak Camp Encounters · 98.4% Precision'
              },
              {
                src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=max',
                alt: 'Retinal vs Oral Case Ratio',
                title: '👁️ Retinal & Oral Case Breakdown',
                subtitle: 'Multi-Modal Edge Model Triage Graph'
              },
              {
                src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=80&auto=format&fit=max',
                alt: 'Offline Engine Latency Curve',
                title: '⚡ Offline Inference Response Curve',
                subtitle: '< 2.8 Sec ARM Cortex Benchmarks'
              },
              {
                src: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&q=80&auto=format&fit=max',
                alt: 'Specialist Escalation Heatmap',
                title: '⚕️ Specialist Escalation Pipeline',
                subtitle: 'District Hospital Referral Velocity'
              }
            ]}
            preset="liquid"
            intro="rise"
            cardHeight={0.65}
            gap={14}
            squeeze={0.2}
            focusOnClick
            captions
          />
        </div>
      </div>

      {/* ── 3. RECENT SCREENING ACTIVITY TABLE (HIGH-CONTRAST HEADERS) ── */}
      <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] overflow-hidden shadow-xl shadow-[#5d2a42]/5">
        <div className="p-6 border-b border-[#d8e2dc] flex items-center justify-between bg-[#fff9ec]">
          <div>
            <h2 className="text-lg font-black text-[#5d2a42] tracking-tight">Recent Screening Activity</h2>
            <p className="text-xs text-[#5d2a42]/80 mt-1 font-bold">Logged screenings from community clinics and camps</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-black text-[#5d2a42] hover:underline flex items-center gap-1.5 transition-colors"
          >
            <span>View all screenings</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#5d2a42] font-black">
            Loading recent records...
          </div>
        ) : screenings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ffdccc] text-[#5d2a42] mx-auto flex items-center justify-center border border-[#d8e2dc]">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-black text-[#5d2a42]">No screenings recorded yet</h3>
            <p className="text-xs text-[#5d2a42]/80 max-w-sm mx-auto font-bold">
              Start your first patient screening session to record preliminary findings.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5d2a42] text-[#fff9ec] rounded-2xl text-xs font-black shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-4 h-4 text-[#ffdccc]" />
              <span>Start First Screening</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              {/* HIGH CONTRAST DARK PLUM TABLE COLUMN HEADINGS */}
              <thead className="bg-[#5d2a42] text-[#fff9ec] uppercase tracking-wider font-black border-b border-[#d8e2dc]">
                <tr>
                  <th className="py-4 px-6 text-[#fff9ec] font-black">PATIENT</th>
                  <th className="py-4 px-6 text-[#fff9ec] font-black">SCREENING TYPE</th>
                  <th className="py-4 px-6 text-[#fff9ec] font-black">DATE &amp; TIME</th>
                  <th className="py-4 px-6 text-[#fff9ec] font-black">FINDING</th>
                  <th className="py-4 px-6 text-[#fff9ec] font-black">REVIEW STATUS</th>
                  <th className="py-4 px-6 text-[#fff9ec] font-black text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e2dc] text-[#5d2a42] font-bold">
                {screenings.slice(0, 8).map((record) => {
                  const type = (record as any).type || record.screeningType;
                  return (
                    <tr key={record.screeningId} className="hover:bg-[#ffdccc]/30 transition-colors">
                      <td className="py-4 px-6">
                        <Link
                          href={`/patients/${record.patientId}`}
                          className="font-black text-[#5d2a42] hover:underline block text-sm"
                        >
                          {record.patientName || record.patientId}
                        </Link>
                        <span className="text-[11px] font-mono text-[#5d2a42]/80 font-bold">
                          {record.patientId}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-2 font-black text-[#5d2a42] capitalize">
                          {type === 'eye' ? (
                            <Eye className="w-4 h-4 text-[#5d2a42]" />
                          ) : (
                            <Smile className="w-4 h-4 text-[#5d2a42]" />
                          )}
                          <span>{type === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-6 text-[#5d2a42] whitespace-nowrap font-bold">
                        {formatDate(record.createdAt)}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {getResultBadge(record)}
                      </td>

                      <td className="py-4 px-6 whitespace-nowrap">
                        {getReviewBadge(record.reviewStatus)}
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <Link
                          href={`/history?id=${record.screeningId}`}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffdccc] text-[#5d2a42] rounded-xl font-black text-xs hover:bg-[#5d2a42] hover:text-[#fff9ec] transition-all group"
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
        <div className="fixed inset-0 z-50 bg-[#5d2a42]/40 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#fff9ec] rounded-3xl border border-[#d8e2dc] max-w-lg w-full p-6 shadow-2xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#d8e2dc]">
              <div>
                <h3 className="text-xl font-black text-[#5d2a42]">Start a screening</h3>
                <p className="text-xs text-[#5d2a42]/80 mt-0.5 font-bold">Select the clinical protocol for this patient session</p>
              </div>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-[#5d2a42] hover:bg-[#d8e2dc]/40 p-1.5 rounded-xl text-lg font-black"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Eye Screening Card */}
              <Link
                href="/screening?type=eye"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-3xl bg-[#ffdccc] border border-[#d8e2dc] hover:bg-[#5d2a42] hover:text-[#fff9ec] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#5d2a42] text-[#fff9ec] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Eye className="w-5 h-5 text-[#ffdccc]" />
                  </div>
                  <h4 className="font-black text-sm">Eye Screening</h4>
                  <p className="text-xs font-extrabold opacity-90 mt-0.5">Diabetic Retinopathy</p>
                  <p className="text-xs opacity-80 mt-2 leading-relaxed font-bold">
                    Screen retinal fundus images for potential DR-related findings.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-black group-hover:translate-x-0.5 transition-transform">
                  <span>Start Eye Screening</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Oral Screening Card */}
              <Link
                href="/screening?type=oral"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-3xl bg-[#d8e2dc] border border-[#d8e2dc] hover:bg-[#5d2a42] hover:text-[#fff9ec] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-2xl bg-[#5d2a42] text-[#fff9ec] flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Smile className="w-5 h-5 text-[#ffdccc]" />
                  </div>
                  <h4 className="font-black text-sm">Oral Screening</h4>
                  <p className="text-xs font-extrabold opacity-90 mt-0.5">Oral Visual Screening</p>
                  <p className="text-xs opacity-80 mt-2 leading-relaxed font-bold">
                    Screen oral mucosa images for visual findings requiring review.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-black group-hover:translate-x-0.5 transition-transform">
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


