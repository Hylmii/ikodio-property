'use client';

export function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Search Properties',
      description: 'Use our advanced search filters to find properties matching your preferences, budget, and desired location.'
    },
    {
      number: '2',
      title: 'Book & Pay',
      description: 'Select your dates, complete the booking form, and make secure payment through our trusted payment gateway.'
    },
    {
      number: '3',
      title: 'Enjoy Your Stay',
      description: 'Check in at your chosen property and enjoy a comfortable stay. Share your experience through reviews.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 font-medium mb-4">
              <span>Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900">
              How It Works
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Three simple steps to find your perfect accommodation
            </p>
          </div>

          <div className="grid gap-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 items-start group">
                <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white text-2xl font-bold group-hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-3 text-slate-900">{step.title}</h3>
                  <p className="text-slate-600 text-lg leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
