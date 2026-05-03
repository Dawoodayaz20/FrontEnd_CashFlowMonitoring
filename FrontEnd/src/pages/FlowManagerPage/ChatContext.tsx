import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import useAuthStore from "../../store/useAuthStore";
import { createSession, fetchSessionMessages, fetchSessions, saveMessage, updateTitle, deleteSession } from "../../fetchRequests/fetchChats";

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
  deleteSessionChat: (session_id: string) => void;
};

interface ProviderType {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatContextProvider = ({ children }: ProviderType) => {
  const { user } = useAuthStore();

  useEffect(() => {
    if(!user) return;

    fetchSessions().then((data) => {
        if (data && data.length > 0) {
            setSessions(data);
            setActiveSessionId(data[0].session_id); // 👈 most recent session
            fetchSessionMessages(data[0].session_id).then((msgs) => {
                if (msgs) setMessagesMap({ [data[0].session_id]: msgs });
            });
        } else {
            // createNewSession(); // 👈 no sessions yet, create first one
            console.log("NO Sessions!")
        }
    });
  }, [user]);

  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messagesMap, setMessagesMap] = useState<Record<string, Message[]>>({});
  const [text, setText] = useState<string>("");

  const welcomeMessage = (): Message => ({
    id: uuidv4(),
    role: "assistant",
    content: `Hello ${user?.name || "there"}! I'm your Flow Manager. I can help you analyze your transactions or forecast your budget. What's on your mind?`,
    timestamp: new Date(),
  });

  const createNewSession = async () => {
    const session_id = uuidv4();
    const welcome = welcomeMessage();
    const newSession: Session = {
      session_id,
      title: "New chat",
      createdAt: new Date(),
    };

    await createSession(session_id, "New chat");
    await saveMessage(session_id, welcome);

    setSessions((prev) => [newSession, ...prev]);
    setMessagesMap((prev) => ({
      ...prev,
      [session_id]: [welcomeMessage()],
    }));
    setActiveSessionId(session_id);
    console.log(session_id)
    setText("");
  };
// useChat
  const setActiveSession = async (session_id: string) => {
    setActiveSessionId(session_id);
    setText("");
    await fetchSessionMessages(session_id).then((data) => {
      if (data) setMessagesMap(prev => ({ ...prev, [session_id]: data}))
    })
  };

  const addMessage = async (msg: Message) => {
    if (!activeSessionId) return;
    setMessagesMap((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), msg],
    }));
    await saveMessage(activeSessionId, msg)
  };

  const updateSessionTitle = async (session_id: string, title: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.session_id === session_id ? { ...s, title } : s))
    );
    await updateTitle(session_id, title);
  };

  const deleteSessionChat = async (session_id: string) => {
    await deleteSession(session_id);

    const filteredSessions = sessions.filter((sess) => sess.session_id !== session_id)
    // console.log(filteredSessions)
    setSessions(filteredSessions);
  }

  const messages = activeSessionId ? (messagesMap[activeSessionId] || []) : [];
  // console.log(messages)

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
        deleteSessionChat
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