import { useState, useEffect } from "react";
import api from '../api/axios';
import { useNavigate } from "react-router-dom";

// Component for Input Fields
const FormRow = ({ label, name, value, onChange, wide }: any) => {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <label className="block mb-2 font-bold text-lg text-gray-800">{label}:</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        className="w-full border border-black rounded-md px-4 py-3 outline-none focus:border-[#FE5C00] text-lg bg-white"
      />
    </div>
  );
};

const UpdateDetails = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    companyName: '', contactName: '', contactEmail: '', contactPhone: '',
    streetAddress: '', city: '', state: '', zipCode: '',
    sicCode: '', naics: '', energyConsumption: '', grossSales: '',
    buildingSize: '', utilityExpenses: '', description: ''
  });

  const [userId, setUserId] = useState<string | null>(null);

  // 1. Load Data on Page Load
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        const user = JSON.parse(userStr);
        setUserId(user.id);

        // Fetch existing profile
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/${user.id}`);
                setFormData(res.data); // Pre-fill form
            } catch (err) {
                console.log("No profile found, creating new one.");
            }
        };
        fetchProfile();
    }
  }, []);

  // 2. Handle Inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Save Data
  const handleSave = async () => {
    if (!userId) return alert("Please log in first.");

    try {
        await api.post('/profile', { ...formData, userId });
        alert("Information Saved Successfully!");
        navigate('/TemporaryDashboard'); // Redirect to Dashboard after saving
    } catch (err) {
        console.error(err);
        alert("Failed to save information.");
    }
  };

  return (
    <div className="w-full h-full">
      <div className="w-full bg-white rounded-xl px-12 py-10 shadow-sm border border-gray-100">
        <h2 className="text-3xl font-bold text-center text-black">My Information</h2>
        <div className="h-1.5 bg-[#FE5C00] w-full mt-4 mb-10" />

        {/* FORM GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-8">
          <div className="space-y-6">
            <FormRow label="Company Name" name="companyName" value={formData.companyName} onChange={handleChange} wide />
            <FormRow label="Contact Name" name="contactName" value={formData.contactName} onChange={handleChange} />
            <FormRow label="Contact Email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
            <FormRow label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
            
            <FormRow label="Street Address" name="streetAddress" value={formData.streetAddress} onChange={handleChange} />
            <FormRow label="City" name="city" value={formData.city} onChange={handleChange} />
            <div className="flex gap-6">
              <FormRow label="State" name="state" value={formData.state} onChange={handleChange} />
              <FormRow label="Zip code" name="zipCode" value={formData.zipCode} onChange={handleChange} />
            </div>

            <FormRow label="SIC Code" name="sicCode" value={formData.sicCode} onChange={handleChange} />
            <FormRow label="NAICS" name="naics" value={formData.naics} onChange={handleChange} />
          </div>

          <div className="space-y-6">
            <FormRow label="Annual Energy Consumption" name="energyConsumption" value={formData.energyConsumption} onChange={handleChange} />
            <FormRow label="Annual Gross sales" name="grossSales" value={formData.grossSales} onChange={handleChange} />
            <FormRow label="Building Size" name="buildingSize" value={formData.buildingSize} onChange={handleChange} />
            <FormRow label="Annual utility expenses" name="utilityExpenses" value={formData.utilityExpenses} onChange={handleChange} />
            
            <div>
              <label className="block mb-2 font-bold text-lg text-gray-800">Additional details</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full h-40 border border-black rounded-md px-4 py-3 outline-none focus:border-[#FE5C00] text-lg" 
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-16">
          <button onClick={handleSave} className="bg-[#FE5C00] text-white px-12 py-3 rounded shadow hover:bg-orange-700 transition font-bold text-xl">
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDetails;