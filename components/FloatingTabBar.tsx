import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, Text, View, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";

type TabRoute = {
  key: string;
  name: string;
  params?: object;
};

export type FloatingTabBarProps = {
  state: {
    index: number;
    routes: TabRoute[];
  };
  descriptors: Record<
    string,
    {
      options: {
        title?: string;
      };
    }
  >;
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
    }) => { defaultPrevented?: boolean };
    navigate: (...args: [string] | [string, object | undefined]) => void;
  };
};

const COLORS = {
  bar: "#111827",
  primary: "#7C5CFF",
  muted: "#8B93A7",
  active: "#FFFFFF",
  ring: "rgba(255,255,255,0.14)",
};

const BAR_HEIGHT = 68;
const CORNER_RADIUS = 28;
const CENTER_BUTTON_SIZE = 58;
const NOTCH_DEPTH = 22;
const CENTER_BUTTON_LIFT = 6;

export function getFloatingTabBarHeight(insetsBottom = 0) {
  return (
    BAR_HEIGHT + insetsBottom + CENTER_BUTTON_SIZE / 2 + CENTER_BUTTON_LIFT
  );
}

type TabRouteName = "index" | "search" | "create" | "saved" | "profile";

type TabConfig = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused?: keyof typeof Ionicons.glyphMap;
  isCenter?: boolean;
};

const TAB_CONFIG: Record<TabRouteName, TabConfig> = {
  index: { label: "Home", icon: "home-outline", iconFocused: "home" },
  search: { label: "Search", icon: "search-outline", iconFocused: "search" },
  create: { label: "Create", icon: "add", isCenter: true },
  saved: { label: "Saved", icon: "bookmark-outline", iconFocused: "bookmark" },
  profile: { label: "Profile", icon: "person-outline", iconFocused: "person" },
};

function createNotchedPath(width: number, height: number) {
  const centerX = width / 2;
  const buttonRadius = CENTER_BUTTON_SIZE / 2;
  const notchRadius = buttonRadius + 10;
  const left = centerX - notchRadius - 14;
  const right = centerX + notchRadius + 14;

  return `
    M 0 ${height}
    L 0 ${CORNER_RADIUS}
    Q 0 0 ${CORNER_RADIUS} 0
    L ${left} 0
    C ${left + 18} 0 ${centerX - notchRadius + 6} ${NOTCH_DEPTH} ${centerX} ${NOTCH_DEPTH}
    C ${centerX + notchRadius - 6} ${NOTCH_DEPTH} ${right - 18} 0 ${right} 0
    L ${width - CORNER_RADIUS} 0
    Q ${width} 0 ${width} ${CORNER_RADIUS}
    L ${width} ${height}
    Z
  `;
}

type TabItemProps = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconFocused?: keyof typeof Ionicons.glyphMap;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function TabItem({
  label,
  icon,
  iconFocused,
  focused,
  onPress,
  onLongPress,
}: TabItemProps) {
  const iconName = focused && iconFocused ? iconFocused : icon;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="min-w-0 flex-1 items-center justify-end pb-2.5 pt-3"
      accessibilityRole="button"
      accessibilityState={{ selected: focused }}
    >
      <Ionicons
        name={iconName}
        size={22}
        color={focused ? COLORS.active : COLORS.muted}
      />
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        allowFontScaling={false}
        className="mt-1 w-full px-0.5 text-center text-[10px] leading-[12px]"
        style={{ color: focused ? COLORS.active : COLORS.muted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type CenterTabProps = {
  label: string;
  focused: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function CenterTab({ label, focused, onPress, onLongPress }: CenterTabProps) {
  return (
    <View className="min-w-0 flex-1 items-center">
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="button"
        accessibilityState={{ selected: focused }}
        className="items-center"
        style={{ marginTop: -(CENTER_BUTTON_SIZE / 2 + 6) }}
      >
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: CENTER_BUTTON_SIZE,
            height: CENTER_BUTTON_SIZE,
            backgroundColor: COLORS.primary,
            borderWidth: 3,
            borderColor: COLORS.ring,
            shadowColor: COLORS.primary,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: focused ? 0.55 : 0.4,
            shadowRadius: focused ? 16 : 12,
            elevation: focused ? 12 : 8,
          }}
        >
          <Ionicons name="add" size={28} color={COLORS.active} />
        </View>
      </Pressable>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        allowFontScaling={false}
        className="mt-1.5 w-full px-0.5 text-center text-[10px] leading-[12px]"
        style={{ color: focused ? COLORS.active : COLORS.muted }}
      >
        {label}
      </Text>
    </View>
  );
}

export function FloatingTabBar({
  state,
  descriptors,
  navigation,
}: FloatingTabBarProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const totalHeight = BAR_HEIGHT + insets.bottom;

  return (
    <View
      className="absolute bottom-0 left-0 right-0"
      style={{
        height: totalHeight + CENTER_BUTTON_SIZE / 2,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 16,
      }}
    >
      <View style={{ height: totalHeight + CENTER_BUTTON_SIZE / 2 }}>
        <Svg
          width={width}
          height={totalHeight}
          style={{ position: "absolute", bottom: 0, left: 0 }}
        >
          <Path d={createNotchedPath(width, totalHeight)} fill={COLORS.bar} />
        </Svg>

        <View
          className="absolute bottom-0 left-0 right-0 flex-row items-end"
          style={{
            height: totalHeight,
            paddingBottom: insets.bottom,
          }}
        >
          {state.routes.map((route, index) => {
            const config = TAB_CONFIG[route.name as TabRouteName];
            if (!config) {
              return null;
            }

            const isFocused = state.index === index;
            const { options } = descriptors[route.key];

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: "tabLongPress",
                target: route.key,
              });
            };

            if (config.isCenter) {
              return (
                <CenterTab
                  key={route.key}
                  label={options.title ?? config.label}
                  focused={isFocused}
                  onPress={onPress}
                  onLongPress={onLongPress}
                />
              );
            }

            return (
              <TabItem
                key={route.key}
                label={options.title ?? config.label}
                icon={config.icon}
                iconFocused={config.iconFocused}
                focused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}
