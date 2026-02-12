import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UpdateDetails = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  // Initial State (Empty)
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    sicCode: '',
    naics: '',
    energyConsumption: '',
    grossSales: '',
    buildingSize: '',
    utilityExpenses: '',
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      // 1. Get User ID from Local Storage
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(storedUser);

      try {
        // 2. FETCH LATEST DATA FROM DATABASE
        // This ensures we see what is on the Dashboard, not old LocalStorage data
        const res = await api.get(`/profile/${user.id}`);
        
        // 3. Populate Form with Database Data
        if (res.data) {
          setFormData({
            companyName: res.data.companyName || '',
            contactName: res.data.contactName || user.name, // Fallback to User Name if empty
            contactEmail: res.data.contactEmail || user.email,
            contactPhone: res.data.contactPhone || '',
            streetAddress: res.data.streetAddress || '',
            city: res.data.city || '',
            state: res.data.state || '',
            zipCode: res.data.zipCode || '',
            sicCode: res.data.sicCode || '',
            naics: res.data.naics || '',
            energyConsumption: res.data.energyConsumption || '',
            grossSales: res.data.grossSales || '',
            buildingSize: res.data.buildingSize || '',
            utilityExpenses: res.data.utilityExpenses || '',
            description: res.data.description || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile data", err);
        // Optional: Pre-fill basic info from LocalStorage if DB fetch fails
        setFormData(prev => ({
            ...prev,
            contactName: user.name,
            contactEmail: user.email
        }));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Handle Input Change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    try {
      // Send Update Request
      await api.post('/profile', {
        userId: user.id,
        ...formData
      });
      
      alert('Details Updated Successfully!');
      navigate('/dashboard'); // Redirect back to Dashboard
    } catch (err) {
      console.error(err);
      alert('Failed to update details.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your details...</div>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-[#FE5C00] pb-2 inline-block">
        My Information
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Company Name:</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Name:</label>
                <input type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Email:</label>
                <input type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border p-2 rounded bg-gray-100" readOnly />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Phone:</label>
                <input type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Street Address:</label>
                <input type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">City:</label>
                <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1">State:</label>
                    <input type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1">Zip code:</label>
                    <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold mb-1">SIC Code:</label>
                <input type="text" name="sicCode" value={formData.sicCode} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
             <div>
                <label className="block text-sm font-bold mb-1">NAICS:</label>
                <input type="text" name="naics" value={formData.naics} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Annual Energy Consumption:</label>
                <input type="text" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Annual Gross sales:</label>
                <input type="text" name="grossSales" value={formData.grossSales} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Building Size:</label>
                <input type="text" name="buildingSize" value={formData.buildingSize} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Annual utility expenses:</label>
                <input type="text" name="utilityExpenses" value={formData.utilityExpenses} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Additional details</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-32"></textarea>
            </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="col-span-1 md:col-span-2 flex justify-center mt-6">
            <button type="submit" className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-3 px-12 rounded shadow-lg transition uppercase">
                Save Updates
            </button>
        </div>

      </form>
    </div>
  );
};

export default UpdateDetails;