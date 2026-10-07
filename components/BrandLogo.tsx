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
  const iconDimensions = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  const isLight = theme === 'light';

  return (
    <Link href="/dashboard" className="flex items-center gap-3 group select-none">
      {/* Brand Teal Cross Emblem */}
      <div
        className={`relative ${iconDimensions} rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs border border-teal-500 group-hover:bg-teal-700 transition-colors shrink-0`}
      >
        <span className="font-extrabold text-white text-lg leading-none">+</span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span
          className={`${titleSize} font-bold ${
            isLight ? 'text-slate-900 group-hover:text-teal-700' : 'text-white group-hover:text-teal-300'
          } transition-colors leading-tight tracking-tight`}
        >
          HealthScreen
        </span>
        {displaySubtitle && (
          <span
            className={`text-[11px] font-medium ${
              isLight ? 'text-slate-500' : 'text-slate-400'
            } leading-tight`}
          >
            Community Screening
          </span>
        )}
      </div>
    </Link>
  );
}
