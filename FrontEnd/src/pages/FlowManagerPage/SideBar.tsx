import React from "react";
import { useChat } from "./ChatContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({isOpen, onClose}) => {
  const { sessions, activeSessionId, createNewSession, setActiveSession, deleteSessionChat } = useChat();

  const groupSessions = () => {
    const now = new Date();
    const today: typeof sessions = [];
    const yesterday: typeof sessions = [];
    const thisWeek: typeof sessions = [];
    const older: typeof sessions = [];

    sessions.forEach((s) => {
      const created = new Date(s.createdAt);
      const diffDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) today.push(s);
      else if (diffDays === 1) yesterday.push(s);
      else if (diffDays <= 7) thisWeek.push(s);
      else older.push(s);
    });

    return { today, yesterday, thisWeek, older };
  };

  const { today, yesterday, thisWeek, older } = groupSessions();

  const handleDeleteChat = async (session_id: string) => {
    console.log(session_id)
    await deleteSessionChat(session_id)
  }

  const renderGroup = (label: string, group: typeof sessions) => {
    if (group.length === 0) return null;
    return (
      <>
        <p className="text-[11px] text-gray-400 font-medium px-2 pt-3 pb-1 uppercase tracking-wider">
          {label}
        </p>
        {group.map((s) => (
          <div
            key={s.session_id}
            onClick={() => setActiveSession(s.session_id)}
            className={`w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
              activeSessionId === s.session_id
                ? "bg-white border border-gray-200 text-gray-800 shadow-sm"
                : "text-gray-600 hover:bg-white hover:text-gray-800"
            
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                activeSessionId === s.session_id ? "bg-teal-500" : "bg-gray-300"
              }`}
            />
            <span className="truncate flex-1">{s.title}</span>
            <button 
            className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteChat(s.session_id); // hook this up
            }}
            >
                🗑️
          </button>
          </div>
          ))}
        </>
    );
  };

  return (
     <aside className={`
      w-60 min-w-[240px] bg-gray-50 border-r border-gray-100 flex flex-col h-full
      fixed md:relative z-30 top-0 left-0
      transition-transform duration-300 ease-in-out
      ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
    `}>
      {/* Header — add close button for mobile */}
      <div className="px-4 pt-5 pb-3 border-b border-gray-100 flex items-center justify-between">
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Flow Manager
          </p>
          <button onClick={createNewSession} className="w-full flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 hover:border-teal-300 hover:text-teal-700 transition-all shadow-sm">
            <span className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center text-base leading-none">+</span>
            New chat
          </button>
        </div>
        <button onClick={onClose} className="md:hidden ml-2 text-gray-400 hover:text-gray-600 self-start mt-1">✕</button>
      </div>

      {/* Sessions */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {sessions.length === 0 ? (
          <p className="text-xs text-gray-400 text-center mt-6">No sessions yet</p>
        ) : (
          <>
            {renderGroup("Today", today)}
            {renderGroup("Yesterday", yesterday)}
            {renderGroup("This week", thisWeek)}
            {renderGroup("Older", older)}
          </>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;