const UploadDocuments = () => {
  return (
    // CHANGE: w-full and removed max-w restriction
    <div className="w-full h-full">

      {/* MAIN CARD */}
      <div className="w-full bg-white rounded-xl px-12 py-10 shadow-sm border border-gray-100">

        {/* DOWNLOAD SECTION */}
        <SectionTitle title="Download documents" />

        <div className="border border-black p-8 text-center text-xl font-medium mb-12 text-gray-800 leading-relaxed">
          Please download the documents. Go through the documents and fill the
          data. <br /> Upload the documents in the below section!
        </div>

        <div className="space-y-8 mb-16">
          <ActionRow label="Confidentiality Statement" action="Download" />
          <ActionRow label="Media Release form" action="Download" />
          <ActionRow label="Energy Assessment Application" action="Download" />
        </div>

        {/* UPLOAD SECTION */}
        <SectionTitle title="Upload documents" />

        <div className="space-y-8">
          <ActionRow label="Most Recent Utility Bills" action="Upload" />
          <ActionRow label="Confidentiality Statement" action="Upload" />
          <ActionRow label="Media Release form" action="Upload" />
          <ActionRow label="Energy Assessment Application" action="Upload" />
          <ActionRow label="Other Documents" action="Upload" />
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

const ActionRow = ({
  label,
  action,
}: {
  label: string;
  action: "Download" | "Upload";
}) => {
  return (
    <div className="flex items-center justify-center gap-8 xl:gap-16">
      {/* Increased Width and Text Size */}
      <span className="w-96 text-right text-xl font-bold text-gray-700">{label}:</span>

      <button className="bg-[#4a5568] text-white w-40 py-3 rounded shadow hover:bg-gray-700 transition text-lg font-semibold">
        {action}
      </button>
    </div>
  );
};