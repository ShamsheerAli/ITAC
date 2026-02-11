import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const TemporaryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const fetchProfile = async () => {
        try {
          const res = await api.get(`/profile/${parsedUser.id}`);
          setProfile(res.data);
        } catch (err) {
          console.log("No profile found.");
        }
      };
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (!user) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-white font-sans">
      
      {/* 1. HEADER */}
      <div className="bg-white shadow-sm border-b border-gray-200 w-full px-4 md:px-8 py-4 mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
            <div className="h-8 w-px bg-gray-300"></div>
            <span className="text-xl font-bold text-gray-800">Temporary Dashboard</span>
        </div>
        <button 
            onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
            }}
            className="text-sm font-bold text-red-500 hover:text-red-700"
        >
            Logout
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-4 md:px-8 space-y-8 pb-12">
        
        {/* 2. TOP CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: MY INFORMATION (Redesigned Layout) */}
            <div className="rounded-lg overflow-hidden shadow-sm flex flex-col h-full border border-gray-100">
                {/* Header Bar */}
                <div className="bg-gray-600 text-white text-center py-4 font-bold text-2xl tracking-wide">
                    My Information
                </div>
                
                {/* Card Body */}
                <div className="bg-gray-50 p-8 flex-1 flex flex-col">
                    
                    {/* Top Section: Photo & Name */}
                    <div className="flex flex-col items-center mb-10 border-b border-gray-200 pb-6">
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden mb-4">
                             <img 
                                src={profile?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900">{user.name}</h2>
                        <span className="text-gray-500 font-medium mt-1">Client Account</span>
                    </div>

                    {/* Middle Section: Info Grid (2 Columns) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 mb-10 w-full px-4">
                        
                        {/* Column 1 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Company</label>
                                <p className="text-xl font-bold text-gray-800">{profile?.companyName || "Not Updated"}</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Email</label>
                                <p className="text-lg font-semibold text-gray-800 break-words">{user.email}</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Phone</label>
                                <p className="text-xl font-bold text-gray-800">{profile?.contactPhone || "Not Updated"}</p>
                            </div>
                        </div>

                        {/* Column 2 */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Street Address</label>
                                <p className="text-xl font-bold text-gray-800">{profile?.streetAddress || "Not Updated"}</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">City</label>
                                <p className="text-xl font-bold text-gray-800">{profile?.city || "Not Updated"}</p>
                            </div>
                            <div>
                                <label className="block text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">State & Zip</label>
                                <p className="text-xl font-bold text-gray-800">
                                    {profile?.state || "NA"} <span className="text-gray-400 mx-2">|</span> {profile?.zipCode || "NA"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Section: Button */}
                    <div className="mt-auto text-center">
                        <Link to="/update-details">
                            <button className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-3 px-16 rounded shadow-lg transition transform hover:-translate-y-0.5 uppercase tracking-wider text-lg">
                                Update Information
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTION CENTER */}
            <div className="rounded-lg overflow-hidden shadow-sm flex flex-col h-full border border-gray-100">
                 {/* Header Bar */}
                <div className="bg-[#FE5C00] text-white text-center py-4 font-bold text-2xl tracking-wide">
                    Action Center
                </div>

                 {/* Card Body */}
                <div className="bg-white p-8 flex-1 flex flex-col items-center justify-center text-center">
                    <div className="max-w-xl space-y-8">
                        <p className="text-gray-700 font-medium text-xl leading-relaxed">
                            Welcome to the <span className="font-bold text-[#FE5C00]">ITAC Portal</span>.
                            <br/><br/>
                            Get started by exploring our <strong>Resources</strong>, or ensure your profile is up-to-date by clicking <strong>Update Information</strong>.
                            <br/><br/>
                            <span className="text-gray-500 italic text-base">One of our team members will review your details and reach out shortly.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-6 justify-center w-full pt-4">
                            <button className="flex-1 bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-4 px-8 rounded shadow-md transition uppercase tracking-wide text-lg min-w-[200px]">
                                Resources
                            </button>
                            <Link to="/update-details" className="flex-1">
                                <button className="w-full bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-4 px-8 rounded shadow-md transition uppercase tracking-wide text-lg min-w-[200px]">
                                    Update Info
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. TRACKING SYSTEM */}
        <div className="rounded-lg overflow-hidden shadow-sm bg-white border border-gray-100">
            {/* Header Bar */}
            <div className="bg-[#FE5C00] text-white text-center py-4 font-bold text-2xl tracking-wide">
                Tracking System
            </div>

            <div className="p-16 flex flex-col md:flex-row items-center justify-center relative max-w-6xl mx-auto">
                {/* Step 1 */}
                <Step 
                    icon={<IconDocument />} 
                    label="Missing Documents" 
                    status="active" 
                />
                <Connector status="pending" />
                {/* Step 2 */}
                <Step 
                    icon={<IconClock />} 
                    label="Waiting for approval" 
                    status="pending" 
                />
                <Connector status="pending" />
                {/* Step 3 */}
                <Step 
                    icon={<IconCheck />} 
                    label="Ready to schedule" 
                    status="pending" 
                />
            </div>
        </div>

      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const Step = ({ icon, label, status }: { icon: any, label: string, status: 'active' | 'pending' | 'completed' }) => {
    let circleClass = "bg-gray-200 text-gray-400";
    let textClass = "text-gray-400";

    if (status === 'active') {
        circleClass = "bg-gray-800 text-white shadow-xl scale-110 ring-4 ring-gray-100";
        textClass = "text-black font-extrabold mt-4";
    } else {
        textClass = "text-gray-400 font-medium mt-4";
    }

    return (
        <div className="flex flex-col items-center z-10 w-56 text-center">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${circleClass}`}>
                {icon}
            </div>
            <span className={`text-xl ${textClass}`}>{label}</span>
        </div>
    );
};

const Connector = ({ status }: { status: 'active' | 'pending' }) => (
    <div className={`hidden md:block flex-1 h-2 mx-4 -mt-12 rounded-full ${status === 'active' ? 'bg-gray-800' : 'bg-gray-200'}`} />
);

/* --- ICONS --- */
const IconDocument = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
);

const IconClock = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const IconCheck = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
);

export default TemporaryDashboard;