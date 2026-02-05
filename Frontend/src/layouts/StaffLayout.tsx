import { Outlet } from "react-router-dom";
import StaffSidebar from "../components/StaffSidebar";

const StaffLayout = () => {
  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] bg-gray-50">
      {/* STAFF SIDEBAR (Fixed width) */}
      <StaffSidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
};

export default StaffLayout;