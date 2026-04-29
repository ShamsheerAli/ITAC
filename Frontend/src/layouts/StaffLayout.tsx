import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api/axios"; // 🚨 Ensure this import path is correct!

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
const IconInbox = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);
const IconInfo = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
);
const IconAddClient = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
    </svg>
);
const IconLogout = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
);

const StaffLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("/staff-dashboard");
  const [unreadCount, setUnreadCount] = useState(0); // 🚨 Added state for the red dot

  // Track active tab
  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location]);

  // 🚨 Fetch unread messages for the sidebar
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/messages/admin/unread');
        setUnreadCount(res.data.length); 
      } catch (err) {
        console.error("Failed to fetch unread messages", err);
      }
    };

    fetchUnreadCount();
    
    // Poll every 15 seconds to keep the red dot updated dynamically
    const interval = setInterval(fetchUnreadCount, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Helper to determine Page Title based on the current URL
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/staff-dashboard')) return 'Dashboard';
    if (path.includes('/staff-kanban')) return 'Client Progress Board';
    if (path.includes('/staff-info')) return 'My Information';
    if (path.includes('/add-new-client')) return 'Add New Client';
    if (path.includes('/staff-client-review')) return 'Client Review';
    if (path.includes('/staff-document-review')) return 'Document Review';
    if (path.includes('/staff-inbox')) return 'Inbox';
    if (path.includes('/staff-client-details')) return 'Client Details';
    return 'Staff Portal';
  }

  return (
    <div className="flex min-h-screen bg-white">
      
      {/* ================= SIDEBAR ================= */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6">
           {/* Space for internal logo if needed, otherwise empty */}
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            <SidebarItem 
                to="/staff-dashboard" 
                label="Dashboard" 
                icon={<IconDashboard />} 
                active={activeTab === "/staff-dashboard"} 
            />
            <SidebarItem 
                to="/staff-kanban" 
                label="Client Progress Board" 
                icon={<IconKanban />} 
                active={activeTab === "/staff-kanban"} 
            />
            
            {/* 🚨 THE NEW INBOX TAB */}
            <SidebarItem 
                to="/staff-inbox" 
                label="Inbox" 
                icon={<IconInbox />} 
                active={activeTab.includes("/staff-inbox")} // .includes allows it to stay active even when chatting with a specific client ID
                badge={unreadCount} // Pass the unread count down!
            />

            <SidebarItem 
                to="/staff-info" 
                label="My Information" 
                icon={<IconInfo />} 
                active={activeTab === "/staff-info"} 
            />
             <SidebarItem 
                to="/add-new-client" 
                label="Add new client" 
                icon={<IconAddClient />} 
                active={activeTab === "/add-new-client"} 
            />
        </nav>
      </aside>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 flex flex-col">
        
        {/* ⭐ TOP BAR (Page Title + Logout) ⭐ */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 shadow-sm">
            {/* Page Title */}
            <h2 className="text-xl font-bold text-gray-800">
                {getPageTitle()}
            </h2>

            {/* Logout Button */}
            <button 
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 font-medium transition duration-200"
            >
                <IconLogout />
                Logout
            </button>
        </header>

        {/* PAGE CONTENT */}
        <main className="p-8 bg-gray-50 flex-1">
          <Outlet />
        </main>

      </div>
    </div>
  );
};

// 🚨 Updated Sub-component to accept and display the badge
const SidebarItem = ({ to, label, icon, active, badge }: any) => (
    <Link to={to} className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-md transition-colors duration-200
        ${active ? 'bg-orange-50 text-[#FE5C00]' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
        
        <div className="flex items-center">
            <span className={`${active ? 'text-[#FE5C00]' : 'text-gray-400'}`}>
                {icon}
            </span>
            {label}
        </div>

        {/* Display Red Dot if there are unread messages */}
        {badge > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                {badge}
            </span>
        )}
    </Link>
);

export default StaffLayout;