import React from "react";
import { ChatContextProvider } from "./ChatContext";
import Sidebar from "./SideBar";
import FlowManagerPage from "./flowManager";

const ChatLayout: React.FC = () => {
  return (
    <ChatContextProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <FlowManagerPage />
        </main>
      </div>
    </ChatContextProvider>
  );
};

export default ChatLayout;