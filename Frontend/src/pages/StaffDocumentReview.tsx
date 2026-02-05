import { Link, useParams } from "react-router-dom";

const StaffDocumentReview = () => {
  const { clientId } = useParams(); // Gets the ID like 'OK1169'

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
        <span className="text-sm font-bold text-black">Document Status</span>
      </div>

      {/* 2. MAIN CONTENT WRAPPER */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 pb-12">
        
        {/* PAGE TITLE */}
        <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-black mb-2">
                Checotah Casino <span className="text-gray-400 font-medium text-2xl">({clientId || "OK1169"})</span>
            </h1>
            <div className="h-1.5 bg-[#FE5C00] w-24 mx-auto rounded-full" />
        </div>

        {/* 3. DOCUMENT STATUS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            
            {/* LEFT: UPLOADED DOCUMENTS */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="font-bold text-gray-800 text-lg">Uploaded Documents</h2>
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">3 Files</span>
                </div>
                <div className="p-6 space-y-4">
                    <DocumentRow label="Confidentiality Statement" />
                    <DocumentRow label="Media Release form" />
                    <DocumentRow label="Energy Assessment Application" />
                </div>
            </div>

            {/* RIGHT: MISSING DOCUMENTS */}
            <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
                <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                    <h2 className="font-bold text-red-700 text-lg">Missing Documents</h2>
                    <span className="bg-red-200 text-red-800 text-xs font-bold px-2 py-1 rounded-full">Action Required</span>
                </div>
                <div className="p-6">
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-100">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                         <span className="font-medium text-red-900">Most Recent Utility Bills</span>
                    </div>
                </div>
            </div>

        </div>

        {/* 4. TRACKING SYSTEM */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-10">
            <h3 className="text-xl font-bold text-black mb-8 text-center">Current Status</h3>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0 relative">
                
                {/* Step 1: Missing (Active/Red) */}
                <StepItem 
                    icon={<IconFileCross />} 
                    label="Missing Documents" 
                    status="error" 
                />

                <StepConnector status="pending" />

                {/* Step 2: Waiting */}
                <StepItem 
                    icon={<IconFileClock />} 
                    label="Waiting for approval" 
                    status="pending" 
                />

                <StepConnector status="pending" />

                {/* Step 3: Ready */}
                <StepItem 
                    icon={<IconCheckCircle />} 
                    label="Ready to schedule" 
                    status="pending" 
                />

            </div>
        </div>

        {/* 5. ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
             {/* Approve Button */}
             <button className="w-full sm:w-auto min-w-[200px] bg-[#FE5C00] hover:bg-orange-700 text-white px-8 py-3 rounded-lg shadow-md transition font-bold text-lg flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                Approve
            </button>

            {/* Send Message Button (Links to Inbox with ClientID) */}
            <Link to={`/staff-inbox/${clientId}`} className="w-full sm:w-auto">
                <button className="w-full min-w-[200px] bg-white hover:bg-gray-50 text-[#FE5C00] border-2 border-[#FE5C00] px-8 py-3 rounded-lg shadow-sm transition font-bold text-lg flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                    Send Message
                </button>
            </Link>
        </div>

      </div>

    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const DocumentRow = ({ label }: { label: string }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition group">
        <span className="text-gray-700 font-medium text-sm">{label}</span>
        <button className="bg-gray-700 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded transition flex items-center gap-1 shadow-sm">
            <span>Download</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
        </button>
    </div>
);

const StepItem = ({ icon, label, status }: { icon: React.ReactNode, label: string, status: 'active' | 'pending' | 'error' }) => {
    let circleColor = "bg-gray-200 text-gray-400"; // pending
    let textColor = "text-gray-400";

    if (status === 'active') {
        circleColor = "bg-blue-600 text-white shadow-lg shadow-blue-200";
        textColor = "text-black font-bold";
    } else if (status === 'error') {
        circleColor = "bg-red-600 text-white shadow-lg shadow-red-200";
        textColor = "text-red-600 font-bold";
    }

    return (
        <div className="flex flex-col items-center z-10 w-40 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${circleColor}`}>
                {icon}
            </div>
            <span className={`text-sm ${textColor}`}>{label}</span>
        </div>
    );
};

const StepConnector = ({ status }: { status: 'active' | 'pending' }) => (
    <div className={`hidden md:block flex-1 h-1 mx-2 -mt-8 rounded-full ${status === 'active' ? 'bg-black' : 'bg-gray-200'}`} />
);

/* --- ICONS --- */
const IconFileCross = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
); 

const IconFileClock = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconCheckCircle = () => (
     <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default StaffDocumentReview;