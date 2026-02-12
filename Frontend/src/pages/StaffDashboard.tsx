import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; 
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [clients, setClients] = useState<any[]>([]); // State for Real Data
  const [loading, setLoading] = useState(true);

  // --- 1. FETCH REAL DATA ---
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await api.get('/profile/admin/all');
        
        // Transform the DB data to match our UI shape
        const formattedClients = res.data.map((profile: any, index: number) => ({
            id: profile.user?._id || "Unknown", // Use MongoDB ID
            refId: generateRefId(profile.createdAt, index), // Generate readable ID
            companyName: profile.companyName || "Unnamed Company",
            contactName: profile.user?.name || "Unknown User", // Get name from User Login
            contactNumber: profile.contactPhone || "N/A",
            visitDate: new Date(profile.createdAt).toLocaleDateString(), // Use creation date
            status: profile.status || "New Inquiry", // Use status from DB
            image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", // Placeholder
            
            // MOCK LOCATION GENERATOR (Random spots around Oklahoma for demo)
            // Center is roughly 35.5, -97.5. We add small random variance.
            location: { 
                lat: 35.5 + (Math.random() - 0.5) * 2, 
                lng: -97.5 + (Math.random() - 0.5) * 2 
            } 
        }));

        setClients(formattedClients);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setLoading(false);
      }
    };

    fetchClients();
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

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  if (loading) return <div className="p-10 text-center">Loading Staff Dashboard...</div>;

  return (
    <div className="w-full space-y-8" onClick={() => setActiveMenuId(null)}> 
      
      {/* TOP SECTION: MAP & ACTION CENTER */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT CARD: MAP */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full min-h-[380px] border border-gray-200 relative z-0">
           <MapContainer 
                center={[35.5, -97.5]} // Oklahoma Center
                zoom={7} 
                scrollWheelZoom={false}
                className="w-full h-full min-h-[380px]"
           >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {clients.map((client) => (
                    <Marker key={client.id} position={[client.location.lat, client.location.lng]}>
                        <Popup>
                            <div className="text-center">
                                <strong className="block text-sm">{client.companyName}</strong>
                                <span className="text-xs text-gray-500">{client.status}</span>
                                <Link to={`/staff-inbox/${client.id}`} className="text-[#FE5C00] text-xs underline mt-1 block">
                                    Message
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
           </MapContainer>
        </div>

        {/* RIGHT CARD: ACTION CENTER */}
        <div className="bg-white p-2 h-full min-h-[380px] flex flex-col">
           <div className="mb-6">
            <h2 className="text-3xl font-bold text-center text-black">Action Center</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
          </div>

          <div className="flex-grow flex items-center justify-center">
            <div className="grid grid-cols-2 gap-6 w-full px-4">
                <StatBox label="New Inquiries" count={clients.filter(c => c.status === 'New Inquiry').length} color="bg-blue-100" />
                <StatBox label="Awaiting documents" count={clients.filter(c => c.status === 'Awaiting Documents').length} color="bg-red-100" />
                <StatBox label="Approved" count={clients.filter(c => c.status === 'Approved').length} color="bg-green-100" />
                <StatBox label="Total" count={clients.length} color="bg-gray-100" />
            </div>

            <div className="flex flex-col gap-6 ml-6 justify-center">
                 <Link to="/staff-kanban">
                    <button className="w-48 bg-[#FE5C00] text-white px-6 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-lg text-center leading-tight">
                        View kanban board
                    </button>
                 </Link>
                 <Link to="/add-new-client">
                    <button className="w-48 bg-[#FE5C00] text-white px-6 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-lg text-center leading-tight">
                        Add new clients
                    </button>
                 </Link>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: DASHBOARD TABLE */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-[500px]">
        <div className="bg-white p-6 text-center border-b border-gray-200">
            <h2 className="text-3xl font-bold text-black uppercase tracking-wider">Dashboard</h2>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
                <span>Total Clients : {clients.length}</span>
            </div>

            <div className="flex-1 max-w-xl relative">
                 <input 
                    type="text" 
                    placeholder="Search by Company..." 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-none focus:border-[#FE5C00]"
                />
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto pb-24">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm uppercase">
                        <th className="px-6 py-4 font-bold">Reference No.</th>
                        <th className="px-6 py-4 font-bold">Company Name</th>
                        <th className="px-6 py-4 font-bold">Contact Number</th>
                        <th className="px-6 py-4 font-bold">Contact Name</th>
                        <th className="px-6 py-4 font-bold">Joined Date</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50 transition relative">
                            
                            {/* REF ID */}
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                    {client.refId}
                                </span>
                            </td>

                            {/* COMPANY */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={client.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <Link to={`/staff-client-details/${client.id}`} className="font-bold text-gray-900 hover:text-[#FE5C00]">
                                            {client.companyName}
                                        </Link>
                                    </div>
                                </div>
                            </td>

                            <td className="px-6 py-4">{client.contactNumber}</td>
                            <td className="px-6 py-4 text-gray-700 font-medium">{client.contactName}</td>
                            <td className="px-6 py-4 text-gray-600">{client.visitDate}</td>
                            
                            {/* STATUS */}
                            <td className="px-6 py-4">
                                <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide 
                                    ${client.status === 'New Inquiry' ? 'bg-blue-100 text-blue-700' : 
                                      client.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-800'}`}>
                                    {client.status}
                                </span>
                            </td>
                            
                            {/* ACTION COLUMN */}
                            <td className="px-6 py-4 text-center relative">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation(); 
                                        toggleMenu(client.id);
                                    }}
                                    className="text-gray-400 hover:text-[#FE5C00] p-2 rounded-full hover:bg-orange-50 transition outline-none"
                                >
                                    {/* Three Dots Icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>

                                {activeMenuId === client.id && (
                                    <div className="absolute right-8 top-12 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE5C00] transition border-t border-gray-100"
                                            onClick={() => navigate(`/staff-inbox/${client.id}`)}
                                        >
                                            Message
                                        </button>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE5C00] transition border-t border-gray-100"
                                            onClick={() => navigate(`/staff-client-details/${client.id}`)}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, count, color }: { label: string; count: number; color: string }) => (
    <div className={`${color} rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm h-32`}>
        <span className="text-gray-700 font-bold text-sm mb-2">{label}</span>
        <span className="text-4xl font-bold text-black">{count}</span>
    </div>
);

export default StaffDashboard;