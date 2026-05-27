import Ionicons from "@expo/vector-icons/Ionicons";
import * as Clipboard from "expo-clipboard";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { mockPrompts } from "../../constants/mockPrompts";
import { useSavedStore } from "../../store/savedStore";
import type { Prompt } from "../../types/prompt";

type PromptParams = {
  id: string;
  title?: string;
  category?: string;
  prompt?: string;
  saves?: string;
};

type PromptData = {
  id: string;
  title: string;
  category: string;
  prompt: string;
  saves: number;
};

const DEFAULT_VARIABLES = ["topic", "tone", "audience", "goal"];

function extractVariables(text: string): string[] {
  const matches = text.match(/\{\{([^}]+)\}\}/g);
  if (!matches) return DEFAULT_VARIABLES;

  const unique = [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, "").trim()))];
  return unique.length > 0 ? unique : DEFAULT_VARIABLES;
}

function toSavedPrompt(data: PromptData): Prompt {
  return {
    id: data.id,
    title: data.title,
    category: data.category,
    prompt: data.prompt,
    tags: [],
    saves: data.saves,
    createdAt: Date.now(),
    userId: "",
  };
}

function Divider() {
  return <View className="my-10 h-px bg-[#1E2330]" />;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <Text className="text-[12px] font-medium uppercase tracking-[1.8px] text-[#6E768A]">
      {children}
    </Text>
  );
}

function PageTitle({ children }: { children: string }) {
  return (
    <Text className="mt-6 text-[36px] font-bold leading-[44px] tracking-[-0.4px] text-white">
      {children}
    </Text>
  );
}

function MutedText({
  children,
  className = "",
  ...props
}: {
  children: string;
  className?: string;
} & Pick<React.ComponentProps<typeof Text>, "numberOfLines">) {
  return (
    <Text
      className={`text-[15px] leading-[24px] text-[#8B93A7] ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

function BodyText({
  children,
  className = "",
  ...props
}: {
  children: string;
  className?: string;
} & Pick<React.ComponentProps<typeof Text>, "numberOfLines">) {
  return (
    <Text
      className={`text-[16px] leading-[26px] text-[#E4E7EF] ${className}`}
      {...props}
    >
      {children}
    </Text>
  );
}

function SectionBlock({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <View>
      <SectionLabel>{label}</SectionLabel>
      {description ? <MutedText className="mt-2">{description}</MutedText> : null}
      <View className="mt-5">{children}</View>
    </View>
  );
}

function TitleGlow({ children }: { children: React.ReactNode }) {
  return (
    <View className="relative -mx-2 mb-1 overflow-hidden px-2 pb-2 pt-1">
      <LinearGradient
        pointerEvents="none"
        colors={[
          "rgba(124, 92, 255, 0.16)",
          "rgba(77, 162, 255, 0.09)",
          "rgba(11, 13, 16, 0)",
        ]}
        locations={[0, 0.45, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          position: "absolute",
          left: -32,
          right: -32,
          top: -28,
          height: 200,
        }}
      />
      <View className="relative">{children}</View>
    </View>
  );
}

type CopyFeedbackProps = {
  copied: boolean;
  onPress: () => void;
  copiedProgress: Animated.SharedValue<number>;
  buttonScale: Animated.SharedValue<number>;
};

function CopyActionButton({
  copied,
  onPress,
  copiedProgress,
  buttonScale,
}: CopyFeedbackProps) {
  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    backgroundColor: interpolateColor(
      copiedProgress.value,
      [0, 1],
      ["#151821", "#1A1630"]
    ),
    borderColor: interpolateColor(
      copiedProgress.value,
      [0, 1],
      ["#2A3042", "#7C5CFF"]
    ),
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 0.85 + copiedProgress.value * 0.15 }],
  }));

  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-95">
      <Animated.View
        style={animatedButtonStyle}
        className="flex-row items-center justify-center gap-2 rounded-2xl border py-3.5"
      >
        <Animated.View style={iconStyle}>
          <Ionicons
            name={copied ? "checkmark-circle" : "copy-outline"}
            size={18}
            color="#7C5CFF"
          />
        </Animated.View>
        <Text
          className={`text-[14px] font-semibold ${
            copied ? "text-[#7C5CFF]" : "text-white"
          }`}
        >
          {copied ? "Copied" : "Copy"}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

type SaveActionButtonProps = {
  saved: boolean;
  onPress: () => void;
};

