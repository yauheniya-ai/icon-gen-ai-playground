import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const generateIcon = async (formData) => {
  const response = await axios.post(
    `${API_URL}/generate`,
    formData,
    {
      responseType: 'blob'
    }
  );

  return response.data;
};
