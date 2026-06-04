import { create } from "zustand";
import {
  type AgentState,
  AgentStatus,
  AgentType,
  type DebateMessage,
  type FinalRecommendation,
} from "@/types/agent";

const initialAgentStates: Record<AgentType, AgentState> = {
  [AgentType.MARKET_RESEARCH]: {
    type: AgentType.MARKET_RESEARCH,
    status: AgentStatus.IDLE,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    latencyMs: null,
  },
  [AgentType.BULL_ANALYST]: {
    type: AgentType.BULL_ANALYST,
    status: AgentStatus.IDLE,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    latencyMs: null,
  },
  [AgentType.BEAR_ANALYST]: {
    type: AgentType.BEAR_ANALYST,
    status: AgentStatus.IDLE,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    latencyMs: null,
  },
  [AgentType.RISK_MANAGER]: {
    type: AgentType.RISK_MANAGER,
    status: AgentStatus.IDLE,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    latencyMs: null,
  },
  [AgentType.PORTFOLIO_MANAGER]: {
    type: AgentType.PORTFOLIO_MANAGER,
    status: AgentStatus.IDLE,
    output: null,
    error: null,
    startedAt: null,
    completedAt: null,
    latencyMs: null,
  },
};

interface AgentStore {
  sessionId: string | null;
  isActive: boolean;
  prompt: string;
  agents: Record<AgentType, AgentState>;
  messages: DebateMessage[];
  finalRecommendation: FinalRecommendation | null;
  error: string | null;

  // Actions
  startSession: (sessionId: string, prompt: string) => void;
  setAgentThinking: (agent: AgentType) => void;
  setAgentStreaming: (agent: AgentType) => void;
  addMessage: (message: DebateMessage) => void;
  setAgentOutput: (
    agent: AgentType,
    output: AgentState["output"],
    latencyMs: number
  ) => void;
  setAgentError: (agent: AgentType, error: string) => void;
  setFinalRecommendation: (recommendation: FinalRecommendation) => void;
  setSessionError: (error: string) => void;
  endSession: () => void;
  reset: () => void;
}

export const useAgentStore = create<AgentStore>((set) => ({
  sessionId: null,
  isActive: false,
  prompt: "",
  agents: { ...initialAgentStates },
  messages: [],
  finalRecommendation: null,
  error: null,

  startSession: (sessionId, prompt) =>
    set({
      sessionId,
      prompt,
      isActive: true,
      agents: { ...initialAgentStates },
      messages: [],
      finalRecommendation: null,
      error: null,
    }),

  setAgentThinking: (agent) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agent]: {
          ...state.agents[agent],
          status: AgentStatus.THINKING,
          startedAt: new Date().toISOString(),
        },
      },
    })),

  setAgentStreaming: (agent) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agent]: { ...state.agents[agent], status: AgentStatus.STREAMING },
      },
    })),

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setAgentOutput: (agent, output, latencyMs) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agent]: {
          ...state.agents[agent],
          status: AgentStatus.COMPLETED,
          output,
          completedAt: new Date().toISOString(),
          latencyMs,
        },
      },
    })),

  setAgentError: (agent, error) =>
    set((state) => ({
      agents: {
        ...state.agents,
        [agent]: {
          ...state.agents[agent],
          status: AgentStatus.ERROR,
          error,
          completedAt: new Date().toISOString(),
        },
      },
    })),

  setFinalRecommendation: (recommendation) =>
    set({ finalRecommendation: recommendation }),

  setSessionError: (error) => set({ error, isActive: false }),

  endSession: () => set({ isActive: false }),

  reset: () =>
    set({
      sessionId: null,
      isActive: false,
      prompt: "",
      agents: { ...initialAgentStates },
      messages: [],
      finalRecommendation: null,
      error: null,
    }),
}));
