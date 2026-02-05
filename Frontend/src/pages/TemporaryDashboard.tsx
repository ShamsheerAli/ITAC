import { Link } from "react-router-dom";

const TemporaryDashboard = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] bg-gray-50 p-8 flex justify-center">
      
      {/* MAIN CONTAINER */}
      <div className="w-full max-w-[1600px] space-y-8">
        
        {/* TOP SECTION: GRID OF 2 CARDS */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* LEFT CARD: My Information */}
          <div className="bg-gray-200 rounded-lg overflow-hidden shadow-sm flex flex-col h-full min-h-[400px]">
            {/* Header - Gray background */}
            <div className="bg-gray-500 text-white text-center py-4 font-bold text-3xl tracking-wide">
              My Information
            </div>
            
            {/* Content */}
            <div className="p-8 flex flex-col sm:flex-row items-center justify-center gap-8 flex-grow">
              {/* Profile Image */}
              <div className="flex-shrink-0">
                 <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" 
                  alt="Profile" 
                  className="w-36 h-36 rounded-full object-cover border-4 border-white shadow-md"
                />
              </div>

              {/* Details */}
              <div className="text-center w-full space-y-2 text-xl text-gray-800 font-medium leading-relaxed">
                <p><span className="font-bold text-black">Name:</span> Steven Simpson</p>
                <p><span className="font-bold text-black">Company:</span> ITW Paslode Power Nailing</p>
                <p>
                  <span className="font-bold text-black">Email:</span>{" "}
                  <a href="mailto:ssimpso@paslode.com" className="underline hover:text-[#FE5C00]">
                    ssimpso@paslode.com
                  </a>
                </p>
                <p><span className="font-bold text-black">Phone:</span> +1 224-532-8454</p>
                
                {/* --- UPDATED ADDRESS SECTION --- */}
                <p><span className="font-bold text-black">Street Address:</span> 1600 Patrick Dr</p>
                <p><span className="font-bold text-black">City:</span> Pocahontas</p>
                <p>
                  <span className="font-bold text-black">State:</span> AR
                  <span className="mx-3 text-gray-400">|</span> 
                  <span className="font-bold text-black">Zip Code:</span> 72455
                </p>
                {/* ------------------------------- */}
                
                <div className="pt-6 flex justify-center">
                  <Link to="/update-details">
                      <button className="bg-[#FE5C00] text-white px-10 py-2 rounded shadow hover:bg-orange-700 transition font-bold uppercase text-xl tracking-wider">
                      UPDATE
                      </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT CARD: Action Center */}
          <div className="bg-white p-2 flex flex-col justify-between h-full min-h-[400px]">
             <div className="mb-6">
              <h2 className="text-3xl font-bold text-center text-black">Action Center</h2>
              <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
            </div>

            {/* Main Text Area */}
            <div className="flex-grow flex items-center justify-center px-6">
              <div className="text-black text-2xl leading-10 text-center font-medium">
                Go through our services by clicking below “services”
                button, and Update your details by clicking on “Update
                Information” button. One of our team members will
                reach you out.
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-wrap gap-8 mt-8 justify-center px-12 mb-6">
              {/* Resources Button */}
              <button className="flex-1 max-w-[250px] bg-[#FE5C00] text-white px-6 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-xl text-center">
                Resources
              </button>
              
              {/* Update Information Button */}
              <Link to="/update-details" className="flex-1 max-w-[250px]">
                  <button className="w-full h-full bg-[#FE5C00] text-white px-6 py-4 rounded shadow hover:bg-orange-700 transition font-bold text-xl text-center leading-tight">
                  Update Information
                  </button>
              </Link>
            </div>
          </div>

        </div>

        {/* BOTTOM SECTION: Tracking System */}
        <div className="bg-white pt-8 w-full">
          <div className="mb-10">
              <h2 className="text-3xl font-bold text-center text-black">Tracking system</h2>
              <div className="h-1.5 bg-[#FE5C00] w-full mt-4" />
          </div>

          {/* PROGRESS BAR */}
          <div className="bg-gray-50 rounded-xl p-14 border border-gray-100 flex flex-col lg:flex-row items-center justify-center gap-10 w-full">
              
              {/* Step 1: Update Information */}
              <StepItem 
                icon={<IconDocumentEdit />} 
                label="Update Information" 
              />

              {/* Arrow */}
              <ArrowDivider />

              {/* Step 2: Details Review */}
              <StepItem 
                icon={<IconDocumentSearch />} 
                label="Details Review" 
              />

              {/* Arrow */}
              <ArrowDivider />

              {/* Step 3: Ready for next steps */}
              <StepItem 
                icon={<IconCheckCircle />} 
                label="Ready for next steps" 
              />

          </div>
        </div>

      </div>
    </div>
  );
};

/* --- SUB-COMPONENTS --- */

const StepItem = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
  <div className="flex flex-col items-center z-10 text-center w-64">
    <div className="w-28 h-28 rounded-full bg-slate-600 flex items-center justify-center text-white mb-6 shadow-lg transform hover:scale-105 transition duration-300">
      {icon}
    </div>
    <span className="text-black font-bold text-xl">{label}</span>
  </div>
);

const ArrowDivider = () => (
  <div className="hidden lg:block flex-1 h-1.5 bg-black mx-4 -mt-14 rounded-full" /> 
);

/* --- ICONS (SVG) --- */

const IconDocumentEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconDocumentSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const IconCheckCircle = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-14 h-14">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default TemporaryDashboard;