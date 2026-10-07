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
      <div className="py-20 text-center text-sm text-slate-500">
        Loading patient clinical chart...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-base font-bold text-slate-800">Patient Record Not Found</h2>
        <p className="text-xs text-slate-500">The requested patient identifier was not found in the database.</p>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patients</span>
        </Link>
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
    { type: 'registration' as const, date: patient.registeredDate || patient.createdAt || new Date().toISOString(), data: null },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const displayName = patient.name || (patient.patientId ? `Patient ${patient.patientId}` : 'Unnamed Patient');
  const initials = (patient.name || patient.patientId || 'PT').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── BACK LINK & HEADER BANNER ── */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Patients</span>
        </Link>

        {/* Patient Clinical Profile Header Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-teal-50 border border-teal-200/80 text-teal-800 flex items-center justify-center font-bold text-lg shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  {displayName}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                  {patient.patientId}
                </span>
                {patient.needsFollowUp && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>Follow-up Required</span>
                  </span>
                )}
              </div>

              {/* Metadata pill strip */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 mt-2">
                <span>
                  <strong>Age/Sex:</strong> {patient.age ?? '—'} yrs · {patient.sex || 'Not recorded'}
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
                  Registered {formatDate(patient.registeredDate || patient.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleToggleFollowUp}
              className={`px-3 py-2 rounded-lg text-xs font-semibold border transition ${
                patient.needsFollowUp
                  ? 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {patient.needsFollowUp ? 'Clear Follow-up' : 'Flag Follow-up'}
            </button>
            <Link
              href={`/screening?patientId=${patient.patientId}`}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Start Screening</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 relative transition ${
            activeTab === 'timeline'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Care Timeline ({timelineItems.length})
        </button>
        <button
          onClick={() => setActiveTab('screenings')}
          className={`pb-3 relative transition ${
            activeTab === 'screenings'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Screening Records ({screenings.length})
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`pb-3 relative transition ${
            activeTab === 'referrals'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Specialist Referrals ({referrals.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 relative transition ${
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
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
          <h2 className="text-sm font-bold text-slate-900 mb-6">Patient Screening & Care Timeline</h2>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {timelineItems.map((item, idx) => {
              if (item.type === 'screening') {
                const s = item.data;
                const isAbnormal = s.resultState === 'potential_finding' || s.riskLevel === 'higher_risk';
                const type = (s as any).type || s.screeningType;

                return (
                  <div key={`s-${s.screeningId}`} className="relative group">
                    {/* Circle Node on Timeline */}
                    <span
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${
                        isAbnormal ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-emerald-500 ring-4 ring-emerald-100'
                      }`}
                    />

                    <div className="bg-slate-50/70 p-4 rounded-lg border border-slate-200/80 hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-xs text-slate-900">
                            {type === 'eye' ? 'Retinal Screening (Diabetic Retinopathy)' : 'Oral Visual Screening'}
                          </span>
                          <span className="text-[10px] font-mono text-slate-600">
                            {s.screeningId}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500">
                          {formatDateTime(s.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold ${
                            isAbnormal
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isAbnormal ? <AlertCircle className="w-3 h-3 text-amber-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                          <span>{s.prediction}</span>
                        </span>
                        {s.confidence && (
                          <span className="text-[11px] text-slate-500">
                            Confidence: {s.confidence}%
                          </span>
                        )}
                        <span className="text-[11px] text-slate-600 font-medium">
                          Review: {s.reviewStatus || 'pending'}
                        </span>
                      </div>

                      {s.recommendation && (
                        <p className="text-xs text-slate-600 mt-2 bg-white p-2 rounded-md border border-slate-200/60">
                          <strong>Clinical Recommendation:</strong> {s.recommendation}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/history?id=${s.screeningId}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800"
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
                    <div className="bg-teal-50/40 p-4 rounded-lg border border-teal-200/70">
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
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                    <span>Patient profile registered in community health system</span>
                    <span className="text-[11px] text-slate-600">
                      {formatDateTime(patient.registeredDate)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB CONTENT: SCREENINGS TABLE ── */}
      {activeTab === 'screenings' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {screenings.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No screenings logged for this patient yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Screening ID</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4">Quality</th>
                  <th className="py-3 px-4 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {screenings.map((s) => (
                  <tr key={s.screeningId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{s.screeningId}</td>
                    <td className="py-3 px-4 capitalize">{(s as any).type || s.screeningType}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(s.createdAt)}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800">{s.prediction}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{s.imageQuality?.grade || 'PASS'}</td>
                    <td className="py-3 px-4 text-right">
                      <Link
                        href={`/history?id=${s.screeningId}`}
                        className="text-teal-700 hover:text-teal-800 font-semibold text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: REFERRALS TABLE ── */}
      {activeTab === 'referrals' && (
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No specialist referrals created for this patient.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Referral ID</th>
                  <th className="py-3 px-4">Specialist / Facility</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <tr key={r.referralId} className="hover:bg-slate-50/60">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">{r.referralId}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.specialistType}</div>
                      <div className="text-[11px] text-slate-500">{r.destinationFacility}</div>
                    </td>
                    <td className="py-3 px-4 capitalize font-semibold">{r.priority}</td>
                    <td className="py-3 px-4 capitalize">{r.status.replace(/_/g, ' ')}</td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs truncate">{r.reason}</td>
                    <td className="py-3 px-4 text-slate-500">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: CLINICAL NOTES ── */}
      {activeTab === 'notes' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Health Worker & Clinical Encounter Notes</h2>
          <p className="text-xs text-slate-500">
            Record medical history, relevant symptoms, previous eye or oral complaints, or follow-up instructions.
          </p>

          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document patient medical background, systemic conditions (e.g. Type 2 Diabetes for 8 years), current medications, or community outreach notes..."
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />

          <div className="flex items-center justify-between">
            {notesSaved ? (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                <span>Notes saved successfully</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-600">Saved to patient profile in database</span>
            )}

            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
