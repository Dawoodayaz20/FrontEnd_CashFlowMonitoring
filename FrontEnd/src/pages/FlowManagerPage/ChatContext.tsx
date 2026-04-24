import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import useAuthStore from "../../store/useAuthStore";

export type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

type ChatContext = {
    messages: Message[],
    addMessage: (msg: Message) => void,
    text: string,
    setText: (value: string) => void
};

interface Providertype {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContext | undefined>(undefined);

export const ChatContextProvider = ({ children } : Providertype )  => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hello ${user?.name || "there"}! I'm your Flow Manager. I can help you analyze your transactions or forecast your budget. What's on your mind?`,
      timestamp: new Date(),
    },
  ]);
  const [text, setText] = useState<string>("");

  const addMessage = (msg: Message) => {
    setMessages(prev => [...prev, msg]);
  }

  return(
    <ChatContext.Provider value={{messages, addMessage, text, setText }}>
    {children}
    </ChatContext.Provider>
  )
}

export const useChat = () => {
    const context = useContext(ChatContext);
    if (!context) throw new Error("useChat must be used within ChatContextProvider");
    return context;
}
