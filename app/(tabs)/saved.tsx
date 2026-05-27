import Ionicons from "@expo/vector-icons/Ionicons";
import { useMemo } from "react";
import { getFloatingTabBarHeight } from "../../components/FloatingTabBar";
import { PromptCard } from "../../components/PromptCard";
import { useSavedStore } from "../../store/savedStore";
import { FlatList, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SavedScreen() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = getFloatingTabBarHeight(insets.bottom) + 8;
  const savedPrompts = useSavedStore((state) => state.savedPrompts);

  const items = useMemo(
    () => savedPrompts.filter((item) => item.id),
    [savedPrompts]
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0B0D10]" edges={["top"]}>
      <View className="px-6 pb-4 pt-4">
        <Text className="text-[32px] font-bold text-white">Saved</Text>
        <Text className="mt-2 text-[15px] leading-6 text-[#8B93A7]">
          Prompts you bookmarked for later
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id!}
        renderItem={({ item }) => (
          <PromptCard
            id={item.id!}
            title={item.title}
            category={item.category}
            saves={item.saves}
            prompt={item.prompt}
          />
        )}
        contentContainerClassName="grow px-6"
        contentContainerStyle={{ paddingBottom: listBottomPadding }}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View className="items-center rounded-3xl border border-dashed border-[#2A3042] bg-[#10131A] px-6 py-14">
            <Ionicons name="bookmark-outline" size={32} color="#6E768A" />
            <Text className="mt-4 text-center text-[17px] font-semibold text-white">
              No saved prompts
            </Text>
            <Text className="mt-2 text-center text-[14px] leading-[22px] text-[#8B93A7]">
              Save prompts from Home or a prompt detail page to see them here.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
