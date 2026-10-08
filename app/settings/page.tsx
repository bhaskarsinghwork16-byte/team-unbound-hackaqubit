'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Database, 
  Sliders, 
  ShieldCheck, 
  Server, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  Smile,
  ArrowRight
} from 'lucide-react';
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  Input
} from '@/components/ui';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(60);
  const [activeTab, setActiveTab] = useState<'facility' | 'safety' | 'system'>('facility');
  const [mongoStatus, setMongoStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking status...',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.database) setMongoStatus(d.database);
      })
      .catch(() => {
        setMongoStatus({ connected: false, message: 'Local Secure File Storage Active' });
      });
  }, []);

  const verificationScenarios = [
    {
      id: 'NORMAL_RETINA',
      title: 'Clear Retinal Specimen',
      type: 'Eye (Diabetic Retinopathy)',
      outcome: 'No obvious abnormality detected',
      href: '/screening?type=eye&demo=NORMAL_RETINA',
    },
    {
      id: 'REFERABLE_RETINA',
      title: 'Microvascular Findings Specimen',
      type: 'Eye (Diabetic Retinopathy)',
      outcome: 'Potential finding detected (Referral indicated)',
      href: '/screening?type=eye&demo=REFERABLE_RETINA',
    },
    {
      id: 'LOW_RISK_ORAL',
      title: 'Normal Oral Mucosa Specimen',
      type: 'Oral Visual Screening',
      outcome: 'No obvious abnormality detected',
      href: '/screening?type=oral&demo=LOW_RISK_ORAL',
    },
    {
      id: 'REVIEW_ORAL',
      title: 'Mucosal Lesion Specimen',
      type: 'Oral Visual Screening',
      outcome: 'Potential finding detected (Review indicated)',
      href: '/screening?type=oral&demo=REVIEW_ORAL',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── HEADER ── */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="info">System Parameters</Badge>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings & Configuration</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage facility parameters, decision-support safety gates, and storage infrastructure.
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('facility')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'facility'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Facility Profile
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('safety')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'safety'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Clinical Safety Gates
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition-colors ${
            activeTab === 'system'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          System & Model Specs
        </button>
      </div>

      {/* ── TAB 1: FACILITY PROFILE ── */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Healthcare Facility Context</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Facility identifiers linked to screening records and outgoing referrals.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Facility Name</label>
                  <input
                    type="text"
                    readOnly
                    value="District Primary Health Centre #1"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-default"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Facility Code</label>
                  <input
                    type="text"
                    readOnly
                    value="FAC-MAIN"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono font-medium cursor-default"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Attending Clinician / Operator</label>
                  <input
                    type="text"
                    readOnly
                    value="Dr. Sunita Rao"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-default"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Operator Role</label>
                  <input
                    type="text"
                    readOnly
                    value="Community Health Worker / Medical Officer"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium cursor-default"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Data Persistence & Synchronization</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Dual-mode local file storage and cloud MongoDB synchronization status.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-xl border flex items-center justify-between text-xs bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-teal-600" />
                  <div>
                    <div className="font-semibold text-slate-900">
                      Database Connection Status
                    </div>
                    <div className="text-slate-500 mt-0.5">
                      {mongoStatus.message}
                    </div>
                  </div>
                </div>
                <Badge variant={mongoStatus.connected ? 'success' : 'info'}>
                  {mongoStatus.connected ? '● MongoDB Connected' : '● Local Offline Storage Active'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── TAB 2: CLINICAL SAFETY GATES ── */}
      {activeTab === 'safety' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-bold text-slate-900">Clinical Safety Confidence Threshold</CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Strict cut-off below which the system reports &apos;Unable to determine reliably&apos; rather than guessing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="max-w-md space-y-3 text-xs">
              <div className="flex justify-between font-semibold text-slate-900">
                <span>Minimum Confidence Threshold</span>
                <span className="font-mono text-teal-700 font-bold text-sm">{threshold}%</span>
              </div>

              <input
                type="range"
                min="50"
                max="90"
                step="5"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full accent-teal-600 cursor-pointer"
              />

              <p className="text-xs text-slate-500 leading-relaxed">
                In clinical decision-support systems, a higher threshold guards against false reassurances by escalating ambiguous patterns to clinician review.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
              <h3 className="font-semibold text-slate-900">Optical Quality Standards</h3>
              <ul className="space-y-1.5 text-slate-600 text-xs">
                <li>• <strong className="text-slate-900">Laplacian Variance Blur Filter:</strong> Minimum variance threshold = 100</li>
                <li>• <strong className="text-slate-900">Mean Luminance Exposure Gate:</strong> 25 - 225 out of 255</li>
                <li>• <strong className="text-slate-900">Contrast Dynamic Range:</strong> Minimum 20.0 standard deviation</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── TAB 3: SYSTEM & MODEL SPECS ── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Machine Learning Specifications</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Architectures, quantization levels, and reference datasets.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-200/70 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-teal-700 block">Eye Protocol</span>
                  <div className="font-bold text-slate-900">HealthScreen-DR-v1.2</div>
                  <div className="text-slate-600 text-xs">Architecture: MobileNetV3-Large (Quantized INT8)</div>
                  <div className="text-slate-500 text-[11px]">Reference Dataset: APTOS 2019 Blindness Detection</div>
                </div>

                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-200/70 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Oral Protocol</span>
                  <div className="font-bold text-slate-900">HealthScreen-Oral-v1.1</div>
                  <div className="text-slate-600 text-xs">Architecture: EfficientNet-Lite0 (Quantized INT8)</div>
                  <div className="text-slate-500 text-[11px]">Reference Dataset: Oral Cavity Visual Dataset</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Verification & Test Encounters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-bold text-slate-900">Clinical Verification Specimens</CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Pre-calibrated specimens for validating end-to-end optical quality and analysis pipelines.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {verificationScenarios.map((item) => (
                  <Link
                    key={item.id}
                    href={item.href}
                    className="p-4 bg-slate-50 hover:bg-teal-50/50 rounded-xl border border-slate-200 hover:border-teal-300 transition-colors flex flex-col justify-between group"
                  >
                    <div>
                      <div className="font-semibold text-slate-900 group-hover:text-teal-700">
                        {item.title}
                      </div>
                      <div className="text-xs text-teal-700 font-medium mt-0.5">
                        {item.type}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Expected outcome: {item.outcome}
                      </div>
                    </div>
                    <div className="mt-3 flex items-center text-teal-600 font-semibold text-xs group-hover:translate-x-0.5 transition-transform">
                      <span>Run Verification Specimen</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
