import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bell, 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Briefcase, 
  Building2, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import API from '../services/api';
import { subscribeAuthChanged } from '../utils/auth';

interface ToastAlert {
  id: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING';
  link?: string;
  badge?: string;
  timestamp: number;
}

export default function ToastAlerts() {
  const [activeToasts, setActiveToasts] = useState<ToastAlert[]>([]);
  const [lastShownIds, setLastShownIds] = useState<Set<string>>(new Set());

  const checkForAlerts = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('edulink_token') : null;

    if (token) {
      // User is logged in: Check for new unread personal notifications
      try {
        const res = await API.get('/notifications');
        if (res && res.data && res.data.notifications) {
          const unread = res.data.notifications.filter((n: any) => !n.isRead);
          if (unread.length > 0) {
            const latest = unread[0];
            if (!lastShownIds.has(latest.id)) {
              setLastShownIds(prev => new Set(prev).add(latest.id));
              pushToast({
                id: latest.id,
                title: latest.title,
                message: latest.message,
                type: latest.type || 'INFO',
                link: latest.link || '/profile',
                badge: 'Notification',
                timestamp: Date.now()
              });
            }
          }
        }
      } catch {
        // Silent
      }
    } else {
      // Visitor: show live platform recruitment alert
      try {
        const pubRes = await API.get('/public-alerts');
        if (pubRes && pubRes.data) {
          const items = [...(pubRes.data.jobAlerts || []), ...(pubRes.data.announcements || [])];
          if (items.length > 0) {
            // Pick an item that hasn't been shown yet
            const unshown = items.find((it: any) => !lastShownIds.has(it.id));
            if (unshown) {
              setLastShownIds(prev => new Set(prev).add(unshown.id));
              pushToast({
                id: unshown.id,
                title: unshown.title,
                message: unshown.message,
                type: unshown.type || 'INFO',
                link: unshown.link || '/jobs',
                badge: unshown.badge || 'En Direct',
                timestamp: Date.now()
              });
            }
          }
        }
      } catch {
        // Silent
      }
    }
  }, [lastShownIds]);

  const pushToast = (toast: ToastAlert) => {
    setActiveToasts(prev => {
      // Keep max 2 simultaneous toasts
      const filtered = prev.filter(t => t.id !== toast.id);
      return [toast, ...filtered].slice(0, 2);
    });

    // Auto dismiss after 8 seconds
    setTimeout(() => {
      dismissToast(toast.id);
    }, 8000);
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    // Initial check after 2 seconds
    const initialTimer = setTimeout(() => {
      checkForAlerts();
    }, 2000);

    // Periodic check every 30 seconds
    const interval = setInterval(checkForAlerts, 30000);
    const unsubscribe = subscribeAuthChanged(() => {
      checkForAlerts();
    });

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
      unsubscribe();
    };
  }, [checkForAlerts]);

  const getIcon = (type?: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      default:
        return <Bell className="w-5 h-5 text-orange-600 shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-3 sm:px-0">
      <AnimatePresence>
        {activeToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.25 }}
            className="pointer-events-auto bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-4 relative overflow-hidden backdrop-blur-sm"
          >
            {/* Top color indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500" />

            <div className="flex items-start gap-3 mt-1">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-600">
                {getIcon(toast.type)}
              </div>

              <div className="flex-1 min-w-0 pr-6">
                <div className="flex items-center gap-1.5 mb-1">
                  {toast.badge && (
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded">
                      {toast.badge}
                    </span>
                  )}
                  <span className="text-[11px] text-slate-400">À l'instant</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                  {toast.title}
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                  {toast.message}
                </p>

                {toast.link && (
                  <Link
                    to={toast.link}
                    onClick={() => dismissToast(toast.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 hover:underline"
                  >
                    Consulter <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>

              <button
                onClick={() => dismissToast(toast.id)}
                className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                aria-label="Fermer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
