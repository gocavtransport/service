import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 z-50 flex items-center gap-2.5 rounded-xl bg-amber-500/95 backdrop-blur-md px-4 py-2.5 text-xs font-semibold text-zinc-950 shadow-2xl border border-amber-300">
      <WifiOff className="w-4 h-4 animate-pulse" />
      <span>Offline Mode — Cached routes & rates available.</span>
    </div>
  );
};
