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
  Menu,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Shield,
  Eye
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import SectionPixelTransition from './SectionPixelTransition';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

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
    if (pathname === '/dashboard') return 'Clinical Overview';
    if (pathname.startsWith('/patients')) return 'Patient Records';
    if (pathname.startsWith('/screening')) return 'New Patient Screening';
    if (pathname.startsWith('/history') || pathname.startsWith('/screenings')) return 'Screening History';
    if (pathname.startsWith('/referrals')) return 'Specialist Referrals';
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) return 'Operational Reports';
    if (pathname.startsWith('/settings')) return 'System Settings';
    if (pathname.startsWith('/datasets')) return 'Dataset Documentation';
    return 'Community Health';
  };

  // ── IF WE ARE ON THE WEBSITE HOME LANDING PAGE (`/`) ──
  // Do NOT render left sidebar initially! Render full website experience with Website Navbar & Dashboard button.
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-[#fff9ec] text-[#5d2a42] font-sans antialiased flex flex-col">
        {/* ── PUBLIC WEBSITE TOP NAVBAR ── */}
        <header className="sticky top-0 z-50 bg-[#fff9ec]/90 backdrop-blur-md border-b border-[#d8e2dc]/60 px-4 sm:px-8 py-3.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showSubtitle={true} />
            </div>

            {/* Public Website Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-[#5d2a42]">
              <a href="#hero" className="hover:opacity-80 transition-opacity">Platform</a>
              <a href="#options" className="hover:opacity-80 transition-opacity">Modules</a>
              <Link href="/screening" className="hover:opacity-80 transition-opacity flex items-center gap-1">
                <Eye className="w-4 h-4 text-[#5d2a42]" />
                <span>AI Screening</span>
              </Link>
              <Link href="/datasets" className="hover:opacity-80 transition-opacity">AI Models</Link>
              <Link href="/lithos" className="hover:opacity-80 transition-opacity font-playfair italic text-[#5d2a42]">Lithos Spotlight</Link>
            </nav>

            {/* Prominent Dashboard Button */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4 text-[#ffdccc]" />
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#ffdccc]" />
              </Link>
            </div>
          </div>
        </header>

        {/* Website Landing Main Container */}
        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    );
  }

  // ── IF WE ARE ON THE CLINICAL DASHBOARD (`/dashboard`, `/patients`, etc.) ──
  // Show the official clinical layout WITH the left sidebar options!
  return (
    <div className="min-h-screen text-[#5d2a42] bg-[#fff9ec] font-sans antialiased flex flex-col lg:flex-row relative overflow-x-hidden">
      {/* ── DESKTOP LEFT SIDEBAR (3D GLASS HOME PALETTE) ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#fff9ec]/95 backdrop-blur-2xl border-r border-[#d8e2dc] h-screen sticky top-0 z-40 select-none shadow-lg shadow-[#5d2a42]/5">
        {/* Brand header */}
        <div className="p-5 border-b border-[#d8e2dc] flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-black uppercase tracking-wider text-[#5d2a42]/70">
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
                className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-extrabold transition-all relative ${
                  isActive
                    ? 'bg-[#5d2a42] text-[#fff9ec] shadow-md shadow-[#5d2a42]/20 border border-[#5d2a42]'
                    : 'text-[#5d2a42]/85 hover:text-[#5d2a42] hover:bg-[#d8e2dc]/40 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#ffdccc]' : 'text-[#5d2a42]/70'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <div className="w-5 h-5 rounded-lg bg-[#ffdccc] flex items-center justify-center border border-[#5d2a42]/20 shadow-xs">
                    <div className="w-2.5 h-2.5 bg-[#5d2a42] rounded-sm transform rotate-45 shadow-xs" />
                  </div>
                )}
              </Link>
            );
          })}
        </nav>



        {/* User profile footer */}
        <div className="p-3 border-t border-[#d8e2dc] flex items-center gap-3 bg-[#ffdccc]/40">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#5d2a42]/30 shadow-xs">
            <img
              src="/images/dr_sunita_avatar.jpg"
              alt="Dr. Sunita Rao"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[#5d2a42] truncate">
              Dr. Sunita Rao
            </p>
            <p className="text-[11px] text-[#5d2a42]/80 font-bold truncate">
              Community Health Worker
            </p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE / TABLET HEADER ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-[#fff9ec]/95 backdrop-blur-xl border-b border-[#d8e2dc] px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <Link
            href="/screening"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#5d2a42] text-[#fff9ec] rounded-xl text-xs font-black shadow-md shadow-[#5d2a42]/20"
          >
            <Plus className="w-3.5 h-3.5 text-[#ffdccc]" />
            <span>Screen</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-xl border border-[#d8e2dc] text-[#5d2a42] hover:bg-[#d8e2dc]/40"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer when menu is opened */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-[#5d2a42]/30 backdrop-blur-md flex flex-col pt-16">
          <div className="bg-[#fff9ec] p-4 space-y-2 border-b border-[#d8e2dc] shadow-2xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold ${
                    isActive
                      ? 'bg-[#5d2a42] text-[#fff9ec]'
                      : 'text-[#5d2a42] hover:bg-[#d8e2dc]/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#ffdccc]' : 'text-[#5d2a42]'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 relative">
        {/* Ambient 3D Floating Background Elements */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
          <div className="absolute -left-10 bottom-8 w-56 h-56 opacity-40 animate-float-eye">
            <img src="/images/glass_eye_3d.jpg" alt="3D Glass Eye" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(93,42,66,0.15)]" />
          </div>
          <div className="absolute -right-8 bottom-6 w-60 h-60 opacity-40 animate-float-pill">
            <img src="/images/glass_pill_3d.jpg" alt="3D Glass Pill" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(93,42,66,0.15)]" />
          </div>
          <div className="absolute right-[28%] -bottom-6 w-44 h-44 opacity-35 animate-float-cross">
            <img src="/images/glass_cross_3d.jpg" alt="3D Glass Cross" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(93,42,66,0.15)]" />
          </div>
          <div className="absolute -right-14 top-8 w-64 h-64 opacity-35 animate-float-dna">
            <img src="/images/glass_dna_3d.jpg" alt="3D Glass DNA" className="w-full h-full object-contain filter drop-shadow-[0_10px_20px_rgba(93,42,66,0.15)]" />
          </div>
        </div>

        {/* Top desktop header bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-[#fff9ec]/90 backdrop-blur-2xl border-b border-[#d8e2dc] sticky top-0 z-30">
          <div>
            <h1 className="text-xl font-black text-[#5d2a42] tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffdccc] border border-[#d8e2dc] text-xs text-[#5d2a42] font-black shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 shadow-[0_0_6px_#22c55e]' : 'bg-amber-500'
                }`}
              />
              <span>Online</span>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="p-2 rounded-xl text-[#5d2a42] hover:bg-[#d8e2dc]/50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3 py-1 bg-[#d8e2dc]/40 border border-[#d8e2dc] rounded-full text-xs shadow-xs">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#5d2a42]/30 shadow-xs">
                <img src="/images/dr_sunita_avatar.jpg" alt="Dr. Sunita" className="w-full h-full object-cover" />
              </div>
              <span className="font-black text-[#5d2a42]">SR Dr. Sunita</span>
            </div>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <SectionPixelTransition>{children}</SectionPixelTransition>
        </main>
      </div>

      {/* ── CHAINLINK UI FLOATING AUTOPLAY PILL ── */}
      <div className="autoplay-pill select-none">
        <div className="autoplay-dot" />
        <span className="pixel text-[11px] tracking-tight">AI SHOWCASE ACTIVE</span>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#fff9ec] border-t border-[#d8e2dc] px-3 py-2 flex items-center justify-around text-[10px] font-bold text-[#5d2a42]/80">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/dashboard' ? 'text-[#5d2a42] font-black' : ''
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </Link>
        <Link
          href="/patients"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/patients') ? 'text-[#5d2a42] font-black' : ''
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients</span>
        </Link>
        <Link
          href="/screening"
          className="flex flex-col items-center gap-1 text-[#5d2a42] font-black"
        >
          <div className="w-8 h-8 rounded-full bg-[#5d2a42] text-[#fff9ec] flex items-center justify-center shadow-md -mt-3">
            <Plus className="w-5 h-5 text-[#ffdccc]" />
          </div>
          <span>Screen</span>
        </Link>
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/history') ? 'text-[#5d2a42] font-black' : ''
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Screenings</span>
        </Link>
        <Link
          href="/referrals"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/referrals') ? 'text-[#5d2a42] font-black' : ''
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Referrals</span>
        </Link>
      </nav>
    </div>
  );
}
