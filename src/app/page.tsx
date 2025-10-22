'use client';

import { HeroSection } from '@/components/Homepage/HeroSection';
import { FeaturedProperties } from '@/components/Homepage/FeaturedProperties';
import { WhyChooseUs } from '@/components/Homepage/WhyChooseUs';
import { HowItWorks } from '@/components/Homepage/HowItWorks';
import { CTASection } from '@/components/Homepage/CTASection';

export default function Home() {
  const heroImages = [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80',
  ];

  return (
    <div className="flex flex-col bg-slate-50">
      <HeroSection heroImages={heroImages} />
      <FeaturedProperties />
      <WhyChooseUs />
      <HowItWorks />
      <CTASection />
    </div>
  );
}
