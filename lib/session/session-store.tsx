"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { buildTimeline, type TimelineEntry } from "./timeline";
import type { SessionDocument } from "./types";

export type SessionState = {
  documents: SessionDocument[];
  currentId: string | null;
};

export const EMPTY_SESSION_STATE: SessionState = { documents: [], currentId: null };

/** Appends a result, replaces an identical id, and makes the newest result current. */
export function addDocumentToSession(state: SessionState, document: SessionDocument): SessionState {
  return {
    documents: [...state.documents.filter((item) => item.id !== document.id), document],
    currentId: document.id,
  };
}

export function selectCurrentDocument(state: SessionState): SessionDocument | null {
  return (
    state.documents.find((document) => document.id === state.currentId) ??
    state.documents.at(-1) ??
    null
  );
}

export function clearSessionState(): SessionState {
  return { documents: [], currentId: null };
}

type SessionContextValue = {
  documents: SessionDocument[];
  currentDocument: SessionDocument | null;
  timeline: TimelineEntry[];
  addDocument: (document: SessionDocument) => void;
  setCurrentDocument: (id: string) => void;
  clearSession: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionState>(EMPTY_SESSION_STATE);

  const addDocument = useCallback((document: SessionDocument) => {
    setSession((current) => addDocumentToSession(current, document));
  }, []);

  const setCurrentDocument = useCallback((id: string) => {
    setSession((current) => ({ ...current, currentId: id }));
  }, []);

  const clearSession = useCallback(() => {
    setSession(clearSessionState());
  }, []);

  const currentDocument = useMemo(() => selectCurrentDocument(session), [session]);
  const timeline = useMemo(() => buildTimeline(session.documents), [session.documents]);

  const value = useMemo<SessionContextValue>(
    () => ({
      documents: session.documents,
      currentDocument,
      timeline,
      addDocument,
      setCurrentDocument,
      clearSession,
    }),
    [session.documents, currentDocument, timeline, addDocument, setCurrentDocument, clearSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
