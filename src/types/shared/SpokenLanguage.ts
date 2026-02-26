import type { SpokenLanguageCode } from "./enums/SpokenLanguageCode";
import type { LanguageProficiency } from "./enums/LanguageProficiency";

export interface SpokenLanguage {
  id: string;
  languageCode: SpokenLanguageCode;
  proficiency: LanguageProficiency;
}
