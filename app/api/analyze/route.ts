import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/anthropic";
import {
  analysisSchema,
  type Analysis,
} from "@/lib/analysis-schema";
import {
  SYSTEM_PROMPT,
  ANALYSIS_TOOL,
  USER_INSTRUCTION,
} from "@/lib/prompts";
import { isValidModelId } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MAX_FILE_BYTES = 32 * 1024 * 1024; // Anthropic accepts up to 32 MB / 100 pages

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

function extractApiKey(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (!auth) return null;
  const match = /^Bearer\s+(.+)$/i.exec(auth.trim());
  if (!match) return null;
  const key = match[1].trim();
  return key.length > 0 ? key : null;
}

export async function POST(req: NextRequest) {
  const apiKey = extractApiKey(req);
  if (!apiKey) {
    return jsonError(
      "Missing API key. Provide your Anthropic API key in the Authorization header as 'Bearer <key>'.",
      401,
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return jsonError("Request body must be multipart/form-data.", 400);
  }

  const file = form.get("file");
  const modelRaw = form.get("model");

  if (!(file instanceof File)) {
    return jsonError("Missing 'file' field.", 400);
  }
  if (typeof modelRaw !== "string" || !isValidModelId(modelRaw)) {
    return jsonError("Missing or unsupported 'model'.", 400);
  }
  const model = modelRaw;

  if (file.type !== "application/pdf") {
    return jsonError("Only PDF files are supported.", 415);
  }
  if (file.size > MAX_FILE_BYTES) {
    return jsonError(
      `File too large. Maximum size is ${Math.round(MAX_FILE_BYTES / 1024 / 1024)} MB.`,
      413,
    );
  }
  if (file.size === 0) {
    return jsonError("Uploaded file is empty.", 400);
  }

  const arrayBuf = await file.arrayBuffer();
  const base64Pdf = Buffer.from(arrayBuf).toString("base64");

  const client = createClient(apiKey);

  let analysis: Analysis;
  let usage = {
    input_tokens: 0,
    output_tokens: 0,
    cache_creation_input_tokens: null as number | null,
    cache_read_input_tokens: null as number | null,
  };

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 16384,
      system: [
        {
          type: "text",
          text: SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: [ANALYSIS_TOOL],
      tool_choice: { type: "tool", name: ANALYSIS_TOOL.name },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: base64Pdf,
              },
            },
            {
              type: "text",
              text: USER_INSTRUCTION,
            },
          ],
        },
      ],
    });

    if (response.stop_reason === "max_tokens") {
      return jsonError(
        "The analysis was cut off because it exceeded the output token budget. Try a smaller/shorter document, or retry — sometimes the model is more concise on the second pass.",
        502,
      );
    }

    const toolBlock = response.content.find(
      (block) => block.type === "tool_use" && block.name === ANALYSIS_TOOL.name,
    );

    if (!toolBlock || toolBlock.type !== "tool_use") {
      return jsonError(
        "Model did not return a structured analysis. Try again or use a more capable model.",
        502,
      );
    }

    const parsed = analysisSchema.safeParse(toolBlock.input);
    if (!parsed.success) {
      const issues = parsed.error.issues
        .slice(0, 3)
        .map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`)
        .join("; ");
      console.error("Analysis schema mismatch", {
        issues: parsed.error.issues,
        raw: toolBlock.input,
      });
      return jsonError(
        `Model returned an analysis in an unexpected shape: ${issues}`,
        502,
      );
    }
    analysis = parsed.data;

    if (analysis.risks.length === 0 && analysis.overall_score >= 25) {
      return jsonError(
        "The model returned a non-trivial risk score but no itemized risks — likely because the response was truncated. Try again.",
        502,
      );
    }

    usage = {
      input_tokens: response.usage.input_tokens ?? 0,
      output_tokens: response.usage.output_tokens ?? 0,
      cache_creation_input_tokens:
        response.usage.cache_creation_input_tokens ?? null,
      cache_read_input_tokens: response.usage.cache_read_input_tokens ?? null,
    };
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return jsonError(
        "Anthropic rejected the API key. Check that it is correct and active.",
        401,
      );
    }
    if (err instanceof Anthropic.PermissionDeniedError) {
      return jsonError(
        "This API key does not have access to the selected model.",
        403,
      );
    }
    if (err instanceof Anthropic.NotFoundError) {
      return jsonError(
        "The selected model was not found for this account. Pick a different model.",
        404,
      );
    }
    if (err instanceof Anthropic.RateLimitError) {
      return jsonError(
        "Anthropic rate limit hit. Wait a moment and try again.",
        429,
      );
    }
    if (err instanceof Anthropic.BadRequestError) {
      return jsonError(err.message || "Anthropic rejected the request.", 400);
    }
    return jsonError("Analysis failed. Please try again.", 500);
  }

  return NextResponse.json({
    analysis,
    meta: {
      model,
      fileSize: file.size,
      usage,
    },
  });
}
