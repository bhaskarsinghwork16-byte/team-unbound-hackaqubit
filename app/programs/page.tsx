'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Plus, ArrowRight, Building, Calendar, Users } from 'lucide-react';
import { ScreeningProgram } from '@/types';

export default function ProgramsPage() {
  const [programs, setPrograms] = useState<ScreeningProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPrograms() {
      try {
        const res = await fetch('/api/programs');
        const data = await res.json();
        if (data.success) {
          setPrograms(data.data || []);
        }
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPrograms();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">ACTIVE</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">DRAFT</span>;
      case 'PAUSED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">PAUSED</span>;
      case 'COMPLETED':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">COMPLETED</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">HealthScreen Programs</h1>
          <p className="text-sm text-slate-500 mt-1">Manage organizational screening initiatives and campaigns.</p>
        </div>
        <Link
          href="/programs/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Program</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Loading programs...</div>
        ) : programs.length === 0 ? (
          <div className="col-span-full py-12 text-center">
            <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900">No programs found</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Get started by creating a new screening program.</p>
          </div>
        ) : (
          programs.map((program) => (
            <Link
              key={program.programId}
              href={`/programs/${program.programId}`}
              className="group bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-teal-600 hover:shadow-md transition-all flex flex-col"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition-colors">
                  <Shield className="w-5 h-5" />
                </div>
                {getStatusBadge(program.status)}
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 mb-1 leading-tight group-hover:text-teal-700 transition-colors">
                {program.name}
              </h3>
              
              <div className="space-y-2 mt-4 flex-1">
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{new Date(program.startDate).toLocaleDateString()} - {program.endDate ? new Date(program.endDate).toLocaleDateString() : 'Ongoing'}</span>
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span>Target: {program.targetPatients.toLocaleString()} patients</span>
                </div>
                <div className="flex items-center text-xs text-slate-500 gap-2">
                  <Building className="w-3.5 h-3.5 text-slate-400" />
                  <span>{program.organizationId}</span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-sm font-semibold text-teal-700">
                <span>View Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
