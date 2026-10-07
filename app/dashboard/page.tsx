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
  Search,
  Filter,
  Calendar
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

  // Time-aware greeting
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
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (screening.resultState === 'no_abnormality' || screening.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        <span>Inconclusive</span>
      </span>
    );
  };

  const getReviewBadge = (status?: string) => {
    if (status === 'reviewed') {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          <span>Reviewed</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700">
        <Clock className="w-3.5 h-3.5 text-amber-600" />
        <span>Pending review</span>
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER & PRIMARY ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, Dr. Sunita
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is today’s screening activity and patient flow.
          </p>
        </div>

        <button
          onClick={() => setShowStartModal(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Screening</span>
        </button>
      </div>

      {/* ── START SCREENING SELECTION MODAL ── */}
      {showStartModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Start a screening</h3>
                <p className="text-xs text-slate-500 mt-0.5">Select the protocol for this patient session</p>
              </div>
              <button
                onClick={() => setShowStartModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Eye Screening Card */}
              <Link
                href="/screening?type=eye"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Eye className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">Eye Screening</h4>
                  <p className="text-xs text-teal-700 font-medium mt-0.5">Diabetic Retinopathy</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Screen retinal images for potential DR-related findings.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Eye Screening</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>

              {/* Oral Screening Card */}
              <Link
                href="/screening?type=oral"
                onClick={() => setShowStartModal(false)}
                className="group p-5 rounded-lg border border-slate-200 hover:border-teal-600 hover:bg-teal-50/30 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                    <Smile className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-slate-900 text-sm">Oral Screening</h4>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">Oral Visual Screening</p>
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    Screen oral images for visual findings requiring further review.
                  </p>
                </div>
                <div className="mt-4 flex items-center text-xs font-semibold text-teal-600 group-hover:translate-x-0.5 transition-transform">
                  <span>Start Oral Screening</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── REAL DATABASE METRICS STRIP ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today&apos;s screenings</span>
            <Calendar className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '—' : metrics.todayScreenings}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Screened today at this facility</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Patients screened</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '—' : metrics.patientsScreened}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Unique patients on record</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Awaiting review</span>
            <ClipboardCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-amber-700">
              {loading ? '—' : metrics.awaitingReview}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pending clinical verification</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Referrals</span>
            <GitPullRequest className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {loading ? '—' : metrics.activeReferrals}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Referred for specialist care</p>
        </div>
      </div>

      {/* ── RECENT ACTIVITY TABLE (REAL DB DATA) ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Screening Activity</h2>
            <p className="text-xs text-slate-500 mt-0.5">Logged screenings from community clinics and camps</p>
          </div>
          <Link
            href="/history"
            className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
          >
            <span>View all screenings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            Loading recent records...
          </div>
        ) : screenings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No screenings recorded yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start your first patient screening session to record preliminary findings.
            </p>
            <button
              onClick={() => setShowStartModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs hover:bg-teal-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start First Screening</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Screening Type</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Finding</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {screenings.slice(0, 8).map((record) => {
                  const type = (record as any).type || record.screeningType;
                  return (
                    <tr key={record.screeningId} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          href={`/patients/${record.patientId}`}
                          className="font-semibold text-slate-900 hover:text-teal-700 block"
                        >
                          {record.patientName || record.patientId}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-500">
                          {record.patientId}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                          {type === 'eye' ? (
                            <Eye className="w-3.5 h-3.5 text-teal-600" />
                          ) : (
                            <Smile className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {type === 'eye' ? 'Eye screening' : 'Oral screening'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(record.createdAt)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getResultBadge(record)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getReviewBadge(record.reviewStatus)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <Link
                          href={`/history?id=${record.screeningId}`}
                          className="inline-flex items-center gap-1 text-teal-700 hover:text-teal-800 font-semibold text-xs"
                        >
                          <span>View</span>
                          <ArrowRight className="w-3 h-3" />
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
    </div>
  );
}
