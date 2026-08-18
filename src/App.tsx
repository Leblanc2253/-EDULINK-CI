/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import RecruiterPage from './pages/RecruiterPage';
import CandidateProfilePage from './pages/CandidateProfilePage';
import MyProfilePage from './pages/MyProfilePage';
import JobDetailsPage from './pages/JobDetailsPage';
import AdminPage from './pages/AdminPage';
import ToastAlerts from './components/ToastAlerts';
import AppUpdateNotifier from './components/AppUpdateNotifier';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/:id" element={<JobDetailsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/recruiter" element={<RecruiterPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/profile" element={<MyProfilePage />} />
        <Route path="/candidate/:id" element={<CandidateProfilePage />} />
      </Routes>
      <ToastAlerts />
      <AppUpdateNotifier />
    </BrowserRouter>
  );
}
