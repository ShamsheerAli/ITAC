import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

// --- MAP IMPORTS ---
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css"; 
import L from "leaflet";

// --- LEAFLET ICON FIX ---
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

  const toggleMenu = (id: string) => {
    if (activeMenuId === id) setActiveMenuId(null);
    else setActiveMenuId(id);
  };

  // --- HELPER: GENERATE REFERENCE ID ---
  // Format: MMDDYYYY + Unique Suffix (e.g., 02032026101)
  const generateRefId = (dateString: string, index: number) => {
    const date = new Date(dateString);
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const yyyy = date.getFullYear();
    // Use index to create a unique suffix (101, 102, etc.) to handle same-day logins
    const uniqueSuffix = 100 + index; 
    return `${mm}${dd}${yyyy}${uniqueSuffix}`;
  };

  // Mock Data (Using login/visit date to generate IDs)
  const [clients] = useState(() => {
    const rawData = [
        {
          companyName: "ITW Paslode Power Nailing",
          contactName: "Steven Simpson",
          contactNumber: "224-532-8454",
          visitDate: "Feb 23, 2025",
          status: "New Inquiry",
          image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
          location: { lat: 36.1156, lng: -97.0584 },
        },
        {
          companyName: "Kingspan Roofing",
          contactName: "Antonio Lucena",
          contactNumber: "501-475-8533",
          visitDate: "Feb 18, 2025",
          status: "Audit Scheduled",
          image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
          location: { lat: 35.4676, lng: -97.5164 },
        },
        {
          companyName: "LOG10, LLC",
          contactName: "Krystal Dill",
          contactNumber: "580-304-7953",
          visitDate: "Dec 25, 2024",
          status: "Report writing",
          image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
          location: { lat: 36.1540, lng: -95.9928 },
        },
        {
          companyName: "Checotah Casino",
          contactName: "Karl Hildreth",
          contactNumber: "918-397-7449",
          visitDate: "Jan 10, 2025",
          status: "Awaiting documents",
          image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80",
          location: { lat: 35.7054, lng: -95.3588 },
        },
    ];

    // Generate IDs dynamically based on date
    return rawData.map((client, index) => ({
        ...client,
        id: generateRefId(client.visitDate, index)
    }));
  });

  return (
    <div className="w-full space-y-8" onClick={() => setActiveMenuId(null)}> 
      
      {/* TOP SECTION: MAP & ACTION CENTER */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* LEFT CARD: MAP */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full min-h-[380px] border border-gray-200 relative z-0">
           <MapContainer 
                center={[35.8, -96.5]} 
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
                                <span className="text-xs text-gray-500">Ref: {client.id}</span>
                                <Link to={`/staff-inbox/${client.id}`} className="text-[#FE5C00] text-xs underline mt-1 block">
                                    Message
                                </Link>
                            </div>
                        </Popup>
                    </Marker>
                ))}
           </MapContainer>

           <div className="absolute top-4 left-4 z-[400]">
              <button className="bg-white text-gray-700 px-3 py-1 rounded shadow text-xs font-bold uppercase border border-gray-200 hover:bg-gray-50">
                  Reset View
              </button>
           </div>
        </div>

        {/* RIGHT CARD: ACTION CENTER */}
        <div className="bg-white p-2 h-full min-h-[380px] flex flex-col">
           <div className="mb-6">
            <h2 className="text-3xl font-bold text-center text-black">Action Center</h2>
            <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
          </div>

          <div className="flex-grow flex items-center justify-center">
            <div className="grid grid-cols-2 gap-6 w-full px-4">
                <StatBox label="New Inquiries" count={7} color="bg-blue-100" />
                <StatBox label="Awaiting documents" count={5} color="bg-red-100" />
                <StatBox label="Ready for audit" count={4} color="bg-purple-100" />
                <StatBox label="Reports nearing deadline" count={2} color="bg-green-100" />
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
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                <span>Total Clients : 1285</span>
            </div>

            <div className="flex-1 max-w-xl relative">
                 <input 
                    type="text" 
                    placeholder="Search by Reference No. or Company" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-none focus:border-[#FE5C00]"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium">
                    Filter
                </button>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 font-medium">
                    Sort
                </button>
            </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto pb-24">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-gray-50 text-gray-600 border-b border-gray-200 text-sm uppercase">
                        {/* 1. NEW POSITION: REFERENCE ID FIRST */}
                        <th className="px-6 py-4 font-bold">Reference No.</th>
                        
                        <th className="px-6 py-4 font-bold">Company Name</th>
                        <th className="px-6 py-4 font-bold">Contact Number</th>
                        <th className="px-6 py-4 font-bold">Contact Name</th>
                        <th className="px-6 py-4 font-bold">Visit Date</th>
                        <th className="px-6 py-4 font-bold">Status</th>
                        <th className="px-6 py-4 font-bold text-center">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50 transition relative">
                            
                            {/* 1. REFERENCE ID COLUMN (MOVED TO START) */}
                            <td className="px-6 py-4">
                                <span className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
                                    {client.id}
                                </span>
                            </td>

                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <img src={client.image} alt="" className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                 <Link to={`/staff-client-details/${client.id}`} className="font-bold text-gray-900 hover:text-[#FE5C00] transition">
                                     {client.companyName}
                                </Link>
                                <div className="text-xs text-gray-400">OK-{client.id.slice(-4)}</div> 
                                </div>
                                 </div>
                            </td>

                            <td className="px-6 py-4">
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                    <span className="w-2 h-2 rounded-full bg-[#FE5C00]"></span>
                                    {client.contactNumber}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-gray-700 font-medium">{client.contactName}</td>
                            <td className="px-6 py-4 text-gray-600 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {client.visitDate}
                            </td>
                            <td className="px-6 py-4">
                                <StatusBadge status={client.status} />
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
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                                </button>

                                {activeMenuId === client.id && (
                                    <div className="absolute right-8 top-12 w-40 bg-white rounded-lg shadow-xl border border-gray-100 z-50 overflow-hidden text-left animate-in fade-in zoom-in-95 duration-100">
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-black transition flex items-center gap-2"
                                            onClick={() => alert(`Archived ${client.id}`)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                            Archive
                                        </button>
                                        <button 
                                            className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#FE5C00] transition border-t border-gray-100 flex items-center gap-2"
                                            onClick={() => navigate(`/staff-inbox/${client.id}`)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                                            Message
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

/* --- SUB-COMPONENTS --- */
const StatBox = ({ label, count, color }: { label: string; count: number; color: string }) => (
    <div className={`${color} rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm h-32`}>
        <span className="text-gray-700 font-bold text-sm mb-2">{label}</span>
        <span className="text-4xl font-bold text-black">{count}</span>
    </div>
);

const StatusBadge = ({ status }: { status: string }) => {
    let styles = "bg-gray-100 text-gray-800";
    if (status === "New Inquiry") styles = "bg-blue-100 text-blue-700";
    if (status === "Audit Scheduled") styles = "bg-green-100 text-green-700";
    if (status === "Report writing") styles = "bg-purple-100 text-purple-700";
    if (status === "Awaiting documents") styles = "bg-red-100 text-red-700";

    return (
        <span className={`px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${styles}`}>
            {status}
        </span>
    );
};

export default StaffDashboard;