import { create } from "axios";

import type {
  DictionaryApiEntry,
  DictionaryEntry,
  DictionaryMeaning,
  DictionaryPronunciation,
} from "@/types/dictionary";

const dictionaryClient = create({
  baseURL: "https://api.dictionaryapi.dev/api/v2/entries/en",
  timeout: 10000,
});

export async function fetchDictionaryEntry(
  word: string,
  signal?: AbortSignal,
): Promise<DictionaryEntry> {
  const response = await dictionaryClient.get<DictionaryApiEntry[]>(
    `/${encodeURIComponent(word)}`,
    { signal },
  );

  return normalizeDictionaryEntry(response.data);
}

function normalizeDictionaryEntry(entries: DictionaryApiEntry[]): DictionaryEntry {
  if (!Array.isArray(entries) || entries.length === 0) {
    throw new Error("Dictionary response was empty.");
  }

  let word = "";
  let phonetic = "";
  let meaningIndex = 0;

  const pronunciations = new Map<string, DictionaryPronunciation>();
  const sourceUrls = new Set<string>();
  const meanings: DictionaryMeaning[] = [];

  for (const entry of entries) {
    word ||= entry.word?.trim() ?? "";
    phonetic ||= entry.phonetic?.trim() ?? "";

    for (const sourceUrl of entry.sourceUrls ?? []) {
      const nextUrl = sourceUrl.trim();
      if (nextUrl) {
        sourceUrls.add(nextUrl);
      }
    }

    for (const phoneticEntry of entry.phonetics ?? []) {
      const nextText = phoneticEntry.text?.trim();
      const nextAudioUrl = normalizeAudioUrl(phoneticEntry.audio);

      if (!phonetic && nextText) {
        phonetic = nextText;
      }

      if (!nextAudioUrl || pronunciations.has(nextAudioUrl)) {
        continue;
      }

      pronunciations.set(nextAudioUrl, {
        id: `audio-${pronunciations.size + 1}`,
        label: nextText || `Pronunciation ${pronunciations.size + 1}`,
        url: nextAudioUrl,
      });
    }

    for (const meaning of entry.meanings ?? []) {
      const definitions = (meaning.definitions ?? [])
        .map((definition, definitionIndex) => {
          const text = definition.definition?.trim();

          if (!text) {
            return null;
          }

          return {
            id: `definition-${meaningIndex + 1}-${definitionIndex + 1}`,
            text,
            example: definition.example?.trim() || undefined,
          };
        })
        .filter((definition) => definition !== null);

      if (definitions.length === 0) {
        continue;
      }

      meanings.push({
        id: `meaning-${meaningIndex + 1}`,
        partOfSpeech: meaning.partOfSpeech?.trim() || `Meaning ${meaningIndex + 1}`,
        definitions,
      });

      meaningIndex += 1;
    }
  }

  if (!word) {
    throw new Error("Dictionary response did not include a word.");
  }

  return {
    word,
    phonetic: phonetic || undefined,
    pronunciations: [...pronunciations.values()],
    meanings,
    sourceUrls: [...sourceUrls],
  };
}

function normalizeAudioUrl(audio?: string) {
  const value = audio?.trim();

  if (!value) {
    return "";
  }

  if (value.startsWith("//")) {
    return `https:${value}`;
  }

  return value;
}
