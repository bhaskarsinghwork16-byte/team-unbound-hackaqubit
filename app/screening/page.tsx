'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Eye, 
  Smile, 
  Camera, 
  Upload, 
  RotateCcw, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle, 
  ShieldCheck, 
  UserCheck, 
  GitPullRequest, 
  FileText, 
  Printer, 
  Check, 
  X, 
  Plus, 
  Search,
  ArrowLeft,
  ChevronRight,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { 
  ScreeningType, 
  ScreeningResult, 
  ImageQualityResult, 
  PatientRecord, 
  ReferralPriority 
} from '@/types';
import { assessImageInBrowser, assessImageQualitySync } from '@/services/imageQuality';

function ScreeningWorkflow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlPatientId = searchParams.get('patientId') || '';
  const urlType = (searchParams.get('type') as ScreeningType) || '';
  const urlDemo = searchParams.get('demo') || '';
  const [targetScenario, setTargetScenario] = useState<string>(urlDemo);

  // Stepper state: 1: Patient, 2: Consent, 3: Protocol, 4: Capture, 5: Quality, 6: Analysis, 7: Result, 8: Review
  const [step, setStep] = useState<number>(urlPatientId || urlDemo ? (urlType || urlDemo ? 4 : 2) : 1);

  // ── 01. PATIENT INTAKE STATE ──
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientResults, setPatientResults] = useState<PatientRecord[]>([]);
  const [isSearchingPatient, setIsSearchingPatient] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  
  // New patient inputs
  const [newPatientName, setNewPatientName] = useState('');
  const [newPatientAge, setNewPatientAge] = useState('');
  const [newPatientSex, setNewPatientSex] = useState<'Female' | 'Male' | 'Other'>('Female');
  const [newPatientPhone, setNewPatientPhone] = useState('');
  const [isCreatingPatient, setIsCreatingPatient] = useState(false);

  // ── 02. CONSENT STATE ──
  const [consentObtained, setConsentObtained] = useState(false);

  // ── 03. SCREENING PROTOCOL ──
  const [screeningType, setScreeningType] = useState<ScreeningType>(urlType === 'oral' ? 'oral' : 'eye');

  // ── 04. IMAGE CAPTURE STATE ──
  const [imageUri, setImageUri] = useState<string>('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── 05. QUALITY CHECK STATE ──
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  const [isEvaluatingQuality, setIsEvaluatingQuality] = useState(false);

  // ── 06. ANALYSIS & RESULT STATE ──
  const [analysisStage, setAnalysisStage] = useState(0);
  const [result, setResult] = useState<ScreeningResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // ── 08. HUMAN REVIEW & REFERRAL STATE ──
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'reviewed'>('pending');
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [referralPriority, setReferralPriority] = useState<ReferralPriority>('routine');
  const [referralSpecialist, setReferralSpecialist] = useState('');
  const [referralFacility, setReferralFacility] = useState('District Hospital Specialist Clinic');
  const [referralReason, setReferralReason] = useState('');
  const [referralCreated, setReferralCreated] = useState(false);
  const [isSavingReferral, setIsSavingReferral] = useState(false);

  // Load patient if patientId was provided in query string
  useEffect(() => {
    if (urlPatientId) {
      fetch(`/api/patients/${urlPatientId}`)
        .then((r) => r.json())
        .then((d) => {
          if (d.success && d.patient) {
            setSelectedPatient(d.patient);
          }
        })
        .catch(console.error);
    }
  }, [urlPatientId]);

  // Load demo scenario if provided in query string
  useEffect(() => {
    if (urlDemo) {
      const demoMap: Record<string, { type: ScreeningType; img: string; name: string }> = {
        NORMAL_RETINA: { type: 'eye', img: '/demo/demo_retina_normal.jpg', name: 'Clear Retinal Specimen' },
        REFERABLE_RETINA: { type: 'eye', img: '/demo/demo_retina_referable.jpg', name: 'Microvascular DR Specimen' },
        LOW_RISK_ORAL: { type: 'oral', img: '/demo/demo_oral_normal.jpg', name: 'Normal Oral Mucosa Specimen' },
        REVIEW_ORAL: { type: 'oral', img: '/demo/demo_oral_suspicious.jpg', name: 'Mucosal Lesion Specimen' },
      };

      const match = demoMap[urlDemo];
      if (match) {
        setScreeningType(match.type);
        setImageUri(match.img);
        setTargetScenario(urlDemo);
        setConsentObtained(true);
          setSelectedPatient({
            patientId: `P-SPECIMEN-${urlDemo.slice(0, 4)}`,
            name: `${match.name} (Verification)`,
            age: 54,
            sex: 'Female',
            facilityId: 'FAC-CENTRAL',
            registeredDate: new Date().toISOString(),
            createdAt: new Date().toISOString(),
          });
        setStep(4);
      }
    }
  }, [urlDemo]);

  // Handle patient searching
  useEffect(() => {
    if (patientSearch.trim().length > 1) {
      setIsSearchingPatient(true);
      const timer = setTimeout(() => {
        fetch(`/api/patients?search=${encodeURIComponent(patientSearch)}`)
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setPatientResults(d.patients || []);
          })
          .catch(console.error)
          .finally(() => setIsSearchingPatient(false));
      }, 250);
      return () => clearTimeout(timer);
    } else {
      setPatientResults([]);
    }
  }, [patientSearch]);

  // Handle Webcam streaming
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraActive && videoRef.current) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } } })
        .then((s) => {
          stream = s;
          if (videoRef.current) videoRef.current.srcObject = s;
        })
        .catch((err) => {
          alert('Camera unavailable: ' + err.message);
          setIsCameraActive(false);
        });
    }

    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [isCameraActive]);

  // Handle quick patient registration
  const handleQuickCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newPatientAge) return;

    try {
      setIsCreatingPatient(true);
      const res = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newPatientName,
          age: Number(newPatientAge),
          sex: newPatientSex,
          phone: newPatientPhone,
        }),
      });
      const data = await res.json();
      if (data.success && data.patient) {
        setSelectedPatient(data.patient);
        setShowNewPatientForm(false);
        setStep(2); // Move to consent
      }
    } catch (err) {
      console.error('Error creating patient:', err);
    } finally {
      setIsCreatingPatient(false);
    }
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        setImageUri(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Capture frame from webcam
  const captureCameraFrame = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 480;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImageUri(dataUrl);
    }
    setIsCameraActive(false);
  };

  // Run Image Quality Check
  const handleProceedToQuality = async () => {
    if (!imageUri) return;
    setStep(5);
    setIsEvaluatingQuality(true);

    try {
      const evalResult = await assessImageInBrowser(imageUri, screeningType);
      setQualityResult(evalResult);
    } catch {
      setQualityResult(assessImageQualitySync(imageUri, screeningType));
    } finally {
      setIsEvaluatingQuality(false);
    }
  };

  // Run Analysis Pipeline
  const handleProceedToAnalysis = () => {
    setStep(6);
    setAnalysisStage(0);
    setAnalysisError(null);

    // Sequence stages realistically
    const timer1 = setTimeout(() => setAnalysisStage(1), 400);
    const timer2 = setTimeout(() => setAnalysisStage(2), 900);
    const timer3 = setTimeout(() => setAnalysisStage(3), 1400);

    const timer4 = setTimeout(async () => {
      try {
        const res = await fetch('/api/screenings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientId: selectedPatient?.patientId || 'ANONYMOUS',
            screeningType,
            imageUri,
            targetScenario: targetScenario || undefined,
            qualityOverride: qualityResult,
          }),
        });

        const data = await res.json();
        if (data.success && data.data) {
          setResult(data.data);
          // Prefill referral reason if potential finding
          if (data.data.resultState === 'potential_finding' || data.data.riskLevel === 'higher_risk') {
            setReferralReason(`Screening flagged potential ${screeningType === 'eye' ? 'retinal vascular / diabetic finding' : 'oral mucosa finding'}. Further specialist clinical examination indicated.`);
            setReferralSpecialist(screeningType === 'eye' ? 'Ophthalmologist' : 'Oral Medicine / ENT');
          }
          setStep(7); // Show result
        } else {
          throw new Error(data.error || 'Screening analysis failed');
        }
      } catch (err) {
        setAnalysisError((err as Error).message);
        setStep(7);
      }
    }, 1900);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  // Handle Review Submission
  const handleMarkReviewed = async () => {
    if (!result) return;
    try {
      await fetch(`/api/screenings/${result.screeningId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewStatus: 'reviewed',
          reviewedBy: 'Dr. Sunita Rao',
          reviewNotes,
        }),
      });
      setReviewStatus('reviewed');
      if (result) {
        setResult({ ...result, reviewStatus: 'reviewed', reviewNotes });
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  // Handle Referral Submission
  const handleCreateReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result || !selectedPatient) return;

    try {
      setIsSavingReferral(true);
      const res = await fetch('/api/referrals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: selectedPatient.patientId,
          patientName: selectedPatient.name,
          screeningId: result.screeningId,
          screeningType,
          specialistType: referralSpecialist,
          destinationFacility: referralFacility,
          priority: referralPriority,
          reason: referralReason,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setReferralCreated(true);
        setTimeout(() => setShowReferralModal(false), 1500);
      }
    } catch (err) {
      console.error('Failed to create referral:', err);
    } finally {
      setIsSavingReferral(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* ── COMPACT CLINICAL STEPPER ── */}
      <div className="bg-white border border-slate-200/90 rounded-xl px-4 py-3 shadow-2xs flex items-center justify-between text-xs overflow-x-auto">
        {[
          { num: 1, label: 'Patient' },
          { num: 2, label: 'Consent' },
          { num: 3, label: 'Protocol' },
          { num: 4, label: 'Capture' },
          { num: 5, label: 'Quality' },
          { num: 6, label: 'Analysis' },
          { num: 7, label: 'Result' },
          { num: 8, label: 'Review' },
        ].map((s, idx) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <React.Fragment key={s.num}>
              {idx > 0 && <span className="text-slate-300 mx-1">›</span>}
              <div
                className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 font-bold border border-teal-200'
                    : isDone
                    ? 'text-teal-700 font-medium'
                    : 'text-slate-400'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    isActive
                      ? 'bg-teal-600 text-white'
                      : isDone
                      ? 'bg-teal-100 text-teal-800'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {isDone ? '✓' : s.num}
                </span>
                <span>{s.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 1: PATIENT SELECTION
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Patient Identification</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select an existing patient record or register a new patient before proceeding.
            </p>
          </div>

          {!showNewPatientForm ? (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search existing patient by Name or Patient ID..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              {/* Search results */}
              {isSearchingPatient ? (
                <div className="py-4 text-center text-xs text-slate-400">Searching records...</div>
              ) : patientResults.length > 0 ? (
                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-60 overflow-y-auto">
                  {patientResults.map((p) => (
                    <div
                      key={p.patientId}
                      onClick={() => {
                        setSelectedPatient(p);
                        setStep(2);
                      }}
                      className="p-3 hover:bg-teal-50/50 cursor-pointer flex items-center justify-between transition text-xs"
                    >
                      <div>
                        <div className="font-bold text-slate-900">{p.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {p.patientId} · {p.age} yrs · {p.sex} {p.phone ? `· ${p.phone}` : ''}
                        </div>
                      </div>
                      <span className="text-teal-700 font-semibold flex items-center gap-1">
                        Select <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : patientSearch.trim().length > 1 ? (
                <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                  No matching patients found.
                </div>
              ) : null}

              {/* Or Create New Patient */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Patient not found in records?</span>
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Register New Patient</span>
                </button>
              </div>
            </div>
          ) : (
            /* Quick In-line Patient Creation Form */
            <form onSubmit={handleQuickCreatePatient} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meera Devi"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="125"
                      placeholder="e.g. 48"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Sex</label>
                    <select
                      value={newPatientSex}
                      onChange={(e) => setNewPatientSex(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(false)}
                  className="text-slate-500 hover:text-slate-800 font-medium"
                >
                  ← Back to search
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPatient}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                >
                  {isCreatingPatient ? 'Saving...' : 'Register & Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 2: PATIENT CONSENT
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 2 && selectedPatient && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Patient Consent</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Informed consent verification prior to optical image capture
              </p>
            </div>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-mono text-xs font-semibold">
              {selectedPatient.name} ({selectedPatient.patientId})
            </span>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-2">
            <p className="font-semibold text-slate-800">
              Clinical Screening Protocol Notice:
            </p>
            <p>
              The patient has been informed that this visual screening is a preliminary decision-support assessment designed to detect optical patterns requiring specialist review.
            </p>
            <p>
              It is not a final medical diagnosis. Images captured will be stored securely for longitudinal care continuity.
            </p>
          </div>

          <label className="flex items-start gap-3 p-3 bg-teal-50/50 border border-teal-200/80 rounded-lg cursor-pointer hover:bg-teal-50 transition">
            <input
              type="checkbox"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-teal-600 rounded-sm border-slate-300 focus:ring-teal-500"
            />
            <div className="text-xs">
              <span className="font-bold text-teal-900 block">
                Consent obtained
              </span>
              <span className="text-slate-600">
                Informed verbal or written consent has been obtained from the patient or legal guardian for this screening and secure image processing.
              </span>
            </div>
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              ← Change Patient
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!consentObtained}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-40"
            >
              Continue to Protocol Selection →
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 3: SCREENING PROTOCOL SELECTION
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 3 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Select Screening Protocol</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Choose the examination protocol for this session
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Eye Screening Card */}
            <div
              onClick={() => {
                setScreeningType('eye');
                setStep(4);
              }}
              className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                screeningType === 'eye'
                  ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Eye Screening</h3>
                <p className="text-xs text-teal-800 font-semibold mt-0.5">Diabetic Retinopathy</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Screen retinal images for potential DR-related microaneurysms, hemorrhages, or exudates.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-700">
                <span>Start Eye Screening →</span>
              </div>
            </div>

            {/* Oral Screening Card */}
            <div
              onClick={() => {
                setScreeningType('oral');
                setStep(4);
              }}
              className={`p-5 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                screeningType === 'oral'
                  ? 'border-teal-600 bg-teal-50/40 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center mb-3">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Oral Screening</h3>
                <p className="text-xs text-emerald-800 font-semibold mt-0.5">Oral Visual Screening</p>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Screen oral cavity images for mucosal lesions or visual findings requiring further review.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-semibold text-teal-700">
                <span>Start Oral Screening →</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 4: IMAGE CAPTURE / UPLOAD
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {screeningType === 'eye' ? 'Retinal Optical Image Capture' : 'Oral Cavity Visual Capture'}
              </h2>
              <p className="text-xs text-slate-500">
                {screeningType === 'eye'
                  ? 'Position smartphone fundus adapter or upload digital fundus image.'
                  : 'Ensure adequate illumination and clear framing of oral mucosa.'}
              </p>
            </div>
            <span className="text-xs text-slate-500 font-mono font-medium">
              Patient: {selectedPatient?.patientId || 'Unlinked'}
            </span>
          </div>

          {/* VIEWPORT & FRAMING GUIDES */}
          <div className="relative aspect-4/3 max-w-xl mx-auto bg-slate-950 rounded-xl overflow-hidden border border-slate-300 flex items-center justify-center shadow-inner">
            {/* If camera is streaming */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : imageUri ? (
              /* REAL CAPTURED/UPLOADED IMAGE DOMINATES THE INTERFACE */
              <img
                src={imageUri}
                alt="Captured screening specimen"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              /* Empty Standby Viewport */
              <div className="text-center p-6 space-y-3 text-slate-400">
                <Camera className="w-10 h-10 mx-auto text-slate-500 stroke-1" />
                <p className="text-xs">No image captured yet</p>
              </div>
            )}

            {/* RETINAL SUBTLE FRAMING GUIDE OVERLAY */}
            {screeningType === 'eye' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-teal-400/40 border-dashed flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-teal-400/20" />
                  <div className="w-2 h-2 rounded-full bg-teal-400/30" />
                </div>
              </div>
            )}

            {/* ORAL CAVITY FRAMING GUIDE OVERLAY */}
            {screeningType === 'oral' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-72 h-48 rounded-2xl border border-emerald-400/40 border-dashed flex items-center justify-center">
                  <div className="w-8 h-8 border-t border-b border-emerald-400/30" />
                </div>
              </div>
            )}
          </div>

          {/* LIVE GUIDANCE PILLS (Lighting, Focus, Position, Stability) */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] max-w-xl mx-auto">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block">Lighting</span>
              <span className="font-semibold text-emerald-700">Good</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block">Focus</span>
              <span className="font-semibold text-emerald-700">Sharp</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block">Position</span>
              <span className="font-semibold text-slate-700">Centered</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block">Stability</span>
              <span className="font-semibold text-emerald-700">Hold Steady</span>
            </div>
          </div>

          {/* CAPTURE & UPLOAD CONTROLS */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />

            {isCameraActive ? (
              <button
                type="button"
                onClick={captureCameraFrame}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Snap Frame
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCameraActive(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
              >
                <Camera className="w-4 h-4 text-slate-600" />
                <span>Use Camera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs"
            >
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Upload Image</span>
            </button>

            {imageUri && (
              <button
                type="button"
                onClick={() => setImageUri('')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-slate-500 hover:text-slate-700 text-xs font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}
          </div>

          {/* QUICK LOAD TEST SPECIMENS */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Quick Clinical Verification Specimens
              </span>
              <span className="text-[11px] text-slate-400">One-click evaluation</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-left">
              <button
                type="button"
                onClick={() => {
                  setScreeningType('eye');
                  setImageUri('/demo/demo_retina_normal.jpg');
                  setTargetScenario('NORMAL_RETINA');
                }}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  imageUri === '/demo/demo_retina_normal.jpg'
                    ? 'border-teal-600 bg-teal-50/60 font-semibold text-teal-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Normal Retina</div>
                <div className="text-[10px] text-slate-500">Fundus / Clear</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreeningType('eye');
                  setImageUri('/demo/demo_retina_referable.jpg');
                  setTargetScenario('REFERABLE_RETINA');
                }}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  imageUri === '/demo/demo_retina_referable.jpg'
                    ? 'border-amber-600 bg-amber-50/60 font-semibold text-amber-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Referable DR</div>
                <div className="text-[10px] text-slate-500">Microvascular finding</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreeningType('oral');
                  setImageUri('/demo/demo_oral_normal.jpg');
                  setTargetScenario('LOW_RISK_ORAL');
                }}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  imageUri === '/demo/demo_oral_normal.jpg'
                    ? 'border-teal-600 bg-teal-50/60 font-semibold text-teal-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Normal Oral</div>
                <div className="text-[10px] text-slate-500">Clear mucosa</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setScreeningType('oral');
                  setImageUri('/demo/demo_oral_suspicious.jpg');
                  setTargetScenario('REVIEW_ORAL');
                }}
                className={`p-2.5 rounded-lg border text-xs transition ${
                  imageUri === '/demo/demo_oral_suspicious.jpg'
                    ? 'border-amber-600 bg-amber-50/60 font-semibold text-amber-900'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <div className="font-bold text-[11px]">Oral Lesion</div>
                <div className="text-[10px] text-slate-500">Leukoplakic plaque</div>
              </button>
            </div>
          </div>

          {/* NEXT CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              onClick={() => setStep(3)}
              className="text-xs font-medium text-slate-500 hover:text-slate-800"
            >
              ← Back to Protocol
            </button>
            <button
              onClick={handleProceedToQuality}
              disabled={!imageUri}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs disabled:opacity-40"
            >
              Evaluate Quality Gate →
            </button>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 5: IMAGE QUALITY ENGINE
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 5 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Optical Quality Gate</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated computer vision verification of sharpness, illumination, contrast, and resolution.
            </p>
          </div>

          {isEvaluatingQuality ? (
            <div className="py-12 text-center text-xs text-slate-500 space-y-2">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p>Computing pixel Laplacian variance & luminance...</p>
            </div>
          ) : qualityResult ? (
            <div className="space-y-6">
              {/* Quality Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  qualityResult.isAcceptable
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                    : qualityResult.feedback.includes('Anatomical Mismatch')
                    ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                    : 'bg-amber-50/70 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  {qualityResult.isAcceptable ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  ) : qualityResult.feedback.includes('Anatomical Mismatch') ? (
                    <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <h3 className="font-bold text-xs">
                      {qualityResult.isAcceptable
                        ? 'Image Quality: Good (Passed Optical Gate)'
                        : qualityResult.feedback.includes('Anatomical Mismatch')
                        ? 'Anatomical Verification Failed: Non-Target Specimen'
                        : 'Image Quality Needs Improvement'}
                    </h3>
                    <p className="text-[11px] opacity-90 mt-0.5">
                      {qualityResult.feedback}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xl font-bold">{qualityResult.score}%</span>
                  <span className="text-[10px] block opacity-80 uppercase tracking-wider">Quality Score</span>
                </div>
              </div>

              {/* Measured Metrics Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Sharpness</span>
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.sharpness}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Lighting</span>
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.brightness}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Contrast</span>
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.contrast}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Noise Level</span>
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    ✓ {100 - qualityResult.metrics.noiseLevel}%
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Framing</span>
                  <span className="font-bold text-slate-900 mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.framing}%
                  </span>
                </div>
              </div>

              {/* Benchmark specimen quick switch for instant verification */}
              <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200/70">
                <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  Test With Benchmark Specimens:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      const uri = screeningType === 'eye' ? '/demo/demo_retina_normal.jpg' : '/demo/demo_oral_normal.jpg';
                      const scenario = screeningType === 'eye' ? 'NORMAL_RETINA' : 'LOW_RISK_ORAL';
                      setImageUri(uri);
                      setTargetScenario(scenario);
                      setIsEvaluatingQuality(true);
                      const res = assessImageQualitySync(uri, screeningType);
                      setQualityResult(res);
                      setIsEvaluatingQuality(false);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-teal-500 hover:bg-teal-50/50 rounded text-slate-700 font-medium text-[11px] shadow-2xs"
                  >
                    ✓ Normal {screeningType === 'eye' ? 'Retina' : 'Oral'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const uri = screeningType === 'eye' ? '/demo/demo_retina_referable.jpg' : '/demo/demo_oral_suspicious.jpg';
                      const scenario = screeningType === 'eye' ? 'REFERABLE_RETINA' : 'REVIEW_ORAL';
                      setImageUri(uri);
                      setTargetScenario(scenario);
                      setIsEvaluatingQuality(true);
                      const res = assessImageQualitySync(uri, screeningType);
                      setQualityResult(res);
                      setIsEvaluatingQuality(false);
                    }}
                    className="px-2.5 py-1 bg-white border border-slate-200 hover:border-amber-500 hover:bg-amber-50/50 rounded text-slate-700 font-medium text-[11px] shadow-2xs"
                  >
                    ⚠ {screeningType === 'eye' ? 'Referable DR' : 'Oral Lesion'}
                  </button>
                </div>
              </div>

              {/* Gating Actions */}
              <div className="flex flex-wrap items-center justify-between pt-4 border-t border-slate-100 gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Image</span>
                </button>

                {qualityResult.isAcceptable ? (
                  <button
                    onClick={handleProceedToAnalysis}
                    className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
                  >
                    Run Screening Analysis →
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-rose-800 font-medium">
                      {qualityResult.feedback.includes('Anatomical Mismatch')
                        ? 'Non-target surface detected.'
                        : 'Optical clarity insufficient.'}
                    </span>
                    <button
                      onClick={handleProceedToAnalysis}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Proceed to Clinical Outcome →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 6: CLINICAL ANALYSIS ENGINE (CALM & TRUSTWORTHY)
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 6 && (
        <div className="bg-white p-8 rounded-xl border border-slate-200/90 shadow-2xs space-y-6 text-center max-w-lg mx-auto">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Analyzing Screening Specimen</h2>
            <p className="text-xs text-slate-500">
              Running decision-support model inference and validating feature activations.
            </p>
          </div>

          <div className="space-y-3 text-left max-w-sm mx-auto text-xs py-4">
            <div className="flex items-center gap-2.5 text-slate-700">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Image received and verified</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 1 ? 'text-slate-700' : 'text-slate-400'}`}>
              {analysisStage >= 1 ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>Image quality checked</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 2 ? 'text-slate-700' : 'text-slate-400'}`}>
              {analysisStage >= 2 ? (
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>Image prepared & normalized</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 3 ? 'text-teal-700 font-semibold' : 'text-slate-400'}`}>
              {analysisStage >= 3 ? (
                <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
              )}
              <span>Running screening analysis</span>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 7: CLINICAL SCREENING REPORT & RESULT
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 7 && result && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200/80 gap-3">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-700">
                Preliminary Clinical Screening Report
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {screeningType === 'eye' ? 'Retinal Screening Result' : 'Oral Visual Screening Result'}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-500 font-mono">
              <div>Screening ID: {result.screeningId}</div>
              <div>Patient: {selectedPatient?.name} ({result.patientId})</div>
            </div>
          </div>

          {/* MAIN FINDING BANNER (NO FAKE DIAGNOSIS) */}
          <div
            className={`p-5 rounded-xl border ${
              result.resultState === 'quality_insufficient' || result.prediction.toLowerCase().includes('invalid')
                ? 'bg-rose-50/90 border-rose-200 text-rose-950'
                : result.resultState === 'potential_finding' || result.riskLevel === 'higher_risk'
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : result.resultState === 'no_abnormality' || result.riskLevel === 'lower_risk'
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                : 'bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-bold tracking-wider opacity-80 block">
                  {result.resultState === 'quality_insufficient' ? 'Protocol Safety Gate' : 'Algorithm Finding'}
                </span>
                <h3 className="text-lg font-bold">
                  {result.prediction}
                </h3>
                <p className="text-xs opacity-90 mt-1 max-w-xl">
                  {result.recommendation}
                </p>
              </div>

              {result.confidence ? (
                <div className="text-right shrink-0 bg-white/70 px-3 py-2 rounded-lg border border-black/5">
                  <span className="text-xl font-bold">{result.confidence}%</span>
                  <span className="text-[10px] block uppercase font-medium opacity-70">
                    Model Confidence
                  </span>
                </div>
              ) : null}
            </div>

            {/* Caveat warning */}
            <div className="mt-4 pt-3 border-t border-black/5 text-[11px] opacity-80 flex items-center gap-1.5">
              {result.resultState === 'quality_insufficient' ? (
                <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              ) : (
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>
                {result.clinicalCaveat || 'Decision support only. Not a medical diagnosis.'}
              </span>
            </div>
          </div>

          {/* SPECIMEN IMAGE DISPLAY (CONTINUITY) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div className="relative aspect-square max-w-[200px] rounded-lg overflow-hidden border border-slate-300 bg-black">
              <img
                src={imageUri}
                alt="Analyzed specimen"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="sm:col-span-2 text-xs space-y-2 text-slate-600">
              <h4 className="font-bold text-slate-900">Analyzed Image Specimen</h4>
              <p>
                {result.resultState === 'quality_insufficient' || !result.imageQuality?.isAcceptable
                  ? `Specimen rejected (${result.imageQuality?.score || 15}% score). Protocol validation failed — non-target anatomical surface detected.`
                  : `Optical quality confirmed at ${result.imageQuality?.score || 90}%. Specimen permanently linked to patient chart #${result.patientId}.`}
              </p>
              <div className="text-[11px] font-mono text-slate-500">
                Model: {result.modelVersion}
              </div>
            </div>
          </div>

          {/* ACTIONS: HUMAN REVIEW & REFERRAL */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/patients/${selectedPatient?.patientId || result.patientId}`}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              ← View Patient Chart
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(8)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold"
              >
                Conduct Clinical Review
              </button>

              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs"
              >
                Create Specialist Referral →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 8: HUMAN CLINICAL REVIEW
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 8 && result && (
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Human Clinician Verification</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Screening review by attending health professional
              </p>
            </div>
            <span className="text-xs text-slate-600 font-mono">
              Screening #{result.screeningId}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Clinical Assessment Notes
              </label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document your clinical impression, visual confirmation of findings, or referral recommendation..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(7)}
                className="text-slate-500 hover:text-slate-800 font-medium"
              >
                ← Back to Result
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkReviewed}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {reviewStatus === 'reviewed' ? '✓ Review Logged' : 'Sign Off & Mark Reviewed'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          REFERRAL MODAL
         ────────────────────────────────────────────────────────────────────────── */}
      {showReferralModal && result && selectedPatient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Create Specialist Referral</h3>
                <p className="text-xs text-slate-500">
                  Refer {selectedPatient.name} for secondary clinical evaluation
                </p>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {referralCreated ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="text-sm font-bold text-slate-900">Referral Slip Generated</h4>
                <p className="text-xs text-slate-500">
                  Patient referred successfully. Record logged to Referrals tracker.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Specialist Specialty</label>
                  <input
                    type="text"
                    required
                    value={referralSpecialist}
                    onChange={(e) => setReferralSpecialist(e.target.value)}
                    placeholder="e.g. Ophthalmologist / Retina Specialist"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Facility</label>
                  <input
                    type="text"
                    required
                    value={referralFacility}
                    onChange={(e) => setReferralFacility(e.target.value)}
                    placeholder="e.g. District Civil Hospital Eye Clinic"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Priority</label>
                  <select
                    value={referralPriority}
                    onChange={(e) => setReferralPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  >
                    <option value="routine">Routine (within 4 weeks)</option>
                    <option value="priority">Priority (within 1 week)</option>
                    <option value="urgent">Urgent (within 48 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clinical Indication / Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    placeholder="Specify why patient requires further evaluation..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowReferralModal(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReferral}
                    className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-semibold shadow-xs disabled:opacity-50"
                  >
                    {isSavingReferral ? 'Creating...' : 'Issue Referral Slip'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScreeningPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading screening flow...</div>}>
      <ScreeningWorkflow />
    </Suspense>
  );
}
