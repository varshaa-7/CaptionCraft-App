import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ CHANGE THIS to your deployed backend URL (Railway/Render)
// For local development use: 'http://YOUR_LOCAL_IP:5000/api'
// e.g. 'http://192.168.1.100:5000/api'
const BASE_URL = 'http://10.72.205.208:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Auto-attach JWT token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('authToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const registerUser = (email, password, displayName) =>
  api.post('/auth/register', { email, password, displayName });

export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const firebaseAuth = (firebaseUid, email, displayName) =>
  api.post('/auth/firebase', { firebaseUid, email, displayName });

export const getMe = () => api.get('/auth/me');

// Captions
export const generateCaptions = (topic, platform, tone) =>
  api.post('/captions/generate', { topic, platform, tone });

export const getHistory = () => api.get('/captions/history');

export const clearHistory = () => api.delete('/captions/history');

// Users
export const getQuota = () => api.get('/users/quota');

export const updateProfile = (displayName) =>
  api.put('/users/profile', { displayName });

// Ads
export const claimAdReward = (rewardType) =>
  api.post('/ads/reward', { rewardType, adToken: 'verified' });

export default api;
