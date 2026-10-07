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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col lg:flex-row">
      {/* ── DESKTOP LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-40 select-none">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} />
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
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
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-teal-700' : 'text-slate-600'
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

        {/* Offline / Storage Status Notice */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <span
                className={`w-2 h-2 rounded-full ${
                  mongoConnected
                    ? 'bg-emerald-500'
                    : isOnline
                    ? 'bg-teal-500'
                    : 'bg-amber-500'
                }`}
              />
              {mongoConnected
                ? 'MongoDB Connected'
                : isOnline
                ? 'Local File Storage'
                : 'Offline Mode'}
            </span>
            <span className="text-[10px] font-mono text-slate-600">v1.4.0</span>
          </div>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-slate-100 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
            SR
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
      <header className="lg:hidden sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <BrandLogo size="sm" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <Link
            href="/screening"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Screen</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile drawer when menu is opened */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex flex-col pt-16">
          <div className="bg-white p-4 space-y-2 border-b border-slate-200 shadow-xl">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                    isActive
                      ? 'bg-teal-50 text-teal-700 font-semibold'
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
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        {/* Top desktop header bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white border-b border-slate-200/80 sticky top-0 z-30">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-600">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              <span className="font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
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
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold">
                SR
              </div>
              <span className="font-semibold text-slate-700">Dr. Sunita</span>
            </div>

            {/* Primary Action Button: + New Screening */}
            <Link
              href="/screening"
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>New Screening</span>
            </Link>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
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
