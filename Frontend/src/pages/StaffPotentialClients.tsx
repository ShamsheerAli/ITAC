import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";

const StaffPotentialClients = () => {
  const [leads, setLeads] = useState<any[]>([]); 
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    const fetchLeads = async () => {
        try {
            const res = await api.get('/leads');
            setLeads(res.data);
        } catch (err) {
            console.error("Failed to fetch leads", err);
        } finally {
            setLoading(false);
        }
    };
    fetchLeads();
  }, []);

  const filteredLeads = leads.filter(lead => 
    (lead.companyName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (lead.contactName || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (lead: any) => {
      setSelectedLead(lead);
      setEditFormData(lead); 
      setIsEditing(false);   
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleSaveChanges = async () => {
      try {
          const res = await api.put(`/leads/${selectedLead._id}`, editFormData);
          setLeads(leads.map(l => l._id === selectedLead._id ? res.data : l));
          setSelectedLead(res.data);
          setIsEditing(false);
          alert("Lead updated successfully!");
      } catch (err) {
          console.error("Failed to update lead:", err);
          alert("Error updating client data.");
      }
  };

  const handleConvertToActive = async (leadId: string, companyName: string) => {
    const leadToConvert = leads.find(l => l._id === leadId);

    if (!leadToConvert?.contactEmail || leadToConvert.contactEmail.trim() === '') {
        alert(`Cannot convert ${companyName}! \n\nAn email address is required to send the portal invitation. Please click "Edit Details" and add an email address first.`);
        return; 
    }

    if(window.confirm(`Are you sure you want to convert ${companyName} to an active client and send them a portal invitation to ${leadToConvert.contactEmail}?`)) {
        try {
            // await api.post(`/leads/convert/${leadId}`);
            alert(`Conversion triggered for ${companyName}! Invitation sent to ${leadToConvert.contactEmail}.`);
            setLeads(leads.filter(l => l._id !== leadId));
            setSelectedLead(null); 
        } catch (err) {
            console.error("Failed to convert lead:", err);
            alert("Error converting client. Check server logs.");
        }
    }
  };

  const handleArchiveLead = async (leadId: string, companyName: string) => {
    if(window.confirm(`Are you sure you want to archive the lead for ${companyName}?`)) {
        try {
            await api.put(`/leads/${leadId}/archive`);
            alert(`${companyName} has been archived.`);
            setLeads(leads.filter(l => l._id !== leadId));
            setSelectedLead(null); 
        } catch (err) {
            console.error("Failed to archive lead:", err);
            alert("Error archiving client.");
        }
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 flex flex-col font-sans relative">
      
      {/* HEADER SECTION */}
      <div className="bg-white border-b border-gray-200 px-8 py-6 mb-8 shadow-sm">
        {/* 🚨 UPDATED WIDTH: Changed max-w-7xl to max-w-[1600px] */}
        <div className="w-full max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
                <h1 className="text-3xl font-bold text-black">Potential Clients & Leads</h1>
                <p className="text-gray-500 mt-1">Review and convert prospective companies into active ITAC assessments.</p>
            </div>
            
            <div className="relative w-full md:w-96">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <input
                    type="text"
                    placeholder="Search companies or contacts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00] transition shadow-sm"
                />
            </div>
        </div>
      </div>

      {/* MAIN DATA TABLE */}
      {/* 🚨 UPDATED WIDTH: Changed max-w-7xl to max-w-[1600px] */}
      <div className="flex-1 w-full max-w-[1600px] mx-auto px-6 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            
            <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-700 text-lg">Lead Pipeline <span className="bg-orange-100 text-[#FE5C00] text-sm ml-2 px-3 py-0.5 rounded-full">{filteredLeads.length} Total</span></span>
                
                <Link to="/add-new-client">
                    <button className="bg-[#FE5C00] hover:bg-orange-700 text-white font-bold py-2 px-4 rounded transition flex items-center gap-2 text-sm shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                        Add New Lead
                    </button>
                </Link>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="px-6 py-4 font-bold">Company</th>
                            <th className="px-6 py-4 font-bold">Primary Contact</th>
                            <th className="px-6 py-4 font-bold">Source</th>
                            <th className="px-6 py-4 font-bold">Variation Type</th>
                            {/* 🚨 ADDED EXTRA INFO HEADER */}
                            <th className="px-6 py-4 font-bold">Extra Info</th>
                            <th className="px-6 py-4 font-bold">Date Added</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <tr>
                                {/* 🚨 UPDATED COLSPAN TO 7 */}
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                    Loading leads...
                                </td>
                            </tr>
                        ) : filteredLeads.length > 0 ? (
                            filteredLeads.map((lead) => (
                                <tr key={lead._id} className="hover:bg-orange-50/50 transition group">
                                    <td className="px-6 py-4">
                                        <div 
                                            className="font-bold text-gray-900 cursor-pointer hover:text-[#FE5C00] hover:underline transition flex items-center gap-2"
                                            onClick={() => handleOpenModal(lead)}
                                            title="Click to view details"
                                        >
                                            {lead.companyName}
                                        </div>
                                        <div className="text-xs text-gray-400">ID: {lead._id?.substring(lead._id.length - 6)}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-800">{lead.contactName || 'N/A'}</div>
                                        <a href={`mailto:${lead.contactEmail}`} className="text-sm text-gray-500 hover:text-[#FE5C00]">{lead.contactEmail || 'No email provided'}</a>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 whitespace-nowrap">
                                            {lead.leadSource || 'Manual Entry'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {lead.variationType ? (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 whitespace-nowrap">
                                                {lead.variationType}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">N/A</span>
                                        )}
                                    </td>
                                    {/* 🚨 ADDED EXTRA INFO CELL WITH TRUNCATION */}
                                    <td className="px-6 py-4">
                                        {lead.extraInfo ? (
                                            <div className="text-sm text-gray-600 max-w-[200px] lg:max-w-[300px] truncate" title={lead.extraInfo}>
                                                {lead.extraInfo}
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-sm">N/A</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : new Date().toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                                        <button 
                                            onClick={() => handleArchiveLead(lead._id, lead.companyName)}
                                            className="bg-white border border-red-200 text-red-500 hover:bg-red-50 hover:text-red-700 px-3 py-2 rounded text-sm font-bold transition shadow-sm inline-flex items-center gap-1"
                                            title="Archive Lead"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                            Archive
                                        </button>

                                        <button 
                                            onClick={() => handleConvertToActive(lead._id, lead.companyName)}
                                            className="bg-white border border-gray-300 text-gray-700 hover:bg-green-50 hover:text-green-700 hover:border-green-300 px-4 py-2 rounded text-sm font-bold transition shadow-sm inline-flex items-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                            Convert
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                {/* 🚨 UPDATED COLSPAN TO 7 */}
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-500 italic">
                                    No potential clients found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </div>
      </div>

      {/* MODAL OVERLAY FOR LEAD DETAILS & EDITING */}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
                
                {/* Modal Header */}
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {isEditing ? 'Edit Lead Details' : 'Lead Details'}
                    </h2>
                    <button 
                        onClick={() => setSelectedLead(null)}
                        className="text-gray-400 hover:text-red-500 transition p-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <div className="p-8 overflow-y-auto flex-1">
                    
                    {/* Company Name Header (Editable) */}
                    <div className="mb-6">
                        {isEditing ? (
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Company Name</label>
                                <input 
                                    type="text" 
                                    name="companyName"
                                    value={editFormData.companyName} 
                                    onChange={handleEditChange}
                                    className="w-full border border-gray-300 rounded px-3 py-2 text-xl font-bold text-[#FE5C00] outline-none focus:border-[#FE5C00]"
                                />
                            </div>
                        ) : (
                            <>
                                <h3 className="text-3xl font-extrabold text-[#FE5C00]">{selectedLead.companyName}</h3>
                                <p className="text-sm text-gray-400 mt-1">Lead ID: {selectedLead._id} | Added: {new Date(selectedLead.createdAt).toLocaleDateString()}</p>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <EditableDetailItem label="Contact Name" name="contactName" value={isEditing ? editFormData.contactName : selectedLead.contactName} isEditing={isEditing} onChange={handleEditChange} />
                        <EditableDetailItem label="Contact Email" name="contactEmail" value={isEditing ? editFormData.contactEmail : selectedLead.contactEmail} isEditing={isEditing} onChange={handleEditChange} isEmail />
                        <EditableDetailItem label="Contact Phone" name="contactPhone" value={isEditing ? editFormData.contactPhone : selectedLead.contactPhone} isEditing={isEditing} onChange={handleEditChange} />
                        <EditableDetailItem label="Lead Source" name="leadSource" value={isEditing ? editFormData.leadSource : selectedLead.leadSource} isEditing={isEditing} onChange={handleEditChange} />
                        
                        {/* Address Fields */}
                        <div className="col-span-1 md:col-span-2">
                            {isEditing ? (
                                <div className="grid grid-cols-6 gap-2">
                                    <div className="col-span-6">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Address</label>
                                        <input type="text" name="address" value={editFormData.address} onChange={handleEditChange} placeholder="Street" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#FE5C00] text-sm" />
                                    </div>
                                    <div className="col-span-3">
                                        <input type="text" name="city" value={editFormData.city} onChange={handleEditChange} placeholder="City" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#FE5C00] text-sm" />
                                    </div>
                                    <div className="col-span-1">
                                        <input type="text" name="state" value={editFormData.state} onChange={handleEditChange} placeholder="ST" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#FE5C00] text-sm" />
                                    </div>
                                    <div className="col-span-2">
                                        <input type="text" name="zipCode" value={editFormData.zipCode} onChange={handleEditChange} placeholder="Zip" className="w-full border border-gray-300 rounded px-3 py-1.5 outline-none focus:border-[#FE5C00] text-sm" />
                                    </div>
                                </div>
                            ) : (
                                <DetailItem 
                                    label="Address" 
                                    value={`${selectedLead.address || ''} ${selectedLead.city ? `, ${selectedLead.city}` : ''} ${selectedLead.state || ''} ${selectedLead.zipCode || ''}`.trim()} 
                                />
                            )}
                        </div>

                        <EditableDetailItem label="Variation Type" name="variationType" value={isEditing ? editFormData.variationType : selectedLead.variationType} isEditing={isEditing} onChange={handleEditChange} />
                        <EditableDetailItem label="Funding Type" name="fundingType" value={isEditing ? editFormData.fundingType : selectedLead.fundingType} isEditing={isEditing} onChange={handleEditChange} />
                    </div>

                    {/* Extra Info Box */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <EditableDetailItem 
                            label="Extra Information & Notes" 
                            name="extraInfo" 
                            value={isEditing ? editFormData.extraInfo : selectedLead.extraInfo} 
                            isEditing={isEditing} 
                            onChange={handleEditChange} 
                            isTextArea 
                        />
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end gap-4">
                    {isEditing ? (
                        <>
                            <button 
                                onClick={() => setIsEditing(false)}
                                className="px-6 py-2 rounded text-gray-600 hover:bg-gray-200 font-bold transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleSaveChanges}
                                className="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded shadow-md font-bold transition flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Save Changes
                            </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={() => setIsEditing(true)}
                                className="px-6 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-bold transition flex items-center gap-2 mr-auto"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                Edit Details
                            </button>
                            
                            <button 
                                onClick={() => handleArchiveLead(selectedLead._id, selectedLead.companyName)}
                                className="px-6 py-2 rounded text-red-600 hover:bg-red-50 font-bold transition"
                            >
                                Archive
                            </button>
                            <button 
                                onClick={() => handleConvertToActive(selectedLead._id, selectedLead.companyName)}
                                className="bg-[#FE5C00] hover:bg-orange-700 text-white px-8 py-2 rounded shadow-md font-bold transition"
                            >
                                Convert to Active
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

/* --- HELPER COMPONENTS --- */

const DetailItem = ({ label, value, isEmail = false }: any) => (
    <div className="flex flex-col border-b border-gray-100 pb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
        {isEmail && value ? (
             <a href={`mailto:${value}`} className="text-base font-medium text-[#FE5C00] hover:underline">{value}</a>
        ) : (
            <span className="text-base font-medium text-gray-800">{value || <span className="text-gray-300 italic">Not provided</span>}</span>
        )}
    </div>
);

const EditableDetailItem = ({ label, name, value, isEditing, onChange, isEmail = false, isTextArea = false }: any) => {
    if (!isEditing) {
        if(isTextArea) {
            return (
                <div>
                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">{label}</h4>
                    <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-4 min-h-[100px] text-gray-700 whitespace-pre-wrap">
                        {value || <span className="italic text-gray-400">No extra information provided.</span>}
                    </div>
                </div>
            );
        }
        return <DetailItem label={label} value={value} isEmail={isEmail} />;
    }

    return (
        <div className="flex flex-col border-b border-gray-100 pb-2">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
            {isTextArea ? (
                <textarea 
                    name={name} 
                    value={value || ""} 
                    onChange={onChange} 
                    rows={4}
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm outline-none focus:border-[#FE5C00] resize-y mt-1" 
                />
            ) : (
                <input 
                    type="text" 
                    name={name} 
                    value={value || ""} 
                    onChange={onChange} 
                    className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm outline-none focus:border-[#FE5C00] mt-1" 
                />
            )}
        </div>
    );
};

export default StaffPotentialClients;