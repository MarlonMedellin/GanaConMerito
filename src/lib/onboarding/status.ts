export interface LearningProfileOnboardingStatusInput {
  onboarding_completed?: boolean | null;
  active_areas?: string[] | null;
  target_profile_code?: string | null;
}

export function hasActiveAreas(activeAreas?: string[] | null) {
  return (activeAreas ?? []).some((area) => area.trim().length > 0);
}

export function isLearningProfileOnboardingComplete(
  learningProfile?: LearningProfileOnboardingStatusInput | null,
) {
  return Boolean(learningProfile?.onboarding_completed)
    && Boolean(learningProfile?.target_profile_code)
    && hasActiveAreas(learningProfile?.active_areas);
}
