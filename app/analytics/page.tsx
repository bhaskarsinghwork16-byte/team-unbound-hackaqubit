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
  Smile
} from 'lucide-react';
import { AnalyticsSummary } from '@/types';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  EmptyState
} from '@/components/ui';

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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-[#5d2a42] tracking-tight">Clinical & Technical Analytics</h1>
        <p className="text-xs text-[#5d2a42]/70 font-medium">
          Aggregated directly from stored screening records in MongoDB and local field queue.
        </p>
      </div>

      {loading ? (
        <div className="bg-white/90 rounded-2xl border border-[#d8e2dc] p-12 text-center text-xs text-[#5d2a42]/70 font-bold">
          Aggregating field screening data...
        </div>
      ) : !analytics || !analytics.isRealDataPresent || analytics.screeningsTotal === 0 ? (
        <div className="bg-white/90 rounded-2xl border border-[#d8e2dc] p-12 text-center space-y-3 shadow-sm">
          <BarChart3 className="w-10 h-10 text-[#5d2a42]/50 mx-auto" />
          <h3 className="text-base font-bold text-[#5d2a42]">No screening data available yet</h3>
          <p className="text-xs text-[#5d2a42]/70 max-w-sm mx-auto font-medium">
            Field analytics will populate automatically as soon as patient screenings are completed and saved to the database.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <div className="bg-[#fff9ec] p-4 rounded-xl border border-[#d8e2dc] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#5d2a42]/70 uppercase tracking-wider block">Total Screenings</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.screeningsTotal}</div>
              <span className="text-[10px] text-[#5d2a42] font-extrabold">Database Records</span>
            </div>

            <div className="bg-[#fff9ec] p-4 rounded-xl border border-[#d8e2dc] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#5d2a42]/70 uppercase tracking-wider block">Retina (DR)</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.retinaScreenings}</div>
              <span className="text-[10px] text-[#5d2a42]/70 font-bold">Fundus Captures</span>
            </div>

            <div className="bg-[#fff9ec] p-4 rounded-xl border border-[#d8e2dc] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#5d2a42]/70 uppercase tracking-wider block">Oral Cavity</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.oralScreenings}</div>
              <span className="text-[10px] text-[#5d2a42]/70 font-bold">Mucosal Triage</span>
            </div>

            <div className="bg-[#fec89a] p-4 rounded-xl border border-[#ffdccc] shadow-2xs space-y-1">
              <span className="text-[10px] font-black text-[#5d2a42] uppercase tracking-wider block">Reviews Advised</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.reviewRecommendations}</div>
              <span className="text-[10px] text-[#5d2a42] font-black">Higher-Risk Triage</span>
            </div>

            <div className="bg-[#ffdccc] p-4 rounded-xl border border-[#fec89a] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#5d2a42] uppercase tracking-wider block">IQA Failures</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.qualityFailures}</div>
              <span className="text-[10px] text-[#5d2a42] font-extrabold">Blur / Dim Stopped</span>
            </div>

            <div className="bg-[#d8e2dc] p-4 rounded-xl border border-[#c4d4cc] shadow-2xs space-y-1">
              <span className="text-[10px] font-bold text-[#5d2a42] uppercase tracking-wider block">Average Quality</span>
              <div className="text-2xl font-black text-[#5d2a42]">{analytics.averageImageQuality}%</div>
              <span className="text-[10px] text-[#5d2a42] font-extrabold">Clarity Index</span>
            </div>
          </div>

          {/* Screening Outcomes & Daily Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Volume Breakdown */}
            <div className="lg:col-span-7 bg-white/90 p-6 rounded-2xl border border-[#d8e2dc] shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-[#5d2a42]">Screening Activity by Date</h3>
                  <p className="text-[11px] text-[#5d2a42]/70 font-medium">Aggregated from genuine creation timestamps</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="flex items-center gap-1.5 text-[#5d2a42]">
                    <span className="w-2.5 h-2.5 rounded bg-[#5d2a42]"></span> Eye DR
                  </span>
                  <span className="flex items-center gap-1.5 text-[#5d2a42]">
                    <span className="w-2.5 h-2.5 rounded bg-[#ffdccc] border border-[#fec89a]"></span> Oral Mucosa
                  </span>
                </div>
              </div>

              {analytics.volumeByDay.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-xs text-[#5d2a42]/60 font-medium">
                  No dated records available yet
                </div>
              ) : (
                <div className="pt-4 flex items-end justify-between gap-4 h-48 border-b border-[#d8e2dc]">
                  {analytics.volumeByDay.map((item, idx) => {
                    const total = item.eye + item.oral;
                    const maxCount = Math.max(...analytics.volumeByDay.map(d => d.eye + d.oral), 5);
                    const eyeHeight = Math.max(8, Math.round((item.eye / maxCount) * 140));
                    const oralHeight = Math.max(8, Math.round((item.oral / maxCount) * 140));

                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex items-end justify-center gap-1.5 h-40">
                          <div
                            className="w-3.5 bg-[#5d2a42] rounded-t-sm transition-all"
                            style={{ height: `${eyeHeight}px` }}
                            title={`Eye: ${item.eye}`}
                          ></div>
                          <div
                            className="w-3.5 bg-[#ffdccc] border border-[#fec89a] rounded-t-sm transition-all"
                            style={{ height: `${oralHeight}px` }}
                            title={`Oral: ${item.oral}`}
                          ></div>
                        </div>
                        <span className="text-[10px] font-bold text-[#5d2a42]/70 truncate max-w-[4rem] text-center">
                          {item.date}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Outcomes Triage Ratio */}
            <div className="lg:col-span-5 bg-white/90 p-6 rounded-2xl border border-[#d8e2dc] shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#5d2a42]">Screening Outcome Triage</h3>
                <p className="text-[11px] text-[#5d2a42]/70 font-medium">Distribution across actual clinical categories</p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="p-3.5 rounded-xl border border-[#c4d4cc] bg-[#d8e2dc] flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5d2a42]">
                    <CheckCircle2 className="w-4 h-4 text-[#5d2a42]" />
                    <span>No Obvious Abnormality</span>
                  </div>
                  <span className="text-sm font-black text-[#5d2a42]">
                    {analytics.outcomesBreakdown.lowerRisk}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#ffdccc] bg-[#fec89a] flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-[#5d2a42]">
                    <AlertTriangle className="w-4 h-4 text-[#5d2a42]" />
                    <span>Clinical Review Recommended</span>
                  </div>
                  <span className="text-sm font-black text-[#5d2a42]">
                    {analytics.outcomesBreakdown.higherRisk}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-[#fec89a] bg-[#ffdccc] flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5d2a42]">
                    <AlertTriangle className="w-4 h-4 text-[#5d2a42]" />
                    <span>Inconclusive / Retake Advised</span>
                  </div>
                  <span className="text-sm font-black text-[#5d2a42]">
                    {analytics.outcomesBreakdown.inconclusive}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