function SaveActionButton({ saved, onPress }: SaveActionButtonProps) {
  return (
    <Pressable onPress={onPress} className="flex-1 active:opacity-95">
      <View
        className={`flex-row items-center justify-center gap-2 rounded-2xl border py-3.5 ${
          saved
            ? "border-[#7C5CFF] bg-[#1A1630]"
            : "border-[#2A3042] bg-[#151821]"
        }`}
      >
        <Ionicons
          name={saved ? "bookmark" : "bookmark-outline"}
          size={18}
          color={saved ? "#7C5CFF" : "#A0A8B8"}
        />
        <Text
          className={`text-[14px] font-semibold ${
            saved ? "text-[#7C5CFF]" : "text-white"
          }`}
        >
          {saved ? "Saved" : "Save"}
        </Text>
      </View>
    </Pressable>
  );
}

export default function PromptDetailScreen() {
  const params = useLocalSearchParams<PromptParams>();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const prompt = useMemo<PromptData | undefined>(() => {
    if (params.title && params.prompt) {
      return {
        id: String(params.id),
        title: params.title,
        category: params.category ?? "",
        prompt: params.prompt,
        saves: Number(params.saves ?? 0),
      };
    }

    return mockPrompts.find((item) => item.id === params.id);
  }, [params]);

  const variables = useMemo(
    () => (prompt ? extractVariables(prompt.prompt) : []),
    [prompt]
  );

  const relatedPrompts = useMemo(
    () => mockPrompts.filter((item) => item.id !== prompt?.id).slice(0, 2),
    [prompt?.id]
  );

  const [copied, setCopied] = useState(false);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saved = useSavedStore((state) =>
    prompt ? state.isSaved(prompt.id) : false
  );
  const togglePrompt = useSavedStore((state) => state.togglePrompt);

  const handleToggleSave = useCallback(() => {
    if (prompt) {
      togglePrompt(toSavedPrompt(prompt));
    }
  }, [prompt, togglePrompt]);

  const copiedProgress = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const toastOpacity = useSharedValue(0);
  const toastTranslateY = useSharedValue(-16);

  const toastStyle = useAnimatedStyle(() => ({
    opacity: toastOpacity.value,
    transform: [{ translateY: toastTranslateY.value }],
  }));

  const triggerCopyFeedback = useCallback(() => {
    copiedProgress.value = withSequence(
      withTiming(1, { duration: 220 }),
      withTiming(1, { duration: 1500 }),
      withTiming(0, { duration: 280 })
    );

    buttonScale.value = withSequence(
      withSpring(0.94, { damping: 14, stiffness: 320 }),
      withSpring(1.04, { damping: 12, stiffness: 280 }),
      withSpring(1, { damping: 14, stiffness: 300 })
    );

    toastOpacity.value = withSequence(
      withTiming(1, { duration: 280 }),
      withTiming(1, { duration: 1400 }),
      withTiming(0, { duration: 320 })
    );

    toastTranslateY.value = withSequence(
      withSpring(0, { damping: 16, stiffness: 260 }),
      withTiming(0, { duration: 1400 }),
      withTiming(-10, { duration: 280 })
    );
  }, [buttonScale, copiedProgress, toastOpacity, toastTranslateY]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!prompt) return;

    await Clipboard.setStringAsync(prompt.prompt);

    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }

    setCopied(true);
    triggerCopyFeedback();

    copyTimeoutRef.current = setTimeout(() => {
      setCopied(false);
      copyTimeoutRef.current = null;
    }, 2000);
  }, [prompt, triggerCopyFeedback]);

  if (!prompt) {
    return (
      <SafeAreaView className="flex-1 bg-[#0B0D10] px-6">
        <Pressable
          onPress={() => router.back()}
          className="mt-4 flex-row items-center gap-2 active:opacity-80"
        >
          <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          <Text className="text-[15px] text-white">Back</Text>
        </Pressable>
        <Text className="mt-10 text-[16px] text-[#8B93A7]">Prompt not found.</Text>
      </SafeAreaView>
    );
  }

  const bottomBarHeight = 88 + insets.bottom;

  return (
    <View className="flex-1 bg-[#0B0D10]">
      <Animated.View
        pointerEvents="none"
        style={toastStyle}
        className="absolute left-6 right-6 z-50"
      >
        <View
          className="flex-row items-center gap-2 rounded-2xl border border-[#7C5CFF]/40 bg-[#151821] px-4 py-3 shadow-lg"
          style={{ marginTop: insets.top + 8 }}
        >
          <Ionicons name="checkmark-circle" size={18} color="#7C5CFF" />
          <Text className="text-[14px] font-semibold text-white">
            Copied to clipboard
          </Text>
        </View>
      </Animated.View>

      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pb-8 pt-3">
          <View className="flex-row items-center justify-between">
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-1 active:opacity-70"
            >
              <Ionicons name="chevron-back" size={22} color="#8B93A7" />
              <Text className="text-[15px] leading-[22px] font-medium text-[#8B93A7]">
                Back
              </Text>
            </Pressable>

            <Pressable
              onPress={handleToggleSave}
              className={`rounded-full border p-2.5 active:opacity-90 ${
                saved
                  ? "border-[#7C5CFF] bg-[#1A1630]"
                  : "border-[#2A3042] bg-[#151821]"
              }`}
            >
              <Ionicons
                name={saved ? "bookmark" : "bookmark-outline"}
                size={20}
                color={saved ? "#7C5CFF" : "#A0A8B8"}
              />
            </Pressable>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerClassName="px-6"
          contentContainerStyle={{ paddingBottom: bottomBarHeight + 32 }}
          showsVerticalScrollIndicator={false}
        >
          <TitleGlow>
            <View className="self-start rounded-full border border-[#2A3042] bg-[#151821]/80 px-3.5 py-1.5">
              <Text className="text-[12px] font-semibold leading-[18px] tracking-wide text-[#7C5CFF]">
                {prompt.category}
              </Text>
            </View>

            <PageTitle>{prompt.title}</PageTitle>

            <View className="mt-3 flex-row items-center gap-2">
              <Ionicons name="bookmark-outline" size={15} color="#6E768A" />
              <MutedText className="text-[14px] leading-[22px]">
                {prompt.saves.toLocaleString()} saves
              </MutedText>
            </View>
          </TitleGlow>

          <Divider />

          <View>
            <View className="flex-row items-center justify-between">
              <SectionLabel>Prompt</SectionLabel>
              <Pressable
                onPress={handleCopy}
                className="flex-row items-center gap-1.5 rounded-full border border-[#2A3042] bg-[#151821] px-3 py-1.5 active:opacity-90"
              >
                <Ionicons
                  name={copied ? "checkmark" : "copy-outline"}
                  size={14}
                  color="#7C5CFF"
                />
                <Text className="text-[12px] font-semibold leading-[18px] text-[#8B93A7]">
                  {copied ? "Copied" : "Copy"}
                </Text>
              </Pressable>
            </View>

            <View className="mt-5 rounded-2xl border border-[#242938] bg-[#151821] px-5 py-5">
              <BodyText>{prompt.prompt}</BodyText>
            </View>
          </View>

          <Divider />

          <SectionBlock
            label="Variables"
            description="Customize these placeholders when you remix this prompt."
          >
            <View className="flex-row flex-wrap gap-2.5">
              {variables.map((variable) => (
                <View
                  key={variable}
                  className="rounded-xl border border-[#2A3042] bg-[#151821] px-3.5 py-2.5"
                >
                  <Text className="text-[14px] leading-[20px] tracking-wide text-[#C4CAD8]">
                    {`{{${variable}}}`}
                  </Text>
                </View>
              ))}
            </View>
          </SectionBlock>

          <Divider />

          <SectionBlock
            label="Related prompts"
            description="More workflows you might like"
          >
            <View className="gap-3.5">
              {relatedPrompts.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() =>
                    router.push({
                      pathname: "/prompt/[id]",
                      params: {
                        id: item.id,
                        title: item.title,
                        category: item.category,
                        prompt: item.prompt,
                        saves: String(item.saves),
                      },
                    })
                  }
                  className="rounded-2xl border border-[#242938] bg-[#151821] px-5 py-4 active:opacity-90"
                >
                  <Text className="text-[11px] font-medium uppercase tracking-[1.4px] text-[#7C5CFF]">
                    {item.category}
                  </Text>
                  <Text className="mt-2.5 text-[17px] font-semibold leading-[24px] text-white">
                    {item.title}
                  </Text>
                  <MutedText className="mt-2 text-[14px] leading-[22px]" numberOfLines={2}>
                    {item.prompt}
                  </MutedText>
                </Pressable>
              ))}

              <View className="items-center justify-center rounded-2xl border border-dashed border-[#2A3042] bg-[#10131A] px-5 py-10">
                <Ionicons name="sparkles-outline" size={20} color="#6E768A" />
                <MutedText className="mt-2.5 text-center text-[14px] leading-[22px]">
                  More related prompts coming soon
                </MutedText>
              </View>
            </View>
          </SectionBlock>
        </ScrollView>
      </SafeAreaView>

      <View
        className="absolute bottom-0 left-0 right-0 border-t border-[#1E2330] bg-[#0F1218]/95 px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <View className="flex-row items-center gap-2">
          <CopyActionButton
            copied={copied}
            onPress={handleCopy}
            copiedProgress={copiedProgress}
            buttonScale={buttonScale}
          />

          <SaveActionButton saved={saved} onPress={handleToggleSave} />

          <Pressable
            onPress={() => router.push("/(tabs)/create")}
            className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[#2A3042] bg-[#151821] py-3.5 active:opacity-90"
          >
            <Ionicons name="shuffle-outline" size={18} color="#7C5CFF" />
            <Text className="text-[14px] font-semibold text-white">Remix</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
