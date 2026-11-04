import { describe, expect, it } from "vitest";

import { buildTimeline } from "@/lib/session/timeline";
import type { SessionDocument } from "@/lib/session/types";

import { makeAnalysis, sampleCitation } from "../helpers/analysis";

function sessionDocument(id: string, analysis: SessionDocument["analysis"]): SessionDocument {
  return {
    id,
    displayName: `${id}.txt`,
    language: "en",
    analyzedAt: "2026-01-01T00:00:00.000Z",
    analysis,
  };
}

const actionWithoutDeadline = {
  action: "Ask the teacher for the reading plan.",
  dueDate: null,
  dueDateDisplay: null,
  responsibleParty: null,
  status: "no_deadline_found" as const,
  citations: [sampleCitation],
};

describe("buildTimeline", () => {
  it("sorts exact dates chronologically and keeps unclear dates off the calendar", () => {
    const analysis = makeAnalysis({
      deadlines: [
        {
          title: "Second",
          date: "2026-04-01",
          dateDisplay: "April 1, 2026",
          sourceDocumentName: "a.txt",
          sourceReference: sampleCitation,
          dateKind: "exact",
        },
        {
          title: "First",
          date: "2026-03-01",
          dateDisplay: "March 1, 2026",
          sourceDocumentName: "a.txt",
          sourceReference: sampleCitation,
          dateKind: "exact",
        },
        {
          title: "By Friday",
          date: null,
          dateDisplay: "by Friday",
          sourceDocumentName: "a.txt",
          sourceReference: sampleCitation,
          dateKind: "unclear",
        },
      ],
      whatYouNeedToDo: { actions: [actionWithoutDeadline], citations: [sampleCitation] },
    });

    const entries = buildTimeline([sessionDocument("a", analysis)]);

    expect(entries.slice(0, 2).map((entry) => entry.title)).toEqual(["First", "Second"]);

    const unclear = entries.find((entry) => entry.title === "By Friday");
    expect(unclear?.date).toBeNull();
    expect(unclear?.dateDisplay).toBe("by Friday");
    expect(entries.some((entry) => entry.title === actionWithoutDeadline.action)).toBe(true);
  });

  it("does not merge the same deadline from two different documents", () => {
    const entries = buildTimeline([
      sessionDocument("a", makeAnalysis()),
      sessionDocument("b", makeAnalysis()),
    ]);

    expect(entries).toHaveLength(2);
    expect(new Set(entries.map((entry) => entry.documentId))).toEqual(new Set(["a", "b"]));
  });

  it("deduplicates identical entries within one document", () => {
    const deadline = makeAnalysis().deadlines[0];
    if (!deadline) throw new Error("fixture is missing a deadline");

    const doubled = makeAnalysis({
      deadlines: [deadline, { ...deadline }],
      whatYouNeedToDo: { actions: [], citations: [] },
    });

    expect(buildTimeline([sessionDocument("a", doubled)])).toHaveLength(1);
  });

  it("preserves the source document name on every entry", () => {
    const entries = buildTimeline([sessionDocument("a", makeAnalysis())]);
    expect(entries[0]?.documentName).toBe("notice.txt");
  });

  it("keeps the document language so dates can be localized", () => {
    const arabic = { ...sessionDocument("a", makeAnalysis()), language: "ar" as const };
    expect(buildTimeline([arabic])[0]?.language).toBe("ar");
  });

  it("keeps an action whose deadline was not stated", () => {
    const analysis = makeAnalysis({
      deadlines: [],
      whatYouNeedToDo: { actions: [actionWithoutDeadline], citations: [sampleCitation] },
    });

    const entries = buildTimeline([sessionDocument("a", analysis)]);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.date).toBeNull();
    expect(entries[0]?.hasStatedDeadline).toBe(false);
  });
});
