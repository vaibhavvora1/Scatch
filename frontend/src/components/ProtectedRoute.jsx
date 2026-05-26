import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return children;
}

export function AdminRoute({ children }) {
  const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
  const role  = (() => {
    try {
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role;
    } catch { return null; }
  })();
  if (!token || role !== 'owner') return <Navigate to="/admin/login" replace />;
  return children;
}

export function GuestRoute({ children }) {
  const { isLoggedIn } = useAuth();
  if (isLoggedIn) return <Navigate to="/shop" replace />;
  return children;
}
