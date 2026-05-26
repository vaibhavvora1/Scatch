import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/client';

const AuthContext = createContext(null);

const parseJsonSafe = (value) => {
  try { return JSON.parse(value); } catch { return null; }
};

const decodeJwt = (token) => {
  try {
    const [, payload] = token.split('.');
    return parseJsonSafe(atob(payload));
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  const decoded = decodeJwt(token);
  return !decoded || (decoded.exp && Date.now() > decoded.exp * 1000);
};

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => parseJsonSafe(localStorage.getItem('user')));
  const [token, setToken]     = useState(() => {
    const stored = localStorage.getItem('token');
    if (!stored) return null;
    if (isTokenExpired(stored)) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return null;
    }
    return stored;
  });
  const [loading, setLoading] = useState(false);

  const saveSession = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    if (!token) return;
    if (isTokenExpired(token)) {
      clearSession();
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password });
      saveSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (fullname, email, password) => {
    setLoading(true);
    try {
      const { data } = await authAPI.register({ fullname, email, password });
      saveSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearSession();
  };

  const updateUser = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, updateUser, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
