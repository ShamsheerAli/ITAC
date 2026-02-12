

const StaffAddClient = () => {
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* BREADCRUMB HEADER */}
      

      {/* MAIN FORM CARD */}
      <div className="flex-1 flex justify-center pb-10">
        <div className="w-full max-w-4xl bg-white/50">
            
            {/* TOP HEADER: CLIENT INPUT */}
            <div className="flex items-center justify-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-black">Client:</h1>
                <input 
                    type="text" 
                    className="w-64 border border-black rounded-lg px-2 py-1 outline-none focus:border-[#FE5C00]"
                />
            </div>
            <div className="h-1 bg-[#FE5C00] w-full mb-8" />

            {/* PROFILE IMAGE */}
            <div className="flex justify-center mb-6">
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200 shadow-sm">
                    <img
                        src="https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                        alt="Client Profile"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            {/* COMPANY NAME SECTION */}
            <div className="flex flex-col items-center mb-8">
                <div className="flex items-center gap-4 w-full justify-center mb-2">
                    <label className="text-xl text-black font-serif">Company Name:</label>
                    <input 
                        type="text" 
                        className="w-1/2 border border-black rounded-full px-4 py-1.5 outline-none focus:border-[#FE5C00]"
                    />
                </div>
                {/* Decorative Line (Dumbbell style) */}
                <div className="w-3/4 flex items-center">
                    <div className="w-2 h-2 bg-black rounded-full" />
                    <div className="h-[1px] bg-black flex-1" />
                    <div className="w-2 h-2 bg-black rounded-full" />
                </div>
            </div>

            {/* FORM FIELDS STACK */}
            <div className="flex flex-col items-center w-full max-w-2xl mx-auto space-y-4 font-serif text-lg">
                
                <FormRow label="Contact Name" />
                <FormRow label="Contact Email" />
                <FormRow label="Contact Phone" />

                {/* Address Block */}
                <div className="w-full border-b border-dashed border-gray-400 pb-4 space-y-2">
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-40 text-right text-black">Address:</label>
                        <input type="text" className="w-64 border border-gray-500 rounded-full px-3 py-1 outline-none" />
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-40 text-right text-black">City, State:</label>
                        <div className="w-64 flex gap-2">
                             <input type="text" className="w-2/3 border border-gray-500 rounded-full px-3 py-1 outline-none" />
                             <input type="text" className="w-1/3 border border-gray-500 rounded-full px-3 py-1 outline-none" />
                        </div>
                    </div>
                    <div className="flex items-center justify-center gap-4">
                        <label className="w-40 text-right text-black">Zip code:</label>
                        <input type="text" className="w-32 border border-gray-500 rounded-full px-3 py-1 outline-none mr-32" /> 
                        {/* mr-32 is a hack to align the small input to the left of the input column space */}
                    </div>
                </div>

                <FormRow label="How did we get this client" />
                <FormRow label="Variation type" />
                <FormRow label="Funding Type" />

            </div>

            {/* SAVE BUTTON */}
            <div className="flex justify-end mt-12 pr-10">
                <button className="bg-[#FE5C00] text-white px-10 py-2 rounded shadow hover:bg-orange-700 transition font-bold text-2xl border-2 border-white/20">
                    Save
                </button>
            </div>

        </div>
      </div>

    </div>
  );
};

/* --- REUSABLE ROW COMPONENT --- */
const FormRow = ({ label }: { label: string }) => {
  return (
    <div className="w-full flex items-center justify-center gap-4 border-b border-dashed border-gray-400 pb-4">
      <label className="w-56 text-right text-black whitespace-nowrap">
        {label}:
      </label>
      <input
        type="text"
        className="w-64 border border-gray-500 rounded-full px-3 py-1 outline-none focus:border-[#FE5C00]"
      />
    </div>
  );
};

export default StaffAddClient;