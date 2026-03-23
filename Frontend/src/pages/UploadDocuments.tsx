import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // 1. Add this import
import api from '../api/axios'; // Make sure this path is correct for your project

const UploadDocuments = () => {
  const navigate = useNavigate(); // 2. Initialize the navigate function
  // State to track which document is currently uploading
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // --- UPLOAD FUNCTION ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const storedUser = localStorage.getItem('user');
    if (!storedUser) return alert("Please log in first.");
    const user = JSON.parse(storedUser);
    const userId = user.id || user._id;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('docName', docName);

    setUploadingDoc(docName);
    try {
      await api.post('/profile/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(`${docName} uploaded successfully!`);
    } catch (err) {
      console.error(err);
      alert(`Failed to upload ${docName}. Please try again.`);
    } finally {
      setUploadingDoc(null);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="w-full h-full">

      {/* MAIN CARD */}
      <div className="w-full bg-white rounded-xl px-12 py-10 shadow-sm border border-gray-100">

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

        {/* UPLOAD SECTION */}
        <SectionTitle title="Upload documents" />

        <div className="space-y-8">
          <UploadRow 
            label="Most Recent Utility Bills" 
            docName="Utility Bills" 
            uploadingDoc={uploadingDoc} 
            handleFileUpload={handleFileUpload} 
          />
          <UploadRow 
            label="Confidentiality Statement" 
            docName="Confidentiality Statement" 
            uploadingDoc={uploadingDoc} 
            handleFileUpload={handleFileUpload} 
          />
          <UploadRow 
            label="Media Release form" 
            docName="Media Release Form" 
            uploadingDoc={uploadingDoc} 
            handleFileUpload={handleFileUpload} 
          />
          <UploadRow 
            label="Energy Assessment Application" 
            docName="Energy Assessment Application" 
            uploadingDoc={uploadingDoc} 
            handleFileUpload={handleFileUpload} 
          />
          <UploadRow 
            label="Other Documents" 
            docName="Other Documents" 
            uploadingDoc={uploadingDoc} 
            handleFileUpload={handleFileUpload} 
          />
        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end mt-16">
          <button 
            onClick={() => {
                alert("All documents saved!");
                navigate('/dashboard'); // 3. Add the redirect here!
            }} 
            className="bg-[#FE5C00] text-white px-12 py-3 rounded shadow hover:bg-orange-700 transition font-bold text-xl"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadDocuments;

/* ===========================
   REUSABLE COMPONENTS
=========================== */

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="mb-10">
      <h2 className="text-3xl font-bold text-center text-black">{title}</h2>
      <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
    </div>
  );
};

// --- DOWNLOAD ROW ---
const DownloadRow = ({ label, fileName }: { label: string; fileName: string }) => {
  return (
    <div className="flex items-center justify-center gap-8 xl:gap-16">
      <span className="w-96 text-right text-xl font-bold text-gray-700">{label}:</span>
      
      {/* Changed to an <a> tag with 'download' attribute */}
      <a 
        href={`/docs/${fileName}`} 
        download
        className="bg-[#4a5568] text-white w-40 py-3 rounded shadow hover:bg-gray-700 transition text-lg font-semibold block text-center"
      >
        Download
      </a>
    </div>
  );
};

// --- UPLOAD ROW ---
const UploadRow = ({ label, docName, uploadingDoc, handleFileUpload }: any) => {
  const isUploading = uploadingDoc === docName;

  return (
    <div className="flex items-center justify-center gap-8 xl:gap-16">
      <span className="w-96 text-right text-xl font-bold text-gray-700">{label}:</span>

      {/* Changed to a <label> wrapping a hidden <input> */}
      <label 
        className={`w-40 py-3 rounded shadow transition text-lg font-semibold block text-center cursor-pointer text-white
          ${isUploading ? 'bg-orange-500 cursor-wait' : 'bg-[#4a5568] hover:bg-gray-700'}`}
      >
        {isUploading ? 'Uploading...' : 'Upload'}
        
        <input 
          type="file" 
          className="hidden" 
          onChange={(e) => handleFileUpload(e, docName)}
          disabled={isUploading}
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" 
        />
      </label>
    </div>
  );
};