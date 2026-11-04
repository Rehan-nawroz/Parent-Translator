import { describe, expect, it } from "vitest";

import {
  addDocumentToSession,
  clearSessionState,
  EMPTY_SESSION_STATE,
  selectCurrentDocument,
} from "@/lib/session/session-store";
import type { SessionDocument } from "@/lib/session/types";

import { makeAnalysis } from "../helpers/analysis";

function makeDocument(id: string): SessionDocument {
  return {
    id,
    displayName: `${id}.txt`,
    language: "en",
    analysis: makeAnalysis(),
    analyzedAt: `2026-03-0${id.length}T00:00:00.000Z`,
  };
}

describe("session state", () => {
  it("appends a second document without overwriting the first", () => {
    const first = makeDocument("one");
    const second = makeDocument("two");

    const withFirst = addDocumentToSession(EMPTY_SESSION_STATE, first);
    const withSecond = addDocumentToSession(withFirst, second);

    expect(withSecond.documents.map((document) => document.id)).toEqual(["one", "two"]);
    expect(withSecond.currentId).toBe("two");
    expect(selectCurrentDocument(withSecond)?.id).toBe("two");
  });

  it("replaces an identical document id instead of duplicating it", () => {
    const first = makeDocument("one");
    const replacement = { ...first, displayName: "replacement.txt" };

    const state = addDocumentToSession(
      addDocumentToSession(EMPTY_SESSION_STATE, first),
      replacement,
    );

    expect(state.documents).toHaveLength(1);
    expect(state.documents[0]?.displayName).toBe("replacement.txt");
  });

  it("falls back to the latest document when the current id is stale", () => {
    const withFirst = addDocumentToSession(EMPTY_SESSION_STATE, makeDocument("one"));
    const stale = { ...withFirst, currentId: "missing" };

    expect(selectCurrentDocument(stale)?.id).toBe("one");
    expect(selectCurrentDocument(EMPTY_SESSION_STATE)).toBeNull();
  });

  it("clears documents and the current selection", () => {
    const state = addDocumentToSession(
      addDocumentToSession(EMPTY_SESSION_STATE, makeDocument("one")),
      makeDocument("two"),
    );

    expect(clearSessionState()).toEqual({ documents: [], currentId: null });
    expect(state.documents).toHaveLength(2);
  });
});
