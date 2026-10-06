import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

const COLUMNS = [
  { id: 'New Inquiry', title: 'New Inquiries', headerColor: 'bg-blue-100 text-blue-800' },
  { id: 'Awaiting Documents', title: 'Awaiting Documents', headerColor: 'bg-pink-100 text-pink-800' },
  { id: 'Ready for audit', title: 'Ready for Audit', headerColor: 'bg-green-100 text-green-800' },
  { id: 'Audit Scheduled', title: 'Audit Scheduled', headerColor: 'bg-purple-100 text-purple-800' },
  { id: 'Report writing', title: 'Report Writing', headerColor: 'bg-orange-100 text-orange-800' },
  { id: 'Completed', title: 'Completed', headerColor: 'bg-gray-200 text-gray-800' }
];

const StudentKanban = () => {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/profile/admin/all');
        // Filter out staff/admin if they get returned
        const validClients = res.data.filter((p: any) => p.user && p.user.role === 'client');
        setClients(validClients);
      } catch (err) {
        console.error("Failed to fetch clients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const getClientsByStatus = (statusId: string) => {
    return clients.filter(c => c.status === statusId);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Active Assessments...</div>;

  return (
    <div className="w-full h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Active Assessments</h1>
        <p className="text-sm text-gray-500">Select any client to view their details and upload field notes.</p>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {COLUMNS.map((col) => {
          const columnClients = getClientsByStatus(col.id);
          return (
            <div key={col.id} className="min-w-[300px] w-[300px] bg-gray-100 rounded-lg flex flex-col max-h-full border border-gray-200">
              <div className={`px-4 py-3 border-b border-gray-200 flex items-center justify-between rounded-t-lg ${col.headerColor}`}>
                <h3 className="font-bold text-sm tracking-wide">{col.title}</h3>
                <span className="bg-white/50 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm">
                  {columnClients.length}
                </span>
              </div>
              
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {columnClients.length === 0 ? (
                  <p className="text-center text-gray-400 text-xs italic mt-4">No clients</p>
                ) : (
                  columnClients.map((client) => (
                    <div 
                      key={client._id}
                      onClick={() => navigate(`/student-report/${client._id}`)}
                      className="bg-white p-4 rounded shadow-sm border border-gray-200 cursor-pointer hover:border-[#FE5C00] hover:shadow-md transition group"
                    >
                      <h4 className="font-bold text-gray-800 group-hover:text-[#FE5C00] transition truncate">
                        {client.companyName}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Contact: {client.contactName}
                      </p>
                      <div className="mt-3 flex justify-between items-center text-[10px] font-bold text-gray-400">
                         <span>ID: {client._id.substring(client.user._id.length - 6)}</span>
                         <span className="text-[#FE5C00] opacity-0 group-hover:opacity-100 transition">View Details &rarr;</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentKanban;