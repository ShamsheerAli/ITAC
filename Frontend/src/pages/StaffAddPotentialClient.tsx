import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios"; // 🚨 ADDED API IMPORT

const StaffAddPotentialClient = () => {
  const navigate = useNavigate(); // 🚨 ADDED NAVIGATE

  const [formData, setFormData] = useState({
    companyName: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    leadSource: "",
    variationType: "",
    fundingType: "",
    extraInfo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🚨 UPDATED: Now it actually talks to the backend!
  const handleSave = async () => {
    if (!formData.companyName) {
        alert("Company Name is required!");
        return;
    }

    try {
        // Send the data to the backend
        await api.post('/leads', formData);
        
        // Notify the user
        alert("Potential Client saved successfully!");
        
        // Bounce the staff member back to the Leads table to see the new entry
        navigate('/staff-leads'); 
    } catch (err) {
        console.error("Error saving lead:", err);
        alert("Failed to save potential client. Please try again.");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-50 font-sans">
      
      {/* MAIN FORM CARD */}
      <div className="flex-1 flex justify-center py-10">
        <div className="w-full max-w-4xl bg-white shadow-lg rounded-xl p-10 border border-gray-200">
            
            {/* TOP HEADER */}
            <div className="mb-10">
                <h1 className="text-3xl font-bold text-black text-center">Add Potential Client</h1>
                <div className="h-1.5 bg-[#FE5C00] w-full mt-4 rounded-full max-w-md mx-auto" />
            </div>

            {/* COMPANY NAME SECTION */}
            <div className="flex flex-col items-center mb-10">
                <div className="flex items-center gap-4 w-full justify-center mb-4">
                    <label className="text-xl text-black font-bold">Company Name:</label>
                    <input 
                        type="text" 
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        className="w-1/2 border-2 border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#FE5C00] transition"
                        placeholder="Enter company name..."
                    />
                </div>
            </div>

            {/* FORM FIELDS GRID */}
            <div className="w-full max-w-2xl mx-auto space-y-6 text-lg">
                
                <FormRow label="Contact Name" name="contactName" value={formData.contactName} onChange={handleChange} />
                <FormRow label="Contact Email" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
                <FormRow label="Contact Phone" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />

                {/* Address Block */}
                <div className="w-full border-b border-gray-200 pb-6 space-y-4 pt-4">
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-48 text-right text-gray-700 font-medium">Street Address:</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-72 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#FE5C00]" />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-48 text-right text-gray-700 font-medium">City, State:</label>
                        <div className="w-72 flex gap-2">
                             <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" className="w-2/3 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#FE5C00]" />
                             <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="ST" className="w-1/3 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#FE5C00]" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-48 text-right text-gray-700 font-medium">Zip code:</label>
                        <div className="w-72">
                            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} className="w-32 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#FE5C00]" /> 
                        </div>
                    </div>
                </div>

                <FormRow label="Lead Source" name="leadSource" value={formData.leadSource} onChange={handleChange} placeholder="How did we get this client?" />
                <FormRow label="Variation type" name="variationType" value={formData.variationType} onChange={handleChange} />
                <FormRow label="Funding Type" name="fundingType" value={formData.fundingType} onChange={handleChange} />

                {/* EXTRA INFORMATION / NOTES */}
                <div className="w-full flex items-start justify-center gap-4 pt-4">
                  <label className="w-48 text-right text-gray-700 font-medium pt-2">
                    Extra Information:
                  </label>
                  <textarea
                    name="extraInfo"
                    value={formData.extraInfo}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Add any internal notes or details about this potential client..."
                    className="w-72 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-[#FE5C00] resize-none"
                  />
                </div>

            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-center mt-12">
                <button 
                  onClick={handleSave}
                  className="bg-[#FE5C00] text-white px-16 py-3 rounded shadow-md hover:bg-orange-700 transition font-bold text-xl uppercase tracking-wider"
                >
                    Save Potential Client
                </button>
            </div>

        </div>
      </div>
    </div>
  );
};

/* --- REUSABLE ROW COMPONENT --- */
const FormRow = ({ label, name, value, onChange, placeholder }: any) => {
  return (
    <div className="w-full flex items-center justify-center gap-4 border-b border-gray-200 pb-4">
      <label className="w-48 text-right text-gray-700 font-medium whitespace-nowrap">
        {label}:
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-72 border border-gray-300 rounded px-3 py-2 outline-none focus:border-[#FE5C00]"
      />
    </div>
  );
};

export default StaffAddPotentialClient;