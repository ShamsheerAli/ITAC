import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const StaffReportWriting = () => {
    const { clientId } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]); // New state for student dropdown
    const [selectedLead, setSelectedLead] = useState("");
    const [loading, setLoading] = useState(true);
    
    // File upload states
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch the client facility details
                const profileRes = await api.get(`/profile/details/${clientId}`);
                setProfile(profileRes.data);
                
                // Fetch all users to populate the student dropdown
                // (Make sure you have an endpoint for this!)
                const usersRes = await api.get('/auth/users');
                const studentUsers = usersRes.data.filter((u: any) => u.role === 'student');
                setStudents(studentUsers);
                
                if (profileRes.data.assignedLeadStudent) {
                    setSelectedLead(profileRes.data.assignedLeadStudent);
                }
            } catch (err) {
                console.error("Failed to fetch data", err);
            } finally {
                setLoading(false);
            }
        };
        if (clientId) fetchData();
    }, [clientId]);

    const getDownloadUrl = (path: string) => {
        if (!path) return '';
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        return cleanPath; 
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFiles(e.target.files);
        }
    };

    const handleUploadFiles = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFiles) return alert("Please select files to upload.");

        setIsUploading(true);
        const formData = new FormData();
        Array.from(selectedFiles).forEach(file => {
            formData.append('auditFiles', file);
        });

        try {
            const res = await api.post(`/profile/audit-files/${clientId}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert("Audit files uploaded successfully!");
            setProfile(res.data.profile);
            setSelectedFiles(null);
            
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload files. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    const handleAssignLead = async () => {
        if (!selectedLead) return alert("Please select a Lead Student first.");
        
        setAssigning(true);
        try {
            await api.put(`/profile/${clientId}`, {
                assignedLeadStudent: selectedLead,
                reportProgressStatus: 'Assigned to Lead'
            });
            alert("Lead Student assigned successfully!");
            // Update local UI immediately
            setProfile({ ...profile, assignedLeadStudent: selectedLead, reportProgressStatus: 'Assigned to Lead' });
        } catch (err) {
            console.error("Error assigning lead", err);
            alert("Failed to assign lead student. Make sure schema fields exist in database.");
        } finally {
            setAssigning(false);
        }
    };

    if (loading) return <div className="p-10 text-center font-bold text-gray-500">Loading Report Dashboard...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Client not found.</div>;

    const uploadedDocs = profile.documents || [];
    const auditFiles = profile.auditFiles || []; 

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col relative font-sans">
            
            {/* 1. BREADCRUMBS */}
            <div className="bg-white border-b border-gray-200 px-8 py-4 mb-8 flex items-center gap-3 shadow-sm">
                <Link to="/staff-kanban" className="text-gray-500 hover:text-[#FE5C00] transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>
                <span className="text-gray-300">|</span>
                <span className="text-sm font-medium text-gray-500">Staff Dashboard</span>
                <span className="text-gray-300">/</span>
                <span className="text-sm font-bold text-black">Report Delegation</span>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Client Details & Team Assignment */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h1 className="text-2xl font-bold text-[#FE5C00] mb-1">{profile.companyName}</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 uppercase tracking-wide">
                            {profile.status}
                        </span>
                    </div>

                    {/* NEW: Lead Assignment Panel */}
                    <div className="bg-white rounded-xl shadow-sm border border-[#FE5C00] overflow-hidden">
                        <div className="bg-[#FE5C00] text-white px-6 py-4 border-b border-orange-600 font-bold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            Delegate Report to Team
                        </div>
                        <div className="p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm font-bold text-gray-600">Report Status:</span>
                                <span className="text-xs bg-orange-100 text-[#FE5C00] font-bold px-3 py-1 rounded-full uppercase">
                                    {profile.reportProgressStatus || 'Pending Assignment'}
                                </span>
                            </div>
                            
                            <label className="block text-sm font-bold text-gray-700 mb-2">Select Lead Student:</label>
                            <select 
                                value={selectedLead}
                                onChange={(e) => setSelectedLead(e.target.value)}
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-[#FE5C00] outline-none mb-4 bg-white"
                            >
                                <option value="">-- Choose a student --</option>
                                {students.map(student => (
                                    <option key={student._id} value={student._id}>
                                        {student.name} ({student.email})
                                    </option>
                                ))}
                            </select>

                            <button 
                                onClick={handleAssignLead}
                                disabled={assigning || !selectedLead}
                                className={`w-full font-bold text-white py-3 rounded-lg transition shadow-sm
                                    ${assigning ? 'bg-orange-300' : 'bg-[#FE5C00] hover:bg-orange-700'}`}
                            >
                                {assigning ? 'Assigning...' : 'Assign Lead & Notify'}
                            </button>

                            {/* Show currently assigned team members */}
                            {profile.assignedLeadStudent && (
                                <div className="mt-6 pt-4 border-t border-gray-100">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Current Team</h4>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-[#FE5C00] font-bold text-xs">L</div>
                                            <span className="text-sm font-bold text-gray-800">
                                                {students.find(s => s._id === profile.assignedLeadStudent)?.name || 'Unknown'}
                                            </span>
                                        </div>
                                        {profile.assignedTeam?.map((id: string) => (
                                            <div key={id} className="flex items-center gap-3 pl-4">
                                                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-[10px]">S</div>
                                                <span className="text-sm text-gray-600">
                                                    {students.find(s => s._id === id)?.name || 'Unknown'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Client Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-3 mb-4">Facility Details</h3>
                        <div className="space-y-4">
                            <DetailItem label="Contact Name" value={profile.contactName} />
                            <DetailItem label="Email" value={profile.contactEmail} isEmail />
                            <DetailItem label="Phone" value={profile.contactPhone} />
                            <DetailItem label="Address" value={`${profile.streetAddress || ''} ${profile.city || ''}, ${profile.state || ''} ${profile.zipCode || ''}`} />
                            <DetailItem label="Building Size" value={profile.buildingSize ? `${profile.buildingSize} sq ft` : null} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Documents & Uploads */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Upload Field Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-gray-800 text-lg">Staff Field Notes & Images</h2>
                                <p className="text-xs text-gray-500 mt-1">Upload audit photos and base calculations for the student team to use.</p>
                            </div>
                        </div>
                        <div className="p-6">
                            <form onSubmit={handleUploadFiles} className="flex flex-col sm:flex-row items-center gap-4">
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    multiple 
                                    onChange={handleFileChange}
                                    className="flex-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-[#FE5C00] hover:file:bg-orange-100 transition cursor-pointer border border-gray-300 rounded-md p-2"
                                />
                                <button 
                                    type="submit" 
                                    disabled={isUploading || !selectedFiles}
                                    className={`px-6 py-3 rounded-md font-bold text-white transition shadow-sm whitespace-nowrap
                                        ${isUploading || !selectedFiles ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#FE5C00] hover:bg-orange-700'}`}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload Notes'}
                                </button>
                            </form>

                            {/* Show uploaded staff files */}
                            {auditFiles.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3 border-b pb-2">Available Field Documents:</h4>
                                    {auditFiles.map((doc: any, i: number) => (
                                        <DocumentRow key={`audit-${i}`} doc={doc} downloadUrl={getDownloadUrl(doc.path)} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Client Submitted Documents */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-bold text-gray-800 text-lg">Client Submitted Utility Documents</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {uploadedDocs.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4">No utility documents found.</p>
                            ) : (
                                uploadedDocs.map((doc: any, i: number) => (
                                    <DocumentRow key={`client-${i}`} doc={doc} downloadUrl={getDownloadUrl(doc.path)} />
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

/* --- HELPER COMPONENTS --- */
const DetailItem = ({ label, value, isEmail = false }: any) => (
    <div className="flex flex-col">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{label}</span>
        {isEmail && value ? (
             <a href={`mailto:${value}`} className="text-sm font-medium text-[#FE5C00] hover:underline">{value}</a>
        ) : (
            <span className="text-sm font-medium text-gray-800">{value || <span className="text-gray-300 italic">N/A</span>}</span>
        )}
    </div>
);

// Secure Downloader Component
const DocumentRow = ({ doc, downloadUrl }: { doc: any, downloadUrl: string }) => {
    const [isDownloading, setIsDownloading] = useState(false);

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        setIsDownloading(true);
        try {
            const response = await api.get(downloadUrl, { responseType: 'blob' });
            if (response.data.type && response.data.type.includes('text/html')) {
                throw new Error("Received HTML. File missing.");
            }
            const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.setAttribute('download', doc.originalName || doc.name || 'document.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Could not download the file. Ensure it exists on the server.");
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition border border-gray-100">
            <div className="flex flex-col overflow-hidden max-w-[60%]">
                <span className="text-gray-800 font-bold text-sm truncate">{doc.originalName || doc.name}</span>
                <span className="text-xs text-gray-400">Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
            </div>
            <button 
                onClick={handleDownload}
                disabled={isDownloading}
                className="bg-gray-700 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded transition shadow-sm"
            >
                {isDownloading ? 'Downloading...' : 'Download'}
            </button>
        </div>
    );
};

export default StaffReportWriting;