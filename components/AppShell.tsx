'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  LogOut,
  Smile,
  Activity,
  CheckCircle2,
  Sparkles,
  Search,
  Database,
} from 'lucide-react';
import BrandLogo from './BrandLogo';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const [isOnline, setIsOnline] = useState(true);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authUser, setAuthUser] = useState<{ userId: string; role: string } | null>(null);

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

    // Fetch current session user
    fetch('/api/auth/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.userId) setAuthUser(data);
      })
      .catch(() => {});

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch { /* ignore */ }
    router.push('/login');
  }

  // Derive display info from session
  const roleLabel: Record<string, string> = {
    HEALTH_WORKER: 'Health Worker',
    DOCTOR: 'Doctor',
    CAMP_ADMIN: 'Camp Admin',
    SYSTEM_ADMIN: 'System Admin',
    AUDITOR: 'Auditor',
  };
  const displayRole = authUser ? (roleLabel[authUser.role] ?? authUser.role) : 'Clinical Staff';
  const displayInitials = authUser
    ? authUser.userId.substring(0, 2).toUpperCase()
    : 'HS';

  const navItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Programs', href: '/programs', icon: Shield },
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
    if (pathname.startsWith('/reports') || pathname.startsWith('/analytics')) return 'Operational Analytics';
    if (pathname.startsWith('/database')) return 'Database & Collections Explorer';
    if (pathname.startsWith('/settings')) return 'System Settings';
    if (pathname.startsWith('/datasets')) return 'Dataset Documentation';
    return 'Community Health';
  };

  // ── IF WE ARE ON THE WEBSITE HOME LANDING PAGE (`/`) ──
  if (isHomePage) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased flex flex-col selection:bg-teal-500/20 selection:text-teal-900">
        {/* ── PUBLIC WEBSITE TOP NAVBAR ── */}
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BrandLogo size="md" showSubtitle={true} theme="light" />
            </div>

            {/* Public Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600 bg-slate-100/70 p-1 rounded-full border border-slate-200/60">
              <a
                href="#hero"
                className="px-4 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all text-xs font-semibold"
              >
                Platform
              </a>
              <a
                href="#protocols"
                className="px-4 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all text-xs font-semibold"
              >
                Protocols
              </a>
              <a
                href="#features"
                className="px-4 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all text-xs font-semibold"
              >
                Edge AI
              </a>
              <a
                href="#modules"
                className="px-4 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all text-xs font-semibold"
              >
                Modules
              </a>
              <Link
                href="/datasets"
                className="px-4 py-1.5 rounded-full hover:text-slate-900 hover:bg-white transition-all text-xs font-semibold"
              >
                Validation Data
              </Link>
            </nav>

            <div className="flex items-center gap-3">
              <Link
                href="/screening"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-teal-600" />
                <span>Screen Patient</span>
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-teal-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <LayoutDashboard className="w-4 h-4 text-teal-100" />
                <span>Clinical Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-100" />
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 w-full">
          {children}
        </main>
      </div>
    );
  }

  // ── CLINICAL WORKSPACE LAYOUT (`/dashboard`, `/patients`, etc.) ──
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 font-sans antialiased flex flex-col lg:flex-row relative">
      {/* ── DESKTOP LEFT SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/90 h-screen sticky top-0 z-40 select-none shadow-xs">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <BrandLogo size="md" showSubtitle={true} theme="light" />
        </div>

        {/* Quick Launch Button */}
        <div className="px-3 pt-4 pb-2">
          <Link
            href="/screening"
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold shadow-sm shadow-teal-600/20 transition-all transform hover:scale-[1.01] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Patient Screening</span>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          <div className="px-3 pt-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Workflows
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
                className={`relative flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'text-teal-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-teal-50 border border-teal-200/80 rounded-xl -z-10 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
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
        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50/70">
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
              <span className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                <Shield className="w-3.5 h-3.5 text-teal-600" />
                <span>{mongoConnected ? 'Cloud Sync' : 'Local Storage'}</span>
              </span>
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
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
            <p className="text-xs font-bold text-slate-900 truncate">
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
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors"
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
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs flex flex-col pt-14"
          >
            <div className="bg-white p-4 space-y-1 border-b border-slate-200 shadow-xl">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-teal-600" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MAIN WORKSPACE CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0 relative">
        {/* Top desktop header bar */}
        <header className="hidden lg:flex items-center justify-between h-16 px-8 bg-white/80 backdrop-blur-xl border-b border-slate-200/90 sticky top-0 z-30">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-semibold shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 pulse-dot' : 'bg-amber-500'
                }`}
              />
              <span>{isOnline ? 'Edge & Cloud Sync' : 'Offline Mode'}</span>
            </div>

            {/* Quick Screen Button in Topbar */}
            <Link
              href="/screening"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200 transition-all"
            >
              <Plus className="w-3.5 h-3.5 text-teal-600" />
              <span>New Screen</span>
            </Link>

            {/* Notification bell */}
            <button
              type="button"
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User badge + logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 text-xs">
              <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold shrink-0">
                {displayInitials}
              </div>
              <span className="font-semibold text-slate-700 truncate max-w-[80px]">{displayRole}</span>
              <button
                onClick={handleLogout}
                title="Sign out"
                aria-label="Sign out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>

      {/* ── MOBILE BOTTOM NAVIGATION BAR ── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 flex items-center justify-around text-[10px] font-medium text-slate-500">
        <Link
          href="/dashboard"
          className={`flex flex-col items-center gap-1 ${
            pathname === '/dashboard' ? 'text-teal-600 font-bold' : ''
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
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-600 to-emerald-600 text-white flex items-center justify-center shadow-md -mt-4">
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
          <span>History</span>
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
