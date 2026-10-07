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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#d8e2dc]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-[#ffdccc] text-[#5d2a42] px-2.5 py-0.5 rounded-full border border-[#fec89a] font-bold tracking-wide">
              OPERATIONAL ANALYTICS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#5d2a42]">Screening & Facility Reports</h1>
          <p className="text-sm text-[#5d2a42]/70 font-medium mt-1">
            Aggregated metrics derived strictly from actual patient encounters in the database.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-full text-xs font-extrabold shadow-sm transition-all"
        >
          <Download className="w-4 h-4 stroke-[3]" />
          <span>Export Encounters CSV</span>
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-[#5d2a42]/70 font-bold">
          Generating operational reports...
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-xs text-[#5d2a42]/70 font-bold">
          Unable to compute reports at this time.
        </div>
      ) : (
        <div className="space-y-8">
          {/* ── TOP KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">Total Screenings</span>
              <div className="text-3xl font-black text-[#5d2a42] mt-2">{report.totalScreenings}</div>
              <p className="text-[11px] text-[#5d2a42]/70 mt-1 font-bold">Logged clinical screenings</p>
            </div>

            <div className="bg-[#fec89a] border border-[#ffdccc] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">Review-Required Cases</span>
              <div className="text-3xl font-black text-[#5d2a42] mt-2">{report.reviewRecommendedCount}</div>
              <p className="text-[11px] text-[#5d2a42]/90 mt-1 font-extrabold">Flagged for clinician confirmation</p>
            </div>

            <div className="bg-[#ffdccc] border border-[#fec89a] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">Quality Failures</span>
              <div className="text-3xl font-black text-[#5d2a42] mt-2">{report.qualityFailures}</div>
              <p className="text-[11px] text-[#5d2a42]/80 mt-1 font-bold">Blocked by quality gate</p>
            </div>

            <div className="bg-[#d8e2dc] border border-[#c4d4cc] rounded-2xl p-5 flex flex-col justify-between shadow-sm">
              <span className="text-xs font-black text-[#5d2a42] uppercase tracking-wider">Avg Quality Score</span>
              <div className="text-3xl font-black text-[#5d2a42] mt-2">{report.averageQualityScore}%</div>
              <p className="text-[11px] text-[#5d2a42]/80 mt-1 font-bold">Mean capture clarity rating</p>
            </div>
          </div>

          {/* ── PROTOCOL DISTRIBUTION & OUTCOME SPLIT ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Distribution */}
            <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#5d2a42]">Screening Protocol Volume</h2>
              <p className="text-xs text-[#5d2a42]/70 font-medium">Distribution of eye vs oral visual screenings conducted</p>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 text-[#5d2a42]">
                    <span className="flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Eye (Diabetic Retinopathy)</span>
                    </span>
                    <span className="font-extrabold">
                      {report.retinaScreenings} ({report.totalScreenings > 0 ? Math.round((report.retinaScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#fff9ec] rounded-full overflow-hidden border border-[#d8e2dc]">
                    <div
                      className="h-full bg-[#5d2a42] rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.retinaScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-bold mb-1 text-[#5d2a42]">
                    <span className="flex items-center gap-1.5">
                      <Smile className="w-3.5 h-3.5" />
                      <span>Oral Visual Screening</span>
                    </span>
                    <span className="font-extrabold">
                      {report.oralScreenings} ({report.totalScreenings > 0 ? Math.round((report.oralScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-[#fff9ec] rounded-full overflow-hidden border border-[#d8e2dc]">
                    <div
                      className="h-full bg-[#ffdccc] border border-[#fec89a] rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.oralScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Clinical Finding Breakdown */}
            <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-[#5d2a42]">Preliminary Findings Distribution</h2>
              <p className="text-xs text-[#5d2a42]/70 font-medium">Classification of screenings based on algorithm assessment</p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#d8e2dc] border border-[#c4d4cc] text-xs">
                  <span className="font-bold text-[#5d2a42] flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>No obvious abnormality detected</span>
                  </span>
                  <span className="font-black text-[#5d2a42] text-sm">{report.outcomesBreakdown.lowerRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#fec89a] border border-[#ffdccc] text-xs">
                  <span className="font-extrabold text-[#5d2a42] flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#5d2a42]" />
                    <span>Potential finding detected (review recommended)</span>
                  </span>
                  <span className="font-black text-[#5d2a42] text-sm">{report.outcomesBreakdown.higherRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#ffdccc] border border-[#fec89a] text-xs">
                  <span className="font-bold text-[#5d2a42] flex items-center gap-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Inconclusive / low confidence</span>
                  </span>
                  <span className="font-black text-[#5d2a42] text-sm">{report.outcomesBreakdown.inconclusive}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── REFERRALS STATUS BREAKDOWN ── */}
          <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#5d2a42]">Specialist Referral Tracking Overview</h2>
            <p className="text-xs text-[#5d2a42]/70 font-medium">Status progression of patients referred to secondary and tertiary centres</p>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 text-center">
              <div className="p-3 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl">
                <span className="text-[11px] text-[#5d2a42]/70 font-bold block">Pending</span>
                <span className="text-lg font-black text-[#5d2a42] mt-1 block">{report.referralsBreakdown.pending}</span>
              </div>
              <div className="p-3 bg-[#ffdccc] border border-[#fec89a] rounded-xl">
                <span className="text-[11px] text-[#5d2a42] font-bold block">Reviewed</span>
                <span className="text-lg font-black text-[#5d2a42] mt-1 block">{report.referralsBreakdown.reviewed}</span>
              </div>
              <div className="p-3 bg-[#fec89a] border border-[#ffdccc] rounded-xl">
                <span className="text-[11px] text-[#5d2a42] font-bold block">Referred</span>
                <span className="text-lg font-black text-[#5d2a42] mt-1 block">{report.referralsBreakdown.referralRecommended}</span>
              </div>
              <div className="p-3 bg-[#fec89a] border border-[#ffdccc] rounded-xl">
                <span className="text-[11px] text-[#5d2a42] font-bold block">Follow-up Due</span>
                <span className="text-lg font-black text-[#5d2a42] mt-1 block">{report.referralsBreakdown.followUpRequired}</span>
              </div>
              <div className="p-3 bg-[#d8e2dc] border border-[#c4d4cc] rounded-xl">
                <span className="text-[11px] text-[#5d2a42] font-bold block">Completed</span>
                <span className="text-lg font-black text-[#5d2a42] mt-1 block">{report.referralsBreakdown.completed}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
