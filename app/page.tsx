import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { CallToActionSection } from '@/components/marketing/cta-section';
import { FeaturesSection } from '@/components/marketing/features-section';
import { HeroSection } from '@/components/marketing/hero-section';
import { MarketingFooter } from '@/components/marketing/footer';
import { MarketingNav } from '@/components/marketing/marketing-nav';
import { MetricsSection } from '@/components/marketing/metrics-section';

export default async function HomePage() {
  const cookieStore = await cookies();
  // El backend establece la cookie 'circlesfera_refresh' después del login
  const refreshCookie = cookieStore.get('circlesfera_refresh');

  if (refreshCookie) {
    redirect('/feed');
  }

  return (
    <>
      <MarketingNav />
      <main className="relative flex min-h-screen flex-col text-white">
        {/* Background effects adicionales para la landing */}
        <div className="pointer-events-none fixed inset-0 bg-hero-grid bg-[length:80px_80px] opacity-[0.15]" aria-hidden />
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-br from-primary-500/5 via-transparent to-accent-500/5" aria-hidden />
        <div className="relative z-10">
          <HeroSection />
          <FeaturesSection />
          <MetricsSection />
          <CallToActionSection />
        </div>
      </main>
      <MarketingFooter />
    </>
  );
}

