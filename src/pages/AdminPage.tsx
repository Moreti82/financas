import { AdminProtectedRoute } from '../components/AdminProtectedRoute';
import { AdminPanel } from '../components/AdminPanel';

export function AdminPage() {
  return (
    <AdminProtectedRoute>
      <AdminPanel />
    </AdminProtectedRoute>
  );
}
