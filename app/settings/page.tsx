'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  Database, 
  Sliders, 
  ShieldCheck, 
  Server, 
  Cpu, 
  HardDrive, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Key,
  Lock,
  Camera,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

const PRESET_AVATARS = [
  { id: 'female_dr_1', name: 'Dr. Sunita Rao (Primary)', url: '/images/dr_sunita_avatar.jpg' },
  { id: 'female_dr_2', name: 'Dr. Sunita Rao (Clinic)', url: '/images/dr_sunita_avatar_2.jpg' },
  { id: 'avatar_w1', name: 'Female Clinician 1', url: 'https://images.unsplash.com/photo-1594824813566-7885a3964516?auto=format&fit=crop&q=80&w=250' },
  { id: 'avatar_w2', name: 'Female Clinician 2', url: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=250' },
];

export default function SettingsPage() {
  const [threshold, setThreshold] = useState(60);
  const [activeTab, setActiveTab] = useState<'facility' | 'safety' | 'system'>('facility');
  const [mongoStatus, setMongoStatus] = useState<{ connected: boolean; message: string }>({
    connected: false,
    message: 'Checking status...',
  });

  // Profile State
  const [profile, setProfile] = useState({
    name: 'Dr. Sunita Rao',
    role: 'Community Health Manager',
    username: 'dr_sunita',
    avatarUrl: '/images/dr_sunita_avatar.jpg',
  });

  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomUrlInput, setShowCustomUrlInput] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    // Fetch profile info
    fetch('/api/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.profile) {
          setProfile({
            name: d.profile.name || 'Dr. Sunita Rao',
            role: d.profile.role || 'Community Health Manager',
            username: d.profile.username || 'dr_sunita',
            avatarUrl: d.profile.avatarUrl || '/images/dr_sunita_avatar.jpg',
          });
        }
      })
      .catch((err) => console.error('Failed to load profile:', err));

    // Fetch database health
    fetch('/api/health')
      .then((r) => r.json())
      .then((d) => {
        if (d.database) setMongoStatus(d.database);
      })
      .catch(() => {
        setMongoStatus({ connected: false, message: 'Local Secure File Storage Active' });
      });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match. Please verify.' });
      return;
    }

    if (newPassword && newPassword.length < 4) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 4 characters long.' });
      return;
    }

    setSaving(true);
    try {
      const finalAvatar = showCustomUrlInput && customAvatarUrl.trim() !== '' ? customAvatarUrl.trim() : profile.avatarUrl;
      
      const payload: Record<string, string> = {
        name: profile.name,
        role: profile.role,
        username: profile.username,
        avatarUrl: finalAvatar,
      };

      if (newPassword) {
        payload.password = newPassword;
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setProfile((prev) => ({ ...prev, avatarUrl: finalAvatar }));
        setNewPassword('');
        setConfirmPassword('');
        setStatusMessage({ type: 'success', text: data.message || 'Profile and credentials updated successfully!' });
        
        // Dispatch custom event so AppShell and other components react dynamically
        window.dispatchEvent(new Event('profileUpdated'));
      } else {
        setStatusMessage({ type: 'error', text: data.error || 'Failed to update profile.' });
      }
    } catch (err) {
      console.error(err);
      setStatusMessage({ type: 'error', text: 'Network or server error updating profile.' });
    } finally {
      setSaving(false);
    }
  };

  const verificationScenarios = [
    {
      id: 'NORMAL_RETINA',
      title: 'Clear Retinal Specimen',
      type: 'Eye (Diabetic Retinopathy)',
      outcome: 'No obvious abnormality detected',
      href: '/screening?type=eye&demo=NORMAL_RETINA',
    },
    {
      id: 'REFERABLE_RETINA',
      title: 'Microvascular Findings Specimen',
      type: 'Eye (Diabetic Retinopathy)',
      outcome: 'Potential finding detected (Referral indicated)',
      href: '/screening?type=eye&demo=REFERABLE_RETINA',
    },
    {
      id: 'LOW_RISK_ORAL',
      title: 'Normal Oral Mucosa Specimen',
      type: 'Oral Visual Screening',
      outcome: 'No obvious abnormality detected',
      href: '/screening?type=oral&demo=LOW_RISK_ORAL',
    },
    {
      id: 'REVIEW_ORAL',
      title: 'Mucosal Lesion Specimen',
      type: 'Oral Visual Screening',
      outcome: 'Potential finding detected (Review indicated)',
      href: '/screening?type=oral&demo=REVIEW_ORAL',
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* ── HEADER ── */}
      <div className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[10px] bg-[#ffdccc] text-[#5d2a42] px-3 py-0.5 rounded-full border border-[#fec89a] font-bold tracking-wide">
            SYSTEM PARAMETERS
          </span>
        </div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#5d2a42]">System Settings & Account Management</h1>
        <p className="text-xs text-[#5d2a42]/70 font-medium mt-1">
          Manage Community Health Manager credentials, avatar profile, decision-support safety gates, and storage.
        </p>
      </div>

      {/* ── TABS ── */}
      <div className="flex border-b border-[#d8e2dc] gap-6 text-xs font-bold">
        <button
          onClick={() => setActiveTab('facility')}
          className={`pb-3 relative transition flex items-center gap-1.5 ${
            activeTab === 'facility'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          <User className="w-3.5 h-3.5" />
          Manager Profile & Facility
        </button>
        <button
          onClick={() => setActiveTab('safety')}
          className={`pb-3 relative transition flex items-center gap-1.5 ${
            activeTab === 'safety'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          Clinical Safety Gates
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`pb-3 relative transition flex items-center gap-1.5 ${
            activeTab === 'system'
              ? 'text-[#5d2a42] border-b-2 border-[#5d2a42] font-black'
              : 'text-[#5d2a42]/60 hover:text-[#5d2a42]'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          System & Model Specs
        </button>
      </div>

      {/* ── TAB 1: MANAGER PROFILE & FACILITY ── */}
      {activeTab === 'facility' && (
        <div className="space-y-6">
          {/* COMMUNITY HEALTH MANAGER CREDENTIALS & AVATAR FORM */}
          <form onSubmit={handleSaveProfile} className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#d8e2dc]/60 pb-4">
              <div>
                <h2 className="text-sm font-bold text-[#5d2a42] flex items-center gap-2">
                  <User className="w-4 h-4 text-[#5d2a42]" />
                  Community Health Manager Account & Profile
                </h2>
                <p className="text-xs text-[#5d2a42]/70 font-medium mt-0.5">
                  Update manager credentials (username & password) and customize avatar display across the system.
                </p>
              </div>
              <span className="text-[10px] font-bold bg-[#d8e2dc]/50 text-[#5d2a42] px-2.5 py-1 rounded-full border border-[#d8e2dc]">
                Active Session
              </span>
            </div>

            {statusMessage && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
                  statusMessage.type === 'success'
                    ? 'bg-[#d8e2dc]/60 border-[#b8ccbf] text-[#2d523e]'
                    : 'bg-[#ffdccc]/70 border-[#fec89a] text-[#842318]'
                }`}
              >
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2d523e]" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-[#842318]" />
                )}
                <span>{statusMessage.text}</span>
              </div>
            )}

            {/* AVATAR SELECTION SECTION */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#5d2a42]">Profile Avatar</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#fff9ec] p-4 rounded-xl border border-[#d8e2dc]">
                {/* Active Avatar Preview */}
                <div className="relative shrink-0">
                  <img
                    src={showCustomUrlInput && customAvatarUrl ? customAvatarUrl : profile.avatarUrl}
                    alt={profile.name}
                    className="w-20 h-20 rounded-full object-cover border-3 border-[#5d2a42] shadow-md bg-white"
                    onError={(e) => {
                      // Fallback icon preview if image fails
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute -bottom-1 -right-1 bg-[#5d2a42] text-white p-1 rounded-full shadow">
                    <Camera className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <div className="text-xs font-bold text-[#5d2a42]">Choose Avatar Preset</div>
                  <div className="flex flex-wrap gap-2">
                    {PRESET_AVATARS.map((item) => {
                      const isSelected = !showCustomUrlInput && profile.avatarUrl === item.url;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            setShowCustomUrlInput(false);
                            setProfile((prev) => ({ ...prev, avatarUrl: item.url }));
                          }}
                          className={`relative p-1 rounded-full border-2 transition ${
                            isSelected
                              ? 'border-[#5d2a42] ring-2 ring-[#ffdccc] scale-105'
                              : 'border-transparent hover:border-[#d8e2dc]'
                          }`}
                          title={item.name}
                        >
                          <img
                            src={item.url}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          {isSelected && (
                            <span className="absolute -top-1 -right-1 bg-[#5d2a42] text-white rounded-full p-0.5 shadow">
                              <Check className="w-2.5 h-2.5" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                    
                    <button
                      type="button"
                      onClick={() => setShowCustomUrlInput(!showCustomUrlInput)}
                      className={`px-3 py-1.5 text-[11px] font-bold rounded-full border transition flex items-center gap-1 ${
                        showCustomUrlInput
                          ? 'bg-[#5d2a42] text-white border-[#5d2a42]'
                          : 'bg-white text-[#5d2a42] border-[#d8e2dc] hover:bg-[#ffdccc]/30'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      {showCustomUrlInput ? 'Using Custom URL' : 'Custom Image URL'}
                    </button>
                  </div>

                  {showCustomUrlInput && (
                    <div className="mt-2">
                      <input
                        type="url"
                        placeholder="Enter image URL (e.g. https://... or /images/...)"
                        value={customAvatarUrl}
                        onChange={(e) => setCustomAvatarUrl(e.target.value)}
                        className="w-full px-3 py-2 text-xs bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-medium focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* MANAGER DETAILS & USERNAME */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-[#5d2a42] mb-1">Manager Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#5d2a42]/50 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-bold focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5d2a42] mb-1">Official Designation / Role</label>
                <input
                  type="text"
                  required
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-bold focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-[#5d2a42] mb-1">Manager Login Username</label>
                <div className="relative">
                  <Key className="w-4 h-4 text-[#5d2a42]/50 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={profile.username}
                    onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-mono font-bold focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                  />
                </div>
                <p className="text-[11px] text-[#5d2a42]/60 mt-1">
                  Used for authenticating into the HealthScreen Community Portal.
                </p>
              </div>
            </div>

            {/* PASSWORD UPDATE SECTION */}
            <div className="pt-2 border-t border-[#d8e2dc]/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-[#5d2a42] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#5d2a42]" />
                  Change Password
                </h3>
                <span className="text-[10px] text-[#5d2a42]/60 font-medium">Leave blank to keep current password</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">New Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pr-9 pl-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-mono font-medium focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-[#5d2a42]/60 hover:text-[#5d2a42]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">Confirm New Password</label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-mono font-medium focus:ring-2 focus:ring-[#5d2a42]/30 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#5d2a42] hover:bg-[#4a2134] text-white rounded-xl font-bold text-xs shadow transition flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Update Profile & Credentials
                  </>
                )}
              </button>
            </div>
          </form>

          {/* FACILITY CONTEXT */}
          <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#5d2a42]">Healthcare Facility Context</h2>
            <p className="text-xs text-[#5d2a42]/70 font-medium">
              Facility identifiers linked to screening records and outgoing referrals.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
              <div>
                <label className="block font-semibold text-[#5d2a42] mb-1">Facility Name</label>
                <input
                  type="text"
                  readOnly
                  value="District Primary Health Centre #1"
                  className="w-full px-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-bold"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#5d2a42] mb-1">Facility Code</label>
                <input
                  type="text"
                  readOnly
                  value="FAC-MAIN"
                  className="w-full px-3.5 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* STORAGE & DB STATUS */}
          <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#5d2a42]">Data Persistence & Synchronization</h2>
            <p className="text-xs text-[#5d2a42]/70 font-medium">
              Dual-mode local file storage and cloud MongoDB synchronization status.
            </p>

            <div className="p-4 rounded-xl border flex items-center justify-between text-xs bg-[#fff9ec] border-[#d8e2dc]">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-[#5d2a42]" />
                <div>
                  <div className="font-bold text-[#5d2a42]">
                    Database Connection Status
                  </div>
                  <div className="text-[#5d2a42]/70 mt-0.5 font-medium">
                    {mongoStatus.message}
                  </div>
                </div>
              </div>
              <span
                className={`px-3 py-1.5 rounded-full font-extrabold text-[11px] ${
                  mongoStatus.connected
                    ? 'bg-[#d8e2dc] text-[#5d2a42] border border-[#c4d4cc]'
                    : 'bg-[#ffdccc] text-[#5d2a42] border border-[#fec89a]'
                }`}
              >
                {mongoStatus.connected ? '● MongoDB Connected' : '● Local Offline Storage Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: CLINICAL SAFETY GATES ── */}
      {activeTab === 'safety' && (
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-sm font-bold text-[#5d2a42]">Clinical Safety Confidence Threshold</h2>
            <p className="text-xs text-[#5d2a42]/70 font-medium mt-0.5">
              Strict cut-off below which the system reports &apos;Unable to determine reliably&apos; rather than guessing.
            </p>
          </div>

          <div className="max-w-md space-y-3 text-xs">
            <div className="flex justify-between font-bold text-[#5d2a42]">
              <span>Minimum Confidence Threshold</span>
              <span className="font-mono text-[#5d2a42] font-black text-sm">{threshold}%</span>
            </div>

            <input
              type="range"
              min="50"
              max="90"
              step="5"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full accent-[#5d2a42] cursor-pointer"
            />

            <p className="text-[11px] text-[#5d2a42]/80 leading-relaxed font-medium">
              In clinical decision-support systems, a higher threshold guards against false reassurances by escalating ambiguous patterns to human clinician review.
            </p>
          </div>

          <div className="pt-4 border-t border-[#d8e2dc] space-y-2 text-xs">
            <h3 className="font-bold text-[#5d2a42]">Optical Quality Standards</h3>
            <ul className="space-y-1.5 text-[#5d2a42]/80 text-[11px] font-medium">
              <li>• <strong className="text-[#5d2a42]">Laplacian Variance Blur Filter:</strong> Minimum variance threshold = 100</li>
              <li>• <strong className="text-[#5d2a42]">Mean Luminance Exposure Gate:</strong> 25 - 225 out of 255</li>
              <li>• <strong className="text-[#5d2a42]">Contrast Dynamic Range:</strong> Minimum 20.0 standard deviation</li>
            </ul>
          </div>
        </div>
      )}

      {/* ── TAB 3: SYSTEM & MODEL SPECS ── */}
      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-[#5d2a42]">Machine Learning Specifications</h2>
            <p className="text-xs text-[#5d2a42]/70 font-medium">
              Documentation of architectures, quantization, and evaluation benchmarks.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#fff9ec] rounded-xl border border-[#d8e2dc] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5d2a42] block">Eye Protocol</span>
                <div className="font-extrabold text-[#5d2a42]">HealthScreen-DR-v1.2</div>
                <div className="text-[#5d2a42]/80 text-[11px] font-medium">Architecture: MobileNetV3-Large (Quantized INT8)</div>
                <div className="text-[#5d2a42]/60 text-[11px] font-medium">Reference Dataset: APTOS 2019 Blindness Detection</div>
              </div>

              <div className="p-4 bg-[#fff9ec] rounded-xl border border-[#d8e2dc] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#5d2a42] block">Oral Protocol</span>
                <div className="font-extrabold text-[#5d2a42]">HealthScreen-Oral-v1.1</div>
                <div className="text-[#5d2a42]/80 text-[11px] font-medium">Architecture: EfficientNet-Lite0 (Quantized INT8)</div>
                <div className="text-[#5d2a42]/60 text-[11px] font-medium">Reference Dataset: Oral Cavity Visual Dataset</div>
              </div>
            </div>
          </div>

          {/* Verification & Test Encounters */}
          <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-4 shadow-sm">
            <div>
              <h2 className="text-sm font-bold text-[#5d2a42]">Clinical Verification Specimens</h2>
              <p className="text-xs text-[#5d2a42]/70 font-medium">
                Pre-calibrated specimens for validating end-to-end optical quality and analysis pipelines.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {verificationScenarios.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="p-3.5 bg-[#fff9ec] hover:bg-[#ffdccc]/40 rounded-xl border border-[#d8e2dc] transition flex flex-col justify-between group"
                >
                  <div>
                    <div className="font-bold text-[#5d2a42] group-hover:underline">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-[#5d2a42]/80 font-bold mt-0.5">
                      {item.type}
                    </div>
                    <div className="text-[11px] text-[#5d2a42]/70 mt-1">
                      Expected outcome: {item.outcome}
                    </div>
                  </div>
                  <div className="mt-3 flex items-center text-[#5d2a42] font-black text-[11px]">
                    <span>Run Verification Specimen →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

