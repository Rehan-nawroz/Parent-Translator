"use client";

import { FileText, Upload, X } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";

import { ACCEPTED_FILE_INPUT, MAX_UPLOAD_LABEL } from "@/lib/config/limits";
import { cn } from "@/lib/utils/cn";
import { formatFileSize } from "@/lib/utils/text";

export function FilePicker({
  file,
  onFile,
  disabled,
}: {
  file: File | null;
  onFile: (file: File | null) => void;
  disabled?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (disabled) return;
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFile(dropped);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_FILE_INPUT}
        className="sr-only"
        disabled={disabled}
        aria-label="Choose a school document"
        onChange={(event) => {
          const selected = event.target.files?.[0];
          if (selected) onFile(selected);
        }}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-crimson/30 bg-crimson/5 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-crimson/15 text-crimson">
            <FileText className="h-5 w-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{file.name}</p>
            <p className="mt-0.5 text-xs text-muted">
              {formatFileSize(file.size)} · used for this request only
            </p>
          </div>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted transition hover:bg-white/5 hover:text-white"
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(event) => {
            event.preventDefault();
            if (!disabled) setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-9 text-center transition",
            dragging ? "border-crimson bg-crimson/10" : "border-line-strong bg-ink/40",
          )}
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-crimson/25 bg-crimson/10 text-crimson">
            <Upload className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="mt-3 text-sm font-medium text-white">Drag a document here</p>
          <p className="mt-1 text-xs text-muted">
            PDF, DOCX, PNG, JPG, or TXT · up to {MAX_UPLOAD_LABEL}
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className="mt-4 min-h-10 rounded-lg border border-line-strong bg-obsidian px-4 text-sm font-semibold text-white transition hover:border-crimson/50 hover:bg-elevated disabled:opacity-50"
          >
            Choose a file
          </button>
        </div>
      )}
    </div>
  );
}
