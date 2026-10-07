'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  GitPullRequest,
  BarChart2,
  Settings,
  Plus,
  Bell,
  Wifi,
  WifiOff,
  Menu,
  X,
  UserCheck,
  ChevronRight,
  Shield,
  Activity
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Connectivity detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d?.database?.connected !== undefined) {
          setMongoConnected(d.database.connected);
        }
      })
      .catch(() => setMongoConnected(false));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Patients', href: '/patients', icon: Users },
    { label: 'Screenings', href: '/history', icon: ClipboardList },
    { label: 'Referrals', href: '/referrals', icon: GitPullRequest },
    { label: 'Reports', href: '/reports', icon: BarChart2 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Helper to get current clean page title
  const getPageTitle = () => {
    if (pathname === '/' || pathname === '/dashboard') return 'Clinical Overview';
    if (pathname.startsWith('/patients')) return 'Patient Records';
    if (pathname.startsWith('/screening')) return 'New Patient Screening';
    if (pathname.startsWith('/history') || pathname.startsWith('/screenings')) return 'Screening History';
    if (pathname.startsWith('/referrals')) return 'Specialist Referrals';
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) return 'Operational Reports';
    if (pathname.startsWith('/settings')) return 'System Settings';
    if (pathname.startsWith('/datasets')) return 'Dataset Documentation';
    return 'Community Health';
  };

  return (
    <div className="min-h-screen text-[#f1f5f9] font-sans antialiased flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* ── DESKTOP LEFT SIDEBAR (3D GLASS) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#0a1819]/80 backdrop-blur-2xl border-r border-teal-500/20 h-screen sticky top-0 z-40 select-none shadow-[10px_0_30px_rgba(0,0,0,0.5)]">
        {/* Brand header */}
        <div className="p-5 border-b border-teal-500/15 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-300">
            CLINICAL WORKFLOW
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== '/dashboard' && pathname.startsWith(item.href)) ||
              (item.href === '/history' && pathname.startsWith('/screenings')) ||
              (item.href === '/reports' && pathname.startsWith('/analytics'));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-bold transition-all relative ${
                  isActive
                    ? 'bg-gradient-to-r from-[#70ffcb] via-[#4cf9ae] to-[#8affd9] text-[#092219] shadow-[0_0_25px_rgba(76,249,174,0.4)] border border-emerald-300'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#092219]' : 'text-slate-300'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  /* 3D Glass Cube Emblem on active navigation pill */
                  <div className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center border border-black/20 shadow-inner">
                    <div className="w-3.5 h-3.5 bg-gradient-to-tr from-emerald-500 to-cyan-300 rounded-sm transform rotate-45 shadow-sm" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Offline / Storage Status Notice */}
        <div className="px-4 py-3 border-t border-teal-500/15 bg-black/30">
          <div className="flex items-center justify-between text-xs text-slate-200">
            <span className="flex items-center gap-2 font-semibold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  mongoConnected
                    ? 'bg-emerald-400 shadow-[0_0_10px_#22c55e]'
                    : isOnline
                    ? 'bg-emerald-400 shadow-[0_0_10px_#22c55e]'
                    : 'bg-amber-400'
                }`}
              />
              <span className="flex items-center gap-1.5 text-xs text-slate-200">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Local File Storage</span>
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-300 font-bold bg-white/5 px-2 py-0.5 rounded-md border border-white/10">v1.4.0</span>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-teal-500/15 flex items-center gap-3 bg-[#07171a]/95">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-emerald-400/40 shadow-md">
            {/* User Avatar Image */}
            <img
              src="/images/dr_sunita_avatar.jpg"
              alt="Dr. Sunita Rao"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-black" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white truncate">
              Dr. Sunita Rao
            </p>
            <p className="text-[11px] text-slate-300 font-medium truncate">
              Community Health Worker
            </p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE / TABLET HEADER ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#0a1819]/90 backdrop-blur-xl border-b border-teal-500/20 px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <Link
            href="/screening"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-xl text-xs font-bold shadow-[0_0_15px_rgba(34,197,94,0.4)]"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Screen</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-teal-500/30 text-slate-300 hover:bg-white/5"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer when menu is opened */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-md flex flex-col pt-16">
          <div className="bg-[#0a1819] p-4 space-y-2 border-b border-teal-500/20 shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold ${
                    isActive
                      ? 'bg-teal-500/20 text-emerald-300 border border-teal-400/40'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 relative">
        {/* Ambient 3D Floating Background Elements (Luminous Transparent 3D Glass) */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          {/* Floating 3D Eye (Left bottom) */}
          <div className="absolute -left-10 bottom-8 w-56 h-56 opacity-65 animate-float-eye">
            <img src="/images/glass_eye_3d.jpg" alt="3D Glass Eye" className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_0_40px_rgba(6,182,212,0.6)]" />
          </div>

          {/* Floating 3D Pill (Right bottom) */}
          <div className="absolute -right-8 bottom-6 w-60 h-60 opacity-70 animate-float-pill">
            <img src="/images/glass_pill_3d.jpg" alt="3D Glass Pill" className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_0_45px_rgba(34,197,94,0.6)]" />
          </div>

          {/* Floating 3D Medical Cross (Bottom center right) */}
          <div className="absolute right-[28%] -bottom-6 w-44 h-44 opacity-55 animate-float-cross">
            <img src="/images/glass_cross_3d.jpg" alt="3D Glass Cross" className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_0_35px_rgba(20,184,166,0.5)]" />
          </div>

          {/* Floating 3D DNA Structure (Top right) */}
          <div className="absolute -right-14 top-8 w-64 h-64 opacity-55 animate-float-dna">
            <img src="/images/glass_dna_3d.jpg" alt="3D Glass DNA" className="w-full h-full object-contain mix-blend-screen filter drop-shadow-[0_0_45px_rgba(59,130,246,0.5)]" />
          </div>
        </div>

        {/* Top desktop header bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-[#030a0d]/85 backdrop-blur-2xl border-b border-teal-500/20 sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-extrabold text-white tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-xs text-emerald-300 font-extrabold shadow-[0_0_15px_rgba(34,197,94,0.3)]">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-400 shadow-[0_0_8px_#22c55e]' : 'bg-amber-400'
                }`}
              />
              <span>Online</span>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3 py-1 bg-white/10 border border-white/15 rounded-full text-xs shadow-inner">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-400/60 shadow-xs">
                <img src="/images/dr_sunita_avatar.jpg" alt="Dr. Sunita" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-slate-100">SR Dr. Sunita</span>
            </div>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>

      {/* ── CHAINLINK UI FLOATING AUTOPLAY PILL ── */}
      <div className="autoplay-pill select-none">
        <div className="autoplay-dot" />
        <span className="pixel text-[11px] tracking-tight">AI SHOWCASE ACTIVE</span>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-slate-500">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/dashboard' || pathname === '/' ? 'text-teal-600 font-bold' : ''
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </Link>
        <Link
          href="/patients"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/patients') ? 'text-teal-600 font-bold' : ''
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients</span>
        </Link>
        <Link
          href="/screening"
          className="flex flex-col items-center gap-1 text-teal-600 font-bold"
        >
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm -mt-3">
            <Plus className="w-5 h-5" />
          </div>
          <span>Screen</span>
        </Link>
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/history') ? 'text-teal-600 font-bold' : ''
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Screenings</span>
        </Link>
        <Link
          href="/referrals"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/referrals') ? 'text-teal-600 font-bold' : ''
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Referrals</span>
        </Link>
      </nav>
    </div>
  );
}
