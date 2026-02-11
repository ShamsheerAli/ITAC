import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // 1. Import your new API helper

const SignUp = () => {
  const navigate = useNavigate();
  
  // State for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // 1. Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 2. Call the Backend API
      const response = await api.post('/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: 'client' // Default role
      });

      console.log("Registration Success:", response.data);
      
      // 3. Redirect to Login on Success
      alert("Account created successfully! Please log in.");
      navigate('/login');

    } catch (err: any) {
      // 4. Handle Errors (e.g., User already exists)
      console.error("Registration Error:", err.response?.data?.message);
      setError(err.response?.data?.message || "Failed to register. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Create Account</h2>
        
        {/* Error Message Display */}
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700">Full Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              className="w-full border p-2 rounded mt-1" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700">Email</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              className="w-full border p-2 rounded mt-1" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              className="w-full border p-2 rounded mt-1" 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              className="w-full border p-2 rounded mt-1" 
              required 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-[#FE5C00] text-white py-2 rounded font-bold hover:bg-orange-600 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600">
          Already have an account? <Link to="/login" className="text-[#FE5C00] font-bold">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;