import type { AssessmentFrequency } from "./AssessmentFrequency";

export interface GAD7Response {
  feelingNervous: AssessmentFrequency;
  cantStopWorrying: AssessmentFrequency;
  worryingTooMuch: AssessmentFrequency;
  troubleRelaxing: AssessmentFrequency;
  beingRestless: AssessmentFrequency;
  easilyAnnoyed: AssessmentFrequency;
  feelingAfraid: AssessmentFrequency;
  functionalImpairment?:
    | "notDifficult"
    | "somewhatDifficult"
    | "veryDifficult"
    | "extremelyDifficult";
}
