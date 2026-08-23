import test from "node:test";
import assert from "node:assert/strict";
import { isLearningProfileOnboardingComplete } from "./status";

test("onboarding is complete when the persisted flag and target profile code are present", () => {
  assert.equal(
    isLearningProfileOnboardingComplete({
      onboarding_completed: true,
      target_profile_code: "docente_aula_secundaria_media",
      active_areas: [],
    }),
    true,
  );
});

test("onboarding is incomplete when the persisted flag is false", () => {
  assert.equal(
    isLearningProfileOnboardingComplete({
      onboarding_completed: false,
      target_profile_code: "docente_aula_secundaria_media",
      active_areas: ["normatividad"],
    }),
    false,
  );
});

test("onboarding is incomplete without a target profile code", () => {
  assert.equal(
    isLearningProfileOnboardingComplete({
      onboarding_completed: true,
      target_profile_code: null,
      active_areas: ["normatividad"],
    }),
    false,
  );
});
