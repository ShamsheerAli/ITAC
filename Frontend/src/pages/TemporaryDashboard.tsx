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
          const res = await api.get(`/profile/${parsedUser.id || parsedUser._id}`);
          const fetchedProfile = res.data;
          setProfile(fetchedProfile);

          const status = fetchedProfile?.status || 'New Inquiry';
          
          // 🚨 FIX 1: Added 'Documents Submitted' to the auto-redirect array
          const isApproved = ['Approved', 'Awaiting Documents', 'Documents Submitted', 'Ready for audit', 'Audit Scheduled', 'Report writing'].includes(status);
          
          // AUTO-REDIRECT: If the database says they are advanced past step 2,
          // instantly bounce them to the main dashboard. No button required!
          if (isApproved) {
              navigate('/dashboard');
          }

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
  const currentStatus = profile?.status || 'New Inquiry';

  // STEP 3: ACCESS GRANTED
  // 🚨 FIX 2: Added 'Documents Submitted' to the active step array
  if (['Approved', 'Awaiting Documents', 'Documents Submitted', 'Ready for audit', 'Audit Scheduled', 'Report writing'].includes(currentStatus)) {
      activeStep = 3;
  }
  // STEP 2: UNDER REVIEW
  else if (profile) {
      activeStep = 2; 
  }
  // STEP 1: JUST STARTED
  else {
      activeStep = 1;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
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

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 w-full px-6 py-16 flex items-start justify-center max-w-[1920px] mx-auto">
        
        {/* FULL WIDTH ACTION CENTER */}
        <div className="bg-white p-10 md:p-16 w-full max-w-5xl flex flex-col items-center min-h-[450px] rounded-2xl shadow-xl border border-[#FE5C00]/20 relative overflow-hidden">
          
          {/* Subtle background glow effect for extra emphasis */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -z-10 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-50 rounded-tr-full -z-10 opacity-70"></div>

          <div className="mb-10 z-10 w-full max-w-2xl">
            <h2 className="text-4xl font-bold text-center text-black">Action Center</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4 rounded-full" />
          </div>

          {/* DYNAMIC CONTENT BASED ON STEP */}
          {activeStep === 3 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center animate-fade-in w-full">
                 <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-sm border border-green-200">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
                 <p className="text-green-700 font-extrabold text-3xl mb-10 tracking-wide">You have been approved!</p>
                 
                 <Link 
                     to="/dashboard"
                     onClick={() => localStorage.setItem('hasEnteredMainDashboard', 'true')}
                     className="w-full max-w-md"
                 >
                     <button className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-5 px-12 rounded shadow-lg transition transform active:scale-95 text-xl uppercase tracking-wider">
                         Enter Main Dashboard
                     </button>
                 </Link>
             </div>
          ) : (
             <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
                 <p className="text-gray-800 font-medium text-2xl leading-relaxed mb-12 max-w-3xl">
                     Review our services by clicking the <strong>“Resources”</strong> button below, 
                     and tell us about your company by clicking the <strong>“Update Information”</strong> button. 
                     <br/><br/>
                     <span className="text-gray-500 text-lg italic block bg-gray-50 p-4 rounded-lg border border-gray-100">
                         One of our ITAC team members will review your details and reach out shortly.
                     </span>
                 </p>

                 <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-2xl">
                     <Link to="/resources" className="w-full sm:w-1/2">
                         <button className="w-full h-full bg-[#FE5C00] text-white py-5 rounded shadow-md hover:shadow-lg hover:bg-orange-700 transition transform active:scale-95 font-bold text-xl text-center uppercase tracking-wide">
                             Resources
                         </button>
                     </Link>
                     <Link to="/update-details" className="w-full sm:w-1/2">
                         <button className="w-full h-full bg-[#FE5C00] text-white py-5 rounded shadow-md hover:shadow-lg hover:bg-orange-700 transition transform active:scale-95 font-bold text-xl text-center uppercase tracking-wide">
                             Update Information
                         </button>
                     </Link>
                 </div>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default TemporaryDashboard;