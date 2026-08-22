import type { TutorTurnRequest, TutorTurnResult } from "../../../types/tutor-turn";
import { TutorOrchestrator } from "../tutor-orchestrator";
import type { TutorProvider } from "./tutor-provider";

export class DeterministicTutorProvider implements TutorProvider<TutorTurnResult> {
  readonly name = "deterministic";

  constructor(private readonly orchestrator = new TutorOrchestrator()) {}

  generate(input: TutorTurnRequest) {
    return this.orchestrator.processTurn(input);
  }
}
