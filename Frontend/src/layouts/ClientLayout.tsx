import { Outlet, useNavigate } from "react-router-dom";

const ClientLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // 1. Clear user data
    localStorage.removeItem("user");
    
    // 2. Redirect to Login
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      
      {/* ================= HEADER (VISIBLE ON ALL PAGES) ================= */}
      <header className="bg-white shadow-sm border-b-4 border-[#FE5C00] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* LOGO AREA */}
          <div className="flex items-center gap-4">
             {/* You can replace this URL with your local logo path like "/logo.png" */}
             <img 
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e6/Oklahoma_State_University_logo.svg/1200px-Oklahoma_State_University_logo.svg.png" 
                alt="OSU Logo" 
                className="h-10 w-auto" 
             />
             <div className="hidden md:block">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">GREAT PLAINS</h1>
                <h2 className="text-sm font-bold text-gray-500 tracking-wider">CENTER OF EXCELLENCE</h2>
             </div>
          </div>

          {/* LOGOUT BUTTON */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600 hover:text-[#FE5C00] font-bold transition duration-200"
          >
            <span className="hidden sm:block">LOGOUT</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

        </div>
      </header>

      {/* ================= MAIN CONTENT (CHANGES BASED ON PAGE) ================= */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet /> 
      </main>

    </div>
  );
};

export default ClientLayout;