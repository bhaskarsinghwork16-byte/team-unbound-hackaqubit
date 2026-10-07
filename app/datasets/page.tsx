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
      return <span className="text-[#5d2a42]/60 font-normal italic">Not evaluated</span>;
    }
    return <span className="font-black text-[#5d2a42]">{val}{suffix}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#5d2a42] tracking-tight">Dataset &amp; Model Specifications</h1>
        <p className="text-xs text-[#5d2a42]/80 font-medium mt-1">
          Transparent clinical documentation on training cohorts, lightweight architectures, edge quantization, and honest ethical limitations.
        </p>
      </div>

      {/* Datasets Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-[#5d2a42]" />
          <h2 className="text-lg font-black text-[#5d2a42]">Curated Clinical Datasets (Publicly Available)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {datasets.map((ds) => (
            <div key={ds.name} className="bg-[#d8e2dc]/40 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] p-6 shadow-md shadow-[#5d2a42]/5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <h3 className="text-sm font-black text-[#5d2a42] leading-snug">{ds.name}</h3>
                  <a
                    href={ds.kaggleUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#5d2a42] hover:text-[#5d2a42]/70 shrink-0"
                    title="View Kaggle / Research Source"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-1.5 text-xs text-[#5d2a42]/85 font-medium">
                  <div><strong className="text-[#5d2a42]">Source:</strong> {ds.source}</div>
                  <div><strong className="text-[#5d2a42]">Clinical Task:</strong> {ds.task}</div>
                  <div><strong className="text-[#5d2a42]">Cohort Size:</strong> {ds.imageCount.toLocaleString()} clinician-annotated images</div>
                  <div><strong className="text-[#5d2a42]">License:</strong> {ds.license}</div>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-black text-[#5d2a42]/60 block mb-1">Supported Classes:</span>
                  <div className="flex flex-wrap gap-1">
                    {ds.classes.map((c) => (
                      <span key={c} className="px-2 py-0.5 rounded-md bg-[#ffdccc] text-[10px] text-[#5d2a42] font-extrabold border border-[#d8e2dc]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-[#ffdccc]/50 rounded-2xl border border-[#d8e2dc] text-[11px] text-[#5d2a42]/90 font-medium">
                <strong className="text-[#5d2a42] font-black">Known Limitation:</strong> {ds.limitations}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightweight Edge Models Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-[#5d2a42]" />
          <h2 className="text-lg font-black text-[#5d2a42]">Lightweight Mobile Model Architectures (Edge INT8)</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {models.map((mod) => (
            <div key={mod.modelName} className="bg-[#d8e2dc]/40 backdrop-blur-xl rounded-3xl border border-[#d8e2dc] p-6 shadow-md shadow-[#5d2a42]/5 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-[#5d2a42]">{mod.modelName}</h3>
                  <span className="text-xs text-[#5d2a42] font-black">{mod.version} • {mod.task}</span>
                </div>
                <span className="px-3 py-1 rounded-full bg-[#5d2a42] text-[#fff9ec] font-mono text-[11px] font-black shadow-xs">
                  {mod.sizeMb} MB
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#fff9ec]/80 p-3.5 rounded-2xl border border-[#d8e2dc]">
                <div>
                  <span className="text-[10px] text-[#5d2a42]/60 uppercase font-black block">Architecture</span>
                  <span className="font-extrabold text-[#5d2a42] text-[11px]">{mod.architecture}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5d2a42]/60 uppercase font-black block">Input Tensor</span>
                  <span className="font-extrabold text-[#5d2a42] text-[11px]">{mod.inputResolution}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5d2a42]/60 uppercase font-black block">Target CPU Latency</span>
                  <span className="font-extrabold text-[#5d2a42] text-[11px]">{mod.latencyArmCpuMs} ms (ARM Cortex)</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#5d2a42]/60 uppercase font-black block">Quantization</span>
                  <span className="font-extrabold text-[#5d2a42] text-[11px]">{mod.quantization}</span>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-black text-[#5d2a42]/60 block">
                  Measured Evaluation Benchmarks (Holdout Test Cohort):
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 text-center text-xs">
                  <div className="p-2 rounded-xl bg-[#ffdccc]/70 border border-[#d8e2dc]">
                    <span className="text-[10px] text-[#5d2a42]/70 font-bold block">Accuracy</span>
                    {formatMetric(mod.metrics.accuracy)}
                  </div>
                  <div className="p-2 rounded-lg bg-[#ffdccc]/70 border border-[#d8e2dc]">
                    <span className="text-[10px] text-[#5d2a42]/70 font-bold block">Sensitivity</span>
                    {formatMetric(mod.metrics.sensitivity)}
                  </div>
                  <div className="p-2 rounded-lg bg-[#ffdccc]/70 border border-[#d8e2dc]">
                    <span className="text-[10px] text-[#5d2a42]/70 font-bold block">Specificity</span>
                    {formatMetric(mod.metrics.specificity)}
                  </div>
                  <div className="p-2 rounded-lg bg-[#ffdccc]/70 border border-[#d8e2dc]">
                    <span className="text-[10px] text-[#5d2a42]/70 font-bold block">F1 Score</span>
                    {formatMetric(mod.metrics.f1Score, '')}
                  </div>
                  <div className="p-2 rounded-lg bg-[#ffdccc]/70 border border-[#d8e2dc]">
                    <span className="text-[10px] text-[#5d2a42]/70 font-bold block">ROC-AUC</span>
                    {formatMetric(mod.metrics.rocAuc, '')}
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#ffdccc]/50 rounded-2xl border border-[#d8e2dc] text-[11px] text-[#5d2a42]/90 font-medium">
                <strong className="text-[#5d2a42] font-black">Biases &amp; Clinical Limitations:</strong> {mod.biasesAndLimitations}
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}
