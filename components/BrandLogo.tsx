'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showTagline?: boolean;
  theme?: 'light' | 'dark';
}

export default function BrandLogo({
  size = 'md',
  showSubtitle,
  showTagline,
  theme = 'light',
}: BrandLogoProps) {
  const displaySubtitle = showSubtitle ?? showTagline ?? true;
  const iconDimensions = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9 h-9';
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  const isLight = theme === 'light';

  return (
    <Link href="/" className="flex items-center gap-2.5 group select-none">
      {/* Brand Clinical Shield Cross Emblem */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-sm shadow-teal-600/20 border border-teal-400/40 group-hover:scale-105 group-hover:shadow-md transition-all duration-200 shrink-0`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
        >
          {/* Stylized Medical Cross with subtle pulse */}
          <path d="M12 4v16m-8-8h16" />
        </svg>
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white" />
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-tight">
          <span
            className={`${titleSize} font-bold ${
              isLight ? 'text-slate-900 group-hover:text-teal-700' : 'text-white group-hover:text-teal-300'
            } transition-colors tracking-tight`}
          >
            HealthScreen
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">
            AI
          </span>
        </div>
        {displaySubtitle && (
          <span
            className={`text-[11px] font-medium ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            } leading-tight mt-0.5`}
          >
            Clinical Triage Platform
          </span>
        )}
      </div>
    </Link>
  );
}
