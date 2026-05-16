import type { RiskItem as RiskItemType } from "@/lib/analysis-schema";

type Props = {
  item: RiskItemType;
  index: number;
};

export function RiskItem({ item, index }: Props) {
  return (
    <li className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex items-baseline justify-between gap-4">
        <h4 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">
          {index}. {item.title}
        </h4>
        <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
          {item.section_reference}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
        {item.description}
      </p>
      <blockquote className="mt-3 border-l-2 border-zinc-300 bg-zinc-50 px-3 py-2 text-sm italic text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
        “{item.quote}”
      </blockquote>
      <p className="mt-3 text-sm text-zinc-800 dark:text-zinc-200">
        <span className="font-semibold">Negotiation point: </span>
        {item.negotiation_point}
      </p>
    </li>
  );
}
