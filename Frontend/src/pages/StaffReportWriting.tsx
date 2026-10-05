import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/axios";

const StaffReportWriting = () => {
    const { clientId } = useParams();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get(`/profile/details/${clientId}`);
                setProfile(res.data);
            } catch (err) {
                console.error("Failed to fetch client details", err);
            } finally {
                setLoading(false);
            }
        };
        if (clientId) fetchProfile();
    }, [clientId]);

    const getDownloadUrl = (path: string) => {
        if (!path) return '';
        let cleanPath = path.replace(/\\/g, '/');
        if (cleanPath.startsWith('/')) cleanPath = cleanPath.substring(1);
        // Using relative path so Axios handles the base URL automatically
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
            setProfile(res.data.profile); // Update the UI with the new files
            setSelectedFiles(null);
            
            // Reset the file input visually
            const fileInput = document.getElementById('file-upload') as HTMLInputElement;
            if (fileInput) fileInput.value = '';
        } catch (err) {
            console.error("Upload failed", err);
            alert("Failed to upload files. Please try again.");
        } finally {
            setIsUploading(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading Report Dashboard...</div>;
    if (!profile) return <div className="p-10 text-center text-red-500">Client not found.</div>;

    const uploadedDocs = profile.documents || [];
    const auditFiles = profile.auditFiles || []; // New array we will add to the backend schema

    return (
        <div className="w-full min-h-screen bg-gray-50 flex flex-col relative">
            
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
                <span className="text-sm font-bold text-black">Report Writing</span>
            </div>

            <div className="flex-1 max-w-7xl w-full mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* LEFT COLUMN: Client Details & Date */}
                <div className="lg:col-span-1 space-y-6">
                    
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h1 className="text-2xl font-bold text-[#FE5C00] mb-1">{profile.companyName}</h1>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-pink-800 uppercase tracking-wide">
                            {profile.status}
                        </span>
                    </div>

                    {/* Audit Date Card */}
                    <div className="bg-orange-50 border border-orange-200 rounded-xl shadow-sm p-6 text-center">
                        <h3 className="text-sm font-bold text-orange-800 uppercase tracking-wider mb-2">Confirmed Audit Date</h3>
                        <div className="text-2xl font-black text-black">
                            {profile.confirmedAuditDate ? profile.confirmedAuditDate.replace('Client Proposed: ', '').replace('Staff Proposed: ', '') : 'Date Not Found'}
                        </div>
                    </div>

                    {/* Client Info Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="font-bold text-gray-800 text-lg border-b border-gray-100 pb-3 mb-4">Client Details</h3>
                        <div className="space-y-4">
                            <DetailItem label="Contact Name" value={profile.contactName} />
                            <DetailItem label="Email" value={profile.contactEmail} isEmail />
                            <DetailItem label="Phone" value={profile.contactPhone} />
                            <DetailItem label="Address" value={`${profile.streetAddress || ''} ${profile.city || ''}, ${profile.state || ''} ${profile.zipCode || ''}`} />
                            <DetailItem label="Facility Size" value={profile.facilitySize ? `${profile.facilitySize} sq ft` : null} />
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Documents & Uploads */}
                <div className="lg:col-span-2 space-y-6">
                    
                    {/* Upload Field Notes Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                            <h2 className="font-bold text-gray-800 text-lg">Upload Field Notes & Images</h2>
                            <p className="text-xs text-gray-500 mt-1">Upload photos, calculations, and notes taken during the physical audit.</p>
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
                                    {isUploading ? 'Uploading...' : 'Upload Files'}
                                </button>
                            </form>

                            {/* Show uploaded staff files */}
                            {auditFiles.length > 0 && (
                                <div className="mt-6 space-y-3">
                                    <h4 className="text-sm font-bold text-gray-700 mb-3">Saved Field Documents:</h4>
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
                            <h2 className="font-bold text-gray-800 text-lg">Client Submitted Documents</h2>
                        </div>
                        <div className="p-6 space-y-3">
                            {uploadedDocs.length === 0 ? (
                                <p className="text-gray-400 italic text-center py-4">No documents submitted by client.</p>
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

// Secure Downloader Component (Reused)
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