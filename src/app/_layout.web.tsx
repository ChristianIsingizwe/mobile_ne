import { Sidebar, SidebarToggle } from "@/components/sidebar";
import "@/global.css";
import {
  DictionaryProvider,
  useDictionary,
} from "@/providers/dictionary-provider";
import { Slot } from "expo-router";
import { useState } from "react";
import { Text, View } from "react-native";

export default function RootLayout() {
  return (
    <DictionaryProvider>
      <WebLayout />
    </DictionaryProvider>
  );
}

function WebLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { activeSearchTerm, connectionStatus, status } = useDictionary();

  const statusLabel =
    connectionStatus === "offline" ? "offline" : status;

  return (
    <View className="flex h-dvh w-full flex-row bg-sidebar">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((value) => !value)}
        isCollapsed={sidebarCollapsed}
        onCollapse={() => setSidebarCollapsed((value) => !value)}
      />

      <View className="flex min-w-0 flex-1 flex-col">
        <View className="flex h-16 shrink-0 flex-row items-center gap-3 border-b border-border/60 bg-sidebar px-4">
          <View className="md:hidden">
            <SidebarToggle onPress={() => setSidebarOpen(true)} />
          </View>

          <View className="min-w-0 flex-1">
            <Text className="text-[13px] font-semibold uppercase tracking-[1.8px] text-muted-foreground">
              LexiTech Dictionary
            </Text>
            <Text className="truncate text-[16px] text-foreground">
              {activeSearchTerm || "Search any English word"}
            </Text>
          </View>

          <View className="rounded-full border border-border bg-background px-3 py-1.5">
            <Text className="text-[12px] font-medium uppercase tracking-[1.4px] text-muted-foreground">
              {statusLabel}
            </Text>
          </View>
        </View>

        <View className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background md:rounded-tl-xl md:border-l md:border-t md:border-border/40">
          <Slot />
        </View>
      </View>
    </View>
  );
}
