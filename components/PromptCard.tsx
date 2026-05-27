import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { useSavedStore } from "../store/savedStore";

export type PromptCardProps = {
  id: string;
  title: string;
  category: string;
  saves: number;
  prompt: string;
  onCopyPress?: () => void;
};

export function PromptCard({
  id,
  title,
  category,
  saves,
  prompt,
  onCopyPress,
}: PromptCardProps) {
  const router = useRouter();
  const saved = useSavedStore((state) => state.isSaved(id));
  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handlePress = useCallback(() => {
    router.push({
      pathname: "/prompt/[id]",
      params: {
        id,
        title,
        category,
        prompt,
        saves: String(saves),
      },
    });
  }, [router, id, title, category, prompt, saves]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(prompt);
    onCopyPress?.();

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    setCopied(true);
    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 2000);
  }, [prompt, onCopyPress]);

  return (
    <Pressable
      onPress={handlePress}
      className="rounded-[24px] border border-[#242938] bg-[#151821] p-5 active:opacity-95"
    >
      <View className="flex-row items-center justify-between">
        <View className="rounded-full border border-[#2A3042] bg-[#10131A] px-3 py-1">
          <Text className="text-[12px] font-semibold tracking-wide text-[#A0A8B8]">
            {category}
          </Text>
        </View>
      </View>

      <Text className="mt-4 text-[18px] font-bold leading-6 text-white">
        {title}
      </Text>

      <Text
        className="mt-2 text-[14px] leading-6 text-[#A0A8B8]"
        numberOfLines={3}
      >
        {prompt}
      </Text>

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <Ionicons
            name={saved ? "bookmark" : "bookmark-outline"}
            size={16}
            color={saved ? "#7C5CFF" : "#A0A8B8"}
          />
          <Text
            className={`text-[13px] font-semibold ${
              saved ? "text-[#7C5CFF]" : "text-[#A0A8B8]"
            }`}
          >
            {saves.toLocaleString()}
          </Text>
        </View>

        <Pressable
          onPress={(event) => {
            event.stopPropagation();
            handleCopy();
          }}
          hitSlop={10}
          className={`flex-row items-center gap-2 rounded-full border px-3 py-2 active:opacity-90 ${
            copied
              ? "border-[#7C5CFF] bg-[#1A1630]"
              : "border-[#2A3042] bg-[#0F1218]"
          }`}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={16}
            color="#7C5CFF"
          />
          <Text
            className={`text-[13px] font-semibold ${
              copied ? "text-[#7C5CFF]" : "text-white"
            }`}
          >
            {copied ? "Copied" : "Copy"}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}
