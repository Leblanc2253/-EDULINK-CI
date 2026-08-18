import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, ExternalLink, Info, AlertTriangle, CheckCircle2, Sparkles, Building2, UserPlus, LogIn, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { subscribeAuthChanged } from '../utils/auth';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  badge?: string;
  isRead?: boolean;
  createdAt: string;
}

interface PublicAlertsResponse {
  totalActiveJobs: number;
  announcements: NotificationItem[];
  jobAlerts: NotificationItem[];
  tickerItems: string[];
}

export default function NotificationBell() {
  const [personalNotifications, setPersonalNotifications] = useState<NotificationItem[]>([]);
  const [publicAlerts, setPublicAlerts] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'PUBLIC'>('PERSONAL');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchAlerts = useCallback(async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('edulink_token') : null;
    const hasAuth = !!token;
    setIsLoggedIn(hasAuth);

    // Fetch public alerts for everyone (visitors + members)
    try {
      const pubRes = await API.get<PublicAlertsResponse>('/public-alerts');
      if (pubRes && pubRes.data) {
        const combined = [...(pubRes.data.announcements || []), ...(pubRes.data.jobAlerts || [])];
        setPublicAlerts(combined);
        if (!hasAuth) {
          // For visitor, unread count can represent active public alerts (e.g. top 3)
          setUnreadCount(combined.length);
          setActiveTab('PUBLIC');
        }
      }
    } catch {
      // Gracefully handle network blips
    }

    // If logged in, fetch personal notifications
    if (hasAuth) {
      try {
        const res = await API.get('/notifications');
        if (res && res.data) {
          setPersonalNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
          setActiveTab('PERSONAL');
        }
      } catch {
        // Silent recovery
      }
    } else {
      setPersonalNotifications([]);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
    const unsubscribe = subscribeAuthChanged(() => {
      fetchAlerts();
    });
    // Poll alerts & notifications every 25 seconds
    const interval = setInterval(fetchAlerts, 25000);
    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, [fetchAlerts]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isLoggedIn) return;
    try {
      await API.patch(`/notifications/${id}/read`);
      setPersonalNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {
      // Silent error
    }
  };

  const markAllAsRead = async () => {
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }
    try {
      setLoading(true);
      await API.post('/notifications/mark-all-read');
      setPersonalNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silent error
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-orange-600 shrink-0" />;
    }
  };

  const currentList = isLoggedIn 
    ? (activeTab === 'PERSONAL' ? personalNotifications : publicAlerts)
    : publicAlerts;

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchAlerts();
        }}
        className={`relative p-2 rounded-xl transition flex items-center justify-center ${
          isOpen 
            ? 'bg-orange-100 text-orange-700' 
            : 'text-slate-600 hover:text-orange-600 hover:bg-slate-100'
        }`}
        title={isLoggedIn ? "Notifications & Alertes" : "Alertes & Recrutements en Direct"}
        aria-label="Notifications et Alertes"
      >
        <Bell className="w-5 h-5" />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-extrabold text-white shadow-md ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="px-4 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="font-bold text-slate-800 text-sm">
                  {isLoggedIn ? 'Centre d\'Alertes' : 'Alertes & Actualités EDULINK'}
                </h3>
              </div>
              {isLoggedIn && unreadCount > 0 && activeTab === 'PERSONAL' && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 hover:underline"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Tout marquer lu
                </button>
              )}
            </div>

            {/* Tabs for logged-in users */}
            {isLoggedIn ? (
              <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('PERSONAL')}
                  className={`flex-1 py-1 px-2 rounded-md transition ${
                    activeTab === 'PERSONAL' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mes Alertes {personalNotifications.filter(n => !n.isRead).length > 0 && `(${personalNotifications.filter(n => !n.isRead).length})`}
                </button>
                <button
                  onClick={() => setActiveTab('PUBLIC')}
                  className={`flex-1 py-1 px-2 rounded-md transition ${
                    activeTab === 'PUBLIC' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Flux En Direct ({publicAlerts.length})
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                Dernières annonces de recrutement et offres récentes en Côte d'Ivoire 🇨🇮
              </p>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto divide-y divide-slate-100">
            {currentList.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-sm">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                Aucune alerte récente.
              </div>
            ) : (
              currentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    if (isLoggedIn && item.isRead === false) markAsRead(item.id);
                  }}
                  className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer ${
                    isLoggedIn && item.isRead === false ? 'bg-orange-50/50' : ''
                  }`}
                >
                  <div className="mt-0.5">{getIcon(item.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <p className={`text-xs ${isLoggedIn && item.isRead === false ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {item.title}
                      </p>
                      {item.badge ? (
                        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded shrink-0">
                          {item.badge}
                        </span>
                      ) : (
                        isLoggedIn && item.isRead === false && (
                          <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" title="Non lu"></span>
                        )
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed break-words line-clamp-3">
                      {item.message}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span>{item.createdAt ? new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Récent'}</span>
                      {item.link && (
                        <Link
                          to={item.link}
                          onClick={() => setIsOpen(false)}
                          className="text-orange-600 font-semibold hover:underline flex items-center gap-0.5"
                        >
                          Consulter <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Visitor CTA footer */}
          {!isLoggedIn && (
            <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-slate-600 font-medium">Recevez vos alertes personnalisées</span>
                <Link
                  to="/register"
                  onClick={() => setIsOpen(false)}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition"
                >
                  S'inscrire <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
