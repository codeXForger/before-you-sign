type Props = {
  summary: string;
};

export function SummaryPanel({ summary }: Props) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <h2 className="text-sm font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
        Summary
      </h2>
      <p className="mt-2 leading-relaxed text-zinc-800 dark:text-zinc-200">
        {summary}
      </p>
    </div>
  );
}
