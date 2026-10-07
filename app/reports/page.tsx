'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  BarChart2, 
  Eye, 
  Smile, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  FileText, 
  Download, 
  Layers, 
  ShieldCheck, 
  Users, 
  GitPullRequest
} from 'lucide-react';
import { ReportsSummary } from '@/types';

export default function ReportsPage() {
  const [report, setReport] = useState<ReportsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setReport(data.report);
        }
      })
      .catch((err) => console.error('Failed to load reports:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/screenings');
      const data = await res.json();
      if (!data.success || !data.data) return;

      const items = data.data;
      const headers = ['ScreeningID', 'PatientID', 'PatientName', 'Type', 'Finding', 'Risk', 'QualityScore', 'ReviewStatus', 'CreatedAt'];
      const rows = items.map((i: any) => [
        i.screeningId,
        i.patientId,
        `"${(i.patientName || '').replace(/"/g, '""')}"`,
        (i as any).type || i.screeningType,
        `"${(i.prediction || '').replace(/"/g, '""')}"`,
        i.riskLevel,
        i.imageQuality?.score || '',
        i.reviewStatus || 'pending',
        i.createdAt,
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `healthscreen_report_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-semibold tracking-wide">
              OPERATIONAL ANALYTICS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Screening & Facility Reports</h1>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Aggregated metrics derived strictly from actual patient encounters in the database.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-full text-xs font-extrabold shadow-[0_0_20px_rgba(20,184,166,0.35)] transition-all transform hover:scale-105"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>Export Encounters CSV</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-300 font-medium">
          Generating operational reports...
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-xs text-slate-300 font-medium">
          Unable to compute reports at this time.
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── TOP 3D GLASS KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-stat-green p-5 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">Total Screenings</span>
              <div className="text-3xl font-extrabold text-white mt-2 drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">{report.totalScreenings}</div>
              <p className="text-[11px] text-emerald-300/80 mt-1 font-medium">Logged clinical screenings</p>
            </div>

            <div className="glass-stat-amber p-5 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-amber-300 uppercase tracking-wider">Review-Required Cases</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-2 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">{report.reviewRecommendedCount}</div>
              <p className="text-[11px] text-amber-300/80 mt-1 font-medium">Flagged for clinician confirmation</p>
            </div>

            <div className="glass-stat-cyan p-5 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-cyan-300 uppercase tracking-wider">Quality Failures</span>
              <div className="text-3xl font-extrabold text-cyan-300 mt-2 drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">{report.qualityFailures}</div>
              <p className="text-[11px] text-cyan-300/80 mt-1 font-medium">Blocked by quality gate</p>
            </div>

            <div className="glass-stat-blue p-5 flex flex-col justify-between">
              <span className="text-xs font-extrabold text-blue-300 uppercase tracking-wider">Avg Quality Score</span>
              <div className="text-3xl font-extrabold text-cyan-300 mt-2 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]">{report.averageQualityScore}%</div>
              <p className="text-[11px] text-blue-300/80 mt-1 font-medium">Mean capture clarity rating</p>
            </div>
          </div>

          {/* ── PROTOCOL DISTRIBUTION & OUTCOME SPLIT ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Distribution */}
            <div className="glass-container-3d p-6 space-y-4">
              <h2 className="text-sm font-bold text-white">Screening Protocol Volume</h2>
              <p className="text-xs text-slate-300 font-medium">Distribution of eye vs oral visual screenings conducted</p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-cyan-400">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Eye (Diabetic Retinopathy)</span>
                    </span>
                    <span className="text-white font-bold">
                      {report.retinaScreenings} ({report.totalScreenings > 0 ? Math.round((report.retinaScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-teal-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-400 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.retinaScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <Smile className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Oral Visual Screening</span>
                    </span>
                    <span className="text-white font-bold">
                      {report.oralScreenings} ({report.totalScreenings > 0 ? Math.round((report.oralScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden border border-teal-500/20">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.oralScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Finding Breakdown */}
            <div className="glass-container-3d p-6 space-y-4">
              <h2 className="text-sm font-bold text-white">Preliminary Findings Distribution</h2>
              <p className="text-xs text-slate-300 font-medium">Classification of screenings based on algorithm assessment</p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs">
                  <span className="font-semibold text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>No obvious abnormality detected</span>
                  </span>
                  <span className="font-bold text-white text-sm">{report.outcomesBreakdown.lowerRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <span className="font-semibold text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>Potential finding detected (review recommended)</span>
                  </span>
                  <span className="font-bold text-amber-300 text-sm">{report.outcomesBreakdown.higherRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-500/10 border border-slate-500/30 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    <span>Inconclusive / low confidence</span>
                  </span>
                  <span className="font-bold text-white text-sm">{report.outcomesBreakdown.inconclusive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── REFERRALS STATUS BREAKDOWN ── */}
          <div className="glass-container-3d p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Specialist Referral Tracking Overview</h2>
            <p className="text-xs text-slate-300 font-medium">Status progression of patients referred to secondary and tertiary centres</p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
              <div className="p-3 bg-black/40 border border-teal-500/20 rounded-xl">
                <span className="text-[11px] text-slate-400 font-semibold block">Pending</span>
                <span className="text-lg font-bold text-white mt-1 block">{report.referralsBreakdown.pending}</span>
              </div>
              <div className="p-3 bg-black/40 border border-teal-500/20 rounded-xl">
                <span className="text-[11px] text-emerald-400 font-semibold block">Reviewed</span>
                <span className="text-lg font-bold text-white mt-1 block">{report.referralsBreakdown.reviewed}</span>
              </div>
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                <span className="text-[11px] text-blue-300 font-semibold block">Referred</span>
                <span className="text-lg font-bold text-blue-300 mt-1 block">{report.referralsBreakdown.referralRecommended}</span>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                <span className="text-[11px] text-amber-300 font-semibold block">Follow-up Due</span>
                <span className="text-lg font-bold text-amber-300 mt-1 block">{report.referralsBreakdown.followUpRequired}</span>
              </div>
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <span className="text-[11px] text-emerald-300 font-semibold block">Completed</span>
                <span className="text-lg font-bold text-emerald-300 mt-1 block">{report.referralsBreakdown.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
