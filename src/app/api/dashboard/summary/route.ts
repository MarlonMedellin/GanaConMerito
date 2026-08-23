import { beginRequestObservation, observedJson } from "@/lib/api/canary-observability";
import { getDashboardSummaryForCurrentUser } from "@/lib/dashboard/summary";
import { requireAuthenticatedProfile, requireOwnedSession } from "@/lib/supabase/guards";

export async function GET(request: Request) {
  const observation = beginRequestObservation(request, "/api/dashboard/summary");
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? undefined;

  try {
    const auth = await requireAuthenticatedProfile();
    if (!auth.ok) {
      return observedJson(observation, { error: auth.error }, {
        status: auth.status,
        event: "canary.dashboard.auth_failed",
        errorCode: "AUTH_UNAUTHORIZED",
      });
    }

    if (sessionId) {
      const ownedSession = await requireOwnedSession({ sessionId });
      if (!ownedSession.ok) {
        return observedJson(observation, { error: ownedSession.error }, {
          status: ownedSession.status,
          event: "canary.dashboard.session_not_owned",
          errorCode: "SESSION_NOT_FOUND",
          sessionId,
        });
      }
    }

    const response = await getDashboardSummaryForCurrentUser(sessionId);
    return observedJson(observation, response, {
      status: 200,
      event: "canary.dashboard.summary_completed",
      sessionId,
    });
  } catch {
    return observedJson(observation, { error: "Could not build dashboard summary" }, {
      status: 500,
      event: "canary.dashboard.summary_failed",
      errorCode: "DASHBOARD_SUMMARY_FAILED",
      sessionId,
    });
  }
}
