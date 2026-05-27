import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryChipList } from "../../components/CategoryChipList";
import { getFloatingTabBarHeight } from "../../components/FloatingTabBar";
import { PromptCard } from "../../components/PromptCard";
import { PromptCardSkeletonList } from "../../components/PromptCardSkeleton";
import { HOME_FEED_CATEGORIES } from "../../constants/categories";
import { getPrompts, ensureSamplePrompts } from "../../services/prompts";
import type { Prompt } from "../../types/prompt";
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const SKELETON_COUNT = 4;

function FeedEmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <View className="items-center justify-center rounded-3xl border border-dashed border-[#2A3042] bg-[#10131A] px-6 py-14">
      <Ionicons name="document-text-outline" size={32} color="#6E768A" />
      <Text className="mt-4 text-center text-[17px] font-semibold text-white">
        {isFiltered ? "No prompts in this category" : "No prompts yet"}
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-[22px] text-[#8B93A7]">
        {isFiltered
          ? "Try another category or pull down to refresh."
          : "Be the first to publish a workflow from the Create tab."}
      </Text>
    </View>
  );
}

function FeedErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View className="items-center justify-center rounded-3xl border border-[#FF6B6B]/30 bg-[#2A1518] px-6 py-10">
      <Ionicons name="cloud-offline-outline" size={32} color="#FF6B6B" />
      <Text className="mt-4 text-center text-[15px] font-semibold text-white">
        Couldn&apos;t load prompts
      </Text>
      <Text className="mt-2 text-center text-[14px] leading-[22px] text-[#FF8A8A]">
        {message}
      </Text>
      <Pressable
        onPress={onRetry}
        className="mt-5 rounded-full bg-[#7C5CFF] px-5 py-2.5 active:opacity-90"
      >
        <Text className="text-[14px] font-semibold text-white">Try again</Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = getFloatingTabBarHeight(insets.bottom) + 8;
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(
    HOME_FEED_CATEGORIES[0]
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      await ensureSamplePrompts();
      const data = await getPrompts();
      setPrompts(data.filter((item) => item.id));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
      if (!isRefresh) {
        setPrompts([]);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const filteredPrompts = useMemo(() => {
    if (selectedCategory === "All") return prompts;
    return prompts.filter((item) => item.category === selectedCategory);
  }, [prompts, selectedCategory]);

  const showInitialLoading = isLoading && prompts.length === 0 && !error;
  const isFilteredEmpty =
    !isLoading && !error && filteredPrompts.length === 0;

  const listFooter = showInitialLoading ? (
    <PromptCardSkeletonList count={SKELETON_COUNT} />
  ) : null;

  const listEmpty = !showInitialLoading ? (
    <View className="pb-8">
      {error ? (
        <FeedErrorState message={error} onRetry={() => fetchPrompts()} />
      ) : isFilteredEmpty ? (
        <FeedEmptyState isFiltered={selectedCategory !== "All"} />
      ) : null}
    </View>
  ) : null;

  return (
    <SafeAreaView className="flex-1 bg-[#0B0D10]" edges={["top"]}>
      <View className="px-6 pb-4 pt-4">
        <Text className="text-[34px] font-bold tracking-tight text-white">
          Discover
        </Text>
        <Text className="mt-2 text-[15px] leading-6 text-[#A0A8B8]">
          Explore AI workflows that work
        </Text>

        <View className="mt-5">
          <CategoryChipList
            categories={HOME_FEED_CATEGORIES}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </View>

        <Text className="mt-6 text-[13px] font-semibold uppercase tracking-[1.6px] text-[#7C5CFF]">
          Trending Today
        </Text>
      </View>

      <FlatList
        data={showInitialLoading ? [] : filteredPrompts}
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
        ListFooterComponent={listFooter}
        ListEmptyComponent={listEmpty}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchPrompts(true)}
            tintColor="#7C5CFF"
            colors={["#7C5CFF"]}
          />
        }
      />
    </SafeAreaView>
  );
}
