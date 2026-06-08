import * as Application from "expo-application";
import { Icon } from "@/components/icon";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Stack } from "expo-router";
import { CircleHelp } from "lucide-react-native";
import { Alert, Pressable } from "react-native";
import { useCSSVariable } from "uniwind";

const GLASS = isLiquidGlassAvailable();

export default function SettingsLayout() {
  const appForeground = useCSSVariable("--app-foreground") as string;
  const appBackground = useCSSVariable("--app-background") as string;
  const appVersion = `${Application.applicationName} v${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`;

  return (
    <Stack
      screenOptions={{
        headerTransparent: GLASS,
        headerLargeTitleShadowVisible: false,
        headerBackButtonDisplayMode: GLASS ? "minimal" : "default",
        headerTintColor: appForeground,
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: appBackground,
        },
      }}
    >
      <Stack.Screen
        name="settings"
        options={{
          title: "Settings",
          headerRight: () => (
            <Pressable
              onPress={() => Alert.alert("App info", appVersion)}
              accessibilityLabel="Show app info"
              accessibilityRole="button"
              className="p-2 active:opacity-60"
            >
              <Icon icon={CircleHelp} className="w-5 h-5 text-foreground" />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
    </Stack>
  );
}
