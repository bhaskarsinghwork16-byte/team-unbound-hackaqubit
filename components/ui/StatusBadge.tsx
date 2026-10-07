import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  HelpCircle, 
  GitPullRequest, 
  Wifi, 
  WifiOff,
  ShieldCheck
} from 'lucide-react';
import { Badge } from './Badge';

export type ClinicalStatus = 
  | 'completed'
  | 'no_abnormality'
  | 'potential_finding'
  | 'inconclusive'
  | 'quality_insufficient'
  | 'analysis_unavailable'
  | 'pending'
  | 'reviewed'
  | 'referred'
  | 'routine'
  | 'urgent'
  | 'emergency'
  | 'online'
  | 'offline'
  | string;

export interface StatusBadgeProps {
  status: ClinicalStatus;
  label?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export function StatusBadge({ status, label, size = 'md', className = '' }: StatusBadgeProps) {
  const norm = (status || '').toLowerCase().trim();

  // 1. Success / Healthy
  if (['completed', 'no_abnormality', 'lower_risk', 'reviewed', 'accepted', 'online'].includes(norm)) {
    const text = label || (norm === 'no_abnormality' ? 'No Abnormality' : norm === 'online' ? 'Online' : 'Completed');
    return (
      <Badge variant="success" size={size} icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />} className={className}>
        {text}
      </Badge>
    );
  }

  // 2. Warning / Review / Urgent
  if (['potential_finding', 'higher_risk', 'review_required', 'pending', 'urgent', 'needs_attention'].includes(norm)) {
    const text = label || (norm === 'potential_finding' ? 'Potential Finding' : norm === 'urgent' ? 'Urgent Priority' : 'Pending Review');
    return (
      <Badge variant="warning" size={size} icon={<AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />} className={className}>
        {text}
      </Badge>
    );
  }

  // 3. Error / Emergency / Blocked / Offline
  if (['emergency', 'failed', 'offline', 'wrong_image_type', 'rejected'].includes(norm)) {
    const text = label || (norm === 'emergency' ? 'Emergency' : norm === 'offline' ? 'Offline' : 'Action Required');
    return (
      <Badge variant="error" size={size} icon={<AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />} className={className}>
        {text}
      </Badge>
    );
  }

  // 4. Info / Referral / Routine
  if (['referred', 'routine', 'in_progress', 'scheduled'].includes(norm)) {
    const text = label || (norm === 'referred' ? 'Referred' : norm === 'routine' ? 'Routine Priority' : 'In Progress');
    return (
      <Badge variant="info" size={size} icon={<GitPullRequest className="w-3.5 h-3.5 text-teal-600 shrink-0" />} className={className}>
        {text}
      </Badge>
    );
  }

  // 5. Default Neutral / Inconclusive
  const text = label || (norm === 'inconclusive' ? 'Inconclusive' : norm === 'quality_insufficient' ? 'Quality Insufficient' : norm || 'Unknown');
  return (
    <Badge variant="neutral" size={size} icon={<HelpCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />} className={className}>
      {text}
    </Badge>
  );
}
