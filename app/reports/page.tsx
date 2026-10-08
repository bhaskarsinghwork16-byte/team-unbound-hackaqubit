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
  ShieldCheck, 
  Users, 
  GitPullRequest
} from 'lucide-react';
import { ReportsSummary } from '@/types';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge
} from '@/components/ui';

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
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">Operational Analytics</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Screening & Facility Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Aggregated operational indicators derived from patient encounters in structured storage.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={<Download className="w-4 h-4" />}
          onClick={handleExportCSV}
        >
          Export Encounters CSV
        </Button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Generating operational reports...
        </div>
      ) : !report ? (
        <div className="p-12 text-center text-xs text-slate-400 font-medium">
          Unable to compute reports at this time.
        </div>
      ) : (
        <div className="space-y-6">
          {/* ── TOP KPI CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-emerald-500">
              <CardContent className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Total Screenings
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {report.totalScreenings}
                </div>
                <p className="text-xs text-slate-500 mt-1">Logged clinical screenings</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Review-Required Cases
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {report.reviewRecommendedCount}
                </div>
                <p className="text-xs text-slate-500 mt-1">Flagged for clinician review</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-teal-600">
              <CardContent className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Quality Failures
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {report.qualityFailures}
                </div>
                <p className="text-xs text-slate-500 mt-1">Rejected by quality checks</p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-sky-600">
              <CardContent className="p-5 flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Avg Quality Score
                </span>
                <div className="text-3xl font-bold text-slate-900 mt-2">
                  {report.averageQualityScore}%
                </div>
                <p className="text-xs text-slate-500 mt-1">Mean capture clarity rating</p>
              </CardContent>
            </Card>
          </div>

          {/* ── PROTOCOL DISTRIBUTION & OUTCOME SPLIT ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Protocol Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Screening Protocol Volume
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Distribution of retinal vs oral visual screenings conducted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5 text-teal-700">
                      <Eye className="w-3.5 h-3.5" />
                      <span>Eye (Diabetic Retinopathy)</span>
                    </span>
                    <span className="text-slate-900 font-semibold">
                      {report.retinaScreenings} ({report.totalScreenings > 0 ? Math.round((report.retinaScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.retinaScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium mb-1.5">
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Smile className="w-3.5 h-3.5" />
                      <span>Oral Visual Screening</span>
                    </span>
                    <span className="text-slate-900 font-semibold">
                      {report.oralScreenings} ({report.totalScreenings > 0 ? Math.round((report.oralScreenings / report.totalScreenings) * 100) : 0}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full"
                      style={{
                        width: `${report.totalScreenings > 0 ? (report.oralScreenings / report.totalScreenings) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Clinical Finding Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold text-slate-900">
                  Preliminary Findings Distribution
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Classification of screenings based on algorithmic assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 pt-0">
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs">
                  <span className="font-medium text-emerald-800 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>No obvious abnormality detected</span>
                  </span>
                  <span className="font-bold text-emerald-900 text-sm">{report.outcomesBreakdown.lowerRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs">
                  <span className="font-medium text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Potential finding detected (review advised)</span>
                  </span>
                  <span className="font-bold text-amber-900 text-sm">{report.outcomesBreakdown.higherRisk}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="font-medium text-slate-700 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Inconclusive / low confidence</span>
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{report.outcomesBreakdown.inconclusive}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── REFERRALS STATUS BREAKDOWN ── */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">
                Specialist Referral Tracking Overview
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Status progression of patients referred to secondary and tertiary centres
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-xs text-slate-500 font-medium block">Pending</span>
                  <span className="text-lg font-bold text-slate-900 mt-1 block">{report.referralsBreakdown.pending}</span>
                </div>
                <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <span className="text-xs text-teal-700 font-medium block">Reviewed</span>
                  <span className="text-lg font-bold text-teal-900 mt-1 block">{report.referralsBreakdown.reviewed}</span>
                </div>
                <div className="p-3 bg-sky-50 border border-sky-100 rounded-xl">
                  <span className="text-xs text-sky-700 font-medium block">Referred</span>
                  <span className="text-lg font-bold text-sky-900 mt-1 block">{report.referralsBreakdown.referralRecommended}</span>
                </div>
                <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <span className="text-xs text-amber-700 font-medium block">Follow-up Due</span>
                  <span className="text-lg font-bold text-amber-900 mt-1 block">{report.referralsBreakdown.followUpRequired}</span>
                </div>
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <span className="text-xs text-emerald-700 font-medium block">Completed</span>
                  <span className="text-lg font-bold text-emerald-900 mt-1 block">{report.referralsBreakdown.completed}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
