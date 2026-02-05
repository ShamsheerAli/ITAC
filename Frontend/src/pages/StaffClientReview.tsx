import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const StaffClientReview = () => {
  const { clientId } = useParams();
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [popupType, setPopupType] = useState<"approve" | "reject" | null>(null);

  const handleApprove = () => {
    if (selectedService) {
      setPopupType("approve");
    } else {
      alert("Please select a service type first.");
    }
  };

  return (
    <div className="w-full min-h-full flex flex-col relative bg-gray-50">
      
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 mb-8 flex items-center gap-3 shadow-sm">
        <Link to="/staff-kanban" className="text-gray-500 hover:text-[#FE5C00] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-500">Staff Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-black">Client Review</span>
      </div>

      {/* 2. MAIN LAYOUT: TWO COLUMNS */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-6 lg:px-12 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* --- LEFT COLUMN: CLIENT DETAILS (Takes up 2/3 space) --- */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* CLIENT HEADER SECTION */}
            <div className="bg-slate-50 p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                    <img
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                        alt="Client Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                {/* Title Info */}
                <div className="text-center md:text-left flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-1">
                         <h1 className="text-2xl font-bold text-black">ITW Paslode Power Nailing</h1>
                         <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                            {clientId || "OK1165"}
                         </span>
                    </div>
                    <p className="text-gray-500 font-medium">Contact: Steven Simpson</p>
                </div>
            </div>

            {/* DATA GRID SECTION */}
            <div className="p-8">
                <h3 className="text-lg font-bold text-black mb-6 border-b border-gray-100 pb-2">
                    Application Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    <DetailGroup title="Contact Information">
                        <DetailRow label="Email" value="ssimpso@paslode.com" />
                        <DetailRow label="Phone" value="224-532-8454" />
                        <DetailRow label="Address" value="1600 Patrick Dr" />
                        <DetailRow label="City, State, Zip" value="Pocahontas, AR, 72455" />
                    </DetailGroup>

                    <DetailGroup title="Building & Operations">
                        <DetailRow label="Building Size" value="90,000 sq ft" />
                        <DetailRow label="Rural Location?" value="No" />
                        <DetailRow label="SIC Code" value="12345" />
                        <DetailRow label="NAICS" value="N/A" />
                    </DetailGroup>

                    <DetailGroup title="Financials">
                        <DetailRow label="Annual Utility Exp." value="$ 20,000" />
                        <DetailRow label="Annual Energy Cons." value="$ 70,000" />
                        <DetailRow label="Annual Gross Sales" value="$ 100,000" />
                    </DetailGroup>

                    <DetailGroup title="Other Details">
                        <DetailRow label="Previous Assessments" value="None" />
                        <DetailRow label="Agri. Production" value="N/A" />
                        <DetailRow label="Wastewater Size" value="4 million gal/day" />
                    </DetailGroup>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-bold uppercase mb-2">Additional Notes</p>
                    <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm italic">
                        No additional notes provided by the client.
                    </p>
                </div>
            </div>
        </div>


        {/* --- RIGHT COLUMN: ACTIONS (Takes up 1/3 space) --- */}
        <div className="lg:col-span-1 space-y-6 sticky top-6">
            
            {/* DECISION CARD */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-black mb-1">Review Action</h2>
                <p className="text-sm text-gray-500 mb-6">Select a service level to approve.</p>
                
                {/* Service Selection */}
                <div className="space-y-3 mb-8">
                    <ServiceOption 
                        id="industrial" 
                        label="Industrial TAC" 
                        selected={selectedService === "Industrial TAC"} 
                        onClick={() => setSelectedService("Industrial TAC")} 
                    />
                    <ServiceOption 
                        id="commercial" 
                        label="Commercial ITAC" 
                        selected={selectedService === "Commercial ITAC"} 
                        onClick={() => setSelectedService("Commercial ITAC")} 
                    />
                    <ServiceOption 
                        id="reac" 
                        label="REAC" 
                        selected={selectedService === "REAC"} 
                        onClick={() => setSelectedService("REAC")} 
                    />
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button 
                        onClick={handleApprove}
                        className="w-full bg-[#FE5C00] hover:bg-orange-700 text-white py-4 rounded-lg shadow-md transition font-bold text-lg flex items-center justify-center gap-2 group"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Approve & Assign
                    </button>

                    <button 
                        onClick={() => setPopupType("reject")}
                        className="w-full bg-white hover:bg-gray-50 text-red-600 border border-red-200 py-3 rounded-lg transition font-semibold text-lg flex items-center justify-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        Reject Client
                    </button>
                </div>
            </div>
        </div>

      </div>

      {/* 3. POPUP MODAL */}
      {popupType && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl relative p-8 text-center animate-fade-in-up">
                
                {/* Icon Circle */}
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${popupType === 'approve' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                    {popupType === 'approve' ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {popupType === "approve" ? "Client Approved!" : "Client Rejected"}
                </h3>
                
                <p className="text-gray-500 mb-8 leading-relaxed">
                    {popupType === "approve" ? (
                        <>You have selected this client for <strong>{selectedService}</strong> services. An automated message will be sent regarding next steps.</>
                    ) : (
                        "Client has been marked as not eligible for services. An automated rejection message will be sent."
                    )}
                </p>

                <button 
                    onClick={() => setPopupType(null)}
                    className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition"
                >
                    Close
                </button>

            </div>
        </div>
      )}

    </div>
  );
};

/* --- SUB-COMPONENTS FOR CLEANER CODE --- */

// Helper for grouping details
const DetailGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-4">
        <h4 className="text-xs font-bold text-[#FE5C00] uppercase tracking-wider mb-2">{title}</h4>
        <div className="space-y-3 pl-2 border-l-2 border-gray-100">
            {children}
        </div>
    </div>
);

// Helper for a single row of data
const DetailRow = ({ label, value }: { label: string, value: string }) => (
    <div>
        <span className="block text-xs text-gray-400 font-medium mb-0.5">{label}</span>
        <span className="block text-sm font-semibold text-gray-800">{value}</span>
    </div>
);

// Helper for Radio Button Cards
const ServiceOption = ({ id, label, selected, onClick }: { id: string, label: string, selected: boolean, onClick: () => void }) => (
    <div 
        onClick={onClick}
        className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${selected 
                ? "border-[#FE5C00] bg-orange-50 text-[#FE5C00]" 
                : "border-gray-100 hover:border-orange-200 bg-gray-50 text-gray-600"
            }
        `}
    >
        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
            ${selected ? "border-[#FE5C00]" : "border-gray-300"}
        `}>
            {selected && <div className="w-2.5 h-2.5 rounded-full bg-[#FE5C00]" />}
        </div>
        <span className={`font-bold ${selected ? "text-[#FE5C00]" : "text-gray-700"}`}>
            {label}
        </span>
    </div>
);

export default StaffClientReview;