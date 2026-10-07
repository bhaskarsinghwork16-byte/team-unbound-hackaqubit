'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Eye, 
  Smile, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle,
  HelpCircle,
  X, 
  ShieldCheck, 
  Clock,
  ArrowRight,
  ExternalLink,
  GitPullRequest
} from 'lucide-react';
import { ScreeningResult } from '@/types';

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
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold">
          <AlertCircle className="w-3 h-3 text-amber-600" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (record.resultState === 'no_abnormality' || record.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium">
        <HelpCircle className="w-3 h-3 text-slate-500" />
        <span>Inconclusive</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-200/80">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Screening Records</h1>
          <p className="text-sm text-slate-500 mt-1">
            Permanent patient screening repository persisted in database.
          </p>
        </div>

        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
          {filtered.length} {filtered.length === 1 ? 'Screening' : 'Screenings'}
        </span>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/90 shadow-2xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name, ID, or clinical finding..."
            className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('eye')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'eye' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Eye
            </button>
            <button
              onClick={() => setFilterType('oral')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterType === 'oral' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Oral
            </button>
          </div>

          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setFilterOutcome('all')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterOutcome === 'all' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Findings
            </button>
            <button
              onClick={() => setFilterOutcome('review')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterOutcome === 'review' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Review Advised
            </button>
            <button
              onClick={() => setFilterOutcome('normal')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterOutcome === 'normal' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              No Abnormality
            </button>
          </div>
        </div>
      </div>

      {/* ── RECORDS TABLE ── */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-500">
            Loading screening records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">No matching screening records</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No clinical records matched the selected query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Patient / ID</th>
                  <th className="py-3 px-4">Screening Type</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Quality Score</th>
                  <th className="py-3 px-4">Algorithm Finding</th>
                  <th className="py-3 px-4">Review Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((record) => {
                  const sType = (record as any).type || record.screeningType;
                  return (
                    <tr
                      key={record.screeningId}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-slate-50/60 cursor-pointer transition"
                    >
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">
                          {record.patientName || record.patientId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {record.screeningId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 font-medium text-slate-700 capitalize">
                          {sType === 'eye' ? <Eye className="w-3.5 h-3.5 text-teal-600" /> : <Smile className="w-3.5 h-3.5 text-emerald-600" />}
                          <span>{sType === 'eye' ? 'Eye screening' : 'Oral screening'}</span>
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800">
                          {record.imageQuality?.score ?? 0}%
                        </span>
                        <span className="text-[11px] text-slate-500 ml-1">
                          ({record.imageQuality?.grade ?? 'PASS'})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getResultBadge(record)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {record.reviewStatus === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>Pending</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRecord(record);
                          }}
                          className="px-2.5 py-1 rounded-md border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── INSPECTION & CLINICAL REPORT MODAL ── */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-5">
            <div className="flex justify-between items-start pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Screening Report: {selectedRecord.patientName || selectedRecord.patientId}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  ID: {selectedRecord.screeningId} • Recorded on {new Date(selectedRecord.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Specimen Image & Finding */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative aspect-4/3 rounded-lg overflow-hidden border border-slate-200 bg-black">
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
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Finding</span>
                  <div className="font-bold text-slate-900">{selectedRecord.prediction}</div>
                  <div className="text-slate-600 mt-1">
                    Quality: {selectedRecord.imageQuality?.grade} ({selectedRecord.imageQuality?.score}%)
                    {selectedRecord.confidence ? ` · Confidence: ${selectedRecord.confidence}%` : ''}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Review & Follow-up</span>
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
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Clinical Recommendation</span>
              </span>
              <p className="text-slate-600 leading-relaxed">
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
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>Open Patient Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={() => setSelectedRecord(null)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading screening history...</div>}>
      <HistoryContent />
    </Suspense>
  );
}
