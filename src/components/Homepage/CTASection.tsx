'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

export function CTASection() {
  return (
    <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl md:text-2xl mb-10 text-slate-300 leading-relaxed">
            Join thousands of users who have found their perfect accommodation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="bg-white text-slate-900 hover:bg-slate-100 h-16 px-12 text-lg font-bold shadow-xl transition-all hover:scale-105" 
              asChild
            >
              <Link href="/properties" className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Explore Properties
              </Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-slate-900 h-16 px-12 text-lg font-bold shadow-xl transition-all hover:scale-105" 
              asChild
            >
              <Link href="/login-tenant">
                Become a Partner
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
