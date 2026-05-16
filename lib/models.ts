export type ModelTier = "opus" | "sonnet" | "haiku";

export type ModelOption = {
  id: string;
  label: string;
  tier: ModelTier;
  description: string;
};

export const MODELS: ModelOption[] = [
  {
    id: "claude-opus-4-7",
    label: "Opus 4.7",
    tier: "opus",
    description: "Most capable. Best for nuanced legal risk analysis.",
  },
  {
    id: "claude-opus-4-6",
    label: "Opus 4.6",
    tier: "opus",
    description: "Previous Opus generation.",
  },
  {
    id: "claude-opus-4-5",
    label: "Opus 4.5",
    tier: "opus",
    description: "Older Opus.",
  },
  {
    id: "claude-sonnet-4-6",
    label: "Sonnet 4.6",
    tier: "sonnet",
    description: "Balanced cost and quality.",
  },
  {
    id: "claude-sonnet-4-5",
    label: "Sonnet 4.5",
    tier: "sonnet",
    description: "Older Sonnet.",
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Haiku 4.5",
    tier: "haiku",
    description: "Fastest and cheapest current model.",
  },
  {
    id: "claude-3-5-haiku-latest",
    label: "Haiku 3.5",
    tier: "haiku",
    description: "Older Haiku, very cheap.",
  },
];

export const DEFAULT_MODEL_ID = "claude-opus-4-5";

export function isValidModelId(id: string): boolean {
  return MODELS.some((m) => m.id === id);
}
