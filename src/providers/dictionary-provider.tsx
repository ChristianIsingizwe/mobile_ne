import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNetInfo } from "@react-native-community/netinfo";
import { isAxiosError } from "axios";
import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import type {
  DictionaryConnectionStatus,
  DictionaryEntry,
  DictionaryUiError,
} from "@/types/dictionary";
import {
  DICTIONARY_HISTORY_STORAGE_KEY,
  normalizeHistory,
  normalizeSearchTerm,
} from "@/utils/dictionary-term";
import { fetchDictionaryEntry } from "@/utils/dictionary-api";

type DictionaryStatus = "idle" | "loading" | "success" | "error";

type DictionaryContextValue = {
  activeSearchTerm: string;
  clearHistory: () => void;
  connectionStatus: DictionaryConnectionStatus;
  entry: DictionaryEntry | null;
  error: DictionaryUiError | null;
  history: string[];
  isHistoryHydrated: boolean;
  status: DictionaryStatus;
  clearError: () => void;
  retry: () => Promise<DictionaryEntry | null>;
  search: (word: string) => Promise<DictionaryEntry | null>;
  setActiveWord: (word: string) => void;
};

const DictionaryContext = createContext<DictionaryContextValue | null>(null);

export function DictionaryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeSearchTerm, setActiveSearchTerm] = useState("");
  const [entry, setEntry] = useState<DictionaryEntry | null>(null);
  const [error, setError] = useState<DictionaryUiError | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryHydrated, setIsHistoryHydrated] = useState(false);
  const [status, setStatus] = useState<DictionaryStatus>("idle");

  const abortRef = useRef<AbortController | null>(null);
  const netInfo = useNetInfo();

  const connectionStatus = useMemo<DictionaryConnectionStatus>(() => {
    if (
      netInfo.isConnected === false ||
      netInfo.isInternetReachable === false
    ) {
      return "offline";
    }

    if (
      typeof netInfo.isConnected === "boolean" ||
      typeof netInfo.isInternetReachable === "boolean"
    ) {
      return "online";
    }

    return "unknown";
  }, [netInfo.isConnected, netInfo.isInternetReachable]);

  const clearError = useCallback(() => {
    setError(null);
    setStatus((currentStatus) =>
      currentStatus === "error" ? "idle" : currentStatus,
    );
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const setActiveWord = useCallback((word: string) => {
    setActiveSearchTerm(normalizeSearchTerm(word));
  }, []);

  const search = useCallback(
    async (word: string) => {
      const nextWord = normalizeSearchTerm(word);

      setActiveSearchTerm(nextWord);

      if (!nextWord) {
        setStatus("error");
        setError({
          kind: "validation",
          title: "Enter a word",
          message: "Type an English word before running a search.",
          retryable: false,
        });
        return null;
      }

      if (connectionStatus === "offline") {
        setStatus("error");
        setError(getOfflineError());
        return null;
      }

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setError(null);
      setStatus("loading");

      try {
        const nextEntry = await fetchDictionaryEntry(nextWord, controller.signal);

        if (abortRef.current !== controller) {
          return null;
        }

        setEntry(nextEntry);
        setActiveSearchTerm(nextEntry.word);
        setStatus("success");
        setHistory((currentHistory) =>
          normalizeHistory([nextEntry.word, ...currentHistory]),
        );

        return nextEntry;
      } catch (error) {
        if (isCanceledError(error) || abortRef.current !== controller) {
          return null;
        }

        setStatus("error");
        setError(getDictionaryError(error, connectionStatus));
        return null;
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      }
    },
    [connectionStatus],
  );

  const retry = useCallback(async () => {
    if (!activeSearchTerm) {
      return null;
    }

    return await search(activeSearchTerm);
  }, [activeSearchTerm, search]);

  useEffect(() => {
    void (async () => {
      try {
        const storedHistory = await AsyncStorage.getItem(
          DICTIONARY_HISTORY_STORAGE_KEY,
        );

        if (!storedHistory) {
          setHistory([]);
          return;
        }

        const parsedHistory = JSON.parse(storedHistory);

        if (Array.isArray(parsedHistory)) {
          setHistory(
            normalizeHistory(
              parsedHistory.filter(
                (item): item is string => typeof item === "string",
              ),
            ),
          );
        }
      } catch {
        setHistory([]);
      } finally {
        setIsHistoryHydrated(true);
      }
    })();

    return () => {
      abortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    if (!isHistoryHydrated) {
      return;
    }

    void AsyncStorage.setItem(
      DICTIONARY_HISTORY_STORAGE_KEY,
      JSON.stringify(history),
    );
  }, [history, isHistoryHydrated]);

  return (
    <DictionaryContext
      value={{
        activeSearchTerm,
        clearHistory,
        connectionStatus,
        entry,
        error,
        history,
        isHistoryHydrated,
        status,
        clearError,
        retry,
        search,
        setActiveWord,
      }}
    >
      {children}
    </DictionaryContext>
  );
}

export function useDictionary() {
  const context = use(DictionaryContext);

  if (!context) {
    throw new Error("useDictionary must be used within a DictionaryProvider");
  }

  return context;
}

function isCanceledError(error: unknown) {
  return isAxiosError(error) && error.code === "ERR_CANCELED";
}

function getOfflineError(): DictionaryUiError {
  return {
    kind: "network",
    title: "You're offline",
    message:
      "Connect to the internet to search for new words, then try again.",
    retryable: true,
  };
}

function getDictionaryError(
  error: unknown,
  connectionStatus: DictionaryConnectionStatus,
): DictionaryUiError {
  if (connectionStatus === "offline") {
    return getOfflineError();
  }

  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return {
        kind: "not-found",
        title: "Word not found",
        message:
          "No definitions were returned for that search. Check the spelling and try another word.",
        retryable: true,
      };
    }

    if (!error.response) {
      return {
        kind: "network",
        title: "Connection issue",
        message:
          "The dictionary service could not be reached. Check your internet connection and try again.",
        retryable: true,
      };
    }
  }

  return {
    kind: "unexpected",
    title: "Something went wrong",
    message:
      "The dictionary response could not be processed. Try again in a moment.",
    retryable: true,
  };
}
