import { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import api from "../api/axios";

const StaffInbox = () => {
  const { clientId } = useParams();
  const navigate = useNavigate();
  
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [conversations, setConversations] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clientId || null);
  const [clientName, setClientName] = useState("Select a Conversation");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Conversations List (For the Left Panel)
  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/admin/conversations');
      setConversations(res.data);
      
      // Auto-select the first conversation if we just clicked "Inbox" with no specific ID
      if (!selectedClientId && res.data.length > 0 && !clientId) {
        handleSelectConversation(res.data[0].profile.user._id, res.data[0].profile.companyName);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    // Poll the inbox list every 15 seconds for new clients messaging us
    const interval = setInterval(fetchConversations, 15000);
    return () => clearInterval(interval);
  }, []);

  // 2. Fetch specific messages when a client is selected
  useEffect(() => {
    if (!selectedClientId) return;

    const fetchMessages = async () => {
      try {
        const res = await api.get(`/messages/${selectedClientId}`);
        setMessages(res.data);
        
        // Clear the red dot!
        await api.put(`/messages/admin/mark-read/${selectedClientId}`);
        
        // Instantly clear the red dot from our local sidebar list too
        setConversations(prev => prev.map(conv => 
            conv.profile.user._id === selectedClientId ? { ...conv, unreadCount: 0 } : conv
        ));
      } catch (err) {
        console.error("Failed to fetch messages", err);
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedClientId]);

  // 3. Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Handle Selecting a Conversation
  const handleSelectConversation = (id: string, name: string) => {
    setSelectedClientId(id);
    setClientName(name);
    navigate(`/staff-inbox/${id}`, { replace: true }); // Updates URL silently
  };

  // 5. Send Message Function
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!message.trim() || !selectedClientId) return;
    
    try {
      const optimisticMessage = { senderRole: 'staff', text: message, _id: Date.now() };
      setMessages((prev) => [...prev, optimisticMessage]);
      setMessage(""); 

      await api.post(`/messages/${selectedClientId}`, {
        senderRole: 'staff', 
        text: optimisticMessage.text
      });
      
      fetchConversations(); // Refresh left panel to show our newest message
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message. Please try again.");
    }
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

      {/* 2. INBOX CONTAINER (Split Layout) */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <div className="w-full h-[600px] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
            {/* LEFT PANEL: Conversation List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-bold text-black tracking-wide">Conversations</h2>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="text-center text-gray-400 mt-10 p-4 text-sm">No messages yet.</p>
                    ) : (
                        conversations.map((conv) => {
                            const isActive = conv.profile.user._id === selectedClientId;
                            return (
                                <div 
                                    key={conv.profile.user._id}
                                    onClick={() => handleSelectConversation(conv.profile.user._id, conv.profile.companyName)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-colors flex justify-between items-center ${
                                        isActive ? 'bg-orange-50 border-l-4 border-l-[#FE5C00]' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                                    }`}
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="font-bold text-gray-900 truncate text-sm">{conv.profile.companyName}</h3>
                                        <p className={`text-xs truncate mt-1 ${conv.unreadCount > 0 ? 'font-bold text-black' : 'text-gray-500'}`}>
                                            {conv.lastMessage ? (
                                                conv.lastMessage.senderRole === 'staff' ? `You: ${conv.lastMessage.text}` : conv.lastMessage.text
                                            ) : 'New Conversation'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end justify-between ml-2 h-full">
                                        {conv.unreadCount > 0 && (
                                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm mt-1">
                                                {conv.unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* RIGHT PANEL: Chat Window */}
            <div className="w-2/3 flex flex-col">
                {selectedClientId ? (
                    <>
                        {/* CHAT HEADER */}
                        <div className="bg-[#FE5C00] px-6 py-4 flex items-center gap-4 shadow-sm z-10">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden">
                                <span>#</span>
                            </div>
                            <h2 className="text-white text-xl font-bold truncate">
                                {clientName}
                            </h2>
                        </div>

                        {/* MESSAGES AREA */}
                        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-4 flex flex-col">
                            <div className="text-center text-gray-400 text-sm mt-4 mb-6">
                                Start of conversation with <span className="font-semibold text-gray-600">{clientName}</span>
                            </div>
                            
                            {messages.map((msg) => {
                                const isMe = msg.senderRole === 'staff';
                                return (
                                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-[15px] shadow-sm ${
                                            isMe 
                                            ? 'bg-[#FE5C00] text-white rounded-br-sm' 
                                            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* INPUT AREA */}
                        <div className="p-4 border-t border-gray-200 bg-white">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    placeholder="Type your message here..."
                                    className="w-full bg-gray-100 text-gray-800 rounded-full py-3 pl-6 pr-14 outline-none focus:ring-2 focus:ring-[#FE5C00]/20 transition"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    disabled={!selectedClientId} 
                                />
                                <button 
                                    type="submit"
                                    disabled={!selectedClientId || !message.trim()}
                                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition p-2 disabled:opacity-50 ${!selectedClientId ? 'text-gray-300' : 'text-[#FE5C00] hover:text-orange-700'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 -rotate-45 mb-1">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                        <p>Select a client from the list to start messaging.</p>
                    </div>
                )}
            </div>

        </div>
      </div>
    </div>
  );
};

export default StaffInbox;