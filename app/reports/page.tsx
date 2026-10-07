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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Screening & Facility Reports</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregated metrics derived strictly from actual patient encounters in the database.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Encounters CSV</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Generating operational reports...
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-xs text-slate-500">
          Unable to compute reports at this time.
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── TOP KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Screenings</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">{report.totalScreenings}</div>
              <p className="text-[11px] text-slate-500 mt-1">Logged clinical screenings</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Review-Required Cases</span>
              <div className="text-2xl font-bold text-amber-700 mt-2">{report.reviewRecommendedCount}</div>
              <p className="text-[11px] text-slate-500 mt-1">Flagged for clinician confirmation</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Optical Quality Failures</span>
              <div className="text-2xl font-bold text-slate-900 mt-2">{report.qualityFailures}</div>
              <p className="text-[11px] text-slate-500 mt-1">Blocked by image quality gate</p>
            </div>

            <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Quality Score</span>
              <div className="text-2xl font-bold text-teal-700 mt-2">{report.averageQualityScore}%</div>
              <p className="text-[11px] text-slate-500 mt-1">Mean capture clarity rating</p>
            </div>
          </div>

          {/* ── PROTOCOL DISTRIBUTION & OUTCOME SPLIT ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Distribution */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Screening Protocol Volume</h2>
              <p className="text-xs text-slate-500">Distribution of eye vs oral visual screenings conducted</p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-teal-800">
                      <Eye className="w-3.5 h-3.5 text-teal-600" />
                      Eye (Diabetic Retinopathy)
                    </span>
                    <span className="text-slate-900">
                      {report.retinaScreenings} ({report.totalScreenings > 0 ? Math.round((report.retinaScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.retinaScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="flex items-center gap-1.5 text-emerald-800">
                      <Smile className="w-3.5 h-3.5 text-emerald-600" />
                      Oral Visual Screening
                    </span>
                    <span className="text-slate-900">
                      {report.oralScreenings} ({report.totalScreenings > 0 ? Math.round((report.oralScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.oralScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Finding Breakdown */}
            <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
              <h2 className="text-sm font-bold text-slate-900">Preliminary Findings Distribution</h2>
              <p className="text-xs text-slate-500">Classification of screenings based on algorithm assessment</p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50/60 border border-emerald-100 text-xs">
                  <span className="font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    No obvious abnormality detected
                  </span>
                  <span className="font-bold text-emerald-900 text-sm">{report.outcomesBreakdown.lowerRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50/60 border border-amber-100 text-xs">
                  <span className="font-semibold text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Potential finding detected (review recommended)
                  </span>
                  <span className="font-bold text-amber-900 text-sm">{report.outcomesBreakdown.higherRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-400" />
                    Inconclusive / low confidence
                  </span>
                  <span className="font-bold text-slate-700 text-sm">{report.outcomesBreakdown.inconclusive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── REFERRALS STATUS BREAKDOWN ── */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Specialist Referral Tracking Overview</h2>
            <p className="text-xs text-slate-500">Status progression of patients referred to secondary and tertiary centres</p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium block">Pending</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">{report.referralsBreakdown.pending}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-lg">
                <span className="text-[11px] text-slate-500 font-medium block">Reviewed</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">{report.referralsBreakdown.reviewed}</span>
              </div>
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-lg">
                <span className="text-[11px] text-blue-700 font-medium block">Referred</span>
                <span className="text-lg font-bold text-blue-900 mt-1 block">{report.referralsBreakdown.referralRecommended}</span>
              </div>
              <div className="p-3 bg-amber-50/60 border border-amber-100 rounded-lg">
                <span className="text-[11px] text-amber-700 font-medium block">Follow-up Due</span>
                <span className="text-lg font-bold text-amber-900 mt-1 block">{report.referralsBreakdown.followUpRequired}</span>
              </div>
              <div className="p-3 bg-emerald-50/60 border border-emerald-100 rounded-lg">
                <span className="text-[11px] text-emerald-700 font-medium block">Completed</span>
                <span className="text-lg font-bold text-emerald-900 mt-1 block">{report.referralsBreakdown.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
