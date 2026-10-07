'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ArrowRight,
  Phone,
  Calendar,
  X
} from 'lucide-react';
import { PatientRecord } from '@/types';

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'recent' | 'followup'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for new patient
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newSex, setNewSex] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/patients?search=${encodeURIComponent(search)}&filter=${filter}`);
      const data = await res.json();
      if (data.success) {
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [search, filter]);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!newName.trim() || !newAge) {
      setFormError('Patient full name and age are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          age: Number(newAge),
          sex: newSex,
          phone: newPhone,
          address: newAddress,
          notes: newNotes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowAddModal(false);
        setNewName('');
        setNewAge('');
        setNewPhone('');
        setNewAddress('');
        setNewNotes('');
        await fetchPatients();
      } else {
        setFormError(data.error || 'Failed to create patient');
      }
    } catch (err) {
      setFormError('Network error while saving patient.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Never';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="pixel text-[10px] bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/40 font-semibold tracking-wide">
              PATIENT DIRECTORY
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-[#5d2a42]">Patients Directory</h1>
          <p className="text-xs text-[#5d2a42]/80 font-bold mt-1">
            Find patients and view their longitudinal screening history.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#5d2a42] hover:bg-[#5d2a42]/90 text-[#fff9ec] rounded-2xl text-xs font-black shadow-md shadow-[#5d2a42]/20 transition-all border border-[#ffdccc]"
        >
          <Plus className="w-4 h-4 text-[#ffdccc] stroke-[3]" />
          <span>+ Add Patient</span>
        </button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-3xl border border-[#d8e2dc] shadow-md shadow-[#5d2a42]/5 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#5d2a42] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, patient ID, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-2xl text-xs text-[#5d2a42] font-bold placeholder-[#5d2a42]/60 focus:outline-none focus:border-[#5d2a42] transition"
          />
        </div>

        {/* Filters: All, Recently screened, Follow-up required */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-black/40 p-1.5 rounded-xl border border-teal-500/20">
          <button
            onClick={() => setFilter('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'all'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            All Patients
          </button>
          <button
            onClick={() => setFilter('recent')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'recent'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Recently Screened
          </button>
          <button
            onClick={() => setFilter('followup')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              filter === 'followup'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_12px_rgba(34,197,94,0.3)]'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            Follow-up Required
          </button>
        </div>
      </div>

      {/* ── PATIENTS TABLE (3D DARK GLASS) ── */}
      <div className="glass-table-container overflow-hidden shadow-2xl">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">
            Loading patient records...
          </div>
        ) : patients.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-teal-500/10 text-teal-400 mx-auto flex items-center justify-center border border-teal-500/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white">No patients found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {search || filter !== 'all'
                ? 'No patient records matched the specified filter.'
                : 'Add a patient to begin community screening records.'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:scale-105 transition-transform"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Patient</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#5d2a42] text-[#fff9ec] uppercase tracking-wider font-black border-b border-[#d8e2dc]">
                <tr>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">PATIENT</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">DEMOGRAPHICS</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">CONTACT &amp; LOCATION</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">REGISTERED DATE</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black">FOLLOW-UP</th>
                  <th className="py-4 px-5 text-[#fff9ec] font-black text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-teal-500/15 text-slate-200">
                {patients.map((p) => (
                  <tr key={p.patientId} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5">
                      <Link
                        href={`/patients/${p.patientId}`}
                        className="font-bold text-white hover:text-emerald-400 transition-colors block"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-300 font-medium">
                        {p.patientId}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-slate-200 font-medium">
                      {p.age} yrs · {p.sex}
                    </td>
                    <td className="py-4 px-5 text-slate-200">
                      <div className="font-medium text-white">{p.phone || '—'}</div>
                      <span className="text-[11px] text-slate-300">{p.address || '—'}</span>
                    </td>
                    <td className="py-4 px-5 text-slate-300 whitespace-nowrap font-medium">
                      {formatDate(p.registeredDate)}
                    </td>
                    <td className="py-4 px-5 whitespace-nowrap">
                      {p.needsFollowUp ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Follow-up due</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 text-xs font-semibold shadow-[0_0_12px_rgba(34,197,94,0.25)]">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Up to date</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-right whitespace-nowrap space-x-3">
                      <Link
                        href={`/screening?patientId=${p.patientId}`}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 text-emerald-300 font-bold text-xs border border-teal-400/30 transition"
                      >
                        <span>Screen</span>
                      </Link>
                      <Link
                        href={`/patients/${p.patientId}`}
                        className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-xs group"
                      >
                        <span>Record</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── ADD PATIENT MODAL (3D DARK GLASS) ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0a1819] rounded-3xl border border-teal-500/30 max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-teal-500/20">
              <div>
                <h3 className="text-lg font-bold text-white">Register New Patient</h3>
                <p className="text-xs text-slate-400 mt-0.5">Create a clinical patient profile for community screening</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Full Name <span className="text-teal-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamala Devi"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">
                    Age (Years) <span className="text-teal-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 45"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Sex</label>
                  <select
                    value={newSex}
                    onChange={(e) => setNewSex(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white focus:outline-none focus:border-teal-400"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 98765 43210"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Address / Village / Camp</label>
                <input
                  type="text"
                  placeholder="District clinic or community location"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-black/40 border border-teal-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-teal-500/20">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 rounded-xl text-xs font-extrabold shadow-md hover:scale-105 transition-transform"
                >
                  {submitting ? 'Saving...' : 'Register Patient'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
