import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import Header from '../components/Header';
import API from '../services/api';
import { 
  ArrowRight, 
  BookOpen, 
  Calculator, 
  FlaskConical, 
  Globe2, 
  Dna, 
  Landmark, 
  Activity,
  GraduationCap,
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  Sparkles,
  Award,
  Search,
  Bell,
  Megaphone,
  Clock,
  MapPin,
  ChevronRight,
  Laptop,
  Shield,
  Receipt,
  UserCheck,
  FolderArchive
} from 'lucide-react';
import RegionCircoPicker from '../components/RegionCircoPicker';

const DISCIPLINES = [
  { name: 'Mathématiques', icon: Calculator },
  { name: 'Physique-Chimie', icon: FlaskConical },
  { name: 'Français', icon: BookOpen },
  { name: 'Anglais', icon: Globe2 },
  { name: 'Éducateur / Éducatrice', icon: UserCheck },
  { name: 'Correspondant Fichier / TICE', icon: FolderArchive },
  { name: 'Caissière / Économe', icon: Receipt },
  { name: 'Portier / Sécurité', icon: Shield },
  { name: 'Philosophie', icon: Landmark },
  { name: 'SVT', icon: Dna },
  { name: 'Histoire-Géo', icon: Globe2 },
  { name: 'EPS', icon: Activity },
];

