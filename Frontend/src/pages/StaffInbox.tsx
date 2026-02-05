import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";

const StaffInbox = () => {
  const { clientId } = useParams();
  const [message, setMessage] = useState("");
  const [clientName, setClientName] = useState("Select a Conversation");

  // Mock checking client ID to set header title
  useEffect(() => {
    if (clientId) {
        // In a real app, you'd fetch the client name by ID here
        // For demo, we just map a few IDs or default to the ID itself
        if (clientId === "OK1166") setClientName("Kingspan Roofing");
        else if (clientId === "OK1169") setClientName("Checotah Casino");
        else setClientName(`Client: ${clientId}`);
    } else {
        setClientName("Staff Inbox");
    }
  }, [clientId]);

  const handleSend = () => {
    if (!message.trim()) return;
    console.log(`Sending message to ${clientId}:`, message);
    setMessage(""); 
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-gray-50 min-h-[calc(100vh-100px)]">
      
      {/* 1. HEADER & BREADCRUMBS */}
      <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-3 shadow-sm">
        <Link to="/staff-dashboard" className="text-gray-500 hover:text-[#FE5C00] transition">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
        </Link>
        <span className="text-gray-300">|</span>
        <span className="text-sm font-medium text-gray-500">Home</span>
        <span className="text-gray-300">/</span>
        <span className="text-sm font-bold text-black">Inbox</span>
      </div>

      {/* 2. CHAT CONTAINER */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        <div className="w-full h-[600px] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
            {/* CHAT HEADER */}
            <div className="bg-[#FE5C00] px-6 py-4 flex items-center gap-4">
                <Link to="/staff-dashboard" className="text-white/80 hover:text-white transition">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                    </svg>
                </Link>

                {/* Profile Image (Placeholder) */}
                <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden">
                     {clientId ? (
                         <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Client" className="w-full h-full object-cover" />
                     ) : (
                         <span>#</span>
                     )}
                </div>

                <h2 className="text-white text-xl font-bold truncate">
                    {clientName}
                </h2>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-4">
                {clientId ? (
                     <div className="text-center text-gray-400 text-sm mt-10">
                        Start of conversation with <span className="font-semibold text-gray-600">{clientName}</span>
                     </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <p>Select a client from the Dashboard to start messaging.</p>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <div className="relative">
                <input
                    type="text"
                    placeholder="Type your message here..."
                    className="w-full bg-gray-100 text-gray-800 rounded-full py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-[#FE5C00]/20 transition"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    disabled={!clientId} // Disable if no client selected
                />
                
                {/* Send Button Icon */}
                <button 
                    onClick={handleSend}
                    disabled={!clientId}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition p-2 ${!clientId ? 'text-gray-300' : 'text-blue-600 hover:text-blue-700'}`}
                >
                    <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-6 h-6 -rotate-45 mb-1"
                    >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                    </svg>
                </button>
                </div>
            </div>

        </div>
      </div>

    </div>
  );
};

export default StaffInbox;