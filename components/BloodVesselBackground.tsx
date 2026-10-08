'use client';

import React from 'react';

export default function BloodVesselBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-25">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        className="w-full h-full object-cover animate-pulse duration-[8000ms]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Biometric Vascular Gradients */}
          <linearGradient id="tealVesselGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.6" />
          </linearGradient>

          <linearGradient id="emeraldVesselGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
            <stop offset="50%" stopColor="#10b981" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0.5" />
          </linearGradient>

          <radialGradient id="opticGlow" cx="45%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#0d9488" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="bioCell" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="50%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#0f766e" />
          </radialGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <filter id="depthBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="5" />
          </filter>
        </defs>

        {/* Ambient Optic Glow Orb */}
        <circle cx="400" cy="300" r="320" fill="url(#opticGlow)" />

        {/* Background Depth Capillaries */}
        <g filter="url(#depthBlur)" opacity="0.35" className="animate-float-slow">
          <path
            d="M 50,550 Q 180,480 320,380 T 520,240 T 780,180"
            stroke="#0d9488"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 320,380 Q 360,420 440,510 T 540,590"
            stroke="#0d9488"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 220,10 Q 310,120 420,210 T 680,280"
            stroke="#10b981"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Foreground Primary Retinal Artery Trunk */}
        <g filter="url(#softGlow)">
          <path
            d="M -20,180 C 180,220 340,320 460,260 S 680,120 820,90"
            stroke="url(#tealVesselGrad1)"
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          {/* Secondary Branch */}
          <path
            d="M 340,320 C 370,410 420,490 560,560"
            stroke="url(#emeraldVesselGrad2)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 460,260 C 490,200 580,180 720,210"
            stroke="url(#tealVesselGrad1)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          {/* Microvascular Arterioles */}
          <path
            d="M 220,220 Q 250,140 310,110"
            stroke="#2dd4bf"
            strokeWidth="3.5"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 430,470 Q 480,490 510,540"
            stroke="#34d399"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </g>

        {/* Micro-cells Floating in Stream */}
        <g opacity="0.6">
          <circle cx="160" cy="205" r="5" fill="url(#bioCell)" />
          <circle cx="280" cy="275" r="6" fill="url(#bioCell)" />
          <circle cx="390" cy="350" r="4.5" fill="url(#bioCell)" />
          <circle cx="510" cy="235" r="5.5" fill="url(#bioCell)" />
          <circle cx="640" cy="140" r="4" fill="url(#bioCell)" />
        </g>
      </svg>
    </div>
  );
}
