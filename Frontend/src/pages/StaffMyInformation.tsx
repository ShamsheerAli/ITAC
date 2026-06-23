import { useState, useEffect } from "react";
import api from "../api/axios";

const StaffMyInformation = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  // State to hold the real form data
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    email: "",
    phone: "",
    linkedIn: "",
    facebook: ""
  });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const currentUserId = parsedUser._id || parsedUser.id;
      setUserId(currentUserId);

      // Fetch extended profile data from the backend
      const fetchProfile = async () => {
        try {
          const res = await api.get(`/profile/staff/${currentUserId}`);
          
          if (res.data) {
            setFormData({
              name: res.data.contactName || parsedUser.name || "",
              position: res.data.position || "",
              email: parsedUser.email || "", // Email comes from the auth object
              phone: res.data.contactPhone || "",
              linkedIn: res.data.linkedIn || "",
              facebook: res.data.facebook || ""
            });
          }
        } catch (err) {
          console.log("No extended profile found, defaulting to base login data.");
          // If no profile exists yet, at least fill in the name and email from login
          setFormData(prev => ({
            ...prev,
            name: parsedUser.name || "",
            email: parsedUser.email || ""
          }));
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!userId) return;

    try {
      // Send the updated fields to your backend
      await api.put(`/profile/staff/${userId}`, {
        contactName: formData.name,
        position: formData.position,
        contactPhone: formData.phone,
        linkedIn: formData.linkedIn,
        facebook: formData.facebook
      });
      
      alert("Information updated successfully!");
    } catch (err) {
      console.error("Error updating information", err);
      alert("Failed to update information. Please try again.");
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-500 font-medium">Loading Information...</div>;

  return (
    <div className="w-full h-full flex flex-col font-sans">
      
      {/* MAIN CONTENT CARD */}
      <div className="flex-1 flex justify-center items-start pt-10">
        <div className="w-full max-w-2xl bg-gray-200 rounded-lg overflow-hidden shadow-sm pb-10">
          
          {/* Card Header */}
          <div className="bg-gray-600 text-white text-center py-4 font-bold text-2xl tracking-wide">
            My Information
          </div>

          {/* Form Fields - Note the image section is completely removed! */}
          <div className="px-12 space-y-4 pt-12">
            
            <InfoRow 
                label="Name" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
            />
            <InfoRow 
                label="Position" 
                name="position" 
                value={formData.position} 
                onChange={handleChange} 
                placeholder="e.g. Director, Engineer"
            />
            
            {/* Email is usually read-only since it's tied to their login credentials */}
            <InfoRow 
                label="Email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                disabled={true} 
            />
            
            <InfoRow 
                label="Phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                placeholder="+1 000-000-0000"
            />
            <InfoRow 
                label="LinkedIn" 
                name="linkedIn" 
                value={formData.linkedIn} 
                onChange={handleChange} 
                placeholder="Paste link here" 
            />
            <InfoRow 
                label="Facebook" 
                name="facebook" 
                value={formData.facebook} 
                onChange={handleChange} 
                placeholder="Paste link here" 
            />

          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-10">
             <button 
                onClick={handleSave}
                className="bg-[#FE5C00] text-white px-12 py-2 rounded shadow hover:bg-orange-700 transition font-bold text-xl uppercase tracking-wider border-2 border-white/20 active:scale-95"
             >
                Save
             </button>
          </div>

        </div>
      </div>

    </div>
  );
};

/* --- REUSABLE CONTROLLED INPUT ROW COMPONENT --- */
const InfoRow = ({ label, name, value, onChange, placeholder, disabled = false }: any) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <label className="w-32 text-right text-black text-lg font-serif">
        {label}:
      </label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-64 px-3 py-1 rounded border border-transparent outline-none text-black shadow-sm font-serif transition
            ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'bg-white focus:border-[#FE5C00]'}`}
      />
    </div>
  );
};

export default StaffMyInformation;