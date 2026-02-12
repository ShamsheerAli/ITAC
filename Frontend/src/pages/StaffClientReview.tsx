import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

// --- ICONS ---
const IconBack = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 hover:text-black transition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const StaffClientReview = () => {
  const { clientId } = useParams(); // Using correct param name
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<string>("Industrial TAC");

  useEffect(() => {
    const fetchClient = async () => {
      if (!clientId) return;
      try {
        const res = await api.get(`/profile/details/${clientId}`);
        setClient(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching client details", err);
        setLoading(false);
      }
    };
    fetchClient();
  }, [clientId]);

  const handleApprove = async () => {
    if (!confirm(`Are you sure you want to approve ${client?.companyName}?`)) return;
    try {
      await api.put(`/profile/status/${client._id}`, { status: 'Approved' });
      alert("Client Approved Successfully!");
      navigate('/staff-kanban');
    } catch (err) {
      alert("Failed to approve client.");
    }
  };

  const handleReject = async () => {
    if (!confirm("Are you sure you want to REJECT this client?")) return;
    try {
      await api.put(`/profile/status/${client._id}`, { status: 'Rejected' });
      alert("Client Rejected.");
      navigate('/staff-kanban');
    } catch (err) {
      alert("Failed to reject client.");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading Review Details...</div>;
  if (!client) return <div className="p-10 text-center text-red-500">Client not found.</div>;

  // SAFE ID ACCESS HELPER
  // Handles if user is populated (object) or raw string
  const displayId = client.user?._id 
    ? client.user._id.substring(client.user._id.length - 6) 
    : (typeof client.user === 'string' ? client.user.substring(client.user.length - 6) : 'N/A');

  return (
    <div className="min-h-screen bg-gray-50 p-6 font-sans">
      
      {/* TOP BAR */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-500 bg-white p-3 rounded-md shadow-sm border border-gray-200">
        <button onClick={() => navigate(-1)} className="p-1"><IconBack /></button>
        <span className="cursor-pointer hover:underline" onClick={() => navigate('/staff-kanban')}>Dashboard</span>
        <span>/</span>
        <span className="font-bold text-gray-800">Client Review</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        
        {/* LEFT COLUMN: CLIENT DETAILS */}
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden w-full">
            
            {/* HEADER SECTION */}
            <div className="p-8 border-b border-gray-200 bg-gray-50/50 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                    <img src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png" alt="Profile" className="w-full h-full object-cover" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        {client.companyName}
                        {/* FIXED: Safe ID Display */}
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md font-bold uppercase tracking-wide">
                            ID: {displayId}
                        </span>
                    </h1>
                    <p className="text-gray-500 mt-1">Contact: <span className="font-medium text-gray-700">{client.contactName}</span></p>
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="p-8">
                <h3 className="text-xl font-bold text-black border-b border-gray-200 pb-2 mb-6">Application Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="space-y-6">
                        <h4 className="text-[#FE5C00] font-bold text-sm uppercase tracking-wide">Contact Information</h4>
                        <InfoRow label="Email" value={client.contactEmail} />
                        <InfoRow label="Phone" value={client.contactPhone} />
                        <InfoRow label="Address" value={client.streetAddress} />
                        <InfoRow label="City, State, Zip" value={`${client.city}, ${client.state}, ${client.zipCode}`} />
                    </div>

                    <div className="space-y-6">
                        <h4 className="text-[#FE5C00] font-bold text-sm uppercase tracking-wide">Building & Operations</h4>
                        <InfoRow label="Building Size" value={client.buildingSize} />
                        <InfoRow label="Rural Location?" value="No" /> 
                        <InfoRow label="SIC Code" value={client.sicCode} />
                        <InfoRow label="NAICS" value={client.naics} />
                    </div>

                    <div className="space-y-6 pt-6 md:pt-0">
                        <h4 className="text-[#FE5C00] font-bold text-sm uppercase tracking-wide">Financials</h4>
                        <InfoRow label="Annual Utility Exp." value={client.utilityExpenses} />
                        <InfoRow label="Annual Energy Cons." value={client.energyConsumption} />
                        <InfoRow label="Annual Gross Sales" value={client.grossSales} />
                    </div>

                    <div className="space-y-6 pt-6 md:pt-0">
                        <h4 className="text-[#FE5C00] font-bold text-sm uppercase tracking-wide">Other Details</h4>
                        <InfoRow label="Previous Assessments" value="None" />
                        <InfoRow label="Agri. Production" value="N/A" />
                    </div>
                </div>

                <div className="mt-10">
                    <h4 className="text-gray-400 font-bold text-sm uppercase tracking-wide mb-2">Additional Notes</h4>
                    <div className="bg-gray-100 p-4 rounded-md text-gray-600 text-sm italic border border-gray-200">
                        {client.description || "No additional notes provided by the client."}
                    </div>
                </div>
            </div>
        </div>

        {/* RIGHT COLUMN: ACTION SIDEBAR */}
        <div className="w-full lg:w-96 bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-xl font-bold text-black mb-1">Review Action</h3>
            <p className="text-sm text-gray-500 mb-6">Select a service level to approve</p>

            <div className="space-y-3 mb-8">
                <ServiceOption label="Industrial TAC" selected={selectedService === "Industrial TAC"} onClick={() => setSelectedService("Industrial TAC")} />
                <ServiceOption label="Commercial ITAC" selected={selectedService === "Commercial ITAC"} onClick={() => setSelectedService("Commercial ITAC")} />
                <ServiceOption label="REAC" selected={selectedService === "REAC"} onClick={() => setSelectedService("REAC")} />
            </div>

            <div className="space-y-4">
                <button onClick={handleApprove} className="w-full bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-3 rounded shadow-sm transition">Approve & Assign</button>
                <button onClick={handleReject} className="w-full bg-white hover:bg-red-50 text-red-600 border border-red-200 font-bold py-3 rounded shadow-sm transition flex items-center justify-center gap-2">✕ Reject Client</button>
            </div>
        </div>

      </div>
    </div>
  );
};

// HELPER COMPONENTS
const InfoRow = ({ label, value }: { label: string, value: string }) => (
    <div>
        <span className="block text-xs text-gray-400 font-bold uppercase">{label}</span>
        <span className="block text-gray-800 font-medium">{value || "N/A"}</span>
    </div>
);

const ServiceOption = ({ label, selected, onClick }: any) => (
    <div onClick={onClick} className={`flex items-center p-3 rounded-md border cursor-pointer transition-all ${selected ? 'border-[#FE5C00] bg-orange-50 ring-1 ring-[#FE5C00]' : 'border-gray-200 hover:bg-gray-50'}`}>
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center mr-3 ${selected ? 'border-[#FE5C00]' : 'border-gray-400'}`}>
            {selected && <div className="w-2 h-2 rounded-full bg-[#FE5C00]" />}
        </div>
        <span className={`font-medium ${selected ? 'text-[#FE5C00]' : 'text-gray-700'}`}>{label}</span>
    </div>
);

export default StaffClientReview;