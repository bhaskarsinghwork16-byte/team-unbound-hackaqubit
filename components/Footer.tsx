import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Info, HeartPulse } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-slate-950 p-[1px] border border-teal-500/40 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.5" strokeDasharray="3 3" />
                  <path d="M12 2V5M12 19V22M2 12H5M19 12H22" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="5" stroke="#34d399" strokeWidth="1.75" />
                  <circle cx="12" cy="12" r="2" fill="#2dd4bf" />
                </svg>
              </div>
              <span className="text-sm font-extrabold text-white tracking-tight">HealthScreen <span className="text-teal-400">AI</span></span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              AI-assisted screening support platform designed for low-resource rural healthcare camps where specialists, tabletop imaging equipment, and continuous connectivity are limited.
            </p>
            <div className="flex items-center gap-2 text-teal-400 font-medium text-xs">
              <HeartPulse className="w-4 h-4" />
              <span>Capture → Quality Check → AI Screening → Explain → Refer</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Clinical Workflows</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/screening?type=eye" className="hover:text-teal-400 transition">Diabetic Retinopathy</Link></li>
              <li><Link href="/screening?type=oral" className="hover:text-teal-400 transition">Oral Lesion Screening</Link></li>
              <li><Link href="/history" className="hover:text-teal-400 transition">Screening Records</Link></li>
              <li><Link href="/settings" className="hover:text-teal-400 transition">Judge Demo Mode</Link></li>
            </ul>
          </div>

          {/* Research & Data */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider">Evidence & Data</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><Link href="/datasets" className="hover:text-teal-400 transition">APTOS 2019 Dataset</Link></li>
              <li><Link href="/datasets" className="hover:text-teal-400 transition">Messidor-2 Retinal Cohort</Link></li>
              <li><Link href="/datasets" className="hover:text-teal-400 transition">Oral Lesion Repository</Link></li>
              <li><Link href="/analytics" className="hover:text-teal-400 transition">Model Metrics & Robustness</Link></li>
            </ul>
          </div>
        </div>

        {/* Regulatory & Safety Disclaimer */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-2.5 max-w-3xl">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-400 leading-normal">
              <strong className="text-slate-200">Clinical Safety Statement:</strong> HealthScreen AI is an assistive visual screening and referral support tool. It does NOT provide a definitive medical diagnosis and does NOT replace examination by a licensed ophthalmologist, oral surgeon, or oncologist. All higher-risk findings require prompt clinical evaluation.
            </p>
          </div>
          <span className="text-slate-500 text-[11px] shrink-0">
            © 2026 Team Unbound • HealthScreen AI
          </span>
        </div>
      </div>
    </footer>
  );
}
