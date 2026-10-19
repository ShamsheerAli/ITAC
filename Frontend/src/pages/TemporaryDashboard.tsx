import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const TemporaryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      const fetchFacilities = async () => {
        try {
          // 🚨 UPDATED: Hit the new route that returns an array of facilities
          const res = await api.get(`/profile/user-facilities/${parsedUser.id || parsedUser._id}`);
          const facilities = res.data;

          // AUTO-REDIRECT: If they have AT LEAST ONE facility, bounce them to the main portfolio!
          if (facilities && facilities.length > 0) {
              navigate('/dashboard');
          } else {
              // They have 0 facilities, stop loading and show the welcome screen
              setLoading(false);
          }
        } catch (err) {
          console.log("No facilities found or error fetching.");
          setLoading(false);
        }
      };
      fetchFacilities();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (loading || !user) return <div className="p-10 text-center">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* 1. SUB-HEADER */}
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
        
        <div className="bg-white p-10 md:p-16 w-full max-w-5xl flex flex-col items-center min-h-[450px] rounded-2xl shadow-xl border border-[#FE5C00]/20 relative overflow-hidden">
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-bl-full -z-10 opacity-70"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-50 rounded-tr-full -z-10 opacity-70"></div>

          <div className="mb-10 z-10 w-full max-w-2xl">
            <h2 className="text-4xl font-bold text-center text-black">Welcome to ITAC</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4 rounded-full" />
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center w-full">
              <p className="text-gray-800 font-medium text-2xl leading-relaxed mb-12 max-w-3xl">
                  Review our assessment services by clicking the <strong>“Resources”</strong> button below, 
                  or get started by registering your first manufacturing plant.
                  <br/><br/>
                  <span className="text-gray-500 text-lg italic block bg-gray-50 p-4 rounded-lg border border-gray-100">
                      You can register multiple facilities under this single account.
                  </span>
              </p>

              <div className="flex flex-col sm:flex-row gap-8 justify-center w-full max-w-2xl">
                  <Link to="/resources" className="w-full sm:w-1/2">
                      <button className="w-full h-full bg-white text-[#FE5C00] border-2 border-[#FE5C00] py-5 rounded shadow-sm hover:shadow-md hover:bg-orange-50 transition transform active:scale-95 font-bold text-xl text-center uppercase tracking-wide">
                          Resources
                      </button>
                  </Link>
                  {/* 🚨 UPDATED: Changed from /setup-details to the new facility registration route */}
                  <Link to="/client/new-facility" className="w-full sm:w-1/2">
                      <button className="w-full h-full bg-[#FE5C00] text-white py-5 rounded shadow-md hover:shadow-lg hover:bg-orange-700 transition transform active:scale-95 font-bold text-xl text-center uppercase tracking-wide">
                          Register Facility
                      </button>
                  </Link>
              </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TemporaryDashboard;