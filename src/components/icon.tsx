import {
  StyleSheet,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { withUniwind } from "uniwind";
import type { LucideIcon } from "lucide-react-native";

type IconStyle = {
  color?: string;
  height?: number;
  width?: number;
};

function IconBase({
  icon: Icon,
  style,
  strokeWidth,
}: {
  icon: LucideIcon;
  style?: StyleProp<TextStyle | ViewStyle | ImageStyle>;
  strokeWidth?: number;
  className?: string;
}) {
  const flat = (StyleSheet.flatten(style) || {}) as IconStyle;
  const size = flat.width ?? flat.height ?? 24;
  const color = flat.color ?? "currentColor";
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}

export const Icon = withUniwind(IconBase);
