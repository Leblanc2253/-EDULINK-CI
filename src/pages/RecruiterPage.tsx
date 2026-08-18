import { useState, useEffect, useCallback } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Edit, 
  Trash2, 
  PlusCircle, 
  Briefcase, 
  Users, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Phone, 
  Mail, 
  MapPin, 
  FileText,
  Filter,
  Search,
  Download,
  Printer,
  Building2,
  GraduationCap,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  Send,
  Calendar,
  Layers,
  ChevronRight,
  MessageSquare
} from 'lucide-react';
import API from '../services/api';
import { exportToCSV, exportToPrintPDF } from '../utils/exportUtils';
import { subscribeAuthChanged } from '../utils/auth';
import { getGenderAdaptedAvatar } from '../utils/avatar';
import RegionCircoPicker from '../components/RegionCircoPicker';
import CascadingLocationSelect from '../components/CascadingLocationSelect';
import ContactCandidateModal from '../components/ContactCandidateModal';

const CITIES = [
  'Abidjan',
  'Abidjan - Cocody',
  'Abidjan - Yopougon',
  'Abidjan - Plateau',
  'Abidjan - Marcory',
  'Abidjan - Koumassi',
  'Bouaké',
  'Yamoussoukro',
  'San-Pédro',
  'Daloa',
  'Korhogo',
  'Man',
  'Gagnoa'
];

