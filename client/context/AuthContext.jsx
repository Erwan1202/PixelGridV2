import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // --- LOGIN ---
  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });

    localStorage.setItem('accessToken', res.data.accessToken);
    setUser(res.data.user);
  };

  // --- REGISTER ---
  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', {
      username,
      email,
      password,
    });

    return res.data;
  };

  // --- FETCH CURRENT USER ---
  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      fetchCurrentUser();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, register }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
