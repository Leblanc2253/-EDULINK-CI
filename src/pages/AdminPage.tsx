import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import API from '../services/api';
import { Users, Briefcase, Trash2, ShieldAlert, BarChart3 } from 'lucide-react';

export default function AdminPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'USERS' | 'JOBS'>('DASHBOARD');
  
  const [stats, setStats] = useState({ users: 0, jobs: 0, applications: 0 });
  const [users, setUsers] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);

  useEffect(() => {
    checkAdmin();
  }, [navigate]);

  const checkAdmin = async () => {
    try {
      const res = await API.get('/auth/profile');
      if (res.data.role !== 'ADMIN') {
        navigate('/jobs');
        return;
      }
      fetchData();
    } catch (err) {
      navigate('/login');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        API.get('/admin/stats'),
        API.get('/admin/users'),
        API.get('/admin/jobs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la récupération des données.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet utilisateur et toutes ses données associées ?")) return;
    try {
      await API.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u.id !== id));
      setStats(prev => ({ ...prev, users: prev.users - 1 }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette offre d'emploi ?")) return;
    try {
      await API.delete(`/admin/jobs/${id}`);
      setJobs(jobs.filter(j => j.id !== id));
      setStats(prev => ({ ...prev, jobs: prev.jobs - 1 }));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-500 font-semibold">Chargement du panel administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full p-6 sm:p-12">
        <div className="flex items-center gap-4 mb-8">
          <div className="bg-red-100 p-3 rounded-xl">
            <ShieldAlert className="w-8 h-8 text-red-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900">Administration Globale</h1>
            <p className="text-slate-500 font-medium">Gérez la plateforme, les utilisateurs et le contenu</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8 bg-white p-2 rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('DASHBOARD')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'DASHBOARD' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('USERS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'USERS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" /> Utilisateurs
          </button>
          <button
            onClick={() => setActiveTab('JOBS')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-sm transition-colors whitespace-nowrap ${
              activeTab === 'JOBS' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Offres d'emploi
          </button>
        </div>

        {/* Dashboard Content */}
        {activeTab === 'DASHBOARD' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <Users className="w-12 h-12 text-blue-500 mb-4" />
              <h3 className="text-4xl font-black text-slate-900">{stats.users}</h3>
              <p className="text-slate-500 font-semibold mt-2">Utilisateurs inscrits</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <Briefcase className="w-12 h-12 text-orange-500 mb-4" />
              <h3 className="text-4xl font-black text-slate-900">{stats.jobs}</h3>
              <p className="text-slate-500 font-semibold mt-2">Offres publiées</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
              <BarChart3 className="w-12 h-12 text-green-500 mb-4" />
              <h3 className="text-4xl font-black text-slate-900">{stats.applications}</h3>
              <p className="text-slate-500 font-semibold mt-2">Candidatures envoyées</p>
            </div>
          </div>
        )}

        {/* Users Content */}
        {activeTab === 'USERS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold text-sm">Compte</th>
                    <th className="px-6 py-4 font-bold text-sm">Rôle</th>
                    <th className="px-6 py-4 font-bold text-sm">Inscription</th>
                    <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{user.candidate?.fullName || 'N/A'}</div>
                        <div className="text-slate-500 text-xs mt-1">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                          user.role === 'ADMIN' ? 'bg-red-100 text-red-700' :
                          user.role === 'RECRUITER' ? 'bg-blue-100 text-blue-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'utilisateur"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aucun utilisateur trouvé.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Jobs Content */}
        {activeTab === 'JOBS' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="px-6 py-4 font-bold text-sm">Offre</th>
                    <th className="px-6 py-4 font-bold text-sm">Établissement</th>
                    <th className="px-6 py-4 font-bold text-sm">Publication</th>
                    <th className="px-6 py-4 font-bold text-sm text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {jobs.map(job => (
                    <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{job.title}</div>
                        <div className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                          <span className="bg-slate-100 px-2 py-0.5 rounded">{job.discipline}</span>
                          <span>📍 {job.city}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {job.schoolName}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(job.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer l'offre"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {jobs.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Aucune offre trouvée.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
