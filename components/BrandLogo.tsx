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
    <Link href="/dashboard" className="flex items-center gap-3 group select-none">
      {/* Glossy 3D Green Cross Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-slate-950 flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)] border border-emerald-300/40 group-hover:scale-105 transition-transform`}>
        <span className="font-extrabold text-white text-lg leading-none">+</span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`${titleSize} font-extrabold text-white group-hover:text-emerald-300 transition-colors leading-tight tracking-tight`}>
          HealthScreen
        </span>
        {displaySubtitle && (
          <span className="text-[11px] font-medium text-slate-400 leading-tight">
            Community Screening
          </span>
        )}
      </div>
    </Link>
  );
}
