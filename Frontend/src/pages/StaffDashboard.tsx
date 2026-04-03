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
  const [unreadMessages, setUnreadMessages] = useState<any[]>([]);

  // --- ARCHIVE FUNCTION ---
  const handleArchive = async (clientId: string) => {
    if (!window.confirm("Are you sure you want to archive this client?")) return;
  
    try {
      await api.put(`/profile/${clientId}/archive`);
      // Remove the archived client from the current screen without refreshing
      setClients(prevClients => prevClients.filter(c => c.id !== clientId)); 
    } catch (err) {
      console.error("Failed to archive client", err);
      alert("Failed to archive client.");
    }
  };

  // --- FETCH REAL DATA & GEOCODE ---
  useEffect(() => {
    // Helper function to turn an address into Lat/Lng coordinates
    const getCoordinates = async (fullAddress: string) => {
        if (!fullAddress || fullAddress.trim() === '') return null;

        // 1. Check if we already found and saved these coordinates in the browser cache
        const cachedCoords = localStorage.getItem(`geo_${fullAddress}`);
        if (cachedCoords) return JSON.parse(cachedCoords);

        // 2. If not cached, fetch from the free OpenStreetMap API
        try {
            // Added a small delay to respect the free API's rate limit rules
            await new Promise(resolve => setTimeout(resolve, 600)); 
            
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(fullAddress)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
                // Save it to cache so it loads instantly next time!
                localStorage.setItem(`geo_${fullAddress}`, JSON.stringify(coords));
                return coords;
            }
        } catch (error) {
            console.error("Geocoding failed for:", fullAddress);
        }
        return null; // Return null if address is invalid or not found
    };

    const fetchUnread = async () => {
        try {
            const res = await api.get('/messages/admin/unread');
            setUnreadMessages(res.data);
        } catch (err) {
            console.error("Failed to fetch unread messages");
        }
    };
    
    fetchUnread();
    
    const fetchClients = async () => {
      try {
        const res = await api.get('/profile/admin/all');
        const activeProfiles = res.data.filter((profile: any) => {
         const role = profile.user?.role;
         return !profile.isArchived && role !== 'staff' && role !== 'admin'; 
        });

        const clientsWithLocations = [];

        // Loop through clients to get their addresses
        for (let i = 0; i < activeProfiles.length; i++) {
            const profile = activeProfiles[i];
            
            // Construct the full address string from your database fields
            const addressParts = [profile.streetAddress, profile.city, profile.state, profile.zipCode].filter(Boolean);
            const fullAddress = addressParts.join(', ');

            // Try to get real coordinates, otherwise default to Oklahoma State University
            const realLocation = await getCoordinates(fullAddress);
            const finalLocation = realLocation || { 
                lat: 36.1156 + (Math.random() - 0.5) * 0.1, // OSU Stillwater Area
                lng: -97.0584 + (Math.random() - 0.5) * 0.1 
            };

            clientsWithLocations.push({
                id: profile.user?._id || "Unknown", 
                refId: generateRefId(profile.createdAt, i), 
                companyName: profile.companyName || "Unnamed Company",
                contactName: profile.user?.name || "Unknown User", 
                contactNumber: profile.contactPhone || "N/A",
                visitDate: new Date(profile.createdAt).toLocaleDateString(), 
                status: profile.status || "New Inquiry", 
                image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png", 
                location: finalLocation
            });
        }

        setClients(clientsWithLocations);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching clients:", err);
        setLoading(false);
      }
    };

    fetchClients();
    
    // Check for unread messages every 5 seconds
    const interval = setInterval(fetchUnread, 5000);
    return () => clearInterval(interval);
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
                {clients.map((client) => {
                    const hasUnread = unreadMessages.some(msg => msg.clientUserId === client.id);
                    return (
                        <Marker key={client.id} position={[client.location.lat, client.location.lng]}>
                            <Popup>
                                <div className="text-center">
                                    <strong className="block text-sm">{client.companyName}</strong>
                                    <span className="text-xs text-gray-500">{client.status}</span>
                                    
                                    {/* MAP POPUP: Add a tiny red dot to the Message link if unread! */}
                                    <Link to={`/staff-inbox/${client.id}`} className="text-[#FE5C00] text-xs underline mt-1 flex items-center justify-center gap-1">
                                        Message
                                        {hasUnread && <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>}
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
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
        <div className="bg-white p-6 text-center border-b border-gray-200 flex justify-center items-center relative">
            <h2 className="text-3xl font-bold text-black uppercase tracking-wider">Dashboard</h2>
        </div>

        {/* Filter Bar */}
        <div className="bg-gray-50 p-4 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600 text-lg font-medium">
                <span>Total Clients : {clients.length}</span>
            </div>

            <div className="flex-1 max-w-xl relative flex items-center gap-4">
                 <input 
                    type="text" 
                    placeholder="Search by Company..." 
                    className="w-full pl-4 pr-4 py-2 border border-gray-300 rounded-md outline-none focus:border-[#FE5C00]"
                />
                <Link to="/staff-archived-clients" className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded shadow whitespace-nowrap transition">
                    Archived Clients
                </Link>
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
                    {clients.map((client) => {
                        const hasUnread = unreadMessages.some(msg => msg.clientUserId === client.id);

                        return (
                        <tr key={client.id} className="hover:bg-gray-50 transition relative">
                            
                            {/* REF ID */}
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                    {client.refId}
                                </span>
                            </td>

                            {/* COMPANY NAME + NOTIFICATION BADGE */}
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={client.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                    <div className="flex items-center gap-2">
                                        <Link to={`/staff-client-details/${client.id}`} className="font-bold text-gray-900 hover:text-[#FE5C00]">
                                            {client.companyName}
                                        </Link>
                                        
                                        {/* TABLE NOTIFICATION: Pulsing Red Dot */}
                                        {hasUnread && (
                                            <span className="relative flex h-3 w-3" title="New Unread Message!">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                            </span>
                                        )}
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
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE5C00] transition border-b border-gray-100 flex items-center justify-between"
                                            onClick={() => navigate(`/staff-inbox/${client.id}`)}
                                        >
                                            Message
                                            {hasUnread && <span className="h-2 w-2 bg-red-500 rounded-full"></span>}
                                        </button>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 transition font-medium"
                                            onClick={() => {
                                                handleArchive(client.id);
                                                setActiveMenuId(null); 
                                            }}
                                        >
                                            Archive
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    )})}
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