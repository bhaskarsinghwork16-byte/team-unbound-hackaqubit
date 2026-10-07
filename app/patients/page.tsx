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
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Input,
  Select,
  StatusBadge,
  Badge,
  EmptyState,
  Modal
} from '@/components/ui';

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="info">Patient Directory</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Patients</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Registered community patients and their longitudinal screening records.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            size="md"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setShowAddModal(true)}
          >
            + Add Patient
          </Button>
        </div>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              type="text"
              placeholder="Search by name, patient ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              className="py-2 text-xs"
            />
          </div>

          {/* Filters: All, Recently screened, Follow-up required */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-100/80 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Patients
            </button>
            <button
              type="button"
              onClick={() => setFilter('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'recent'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Recently Screened
            </button>
            <button
              type="button"
              onClick={() => setFilter('followup')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === 'followup'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Follow-up Required
            </button>
          </div>
        </CardContent>
      </Card>

      {/* ── PATIENTS TABLE ── */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">
              Loading patient records...
            </div>
          ) : patients.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={Users}
                title="No patients found"
                description={
                  search || filter !== 'all'
                    ? 'No patient records matched the specified filter criteria.'
                    : 'Register a patient to begin community screening records.'
                }
                actionLabel="+ Add Patient"
                onAction={() => setShowAddModal(true)}
              />
            </div>
          ) : (
            <Table containerClassName="border-0 rounded-none shadow-none">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Demographics</TableHead>
                  <TableHead>Contact & Location</TableHead>
                  <TableHead>Registered Date</TableHead>
                  <TableHead>Follow-up</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.patientId}>
                    <TableCell>
                      <Link
                        href={`/patients/${p.patientId}`}
                        className="font-semibold text-slate-900 hover:text-teal-600 transition-colors block"
                      >
                        {p.name}
                      </Link>
                      <span className="text-[11px] font-mono text-slate-400">
                        {p.patientId}
                      </span>
                    </TableCell>
                    <TableCell className="text-slate-600 text-xs">
                      {p.age} yrs · {p.sex}
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="font-medium text-slate-800">{p.phone || '—'}</div>
                      <span className="text-[11px] text-slate-500">{p.address || '—'}</span>
                    </TableCell>
                    <TableCell className="text-slate-500 whitespace-nowrap text-xs font-medium">
                      {formatDate(p.registeredDate)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {p.needsFollowUp ? (
                        <StatusBadge status="follow_up_required" />
                      ) : (
                        <StatusBadge status="completed" />
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap space-x-2">
                      <Link href={`/screening?patientId=${p.patientId}`}>
                        <Button variant="secondary" size="sm">
                          Screen
                        </Button>
                      </Link>
                      <Link href={`/patients/${p.patientId}`}>
                        <Button variant="outline" size="sm">
                          <span>Record</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ── STANDARDIZED ADD PATIENT MODAL ── */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Register New Patient"
        description="Create a verified clinical patient record for community health screening"
        maxWidth="lg"
      >
        {formError && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleCreatePatient} className="space-y-4">
          <Input
            label="Full Name"
            required
            placeholder="e.g. Kamala Devi"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Age (Years)"
              type="number"
              required
              placeholder="e.g. 45"
              value={newAge}
              onChange={(e) => setNewAge(e.target.value)}
            />

            <Select
              label="Sex"
              value={newSex}
              onChange={(e) => setNewSex(e.target.value as any)}
              options={[
                { value: 'Female', label: 'Female' },
                { value: 'Male', label: 'Male' },
                { value: 'Other', label: 'Other' },
              ]}
            />
          </div>

          <Input
            label="Phone Number"
            placeholder="+91 98765 43210"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
          />

          <Input
            label="Address / Village / Camp"
            placeholder="District clinic or community location"
            value={newAddress}
            onChange={(e) => setNewAddress(e.target.value)}
          />

          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setShowAddModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
            >
              Register Patient
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
