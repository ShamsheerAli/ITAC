import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFacilities = async () => {
            try {
                const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
                const userId = storedUser.id || storedUser._id;
                
                if (!userId) {
                    navigate('/login');
                    return;
                }

                const res = await api.get(`/profile/user-facilities/${userId}`); 
                const data = Array.isArray(res.data) ? res.data : (res.data ? [res.data] : []);
                setFacilities(data);
            } catch (err) {
                console.error("Failed to fetch facilities", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFacilities();
    }, [navigate]);

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading your portfolio...</div>;

    // 🚨 DYNAMIC PROGRESS CALCULATOR 🚨
    // We check all facilities to find the furthest one along, and highlight the tracker up to that step.
    let currentStep = 1;
    facilities.forEach(fac => {
        const status = fac.status || '';
        if (['Report writing', 'Completed'].includes(status)) {
            currentStep = Math.max(currentStep, 5);
        } else if (['Ready for audit', 'Audit Scheduled'].includes(status)) {
            currentStep = Math.max(currentStep, 4);
        } else if (['Documents Submitted', 'Under Review'].includes(status)) {
            currentStep = Math.max(currentStep, 3);
        } else if (['Approved', 'Awaiting Documents'].includes(status)) {
            currentStep = Math.max(currentStep, 2);
        }
    });

    return (
        <div className="max-w-[1400px] mx-auto w-full flex flex-col lg:flex-row gap-8 p-6 pb-12">
            
            {/* LEFT COLUMN: MAIN PORTFOLIO */}
            <div className="flex-1 flex flex-col gap-8">
                
                {/* HEADER */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 mb-2">My Facilities</h1>
                        <p className="text-gray-500">Manage your facility profiles, upload utility data, and track assessment progress.</p>
                    </div>
                    <button 
                        onClick={() => navigate('/client/new-facility')}
                        className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition flex items-center gap-2 whitespace-nowrap"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Register New Facility
                    </button>
                </div>

                {/* FACILITIES GRID OR EMPTY STATE */}
                {facilities.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center flex flex-col items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">No facilities registered yet</h3>
                        <p className="text-gray-500 mb-6 max-w-md">Get started by registering your first manufacturing plant or site to begin the ITAC assessment process.</p>
                        <button 
                            onClick={() => navigate('/client/new-facility')}
                            className="bg-white border-2 border-[#FE5C00] text-[#FE5C00] hover:bg-orange-50 font-bold py-2 px-6 rounded-lg transition"
                        >
                            Register Facility
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                        {facilities.map((facility) => (
                            <div key={facility._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
                                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase
                                        ${facility.status === 'Completed' ? 'bg-gray-200 text-gray-800' : 
                                          facility.status === 'Ready for audit' ? 'bg-green-100 text-green-800' : 
                                          facility.status === 'Audit Scheduled' ? 'bg-blue-100 text-blue-800' :
                                          'bg-orange-100 text-[#FE5C00]'}`}
                                    >
                                        {facility.status || 'Draft'}
                                    </span>
                                    <span className="text-xs text-gray-400 font-medium">ID: {facility._id.substring(facility._id.length - 6)}</span>
                                </div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1" title={facility.companyName}>
                                        {facility.companyName || "Unnamed Facility"}
                                    </h3>
                                    <p className={`text-sm text-gray-500 flex items-center gap-1 ${facility.confirmedAuditDate ? 'mb-3' : 'mb-6'}`}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                        {facility.city ? `${facility.city}, ${facility.state}` : "Location pending"}
                                    </p>
                                    
                                    {facility.confirmedAuditDate && (
                                        <div className={`mb-6 p-3 rounded-lg border flex items-center gap-3 ${facility.isAuditConfirmed ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
                                            <div className={`p-2 rounded-full ${facility.isAuditConfirmed ? 'bg-green-100' : 'bg-blue-100'}`}>
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">
                                                    {facility.isAuditConfirmed ? 'Official Audit Date' : 'Awaiting Final Staff Approval'}
                                                </span>
                                                <span className="text-sm font-bold leading-tight">{facility.confirmedAuditDate}</span>
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                                        <Link 
                                            to={`/client/facility/${facility._id}/edit`} 
                                            className="flex-1 bg-white hover:bg-orange-50 text-[#FE5C00] border border-[#FE5C00] text-center font-bold py-2.5 rounded transition text-sm"
                                        >
                                            Edit Info
                                        </Link>
                                        {facility.status === 'Ready for audit' ? (
                                            <Link 
                                                to={`/client/facility/${facility._id}/schedule`} 
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-center font-bold py-2.5 rounded transition text-sm animate-pulse"
                                            >
                                                Schedule Audit
                                            </Link>
                                        ) : (
                                            <Link 
                                                to={`/client/facility/${facility._id}`} 
                                                className="flex-1 bg-gray-900 hover:bg-black text-white text-center font-bold py-2.5 rounded transition text-sm"
                                            >
                                                Manage Documents
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* RIGHT COLUMN: PROCESS SIDEBAR */}
            <div className="w-full lg:w-[350px] shrink-0">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sticky top-6">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-[#FE5C00]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                        </div>
                        <h2 className="text-xl font-black text-gray-900">How It Works</h2>
                    </div>

                    <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
                        <ProcessStep 
                            num={1} 
                            active={currentStep >= 1} 
                            title="Registration & Details" 
                            desc="Register a facility and provide detailed operational and financial information." 
                        />
                        <ProcessStep 
                            num={2} 
                            active={currentStep >= 2} 
                            title="Upload Documents" 
                            desc="Upload 12 months of utility bills, signed consent forms, and applications." 
                        />
                        <ProcessStep 
                            num={3} 
                            active={currentStep >= 3} 
                            title="Engineering Review" 
                            desc="ITAC engineers review your data to determine eligibility and scope." 
                        />
                        <ProcessStep 
                            num={4} 
                            active={currentStep >= 4} 
                            title="Schedule Assessment" 
                            desc="Staff proposes audit dates. Confirm a date directly from this dashboard." 
                        />
                        <ProcessStep 
                            num={5} 
                            active={currentStep >= 5} 
                            title="Audit & Report" 
                            desc="Engineers visit your site and later deliver a comprehensive energy savings report." 
                        />
                    </div>
                </div>
            </div>

        </div>
    );
};

// 🚨 NEW REUSABLE COMPONENT FOR THE TRACKER
const ProcessStep = ({ num, active, title, desc }: { num: number, active: boolean, title: string, desc: string }) => (
    <div className="relative flex items-start gap-4">
        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full ring-4 ring-white transition-colors duration-500 ${active ? 'bg-[#FE5C00]' : 'bg-gray-300'}`} />
        <div className="pl-4">
            <h4 className={`text-sm font-bold transition-colors duration-500 ${active ? 'text-gray-900' : 'text-gray-400'}`}>
                {num}. {title}
            </h4>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Dashboard;