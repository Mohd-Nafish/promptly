import Ionicons from "@expo/vector-icons/Ionicons";
import { useCallback, useState } from "react";
import { Pressable, Text, TextInput, View, type TextInputProps } from "react-native";

type TagsInputProps = {
  tags: string[];
  onChangeTags: (tags: string[]) => void;
  placeholder?: string;
  onFocus?: TextInputProps["onFocus"];
};

function normalizeTag(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function TagsInput({
  tags,
  onChangeTags,
  placeholder = "Type a tag and press enter",
  onFocus,
}: TagsInputProps) {
  const [input, setInput] = useState("");

  const addTag = useCallback(() => {
    const next = normalizeTag(input);
    if (!next) return;

    const exists = tags.some((tag) => tag.toLowerCase() === next.toLowerCase());
    if (!exists) {
      onChangeTags([...tags, next]);
    }

    setInput("");
  }, [input, onChangeTags, tags]);

  const removeTag = useCallback(
    (tagToRemove: string) => {
      onChangeTags(tags.filter((tag) => tag !== tagToRemove));
    },
    [onChangeTags, tags]
  );

  return (
    <View>
      <TextInput
        value={input}
        onChangeText={setInput}
        onFocus={onFocus}
        onSubmitEditing={addTag}
        onKeyPress={({ nativeEvent }) => {
          if (nativeEvent.key === "Enter") {
            addTag();
          }
        }}
        placeholder={placeholder}
        placeholderTextColor="#6E768A"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="done"
        blurOnSubmit={false}
        className="rounded-2xl border border-[#2A3042] bg-[#151821] px-4 py-4 text-[16px] leading-[22px] text-white"
      />
      <Text className="mt-2 text-[13px] leading-[20px] text-[#6E768A]">
        Press Enter to add a tag
      </Text>

      {tags.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap gap-2">
          {tags.map((tag) => (
            <Pressable
              key={tag}
              onPress={() => removeTag(tag)}
              className="flex-row items-center gap-1.5 rounded-full border border-[#2A3042] bg-[#10131A] py-1.5 pl-3 pr-2 active:opacity-90"
            >
              <Text className="text-[13px] font-medium text-[#C4CAD8]">
                {tag}
              </Text>
              <Ionicons name="close" size={14} color="#6E768A" />
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}
