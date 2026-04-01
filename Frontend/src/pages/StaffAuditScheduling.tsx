import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const StaffAuditScheduling = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [date1, setDate1] = useState("");
  const [date2, setDate2] = useState("");
  const [date3, setDate3] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date1 && !date2 && !date3) {
        return alert("Please propose at least one date.");
    }

    setIsSubmitting(true);
    try {
      // Create an array of only the dates that were actually filled out
      const proposedDates = [date1, date2, date3].filter(d => d !== "");

      // NOTE: You will need to make sure your backend ClientProfile model 
      // can accept 'proposedAuditDates' and 'auditNotes' fields!
      await api.put(`/profile/${clientId}/schedule`, { 
          proposedAuditDates: proposedDates,
          auditNotes: notes
      });

      alert("Proposed dates have been sent to the client!");
      navigate('/staff-kanban'); // Send them back to the board
    } catch (err) {
      console.error(err);
      alert("Failed to send dates. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Scheduling Dashboard...</div>;
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
        <span className="text-sm font-bold text-black">Schedule Audit</span>
      </div>

      <div className="flex-1 max-w-4xl w-full mx-auto px-6 pb-12">
        
        {/* PAGE TITLE */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black mb-2">
                {profile.companyName} <span className="text-gray-400 font-medium text-2xl">({clientId?.substring(clientId.length - 6)})</span>
            </h1>
            <div className="h-1.5 bg-[#FE5C00] w-24 mx-auto rounded-full" />
            <p className="mt-4 text-gray-600 font-medium">Propose available dates for the on-site energy audit.</p>
        </div>

        {/* SCHEDULING FORM CARD */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-8 py-4 border-b border-gray-200 flex items-center gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#FE5C00]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h2 className="font-bold text-gray-800 text-xl">Select Available Dates</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                
                {/* DATES ROW */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Option 1 (Required)</label>
                        <input 
                            type="date" 
                            required
                            value={date1}
                            onChange={(e) => setDate1(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FE5C00] focus:border-transparent outline-none transition" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Option 2 (Optional)</label>
                        <input 
                            type="date" 
                            value={date2}
                            onChange={(e) => setDate2(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FE5C00] focus:border-transparent outline-none transition" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Option 3 (Optional)</label>
                        <input 
                            type="date" 
                            value={date3}
                            onChange={(e) => setDate3(e.target.value)}
                            className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FE5C00] focus:border-transparent outline-none transition" 
                        />
                    </div>
                </div>

                {/* TEXTAREA ROW */}
                <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                        Message / Instructions for the Client <span className="text-gray-400 font-normal">(Optional)</span>
                    </label>
                    <textarea 
                        rows={4}
                        placeholder="e.g., We will need access to the main breaker room. Please let us know which of these dates works best for your team."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-[#FE5C00] focus:border-transparent outline-none transition resize-none"
                    ></textarea>
                </div>

                {/* SUBMIT BUTTON */}
                <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`bg-[#FE5C00] hover:bg-orange-700 text-white px-10 py-3 rounded-lg shadow-md transition font-bold text-lg flex items-center gap-2
                            ${isSubmitting ? 'opacity-70 cursor-wait' : ''}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                        {isSubmitting ? 'Sending...' : 'Send Dates to Client'}
                    </button>
                </div>

            </form>
        </div>

      </div>
    </div>
  );
};

export default StaffAuditScheduling;