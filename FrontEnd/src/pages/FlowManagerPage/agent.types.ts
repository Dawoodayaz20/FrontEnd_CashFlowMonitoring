import type { TransactionForm } from "../../../types";

export type AgentStatus = { label: string } | null;

export type StreamEvent =
  | { type: "handoff"; agent: string }
  | { type: "tool_called"; tool: string }
  | { type: "tool_done" }
  | { type: "final"; reply: string; proposal: TransactionForm | null }
  | { type: "error"; code: string; message: string };

export type GetResponseResult =
  | { success: true; data: { reply: string; proposal: TransactionForm | null } }
  | { success: false; error: string; message: string };

export interface ProposalModalProps {
  isOpen: boolean;
  proposal: TransactionForm | null;
  onConfirm: (updatedProposal: TransactionForm) => void;
  onClose: () => void;
}