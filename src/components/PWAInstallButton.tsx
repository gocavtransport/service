import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, Download, CheckCircle2, Loader2 } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'outline' | 'badge';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'primary',
}) => {
  const { isInstalled, isInstalling, triggerDirectInstall } = usePWAInstall();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleClick = async () => {
    const res = await triggerDirectInstall();
    if (res.outcome === 'accepted') {
      setToastMessage('🎉 GoCav Transport app installed successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } else if (res.outcome === 'already_installed') {
      setToastMessage('✓ GoCav is already installed on your device.');
      setTimeout(() => setToastMessage(null), 3000);
    } else if (res.outcome === 'ios') {
      setToastMessage('iOS Safari: Tap Share (⎋) below and select "Add to Home Screen" to install directly.');
      setTimeout(() => setToastMessage(null), 5000);
    } else if (res.outcome === 'in_iframe') {
      // In preview iframe, prompt direct link
      setToastMessage('Opening standalone link in browser for 1-tap direct install...');
      setTimeout(() => {
        window.open(window.location.href, '_blank');
        setToastMessage(null);
      }, 1000);
    } else if (res.outcome === 'unsupported') {
      setToastMessage('Tap your browser menu (⋮) and select "Install App" or "Add to Home Screen".');
      setTimeout(() => setToastMessage(null), 4500);
    }
  };

  if (isInstalled) {
    if (variant === 'badge') {
      return (
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>GoCav App Installed</span>
        </div>
      );
    }
    return null;
  }

  return (
    <>
      {variant === 'primary' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className={`group relative flex items-center gap-2 px-3.5 py-1.5 md:px-4 md:py-2 rounded-xl text-xs md:text-sm font-bold text-black bg-gradient-to-r from-[#f5d77f] to-[#d4af37] hover:brightness-110 active:scale-95 shadow-md shadow-[#d4af37]/20 transition-all ${
            isInstalling ? 'opacity-70 cursor-wait' : ''
          } ${className}`}
        >
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-black/15">
            {isInstalling ? (
              <Loader2 className="w-3.5 h-3.5 text-black animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5 text-black animate-bounce" />
            )}
          </span>
          <span>{isInstalling ? 'Installing App...' : 'Direct Install App'}</span>
          <span className="hidden lg:inline text-[10px] font-semibold bg-black/20 px-1.5 py-0.5 rounded text-black">
            PWA
          </span>
        </button>
      )}

      {variant === 'outline' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#f5d77f] border border-[#d4af37]/40 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 active:scale-95 transition-all ${
            isInstalling ? 'opacity-70 cursor-wait' : ''
          } ${className}`}
        >
          {isInstalling ? (
            <Loader2 className="w-4 h-4 text-[#d4af37] animate-spin" />
          ) : (
            <Smartphone className="w-4 h-4 text-[#d4af37]" />
          )}
          <span>{isInstalling ? 'Installing App...' : 'Direct Install App'}</span>
        </button>
      )}

      {variant === 'badge' && (
        <button
          onClick={handleClick}
          disabled={isInstalling}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#f5d77f] text-xs font-medium hover:bg-[#d4af37]/25 transition ${
            isInstalling ? 'opacity-70 cursor-wait' : ''
          } ${className}`}
        >
          {isInstalling ? (
            <Loader2 className="w-3.5 h-3.5 text-[#d4af37] animate-spin" />
          ) : (
            <Smartphone className="w-3.5 h-3.5 text-[#d4af37]" />
          )}
          <span>{isInstalling ? 'Installing...' : 'Direct Install'}</span>
        </button>
      )}

      {/* Floating feedback toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#1a1c26] text-white text-xs border border-[#d4af37]/60 px-4 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2">
          <span>{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white shrink-0 text-xs font-bold px-1"
          >
            ✕
          </button>
        </div>
      )}
    </>
  );
};

