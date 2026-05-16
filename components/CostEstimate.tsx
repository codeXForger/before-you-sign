"use client";

import { useMemo } from "react";
import {
  estimateCostFromFileSize,
  formatUsd,
  formatUsdRange,
} from "@/lib/pricing";
import { MODELS } from "@/lib/models";

type Props = {
  file: File | null;
  modelId: string;
};

export function CostEstimate({ file, modelId }: Props) {
  const estimate = useMemo(() => {
    if (!file) return null;
    return estimateCostFromFileSize(file.size, modelId);
  }, [file, modelId]);

  const modelLabel = MODELS.find((m) => m.id === modelId)?.label ?? modelId;

  if (!file) {
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        Add a PDF to see an estimated cost for this scan.
      </div>
    );
  }

  if (!estimate) {
    return (
      <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900/40 dark:text-zinc-400">
        No pricing data for this model. The analysis will still run on your key.
      </div>
    );
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Estimated cost
        </span>
        <span className="text-sm font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
          {formatUsdRange(estimate)}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Approx. for one scan of this {(file.size / 1024).toFixed(0)} KB file on{" "}
        <span className="font-medium">{modelLabel}</span> — midpoint{" "}
        {formatUsd(estimate.midpoint)}. Real cost depends on how text-dense the
        PDF is and how long the model's response is. Billed to your Anthropic
        account.
      </p>
    </div>
  );
}
