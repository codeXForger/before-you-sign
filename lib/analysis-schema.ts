import { z } from "zod";

const SEVERITIES = ["critical", "high", "medium", "low"] as const;
export type Severity = (typeof SEVERITIES)[number];

const RISK_LEVELS = ["low", "medium", "high", "critical"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

// Accept any reasonable variant (uppercase, "MEDIUM", "Medium", whitespace) and
// normalize to lowercase. The model sometimes deviates from the enum.
const severityLoose = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim().toLowerCase())
  .pipe(z.enum(SEVERITIES));

const riskLevelLoose = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim().toLowerCase())
  .pipe(z.enum(RISK_LEVELS));

const nonEmptyString = z
  .union([z.string(), z.number()])
  .transform((v) => String(v).trim())
  .pipe(z.string().min(1));

export const riskItemSchema = z.object({
  severity: severityLoose,
  title: nonEmptyString,
  description: nonEmptyString,
  section_reference: nonEmptyString,
  quote: nonEmptyString,
  negotiation_point: nonEmptyString,
});
export type RiskItem = z.infer<typeof riskItemSchema>;

// overall_score may come back as a float (e.g. 72.5) or a string ("72"). Clamp
// and round it. risks may be missing entirely if the model finds nothing.
export const analysisSchema = z.object({
  overall_score: z
    .union([z.number(), z.string()])
    .transform((v) => {
      const n = typeof v === "string" ? parseFloat(v) : v;
      if (!Number.isFinite(n)) return 0;
      return Math.max(0, Math.min(100, Math.round(n)));
    }),
  risk_level: riskLevelLoose,
  summary: nonEmptyString,
  risks: z.array(riskItemSchema).default([]),
});
export type Analysis = z.infer<typeof analysisSchema>;

// JSON Schema used as Anthropic tool input_schema. Kept in sync with the zod
// schema above by hand — zod v4 JSON-schema export is not relied upon to avoid
// extra dependencies.
export const analysisJsonSchema = {
  type: "object" as const,
  properties: {
    overall_score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
      description:
        "Calibrated overall risk score. 0 = safe for the signer, 100 = do-not-sign.",
    },
    risk_level: {
      type: "string",
      enum: ["low", "medium", "high", "critical"],
      description:
        "Overall risk band. Use 'low' for 0-24, 'medium' for 25-49, 'high' for 50-74, 'critical' for 75-100.",
    },
    summary: {
      type: "string",
      description:
        "2-3 sentence plain-English overview of what this agreement is and the most important things the signer should know.",
    },
    risks: {
      type: "array",
      description: "All notable risks found in the document, in any order.",
      items: {
        type: "object",
        properties: {
          severity: {
            type: "string",
            enum: ["critical", "high", "medium", "low"],
          },
          title: {
            type: "string",
            description: "Short label, e.g. 'Auto-renewal without notice'.",
          },
          description: {
            type: "string",
            description:
              "What the clause says and why it is risky for the signer.",
          },
          section_reference: {
            type: "string",
            description:
              "The section or clause identifier from the document, e.g. 'Section 3.2' or 'Clause 8(b)'. If the document has no numbering, use the nearest heading verbatim.",
          },
          quote: {
            type: "string",
            description:
              "Exact verbatim text from the document that the risk is based on. Do not paraphrase.",
          },
          negotiation_point: {
            type: "string",
            description:
              "Concrete suggestion for what the signer should push back on or ask to change.",
          },
        },
        required: [
          "severity",
          "title",
          "description",
          "section_reference",
          "quote",
          "negotiation_point",
        ],
        additionalProperties: false,
      },
    },
  },
  required: ["overall_score", "risk_level", "summary", "risks"],
  additionalProperties: false,
};
