import { useUserProfile } from '../hooks/useUserProfile';
import { Lock, AlertCircle } from 'lucide-react';

interface AdminProtectedRouteProps {
  children: React.ReactNode;
}

export function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { userProfile, loading, isAdmin } = useUserProfile();

  // Debug
  console.log('AdminProtectedRoute - isAdmin:', isAdmin);
  console.log('AdminProtectedRoute - userProfile:', userProfile);
  console.log('AdminProtectedRoute - loading:', loading);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-red-600" />
          </div>
          
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Acesso Restrito
          </h1>
          
          <p className="text-slate-600 mb-6">
            Você não tem permissão para acessar esta área. 
            Esta página está disponível apenas para administradores.
          </p>
          
          <div className="bg-slate-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-500">
              <strong>Email atual:</strong> {userProfile?.user_id || 'Não identificado'}
            </p>
            <p className="text-sm text-slate-500">
              <strong>Tipo de acesso:</strong> {userProfile?.role || 'Não definido'}
            </p>
            <p className="text-sm text-slate-500">
              <strong>Plano:</strong> {userProfile?.plan || 'Free'}
            </p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => window.history.back()}
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
            >
              Voltar
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Ir para Dashboard
            </button>
          </div>
          
          {userProfile?.role !== 'admin' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Dica:</strong> Para acesso administrativo, 
                faça login com o email <code>admin@financaspro.com</code>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
