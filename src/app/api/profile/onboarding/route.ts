import { z } from "zod";
import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { requireAuthenticatedProfile } from "../../../../lib/supabase/guards";
import {
  getCanaryOpecCatalog,
  getCanaryTargetingCookieName,
  isCanaryTargetingEnabled,
} from "@/lib/targeting/canary-targeting-server";
import { resolveCanaryOpecOption } from "@/lib/targeting/canary-catalog";

const onboardingSchema = z.object({
  targetRole: z.literal("docente"),
  examType: z.literal("docente"),
  professionalProfileId: z.string().uuid(),
  activeGoal: z.string().trim().min(1, "La meta activa es obligatoria.").max(240),
  activeAreas: z
    .array(z.string().trim().min(1))
    .min(1, "Debes indicar al menos un área activa.")
    .max(20)
    .transform((areas) => Array.from(new Set(areas.map((area) => area.trim()).filter(Boolean)))),
  preferredFeedbackStyle: z.enum(["socratic"]).default("socratic"),
  canaryOpecKey: z.string().trim().min(1).max(256).optional(),
});

export async function POST(request: Request) {
  const observation = beginRequestObservation(request, "/api/profile/onboarding");
  const auth = await requireAuthenticatedProfile();
  if (!auth.ok) {
    logRequestOutcome(observation, {
      event: "canary.onboarding.auth_failed",
      status: auth.status,
      errorCode: API_ERROR_CODES.AUTH_UNAUTHORIZED,
    });
    return jsonWithRequestId({ error: auth.error }, auth.status, observation);
  }

  const { supabase, profile } = auth;
  let json: unknown;
  try {
    json = await request.json();
  } catch (error) {
    logRequestOutcome(observation, {
      event: "canary.onboarding.invalid_json",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_JSON,
      error,
    });
    return jsonWithRequestId({ error: "Datos de onboarding inválidos." }, 400, observation);
  }

  const parsed = onboardingSchema.safeParse(json);
  if (!parsed.success) {
    logRequestOutcome(observation, {
      event: "canary.onboarding.invalid_body",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
    });
    return jsonWithRequestId(
      { error: parsed.error.issues.map((issue) => issue.message).join(" | ") || "Datos de onboarding inválidos." },
      400,
      observation,
    );
  }

  const { data: professionalProfile, error: professionalProfileError } = await supabase
    .from("professional_profiles")
    .select("id, code")
    .eq("id", parsed.data.professionalProfileId)
    .eq("is_active", true)
    .single();

  if (professionalProfileError || !professionalProfile) {
    logRequestOutcome(observation, {
      event: "canary.onboarding.profile_not_found",
      status: 400,
      errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
    });
    return jsonWithRequestId({ error: "Professional profile not found" }, 400, observation);
  }

  const canaryTargetingEnabled = isCanaryTargetingEnabled();
  let canaryOpecKey: string | null = null;

  if (canaryTargetingEnabled) {
    let catalog;
    try {
      catalog = getCanaryOpecCatalog();
    } catch (error) {
      logRequestOutcome(observation, {
        event: "canary.onboarding.catalog_invalid",
        status: 500,
        errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
        error,
      });
      return jsonWithRequestId({ error: "Canary targeting catalog is not valid." }, 500, observation);
    }

    const selectedOpec = resolveCanaryOpecOption(catalog, parsed.data.canaryOpecKey);
    if (!selectedOpec || selectedOpec.professionalProfileCode !== professionalProfile.code) {
      logRequestOutcome(observation, {
        event: "canary.onboarding.targeting_rejected",
        status: 400,
        errorCode: API_ERROR_CODES.VALIDATION_INVALID_BODY,
        opecKey: parsed.data.canaryOpecKey,
        extra: { professionalProfileCode: professionalProfile.code },
      });
      return jsonWithRequestId(
        { error: "Selecciona una OPEC verificada compatible con el perfil reusable." },
        400,
        observation,
      );
    }
    canaryOpecKey = selectedOpec.opecKey;
  }

  const { error: updateError } = await supabase
    .from("learning_profiles")
    .update({
      target_role: parsed.data.targetRole,
      exam_type: parsed.data.examType,
      professional_profile_id: parsed.data.professionalProfileId,
      active_goal: parsed.data.activeGoal,
      active_areas: parsed.data.activeAreas,
      preferred_feedback_style: parsed.data.preferredFeedbackStyle,
      onboarding_completed: parsed.data.activeAreas.length > 0,
    })
    .eq("profile_id", profile.id);

  if (updateError) {
    logRequestOutcome(observation, {
      event: "canary.onboarding.persist_failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DATABASE_ERROR,
      opecKey: canaryOpecKey,
      error: updateError,
    });
    return jsonWithRequestId({ error: updateError.message }, 500, observation);
  }

  const response = jsonWithRequestId({ ok: true }, 200, observation);
  if (canaryTargetingEnabled && canaryOpecKey) {
    response.cookies.set(getCanaryTargetingCookieName(), canaryOpecKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  } else {
    response.cookies.delete(getCanaryTargetingCookieName());
  }

  logRequestOutcome(observation, {
    event: "canary.onboarding.saved",
    status: 200,
    opecKey: canaryOpecKey,
    extra: { professionalProfileCode: professionalProfile.code },
  });
  return response;
}
