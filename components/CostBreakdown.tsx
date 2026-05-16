import { computeCost, formatUsd, type Usage } from "@/lib/pricing";
import { MODELS } from "@/lib/models";

type Props = {
  usage: Usage;
  modelId: string;
};

function formatTokens(n: number): string {
  return n.toLocaleString();
}

export function CostBreakdown({ usage, modelId }: Props) {
  const cost = computeCost(usage, modelId);
  const modelLabel = MODELS.find((m) => m.id === modelId)?.label ?? modelId;

  if (!cost) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white p-5 text-sm text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-400">
        Pricing not available for {modelLabel}. Tokens used:{" "}
        {formatTokens(usage.input_tokens + usage.output_tokens)}.
      </div>
    );
  }

  const rows: { label: string; tokens: number; cost: number }[] = [
    { label: "Input", tokens: cost.tokens.input, cost: cost.input },
    { label: "Output", tokens: cost.tokens.output, cost: cost.output },
  ];
  if (cost.tokens.cacheWrite > 0) {
    rows.push({
      label: "Cache write",
      tokens: cost.tokens.cacheWrite,
      cost: cost.cacheWrite,
    });
  }
  if (cost.tokens.cacheRead > 0) {
    rows.push({
      label: "Cache read",
      tokens: cost.tokens.cacheRead,
      cost: cost.cacheRead,
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Cost for this scan
        </h3>
        <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-50">
          {formatUsd(cost.total)}
        </span>
      </div>
      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        Billed to your Anthropic account on {modelLabel}.
      </p>
      <table className="mt-4 w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            <th className="pb-2 font-medium">Type</th>
            <th className="pb-2 text-right font-medium">Tokens</th>
            <th className="pb-2 text-right font-medium">Cost</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.label}
              className="border-t border-zinc-100 dark:border-zinc-900"
            >
              <td className="py-2 text-zinc-700 dark:text-zinc-300">
                {r.label}
              </td>
              <td className="py-2 text-right tabular-nums text-zinc-700 dark:text-zinc-300">
                {formatTokens(r.tokens)}
              </td>
              <td className="py-2 text-right tabular-nums text-zinc-900 dark:text-zinc-100">
                {formatUsd(r.cost)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
