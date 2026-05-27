import { Pressable, Text } from "react-native";

export type CategoryChipProps = {
  label: string;
  active?: boolean;
  onPress?: () => void;
};

export function CategoryChip({ label, active = false, onPress }: CategoryChipProps) {
  return (
    <Pressable
      onPress={onPress}
      className={`mr-3 items-center justify-center rounded-full border px-4 py-2 active:opacity-90 ${
        active
          ? "border-[#7C5CFF] bg-[#7C5CFF]"
          : "border-[#2B3142] bg-[#151821]"
      }`}
    >
      <Text
        className={`text-center text-[13px] font-semibold ${
          active ? "text-white" : "text-[#A0A8B8]"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
