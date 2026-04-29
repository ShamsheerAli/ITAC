import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import api from "../api/axios";

const StaffSidebar = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages when the sidebar loads
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const res = await api.get('/messages/admin/unread');
        // Your backend returns an array of unread messages, so the count is the array length
        setUnreadCount(res.data.length); 
      } catch (err) {
        console.error("Failed to fetch unread messages", err);
      }
    };

    fetchUnreadCount();
    
    // Optional: Poll every 30 seconds to keep the red dot updated without refreshing
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { name: "Dashboard", path: "/staff-dashboard" },
    { name: "Client Progress Board", path: "/staff-kanban" }, 
    { name: "Inbox", path: "/staff-inbox" }, // ✅ Added Inbox
    { name: "My Information", path: "/staff-info" },  
    { name: "Add new client", path: "/add-new-client" },  
  ];

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-200 hidden md:block">
      <nav className="flex flex-col py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-8 py-3 text-lg font-medium transition-colors duration-200 flex items-center justify-between ${
                isActive
                  ? "text-black border-l-4 border-black bg-gray-100" 
                  : "text-gray-600 hover:text-black hover:bg-gray-50 border-l-4 border-transparent"
              }`
            }
          >
            <span>{item.name}</span>
            
            {/* The Red Dot Notification Badge */}
            {item.name === "Inbox" && unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {unreadCount}
                </span>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default StaffSidebar;