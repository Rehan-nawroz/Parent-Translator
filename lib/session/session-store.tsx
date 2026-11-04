"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

import { buildTimeline, type TimelineEntry } from "./timeline";
import type { SessionDocument } from "./types";

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
  const [documents, setDocuments] = useState<SessionDocument[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);

  const addDocument = useCallback((document: SessionDocument) => {
    setDocuments((current) => [...current.filter((item) => item.id !== document.id), document]);
    setCurrentId(document.id);
  }, []);

  const setCurrentDocument = useCallback((id: string) => {
    setCurrentId(id);
  }, []);

  const clearSession = useCallback(() => {
    setDocuments([]);
    setCurrentId(null);
  }, []);

  const currentDocument = useMemo(
    () => documents.find((document) => document.id === currentId) ?? documents.at(-1) ?? null,
    [documents, currentId],
  );

  const timeline = useMemo(() => buildTimeline(documents), [documents]);

  const value = useMemo<SessionContextValue>(
    () => ({
      documents,
      currentDocument,
      timeline,
      addDocument,
      setCurrentDocument,
      clearSession,
    }),
    [documents, currentDocument, timeline, addDocument, setCurrentDocument, clearSession],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession must be used inside SessionProvider");
  return context;
}
