import axios from 'axios';

const api = axios.create({
  // --- FIX: Added /api to the end of your URL ---
  baseURL: 'https://container-space.onrender.com/api', 
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;