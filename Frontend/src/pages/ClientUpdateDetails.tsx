import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../api/axios';

const UpdateDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  
  // ✅ NEW: Simply check the URL to see which route they are on
  const isFromMainDashboard = location.pathname === '/update-details';

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessDescription: '', 
    naics: '',
    energyConsumption: '',
    isGrossSalesLessThan250M: '', 
    grossSales: '',               
    buildingSize: '',
    utilityExpenses: '',
    naturalGasProvider: '', 
    electricityProvider: '', 
    naturalGasTransporter: '', 
    referredBy: '', 
    description: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        navigate('/login');
        return;
      }
      const user = JSON.parse(storedUser);

      try {
        const res = await api.get(`/profile/${user.id}`);
        
        if (res.data) {
          setFormData({
            companyName: res.data.companyName || '',
            contactName: res.data.contactName || user.name, 
            contactEmail: res.data.contactEmail || user.email,
            contactPhone: res.data.contactPhone || '',
            streetAddress: res.data.streetAddress || '',
            city: res.data.city || '',
            state: res.data.state || '',
            zipCode: res.data.zipCode || '',
            businessDescription: res.data.businessDescription || res.data.sicCode || '',
            naics: res.data.naics || '',
            energyConsumption: res.data.energyConsumption || '',
            isGrossSalesLessThan250M: res.data.isGrossSalesLessThan250M || '', 
            grossSales: res.data.grossSales || '',
            buildingSize: res.data.buildingSize || '',
            utilityExpenses: res.data.utilityExpenses || '',
            naturalGasProvider: res.data.naturalGasProvider || '', 
            electricityProvider: res.data.electricityProvider || '',
            naturalGasTransporter: res.data.naturalGasTransporter || '',
            referredBy: res.data.referredBy || '',
            description: res.data.description || ''
          });
        }
      } catch (err) {
        console.error("Error fetching profile data", err);
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    try {
      await api.put(`/profile/${user.id}`, formData);
      
      alert('Details Updated Successfully!');

      // ✅ NEW: Uses the URL check to return to the right dashboard
      if (isFromMainDashboard) {
          navigate('/dashboard');
      } else {
          navigate('/TemporaryDashboard');
      }

    } catch (err) {
      console.error(err);
      alert('Failed to update details.');
    }
  };

  if (loading) return <div className="p-10 text-center">Loading your details...</div>;

  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-[#FE5C00] pb-2 inline-block">
        My Information
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Company Name:<RequiredStar /></label>
                <input required type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Name:<RequiredStar /></label>
                <input required type="text" name="contactName" value={formData.contactName} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Email:<RequiredStar /></label>
                <input required type="email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} className="w-full border p-2 rounded bg-gray-100" readOnly />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Contact Phone:<RequiredStar /></label>
                <input required type="text" name="contactPhone" value={formData.contactPhone} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Street Address:<RequiredStar /></label>
                <input required type="text" name="streetAddress" value={formData.streetAddress} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">City:<RequiredStar /></label>
                <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1">State:<RequiredStar /></label>
                    <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
                <div className="w-1/2">
                    <label className="block text-sm font-bold mb-1">Zip code:<RequiredStar /></label>
                    <input required type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-full border p-2 rounded" />
                </div>
            </div>
             <div>
                <label className="block text-sm font-bold mb-1">Business Description:<RequiredStar /></label>
                <input required type="text" name="businessDescription" value={formData.businessDescription} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
             <div>
                <label className="block text-sm font-bold mb-1">NAICS Code:</label>
                <input required type="text" name="naics" value={formData.naics} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <label className="block text-sm font-bold mb-2">
                    Are your Annual Gross sales than $250 million?
                </label>
                
                <div className="flex items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="isGrossSalesLessThan250M" 
                            value="yes" 
                            checked={formData.isGrossSalesLessThan250M === 'yes'} 
                            onChange={handleChange} 
                            className="accent-[#FE5C00] w-4 h-4 cursor-pointer"
                        /> 
                        Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="isGrossSalesLessThan250M" 
                            value="no" 
                            checked={formData.isGrossSalesLessThan250M === 'no'} 
                            onChange={handleChange} 
                            className="accent-[#FE5C00] w-4 h-4 cursor-pointer"
                        /> 
                        No
                    </label>
                </div>

                {formData.isGrossSalesLessThan250M !== '' && (
                    <div className="animate-fade-in-down mt-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Please provide the amount: $</label>
                        <input 
                            type="text" 
                            name="grossSales" 
                            value={formData.grossSales} 
                            onChange={handleChange} 
                            className="w-full border p-2 rounded focus:ring-2 focus:ring-[#FE5C00]/20 outline-none transition" 
                            placeholder="e.g. 1500000"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Total Size of All Buildings (Sq Feet):<RequiredStar /></label>
                <input required type="text" name="buildingSize" value={formData.buildingSize} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Total Annual utility expenses (Gas & Electricity):$<RequiredStar /></label>
                <input required type="text" name="utilityExpenses" value={formData.utilityExpenses} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Natural Gas Provider:</label>
                <input type="text" name="naturalGasProvider" value={formData.naturalGasProvider} onChange={handleChange} className="w-full border p-2 rounded bg-white"/> 
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Natural Gas Transporter (If Applicable):</label>
                <input type="text" name="naturalGasTransporter" value={formData.naturalGasTransporter} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. ONG" />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Electricity Provider:</label>
                <input type="text" name="electricityProvider" value={formData.electricityProvider} onChange={handleChange} className="w-full border p-2 rounded bg-white"/>
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Referred By?</label>
                <input type="text" name="referredBy" value={formData.referredBy} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. LinkedIn, Friend, Event" />
            </div>

            <div>
                <label className="block text-sm font-bold mb-1">Additional details</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="w-full border p-2 rounded h-24"></textarea>
            </div>
        </div>

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