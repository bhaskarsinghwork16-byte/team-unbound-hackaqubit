'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Database,
  FolderOpen,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Download,
  Copy,
  Check,
  HardDrive,
  Table,
  Layers,
  ArrowRight,
  ExternalLink,
  Shield,
  Eye,
  Smile,
  Users,
  GitPullRequest
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Badge,
  Input
} from '@/components/ui';

interface CollectionData {
  name: string;
  displayName: string;
  count: number;
  fileInfo: {
    exists: boolean;
    sizeBytes: number;
    sizeFormatted: string;
    updatedAt: string | null;
  };
  description: string;
  documents: any[];
}

interface DatabaseInfo {
  name: string;
  uri: string;
  connected: boolean;
  statusMessage: string;
  storageEngine: string;
  dataDirectory: string;
}

export default function DatabasePage() {
  const [data, setData] = useState<{ database: DatabaseInfo; collections: CollectionData[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCollection, setActiveCollection] = useState<string>('screenings');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [openingFolder, setOpeningFolder] = useState(false);
  const [folderOpenSuccess, setFolderOpenSuccess] = useState(false);

  const fetchDatabaseInfo = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/database');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load database explorer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseInfo();
  }, []);

  const handleOpenFolder = async () => {
    try {
      setOpeningFolder(true);
      const res = await fetch('/api/database/open-folder', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setFolderOpenSuccess(true);
        setTimeout(() => setFolderOpenSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Error opening folder:', err);
    } finally {
      setOpeningFolder(false);
    }
  };

  const handleCopyJson = (doc: any, id: string) => {
    navigator.clipboard.writeText(JSON.stringify(doc, null, 2));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const currentCol = data?.collections.find((c) => c.name === activeCollection) || data?.collections[0];

  const filteredDocs = (currentCol?.documents || []).filter((doc: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const str = JSON.stringify(doc).toLowerCase();
    return str.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-bold">
              <Database className="w-3.5 h-3.5 text-teal-600" />
              <span>MongoDB &amp; Offline Storage Engine</span>
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Database &amp; Collections Explorer</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Inspect raw collections, documents, records, and on-disk JSON storage in real time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            icon={<FolderOpen className="w-4 h-4 text-teal-600" />}
            onClick={handleOpenFolder}
            isLoading={openingFolder}
          >
            <span>{folderOpenSuccess ? 'Folder Opened!' : 'Open in Windows Explorer'}</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={fetchDatabaseInfo}
          >
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* ── STORAGE STATUS CARD ── */}
      {data && (
        <Card className="shadow-xs border-teal-100 bg-gradient-to-r from-teal-50/50 via-slate-50 to-white">
          <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                <HardDrive className="w-4 h-4 text-teal-600" />
                <span>Active Storage Engine:</span>
                <span className="font-bold text-slate-900">{data.database.storageEngine}</span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                Database Name: <span className="font-mono font-bold text-teal-800 bg-white px-2 py-0.5 rounded border border-slate-200">{data.database.name}</span>
                <span className="mx-2 text-slate-300">|</span>
                Data Directory: <span className="font-mono text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px]">{data.database.dataDirectory}</span>
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                  data.database.connected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{data.database.connected ? 'Connected to MongoDB Atlas' : 'Offline JSON Sync Ready'}</span>
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TWO-COLUMN BROWSER ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Collections List */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block px-1">
            Collections &amp; Tables
          </span>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading collections...</div>
          ) : (
            data?.collections.map((col) => {
              const isActive = activeCollection === col.name;
              return (
                <button
                  key={col.name}
                  onClick={() => {
                    setActiveCollection(col.name);
                    setSearchQuery('');
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isActive
                      ? 'bg-white border-teal-500 shadow-md ring-1 ring-teal-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActive ? 'bg-teal-50 text-teal-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {col.name === 'screenings' && <Eye className="w-4 h-4" />}
                        {col.name === 'patients' && <Users className="w-4 h-4" />}
                        {col.name === 'referrals' && <GitPullRequest className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{col.displayName}</h4>
                        <span className="font-mono text-[11px] text-teal-700 font-semibold">{col.name}</span>
                      </div>
                    </div>

                    <Badge variant={isActive ? 'info' : 'neutral'}>
                      {col.count} {col.count === 1 ? 'doc' : 'docs'}
                    </Badge>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2.5 leading-relaxed line-clamp-2">
                    {col.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                    <span>File size: {col.fileInfo.sizeFormatted}</span>
                    <span className="text-teal-600 font-sans font-bold">Select &rarr;</span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Column: Documents Viewer */}
        <div className="lg:col-span-8 space-y-4">
          <Card className="shadow-2xs">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span>Collection:</span>
                  <span className="font-mono text-teal-700 font-bold bg-teal-50 px-2.5 py-0.5 rounded border border-teal-200">
                    {currentCol?.name}
                  </span>
                  <span className="text-xs font-normal text-slate-400">
                    ({filteredDocs.length} matching)
                  </span>
                </CardTitle>
              </div>

              {/* Live search input */}
              <div className="w-full sm:w-64">
                <Input
                  className="h-9"
                  placeholder="Filter documents (e.g. PT-1052)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4 max-h-[680px] overflow-y-auto">
              {filteredDocs.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400">
                  No documents found matching "{searchQuery}".
                </div>
              ) : (
                filteredDocs.map((doc: any, index: number) => {
                  const docId = doc._id || doc.screeningId || doc.patientId || doc.referralId || `doc-${index}`;
                  const isCopied = copiedId === docId;

                  return (
                    <div
                      key={docId}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 overflow-hidden text-xs shadow-2xs hover:border-slate-300 transition-colors"
                    >
                      {/* Document Card Header */}
                      <div className="p-3 bg-white border-b border-slate-200 flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono font-bold text-slate-800">
                          <span className="text-slate-400 font-normal">#{index + 1}</span>
                          <span className="text-teal-700">{docId}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopyJson(doc, docId)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-700">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy JSON</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Raw JSON Code Display */}
                      <pre className="p-3 text-[11px] font-mono leading-relaxed text-slate-800 overflow-x-auto bg-slate-900 text-slate-100 rounded-b-xl select-all">
                        {JSON.stringify(doc, null, 2)}
                      </pre>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
