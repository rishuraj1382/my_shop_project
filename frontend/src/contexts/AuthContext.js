// frontend/src/contexts/AuthContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [name, setName] = useState(() => localStorage.getItem('name'));
  const [loading, setLoading] = useState(false);
  const [favorites, setFavorites] = useState([]);

  const login = useCallback((tokenVal, roleVal, nameVal) => {
    setToken(tokenVal);
    setRole(roleVal);
    setName(nameVal);
    localStorage.setItem('token', tokenVal);
    localStorage.setItem('role', roleVal);
    if (nameVal) localStorage.setItem('name', nameVal);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setRole(null);
    setName(null);
    setUser(null);
    setFavorites([]);
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('name');
  }, []);

  const updateUser = useCallback((updatedData) => {
    setUser(prev => ({ ...prev, ...updatedData }));
    if (updatedData.name) {
      setName(updatedData.name);
      localStorage.setItem('name', updatedData.name);
    }
  }, []);

  // Fetch fresh user data when token exists
  const fetchMe = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'x-auth-token': token },
      });
      setUser(res.data);
      if (res.data.favorites) {
        setFavorites(res.data.favorites.map(f => f._id || f));
      }
    } catch (err) {
      if (err.response?.status === 401) logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) fetchMe();
  }, [token, fetchMe]);

  const isFavorite = useCallback((shopId) => {
    return favorites.some(fav => {
      const id = typeof fav === 'string' ? fav : fav._id || fav.toString();
      return id === shopId;
    });
  }, [favorites]);

  const toggleFavorite = useCallback(async (shopId) => {
    if (!token || role !== 'customer') return;
    const isAlready = isFavorite(shopId);
    try {
      if (isAlready) {
        await axios.delete(`${API_URL}/api/customer/favorites/${shopId}`, {
          headers: { 'x-auth-token': token },
        });
        setFavorites(prev => prev.filter(id => id.toString() !== shopId));
      } else {
        await axios.post(`${API_URL}/api/customer/favorites/${shopId}`, {}, {
          headers: { 'x-auth-token': token },
        });
        setFavorites(prev => [...prev, shopId]);
      }
    } catch (err) {
      console.error('Toggle favorite failed', err);
    }
  }, [token, role, isFavorite]);

  const getAuthHeader = useCallback(() => ({
    headers: { 'x-auth-token': token },
  }), [token]);

  return (
    <AuthContext.Provider value={{
      user, token, role, name, loading,
      favorites, isFavorite, toggleFavorite,
      login, logout, updateUser, fetchMe, getAuthHeader,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};
