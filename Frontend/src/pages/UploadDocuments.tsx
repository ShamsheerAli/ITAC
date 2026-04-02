import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const UploadDocuments = () => {
  const navigate = useNavigate();
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  
  const [profile, setProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const res = await api.get(`/profile/${userId}`);
      setProfile(res.data);
    } catch (err) {
      console.error("Failed to fetch profile documents", err);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      const userId = user._id || user.id;
      setCurrentUserId(userId);
      fetchProfile(userId);
    } else {
      navigate('/login');
    }
  }, [navigate, fetchProfile]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', currentUserId);
    formData.append('docName', docName);

    setUploadingDoc(docName);
    try {
      await api.post('/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchProfile(currentUserId); 
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${docName}. Please try again.`);
    } finally {
      setUploadingDoc(null);
      e.target.value = ''; 
    }
  };

  const handleDeleteDocument = async (path: string, docName: string) => {
    if (!currentUserId) return;
    
    if(!window.confirm(`Are you sure you want to remove this file from ${docName}?`)) return;

    try {
      await api.put(`/profile/${currentUserId}/remove-document`, { path });
      fetchProfile(currentUserId);
    } catch (err) {
      console.error(err);
      alert("Failed to remove document. Please try again.");
    }
  };

  const allDocuments = profile?.documents || [];

  return (
    <div className="w-full h-full font-sans">
      <div className="w-full bg-white rounded-xl px-12 py-10 shadow-sm border border-gray-100 relative">

        {/* DOWNLOAD SECTION */}
        <SectionTitle title="Download documents" />
        <div className="border border-black p-8 text-center text-xl font-medium mb-12 text-gray-800 leading-relaxed bg-gray-50">
          Please download the documents. Go through the documents and fill the
          data. <br /> Upload the documents in the below section!
        </div>
        <div className="space-y-8 mb-16">
          <DownloadRow label="Confidentiality Statement" fileName="confidentiality_statement.pdf" />
          <DownloadRow label="Media Release form" fileName="media_release.pdf" />
          <DownloadRow label="Energy Assessment Application" fileName="energy_application.pdf" />
        </div>

        {/* ======================= */}
        {/* UPLOAD SECTION      */}
        {/* ======================= */}
        
        {/* SAVE BUTTON - TUCKED NEATLY ABOVE THE SECTION ON THE RIGHT */}
        <div className="flex justify-end mb-4">
            <button 
              onClick={() => navigate('/dashboard')} 
              className="bg-[#FE5C00] text-white px-8 py-3 rounded shadow-md hover:bg-orange-700 transition font-bold text-lg flex items-center justify-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Save & Return
            </button>
        </div>

        {/* RESTORED CENTERED HEADER */}
        <SectionTitle title="Upload documents" />


        {/* UPLOAD ROWS */}
        <div className="space-y-8 pb-10">
          <UploadRow 
            label="Most Recent Utility Bills" 
            docName="Utility Bills" 
            uploadingDoc={uploadingDoc} 
            allDocuments={allDocuments}
            handleFileUpload={handleFileUpload} 
            handleDeleteDocument={handleDeleteDocument}
          />
          <UploadRow 
            label="Confidentiality Statement" 
            docName="Confidentiality Statement" 
            uploadingDoc={uploadingDoc} 
            allDocuments={allDocuments}
            handleFileUpload={handleFileUpload} 
            handleDeleteDocument={handleDeleteDocument}
          />
          <UploadRow 
            label="Media Release form" 
            docName="Media Release Form" 
            uploadingDoc={uploadingDoc} 
            allDocuments={allDocuments}
            handleFileUpload={handleFileUpload} 
            handleDeleteDocument={handleDeleteDocument}
          />
          <UploadRow 
            label="Energy Assessment Application" 
            docName="Energy Assessment Application" 
            uploadingDoc={uploadingDoc} 
            allDocuments={allDocuments}
            handleFileUpload={handleFileUpload} 
            handleDeleteDocument={handleDeleteDocument}
          />
          <UploadRow 
            label="Other Documents" 
            docName="Other Documents" 
            uploadingDoc={uploadingDoc} 
            allDocuments={allDocuments}
            handleFileUpload={handleFileUpload} 
            handleDeleteDocument={handleDeleteDocument}
          />
        </div>

      </div>
    </div>
  );
};

export default UploadDocuments;

/* ===========================
   REUSABLE COMPONENTS
=========================== */

const SectionTitle = ({ title }: { title: string }) => (
  <div className="mb-10">
    <h2 className="text-3xl font-bold text-center text-black">{title}</h2>
    <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
  </div>
);

const DownloadRow = ({ label, fileName }: { label: string; fileName: string }) => (
  <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-16">
    <span className="w-full md:w-96 text-center md:text-right text-xl font-bold text-gray-700">{label}:</span>
    <div className="w-full md:w-56 flex justify-center md:justify-start">
        <a 
          href={`/docs/${fileName}`} 
          download
          className="bg-[#4a5568] text-white w-56 py-3 rounded shadow hover:bg-gray-700 transition text-lg font-semibold block text-center"
        >
          Download
        </a>
    </div>
  </div>
);

const UploadRow = ({ label, docName, uploadingDoc, allDocuments, handleFileUpload, handleDeleteDocument }: any) => {
  const isUploading = uploadingDoc === docName;
  
  const uploadedFilesForThisRow = allDocuments.filter((doc: any) => doc.name === docName);

  return (
    <div className="flex flex-col md:flex-row items-start justify-center gap-4 md:gap-16">
      <span className="w-full md:w-96 text-center md:text-right text-xl font-bold text-gray-700 mt-3">{label}:</span>

      <div className="w-full md:w-56 flex flex-col gap-3 items-center md:items-start">
          {uploadedFilesForThisRow.map((file: any, index: number) => (
             <div key={index} className="w-56 flex items-center justify-between bg-green-50 border-2 border-green-500 py-2.5 px-4 rounded shadow-sm text-green-700">
                 <span className="font-bold text-sm flex items-center gap-2 truncate">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                     File {index + 1}
                 </span>
                 <button 
                    onClick={() => handleDeleteDocument(file.path, docName)}
                    className="text-red-400 hover:text-red-600 bg-white rounded-full p-0.5 shadow-sm hover:shadow transition flex-shrink-0 ml-2"
                    title="Remove Document"
                 >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                 </button>
             </div>
          ))}

          <label 
            className={`w-56 py-3 rounded shadow transition text-lg font-semibold block text-center cursor-pointer text-white
              ${isUploading ? 'bg-orange-500 cursor-wait' : 'bg-[#4a5568] hover:bg-gray-700'}`}
          >
            {isUploading ? 'Uploading...' : (uploadedFilesForThisRow.length > 0 ? 'Upload Another' : 'Upload')}
            <input 
              type="file" 
              className="hidden" 
              onChange={(e) => handleFileUpload(e, docName)}
              disabled={isUploading}
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
            />
          </label>
      </div>
    </div>
  );
};