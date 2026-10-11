'use client';

import React from 'react';

export default function BloodVesselBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40 mix-blend-multiply">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 600"
        className="w-full h-full object-cover animate-pulse duration-[8000ms]"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Background Gradient */}
          <radialGradient id="bgGlow" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#1f0414" />
            <stop offset="100%" stopColor="#050208" />
          </radialGradient>

          {/* Vessel 1 Gradient (Main Artery/Capillary 3D tube look) */}
          <linearGradient id="vesselGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#5a0010" />
            <stop offset="20%" stopColor="#b80f2a" />
            <stop offset="50%" stopColor="#ff4d6d" />
            <stop offset="75%" stopColor="#80001a" />
            <stop offset="100%" stopColor="#260005" />
          </linearGradient>

          {/* Vessel 2 Gradient (Crossing Capillary) */}
          <linearGradient id="vesselGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#3a0010" />
            <stop offset="25%" stopColor="#990022" />
            <stop offset="50%" stopColor="#ff3355" />
            <stop offset="80%" stopColor="#660011" />
            <stop offset="100%" stopColor="#1a0005" />
          </linearGradient>

          {/* Red Blood Cell Gradient 3D */}
          <radialGradient id="rbdGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ff859b" />
            <stop offset="35%" stopColor="#ff193b" />
            <stop offset="70%" stopColor="#b80018" />
            <stop offset="100%" stopColor="#4a0005" />
          </radialGradient>

          {/* Glow Filter for Atmosphere */}
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="12" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Soft Depth Blur for Background Vessels */}
          <filter id="depthBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        {/* Deep Background Space */}
        <rect width="800" height="600" fill="url(#bgGlow)" />

        {/* Ambient Light Orbs (Tissue fluid glowing) */}
        <g filter="url(#glow)" className="animate-pulse duration-[6000ms]" opacity="0.4">
          <circle cx="200" cy="150" r="100" fill="#750b24" />
          <circle cx="650" cy="400" r="140" fill="#420519" />
          <circle cx="400" cy="300" r="180" fill="#2b0013" />
        </g>

        {/* Background / Out-of-Focus Capillaries */}
        <g filter="url(#depthBlur)" opacity="0.45" className="animate-float-slow">
          <path
            d="M -50 100 C 150 80, 300 250, 500 200 C 700 150, 750 50, 850 80"
            fill="none"
            stroke="#b80f2a"
            strokeWidth="45"
            strokeLinecap="round"
          />
          <path
            d="M 100 650 C 200 450, 400 450, 450 250 C 500 80, 700 50, 800 -20"
            fill="none"
            stroke="#80001a"
            strokeWidth="35"
            strokeLinecap="round"
          />
        </g>

        {/* ================= MAIN 3D CAPILLARY STRUCTURE ================= */}

        {/* Outer Glow / Shadow of Main Tube */}
        <path
          d="M -50 380 C 180 480, 320 180, 520 280 C 680 360, 720 220, 850 250"
          fill="none"
          stroke="#260005"
          strokeWidth="95"
          strokeLinecap="round"
          filter="url(#glow)"
          opacity="0.8"
        />

        {/* Main Vessel Body */}
        <path
          d="M -50 380 C 180 480, 320 180, 520 280 C 680 360, 720 220, 850 250"
          fill="none"
          stroke="url(#vesselGrad1)"
          strokeWidth="80"
          strokeLinecap="round"
        />

        {/* Secondary Crossing Capillary */}
        <path
          d="M 250 600 C 280 420, 350 250, 420 50 C 450 -30, 480 -50, 480 -50"
          fill="none"
          stroke="url(#vesselGrad2)"
          strokeWidth="50"
          strokeLinecap="round"
        />

        {/* Vessel Inner Core / Translucency Highlights (Simulating 3D cylindrical volume) */}
        <path
          d="M -50 375 C 180 475, 320 175, 520 275 C 680 355, 720 215, 850 245"
          fill="none"
          stroke="#ff8fa3"
          strokeWidth="15"
          strokeLinecap="round"
          opacity="0.35"
          filter="url(#glow)"
        />
        <path
          d="M 245 600 C 275 420, 345 250, 415 50"
          fill="none"
          stroke="#ff8fa3"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.3"
          filter="url(#glow)"
        />

        {/* ================= RED BLOOD CELLS (MOVING & FLOATING) ================= */}

        {/* RBC 1 */}
        <g transform="translate(120, 380) scale(0.6) rotate(-25)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.5" />
        </g>

        {/* RBC 2 */}
        <g transform="translate(200, 410) scale(0.8) rotate(15)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-6" cy="-6" rx="10" ry="5" fill="#ffb3c1" opacity="0.6" />
        </g>

        {/* RBC 3 */}
        <g transform="translate(280, 370) scale(0.7, 0.4) rotate(45)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.8" />
        </g>

        {/* RBC 4 */}
        <g transform="translate(350, 310) scale(0.85) rotate(-10)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.6" />
        </g>

        {/* RBC 5 */}
        <g transform="translate(380, 270) scale(0.75) rotate(-35)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.5" />
        </g>

        {/* RBC 6 */}
        <g transform="translate(330, 220) scale(0.65) rotate(70)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.5" />
        </g>

        {/* RBC 7 */}
        <g transform="translate(460, 260) scale(0.8) rotate(20)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.6" />
        </g>

        {/* RBC 8 */}
        <g transform="translate(560, 285) scale(1.1) rotate(-15)" className="animate-float-slow">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#4a0005" opacity="0.8" />
          <ellipse cx="-7" cy="-7" rx="10" ry="5" fill="#ffc2cb" opacity="0.7" />
        </g>

        {/* RBC 9 */}
        <g transform="translate(650, 260) scale(0.75) rotate(-40)" className="animate-float">
          <ellipse cx="0" cy="0" rx="35" ry="22" fill="url(#rbdGrad)" />
          <ellipse cx="0" cy="0" rx="15" ry="8" fill="#5a0010" opacity="0.7" />
          <ellipse cx="-5" cy="-5" rx="10" ry="5" fill="#ffb3c1" opacity="0.5" />
        </g>

        {/* ================= NUTRIENTS / OXYGEN MOLECULES (GLOWING SPARKLES) ================= */}
        <g filter="url(#glow)" className="animate-pulse duration-[3000ms]">
          <circle cx="150" cy="350" r="4" fill="#00ffff" opacity="0.85" />
          <circle cx="230" cy="430" r="3" fill="#00ffff" opacity="0.7" />
          <circle cx="340" cy="340" r="5" fill="#ffffff" opacity="0.95" />
          <circle cx="410" cy="240" r="3" fill="#00ffff" opacity="0.8" />
          <circle cx="530" cy="310" r="4.5" fill="#ffffff" opacity="0.95" />
          <circle cx="610" cy="230" r="3" fill="#00ffff" opacity="0.85" />
          <circle cx="700" cy="270" r="4" fill="#ffffff" opacity="0.8" />
          <circle cx="300" cy="180" r="3.5" fill="#00ffff" opacity="0.7" />
        </g>

        {/* ================= FOREGROUND VIGNETTE ================= */}
        <path d="M 0 0 L 800 0 L 800 80 C 600 20, 200 20, 0 80 Z" fill="#050208" opacity="0.4" />
        <path d="M 0 600 L 800 600 L 800 520 C 600 570, 200 570, 0 520 Z" fill="#050208" opacity="0.5" />
      </svg>
    </div>
  );
}
