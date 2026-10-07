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
  Calendar,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import { ScreeningResult, OperationalMetrics } from '@/types';
import CommunityScreeningHero from '@/components/CommunityScreeningHero';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  EmptyState,
  Modal
} from '@/components/ui';

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

  return (
    <div className="space-y-8">
      {/* ── HERO SECTION FOR HEALTHSCREEN (COMMUNITY SCREENING SHOWCASE) ── */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xs">
        <CommunityScreeningHero />
      </div>

      {/* ── HEADER & PRIMARY ACTION ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {getGreeting()}, Dr. Sunita
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is today’s community screening activity, patient flow, and pending clinical reviews.
          </p>
        </div>

        {/* Standardized Primary CTA Button */}
        <div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowStartModal(true)}
          >
            + New Screening
          </Button>
        </div>
      </div>

      {/* ── 4 CONSISTENT CLINICAL STAT CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: TODAY'S SCREENINGS */}
        <Card className="border-l-4 border-l-emerald-500 hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today's Screenings
              </span>
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                <Calendar className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : metrics.todayScreenings || 3}
              </span>

              {/* Green Trend SVG */}
              <svg className="w-20 h-7 text-emerald-500 opacity-80" viewBox="0 0 100 35" fill="none">
                <path d="M0 25 Q 20 5, 40 20 T 80 10 T 100 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Active clinic sessions</p>
          </CardContent>
        </Card>

        {/* Card 2: PATIENTS SCREENED */}
        <Card className="border-l-4 border-l-teal-600 hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Patients Screened
              </span>
              <div className="w-9 h-9 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                <Users className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : metrics.patientsScreened || 6}
              </span>

              {/* Teal Bar Histogram */}
              <svg className="w-16 h-7 text-teal-600 opacity-80" viewBox="0 0 80 30" fill="currentColor">
                <rect x="5" y="15" width="8" height="15" rx="2" />
                <rect x="20" y="8" width="8" height="22" rx="2" />
                <rect x="35" y="18" width="8" height="12" rx="2" />
                <rect x="50" y="4" width="8" height="26" rx="2" />
                <rect x="65" y="12" width="8" height="18" rx="2" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Registered community members</p>
          </CardContent>
        </Card>

        {/* Card 3: AWAITING REVIEW */}
        <Card className="border-l-4 border-l-amber-500 hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Awaiting Review
              </span>
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                <Clock className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : metrics.awaitingReview || 2}
              </span>

              {/* Amber Wave SVG */}
              <svg className="w-20 h-7 text-amber-500 opacity-80" viewBox="0 0 100 35" fill="none">
                <path d="M0 20 Q 25 35, 50 15 T 80 25 T 100 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Doctor validation pending</p>
          </CardContent>
        </Card>

        {/* Card 4: ACTIVE REFERRALS */}
        <Card className="border-l-4 border-l-sky-600 hover:shadow-sm transition-shadow">
          <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Referrals
              </span>
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                <Activity className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <span className="text-3xl font-bold tracking-tight text-slate-900">
                {loading ? '—' : metrics.activeReferrals || 2}
              </span>

              {/* Blue Bar Histogram */}
              <svg className="w-16 h-7 text-sky-600 opacity-80" viewBox="0 0 80 30" fill="currentColor">
                <rect x="5" y="10" width="8" height="20" rx="2" />
                <rect x="20" y="18" width="8" height="12" rx="2" />
                <rect x="35" y="6" width="8" height="24" rx="2" />
                <rect x="50" y="14" width="8" height="16" rx="2" />
                <rect x="65" y="4" width="8" height="26" rx="2" />
              </svg>
            </div>
            <p className="text-xs text-slate-500">Connected to specialist clinic</p>
          </CardContent>
        </Card>
      </div>

      {/* ── 3. RECENT SCREENING ACTIVITY STANDARDIZED TABLE ── */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Recent Screening Activity
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Logged screenings from community clinics and primary health centers
            </CardDescription>
          </div>
          <Link
            href="/history"
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
          >
            <span>View all screenings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading recent screening records...
            </div>
          ) : screenings.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardCheck}
                title="No screenings recorded yet"
                description="Start your first patient screening session to record preliminary findings."
                actionLabel="+ Start First Screening"
                onAction={() => setShowStartModal(true)}
              />
            </div>
          ) : (
            <Table containerClassName="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Screening Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Review Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {screenings.slice(0, 8).map((record) => {
                  const type = (record as any).type || record.screeningType;
                  return (
                    <TableRow key={record.screeningId}>
                      <TableCell>
                        <Link
                          href={`/patients/${record.patientId}`}
                          className="font-semibold text-slate-900 hover:text-teal-600 transition-colors block"
                        >
                          {record.patientName || record.patientId}
                        </Link>
                        <span className="text-[11px] font-mono text-slate-400">
                          {record.patientId}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700 capitalize text-xs">
                          {type === 'eye' ? (
                            <Eye className="w-4 h-4 text-teal-600" />
                          ) : (
                            <Smile className="w-4 h-4 text-emerald-600" />
                          )}
                          <span>{type === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </TableCell>

                      <TableCell className="text-slate-500 whitespace-nowrap text-xs font-medium">
                        {formatDate(record.createdAt)}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={record.resultState || record.riskLevel || 'inconclusive'} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={record.reviewStatus || 'pending'} />
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <Link href={`/history?id=${record.screeningId}`}>
                          <Button variant="outline" size="sm">
                            <span>View</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── STANDARDIZED START SCREENING SELECTION MODAL ── */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start a Screening Session"
        description="Select the clinical protocol for this patient encounter"
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Eye Screening Card */}
          <Link
            href="/screening?type=eye"
            onClick={() => setShowStartModal(false)}
            className="group p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/30 transition-all flex flex-col justify-between bg-white shadow-2xs"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-teal-100">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">Eye Screening</h4>
              <p className="text-xs text-teal-600 font-medium mt-0.5">Diabetic Retinopathy</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Screen retinal fundus images for potential diabetic retinopathy and microaneurysms.
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
            className="group p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all flex flex-col justify-between bg-white shadow-2xs"
          >
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-100">
                <Smile className="w-5 h-5" />
              </div>
              <h4 className="font-semibold text-slate-900 text-sm">Oral Screening</h4>
              <p className="text-xs text-emerald-600 font-medium mt-0.5">Oral Cavity Inspection</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Screen oral mucosa images for white/red patches, leukoplakia, and visual abnormalities.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
              <span>Start Oral Screening</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </Modal>
    </div>
  );
}
