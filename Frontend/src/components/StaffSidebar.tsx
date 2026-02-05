import { NavLink } from "react-router-dom";

const StaffSidebar = () => {
  const navItems = [
    { name: "Dashboard", path: "/staff-dashboard" },
    { name: "Kanban Board", path: "/staff-kanban" }, // Placeholder path
    { name: "My Information", path: "/staff-info" },  // Placeholder path
    { name: "Add new client", path: "/add-new-client" },  // Placeholder path
  ];

  return (
    <aside className="w-64 bg-white min-h-screen border-r border-gray-200 hidden md:block">
      <nav className="flex flex-col py-8 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `px-8 py-3 text-lg font-medium transition-colors duration-200 ${
                isActive
                  ? "text-black border-l-4 border-black bg-gray-100" // Staff active state (Black/Gray style)
                  : "text-gray-600 hover:text-black hover:bg-gray-50 border-l-4 border-transparent"
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

export default StaffSidebar;