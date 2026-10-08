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
import SectionPixelTransition from './SectionPixelTransition';
import { UserProfile } from '@/types';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isHomePage = pathname === '/';
  const [isOnline, setIsOnline] = useState(true);
  const [mongoConnected, setMongoConnected] = useState<boolean | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Dr. Sunita Rao',
    role: 'Community Health Manager',
    username: 'dr_sunita',
    avatarUrl: '/images/dr_sunita_avatar.jpg',
  });

  // Profile and connectivity detection
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const loadProfile = () => {
      fetch('/api/profile')
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.profile) {
            setUserProfile(d.profile);
          }
        })
        .catch(() => {});
    };

    loadProfile();
    window.addEventListener('profileUpdated', loadProfile);

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
      window.removeEventListener('profileUpdated', loadProfile);
    };
  }, [pathname]);

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
              <Link href="/datasets" className="hover:opacity-80 transition-opacity">AI Models</Link>
              <Link href="/lithos" className="hover:opacity-80 transition-opacity font-playfair italic text-[#5d2a42]">Lithos Spotlight</Link>
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
                {isActive && (
                  <motion.div
                    layoutId="activeSidebarIndicator"
                    className="absolute inset-0 bg-teal-50 border border-teal-200/80 rounded-xl -z-10 shadow-2xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
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
        <Link
          href="/settings"
          className="p-3 border-t border-[#d8e2dc] flex items-center gap-3 bg-[#ffdccc]/40 hover:bg-[#ffdccc]/70 transition-colors group cursor-pointer"
          title="Edit Profile & Settings"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-[#5d2a42]/30 shadow-xs shrink-0 bg-[#fff9ec]">
            <img
              src={userProfile.avatarUrl || '/images/dr_sunita_avatar.jpg'}
              alt={userProfile.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-black text-[#5d2a42] truncate group-hover:underline">
              {userProfile.name}
            </p>
            <p className="text-[11px] text-[#5d2a42]/80 font-bold truncate">
              {userProfile.role}
            </p>
          </div>
        </Link>
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

          <div className="flex items-center gap-3">
            {/* Live Connectivity Badge */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ffdccc] border border-[#d8e2dc] text-xs text-[#5d2a42] font-black shadow-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOnline ? 'bg-emerald-500 shadow-[0_0_6px_#22c55e]' : 'bg-amber-500'
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
              className="p-2 rounded-xl text-[#5d2a42] hover:bg-[#d8e2dc]/50 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User badge */}
            <Link
              href="/settings"
              className="flex items-center gap-2.5 px-3 py-1 bg-[#d8e2dc]/40 hover:bg-[#d8e2dc]/70 border border-[#d8e2dc] rounded-full text-xs shadow-xs transition-colors cursor-pointer"
              title="Profile Settings"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-[#5d2a42]/30 shadow-xs bg-[#fff9ec]">
                <img
                  src={userProfile.avatarUrl || '/images/dr_sunita_avatar.jpg'}
                  alt={userProfile.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-black text-[#5d2a42]">{userProfile.name}</span>
            </Link>
          </div>
        </header>

        {/* Page children content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto relative z-10">
          <SectionPixelTransition>{children}</SectionPixelTransition>
        </main>
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
          <span>History</span>
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
