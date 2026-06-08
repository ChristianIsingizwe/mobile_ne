import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { ChevronLeft, ExternalLink } from "lucide-react-native";
import { useCallback, useEffect } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";

import { DictionaryPronunciationControls } from "@/components/dictionary-pronunciation-controls";
import { Icon } from "@/components/icon";
import { useDictionary } from "@/providers/dictionary-provider";
import { decodeRouteTerm, toSearchKey } from "@/utils/dictionary-term";

export function WordDetailScreen() {
  const router = useRouter();
  const { term } = useLocalSearchParams<{ term?: string | string[] }>();
  const normalizedTerm = decodeRouteTerm(term);
  const {
    connectionStatus,
    entry,
    error,
    search,
    setActiveWord,
    status,
  } = useDictionary();

  const entryMatches =
    !!entry && toSearchKey(entry.word) === toSearchKey(normalizedTerm);
  const visibleEntry = entryMatches ? entry : null;

  useEffect(() => {
    if (!normalizedTerm) {
      return;
    }

    setActiveWord(normalizedTerm);

    if (visibleEntry) {
      return;
    }

    void search(normalizedTerm);
  }, [normalizedTerm, search, setActiveWord, visibleEntry]);

  const handleRetry = useCallback(() => {
    if (!normalizedTerm) {
      return;
    }

    void search(normalizedTerm);
  }, [normalizedTerm, search]);

  if (!normalizedTerm) {
    return (
      <View className="flex-1 items-center justify-center bg-background px-5">
        <Stack.Screen options={{ title: "Word" }} />
        <Text className="text-[18px] text-muted-foreground">
          No word was provided for this screen.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerClassName="gap-6 px-5 pt-4 pb-12 android:pb-safe"
    >
      <Stack.Screen
        options={{
          title: visibleEntry?.word || normalizedTerm,
          headerBackTitle: "Search",
        }}
      />

      <Pressable
        onPress={() => router.replace("/")}
        className="flex-row items-center gap-2 self-start rounded-full border border-border bg-card px-4 py-2.5 active:bg-muted"
      >
        <Icon icon={ChevronLeft} className="h-4 w-4 text-foreground" />
        <Text className="text-[14px] font-medium text-foreground">
          Back to search
        </Text>
      </Pressable>

      {connectionStatus === "offline" && (
        <InlineMessage
          title="Offline"
          message="New lookups need a connection. If this word was already loaded, its last successful result stays visible."
        />
      )}

      {status === "loading" && !visibleEntry && (
        <CardMessage
          title="Loading word details"
          message="Fetching definitions, examples, and pronunciation data from the dictionary API."
        />
      )}

      {error && !visibleEntry && (
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
              onPress={handleRetry}
              className="items-center rounded-[22px] border border-border bg-background px-4 py-4 active:bg-muted"
            >
              <Text className="text-[16px] font-semibold text-foreground">
                Retry
              </Text>
            </Pressable>
          )}
        </View>
      )}

      {visibleEntry && (
        <View className="gap-6">
          {error && (
            <InlineMessage title={error.title} message={error.message} />
          )}

          <View className="gap-4 rounded-[32px] border border-border bg-card p-6">
            <View className="gap-3">
              <Text className="text-[36px] font-bold leading-tight text-foreground">
                {visibleEntry.word}
              </Text>

              {visibleEntry.phonetic ? (
                <Text selectable className="text-[18px] text-muted-foreground">
                  {visibleEntry.phonetic}
                </Text>
              ) : (
                <Text selectable className="text-[16px] text-muted-foreground">
                  No phonetic spelling was returned for this word.
                </Text>
              )}
            </View>

            {visibleEntry.pronunciations.length > 0 ? (
              <DictionaryPronunciationControls
                pronunciations={visibleEntry.pronunciations}
              />
            ) : (
              <InlineMessage
                title="No pronunciation audio"
                message="The API did not return any playable pronunciation URLs for this word."
              />
            )}
          </View>

          {visibleEntry.meanings.length > 0 ? (
            <View className="gap-4">
              {visibleEntry.meanings.map((meaning) => (
                <View
                  key={meaning.id}
                  className="gap-5 rounded-[28px] border border-border bg-card p-5"
                >
                  <View className="flex-row items-center justify-between gap-3">
                    <Text className="text-[22px] font-semibold text-foreground">
                      {meaning.partOfSpeech}
                    </Text>
                    <Text className="rounded-full border border-border px-3 py-1 text-[12px] font-medium uppercase tracking-[1.4px] text-muted-foreground">
                      {meaning.definitions.length} definition
                      {meaning.definitions.length === 1 ? "" : "s"}
                    </Text>
                  </View>

                  <View className="gap-4">
                    {meaning.definitions.map((definition, index) => (
                      <View key={definition.id} className="gap-2">
                        <Text className="text-[16px] leading-7 text-foreground">
                          {index + 1}. {definition.text}
                        </Text>
                        {definition.example ? (
                          <Text
                            selectable
                            className="rounded-[20px] bg-muted px-4 py-3 text-[15px] leading-6 text-muted-foreground"
                          >
                            Example: {definition.example}
                          </Text>
                        ) : null}
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <CardMessage
              title="No structured meanings"
              message="The API returned the word, but it did not include any usable definitions."
            />
          )}

          {visibleEntry.sourceUrls.length > 0 && (
            <View className="gap-3 rounded-[28px] border border-border bg-card p-5">
              <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
                Sources
              </Text>

              <View className="gap-2.5">
                {visibleEntry.sourceUrls.map((sourceUrl) => (
                  <Pressable
                    key={sourceUrl}
                    onPress={() => void Linking.openURL(sourceUrl)}
                    className="flex-row items-center gap-3 rounded-[20px] border border-border bg-background px-4 py-3 active:bg-muted"
                  >
                    <Icon
                      icon={ExternalLink}
                      className="h-4 w-4 text-muted-foreground"
                    />
                    <Text
                      selectable
                      className="flex-1 text-[14px] leading-6 text-foreground"
                    >
                      {sourceUrl}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

function CardMessage({
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

function InlineMessage({
  message,
  title,
}: {
  message: string;
  title: string;
}) {
  return (
    <View className="gap-1 rounded-[22px] border border-border bg-card px-4 py-3">
      <Text className="text-[15px] font-semibold text-foreground">{title}</Text>
      <Text selectable className="text-[14px] leading-6 text-muted-foreground">
        {message}
      </Text>
    </View>
  );
}
