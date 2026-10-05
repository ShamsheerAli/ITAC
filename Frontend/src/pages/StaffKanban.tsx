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
const IconPlus = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
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

  // --- NEW CLIENT MODAL STATE ---
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClientData, setNewClientData] = useState({
      name: '',
      email: '',
      companyName: ''
  });

  // --- HELPER: Calculate Days in Stage ---
  const getDaysInStage = (dateString: string) => {
      if (!dateString) return 'Today';
      const updatedDate = new Date(dateString);
      const today = new Date();
      
      updatedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      const diffTime = Math.abs(today.getTime() - updatedDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return '1 day';
      return `${diffDays} days`;
  };

  // --- 1. Fetch Clients and Sort ---
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
         if (status === 'Approved' || status === 'Documents Submitted' || status === 'Documents Uploaded') {
             status = 'Awaiting Documents';
         }
         if (!newColumns[status]) status = 'New Inquiry';
         newColumns[status].items.push(client);
      });

      setColumns(newColumns);
      setLoading(false);
    } catch (err) {
      console.error("Failed to load Progress data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. Reject & Archive Logic ---
  const handleReject = async (e: React.MouseEvent, profile: any, columnId: string, index: number) => {
      e.stopPropagation(); 
      
      if (!window.confirm(`Are you sure you want to reject and archive ${profile.companyName}?`)) return;

      try {
          const userId = profile.user?._id || profile.user;
          await api.put(`/profile/${userId}/archive`);

          const newColumns: any = { ...columns };
          newColumns[columnId].items.splice(index, 1);
          
          setColumns(newColumns);
          setTotalClients(prev => prev - 1); 
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
      removed.statusUpdatedAt = new Date().toISOString();
      
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

  // --- 4. Handle Add New Client Submission ---
  const handleAddClientSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSubmitting(true);

      try {
          // 🚨 Calling the new backend route to handle user creation & email
          await api.post('/profile/admin/manual-create', newClientData);
          
          alert(`Client created successfully! An invitation email has been sent to ${newClientData.email}.`);
          
          setIsAddModalOpen(false);
          setNewClientData({ name: '', email: '', companyName: '' });
          
          // Refresh the board to show the new client in "New Inquiry"
          fetchData();
      } catch (err: any) {
          console.error("Failed to add client", err);
          alert(err.response?.data?.message || "Failed to create client. Please check the server logs.");
      } finally {
          setIsSubmitting(false);
      }
  };

  if(loading) return <div className="p-10 text-center">Loading Board...</div>;

  return (
    <div className="min-h-screen bg-white p-6 font-sans relative">
      
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
                
                {/* 🚨 ADD CLIENT BUTTON */}
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center px-4 py-2 bg-[#FE5C00] text-white rounded-md hover:bg-orange-700 text-sm font-bold shadow-sm transition whitespace-nowrap"
                >
                    <IconPlus /> Add Client
                </button>
            </div>
        </div>

        {/* DRAG & DROP AREA */}
        <div className="overflow-x-auto">
            <DragDropContext onDragEnd={onDragEnd}>
                <div className="grid grid-cols-5 min-w-[1000px] divide-x divide-gray-200">
                    
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
                                                            if (column.name === 'Awaiting Documents') {
                                                                navigate(`/staff-document-review/${item._id}`);
                                                            } else if (column.name === 'Ready for audit') {
                                                                 navigate(`/staff-audit-scheduling/${item._id}`);
                                                            } else if (column.name === 'Audit Scheduled') {
                                                                navigate(`/staff-audit-confirmation/${item._id}`);
                                                            } else if (column.name === 'Report writing') {          
                                                                navigate(`/staff-report-writing/${item._id}`);
                                                            } else {
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
                                                                <span className="flex items-center gap-1 font-medium" title="Time spent in this stage">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                                    </svg>
                                                                    {getDaysInStage(item.statusUpdatedAt || item.createdAt)}
                                                                </span>
                                                                
                                                                {/* Alerts */}
                                                                {(
                                                                    (item.status === 'New Inquiry' && !item.serviceType) ||
                                                                    (item.status === 'Awaiting Documents' && item.documents?.length > 0) ||
                                                                    (item.status === 'Ready for audit' && (!item.proposedAuditDates || item.proposedAuditDates.filter((d: string) => d && d.trim() !== '').length === 0)) ||
                                                                    (item.status === 'Audit Scheduled' && !item.isAuditConfirmed)
                                                                ) && (
                                                                    <span className="relative flex h-2.5 w-2.5 ml-2" title="Action Required">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                                                                    </span>
                                                                )}

                                                                {item.status === 'Audit Scheduled' && item.confirmedAuditDate && (
                                                                    <span className="text-[#FE5C00] font-bold bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100">
                                                                        {item.confirmedAuditDate.replace('Client Proposed: ', '').replace('Staff Proposed: ', '')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

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

      {/* 🚨 NEW CLIENT MODAL OVERLAY */}
      {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                  
                  <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                      <h2 className="text-xl font-bold text-gray-800">Add New Active Client</h2>
                      <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                          <IconReject />
                      </button>
                  </div>

                  <form onSubmit={handleAddClientSubmit} className="p-6 space-y-4">
                      <p className="text-sm text-gray-500 mb-4">
                          Creating a client here will immediately place them on the progress board and send an email inviting them to set up their portal password.
                      </p>

                      <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Company Name *</label>
                          <input 
                              type="text" 
                              required
                              value={newClientData.companyName}
                              onChange={(e) => setNewClientData({...newClientData, companyName: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00]"
                              placeholder="e.g. Acme Industries"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Primary Contact Name *</label>
                          <input 
                              type="text" 
                              required
                              value={newClientData.name}
                              onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00]"
                              placeholder="e.g. Jane Doe"
                          />
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Contact Email *</label>
                          <input 
                              type="email" 
                              required
                              value={newClientData.email}
                              onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                              className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00]"
                              placeholder="jane.doe@acme.com"
                          />
                      </div>

                      <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                          <button 
                              type="button" 
                              onClick={() => setIsAddModalOpen(false)}
                              className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold transition"
                          >
                              Cancel
                          </button>
                          <button 
                              type="submit" 
                              disabled={isSubmitting}
                              className={`px-8 py-2 rounded text-white font-bold transition flex items-center gap-2 shadow-sm
                                  ${isSubmitting ? 'bg-orange-300 cursor-not-allowed' : 'bg-[#FE5C00] hover:bg-orange-700'}`}
                          >
                              {isSubmitting ? 'Creating...' : 'Create Client'}
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

    </div>
  );
};

export default StaffKanban;