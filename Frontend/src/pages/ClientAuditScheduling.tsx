import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const ClientAuditScheduling = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Selection State
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [customDate, setCustomDate] = useState("");
  const [customTime, setCustomTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return navigate("/login");
        
        const user = JSON.parse(storedUser);
        const currentUserId = user._id || user.id;
        
        const res = await api.get(`/profile/${currentUserId}`);
        setProfile(res.data);
      } catch (err) {
        console.error("Failed to fetch profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) return alert("Please select a date option.");
    if (selectedOption === "custom" && (!customDate || !customTime)) {
        return alert("Please select both a date and time for your custom option.");
    }

    setIsSubmitting(true);
    try {
      const storedUser = localStorage.getItem("user");
      const user = JSON.parse(storedUser || "{}");
      const userId = user._id || user.id;

      // Determine the final date string to send to backend
      const finalDate = selectedOption === "custom" 
            ? `Client Proposed: ${customDate} at ${customTime}`
            : `Staff Proposed: ${selectedOption}`;

      await api.put(`/profile/${userId}/confirm-schedule`, { 
          confirmedAuditDate: finalDate 
      });

      alert("Audit Scheduled Successfully!");
      navigate('/dashboard'); 
    } catch (err) {
      console.error(err);
      alert("Failed to confirm schedule. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Schedule...</div>;

  const proposedDates = profile?.proposedAuditDates || [];

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 mb-8 flex items-center gap-3 shadow-sm">
        <Link to="/dashboard" className="text-gray-500 hover:text-[#FE5C00] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-500">Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-black">Schedule Audit</span>
      </div>

      <div className="flex-1 max-w-3xl w-full mx-auto px-6 pb-12">
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black mb-2">Schedule Your Audit</h1>
            <div className="h-1.5 bg-[#FE5C00] w-24 mx-auto rounded-full" />
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* STAFF NOTES SECTION */}
            {profile?.auditNotes && (
                <div className="bg-blue-50 p-6 border-b border-blue-100 flex gap-4 items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">Message from GPCoE ITAC Team:</h3>
                        <p className="text-blue-800 text-sm leading-relaxed">{profile.auditNotes}</p>
                    </div>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Please select a date that works for your team:</h3>
                
                <div className="space-y-4 mb-8">
                    {/* RENDER STAFF PROPOSED DATES */}
                    {proposedDates.map((date: string, index: number) => (
                        <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedOption === date ? 'border-[#FE5C00] bg-orange-50 ring-1 ring-[#FE5C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <input 
                                type="radio" 
                                name="auditDate" 
                                value={date} 
                                checked={selectedOption === date}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                className="h-5 w-5 text-[#FE5C00] focus:ring-[#FE5C00]"
                            />
                            <span className="ml-4 text-lg font-medium text-gray-700">{date}</span>
                        </label>
                    ))}

                    {/* CUSTOM DATE OPTION */}
                    <label className={`flex flex-col p-4 border rounded-lg cursor-pointer transition ${selectedOption === 'custom' ? 'border-[#FE5C00] bg-orange-50 ring-1 ring-[#FE5C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                        <div className="flex items-center">
                            <input 
                                type="radio" 
                                name="auditDate" 
                                value="custom" 
                                checked={selectedOption === "custom"}
                                onChange={(e) => setSelectedOption(e.target.value)}
                                className="h-5 w-5 text-[#FE5C00] focus:ring-[#FE5C00]"
                            />
                            <span className="ml-4 text-lg font-medium text-gray-700">None of these work. I would like to propose a different date:</span>
                        </div>
                        
                        {/* REVEAL DATE/TIME PICKERS IF SELECTED */}
                        {selectedOption === 'custom' && (
                            <div className="mt-4 ml-9 flex gap-4">
                                <input 
                                    type="date" 
                                    value={customDate}
                                    onChange={(e) => setCustomDate(e.target.value)}
                                    className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#FE5C00] outline-none"
                                />
                                <input 
                                    type="time" 
                                    value={customTime}
                                    onChange={(e) => setCustomTime(e.target.value)}
                                    className="border border-gray-300 p-2 rounded focus:ring-2 focus:ring-[#FE5C00] outline-none"
                                />
                            </div>
                        )}
                    </label>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`bg-[#FE5C00] hover:bg-orange-700 text-white px-10 py-3 rounded-lg shadow-md transition font-bold text-lg flex items-center gap-2 ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        {isSubmitting ? 'Confirming...' : 'Confirm Audit Date'}
                    </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default ClientAuditScheduling;