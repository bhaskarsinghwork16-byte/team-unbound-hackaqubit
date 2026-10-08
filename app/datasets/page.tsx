'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Database, 
  Cpu, 
  ExternalLink, 
  CheckCircle2, 
  Layers, 
  Scale, 
  Info,
  ShieldAlert,
  Zap
} from 'lucide-react';
import { DatasetMeta, ModelMeta } from '@/types';

export default function DatasetsAndModelsPage() {
  const [datasets, setDatasets] = useState<DatasetMeta[]>([]);
  const [models, setModels] = useState<ModelMeta[]>([]);

  useEffect(() => {
    fetch('/api/datasets')
      .then((r) => r.json())
      .then((d) => { if (d.success) setDatasets(d.data); });
    
    fetch('/api/models')
      .then((r) => r.json())
      .then((d) => { if (d.success) setModels(d.data); });
  }, []);

  const formatMetric = (val: number | null | undefined, suffix = '%') => {
    if (val === null || val === undefined) {
      return <span className="text-slate-400 font-normal italic">Not evaluated</span>;
    }
    return <span className="font-bold text-slate-900">{val}{suffix}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200/80">
            Model Specifications
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dataset & Model Specifications</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Transparent clinical documentation on training cohorts, lightweight architectures, edge quantization, and honest ethical limitations.
        </p>
      </div>

      {/* Datasets Section (Phase 4 & 27) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Curated Clinical Datasets (Publicly Available)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datasets.map((ds) => (
            <div key={ds.name} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{ds.name}</h3>
                  <a
                    href={ds.kaggleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-600 hover:text-teal-800 shrink-0"
                    title="View Kaggle / Research Source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div><strong>Source:</strong> {ds.source}</div>
                  <div><strong>Clinical Task:</strong> {ds.task}</div>
                  <div><strong>Cohort Size:</strong> {ds.imageCount.toLocaleString()} clinician-annotated images</div>
                  <div><strong>License:</strong> {ds.license}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Supported Classes:</span>
                  <div className="flex flex-wrap gap-1">
                    {ds.classes.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded bg-slate-100 text-[10px] text-slate-700 font-medium">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <strong className="text-slate-800">Known Limitation:</strong> {ds.limitations}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightweight Edge Models Section (Phase 27 & 28) */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-teal-600" />
          <h2 className="text-base font-bold text-slate-900">Lightweight Mobile Model Architectures (Edge INT8)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((mod) => (
            <div key={mod.modelName} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-slate-900">{mod.modelName}</h3>
                  <span className="text-xs text-teal-700 font-semibold">{mod.version} • {mod.task}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] font-bold border border-slate-200">
                  {mod.sizeMb} MB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Architecture</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{mod.architecture}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Input Tensor</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{mod.inputResolution}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Target CPU Latency</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{mod.latencyArmCpuMs} ms (ARM Cortex)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Quantization</span>
                  <span className="font-semibold text-slate-800 text-[11px]">{mod.quantization}</span>
                </div>
              </div>

              {/* Phase 28: Metrics — If not measured, mark "Not evaluated" */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">
                  Measured Evaluation Benchmarks (Holdout Test Cohort):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Accuracy</span>
                    {formatMetric(mod.metrics.accuracy)}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Sensitivity</span>
                    {formatMetric(mod.metrics.sensitivity)}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">Specificity</span>
                    {formatMetric(mod.metrics.specificity)}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">F1 Score</span>
                    {formatMetric(mod.metrics.f1Score, '')}
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                    <span className="text-[10px] text-slate-400 block">ROC-AUC</span>
                    {formatMetric(mod.metrics.rocAuc, '')}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600">
                <strong className="text-slate-800">Biases & Clinical Limitations:</strong> {mod.biasesAndLimitations}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
