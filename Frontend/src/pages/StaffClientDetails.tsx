import { useState } from "react";
import { Link, useParams } from "react-router-dom";

const StaffClientDetails = () => {
  const { clientId } = useParams();
  
  // State to toggle between View and Edit modes
  const [isEditing, setIsEditing] = useState(false);

  // Mock Data State (So we can edit it)
  const [clientData, setClientData] = useState({
    companyName: "ITW Paslode Power Nailing",
    contactName: "Steven Simpson",
    email: "ssimpso@paslode.com",
    phone: "224-532-8454",
    address: "1600 Patrick Dr",
    cityStateZip: "Pocahontas, AR, 72455",
    buildingSize: "90,000 sq ft",
    rural: "No",
    sicCode: "12345",
    naics: "N/A",
    utilityExp: "20,000",
    energyCons: "70,000",
    grossSales: "100,000",
    prevAssessments: "None",
    agriProd: "N/A",
    wasteWater: "4 million gal/day",
    notes: "No additional notes provided by the client."
  });

  // Handler for input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setClientData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="w-full min-h-full flex flex-col relative bg-gray-50">
      
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 mb-8 flex items-center gap-3 shadow-sm">
        <Link to="/staff-dashboard" className="text-gray-500 hover:text-[#FE5C00] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-500">Dashboard</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-black">Client Details</span>
      </div>

      {/* 2. MAIN CARD */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            {/* PROFILE HEADER */}
            <div className="bg-slate-50 p-8 border-b border-gray-100 flex flex-col md:flex-row items-center gap-6">
                <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden flex-shrink-0">
                    <img
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                        alt="Client Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
                <div className="text-center md:text-left flex-1 w-full">
                    <div className="flex flex-col md:flex-row items-center gap-3 mb-1">
                         {isEditing ? (
                             <input 
                                type="text" 
                                name="companyName"
                                value={clientData.companyName}
                                onChange={handleChange}
                                className="text-2xl font-bold text-black border-b-2 border-[#FE5C00] outline-none bg-transparent w-full md:w-auto"
                             />
                         ) : (
                             <h1 className="text-2xl font-bold text-black">{clientData.companyName}</h1>
                         )}
                         
                         <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">
                            {clientId || "OK1165"}
                         </span>
                    </div>
                    <p className="text-gray-500 font-medium">Contact: {clientData.contactName}</p>
                </div>
            </div>

            {/* DETAILS GRID */}
            <div className="p-8">
                <h3 className="text-xl font-bold text-black mb-6">Application Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-10">
                    
                    <DetailGroup title="Contact Information">
                        <Field label="Email" name="email" value={clientData.email} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Phone" name="phone" value={clientData.phone} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Address" name="address" value={clientData.address} isEditing={isEditing} onChange={handleChange} />
                        <Field label="City, State, Zip" name="cityStateZip" value={clientData.cityStateZip} isEditing={isEditing} onChange={handleChange} />
                    </DetailGroup>

                    <DetailGroup title="Building & Operations">
                        <Field label="Building Size" name="buildingSize" value={clientData.buildingSize} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Rural Location?" name="rural" value={clientData.rural} isEditing={isEditing} onChange={handleChange} />
                        <Field label="SIC Code" name="sicCode" value={clientData.sicCode} isEditing={isEditing} onChange={handleChange} />
                        <Field label="NAICS" name="naics" value={clientData.naics} isEditing={isEditing} onChange={handleChange} />
                    </DetailGroup>

                    <DetailGroup title="Financials">
                        <Field label="Annual Utility Exp. ($)" name="utilityExp" value={clientData.utilityExp} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Annual Energy Cons. ($)" name="energyCons" value={clientData.energyCons} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Annual Gross Sales ($)" name="grossSales" value={clientData.grossSales} isEditing={isEditing} onChange={handleChange} />
                    </DetailGroup>

                    <DetailGroup title="Other Details">
                        <Field label="Previous Assessments" name="prevAssessments" value={clientData.prevAssessments} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Agri. Production" name="agriProd" value={clientData.agriProd} isEditing={isEditing} onChange={handleChange} />
                        <Field label="Wastewater Size" name="wasteWater" value={clientData.wasteWater} isEditing={isEditing} onChange={handleChange} />
                    </DetailGroup>

                </div>

                {/* NOTES SECTION */}
                <div className="mt-10 pt-6 border-t border-gray-100">
                    <p className="text-sm text-gray-400 font-bold uppercase mb-2">Additional Notes</p>
                    {isEditing ? (
                        <textarea 
                            name="notes"
                            value={clientData.notes}
                            onChange={handleChange}
                            className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:border-[#FE5C00] outline-none resize-none"
                        />
                    ) : (
                        <p className="text-gray-600 bg-gray-50 p-4 rounded-lg text-sm italic border border-gray-100">
                            {clientData.notes}
                        </p>
                    )}
                </div>

                {/* ACTION BUTTON (FLOATING OR BOTTOM) */}
                <div className="flex justify-end mt-12">
                    <button 
                        onClick={() => setIsEditing(!isEditing)}
                        className={`px-12 py-3 rounded shadow transition font-bold text-xl uppercase tracking-wider ${
                            isEditing 
                            ? "bg-green-600 hover:bg-green-700 text-white" 
                            : "bg-[#FE5C00] hover:bg-orange-700 text-white"
                        }`}
                    >
                        {isEditing ? "Save Changes" : "Edit"}
                    </button>
                </div>

            </div>
        </div>
      </div>

    </div>
  );
};

/* --- REUSABLE COMPONENTS --- */

const DetailGroup = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="space-y-5">
        <h4 className="text-xs font-bold text-[#FE5C00] uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">{title}</h4>
        <div className="space-y-4">
            {children}
        </div>
    </div>
);

// Smart Field Component that switches between Text and Input
const Field = ({ label, name, value, isEditing, onChange }: any) => (
    <div>
        <span className="block text-xs text-gray-400 font-bold mb-1">{label}</span>
        {isEditing ? (
            <input 
                type="text" 
                name={name}
                value={value} 
                onChange={onChange}
                className="w-full border-b border-gray-300 focus:border-[#FE5C00] outline-none py-1 text-sm font-semibold text-black bg-transparent transition-colors"
            />
        ) : (
            <span className="block text-base font-semibold text-gray-800 border-b border-transparent py-1">{value}</span>
        )}
    </div>
);

export default StaffClientDetails;