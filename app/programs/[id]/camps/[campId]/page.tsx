'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Users, ClipboardList, CheckCircle2,
  AlertCircle, WifiOff, Wifi, UserPlus, Play
} from 'lucide-react';
import { ScreeningCamp } from '@/types';

export default function CampDashboard() {
  const { id, campId } = useParams();
  const [camp, setCamp] = useState<ScreeningCamp | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  const [pendingSync, setPendingSync] = useState(0);

  // MOCK METRICS FOR DASHBOARD - In Phase C/D these will be calculated from actual screenings matching campId
  const metrics = {
    screened: 245,
    highRisk: 34,
    referrals: 28,
    followUpsPending: 12,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/camps/${campId}`);
        const data = await res.json();
        if (data.success) {
          setCamp(data.data);
        }
      } catch (error) {
        console.error('Failed to load camp data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Mock offline detection
    const handleOffline = () => setIsOffline(true);
    const handleOnline = () => setIsOffline(false);
    setIsOffline(!navigator.onLine);
    
    // Mock pending sync records
    if (!navigator.onLine) setPendingSync(8);

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, [campId]);

  const handleSync = () => {
    if (isOffline) return;
    setPendingSync(0);
    alert('Synchronization complete. 8/8 records synchronized securely.');
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading camp details...</div>;
  }

  if (!camp) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Camp not found</h2>
        <Link href={`/programs/${id}`} className="text-teal-600 hover:underline mt-4 inline-block">Return to program</Link>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((metrics.screened / camp.targetPatients) * 100));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link href={`/programs/${id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Program
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{camp.name}</h1>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                camp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
              }`}>
                {camp.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              <MapPin className="inline w-3.5 h-3.5 mr-1" />
              {camp.location} • {new Date(camp.startDate).toLocaleDateString()}
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/screening?programId=${id}&campId=${camp.campId}`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <Play className="w-4 h-4" />
              Start Screening
            </Link>
          </div>
        </div>
      </div>

      {/* OFFLINE / SYNC BANNER */}
      {isOffline ? (
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between border border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <WifiOff className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">CAMP MODE: OFFLINE</h3>
              <p className="text-xs text-slate-400">12 patients screened locally • {pendingSync} records pending synchronization</p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-400">
            Last sync: <br /> 10:42 AM
          </div>
        </div>
      ) : pendingSync > 0 ? (
        <div className="bg-emerald-900 text-white p-4 rounded-xl shadow-lg flex items-center justify-between border border-emerald-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-800 rounded-full flex items-center justify-center border border-emerald-700">
              <Wifi className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-wide">CONNECTION RESTORED</h3>
              <p className="text-xs text-emerald-100">{pendingSync} records ready to synchronize to main server</p>
            </div>
          </div>
          <button
            onClick={handleSync}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-semibold shadow-xs transition-colors"
          >
            Sync Now
          </button>
        </div>
      ) : null}

      {/* METRICS ROW 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Patients Screened</div>
          <div className="text-2xl font-bold text-slate-900">{metrics.screened} / {camp.targetPatients}</div>
          <div className="mt-3 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full" style={{ width: `${progressPercent}%` }} />
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">High-Risk Cases</div>
          <div className="text-2xl font-bold text-rose-700">{metrics.highRisk}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Referrals Made</div>
          <div className="text-2xl font-bold text-amber-700">{metrics.referrals}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Pending Follow-ups</div>
          <div className="text-2xl font-bold text-slate-900">{metrics.followUpsPending}</div>
        </div>
      </div>

      {/* TEAM */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">Camp Team</h3>
          <button className="text-teal-600 text-sm font-semibold flex items-center gap-1 hover:text-teal-700">
            <UserPlus className="w-4 h-4" />
            Assign Worker
          </button>
        </div>
        
        {camp.assignedWorkers.length === 0 ? (
          <div className="text-sm text-slate-500 py-4 text-center border border-dashed border-slate-200 rounded-lg">
            No health workers assigned to this camp.
          </div>
        ) : (
          <div className="space-y-3">
            {camp.assignedWorkers.map((workerId, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs uppercase">
                    {workerId.replace('chw-', '').substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900 capitalize">{workerId.replace('chw-', '')}</div>
                    <div className="text-[10px] font-semibold tracking-wider text-slate-500 uppercase">HEALTH_WORKER</div>
                  </div>
                </div>
                <button className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors">
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
