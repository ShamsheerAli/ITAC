import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/axios";

const Inbox = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // This helps us automatically scroll to the newest message
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Get User ID on load
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUserId(user._id || user.id);
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 2. Fetch Messages & Setup Auto-Refresh (Polling)
  useEffect(() => {
    if (!currentUserId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${currentUserId}`);
        setMessages(res.data);
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    // Fetch immediately on load
    fetchMessages();

    // Auto-refresh every 3 seconds to check for staff replies!
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval); // Cleanup when leaving page
  }, [currentUserId]);

  // 3. Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Send Message Function
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;

    try {
      // Instantly add to UI for a snappy feel
      const optimisticMessage = { senderRole: 'client', text: newMessage, _id: Date.now() };
      setMessages((prev) => [...prev, optimisticMessage]);
      setNewMessage(""); 

      // Save to Database
      await api.post(`/messages/${currentUserId}`, {
        senderRole: 'client', // We are the client!
        text: optimisticMessage.text
      });
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message. Please try again.");
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-100px)] flex flex-col bg-white rounded-lg shadow border border-gray-200 overflow-hidden font-sans">
      
      {/* HEADER */}
      <div className="bg-[#FE5C00] px-6 py-4 flex items-center gap-4 text-white">
        <Link to="/dashboard" className="hover:bg-orange-600 p-2 rounded-full transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </div>
        <h2 className="text-xl font-bold">Staff Team</h2>
      </div>

      {/* CHAT HISTORY AREA */}
      <div className="flex-1 p-6 overflow-y-auto bg-gray-50 flex flex-col gap-4">
        {messages.length === 0 ? (
            <div className="text-center text-gray-400 mt-10">No messages yet. Say hello!</div>
        ) : (
            messages.map((msg) => {
                // If sender is client, align right (blue). If staff, align left (gray).
                const isMe = msg.senderRole === 'client';
                return (
                    <div key={msg._id} className={`max-w-[75%] px-5 py-3 rounded-2xl text-lg ${isMe ? 'bg-blue-600 text-white self-end rounded-br-sm' : 'bg-gray-200 text-gray-800 self-start rounded-bl-sm'}`}>
                        {msg.text}
                    </div>
                )
            })
        )}
        {/* Invisible div to help us auto-scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      <div className="p-4 bg-white border-t border-gray-100">
        <form onSubmit={handleSendMessage} className="flex items-center gap-3 bg-gray-50 p-2 rounded-full border border-gray-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message here..." 
            className="flex-1 bg-transparent px-4 py-2 outline-none text-gray-700"
          />
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="p-3 text-blue-600 hover:bg-blue-100 rounded-full transition disabled:opacity-50 disabled:hover:bg-transparent"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 transform rotate-45 -mt-1 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
          </button>
        </form>
      </div>

    </div>
  );
};

export default Inbox;