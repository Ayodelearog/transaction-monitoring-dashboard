"use client";

import { useCallback, useRef, useState } from "react";
import { streamAlertText } from "@/lib/api/alerts";
import { ApiError } from "@/lib/api/client";

interface StreamingState {
  text: string;
  isStreaming: boolean;
  error: string | null;
  /** True once a generation has completed at least once. */
  done: boolean;
}

/**
 * Drives a one-shot server text stream (AI Gateway → Claude) for a given POST
 * endpoint, exposing the incrementally-built text and lifecycle flags.
 */
export function useStreamingGeneration(path: string, initialText = "") {
  const [state, setState] = useState<StreamingState>({
    text: initialText,
    isStreaming: false,
    error: null,
    done: false,
  });
  const abortRef = useRef<AbortController | null>(null);

  const start = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setState({ text: "", isStreaming: true, error: null, done: false });
    try {
      const full = await streamAlertText(
        path,
        (text) => setState((s) => ({ ...s, text })),
        controller.signal,
      );
      setState({ text: full, isStreaming: false, error: null, done: true });
    } catch (err) {
      if (controller.signal.aborted) return;
      const message =
        err instanceof ApiError ? err.message : "Generation failed. Please try again.";
      setState((s) => ({ ...s, isStreaming: false, error: message }));
    }
  }, [path]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ text: "", isStreaming: false, error: null, done: false });
  }, []);

  const setText = useCallback((text: string) => {
    setState((s) => ({ ...s, text }));
  }, []);

  return { ...state, start, reset, setText };
}
