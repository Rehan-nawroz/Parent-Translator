/** File, size, and quota limits shared by the UI and the server. */

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_UPLOAD_LABEL = "10 MB";
export const MAX_ANALYSES_PER_USER = 3;

export const SUPPORTED_EXTENSIONS = ["pdf", "docx", "png", "jpg", "jpeg", "txt"] as const;
export type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

export const MIME_TYPES_BY_EXTENSION: Record<SupportedExtension, readonly string[]> = {
  pdf: ["application/pdf"],
  docx: [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
  ],
  png: ["image/png"],
  jpg: ["image/jpeg"],
  jpeg: ["image/jpeg"],
  txt: ["text/plain"],
};

export const ACCEPTED_FILE_INPUT =
  ".pdf,.docx,.png,.jpg,.jpeg,.txt,application/pdf,image/png,image/jpeg,text/plain";

/** Extensions routed to Gemini vision instead of a local text extractor. */
export const IMAGE_EXTENSIONS: readonly SupportedExtension[] = ["png", "jpg", "jpeg"];

/** Upper bound on extracted characters sent to the model. */
export const MAX_SOURCE_CHARS = 60_000;

/** Maximum request body accepted by the analysis endpoint (file + form overhead). */
export const MAX_REQUEST_BYTES = MAX_UPLOAD_BYTES + 1024 * 1024;
