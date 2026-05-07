import { logger } from "./src/lib/logger/structured-logger";

export async function register() {
  logger.info("observability_instrumentation_registered", {
    component: "nextjs_instrumentation",
    env: process.env.NODE_ENV,
  });
}
