'use client';

import React from 'react';

interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
  className?: string;
  color?: string;
  speed?: string;
  children?: React.ReactNode;
}

export default function StarBorder({
  as: Component = 'button',
  className = '',
  color = '#b6f829',
  speed = '6s',
  children,
  ...rest
}: StarBorderProps) {
  return (
    <Component
      className={`relative inline-block py-[1px] px-[1px] overflow-hidden rounded-2xl group cursor-pointer ${className}`}
      {...rest}
    >
      <div
        className="absolute w-[300%] h-[50%] opacity-70 bottom-[-11px] right-[-250%] rounded-full animate-star-movement-bottom z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 100%)`,
          animationDuration: speed,
        }}
      />
      <div
        className="absolute w-[300%] h-[50%] opacity-70 top-[-10px] left-[-250%] rounded-full animate-star-movement-top z-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${color} 0%, transparent 100%)`,
          animationDuration: speed,
        }}
      />
      <div className="relative z-10 bg-[#103323] border border-[#b6f829]/40 text-[#b6f829] rounded-2xl py-3 px-6 font-bold flex items-center justify-center gap-2 shadow-lg hover:bg-[#184c34] transition-all group-hover:scale-[1.02]">
        {children}
      </div>
    </Component>
  );
}
