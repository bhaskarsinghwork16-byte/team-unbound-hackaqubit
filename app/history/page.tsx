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

  const getResultBadge = (record: ScreeningResult) => {
    if (record.resultState === 'potential_finding' || record.riskLevel === 'higher_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#5d2a42]/30 text-xs font-black shadow-xs">
          <AlertCircle className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (record.resultState === 'no_abnormality' || record.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc] text-xs font-black shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#5d2a42]" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#d8e2dc] text-xs font-black">
        <HelpCircle className="w-3.5 h-3.5 text-[#5d2a42]" />
        <span>Inconclusive</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#d8e2dc]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel text-[10px] bg-[#ffdccc] text-[#5d2a42] px-3 py-0.5 rounded-full border border-[#d8e2dc] font-black tracking-wide">
              CLINICAL REPOSITORY
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#5d2a42] tracking-tight">Screening Records</h1>
          <p className="text-xs text-[#5d2a42]/80 mt-1 font-bold">
            Permanent patient screening repository persisted in database storage.
          </p>
        </div>

        <span className="pixel text-xs font-black px-4 py-1.5 rounded-full bg-[#5d2a42] text-[#fff9ec] border border-[#ffdccc] shadow-md shadow-[#5d2a42]/20">
          {filtered.length} {filtered.length === 1 ? 'SCREENING' : 'SCREENINGS'}
        </span>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5d2a42] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name, ID, or clinical finding..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-2xl text-xs text-[#5d2a42] font-bold placeholder-[#5d2a42]/60 focus:outline-none focus:border-[#5d2a42] transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-2xl bg-[#fff9ec] p-1.5 border border-[#d8e2dc]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterType === 'all' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('eye')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterType === 'eye' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              Eye
            </button>
            <button
              onClick={() => setFilterType('oral')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterType === 'oral' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              Oral
            </button>
          </div>

          <div className="flex rounded-2xl bg-[#fff9ec] p-1.5 border border-[#d8e2dc]">
            <button
              onClick={() => setFilterOutcome('all')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterOutcome === 'all' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              All Findings
            </button>
            <button
              onClick={() => setFilterOutcome('review')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterOutcome === 'review' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              Review Advised
            </button>
            <button
              onClick={() => setFilterOutcome('normal')}
              className={`px-3 py-1 rounded-xl font-bold transition ${
                filterOutcome === 'normal' ? 'bg-[#5d2a42] text-[#fff9ec] shadow-sm' : 'text-[#5d2a42] hover:bg-[#ffdccc]/50'
              }`}
            >
              No Abnormality
            </button>
          </div>
        </div>
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5d2a42] text-[#fff9ec] uppercase tracking-wider font-black border-b border-[#d8e2dc]">
                <tr>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">PATIENT / ID</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">SCREENING TYPE</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">DATE &amp; TIME</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">QUALITY SCORE</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">FINDING</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">REVIEW STATUS</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/15 text-slate-200">
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

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 font-bold text-[#5d2a42] capitalize">
                          {sType === 'eye' ? <Eye className="w-4 h-4 text-[#5d2a42]" /> : <Smile className="w-4 h-4 text-[#5d2a42]" />}
                          <span>{sType === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </TableCell>

                      <td className="py-4 px-5 text-[#5d2a42]/80 whitespace-nowrap font-bold">
                        {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </TableCell>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-black text-[#5d2a42]">
                          {record.imageQuality?.score ?? 0}%
                        </span>
                        <span className="text-[11px] text-[#5d2a42]/80 ml-1.5 font-bold">
                          ({record.imageQuality?.grade ?? 'PASS'})
                        </span>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={record.resultState || record.riskLevel || 'inconclusive'} />
                      </TableCell>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {record.reviewStatus === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc] text-xs font-black">
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#5d2a42]" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fec89a] text-[#5d2a42] border border-[#ffdccc] text-xs font-black shadow-xs">
                            <Clock className="w-3.5 h-3.5 text-[#5d2a42]" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                          className="px-3 py-1 rounded-xl border border-[#fec89a] bg-[#ffdccc] hover:bg-[#fec89a] text-[#5d2a42] font-black text-xs transition"
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

            <div className="pt-2 flex items-center justify-between border-t border-[#d8e2dc]">
              <Link
                href={`/patients/${selectedRecord.patientId}`}
                className="text-xs font-bold text-[#5d2a42] hover:underline flex items-center gap-1"
              >
                <span>Open Patient Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-xl bg-[#5d2a42] text-[#fff9ec] font-bold text-xs hover:bg-[#4a2135]"
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
