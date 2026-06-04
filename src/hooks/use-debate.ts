"use client";

import * as React from "react";
import { useAgentStore } from "@/stores/agent-store";
import { usePortfolioStore } from "@/stores/portfolio-store";
import { useUIStore } from "@/stores/ui-store";
import type { AgentType, FinalRecommendation } from "@/types/agent";

/**
 * SSE event types matching the orchestrator's event stream
 */
type DebateEvent =
  | { type: "session_start"; sessionId: string }
  | { type: "agent_start"; agent: AgentType }
  | { type: "agent_end"; agent: AgentType; output: unknown; latencyMs: number }
  | { type: "agent_error"; agent: AgentType; error: string }
  | { type: "final"; recommendation: FinalRecommendation }
  | { type: "done" }
  | { type: "error"; message: string };

/**
 * use-debate hook
 *
 * Connects the committee dashboard to the SSE streaming backend.
 * Handles the full lifecycle: connect → stream → parse → dispatch → cleanup.
 */
export function useDebate() {
  const [isStreaming, setIsStreaming] = React.useState(false);
  const abortRef = React.useRef<AbortController | null>(null);

  const {
    startSession,
    setAgentThinking,
    setAgentStreaming,
    setAgentOutput,
    setAgentError,
    setFinalRecommendation,
    setSessionError,
    endSession,
    reset,
  } = useAgentStore();

  const { data: portfolioData } = usePortfolioStore();
  const { showToast } = useUIStore();

  /**
   * Start a debate by connecting to the SSE stream.
   */
  const startDebate = React.useCallback(
    async (prompt: string) => {
      // Cancel any existing stream
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const abortController = new AbortController();
      abortRef.current = abortController;

      const sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

      // Reset store state
      startSession(sessionId, prompt);
      setIsStreaming(true);

      try {
        const response = await fetch("/api/agents/stream", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt,
            portfolio: portfolioData ?? undefined,
          }),
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`Stream request failed: ${response.status}`);
        }

        if (!response.body) {
          throw new Error("No response body");
        }

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Process complete SSE messages (separated by \n\n)
          const chunks = buffer.split("\n\n");
          buffer = chunks.pop() ?? ""; // Keep incomplete chunk in buffer

          for (const chunk of chunks) {
            const trimmed = chunk.trim();
            if (!trimmed) continue;

            // Parse "data: {...}" lines
            const dataLine = trimmed
              .split("\n")
              .find((line) => line.startsWith("data: "));

            if (dataLine) {
              try {
                const event: DebateEvent = JSON.parse(dataLine.slice(6));
                handleEvent(event);
              } catch (parseError) {
                console.warn("Failed to parse SSE event:", trimmed, parseError);
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          // User cancelled — not an error
          return;
        }
        console.error("Debate stream error:", error);
        const message =
          error instanceof Error ? error.message : "Debate failed";
        setSessionError(message);
        showToast(message, "error");
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [
      portfolioData,
      startSession,
      setAgentThinking,
      setAgentStreaming,
      setAgentOutput,
      setAgentError,
      setFinalRecommendation,
      setSessionError,
      endSession,
      showToast,
    ]
  );

  /**
   * Handle an SSE event by dispatching to the agent store.
   */
  const handleEvent = React.useCallback(
    (event: DebateEvent) => {
      switch (event.type) {
        case "session_start":
          // Session already started in startDebate
          break;

        case "agent_start":
          setAgentThinking(event.agent);
          break;

        case "agent_end":
          setAgentOutput(event.agent, event.output as never, event.latencyMs);
          break;

        case "agent_error":
          setAgentError(event.agent, event.error);
          break;

        case "final":
          setFinalRecommendation(event.recommendation);
          // Persist recommendation to API
          persistRecommendation(event.recommendation);
          break;

        case "done":
          endSession();
          break;

        case "error":
          setSessionError(event.message);
          showToast(event.message, "error");
          break;
      }
    },
    [
      setAgentThinking,
      setAgentOutput,
      setAgentError,
      setFinalRecommendation,
      setSessionError,
      endSession,
      showToast,
    ]
  );

  /**
   * Persist recommendation to the API.
   */
  const persistRecommendation = async (recommendation: FinalRecommendation) => {
    try {
      await fetch("/api/recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: useAgentStore.getState().sessionId,
          decision: recommendation.decision,
          tokenSymbol: recommendation.tokenSymbol,
          tokenName: recommendation.tokenName,
          allocation: recommendation.allocation,
          confidence: recommendation.confidence,
          investmentThesis: recommendation.investmentThesis,
          supportingArguments: recommendation.supportingArguments,
          risks: recommendation.risks,
        }),
      });
    } catch (error) {
      console.error("Failed to persist recommendation:", error);
    }
  };

  /**
   * Stop the current debate (for Reset button).
   */
  const stopDebate = React.useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    endSession();
  }, [endSession]);

  /**
   * Reset the debate state completely.
   */
  const resetDebate = React.useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    setIsStreaming(false);
    reset();
  }, [reset]);

  return {
    isStreaming,
    startDebate,
    stopDebate,
    resetDebate,
  };
}
