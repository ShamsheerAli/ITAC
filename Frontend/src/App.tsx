import { Routes, Route } from 'react-router-dom'
import Header from './components/Header' // Your global header
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import TemporaryDashboard from './pages/TemporaryDashboard'

// --- CLIENT PAGES ---
import Dashboard from './pages/Dashboard'
import Inbox from './pages/Inbox'
import UpdateDetails from './pages/ClientUpdateDetails' 
import UploadDocuments from './pages/UploadDocuments'
import DashboardLayout from './layouts/DashboardLayout' 

// --- STAFF PAGES ---
import StaffDashboard from './pages/StaffDashboard';
import StaffLayout from './layouts/StaffLayout';
import StaffKanban from './pages/StaffKanban';
import StaffMyInformation from './pages/StaffMyInformation';
import StaffAddClient from './pages/StaffAddClient';
import StaffClientReview from './pages/StaffClientReview';
import StaffDocumentReview from './pages/StaffDocumentReview';
import StaffInbox from './pages/StaffInbox';
import StaffClientDetails from './pages/StaffClientDetails'

function App() {
  return (
    <>
      {/* ✅ GLOBAL HEADER: This will now appear on EVERY page */}
      <Header />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/TemporaryDashboard" element={<TemporaryDashboard />} />

        {/* ================= CLIENT ROUTES (Sidebar Layout) ================= */}
        {/* These pages get the Sidebar + The Global Header from above */}
        <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/update-details" element={<UpdateDetails />} />
            <Route path="/upload-documents" element={<UploadDocuments />} />
            <Route path="/inbox" element={<Inbox />} />
        </Route>

        {/* ================= STAFF ROUTES (Staff Sidebar Layout) ================= */}
        {/* These pages get the Staff Sidebar + The Global Header from above */}
        <Route element={<StaffLayout />}>
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/staff-kanban" element={<StaffKanban />} />
          <Route path="/staff-info" element={<StaffMyInformation />} />
          <Route path="/add-new-client" element={<StaffAddClient />} />
          <Route path="/staff-client-review/:clientId" element={<StaffClientReview />} />
          <Route path="/staff-document-review/:clientId" element={<StaffDocumentReview />} />
          <Route path="/staff-inbox/:clientId?" element={<StaffInbox />} />
          <Route path="/staff-client-details/:clientId" element={<StaffClientDetails />} />
        </Route>

      </Routes>
    </>
  )
}

export default App