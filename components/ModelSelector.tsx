"use client";

import { MODELS } from "@/lib/models";

type Props = {
  value: string;
  onChange: (id: string) => void;
};

export function ModelSelector({ value, onChange }: Props) {
  const selected = MODELS.find((m) => m.id === value);
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <label
        htmlFor="model"
        className="text-sm font-medium text-zinc-900 dark:text-zinc-100"
      >
        Model
      </label>
      <select
        id="model"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-2 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
      >
        <optgroup label="Opus">
          {MODELS.filter((m) => m.tier === "opus").map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Sonnet">
          {MODELS.filter((m) => m.tier === "sonnet").map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </optgroup>
        <optgroup label="Haiku">
          {MODELS.filter((m) => m.tier === "haiku").map((m) => (
            <option key={m.id} value={m.id}>
              {m.label}
            </option>
          ))}
        </optgroup>
      </select>
      {selected && (
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {selected.description}
        </p>
      )}
    </div>
  );
}
