import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  FileText, 
  Calendar,
  CheckCircle2,
  MessageSquare
} from 'lucide-react';
import API from '../services/api';
import { getGenderAdaptedAvatar } from '../utils/avatar';
import ContactCandidateModal from '../components/ContactCandidateModal';

export default function CandidateProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Contact Modal State
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactModalTab, setContactModalTab] = useState<'EMAIL' | 'CALL'>('EMAIL');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get(`/candidates/${id}`);
        setProfile(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Profil introuvable');
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchProfile();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 font-semibold">Chargement du profil candidat...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="text-orange-600 font-bold hover:underline"
          >
            &larr; Retour à la page précédente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        <button 
          onClick={() => navigate(-1)} 
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-slate-900 mb-6 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          {/* Header Banner */}
          <div className="h-36 sm:h-44 bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 relative"></div>
          
          <div className="px-6 sm:px-10 pb-10">
            <div className="relative flex flex-col sm:flex-row justify-between items-start gap-4">
              {/* Avatar */}
              <div className="-mt-16 sm:-mt-20 mb-4 shrink-0">
                <img 
                  src={getGenderAdaptedAvatar(profile.fullName, profile.avatarUrl)} 
                  alt={profile.fullName} 
                  className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border-4 border-white bg-white shadow-md" 
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-2 sm:mt-4">
                {profile.cvUrl && (
                  <a 
                    href={profile.cvUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-orange-100 hover:bg-orange-200 text-orange-800 font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-xs"
                  >
                    <FileText className="w-4 h-4" />
                    Télécharger le CV
                  </a>
                )}

                <button 
                  type="button"
                  onClick={() => {
                    setContactModalTab('EMAIL');
                    setContactModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-5 rounded-xl text-sm transition shadow-xs cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-orange-400" />
                  Envoyer un email
                </button>

                <button 
                  type="button"
                  onClick={() => {
                    setContactModalTab('CALL');
                    setContactModalOpen(true);
                  }}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold py-2.5 px-4 rounded-xl text-sm transition shadow-xs cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-emerald-600" />
                  Appeler / WhatsApp
                </button>
              </div>
            </div>

            {/* Profile Info Header */}
            <div className="mt-4 mb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{profile.fullName}</h1>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                  Profil vérifié
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600" />
                  Autorisation d'enseigner / diriger (MENA / MESRS)
                </span>
              </div>
              <p className="text-lg font-bold text-orange-600 mt-1">
                {profile.discipline.toLowerCase().includes('professeur') || 
                 profile.discipline.toLowerCase().includes('éducateur') || 
                 profile.discipline.toLowerCase().includes('informaticien') || 
                 profile.discipline.toLowerCase().includes('fichier') || 
                 profile.discipline.toLowerCase().includes('portier') || 
                 profile.discipline.toLowerCase().includes('caissière')
                  ? profile.discipline
                  : `Spécialiste / Enseignant en ${profile.discipline}`}
              </p>
            </div>

            {/* Key Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 mb-8">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-orange-100 text-orange-700 rounded-xl">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Diplôme officiel</span>
                  <strong className="text-sm font-bold text-slate-900">{profile.level}</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Expérience</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {profile.experience === 0 ? "Débutant / < 1 an" : `${profile.experience} an${profile.experience > 1 ? 's' : ''}`}
                  </strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Localisation</span>
                  <strong className="text-sm font-bold text-slate-900">{profile.city}, Côte d'Ivoire</strong>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Membre depuis</span>
                  <strong className="text-sm font-bold text-slate-900">
                    {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : '2026'}
                  </strong>
                </div>
              </div>
            </div>

            {/* Bio / Presentation */}
            {profile.bio ? (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-3">À propos de l'enseignant</h2>
                <div className="p-5 bg-white rounded-2xl text-slate-700 border border-slate-200 leading-relaxed whitespace-pre-wrap text-sm sm:text-base">
                  {profile.bio}
                </div>
              </div>
            ) : (
              <div className="p-5 bg-slate-50 rounded-2xl text-slate-500 text-sm border border-slate-100 italic">
                Ce candidat n'a pas encore rédigé de biographie personnalisée.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Contact Modal */}
      {profile && (
        <ContactCandidateModal
          isOpen={contactModalOpen}
          onClose={() => setContactModalOpen(false)}
          recipientName={profile.fullName}
          recipientEmail={profile.email}
          recipientPhone={profile.phone}
          recipientId={profile.id}
          initialTab={contactModalTab}
          contextTitle={`Enseignant en ${profile.discipline}`}
        />
      )}
    </div>
  );
}
