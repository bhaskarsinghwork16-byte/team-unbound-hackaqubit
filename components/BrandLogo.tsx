'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  showTagline?: boolean;
}

export default function BrandLogo({ size = 'md', showSubtitle, showTagline }: BrandLogoProps) {
  const displaySubtitle = showSubtitle ?? showTagline ?? true;
  const iconDimensions = size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8';
  const titleSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';

  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 group select-none">
      {/* Precision Medical Optical & Cross Motif */}
      <div className={`relative ${iconDimensions} rounded-lg bg-teal-600 text-white flex items-center justify-center shadow-sm group-hover:bg-teal-700 transition-colors`}>
        <svg
          className="w-4 h-4 text-white"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Subtle Aperture / Iris Circle with Medical Cross center */}
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8" />
          <path d="M8 12h8" />
        </svg>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`${titleSize} font-bold tracking-tight text-slate-900 group-hover:text-teal-900 transition-colors leading-none`}>
          HealthScreen
        </span>
        {displaySubtitle && (
          <span className="text-[11px] font-medium text-slate-500 tracking-tight mt-1 leading-none">
            Community Screening
          </span>
        )}
      </div>
    </Link>
  );
}
