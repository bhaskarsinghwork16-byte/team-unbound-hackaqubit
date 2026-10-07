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
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info">Technical Analytics</Badge>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Clinical & Technical Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Aggregated directly from stored screening records in database storage and field queue.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Aggregating field screening data...
        </div>
      ) : !analytics || !analytics.isRealDataPresent || analytics.screeningsTotal === 0 ? (
        <EmptyState
          icon={BarChart3}
          title="No screening data available yet"
          description="Field analytics will populate automatically as soon as patient screenings are completed and saved to the database."
          actionLabel="+ New Screening"
          actionHref="/screening"
        />
      ) : (
        <div className="space-y-6">
          {/* Top Level KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Total Screenings</span>
                <div className="text-2xl font-bold text-slate-900">{analytics.screeningsTotal}</div>
                <span className="text-[10px] text-teal-700 font-medium">Database Records</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Retina (DR)</span>
                <div className="text-2xl font-bold text-teal-700">{analytics.retinaScreenings}</div>
                <span className="text-[10px] text-slate-500 font-medium">Fundus Captures</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Oral Cavity</span>
                <div className="text-2xl font-bold text-emerald-700">{analytics.oralScreenings}</div>
                <span className="text-[10px] text-slate-500 font-medium">Mucosal Triage</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Reviews Advised</span>
                <div className="text-2xl font-bold text-amber-600">{analytics.reviewRecommendations}</div>
                <span className="text-[10px] text-amber-700 font-medium">Higher-Risk Cases</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">IQA Failures</span>
                <div className="text-2xl font-bold text-rose-600">{analytics.qualityFailures}</div>
                <span className="text-[10px] text-rose-700 font-medium">Quality Filtered</span>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Average Quality</span>
                <div className="text-2xl font-bold text-teal-600">{analytics.averageImageQuality}%</div>
                <span className="text-[10px] text-teal-700 font-medium">Clarity Rating</span>
              </CardContent>
            </Card>
          </div>

          {/* Screening Outcomes & Daily Volume */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Volume Breakdown */}
            <Card className="lg:col-span-7">
              <CardHeader className="flex justify-between items-center pb-2">
                <div>
                  <CardTitle className="text-sm font-bold text-slate-900">Screening Activity by Date</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Aggregated from genuine creation timestamps</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <span className="flex items-center gap-1.5 text-teal-700">
                    <span className="w-2.5 h-2.5 rounded bg-teal-600"></span> Eye DR
                  </span>
                  <span className="flex items-center gap-1.5 text-emerald-700">
                    <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span> Oral Mucosa
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                {analytics.volumeByDay.length === 0 ? (
                  <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                    No dated records available yet
                  </div>
                ) : (
                  <div className="pt-4 flex items-end justify-between gap-4 h-48 border-b border-slate-100">
                    {analytics.volumeByDay.map((item, idx) => {
                      const maxCount = Math.max(...analytics.volumeByDay.map(d => d.eye + d.oral), 5);
                      const eyeHeight = Math.max(8, Math.round((item.eye / maxCount) * 140));
                      const oralHeight = Math.max(8, Math.round((item.oral / maxCount) * 140));

                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                          <div className="w-full flex items-end justify-center gap-1.5 h-40">
                            <div
                              className="w-3.5 bg-teal-600 rounded-t-sm transition-all"
                              style={{ height: `${eyeHeight}px` }}
                              title={`Eye: ${item.eye}`}
                            />
                            <div
                              className="w-3.5 bg-emerald-600 rounded-t-sm transition-all"
                              style={{ height: `${oralHeight}px` }}
                              title={`Oral: ${item.oral}`}
                            />
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 truncate max-w-[4rem] text-center">
                            {item.date}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Outcomes Triage Ratio */}
            <Card className="lg:col-span-5">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold text-slate-900">Screening Outcome Triage</CardTitle>
                <CardDescription className="text-xs text-slate-500">Distribution across actual clinical categories</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/60 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-900">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No Obvious Abnormality</span>
                  </div>
                  <span className="text-sm font-bold text-emerald-900">
                    {analytics.outcomesBreakdown.lowerRisk}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/60 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-amber-900">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Clinical Review Advised</span>
                  </div>
                  <span className="text-sm font-bold text-amber-900">
                    {analytics.outcomesBreakdown.higherRisk}
                  </span>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                    <AlertTriangle className="w-4 h-4 text-slate-400" />
                    <span>Inconclusive / Retake Advised</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">
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
