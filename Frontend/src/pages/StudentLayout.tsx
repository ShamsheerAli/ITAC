import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";

// --- ICONS ---
const IconDashboard = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);
const IconKanban = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
);
const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const StudentLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/student-dashboard");
  const [studentEmail, setStudentEmail] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
        const user = JSON.parse(storedUser);
        setStudentEmail(user.email || "Student Trainee");
    }
    setActiveTab(location.pathname);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getPageTitle = () => {
    if (location.pathname.includes('/student-dashboard')) return 'Student Dashboard';
    if (location.pathname.includes('/student-kanban')) return 'Active Assessments';
    if (location.pathname.includes('/student-report')) return 'Report Writing';
    return 'ITAC Student Portal';
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* 🚨 Added flex-shrink-0 so the sidebar never gets squished */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col flex-shrink-0">
        <div className="p-6">{/* Logo Space */}</div>
        <nav className="flex-1 px-4 space-y-2">
            <SidebarItem to="/student-dashboard" label="Dashboard" icon={<IconDashboard />} active={activeTab === "/student-dashboard"} />
            <SidebarItem to="/student-kanban" label="Active Assessments" icon={<IconKanban />} active={activeTab.includes("/student-kanban")} />
        </nav>
      </aside>

      {/* 🚨 FIX: Added min-w-0 here. This forces the container to stay within the screen bounds. */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800">{getPageTitle()}</h2>
            <div className="flex items-center gap-6">
                <span className="text-sm font-bold text-gray-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200 truncate max-w-[200px]">
                    {studentEmail}
                </span>
                <button onClick={handleLogout} className="flex items-center text-gray-500 hover:text-red-600 font-medium transition flex-shrink-0">
                    <IconLogout /> Logout
                </button>
            </div>
        </header>
        
        {/* 🚨 Added overflow-x-hidden here to ensure no weird horizontal scrolling on the main page body */}
        <main className="p-8 bg-gray-50 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ to, label, icon, active }: any) => (
    <Link to={to} className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors
        ${active ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
        <span className={`${active ? 'text-blue-700' : 'text-gray-400'} mr-3`}>{icon}</span>
        {label}
    </Link>
);

export default StudentLayout;