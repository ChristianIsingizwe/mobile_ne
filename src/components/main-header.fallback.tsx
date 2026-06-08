import { Icon } from "@/components/icon";
import { Stack } from "expo-router";
import { Menu } from "lucide-react-native";
import { Pressable } from "react-native";

import { useDrawer } from "./drawer-content";

export function MainHeader() {
  const { openDrawer } = useDrawer();

  return (
    <Stack.Screen
      options={{
        headerLeft: () => (
          <Pressable
            onPress={openDrawer}
            accessibilityLabel="Open drawer"
            accessibilityRole="button"
            className="p-2 -ml-1 active:opacity-60"
          >
            <Icon icon={Menu} className="h-6 w-6 text-foreground" />
          </Pressable>
        ),
        headerRight: undefined,
      }}
    />
  );
}
