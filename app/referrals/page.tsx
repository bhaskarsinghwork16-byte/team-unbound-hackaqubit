'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  GitPullRequest, 
  ExternalLink,
  Building,
  User,
  Filter,
  AlertCircle,
  Clock,
  CheckCircle2,
  Activity,
  ArrowRight
} from 'lucide-react';
import { ReferralRecord, ReferralStatus, ReferralPriority } from '@/types';
import {
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  Badge,
  EmptyState,
  Select,
  Button
} from '@/components/ui';

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
        return <Badge variant="error">Urgent Escalation</Badge>;
      case 'priority':
        return <Badge variant="warning">Priority</Badge>;
      default:
        return <Badge variant="neutral">Routine</Badge>;
    }
  };

  // Quick metrics calculations
  const totalCount = referrals.length;
  const urgentCount = referrals.filter((r) => r.priority === 'urgent').length;
  const pendingCount = referrals.filter((r) => r.status === 'pending' || r.status === 'referral_recommended').length;
  const completedCount = referrals.filter((r) => r.status === 'completed').length;

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <GitPullRequest className="w-3.5 h-3.5 text-teal-600" />
              <span>Specialist Escalation Tracker</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Specialist Referrals</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Secondary care routing, clinical tele-consults, and community follow-up tracker.
          </p>
        </div>

        <Link href="/screening">
          <Button variant="primary" size="sm" icon={<Activity className="w-4 h-4" />}>
            <span>+ New Screening Triage</span>
          </Button>
        </Link>
      </div>

      {/* ── REFERRAL METRICS SUMMARY ROW ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Referrals</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{loading ? '—' : totalCount}</div>
          <p className="text-[11px] text-slate-400 mt-0.5">All registered cases</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3 text-rose-600" />
            Urgent Triage
          </span>
          <div className="text-2xl font-extrabold text-rose-700 mt-1">{loading ? '—' : urgentCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Immediate hospital consult</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-amber-200 bg-amber-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pending Routing
          </span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1">{loading ? '—' : pendingCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Awaiting specialist visit</p>
        </div>
        <div className="p-4 rounded-xl bg-white border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Completed
          </span>
          <div className="text-2xl font-extrabold text-emerald-700 mt-1">{loading ? '—' : completedCount}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Confirmed resolution</p>
        </div>
      </div>

      {/* ── FILTER CHIPS ── */}
      <Card className="shadow-2xs">
        <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-slate-500 mr-2">Status:</span>
            {[
              { id: 'all', label: 'All Cases' },
              { id: 'pending', label: 'Pending' },
              { id: 'reviewed', label: 'Reviewed' },
              { id: 'referral_recommended', label: 'Referral Recommended' },
              { id: 'follow_up_required', label: 'Follow-up Due' },
              { id: 'completed', label: 'Completed' },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setStatusFilter(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === item.id
                    ? 'bg-teal-50 text-teal-900 border border-teal-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer"
            >
              <option value="all">All Priorities</option>
              <option value="routine">Routine</option>
              <option value="priority">Priority</option>
              <option value="urgent">Urgent Escalation</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* ── REFERRALS TABLE ── */}
      <Card className="shadow-2xs">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">
              Loading referral records...
            </div>
          ) : referrals.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={GitPullRequest}
                title="No active referrals found"
                description="Patients requiring specialist evaluation or secondary care will appear here once escalated from a screening session."
              />
            </div>
          ) : (
            <Table containerClassName="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Referral ID</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Screening ID</TableHead>
                  <TableHead>Specialist &amp; Facility</TableHead>
                  <TableHead>Clinical Indication</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {referrals.map((r) => (
                  <TableRow key={r.referralId}>
                    <TableCell className="font-mono font-bold text-teal-700 text-xs whitespace-nowrap">
                      {r.referralId}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/patients/${r.patientId}`}
                        className="font-bold text-slate-900 hover:text-teal-600 block transition-colors"
                      >
                        {r.patientName || r.patientId}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">{r.patientId}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/history?id=${r.screeningId}`}
                        className="text-teal-600 hover:text-teal-700 font-mono text-xs flex items-center gap-1 transition-colors"
                      >
                        <span>{r.screeningId}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-900 text-xs">{r.specialistType}</div>
                      <div className="text-[11px] text-slate-500 font-medium">{r.destinationFacility}</div>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs max-w-xs">
                      <span className="line-clamp-2">{r.reason}</span>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {getPriorityBadge(r.priority)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <select
                        value={r.status}
                        disabled={updatingId === r.referralId}
                        onChange={(e) => handleUpdateStatus(r.referralId, e.target.value as ReferralStatus)}
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 cursor-pointer disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="referral_recommended">Referral Recommended</option>
                        <option value="follow_up_required">Follow-up Due</option>
                        <option value="completed">Completed</option>
                      </select>
                    </TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap text-xs font-medium">
                      {formatDate(r.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
