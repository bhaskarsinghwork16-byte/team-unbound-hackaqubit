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
      <div className="py-20 text-center text-sm text-[#5d2a42] font-black">
        Loading patient clinical chart...
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-20 text-center space-y-4">
        <h2 className="text-lg font-black text-[#5d2a42]">Patient Record Not Found</h2>
        <p className="text-xs text-[#5d2a42]/80 font-bold">The requested patient identifier was not found in the database.</p>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5d2a42] text-[#fff9ec] rounded-2xl text-xs font-black"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#ffdccc]" />
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
    { type: 'registration' as const, date: patient.registeredDate, data: null },
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6 max-w-6xl">
      {/* ── BACK LINK & HEADER BANNER ── */}
      <div>
        <Link
          href="/patients"
          className="inline-flex items-center gap-1 text-xs font-black text-[#5d2a42] hover:underline mb-3 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>Back to Patients</span>
        </Link>

        {/* Patient Clinical Profile Header Card */}
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#ffdccc] border border-[#d8e2dc] text-[#5d2a42] flex items-center justify-center font-black text-xl shrink-0">
              {patient.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-black tracking-tight text-[#5d2a42]">
                  {patient.name}
                </h1>
                <span className="px-3 py-1 rounded-full bg-[#5d2a42] text-[#fff9ec] text-xs font-mono font-black">
                  {patient.patientId}
                </span>
                {patient.needsFollowUp && (
                  <span className="px-3 py-1 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#5d2a42]/30 text-xs font-black flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#5d2a42]" />
                    <span>Follow-up Required</span>
                  </span>
                )}
              </div>

              {/* Metadata pill strip */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#5d2a42]/85 font-bold mt-2">
                <span>
                  <strong className="text-[#5d2a42] font-black">Age/Sex:</strong> {patient.age} yrs · {patient.sex}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#5d2a42]" />
                  {patient.phone || 'No phone recorded'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#5d2a42]" />
                  {patient.address || 'Facility Primary'}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#5d2a42]" />
                  Registered {formatDate(patient.registeredDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 self-start md:self-center">
            <button
              onClick={handleToggleFollowUp}
              className={`px-4 py-2.5 rounded-2xl text-xs font-black border transition ${
                patient.needsFollowUp
                  ? 'border-[#5d2a42]/30 bg-[#fec89a] text-[#5d2a42]'
                  : 'border-[#d8e2dc] bg-[#d8e2dc]/40 text-[#5d2a42] hover:bg-[#d8e2dc]'
              }`}
            >
              {patient.needsFollowUp ? 'Clear Follow-up' : 'Flag Follow-up'}
            </button>
            <Link
              href={`/screening?patientId=${patient.patientId}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-2xl text-xs font-black shadow-md border border-[#ffdccc] transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#ffdccc]" />
              <span>Start Screening</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ── TABS NAVIGATION ── */}
      <div className="flex border-b border-[#d8e2dc] gap-6 text-xs font-black">
        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 relative transition ${
            activeTab === 'timeline'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          Care Timeline ({timelineItems.length})
        </button>
        <button
          onClick={() => setActiveTab('screenings')}
          className={`pb-3 relative transition ${
            activeTab === 'screenings'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          Screening Records ({screenings.length})
        </button>
        <button
          onClick={() => setActiveTab('referrals')}
          className={`pb-3 relative transition ${
            activeTab === 'referrals'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          Specialist Referrals ({referrals.length})
        </button>
        <button
          onClick={() => setActiveTab('notes')}
          className={`pb-3 relative transition ${
            activeTab === 'notes'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          Clinical Notes
        </button>
      </div>

      {/* ── TAB CONTENT: LONGITUDINAL PATIENT TIMELINE ── */}
      {activeTab === 'timeline' && (
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5">
          <h2 className="text-base font-black text-[#5d2a42] mb-6">Patient Screening &amp; Care Timeline</h2>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d8e2dc]">
            {timelineItems.map((item, idx) => {
              if (item.type === 'screening') {
                const s = item.data;
                const isAbnormal = s.resultState === 'potential_finding' || s.riskLevel === 'higher_risk';
                const type = (s as any).type || s.screeningType;

                return (
                  <div key={`s-${s.screeningId}`} className="relative group">
                    <span
                      className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white ${
                        isAbnormal ? 'bg-[#fec89a] ring-4 ring-[#fec89a]/30' : 'bg-[#d8e2dc] ring-4 ring-[#d8e2dc]/50'
                      }`}
                    />

                    <div className="bg-[#fff9ec] p-5 rounded-2xl border border-[#d8e2dc] shadow-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-[#5d2a42]">
                            {type === 'eye' ? 'Retinal Screening (Diabetic Retinopathy)' : 'Oral Visual Screening'}
                          </span>
                          <span className="text-[10px] font-mono text-[#5d2a42]/80 font-bold">
                            {s.screeningId}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5d2a42]/70 font-bold">
                          {formatDateTime(s.createdAt)}
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                            isAbnormal
                              ? 'bg-[#fec89a] text-[#5d2a42] border border-[#5d2a42]/30'
                              : 'bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc]'
                          }`}
                        >
                          {isAbnormal ? <AlertCircle className="w-3.5 h-3.5 text-[#5d2a42]" /> : <CheckCircle2 className="w-3.5 h-3.5 text-[#5d2a42]" />}
                          <span>{s.prediction}</span>
                        </span>
                        {s.confidence && (
                          <span className="text-[11px] text-[#5d2a42]/80 font-bold">
                            Confidence: {s.confidence}%
                          </span>
                        )}
                      </div>

                      {s.recommendation && (
                        <p className="text-xs text-[#5d2a42] mt-2.5 bg-white p-3 rounded-xl border border-[#d8e2dc] font-bold">
                          <strong className="text-[#5d2a42] font-black">Clinical Recommendation:</strong> {s.recommendation}
                        </p>
                      )}

                      <div className="mt-3 flex items-center justify-end">
                        <Link
                          href={`/history?id=${s.screeningId}`}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-[#ffdccc] text-[#5d2a42] rounded-xl font-black text-xs hover:bg-[#5d2a42] hover:text-[#fff9ec] transition-all"
                        >
                          <span>View Full Report</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
                    <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#5d2a42] border-2 border-white ring-4 ring-[#5d2a42]/20" />
                    <div className="bg-[#ffdccc]/40 p-5 rounded-2xl border border-[#d8e2dc]">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="font-black text-xs text-[#5d2a42] flex items-center gap-1.5">
                          <GitPullRequest className="w-3.5 h-3.5 text-[#5d2a42]" />
                          Specialist Referral Created ({r.specialistType})
                        </span>
                        <span className="text-[11px] text-[#5d2a42]/70 font-bold">
                          {formatDateTime(r.createdAt)}
                        </span>
                      </div>
                      <p className="text-xs text-[#5d2a42] mt-1 font-bold">
                        <strong>Destination:</strong> {r.destinationFacility} · Priority:{' '}
                        <span className="capitalize font-black">{r.priority}</span>
                      </p>
                      <p className="text-xs text-[#5d2a42]/80 mt-1 italic font-medium">
                        &quot;{r.reason}&quot;
                      </p>
                    </div>
                  </div>
                );
              }

              // Registration event
              return (
                <div key="reg" className="relative group">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-[#d8e2dc] border-2 border-white ring-4 ring-[#d8e2dc]/40" />
                  <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc] text-xs text-[#5d2a42] font-bold flex items-center justify-between">
                    <span>Patient profile registered in community health system</span>
                    <span className="text-[11px] text-[#5d2a42]/70 font-bold">
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
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 overflow-hidden">
          {screenings.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#5d2a42] font-black">
              No screenings logged for this patient yet.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5d2a42] text-[#fff9ec] font-black uppercase tracking-wider border-b border-[#d8e2dc]">
                <tr>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Screening ID</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Type</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Date</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Result</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Quality</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e2dc] text-[#5d2a42] font-bold">
                {screenings.map((s) => (
                  <tr key={s.screeningId} className="hover:bg-[#ffdccc]/30 transition-colors">
                    <td className="py-4 px-5 font-mono font-black text-[#5d2a42]">{s.screeningId}</td>
                    <td className="py-4 px-5 capitalize font-black">{(s as any).type || s.screeningType}</td>
                    <td className="py-4 px-5 text-[#5d2a42]/80 font-bold">{formatDate(s.createdAt)}</td>
                    <td className="py-4 px-5">
                      <span className="font-black text-[#5d2a42]">{s.prediction}</span>
                    </td>
                    <td className="py-4 px-5 text-[#5d2a42] font-bold">{s.imageQuality?.grade || 'PASS'}</td>
                    <td className="py-4 px-5 text-right">
                      <Link
                        href={`/history?id=${s.screeningId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-[#ffdccc] text-[#5d2a42] rounded-xl font-black text-xs hover:bg-[#5d2a42] hover:text-[#fff9ec] transition-all"
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
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 overflow-hidden">
          {referrals.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#5d2a42] font-black">
              No specialist referrals created for this patient.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5d2a42] text-[#fff9ec] font-black uppercase tracking-wider border-b border-[#d8e2dc]">
                <tr>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Referral ID</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Specialist / Facility</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Priority</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Status</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Reason</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e2dc] text-[#5d2a42] font-bold">
                {referrals.map((r) => (
                  <tr key={r.referralId} className="hover:bg-[#ffdccc]/30 transition-colors">
                    <td className="py-4 px-5 font-mono font-black text-[#5d2a42]">{r.referralId}</td>
                    <td className="py-4 px-5">
                      <div className="font-black text-[#5d2a42]">{r.specialistType}</div>
                      <div className="text-[11px] text-[#5d2a42]/80 font-bold">{r.destinationFacility}</div>
                    </td>
                    <td className="py-4 px-5 capitalize font-black">{r.priority}</td>
                    <td className="py-4 px-5 capitalize font-bold">{r.status.replace(/_/g, ' ')}</td>
                    <td className="py-4 px-5 text-[#5d2a42] max-w-xs truncate font-bold">{r.reason}</td>
                    <td className="py-4 px-5 text-[#5d2a42]/80 font-bold">{formatDate(r.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── TAB CONTENT: CLINICAL NOTES ── */}
      {activeTab === 'notes' && (
        <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 space-y-4">
          <h2 className="text-base font-black text-[#5d2a42]">Health Worker &amp; Clinical Encounter Notes</h2>
          <p className="text-xs text-[#5d2a42]/80 font-bold">
            Record medical history, relevant symptoms, previous eye or oral complaints, or follow-up instructions.
          </p>

          <textarea
            rows={6}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Document patient medical background, systemic conditions (e.g. Type 2 Diabetes for 8 years), current medications, or community outreach notes..."
            className="w-full p-4 bg-[#fff9ec] border border-[#d8e2dc] rounded-2xl text-xs text-[#5d2a42] font-bold focus:outline-none focus:border-[#5d2a42]"
          />

          <div className="flex items-center justify-between">
            {notesSaved ? (
              <span className="text-xs text-[#5d2a42] font-black flex items-center gap-1">
                <Check className="w-4 h-4 text-[#5d2a42]" />
                <span>Notes saved successfully</span>
              </span>
            ) : (
              <span className="text-[11px] text-[#5d2a42]/70 font-bold">Saved to patient profile in database</span>
            )}

            <button
              onClick={handleSaveNotes}
              disabled={isSavingNotes}
              className="px-6 py-2.5 bg-[#5d2a42] text-[#fff9ec] rounded-2xl text-xs font-black shadow-md border border-[#ffdccc] hover:scale-105 transition-transform disabled:opacity-50"
            >
              {isSavingNotes ? 'Saving...' : 'Save Notes'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
