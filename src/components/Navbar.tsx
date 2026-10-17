import React, { useState, useEffect } from 'react';
import { CONTACT_INFO } from '../data/gocavData';
import { PWAInstallButton } from './PWAInstallButton';
import { getStoredRides } from '../data/rideHistory';
import { Phone, MessageCircle, Menu, X, Shield, MapPin, Calculator, Car, Users, History } from 'lucide-react';

interface NavbarProps {
  onOpenInstallModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenInstallModal }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [savedCount, setSavedCount] = useState<number>(0);

  useEffect(() => {
    const updateCount = () => {
      setSavedCount(getStoredRides().length);
    };
    updateCount();
    window.addEventListener('gocav_rides_updated', updateCount);
    window.addEventListener('storage', updateCount);
    return () => {
      window.removeEventListener('gocav_rides_updated', updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);

  const navLinks = [
    { id: 'nav-booking', label: 'Book Chauffeur', href: '#booking', icon: Car },
    { id: 'nav-calculator', label: 'Fare Calculator', href: '#booking', icon: Calculator },
    { id: 'nav-rides', label: 'My Rides', href: '#my-rides', icon: History, count: savedCount },
    { id: 'nav-fleet', label: 'Fleet Specs', href: '#fleet', icon: Shield },
    { id: 'nav-partners', label: 'Driver Partners', href: '#partners', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b0c10]/95 backdrop-blur-xl border-b border-[#242736]">
      {/* Top micro announcement bar */}
      <div className="bg-gradient-to-r from-[#181a24] via-[#242118] to-[#181a24] border-b border-[#d4af37]/20 py-2 px-4 text-center text-xs md:text-sm text-slate-200 flex items-center justify-between sm:justify-center gap-3">
        <span className="flex items-center gap-2 font-medium truncate">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></span>
          <span className="text-[#f5d77f] font-bold">Cavite Base:</span>
          <span className="truncate">General Trias · Live chauffeur dispatches across Cavite, NCR, Laguna &amp; Batangas</span>
        </span>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onOpenInstallModal}
            className="hidden md:inline-flex text-[#d4af37] underline font-bold hover:text-white transition text-xs md:text-sm"
          >
            Direct Install GoCav App →
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo & Brand */}
          <a href="#" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={CONTACT_INFO.logoUrl}
                alt="GoCav Transport"
                className="h-11 md:h-14 w-auto object-contain rounded-lg border border-[#d4af37]/40 shadow-sm shadow-[#d4af37]/20 group-hover:scale-105 transition"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-serif-luxury font-extrabold text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#fdf4b8] via-[#d4af37] to-[#b38b18]">
                  GOCAV
                </span>
                <span className="text-xs font-bold tracking-widest text-[#f5d77f] uppercase bg-[#d4af37]/20 px-2 py-0.5 rounded border border-[#d4af37]/35">
                  TRANSPORT
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium tracking-wider hidden sm:block">
                PREMIUM CHAUFFEUR SERVICE
              </p>
            </div>
          </a>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                className="text-sm xl:text-base font-semibold text-slate-200 hover:text-[#f5d77f] transition flex items-center gap-1.5 relative"
              >
                <link.icon className="w-4 h-4 text-[#d4af37]" />
                <span>{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-[#d4af37] text-black">
                    {link.count}
                  </span>
                )}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Install Button */}
            <PWAInstallButton variant="primary" />

            {/* WhatsApp direct button */}
            <a
              href={`https://wa.me/${CONTACT_INFO.whatsappRaw}?text=${encodeURIComponent('Hello GoCav Transport, I would like to inquire about a chauffeur booking.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/50 hover:bg-emerald-900/60 transition"
              title="Chat on WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 fill-emerald-400/20" />
              <span>WhatsApp</span>
            </a>

            {/* Quick Call */}
            <a
              href={`tel:${CONTACT_INFO.whatsappRaw}`}
              className="p-2 rounded-xl bg-slate-800/90 border border-slate-700 text-slate-200 hover:text-[#f5d77f] hover:border-[#d4af37]/40 transition"
              title="Call Dispatch"
            >
              <Phone className="w-4 h-4 text-[#d4af37]" />
            </a>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-slate-800/80 border border-slate-700"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#10121a] border-b border-[#242736] px-4 pt-3 pb-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="grid grid-cols-1 gap-2">
            {navLinks.map((link) => (
              <a
                key={link.id}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3 py-3 rounded-xl text-base font-semibold text-slate-100 hover:bg-[#d4af37]/15 hover:text-[#f5d77f] border border-transparent hover:border-[#d4af37]/30 transition"
              >
                <div className="flex items-center gap-3">
                  <link.icon className="w-5 h-5 text-[#d4af37]" />
                  <span>{link.label}</span>
                </div>
                {link.count !== undefined && link.count > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#d4af37] text-black">
                    {link.count}
                  </span>
                )}
              </a>
            ))}
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenInstallModal();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-base font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37]"
            >
              Direct Install GoCav App
            </button>
            <div className="flex gap-2">
              <a
                href={`https://wa.me/${CONTACT_INFO.whatsappRaw}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold bg-emerald-950/90 border border-emerald-500/50 text-emerald-300"
              >
                <MessageCircle className="w-4 h-4" /> WhatsApp
              </a>
              <a
                href={`tel:${CONTACT_INFO.whatsappRaw}`}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold bg-slate-800 border border-slate-700 text-slate-200"
              >
                <Phone className="w-4 h-4" /> Call Dispatch
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
