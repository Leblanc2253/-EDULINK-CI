import { useState, useEffect } from 'react';
import type { FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { 
  GraduationCap, 
  Building2, 
  CheckCircle2, 
  Upload, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  User, 
  Phone, 
  Mail, 
  Lock, 
  MapPin, 
  Briefcase,
  ArrowRight,
  Info
} from 'lucide-react';
import API from '../services/api';
import { setAuthToken } from '../utils/auth';
import CascadingLocationSelect from '../components/CascadingLocationSelect';

const CITIES = [
  'Abidjan - Cocody',
  'Abidjan - Yopougon',
  'Abidjan - Plateau',
  'Abidjan - Marcory',
  'Abidjan - Koumassi',
  'Abidjan - Port-Bouët',
  'Abidjan - Abobo',
  'Abidjan - Adjamé',
  'Abidjan - Treichville',
  'Abidjan - Bingerville',
  'Bouaké',
  'Yamoussoukro',
  'San-Pédro',
  'Daloa',
  'Korhogo',
  'Man',
  'Gagnoa',
  'Autre localité en Côte d\'Ivoire'
];

const DISCIPLINES_CANDIDATE = [
  'Mathématiques',
  'Physique-Chimie',
  'Français / Lettres Modernes',
  'Anglais',
  'SVT (Sciences de la Vie et de la Terre)',
  'Histoire-Géographie',
  'Philosophie',
  'Éducateur / Éducatrice',
  'Correspondant Fichier / TICE / Informaticien',
  'Caissière / Comptable / Économe',
  'Portier / Agent de sécurité & d\'accueil',
  'Enseignement Primaire / CAFOP',
  'Économie & Gestion',
  'Espagnol / Allemand',
  'Éducation Physique et Sportive (EPS)',
  'Arts Plastiques / Musique',
  'Comptabilité / Finance',
  'Droit / Sciences Politiques',
  'Génie Civil / Électrotechnique',
  'Personnel Administratif & Vie Scolaire'
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [role, setRole] = useState<'CANDIDATE' | 'RECRUITER'>(
    roleParam === 'RECRUITER' ? 'RECRUITER' : 'CANDIDATE'
  );

  // Form states
  const [candidateForm, setCandidateForm] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    discipline: 'Mathématiques',
    level: 'Licence',
    teachingAuth: "Autorisation d'enseigner (MENA / MESRS)",
    experience: 2,
    city: 'Abidjan - Cocody',
    bio: ''
  });

  const [recruiterForm, setRecruiterForm] = useState({
    schoolName: '',
    schoolType: 'Collège & Lycée Privé',
    contactName: '',
    contactTitle: 'Directeur des Études / Proviseur',
    email: '',
    password: '',
    phone: '',
    city: 'Abidjan - Cocody',
    description: ''
  });

  const [cvFile, setCvFile] = useState<File | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roleParam === 'RECRUITER') {
      setRole('RECRUITER');
    } else if (roleParam === 'CANDIDATE') {
      setRole('CANDIDATE');
    }
  }, [roleParam]);

  const handleCandidateChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setCandidateForm({ ...candidateForm, [e.target.name]: e.target.value });
  };

  const handleRecruiterChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setRecruiterForm({ ...recruiterForm, [e.target.name]: e.target.value });
  };

  const handleCvChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (role === 'CANDIDATE') {
        const payload = {
          role: 'CANDIDATE',
          fullName: candidateForm.fullName.trim(),
          email: candidateForm.email.trim(),
          password: candidateForm.password,
          phone: candidateForm.phone.trim(),
          discipline: candidateForm.discipline,
          level: candidateForm.level,
          experience: Number(candidateForm.experience) || 0,
          city: candidateForm.city,
          bio: candidateForm.bio.trim()
        };

        const res = await API.post('/auth/register', payload);
        setAuthToken(res.data.accessToken);

        // Upload CV if provided
        if (cvFile) {
          try {
            const formDataUpload = new FormData();
            formDataUpload.append('file', cvFile);
            await API.post('/upload/cv', formDataUpload, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (cvErr) {
            console.error('Erreur upload CV:', cvErr);
          }
        }

        // Upload Avatar if provided
        if (avatarFile) {
          try {
            const avatarFormData = new FormData();
            avatarFormData.append('avatar', avatarFile);
            await API.post('/upload/avatar', avatarFormData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          } catch (avatarErr) {
            console.error('Erreur upload avatar:', avatarErr);
          }
        }

        const returnUrl = searchParams.get('return_url');
        if (returnUrl) {
          navigate(returnUrl);
        } else {
          navigate('/jobs');
        }
      } else {
        // RECRUITER
        const payload = {
          role: 'RECRUITER',
          schoolName: recruiterForm.schoolName.trim(),
          schoolType: recruiterForm.schoolType,
          contactName: `${recruiterForm.contactName.trim()} (${recruiterForm.contactTitle})`,
          email: recruiterForm.email.trim(),
          password: recruiterForm.password,
          phone: recruiterForm.phone.trim(),
          city: recruiterForm.city,
          description: recruiterForm.description.trim()
        };

        const res = await API.post('/auth/register', payload);
        setAuthToken(res.data.accessToken);
        navigate('/recruiter');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de votre compte.');
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
          Portail National de Recrutement dans l'Éducation & l'Enseignement
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 max-w-2xl w-full p-6 sm:p-10 overflow-hidden">
        
        {/* Gateway Selection Tabs */}
        <div className="mb-8">
          <label className="block text-xs font-black uppercase tracking-wider text-slate-400 mb-3 text-center">
            Sélectionnez votre passerelle d'accès
          </label>
          <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200">
            
            {/* Candidate Gateway Button */}
            <button
              type="button"
              onClick={() => { setRole('CANDIDATE'); setError(''); }}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                role === 'CANDIDATE'
                  ? 'bg-orange-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <GraduationCap className="w-5 h-5 shrink-0" />
              <div className="text-left">
                <div className="leading-tight">Passerelle Postulant</div>
                <div className={`text-[10px] font-normal ${role === 'CANDIDATE' ? 'text-orange-100' : 'text-slate-500'}`}>
                  Enseignants & Formateurs
                </div>
              </div>
            </button>

            {/* Recruiter Gateway Button */}
            <button
              type="button"
              onClick={() => { setRole('RECRUITER'); setError(''); }}
              className={`flex items-center justify-center gap-2.5 py-3.5 px-3 rounded-xl font-bold text-sm transition-all duration-200 ${
                role === 'RECRUITER'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Building2 className="w-5 h-5 shrink-0 text-emerald-400" />
              <div className="text-left">
                <div className="leading-tight">Passerelle Recruteur</div>
                <div className={`text-[10px] font-normal ${role === 'RECRUITER' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Écoles & Établissements
                </div>
              </div>
            </button>

          </div>
        </div>

        {/* Portal Header Overview */}
        {role === 'CANDIDATE' ? (
          <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-100 mb-6">
            <div className="flex items-center gap-2 text-orange-800 font-bold text-sm mb-1">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Espace Candidats & Enseignants
            </div>
            <p className="text-xs text-orange-950/80 leading-relaxed">
              Créez votre profil certifié, déposez votre CV et recevez des alertes SMS/Email dès qu'un collège, lycée ou école primaire recrute dans votre matière.
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Espace Établissements & Directions RH
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Publiez vos offres en direct, accédez à la CVthèque des 1 400+ enseignants qualifiés de Côte d'Ivoire et organisez vos convocations par SMS.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-start gap-2.5">
            <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* MAIN REGISTRATION FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* ======================= CANDIDATE FIELDS ======================= */}
          {role === 'CANDIDATE' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nom & Prénoms complets *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      value={candidateForm.fullName}
                      onChange={handleCandidateChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                      placeholder="Kouadio Yao Jean-Marc"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Numéro WhatsApp / Téléphone *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={candidateForm.phone}
                      onChange={handleCandidateChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                      placeholder="07 08 09 10 11"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Adresse Email *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={candidateForm.email}
                      onChange={handleCandidateChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                      placeholder="jean.kouadio@email.ci"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Mot de passe sécurisé *
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      name="password"
                      required
                      minLength={6}
                      value={candidateForm.password}
                      onChange={handleCandidateChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Discipline / Matière d'enseignement *
                  </label>
                  <select
                    name="discipline"
                    required
                    value={candidateForm.discipline}
                    onChange={handleCandidateChange}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                  >
                    {DISCIPLINES_CANDIDATE.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Plus haut diplôme académique / professionnel *
                    </label>
                    <span className="text-[11px] text-orange-600 font-bold">Sélection rapide ci-dessous</span>
                  </div>
                  <select
                    name="level"
                    required
                    value={candidateForm.level}
                    onChange={handleCandidateChange}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition font-medium"
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

                  {/* Boutons d'accès direct et rapide aux diplômes */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {[
                      { id: 'Licence', label: 'Licence (Bac +3)' },
                      { id: 'Master', label: 'Master (Bac +5)' },
                      { id: 'CAPES', label: 'CAPES' },
                      { id: 'CAFOP', label: 'CAFOP' },
                      { id: 'BTS / DUT', label: 'BTS / DUT' },
                      { id: 'DEUG', label: 'DEUG' },
                      { id: 'Doctorat / PhD', label: 'Doctorat' },
                    ].map(dip => (
                      <button
                        key={dip.id}
                        type="button"
                        onClick={() => setCandidateForm(prev => ({ ...prev, level: dip.id }))}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-bold border transition ${
                          candidateForm.level === dip.id
                            ? 'bg-orange-600 border-orange-600 text-white shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300'
                        }`}
                      >
                        {dip.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Option Stratégique de Crédibilité : Autorisation d'Enseigner ou de Diriger (MENA / MESRS) */}
              <div className="p-4 rounded-2xl bg-amber-50/90 border border-amber-200/90">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between flex-wrap gap-2 mb-1">
                      <label className="text-xs font-black uppercase tracking-wider text-amber-950">
                        Autorisation d'enseigner ou de diriger (MENA / MESRS)
                      </label>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 font-extrabold px-2 py-0.5 rounded-full">
                        Recommandé pour la crédibilité
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/80 mb-3">
                      Précisez la situation de votre titre officiel délivré par le Ministère de l'Éducation Nationale (MENA) ou de l'Enseignement Supérieur (MESRS).
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { value: "Autorisation d'enseigner (MENA / MESRS)", label: "Autorisation d'enseigner" },
                        { value: "Autorisation de diriger (MENA / MESRS)", label: "Autorisation de diriger" },
                        { value: "Autorisation en cours d'obtention", label: "En cours de demande" },
                        { value: "Non titulaire", label: "Non titulaire" },
                      ].map(opt => (
                        <label
                          key={opt.value}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold cursor-pointer transition ${
                            candidateForm.teachingAuth === opt.value
                              ? 'bg-amber-600 border-amber-600 text-white shadow-xs'
                              : 'bg-white border-amber-200 text-slate-700 hover:bg-amber-100/50'
                          }`}
                        >
                          <input
                            type="radio"
                            name="teachingAuth"
                            value={opt.value}
                            checked={candidateForm.teachingAuth === opt.value}
                            onChange={(e) => setCandidateForm(prev => ({ ...prev, teachingAuth: e.target.value }))}
                            className="sr-only"
                          />
                          <span className="truncate">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Années d'expérience professionnelle *
                </label>
                <input
                  type="number"
                  name="experience"
                  min="0"
                  max="45"
                  required
                  value={candidateForm.experience}
                  onChange={handleCandidateChange}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:bg-white text-sm outline-none transition"
                  placeholder="Ex: 3"
                />
              </div>

              {/* Cascaded Region and Department Selection */}
              <div className="p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                <CascadingLocationSelect
                  value={candidateForm.city}
                  required
                  regionLabel="1. Région / District de disponibilité"
                  departmentLabel="2. Département / Circonscription / Commune"
                  onChange={(fullLocation) => {
                    setCandidateForm(prev => ({ ...prev, city: fullLocation }));
                  }}
                  layout="grid"
                />
              </div>

              {/* Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <FileText className="w-6 h-6 text-orange-600 mx-auto mb-1.5" />
                  <label className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                    Déposer votre CV (PDF, DOC)
                  </label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleCvChange}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-orange-100 file:text-orange-800 hover:file:bg-orange-200"
                  />
                  {cvFile && (
                    <div className="text-[11px] text-emerald-600 font-bold mt-1.5">
                      ✓ {cvFile.name}
                    </div>
                  )}
                </div>

                <div className="border border-dashed border-slate-300 rounded-2xl p-4 text-center bg-slate-50/50 hover:bg-slate-50 transition">
                  <User className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                  <label className="block text-xs font-bold text-slate-700 mb-1 cursor-pointer">
                    Photo de profil (Optionnel)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300"
                  />
                  {avatarFile && (
                    <div className="text-[11px] text-emerald-600 font-bold mt-1.5">
                      ✓ {avatarFile.name}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ======================= RECRUITER FIELDS ======================= */}
          {role === 'RECRUITER' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nom de l'Établissement / École *
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="schoolName"
                      required
                      value={recruiterForm.schoolName}
                      onChange={handleRecruiterChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                      placeholder="Ex: Groupe Scolaire Les Lauriers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Type d'établissement *
                  </label>
                  <select
                    name="schoolType"
                    required
                    value={recruiterForm.schoolType}
                    onChange={handleRecruiterChange}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                  >
                    <option value="Collège & Lycée Privé">Collège & Lycée Privé Laïc</option>
                    <option value="Établissement Confessionnel (Catholique/Islamique/Méthodiste)">Établissement Confessionnel</option>
                    <option value="Université Privée & Grande École">Université Privée & Grande École</option>
                    <option value="École Primaire & Maternelle">École Primaire & Maternelle</option>
                    <option value="Centre de Formation Professionnelle">Centre de Formation Professionnelle</option>
                    <option value="Structure de Soutien Scolaire / Cours à Domicile">Structure de Cours & Répétitions</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Nom du Responsable / Recruteur *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      name="contactName"
                      required
                      value={recruiterForm.contactName}
                      onChange={handleRecruiterChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                      placeholder="Dr. Touré Ibrahim"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Fonction du responsable *
                  </label>
                  <select
                    name="contactTitle"
                    required
                    value={recruiterForm.contactTitle}
                    onChange={handleRecruiterChange}
                    className="w-full py-2.5 px-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                  >
                    <option value="Proviseur / Directeur Général">Proviseur / Directeur Général</option>
                    <option value="Directeur des Études (D.E)">Directeur des Études (D.E)</option>
                    <option value="Responsable des Ressources Humaines (DRH)">Responsable RH / Recrutement</option>
                    <option value="Fondateur / Promoteur">Fondateur / Promoteur</option>
                    <option value="Chef d'Établissement">Chef d'Établissement</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Email Professionnel *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      name="email"
                      required
                      value={recruiterForm.email}
                      onChange={handleRecruiterChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                      placeholder="direction@ecole.ci"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Téléphone officiel Établissement *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      name="phone"
                      required
                      value={recruiterForm.phone}
                      onChange={handleRecruiterChange}
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                      placeholder="27 22 44 55 66 / 07 00..."
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Mot de passe de sécurité *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={6}
                    value={recruiterForm.password}
                    onChange={handleRecruiterChange}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {/* Cascaded Region and Department Selection */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <CascadingLocationSelect
                  value={recruiterForm.city}
                  required
                  regionLabel="1. Région / District de l'établissement"
                  departmentLabel="2. Département / Commune de l'établissement"
                  onChange={(fullLocation) => {
                    setRecruiterForm(prev => ({ ...prev, city: fullLocation }));
                  }}
                  layout="grid"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Brève présentation de votre établissement (Optionnel)
                </label>
                <textarea
                  name="description"
                  rows={2}
                  value={recruiterForm.description}
                  onChange={handleRecruiterChange}
                  className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-slate-900 focus:bg-white text-sm outline-none transition"
                  placeholder="Ex: Établissement d'excellence fondé en 2012, proposant des filières générales et techniques de la 6ème à la Terminale..."
                />
              </div>
            </>
          )}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full font-bold py-3.5 px-4 rounded-xl text-white shadow-lg transition duration-200 mt-6 flex items-center justify-center gap-2 ${
              role === 'CANDIDATE'
                ? 'bg-orange-600 hover:bg-orange-700 shadow-orange-500/20'
                : 'bg-slate-900 hover:bg-slate-800 shadow-slate-900/20'
            } disabled:opacity-60`}
          >
            {loading ? (
              <span>Création du compte en cours...</span>
            ) : (
              <>
                <span>
                  {role === 'CANDIDATE' 
                    ? 'Finaliser mon profil Candidat & Postuler' 
                    : 'Activer mon Espace Établissement'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Existing account link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center text-sm text-slate-600">
          Vous possédez déjà un compte ?{' '}
          <Link
            to={`/login?role=${role}`}
            className="text-orange-600 font-bold hover:text-orange-700 hover:underline"
          >
            Se connecter à la passerelle {role === 'CANDIDATE' ? 'Postulant' : 'Recruteur'}
          </Link>
        </div>

      </div>
    </div>
  );
}
