import { createContext } from "react";
import type { ReactNode } from "react";
import type { TxType, Frequency } from "../../../types";

export type TransactionProposal = {
  type: TxType
  amount: number
  category: string;
  date: string;
  recurring: {
      isRecurring: boolean;
      frequency: Frequency | null;
      endDate?: string | null;
    };
}

export type Message = {
  id: string;
  role: "assistant" | "user";
  proposal?: TransactionProposal;
  content: string;
  timestamp: Date;
};

export type Session = {
  session_id: string;
  title: string;
  createdAt: Date;
};

export type ChatContextType = {
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

export interface ProviderType {
  children: ReactNode;
}

export const ChatContext = createContext<ChatContextType | undefined>(undefined);