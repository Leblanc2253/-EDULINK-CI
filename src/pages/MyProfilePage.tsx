import { useState, useEffect, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Briefcase, ExternalLink, Clock, CheckCircle2, XCircle, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import API from '../services/api';
import { notifyAuthChanged } from '../utils/auth';
import { getGenderAdaptedAvatar } from '../utils/avatar';
import CascadingLocationSelect from '../components/CascadingLocationSelect';

export default function MyProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'PROFILE' | 'APPLICATIONS'>('PROFILE');
  const [applications, setApplications] = useState<any[]>([]);

  // Editing application state
  const [editingApp, setEditingApp] = useState<any | null>(null);
  const [editCoverLetter, setEditCoverLetter] = useState('');
  const [isUpdatingApp, setIsUpdatingApp] = useState(false);
  const [isDeletingApp, setIsDeletingApp] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    discipline: '',
    level: '',
    experience: '',
    city: '',
    bio: ''
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingCV, setUploadingCV] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, [navigate]);

  const fetchProfile = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data.role !== 'CANDIDATE') {
        navigate('/jobs');
        return;
      }
      setProfile(res.data.candidate);
      setFormData({
        fullName: res.data.candidate?.fullName || '',
        phone: res.data.candidate?.phone || '',
        discipline: res.data.candidate?.discipline || '',
        level: res.data.candidate?.level || '',
        experience: res.data.candidate?.experience?.toString() || '0',
        city: res.data.candidate?.city || '',
        bio: res.data.candidate?.bio || ''
      });
      setAvatarPreview(res.data.candidate?.avatarUrl || null);
      const appRes = await API.get('/applications/me');
      setApplications(appRes.data);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    try {
      await API.patch('/candidates/me', {
        ...formData,
        experience: parseInt(formData.experience) || 0
      });
      setSuccessMsg('Profil mis à jour avec succès.');
      notifyAuthChanged();
      fetchProfile();
    } catch (err) {
      alert("Erreur lors de la mise à jour du profil.");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const form = new FormData();
    form.append('avatar', file);

    try {
      const res = await API.post('/upload/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarPreview(res.data.avatarUrl);
      setSuccessMsg('Avatar mis à jour.');
      notifyAuthChanged();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleCVUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCV(true);
    const form = new FormData();
    form.append('file', file);

    try {
      await API.post('/upload/cv', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccessMsg('CV mis à jour.');
      notifyAuthChanged();
      fetchProfile(); // reload to get new cvUrl
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingCV(false);
    }
  };

  const handleOpenEditApp = (app: any) => {
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
      setSuccessMsg('Candidature mise à jour avec succès.');
      setEditingApp(null);
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la mise à jour de la candidature.');
    } finally {
      setIsUpdatingApp(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir retirer votre candidature pour cette offre ?')) {
      return;
    }

    setIsDeletingApp(true);
    try {
      await API.delete(`/applications/${appId}`);
      setSuccessMsg('Candidature retirée avec succès.');
      if (editingApp && editingApp.id === appId) {
        setEditingApp(null);
      }
      fetchProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression de la candidature.');
    } finally {
      setIsDeletingApp(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 font-semibold">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900">Mon Profil</h1>
          {profile?.id && (
            <Link to={`/candidate/${profile.id}`} className="text-sm font-semibold text-orange-600 hover:underline border border-orange-200 px-4 py-2 rounded-lg bg-orange-50 hover:bg-orange-100 transition">
              Voir mon profil public
            </Link>
          )}
        </div>

        {successMsg && (
          <div className="mb-6 bg-green-50 text-green-700 p-4 rounded-lg border border-green-100 font-medium">
            {successMsg}
          </div>
        )}

        
        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'PROFILE' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <User className="w-4 h-4" /> Mon Profil
          </button>
          <button
            onClick={() => setActiveTab('APPLICATIONS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'APPLICATIONS' ? 'bg-orange-600 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Mes Candidatures
          </button>
        </div>

        {activeTab === 'PROFILE' && (

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Cover Area */}
          <div className="h-32 bg-slate-800 relative">
            {/* Avatar */}
            <div className="absolute -bottom-12 left-8 group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <img 
                src={getGenderAdaptedAvatar(formData.fullName || profile?.fullName, avatarPreview)} 
                alt="Avatar" 
                className="w-24 h-24 rounded-full object-cover border-4 border-white bg-white shadow-md" 
              />
              <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-xs font-bold text-center">Changer<br/>Photo</span>
              </div>
              <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} accept="image/*" className="hidden" />
            </div>
          </div>
          
          <div className="p-6 sm:p-8 pt-16 sm:pt-16">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Nom Complet</label>
                  <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Téléphone</label>
                  <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Discipline</label>
                  <input type="text" name="discipline" required value={formData.discipline} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Diplôme académique / professionnel</label>
                  <select
                    name="level"
                    required
                    value={formData.level}
                    onChange={handleChange}
                    className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white text-sm"
                  >
                    <option value="Licence">Licence (Bac +3)</option>
                    <option value="Master">Master (Bac +5)</option>
                    <option value="CAPES">CAPES / Professeur Certifié</option>
                    <option value="CAFOP">CAFOP (Instituteur / Primaire)</option>
                    <option value="BTS / DUT">BTS / DUT (Bac +2)</option>
                    <option value="DEUG">DEUG (Diplôme d'Études Universitaires Générales - Bac +2)</option>
                    <option value="Doctorat / PhD">Doctorat / PhD (Enseignement Supérieur)</option>
                    <option value="Baccalauréat">Baccalauréat</option>
                    <option value="Autre Diplôme Professionnel">Autre Diplôme Pédagogique / Professionnel</option>
                  </select>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {['Licence', 'Master', 'CAPES', 'CAFOP', 'BTS / DUT', 'DEUG', 'Doctorat / PhD'].map(dip => (
                      <button
                        key={dip}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, level: dip }))}
                        className={`text-[10px] px-2 py-0.5 rounded font-bold border transition ${
                          formData.level === dip || formData.level.startsWith(dip)
                            ? 'bg-orange-600 border-orange-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-orange-50'
                        }`}
                      >
                        {dip === 'Doctorat / PhD' ? 'Doctorat' : dip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cascaded Location Selector */}
              <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100">
                <CascadingLocationSelect
                  value={formData.city}
                  required
                  regionLabel="1. Région / District de disponibilité"
                  departmentLabel="2. Département / Circonscription / Commune"
                  onChange={(fullLocation) => {
                    setFormData(prev => ({ ...prev, city: fullLocation }));
                  }}
                  layout="grid"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Expérience (années)</label>
                  <input type="number" name="experience" min="0" required value={formData.experience} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">CV actuel</label>
                  <div className="flex items-center gap-4 h-[46px]">
                    {profile?.cvUrl ? (
                      <a href={profile.cvUrl} target="_blank" rel="noopener noreferrer" className="text-orange-600 hover:underline font-semibold text-sm">
                        Voir mon CV
                      </a>
                    ) : (
                      <span className="text-sm text-slate-400 italic">Aucun CV</span>
                    )}
                    <button type="button" onClick={() => cvInputRef.current?.click()} className="text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-1.5 px-3 rounded transition ml-auto">
                      {uploadingCV ? 'Envoi...' : 'Remplacer le CV'}
                    </button>
                    <input type="file" ref={cvInputRef} onChange={handleCVUpload} accept=".pdf,.doc,.docx" className="hidden" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Courte biographie (Optionnel)</label>
                <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full border border-slate-300 p-2.5 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Présentez-vous en quelques phrases..."></textarea>
              </div>

              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={saving || uploadingAvatar || uploadingCV} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-3 px-8 rounded-lg transition disabled:opacity-70">
                  {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>
            </form>
          </div>
        </div>

        )}

        {activeTab === 'APPLICATIONS' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Candidatures envoyées</h2>
                <p className="text-slate-500 text-sm mt-1">Suivez l'état de vos candidatures et ajustez vos messages d'accompagnement.</p>
              </div>
              <span className="bg-orange-50 text-orange-700 font-bold text-xs px-3 py-1.5 rounded-full border border-orange-100">
                {applications.length} {applications.length > 1 ? 'candidatures' : 'candidature'}
              </span>
            </div>
            
            {applications.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 font-medium">Vous n'avez envoyé aucune candidature pour le moment.</p>
                <Link to="/jobs" className="mt-4 inline-block bg-white border border-slate-300 text-slate-700 font-bold py-2 px-6 rounded-lg hover:bg-slate-50 transition">
                  Découvrir les offres
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app: any) => (
                  <div key={app.id} className="border border-slate-200 rounded-xl p-5 sm:p-6 hover:shadow-sm transition bg-slate-50/50">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2.5 mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{app.job?.title}</h3>
                          <span className={`px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                            app.status === 'ACCEPTED' ? 'bg-green-100 text-green-700' :
                            app.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                            app.status === 'INTERVIEW' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {app.status === 'ACCEPTED' && <CheckCircle2 className="w-3 h-3" />}
                            {app.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                            {app.status === 'INTERVIEW' && <Clock className="w-3 h-3" />}
                            {app.status === 'PENDING' && <Clock className="w-3 h-3" />}
                            
                            {app.status === 'ACCEPTED' ? 'Accepté' :
                             app.status === 'REJECTED' ? 'Refusé' :
                             app.status === 'INTERVIEW' ? 'Entretien' :
                             'En attente'}
                          </span>
                        </div>

                        <div className="text-slate-600 text-sm font-medium mb-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span>Établissement : <strong className="text-slate-900">{app.job?.schoolName}</strong></span>
                          <span>📍 {app.job?.city}</span>
                          <span>Discipline : <strong className="text-slate-900">{app.job?.discipline}</strong></span>
                        </div>

                        <div className="text-slate-500 text-xs mt-1">
                          Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>

                        {app.coverLetter && (
                          <div className="mt-3 p-3.5 bg-white rounded-lg border border-slate-200/80 text-sm text-slate-700 shadow-xs">
                            <span className="font-semibold text-slate-800 block text-xs uppercase tracking-wider text-slate-500 mb-1">
                              Message au recruteur :
                            </span>
                            <p className="italic whitespace-pre-wrap">"{app.coverLetter}"</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 shrink-0 self-stretch sm:self-auto">
                        <button
                          onClick={() => handleOpenEditApp(app)}
                          className="flex items-center justify-center gap-1.5 text-sm font-bold bg-white hover:bg-orange-50 text-slate-700 hover:text-orange-600 border border-slate-200 hover:border-orange-200 px-4 py-2.5 rounded-lg transition"
                          title="Modifier la candidature"
                        >
                          <Edit3 className="w-4 h-4 text-orange-600" />
                          Modifier candidature
                        </button>

                        <Link 
                          to={`/jobs/${app.jobId}`}
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
                  </div>
                ))}
              </div>
            )}
          </div>
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
                    Votre CV et vos informations de contact sont synchronisés automatiquement avec votre profil candidat principal.
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

      </main>
    </div>
  );
}
