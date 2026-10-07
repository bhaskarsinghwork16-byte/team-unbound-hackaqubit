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
  ArrowRight,
  Shield,
  Eye,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

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
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col">
        {/* ── PUBLIC WEBSITE TOP NAVBAR ── */}
        <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-colors">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showSubtitle={true} theme="light" />
            </div>

            {/* Public Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <a href="#hero" className="hover:text-teal-600 transition-colors">Platform</a>
              <a href="#options" className="hover:text-teal-600 transition-colors">Modules</a>
              <Link href="/screening" className="hover:text-teal-600 transition-colors flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-teal-600" />
                <span>AI Screening</span>
              </Link>
              <Link href="/datasets" className="hover:text-teal-600 transition-colors">AI Models</Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-100" />
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-100" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    );
  }

  // ── CLINICAL WORKSPACE LAYOUT (`/dashboard`, `/patients`, etc.) ──
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased flex flex-col lg:flex-row relative">
      {/* ── DESKTOP LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-40 select-none shadow-2xs">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} theme="light" />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Clinical Workflow
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
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200/80 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Local Storage / Online Status Bar */}
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/60">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-2 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  mongoConnected
                    ? 'bg-emerald-500'
                    : isOnline
                    ? 'bg-emerald-500'
                    : 'bg-amber-500'
                }`}
              />
              <span className="flex items-center gap-1.5 text-xs text-slate-600">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>{mongoConnected ? 'Cloud Sync' : 'Local Storage'}</span>
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-semibold bg-white px-2 py-0.5 rounded border border-slate-200">
              v1.4.0
            </span>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3.5 border-t border-slate-100 flex items-center gap-3 bg-white">
          <div className="relative w-9 h-9 rounded-full overflow-hidden border border-slate-200 shrink-0">
            <img
              src="/images/dr_sunita_avatar.jpg"
              alt="Dr. Sunita Rao"
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-900 truncate">
              Dr. Sunita Rao
            </p>
            <p className="text-[11px] text-slate-500 truncate">
              Community Health Worker
            </p>
          </div>
        </div>
      </aside>

      {/* ── MOBILE / TABLET HEADER ── */}
      <header className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} theme="light" />
        <div className="flex items-center gap-2">
          <Link
            href="/screening"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Screen</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer when menu is opened */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex flex-col pt-14">
          <div className="bg-white p-4 space-y-1 border-b border-slate-200 shadow-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 font-semibold border border-teal-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-4 h-4 text-teal-600" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 relative">
        {/* Top desktop header bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white/90 backdrop-blur-md border-b border-slate-200/90 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 font-medium shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 pulse-dot' : 'bg-amber-500'
                }`}
              />
              <span>{isOnline ? 'Online Sync' : 'Offline Mode'}</span>
            </div>

            {/* Notification bell */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User badge */}
            <div className="flex items-center gap-2.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs">
              <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200">
                <img src="/images/dr_sunita_avatar.jpg" alt="Dr. Sunita" className="w-full h-full object-cover" />
              </div>
              <span className="font-semibold text-slate-800">Dr. Sunita Rao</span>
            </div>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-slate-500">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/dashboard' ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Overview</span>
        </Link>
        <Link
          href="/patients"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/patients') ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Patients</span>
        </Link>
        <Link
          href="/screening"
          className="flex flex-col items-center gap-1 text-teal-600 font-semibold"
        >
          <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs -mt-3">
            <Plus className="w-4 h-4" />
          </div>
          <span>Screen</span>
        </Link>
        <Link
          href="/history"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/history') ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Screenings</span>
        </Link>
        <Link
          href="/referrals"
          className={`flex flex-col items-center gap-1 ${
            pathname.startsWith('/referrals') ? 'text-teal-600 font-semibold' : ''
          }`}
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Referrals</span>
        </Link>
      </nav>
    </div>
  );
}
