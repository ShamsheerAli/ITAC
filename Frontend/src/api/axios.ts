import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'https://didactic-space-winner-jpxjjrrpg93pvwj-5000.app.github.dev/api', // Point to your Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;