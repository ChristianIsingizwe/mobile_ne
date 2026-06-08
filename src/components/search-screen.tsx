import { useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { Icon } from "@/components/icon";
import { MainHeader } from "@/components/main-header";
import { useDictionary } from "@/providers/dictionary-provider";
import { buildWordRoute } from "@/utils/dictionary-term";

export function SearchScreen() {
  const router = useRouter();
  const {
    activeSearchTerm,
    clearError,
    connectionStatus,
    error,
    history,
    isHistoryHydrated,
    retry,
    search,
    status,
  } = useDictionary();
  const [query, setQuery] = useState(activeSearchTerm);

  useEffect(() => {
    setQuery(activeSearchTerm);
  }, [activeSearchTerm]);

  const openWord = useCallback(
    async (word: string) => {
      const result = await search(word);

      if (result) {
        router.push(buildWordRoute(result.word));
      }
    },
    [router, search],
  );

  const handleRetry = useCallback(async () => {
    const result = await retry();

    if (result) {
      router.push(buildWordRoute(result.word));
    }
  }, [retry, router]);

  const handleChangeText = useCallback(
    (nextValue: string) => {
      setQuery(nextValue);

      if (error?.kind === "validation") {
        clearError();
      }
    },
    [clearError, error?.kind],
  );

  return (
    <>
      <MainHeader />
      <ScrollView
        className="flex-1 bg-background"
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 px-5 pt-6 pb-12 android:pb-safe"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-4">
          <View className="gap-3">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
              LexiTech Dictionary
            </Text>
            <Text className="text-[34px] font-bold leading-tight text-foreground">
              Search a word and jump straight into its meaning.
            </Text>
            <Text className="text-[17px] leading-7 text-muted-foreground">
              Definitions, phonetics, examples, and pronunciation audio are all
              organized on a dedicated detail screen.
            </Text>
          </View>

          {connectionStatus === "offline" && (
            <StatusCard
              title="You're offline"
              message="Saved search history is still available, but new lookups need an internet connection."
            />
          )}
        </View>

        <View className="gap-4 rounded-[28px] border border-border bg-card p-5">
          <View className="gap-2">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
              Search
            </Text>
            <Text className="text-[17px] leading-7 text-foreground">
              Enter an English word and open its dedicated detail screen.
            </Text>
          </View>

          <View className="gap-3">
            <View className="flex-row items-center rounded-[22px] border border-border bg-background px-4">
              <Icon icon={Search} className="h-5 w-5 text-muted-foreground" />
              <TextInput
                autoCapitalize="none"
                autoCorrect={false}
                className="flex-1 px-3 py-4 text-[18px] text-foreground"
                cursorColorClassName="accent-foreground"
                placeholder="Search for a word"
                placeholderTextColorClassName="accent-muted-foreground"
                returnKeyType="search"
                selectionColorClassName="accent-foreground"
                value={query}
                onChangeText={handleChangeText}
                onSubmitEditing={() => void openWord(query)}
              />
            </View>

            <Pressable
              disabled={status === "loading"}
              onPress={() => void openWord(query)}
              className="items-center rounded-[22px] bg-foreground px-4 py-4 active:opacity-80 disabled:opacity-50"
            >
              <Text className="text-[17px] font-semibold text-background">
                {status === "loading" ? "Searching..." : "Search"}
              </Text>
            </Pressable>
          </View>

          {error?.kind === "validation" && (
            <Text selectable className="text-[14px] leading-6 text-red-500">
              {error.message}
            </Text>
          )}
        </View>

        {isHistoryHydrated && history.length > 0 && (
          <View className="gap-3">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
              Recent searches
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {history.map((word) => (
                <Pressable
                  key={word}
                  onPress={() => void openWord(word)}
                  className="rounded-full border border-border bg-card px-4 py-2.5 active:bg-muted"
                >
                  <Text className="text-[14px] font-medium text-foreground">
                    {word}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {status === "idle" && !error && (
          <StatusCard
            title="Start with any English word"
            message="The app keeps your recent searches, handles missing words gracefully, and opens each result on its own focused screen."
          />
        )}

        {status === "loading" && (
          <StatusCard
            title="Looking up your word"
            message="The app is contacting the dictionary API and preparing the result screen."
          />
        )}

        {error && error.kind !== "validation" && (
          <View className="gap-4 rounded-[28px] border border-border bg-card p-5">
            <View className="gap-2">
              <Text className="text-[22px] font-semibold text-foreground">
                {error.title}
              </Text>
              <Text selectable className="text-[16px] leading-7 text-muted-foreground">
                {error.message}
              </Text>
            </View>

            {error.retryable && (
              <Pressable
                onPress={() => void handleRetry()}
                className="items-center rounded-[22px] border border-border bg-background px-4 py-4 active:bg-muted"
              >
                <Text className="text-[16px] font-semibold text-foreground">
                  Retry search
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function StatusCard({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <View className="gap-2 rounded-[28px] border border-dashed border-border bg-card p-5">
      <Text className="text-[22px] font-semibold text-foreground">{title}</Text>
      <Text selectable className="text-[16px] leading-7 text-muted-foreground">
        {message}
      </Text>
    </View>
  );
}
