// 1️⃣ Type goes at the TOP of the file
type FormRowProps = {
  label: string;
  wide?: boolean;
};

// 2️⃣ Small reusable component - LARGER TEXT
const FormRow = ({ label, wide }: FormRowProps) => {
  return (
    <div className={wide ? "col-span-2" : ""}>
      <label className="block mb-2 font-bold text-lg text-gray-800">{label}:</label>
      <input
        type="text"
        className="w-full border border-black rounded-md px-4 py-3 outline-none focus:border-[#FE5C00] text-lg bg-white"
      />
    </div>
  );
};

// 3️⃣ Main page component
const UpdateDetails = () => {
  return (
    <div className="w-full h-full">

      {/* PAGE CARD */}
      <div className="w-full bg-white rounded-xl px-12 py-10 shadow-sm border border-gray-100">

        {/* TITLE */}
        <h2 className="text-3xl font-bold text-center text-black">
          My Information
        </h2>
        <div className="h-1.5 bg-[#FE5C00] w-full mt-4 mb-10" />

        {/* PROFILE SECTION */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-gray-200">
            <img
                src="https://images.unsplash.com/photo-1517849845537-4d257902454a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80"
                alt="Profile"
                className="w-full h-full object-cover"
            />
          </div>
          <button className="text-lg text-blue-600 mt-3 font-medium hover:underline">Edit</button>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-x-16 gap-y-8">

          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <FormRow label="Company Name" wide />
            <FormRow label="Contact Name" />
            <FormRow label="Contact Email" />
            <FormRow label="Contact Phone" />

            {/* --- UPDATED ADDRESS SECTION --- */}
            
            {/* 1. Street Address */}
            <FormRow label="Street Address" />

            {/* 2. City */}
            <FormRow label="City" />

            {/* 3. State & Zip Code (Split Row) */}
            <div className="flex gap-6">
              <FormRow label="State" />
              <FormRow label="Zip code" />
            </div>

            {/* ------------------------------- */}

            <FormRow label="SIC Code" />
            <FormRow label="NAICS" />
            <FormRow label="Annual Energy Consumption" />
            <FormRow label="Annual Gross sales" />
            <FormRow label="Waste water treatment plants size" />
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <FormRow label="Building Size" />
            <FormRow label="Annual utility expenses" />
            <FormRow label="Located in rural?" />
            <FormRow label="Any previous IAC Assessments" />
            <FormRow label="Agricultural Production" />

            <div>
              <label className="block mb-2 font-bold text-lg text-gray-800">Additional contacts or details</label>
              <textarea className="w-full h-40 border border-black rounded-md px-4 py-3 outline-none focus:border-[#FE5C00] text-lg" />
            </div>
          </div>

        </div>

        {/* SAVE BUTTON */}
        <div className="flex justify-end mt-16">
          <button className="bg-[#FE5C00] text-white px-12 py-3 rounded shadow hover:bg-orange-700 transition font-bold text-xl">
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default UpdateDetails;