// import { createContext, useContext, useState } from "react";
// import type { ReactNode } from "react";
// import useAuthStore from "../../store/useAuthStore";

// export type Message = {
//   id: string;
//   role: "assistant" | "user";
//   content: string;
//   timestamp: Date;
// }

// export type Session = {
//   session_id: string,
//   title: string,
//   createdAt: Date
// } 

// type ChatContext = {
//     messages: Message[],
//     addMessage: (msg: Message) => void,
//     text: string,
//     setText: (value: string) => void
//     sessions: Session[],
//     activeSessionId: string | null,
//     createdNewSession: () => Promise<void>;
//     setActiveSession: (session_id: string) => void; 
// };

// interface Providertype {
//   children: ReactNode;
// }

// export const ChatContext = createContext<ChatContext | undefined>(undefined);

// export const ChatContextProvider = ({ children } : Providertype )  => {
//   const { user } = useAuthStore();
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: "1",
//       role: "assistant",
//       content: `Hello ${user?.name || "there"}! I'm your Flow Manager. I can help you analyze your transactions or forecast your budget. What's on your mind?`,
//       timestamp: new Date(),
//     },
//   ]);
//   const [text, setText] = useState<string>("");

//   const addMessage = (msg: Message) => {
//     setMessages(prev => [...prev, msg]);
//   }

//   return(
//     <ChatContext.Provider value={{messages, addMessage, text, setText }}>
//     {children}
//     </ChatContext.Provider>
//   )
// }

// export const useChat = () => {
//     const context = useContext(ChatContext);
//     if (!context) throw new Error("useChat must be used within ChatContextProvider");
//     return context;
// }

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "../../store/useAuthStore";
import { createSession, fetchSessions } from "../../fetchRequests/fetchChats";

export type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

export type Session = {
  session_id: string;
  title: string;
  createdAt: Date;
};

type ChatContextType = {
  // Messages
  messages: Message[];
  addMessage: (msg: Message) => void;

  // Input
  text: string;
  setText: (value: string) => void;

  // Sessions
  sessions: Session[];
  activeSessionId: string | null;
  createNewSession: () => void;
  setActiveSession: (session_id: string) => void;
  updateSessionTitle: (session_id: string, title: string) => void;
};

interface ProviderType {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: ProviderType) => {
  const { user } = useAuthStore();

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [text, setText] = useState<string>("");

  const welcomeMessage = (session_id: string): Message => ({
    id: uuidv4(),
    role: "assistant",
    content: `Hello ${user?.name || "there"}! I'm your Flow Manager. I can help you analyze your transactions or forecast your budget. What's on your mind?`,
    timestamp: new Date(),
  });

  const createNewSession = async () => {
    const session_id = uuidv4();
    const newSession: Session = {
      session_id,
      title: "New chat",
      createdAt: new Date(),
    };

    await createSession(session_id, "New chat");

    setSessions((prev) => [newSession, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [session_id]: [welcomeMessage(session_id)],
    }));
    setActiveSessionId(session_id);
    setText("");
  };
// useChat
  const setActiveSession = (session_id: string) => {
    setActiveSessionId(session_id);
    setText("");
  };

  const addMessage = (msg: Message) => {
    if (!activeSessionId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), msg],
    }));
  };

  const updateSessionTitle = (session_id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.session_id === session_id ? { ...s, title } : s))
    );
  };

  const messages = activeSessionId ? (messagesMap[activeSessionId] || []) : [];

  return (
    <ChatContext.Provider
      value={{
        messages,
        addMessage,
        text,
        setText,
        sessions,
        activeSessionId,
        createNewSession,
        setActiveSession,
        updateSessionTitle,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error("useChat must be used within ChatContextProvider");
  return context;
};