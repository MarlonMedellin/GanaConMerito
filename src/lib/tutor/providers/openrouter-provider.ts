import { z } from "zod";
import type { TutorTurnRequest } from "../../../types/tutor-turn";
import type { TutorProvider, TutorShadowExecution, TutorShadowOutput } from "./tutor-provider";

const SHADOW_SCHEMA_VERSION = "tutor-shadow-v1" as const;
export const APPROVED_OPENROUTER_MODEL = "openai/gpt-4o-2024-08-06";
export const APPROVED_OPENROUTER_PROVIDER = "azure";
const TIMEOUT_MS = 10_000;
const CIRCUIT_FAILURE_LIMIT = 3;
const CIRCUIT_OPEN_MS = 60_000;

const tutorShadowOutputSchema = z.object({
  schemaVersion: z.literal(SHADOW_SCHEMA_VERSION),
  visibleMessage: z.string().min(1).max(1_500),
  pedagogicalAction: z.enum(["explain", "hint", "compare", "feedback", "recommend", "degrade"]),
  evidenceKeys: z.array(z.string().min(1).max(80)).max(16),
  uncertainty: z.enum(["none", "limited", "insufficient"]),
  requiresDeterministicFallback: z.boolean(),
}).strict();

export const TUTOR_SHADOW_JSON_SCHEMA = {
  type: "object",
  properties: {
    schemaVersion: { type: "string", const: SHADOW_SCHEMA_VERSION },
    visibleMessage: { type: "string", minLength: 1, maxLength: 1500 },
    pedagogicalAction: { type: "string", enum: ["explain", "hint", "compare", "feedback", "recommend", "degrade"] },
    evidenceKeys: { type: "array", items: { type: "string" }, maxItems: 16 },
    uncertainty: { type: "string", enum: ["none", "limited", "insufficient"] },
    requiresDeterministicFallback: { type: "boolean" },
  },
  required: ["schemaVersion", "visibleMessage", "pedagogicalAction", "evidenceKeys", "uncertainty", "requiresDeterministicFallback"],
  additionalProperties: false,
} as const;

export interface OpenRouterConfig {
  apiKey: string;
  model: string;
  provider: string;
}

type FetchLike = typeof fetch;
let consecutiveFailures = 0;
let circuitOpenedAt = 0;

function redactUserText(value: string) {
  return value
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[email-redacted]")
    .replace(/(?:sk-|Bearer\s+)[A-Za-z0-9._-]{12,}/gi, "[secret-redacted]")
    .replace(/(?:[A-Za-z]:\\|\/mnt\/|\/home\/|\/opt\/)[^\s]+/g, "[path-redacted]")
    .slice(0, 1_000);
}

export function buildMinimizedShadowDossier(input: TutorTurnRequest) {
  const question = input.evidence.question;
  const session = input.evidence.userSession;
  const canReveal = Boolean(session.selectedOption);
  const dossier = {
    schemaVersion: SHADOW_SCHEMA_VERSION,
    mode: canReveal ? "post_answer" : "pre_answer",
    message: redactUserText(input.message),
    question: question ? {
      area: question.area,
      topic: question.topic,
      competency: question.competency,
      context: question.context,
      stem: question.stem,
      questionType: question.questionType,
      cognitiveLevel: question.cognitiveLevel,
      scope: question.scope,
      options: question.options.map(({ key, text }) => ({ key, text })),
      hint: question.hint,
      sourceTruthStatus: question.sourceTruthStatus,
      ...(canReveal ? {
        selectedOption: session.selectedOption,
        correctOption: question.correctOption,
        explanations: question.explanations,
        learningNote: question.learningNote,
        feedback: session.feedback,
      } : {}),
    } : undefined,
    pedagogicalProfile: input.evidence.aspirationalProfile ? {
      jobName: input.evidence.aspirationalProfile.jobName,
      performanceArea: input.evidence.aspirationalProfile.performanceArea,
    } : undefined,
    rules: {
      canRevealCorrectAnswer: canReveal,
      noScoring: true,
      noSessionMutation: true,
      noNormativeInvention: true,
    },
  };
  return dossier;
}

