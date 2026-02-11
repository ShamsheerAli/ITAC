import axios from 'axios';

// Create an instance of axios
const api = axios.create({
  baseURL: 'https://glowing-space-pancake-qxg9jr5795q2444j-5000.app.github.dev/api', // Point to your Backend
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;