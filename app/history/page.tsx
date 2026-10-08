'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Eye, 
  Smile, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ClipboardList
} from 'lucide-react';
import { ScreeningResult } from '@/types';
import {
  Button,
  Card,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Badge,
  StatusBadge,
  EmptyState,
  Modal
} from '@/components/ui';

function HistoryContent() {
  const searchParams = useSearchParams();
  const highlightId = searchParams.get('id') || '';

  const [screenings, setScreenings] = useState<ScreeningResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'eye' | 'oral'>('all');
  const [filterOutcome, setFilterOutcome] = useState<'all' | 'review' | 'normal' | 'inconclusive'>('all');
  const [selectedRecord, setSelectedRecord] = useState<ScreeningResult | null>(null);

  useEffect(() => {
    fetch('/api/screenings')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const list = data.data as ScreeningResult[];
          setScreenings(list);
          if (highlightId) {
            const found = list.find((s) => s.screeningId === highlightId);
            if (found) setSelectedRecord(found);
          }
        }
      })
      .catch((err) => console.error('Failed fetching history:', err))
      .finally(() => setLoading(false));
  }, [highlightId]);

  const filtered = screenings.filter((s) => {
    const sType = (s as any).type || s.screeningType;
    if (filterType !== 'all' && sType !== filterType) return false;
    
    if (filterOutcome === 'review' && s.resultState !== 'potential_finding' && s.riskLevel !== 'higher_risk') return false;
    if (filterOutcome === 'normal' && s.resultState !== 'no_abnormality' && s.riskLevel !== 'lower_risk') return false;
    if (filterOutcome === 'inconclusive' && s.resultState !== 'low_confidence' && s.resultState !== 'analysis_unavailable' && s.riskLevel !== 'inconclusive') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchId = s.patientId?.toLowerCase().includes(q) || s.screeningId?.toLowerCase().includes(q);
      const matchName = s.patientName?.toLowerCase().includes(q);
      const matchPred = s.prediction?.toLowerCase().includes(q);
      return matchId || matchName || matchPred;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">Clinical Repository</Badge>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Screening Records</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Verified patient screening repository persisted in structured database storage.
          </p>
        </div>

        <Badge variant="neutral" size="md">
          {filtered.length} {filtered.length === 1 ? 'Record' : 'Records'}
        </Badge>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Patient Name, ID, or clinical finding..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="py-2 text-xs"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex rounded-xl bg-slate-100/80 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterType('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Types
              </button>
              <button
                type="button"
                onClick={() => setFilterType('eye')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'eye' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Eye
              </button>
              <button
                type="button"
                onClick={() => setFilterType('oral')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterType === 'oral' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Oral
              </button>
            </div>

            <div className="flex rounded-xl bg-slate-100/80 p-1 border border-slate-200">
              <button
                type="button"
                onClick={() => setFilterOutcome('all')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterOutcome === 'all' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Findings
              </button>
              <button
                type="button"
                onClick={() => setFilterOutcome('review')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterOutcome === 'review' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Review Advised
              </button>
              <button
                type="button"
                onClick={() => setFilterOutcome('normal')}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  filterOutcome === 'normal' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                No Abnormality
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── RECORDS TABLE ── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 font-medium">
              Loading screening records...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={ClipboardList}
                title="No matching screening records"
                description="No clinical records matched the selected query or filters."
              />
            </div>
          ) : (
            <Table containerClassName="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient / ID</TableHead>
                  <TableHead>Screening Type</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Quality Score</TableHead>
                  <TableHead>Finding</TableHead>
                  <TableHead>Review Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((record) => {
                  const sType = (record as any).type || record.screeningType;
                  return (
                    <TableRow
                      key={record.screeningId}
                      onClick={() => setSelectedRecord(record)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <span className="font-semibold text-slate-900 block">
                          {record.patientName || record.patientId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-400">
                          {record.screeningId}
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-700 capitalize text-xs">
                          {sType === 'eye' ? <Eye className="w-4 h-4 text-teal-600" /> : <Smile className="w-4 h-4 text-emerald-600" />}
                          <span>{sType === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </TableCell>

                      <TableCell className="text-slate-500 whitespace-nowrap text-xs font-medium">
                        {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <span className="font-semibold text-slate-800 text-xs">
                          {record.imageQuality?.score ?? 0}%
                        </span>
                        <span className="text-[11px] text-teal-600 ml-1.5 font-medium">
                          ({record.imageQuality?.grade ?? 'PASS'})
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={record.resultState || record.riskLevel || 'inconclusive'} />
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={record.reviewStatus || 'pending'} />
                      </TableCell>

                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                        >
                          View Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── STANDARDIZED CLINICAL REPORT MODAL ── */}
      <Modal
        isOpen={Boolean(selectedRecord)}
        onClose={() => setSelectedRecord(null)}
        title={selectedRecord ? `Screening Report: ${selectedRecord.patientName || selectedRecord.patientId}` : ''}
        description={selectedRecord ? `ID: ${selectedRecord.screeningId} • Recorded on ${new Date(selectedRecord.createdAt).toLocaleString()}` : ''}
        maxWidth="xl"
      >
        {selectedRecord && (
          <div className="space-y-5">
            {/* Specimen Image & Finding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 bg-slate-900">
                {selectedRecord.imageReference ? (
                  <img
                    src={selectedRecord.imageReference}
                    alt="Screening specimen"
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-xs text-slate-400">No Image</div>
                )}
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Clinical Finding</span>
                  <div className="font-bold text-slate-900 text-sm">{selectedRecord.prediction}</div>
                  <div className="text-slate-600 mt-1">
                    Quality: {selectedRecord.imageQuality?.grade} ({selectedRecord.imageQuality?.score}%)
                    {selectedRecord.confidence ? ` · Confidence: ${selectedRecord.confidence}%` : ''}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Review & Follow-up</span>
                  <div className="capitalize font-semibold text-slate-800">
                    Status: {selectedRecord.reviewStatus || 'Pending clinical review'}
                  </div>
                  {selectedRecord.reviewNotes && (
                    <p className="text-slate-600 italic mt-1">&quot;{selectedRecord.reviewNotes}&quot;</p>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-xl border border-slate-200 bg-teal-50/40 text-xs space-y-1">
              <span className="font-semibold text-teal-900 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Clinical Recommendation</span>
              </span>
              <p className="text-slate-700 leading-relaxed">
                {selectedRecord.recommendation}
              </p>
            </div>

            {/* Caveat */}
            <p className="text-[11px] text-slate-500 italic">
              {selectedRecord.clinicalCaveat || 'Decision support only. Clinical review mandatory.'}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              <Link
                href={`/patients/${selectedRecord.patientId}`}
                className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <span>Open Patient Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedRecord(null)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-400 font-medium">Loading screening history...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
