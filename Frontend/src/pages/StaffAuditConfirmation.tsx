import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const StaffAuditConfirmation = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/profile/details/${clientId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch client details", err);
      } finally {
        setLoading(false);
      }
    };
    if (clientId) fetchProfile();
  }, [clientId]);

  const handleConfirm = async () => {
    try {
      // Tell the backend to set isAuditConfirmed to true
      await api.put(`/profile/${clientId}/staff-confirm-audit`);
      alert("Audit schedule officially confirmed and locked in!");
      navigate('/staff-kanban');
    } catch (err) {
      console.error(err);
      alert("Failed to confirm the audit date.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Audit Details...</div>;
  if (!profile) return <div className="p-10 text-center text-red-500">Client not found.</div>;

  return (
    <div className="w-full min-h-screen flex flex-col relative bg-gray-50 font-sans">
      
      {/* HEADER & BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 mb-8 flex items-center gap-3 shadow-sm">
        <Link to="/staff-kanban" className="text-gray-500 hover:text-[#FE5C00] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-500">Staff Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-black">Audit Confirmation</span>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 pb-12">
        
        {/* PAGE TITLE */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black mb-2">
                {profile.companyName} <span className="text-gray-400 font-medium text-2xl">({clientId?.substring(clientId.length - 6)})</span>
            </h1>
            <div className="h-1.5 bg-[#FE5C00] w-24 mx-auto rounded-full" />
        </div>

        {/* CONFIRMATION CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden text-center p-10">
            <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Client Selected Date</h2>
            <p className="text-lg text-gray-600 mb-8">The client has responded and requested the following time for their audit:</p>
            
            <div className="bg-orange-50 border-2 border-[#FE5C00] rounded-lg p-6 inline-block mb-10 min-w-[300px]">
                <p className="text-xl font-extrabold text-[#FE5C00]">
                    {profile.confirmedAuditDate || "No date selected yet."}
                </p>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 border-t border-gray-100 pt-8">
                
                {/* Send Message Button */}
                <Link to={`/staff-inbox/${clientId}`} className="w-full sm:w-auto">
                    <button className="w-full bg-white hover:bg-gray-50 text-gray-700 border-2 border-gray-300 px-8 py-3 rounded-lg shadow-sm transition font-bold text-lg flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        Message Client
                    </button>
                </Link>

                {/* Confirm Button */}
                <button 
                    onClick={handleConfirm}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-10 py-3 rounded-lg shadow-md transition font-bold text-lg flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    Looks Good, Confirm
                </button>

            </div>
        </div>

      </div>
    </div>
  );
};

export default StaffAuditConfirmation;