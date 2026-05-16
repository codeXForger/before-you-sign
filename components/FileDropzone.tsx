"use client";

import { useDropzone } from "react-dropzone";

const MAX_BYTES = 32 * 1024 * 1024;

type Props = {
  file: File | null;
  onChange: (file: File | null) => void;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export function FileDropzone({ file, onChange }: Props) {
  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      accept: { "application/pdf": [".pdf"] },
      maxFiles: 1,
      maxSize: MAX_BYTES,
      onDrop: (accepted) => {
        if (accepted[0]) onChange(accepted[0]);
      },
    });

  const rejection = fileRejections[0];

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Agreement (PDF)
        </span>
        {file && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            Remove
          </button>
        )}
      </div>
      <div
        {...getRootProps()}
        className={`mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 text-center transition ${
          isDragActive
            ? "border-zinc-500 bg-zinc-50 dark:border-zinc-300 dark:bg-zinc-900"
            : "border-zinc-300 hover:border-zinc-400 dark:border-zinc-700 dark:hover:border-zinc-600"
        }`}
      >
        <input {...getInputProps()} />
        {file ? (
          <div className="text-sm text-zinc-700 dark:text-zinc-200">
            <div className="font-medium">{file.name}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatBytes(file.size)}
            </div>
            <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
              Drop another file to replace.
            </div>
          </div>
        ) : (
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            <p className="font-medium text-zinc-800 dark:text-zinc-200">
              Drop a PDF here or click to select
            </p>
            <p className="mt-1 text-xs">Max 32 MB / 100 pages. Sent directly to Claude — nothing is stored on the server.</p>
          </div>
        )}
      </div>
      {rejection && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          {rejection.errors[0]?.message ?? "File rejected."}
        </p>
      )}
    </div>
  );
}
