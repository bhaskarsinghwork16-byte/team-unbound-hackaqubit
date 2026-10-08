'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Calendar, 
  Phone, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  Eye, 
  Smile, 
  HelpCircle,
  ShieldCheck,
  GitPullRequest,
  Check
} from 'lucide-react';
import { PatientRecord, ScreeningResult, ReferralRecord } from '@/types';
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
  Badge,
  StatusBadge,
  EmptyState
} from '@/components/ui';

export default function PatientProfilePage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'timeline' | 'screenings' | 'referrals' | 'notes'>('timeline');

  // Notes editing state
  const [notes, setNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => {
    async function loadPatient() {
      try {
        setLoading(true);
        const res = await fetch(`/api/patients/${patientId}`);
        const data = await res.json();
        if (data.success) {
          setPatient(data.patient);
          setScreenings(data.screenings || []);
          setReferrals(data.referrals || []);
          setNotes(data.patient.notes || '');
        }
      } catch (err) {
        console.error('Error loading patient profile:', err);
      } finally {
        setLoading(false);
      }
    }
    if (patientId) {
      loadPatient();
    }
  }, [patientId]);

  const handleSaveNotes = async () => {
    try {
      setIsSavingNotes(true);
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });
      if (res.ok) {
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2500);
      }
    } catch (err) {
      console.error('Error saving notes:', err);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleToggleFollowUp = async () => {
    if (!patient) return;
    const nextStatus = !patient.needsFollowUp;
    try {
      const res = await fetch(`/api/patients/${patientId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ needsFollowUp: nextStatus }),
      });
      if (res.ok) {
        setPatient({ ...patient, needsFollowUp: nextStatus });
      }
    } catch (err) {
      console.error('Error toggling follow-up:', err);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr?: string) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400 font-medium">
        Loading patient clinical chart...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-12 max-w-md mx-auto">
        <EmptyState
          icon={AlertCircle}
          title="Patient Record Not Found"
          description="The requested patient identifier was not found in the community health database."
          actionLabel="Back to Patients"
          actionHref="/patients"
        />
      </div>
    );
  }

  // Combine screenings and events into a chronological timeline
  type TimelineItem =
    | { type: 'screening'; date: string; data: ScreeningResult }
    | { type: 'referral'; date: string; data: ReferralRecord }
    | { type: 'registration'; date: string; data: null };

  const timelineItems: TimelineItem[] = [
    ...screenings.map((s) => ({ type: 'screening' as const, date: s.createdAt, data: s })),
    ...referrals.map((r) => ({ type: 'referral' as const, date: r.createdAt, data: r })),
    { type: 'registration' as const, date: patient.registeredDate, data: null },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── BACK LINK & HEADER BANNER ── */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patients</span>
        </Link>

        {/* Patient Clinical Profile Header Card */}
        <Card>
          <CardContent className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
                {patient.name.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-xl font-bold tracking-tight text-slate-900">
                    {patient.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                    {patient.patientId}
                  </span>
                  {patient.needsFollowUp ? (
                    <Badge variant="warning">Follow-up Due</Badge>
                  ) : (
                    <Badge variant="success">Up to Date</Badge>
                  )}
                </div>

                {/* Metadata pill strip */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                  <span>
                    <strong>Age/Sex:</strong> {patient.age} yrs · {patient.sex}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {patient.phone || 'No phone recorded'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {patient.address || 'Facility Primary'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Registered {formatDate(patient.registeredDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2 self-start md:self-center">
              <Button
                variant={patient.needsFollowUp ? 'secondary' : 'outline'}
                size="md"
                onClick={handleToggleFollowUp}
              >
                {patient.needsFollowUp ? 'Clear Follow-up' : 'Flag Follow-up'}
              </Button>
              <Link href={`/screening?patientId=${patient.patientId}`}>
                <Button
                  variant="primary"
                  size="md"
                  icon={<Plus className="w-4 h-4" />}
                >
                  Start Screening
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'timeline'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Care Timeline ({timelineItems.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('screenings')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'screenings'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Screening Records ({screenings.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('referrals')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'referrals'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Specialist Referrals ({referrals.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('notes')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'notes'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Clinical Notes
        </button>
      </div>

      {/* ── TAB CONTENT: LONGITUDINAL PATIENT TIMELINE ── */}
      {activeTab === 'timeline' && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-sm font-bold text-slate-900 mb-6">Patient Screening & Care Timeline</h2>

            <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {timelineItems.map((item) => {
                if (item.type === 'screening') {
                  const s = item.data;
                  const isAbnormal = s.resultState === 'potential_finding' || s.riskLevel === 'higher_risk';
                  const type = (s as any).type || s.screeningType;

                  return (
                    <div key={`s-${s.screeningId}`} className="relative group">
                      <span
                        className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${
                          isAbnormal ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-emerald-500 ring-4 ring-emerald-100'
                        }`}
                      />

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 hover:bg-slate-100/50 transition-colors">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs text-slate-900">
                              {type === 'eye' ? 'Retinal Screening (Diabetic Retinopathy)' : 'Oral Visual Screening'}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {s.screeningId}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {formatDateTime(s.createdAt)}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center gap-2 flex-wrap">
                          <StatusBadge status={s.resultState || s.riskLevel || 'inconclusive'} />
                          {s.confidence && (
                            <span className="text-[11px] text-slate-500">
                              Confidence: {s.confidence}%
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 font-medium">
                            Review: {s.reviewStatus || 'pending'}
                          </span>
                        </div>

                        {s.recommendation && (
                          <p className="text-xs text-slate-600 mt-2 bg-white p-2.5 rounded-lg border border-slate-200/70">
                            <strong>Clinical Recommendation:</strong> {s.recommendation}
                          </p>
                        )}

                        <div className="mt-3 flex items-center justify-end">
                          <Link
                            href={`/history?id=${s.screeningId}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
                          >
                            <span>View Full Screening Report</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.type === 'referral') {
                  const r = item.data;
                  return (
                    <div key={`r-${r.referralId}`} className="relative group">
                      <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-teal-600 border-2 border-white ring-4 ring-teal-100" />
                      <div className="bg-teal-50/50 p-4 rounded-xl border border-teal-200/70">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-teal-900 flex items-center gap-1.5">
                            <GitPullRequest className="w-3.5 h-3.5 text-teal-700" />
                            Specialist Referral Created ({r.specialistType})
                          </span>
                          <span className="text-[11px] text-slate-500">
                            {formatDateTime(r.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          <strong>Destination:</strong> {r.destinationFacility} · Priority:{' '}
                          <span className="capitalize font-semibold">{r.priority}</span>
                        </p>
                        <p className="text-xs text-slate-600 mt-1 italic">
                          &quot;{r.reason}&quot;
                        </p>
                      </div>
                    </div>
                  );
                }

                // Registration event
                return (
                  <div key="reg" className="relative group">
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-400 border-2 border-white ring-4 ring-slate-100" />
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                      <span>Patient profile registered in community health system</span>
                      <span className="text-[11px] text-slate-500">
                        {formatDateTime(patient.registeredDate)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB CONTENT: SCREENINGS TABLE ── */}
      {activeTab === 'screenings' && (
        <Card>
          <CardContent className="p-0">
            {screenings.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No screenings logged for this patient yet.
              </div>
            ) : (
              <Table containerClassName="border-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Screening ID</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead>Quality</TableHead>
                    <TableHead className="text-right">Report</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {screenings.map((s) => (
                    <TableRow key={s.screeningId}>
                      <TableCell className="font-mono font-medium text-slate-900 text-xs">{s.screeningId}</TableCell>
                      <TableCell className="capitalize text-xs">{(s as any).type || s.screeningType}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{formatDate(s.createdAt)}</TableCell>
                      <TableCell>
                        <StatusBadge status={s.resultState || s.riskLevel || 'inconclusive'} />
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">{s.imageQuality?.grade || 'PASS'}</TableCell>
                      <TableCell className="text-right">
                        <Link href={`/history?id=${s.screeningId}`}>
                          <Button variant="outline" size="sm">
                            <span>View</span>
                            <ArrowRight className="w-3 h-3" />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TAB CONTENT: REFERRALS TABLE ── */}
      {activeTab === 'referrals' && (
        <Card>
          <CardContent className="p-0">
            {referrals.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No specialist referrals created for this patient.
              </div>
            ) : (
              <Table containerClassName="border-0 rounded-none shadow-none">
                <TableHeader>
                  <TableRow>
                    <TableHead>Referral ID</TableHead>
                    <TableHead>Specialist / Facility</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((r) => (
                    <TableRow key={r.referralId}>
                      <TableCell className="font-mono font-medium text-slate-900 text-xs">{r.referralId}</TableCell>
                      <TableCell>
                        <div className="font-medium text-slate-900 text-xs">{r.specialistType}</div>
                        <div className="text-[11px] text-slate-500">{r.destinationFacility}</div>
                      </TableCell>
                      <TableCell className="capitalize font-medium text-xs">{r.priority}</TableCell>
                      <TableCell className="capitalize text-xs">{r.status.replace(/_/g, ' ')}</TableCell>
                      <TableCell className="text-slate-700 text-xs max-w-xs truncate">{r.reason}</TableCell>
                      <TableCell className="text-slate-500 text-xs">{formatDate(r.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── TAB CONTENT: CLINICAL NOTES ── */}
      {activeTab === 'notes' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">
              Health Worker & Clinical Encounter Notes
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Record medical history, relevant symptoms, previous eye or oral complaints, or follow-up instructions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 pt-0">
            <textarea
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document patient medical background, systemic conditions (e.g. Type 2 Diabetes for 8 years), current medications, or community outreach notes..."
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 placeholder:text-slate-400"
            />

            <div className="flex items-center justify-between">
              {notesSaved ? (
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Notes saved successfully</span>
                </span>
              ) : (
                <span className="text-[11px] text-slate-500">Saved to patient profile in database</span>
              )}

              <Button
                variant="primary"
                size="md"
                onClick={handleSaveNotes}
                loading={isSavingNotes}
              >
                Save Notes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
