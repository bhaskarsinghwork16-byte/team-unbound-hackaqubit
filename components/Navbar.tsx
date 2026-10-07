'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Eye, 
  History, 
  BarChart3, 
  Database, 
  Settings, 
  Wifi, 
  WifiOff, 
  Menu, 
  X,
  Radio,
  Sparkles
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function Navbar() {
  const pathname = usePathname();
  const [isOffline, setIsOffline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: Activity },
    { href: '/screening', label: 'New Screening', icon: Eye },
    { href: '/history', label: 'Screening History', icon: History },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/datasets', label: 'Dataset & Models', icon: Database },
    { href: '/settings', label: 'Settings & Demos', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#fff9ec]/90 backdrop-blur-md border-b border-[#d8e2dc] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <BrandLogo size="md" showTagline={true} />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#d8e2dc]/40 p-1 rounded-xl border border-[#d8e2dc]">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg transition-all duration-150 ${
                    isActive
                      ? 'bg-[#5d2a42] text-[#fff9ec] shadow-xs border border-[#5d2a42]'
                      : 'text-[#5d2a42]/85 hover:text-[#5d2a42] hover:bg-[#d8e2dc]/60'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#ffdccc]' : 'text-[#5d2a42]/70'}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Actions */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Quick Demo Launch Shortcut */}
            <Link
              href="/settings"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg text-[#5d2a42] bg-[#ffdccc] border border-[#d8e2dc] hover:bg-[#ffdccc]/80 transition"
              title="Launch Hackathon Judge Demos"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5d2a42]" />
              <span>Judge Demos</span>
            </Link>

            {/* Online / Offline status toggle */}
            <button
              onClick={() => setIsOffline(!isOffline)}
              title="Click to toggle simulated field network condition"
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition shadow-xs ${
                isOffline
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-[#d8e2dc] text-[#5d2a42] border-[#5d2a42]/20'
              }`}
            >
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                  <span>Offline Active</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                  <span>Connected</span>
                </>
              )}
            </button>

            {/* Field Clinic Tag */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-800 block leading-tight">Camp #4 (Rural)</span>
                <span className="text-[9px] font-semibold text-teal-600 flex items-center justify-end gap-1">
                  <Radio className="w-2.5 h-2.5 animate-pulse" /> Edge Unit
                </span>
              </div>
              <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-xs font-bold text-white shadow-xs">
                CHW
              </div>
            </div>
          </div>

          {/* Mobile hamburger menu */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setIsOffline(!isOffline)}
              className={`p-1.5 rounded-lg border text-xs ${
                isOffline ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-1 shadow-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 text-sm font-semibold rounded-lg ${
                  isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 text-teal-600" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
