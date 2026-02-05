import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="flex w-full min-h-[calc(100vh-140px)] bg-gray-50">
      {/* SIDEBAR (Fixed width) */}
      <Sidebar />

      {/* MAIN CONTENT AREA (Flex-grow to fill remaining space) */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* <Outlet /> renders the child route (e.g. UpdateDetails or UploadDocuments) */}
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;