import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // --- FETCH DATA ---
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
          console.error("Error fetching profile", err);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    } else {
      navigate("/login");
    }
  }, [navigate]);

  if (loading) return <div className="p-10 text-center text-gray-500">Loading Dashboard...</div>;

  // --- TRACKING LOGIC ---
  const hasDocuments = profile?.documents && profile.documents.length > 0;
  const isReviewing = profile?.status === 'Reviewing' || profile?.status === 'Ready for audit' || profile?.status === 'Audit Scheduled';
  const isReady = profile?.status === 'Ready for audit' || profile?.status === 'Audit Scheduled';

  return (
    <div className="w-full space-y-8">
      
      {/* TOP SECTION: GRID OF 2 CARDS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT CARD: My Information */}
        <div className="bg-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
          {/* Header */}
          <div className="bg-slate-600 text-white text-center py-4 font-bold text-2xl tracking-wide">
            My Information
          </div>
          
          {/* Content */}
          <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-8 flex-grow">
            {/* Profile Image */}
            <div className="flex-shrink-0">
               <img
                src={profile?.image || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80"} 
                alt="Profile" 
                className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
              />
            </div>

            {/* Details - Centered and Large */}
            <div className="text-center w-full space-y-2 text-xl text-gray-800 font-medium">
              <p><span className="font-bold text-black">Name:</span> {profile?.contactName || user?.name}</p>
              <p><span className="font-bold text-black">Company:</span> {profile?.companyName || "N/A"}</p>
              <p>
                <span className="font-bold text-black">Email:</span>{" "}
                <a href={`mailto:${user?.email}`} className="underline hover:text-[#FE5C00]">
                  {user?.email}
                </a>
              </p>
              <p><span className="font-bold text-black">Phone:</span> {profile?.contactPhone || "N/A"}</p>
              
              {/* --- UPDATED ADDRESS SECTION --- */}
              <p><span className="font-bold text-black">Street Address:</span> {profile?.streetAddress || "N/A"}</p>
              <p><span className="font-bold text-black">City:</span> {profile?.city || "N/A"}</p>
              <p>
                <span className="font-bold text-black">State:</span> {profile?.state || "N/A"}
                <span className="mx-3 text-gray-400">|</span> 
                <span className="font-bold text-black">Zip Code:</span> {profile?.zipCode || "N/A"}
              </p>
              {/* ------------------------------- */}

              <div className="pt-6 flex justify-center">
                <Link to="/update-details">
                    <button className="bg-[#FE5C00] text-white px-10 py-3 rounded shadow hover:bg-orange-700 transition font-bold uppercase text-base tracking-wider">
                    Update
                    </button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CARD: Action Center */}
        <div className="bg-white p-2 flex flex-col justify-between h-full min-h-[400px]">
           <div className="mb-6">
            <h2 className="text-3xl font-bold text-center text-black">Action Center</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
          </div>

          {/* Main Text Area */}
          <div className="flex-grow flex items-center justify-center px-6">
            <div className="text-gray-800 text-2xl leading-9 text-center font-medium">
              You have been selected for ITAC services.
              <br />
              Upload the required documents by clicking
              <br />
              on “Upload Documents” button.
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 mt-8">
            <button className="flex-1 bg-[#FE5C00] text-white px-4 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-xl text-center">
              Resources
            </button>
            <Link to="/upload-documents" className="flex-1">
                <button className="w-full h-full bg-[#FE5C00] text-white px-4 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-xl text-center">
                Upload Documents
                </button>
            </Link>
            <Link to="/inbox" className="flex-1">
                <button className="w-full h-full bg-[#FE5C00] text-white px-4 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-xl text-center">
                Inbox
                </button>
            </Link>
          </div>
        </div>

      </div>

      {/* BOTTOM SECTION: Tracking System */}
      <div className="bg-white pt-8 w-full">
        <div className="mb-10">
            <h2 className="text-3xl font-bold text-center text-black">Tracking system</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
        </div>

        {/* PROGRESS BAR */}
        <div className="bg-gray-50 rounded-xl p-14 border border-gray-100 flex flex-col lg:flex-row items-center justify-center gap-10 w-full">
            
            {/* Step 1 */}
            <StepItem 
              icon={<IconDocumentCheck />} 
              label="Documents Received"
              isActive={hasDocuments} // Logic Applied
            />

            {/* Arrow */}
            <ArrowDivider />

            {/* Step 2 */}
            <StepItem 
              icon={<IconDocumentSearch />} 
              label="Documents Review"
              isActive={isReviewing} // Logic Applied
            />

            {/* Arrow */}
            <ArrowDivider />

            {/* Step 3 */}
            <StepItem 
              icon={<IconCheckCircle />} 
              label="Ready to schedule"
              isActive={isReady} // Logic Applied
            />

        </div>
      </div>

    </div>
  );
};

/* --- SUB-COMPONENTS FOR TRACKING SYSTEM --- */

const StepItem = ({ icon, label, isActive }: { icon: React.ReactNode; label: string, isActive?: boolean }) => (
  <div className="flex flex-col items-center z-10 text-center">
    <div className={`w-28 h-28 rounded-full flex items-center justify-center text-white mb-6 shadow-lg transform transition duration-300
        ${isActive ? 'bg-[#FE5C00] scale-105' : 'bg-slate-600'}`}> 
      {icon}
    </div>
    <span className={`font-bold text-xl ${isActive ? 'text-[#FE5C00]' : 'text-black'}`}>{label}</span>
  </div>
);

const ArrowDivider = () => (
  <div className="hidden lg:block flex-1 h-2 bg-black mx-6 -mt-14 rounded-full opacity-80" /> 
);

/* --- ICONS (SVG) --- */

const IconDocumentCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconDocumentSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
  </svg>
);

export default Dashboard;