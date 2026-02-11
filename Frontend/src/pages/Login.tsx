import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.post('/auth/login', { email, password });
      
      console.log("Login Success:", res.data);
      
      // 1. Save User Info to LocalStorage
      localStorage.setItem('user', JSON.stringify(res.data.user));

      // 2. Redirect based on Role
      if (res.data.user.role === 'staff') {
        navigate('/staff-dashboard');
      } else {
        // CHANGED: Redirect clients to Temporary Dashboard
        navigate('/TemporaryDashboard'); 
      }

    } catch (err: any) {
      console.error("Login Error:", err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Welcome Back</h2>
        
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border p-2 rounded mt-1 outline-none focus:border-[#FE5C00]" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border p-2 rounded mt-1 outline-none focus:border-[#FE5C00]" 
              required 
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full bg-[#FE5C00] text-white py-2 rounded font-bold hover:bg-orange-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Don't have an account? <Link to="/signup" className="text-[#FE5C00] font-bold">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;