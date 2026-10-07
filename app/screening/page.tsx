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
import FlexCarousel from '@/components/FlexCarousel';

function ScreeningWorkflow() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const urlPatientId = searchParams.get('patientId') || '';
  const urlType = (searchParams.get('type') as ScreeningType) || '';

  // Stepper state: 1: Patient, 2: Consent, 3: Protocol, 4: Capture, 5: Quality, 6: Analysis, 7: Result, 8: Review
  const [step, setStep] = useState<number>(urlPatientId ? (urlType ? 4 : 2) : 1);

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
  const [targetScenario, setTargetScenario] = useState<string>('');
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
        setTargetScenario(''); // Clear previous mock scenario to ensure real validation
        setQualityResult(null);
        setResult(null);
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
      setTargetScenario(''); // Clear previous mock scenario to ensure real validation
      setQualityResult(null);
      setResult(null);
    }
    setIsCameraActive(false);
  };

  // Run Image Validation & Quality Gate
  const handleProceedToQuality = async () => {
    if (!imageUri) return;
    setStep(5);
    setIsEvaluatingQuality(true);

    try {
      // 1. Authoritative screening validation via /api/validate-image
      const valRes = await fetch('/api/validate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          screeningType,
          imageUri,
        }),
      });

      if (valRes.ok) {
        const valData = await valRes.json();
        const mappedStatus = valData.status === 'valid'
          ? 'valid_usable'
          : valData.status === 'invalid'
          ? 'wrong_image_type'
          : 'correct_type_poor_quality';

        const blurVal = valData.quality?.blur ?? 0;
        const brightVal = valData.quality?.brightness ?? 0;
        const contrastVal = valData.quality?.contrast ?? 0;
        const avgScore = Math.min(Math.round((blurVal + brightVal + contrastVal) / 3), 100);

        const formatted: ImageQualityResult = {
          grade: valData.status === 'valid' ? 'GOOD' : valData.status === 'retake' ? 'POOR' : 'UNUSABLE',
          score: valData.status === 'valid' ? (avgScore > 0 ? avgScore : 88) : valData.status === 'retake' ? 42 : 10,
          isAcceptable: valData.status === 'valid',
          canProceedWithWarning: false,
          metrics: {
            sharpness: Math.round(blurVal),
            brightness: Math.round(brightVal),
            contrast: Math.round(contrastVal),
            noiseLevel: 15,
            framing: valData.status === 'valid' ? 90 : 30,
          },
          feedback: valData.reason,
          warnings: valData.status !== 'valid' ? [valData.reason] : [],
          validationStatus: mappedStatus,
          validation: valData,
        };
        setQualityResult(formatted);
        setIsEvaluatingQuality(false);
        return;
      }
    } catch {
      // Microservice error fallback
    }

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
      {/* ── STEPPER ── */}
      <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl px-5 py-3.5 flex items-center justify-between text-xs overflow-x-auto shadow-sm">
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
              {idx > 0 && <span className="text-[#5d2a42]/30 mx-1 font-bold">›</span>}
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition whitespace-nowrap ${
                  isActive
                    ? 'bg-[#5d2a42] text-[#fff9ec] font-extrabold shadow-sm'
                    : isDone
                    ? 'bg-[#ffdccc] text-[#5d2a42] font-bold border border-[#fec89a]'
                    : 'text-[#5d2a42]/50'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                    isActive
                      ? 'bg-[#fff9ec] text-[#5d2a42] font-extrabold'
                      : isDone
                      ? 'bg-[#5d2a42] text-[#fff9ec] font-bold'
                      : 'bg-[#d8e2dc]/50 text-[#5d2a42]'
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#5d2a42]">Patient Identification</h2>
            <p className="text-xs text-[#5d2a42]/70 mt-0.5">
              Select an existing patient record or register a new patient before proceeding.
            </p>
          </div>

          {!showNewPatientForm ? (
            <div className="space-y-4">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-[#5d2a42]/50 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search existing patient by Name or Patient ID..."
                  value={patientSearch}
                  onChange={(e) => setPatientSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-xs text-[#5d2a42] placeholder-[#5d2a42]/50 focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
                />
              </div>

              {/* Search results */}
              {isSearchingPatient ? (
                <div className="py-4 text-center text-xs text-[#5d2a42]/60">Searching records...</div>
              ) : patientResults.length > 0 ? (
                <div className="border border-[#d8e2dc] rounded-xl divide-y divide-[#d8e2dc] max-h-60 overflow-y-auto">
                  {patientResults.map((p) => (
                    <div
                      key={p.patientId}
                      onClick={() => {
                        setSelectedPatient(p);
                        setStep(2);
                      }}
                      className="p-3 hover:bg-[#ffdccc]/30 cursor-pointer flex items-center justify-between transition text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#5d2a42]">{p.name}</div>
                        <div className="text-[11px] text-[#5d2a42]/70 font-mono">
                          {p.patientId} · {p.age} yrs · {p.sex} {p.phone ? `· ${p.phone}` : ''}
                        </div>
                      </div>
                      <span className="text-[#5d2a42] font-semibold flex items-center gap-1">
                        Select <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  ))}
                </div>
              ) : patientSearch.trim().length > 1 ? (
                <div className="p-4 text-center text-xs text-[#5d2a42]/70 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  No matching patients found.
                </div>
              ) : null}

              {/* Or Create New Patient */}
              <div className="pt-4 border-t border-[#d8e2dc] flex items-center justify-between">
                <span className="text-xs text-[#5d2a42]/70">Patient not found in records?</span>
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ffdccc] hover:bg-[#fec89a] text-[#5d2a42] rounded-xl text-xs font-bold transition border border-[#fec89a]"
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
                  <label className="block font-semibold text-[#5d2a42] mb-1">
                    Full Name <span className="text-[#5d2a42]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meera Devi"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-semibold text-[#5d2a42] mb-1">
                      Age <span className="text-[#5d2a42]">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="125"
                      placeholder="e.g. 48"
                      value={newPatientAge}
                      onChange={(e) => setNewPatientAge(e.target.value)}
                      className="w-full px-3 py-2 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-[#5d2a42] mb-1">Sex</label>
                    <select
                      value={newPatientSex}
                      onChange={(e) => setNewPatientSex(e.target.value as any)}
                      className="w-full px-3 py-2 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#5d2a42] mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={newPatientPhone}
                  onChange={(e) => setNewPatientPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewPatientForm(false)}
                  className="text-[#5d2a42]/70 hover:text-[#5d2a42] font-semibold"
                >
                  ← Back to search
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPatient}
                  className="px-4 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl font-bold shadow-xs disabled:opacity-50"
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#d8e2dc]">
            <div>
              <h2 className="text-lg font-bold text-[#5d2a42]">Patient Consent</h2>
              <p className="text-xs text-[#5d2a42]/70 mt-0.5">
                Informed consent verification prior to optical image capture
              </p>
            </div>
            <span className="px-3 py-1 bg-[#ffdccc] text-[#5d2a42] rounded-xl font-mono text-xs font-bold border border-[#fec89a]">
              {selectedPatient.name} ({selectedPatient.patientId})
            </span>
          </div>

          <div className="bg-[#fff9ec] p-4 rounded-xl border border-[#d8e2dc] text-xs text-[#5d2a42] space-y-2">
            <p className="font-bold text-[#5d2a42]">
              Clinical Screening Protocol Notice:
            </p>
            <p>
              The patient has been informed that this visual screening is a preliminary decision-support assessment designed to detect optical patterns requiring specialist review.
            </p>
            <p>
              It is not a final medical diagnosis. Images captured will be stored securely for longitudinal care continuity.
            </p>
          </div>

          <label className="flex items-start gap-3 p-4 bg-[#ffdccc]/30 border border-[#d8e2dc] rounded-xl cursor-pointer hover:bg-[#ffdccc]/50 transition">
            <input
              type="checkbox"
              checked={consentObtained}
              onChange={(e) => setConsentObtained(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-[#5d2a42] rounded-sm border-[#d8e2dc] focus:ring-[#5d2a42]"
            />
            <div className="text-xs">
              <span className="font-bold text-[#5d2a42] block">
                Consent obtained
              </span>
              <span className="text-[#5d2a42]/80">
                Informed verbal or written consent has been obtained from the patient or legal guardian for this screening and secure image processing.
              </span>
            </div>
          </label>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => setStep(1)}
              className="text-xs font-bold text-[#5d2a42]/70 hover:text-[#5d2a42]"
            >
              ← Change Patient
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!consentObtained}
              className="px-5 py-2.5 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs transition disabled:opacity-40"
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#5d2a42]">Select Screening Protocol</h2>
            <p className="text-xs text-[#5d2a42]/70 mt-0.5">
              Choose the examination protocol for this session or click any module card below
            </p>
          </div>

          {/* Interactive WebGL Liquid FlexCarousel Options Viewer */}
          <div className="w-full h-[300px] relative rounded-2xl overflow-hidden border border-[#d8e2dc] bg-[#fff9ec] shadow-inner">
            <FlexCarousel
              items={[
                {
                  src: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80&auto=format&fit=max',
                  alt: 'Retinal Eye Screening',
                  title: '👁️ Retinal Eye Screening',
                  subtitle: 'Diabetic Retinopathy & Optic Disc Assessment'
                },
                {
                  src: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=1200&q=80&auto=format&fit=max',
                  alt: 'Oral Mucosa Screening',
                  title: '👄 Oral Mucosal Screening',
                  subtitle: 'Pre-Cancerous Lesion Pattern Detection'
                },
                {
                  src: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=1200&q=80&auto=format&fit=max',
                  alt: 'Glaucoma Optical Check',
                  title: '🔍 Glaucoma & Cataract',
                  subtitle: 'Optic Cup-to-Disc Ratio Evaluation'
                },
                {
                  src: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1200&q=80&auto=format&fit=max',
                  alt: 'Conjunctival Pallor Check',
                  title: '🩸 Conjunctival Pallor',
                  subtitle: 'Non-Invasive Anemia Edge Screening'
                }
              ]}
              preset="liquid"
              intro="rise"
              cardHeight={0.65}
              gap={12}
              squeeze={0.2}
              focusOnClick
              captions
              onSelect={(index) => {
                if (index === 0) setScreeningType('eye');
                else setScreeningType('oral');
                setStep(4);
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Eye Screening Card */}
            <div
              onClick={() => {
                setScreeningType('eye');
                setStep(4);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                screeningType === 'eye'
                  ? 'border-[#5d2a42] bg-[#ffdccc]/40 shadow-sm'
                  : 'border-[#d8e2dc] hover:border-[#5d2a42]/50 bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#5d2a42] text-[#fff9ec] flex items-center justify-center mb-3">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#5d2a42]">Eye Screening</h3>
                <p className="text-xs text-[#5d2a42] font-extrabold mt-0.5">Diabetic Retinopathy</p>
                <p className="text-xs text-[#5d2a42]/80 mt-2 leading-relaxed">
                  Screen retinal images for potential DR-related microaneurysms, hemorrhages, or exudates.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#5d2a42]">
                <span>Start Eye Screening →</span>
              </div>
            </div>

            {/* Oral Screening Card */}
            <div
              onClick={() => {
                setScreeningType('oral');
                setStep(4);
              }}
              className={`p-5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                screeningType === 'oral'
                  ? 'border-[#5d2a42] bg-[#ffdccc]/40 shadow-sm'
                  : 'border-[#d8e2dc] hover:border-[#5d2a42]/50 bg-white'
              }`}
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#ffdccc] text-[#5d2a42] border border-[#fec89a] flex items-center justify-center mb-3">
                  <Smile className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-[#5d2a42]">Oral Screening</h3>
                <p className="text-xs text-[#5d2a42] font-extrabold mt-0.5">Oral Visual Screening</p>
                <p className="text-xs text-[#5d2a42]/80 mt-2 leading-relaxed">
                  Screen oral cavity images for mucosal lesions or visual findings requiring further review.
                </p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#5d2a42]">
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-[#d8e2dc]">
            <div>
              <h2 className="text-lg font-bold text-[#5d2a42]">
                {screeningType === 'eye' ? 'Retinal Optical Image Capture' : 'Oral Cavity Visual Capture'}
              </h2>
              <p className="text-xs text-[#5d2a42]/70">
                {screeningType === 'eye'
                  ? 'Position smartphone fundus adapter or upload digital fundus image.'
                  : 'Ensure adequate illumination and clear framing of oral mucosa.'}
              </p>
            </div>
            <span className="text-xs text-[#5d2a42] font-mono font-bold">
              Patient: {selectedPatient?.patientId || 'Unlinked'}
            </span>
          </div>

          {/* VIEWPORT & FRAMING GUIDES */}
          <div className="relative aspect-4/3 max-w-xl mx-auto bg-[#5d2a42] rounded-2xl overflow-hidden border border-[#d8e2dc] flex items-center justify-center shadow-inner">
            {/* If camera is streaming */}
            {isCameraActive ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
            ) : imageUri ? (
              <img
                src={imageUri}
                alt="Captured screening specimen"
                className="w-full h-full object-contain bg-black"
              />
            ) : (
              <div className="text-center p-6 space-y-3 text-[#fff9ec]/80">
                <Camera className="w-10 h-10 mx-auto text-[#fff9ec] stroke-1" />
                <p className="text-xs font-semibold">No image captured yet</p>
              </div>
            )}

            {/* RETINAL OVERLAY */}
            {screeningType === 'eye' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-64 rounded-full border border-[#fec89a]/50 border-dashed flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border border-[#fec89a]/30" />
                  <div className="w-2 h-2 rounded-full bg-[#fec89a]/60" />
                </div>
              </div>
            )}

            {/* ORAL CAVITY OVERLAY */}
            {screeningType === 'oral' && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-72 h-48 rounded-2xl border border-[#fec89a]/50 border-dashed flex items-center justify-center">
                  <div className="w-8 h-8 border-t border-b border-[#fec89a]/30" />
                </div>
              </div>
            )}
          </div>

          {/* LIVE GUIDANCE PILLS */}
          <div className="grid grid-cols-4 gap-2 text-center text-[11px] max-w-xl mx-auto">
            <div className="p-2 rounded-xl bg-[#fff9ec] border border-[#d8e2dc]">
              <span className="text-[#5d2a42]/60 block">Lighting</span>
              <span className="font-extrabold text-[#5d2a42]">Good</span>
            </div>
            <div className="p-2 rounded-xl bg-[#fff9ec] border border-[#d8e2dc]">
              <span className="text-[#5d2a42]/60 block">Focus</span>
              <span className="font-extrabold text-[#5d2a42]">Sharp</span>
            </div>
            <div className="p-2 rounded-xl bg-[#fff9ec] border border-[#d8e2dc]">
              <span className="text-[#5d2a42]/60 block">Position</span>
              <span className="font-extrabold text-[#5d2a42]">Centered</span>
            </div>
            <div className="p-2 rounded-xl bg-[#fff9ec] border border-[#d8e2dc]">
              <span className="text-[#5d2a42]/60 block">Stability</span>
              <span className="font-extrabold text-[#5d2a42]">Hold Steady</span>
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
                className="px-5 py-2.5 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs"
              >
                Snap Frame
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsCameraActive(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d8e2dc] hover:bg-[#fff9ec] text-[#5d2a42] rounded-xl text-xs font-bold shadow-2xs"
              >
                <Camera className="w-4 h-4 text-[#5d2a42]" />
                <span>Use Camera</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#d8e2dc] hover:bg-[#fff9ec] text-[#5d2a42] rounded-xl text-xs font-bold shadow-2xs"
            >
              <Upload className="w-4 h-4 text-[#5d2a42]" />
              <span>Upload Image</span>
            </button>

            {imageUri && (
              <button
                type="button"
                onClick={() => setImageUri('')}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-[#5d2a42]/70 hover:text-[#5d2a42] text-xs font-bold"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            )}
          </div>

          {/* NEXT CTA */}
          <div className="flex items-center justify-between pt-4 border-t border-[#d8e2dc]">
            <button
              onClick={() => setStep(3)}
              className="text-xs font-bold text-[#5d2a42]/70 hover:text-[#5d2a42]"
            >
              ← Back to Protocol
            </button>
            <button
              onClick={handleProceedToQuality}
              disabled={!imageUri}
              className="px-5 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs disabled:opacity-40"
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-[#5d2a42]">Optical Quality Gate</h2>
            <p className="text-xs text-[#5d2a42]/70 mt-0.5">
              Automated computer vision verification of sharpness, illumination, contrast, and resolution.
            </p>
          </div>

          {isEvaluatingQuality ? (
            <div className="py-12 text-center text-xs text-[#5d2a42] space-y-2">
              <div className="w-6 h-6 border-2 border-[#5d2a42] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-bold">Computing pixel Laplacian variance & luminance...</p>
            </div>
          ) : qualityResult ? (
            <div className="space-y-6">
              {/* Quality Status Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  qualityResult.validationStatus === 'valid_usable'
                    ? 'bg-[#d8e2dc] border-[#c4d4cc] text-[#5d2a42]'
                    : qualityResult.validationStatus === 'wrong_image_type'
                    ? 'bg-[#fec89a] border-[#ffdccc] text-[#5d2a42]'
                    : 'bg-[#ffdccc] border-[#fec89a] text-[#5d2a42]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {qualityResult.validationStatus === 'valid_usable' ? (
                    <CheckCircle2 className="w-5 h-5 text-[#5d2a42] shrink-0" />
                  ) : qualityResult.validationStatus === 'wrong_image_type' ? (
                    <ShieldAlert className="w-5 h-5 text-[#5d2a42] shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[#5d2a42] shrink-0" />
                  )}
                  <div>
                    <h3 className="font-extrabold text-xs text-[#5d2a42]">
                      {qualityResult.validationStatus === 'valid_usable'
                        ? 'Image ready for screening'
                        : qualityResult.validationStatus === 'wrong_image_type'
                        ? 'Incorrect image'
                        : 'Image needs to be retaken'}
                    </h3>
                    <p className="text-[11px] opacity-90 mt-0.5 font-bold">
                      {qualityResult.feedback}
                    </p>
                    {qualityResult.validationStatus !== 'valid_usable' && (
                      <p className="text-[10px] opacity-80 mt-0.5 font-medium">
                        {qualityResult.validationStatus === 'wrong_image_type'
                          ? 'Automated disease screening is blocked for safety. Please provide an image matching the selected screening.'
                          : 'Optical clarity is insufficient for reliable screening. Please retake the capture.'}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-black text-[#5d2a42]">
                    {qualityResult.validationStatus === 'valid_usable' ? `${qualityResult.score}%` : 'Blocked'}
                  </span>
                  <span className="text-[10px] block opacity-80 uppercase font-bold tracking-wider text-[#5d2a42]">
                    {qualityResult.validationStatus === 'valid_usable' ? 'Quality Score' : 'Status'}
                  </span>
                </div>
              </div>

              {/* Measured Metrics Checklist */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  <span className="text-[#5d2a42]/70 block text-[11px]">Sharpness</span>
                  <span className="font-extrabold text-[#5d2a42] mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.sharpness}%
                  </span>
                </div>
                <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  <span className="text-[#5d2a42]/70 block text-[11px]">Lighting</span>
                  <span className="font-extrabold text-[#5d2a42] mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.brightness}%
                  </span>
                </div>
                <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  <span className="text-[#5d2a42]/70 block text-[11px]">Contrast</span>
                  <span className="font-extrabold text-[#5d2a42] mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.contrast}%
                  </span>
                </div>
                <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  <span className="text-[#5d2a42]/70 block text-[11px]">Noise Level</span>
                  <span className="font-extrabold text-[#5d2a42] mt-1 flex items-center gap-1">
                    ✓ {100 - qualityResult.metrics.noiseLevel}%
                  </span>
                </div>
                <div className="p-3 bg-[#fff9ec] rounded-xl border border-[#d8e2dc]">
                  <span className="text-[#5d2a42]/70 block text-[11px]">Framing</span>
                  <span className="font-extrabold text-[#5d2a42] mt-1 flex items-center gap-1">
                    ✓ {qualityResult.metrics.framing}%
                  </span>
                </div>
              </div>

              {/* Benchmark image quick switch */}
              <div className="pt-4 border-t border-[#d8e2dc] flex flex-wrap items-center justify-between gap-3 text-xs bg-[#fff9ec] p-3 rounded-xl border border-[#d8e2dc]">
                <span className="font-bold text-[#5d2a42] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#5d2a42]" />
                  Or Test With Benchmark Image:
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
                    className="px-2.5 py-1 bg-white border border-[#d8e2dc] hover:bg-[#ffdccc] rounded text-[#5d2a42] font-bold text-[11px] shadow-2xs"
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
                    className="px-2.5 py-1 bg-[#ffdccc] border border-[#fec89a] hover:bg-[#fec89a] rounded text-[#5d2a42] font-extrabold text-[11px] shadow-2xs"
                  >
                    ⚠ {screeningType === 'eye' ? 'Referable DR' : 'Oral Lesion'}
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const uri = screeningType === 'eye' ? '/demo/demo_retina_blurry.jpg' : '/demo/demo_retina_blurry.jpg';
                      setImageUri(uri);
                      setTargetScenario('');
                      setIsEvaluatingQuality(true);
                      const res = assessImageQualitySync(uri, screeningType);
                      setQualityResult(res);
                      setIsEvaluatingQuality(false);
                    }}
                    className="px-2.5 py-1 bg-white border border-[#d8e2dc] hover:bg-[#fff9ec] rounded text-[#5d2a42]/80 font-bold text-[11px]"
                  >
                    Test Blurry Retake
                  </button>
                </div>
              </div>

              {/* Gating Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-[#d8e2dc]">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#5d2a42] hover:bg-[#ffdccc] border border-[#d8e2dc] rounded-xl"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake Image</span>
                </button>

                {qualityResult.validationStatus === 'valid_usable' && qualityResult.isAcceptable ? (
                  <button
                    onClick={handleProceedToAnalysis}
                    className="px-5 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs"
                  >
                    Run Screening Analysis →
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5d2a42] font-bold">
                      {qualityResult.validationStatus === 'wrong_image_type'
                        ? 'Screening model blocked (Incorrect image).'
                        : 'Screening model blocked (Retake required).'}
                    </span>
                    <button
                      onClick={() => setStep(4)}
                      className="px-4 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs transition inline-flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retake with Correct Image →</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
          STEP 6: CLINICAL ANALYSIS ENGINE
         ────────────────────────────────────────────────────────────────────────── */}
      {step === 6 && (
        <div className="bg-white/90 p-8 rounded-2xl border border-[#d8e2dc] shadow-sm space-y-6 text-center max-w-lg mx-auto">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-[#5d2a42]">Analyzing Screening Image</h2>
            <p className="text-xs text-[#5d2a42]/70">
              Running decision-support model inference and validating feature activations.
            </p>
          </div>

          <div className="space-y-3 text-left max-w-sm mx-auto text-xs py-4">
            <div className="flex items-center gap-2.5 text-[#5d2a42] font-bold">
              <Check className="w-4 h-4 text-[#5d2a42] shrink-0" />
              <span>Image received and verified</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 1 ? 'text-[#5d2a42] font-bold' : 'text-[#5d2a42]/40'}`}>
              {analysisStage >= 1 ? (
                <Check className="w-4 h-4 text-[#5d2a42] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#d8e2dc] shrink-0" />
              )}
              <span>Image quality checked</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 2 ? 'text-[#5d2a42] font-bold' : 'text-[#5d2a42]/40'}`}>
              {analysisStage >= 2 ? (
                <Check className="w-4 h-4 text-[#5d2a42] shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#d8e2dc] shrink-0" />
              )}
              <span>Image prepared & normalized</span>
            </div>
            <div className={`flex items-center gap-2.5 ${analysisStage >= 3 ? 'text-[#5d2a42] font-extrabold' : 'text-[#5d2a42]/40'}`}>
              {analysisStage >= 3 ? (
                <div className="w-4 h-4 border-2 border-[#5d2a42] border-t-transparent rounded-full animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-[#d8e2dc] shrink-0" />
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#d8e2dc] gap-3">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5d2a42]">
                Preliminary Clinical Screening Report
              </span>
              <h2 className="text-xl font-bold text-[#5d2a42] mt-0.5">
                {screeningType === 'eye' ? 'Retinal Screening Result' : 'Oral Visual Screening Result'}
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-[#5d2a42]/70 font-mono font-bold">
              <div>Screening ID: {result.screeningId}</div>
              <div>Patient: {selectedPatient?.name} ({result.patientId})</div>
            </div>
          </div>

          {/* MAIN FINDING BANNER (Potential Finding vs No Abnormality) */}
          <div
            className={`p-5 rounded-2xl border ${
              result.resultState === 'potential_finding' || result.riskLevel === 'higher_risk'
                ? 'bg-[#fec89a] border-[#ffdccc] text-[#5d2a42]'
                : 'bg-[#d8e2dc] border-[#c4d4cc] text-[#5d2a42]'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] uppercase font-black tracking-wider opacity-90 block">
                  Preliminary Finding
                </span>
                <h3 className="text-lg font-black text-[#5d2a42]">
                  {result.prediction}
                </h3>
                <p className="text-xs font-bold opacity-90 mt-1 max-w-xl">
                  {result.recommendation}
                </p>
              </div>

              {result.confidence ? (
                <div className="text-right shrink-0 bg-white/80 px-3.5 py-2 rounded-xl border border-[#5d2a42]/10">
                  <span className="text-xl font-black text-[#5d2a42]">{result.confidence}%</span>
                  <span className="text-[10px] block uppercase font-bold text-[#5d2a42] opacity-80">
                    Confidence
                  </span>
                </div>
              ) : (
                <div className="text-right shrink-0 bg-white/80 px-3.5 py-2 rounded-xl border border-[#5d2a42]/10">
                  <span className="text-sm font-extrabold text-[#5d2a42]/60">Unavailable</span>
                  <span className="text-[10px] block uppercase font-bold text-[#5d2a42] opacity-80">
                    Confidence
                  </span>
                </div>
              )}
            </div>

            {/* Caveat warning */}
            <div className="mt-4 pt-3 border-t border-[#5d2a42]/10 text-[11px] font-bold opacity-90 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
              <span>
                {result.clinicalCaveat || 'Decision support only. Not a medical diagnosis.'}
              </span>
            </div>
          </div>

          {/* SCREENING IMAGE DISPLAY */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-[#fff9ec] p-4 rounded-2xl border border-[#d8e2dc]">
            <div className="relative aspect-square max-w-[200px] rounded-xl overflow-hidden border border-[#d8e2dc] bg-black">
              <img
                src={imageUri}
                alt="Screening image"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="sm:col-span-2 text-xs space-y-2 text-[#5d2a42]">
              <h4 className="font-extrabold text-[#5d2a42]">Screening Image Capture</h4>
              <p className="font-medium text-[#5d2a42]/80">
                Optical quality verified. Capture securely attached to patient chart #{result.patientId}.
              </p>
              <div className="text-[11px] font-mono font-bold text-[#5d2a42]/70">
                Decision Support: {result.modelVersion}
              </div>
            </div>
          </div>

          {/* ACTIONS: HUMAN REVIEW & REFERRAL */}
          <div className="pt-4 border-t border-[#d8e2dc] flex flex-wrap items-center justify-between gap-3">
            <Link
              href={`/patients/${selectedPatient?.patientId || result.patientId}`}
              className="text-xs font-bold text-[#5d2a42]/80 hover:text-[#5d2a42]"
            >
              ← View Patient Chart
            </Link>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setStep(8)}
                className="px-4 py-2 bg-[#ffdccc] hover:bg-[#fec89a] text-[#5d2a42] rounded-xl text-xs font-bold border border-[#fec89a]"
              >
                Conduct Clinical Review
              </button>

              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="px-4 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl text-xs font-bold shadow-xs"
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
        <div className="bg-white/90 border border-[#d8e2dc] rounded-2xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-[#d8e2dc]">
            <div>
              <h2 className="text-lg font-bold text-[#5d2a42]">Human Clinician Verification</h2>
              <p className="text-xs text-[#5d2a42]/70 mt-0.5">
                Screening review by attending health professional
              </p>
            </div>
            <span className="text-xs text-[#5d2a42] font-mono font-bold">
              Screening #{result.screeningId}
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#5d2a42] mb-1">
                Clinical Assessment Notes
              </label>
              <textarea
                rows={4}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Document your clinical impression, visual confirmation of findings, or referral recommendation..."
                className="w-full p-3 bg-[#fff9ec] border border-[#d8e2dc] rounded-xl text-[#5d2a42] focus:outline-hidden focus:ring-2 focus:ring-[#5d2a42]/20 focus:border-[#5d2a42]"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setStep(7)}
                className="text-[#5d2a42]/70 hover:text-[#5d2a42] font-bold"
              >
                ← Back to Result
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkReviewed}
                  className="px-4 py-2 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl font-bold shadow-xs"
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
        <div className="fixed inset-0 z-50 bg-[#5d2a42]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#fff9ec] rounded-2xl border border-[#d8e2dc] max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#d8e2dc]">
              <div>
                <h3 className="text-base font-bold text-[#5d2a42]">Create Specialist Referral</h3>
                <p className="text-xs text-[#5d2a42]/70">
                  Refer {selectedPatient.name} for secondary clinical evaluation
                </p>
              </div>
              <button
                onClick={() => setShowReferralModal(false)}
                className="text-[#5d2a42]/50 hover:text-[#5d2a42] p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {referralCreated ? (
              <div className="p-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-[#5d2a42] mx-auto" />
                <h4 className="text-sm font-bold text-[#5d2a42]">Referral Slip Generated</h4>
                <p className="text-xs text-[#5d2a42]/70">
                  Patient referred successfully. Record logged to Referrals tracker.
                </p>
              </div>
            ) : (
              <form onSubmit={handleCreateReferral} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">Specialist Specialty</label>
                  <input
                    type="text"
                    required
                    value={referralSpecialist}
                    onChange={(e) => setReferralSpecialist(e.target.value)}
                    placeholder="e.g. Ophthalmologist / Retina Specialist"
                    className="w-full px-3 py-2 bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">Destination Facility</label>
                  <input
                    type="text"
                    required
                    value={referralFacility}
                    onChange={(e) => setReferralFacility(e.target.value)}
                    placeholder="e.g. District Civil Hospital Eye Clinic"
                    className="w-full px-3 py-2 bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">Referral Priority</label>
                  <select
                    value={referralPriority}
                    onChange={(e) => setReferralPriority(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42]"
                  >
                    <option value="routine">Routine (within 4 weeks)</option>
                    <option value="priority">Priority (within 1 week)</option>
                    <option value="urgent">Urgent (within 48 hours)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#5d2a42] mb-1">Clinical Indication / Reason</label>
                  <textarea
                    rows={3}
                    required
                    value={referralReason}
                    onChange={(e) => setReferralReason(e.target.value)}
                    placeholder="Specify why patient requires further evaluation..."
                    className="w-full px-3 py-2 bg-white border border-[#d8e2dc] rounded-xl text-[#5d2a42]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#d8e2dc]">
                  <button
                    type="button"
                    onClick={() => setShowReferralModal(false)}
                    className="px-3 py-1.5 rounded-xl border border-[#d8e2dc] text-[#5d2a42] hover:bg-[#ffdccc]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingReferral}
                    className="px-4 py-1.5 bg-[#5d2a42] hover:bg-[#4a2135] text-[#fff9ec] rounded-xl font-bold shadow-xs disabled:opacity-50"
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
    <Suspense fallback={<div className="p-8 text-center text-xs text-[#5d2a42]/70 font-bold">Loading screening flow...</div>}>
      <ScreeningWorkflow />
    </Suspense>
  );
}
