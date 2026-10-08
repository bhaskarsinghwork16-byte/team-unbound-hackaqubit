import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'HealthScreen AI — Community Clinical Triage Platform',
  description: 'Offline-first AI triage and clinical decision-support for Diabetic Retinopathy and Oral Mucosal Lesions in community health camps.',
  keywords: ['HealthScreen', 'AI screening', 'community health', 'diabetic retinopathy', 'oral cancer screening', 'offline AI'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased selection:bg-teal-500/20 selection:text-teal-900">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

