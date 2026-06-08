import * as Tooltip from "@radix-ui/react-tooltip";
import { useDictionary } from "@/providers/dictionary-provider";
import { usePathname, useRouter } from "expo-router";
import {
  BookOpenText,
  History,
  PanelLeft,
  PanelLeftOpen,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { buildWordRoute } from "@/utils/dictionary-term";

function SidebarTooltip({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={8}
          className="z-[100] rounded-lg bg-foreground px-3 py-1.5 text-[13px] text-background shadow-float animate-fade-up"
        >
          {label}
          <Tooltip.Arrow className="fill-foreground" />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
}

export function Sidebar({
  isOpen,
  onToggle,
  isCollapsed,
  onCollapse,
}: {
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  onCollapse: () => void;
}) {
  const { activeSearchTerm, history } = useDictionary();
  const pathname = usePathname();
  const router = useRouter();

  const goHome = () => {
    if (pathname !== "/") {
      router.replace("/");
    }

    if (isOpen) {
      onToggle();
    }
  };

  const handleHistoryPress = (word: string) => {
    if (isOpen) {
      onToggle();
    }

    router.navigate(buildWordRoute(word));
  };

  return (
    <>
      <Pressable
        onPress={onToggle}
        aria-hidden={!isOpen}
        className={`fixed inset-0 z-40 bg-black/30 md:hidden ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        // @ts-expect-error Web-only CSS transition property
        style={{ transition: "opacity 0.3s cubic-bezier(0.32, 0.72, 0, 1)" }}
      />

      <View
        className={`
          fixed left-0 top-0 z-50 flex h-dvh flex-col bg-sidebar
          md:relative md:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{
          width: isCollapsed ? 48 : 280,
          overflow: "hidden",
          // @ts-expect-error Web-only CSS transition property
          transition:
            "width 0.3s cubic-bezier(0.32, 0.72, 0, 1), translate 0.3s cubic-bezier(0.32, 0.72, 0, 1)",
        }}
      >
        {!isCollapsed && (
          <View className="flex flex-row items-center px-4 pt-5 pb-3">
            <View className="flex flex-1 flex-row items-center justify-between">
              <View className="gap-1">
                <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
                  LexiTech
                </Text>
                <Text className="text-[28px] font-bold text-foreground">
                  Dictionary
                </Text>
              </View>

              <View className="flex flex-row items-center gap-1">
                <Pressable
                  onPress={onToggle}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent md:hidden"
                >
                  <Text className="text-sm">x</Text>
                </Pressable>
                <Pressable
                  onPress={onCollapse}
                  className="hidden h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground md:flex"
                >
                  <PanelLeft size={18} strokeWidth={1.5} />
                </Pressable>
              </View>
            </View>
          </View>
        )}

        {!isCollapsed && (
          <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 8 }}>
            <Pressable
              onPress={goHome}
              className={`mx-2 rounded-[18px] px-4 py-3 ${
                pathname === "/"
                  ? "bg-accent"
                  : "active:bg-accent hover:bg-accent/50"
              }`}
            >
              <Text className="text-base font-medium text-foreground">Search</Text>
            </Pressable>

            <Text className="px-6 pt-6 pb-2 text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground/80">
              History
            </Text>

            {history.length > 0 ? (
              history.map((word) => (
                <Pressable
                  key={word}
                  onPress={() => handleHistoryPress(word)}
                  className={`mx-2 rounded-[18px] px-4 py-2.5 ${
                    activeSearchTerm.toLowerCase() === word.toLowerCase()
                      ? "bg-accent"
                      : "active:bg-accent hover:bg-accent/50"
                  }`}
                >
                  <Text
                    numberOfLines={1}
                    className={`text-[15px] ${
                      activeSearchTerm.toLowerCase() === word.toLowerCase()
                        ? "text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {word}
                  </Text>
                </Pressable>
              ))
            ) : (
              <Text className="px-6 text-[15px] leading-6 text-muted-foreground">
                Search for a word and it will appear here.
              </Text>
            )}
          </ScrollView>
        )}

        {isCollapsed && (
          <Tooltip.Provider delayDuration={200}>
            <View className="flex flex-col items-center gap-1 px-1.5 pt-3">
              <SidebarTooltip label="Open sidebar">
                <Pressable
                  onPress={onCollapse}
                  className="sidebar-toggle-btn flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <View className="sidebar-toggle-default">
                    <PanelLeft size={18} strokeWidth={1.5} />
                  </View>
                  <View className="sidebar-toggle-hover">
                    <PanelLeftOpen size={18} strokeWidth={1.5} />
                  </View>
                </Pressable>
              </SidebarTooltip>
              <SidebarTooltip label="Search">
                <Pressable
                  onPress={goHome}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Search size={18} strokeWidth={1.5} />
                </Pressable>
              </SidebarTooltip>
              <SidebarTooltip label="History">
                <View className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground">
                  <History size={18} strokeWidth={1.5} />
                </View>
              </SidebarTooltip>
            </View>
          </Tooltip.Provider>
        )}

        {isCollapsed && <View className="flex-1" />}

        {!isCollapsed && (
          <View className="gap-3 border-t border-border/40 px-4 py-4">
            <View className="flex-row items-center gap-2.5">
              <View className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background">
                <BookOpenText size={18} strokeWidth={1.5} />
              </View>
              <View className="flex-1">
                <Text className="text-[14px] font-medium text-foreground">
                  Free Dictionary API
                </Text>
                <Text className="text-[13px] leading-5 text-muted-foreground">
                  Meanings and audio appear only when the selected entry exposes
                  them.
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </>
  );
}

export function SidebarToggle({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <PanelLeft size={18} strokeWidth={1.5} />
    </Pressable>
  );
}
