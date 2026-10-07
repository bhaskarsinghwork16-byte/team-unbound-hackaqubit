'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  GitPullRequest, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  ExternalLink,
  ChevronDown,
  Building,
  User
} from 'lucide-react';
import { ReferralRecord, ReferralStatus, ReferralPriority } from '@/types';
import FlexCarousel from '@/components/FlexCarousel';

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<ReferralRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchReferrals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (priorityFilter !== 'all') params.set('priority', priorityFilter);

      const res = await fetch(`/api/referrals?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReferrals(data.referrals || []);
      }
    } catch (err) {
      console.error('Error fetching referrals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, [statusFilter, priorityFilter]);

  const handleUpdateStatus = async (referralId: string, newStatus: ReferralStatus) => {
    try {
      setUpdatingId(referralId);
      const res = await fetch(`/api/referrals/${referralId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setReferrals((prev) =>
          prev.map((r) => (r.referralId === referralId ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update referral status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const getPriorityBadge = (priority: ReferralPriority) => {
    switch (priority) {
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#ffdccc] text-[11px] font-black uppercase tracking-wider">
            Urgent
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#ffdccc] text-[#5d2a42] border border-[#fec89a] text-[11px] font-extrabold uppercase tracking-wider">
            Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc] text-[11px] font-bold uppercase tracking-wider">
            Routine
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-[#d8e2dc] text-[#5d2a42] border-[#c4d4cc]';
      case 'reviewed':
        return 'bg-[#ffdccc] text-[#5d2a42] border-[#fec89a]';
      case 'referral_recommended':
        return 'bg-[#fec89a] text-[#5d2a42] border-[#ffdccc]';
      case 'follow_up_required':
        return 'bg-[#fec89a] text-[#5d2a42] border-[#ffdccc]';
      default:
        return 'bg-[#fff9ec] text-[#5d2a42] border-[#d8e2dc]';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-[#d8e2dc]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] bg-[#ffdccc] text-[#5d2a42] px-2.5 py-0.5 rounded-full border border-[#fec89a] font-bold tracking-wide">
              SPECIALIST REFERRALS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#5d2a42]">Referrals</h1>
          <p className="text-sm text-[#5d2a42]/70 font-medium mt-1">
            Clinical specialist referrals and community follow-up tracker.
          </p>
        </div>
      </div>

      {/* ── 3D WEBGL FLEXCAROUSEL REFERRAL HUBS CAROUSEL ── */}
      <div className="w-full h-[320px] relative rounded-3xl overflow-hidden border border-[#d8e2dc] bg-[#fff9ec] shadow-md shadow-[#5d2a42]/5">
        <FlexCarousel
          items={[
            {
              src: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80&auto=format&fit=max',
              alt: 'District Ophthalmology Center',
              title: '👁️ District Eye Hospital',
              subtitle: 'Retinal Specialist & Laser Clinic'
            },
            {
              src: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&q=80&auto=format&fit=max',
              alt: 'Oral Medicine & ENT Clinic',
              title: '👄 ENT & Maxillofacial Hub',
              subtitle: 'Pre-Cancerous Biopsy & Screening Unit'
            },
            {
              src: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&q=80&auto=format&fit=max',
              alt: 'Regional Tertiary Medical Center',
              title: '🏥 Regional Medical Center',
              subtitle: 'Tertiary Escalation & Tele-Triage'
            },
            {
              src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80&auto=format&fit=max',
              alt: 'Mobile Tele-Ophthalmology Van',
              title: '🚐 Mobile Tele-Refraction Unit',
              subtitle: 'Community Camp Escalation Van'
            }
          ]}
          preset="liquid"
          intro="rise"
          cardHeight={0.65}
          gap={14}
          squeeze={0.2}
          focusOnClick
          captions
        />
      </div>

      {/* ── FILTER CHIPS ── */}
      <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-[#5d2a42] mr-2">Status:</span>
          {[
            { id: 'all', label: 'All' },
            { id: 'pending', label: 'Pending' },
            { id: 'reviewed', label: 'Reviewed' },
            { id: 'referral_recommended', label: 'Referral Recommended' },
            { id: 'follow_up_required', label: 'Follow-up Due' },
            { id: 'completed', label: 'Completed' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                statusFilter === item.id
                  ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm'
                  : 'text-[#5d2a42] hover:bg-[#ffdccc]/50 bg-[#ffdccc]/20 border border-[#fec89a]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[#5d2a42]">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42] text-xs font-bold focus:outline-hidden focus:border-[#5d2a42]"
          >
            <option value="all" className="bg-[#fff9ec] text-[#5d2a42]">All Priorities</option>
            <option value="routine" className="bg-[#fff9ec] text-[#5d2a42]">Routine</option>
            <option value="priority" className="bg-[#fff9ec] text-[#5d2a42]">Priority</option>
            <option value="urgent" className="bg-[#fff9ec] text-[#5d2a42]">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── REFERRALS TABLE ── */}
      <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-xs text-[#5d2a42]/70 font-bold">
            Loading referral records...
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#ffdccc] text-[#5d2a42] mx-auto flex items-center justify-center border border-[#fec89a]">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-[#5d2a42]">No active referrals</h3>
            <p className="text-xs text-[#5d2a42]/70 max-w-sm mx-auto">
              Patients requiring specialist evaluation or secondary care will appear here once referred from a screening session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5d2a42] text-[#fff9ec] uppercase tracking-wider font-black border-b border-[#5d2a42]">
                <tr>
                  <th className="py-3.5 px-5">REFERRAL ID</th>
                  <th className="py-3.5 px-5">PATIENT</th>
                  <th className="py-3.5 px-5">SCREENING ID</th>
                  <th className="py-3.5 px-5">FACILITY</th>
                  <th className="py-3.5 px-5">REASON</th>
                  <th className="py-3.5 px-5">PRIORITY</th>
                  <th className="py-3.5 px-5">STATUS</th>
                  <th className="py-3.5 px-5">DATE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#d8e2dc] text-[#5d2a42]">
                {referrals.map((r) => (
                  <tr key={r.referralId} className="hover:bg-[#ffdccc]/20 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-black text-[#5d2a42] whitespace-nowrap">
                      {r.referralId}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/patients/${r.patientId}`}
                        className="font-bold text-[#5d2a42] hover:underline block transition-colors"
                      >
                        {r.patientName || r.patientId}
                      </Link>
                      <span className="text-[11px] font-mono text-[#5d2a42]/70 font-medium">{r.patientId}</span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/history?id=${r.screeningId}`}
                        className="text-[#5d2a42] hover:underline font-mono text-xs flex items-center gap-1 font-bold"
                      >
                        <span>{r.screeningId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-[#5d2a42]">{r.specialistType}</div>
                      <div className="text-[11px] text-[#5d2a42]/70">{r.destinationFacility}</div>
                    </td>
                    <td className="py-3.5 px-5 text-[#5d2a42] max-w-xs font-medium">
                      <span className="line-clamp-2">{r.reason}</span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      {getPriorityBadge(r.priority)}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <select
                        value={r.status}
                        disabled={updatingId === r.referralId}
                        onChange={(e) => handleUpdateStatus(r.referralId, e.target.value as ReferralStatus)}
                        className={`text-xs font-bold px-2.5 py-1 rounded-xl border ${getStatusBadge(r.status)} focus:outline-hidden`}
                      >
                        <option value="pending" className="bg-[#fff9ec] text-[#5d2a42]">Pending</option>
                        <option value="reviewed" className="bg-[#fff9ec] text-[#5d2a42]">Reviewed</option>
                        <option value="referral_recommended" className="bg-[#fff9ec] text-[#5d2a42]">Referral Recommended</option>
                        <option value="follow_up_required" className="bg-[#fff9ec] text-[#5d2a42]">Follow-up Required</option>
                        <option value="completed" className="bg-[#fff9ec] text-[#5d2a42]">Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-[#5d2a42]/70 whitespace-nowrap font-bold">
                      {formatDate(r.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
