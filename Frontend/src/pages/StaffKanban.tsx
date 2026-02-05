import { useState } from "react";
import { useNavigate } from "react-router-dom";

// 1. Define the Status Types to match your columns
type TicketStatus = 
  | "New Inquiry"
  | "Awaiting Documents"
  | "Ready for audit"
  | "Audit Scheduled"
  | "Report writing";

// 2. Define the Ticket Interface
interface Ticket {
  id: string;
  companyName: string;
  clientId: string;
  status: TicketStatus;
  date?: string; // Optional date for "Audit Scheduled"
}

const StaffKanban = () => {
  // 3. Mock Data
  const [tickets] = useState<Ticket[]>([
    // New Inquiry
    { id: "1", companyName: "ITW Paslode Power Nailing", clientId: "OK1165", status: "New Inquiry" },
    { id: "2", companyName: "Koax Corp", clientId: "OK1166", status: "New Inquiry" },
    { id: "3", companyName: "American Airlines", clientId: "OK1167", status: "New Inquiry" },
    { id: "4", companyName: "ClimaCool Corp", clientId: "OK1168", status: "New Inquiry" },

    // Awaiting Documents
    { id: "5", companyName: "Checotah Casino", clientId: "OK1169", status: "Awaiting Documents" },
    { id: "6", companyName: "ClimateCraft, Inc.", clientId: "OK1170", status: "Awaiting Documents" },

    // Ready for audit
    { id: "7", companyName: "VacuWorx", clientId: "OK1171", status: "Ready for audit" },
    { id: "8", companyName: "Muscogee Casino", clientId: "OK1172", status: "Ready for audit" },
    { id: "9", companyName: "Oklahoma City Zoo", clientId: "OK1173", status: "Ready for audit" },
    { id: "10", companyName: "AAF International", clientId: "OK1174", status: "Ready for audit" },
    { id: "11", companyName: "Wako, LLC", clientId: "OK1175", status: "Ready for audit" },
    { id: "12", companyName: "One Fire Casino", clientId: "OK1176", status: "Ready for audit" },

    // Audit Scheduled
    { id: "13", companyName: "Kingspan Roofing", clientId: "OK1177", status: "Audit Scheduled", date: "12/08/25" },
    { id: "14", companyName: "Crusoe Tulsa 1", clientId: "OK1178", status: "Audit Scheduled", date: "12/22/25" },
    { id: "15", companyName: "Ferroloy Inc", clientId: "OK1179", status: "Audit Scheduled", date: "02/01/25" },

    // Report writing
    { id: "16", companyName: "LOG10, LLC", clientId: "OK1178", status: "Report writing" },
    { id: "17", companyName: "Elder Care", clientId: "OK1179", status: "Report writing" },
    { id: "18", companyName: "SPF America", clientId: "OK1180", status: "Report writing" },
    { id: "19", companyName: "PTMW, Inc", clientId: "OK1181", status: "Report writing" },
  ]);

  const columns: TicketStatus[] = [
    "New Inquiry",
    "Awaiting Documents",
    "Ready for audit",
    "Audit Scheduled",
    "Report writing",
  ];

  return (
    <div className="w-full h-full flex flex-col">
      
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center text-black uppercase tracking-wider">
          Kanban Board
        </h1>
        <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
      </div>

      {/* CONTROLS BAR */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Left: Count */}
        <div className="flex items-center gap-2 text-[#FE5C00] text-lg font-medium">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-gray-700">Total Active Clients : <span className="text-black font-bold">{tickets.length}</span></span>
        </div>

        {/* Right: Search & Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:w-80">
                 <input 
                    type="text" 
                    placeholder="Search Company name or Id" 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md outline-none focus:border-[#FE5C00] text-sm"
                />
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                Sort
            </button>
        </div>
      </div>

      {/* KANBAN BOARD GRID */}
      <div className="flex-1 overflow-x-auto">
        <div className="grid grid-cols-5 min-w-[1200px] border border-gray-200 rounded-lg overflow-hidden bg-white h-full min-h-[600px]">
            
            {columns.map((colName) => (
                <div key={colName} className="flex flex-col border-r border-gray-200 last:border-r-0">
                    {/* Column Header */}
                    <div className="bg-gray-50 py-4 text-center border-b border-gray-200">
                        <span className="text-gray-600 font-semibold text-lg">{colName}</span>
                    </div>

                    {/* Column Content */}
                    <div className="p-4 space-y-3 flex-1 bg-white">
                        {tickets
                            .filter(t => t.status === colName)
                            .map(ticket => (
                                <KanbanCard key={ticket.id} ticket={ticket} />
                            ))
                        }
                    </div>
                </div>
            ))}

        </div>
      </div>

      {/* FOOTER SAVE BUTTON */}
      <div className="flex justify-end mt-6">
          <button className="bg-[#FE5C00] text-white px-10 py-2 rounded shadow hover:bg-orange-700 transition font-bold text-lg">
            Save
          </button>
      </div>

    </div>
  );
};

/* --- SUB-COMPONENT: KANBAN CARD --- */

const KanbanCard = ({ ticket }: { ticket: Ticket }) => {
    const navigate = useNavigate();

    // Determine dot color based on status
    const getDotColor = (status: TicketStatus) => {
        switch(status) {
            case "New Inquiry": return "bg-blue-500";
            case "Awaiting Documents": return "bg-orange-500";
            case "Ready for audit": return "bg-green-500";
            case "Audit Scheduled": return "bg-cyan-500";
            case "Report writing": return "bg-purple-500";
            default: return "bg-gray-500";
        }
    };

    // --- NAVIGATION LOGIC ---
    const handleClick = () => {
        if (ticket.status === "New Inquiry") {
            // Navigate to Client Review Page
            navigate(`/staff-client-review/${ticket.clientId}`);
        } else if (ticket.status === "Awaiting Documents") {
            // Navigate to Document Review Page
            navigate(`/staff-document-review/${ticket.clientId}`);
        }
    };

    // Determine if card should show pointer cursor and hover effect
    const isClickable = ticket.status === "New Inquiry" || ticket.status === "Awaiting Documents";

    return (
        <div 
            onClick={handleClick}
            className={`flex items-center gap-2 p-3 rounded-lg border border-gray-200 shadow-sm transition bg-white 
                ${isClickable ? "cursor-pointer hover:shadow-md hover:border-[#FE5C00]" : "cursor-default"}
            `}
        >
            {/* Status Dot */}
            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getDotColor(ticket.status)}`} />
            
            {/* Text Content */}
            <div className="text-xs font-medium text-gray-700 truncate leading-tight">
                {ticket.companyName} ({ticket.clientId})
                {ticket.date && (
                    <span className="text-gray-500 block mt-0.5 text-[10px]">
                        - {ticket.date}
                    </span>
                )}
            </div>
        </div>
    );
};

export default StaffKanban;