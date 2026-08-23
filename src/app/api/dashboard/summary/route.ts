import { API_ERROR_CODES } from "@/lib/api/error-codes";
import {
  beginRequestObservation,
  jsonWithRequestId,
  logRequestOutcome,
} from "@/lib/api/canary-observability";
import { getDashboardSummaryForCurrentUser } from "../../../../lib/dashboard/summary";

export async function GET(request: Request) {
  const observation = beginRequestObservation(request, "/api/dashboard/summary");
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get("sessionId") ?? undefined;

  try {
    const response = await getDashboardSummaryForCurrentUser(sessionId);
    logRequestOutcome(observation, {
      event: "canary.dashboard_summary.completed",
      status: 200,
      sessionId,
      extra: { scopedToSession: Boolean(sessionId) },
    });
    return jsonWithRequestId(response, 200, observation);
  } catch (error) {
    logRequestOutcome(observation, {
      event: "canary.dashboard_summary.failed",
      status: 500,
      errorCode: API_ERROR_CODES.INTERNAL_DEPENDENCY_FAILED,
      sessionId,
      error,
    });
    return jsonWithRequestId({ error: "Could not build dashboard summary" }, 500, observation);
  }
}
