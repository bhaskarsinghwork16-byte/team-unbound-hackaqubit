'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  ArrowLeft, ArrowRight, Shield, Building, MapPin, 
  Users, CheckCircle2, AlertCircle, 
  ClipboardList, Plus, BarChart2
} from 'lucide-react';
import { ScreeningProgram, ScreeningCamp } from '@/types';

export default function ProgramDashboard() {
  const { id } = useParams();
  const [program, setProgram] = useState<ScreeningProgram | null>(null);
  const [camps, setCamps] = useState<ScreeningCamp[]>([]);
  const [loading, setLoading] = useState(true);

  // MOCK METRICS FOR DASHBOARD - In Phase C/D these will be calculated from actual screenings
  const metrics = {
    screened: 8742,
    highRisk: 1284,
    referrals: 1012,
    followUpsCompleted: 734,
    followUpsPending: 216,
    followUpsOverdue: 62,
    eyeScreened: 5812,
    eyeHighRisk: 842,
    oralScreened: 4102,
    oralHighRisk: 442,
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [progRes, campsRes] = await Promise.all([
          fetch(`/api/programs/${id}`).then(r => r.json()),
          fetch(`/api/programs/${id}/camps`).then(r => r.json())
        ]);
        if (progRes.success) setProgram(progRes.data);
        if (campsRes.success) setCamps(campsRes.data || []);
      } catch (error) {
        console.error('Failed to load program data:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (loading) {
    return <div className="p-12 text-center text-slate-500">Loading program details...</div>;
  }

  if (!program) {
    return (
      <div className="p-12 text-center">
        <h2 className="text-xl font-bold text-slate-900">Program not found</h2>
        <Link href="/programs" className="text-teal-600 hover:underline mt-4 inline-block">Return to programs</Link>
      </div>
    );
  }

  const progressPercent = Math.min(100, Math.round((metrics.screened / program.targetPatients) * 100));

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <Link href="/programs" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Programs
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{program.name}</h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                {program.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">{program.organizationId} • Coordinator: {program.coordinatorName}</p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/programs/${id}/impact-report`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <BarChart2 className="w-4 h-4" />
              Impact Report
            </Link>
            <Link
              href={`/programs/${id}/camps/new`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Camp
            </Link>
          </div>
        </div>
      </div>

      {/* METRICS ROW 1 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Target</div>
          <div className="text-2xl font-bold text-slate-900">{program.targetPatients.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Screened</div>
          <div className="text-2xl font-bold text-teal-700">{metrics.screened.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">High Risk</div>
          <div className="text-2xl font-bold text-rose-700">{metrics.highRisk.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Referrals</div>
          <div className="text-2xl font-bold text-amber-700">{metrics.referrals.toLocaleString()}</div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Follow-ups</div>
          <div className="text-2xl font-bold text-emerald-700">{metrics.followUpsCompleted.toLocaleString()}</div>
        </div>
      </div>

      {/* PROGRESS BAR */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs">
        <div className="flex justify-between text-sm font-semibold mb-2">
          <span className="text-slate-900">Program Progress</span>
          <span className="text-teal-700">{progressPercent}% ({metrics.screened.toLocaleString()} / {program.targetPatients.toLocaleString()})</span>
        </div>
        <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-teal-500 transition-all duration-1000 ease-out rounded-full" 
            style={{ width: `${progressPercent}%` }} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* OUTCOMES BY TYPE */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Screening Outcomes</h3>
          
          <div className="space-y-4">
            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
              <div className="font-semibold text-sm text-slate-900 mb-2">Diabetic Retinopathy</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Screened: <strong className="text-slate-900">{metrics.eyeScreened.toLocaleString()}</strong></span>
                <span className="text-slate-500">High Risk: <strong className="text-rose-700">{metrics.eyeHighRisk.toLocaleString()}</strong></span>
              </div>
            </div>
            
            <div className="border border-slate-100 rounded-lg p-4 bg-slate-50/50">
              <div className="font-semibold text-sm text-slate-900 mb-2">Oral Cancer</div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Screened: <strong className="text-slate-900">{metrics.oralScreened.toLocaleString()}</strong></span>
                <span className="text-slate-500">High Risk: <strong className="text-rose-700">{metrics.oralHighRisk.toLocaleString()}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* FOLLOW-UPS */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-6">
          <h3 className="text-base font-bold text-slate-900 mb-4">Follow-up Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border border-emerald-100 bg-emerald-50/30 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-semibold text-slate-900">Completed</span>
              </div>
              <span className="text-lg font-bold text-emerald-700">{metrics.followUpsCompleted}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-amber-100 bg-amber-50/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-semibold text-slate-900">Pending</span>
              </div>
              <span className="text-lg font-bold text-amber-700">{metrics.followUpsPending}</span>
            </div>
            <div className="flex items-center justify-between p-3 border border-rose-100 bg-rose-50/30 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-600" />
                <span className="text-sm font-semibold text-slate-900">Overdue</span>
              </div>
              <span className="text-lg font-bold text-rose-700">{metrics.followUpsOverdue}</span>
            </div>
          </div>
        </div>
      </div>

      {/* CAMPS LIST */}
      <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Screening Camps</h2>
          <span className="text-xs font-semibold text-slate-500">{camps.length} camps total</span>
        </div>
        
        {camps.length === 0 ? (
          <div className="p-8 text-center">
            <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500">No camps created yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-5">Camp Name</th>
                  <th className="py-3 px-5">Location</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5">Target</th>
                  <th className="py-3 px-5">Health Workers</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {camps.map(camp => (
                  <tr key={camp.campId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-5 font-semibold text-slate-900">{camp.name}</td>
                    <td className="py-3 px-5 text-slate-600">{camp.location}</td>
                    <td className="py-3 px-5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        camp.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 
                        camp.status === 'COMPLETED' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {camp.status}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-slate-600">{camp.targetPatients}</td>
                    <td className="py-3 px-5 text-slate-600">{camp.assignedWorkers.length}</td>
                    <td className="py-3 px-5 text-right">
                      <Link
                        href={`/programs/${program.programId}/camps/${camp.campId}`}
                        className="text-teal-600 hover:text-teal-800 font-semibold text-xs inline-flex items-center"
                      >
                        Manage <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
