import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser, registerUser, firebaseAuth, getMe } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const storedUser = await AsyncStorage.getItem('authUser');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Refresh user data from server
        try {
          const { data } = await getMe();
          setUser(data);
          await AsyncStorage.setItem('authUser', JSON.stringify(data));
        } catch {}
      }
    } catch (err) {
      console.log('Auth load error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveAuth = async (token, user) => {
    await AsyncStorage.setItem('authToken', token);
    await AsyncStorage.setItem('authUser', JSON.stringify(user));
    setToken(token);
    setUser(user);
  };

  const login = async (email, password) => {
    const { data } = await loginUser(email, password);
    await saveAuth(data.token, data.user);
    return data;
  };

  const register = async (email, password, displayName) => {
    const { data } = await registerUser(email, password, displayName);
    await saveAuth(data.token, data.user);
    return data;
  };

  const loginWithFirebase = async (firebaseUid, email, displayName) => {
    const { data } = await firebaseAuth(firebaseUid, email, displayName);
    await saveAuth(data.token, data.user);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
  };

  const updateUserQuota = (quota, limits) => {
    setUser((prev) => ({ ...prev, quota, limits }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        loginWithFirebase,
        logout,
        updateUserQuota,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
