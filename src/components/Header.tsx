import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  Sparkles, 
  Megaphone, 
  ArrowRight, 
  ShieldCheck, 
  ChevronRight, 
  GraduationCap, 
  Building2, 
  User 
} from 'lucide-react';
import API from '../services/api';
import NotificationBell from './NotificationBell';
import { removeAuthToken, subscribeAuthChanged } from '../utils/auth';
import { getGenderAdaptedAvatar } from '../utils/avatar';

export default function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [publicTicker, setPublicTicker] = useState<string[]>([
    "📢 Campagne de Recrutement 2026 ouverte en Côte d'Ivoire",
    "🏫 Établissements d'Abidjan, Bouaké et Yamoussoukro recrutent",
    "⚡ Postulez directement en 1 clic sans intermédiaire",
    "🔔 Alertes SMS & Email en temps réel"
  ]);
  const [currentTickerIdx, setCurrentTickerIdx] = useState(0);
  const [isTickerDismissed, setIsTickerDismissed] = useState(false);

  const fetchUserProfile = useCallback(() => {
    const token = localStorage.getItem('edulink_token');
    if (token) {
      API.get('/auth/profile')
        .then(res => setUser(res.data))
        .catch(() => {
          removeAuthToken();
          setUser(null);
        });
    } else {
      setUser(null);
    }
  }, []);

  const fetchTicker = useCallback(async () => {
    try {
      const res = await API.get('/public-alerts');
      if (res && res.data && res.data.tickerItems && res.data.tickerItems.length > 0) {
        setPublicTicker(res.data.tickerItems);
      }
    } catch {
      // Default ticker fallback
    }
  }, []);

  useEffect(() => {
    fetchUserProfile();
    fetchTicker();
    const unsubscribe = subscribeAuthChanged(() => {
      fetchUserProfile();
    });
    return () => unsubscribe();
  }, [fetchUserProfile, fetchTicker]);

  // Rotate ticker messages smoothly
  useEffect(() => {
    if (publicTicker.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentTickerIdx((prev) => (prev + 1) % publicTicker.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [publicTicker]);

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    navigate('/');
  };

  return (
    <header className="border-b bg-white relative z-40">
      {/* Live top alert bar for ALL visitors & members */}
      {!isTickerDismissed && (
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-slate-100 text-xs py-2 px-4 border-b border-slate-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
            
            {/* Live Indicator & Rotating Alert */}
            <div className="flex items-center gap-2.5 font-medium overflow-hidden">
              <span className="flex items-center gap-1 bg-orange-600 text-white text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                Alerte
              </span>

              <div className="flex items-center gap-2 truncate">
                <span className="text-slate-100 font-semibold text-xs sm:text-[13px] truncate">
                  {publicTicker[currentTickerIdx]}
                </span>
              </div>
            </div>

            {/* Quick Action CTA */}
            <div className="flex items-center gap-3 shrink-0">
              <Link 
                to="/jobs" 
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-orange-300 transition"
              >
                Explorer les offres <ChevronRight className="w-3.5 h-3.5" />
              </Link>
              
              <button
                onClick={() => setIsTickerDismissed(true)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
                title="Masquer le bandeau"
                aria-label="Fermer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Main Navigation Header */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tag */}
        <div className="flex items-center gap-3">
          <Link to="/" className="text-2xl font-black text-orange-600 tracking-tight flex items-center gap-1">
            EDULINK <span className="text-slate-800">CI</span>
          </Link>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-[11px] font-semibold">
            Portail Éducation CI
          </div>
        </div>
        
        {/* Desktop Navigation Links */}
        <div className="hidden sm:flex items-center gap-3 sm:gap-5">
          
          {/* Candidates Gateway Link */}
          <Link 
            to="/jobs" 
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-orange-600 transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-orange-600" />
            <span>Passerelle Postulants</span>
          </Link>

          {/* Recruiters Gateway Link */}
          <Link 
            to="/recruiter" 
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-all"
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Passerelle Recruteurs</span>
          </Link>
          
          {/* Universal Notification Bell */}
          <NotificationBell />

          {user ? (
            <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200">
              {user.role === 'ADMIN' && (
                <Link to="/admin" className="text-xs font-bold text-red-600 hover:text-red-700 transition-colors bg-red-50 px-2 py-1 rounded-lg">
                  Admin
                </Link>
              )}

              {user.role === 'RECRUITER' || user.role === 'ADMIN' ? (
                <Link to="/recruiter" className="flex items-center gap-2 hover:opacity-85 transition">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-emerald-400 font-bold flex items-center justify-center text-xs">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="text-left max-w-[120px] truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.candidate?.fullName || 'Établissement'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">Recruteur</div>
                  </div>
                </Link>
              ) : (
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-85 transition">
                  <img 
                    src={getGenderAdaptedAvatar(user.candidate?.fullName || user.email, user.candidate?.avatarUrl)} 
                    alt="Avatar" 
                    className="w-8 h-8 rounded-full object-cover border border-slate-200" 
                  />
                  <div className="text-left max-w-[120px] truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {user.candidate?.fullName || user.email}
                    </div>
                    <div className="text-[10px] text-orange-600 font-semibold">Postulant</div>
                  </div>
                </Link>
              )}

              <button 
                onClick={handleLogout}
                className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-colors ml-1"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-bold text-slate-700 hover:text-slate-900 px-3 py-2 transition"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-xl transition shadow-xs"
              >
                S'inscrire
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu and Notification Bell */}
        <div className="sm:hidden flex items-center gap-2">
          {/* Notification bell visible directly in top bar on mobile */}
          <NotificationBell />

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
            className="text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            aria-label="Menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {isMobileMenuOpen && (
        <div className="sm:hidden absolute top-full left-0 w-full bg-white border-b shadow-2xl z-50 flex flex-col p-4 gap-3 animate-in fade-in slide-in-from-top-2">
          
          <div className="p-2 bg-slate-50 rounded-2xl space-y-1">
            <Link 
              to="/jobs" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-2 p-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-orange-50 hover:text-orange-600 transition"
            >
              <GraduationCap className="w-5 h-5 text-orange-600" />
              <span>Passerelle Postulants / Offres</span>
            </Link>

            <Link 
              to="/recruiter" 
              onClick={() => setIsMobileMenuOpen(false)} 
              className="flex items-center gap-2 p-2.5 rounded-xl font-bold text-sm text-slate-800 hover:bg-slate-200 transition"
            >
              <Building2 className="w-5 h-5 text-emerald-600" />
              <span>Passerelle Établissements & Recruteurs</span>
            </Link>
          </div>
          
          {user ? (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2.5">
              {user.role === 'ADMIN' && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-red-600 hover:text-red-700 py-1">
                  Administration
                </Link>
              )}
              {user.role === 'RECRUITER' || user.role === 'ADMIN' ? (
                <Link to="/recruiter" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-800 py-1">
                  Mon Espace Recruteur
                </Link>
              ) : (
                <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-bold text-slate-800 py-1">
                  Mon Profil Enseignant
                </Link>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                  {user.candidate?.fullName || user.email}
                </span>
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                  className="text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                >
                  Déconnexion
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm font-bold text-slate-800 hover:text-orange-600 py-2.5 text-center border border-slate-200 rounded-xl"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-sm text-center font-bold bg-orange-600 hover:bg-orange-700 text-white py-2.5 rounded-xl shadow-xs"
                >
                  S'inscrire
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
