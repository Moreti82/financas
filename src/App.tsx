import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { Auth } from './components/Auth';
import { ResponsiveDashboard } from './components/ResponsiveDashboard';
import { AdminPage } from './pages/AdminPage';
import { PricingPage } from './pages/PricingPage';
import { ToastContainer } from './components/ToastContainer';
import { useToast } from './hooks/useToast';

function AppContent() {
  const { user, loading } = useAuth();
  const { toasts, removeToast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600">Carregando...</div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <Auth />} 
        />
        <Route 
          path="/admin" 
          element={<AdminPage />} 
        />
        <Route 
          path="/pricing" 
          element={<PricingPage />} 
        />
        <Route 
          path="/" 
          element={user ? <ResponsiveDashboard /> : <Navigate to="/login" replace />} 
        />
      </Routes>
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UserProfileProvider>
          <AppContent />
        </UserProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
