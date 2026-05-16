// Approximate Anthropic API pricing in USD per million tokens.
// Source: https://www.anthropic.com/pricing — verify before relying on these
// figures for billing. Last reviewed: 2026-05.
// Cache write tokens are billed at 1.25x base input; cache read at 0.10x.

export type Pricing = {
  /** USD per 1,000,000 input tokens (non-cached). */
  inputPerMTok: number;
  /** USD per 1,000,000 output tokens. */
  outputPerMTok: number;
};

const CACHE_WRITE_MULTIPLIER = 1.25;
const CACHE_READ_MULTIPLIER = 0.1;

export const PRICING: Record<string, Pricing> = {
  "claude-opus-4-7": { inputPerMTok: 15, outputPerMTok: 75 },
  "claude-opus-4-6": { inputPerMTok: 15, outputPerMTok: 75 },
  "claude-opus-4-5": { inputPerMTok: 15, outputPerMTok: 75 },
  "claude-sonnet-4-6": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-sonnet-4-5": { inputPerMTok: 3, outputPerMTok: 15 },
  "claude-haiku-4-5-20251001": { inputPerMTok: 1, outputPerMTok: 5 },
  "claude-3-5-haiku-latest": { inputPerMTok: 0.8, outputPerMTok: 4 },
};

export function getPricing(modelId: string): Pricing | null {
  return PRICING[modelId] ?? null;
}

export type Usage = {
  input_tokens: number;
  output_tokens: number;
  cache_creation_input_tokens?: number | null;
  cache_read_input_tokens?: number | null;
};

export type CostBreakdown = {
  total: number;
  input: number;
  output: number;
  cacheWrite: number;
  cacheRead: number;
  tokens: {
    input: number;
    output: number;
    cacheWrite: number;
    cacheRead: number;
  };
};

/** Exact cost from Anthropic usage data. */
export function computeCost(usage: Usage, modelId: string): CostBreakdown | null {
  const p = getPricing(modelId);
  if (!p) return null;

  const inputTok = usage.input_tokens ?? 0;
  const outputTok = usage.output_tokens ?? 0;
  const cacheWriteTok = usage.cache_creation_input_tokens ?? 0;
  const cacheReadTok = usage.cache_read_input_tokens ?? 0;

  const input = (inputTok / 1_000_000) * p.inputPerMTok;
  const output = (outputTok / 1_000_000) * p.outputPerMTok;
  const cacheWrite =
    (cacheWriteTok / 1_000_000) * p.inputPerMTok * CACHE_WRITE_MULTIPLIER;
  const cacheRead =
    (cacheReadTok / 1_000_000) * p.inputPerMTok * CACHE_READ_MULTIPLIER;

  return {
    total: input + output + cacheWrite + cacheRead,
    input,
    output,
    cacheWrite,
    cacheRead,
    tokens: {
      input: inputTok,
      output: outputTok,
      cacheWrite: cacheWriteTok,
      cacheRead: cacheReadTok,
    },
  };
}

export type CostEstimate = {
  min: number;
  max: number;
  midpoint: number;
};

const SYSTEM_PROMPT_TOKENS = 700; // approximate, recompute if prompts.ts changes
const OUTPUT_TOKENS_MIN = 800;
const OUTPUT_TOKENS_MAX = 3000;
// Claude bills native PDFs roughly per page (~1500-3000 tokens/page, combining
// extracted text and a per-page image). PDF pages average 50-150 KB. So input
// tokens per byte land roughly in this range — very rough since image-heavy
// PDFs sit at the low end and text-heavy contracts at the high end.
const BYTES_PER_TOKEN_LOW_DENSITY = 80;
const BYTES_PER_TOKEN_HIGH_DENSITY = 30;

/**
 * Pre-analysis cost estimate based purely on the uploaded PDF's size.
 * Returns a USD range that's intentionally wide — the real number depends on
 * how text-dense the PDF is.
 */
export function estimateCostFromFileSize(
  fileSizeBytes: number,
  modelId: string,
): CostEstimate | null {
  const p = getPricing(modelId);
  if (!p) return null;

  const inputTokensLow =
    SYSTEM_PROMPT_TOKENS + Math.floor(fileSizeBytes / BYTES_PER_TOKEN_LOW_DENSITY);
  const inputTokensHigh =
    SYSTEM_PROMPT_TOKENS +
    Math.floor(fileSizeBytes / BYTES_PER_TOKEN_HIGH_DENSITY);

  const min =
    (inputTokensLow / 1_000_000) * p.inputPerMTok +
    (OUTPUT_TOKENS_MIN / 1_000_000) * p.outputPerMTok;
  const max =
    (inputTokensHigh / 1_000_000) * p.inputPerMTok +
    (OUTPUT_TOKENS_MAX / 1_000_000) * p.outputPerMTok;

  return { min, max, midpoint: (min + max) / 2 };
}

/** Format USD cost. Uses 4 decimal places for sub-dollar amounts. */
export function formatUsd(amount: number): string {
  if (amount === 0) return "$0";
  if (amount < 0.01) return `$${amount.toFixed(4)}`;
  if (amount < 1) return `$${amount.toFixed(3)}`;
  return `$${amount.toFixed(2)}`;
}

export function formatUsdRange(estimate: CostEstimate): string {
  return `${formatUsd(estimate.min)} – ${formatUsd(estimate.max)}`;
}
