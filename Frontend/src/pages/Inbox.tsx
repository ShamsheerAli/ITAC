import { useState } from "react";
import { Link } from "react-router-dom";

const Inbox = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    console.log("Sending message:", message);
    setMessage(""); 
  };

  return (
    // CHANGE: w-full, h-full, removed max-w
    <div className="w-full h-[calc(100vh-140px)] flex flex-col bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      
      {/* 1. CHAT HEADER - LARGER */}
      <div className="bg-[#FE5C00] px-8 py-6 flex items-center gap-6">
        {/* Back Arrow */}
        <Link to="/dashboard" className="text-white hover:opacity-80 transition">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={3} // Thicker stroke
            stroke="currentColor"
            className="w-8 h-8" // Larger Icon
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
        </Link>

        {/* Staff Profile Image - Larger */}
        <div className="w-12 h-12 rounded-full border-2 border-white overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80"
            alt="Staff"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Name - Larger */}
        <h2 className="text-white text-2xl font-bold">Staff</h2>
      </div>

      {/* 2. MESSAGES AREA */}
      <div className="flex-1 bg-white p-8 overflow-y-auto">
        {/* Empty state for now */}
      </div>

      {/* 3. INPUT AREA - LARGER */}
      <div className="p-8 border-t border-gray-100">
        <div className="relative">
          <input
            type="text"
            placeholder="Type your message here..."
            className="w-full bg-gray-100 text-gray-700 rounded-full py-5 pl-8 pr-16 outline-none focus:ring-2 focus:ring-[#FE5C00]/20 transition text-lg"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          
          {/* Send Button Icon */}
          <button 
            onClick={handleSend}
            className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-500 hover:text-blue-600 transition p-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-8 h-8 -rotate-45 mb-1"
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
  );
};

export default Inbox;