const FEATURES = [
  {
    title: "100% Cœur de Métier",
    description: "Une plateforme dédiée exclusivement à l'éducation en Côte d'Ivoire. De la maternelle au supérieur (CAPES, CAFOP, vacations).",
    icon: GraduationCap,
  },
  {
    title: "Lien Direct & Rapide",
    description: "Zéro intermédiaire. Postulez en un clic et échangez directement avec les directeurs d'établissements et proviseurs.",
    icon: Users,
  },
  {
    title: "Toutes les Villes de CI",
    description: "Des opportunités à Abidjan (Cocody, Yopougon, Plateau...), Bouaké, Yamoussoukro, San-Pédro, Korhogo et partout en Côte d'Ivoire.",
    icon: Building2,
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [publicAlerts, setPublicAlerts] = useState<any[]>([]);
  const [totalJobs, setTotalJobs] = useState<number>(0);
  const [selectedHomeCity, setSelectedHomeCity] = useState<string>('');

  useEffect(() => {
    API.get('/public-alerts')
      .then(res => {
        if (res.data) {
          const items = [...(res.data.announcements || []), ...(res.data.jobAlerts || [])];
          setPublicAlerts(items);
          setTotalJobs(res.data.totalActiveJobs || 0);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-200 selection:text-orange-900">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Hero Section with Split Layout & High-Quality Photo */}
        <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-24 overflow-hidden px-4 sm:px-6 bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column: Headline & Action */}
              <div className="lg:col-span-7 text-left">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-4 py-2 rounded-full mb-6 border border-orange-200/60 shadow-xs">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                    </span>
                    N°1 du Recrutement Éducatif en Côte d'Ivoire
                  </div>
                </motion.div>

                <motion.h1 
                  className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                >
                  Recrutez l'excellence.<br />
                  <span className="text-orange-600">Trouvez votre poste idéal.</span>
                </motion.h1>

                <motion.p 
                  className="text-base sm:text-lg text-slate-600 max-w-xl mb-8 leading-relaxed font-normal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                >
                  EDULINK CI connecte en direct les établissements scolaires d'excellence 
                  (maternelles, primaires, collèges, lycées) avec les meilleurs enseignants et éducateurs ivoiriens.
                </motion.p>

                <motion.div 
                  className="space-y-3 mb-10"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.3 }}
                >
                  {/* Quick regional search bar */}
                  <div className="bg-white p-2.5 rounded-2xl shadow-lg border border-orange-100 flex flex-col sm:flex-row items-center gap-2">
                    <div className="flex-1 w-full">
                      <RegionCircoPicker
                        value={selectedHomeCity}
                        onChange={(loc) => setSelectedHomeCity(loc)}
                        placeholder="Rechercher par région, circonscription ou ville (ex: Gbêkê, Bouaké, Cocody)..."
                        showAllOption={true}
                        allOptionLabel="Toute la Côte d'Ivoire (Toutes les régions)"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (selectedHomeCity) {
                          navigate(`/jobs?city=${encodeURIComponent(selectedHomeCity)}`);
                        } else {
                          navigate('/jobs');
                        }
                      }}
                      className="w-full sm:w-auto shrink-0 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-md transition-all text-sm"
                    >
                      <Search className="w-4 h-4" />
                      Trouver un poste
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-1">
                    <Link
                      to="/jobs"
                      className="text-xs font-semibold text-slate-600 hover:text-orange-600 flex items-center gap-1 transition"
                    >
                      <span>🔥 Consulter toutes les offres en direct ({totalJobs})</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <Link
                      to="/register"
                      className="text-xs font-semibold text-orange-600 hover:underline flex items-center gap-1 transition"
                    >
                      <span>✨ Déposer mon profil d'enseignant certifié</span>
                    </Link>
                  </div>
                </motion.div>

                {/* Trust Metrics */}
                <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">500+</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Offres d'emploi</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-orange-600">100%</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Spécialisé Éducation</div>
                  </div>
                  <div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900">Direct</div>
                    <div className="text-xs sm:text-sm text-slate-500 font-medium">Sans intermédiaire</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Dynamic Visual Showcase */}
              <motion.div 
                className="lg:col-span-5 relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
              >
                <div className="relative mx-auto max-w-md lg:max-w-none">
                  {/* Decorative backdrop glow */}
                  <div className="absolute -inset-2 bg-gradient-to-r from-orange-400/20 to-amber-300/20 rounded-3xl blur-xl opacity-70"></div>
                  
                  {/* Main Hero Photo */}
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-900 aspect-4/3 sm:aspect-5/4 group">
                    <img 
                      src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1200&q=85" 
                      alt="Enseignante en situation de classe avec des élèves en Côte d'Ivoire" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-center transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
                    
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <div className="inline-flex items-center gap-1.5 bg-orange-600/95 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-full mb-1.5 shadow-sm">
                        <Sparkles className="w-3 h-3" />
                        Situation de classe en Côte d'Ivoire
                      </div>
                      <p className="text-sm sm:text-base font-bold leading-snug text-white">
                        L'excellence pédagogique au cœur des salles de classe ivoiriennes
                      </p>
                    </div>
                  </div>

                  {/* Floating Badge 1: Recrutement vérifié */}
                  <motion.div 
                    className="absolute -top-4 -left-4 sm:-left-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Candidature Acceptée</div>
                      <div className="text-[11px] font-medium text-slate-500">Lycée Moderne d'Abidjan</div>
                    </div>
                  </motion.div>

                  {/* Floating Badge 2: Profil Enseignant Certifié */}
                  <motion.div 
                    className="absolute -bottom-5 -right-4 sm:-right-6 bg-white p-3.5 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                      <Award className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-900">Profils Enseignants Certifiés</div>
                      <div className="text-[11px] font-medium text-slate-500">Maths, Français, Sciences...</div>
                    </div>
                  </motion.div>

                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Dual Gateways: Enseignants vs Recruteurs (With Distinct Visual Styles and Features) */}
        <section className="py-16 sm:py-24 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Deux Passerelles Dédiées
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
                Choisissez votre Passerelle d'Accès
              </h2>
              <p className="text-slate-600 text-base sm:text-lg">
                Une expérience sur-mesure conçue pour les candidats d'un côté, et les directeurs d'établissements de l'autre.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Gateway 1: Candidats / Enseignants */}
              <motion.div 
                className="bg-orange-50/40 rounded-3xl border-2 border-orange-200/80 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-800">
                  <img 
                    src="https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&w=800&q=80" 
                    alt="Professeur et candidate en Côte d'Ivoire" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="bg-orange-600 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-flex items-center gap-1.5 shadow-md">
                      <GraduationCap className="w-3.5 h-3.5" /> Passerelle Postulants & Enseignants
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">Vous cherchez un poste d'enseignant ?</h3>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-white">
                  <div className="space-y-4 mb-8 text-sm sm:text-base text-slate-700">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <span><strong>Création de profil certifié :</strong> Déposez votre CV (PDF/Word), indiquez votre matière, diplôme et ville de disponibilité.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <span><strong>Candidature en 1 clic :</strong> Postulez sans lettre manuscrite inutile et suivez l'évolution de vos dossiers en temps réel.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <span><strong>Alertes SMS & WhatsApp :</strong> Soyez prévenu dès qu'un collège, lycée ou groupe scolaire recrute dans votre discipline.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/register?role=CANDIDATE"
                      className="flex-1 flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md"
                    >
                      <span>Entrer comme Candidat</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/jobs"
                      className="flex items-center justify-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-5 rounded-xl transition text-sm"
                    >
                      <span>Voir les Offres</span>
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Gateway 2: Établissements / Recruteurs */}
              <motion.div 
                className="bg-slate-900 rounded-3xl border-2 border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col text-white"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative h-60 sm:h-64 overflow-hidden bg-slate-800">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80" 
                    alt="Direction et encadrement pédagogique en Côte d'Ivoire" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                  <div className="absolute bottom-4 left-6 right-6 text-white">
                    <span className="bg-emerald-500 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider mb-2 inline-flex items-center gap-1.5 shadow-md">
                      <Building2 className="w-3.5 h-3.5" /> Passerelle Établissements & Recruteurs
                    </span>
                    <h3 className="text-2xl sm:text-3xl font-black text-white">Vous dirigez une École ou un Groupe Scolaire ?</h3>
                  </div>
                </div>

                <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between bg-slate-950">
                  <div className="space-y-4 mb-8 text-sm sm:text-base text-slate-300">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Publication d'offres en 2 min :</strong> Diffusez vos besoins en CDI, CDD ou vacations auprès de tous les enseignants qualifiés.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Accès direct à la CVthèque nationale :</strong> Filtrez les professeurs disponibles à Abidjan et à l'intérieur par matière et diplôme.</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      <span><strong>Convocations SMS instantanées :</strong> Planifiez vos entretiens et exportez vos fiches de commissions d'embauche en PDF/Excel.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to="/register?role=RECRUITER"
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-3.5 px-6 rounded-xl transition shadow-lg"
                    >
                      <span>Entrer comme Recruteur</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      to="/recruiter"
                      className="flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-5 rounded-xl transition text-sm border border-slate-700"
                    >
                      <span>Espace Écoles</span>
                    </Link>
                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Live Alerts & Real-time Recruitment Ticker Section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-slate-900 via-slate-850 to-slate-900 text-white relative overflow-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-orange-600/30 text-orange-400 border border-orange-500/40 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-ping"></span>
                  Centre d'Alertes & Flux en Direct
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Alertes & Opportunités Récentes en Côte d'Ivoire
                </h2>
                <p className="text-slate-400 text-sm sm:text-base mt-1">
                  Tous les visiteurs (recruteurs, postulants, enseignants) sont informés en temps réel.
                </p>
              </div>

              <Link
                to="/jobs"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-orange-400 hover:text-orange-300 hover:underline"
              >
                Voir toutes les offres disponibles ({totalJobs}) <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Grid of Alert Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {publicAlerts.slice(0, 3).map((alert, i) => (
                <motion.div
                  key={alert.id || i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="bg-slate-800/80 border border-slate-700/80 hover:border-orange-500/60 rounded-2xl p-5 flex flex-col justify-between transition-all hover:bg-slate-800/95 group shadow-lg"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded">
                        {alert.badge || 'Alerte'}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> En direct
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-orange-300 transition-colors">
                      {alert.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {alert.message}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Côte d'Ivoire 🇨🇮</span>
                    {alert.link && (
                      <Link
                        to={alert.link}
                        className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 hover:text-white transition"
                      >
                        Consulter <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Quick Alert Preference Box */}
            <div className="mt-8 p-4 sm:p-6 bg-slate-800/50 border border-slate-700/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shrink-0">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    Vous souhaitez recevoir les alertes instantanées par SMS & Email ?
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-400">
                    Créez votre profil en 1 minute et sélectionnez vos disciplines et villes favorites.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                <Link
                  to="/register"
                  className="w-full sm:w-auto text-center text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl transition shadow-md"
                >
                  Activer mes alertes gratuites
                </Link>
              </div>
            </div>

          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 sm:py-24 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Disciplines les plus recherchées</h2>
                <p className="text-slate-500 max-w-xl text-base sm:text-lg">Parcourez les offres par matière et trouvez l'établissement qui correspond à votre expertise.</p>
              </div>
              <Link to="/jobs" className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 group whitespace-nowrap">
                Voir toutes les disciplines
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {DISCIPLINES.map((discipline, idx) => {
                const Icon = discipline.icon;
                return (
                  <motion.div
                    key={discipline.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: idx * 0.05 }}
                  >
                    <Link 
                      to={`/jobs?discipline=${encodeURIComponent(discipline.name)}`}
                      className="group flex flex-col p-6 bg-white border border-slate-200 hover:border-orange-300 hover:bg-orange-50/40 rounded-2xl transition-all shadow-xs h-full"
                    >
                      <div className="w-12 h-12 bg-orange-50 rounded-xl shadow-xs border border-orange-100 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-orange-600 transition-all">
                        <Icon className="w-6 h-6 text-orange-600 group-hover:text-white transition-colors" />
                      </div>
                      <h3 className="font-bold text-slate-900 group-hover:text-orange-900 mb-1">{discipline.name}</h3>
                      <p className="text-sm text-slate-500 group-hover:text-orange-700/80 mt-auto pt-3 flex items-center gap-1 font-medium">
                        Voir les offres <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                      </p>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Photographic Showcase: Situations de Classe en Côte d'Ivoire */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-3">
                  <Sparkles className="w-3.5 h-3.5" />
                  Immersion Pédagogique
                </div>
                <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Au cœur des classes de Côte d'Ivoire</h2>
                <p className="text-slate-500 max-w-2xl text-base sm:text-lg">
                  Découvrez l'énergie, l'engagement et l'excellence des enseignants et élèves dans les écoles primaires, collèges et lycées ivoiriens.
                </p>
              </div>
              <Link 
                to="/jobs" 
                className="text-orange-600 font-bold hover:text-orange-700 flex items-center gap-1 group whitespace-nowrap bg-orange-50 hover:bg-orange-100/80 px-4 py-2.5 rounded-xl border border-orange-200 transition-all text-sm"
              >
                Rejoindre une classe
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Photo Card 1: Cours magistral & Interaction */}
              <motion.div 
                className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 flex flex-col h-96"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80" 
                  alt="Enseignante animant un cours devant le tableau noir en Côte d'Ivoire" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="bg-orange-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                    Secondaire & Lycée
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1">Transmission & Maîtrise des Savoirs</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    Cours de mathématiques et de sciences dispensés avec rigueur et bienveillance dans les lycées d'Abidjan et de l'intérieur.
                  </p>
                </div>
              </motion.div>

              {/* Photo Card 2: Travail collaboratif & Éveil */}
              <motion.div 
                className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 flex flex-col h-96"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=800&q=80" 
                  alt="Élèves ivoiriens attentifs et concentrés en salle de classe" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="bg-amber-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                    Primaire & Éveil
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1">Concentration & Réussite Scolaire</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    Un encadrement de proximité pour bâtir les fondations du calcul, de la lecture et du développement personnel.
                  </p>
                </div>
              </motion.div>

              {/* Photo Card 3: Échange et Soutien Pédagogique */}
              <motion.div 
                className="group relative rounded-3xl overflow-hidden shadow-md border border-slate-200 bg-slate-900 flex flex-col h-96"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80" 
                  alt="Accompagnement pédagogique et interaction en classe" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <span className="bg-emerald-600/90 text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider mb-2 inline-block">
                    Pédagogie Active
                  </span>
                  <h3 className="text-lg font-bold text-white mb-1">Suivi Personnalisé des Élèves</h3>
                  <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                    Des professeurs passionnés qui accompagnent chaque apprenant vers l'excellence aux examens (CEPE, BEPC, BAC).
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features / Value Proposition */}
        <section className="py-16 sm:py-24 bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Pourquoi choisir EDULINK CI ?</h2>
              <p className="text-slate-500 text-base sm:text-lg">La plateforme pensée par et pour les acteurs du système éducatif ivoirien.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {FEATURES.map((feature, idx) => {
                const Icon = feature.icon;
                return (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="bg-slate-50 p-8 rounded-3xl border border-slate-200/80 shadow-xs hover:border-orange-200 transition-colors"
                  >
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7 text-orange-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                    <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Call to Action Banner with Education Background */}
        <section className="relative py-16 sm:py-24 overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1600&q=80" 
              alt="Enseignants et élèves en Côte d'Ivoire" 
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-slate-950/80"></div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center z-10">
            <h2 className="text-3xl sm:text-5xl font-black mb-6 tracking-tight">
              Prêt à transformer l'éducation en Côte d'Ivoire ?
            </h2>
            <p className="text-slate-300 text-base sm:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Rejoignez dès aujourd'hui des centaines d'enseignants passionnés et d'établissements engagés pour l'excellence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg transition"
              >
                Créer un compte gratuitement
              </Link>
              <Link
                to="/jobs"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold py-4 px-8 rounded-xl transition"
              >
                Consulter les offres disponibles
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="font-black text-xl tracking-tight text-slate-900 mb-2">EDULINK CI</div>
            <p className="text-sm text-slate-500">
              L'excellence éducative au service de la Côte d'Ivoire.
            </p>
          </div>
          <div className="text-sm text-slate-400 font-medium">
            © {new Date().getFullYear()} EDULINK CI. Tous droits réservés.
          </div>
        </div>
      </footer>
    </div>
  );
}

