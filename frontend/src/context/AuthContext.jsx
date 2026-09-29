import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('resqgrid_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.warn('[AUTH] Session expired or invalid:', err.message);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (identifier, password) => {
    const res = await api.login({ identifier, password });
    if (res.success && res.token) {
      localStorage.setItem('resqgrid_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const demoLogin = async (role, departmentCode) => {
    const res = await api.demoLogin(role, departmentCode);
    if (res.success && res.token) {
      localStorage.setItem('resqgrid_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (formData) => {
    const res = await api.register(formData);
    if (res.success && res.token) {
      localStorage.setItem('resqgrid_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('resqgrid_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, demoLogin, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
