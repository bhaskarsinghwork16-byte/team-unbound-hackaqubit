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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Referrals</h1>
          <p className="text-sm text-slate-500 mt-1">
            Clinical specialist referrals and community follow-up tracker.
          </p>
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 mr-2">Status:</span>
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
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition ${
                statusFilter === item.id
                  ? 'bg-teal-600 text-white font-semibold shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md text-slate-800 text-xs font-medium"
          >
            <option value="all">All Priorities</option>
            <option value="routine">Routine</option>
            <option value="priority">Priority</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* ── REFERRALS TABLE ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading referral records...
          </div>
        ) : referrals.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <GitPullRequest className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No active referrals</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Patients requiring specialist evaluation or secondary care will appear here once referred from a screening session.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Referral ID</th>
                  <th className="py-3 px-4">Patient</th>
                  <th className="py-3 px-4">Screening ID</th>
                  <th className="py-3 px-4">Specialist / Facility</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Priority</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {referrals.map((r) => (
                  <tr key={r.referralId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 whitespace-nowrap">
                      {r.referralId}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/patients/${r.patientId}`}
                        className="font-bold text-slate-900 hover:text-teal-700 block"
                      >
                        {r.patientName || r.patientId}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-500">{r.patientId}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <Link
                        href={`/history?id=${r.screeningId}`}
                        className="text-teal-700 hover:underline font-mono text-xs flex items-center gap-1"
                      >
                        <span>{r.screeningId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{r.specialistType}</div>
                      <div className="text-[11px] text-slate-500">{r.destinationFacility}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700 max-w-xs">
                      <span className="line-clamp-2">{r.reason}</span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {getPriorityBadge(r.priority)}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <select
                        value={r.status}
                        disabled={updatingId === r.referralId}
                        onChange={(e) => handleUpdateStatus(r.referralId, e.target.value as ReferralStatus)}
                        className={`text-xs font-semibold px-2 py-1 rounded-md border ${getStatusBadge(r.status)} focus:outline-hidden`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="referral_recommended">Referral Recommended</option>
                        <option value="follow_up_required">Follow-up Required</option>
                        <option value="completed">Completed</option>
                      </select>
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
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
