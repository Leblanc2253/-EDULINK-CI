import { useEffect, useState, FormEvent, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Building2, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Coins, 
  Edit3, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  ExternalLink 
} from 'lucide-react';
import Header from '../components/Header';
import API from '../services/api';
import { subscribeAuthChanged } from '../utils/auth';

export default function JobDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [applying, setApplying] = useState(false);
  const [userApplication, setUserApplication] = useState<any | null>(null);

  // Modal state for applying or editing application
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [coverLetterInput, setCoverLetterInput] = useState('');
  const [isSubmittingModal, setIsSubmittingModal] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const checkAuthAndApplication = useCallback(async () => {
    if (localStorage.getItem('edulink_token')) {
      try {
        const profileRes = await API.get('/auth/profile');
        setUserRole(profileRes.data.role);
        setUserId(profileRes.data.id);
        
        if (profileRes.data.role === 'CANDIDATE') {
          const res = await API.get('/applications/me');
          const currentApp = res.data.find((app: any) => app.jobId === id);
          if (currentApp) {
            setUserApplication(currentApp);
            setCoverLetterInput(currentApp.coverLetter || '');
          } else {
            setUserApplication(null);
          }
        }
      } catch (e) {
        setUserRole(null);
        setUserId(null);
        setUserApplication(null);
      }
    } else {
      setUserRole(null);
      setUserId(null);
      setUserApplication(null);
    }
  }, [id]);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await API.get(`/jobs/${id}`);
        setJob(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Offre introuvable');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJob();
      checkAuthAndApplication();
    }

    const unsubscribe = subscribeAuthChanged(() => {
      checkAuthAndApplication();
    });

    return () => unsubscribe();
  }, [id, checkAuthAndApplication]);

  const handleOpenModal = () => {
    if (!localStorage.getItem('edulink_token')) {
      navigate(`/login?return_url=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmittingModal(true);
    setFeedbackMsg(null);

    try {
      if (userApplication) {
        // Update existing application
        await API.patch(`/applications/${userApplication.id}`, {
          coverLetter: coverLetterInput,
        });
        setFeedbackMsg({ type: 'success', text: 'Votre candidature a été mise à jour avec succès !' });
      } else {
        // New application
        await API.post('/applications', { 
          jobId: id, 
          coverLetter: coverLetterInput 
        });
        setFeedbackMsg({ type: 'success', text: 'Candidature envoyée avec succès au recruteur !' });
      }
      await checkAuthAndApplication();
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate(`/login?return_url=${encodeURIComponent(window.location.pathname)}`);
      } else {
        setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la postulation.' });
      }
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const handleDeleteApplication = async () => {
    if (!userApplication) return;
    if (!window.confirm('Êtes-vous sûr de vouloir retirer votre candidature ?')) return;

    setIsSubmittingModal(true);
    try {
      await API.delete(`/applications/${userApplication.id}`);
      setUserApplication(null);
      setCoverLetterInput('');
      setFeedbackMsg({ type: 'success', text: 'Votre candidature a été retirée.' });
      setIsModalOpen(false);
    } catch (err: any) {
      setFeedbackMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du retrait.' });
    } finally {
      setIsSubmittingModal(false);
    }
  };

  const copyToClipboard = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setFeedbackMsg({ type: 'success', text: 'Lien de l\'offre copié dans le presse-papiers !' });
      setTimeout(() => setFeedbackMsg(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 font-semibold">Chargement des détails du poste...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
          <Link to="/jobs" className="text-orange-600 font-bold hover:underline">
            &larr; Retour au catalogue des offres
          </Link>
        </div>
      </div>
    );
  }

  const hasApplied = !!userApplication;
  const isOwner = userId && (job.recruiterId === userId || userRole === 'ADMIN');

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/jobs" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 transition">
            <ArrowLeft className="w-4 h-4" />
            Toutes les offres d'emploi
          </Link>
          
          <button
            onClick={copyToClipboard}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg transition"
          >
            <Share2 className="w-3.5 h-3.5" />
            Partager l'offre
          </button>
        </div>

        {feedbackMsg && (
          <div className={`mb-6 p-4 rounded-xl border flex items-center justify-between font-semibold text-sm ${
            feedbackMsg.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              <span>{feedbackMsg.text}</span>
            </div>
            <button onClick={() => setFeedbackMsg(null)} className="text-slate-500 hover:text-slate-800 px-2">✕</button>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 sm:p-10">
            {/* Badges & Title */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold bg-orange-100 text-orange-800 px-3 py-1 rounded-full border border-orange-200/60">
                {job.discipline}
              </span>
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-full">
                {job.contractType}
              </span>
              <span className="text-xs font-semibold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                📍 {job.city}, Côte d'Ivoire
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-3 tracking-tight">
              {job.title}
            </h1>
            
            <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-slate-700 mb-8">
              <Building2 className="w-5 h-5 text-slate-400" />
              <span>{job.schoolName}</span>
            </div>

            {/* Quick Actions Row */}
            <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-0.5">Statut de l'offre</span>
                <span className="text-sm font-bold text-green-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                  Recrutement actif et ouvert
                </span>
              </div>

              {/* Action buttons depending on role */}
              <div className="w-full sm:w-auto flex flex-wrap gap-2">
                {userRole === 'RECRUITER' || userRole === 'ADMIN' ? (
                  isOwner ? (
                    <Link
                      to="/recruiter"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition"
                    >
                      <Edit3 className="w-4 h-4" />
                      Gérer dans l'Espace Recruteur
                    </Link>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 bg-white px-4 py-2.5 rounded-xl border border-slate-200">
                      Vue recruteur
                    </span>
                  )
                ) : hasApplied ? (
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    <div className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-green-100 text-green-800 font-bold text-xs rounded-xl">
                      <CheckCircle2 className="w-4 h-4" />
                      Candidature envoyée
                    </div>
                    <button
                      onClick={handleOpenModal}
                      className="inline-flex items-center justify-center gap-1.5 bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 font-bold px-4 py-2.5 rounded-xl text-xs transition"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                      Modifier mon message
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleOpenModal}
                    disabled={applying}
                    className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md hover:shadow-lg transition text-sm text-center"
                  >
                    Postuler maintenant
                  </button>
                )}
              </div>
            </div>

            {/* Main Content & Specs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4">
              <div className="md:col-span-2 space-y-6">
                <section>
                  <h2 className="text-xl font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">
                    Missions & Description du poste
                  </h2>
                  <div className="text-slate-700 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                    {job.description}
                  </div>
                </section>
              </div>

              {/* Sidebar specifications */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                  <h3 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider text-slate-500">
                    Fiche Récapitulative
                  </h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Niveau enseigné</p>
                        <p className="font-bold text-slate-900">{job.level}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Lieu</p>
                        <p className="font-bold text-slate-900">{job.city}, Côte d'Ivoire</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Briefcase className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Type de contrat</p>
                        <p className="font-bold text-slate-900">{job.contractType}</p>
                      </div>
                    </div>

                    {job.salaryRange && (
                      <div className="flex items-start gap-3">
                        <Coins className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-slate-500 font-medium">Rémunération proposée</p>
                          <p className="font-bold text-green-700">{job.salaryRange}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs text-slate-500 font-medium">Date de publication</p>
                        <p className="font-semibold text-slate-800">
                          {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Apply / Edit Application */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                      <Edit3 className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">
                      {hasApplied ? 'Modifier ma candidature' : 'Postuler à cette offre'}
                    </h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    {job.title} • <span className="text-slate-500">{job.schoolName}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Lettre de motivation / Message d'accompagnement (Optionnel)
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Précisez vos points forts pédagogiques, vos disponibilités et votre motivation pour rejoindre cet établissement.
                  </p>
                  <textarea
                    rows={5}
                    value={coverLetterInput}
                    onChange={(e) => setCoverLetterInput(e.target.value)}
                    placeholder="Madame, Monsieur, Enseignant dynamique et passionné, je vous soumets ma candidature pour le poste de..."
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-y leading-relaxed"
                  ></textarea>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Votre CV et les coordonnées enregistrées sur votre profil candidat seront automatiquement transmis à l'établissement.
                  </span>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                  {hasApplied ? (
                    <button
                      type="button"
                      onClick={handleDeleteApplication}
                      disabled={isSubmittingModal}
                      className="w-full sm:w-auto text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-4 h-4" />
                      Retirer la candidature
                    </button>
                  ) : <div />}

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingModal}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isSubmittingModal ? 'Enregistrement...' : (hasApplied ? 'Mettre à jour' : 'Envoyer ma candidature')}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
