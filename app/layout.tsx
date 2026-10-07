import type { Metadata } from 'next';
import './globals.css';
import AppShell from '@/components/AppShell';

export const metadata: Metadata = {
  title: 'HealthScreen — Chainlink Exact UI & Community Screening',
  description: 'Clinical decision-support screening platform for Diabetic Retinopathy and Oral Visual Screening with Chainlink UI styling & auto animation showcase.',
  keywords: ['HealthScreen', 'Chainlink UI', 'community health', 'diabetic retinopathy screening', 'oral visual screening'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.cdnfonts.com/css/product-sans" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Silkscreen:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-[#030a0d] text-white font-sans antialiased selection:bg-teal-500/30 selection:text-teal-200">
        <AppShell>
          {children}
        </AppShell>
      </body>
    </html>
  );
}

