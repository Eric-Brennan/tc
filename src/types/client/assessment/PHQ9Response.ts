import type { AssessmentFrequency } from "./AssessmentFrequency";

export interface PHQ9Response {
  littleInterest: AssessmentFrequency;
  feelingDown: AssessmentFrequency;
  sleepProblems: AssessmentFrequency;
  feelingTired: AssessmentFrequency;
  appetiteProblems: AssessmentFrequency;
  feelingBad: AssessmentFrequency;
  troubleConcentrating: AssessmentFrequency;
  movingSpeaking: AssessmentFrequency;
  selfHarmThoughts: AssessmentFrequency;
  functionalImpairment?:
    | "notDifficult"
    | "somewhatDifficult"
    | "veryDifficult"
    | "extremelyDifficult";
}
