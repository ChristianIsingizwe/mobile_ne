import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Pause, Square, Volume2 } from "lucide-react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

import { Icon } from "@/components/icon";
import type { DictionaryPronunciation } from "@/types/dictionary";

export function DictionaryPronunciationControls({
  pronunciations,
}: {
  pronunciations: DictionaryPronunciation[];
}) {
  const [selectedUrl, setSelectedUrl] = useState<string | null>(
    pronunciations[0]?.url ?? null,
  );
  const [shouldAutoPlay, setShouldAutoPlay] = useState(false);

  const audioSource = useMemo(
    () => (selectedUrl ? { uri: selectedUrl } : null),
    [selectedUrl],
  );
  const pronunciationsKey = useMemo(
    () => pronunciations.map((pronunciation) => pronunciation.url).join("|"),
    [pronunciations],
  );

  const player = useAudioPlayer(audioSource, {
    updateInterval: 250,
  });
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    void setAudioModeAsync({
      interruptionMode: "mixWithOthers",
      playsInSilentMode: true,
      shouldPlayInBackground: false,
    });
  }, []);

  useEffect(() => {
    setSelectedUrl(pronunciations[0]?.url ?? null);
    setShouldAutoPlay(false);
  }, [pronunciations, pronunciationsKey]);

  useEffect(() => {
    if (!shouldAutoPlay || !selectedUrl || !status.isLoaded || status.isBuffering) {
      return;
    }

    player.seekTo(0);
    player.play();
    setShouldAutoPlay(false);
  }, [
    player,
    selectedUrl,
    shouldAutoPlay,
    status.isBuffering,
    status.isLoaded,
  ]);

  const handlePlayPress = useCallback(
    (url: string) => {
      if (selectedUrl !== url) {
        setSelectedUrl(url);
        setShouldAutoPlay(true);
        return;
      }

      if (!status.isLoaded) {
        setShouldAutoPlay(true);
        return;
      }

      if (status.playing) {
        player.pause();
        return;
      }

      if (status.didJustFinish || status.currentTime >= Math.max(status.duration - 0.05, 0)) {
        player.seekTo(0);
      }

      player.play();
    },
    [player, selectedUrl, status.currentTime, status.didJustFinish, status.duration, status.isLoaded, status.playing],
  );

  const handleStop = useCallback(() => {
    player.pause();
    player.seekTo(0);
  }, [player]);

  if (pronunciations.length === 0) {
    return null;
  }

  const canStopPlayback = status.playing || status.isBuffering;

  return (
    <View className="gap-3">
      <View className="flex-row flex-wrap gap-2.5">
        {pronunciations.map((pronunciation) => {
          const isActive = selectedUrl === pronunciation.url;
          const isPlaying = isActive && status.playing;

          return (
            <Pressable
              key={pronunciation.id}
              onPress={() => handlePlayPress(pronunciation.url)}
              className={
                isActive
                  ? "flex-row items-center gap-2 rounded-full border border-foreground bg-foreground px-4 py-2.5 active:opacity-80"
                  : "flex-row items-center gap-2 rounded-full border border-border bg-card px-4 py-2.5 active:bg-muted"
              }
            >
              <Icon
                icon={isPlaying ? Pause : Volume2}
                className={
                  isActive ? "h-4 w-4 text-background" : "h-4 w-4 text-foreground"
                }
              />
              <Text
                className={
                  isActive
                    ? "text-[14px] font-medium text-background"
                    : "text-[14px] font-medium text-foreground"
                }
              >
                {pronunciation.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="flex-row items-center justify-between gap-3">
        <Text selectable className="flex-1 text-[13px] text-muted-foreground">
          {status.isBuffering
            ? "Loading pronunciation audio..."
            : status.playing
              ? "Playing pronunciation"
              : "Tap any pronunciation to play it."}
        </Text>

        <Pressable
          onPress={handleStop}
          disabled={!canStopPlayback}
          className={
            canStopPlayback
              ? "flex-row items-center gap-1.5 rounded-full border border-foreground bg-background px-3 py-2 active:bg-muted"
              : "flex-row items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 opacity-40"
          }
        >
          <Icon icon={Square} className="h-3.5 w-3.5 text-foreground" />
          <Text className="text-[13px] font-medium text-foreground">Stop</Text>
        </Pressable>
      </View>
    </View>
  );
}
