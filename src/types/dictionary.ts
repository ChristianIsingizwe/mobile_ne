export type DictionaryApiDefinition = {
  definition?: string;
  example?: string;
};

export type DictionaryApiMeaning = {
  partOfSpeech?: string;
  definitions?: DictionaryApiDefinition[];
};

export type DictionaryApiPhonetic = {
  text?: string;
  audio?: string;
};

export type DictionaryApiEntry = {
  word?: string;
  phonetic?: string;
  phonetics?: DictionaryApiPhonetic[];
  meanings?: DictionaryApiMeaning[];
  sourceUrls?: string[];
};

export type DictionaryPronunciation = {
  id: string;
  label: string;
  url: string;
};

export type DictionaryDefinition = {
  id: string;
  text: string;
  example?: string;
};

export type DictionaryMeaning = {
  id: string;
  partOfSpeech: string;
  definitions: DictionaryDefinition[];
};

export type DictionaryEntry = {
  word: string;
  phonetic?: string;
  pronunciations: DictionaryPronunciation[];
  meanings: DictionaryMeaning[];
  sourceUrls: string[];
};

export type DictionaryUiError = {
  kind: "validation" | "not-found" | "network" | "unexpected";
  title: string;
  message: string;
  retryable: boolean;
};

export type DictionaryConnectionStatus = "online" | "offline" | "unknown";
