import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import PhoneEntryPage from './pages/PhoneEntryPage';
import DashboardPage from './pages/DashboardPage';
import CreateSitePage from './pages/CreateSitePage';
import PublicSitePage from './pages/PublicSitePage';
import SubscriptionPage from './pages/SubscriptionPage';
import AboutPage from './pages/AboutPage';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-google-blue border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/phone" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="phone" element={<PhoneEntryPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="subscription" element={<SubscriptionPage />} />
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="create"
          element={
            <ProtectedRoute>
              <CreateSitePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route path="/site/:slug" element={<PublicSitePage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#202124',
              color: '#fff',
              borderRadius: '12px',
            },
          }}
        />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
