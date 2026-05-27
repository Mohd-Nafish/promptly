import { useCallback, useEffect, useState } from "react";
import { TextInput, View, type TextInputProps } from "react-native";

const MIN_HEIGHT = 220;
const VERTICAL_PADDING = 44;
const HORIZONTAL_PADDING = 20;
const LINE_HEIGHT = 28;

type PromptEditorProps = {
  value: string;
  onChangeText: (text: string) => void;
  maxLength?: number;
  placeholder?: string;
  hasError?: boolean;
  onFocus?: TextInputProps["onFocus"];
};

export function PromptEditor({
  value,
  onChangeText,
  maxLength,
  placeholder = "Write the full prompt template. Use {{variables}} for dynamic fields.",
  hasError = false,
  onFocus,
}: PromptEditorProps) {
  const [height, setHeight] = useState(MIN_HEIGHT);

  useEffect(() => {
    if (!value.trim()) {
      setHeight(MIN_HEIGHT);
    }
  }, [value]);

  const handleContentSizeChange: TextInputProps["onContentSizeChange"] =
    useCallback((event) => {
      const contentHeight = event.nativeEvent.contentSize.height;
      const nextHeight = Math.max(MIN_HEIGHT, contentHeight + VERTICAL_PADDING);
      setHeight((current) =>
        Math.abs(current - nextHeight) > 1 ? nextHeight : current
      );
    }, []);

  return (
    <View
      className={`overflow-hidden rounded-2xl border bg-[#151821] ${
        hasError ? "border-[#FF6B6B]" : "border-[#2A3042]"
      }`}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onContentSizeChange={handleContentSizeChange}
        placeholder={placeholder}
        placeholderTextColor="#5C6378"
        multiline
        scrollEnabled={false}
        textAlignVertical="top"
        maxLength={maxLength}
        style={{
          height,
          minHeight: MIN_HEIGHT,
          paddingHorizontal: HORIZONTAL_PADDING,
          paddingTop: 22,
          paddingBottom: 22,
          fontSize: 16,
          lineHeight: LINE_HEIGHT,
          color: "#E8EBF4",
        }}
        className="text-[16px] leading-[28px] text-[#E8EBF4]"
      />
    </View>
  );
}
