import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const StaffArchivedClients = () => {
  const [archivedClients, setArchivedClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- FETCH ARCHIVED DATA ---
  useEffect(() => {
    const fetchArchivedClients = async () => {
      try {
        const res = await api.get('/profile/admin/all');
        
        // 1. Filter to ONLY show archived clients
        const archivedProfiles = res.data.filter((profile: any) => {
        const role = profile.user?.role;
        return profile.isArchived === true && role !== 'staff' && role !== 'admin';
        });

        // 2. Format exactly like the dashboard
        const formattedClients = archivedProfiles.map((profile: any, index: number) => ({
            id: profile.user?._id || "Unknown", 
            refId: generateRefId(profile.createdAt, index), 
            companyName: profile.companyName || "Unnamed Company",
            contactName: profile.user?.name || "Unknown User", 
            contactNumber: profile.contactPhone || "N/A",
            visitDate: new Date(profile.createdAt).toLocaleDateString(), 
            status: profile.status || "Archived", 
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", 
        }));

        setArchivedClients(formattedClients);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching archived clients:", err);
        setLoading(false);
      }
    };

    fetchArchivedClients();
  }, []);

  // Helper: Generate Ref ID (MMDDYYYY + Index)
  const generateRefId = (dateString: string, index: number) => {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    const uniqueSuffix = 100 + index; 
    return `${mm}${dd}${yyyy}${uniqueSuffix}`;
  };

  // --- RESTORE (UNARCHIVE) FUNCTION ---
  const handleRestore = async (clientId: string) => {
    if (!window.confirm("Restore this client back to the active dashboard?")) return;
    
    try {
      await api.put(`/profile/${clientId}/unarchive`);
      // Remove from this screen dynamically
      setArchivedClients(prev => prev.filter(c => c.id !== clientId)); 
      alert("Client restored to main dashboard!");
    } catch (err) {
      console.error("Failed to restore client", err);
      alert("Failed to restore client.");
    }
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Archives...</div>;

  return (
    <div className="w-full space-y-6 max-w-7xl mx-auto">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div>
            <h1 className="text-3xl font-bold text-gray-800">Archived Clients</h1>
            <p className="text-gray-500 mt-1 text-sm">These clients are hidden from the main dashboard and Kanban board.</p>
        </div>
        <Link to="/staff-dashboard" className="mt-4 md:mt-0 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2 px-6 rounded shadow transition flex items-center gap-2">
            <span>&larr;</span> Back to Dashboard
        </Link>
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
        
        {archivedClients.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                <p className="text-xl text-gray-500 font-medium">Your archive is completely empty.</p>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm uppercase">
                            <th className="px-6 py-4 font-bold">Reference No.</th>
                            <th className="px-6 py-4 font-bold">Company Name</th>
                            <th className="px-6 py-4 font-bold">Contact Number</th>
                            <th className="px-6 py-4 font-bold">Archived Date</th>
                            <th className="px-6 py-4 font-bold text-center">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {archivedClients.map((client) => (
                            <tr key={client.id} className="hover:bg-gray-50 transition">
                                
                                <td className="px-6 py-4">
                                    <span className="font-mono font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                        {client.refId}
                                    </span>
                                </td>

                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3 opacity-75">
                                        <img src={client.image} alt="" className="w-10 h-10 rounded-full object-cover grayscale" />
                                        <span className="font-bold text-gray-700">
                                            {client.companyName}
                                        </span>
                                    </div>
                                </td>

                                <td className="px-6 py-4 text-gray-500">{client.contactNumber}</td>
                                <td className="px-6 py-4 text-gray-500">{client.visitDate}</td>
                                
                                <td className="px-6 py-4 text-center">
                                    <button 
                                        onClick={() => handleRestore(client.id)}
                                        className="bg-green-50 text-green-600 border border-green-200 hover:bg-green-600 hover:text-white font-bold py-1.5 px-4 rounded transition text-sm shadow-sm"
                                    >
                                        Restore
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>
    </div>
  );
};

export default StaffArchivedClients;