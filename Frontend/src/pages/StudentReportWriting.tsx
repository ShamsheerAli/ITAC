import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const StudentReportWriting = () => {
    const { clientId } = useParams();
    const [facility, setFacility] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    
    // Team Building States
    const [selectedPeer, setSelectedPeer] = useState("");
    const [updating, setUpdating] = useState(false);
    
    // Current User
    const [currentUserId, setCurrentUserId] = useState("");

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setCurrentUserId(storedUser.id || storedUser._id);

        const fetchData = async () => {
            try {
                const facRes = await api.get(`/profile/details/${clientId}`);
                setFacility(facRes.data);
                
                const usersRes = await api.get('/auth/users');
                const studentUsers = usersRes.data.filter((u: any) => u.role === 'student');
                setStudents(studentUsers);
            } catch (err) {
                console.error("Error fetching data", err);
            }
        };
        
        if (clientId) fetchData();
    }, [clientId]);

    const handleAddTeammate = async () => {
        if (!selectedPeer) return alert("Please select a student to add.");
        
        // Prevent adding someone already on the team or the lead themselves
        if (facility.assignedTeam?.includes(selectedPeer) || facility.assignedLeadStudent === selectedPeer) {
            return alert("This student is already on the team.");
        }

        setUpdating(true);
        try {
            const newTeam = [...(facility.assignedTeam || []), selectedPeer];
            await api.put(`/profile/${clientId}`, {
                assignedTeam: newTeam
            });
            
            setFacility({ ...facility, assignedTeam: newTeam });
            setSelectedPeer("");
            alert("Teammate added successfully!");
        } catch (err) {
            console.error("Error adding teammate", err);
            alert("Failed to add teammate.");
        } finally {
            setUpdating(false);
        }
    };

    const handleUpdateStatus = async (newStatus: string) => {
        setUpdating(true);
        try {
            await api.put(`/profile/${clientId}`, {
                reportProgressStatus: newStatus
            });
            setFacility({ ...facility, reportProgressStatus: newStatus });
        } catch (err) {
            console.error("Error updating status", err);
            alert("Failed to update report status.");
        } finally {
            setUpdating(false);
        }
    };

    const getDownloadUrl = (path: string) => {
        if (!path) return '';
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        return cleanPath; 
    };

    if (!facility) return <div className="p-10 text-center font-bold text-gray-500">Loading Workspace...</div>;

    const isLead = facility.assignedLeadStudent === currentUserId;
    const auditFiles = facility.auditFiles || [];

    return (
        <div className="w-full min-h-screen bg-gray-50 font-sans p-6 pb-12">
            
            <div className="mb-8 flex items-center gap-2 text-sm">
                <Link to="/student-kanban" className="text-gray-500 hover:text-[#FE5C00] transition">Assessments</Link>
                <span className="text-gray-400">/</span>
                <span className="font-bold text-gray-800">Report Workspace</span>
            </div>

            <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Overview & Files */}
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-black text-gray-900 mb-2">{facility.companyName}</h1>
                            <p className="text-gray-500 font-medium">{facility.city}, {facility.state}</p>
                        </div>
                        <span className="bg-orange-100 text-[#FE5C00] font-bold px-4 py-1.5 rounded-full text-sm uppercase">
                            {facility.reportProgressStatus || 'Pending Assignment'}
                        </span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-bold text-gray-800 text-lg">Staff Field Notes & Data</h2>
                            <p className="text-xs text-gray-500 mt-1">Download the raw audit data and images provided by the staff engineers.</p>
                        </div>
                        <div className="p-6">
                            {auditFiles.length === 0 ? (
                                <p className="text-gray-400 italic text-sm">No field notes have been uploaded by the staff yet.</p>
                            ) : (
                                <div className="space-y-3">
                                    {auditFiles.map((doc: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                            <span className="text-gray-800 font-bold text-sm truncate max-w-[70%]">{doc.originalName || doc.name}</span>
                                            <a 
                                                href={`${api.defaults.baseURL}/${getDownloadUrl(doc.path)}`}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className="bg-gray-700 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded transition shadow-sm"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Team & Management (Only active if Lead) */}
                <div className="lg:col-span-1 space-y-6">
                    
                    <div className={`bg-white rounded-xl shadow-sm border overflow-hidden ${isLead ? 'border-[#FE5C00]' : 'border-gray-200'}`}>
                        <div className={`${isLead ? 'bg-[#FE5C00] text-white' : 'bg-gray-800 text-white'} px-6 py-4 border-b font-bold flex items-center justify-between`}>
                            <span>Report Team</span>
                            {isLead && <span className="text-xs bg-white text-[#FE5C00] px-2 py-1 rounded-full uppercase tracking-wide">You are Lead</span>}
                        </div>
                        
                        <div className="p-6 space-y-6">
                            {/* Current Team List */}
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Assigned Members</h4>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FE5C00] font-bold text-xs">L</div>
                                        <span className="text-sm font-bold text-gray-800">
                                            {students.find(s => s._id === facility.assignedLeadStudent)?.name || 'Pending Lead Assignment'}
                                        </span>
                                    </div>
                                    {facility.assignedTeam?.map((id: string) => (
                                        <div key={id} className="flex items-center gap-3 pl-4">
                                            <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-[10px]">S</div>
                                            <span className="text-sm text-gray-600">
                                                {students.find(s => s._id === id)?.name || 'Unknown'}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Lead Controls: Add Teammate */}
                            {isLead && (
                                <div className="pt-4 border-t border-gray-100">
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Recruit Fellow Student:</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={selectedPeer}
                                            onChange={(e) => setSelectedPeer(e.target.value)}
                                            className="flex-1 border border-gray-300 p-2 text-sm rounded focus:ring-2 focus:ring-[#FE5C00] outline-none bg-white"
                                        >
                                            <option value="">-- Choose peer --</option>
                                            {students.map(student => (
                                                <option key={student._id} value={student._id}>
                                                    {student.name}
                                                </option>
                                            ))}
                                        </select>
                                        <button 
                                            onClick={handleAddTeammate}
                                            disabled={updating || !selectedPeer}
                                            className="bg-gray-800 hover:bg-black text-white font-bold px-4 py-2 rounded transition disabled:opacity-50"
                                        >
                                            Add
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Status Management */}
                    {isLead && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-gray-800 mb-4">Update Progress</h3>
                            <div className="space-y-2">
                                {['Writing in Progress', 'Lead Review', 'Submitted to Staff'].map(status => (
                                    <button 
                                        key={status}
                                        onClick={() => handleUpdateStatus(status)}
                                        disabled={facility.reportProgressStatus === status || updating}
                                        className={`w-full py-2.5 px-4 rounded text-sm font-bold text-left transition border
                                            ${facility.reportProgressStatus === status 
                                                ? 'bg-orange-50 border-[#FE5C00] text-[#FE5C00]' 
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        {facility.reportProgressStatus === status ? `✓ ${status}` : `Move to: ${status}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default StudentReportWriting;