import { describe, expect, it } from "vitest";

import { disposeSource } from "@/lib/documents/cleanup";
import { extractDocument } from "@/lib/documents/extract";
import { countUngroundedCitations } from "@/lib/documents/source-references";
import type { SourceDocument } from "@/lib/documents/types";
import { validateUpload } from "@/lib/documents/validate-upload";

import { makeAnalysis, SAMPLE_QUOTE } from "../helpers/analysis";
import { buildDocx } from "../helpers/docx";
import { buildTextPdf } from "../helpers/pdf";

const PNG_1X1 = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy.buffer;
}

function makeFile(bytes: Uint8Array, name: string, type: string): File {
  return new File([toArrayBuffer(bytes)], name, { type });
}

function textSource(text: string): SourceDocument {
  return {
    displayName: "notice.txt",
    extension: "txt",
    mimeType: "text/plain",
    kind: "text",
    pages: [{ pageNumber: 1, text }],
    text,
    bytes: null,
    pageCount: 1,
    charCount: text.length,
  };
}

describe("validateUpload", () => {
  it("rejects missing, empty, unsupported, and oversized files", async () => {
    expect(await validateUpload(null)).toEqual({ ok: false, code: "MISSING_FILE" });
    expect(await validateUpload(makeFile(new Uint8Array(), "empty.txt", "text/plain"))).toEqual({
      ok: false,
      code: "EMPTY_FILE",
    });
    expect(
      await validateUpload(
        makeFile(new TextEncoder().encode("hello"), "notes.exe", "application/octet-stream"),
      ),
    ).toEqual({ ok: false, code: "UNSUPPORTED_FILE" });
    expect(
      await validateUpload(makeFile(new TextEncoder().encode("hello"), "notes.txt", "text/plain"), {
        maxBytes: 4,
      }),
    ).toEqual({ ok: false, code: "FILE_TOO_LARGE" });
  });

  it("rejects a file whose content does not match its extension", async () => {
    expect(
      await validateUpload(
        makeFile(new TextEncoder().encode("not a pdf"), "fake.pdf", "application/pdf"),
      ),
    ).toEqual({ ok: false, code: "UNSUPPORTED_FILE" });
  });

  it("accepts a text file and sanitizes the display name", async () => {
    const result = await validateUpload(
      makeFile(new TextEncoder().encode("Hello school"), "teacher email.txt", "text/plain"),
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.upload.extension).toBe("txt");
    expect(result.upload.displayName).toBe("teacher email.txt");
  });
});

describe("extractDocument", () => {
  it("extracts a two-page text PDF and keeps page boundaries", async () => {
    const validation = await validateUpload(
      makeFile(
        buildTextPdf([["Page one line", "Page one second"], ["Page two line"]]),
        "report.pdf",
        "application/pdf",
      ),
    );
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const extraction = await extractDocument(validation.upload);
    expect(extraction.ok).toBe(true);
    if (!extraction.ok) return;

    expect(extraction.document.kind).toBe("text");
    expect(extraction.document.pages).toHaveLength(2);
    expect(extraction.document.pages[0]?.text).toContain("Page one line");
    expect(extraction.document.pages[1]?.text).toContain("Page two line");

    disposeSource(extraction.document);
  });

  it("extracts DOCX paragraphs", async () => {
    const bytes = await buildDocx(["School notice", "The meeting is on March 12, 2026."]);
    const validation = await validateUpload(
      makeFile(
        bytes,
        "notice.docx",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ),
    );
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const extraction = await extractDocument(validation.upload);
    expect(extraction.ok).toBe(true);
    if (!extraction.ok) return;

    expect(extraction.document.text).toContain("School notice");
    expect(extraction.document.text).toContain("March 12, 2026");
  });

  it("routes a PDF with no text layer to the vision path", async () => {
    const validation = await validateUpload(
      makeFile(buildTextPdf([["x"]]), "scan.pdf", "application/pdf"),
    );
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const extraction = await extractDocument(validation.upload);
    expect(extraction.ok).toBe(true);
    if (!extraction.ok) return;

    expect(extraction.document.kind).toBe("vision");
    expect(extraction.document.bytes).not.toBeNull();
  });

  it("routes images to the vision path", async () => {
    const validation = await validateUpload(makeFile(PNG_1X1, "scan.png", "image/png"));
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const extraction = await extractDocument(validation.upload);
    expect(extraction.ok).toBe(true);
    if (!extraction.ok) return;

    expect(extraction.document.kind).toBe("vision");
    expect(extraction.document.pageCount).toBe(1);
  });

  it("returns a typed failure for a corrupt PDF", async () => {
    const validation = await validateUpload(
      makeFile(new TextEncoder().encode("%PDF-1.4 broken"), "broken.pdf", "application/pdf"),
    );
    expect(validation.ok).toBe(true);
    if (!validation.ok) return;

    const extraction = await extractDocument(validation.upload);
    expect(extraction.ok).toBe(false);
    if (extraction.ok) return;
    expect(extraction.code).toBe("DOCUMENT_UNREADABLE");
  });
});

describe("cleanup", () => {
  it("clears bytes, pages, and text after a request", () => {
    const source = textSource("Some text");
    const vision: SourceDocument = {
      ...source,
      kind: "vision",
      pages: [],
      text: "",
      bytes: new Uint8Array([1, 2, 3]),
      pageCount: 1,
      charCount: 0,
    };

    disposeSource(vision);
    expect(vision.bytes).toBeNull();

    disposeSource(source);
    expect(source.pages).toHaveLength(0);
    expect(source.text).toBe("");
    expect(source.charCount).toBe(0);
  });
});

describe("citation grounding", () => {
  it("accepts citations whose quote exists in the source text", () => {
    expect(countUngroundedCitations(makeAnalysis(), textSource(SAMPLE_QUOTE))).toBe(0);
  });

  it("counts citations that cannot be found in the source", () => {
    const analysis = makeAnalysis({
      whatThisSays: {
        summary: "Something unsupported.",
        citations: [
          { page: 1, section: null, sourceLabel: "Test", quote: "A quote that never appears." },
        ],
      },
    });

    expect(countUngroundedCitations(analysis, textSource(SAMPLE_QUOTE))).toBeGreaterThan(0);
  });
});
