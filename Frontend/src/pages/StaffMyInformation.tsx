import { Link } from "react-router-dom";

const StaffMyInformation = () => {
  return (
    <div className="w-full h-full flex flex-col">
      
      {/* BREADCRUMB HEADER (Matches design) */}
      <div className="bg-black text-white px-8 py-2 mb-8 -mt-8 -mx-8">
        <span className="text-sm font-medium">
            <Link to="/staff-dashboard" className="hover:text-[#FE5C00]">Home</Link> / Update Information
        </span>
      </div>

      {/* MAIN CONTENT CARD */}
      <div className="flex-1 flex justify-center items-start pt-10">
        <div className="w-full max-w-2xl bg-gray-200 rounded-lg overflow-hidden shadow-sm pb-10">
          
          {/* Card Header */}
          <div className="bg-gray-600 text-white text-center py-4 font-bold text-2xl tracking-wide">
            My Information
          </div>

          {/* Profile Section */}
          <div className="flex flex-col items-center mt-8 mb-6">
             <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-black/10">
                <img
                    src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                    alt="Profile"
                    className="w-full h-full object-cover"
                />
             </div>
             <button className="text-black text-sm mt-2 hover:text-[#FE5C00] transition">
                Edit
             </button>
          </div>

          {/* Form Fields */}
          <div className="px-12 space-y-4">
            
            <InfoRow label="Name" defaultValue="Dr. Hitesh D. Vora" />
            <InfoRow label="Position" defaultValue="Director" />
            <InfoRow label="Email" defaultValue="hitesh.vora@okstate.edu" />
            <InfoRow label="Phone" defaultValue="+1 4057448710" />
            <InfoRow label="LinkedIn" placeholder="Paste link here" />
            <InfoRow label="Facebook" placeholder="Paste link here" />

          </div>

          {/* Save Button */}
          <div className="flex justify-center mt-10">
             <button className="bg-[#FE5C00] text-white px-12 py-2 rounded shadow hover:bg-orange-700 transition font-bold text-xl uppercase tracking-wider border-2 border-white/20">
                Save
             </button>
          </div>

        </div>
      </div>

    </div>
  );
};

/* --- REUSABLE INPUT ROW COMPONENT --- */
const InfoRow = ({ label, defaultValue, placeholder }: { label: string, defaultValue?: string, placeholder?: string }) => {
  return (
    <div className="flex items-center justify-center gap-4">
      <label className="w-32 text-right text-black text-lg font-serif">
        {label}:
      </label>
      <input
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-64 px-3 py-1 rounded bg-white border border-transparent focus:border-[#FE5C00] outline-none text-black shadow-sm font-serif"
      />
    </div>
  );
};

export default StaffMyInformation;