import { useEffect, useState, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

declare global {
  interface Window {
    __gocav_deferred_prompt?: BeforeInstallPromptEvent;
    __gocav_prompt_listeners?: Array<(e: BeforeInstallPromptEvent) => void>;
  }
}

export type DirectInstallOutcome =
  | 'accepted'
  | 'dismissed'
  | 'already_installed'
  | 'ios'
  | 'in_iframe'
  | 'waiting'
  | 'unsupported';

export interface DirectInstallResult {
  outcome: DirectInstallOutcome;
  message: string;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() => {
    if (typeof window !== 'undefined' && window.__gocav_deferred_prompt) {
      return window.__gocav_deferred_prompt;
    }
    return null;
  });
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed on homescreen/desktop)
    const isStandalone =
      (typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true)) ||
      false;
    setIsInstalled(isStandalone);

    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isAndroidDevice = /android/.test(userAgent);
      setIsIOS(isIOSDevice);
      setIsAndroid(isAndroidDevice);

      // If early window script already captured the prompt, sync it immediately
      if (window.__gocav_deferred_prompt && !deferredPrompt) {
        setDeferredPrompt(window.__gocav_deferred_prompt);
      }

      const listener = (e: BeforeInstallPromptEvent) => {
        setDeferredPrompt(e);
      };

      if (!window.__gocav_prompt_listeners) {
        window.__gocav_prompt_listeners = [];
      }
      window.__gocav_prompt_listeners.push(listener);

      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault();
        const promptEvent = e as BeforeInstallPromptEvent;
        window.__gocav_deferred_prompt = promptEvent;
        setDeferredPrompt(promptEvent);
      };

      const handleAppInstalled = () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
        window.__gocav_deferred_prompt = undefined;
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.addEventListener('appinstalled', handleAppInstalled);

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.removeEventListener('appinstalled', handleAppInstalled);
        if (window.__gocav_prompt_listeners) {
          window.__gocav_prompt_listeners = window.__gocav_prompt_listeners.filter(
            (fn) => fn !== listener
          );
        }
      };
    }
  }, []);

  useEffect(() => {
    // Check if ?install=1 or #install was specified in URL to auto-prompt
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('install') === '1' || window.location.hash === '#install') {
        const timer = setTimeout(() => {
          if (!isInstalled) {
            triggerDirectInstall();
          }
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [isInstalled]);

  const triggerDirectInstall = useCallback(async (): Promise<DirectInstallResult> => {
    setIsInstalling(true);
    try {
      // 1. Check if already installed
      if (isInstalled) {
        return {
          outcome: 'already_installed',
          message: 'GoCav Transport is already installed on your device.',
        };
      }

      // 2. Fetch the active native prompt event
      let promptToUse =
        deferredPrompt ||
        (typeof window !== 'undefined' ? window.__gocav_deferred_prompt : null);

      // 3. If prompt is not yet ready, wait up to 3000ms for service worker handshake & event arrival
      if (!promptToUse && typeof window !== 'undefined') {
        const waitedPrompt = await new Promise<BeforeInstallPromptEvent | null>((resolve) => {
          let timeoutId: any = null;
          const handler = (e: BeforeInstallPromptEvent) => {
            if (timeoutId) clearTimeout(timeoutId);
            resolve(e);
          };
          if (window.__gocav_prompt_listeners) {
            window.__gocav_prompt_listeners.push(handler);
          }
          timeoutId = setTimeout(() => {
            if (window.__gocav_prompt_listeners) {
              window.__gocav_prompt_listeners = window.__gocav_prompt_listeners.filter(
                (fn) => fn !== handler
              );
            }
            resolve(window.__gocav_deferred_prompt || null);
          }, 3000);
        });
        if (waitedPrompt) {
          promptToUse = waitedPrompt;
        }
      }

      // 4. Trigger the native installation dialog directly!
      if (promptToUse) {
        try {
          await promptToUse.prompt();
          const choice = await promptToUse.userChoice;
          if (choice && choice.outcome === 'accepted') {
            setIsInstalled(true);
            setDeferredPrompt(null);
            if (typeof window !== 'undefined') {
              window.__gocav_deferred_prompt = undefined;
            }
            return {
              outcome: 'accepted',
              message: '🎉 GoCav Transport installed successfully on your home screen!',
            };
          }
          return {
            outcome: 'dismissed',
            message: 'Installation was dismissed.',
          };
        } catch (err) {
          console.error('Direct install prompt trigger error:', err);
        }
      }

      // 5. If running inside an iframe (like AI Studio preview), open directly in browser tab with auto-prompt
      if (typeof window !== 'undefined' && window.self !== window.top) {
        const targetUrl = new URL(window.location.href);
        targetUrl.searchParams.set('install', '1');
        window.open(targetUrl.toString(), '_blank');
        return {
          outcome: 'in_iframe',
          message: 'Opening GoCav in browser tab for direct 1-tap installation...',
        };
      }

      // 6. iOS Safari (Apple does not support programmatic beforeinstallprompt)
      if (isIOS) {
        return {
          outcome: 'ios',
          message:
            'iOS Safari: Tap the Share button (⎋) at the bottom and choose "Add to Home Screen" to install GoCav directly.',
        };
      }

      return {
        outcome: 'unsupported',
        message:
          'Click the install icon in your address bar or browser menu to add GoCav to your home screen.',
      };
    } finally {
      setIsInstalling(false);
    }
  }, [deferredPrompt, isInstalled, isIOS]);

  const hasNativePrompt =
    !!deferredPrompt || (typeof window !== 'undefined' && !!window.__gocav_deferred_prompt);

  return {
    isInstallable: hasNativePrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInstalling,
    install: async () => {
      const res = await triggerDirectInstall();
      return res.outcome === 'accepted';
    },
    triggerDirectInstall,
    deferredPrompt,
  };
}

