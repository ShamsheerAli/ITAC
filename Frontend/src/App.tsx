import { Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Home from './pages/Home'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import TemporaryDashboard from './pages/TemporaryDashboard'
import Inbox from './pages/Inbox'
import UpdateDetails from './pages/ClientUpdateDetails'
import UploadDocuments from './pages/UploadDocuments'
import DashboardLayout from './layouts/DashboardLayout' // Import the new layout
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
      {/* Header is always visible at the top */}
      <Header />

      <Routes>
        {/* PUBLIC ROUTES (Full Width) */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/TemporaryDashboard" element={<TemporaryDashboard />} />
        <Route path="/update-details" element={<UpdateDetails />} />
        {/* DASHBOARD ROUTES (With Sidebar) */}
        {/* We wrap these inside the Layout route */}
        <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/inbox" element={<Inbox />} />
          
          <Route path="/upload-documents" element={<UploadDocuments />} />
          {/* You can add more sidebar pages here later */}
        </Route>
        <Route element={<StaffLayout />}>
          <Route path="/staff-dashboard" element={<StaffDashboard />} />
          <Route path="/staff-kanban" element={<StaffKanban />} />
          <Route path="/staff-info" element={<StaffMyInformation />} />
          <Route path="/add-new-client" element={<StaffAddClient />} />
          <Route path="/staff-client-review/:clientId" element={<StaffClientReview />} />
          <Route path="/staff-document-review/:clientId" element={<StaffDocumentReview />} />
          <Route path="/staff-inbox/:clientId?" element={<StaffInbox />} />
          <Route path="/staff-client-details/:clientId" element={<StaffClientDetails />} />
          {/* Add other staff pages here later, e.g.:
          <Route path="/staff-kanban" element={<KanbanBoard />} /> 
          */}
        </Route>
      </Routes>
    </>
  )
}

export default App