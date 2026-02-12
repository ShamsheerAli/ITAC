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

  // --- LOGIC: DETERMINE CURRENT STEP ---
  let activeStep = 1; 
  if (profile) activeStep = 2; 
  if (profile?.status === 'Approved') activeStep = 3; 

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      
      {/* 1. SUB-HEADER (White, separated from top banner) */}
      <div className="bg-white w-full px-8 py-3 flex justify-between items-center border-b border-gray-300 shadow-sm z-10">
         <span className="text-gray-700 font-medium text-lg">Home</span>
         <button 
            onClick={() => {
                localStorage.removeItem('user');
                navigate('/login');
            }}
            className="text-sm font-bold text-red-600 hover:text-red-800 transition uppercase tracking-wide"
        >
            Logout
        </button>
      </div>

      <div className="flex-1 w-full px-8 py-10 space-y-10 max-w-[1920px] mx-auto">
        
        {/* 2. TOP CARDS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 h-full">
            
            {/* LEFT: MY INFORMATION */}
            <div className="rounded-xl overflow-hidden shadow-md flex flex-col border border-gray-200 bg-[#E0E0E0]">
                {/* Header Bar */}
                <div className="bg-[#757575] text-white text-center py-3 font-bold text-2xl tracking-wide uppercase">
                    My Information
                </div>
                
                {/* Card Body */}
                <div className="p-8 flex-1 flex flex-col items-center justify-center">
                    <div className="flex flex-col xl:flex-row items-center gap-8 w-full">
                         {/* Profile Pic */}
                        <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden flex-shrink-0 bg-gray-300">
                             <img 
                                src={profile?.image || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"} 
                                alt="Profile" 
                                className="w-full h-full object-cover" 
                            />
                        </div>

                        {/* Info List */}
                        <div className="text-center xl:text-left space-y-2 w-full text-black">
                             <p className="text-2xl font-bold mb-2">{user.name}</p>
                             <p className="text-lg"><span className="font-serif font-semibold">Company:</span> {profile?.companyName || "Not Updated"}</p>
                             <p className="text-lg"><span className="font-serif font-semibold">Email:</span> <span className="underline decoration-dotted">{user.email}</span></p> 
                             <p className="text-lg"><span className="font-serif font-semibold">Phone:</span> {profile?.contactPhone || "Not Updated"}</p>
                             <div className="mt-3 text-base text-gray-800 leading-snug bg-white/50 p-3 rounded-lg border border-gray-300 inline-block xl:block">
                                 <p><span className="font-bold">Address:</span> {profile?.streetAddress || "N/A"}</p>
                                 <p>{profile?.city ? `${profile.city}, ${profile.state || ""}, ${profile.zipCode || ""}` : "No address on file"}</p>
                             </div>
                        </div>
                    </div>

                    <div className="mt-10 w-full text-center">
                        <Link to="/update-details">
                            <button className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-3 px-16 rounded shadow-md transition transform active:scale-95 uppercase tracking-wider text-xl">
                                UPDATE
                            </button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* RIGHT: ACTION CENTER */}
            <div className="rounded-xl overflow-hidden shadow-md flex flex-col border border-gray-200 bg-white">
                 {/* Header Bar */}
                 <div className="pt-6 px-6">
                    <h2 className="text-3xl font-bold text-black text-center mb-2">
                        Action Center
                    </h2>
                    {/* FULL WIDTH ORANGE LINE */}
                    <div className="w-full h-1.5 bg-[#FE5C00] rounded-full"></div>
                 </div>

                 {/* Card Body */}
                <div className="p-10 flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-black font-medium text-xl leading-relaxed mb-12 max-w-2xl">
                        Go through our services by clicking the <strong>“Services”</strong> button below, 
                        and update your details by clicking the <strong>“Update Information”</strong> button. 
                        <br/><span className="text-gray-500 mt-2 block italic">One of our team members will review your details and reach out shortly.</span>
                    </p>

                    <div className="flex flex-col sm:flex-row gap-8 justify-center w-full">
                        <button className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-4 px-10 rounded shadow-md transition uppercase tracking-wide text-lg min-w-[220px]">
                            Resources
                        </button>
                        <Link to="/update-details">
                            <button className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-4 px-10 rounded shadow-md transition uppercase tracking-wide text-lg min-w-[220px]">
                                Update Information
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>

        {/* 3. TRACKING SYSTEM */}
        <div className="rounded-xl overflow-hidden shadow-md bg-[#FAFAFA] border border-gray-200 pb-12">
             <div className="pt-6 px-6 mb-12">
                <h2 className="text-3xl font-bold text-black text-center mb-2">
                    Tracking System
                </h2>
                {/* FULL WIDTH ORANGE LINE */}
                <div className="w-full h-1.5 bg-[#FE5C00] rounded-full"></div>
             </div>

            <div className="px-4 md:px-16 flex flex-col md:flex-row items-center justify-between relative max-w-7xl mx-auto w-full">
                
                {/* Step 1 */}
                <Step 
                    icon={<IconEdit />} 
                    label="Update Information" 
                    status={activeStep >= 1 ? 'completed' : 'pending'} 
                    isActive={activeStep === 1}
                />
                
                <Connector status={activeStep >= 2 ? 'active' : 'pending'} />
                
                {/* Step 2 */}
                <Step 
                    icon={<IconSearch />} 
                    label="Details Review" 
                    status={activeStep >= 2 ? 'completed' : 'pending'} 
                    isActive={activeStep === 2}
                />
                
                <Connector status={activeStep >= 3 ? 'active' : 'pending'} />
                
                {/* Step 3 */}
                <Step 
                    icon={<IconCheckCircle />} 
                    label="Ready for next steps" 
                    status={activeStep >= 3 ? 'completed' : 'pending'} 
                    isActive={activeStep === 3}
                />

            </div>

            {/* Approval Button */}
            {activeStep === 3 && (
                <div className="text-center mt-12 animate-fade-in">
                    <p className="text-green-600 font-bold text-lg mb-4">You have been approved!</p>
                    <Link to="/dashboard">
                        <button className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-12 rounded shadow-lg transition text-xl">
                            Enter Main Dashboard
                        </button>
                    </Link>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const Step = ({ icon, label, status, isActive }: { icon: any, label: string, status: 'completed' | 'pending', isActive: boolean }) => {
    let circleClass = "bg-[#6B6B6B] text-white"; // Default Gray
    
    // Logic: If active or completed, keep it gray/dark gray as per your design
    // The visual difference comes from the label boldness
    
    return (
        <div className="flex flex-col items-center z-10 w-full md:w-auto text-center relative group">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 shadow-sm ${circleClass}`}>
                {icon}
            </div>
            
            {/* Completed Badge */}
            {status === 'completed' && !isActive && (
                <div className="absolute top-0 right-[calc(50%-2.5rem)] bg-green-500 rounded-full p-1 border-2 border-white shadow-sm">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                </div>
            )}
            
            <span className={`text-xl mt-4 ${isActive ? 'text-black font-extrabold' : 'text-gray-500 font-medium'}`}>{label}</span>
            {isActive && <span className="text-xs text-[#FE5C00] font-bold uppercase tracking-widest mt-1">Current Step</span>}
        </div>
    );
};

const Connector = ({ status }: { status: 'active' | 'pending' }) => (
    <div className="hidden md:flex flex-1 items-center justify-center px-4 -mt-10">
         {/* Line */}
         <div className={`h-1.5 w-full rounded-full ${status === 'active' ? 'bg-black' : 'bg-gray-300'}`}></div>
         {/* Arrow Head */}
         <svg className={`w-8 h-8 -ml-3 ${status === 'active' ? 'text-black' : 'text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
         </svg>
    </div>
);

/* --- ICONS (Slightly larger for better visibility) --- */
const IconEdit = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
         <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
); 

const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6" /> 
    </svg>
); 

const IconCheckCircle = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export default TemporaryDashboard;