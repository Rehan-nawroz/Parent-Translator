import {
  MAX_UPLOAD_BYTES,
  MIME_TYPES_BY_EXTENSION,
  SUPPORTED_EXTENSIONS,
  type SupportedExtension,
} from "@/lib/config/limits";
import type { ErrorCode } from "@/lib/contracts/errors";
import { sanitizeDisplayName } from "@/lib/utils/text";

export type ValidatedUpload = {
  displayName: string;
  extension: SupportedExtension;
  mimeType: string;
  size: number;
  bytes: Uint8Array;
};

export type UploadValidationResult =
  { ok: true; upload: ValidatedUpload } | { ok: false; code: ErrorCode };

const PDF_SIGNATURE = [0x25, 0x50, 0x44, 0x46, 0x2d];
const ZIP_SIGNATURE = [0x50, 0x4b, 0x03, 0x04];
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const JPEG_SIGNATURE = [0xff, 0xd8, 0xff];

function startsWith(bytes: Uint8Array, signature: readonly number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((value, index) => bytes[index] === value);
}

function extensionOf(name: string): SupportedExtension | null {
  const match = /\.([a-z0-9]+)$/i.exec(name.trim());
  if (!match?.[1]) return null;
  const extension = match[1].toLowerCase();
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)
    ? (extension as SupportedExtension)
    : null;
}

function looksLikeUtf8Text(bytes: Uint8Array): boolean {
  if (bytes.includes(0)) return false;
  try {
    new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return true;
  } catch {
    return false;
  }
}

function signatureMatches(extension: SupportedExtension, bytes: Uint8Array): boolean {
  switch (extension) {
    case "pdf":
      return startsWith(bytes, PDF_SIGNATURE);
    case "docx":
      return startsWith(bytes, ZIP_SIGNATURE);
    case "png":
      return startsWith(bytes, PNG_SIGNATURE);
    case "jpg":
    case "jpeg":
      return startsWith(bytes, JPEG_SIGNATURE);
    case "txt":
      return looksLikeUtf8Text(bytes);
  }
}

/**
 * Validates presence, size, extension, declared MIME type, the actual file signature, and
 * obviously empty content. The client-declared MIME type is never trusted on its own.
 */
export async function validateUpload(
  file: File | null,
  options: { maxBytes?: number } = {},
): Promise<UploadValidationResult> {
  if (!file) return { ok: false, code: "MISSING_FILE" };

  const maxBytes = options.maxBytes ?? MAX_UPLOAD_BYTES;
  if (file.size === 0) return { ok: false, code: "EMPTY_FILE" };
  if (file.size > maxBytes) return { ok: false, code: "FILE_TOO_LARGE" };

  const extension = extensionOf(file.name);
  if (!extension) return { ok: false, code: "UNSUPPORTED_FILE" };

  const declaredMime = (file.type || "").toLowerCase();
  const acceptedMimes = MIME_TYPES_BY_EXTENSION[extension] as readonly string[];
  if (declaredMime && declaredMime !== "application/octet-stream") {
    if (!acceptedMimes.includes(declaredMime)) return { ok: false, code: "UNSUPPORTED_FILE" };
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await file.arrayBuffer());
  } catch {
    return { ok: false, code: "EMPTY_FILE" };
  }

  if (bytes.byteLength === 0) return { ok: false, code: "EMPTY_FILE" };
  if (bytes.byteLength > maxBytes) return { ok: false, code: "FILE_TOO_LARGE" };

  if (!signatureMatches(extension, bytes)) {
    return {
      ok: false,
      code: extension === "txt" ? "DOCUMENT_UNREADABLE" : "UNSUPPORTED_FILE",
    };
  }

  if (extension === "txt") {
    const text = new TextDecoder("utf-8").decode(bytes).trim();
    if (text.length === 0) return { ok: false, code: "EMPTY_FILE" };
  }

  return {
    ok: true,
    upload: {
      displayName: sanitizeDisplayName(file.name),
      extension,
      mimeType: file.type || acceptedMimes[0] || "application/octet-stream",
      size: bytes.byteLength,
      bytes,
    },
  };
}
