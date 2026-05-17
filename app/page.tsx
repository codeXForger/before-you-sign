"use client";

import { useState } from "react";
import { ApiKeyInput } from "@/components/ApiKeyInput";
import { ModelSelector } from "@/components/ModelSelector";
import { FileDropzone } from "@/components/FileDropzone";
import { ScoreCard } from "@/components/ScoreCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { RiskList } from "@/components/RiskList";
import { ExportButtons } from "@/components/ExportButtons";
import { CostEstimate } from "@/components/CostEstimate";
import { CostBreakdown } from "@/components/CostBreakdown";
import { DEFAULT_MODEL_ID } from "@/lib/models";
import type { Analysis } from "@/lib/analysis-schema";
import type { Usage } from "@/lib/pricing";

type AnalyzeResponse = {
  analysis: Analysis;
  meta: {
    model: string;
    fileSize: number;
    usage: Usage;
  };
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState(DEFAULT_MODEL_ID);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  const canAnalyze = !!apiKey && !!file && !loading;

  async function handleAnalyze() {
    if (!apiKey || !file) return;
    setError(null);
    setResult(null);
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("model", model);
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}` },
        body: form,
      });
      const data: { error?: string } & Partial<AnalyzeResponse> =
        await res.json();
      if (!res.ok) {
        setError(data.error ?? `Request failed with status ${res.status}.`);
        return;
      }
      if (!data.analysis || !data.meta) {
        setError("Malformed response from server.");
        return;
      }
      setResult({ analysis: data.analysis, meta: data.meta });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unexpected error during analysis.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-16">
      <header className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Before You Sign
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Upload an agreement, pick a Claude model, and get a structured risk
          analysis — overall score, plain-English summary, and findings grouped
          by severity with section references. Bring your own API key. Nothing
          you upload is stored.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <ApiKeyInput value={apiKey} onChange={setApiKey} />
        <ModelSelector value={model} onChange={setModel} />
      </section>

      <FileDropzone file={file} onChange={setFile} />

      <CostEstimate file={file} modelId={model} />

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
        >
          {loading ? "Analyzing…" : "Analyze agreement"}
        </button>
        {!apiKey && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Paste your API key to enable.
          </span>
        )}
        {apiKey && !file && (
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            Add a PDF to enable.
          </span>
        )}
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
          {error}
        </div>
      )}

      {result && (
        <section className="space-y-6">
          <ScoreCard
            score={result.analysis.overall_score}
            level={result.analysis.risk_level}
          />
          <SummaryPanel summary={result.analysis.summary} />
          <RiskList risks={result.analysis.risks} />
          <CostBreakdown
            usage={result.meta.usage}
            modelId={result.meta.model}
          />
          <div className="flex items-center justify-between gap-4 border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {formatBytes(result.meta.fileSize)} · {result.meta.model}
            </span>
            <ExportButtons
              analysis={result.analysis}
              filename={file?.name ?? "agreement.pdf"}
              model={result.meta.model}
              usage={result.meta.usage}
            />
          </div>
        </section>
      )}

      <footer className="mt-auto border-t border-zinc-200 pt-6 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
        <p>
          Not legal advice. Always consult a qualified lawyer for important
          agreements. Open source ·{" "}
          <a
            href="https://github.com/codeXForger/before-you-sign"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-zinc-900 dark:hover:text-zinc-200"
          >
            GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}
