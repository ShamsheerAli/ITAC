import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const ClientNewFacility = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    contactEmail: '',
    secondaryEmail: '',
    contactPhone: '',
    streetAddress: '',
    city: '',
    state: '',
    zipCode: '',
    businessDescription: '', 
    naicsCode: '', // 🚨 Mapped for Staff View
    annualEnergyCons: '', // 🚨 Mapped for Staff View
    grossSalesUnder250M: '', // 🚨 Mapped for Staff View
    annualGrossSales: '', // 🚨 Mapped for Staff View               
    buildingSize: '',
    annualUtilityExp: '', // 🚨 Mapped for Staff View
    naturalGasProvider: '', 
    electricityProvider: '', 
    naturalGasTransporter: '', 
    referredBy: '', 
    description: ''
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setFormData(prev => ({
            ...prev,
            contactName: user.name || '',
            contactEmail: user.email || ''
        }));
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    const user = JSON.parse(storedUser);

    try {
      // POST to create a brand new facility
      await api.post(`/profile/new-facility`, {
          userId: user.id || user._id,
          ...formData
      });
      
      alert('Facility Registered Successfully!');
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      alert('Failed to register facility.');
    } finally {
      setLoading(false);
    }
  };

  const RequiredStar = () => <span className="text-red-500 ml-1">*</span>;

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow mt-10 mb-10">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-[#FE5C00] pb-2 inline-block">
        Register New Facility
      </h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN */}
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-bold mb-1">Company / Facility Name:<RequiredStar /></label>
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
                <label className="block text-sm font-bold mb-1">Secondary Email:</label>
                <input type="email" name="secondaryEmail" value={formData.secondaryEmail} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Optional backup email" />
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
                <input type="text" name="naicsCode" value={formData.naicsCode} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded border border-gray-100">
                <label className="block text-sm font-bold mb-2">
                    Are your Annual Gross sales less than $250 million?
                </label>
                
                <div className="flex items-center gap-6 mb-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="grossSalesUnder250M" 
                            value="Yes" 
                            checked={formData.grossSalesUnder250M === 'Yes'} 
                            onChange={handleChange} 
                            className="accent-[#FE5C00] w-4 h-4 cursor-pointer"
                        /> 
                        Yes
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                            type="radio" 
                            name="grossSalesUnder250M" 
                            value="No" 
                            checked={formData.grossSalesUnder250M === 'No'} 
                            onChange={handleChange} 
                            className="accent-[#FE5C00] w-4 h-4 cursor-pointer"
                        /> 
                        No
                    </label>
                </div>

                {formData.grossSalesUnder250M !== '' && (
                    <div className="animate-fade-in-down mt-2">
                        <label className="block text-xs font-bold text-gray-600 mb-1">Please provide the amount: $</label>
                        <input 
                            type="text" 
                            name="annualGrossSales" 
                            value={formData.annualGrossSales} 
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
                <label className="block text-sm font-bold mb-1">Total Annual Utility Expenses (Gas & Electricity):$<RequiredStar /></label>
                <input required type="text" name="annualUtilityExp" value={formData.annualUtilityExp} onChange={handleChange} className="w-full border p-2 rounded" />
            </div>
            <div>
                <label className="block text-sm font-bold mb-1">Total Annual Energy Consumption:</label>
                <input type="text" name="annualEnergyCons" value={formData.annualEnergyCons} onChange={handleChange} className="w-full border p-2 rounded" placeholder="e.g. 500,000 kWh" />
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
            <button type="submit" disabled={loading} className={`text-white font-bold py-3 px-12 rounded shadow-lg transition uppercase ${loading ? 'bg-orange-400' : 'bg-[#FE5C00] hover:bg-orange-700'}`}>
                {loading ? 'Registering...' : 'Complete Registration'}
            </button>
        </div>

      </form>
    </div>
  );
};

export default ClientNewFacility;