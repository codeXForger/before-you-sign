import type { RiskItem as RiskItemType, Severity } from "@/lib/analysis-schema";
import { RiskItem } from "./RiskItem";

const SEVERITY_ORDER: Severity[] = ["critical", "high", "medium", "low"];

const SEVERITY_HEADER: Record<
  Severity,
  { label: string; ring: string; dot: string }
> = {
  critical: {
    label: "Critical",
    ring: "ring-red-200 dark:ring-red-900",
    dot: "bg-red-500",
  },
  high: {
    label: "High",
    ring: "ring-orange-200 dark:ring-orange-900",
    dot: "bg-orange-500",
  },
  medium: {
    label: "Medium",
    ring: "ring-amber-200 dark:ring-amber-900",
    dot: "bg-amber-500",
  },
  low: {
    label: "Low",
    ring: "ring-emerald-200 dark:ring-emerald-900",
    dot: "bg-emerald-500",
  },
};

type Props = {
  risks: RiskItemType[];
};

export function RiskList({ risks }: Props) {
  const grouped: Record<Severity, RiskItemType[]> = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };
  for (const r of risks) grouped[r.severity].push(r);

  if (risks.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-6 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        No notable risks were identified.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {SEVERITY_ORDER.map((sev) => {
        const items = grouped[sev];
        if (items.length === 0) return null;
        const header = SEVERITY_HEADER[sev];
        return (
          <section key={sev}>
            <div className="mb-3 flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${header.dot}`} />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-700 dark:text-zinc-200">
                {header.label}
              </h3>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {items.length} {items.length === 1 ? "finding" : "findings"}
              </span>
            </div>
            <ul className="space-y-3">
              {items.map((r, i) => (
                <RiskItem key={`${sev}-${i}`} item={r} index={i + 1} />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
