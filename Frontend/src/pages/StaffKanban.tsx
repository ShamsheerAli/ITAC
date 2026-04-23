import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import api from '../api/axios';

// --- ICONS ---
const IconSearch = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);
const IconFilter = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);
const IconSort = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
);
const IconUsers = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);
const IconReject = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

// --- COLUMN CONFIGURATION ---
const columnsFromBackend = {
  'New Inquiry': { name: 'New Inquiry', items: [] as any[], color: 'bg-blue-500' },
  'Awaiting Documents': { name: 'Awaiting Documents', items: [] as any[], color: 'bg-orange-500' },
  'Ready for audit': { name: 'Ready for audit', items: [] as any[], color: 'bg-green-500' },
  'Audit Scheduled': { name: 'Audit Scheduled', items: [] as any[], color: 'bg-cyan-500' },
  'Report writing': { name: 'Report writing', items: [] as any[], color: 'bg-pink-500' },
};

const StaffKanban = () => {
  const navigate = useNavigate(); 
  const [columns, setColumns] = useState(columnsFromBackend);
  const [loading, setLoading] = useState(true);
  const [totalClients, setTotalClients] = useState(0);

  // --- 1. Fetch Clients and Sort ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/profile/admin/all');
        const allClients = res.data;
        
        // FILTER OUT ARCHIVED CLIENTS
        const activeClients = allClients.filter((client: any) => {
         const role = client.user?.role;
        return !client.isArchived && role !== 'staff' && role !== 'admin';
        });
        
        setTotalClients(activeClients.length);
        
        const newColumns: any = JSON.parse(JSON.stringify(columnsFromBackend));

        activeClients.forEach((client: any) => {
           let status = client.status || 'New Inquiry';
           if (!newColumns[status]) status = 'New Inquiry';
           newColumns[status].items.push(client);
        });

        setColumns(newColumns);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Progress data", err);
      }
    };
    fetchData();
  }, []);

  // --- 2. Reject & Archive Logic ---
  const handleReject = async (e: React.MouseEvent, profile: any, columnId: string, index: number) => {
      e.stopPropagation(); // Prevents clicking the card from navigating to the review page
      
      if (!window.confirm(`Are you sure you want to reject and archive ${profile.companyName}?`)) return;

      try {
          // Pass the User ID to match our backend route { user: id }
          const userId = profile.user?._id || profile.user;
          await api.put(`/profile/${userId}/archive`);

          // Remove the card from the board locally
          const newColumns: any = { ...columns };
          newColumns[columnId].items.splice(index, 1);
          
          setColumns(newColumns);
          setTotalClients(prev => prev - 1); // Decrease the total count
      } catch (err) {
          console.error("Failed to reject client", err);
          alert("Failed to reject and archive client.");
      }
  };

  // --- 3. Drag & Drop Logic ---
  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    const { source, destination } = result;

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId as keyof typeof columns];
      const destColumn = columns[destination.droppableId as keyof typeof columns];
      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      
      removed.status = destColumn.name;
      
      destItems.splice(destination.index, 0, removed);

      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: sourceItems },
        [destination.droppableId]: { ...destColumn, items: destItems },
      });

      // Update Backend
      try {
        await api.put(`/profile/status/${removed._id}`, { status: destColumn.name });
      } catch (err) {
        alert("Failed to save changes.");
      }
    } else {
      const column = columns[source.droppableId as keyof typeof columns];
      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);
      
      setColumns({
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems }
      });
    }
  };

  if(loading) return <div className="p-10 text-center">Loading Board...</div>;

  return (
    <div className="min-h-screen bg-white p-6 font-sans">
      
      {/* HEADER */}
      <div className="text-center mb-6">
         <h1 className="text-2xl font-bold uppercase tracking-wide inline-block border-b-4 border-[#FE5C00] pb-1">
            Client Progress Board
         </h1>
      </div>

      {/* MAIN BOARD CONTAINER */}
      <div className="border border-gray-200 rounded-lg shadow-sm bg-white overflow-hidden">
        
        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-200 bg-gray-50/50 gap-4">
            <div className="flex items-center">
                <IconUsers />
                <span className="text-gray-600 font-medium text-lg">
                    Total Active Clients : <span className="font-bold text-black">{totalClients}</span>
                </span>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <span className="absolute left-3 top-2.5"><IconSearch /></span>
                    <input 
                        type="text" 
                        placeholder="Search Company name or Id" 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm outline-none focus:border-[#FE5C00]"
                    />
                </div>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700">
                    <IconFilter /> Filter
                </button>
                <button className="flex items-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 text-sm font-medium text-gray-700">
                    <IconSort /> Sort
                </button>
            </div>
        </div>

        {/* DRAG & DROP AREA */}
        <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-5 min-w-[1000px] divide-x divide-gray-200">
                    
                    {/* COLUMNS */}
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div key={columnId} className="flex flex-col min-h-[600px]">
                            
                            <div className="p-4 text-center border-b border-gray-200 bg-gray-50">
                                <h3 className="text-gray-600 font-semibold text-sm uppercase">{column.name}</h3>
                            </div>

                            <Droppable droppableId={columnId}>
                                {(provided, snapshot) => (
                                    <div
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                        className={`flex-1 p-3 space-y-3 transition-colors duration-200 ${snapshot.isDraggingOver ? 'bg-blue-50' : 'bg-white'}`}
                                    >
                                        {column.items.map((item: any, index: number) => (
                                            <Draggable key={item._id} draggableId={item._id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        onClick={() => {
                                                            // Check if the current column is "Awaiting Documents"
                                                            if (column.name === 'Awaiting Documents') {
                                                                navigate(`/staff-document-review/${item._id}`);
                                                            } else if (column.name === 'Ready for audit') {
                                                                 navigate(`/staff-audit-scheduling/${item._id}`); // <-- NEW ROUTE
                                                            } else if (column.name === 'Audit Scheduled') {
                                                                navigate(`/staff-audit-confirmation/${item._id}`); // <-- NEW ROUTE
                                                            } 
                                                             else {
                                                                navigate(`/staff-client-review/${item._id}`);
                                                            }
                                                        }}
                                                        className={`bg-white border border-gray-200 rounded-md p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-start gap-3 relative
                                                            ${snapshot.isDragging ? 'ring-2 ring-[#FE5C00] shadow-xl rotate-2' : ''}`}
                                                        style={{ ...provided.draggableProps.style }}
                                                    >
                                                        {/* Status Dot */}
                                                        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${column.color}`}></div>
                                                        
                                                        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
            <p className="text-xs font-bold text-gray-700 truncate">
                {item.companyName}
            </p>
            <div className="flex items-center text-[10px] text-gray-400 mt-1 gap-2">
                <span>(ID: {item._id.substring(item._id.length - 6)})</span>
                
                {/* --- UX FIX: INLINE RED NOTIFICATION BADGE --- */}
                {(
                    // Condition 1: Awaiting Documents AND client uploaded files
                    (item.status === 'Awaiting Documents' && item.documents?.length > 0) ||
                    
                    // Condition 2: Ready for Audit AND no valid dates have been proposed
                    (item.status === 'Ready for audit' && (!item.proposedAuditDates || item.proposedAuditDates.filter((d: string) => d && d.trim() !== '').length === 0)) ||
                    // Condition 3: Audit Scheduled AND staff hasn't officially confirmed the date yet
                    (item.status === 'Audit Scheduled' && !item.isAuditConfirmed)
                ) && (
                    <span className="relative flex h-2.5 w-2.5" title="Action Required">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                )}

                {/* SHOW DATE IF AUDIT IS SCHEDULED */}
                {item.status === 'Audit Scheduled' && item.confirmedAuditDate && (
                    <span className="text-[#FE5C00] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                        {item.confirmedAuditDate.replace('Client Proposed: ', '').replace('Staff Proposed: ', '')}
                    </span>
                )}
            </div>
        </div>

                                                        {/* REJECT/ARCHIVE BUTTON */}
                                                        <button
                                                            onClick={(e) => handleReject(e, item, columnId, index)}
                                                            className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                                                            title="Reject & Archive Client"
                                                        >
                                                            <IconReject />
                                                        </button>

                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button 
                onClick={() => alert("All changes are saved automatically!")}
                className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-2 px-8 rounded shadow-sm transition text-sm"
            >
                Save
            </button>
        </div>

      </div>
    </div>
  );
};

export default StaffKanban;