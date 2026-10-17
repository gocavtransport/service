import React, { useState, useEffect } from 'react';
import { Car, Calculator, History, Share2, Download, Check } from 'lucide-react';
import { getStoredRides } from '../data/rideHistory';

interface MobileBottomNavProps {
  onOpenInstallModal: () => void;
  activeSection: string;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  onOpenInstallModal,
  activeSection,
}) => {
  const [savedCount, setSavedCount] = useState<number>(0);
  const [copiedToast, setCopiedToast] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setSavedCount(getStoredRides().length);
    update();
    window.addEventListener('gocav_rides_updated', update);
    window.addEventListener('storage', update);
    return () => {
      window.removeEventListener('gocav_rides_updated', update);
      window.removeEventListener('storage', update);
    };
  }, []);

  const handleShareApp = async () => {
    const shareData = {
      title: 'GoCav Transport — Chauffeur Service',
      text: 'Book private chauffeur transfers and view live expressway toll fares across Cavite, NCR, and Luzon with GoCav Transport.',
      url: window.location.origin || window.location.href,
    };

    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        // User cancelled or aborted share, no error message needed
        if ((err as Error).name !== 'AbortError') {
          console.warn('Share API error:', err);
        }
      }
    } else {
      // Fallback: Copy URL to clipboard
      try {
        await navigator.clipboard.writeText(shareData.url);
        setCopiedToast(true);
        setTimeout(() => setCopiedToast(false), 2500);
      } catch (err) {
        console.warn('Clipboard copy error:', err);
      }
    }
  };

  return (
    <>
      {/* Toast notification for clipboard fallback */}
      {copiedToast && (
        <div className="md:hidden fixed bottom-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1c1e2a] border border-[#d4af37]/60 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>GoCav link copied to clipboard!</span>
        </div>
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0e1017]/95 backdrop-blur-lg border-t border-[#242736] pb-safe">
        <nav className="flex items-center justify-around h-16 px-2">
          <a
            href="#booking"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition ${
              activeSection === 'booking' ? 'text-[#f5d77f]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Car className="w-5 h-5 mb-0.5" />
            <span>Book</span>
          </a>

          <a
            href="#calculator"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition ${
              activeSection === 'calculator' ? 'text-[#f5d77f]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calculator className="w-5 h-5 mb-0.5" />
            <span>Fare Calc</span>
          </a>

          {/* Center Android Install Action */}
          <button
            onClick={onOpenInstallModal}
            className="flex flex-col items-center justify-center -mt-4 mx-1"
            aria-label="Install App"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#9a7b1c] to-[#f5d77f] p-0.5 shadow-lg shadow-[#d4af37]/30 flex items-center justify-center active:scale-95 transition">
              <div className="w-full h-full bg-[#12131b] rounded-full flex items-center justify-center">
                <Download className="w-5 h-5 text-[#f5d77f] animate-pulse" />
              </div>
            </div>
            <span className="text-xs font-extrabold text-[#f5d77f] mt-0.5">Install</span>
          </button>

          <a
            href="#my-rides"
            className={`flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold transition relative ${
              activeSection === 'my-rides' ? 'text-[#f5d77f]' : 'text-slate-300 hover:text-white'
            }`}
          >
            <div className="relative">
              <History className="w-5 h-5 mb-0.5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#d4af37] text-black font-extrabold text-[10px] flex items-center justify-center">
                  {savedCount > 9 ? '9+' : savedCount}
                </span>
              )}
            </div>
            <span>My Rides</span>
          </a>

          {/* Share App Action via Web Share API */}
          <button
            onClick={handleShareApp}
            className="flex flex-col items-center justify-center flex-1 py-1 text-xs font-bold text-slate-300 hover:text-[#f5d77f] active:scale-95 transition"
            aria-label="Share GoCav App"
          >
            <Share2 className="w-5 h-5 mb-0.5 text-[#d4af37]" />
            <span>Share</span>
          </button>
        </nav>
      </div>
    </>
  );
};
