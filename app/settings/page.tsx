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
  ArrowRight,
  ChevronDown
} from 'lucide-react';

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(60);
  const [activeTab, setActiveTab] = useState<'facility' | 'safety' | 'system'>('facility');
  const [mongoStatus, setMongoStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking status...',
  });
  const [mlStatus, setMlStatus] = useState<{ connected: boolean; message: string; service: string }>({
    connected: false,
    message: 'Checking status...',
    service: 'Python PyTorch Microservice',
  });

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.database) setMongoStatus(d.database);
        if (d.mlService) setMlStatus(d.mlService);
      })
      .catch(() => {
        setMongoStatus({ connected: false, message: 'Local Secure File Storage Active' });
        setMlStatus({ connected: false, message: 'Offline (Internal rules fallback)', service: 'PyTorch Microservice' });
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
      <div className="pb-2 border-b border-slate-200/80">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings & Configuration</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage facility parameters, decision-support safety gates, and storage infrastructure.
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('facility')}
          className={`pb-3 relative transition ${
            activeTab === 'facility'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Facility Profile
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`pb-3 relative transition ${
            activeTab === 'safety'
              ? 'text-teal-700 border-b-2 border-teal-600'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Clinical Safety Gates
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition ${
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
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Healthcare Facility Context</h2>
            <p className="text-xs text-slate-500">
              Facility identifiers linked to screening records and outgoing referrals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
                <input
                  type="text"
                  readOnly
                  value="District Primary Health Centre #1"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Facility Code</label>
                <input
                  type="text"
                  readOnly
                  value="FAC-MAIN"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Clinician / Operator</label>
                <input
                  type="text"
                  readOnly
                  value="Dr. Sunita Rao"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operator Role</label>
                <input
                  type="text"
                  readOnly
                  value="Community Health Worker / Medical Officer"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Data Persistence & Synchronization</h2>
            <p className="text-xs text-slate-500">
              Dual-mode local file storage and cloud MongoDB synchronization status.
            </p>

            <div className="p-4 rounded-lg border flex items-center justify-between text-xs bg-slate-50 border-slate-200">
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
              <span
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                  mongoStatus.connected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-teal-50 text-teal-800 border border-teal-200'
                }`}
              >
                {mongoStatus.connected ? '● MongoDB Connected' : '● Local Offline Storage Active'}
              </span>
            </div>

            <div className="p-4 rounded-lg border flex items-center justify-between text-xs bg-slate-50 border-slate-200">
              <div className="flex items-center gap-3">
                <Cpu className="w-5 h-5 text-teal-600" />
                <div>
                  <div className="font-semibold text-slate-900">
                    PyTorch Computer Vision Microservice (Port 5000)
                  </div>
                  <div className="text-slate-500 mt-0.5">
                    {mlStatus.message}
                  </div>
                </div>
              </div>
              <span
                className={`px-2.5 py-1 rounded-md font-semibold text-[11px] ${
                  mlStatus.connected
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {mlStatus.connected ? '● Live PyTorch ML Service' : '○ Offline / Standby'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CLINICAL SAFETY GATES ── */}
      {activeTab === 'safety' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Clinical Safety Confidence Threshold</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict cut-off below which the system reports &apos;Unable to determine reliably&apos; rather than guessing.
            </p>
          </div>

          <div className="max-w-md space-y-3 text-xs">
            <div className="flex justify-between font-semibold text-slate-800">
              <span>Minimum Confidence Threshold</span>
              <span className="font-mono text-teal-700 font-bold">{threshold}%</span>
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

            <p className="text-[11px] text-slate-500 leading-relaxed">
              In clinical decision-support systems, a higher threshold guards against false reassurances by escalating ambiguous patterns to human clinician review.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs">
            <h3 className="font-bold text-slate-800">Optical Quality Standards</h3>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>• <strong>Laplacian Variance Blur Filter:</strong> Minimum variance threshold = 100</li>
              <li>• <strong>Mean Luminance Exposure Gate:</strong> 25 - 225 out of 255</li>
              <li>• <strong>Contrast Dynamic Range:</strong> Minimum 20.0 standard deviation</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM & MODEL SPECS ── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Machine Learning Specifications</h2>
            <p className="text-xs text-slate-500">
              Documentation of architectures, quantization, and evaluation benchmarks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Eye Protocol</span>
                <div className="font-bold text-slate-900">HealthScreen-DR-v1.2</div>
                <div className="text-slate-600 text-[11px]">Architecture: MobileNetV3-Large (Quantized INT8)</div>
                <div className="text-slate-500 text-[11px]">Reference Dataset: APTOS 2019 Blindness Detection</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Oral Protocol</span>
                <div className="font-bold text-slate-900">HealthScreen-Oral-v1.1</div>
                <div className="text-slate-600 text-[11px]">Architecture: EfficientNet-Lite0 (Quantized INT8)</div>
                <div className="text-slate-500 text-[11px]">Reference Dataset: Oral Cavity Visual Dataset</div>
              </div>
            </div>
          </div>

          {/* Verification & Test Encounters */}
          <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Clinical Verification Specimens</h2>
              <p className="text-xs text-slate-500">
                Pre-calibrated specimens for validating end-to-end optical quality and analysis pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {verificationScenarios.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-3.5 bg-slate-50 hover:bg-teal-50/40 rounded-lg border border-slate-200 hover:border-teal-500 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-bold text-slate-900 group-hover:text-teal-900">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-teal-700 font-medium mt-0.5">
                      {item.type}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Expected outcome: {item.outcome}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-teal-700 font-semibold text-[11px]">
                    <span>Run Verification Specimen →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
