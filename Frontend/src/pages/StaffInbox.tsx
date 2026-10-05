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
  
  // 🚨 NEW: Broadcast Modal State
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [broadcastSubject, setBroadcastSubject] = useState("");
  const [broadcastText, setBroadcastText] = useState("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Master List & Conversations
  const fetchConversations = async () => {
    try {
      // 🚨 FIX 1: Fetch ALL profiles (for the list) AND Conversations (for unread counts) concurrently
      const [profilesRes, convsRes] = await Promise.all([
          api.get('/profile/admin/all'),
          api.get('/messages/admin/conversations')
      ]);

      const allProfiles = profilesRes.data.filter((p: any) => p.user && p.user.role !== 'staff' && p.user.role !== 'admin');
      const activeConvs = convsRes.data;

      // Merge the data: Show all clients, but attach unread counts if they exist
      const mergedList = allProfiles.map((profile: any) => {
          const chatHistory = activeConvs.find((c: any) => c.profile && c.profile.user && c.profile.user._id === profile.user._id);
          return {
              profile: profile,
              unreadCount: chatHistory ? chatHistory.unreadCount : 0,
              lastMessage: chatHistory ? chatHistory.lastMessage : null
          };
      });

      // Sort: Unread messages at the top, then alphabetically
      mergedList.sort((a: any, b: any) => {
          if (b.unreadCount !== a.unreadCount) return b.unreadCount - a.unreadCount;
          return a.profile.companyName.localeCompare(b.profile.companyName);
      });

      setConversations(mergedList);
      
      if (!selectedClientId && mergedList.length > 0 && !clientId) {
        handleSelectConversation(mergedList[0].profile.user._id, mergedList[0].profile.companyName);
      }
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  useEffect(() => {
    fetchConversations();
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
        
        await api.put(`/messages/admin/mark-read/${selectedClientId}`);
        
        setConversations(prev => prev.map(conv => 
            (conv.profile.user._id === selectedClientId) 
            ? { ...conv, unreadCount: 0 } 
            : conv
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
    navigate(`/staff-inbox/${id}`, { replace: true }); 
  };

  // 5. Send Direct Message Function
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
      
      fetchConversations();
    } catch (err) {
      console.error("Failed to send", err);
      alert("Failed to send message. Please try again.");
    }
  };

  // 🚨 NEW: 6. Broadcast Submit Function
  const handleBroadcast = async (e: React.FormEvent) => {
      e.preventDefault();
      if(!broadcastSubject.trim() || !broadcastText.trim()) return;
      
      if (!window.confirm(`Are you sure you want to email this to ALL ${conversations.length} clients?`)) return;

      setIsBroadcasting(true);
      try {
          await api.post('/messages/admin/broadcast', {
              subject: broadcastSubject,
              message: broadcastText
          });
          alert("Broadcast sent successfully to all clients!");
          setIsBroadcastOpen(false);
          setBroadcastSubject("");
          setBroadcastText("");
      } catch(err) {
          console.error("Broadcast failed", err);
          alert("Failed to send broadcast.");
      } finally {
          setIsBroadcasting(false);
      }
  };

  return (
    <div className="w-full h-full flex flex-col relative bg-gray-50 min-h-[calc(100vh-100px)]">
      
      {/* HEADER & BREADCRUMBS */}
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

      {/* INBOX CONTAINER */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="w-full h-[600px] flex bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden relative">
        
            {/* LEFT PANEL: Master Client List */}
            <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-black tracking-wide">Client Directory</h2>
                    {/* 🚨 NEW: Broadcast Button */}
                    <button 
                        onClick={() => setIsBroadcastOpen(true)}
                        className="bg-[#FE5C00] text-white p-2 rounded-md hover:bg-orange-700 transition shadow-sm flex items-center gap-2 text-xs font-bold"
                        title="Email All Clients"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                        Broadcast
                    </button>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="text-center text-gray-400 mt-10 p-4 text-sm">No clients found.</p>
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
                                        <h3 className="font-bold text-gray-900 truncate text-sm flex items-center gap-2">
                                            {conv.profile.companyName}
                                            {conv.profile.isArchived && <span className="bg-gray-200 text-gray-600 text-[10px] px-1.5 py-0.5 rounded">Archived</span>}
                                        </h3>
                                        {/* 🚨 NEW: Display Client Email */}
                                        <p className="text-xs text-blue-600 truncate mb-1">{conv.profile.contactEmail}</p>
                                        
                                        <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-bold text-black' : 'text-gray-500'}`}>
                                            {conv.lastMessage ? (
                                                conv.lastMessage.senderRole === 'staff' ? `You: ${conv.lastMessage.text}` : conv.lastMessage.text
                                            ) : <span className="italic">No chat history</span>}
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
                        <div className="bg-[#FE5C00] px-6 py-4 flex items-center gap-4 shadow-sm z-10">
                            <div className="w-10 h-10 rounded-full bg-white/20 border-2 border-white flex items-center justify-center text-white font-bold overflow-hidden">
                                <span>#</span>
                            </div>
                            <h2 className="text-white text-xl font-bold truncate">
                                {clientName}
                            </h2>
                        </div>

                        <div className="flex-1 bg-gray-50 p-6 overflow-y-auto space-y-4 flex flex-col">
                            <div className="text-center text-gray-400 text-sm mt-4 mb-6">
                                Start of conversation with <span className="font-semibold text-gray-600">{clientName}</span>
                            </div>
                            
                            {messages.filter(msg => msg !== null).map((msg) => {
                                const isMe = msg.senderRole === 'staff';
                                return (
                                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[75%] px-5 py-3 rounded-2xl text-[15px] shadow-sm ${
                                            isMe ? 'bg-[#FE5C00] text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={messagesEndRef} />
                        </div>

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
            
            {/* 🚨 NEW: BROADCAST MODAL OVERLAY */}
            {isBroadcastOpen && (
                <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in rounded-xl">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
                        <div className="bg-gray-100 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-[#FE5C00]">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                                </svg>
                                Broadcast Email
                            </h2>
                            <button onClick={() => setIsBroadcastOpen(false)} className="text-gray-400 hover:text-red-500 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleBroadcast} className="p-6 space-y-4">
                            <p className="text-sm text-gray-500 mb-2">
                                This message will be sent as an email via <strong>BCC</strong> to all {conversations.length} clients in the directory. Clients will not see each other's emails.
                            </p>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Subject Line</label>
                                <input 
                                    type="text" 
                                    required
                                    value={broadcastSubject}
                                    onChange={(e) => setBroadcastSubject(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00]"
                                    placeholder="e.g. Upcoming ITAC Assessment Event"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wide mb-1">Message Body</label>
                                <textarea 
                                    required
                                    value={broadcastText}
                                    onChange={(e) => setBroadcastText(e.target.value)}
                                    className="w-full border border-gray-300 rounded-md px-4 py-2 outline-none focus:border-[#FE5C00] focus:ring-1 focus:ring-[#FE5C00] h-32 resize-none"
                                    placeholder="Type the announcement here..."
                                />
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setIsBroadcastOpen(false)}
                                    className="px-6 py-2 rounded text-gray-600 hover:bg-gray-100 font-bold transition"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isBroadcasting}
                                    className={`px-8 py-2 rounded text-white font-bold transition flex items-center gap-2 shadow-sm
                                        ${isBroadcasting ? 'bg-orange-300 cursor-not-allowed' : 'bg-[#FE5C00] hover:bg-orange-700'}`}
                                >
                                    {isBroadcasting ? 'Sending...' : 'Send Broadcast'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
      </div>
    </div>
  );
};

export default StaffInbox;