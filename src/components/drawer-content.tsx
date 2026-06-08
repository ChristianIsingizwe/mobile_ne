import "@/global.css";

import { SafeAreaView } from "@/components/tw";
import { useDictionary } from "@/providers/dictionary-provider";
import { cn } from "@/utils/tailwind";
import { usePathname, useRouter } from "expo-router";
import { buildWordRoute } from "@/utils/dictionary-term";

import React, { createContext, use, useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type DrawerContextValue = {
  isOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const DrawerContext = createContext<DrawerContextValue | null>(null);

export function DrawerProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);

  return (
    <DrawerContext value={{ isOpen, openDrawer, closeDrawer }}>
      {children}
    </DrawerContext>
  );
}

export function useDrawer() {
  const context = use(DrawerContext);

  if (!context) {
    throw new Error("useDrawer must be used within a DrawerProvider");
  }

  return context;
}

function DrawerNavItem({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "mx-2 rounded-[18px] px-4 py-3 active:bg-muted",
        active && "bg-muted",
      )}
    >
      <Text className="text-base text-foreground">{label}</Text>
    </Pressable>
  );
}

function DrawerRecentItem({
  title,
  onPress,
  active,
}: {
  title: string;
  onPress: () => void;
  active?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={cn(
        "mx-2 rounded-[18px] px-4 py-2.5 active:bg-accent",
        active && "bg-muted",
      )}
    >
      <Text
        numberOfLines={1}
        className={cn(
          "text-[15px]",
          active ? "text-foreground" : "text-muted-foreground",
        )}
      >
        {title}
      </Text>
    </Pressable>
  );
}

export function DrawerContent() {
  const { activeSearchTerm, history } = useDictionary();
  const { closeDrawer } = useDrawer();
  const pathname = usePathname();
  const router = useRouter();

  const goHome = useCallback(() => {
    closeDrawer();

    if (pathname !== "/") {
      router.replace("/");
    }
  }, [closeDrawer, pathname, router]);

  const handleHistoryPress = useCallback(
    (word: string) => {
      closeDrawer();
      router.navigate(buildWordRoute(word));
    },
    [closeDrawer, router],
  );

  return (
    <SafeAreaView className="flex-1" edges={["top", "bottom", "left"]}>
      <View className="gap-2 px-4 pt-4 pb-3">
        <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
          LexiTech
        </Text>
        <Text className="text-[28px] font-bold text-foreground">Dictionary</Text>
        <Text className="text-[15px] leading-6 text-muted-foreground">
          Search history stays in the drawer so users can reopen earlier words
          quickly.
        </Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 24 }}>
        <DrawerNavItem
          active={pathname === "/"}
          label="Search"
          onPress={goHome}
        />

        <Text className="px-6 pt-6 pb-2 text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
          History
        </Text>

        {history.length > 0 ? (
          history.map((word) => (
            <DrawerRecentItem
              key={word}
              active={activeSearchTerm.toLowerCase() === word.toLowerCase()}
              title={word}
              onPress={() => handleHistoryPress(word)}
            />
          ))
        ) : (
          <Text selectable className="px-6 text-[15px] leading-6 text-muted-foreground">
            Search for a word and it will appear here.
          </Text>
        )}
      </ScrollView>

      <View className="border-t border-border px-4 py-4">
        <Text selectable className="text-[14px] leading-6 text-muted-foreground">
          Definitions, examples, phonetics, and audio only appear when the API
          returns them for the selected word.
        </Text>
      </View>
    </SafeAreaView>
  );
}
