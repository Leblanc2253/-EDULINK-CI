import { useEffect, useState, FormEvent, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Edit3, Trash2, ExternalLink, X, AlertCircle, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import Header from '../components/Header';
import API from '../services/api';
import { subscribeAuthChanged } from '../utils/auth';
import RegionCircoPicker from '../components/RegionCircoPicker';

interface Job {
  id: string;
  title: string;
  schoolName: string;
  description: string;
  discipline: string;
  level: string;
  city: string;
  salaryRange?: string;
  contractType: string;
}

interface Application {
  id: string;
  jobId: string;
  status: string;
  coverLetter?: string;
  createdAt: string;
  job: Job;
}

export default function JobsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [jobs, setJobs] = useState<Job[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingApps, setLoadingApps] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState(searchParams.get('discipline') || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedIds, setAppliedIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'JOBS' | 'APPLICATIONS'>('JOBS');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalJobs, setTotalJobs] = useState(0);

  // Editing application state
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const syncAppliedIds = useCallback(() => {
    if (localStorage.getItem('edulink_token')) {
      API.get('/applications/me')
        .then(res => {
          setAppliedIds(res.data.map((app: any) => app.jobId));
        })
        .catch(() => {
          setAppliedIds([]);
        });
    } else {
      setAppliedIds([]);
    }
  }, []);

  useEffect(() => {
    syncAppliedIds();
    const unsubscribe = subscribeAuthChanged(() => {
      syncAppliedIds();
    });
    return () => unsubscribe();
  }, [syncAppliedIds]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (activeTab === 'JOBS') {
        fetchJobs(currentPage);
      } else {
        fetchApplications();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [selectedCity, selectedDiscipline, searchQuery, activeTab, currentPage]);

  const fetchJobs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await API.get('/jobs', {
        params: {
          city: selectedCity || undefined,
          discipline: selectedDiscipline || undefined,
          search: searchQuery || undefined,
          page,
          limit: 9,
        },
      });

      if (res.data.items) {
        setJobs(res.data.items);
        setTotalPages(res.data.pagination.totalPages || 1);
        setTotalJobs(res.data.pagination.total || 0);
      } else {
        // Fallback in case of array response
        setJobs(res.data);
        setTotalPages(1);
        setTotalJobs(res.data.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    setLoadingApps(true);
    try {
      const res = await API.get('/applications/me');
      setMyApplications(res.data);
      setAppliedIds(res.data.map((app: any) => app.jobId));
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
      console.error(err);
    } finally {
      setLoadingApps(false);
    }
  };

  const handleApply = async (jobId: string) => {
    try {
      await API.post('/applications', { jobId });
      setAppliedIds(prev => [...prev, jobId]);
      alert('Candidature envoyée avec succès !');
    } catch (err: any) {
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        navigate('/login');
      } else {
        alert(err.response?.data?.message || 'Erreur lors de la postulation.');
      }
    }
  };

  const handleOpenEditApp = (app: Application) => {
    setEditingApp(app);
    setEditCoverLetter(app.coverLetter || '');
  };

  const handleSaveAppEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingApp) return;

    setIsUpdatingApp(true);
    try {
      await API.patch(`/applications/${editingApp.id}`, {
        coverLetter: editCoverLetter,
      });
      setFeedbackMsg('Candidature mise à jour avec succès !');
      setEditingApp(null);
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour.');
    } finally {
      setIsUpdatingApp(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer cette candidature ?')) {
      return;
    }

    setIsDeletingApp(true);
    try {
      await API.delete(`/applications/${appId}`);
      setFeedbackMsg('Candidature retirée.');
      if (editingApp && editingApp.id === appId) {
        setEditingApp(null);
      }
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors du retrait de la candidature.');
    } finally {
      setIsDeletingApp(false);
    }
  };

  const isLoggedIn = !!localStorage.getItem('edulink_token');

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />
      
      <div className="max-w-5xl mx-auto px-4 sm:px-12 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900">
            {activeTab === 'JOBS' ? "Offres d'Enseignement" : "Mes Candidatures"}
          </h1>
          
          {isLoggedIn && (
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab('JOBS')}
                className={`px-4 py-2 font-bold text-sm rounded-lg transition ${activeTab === 'JOBS' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Trouver un emploi
              </button>
              <button
                onClick={() => setActiveTab('APPLICATIONS')}
                className={`px-4 py-2 font-bold text-sm rounded-lg transition ${activeTab === 'APPLICATIONS' ? 'bg-slate-800 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
              >
                Historique
              </button>
            </div>
          )}
        </div>

        {feedbackMsg && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 font-semibold flex items-center justify-between">
            <span>{feedbackMsg}</span>
            <button onClick={() => setFeedbackMsg('')} className="text-green-800 hover:opacity-75">✕</button>
          </div>
        )}

        {activeTab === 'JOBS' ? (
          <>
            {/* Filtres */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 mb-8 flex flex-col md:flex-row gap-3">
              <input
                type="text"
                placeholder="Rechercher par titre ou mots-clés..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-[1.5] border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <input
                type="text"
                placeholder="Discipline (ex: Maths, SVT...)"
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="flex-1 border border-slate-300 p-2.5 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
              <div className="flex-1">
                <RegionCircoPicker
                  value={selectedCity}
                  onChange={(loc) => setSelectedCity(loc)}
                  placeholder="Région ou circonscription..."
                  showAllOption={true}
                  allOptionLabel="Toutes les régions / villes"
                />
              </div>
            </div>

            {/* Liste */}
            {loading ? (
              <p className="text-slate-500">Chargement des opportunités...</p>
            ) : jobs.length === 0 ? (
              <p className="text-slate-500">Aucune offre ne correspond à vos critères pour l'instant.</p>
            ) : (
              <>
                <div className="grid gap-4">
                  {jobs.map((job) => (
                    <div
                      key={job.id}
                      className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                            {job.discipline}
                          </span>
                          <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                            {job.contractType}
                          </span>
                        </div>
                        <h2 className="text-xl font-bold text-slate-900 mt-2">{job.title}</h2>
                        <p className="text-sm font-semibold text-slate-600 mt-1">{job.schoolName} — 📍 {job.city}</p>
                        <p className="text-sm text-slate-500 mt-3 line-clamp-2 leading-relaxed">{job.description}</p>
                        {job.salaryRange && (
                          <p className="text-xs font-bold text-green-700 mt-3">💰 {job.salaryRange}</p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0 shrink-0 w-full sm:w-auto">
                        <Link to={`/jobs/${job.id}`} className="px-5 py-2.5 rounded-xl font-bold text-sm bg-white border-2 border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 transition text-center">
                          Voir l'offre
                        </Link>
                        <button
                          onClick={() => handleApply(job.id)}
                          disabled={appliedIds.includes(job.id)}
                          className={`px-5 py-2.5 rounded-xl font-bold text-sm transition text-center ${
                            appliedIds.includes(job.id)
                              ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                              : 'bg-orange-600 hover:bg-orange-700 text-white shadow-sm'
                          }`}
                        >
                          {appliedIds.includes(job.id) ? 'Postulé ✓' : 'Postuler'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Server-Side Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
                    <span className="text-xs font-semibold text-slate-500">
                      Affichage page <span className="text-slate-900 font-bold">{currentPage}</span> sur <span className="text-slate-900 font-bold">{totalPages}</span> ({totalJobs} offres au total)
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          if (currentPage > 1) {
                            setCurrentPage(prev => prev - 1);
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage <= 1 || loading}
                        className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Précédent
                      </button>

                      <div className="flex items-center gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1)
                          .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                          .map((page, idx, arr) => {
                            const prev = arr[idx - 1];
                            return (
                              <div key={page} className="flex items-center">
                                {prev && page - prev > 1 && (
                                  <span className="px-2 text-xs text-slate-400">...</span>
                                )}
                                <button
                                  onClick={() => {
                                    setCurrentPage(page);
                                    window.scrollTo({ top: 180, behavior: 'smooth' });
                                  }}
                                  className={`w-8 h-8 rounded-xl text-xs font-bold transition flex items-center justify-center ${
                                    currentPage === page
                                      ? 'bg-orange-600 text-white shadow-sm'
                                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                                  }`}
                                >
                                  {page}
                                </button>
                              </div>
                            );
                          })}
                      </div>

                      <button
                        onClick={() => {
                          if (currentPage < totalPages) {
                            setCurrentPage(prev => prev + 1);
                            window.scrollTo({ top: 180, behavior: 'smooth' });
                          }
                        }}
                        disabled={currentPage >= totalPages || loading}
                        className="flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
                      >
                        Suivant
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {/* Historique */}
            {loadingApps ? (
              <p className="text-slate-500">Chargement de votre historique...</p>
            ) : myApplications.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border text-center">
                <p className="text-slate-500 mb-4">Vous n'avez postulé à aucune offre pour le moment.</p>
                <button
                  onClick={() => setActiveTab('JOBS')}
                  className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-lg transition"
                >
                  Voir les offres
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {myApplications.map((app) => {
                  const getStatusLabel = (status: string) => {
                    switch (status) {
                      case 'ACCEPTED': return 'Accepté';
                      case 'REJECTED': return 'Refusé';
                      case 'INTERVIEW': return 'Entretien';
                      case 'PENDING':
                      default: return 'En attente';
                    }
                  };
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case 'ACCEPTED': return 'bg-green-100 text-green-800 border border-green-200';
                      case 'REJECTED': return 'bg-red-100 text-red-800 border border-red-200';
                      case 'INTERVIEW': return 'bg-blue-100 text-blue-800 border border-blue-200';
                      case 'PENDING':
                      default: return 'bg-amber-100 text-amber-800 border border-amber-200';
                    }
                  };

                  return (
                    <div
                      key={app.id}
                      className="bg-white p-6 rounded-2xl border shadow-sm flex flex-col md:flex-row justify-between items-start gap-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${getStatusColor(app.status)}`}>
                            {getStatusLabel(app.status)}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR')}
                          </span>
                        </div>

                        <h2 className="text-lg font-bold text-slate-900">{app.job?.title}</h2>
                        <p className="text-sm font-semibold text-slate-600 mb-2">{app.job?.schoolName} — 📍 {app.job?.city}</p>
                        
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs font-bold bg-orange-50 text-orange-700 px-2 py-0.5 rounded">
                            {app.job?.discipline}
                          </span>
                          <span className="text-xs font-semibold bg-slate-50 text-slate-600 px-2 py-0.5 rounded">
                            {app.job?.contractType}
                          </span>
                        </div>

                        {app.coverLetter && (
                          <div className="mt-3 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-700 italic">
                            <span className="font-semibold not-italic text-slate-900 block mb-0.5">Message au recruteur :</span>
                            "{app.coverLetter}"
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0 self-stretch sm:self-auto w-full md:w-auto">
                        <button
                          onClick={() => handleOpenEditApp(app)}
                          className="flex items-center justify-center gap-1.5 text-sm font-bold bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 px-4 py-2.5 rounded-lg transition"
                          title="Modifier la candidature"
                        >
                          <Edit3 className="w-4 h-4 text-orange-600" />
                          Modifier candidature
                        </button>

                        <Link 
                          to={`/jobs/${app.job?.id || app.jobId}`}
                          className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-2.5 rounded-lg transition"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Voir l'offre
                        </Link>

                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="flex items-center justify-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 px-3 py-2.5 rounded-lg transition"
                          title="Retirer la candidature"
                        >
                          <Trash2 className="w-4 h-4" />
                          Retirer
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Modal Modifier Candidature */}
        {editingApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-150 my-8">
              <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="p-2 bg-orange-100 text-orange-700 rounded-lg">
                      <Edit3 className="w-5 h-5" />
                    </span>
                    <h3 className="text-xl font-bold text-slate-900">Modifier ma candidature</h3>
                  </div>
                  <p className="text-sm font-semibold text-slate-600 mt-1">
                    {editingApp.job?.title} • <span className="text-slate-500">{editingApp.job?.schoolName}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setEditingApp(null)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAppEdit} className="p-6 space-y-5">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-500 font-medium">Statut de la candidature</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      editingApp.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                      editingApp.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      editingApp.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {editingApp.status === 'ACCEPTED' ? 'Accepté' :
                       editingApp.status === 'REJECTED' ? 'Refusé' :
                       editingApp.status === 'INTERVIEW' ? 'Entretien' :
                       'En attente'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Date de dépôt :</span>
                    <span>{new Date(editingApp.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Lettre de motivation / Message d'accompagnement
                  </label>
                  <p className="text-xs text-slate-500 mb-2">
                    Vous pouvez ajuster votre message ou préciser vos disponibilités pour l'établissement.
                  </p>
                  <textarea
                    rows={5}
                    value={editCoverLetter}
                    onChange={(e) => setEditCoverLetter(e.target.value)}
                    placeholder="Expliquez vos motivations, votre disponibilité, votre expérience pédagogique..."
                    className="w-full border border-slate-300 p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition resize-y leading-relaxed"
                  ></textarea>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-amber-800">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <span>
                    Votre profil et votre CV sont toujours consultables par l'établissement recruteur.
                  </span>
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleDeleteApp(editingApp.id)}
                    disabled={isDeletingApp || isUpdatingApp}
                    className="w-full sm:w-auto text-sm font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                    Retirer la candidature
                  </button>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={() => setEditingApp(null)}
                      className="w-full sm:w-auto px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdatingApp}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg transition disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                      {isUpdatingApp ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
