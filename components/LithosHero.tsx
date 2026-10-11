'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Menu, X, ArrowRight, Sparkles, Compass, Layers } from 'lucide-react';

const SPOTLIGHT_R = 260;

const BG_IMAGE_1 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85';

const BG_IMAGE_2 =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85';

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const layerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const layer = layerRef.current;
    if (!canvas || !layer) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width || window.innerWidth;
    const height = canvas.height || window.innerHeight;

    ctx.clearRect(0, 0, width, height);

    if (cursorX >= 0 && cursorY >= 0) {
      const grad = ctx.createRadialGradient(
        cursorX,
        cursorY,
        0,
        cursorX,
        cursorY,
        SPOTLIGHT_R
      );

      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
      grad.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
      grad.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
      ctx.fill();
    }

    try {
      const dataUrl = canvas.toDataURL();
      layer.style.maskImage = `url(${dataUrl})`;
      layer.style.webkitMaskImage = `url(${dataUrl})`;
      layer.style.maskSize = '100% 100%';
      layer.style.webkitMaskSize = '100% 100%';
    } catch {
      // Fallback
    }
  }, [cursorX, cursorY]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: 'none' }}
      />
      <div
        ref={layerRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none transition-opacity duration-300"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

export default function LithosHero() {
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [activeTab, setActiveTab] = useState('Course');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mouseRef = useRef({ x: -999, y: -999 });
  const smoothRef = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Initial center position so spotlight shows gracefully before mouse move
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    mouseRef.current = { x: centerX, y: centerY };
    smoothRef.current = { x: centerX, y: centerY };
    setCursorPos({ x: centerX, y: centerY });

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove);

    const updateLoop = () => {
      smoothRef.current.x += (mouseRef.current.x - smoothRef.current.x) * 0.1;
      smoothRef.current.y += (mouseRef.current.y - smoothRef.current.y) * 0.1;

      setCursorPos({
        x: Math.round(smoothRef.current.x * 100) / 100,
        y: Math.round(smoothRef.current.y * 100) / 100,
      });

      rafRef.current = requestAnimationFrame(updateLoop);
    };

    rafRef.current = requestAnimationFrame(updateLoop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const navItems = ['Course', 'Field Guides', 'Geology', 'Plans', 'Live Tour'];

  return (
    <div
      className="min-h-screen bg-white tracking-[-0.02em] select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* ── FIXED NAVIGATION OVER HERO ── */}
        <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
          {/* Left: SVG Logo + Wordmark */}
          <div className="flex items-center gap-2.5">
            <svg
              className="w-6 h-6 sm:w-7 sm:h-7"
              viewBox="0 0 256 256"
              fill="#ffffff"
              aria-hidden="true"
            >
              <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
            </svg>
            <span className="text-white text-2xl font-playfair italic font-medium tracking-tight">
              Lithos
            </span>
          </div>

          {/* Center Pill Menu (Desktop) */}
          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 shadow-lg shadow-black/20">
            {navItems.map((item) => {
              const isActive = activeTab === item;
              return (
                <button
                  key={item}
                  onClick={() => setActiveTab(item)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white text-gray-900 font-semibold shadow-xs'
                      : 'text-white/80 hover:bg-white/20 hover:text-white'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* Right Action (Desktop Sign Up) */}
          <div className="hidden md:block">
            <button className="bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all shadow-md hover:scale-105 active:scale-95">
              Sign Up
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-[95] bg-black/90 backdrop-blur-xl pt-24 px-6 space-y-4">
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setActiveTab(item);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-5 py-3 rounded-2xl text-lg font-medium transition-all ${
                    activeTab === item
                      ? 'bg-white text-gray-900 font-bold'
                      : 'text-white/80 hover:bg-white/10'
                  }`}
                >
                  {item}
                </button>
              ))}
              <button className="mt-4 w-full bg-[#e8702a] text-white font-bold py-3.5 rounded-2xl text-center shadow-lg">
                Sign Up
              </button>
            </div>
          </div>
        )}

        {/* ── LAYER 1: BASE IMAGE (z-10) ── */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat hero-zoom z-10"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* ── LAYER 2: REVEAL SPOTLIGHT LAYER (z-30) ── */}
        <RevealLayer
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Dark subtle gradient overlays for high legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none z-40" />

        {/* ── LAYER 3: HEADING (z-50) ── */}
        <div className="absolute top-[14%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-50">
          <h1 className="text-white leading-[0.95]">
            <span
              className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal drop-shadow-lg"
              style={{ letterSpacing: '-0.05em', animationDelay: '0.25s' }}
            >
              Layers hold
            </span>
            <span
              className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal drop-shadow-lg"
              style={{ letterSpacing: '-0.08em', animationDelay: '0.42s' }}
            >
              tales of time
            </span>
          </h1>
        </div>

        {/* ── LAYER 4: BOTTOM-LEFT PARAGRAPH (z-50) ── */}
        <div
          className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.7s' }}
        >
          <p className="text-sm text-white/80 leading-relaxed font-normal drop-shadow-md">
            Every layer of sediment records a chapter of our planet, from ancient seabeds to drifting ash, layered across millions of years beneath us.
          </p>
        </div>

        {/* ── LAYER 5: BOTTOM-RIGHT BLOCK & BUTTON (z-50) ── */}
        <div
          className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[260px] flex flex-col items-start gap-4 sm:gap-5 z-50 hero-anim hero-fade"
          style={{ animationDelay: '0.85s' }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed font-normal drop-shadow-md">
            Our interactive maps let you peel back the crust to trace how stones, fossils, and deep time combine to shape the ground beneath your feet.
          </p>
          <button className="bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 flex items-center gap-2 cursor-pointer">
            <span>Start Digging</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Interactive Floating Hint Pill for ALIVE Feel */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none hidden md:flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-[11px] text-white/90 font-medium animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-[#e8702a]" />
          <span>Move cursor to reveal geological crust layer</span>
        </div>
      </section>
    </div>
  );
}
