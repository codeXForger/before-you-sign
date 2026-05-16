import type { RiskLevel } from "@/lib/analysis-schema";

const LEVEL_COPY: Record<RiskLevel, { label: string; tone: string }> = {
  low: {
    label: "Low risk",
    tone: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:ring-emerald-900",
  },
  medium: {
    label: "Medium risk",
    tone: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900",
  },
  high: {
    label: "High risk",
    tone: "bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:ring-orange-900",
  },
  critical: {
    label: "Critical risk",
    tone: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-300 dark:ring-red-900",
  },
};

type Props = {
  score: number;
  level: RiskLevel;
};

export function ScoreCard({ score, level }: Props) {
  const copy = LEVEL_COPY[level];
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-center justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Overall risk score
          </div>
          <div className="mt-1 text-5xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
            {score}
            <span className="ml-1 text-2xl text-zinc-400 dark:text-zinc-500">
              /100
            </span>
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${copy.tone}`}
        >
          {copy.label}
        </span>
      </div>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-900">
        <div
          className={`h-full ${
            level === "critical"
              ? "bg-red-500"
              : level === "high"
              ? "bg-orange-500"
              : level === "medium"
              ? "bg-amber-500"
              : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">
        0 = broadly fair for the signer · 100 = do not sign
      </p>
    </div>
  );
}
