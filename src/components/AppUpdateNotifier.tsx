import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, X, Smartphone, Monitor, CheckCircle, Info } from 'lucide-react';
import API from '../services/api';

interface AppVersionInfo {
  version: string;
  buildTime: number;
  releaseNotes?: string;
  updateTitle?: string;
  updateMessage?: string;
  hasUpdates?: boolean;
}

export default function AppUpdateNotifier() {
  const [currentVersion, setCurrentVersion] = useState<string | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [updateInfo, setUpdateInfo] = useState<AppVersionInfo | null>(null);
  const [dismissedVersion, setDismissedVersion] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
    time: string;
  } | null>(null);

  // Check version from backend
  const checkAppVersion = useCallback(async () => {
    try {
      const res = await API.get('/system/version');
      if (res && res.data && res.data.version) {
        const serverVersion = res.data.version;
        const storedLocalVersion = localStorage.getItem('edulink_app_version');

        if (!storedLocalVersion) {
          // First time load: register current version
          localStorage.setItem('edulink_app_version', serverVersion);
          setCurrentVersion(serverVersion);
        } else if (storedLocalVersion !== serverVersion) {
          // Newer version detected!
          if (dismissedVersion !== serverVersion) {
            setUpdateAvailable(true);
            setUpdateInfo(res.data);
            
            // Trigger visual banner and push sound/vibrate if supported on smartphone
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try {
                navigator.vibrate([100, 50, 100]);
              } catch {
                // Ignore if permission denied
              }
            }
          }
        }
      }
    } catch {
      // Offline or network error - silent
    }
  }, [dismissedVersion]);

  // Check for live updates every 15 seconds or when tab regains focus
  useEffect(() => {
    // Initial check
    checkAppVersion();

    const interval = setInterval(checkAppVersion, 15000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkAppVersion();
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', checkAppVersion);

    return () => {
      clearInterval(interval);
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', checkAppVersion);
    };
  }, [checkAppVersion]);

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    if (updateInfo?.version) {
      localStorage.setItem('edulink_app_version', updateInfo.version);
    }
    // Hard reload to fetch the latest assets immediately on PC, smartphone, and tablet
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleDismiss = () => {
    if (updateInfo?.version) {
      setDismissedVersion(updateInfo.version);
    }
    setUpdateAvailable(false);
  };

  return (
    <>
      {/* Banner / Modal for New App Version available */}
      <AnimatePresence>
        {updateAvailable && (
          <motion.div
            initial={{ opacity: 0, y: -60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="fixed top-3 left-3 right-3 sm:left-auto sm:right-4 sm:max-w-md z-[9999] pointer-events-auto"
          >
            <div className="bg-slate-900/95 backdrop-blur-md text-white rounded-2xl shadow-2xl border border-orange-500/40 p-4 sm:p-5 relative overflow-hidden ring-4 ring-orange-500/20">
              {/* Highlight bar with pulse effect */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-amber-400 to-emerald-400 animate-pulse" />

              <div className="flex items-start gap-3.5 mt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shrink-0 shadow-lg shadow-orange-600/30">
                  <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                </div>

                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-[10px] font-black tracking-wider uppercase bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full">
                      Mise à jour disponible
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Monitor className="w-3 h-3 hidden sm:inline" />
                      <Smartphone className="w-3 h-3 sm:hidden" />
                      Tous appareils
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-extrabold text-white leading-tight">
                    {updateInfo?.updateTitle || 'Nouvelle version d\'EDULINK CI disponible !'}
                  </h4>

                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    {updateInfo?.updateMessage || 'Une mise à jour vient d\'être déployée (nouvelles fonctions, filtres et sécurité). Cliquez pour actualiser immédiatement.'}
                  </p>

                  <div className="mt-3.5 flex items-center gap-2">
                    <button
                      onClick={handleApplyUpdate}
                      disabled={isUpdating}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-95 cursor-pointer disabled:opacity-75"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isUpdating ? 'animate-spin' : ''}`} />
                      {isUpdating ? 'Actualisation...' : 'Actualiser maintenant'}
                    </button>

                    <button
                      onClick={handleDismiss}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
                    >
                      Plus tard
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleDismiss}
                  className="absolute top-3 right-3 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                  aria-label="Fermer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
