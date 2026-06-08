export const DICTIONARY_HISTORY_STORAGE_KEY =
  "lexitech-dictionary-history-v1";

export function normalizeSearchTerm(term: string) {
  return term.trim().replace(/\s+/g, " ");
}

export function toSearchKey(term: string) {
  return normalizeSearchTerm(term).toLowerCase();
}

export function buildWordRoute(term: string) {
  return {
    pathname: "/word/[term]",
    params: { term: normalizeSearchTerm(term) },
  } as const;
}

export function decodeRouteTerm(term?: string | string[]) {
  const rawTerm = Array.isArray(term) ? term[0] : term;

  if (!rawTerm) {
    return "";
  }

  try {
    return normalizeSearchTerm(decodeURIComponent(rawTerm));
  } catch {
    return normalizeSearchTerm(rawTerm);
  }
}

export function normalizeHistory(words: string[], maxItems = 10) {
  const deduped: string[] = [];
  const seen = new Set<string>();

  for (const word of words) {
    const normalizedWord = normalizeSearchTerm(word);

    if (!normalizedWord) {
      continue;
    }

    const key = toSearchKey(normalizedWord);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    deduped.push(normalizedWord);

    if (deduped.length >= maxItems) {
      break;
    }
  }

  return deduped;
}
