import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { CategoryChipList } from "../../components/CategoryChipList";
import { getFloatingTabBarHeight } from "../../components/FloatingTabBar";
import { PromptCard } from "../../components/PromptCard";
import { PromptCardSkeletonList } from "../../components/PromptCardSkeleton";
import { HOME_FEED_CATEGORIES } from "../../constants/categories";
import { ensureSamplePrompts, getPrompts } from "../../services/prompts";
import type { Prompt } from "../../types/prompt";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const listBottomPadding = getFloatingTabBarHeight(insets.bottom) + 8;
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(HOME_FEED_CATEGORIES[0]);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPrompts = useCallback(async () => {
    setIsLoading(true);

    try {
      await ensureSamplePrompts();
      const data = await getPrompts();
      setPrompts(data.filter((item) => item.id));
    } catch {
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  const trending = useMemo(
    () => [...prompts].sort((a, b) => b.saves - a.saves).slice(0, 3),
    [prompts]
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return prompts.filter((item) => {
      if (category !== "All" && item.category !== category) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.prompt.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [category, prompts, query]);

  const showTrending = !query.trim() && !isLoading;
  const trendingIds = new Set(trending.map((item) => item.id));
  const listData = showTrending
    ? filtered.filter((item) => !trendingIds.has(item.id))
    : filtered;

  const listHeader = (
    <View className="pb-4">
      {showTrending ? (
        <View>
          <Text className="text-[12px] font-medium uppercase tracking-[1.6px] text-[#7C5CFF]">
            Trending
          </Text>
          <View className="mt-3 gap-4">
            {trending.map((item) => (
              <PromptCard
                key={item.id}
                id={item.id!}
                title={item.title}
                category={item.category}
                saves={item.saves}
                prompt={item.prompt}
              />
            ))}
          </View>
        </View>
      ) : null}

      {query.trim() ? (
        <Text className="mt-6 text-[12px] font-medium uppercase tracking-[1.6px] text-[#6E768A]">
          Results
        </Text>
      ) : listData.length > 0 ? (
        <Text className="mt-6 text-[12px] font-medium uppercase tracking-[1.6px] text-[#6E768A]">
          More prompts
        </Text>
      ) : null}
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0B0D10]" edges={["top"]}>
      <View className="px-6 pb-4 pt-4">
        <Text className="text-[32px] font-bold text-white">Search</Text>
        <Text className="mt-1 text-[15px] text-[#8B93A7]">
          Find prompts and workflows
        </Text>

        <View className="mt-6 flex-row items-center rounded-2xl border border-[#2A3042] bg-[#151821] px-4 py-3.5">
          <Ionicons name="search-outline" size={18} color="#6E768A" />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search prompts..."
            placeholderTextColor="#6E768A"
            autoCapitalize="none"
            autoCorrect={false}
            className="ml-3 flex-1 text-[16px] text-white"
          />
          {query.length > 0 ? (
            <Pressable onPress={() => setQuery("")} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color="#6E768A" />
            </Pressable>
          ) : null}
        </View>

        <View className="mt-5">
          <CategoryChipList
            categories={HOME_FEED_CATEGORIES}
            selected={category}
            onSelect={setCategory}
          />
        </View>
      </View>

      {isLoading ? (
        <View className="px-6">
          <PromptCardSkeletonList count={3} />
        </View>
      ) : (
        <FlatList
          data={listData}
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
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            query.trim() || category !== "All" ? (
              <View className="items-center py-12">
                <Ionicons name="search-outline" size={28} color="#6E768A" />
                <Text className="mt-3 text-center text-[16px] font-semibold text-white">
                  No results found
                </Text>
                <Text className="mt-1 text-center text-[14px] text-[#8B93A7]">
                  Try another keyword or category.
                </Text>
              </View>
            ) : null
          }
          contentContainerClassName="px-6"
          contentContainerStyle={{ paddingBottom: listBottomPadding }}
          ItemSeparatorComponent={() => <View className="h-4" />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        />
      )}
    </SafeAreaView>
  );
}
