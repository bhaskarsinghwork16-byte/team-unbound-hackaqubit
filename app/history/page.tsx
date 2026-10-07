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
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
          <span>Potential finding</span>
        </span>
      );
    }
    if (record.resultState === 'no_abnormality' || record.riskLevel === 'lower_risk') {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(34,197,94,0.25)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>No abnormality</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-500/15 text-slate-300 border border-slate-500/40 text-xs font-medium">
        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        <span>Inconclusive</span>
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel text-[10px] bg-emerald-500/15 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/30 font-bold tracking-wide">
              CLINICAL REPOSITORY
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Screening Records</h1>
          <p className="text-xs text-slate-400 mt-1">
            Permanent patient screening repository persisted in database storage.
          </p>
        </div>

        <span className="pixel text-xs font-bold px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
          {filtered.length} {filtered.length === 1 ? 'SCREENING' : 'SCREENINGS'}
        </span>
      </div>

      {/* ── SEARCH & FILTER CONTROLS (3D DARK GLASS) ── */}
      <div className="glass-container-3d p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-teal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient Name, ID, or clinical finding..."
            className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-teal-400 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex rounded-xl bg-black/40 p-1.5 border border-teal-500/20">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterType === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setFilterType('eye')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterType === 'eye' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Eye
            </button>
            <button
              onClick={() => setFilterType('oral')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterType === 'oral' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Oral
            </button>
          </div>

          <div className="flex rounded-xl bg-black/40 p-1.5 border border-teal-500/20">
            <button
              onClick={() => setFilterOutcome('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'all' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              All Findings
            </button>
            <button
              onClick={() => setFilterOutcome('review')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'review' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              Review Advised
            </button>
            <button
              onClick={() => setFilterOutcome('normal')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                filterOutcome === 'normal' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              No Abnormality
            </button>
          </div>
        </div>
      </div>

      {/* ── RECORDS TABLE (3D DARK GLASS) ── */}
      <div className="glass-table-container overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading screening records...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <h3 className="text-sm font-bold text-white">No matching screening records</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              No clinical records matched the selected query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-black/60 text-slate-300 uppercase tracking-wider font-bold border-b border-teal-500/20">
                <tr>
                  <th className="py-3.5 px-5">PATIENT / ID</th>
                  <th className="py-3.5 px-5">SCREENING TYPE</th>
                  <th className="py-3.5 px-5">DATE & TIME</th>
                  <th className="py-3.5 px-5">QUALITY SCORE</th>
                  <th className="py-3.5 px-5">FINDING</th>
                  <th className="py-3.5 px-5">REVIEW STATUS</th>
                  <th className="py-3.5 px-5 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/15 text-slate-200">
                {filtered.map((record) => {
                  const sType = (record as any).type || record.screeningType;
                  return (
                    <tr
                      key={record.screeningId}
                      onClick={() => setSelectedRecord(record)}
                      className="hover:bg-white/5 cursor-pointer transition-colors"
                    >
                      <td className="py-4 px-5">
                        <span className="font-bold text-white block">
                          {record.patientName || record.patientId}
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 font-medium">
                          {record.screeningId}
                        </span>
                      </td>

                      <td className="py-4 px-5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-2 font-medium text-slate-200 capitalize">
                          {sType === 'eye' ? <Eye className="w-4 h-4 text-cyan-400" /> : <Smile className="w-4 h-4 text-emerald-400" />}
                          <span>{sType === 'eye' ? 'Eye Screening' : 'Oral Screening'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-5 text-slate-300 whitespace-nowrap font-medium">
                        {new Date(record.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} · {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-bold text-white">
                          {record.imageQuality?.score ?? 0}%
                        </span>
                        <span className="text-[11px] text-emerald-400 ml-1.5 font-semibold">
                          ({record.imageQuality?.grade ?? 'PASS'})
                        </span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getResultBadge(record)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {record.reviewStatus === 'reviewed' ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Reviewed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-400 font-bold">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
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
                          className="px-3 py-1 rounded-xl border border-teal-400/40 bg-teal-500/20 hover:bg-teal-500/30 text-emerald-300 font-bold text-xs transition"
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
