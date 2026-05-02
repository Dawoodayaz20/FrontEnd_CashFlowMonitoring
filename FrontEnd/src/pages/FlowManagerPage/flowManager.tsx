import React, { useEffect, useRef } from "react";
import useAuthStore from "../../store/useAuthStore";
import { getResponse } from "../../fetchRequests/fetchAgent";
import type { Message } from "./ChatContext";
import { useChat } from "./ChatContext";
import { v4 as uuidv4 } from "uuid";
import { generateTitle } from "../../fetchRequests/fetchAgent";


const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isBot = message.role === "assistant";
 
  return (
    <div className={`flex ${isBot ? "justify-start" : "justify-end"} mb-4`}>
      <div className={`flex max-w-[80%] gap-3 ${isBot ? "flex-row" : "flex-row-reverse"}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
          isBot ? "bg-teal-600 text-white" : "bg-gray-200 text-gray-600"
        }`}>
          {isBot ? "🤖" : "👤"}
        </div>
        <div className={`px-4 py-3 rounded-2xl text-sm shadow-sm ${
          isBot
            ? "bg-white border border-gray-100 text-gray-800 rounded-tl-none"
            : "bg-teal-600 text-white rounded-tr-none"
        }`}>
          <p className="leading-relaxed">{message.content}</p>
          <p className={`text-[10px] mt-1.5 font-medium ${isBot ? "text-gray-400" : "text-teal-100"}`}>
            {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    </div>
  );
};
 
const QuickAction: React.FC<{ label: string; onClick: () => void }> = ({ label, onClick }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all shadow-sm"
  >
    {label}
  </button>
);
 
// ─── Main Component ───────────────────────────────────────────────────────────
 
const FlowManagerPage: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, addMessage, text, setText, activeSessionId, updateSessionTitle } = useChat();
 
  const userID = user?.id || "";
  const userName = user?.name || "";
  const email = user?.email || "";
 
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
 
  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !activeSessionId) return;
 
    const userMsg: Message = {
      id: uuidv4(),
      role: "user",
      content,
      timestamp: new Date(),
    };
 
    addMessage(userMsg);
    setText("");

    if(messages.length === 2){
      await generateTitle(content).then((title) => {
        updateSessionTitle(activeSessionId, title);
      });
    }

    try {
      const responseData = await getResponse(content, userID, userName, email, activeSessionId);
 
      if (!responseData.success) {
          addMessage({
              id: uuidv4(),
              role: "assistant",
              content: responseData.error === "rate_limit"
                  ? "⚠️ API quota exceeded. Please check your billing or try again later."
                  : `❌ ${responseData.message}`,
              timestamp: new Date(),
          });
          return;
      }

      addMessage({
          id: uuidv4(),
          role: "assistant",
          content: responseData.data,
          timestamp: new Date(),
      });
    
      } catch(err){
        console.error(`There was an error connecting to Server: ${err}`)
      }
    };

    if (!activeSessionId) return null;
 
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* ── Chat Messages Area ────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
 
      {/* ── Input & Quick Actions ─────────────────────────────────────────── */}
      <div className="bg-white border-t border-gray-100 p-6 shrink-0">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <QuickAction
              label="📊 Summarize this month"
              onClick={() => handleSendMessage("Give me a summary of my spending this month.")}
            />
            <QuickAction
              label="📉 How can I save?"
              onClick={() => handleSendMessage("Show me where I can cut expenses.")}
            />
            <QuickAction
              label="💡 Forecast next month"
              onClick={() => handleSendMessage("Forecast my cashflow for next month.")}
            />
          </div>
 
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(text); }}
            className="relative flex items-center gap-3"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ask Flow Manager something..."
                className="w-full pl-5 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all placeholder:text-gray-400"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors shadow-sm active:scale-95"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </form>
          <p className="text-[10px] text-center text-gray-400 font-medium uppercase tracking-widest">
            Powered by FlowAI Engine
          </p>
        </div>
      </div>
    </div>
  );
};
 
export default FlowManagerPage;