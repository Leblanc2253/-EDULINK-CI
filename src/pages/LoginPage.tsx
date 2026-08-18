import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import API from '../services/api';
import { setAuthToken } from '../utils/auth';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');
  const [activeGateway, setActiveGateway] = useState<'CANDIDATE' | 'RECRUITER'>(
    roleParam === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE'
  );

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (roleParam === 'RECRUITER') {
      setActiveGateway('RECRUITER');
    } else if (roleParam === 'CANDIDATE') {
      setActiveGateway('CANDIDATE');
    }
  }, [roleParam]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const cleanEmail = email.trim();
      const res = await API.post('/auth/login', { email: cleanEmail, password });
      setAuthToken(res.data.accessToken);
      
      const returnUrl = searchParams.get('return_url');
      
      if (returnUrl) {
        navigate(returnUrl);
      } else if (res.data.user.role === 'RECRUITER' || res.data.user.role === 'ADMIN') {
        navigate('/recruiter');
      } else {
        navigate('/jobs');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion. Veuillez vérifier vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center font-sans p-4 py-12">
      
      {/* Brand Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-1.5 text-3xl font-black text-orange-600 tracking-tight">
          EDULINK <span className="text-slate-800">CI</span>
        </Link>
        <p className="text-slate-500 text-sm mt-1">
          Connexion sécurisée aux Espaces Professionnels
        </p>
      </div>

      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-xl border border-slate-200/90 max-w-md w-full">
        
        {/* Gateway Selection Tabs */}
        <div className="mb-6">
          <label className="block text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Choisissez votre espace de connexion
          </label>
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            <button
              type="button"
              onClick={() => { setActiveGateway('CANDIDATE'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                activeGateway === 'CANDIDATE'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Postulant</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveGateway('RECRUITER'); setError(''); }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold text-xs transition-all ${
                activeGateway === 'RECRUITER'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-emerald-400" />
              <span>Recruteur</span>
            </button>
          </div>
        </div>

        {/* Portal Notice */}
        {activeGateway === 'CANDIDATE' ? (
          <div className="mb-6 p-3.5 rounded-xl bg-orange-50/80 border border-orange-100 text-xs text-orange-900">
            <div className="font-bold flex items-center gap-1.5 mb-0.5 text-orange-800">
              <Sparkles className="w-3.5 h-3.5 text-orange-600" /> Espace Postulant & Enseignant
            </div>
            Accédez à vos candidatures, notifications de recrutement et alertes SMS.
          </div>
        ) : (
          <div className="mb-6 p-3.5 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 text-xs">
            <div className="font-bold flex items-center gap-1.5 mb-0.5 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Espace Établissement Scolaire
            </div>
            Gérez vos offres publiées, vos convocations et explorez la CVthèque.
          </div>
        )}

        {error && (
          <div className="mb-4 bg-red-50 text-red-700 text-xs sm:text-sm p-3.5 rounded-xl border border-red-200 flex items-start gap-2">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Email {activeGateway === 'RECRUITER' ? 'Professionnel' : 'Personnel'}
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-slate-300 p-2.5 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm transition"
              placeholder={activeGateway === 'RECRUITER' ? 'direction@ecole.ci' : 'votre@email.com'}
              autoComplete="email"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Mot de passe
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-slate-300 p-2.5 pr-10 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none text-sm transition"
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                aria-label="Afficher le mot de passe"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full text-white font-bold py-3.5 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-2 shadow-md ${
              activeGateway === 'CANDIDATE'
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
            } disabled:opacity-70`}
          >
            {loading ? (
              <span>Connexion en cours...</span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>
                  Se connecter ({activeGateway === 'CANDIDATE' ? 'Postulant' : 'Recruteur'})
                </span>
              </>
            )}
          </button>
        </form>

        {/* Register switcher */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Pas encore de compte ?{' '}
          <Link 
            to={`/register?role=${activeGateway}`} 
            className="text-orange-600 font-bold hover:text-orange-700 hover:underline inline-flex items-center gap-1"
          >
            Créer un compte {activeGateway === 'CANDIDATE' ? 'Candidat' : 'Établissement'} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
