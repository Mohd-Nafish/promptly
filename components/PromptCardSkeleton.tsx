import { LinearGradient } from "expo-linear-gradient";
import { useEffect } from "react";
import { View, type ViewStyle } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

type SkeletonBoneProps = {
  className?: string;
  style?: ViewStyle;
  delay?: number;
};

function SkeletonBone({ className = "", style, delay = 0 }: SkeletonBoneProps) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withDelay(
      delay,
      withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.linear }),
        -1,
        false
      )
    );
  }, [delay, shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -120 + shimmer.value * 240 }],
  }));

  return (
    <View
      className={`overflow-hidden bg-[#1A1E28] ${className}`}
      style={style}
    >
      <Animated.View
        style={[
          shimmerStyle,
          {
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 120,
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(124, 92, 255, 0)",
            "rgba(124, 92, 255, 0.12)",
            "rgba(255, 255, 255, 0.08)",
            "rgba(124, 92, 255, 0)",
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}

type PromptCardSkeletonProps = {
  index?: number;
};

export function PromptCardSkeleton({ index = 0 }: PromptCardSkeletonProps) {
  const delay = index * 120;

  return (
    <View className="rounded-[24px] border border-[#242938] bg-[#151821] p-5">
      <View className="rounded-full border border-[#2A3042] bg-[#10131A] px-3 py-1 self-start">
        <SkeletonBone
          className="h-3 w-16 rounded-full"
          delay={delay}
        />
      </View>

      <SkeletonBone
        className="mt-4 h-[22px] w-[78%] rounded-xl"
        delay={delay + 80}
      />

      <SkeletonBone
        className="mt-3 h-3.5 w-full rounded-lg"
        delay={delay + 140}
      />
      <SkeletonBone
        className="mt-2 h-3.5 w-[92%] rounded-lg"
        delay={delay + 180}
      />
      <SkeletonBone
        className="mt-2 h-3.5 w-[68%] rounded-lg"
        delay={delay + 220}
      />

      <View className="mt-5 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <SkeletonBone
            className="h-4 w-4 rounded-full"
            delay={delay + 260}
          />
          <SkeletonBone
            className="h-3.5 w-12 rounded-lg"
            delay={delay + 300}
          />
        </View>

        <View className="rounded-full border border-[#2A3042] bg-[#0F1218] px-3 py-2">
          <SkeletonBone
            className="h-4 w-[72px] rounded-full"
            delay={delay + 340}
          />
        </View>
      </View>
    </View>
  );
}

type PromptCardSkeletonListProps = {
  count?: number;
};

export function PromptCardSkeletonList({ count = 4 }: PromptCardSkeletonListProps) {
  return (
    <View className="gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <PromptCardSkeleton key={`prompt-skeleton-${index}`} index={index} />
      ))}
    </View>
  );
}
