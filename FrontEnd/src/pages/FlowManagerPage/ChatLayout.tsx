import React from "react";
import { ChatContextProvider } from "./ChatContext";
import Sidebar from "./SideBar";
import FlowManagerPage from "./flowManager";

const ChatLayout: React.FC = () => {
  return (
    <ChatContextProvider>
      <div className="flex bg-gray-50 h-full overflow-hidden">
        <Sidebar />
        <main className="flex-1 min-w-0">
          <FlowManagerPage />
        </main>
      </div>
    </ChatContextProvider>
  );
};

export default ChatLayout;