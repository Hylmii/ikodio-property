'use client';

import { Shield, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export function WhyChooseUs() {
  const features = [
    {
      icon: Shield,
      title: 'Secure Booking',
      description: 'Advanced security system protecting your data and transactions'
    },
    {
      icon: TrendingUp,
      title: 'Best Price',
      description: 'Guaranteed competitive pricing with transparent fee structure'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service ready to assist you'
    },
    {
      icon: CheckCircle2,
      title: 'Trusted Platform',
      description: 'Join thousands of satisfied customers nationwide'
    }
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}
        ></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white font-medium mb-4">
            <Shield className="h-4 w-4" />
            <span>Why Choose Us</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Keunggulan Kami
          </h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Pengalaman terbaik dengan layanan premium dan kepercayaan ribuan pengguna
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div 
                key={index}
                className="group text-center p-8 rounded-2xl bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 border border-white/10"
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto mb-6 group-hover:bg-slate-700 transition-all duration-300">
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-xl mb-3">{feature.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
