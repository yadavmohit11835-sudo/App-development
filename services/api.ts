import axios from 'axios';
import storage from './storage';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const DEFAULT_PORT = 5000;
const FALLBACK_LAN_IP = '192.168.29.240';

export const resolveDefaultBaseUrl = () => {
  // 1. Explicit env variable
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 2. Dynamic host URI from Expo Go / Metro
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:${DEFAULT_PORT}/api`;
    }
  }

  // 3. Fallback to computer's Wi-Fi LAN IP
  if (Platform.OS === 'android') {
    return `http://${FALLBACK_LAN_IP}:${DEFAULT_PORT}/api`;
  }

  return `http://localhost:${DEFAULT_PORT}/api`;
};

export const API_BASE_URL = resolveDefaultBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Load any user-customized server IP from storage on boot
storage.getItem('keyprime_custom_api_url').then((savedUrl) => {
  if (savedUrl) {
    api.defaults.baseURL = savedUrl;
    console.log('[API] Using saved custom server URL:', savedUrl);
  }
});

export const updateServerUrl = async (newUrl: string) => {
  let cleanUrl = newUrl.trim();
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = cleanUrl.replace(/\/+$/, '') + '/api';
  }
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    cleanUrl = 'http://' + cleanUrl;
  }
  api.defaults.baseURL = cleanUrl;
  await storage.setItem('keyprime_custom_api_url', cleanUrl);
  return cleanUrl;
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await storage.getItem('keyprime_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.error('Error attaching auth token', e);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please try again.';
    if (error.response?.data?.message) {
      message = error.response.data.message;
    } else if (error.message === 'Network Error' || error.code === 'ECONNABORTED') {
      message = `Server unreachable at ${api.defaults.baseURL}. Check Wi-Fi connection and backend status.`;
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
