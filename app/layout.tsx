import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'HealthScreen — Community Screening Platform',
  description: 'Clinical decision-support screening platform for Diabetic Retinopathy and Oral Visual Screening in community healthcare centres.',
  keywords: ['HealthScreen', 'community health', 'diabetic retinopathy screening', 'oral visual screening', 'clinical decision support'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
