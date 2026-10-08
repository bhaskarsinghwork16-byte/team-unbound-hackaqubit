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
      {/* 3D Medical Cross Emblem */}
      <div className={`relative ${iconDimensions} rounded-xl bg-[#5d2a42] text-[#ffdccc] flex items-center justify-center shadow-md border border-[#ffdccc]/30 group-hover:scale-105 transition-transform`}>
        <span className="font-extrabold text-[#ffdccc] text-lg leading-none">+</span>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <span className={`${titleSize} font-extrabold text-[#5d2a42] group-hover:opacity-80 transition-opacity leading-tight tracking-tight`}>
          HealthScreen
        </span>
        {displaySubtitle && (
          <span className="text-[11px] font-medium text-[#5d2a42]/70 leading-tight">
            Community Screening
          </span>
        )}
      </div>
    </Link>
  );
}

