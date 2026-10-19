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

                // 🚨 Hit the new multi-facility backend route
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

    return (
        <div className="max-w-6xl mx-auto w-full flex flex-col gap-8 p-6">
            
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {facilities.map((facility) => (
                        <div key={facility._id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
                            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full tracking-wide uppercase
                                    ${facility.status === 'Completed' ? 'bg-gray-200 text-gray-800' : 
                                      facility.status === 'Ready for audit' ? 'bg-green-100 text-green-800' : 
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
                                <p className="text-sm text-gray-500 mb-6 flex items-center gap-1">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                    {facility.city ? `${facility.city}, ${facility.state}` : "Location pending"}
                                </p>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 flex gap-3">
                                  <Link 
                                      to={`/client/facility/${facility._id}/edit`} 
                                      className="flex-1 bg-white hover:bg-orange-50 text-[#FE5C00] border border-[#FE5C00] text-center font-bold py-2.5 rounded transition text-sm"
                                  >
                                      Edit Info
                                    </Link>
                                    <Link 
                                        to={`/client/facility/${facility._id}`} 
                                        className="flex-1 bg-gray-900 hover:bg-black text-white text-center font-bold py-2.5 rounded transition text-sm"
                                    >
                                        Manage Documents
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Dashboard;