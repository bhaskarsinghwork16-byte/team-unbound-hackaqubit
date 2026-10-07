'use client';

import React from 'react';

export default function BloodVesselBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-50">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        className="w-full h-full object-cover animate-pulse duration-[8000ms]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Background Gradient */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#fff9ec" />
            <stop offset="100%" stopColor="#f7f0e1" />
          </radialGradient>

          {/* Vessel 1 Gradient */}
          <linearGradient id="vesselGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5d2a42" />
            <stop offset="25%" stopColor="#8c3b62" />
            <stop offset="50%" stopColor="#ffdccc" />
            <stop offset="75%" stopColor="#5d2a42" />
            <stop offset="100%" stopColor="#3b1425" />
          </linearGradient>

          {/* Vessel 2 Gradient */}
          <linearGradient id="vesselGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#5d2a42" />
            <stop offset="25%" stopColor="#a34875" />
            <stop offset="50%" stopColor="#ffdccc" />
            <stop offset="80%" stopColor="#5d2a42" />
            <stop offset="100%" stopColor="#2e0d1d" />
          </linearGradient>

          {/* Cell Gradient */}
          <radialGradient id="rbdGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffdccc" />
            <stop offset="40%" stopColor="#e6a3b8" />
            <stop offset="75%" stopColor="#5d2a42" />
            <stop offset="100%" stopColor="#3b1425" />
          </radialGradient>

          {/* Glow Filter */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Depth Blur */}
          <filter id="depthBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Deep Background Space */}
        <rect width="800" height="600" fill="url(#bgGlow)" />

        {/* Ambient Light Orbs */}
        <g filter="url(#glow)" className="animate-pulse duration-[6000ms]" opacity="0.35">
          <circle cx="200" cy="150" r="100" fill="#ffdccc" />
          <circle cx="650" cy="400" r="140" fill="#d8e2dc" />
          <circle cx="400" cy="300" r="180" fill="#ffdccc" />
        </g>

        {/* Capillaries */}
        <g filter="url(#depthBlur)" opacity="0.3" className="animate-float-slow">
          <path
            d="M -50 100 C 150 80, 300 250, 500 200 C 700 150, 750 50, 850 80"
            fill="none"
            stroke="#5d2a42"
            strokeWidth="45"
            strokeLinecap="round"
          />
          <path
            d="M 100 650 C 200 450, 400 450, 450 250 C 500 80, 700 50, 800 -20"
            fill="none"
            stroke="#5d2a42"
            strokeWidth="35"
            strokeLinecap="round"
          />
        </g>

        {/* Main 3D Structure */}
        <path
          d="M -50 380 C 180 480, 320 180, 520 280 C 680 360, 720 220, 850 250"
          fill="none"
          stroke="#5d2a42"
          strokeWidth="95"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.3"
        />

        {/* Main Vessel Body */}
        <path
          d="M -50 380 C 180 480, 320 180, 520 280 C 680 360, 720 220, 850 250"
          fill="none"
          stroke="url(#vesselGrad1)"
          strokeWidth="80"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Secondary Crossing Capillary */}
        <path
          d="M 250 600 C 280 420, 350 250, 420 50 C 450 -30, 480 -50, 480 -50"
          fill="none"
          stroke="url(#vesselGrad2)"
          strokeWidth="50"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* Inner Highlights */}
        <path
          d="M -50 375 C 180 475, 320 175, 520 275 C 680 355, 720 215, 850 245"
          fill="none"
          stroke="#ffdccc"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.5"
          filter="url(#glow)"
        />

        {/* Red Blood Cells / Biological Micro Orbs */}
        <g transform="translate(120, 380) scale(0.6) rotate(-25)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
        </g>

        <g transform="translate(200, 410) scale(0.8) rotate(15)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
        </g>

        <g transform="translate(350, 310) scale(0.85) rotate(-10)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
        </g>

        <g transform="translate(560, 285) scale(1.1) rotate(-15)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
        </g>

        {/* Sparkles / Oxygen Nodes */}
        <g filter="url(#glow)" className="animate-pulse duration-[3000ms]">
          <circle cx="150" cy="350" r="4" fill="#5d2a42" opacity="0.6" />
          <circle cx="340" cy="340" r="5" fill="#ffdccc" opacity="0.8" />
          <circle cx="530" cy="310" r="4.5" fill="#5d2a42" opacity="0.6" />
        </g>
      </svg>
    </div>
  );
}
