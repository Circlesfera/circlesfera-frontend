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
  const sessionCookie = cookieStore.get('circlesfera_session');

  if (sessionCookie) {
    redirect('/feed');
  }

  return (
    <>
      <MarketingNav />
      <main className="flex min-h-screen flex-col bg-slate-950 text-white">
        <HeroSection />
        <FeaturesSection />
        <MetricsSection />
        <CallToActionSection />
      </main>
      <MarketingFooter />
    </>
  );
}

