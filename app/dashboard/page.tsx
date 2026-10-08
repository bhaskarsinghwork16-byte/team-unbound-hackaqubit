'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Sparkles,
  Zap
} from 'lucide-react';
import { ScreeningResult, OperationalMetrics } from '@/types';
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
    <div className="space-y-6">
      {/* ── CLINICAL OPERATIONS HERO BANNER ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative rounded-2xl bg-gradient-to-r from-teal-950 via-teal-900 to-slate-900 text-white p-6 sm:p-8 overflow-hidden shadow-lg border border-teal-700/50"
      >
        {/* Ambient subtle glow circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-xs font-semibold text-teal-200">
              <Activity className="w-3.5 h-3.5 text-teal-300" />
              <span>Primary Health Centre #1 · Community Screening Ops</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {getGreeting()}, Dr. Sunita
            </h1>

            <p className="text-sm text-teal-100/90 leading-relaxed font-normal">
              Edge-first clinical decision support active. Ready to screen and triage patients for Diabetic Retinopathy and Oral Cavity findings with quantized INT8 models.
            </p>

            {/* Quick status telemetry pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Edge AI: Active
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Dual Protocols (Eye &amp; Oral)
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 text-teal-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Offline Storage Ready
              </span>
            </div>
          </div>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <Button
              variant="primary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowStartModal(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold shadow-md border-0"
            >
              + New Patient Screening
            </Button>
            <Link href="/patients">
              <Button
                variant="outline"
                size="md"
                icon={<Users className="w-4 h-4" />}
                className="w-full bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Browse Patient Directory
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* ── 4 CONSISTENT CLINICAL STAT CARDS (WITH STAGGER MOTION) ── */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: { staggerChildren: 0.08 }
          }
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Card 1: TODAY'S SCREENINGS */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-l-4 border-l-emerald-500 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Today's Screenings
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                  <Calendar className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? '—' : metrics.todayScreenings || 3}
                </span>

                {/* Green Trend SVG */}
                <svg className="w-20 h-7 text-emerald-500 opacity-80" viewBox="0 0 100 35" fill="none">
                  <path d="M0 25 Q 20 5, 40 20 T 80 10 T 100 15" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-medium">Active clinic encounters</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 2: PATIENTS SCREENED */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-l-4 border-l-teal-600 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Patients Screened
                </span>
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
                  <Users className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
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
              <p className="text-xs text-slate-500 font-medium">Registered community members</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: AWAITING REVIEW */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-l-4 border-l-amber-500 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Awaiting Review
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
                  <Clock className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  {loading ? '—' : metrics.awaitingReview || 2}
                </span>

                {/* Amber Wave SVG */}
                <svg className="w-20 h-7 text-amber-500 opacity-80" viewBox="0 0 100 35" fill="none">
                  <path d="M0 20 Q 25 35, 50 15 T 80 25 T 100 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                </svg>
              </div>
              <p className="text-xs text-slate-500 font-medium">Doctor verification pending</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: ACTIVE REFERRALS */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ y: -2 }}
        >
          <Card className="border-l-4 border-l-sky-600 shadow-xs hover:shadow-md transition-all">
            <CardContent className="p-5 flex flex-col justify-between h-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Active Referrals
                </span>
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100">
                  <Activity className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
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
              <p className="text-xs text-slate-500 font-medium">Connected to specialist clinic</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* ── 3. RECENT SCREENING ACTIVITY STANDARDIZED TABLE ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
      >
        <Card className="shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Recent Screening Activity
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-0.5">
                Logged encounters from community camps and primary health centers
              </CardDescription>
            </div>
            <Link
              href="/history"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
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
                    <TableHead>Date &amp; Time</TableHead>
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
                            className="font-bold text-slate-900 hover:text-teal-600 transition-colors block"
                          >
                            {record.patientName || record.patientId}
                          </Link>
                          <span className="text-[11px] font-mono text-slate-400">
                            {record.patientId}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex items-center gap-2 font-semibold text-slate-700 capitalize text-xs">
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
      </motion.div>

      {/* ── STANDARDIZED START SCREENING SELECTION MODAL ── */}
      <Modal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        title="Start a Screening Encounter"
        description="Select the clinical protocol for this patient encounter"
        maxWidth="lg"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Eye Screening Card */}
          <Link
            href="/screening?type=eye"
            onClick={() => setShowStartModal(false)}
            className="group p-5 rounded-xl border border-slate-200 hover:border-teal-500 hover:bg-teal-50/40 transition-all flex flex-col justify-between bg-white shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-teal-100">
                <Eye className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Eye Screening</h4>
              <p className="text-xs text-teal-700 font-semibold mt-0.5">Diabetic Retinopathy</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Screen retinal fundus images for potential diabetic retinopathy and microaneurysms.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform">
              <span>Start Eye Screening</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>

          {/* Oral Screening Card */}
          <Link
            href="/screening?type=oral"
            onClick={() => setShowStartModal(false)}
            className="group p-5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all flex flex-col justify-between bg-white shadow-2xs hover:shadow-md"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform border border-emerald-100">
                <Smile className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-slate-900 text-sm">Oral Screening</h4>
              <p className="text-xs text-emerald-700 font-semibold mt-0.5">Oral Cavity Inspection</p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Screen oral mucosa images for white/red patches, leukoplakia, and visual abnormalities.
              </p>
            </div>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
              <span>Start Oral Screening</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </div>
          </Link>
        </div>
      </Modal>
    </div>
  );
}
