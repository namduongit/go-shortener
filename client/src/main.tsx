import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'

import LoginPage from './pages/auth/login/login'
import RegisterPage from './pages/auth/register/register'
import VerifySuccessPage from './pages/auth/verify/success/verify-success'
import VerifyFailedPage from './pages/auth/verify/failed/verify-failed'
import DocumentPage from './pages/document/document'
import UrlPage from './pages/url/url'
import FilePage from './pages/file/file'
import PlanPage from './pages/plan/plan'
import AccountInfoPage from './pages/account/info'
import AccountApiPage from './pages/account/api'
import SecurityPage from './pages/account/security'
import HomePage from './pages/home/home'

import NotificateProvider from './common/contexts/notificate'
import AuthenticateProvider from './common/contexts/authenticate'
import ProtectedRoute from './components/protected-route/protected-route'
import PublicRoute from './components/public-route/public-route'
import DashboardLayout from './components/layout/dashboard-layout'

createRoot(document.getElementById('root')!).render(
  <NotificateProvider>
    <AuthenticateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/page/urls" element={<UrlPage />} />
              <Route path="/page/files" element={<FilePage />} />
              <Route path="/page/files/:folderUUID" element={<FilePage />} />
              <Route path="/page/plans" element={<PlanPage />} />
              <Route path="/page/account/info" element={<AccountInfoPage />} />
              <Route path="/page/account/api" element={<AccountApiPage />} />
              <Route path="/page/account/security" element={<SecurityPage />} />
            </Route>
          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
          </Route>

          <Route path="/verify/success" element={<VerifySuccessPage />} />
          <Route path="/verify/failed" element={<VerifyFailedPage />} />
          <Route path="/page/document" element={<DocumentPage />} />

        </Routes>
      </BrowserRouter>
    </AuthenticateProvider>
  </NotificateProvider>
)
