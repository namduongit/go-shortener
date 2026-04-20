import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router'
import LoginPage from './pages/auth/login/login'
import RegisterPage from './pages/auth/register/register'
import UrlPage from './pages/url/url'
import FilePage from './pages/file/file'
import PlanPage from './pages/plan/plan'
import AccountInfoPage from './pages/account/info'
import AccountApiPage from './pages/account/api'
import NotificateProvider from './common/contexts/notificate'
import AuthenticateProvider from './common/contexts/authenticate'
import ProtectedRoute from './components/protected-route/protected-route'
import PublicRoute from './components/public-route/public-route'
import DashboardLayout from './components/layout/dashboard-layout'
import HomePage from './pages/home/home'

createRoot(document.getElementById('root')!).render(
  <NotificateProvider>
    <AuthenticateProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>

            <Route element={
                <DashboardLayout />
            }>

              <Route path="/page/urls" element={<UrlPage />} />
              <Route path="/page/files" element={<FilePage />} />
              <Route path="/page/plans" element={<PlanPage />} />
              <Route path="/page/account/info" element={<AccountInfoPage />} />
              <Route path="/page/account/api" element={<AccountApiPage />} />

            </Route>

          </Route>

          <Route element={<PublicRoute />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </AuthenticateProvider>
  </NotificateProvider>
)
