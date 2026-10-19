import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";

const ClientAuditScheduling = () => {
    const navigate = useNavigate();
    const { facilityId } = useParams(); 
    
    const [facility, setFacility] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState("");
    const [saving, setSaving] = useState(false);
    
    // 🚨 NEW: States to handle counter-proposals
    const [isAlternative, setIsAlternative] = useState(false);
    const [alternativeDates, setAlternativeDates] = useState("");

    useEffect(() => {
        const fetchFacility = async () => {
            if (!facilityId) {
                navigate('/dashboard');
                return;
            }
            try {
                const res = await api.get(`/profile/details/${facilityId}`);
                setFacility(res.data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching facility", err);
                setLoading(false);
            }
        };
        fetchFacility();
    }, [facilityId, navigate]);

    const handleConfirmSchedule = async () => {
        if (!isAlternative && !selectedDate) {
            alert("Please select an audit date to confirm.");
            return;
        }
        if (isAlternative && !alternativeDates.trim()) {
            alert("Please propose alternative dates that work for your team.");
            return;
        }

        setSaving(true);
        try {
            // 🚨 Send the payload with the rescheduling flags
            await api.put(`/profile/${facilityId}/confirm-schedule`, {
                confirmedAuditDate: isAlternative ? `Client requested new dates: ${alternativeDates}` : selectedDate,
                isRescheduling: isAlternative,
                alternativeDates: alternativeDates
            });
            
            if (isAlternative) {
                alert("Alternative dates submitted! Our staff will review and update your schedule.");
            } else {
                alert("Audit date confirmed successfully! The staff has been notified.");
            }
            
            navigate('/dashboard');
        } catch (err) {
            console.error("Error confirming schedule", err);
            alert("Failed to confirm schedule. Please try again.");
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Loading schedule details...</div>;
    if (!facility) return <div className="p-10 text-center text-red-500">Facility not found.</div>;

    const proposedDates = Array.isArray(facility.proposedAuditDates) 
        ? facility.proposedAuditDates 
        : (typeof facility.proposedAuditDates === 'string' && facility.proposedAuditDates.trim() !== '' 
            ? facility.proposedAuditDates.split(',').map((d: string) => d.trim()) 
            : []);

    return (
        <div className="max-w-4xl mx-auto w-full pb-12">
            
            <div className="mb-8 flex items-center gap-2 text-sm">
                <Link to="/dashboard" className="text-gray-500 hover:text-[#FE5C00] transition">My Portfolio</Link>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-gray-800">Schedule Audit</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-green-50 border-b border-green-200 px-8 py-6">
                    <h1 className="text-2xl font-black text-green-900 mb-2">Schedule Your Assessment</h1>
                    <p className="text-green-700">Our engineers have reviewed your facility data and proposed the following dates for your on-site audit.</p>
                </div>

                <div className="p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6">Proposed Dates for {facility.companyName}</h3>
                    
                    {facility.auditNotes && (
                        <div className="mb-8 bg-gray-50 p-5 rounded-lg border border-gray-200">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Notes from Staff:</h4>
                            <p className="text-gray-800">{facility.auditNotes}</p>
                        </div>
                    )}

                    {proposedDates.length > 0 ? (
                        <div className="space-y-3 mb-8">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">Please select one of the proposed dates:</h4>
                            
                            {proposedDates.map((date: string, index: number) => (
                                <label key={index} className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedDate === date && !isAlternative ? 'border-[#FE5C00] bg-orange-50 ring-1 ring-[#FE5C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                    <input 
                                        type="radio" 
                                        name="auditDate" 
                                        checked={selectedDate === date && !isAlternative}
                                        onChange={() => {
                                            setSelectedDate(date);
                                            setIsAlternative(false);
                                        }}
                                        className="w-5 h-5 accent-[#FE5C00] mr-4 cursor-pointer"
                                    />
                                    <span className="font-bold text-gray-800 text-lg">{date}</span>
                                </label>
                            ))}

                            {/* 🚨 THE NEW COUNTER-PROPOSAL OPTION */}
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${isAlternative ? 'border-[#FE5C00] bg-orange-50 ring-1 ring-[#FE5C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
                                <input 
                                    type="radio" 
                                    name="auditDate" 
                                    checked={isAlternative}
                                    onChange={() => {
                                        setIsAlternative(true);
                                        setSelectedDate("");
                                    }}
                                    className="w-5 h-5 accent-[#FE5C00] mr-4 cursor-pointer"
                                />
                                <span className="font-bold text-gray-800 text-lg">None of these dates work for me</span>
                            </label>

                            {isAlternative && (
                                <div className="mt-4 p-4 border-l-4 border-[#FE5C00] bg-orange-50/50 rounded-r-lg animate-fade-in-down">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Please propose 2-3 alternative dates or timeframes:</label>
                                    <textarea 
                                        value={alternativeDates}
                                        onChange={(e) => setAlternativeDates(e.target.value)}
                                        className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-[#FE5C00] outline-none resize-none"
                                        rows={3}
                                        placeholder="e.g., We are available the first week of November, preferably on a Tuesday or Thursday..."
                                    />
                                </div>
                            )}

                        </div>
                    ) : (
                        <div className="mb-8">
                            <h4 className="text-sm font-bold text-gray-700 mb-3">No specific dates were proposed. Please select a preferred date below:</h4>
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={(e) => {
                                    setSelectedDate(e.target.value);
                                    setIsAlternative(false);
                                }}
                                className="p-4 border border-gray-300 rounded-lg w-full max-w-sm focus:ring-2 focus:ring-[#FE5C00] outline-none font-bold text-gray-700"
                            />
                        </div>
                    )}

                    <div className="pt-8 border-t border-gray-100 flex justify-end gap-4">
                        <Link to="/dashboard">
                            <button type="button" className="px-6 py-3 font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition">
                                Decide Later
                            </button>
                        </Link>
                        <button 
                            onClick={handleConfirmSchedule}
                            disabled={saving}
                            className={`px-8 py-3 font-bold text-white rounded transition shadow-md
                                ${saving ? 'bg-orange-300 cursor-wait' : 'bg-[#FE5C00] hover:bg-orange-700'}`}
                        >
                            {saving ? 'Submitting...' : (isAlternative ? 'Submit Alternative Dates' : 'Confirm Audit Date')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ClientAuditScheduling;