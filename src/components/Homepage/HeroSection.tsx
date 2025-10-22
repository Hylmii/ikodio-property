'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar, Users, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  heroImages: string[];
}

export function HeroSection({ heroImages }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchData, setSearchData] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [heroImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length);
  };

  return (
    <section className="relative overflow-hidden h-[650px] bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Background Images */}
      <div className="absolute inset-0 z-0">
        {heroImages.map((img, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={img}
              alt={`Property ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/80"></div>
      </div>

      {/* Carousel Navigation */}
      <button 
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all duration-300 group border border-white/20"
      >
        <span className="text-white text-2xl group-hover:-translate-x-0.5 transition-transform">‹</span>
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 h-12 w-12 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 flex items-center justify-center transition-all duration-300 group border border-white/20"
      >
        <span className="text-white text-2xl group-hover:translate-x-0.5 transition-transform">›</span>
      </button>

      {/* Carousel Indicators */}
      <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-10 flex gap-2">
        {heroImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              index === currentSlide ? 'w-12 bg-white' : 'w-1.5 bg-white/40 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
      
      <div className="container relative z-10 mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-6 animate-fade-in">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Special Offer</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight text-white animate-fade-in-up">
            Diskon 30% untuk Booking Pertama
          </h1>
          
          <p className="text-lg md:text-xl text-slate-200 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Gunakan kode FIRST30 untuk mendapatkan diskon khusus
          </p>
          
          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-6xl mx-auto mt-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 text-left">Cari Properti Impian Anda</h2>

            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {/* Pilih Kota */}
              <div className="flex-1">
                <div className="relative bg-slate-100 rounded-xl overflow-hidden h-14 hover:bg-slate-200 transition-colors">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none z-10" />
                  <select
                    value={searchData.city}
                    onChange={(e) => setSearchData({ ...searchData, city: e.target.value })}
                    className="w-full h-full pl-12 pr-10 bg-transparent text-slate-700 font-medium focus:outline-none appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 0.75rem center',
                      backgroundSize: '1.25em 1.25em',
                    }}
                  >
                    <option value="">Pilih Kota</option>
                    <option value="Jakarta">Jakarta</option>
                    <option value="Bandung">Bandung</option>
                    <option value="Bali">Bali</option>
                    <option value="Surabaya">Surabaya</option>
                    <option value="Yogyakarta">Yogyakarta</option>
                  </select>
                </div>
              </div>
              
              {/* Date */}
              <div className="flex-1">
                <div className="relative bg-slate-100 rounded-xl overflow-hidden h-14 hover:bg-slate-200 transition-colors">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none z-10" />
                  <input
                    type="date"
                    value={searchData.checkIn}
                    onChange={(e) => setSearchData({ ...searchData, checkIn: e.target.value })}
                    placeholder="dd/mm/yyyy"
                    className="w-full h-full pl-12 pr-4 bg-transparent text-slate-700 font-medium focus:outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
              
              {/* Durasi */}
              <div className="flex-1">
                <div className="relative bg-slate-100 rounded-xl overflow-hidden h-14 hover:bg-slate-200 transition-colors">
                  <input
                    type="text"
                    placeholder="Durasi (malam)"
                    className="w-full h-full px-4 bg-transparent text-slate-700 font-medium placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Jumlah Tamu */}
              <div className="flex-1">
                <div className="relative bg-slate-100 rounded-xl overflow-hidden h-14 hover:bg-slate-200 transition-colors">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 pointer-events-none z-10" />
                  <input
                    type="text"
                    placeholder="Jumlah Tamu"
                    value={searchData.guests || ''}
                    onChange={(e) => setSearchData({ ...searchData, guests: parseInt(e.target.value) || 1 })}
                    className="w-full h-full pl-12 pr-4 bg-transparent text-slate-700 font-medium placeholder:text-slate-500 focus:outline-none"
                  />
                </div>
              </div>
              
              {/* Button Cari */}
              <div className="md:w-auto w-full">
                <Button 
                  size="lg" 
                  className="w-full md:w-auto h-14 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-base rounded-xl shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href={`/properties?city=${searchData.city}&checkIn=${searchData.checkIn}`} className="flex items-center justify-center gap-2">
                    <Search className="h-5 w-5" />
                    Cari
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
