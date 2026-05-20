import { useNavigate } from "react-router-dom";

// 🚨 IMPORT THE IMAGES DIRECTLY FROM YOUR ASSETS FOLDER
// (Make sure the extensions match your actual files: .jpg, .jpeg, or .png)
import itacImage from '../assets/images/itac-guidelines.png';
import reacImage from '../assets/images/reac-guidelines.png';

const Resources = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-gray-50 font-sans flex flex-col">
      
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3 shadow-sm sticky top-0 z-10">
        <button 
            onClick={() => navigate(-1)} // Goes back to whatever dashboard they came from
            className="text-gray-500 hover:text-[#FE5C00] transition flex items-center gap-2"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            <span className="font-bold text-sm hidden sm:block">Back</span>
        </button>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-bold text-black">Program Resources</span>
      </div>

      {/* 2. MAIN CONTENT CONTAINER */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-12">
        
        {/* PAGE TITLE */}
        <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-black mb-3">
                Program Qualifications & Details
            </h1>
            <div className="h-1.5 bg-[#FE5C00] w-24 mx-auto rounded-full" />
            <p className="mt-4 text-gray-600 font-medium max-w-2xl mx-auto">
                Review the specific eligibility criteria and offerings for our Department of Energy (ITAC){/* and Department of Agriculture (REAC) programs. */} 
            </p>
        </div>

        {/* IMAGE GALLERY */}
        <div className="space-y-12">
            
            {/* ITAC Image Card */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-transform duration-300 hover:shadow-lg">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">ITAC Assessment Guidelines</h2>
                </div>
                <div className="p-4 bg-gray-50 flex justify-center">
                    {/* 🚨 USE THE IMPORTED VARIABLE HERE */}
                    <img 
                        src={itacImage} 
                        alt="ITAC Qualification Criteria" 
                        className="w-full max-w-4xl h-auto rounded-lg shadow-sm border border-gray-200"
                    />
                </div>
            </div>

            {/* REAC Image Card 
           <div className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden transition-transform duration-300 hover:shadow-lg">
                <div className="bg-gray-100 px-6 py-4 border-b border-gray-200">
                    <h2 className="font-bold text-gray-800 text-lg">REAC Assessment Guidelines</h2>
                </div>
                <div className="p-4 bg-gray-50 flex justify-center">
                    
                    <img 
                        src={reacImage} 
                        alt="REAC Qualification Criteria" 
                        className="w-full max-w-4xl h-auto rounded-lg shadow-sm border border-gray-200"
                    />
                </div>
            </div>*/}

        </div>

      </div>
    </div>
  );
};

export default Resources;