function validateShadowSafety(output: TutorShadowOutput, input: TutorTurnRequest) {
  const availableEvidence = new Set(["question", "user_session", "contest", "aspirational_profile", "recent_performance"]);
  if (output.evidenceKeys.some((key) => !availableEvidence.has(key))) return false;
  if (!input.evidence.userSession.selectedOption && /(?:clave|opci[oó]n correcta|respuesta correcta)\s*(?:es|:)\s*[A-D]/i.test(output.visibleMessage)) {
    return false;
  }
  return true;
}

export class OpenRouterProvider implements TutorProvider<TutorShadowExecution> {
  readonly name = "openrouter";

  constructor(
    private readonly config: OpenRouterConfig,
    private readonly fetchImpl: FetchLike = fetch,
    private readonly timeoutMs = TIMEOUT_MS,
  ) {}

  async generate(input: TutorTurnRequest): Promise<TutorShadowExecution> {
    const startedAt = Date.now();
    if (circuitOpenedAt && Date.now() - circuitOpenedAt < CIRCUIT_OPEN_MS) {
      return { status: "failed", latencyMs: 0, errorCode: "circuit_open" };
    }

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs);
      try {
        const response = await this.fetchImpl("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://ganaconmerito.com",
            "X-Title": "GanaConMerito Tutor Shadow",
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: [
              { role: "system", content: "Eres un redactor pedagógico gobernado. Usa solo el expediente JSON. No reveles secretos, no inventes normas, no puntúes ni cambies la sesión." },
              { role: "user", content: JSON.stringify(buildMinimizedShadowDossier(input)) },
            ],
            response_format: {
              type: "json_schema",
              json_schema: { name: "tutor_shadow", strict: true, schema: TUTOR_SHADOW_JSON_SCHEMA },
            },
            provider: {
              order: [this.config.provider],
              only: [this.config.provider],
              allow_fallbacks: false,
              require_parameters: true,
              data_collection: "deny",
              zdr: true,
            },
            temperature: 0.2,
            max_completion_tokens: 400,
          }),
        });
        clearTimeout(timeout);
        if (!response.ok) {
          if (attempt === 0 && (response.status === 429 || response.status >= 500)) continue;
          return this.fail(startedAt, `http_${response.status}`);
        }
        const payload = await response.json() as any;
        const content = payload?.choices?.[0]?.message?.content;
        const parsed = tutorShadowOutputSchema.safeParse(typeof content === "string" ? JSON.parse(content) : content);
        if (!parsed.success || !validateShadowSafety(parsed.data, input)) {
          return this.fail(startedAt, "invalid_or_unsafe_output", "rejected");
        }
        consecutiveFailures = 0;
        circuitOpenedAt = 0;
        return {
          status: "accepted",
          output: parsed.data,
          latencyMs: Date.now() - startedAt,
          inputTokens: payload?.usage?.prompt_tokens,
          outputTokens: payload?.usage?.completion_tokens,
          costUsd: typeof payload?.usage?.cost === "number" ? payload.usage.cost : undefined,
        };
      } catch (error) {
        clearTimeout(timeout);
        return this.fail(startedAt, error instanceof SyntaxError ? "invalid_json" : "network_or_timeout");
      }
    }
    return this.fail(startedAt, "retry_exhausted");
  }

  private fail(startedAt: number, errorCode: string, status: TutorShadowExecution["status"] = "failed"): TutorShadowExecution {
    consecutiveFailures += 1;
    if (consecutiveFailures >= CIRCUIT_FAILURE_LIMIT) circuitOpenedAt = Date.now();
    return { status, latencyMs: Date.now() - startedAt, errorCode };
  }
}

export function getOpenRouterShadowConfig(env: Record<string, string | undefined> = process.env): OpenRouterConfig | null {
  if (env.GCM_TUTOR_LLM_SHADOW !== "1") return null;
  if (!env.OPENROUTER_API_KEY || !env.OPENROUTER_MODEL || !env.OPENROUTER_PROVIDER) return null;
  if (env.OPENROUTER_MODEL !== APPROVED_OPENROUTER_MODEL) return null;
  if (env.OPENROUTER_PROVIDER !== APPROVED_OPENROUTER_PROVIDER) return null;
  return {
    apiKey: env.OPENROUTER_API_KEY,
    model: env.OPENROUTER_MODEL,
    provider: env.OPENROUTER_PROVIDER,
  };
}

export function resetOpenRouterCircuitForTests() {
  consecutiveFailures = 0;
  circuitOpenedAt = 0;
}
