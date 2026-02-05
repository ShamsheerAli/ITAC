import { NavLink } from "react-router-dom";

const Sidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/dashboard" }, // Placeholder path
    { name: "Services", path: "/services" },   // Placeholder path
    { name: "Inbox", path: "/inbox" },         // Placeholder path
    { name: "My Information", path: "/update-details" },
    { name: "Upload Documents", path: "/upload-documents" },
  ];

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-200 hidden md:block">
      <nav className="flex flex-col py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-8 py-4 text-sm font-medium transition-colors duration-200 ${
                isActive
                  ? "text-[#FE5C00] border-l-4 border-[#FE5C00] bg-orange-50"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-l-4 border-transparent"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;