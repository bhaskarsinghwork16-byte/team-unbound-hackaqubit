import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In — HealthScreen',
  description: 'Secure sign in to the HealthScreen clinical screening platform.',
};

/**
 * Login layout bypasses AppShell entirely — the login page is a standalone full-screen experience.
 */
export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
