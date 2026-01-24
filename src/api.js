import axios from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Helper to get auth token
export const getAuthToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  return null;
};

// Helper to create authorized headers
export const getAuthHeaders = async () => {
  const token = await getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const generateIcon = async (formData) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/generate`,
    formData,
    {
      headers,
      responseType: 'blob'
    }
  );

  return response.data;
};

export const discoverIcons = async (query) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/discover-icons`,
    { query },
    { headers }
  );

  return response.data.suggestions;
};

// Collection management APIs (for future use with Firestore)
export const saveCollection = async (collection) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/collections`,
    collection,
    { headers }
  );
  return response.data;
};

export const getCollections = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_URL}/collections`,
    { headers }
  );
  return response.data;
};

export const deleteCollection = async (collectionId) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(
    `${API_URL}/collections/${collectionId}`,
    { headers }
  );
  return response.data;
};

// Settings management APIs
export const getSettings = async () => {
  const headers = await getAuthHeaders();
  const response = await axios.get(
    `${API_URL}/settings`,
    { headers }
  );
  return response.data;
};

export const saveSettings = async (settings) => {
  const headers = await getAuthHeaders();
  const response = await axios.post(
    `${API_URL}/settings`,
    settings,
    { headers }
  );
  return response.data;
};

export const deleteSettings = async (settingsId) => {
  const headers = await getAuthHeaders();
  const response = await axios.delete(
    `${API_URL}/settings/${settingsId}`,
    { headers }
  );
  return response.data;
};

