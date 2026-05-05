import React, { useState } from "react";
import { ChatContextProvider } from "./ChatContext";
import Sidebar from "./SideBar";
import FlowManagerPage from "./flowManager";

const ChatLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ChatContextProvider>
      <div className="flex h-full bg-gray-50 overflow-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Mobile overlay backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/30 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 min-w-0 h-full">
          <FlowManagerPage onMenuClick={() => setSidebarOpen(true)} />
        </main>
      </div>
    </ChatContextProvider>
  );
};

export default ChatLayout;