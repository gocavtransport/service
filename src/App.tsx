import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { FareCalculatorSection } from './components/FareCalculatorSection';
import { MyRidesSection } from './components/MyRidesSection';
import { FleetSection } from './components/FleetSection';
import { DriverPartnerSection } from './components/DriverPartnerSection';
import { TestimonialsAndFaq } from './components/TestimonialsAndFaq';
import { MobileBottomNav } from './components/MobileBottomNav';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { StoredRideRecord } from './data/rideHistory';
import { Smartphone, Download, X, Loader2 } from 'lucide-react';

export default function App() {
  const { isInstalled, isInstalling, triggerDirectInstall } = usePWAInstall();
  const [installFeedback, setInstallFeedback] = useState<string | null>(null);
  const [selectedServicePreload, setSelectedServicePreload] = useState<string>(
    'ONEWAY|One-Way Transfer|TRANSFER_ONEWAY'
  );
  const [loadedRide, setLoadedRide] = useState<StoredRideRecord | null>(null);
  const [topBannerDismissed, setTopBannerDismissed] = useState(false);
  const [activeSection, setActiveSection] = useState('booking');

  // Direct installation handler: triggers native prompt directly without opening an instructional menu
  const handleDirectInstall = async () => {
    const res = await triggerDirectInstall();
    if (res.outcome === 'accepted') {
      setInstallFeedback('🎉 GoCav Transport app installed successfully!');
      setTimeout(() => setInstallFeedback(null), 4000);
    } else if (res.outcome === 'already_installed') {
      setInstallFeedback('✓ GoCav is already installed on your device.');
      setTimeout(() => setInstallFeedback(null), 3000);
    } else if (res.outcome === 'ios') {
      setInstallFeedback('iOS Safari: Tap the Share button (⎋) below and select "Add to Home Screen" to install directly.');
      setTimeout(() => setInstallFeedback(null), 6000);
    } else if (res.outcome === 'in_iframe') {
      setInstallFeedback('Opening standalone tab in browser for 1-tap direct install...');
      setTimeout(() => {
        window.open(window.location.href, '_blank');
        setInstallFeedback(null);
      }, 1000);
    } else if (res.outcome === 'unsupported') {
      setInstallFeedback('Direct install is ready: Tap your browser menu (⋮) and select "Install App" or "Add to Home Screen".');
      setTimeout(() => setInstallFeedback(null), 4500);
    }
  };

  const handleSelectService = (serviceKey: string) => {
    setSelectedServicePreload(serviceKey);
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectVehicle = () => {
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleLoadRideToForm = (ride: StoredRideRecord) => {
    setLoadedRide(ride);
    setActiveSection('booking');
    const bookingEl = document.getElementById('booking');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] text-[#e6e8f0] pb-20 md:pb-0 flex flex-col font-sans selection:bg-[#d4af37]/30 selection:text-[#fdf4b8]">
      {/* Offline Status Warning Indicator */}
      <OfflineIndicator />

      {/* Android PWA Install Sticky Notification Banner (if not installed yet) */}
      {!isInstalled && !topBannerDismissed && (
        <div className="bg-gradient-to-r from-[#9a7b1c] via-[#d4af37] to-[#f5d77f] text-black px-4 py-2 text-xs font-bold flex items-center justify-between shadow-md relative z-50">
          <div className="flex items-center gap-2 truncate">
            <Smartphone className="w-4 h-4 shrink-0" />
            <span className="truncate">
              Install GoCav directly on your device for instant offline access and 1-tap bookings!
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            <button
              onClick={handleDirectInstall}
              disabled={isInstalling}
              className="bg-black text-[#f5d77f] px-2.5 py-1 rounded-lg text-[11px] font-extrabold flex items-center gap-1 hover:bg-slate-900 active:scale-95 transition disabled:opacity-60"
            >
              {isInstalling ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <Download className="w-3 h-3" />
              )}
              <span>{isInstalling ? 'Installing...' : 'Install App Directly'}</span>
            </button>
            <button
              onClick={() => setTopBannerDismissed(true)}
              className="p-1 hover:bg-black/10 rounded text-black/70 hover:text-black transition"
              aria-label="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Direct install floating feedback notification */}
      {installFeedback && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 max-w-md w-[92%] bg-[#151722] text-white text-xs border border-[#d4af37] px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[#f5d77f] shrink-0" />
            <span>{installFeedback}</span>
          </div>
          <button
            onClick={() => setInstallFeedback(null)}
            className="text-slate-400 hover:text-white shrink-0 text-xs font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Navbar with brand, direct install button, and navigation */}
      <Navbar onOpenInstallModal={handleDirectInstall} />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero & Interactive Service Visual Slider */}
        <HeroSlider
          onSelectService={handleSelectService}
          onOpenInstallModal={handleDirectInstall}
        />

        {/* Live Fare Calculator & Interactive Booking Wizard */}
        <FareCalculatorSection
          selectedServicePreload={selectedServicePreload}
          loadedRide={loadedRide}
        />

        {/* My Saved Rides & Persistent Estimates (localStorage) */}
        <MyRidesSection onLoadRideToForm={handleLoadRideToForm} />

        {/* Fleet Showcase & Chauffeur Standards */}
        <FleetSection onSelectVehicle={handleSelectVehicle} />

        {/* Driver Partner Network & Live City Allocation Grid */}
        <DriverPartnerSection />

        {/* Testimonials, FAQ Accordion & Corporate Info */}
        <TestimonialsAndFaq onOpenInstallModal={handleDirectInstall} />
      </main>

      {/* Mobile Android-Friendly Bottom Navigation Bar */}
      <MobileBottomNav
        onOpenInstallModal={handleDirectInstall}
        activeSection={activeSection}
      />
    </div>
  );
}