export default function RecruiterPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'POST' | 'JOBS' | 'APPLICATIONS' | 'CVTHEQUE'>('POST');
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [myJobs, setMyJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(false);

  // CVtheque state
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [candidateSearch, setCandidateSearch] = useState('');
  const [candidateDisciplineFilter, setCandidateDisciplineFilter] = useState('ALL');
  const [candidateCityFilter, setCandidateCityFilter] = useState('ALL');
  const [candidateLevelFilter, setCandidateLevelFilter] = useState('ALL');

  // Filters for applications tab
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [appSearchQuery, setAppSearchQuery] = useState<string>('');

  // Contact Modal State
  const [contactTarget, setContactTarget] = useState<{
    name: string;
    email?: string;
    phone?: string;
    id?: string;
    tab: 'EMAIL' | 'CALL';
    contextTitle?: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    schoolName: '',
    description: '',
    discipline: '',
    level: '',
    city: 'Abidjan',
    salaryRange: '',
    contractType: 'CDD'
  });

  const checkAuth = useCallback(() => {
    const token = localStorage.getItem('edulink_token');
    if (!token) {
      setLoading(false);
      setProfile(null);
      return;
    }

    API.get('/auth/profile')
      .then(res => {
        if (res.data.role === 'RECRUITER' || res.data.role === 'ADMIN') {
          setProfile(res.data);
          if (res.data.candidate?.fullName) {
            // Auto fill school name from recruiter profile if available
            setFormData(prev => ({
              ...prev,
              schoolName: prev.schoolName || res.data.candidate.fullName.split(' - ')[0]
            }));
          }
          fetchJobs();
        } else {
          setProfile(null);
        }
        setLoading(false);
      })
      .catch(() => {
        setProfile(null);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    checkAuth();
    const unsubscribe = subscribeAuthChanged(() => {
      checkAuth();
    });
    return () => unsubscribe();
  }, [checkAuth]);

  useEffect(() => {
    if (profile && activeTab === 'APPLICATIONS') {
      fetchApplications();
    }
    if (profile && activeTab === 'JOBS') {
      fetchJobs();
    }
    if (profile && activeTab === 'CVTHEQUE') {
      fetchCandidates();
    }
  }, [activeTab, profile]);

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await API.get('/recruiter/jobs');
      setMyJobs(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await API.get('/recruiter/applications');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const fetchCandidates = async () => {
    setLoadingCandidates(true);
    try {
      const res = await API.get('/recruiter/candidates');
      setCandidatesList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleEditJob = (job: any) => {
    setFormData({
      title: job.title,
      schoolName: job.schoolName,
      description: job.description,
      discipline: job.discipline,
      level: job.level,
      city: job.city,
      salaryRange: job.salaryRange || '',
      contractType: job.contractType
    });
    setEditingJobId(job.id);
    setActiveTab('POST');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingJobId(null);
    setFormData({
      title: '',
      schoolName: profile?.candidate?.fullName?.split(' - ')[0] || '',
      description: '',
      discipline: '',
      level: '',
      city: 'Abidjan',
      salaryRange: '',
      contractType: 'CDD'
    });
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.')) return;
    try {
      await API.delete(`/jobs/${jobId}`);
      setMyJobs(prev => prev.filter(j => j.id !== jobId));
      setFeedbackMsg({ type: 'success', text: "L'offre d'emploi a été supprimée avec succès." });
      if (editingJobId === jobId) {
        handleCancelEdit();
      }
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Erreur lors de la suppression de l'offre." });
    }
  };

  const updateStatus = async (appId: string, newStatus: string) => {
    let note = '';
    if (newStatus === 'INTERVIEW') {
      note = prompt('Message ou détails pour le candidat (ex: entretien le jeudi 20 à 10h à Cocody) :') || '';
    }

    try {
      await API.patch(`/applications/${appId}/status`, { status: newStatus, messageNote: note });
      setApplications(prev => prev.map(app => app.id === appId ? { ...app, status: newStatus } : app));
      setFeedbackMsg({ type: 'success', text: 'Statut mis à jour et alerte envoyée au candidat avec succès.' });
      setTimeout(() => setFeedbackMsg(null), 5000);
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: 'Erreur lors de la mise à jour du statut.' });
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsPosting(true);
    setFeedbackMsg(null);
    try {
      if (editingJobId) {
        await API.put(`/jobs/${editingJobId}`, formData);
        setFeedbackMsg({ type: 'success', text: "L'offre d'emploi a été mise à jour avec succès !" });
        setMyJobs(prev => prev.map(job => job.id === editingJobId ? { ...job, ...formData } : job));
        setEditingJobId(null);
      } else {
        await API.post('/jobs', formData);
        setFeedbackMsg({ type: 'success', text: "Votre offre a été publiée avec succès et est désormais accessible aux candidats !" });
        await fetchJobs();
      }
      setFormData({
        title: '',
        schoolName: formData.schoolName,
        description: '',
        discipline: '',
        level: '',
        city: 'Abidjan',
        salaryRange: '',
        contractType: 'CDD'
      });
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: "Erreur lors de l'enregistrement de l'offre." });
    } finally {
      setIsPosting(false);
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter(app => {
    const matchesJob = selectedJobFilter === 'ALL' || app.jobId === selectedJobFilter;
    const matchesStatus = selectedStatusFilter === 'ALL' || app.status === selectedStatusFilter;
    const matchesSearch = !appSearchQuery || 
      app.candidate?.fullName?.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.candidate?.discipline?.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.candidate?.city?.toLowerCase().includes(appSearchQuery.toLowerCase()) ||
      app.job?.title?.toLowerCase().includes(appSearchQuery.toLowerCase());
    return matchesJob && matchesStatus && matchesSearch;
  });

  // Filtered CVtheque candidates
  const filteredCandidates = candidatesList.filter(c => {
    const matchesSearch = !candidateSearch ||
      c.fullName?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.discipline?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.city?.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.bio?.toLowerCase().includes(candidateSearch.toLowerCase());
    const matchesDiscipline = candidateDisciplineFilter === 'ALL' || c.discipline?.toLowerCase().includes(candidateDisciplineFilter.toLowerCase());
    const matchesCity = candidateCityFilter === 'ALL' || !candidateCityFilter || 
      c.city?.toLowerCase().includes(candidateCityFilter.toLowerCase()) ||
      candidateCityFilter.toLowerCase().includes(c.city?.toLowerCase() || '');
    const matchesLevel = candidateLevelFilter === 'ALL' || c.level?.toLowerCase().includes(candidateLevelFilter.toLowerCase());
    return matchesSearch && matchesDiscipline && matchesCity && matchesLevel;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center text-slate-500 font-semibold">
          Chargement de l'Espace Recruteur...
        </div>
      </div>
    );
  }

  // =========================================================================
  // PUBLIC PRESENTATION FOR VISITORS / PROSPECTIVE RECRUITERS
  // =========================================================================
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-900 text-white font-sans flex flex-col selection:bg-orange-500 selection:text-white">
        <Header />

        {/* Hero Section */}
        <section className="relative py-16 sm:py-24 overflow-hidden border-b border-slate-800">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-slate-950 opacity-90"></div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-extrabold px-3 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Passerelle Dédiée aux Établissements & Recruteurs
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-6">
                Recrutez vos Enseignants & Formateurs en toute sérénité en Côte d'Ivoire
              </h1>

              <p className="text-base sm:text-xl text-slate-300 leading-relaxed mb-8">
                Accédez à la plus grande CVthèque certifiée de professeurs (CAFOP, Licences, Masters, CAPES, Doctorats) et gérez vos recrutements avec zéro intermédiaire.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/register?role=RECRUITER"
                  className="inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-orange-600/30"
                >
                  <Building2 className="w-5 h-5" />
                  Créer un compte Établissement (Gratuit)
                </Link>
                <Link
                  to="/login?role=RECRUITER"
                  className="inline-flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base px-8 py-4 rounded-2xl border border-slate-700 transition"
                >
                  Se connecter à mon Espace Recruteur <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Key Recruiter Features Grid */}
        <section className="py-16 bg-slate-950 border-b border-slate-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">
                Tout ce dont les Directions d'Écoles ont besoin
              </h2>
              <p className="text-slate-400 text-sm sm:text-base">
                Une suite complète d'outils digitaux conçue spécifiquement pour le système éducatif ivoirien.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-emerald-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-5">
                  <Briefcase className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Publication d'Offres en 2 min</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Diffusez vos besoins d'enseignants permanents, vacataires ou répétiteurs avec ciblage par discipline, niveau et ville.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-orange-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-5">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">CVthèque Certifiée de Côte d'Ivoire</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Recherchez et filtrez directement parmi des centaines d'enseignants disponibles à Abidjan, Bouaké, Yamoussoukro, San-Pédro et l'intérieur.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 hover:border-blue-500/50 transition">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center mb-5">
                  <Send className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Convocations SMS Automatiques</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Programmez vos entretiens et notifiez instantanément les candidats sur leur téléphone portable par SMS et email.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-600 to-amber-600 text-white text-center">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-3xl font-black mb-4">Prêt à trouver vos prochains talents pédagogiques ?</h2>
            <p className="text-orange-100 text-base mb-8 max-w-xl mx-auto">
              Rejoignez plus de 850 établissements publics, privés et confessionnels déjà inscrits sur EDULINK CI.
            </p>
            <Link
              to="/register?role=RECRUITER"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-8 py-4 rounded-2xl shadow-xl transition"
            >
              Rejoindre la Passerelle Recruteurs <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED RECRUITER DASHBOARD
  // =========================================================================
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10">
        
        {/* Recruiter Workspace Header Banner */}
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 relative overflow-hidden shadow-xl">
          <div className="absolute right-0 top-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Passerelle Établissement Certifié
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                {profile.candidate?.fullName || profile.email}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Gérez vos offres d'emploi, consultez les candidatures et explorez la CVthèque des enseignants.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => {
                  handleCancelEdit();
                  setActiveTab('POST');
                }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl shadow-md transition text-sm"
              >
                <PlusCircle className="w-4 h-4" />
                Publier une offre
              </button>

              <button
                onClick={() => setActiveTab('CVTHEQUE')}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold px-4 py-2.5 rounded-xl border border-slate-700 transition text-sm"
              >
                <Users className="w-4 h-4 text-emerald-400" />
                Explorer la CVthèque
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800 text-xs">
            <div>
              <div className="text-slate-400 font-medium">Offres Publiées</div>
              <div className="text-xl font-black text-white mt-0.5">{myJobs.length}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Candidatures Reçues</div>
              <div className="text-xl font-black text-orange-400 mt-0.5">{applications.length}</div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Entretiens Planifiés</div>
              <div className="text-xl font-black text-blue-400 mt-0.5">
                {applications.filter(a => a.status === 'INTERVIEW').length}
              </div>
            </div>
            <div>
              <div className="text-slate-400 font-medium">Statut Compte</div>
              <div className="text-emerald-400 font-bold mt-1 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Actif & Vérifié
              </div>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner */}
        {feedbackMsg && (
          <div className={`mb-8 p-4 rounded-2xl border flex items-center justify-between font-medium ${
            feedbackMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2.5 text-sm">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <XCircle className="w-5 h-5 text-red-600 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 hover:text-slate-800 px-2 font-bold">✕</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('POST')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'POST' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            {editingJobId ? "Modifier l'offre" : "Publier une offre"}
          </button>

          <button
            onClick={() => setActiveTab('JOBS')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'JOBS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            Mes offres actives ({myJobs.length})
          </button>

          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'APPLICATIONS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            Candidatures reçues ({applications.length})
          </button>

          <button
            onClick={() => setActiveTab('CVTHEQUE')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${
              activeTab === 'CVTHEQUE' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-orange-50 hover:text-orange-700'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            CVthèque Enseignants CI
          </button>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: PUBLISH / EDIT JOB */}
        {/* ========================================================================= */}
        {activeTab === 'POST' && (
          <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-slate-900">
                {editingJobId ? "Modifier l'offre d'emploi" : "Publier une nouvelle offre d'emploi"}
              </h2>
              {editingJobId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
                >
                  Annuler la modification
                </button>
              )}
            </div>
            <p className="text-slate-500 text-sm mb-8">
              Remplissez les détails du poste pour le diffuser immédiatement auprès de l'ensemble des enseignants inscrits.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Titre du poste *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Ex: Professeur de Mathématiques (Collège / Lycée)"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Nom de l'établissement *</label>
                  <input
                    type="text"
                    name="schoolName"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Ex: Groupe Scolaire Les Élites de Cocody"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Description complète du poste *</label>
                <textarea
                  name="description"
                  required
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm leading-relaxed"
                  placeholder="Détaillez les classes confiées, les volumes horaires hebdomadaires, les attentes pédagogiques..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Discipline / Matière *</label>
                  <input
                    type="text"
                    name="discipline"
                    required
                    value={formData.discipline}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Ex: Mathématiques, Français, SVT..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Niveau d'enseignement *</label>
                  <input
                    type="text"
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Ex: Collège & Lycée, Primaire..."
                  />
                </div>
              </div>

              {/* Cascaded Location Selector for Job Posting */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <CascadingLocationSelect
                  value={formData.city}
                  required
                  regionLabel="1. Région / District du poste"
                  departmentLabel="2. Département / Circonscription / Commune"
                  onChange={(fullLocation) => {
                    setFormData(prev => ({ ...prev, city: fullLocation }));
                  }}
                  layout="grid"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Fourchette salariale (Optionnel)</label>
                  <input
                    type="text"
                    name="salaryRange"
                    value={formData.salaryRange}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                    placeholder="Ex: 200 000 - 300 000 FCFA / mois"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">Type de contrat *</label>
                  <select
                    name="contractType"
                    required
                    value={formData.contractType}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-3 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-sm bg-white"
                  >
                    <option value="CDD">CDD</option>
                    <option value="CDI">CDI</option>
                    <option value="Vacation">Vacation / Heures complémentaires</option>
                    <option value="Stage">Stage pédagogique</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-end">
                {editingJobId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-6 py-3 rounded-xl font-bold text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                  >
                    Annuler
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isPosting}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isPosting ? 'Enregistrement en cours...' : (editingJobId ? 'Mettre à jour l\'offre' : 'Publier l\'offre d\'emploi')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MY PUBLISHED JOBS */}
        {/* ========================================================================= */}
        {activeTab === 'JOBS' && (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Mes offres d'emploi publiées</h2>
                <p className="text-slate-500 text-sm mt-0.5">Consultez, modifiez ou retirez vos annonces actives.</p>
              </div>
              <button
                onClick={() => { handleCancelEdit(); setActiveTab('POST'); }}
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold px-4 py-2 rounded-xl text-sm transition"
              >
                <PlusCircle className="w-4 h-4" />
                Ajouter une offre
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Poste & Établissement</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Discipline & Lieu</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Contrat</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {loadingJobs ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-500">Chargement de vos offres...</td>
                    </tr>
                  ) : myJobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{job.title}</div>
                        <div className="text-xs text-slate-500 font-medium">{job.schoolName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-block bg-orange-50 text-orange-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-orange-100 mr-2">
                          {job.discipline}
                        </span>
                        <span className="text-slate-600 text-xs font-medium">📍 {job.city}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-1 rounded-md">
                          {job.contractType}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Link
                          to={`/jobs/${job.id}`}
                          className="inline-flex p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Aperçu public"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleEditJob(job)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Modifier l'offre"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {!loadingJobs && myJobs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-slate-500 font-medium mb-3">Vous n'avez publié aucune offre pour le moment.</p>
                        <button
                          onClick={() => setActiveTab('POST')}
                          className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2 rounded-xl text-sm transition"
                        >
                          Créer votre 1ère offre
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CANDIDATURES REÇUES & RECRUITMENT PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === 'APPLICATIONS' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Candidatures reçues</h2>
                <p className="text-slate-500 text-sm mt-0.5">
                  Analysez les profils d'enseignants, téléchargez leurs CVs et gérez le statut de recrutement.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <span className="bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl">
                  {filteredApplications.length} {filteredApplications.length > 1 ? 'candidatures' : 'candidature'}
                </span>

                {filteredApplications.length > 0 && (
                  <>
                    <button
                      onClick={() => exportToCSV(filteredApplications, `candidatures_edulink_${Date.now()}.csv`)}
                      className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                      title="Exporter vers Microsoft Excel / Tableur"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Excel (CSV)
                    </button>

                    <button
                      onClick={() => exportToPrintPDF(filteredApplications, selectedJobFilter !== 'ALL' ? (myJobs.find(j => j.id === selectedJobFilter)?.title || 'Commission') : 'Toutes les offres')}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-sm"
                      title="Générer la fiche PDF imprimable pour la commission"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Fiche Commission (PDF)
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher candidat, discipline, ville..."
                  value={appSearchQuery}
                  onChange={(e) => setAppSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3">
                <select
                  value={selectedJobFilter}
                  onChange={(e) => setSelectedJobFilter(e.target.value)}
                  className="border border-slate-300 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none max-w-[220px]"
                >
                  <option value="ALL">Toutes les offres</option>
                  {myJobs.map(j => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>

                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="border border-slate-300 p-2.5 rounded-xl text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="PENDING">En attente</option>
                  <option value="INTERVIEW">Entretien programmé</option>
                  <option value="ACCEPTED">Accepté</option>
                  <option value="REJECTED">Refusé</option>
                </select>
              </div>
            </div>

            {/* Applications List */}
            {loadingApps ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
                Chargement des candidatures...
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aucune candidature trouvée</h3>
                <p className="text-slate-500 text-sm">
                  {applications.length === 0 
                    ? "Vous n'avez pas encore reçu de candidatures pour vos offres." 
                    : "Aucune candidature ne correspond aux critères de filtre sélectionnés."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app: any) => (
                  <div key={app.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-start justify-between gap-6 hover:border-orange-200 transition">
                    <div className="flex-1">
                      {/* Job title badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-block bg-blue-50 text-blue-800 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">
                          Pour l'offre : {app.job?.title} ({app.job?.schoolName})
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>

                      {/* Candidate Card Row */}
                      <div className="flex items-start gap-4 mb-4">
                        <Link to={`/candidate/${app.candidate?.id}`} className="hover:opacity-85 transition shrink-0">
                          <img 
                            src={getGenderAdaptedAvatar(app.candidate?.fullName, app.candidate?.avatarUrl)} 
                            alt={app.candidate?.fullName} 
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 bg-white shadow-xs" 
                          />
                        </Link>
                        <div>
                          <Link to={`/candidate/${app.candidate?.id}`} className="hover:text-orange-600 transition">
                            <h3 className="text-xl font-bold text-slate-900">{app.candidate?.fullName}</h3>
                          </Link>
                          <p className="text-sm font-semibold text-orange-600 mt-0.5">
                            Professeur de {app.candidate?.discipline} • {app.candidate?.level}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            {app.candidate?.experience} ans d'expérience • 📍 {app.candidate?.city}, Côte d'Ivoire
                          </p>
                        </div>
                      </div>

                      {/* Contact Info Pills */}
                      <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                        {app.candidate?.user?.email && (
                          <button
                            type="button"
                            onClick={() => setContactTarget({
                              name: app.candidate?.fullName || 'Candidat',
                              email: app.candidate?.user?.email,
                              phone: app.candidate?.phone,
                              id: app.candidate?.id,
                              tab: 'EMAIL',
                              contextTitle: `Candidature pour ${app.job?.title || 'le poste'}`
                            })}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                            title="Envoyer un email au candidat"
                          >
                            <Mail className="w-3.5 h-3.5 text-orange-600" />
                            {app.candidate.user.email}
                          </button>
                        )}
                        {app.candidate?.phone && (
                          <button
                            type="button"
                            onClick={() => setContactTarget({
                              name: app.candidate?.fullName || 'Candidat',
                              email: app.candidate?.user?.email,
                              phone: app.candidate?.phone,
                              id: app.candidate?.id,
                              tab: 'CALL',
                              contextTitle: `Candidature pour ${app.job?.title || 'le poste'}`
                            })}
                            className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition cursor-pointer"
                            title="Appeler ou contacter sur WhatsApp"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            {app.candidate.phone}
                          </button>
                        )}
                      </div>

                      {/* Cover Letter message */}
                      {app.coverLetter && (
                        <div className="p-3.5 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-100">
                          <span className="font-bold text-slate-900 block mb-1">Message d'accompagnement du candidat :</span>
                          <p className="italic whitespace-pre-wrap leading-relaxed">"{app.coverLetter}"</p>
                        </div>
                      )}
                    </div>

                    {/* Right action column */}
                    <div className="flex flex-col gap-3 shrink-0 lg:w-64 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                      {/* CV Download button */}
                      {app.candidate?.cvUrl ? (
                        <a 
                          href={app.candidate.cvUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-2.5 px-4 rounded-xl text-sm transition"
                        >
                          <FileText className="w-4 h-4" />
                          Consulter le CV (PDF)
                        </a>
                      ) : (
                        <div className="text-center py-2 px-3 bg-slate-100 text-slate-400 text-xs font-semibold rounded-xl">
                          Aucun CV téléversé
                        </div>
                      )}

                      {/* Public profile button */}
                      <Link 
                        to={`/candidate/${app.candidate?.id}`}
                        className="flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-slate-700 font-bold py-2.5 px-4 rounded-xl text-sm border border-slate-200 transition"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Voir le profil public
                      </Link>

                      {/* Status select control */}
                      <div className="mt-1">
                        <label className="block text-xs font-bold text-slate-600 mb-1">Statut de la candidature :</label>
                        <select
                          value={app.status || 'PENDING'}
                          onChange={(e) => updateStatus(app.id, e.target.value)}
                          className={`w-full text-xs font-bold border rounded-xl px-3 py-2.5 outline-none transition cursor-pointer ${
                            app.status === 'ACCEPTED' ? 'bg-green-50 text-green-700 border-green-300' :
                            app.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-300' :
                            app.status === 'INTERVIEW' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                            'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="PENDING">🕒 En attente</option>
                          <option value="INTERVIEW">📅 Entretien programmé (SMS)</option>
                          <option value="ACCEPTED">✅ Accepté pour le poste</option>
                          <option value="REJECTED">❌ Candidature refusée</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CVTHÈQUE & RECHERCHE ENSEIGNANTS */}
        {/* ========================================================================= */}
        {activeTab === 'CVTHEQUE' && (
          <div className="space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
                <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                Base Nationale des Enseignants & Formateurs
              </div>
              <h2 className="text-2xl font-bold text-slate-900">CVthèque des Enseignants de Côte d'Ivoire</h2>
              <p className="text-slate-500 text-sm mt-0.5">
                Accédez directement aux profils vérifiés de professeurs et instituteurs disponibles dans toutes les matières.
              </p>
            </div>

            {/* Filter controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, discipline (ex: Mathématiques, Anglais, CAFOP), mots-clés..."
                  value={candidateSearch}
                  onChange={(e) => setCandidateSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Discipline / Fonction</label>
                  <select
                    value={candidateDisciplineFilter}
                    onChange={(e) => setCandidateDisciplineFilter(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="ALL">Toutes les disciplines & fonctions</option>
                    <option value="Mathématiques">Mathématiques</option>
                    <option value="Physique">Physique-Chimie</option>
                    <option value="Français">Français / Lettres</option>
                    <option value="Anglais">Anglais</option>
                    <option value="SVT">SVT</option>
                    <option value="Histoire">Histoire-Géographie</option>
                    <option value="Philosophie">Philosophie</option>
                    <option value="Éducateur">Éducateur / Éducatrice</option>
                    <option value="Fichier">Correspondant Fichier / TICE / Informatique</option>
                    <option value="Caissière">Caissière / Comptable / Économe</option>
                    <option value="Portier">Portier / Agent de sécurité</option>
                    <option value="CAFOP">Primaire / CAFOP</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Diplôme / Qualification</label>
                  <select
                    value={candidateLevelFilter}
                    onChange={(e) => setCandidateLevelFilter(e.target.value)}
                    className="w-full border border-slate-300 p-2.5 rounded-xl text-xs bg-white focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="ALL">Tous les diplômes</option>
                    <option value="Licence">Licence (Bac +3)</option>
                    <option value="Master">Master (Bac +5)</option>
                    <option value="CAPES">CAPES / Certifié</option>
                    <option value="CAFOP">CAFOP (Primaire)</option>
                    <option value="BTS">BTS / DUT (Bac +2)</option>
                    <option value="DEUG">DEUG (Bac +2)</option>
                    <option value="Doctorat">Doctorat / Supérieur</option>
                    <option value="Baccalauréat">Baccalauréat</option>
                  </select>
                </div>

                <div className="col-span-1 sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-600 mb-1">Région / Circonscription</label>
                  <RegionCircoPicker
                    value={candidateCityFilter === 'ALL' ? '' : candidateCityFilter}
                    onChange={(loc) => setCandidateCityFilter(loc || 'ALL')}
                    placeholder="Toutes les régions / localités"
                    showAllOption={true}
                    allOptionLabel="Toutes les localités (Côte d'Ivoire)"
                  />
                </div>
              </div>
            </div>

            {/* Candidates Grid */}
            {loadingCandidates ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-500 font-semibold">
                Chargement de la CVthèque...
              </div>
            ) : filteredCandidates.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Aucun enseignant trouvé</h3>
                <p className="text-slate-500 text-sm">
                  Essayez d'ajuster vos critères de recherche ou de filtre.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredCandidates.map((c: any) => (
                  <div 
                    key={c.id} 
                    className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-orange-300 transition shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start gap-3.5 mb-3">
                        <img 
                          src={getGenderAdaptedAvatar(c.fullName, c.avatarUrl)} 
                          alt={c.fullName} 
                          className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0 bg-white" 
                        />
                        <div className="min-w-0">
                          <h3 className="text-base font-bold text-slate-900 truncate">{c.fullName}</h3>
                          <div className="text-xs font-bold text-orange-600 mt-0.5">
                            Professeur de {c.discipline}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            🎓 {c.level} • {c.experience} ans d'expérience
                          </div>
                          <div className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-100/80 w-fit">
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            Autorisation MENA/MESRS
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-600 mb-3">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.city}</span>
                      </div>

                      {c.bio && (
                        <p className="text-xs text-slate-600 line-clamp-2 italic mb-4 bg-slate-50 p-2.5 rounded-xl">
                          "{c.bio}"
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <Link
                          to={`/candidate/${c.id}`}
                          className="text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition inline-flex items-center gap-1"
                        >
                          Profil <ChevronRight className="w-3 h-3" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => setContactTarget({
                            name: c.fullName,
                            email: c.email,
                            phone: c.phone,
                            id: c.id,
                            tab: 'CALL',
                            contextTitle: `CVthèque - Enseignant ${c.discipline}`
                          })}
                          className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-2 rounded-xl transition inline-flex items-center gap-1 border border-emerald-200/60 cursor-pointer"
                          title="Contacter par appel, WhatsApp ou email"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          Contacter
                        </button>
                      </div>

                      {c.cvUrl ? (
                        <a
                          href={c.cvUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-3 py-2 rounded-xl transition inline-flex items-center gap-1 shadow-xs"
                        >
                          <FileText className="w-3.5 h-3.5" /> Voir le CV
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">CV sur demande</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* Contact Candidate Modal */}
      {contactTarget && (
        <ContactCandidateModal
          isOpen={!!contactTarget}
          onClose={() => setContactTarget(null)}
          recipientName={contactTarget.name}
          recipientEmail={contactTarget.email}
          recipientPhone={contactTarget.phone}
          recipientId={contactTarget.id}
          initialTab={contactTarget.tab}
          contextTitle={contactTarget.contextTitle}
        />
      )}
    </div>
  );
}
