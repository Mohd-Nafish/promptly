import Ionicons from "@expo/vector-icons/Ionicons";
import { getFloatingTabBarHeight } from "../../components/FloatingTabBar";
import { useRouter } from "expo-router";
import { signOut } from "firebase/auth";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { auth } from "../../services/firebase";
import { useSavedStore } from "../../store/savedStore";

type StatItemProps = {
  label: string;
  value: number;
};

function StatItem({ label, value }: StatItemProps) {
  return (
    <View className="min-w-0 flex-1 items-center">
      <Text className="text-[22px] font-bold text-white">{value}</Text>
      <Text className="mt-1 text-[12px] text-[#8B93A7]">{label}</Text>
    </View>
  );
}

type MenuItemProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  destructive?: boolean;
};

function MenuItem({ icon, label, onPress, destructive = false }: MenuItemProps) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-4 active:opacity-70"
      accessibilityRole="button"
    >
      <View className="h-9 w-9 items-center justify-center rounded-xl bg-[#1C2230]">
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? "#FF6B6B" : "#A0A8B8"}
        />
      </View>
      <Text
        className={`ml-3 flex-1 text-[15px] font-medium ${
          destructive ? "text-[#FF6B6B]" : "text-white"
        }`}
      >
        {label}
      </Text>
      {!destructive ? (
        <Ionicons name="chevron-forward" size={18} color="#6E768A" />
      ) : null}
    </Pressable>
  );
}

function MenuDivider() {
  return <View className="mx-4 h-px bg-[#2A3042]" />;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = getFloatingTabBarHeight(insets.bottom) + 8;
  const router = useRouter();
  const savedCount = useSavedStore((state) => state.savedPrompts.length);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(auth);
          } catch {
            Alert.alert("Error", "Could not log out. Please try again.");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0B0D10]" edges={["top"]}>
      <View className="px-6 pb-5 pt-4">
        <Text className="text-[32px] font-bold text-white">Profile</Text>

        <View className="mt-6 items-center">
          <View className="h-24 w-24 items-center justify-center rounded-full border border-[#2A3042] bg-[#151821]">
            <Ionicons name="person" size={40} color="#6E768A" />
          </View>

          <Text className="mt-4 text-[20px] font-semibold text-white">
            Promptly User
          </Text>
          <Text className="mt-2 max-w-[280px] text-center text-[14px] leading-[22px] text-[#8B93A7]">
            Building and saving AI prompts for smarter workflows.
          </Text>
        </View>

        <View className="mt-6 flex-row rounded-2xl border border-[#2A3042] bg-[#151821] px-2 py-4">
          <StatItem label="Prompts" value={0} />
          <View className="w-px self-stretch bg-[#2A3042]" />
          <StatItem label="Saved" value={savedCount} />
          <View className="w-px self-stretch bg-[#2A3042]" />
          <StatItem label="Likes" value={0} />
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerClassName="px-6"
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-2xl border border-[#2A3042] bg-[#151821]">
          <MenuItem
            icon="bookmark-outline"
            label="Saved Prompts"
            onPress={() => router.push("/saved")}
          />
          <MenuDivider />
          <MenuItem
            icon="settings-outline"
            label="Settings"
            onPress={() =>
              Alert.alert("Settings", "Settings will be available soon.")
            }
          />
          <MenuDivider />
          <MenuItem
            icon="information-circle-outline"
            label="About"
            onPress={() =>
              Alert.alert(
                "About Promptly",
                "Discover, save, and share AI prompts in one place."
              )
            }
          />
          <MenuDivider />
          <MenuItem
            icon="log-out-outline"
            label="Logout"
            onPress={handleLogout}
            destructive
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
