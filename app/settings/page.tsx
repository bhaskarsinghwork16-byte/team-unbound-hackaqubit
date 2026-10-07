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
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="pixel text-[10px] bg-emerald-500/15 text-emerald-300 px-3 py-0.5 rounded-full border border-emerald-500/30 font-bold tracking-wide">
            SYSTEM PARAMETERS
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-white">System Settings & Configuration</h1>
        <p className="text-xs text-slate-300 font-medium mt-1">
          Manage facility parameters, decision-support safety gates, and storage infrastructure.
        </p>
      </div>

      {/* ── TABS (3D DARK GLASS) ── */}
      <div className="flex border-b border-teal-500/20 gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('facility')}
          className={`pb-3 relative transition ${
            activeTab === 'facility'
              ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Facility Profile
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`pb-3 relative transition ${
            activeTab === 'safety'
              ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          Clinical Safety Gates
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition ${
            activeTab === 'system'
              ? 'text-emerald-300 border-b-2 border-emerald-400 font-extrabold'
              : 'text-slate-300 hover:text-white'
          }`}
        >
          System & Model Specs
        </button>
      </div>

      {/* ── TAB 1: FACILITY PROFILE ── */}
      {activeTab === 'facility' && (
        <div className="space-y-4">
          <div className="glass-container-3d p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Healthcare Facility Context</h2>
            <p className="text-xs text-slate-300 font-medium">
              Facility identifiers linked to screening records and outgoing referrals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Facility Name</label>
                <input
                  type="text"
                  readOnly
                  value="District Primary Health Centre #1"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Facility Code</label>
                <input
                  type="text"
                  readOnly
                  value="FAC-MAIN"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white font-mono font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Attending Clinician / Operator</label>
                <input
                  type="text"
                  readOnly
                  value="Dr. Sunita Rao"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white font-medium"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Operator Role</label>
                <input
                  type="text"
                  readOnly
                  value="Community Health Worker / Medical Officer"
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white font-medium"
                />
              </div>
            </div>
          </div>

          <div className="glass-container-3d p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Data Persistence & Synchronization</h2>
            <p className="text-xs text-slate-300 font-medium">
              Dual-mode local file storage and cloud MongoDB synchronization status.
            </p>

            <div className="p-4 rounded-xl border flex items-center justify-between text-xs bg-black/40 border-teal-500/20">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-teal-400" />
                <div>
                  <div className="font-semibold text-white">
                    Database Connection Status
                  </div>
                  <div className="text-slate-300 mt-0.5">
                    {mongoStatus.message}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full font-bold text-[11px] ${
                  mongoStatus.connected
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'bg-teal-500/20 text-teal-300 border border-teal-400/40'
                }`}
              >
                {mongoStatus.connected ? '● MongoDB Connected' : '● Local Offline Storage Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CLINICAL SAFETY GATES ── */}
      {activeTab === 'safety' && (
        <div className="glass-container-3d p-6 space-y-6">
          <div>
            <h2 className="text-sm font-bold text-white">Clinical Safety Confidence Threshold</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Strict cut-off below which the system reports &apos;Unable to determine reliably&apos; rather than guessing.
            </p>
          </div>

          <div className="max-w-md space-y-3 text-xs">
            <div className="flex justify-between font-semibold text-white">
              <span>Minimum Confidence Threshold</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">{threshold}%</span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-teal-400 cursor-pointer"
            />

            <p className="text-[11px] text-slate-300 leading-relaxed">
              In clinical decision-support systems, a higher threshold guards against false reassurances by escalating ambiguous patterns to human clinician review.
            </p>
          </div>

          <div className="pt-4 border-t border-teal-500/20 space-y-2 text-xs">
            <h3 className="font-bold text-white">Optical Quality Standards</h3>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>• <strong className="text-white">Laplacian Variance Blur Filter:</strong> Minimum variance threshold = 100</li>
              <li>• <strong className="text-white">Mean Luminance Exposure Gate:</strong> 25 - 225 out of 255</li>
              <li>• <strong className="text-white">Contrast Dynamic Range:</strong> Minimum 20.0 standard deviation</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM & MODEL SPECS ── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="glass-container-3d p-6 space-y-4">
            <h2 className="text-sm font-bold text-white">Machine Learning Specifications</h2>
            <p className="text-xs text-slate-300 font-medium">
              Documentation of architectures, quantization, and evaluation benchmarks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-black/40 rounded-xl border border-teal-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-cyan-400 block">Eye Protocol</span>
                <div className="font-bold text-white">HealthScreen-DR-v1.2</div>
                <div className="text-slate-300 text-[11px]">Architecture: MobileNetV3-Large (Quantized INT8)</div>
                <div className="text-slate-400 text-[11px]">Reference Dataset: APTOS 2019 Blindness Detection</div>
              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-teal-500/20 space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400 block">Oral Protocol</span>
                <div className="font-bold text-white">HealthScreen-Oral-v1.1</div>
                <div className="text-slate-300 text-[11px]">Architecture: EfficientNet-Lite0 (Quantized INT8)</div>
                <div className="text-slate-400 text-[11px]">Reference Dataset: Oral Cavity Visual Dataset</div>
              </div>
            </div>
          </div>

          {/* Verification & Test Encounters */}
          <div className="glass-container-3d p-6 space-y-4">
            <div>
              <h2 className="text-sm font-bold text-white">Clinical Verification Specimens</h2>
              <p className="text-xs text-slate-300 font-medium">
                Pre-calibrated specimens for validating end-to-end optical quality and analysis pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {verificationScenarios.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-3.5 bg-black/40 hover:bg-teal-500/10 rounded-xl border border-teal-500/20 hover:border-teal-400 transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-bold text-white group-hover:text-emerald-300">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-cyan-400 font-medium mt-0.5">
                      {item.type}
                    </div>
                    <div className="text-[11px] text-slate-300 mt-1">
                      Expected outcome: {item.outcome}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-emerald-400 font-bold text-[11px]">
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
