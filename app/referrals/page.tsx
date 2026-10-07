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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-red-50 text-red-700 border border-red-200 text-[11px] font-bold uppercase tracking-wider">
            Urgent
          </span>
        );
      case 'priority':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold uppercase tracking-wider">
            Priority
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium uppercase tracking-wider">
            Routine
          </span>
        );
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'reviewed':
        return 'bg-teal-50 text-teal-800 border-teal-200';
      case 'referral_recommended':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'follow_up_required':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-teal-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-semibold tracking-wide">
              SPECIALIST REFERRALS
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">Referrals</h1>
          <p className="text-sm text-slate-300 font-medium mt-1">
            Clinical specialist referrals and community follow-up tracker.
          </p>
        </div>
      </div>

      {/* ── FILTER CHIPS (3D DARK GLASS) ── */}
      <div className="glass-container-3d p-4 flex flex-wrap gap-4 items-center justify-between">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-300 mr-2">Status:</span>
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
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                  : 'text-slate-300 hover:text-white hover:bg-white/5 border border-teal-500/20'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-300">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 bg-black/50 border border-teal-500/30 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-teal-400"
          >
            <option value="all" className="bg-[#0a1a1c] text-white">All Priorities</option>
            <option value="routine" className="bg-[#0a1a1c] text-white">Routine</option>
            <option value="priority" className="bg-[#0a1a1c] text-white">Priority</option>
            <option value="urgent" className="bg-[#0a1a1c] text-white">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── REFERRALS TABLE (3D DARK GLASS) ── */}
      <div className="glass-table-container overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-300 font-medium">
            Loading referral records...
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 text-blue-400 mx-auto flex items-center justify-center border border-blue-500/20">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No active referrals</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Patients requiring specialist evaluation or secondary care will appear here once referred from a screening session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-300 uppercase tracking-wider font-bold border-b border-teal-500/20">
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
              <tbody className="divide-y divide-teal-500/15 text-slate-200">
                {referrals.map((r) => (
                  <tr key={r.referralId} className="hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-5 font-mono font-semibold text-emerald-400 whitespace-nowrap">
                      {r.referralId}
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/patients/${r.patientId}`}
                        className="font-bold text-white hover:text-emerald-400 block transition-colors"
                      >
                        {r.patientName || r.patientId}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-300 font-medium">{r.patientId}</span>
                    </td>
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <Link
                        href={`/history?id=${r.screeningId}`}
                        className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>{r.screeningId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-semibold text-white">{r.specialistType}</div>
                      <div className="text-[11px] text-slate-300">{r.destinationFacility}</div>
                    </td>
                    <td className="py-3.5 px-5 text-slate-200 max-w-xs">
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
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-black/60 text-white ${getStatusBadge(r.status)} focus:outline-none`}
                      >
                        <option value="pending" className="bg-[#0a1a1c] text-white">Pending</option>
                        <option value="reviewed" className="bg-[#0a1a1c] text-white">Reviewed</option>
                        <option value="referral_recommended" className="bg-[#0a1a1c] text-white">Referral Recommended</option>
                        <option value="follow_up_required" className="bg-[#0a1a1c] text-white">Follow-up Required</option>
                        <option value="completed" className="bg-[#0a1a1c] text-white">Completed</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-slate-300 whitespace-nowrap font-medium">
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
