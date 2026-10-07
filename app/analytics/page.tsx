'use client';

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  RotateCcw, 
  ShieldCheck, 
  Activity, 
  Layers, 
  Cpu,
  Eye,
  Stethoscope
} from 'lucide-react';
import { AnalyticsSummary } from '@/types';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setAnalytics(data.data);
        }
      })
      .catch((err) => console.error('Failed fetching analytics:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Clinical & Technical Analytics</h1>
        <p className="text-xs text-slate-500">
          Aggregated directly from stored screening records in MongoDB and local field queue.
        </p>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-xs text-slate-500">
          Aggregating field screening data...
        </div>
      ) : !analytics || !analytics.isRealDataPresent || analytics.screeningsTotal === 0 ? (
        /* Honest empty state per Phase 26 */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <BarChart3 className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No screening data available yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Field analytics will populate automatically as soon as patient screenings are completed and saved to the database.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Level KPIs (Actual counts, Phase 26) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Screenings</span>
              <div className="text-2xl font-black text-slate-900">{analytics.screeningsTotal}</div>
              <span className="text-[10px] text-teal-700 font-semibold">Database Records</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Retina (DR)</span>
              <div className="text-2xl font-black text-blue-700">{analytics.retinaScreenings}</div>
              <span className="text-[10px] text-slate-500 font-medium">Fundus Captures</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Oral Cavity</span>
              <div className="text-2xl font-black text-teal-700">{analytics.oralScreenings}</div>
              <span className="text-[10px] text-slate-500 font-medium">Mucosal Triage</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Reviews Advised</span>
              <div className="text-2xl font-black text-rose-600">{analytics.reviewRecommendations}</div>
              <span className="text-[10px] text-rose-700 font-semibold">Higher-Risk Triage</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">IQA Failures</span>
              <div className="text-2xl font-black text-amber-600">{analytics.qualityFailures}</div>
              <span className="text-[10px] text-amber-700 font-semibold">Blur / Dim Stopped</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Average Quality</span>
              <div className="text-2xl font-black text-emerald-600">{analytics.averageImageQuality}%</div>
              <span className="text-[10px] text-emerald-700 font-semibold">Clarity Index</span>
            </div>
          </div>

          {/* Screening Outcomes & Daily Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Volume Breakdown */}
            <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Screening Activity by Date</h3>
                  <p className="text-[11px] text-slate-500">Aggregated from genuine creation timestamps</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold">
                  <span className="flex items-center gap-1.5 text-blue-700">
                    <span className="w-2.5 h-2.5 rounded bg-blue-600"></span> Eye DR
                  </span>
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="w-2.5 h-2.5 rounded bg-teal-600"></span> Oral Mucosa
                  </span>
                </div>
              </div>

              {analytics.volumeByDay.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                  No dated records available yet
                </div>
              ) : (
                <div className="pt-4 flex items-end justify-between gap-4 h-48 border-b border-slate-100">
                  {analytics.volumeByDay.map((item, idx) => {
                    const total = item.eye + item.oral;
                    const maxCount = Math.max(...analytics.volumeByDay.map(d => d.eye + d.oral), 5);
                    const eyeHeight = Math.max(8, Math.round((item.eye / maxCount) * 140));
                    const oralHeight = Math.max(8, Math.round((item.oral / maxCount) * 140));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center gap-1.5 h-40">
                          <div
                            className="w-3.5 bg-blue-600 rounded-t-sm transition-all"
                            style={{ height: `${eyeHeight}px` }}
                            title={`Eye: ${item.eye}`}
                          ></div>
                          <div
                            className="w-3.5 bg-teal-600 rounded-t-sm transition-all"
                            style={{ height: `${oralHeight}px` }}
                            title={`Oral: ${item.oral}`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 truncate max-w-[4rem] text-center">
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outcomes Triage Ratio */}
            <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Screening Outcome Triage</h3>
                <p className="text-[11px] text-slate-500">Distribution across actual clinical categories</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No Obvious Abnormality</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-900">
                    {analytics.outcomesBreakdown.lowerRisk}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/60 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Clinical Review Recommended</span>
                  </div>
                  <span className="text-sm font-extrabold text-rose-900">
                    {analytics.outcomesBreakdown.higherRisk}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-semibold text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Inconclusive / Retake Advised</span>
                  </div>
                  <span className="text-sm font-extrabold text-amber-900">
                    {analytics.outcomesBreakdown.inconclusive}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
