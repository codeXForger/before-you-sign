"use client";

import type { Analysis } from "@/lib/analysis-schema";
import type { Usage } from "@/lib/pricing";
import { buildMarkdownReport } from "@/lib/markdown-export";
import { buildPdfReport } from "@/lib/pdf-export";

type Props = {
  analysis: Analysis;
  filename: string;
  model: string;
  usage: Usage;
};

function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function baseName(filename: string): string {
  return filename.replace(/\.pdf$/i, "") || "agreement";
}

export function ExportButtons({ analysis, filename, model, usage }: Props) {
  const stem = baseName(filename);

  function handleMarkdown() {
    const md = buildMarkdownReport(analysis, {
      filename,
      model,
      generatedAt: new Date(),
      usage,
    });
    downloadBlob(
      new Blob([md], { type: "text/markdown;charset=utf-8" }),
      `${stem}.risk-analysis.md`,
    );
  }

  function handlePdf() {
    const blob = buildPdfReport(analysis, {
      filename,
      model,
      generatedAt: new Date(),
      usage,
    });
    downloadBlob(blob, `${stem}.risk-analysis.pdf`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleMarkdown}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Download Markdown
      </button>
      <button
        type="button"
        onClick={handlePdf}
        className="rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
      >
        Download PDF
      </button>
    </div>
  );
}
