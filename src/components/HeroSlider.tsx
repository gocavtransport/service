import React, { useState, useEffect } from 'react';
import { Smartphone, ChevronRight, ShieldCheck, Clock, Award, Sparkles, Navigation } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeroSliderProps {
  onSelectService: (serviceKey: string) => void;
  onOpenInstallModal: () => void;
}

export const HeroSlider: React.FC<HeroSliderProps> = ({ onSelectService, onOpenInstallModal }) => {
  const slides = [
    {
      title: 'Full-Day Chauffeur & Site Inspection',
      subtitle: '8 hours & 100 km included · Dedicated car & driver for executive site visits and factory tours',
      image: 'https://i.imgur.com/925sk4j.jpeg',
      badge: 'Corporate Favorite',
      serviceKey: 'DAYRENTAL|Full-Day Rental / Site Visit|DAYRENTAL',
    },
    {
      title: 'Multi-Day Luzon Site Visits & Out-of-Town',
      subtitle: 'Consecutive day route coverage · Chauffeur stays with party · Same route daily or regional provincial trips',
      image: 'https://i.imgur.com/NRYLDMR.jpeg',
      badge: 'Multi-Day Savings',
      serviceKey: 'DAYRENTAL_MULTI|Multi-Day Site Visit - Same Route Daily|DAYRENTAL_MULTI',
    },
    {
      title: 'Airport Transfers & Same-Day Split Runs',
      subtitle: 'NAIA & Clark flight tracking · AM drop-off + PM return',
      image: 'https://i.imgur.com/IZUEKJe.jpeg',
      badge: 'Airport Reliable',
      serviceKey: 'ROUND_SPLIT|Same-Day Split Transfer (AM Drop-off + PM Return)|TRANSFER_ROUND_SPLIT',
    },
  ];

  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <section className="relative overflow-hidden pt-6 pb-12 lg:py-16">
      {/* Background Ambience Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#d4af37]/10 blur-[130px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Corridor Pill */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mb-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#181a24] border border-[#d4af37]/50 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d4af37] animate-ping"></span>
            <span className="text-xs sm:text-sm font-bold text-[#fdf4b8] uppercase tracking-wider">
              Serving Cavite · NCR · Laguna · Batangas · Luzon Corridors
            </span>
          </div>

          <button
            onClick={onOpenInstallModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-xs sm:text-sm font-bold hover:bg-emerald-900/60 transition"
          >
            <Smartphone className="w-4 h-4 text-emerald-400" />
            <span>Install Android App</span>
          </button>
        </div>

        {/* Hero Title */}
        <div className="text-center max-w-4xl mx-auto mb-8">
          <h1 className="font-serif-luxury text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
            Executive Chauffeur Service{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#fdf4b8] via-[#d4af37] to-[#e6b830]">
              Built for Luzon
            </span>
          </h1>
          <p className="mt-4 text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto leading-relaxed font-medium">
            Priced dynamically by distance and expressway tolls, anchored to our home base in General Trias, Cavite. Professional chauffeurs, clean sanitized fleet, and instant PDF quotations.
          </p>

          {/* Quick CTA Actions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3.5">
            <a
              href="#booking"
              className="px-7 py-3.5 rounded-xl font-bold text-sm sm:text-base text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 shadow-lg shadow-[#d4af37]/25 flex items-center gap-2 transition active:scale-95"
            >
              <span>Instant Fare Booking</span>
              <ChevronRight className="w-5 h-5" />
            </a>

            <a
              href="#booking"
              className="px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base text-slate-100 bg-[#161822] border border-[#2b2e3e] hover:border-[#d4af37]/50 hover:text-white flex items-center gap-2 transition active:scale-95"
            >
              <Navigation className="w-4 h-4 text-[#d4af37]" />
              <span>Live Fare Calculator</span>
            </a>

            <PWAInstallButton variant="outline" className="hidden sm:flex" />
          </div>
        </div>

        {/* Interactive Visual Slider */}
        <div className="relative rounded-2xl overflow-hidden border border-[#d4af37]/35 shadow-2xl bg-[#12141c]">
          <div className="relative h-72 sm:h-88 md:h-[420px] w-full">
            {slides.map((slide, idx) => (
              <div
                key={slide.title}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out cursor-pointer ${
                  idx === activeSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                }`}
                onClick={() => onSelectService(slide.serviceKey)}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0b0c10] via-[#0b0c10]/60 to-transparent flex flex-col justify-end p-6 sm:p-9">
                  <div className="max-w-2xl">
                    <span className="inline-block px-3.5 py-1 rounded-md text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#d4af37] text-black mb-2.5 shadow-md">
                      {slide.badge}
                    </span>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-2 drop-shadow-md">
                      {slide.title}
                    </h3>
                    <p className="text-sm sm:text-base text-slate-100 line-clamp-2 drop-shadow font-medium">
                      {slide.subtitle}
                    </p>
                    <div className="mt-3.5 inline-flex items-center gap-2 text-sm font-bold text-[#f5d77f] hover:underline">
                      <span>Book this service in form below →</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Pagination Dots */}
          <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/15">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className={`h-3 rounded-full transition-all ${
                  idx === activeSlide ? 'w-7 bg-[#d4af37]' : 'w-2.5 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 4 Feature Value Pillars */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3.5 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">Fuel &amp; Driver Always</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">All trip quotes 100% inclusive</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">Expressway Tolls</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Exact CAVITEX, SLEX, Skyway</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">Flight Tracking</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Curbside airport staging</div>
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#141620] border border-[#242736] flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#d4af37]/20 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-[#f5d77f]" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold text-white">2019–2026 Verified</div>
              <div className="text-xs sm:text-sm text-slate-300 font-medium">Non-VAT Reg 940-158-988</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
