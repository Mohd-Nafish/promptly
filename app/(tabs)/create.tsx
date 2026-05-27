import Ionicons from "@expo/vector-icons/Ionicons";
import { LinearGradient } from "expo-linear-gradient";
import { CategoryChipList } from "../../components/CategoryChipList";
import { getFloatingTabBarHeight } from "../../components/FloatingTabBar";
import { PromptEditor } from "../../components/PromptEditor";
import { TagsInput } from "../../components/TagsInput";
import { PROMPT_CATEGORIES } from "../../constants/categories";
import { auth } from "../../services/firebase";
import { createPrompt } from "../../services/prompts";
import { signInAnonymously } from "firebase/auth";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

const PUBLISH_BUTTON_HEIGHT = 46;
const TAB_BAR_GAP = 18;

function PublishActionButton({
  disabled,
  isPublishing,
  isSuccess,
  onPress,
}: {
  disabled: boolean;
  isPublishing: boolean;
  isSuccess: boolean;
  onPress: () => void;
}) {
  const gradientColors = isSuccess
    ? (["#2F5A45", "#244736"] as const)
    : isPublishing
      ? (["#7A62E8", "#6B52E8"] as const)
      : (["#9178FF", "#7C5CFF", "#6E4FE8"] as const);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      className="active:opacity-90"
      style={{
        shadowColor: isSuccess ? "#3DDC97" : "#7C5CFF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: isSuccess ? 0.18 : 0.28,
        shadowRadius: 16,
        elevation: 8,
      }}
    >
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          height: PUBLISH_BUTTON_HEIGHT,
          borderRadius: 18,
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
        }}
      >
        {isPublishing ? (
          <>
            <ActivityIndicator color="#FFFFFF" size="small" />
            <Text className="ml-2 text-[14px] font-semibold tracking-[0.2px] text-white">
              Publishing...
            </Text>
          </>
        ) : isSuccess ? (
          <>
            <Ionicons name="checkmark-circle" size={18} color="#3DDC97" />
            <Text className="ml-2 text-[14px] font-semibold tracking-[0.2px] text-[#3DDC97]">
              Published!
            </Text>
          </>
        ) : (
          <Text className="text-[14px] font-semibold tracking-[0.2px] text-white">
            Publish prompt
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const PROMPT_MAX_CHARS = 2000;
const SUCCESS_DURATION_MS = 2200;

type FormErrors = {
  title?: string;
  prompt?: string;
};

type PublishState = "idle" | "loading" | "success";

function FieldLabel({ children }: { children: string }) {
  return (
    <Text className="mb-2.5 text-[12px] font-medium uppercase tracking-[1.6px] text-[#6E768A]">
      {children}
    </Text>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <Text className="mt-2 text-[13px] leading-[18px] text-[#FF6B6B]">{message}</Text>
  );
}

function validateForm(title: string, prompt: string): FormErrors {
  const errors: FormErrors = {};
  const trimmedTitle = title.trim();
  const trimmedPrompt = prompt.trim();

  if (!trimmedTitle) {
    errors.title = "Title is required";
  } else if (trimmedTitle.length < 3) {
    errors.title = "Title must be at least 3 characters";
  }

  if (!trimmedPrompt) {
    errors.prompt = "Prompt is required";
  } else if (trimmedPrompt.length < 10) {
    errors.prompt = "Prompt must be at least 10 characters";
  }

  return errors;
}

function getPublishErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes("permission-denied")) {
      return "Permission denied. Check your Firestore security rules.";
    }
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

async function resolveUserId(): Promise<string> {
  if (auth.currentUser) {
    return auth.currentUser.uid;
  }

  const credential = await signInAnonymously(auth);
  return credential.user.uid;
}

function resetFormState(
  setTitle: (value: string) => void,
  setCategory: (value: string) => void,
  setPrompt: (value: string) => void,
  setTags: (value: string[]) => void,
  setErrors: (value: FormErrors) => void
) {
  setTitle("");
  setCategory(PROMPT_CATEGORIES[0]);
  setPrompt("");
  setTags([]);
  setErrors({});
}

export default function CreateScreen() {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const successTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleSectionY = useRef(0);
  const promptSectionY = useRef(0);
  const tagsSectionY = useRef(0);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<string>(PROMPT_CATEGORIES[0]);
  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [publishState, setPublishState] = useState<PublishState>("idle");
  const [publishError, setPublishError] = useState<string | null>(null);

  const tabBarOffset = getFloatingTabBarHeight(insets.bottom);
  const publishBottomOffset = tabBarOffset + TAB_BAR_GAP;
  const keyboardVerticalOffset =
    Platform.OS === "ios" ? insets.top + publishBottomOffset + 12 : 0;
  const scrollBottomPadding = publishBottomOffset + PUBLISH_BUTTON_HEIGHT + 88;

  const isPublishing = publishState === "loading";
  const isSuccess = publishState === "success";
  const isButtonDisabled = isPublishing || isSuccess;

  const handlePublish = useCallback(async () => {
    if (isPublishing || isSuccess) return;

    const validationErrors = validateForm(title, prompt);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    Keyboard.dismiss();
    setErrors({});
    setPublishError(null);
    setPublishState("loading");

    try {
      const userId = await resolveUserId();

      await createPrompt({
        title: title.trim(),
        category,
        prompt: prompt.trim(),
        tags,
        userId,
      });

      resetFormState(setTitle, setCategory, setPrompt, setTags, setErrors);
      setPublishState("success");

      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }

      successTimeoutRef.current = setTimeout(() => {
        setPublishState("idle");
        successTimeoutRef.current = null;
      }, SUCCESS_DURATION_MS);
    } catch (error) {
      setPublishState("idle");
      setPublishError(getPublishErrorMessage(error));
    }
  }, [isPublishing, isSuccess, category, prompt, tags, title]);

  const clearFieldError = useCallback((field: keyof FormErrors) => {
    setPublishError(null);
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const handleTagsChange = useCallback((nextTags: string[]) => {
    setPublishError(null);
    setTags(nextTags);
  }, []);

  useEffect(() => {
    return () => {
      if (successTimeoutRef.current) {
        clearTimeout(successTimeoutRef.current);
      }
    };
  }, []);

  const dismissKeyboard = useCallback(() => {
    Keyboard.dismiss();
  }, []);

  const scrollToSection = useCallback((y: number) => {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        y: Math.max(0, y - 24),
        animated: true,
      });
    });
  }, []);

  const scrollView = (
    <ScrollView
      ref={scrollRef}
      className="flex-1 px-6"
      contentContainerClassName="grow"
      contentContainerStyle={{ paddingBottom: scrollBottomPadding }}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
      automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
      nestedScrollEnabled
      showsVerticalScrollIndicator={false}
    >
            <View
              className="mt-8"
              onLayout={(event) => {
                titleSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <FieldLabel>Title</FieldLabel>
              <TextInput
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  clearFieldError("title");
                }}
                onFocus={() => scrollToSection(titleSectionY.current)}
                editable={!isButtonDisabled}
                returnKeyType="next"
                placeholder="e.g. Viral LinkedIn Post Generator"
                placeholderTextColor="#6E768A"
                className={`rounded-2xl border bg-[#151821] px-4 py-4 text-[16px] leading-[22px] text-white ${
                  errors.title ? "border-[#FF6B6B]" : "border-[#2A3042]"
                }`}
              />
              <FieldError message={errors.title} />
            </View>

            <View className="mt-7">
              <FieldLabel>Category</FieldLabel>
              <CategoryChipList
                categories={PROMPT_CATEGORIES}
                selected={category}
                onSelect={(value) => {
                  setPublishError(null);
                  setCategory(value);
                }}
              />
            </View>

            <View
              className="mt-7"
              onLayout={(event) => {
                promptSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <View className="mb-2.5 flex-row items-center justify-between">
                <Text className="text-[12px] font-medium uppercase tracking-[1.6px] text-[#6E768A]">
                  Prompt
                </Text>
                <Text
                  className={`text-[12px] font-medium ${
                    prompt.length > PROMPT_MAX_CHARS
                      ? "text-[#FF6B6B]"
                      : "text-[#6E768A]"
                  }`}
                >
                  {prompt.length}/{PROMPT_MAX_CHARS}
                </Text>
              </View>
              <PromptEditor
                value={prompt}
                onChangeText={(value) => {
                  setPrompt(value);
                  clearFieldError("prompt");
                }}
                onFocus={() => scrollToSection(promptSectionY.current)}
                maxLength={PROMPT_MAX_CHARS}
                hasError={Boolean(errors.prompt)}
              />
              <FieldError message={errors.prompt} />
            </View>

            <View
              className="mt-7"
              onLayout={(event) => {
                tagsSectionY.current = event.nativeEvent.layout.y;
              }}
            >
              <FieldLabel>Tags</FieldLabel>
              <TagsInput
                tags={tags}
                onChangeTags={handleTagsChange}
                onFocus={() => scrollToSection(tagsSectionY.current)}
              />
            </View>
    </ScrollView>
  );

  return (
    <View className="flex-1 bg-[#0B0D10]">
      <SafeAreaView className="flex-1" edges={["top"]}>
        <View className="px-6 pt-4">
          <Text className="text-[34px] font-bold leading-[40px] tracking-[-0.4px] text-white">
            Create Prompt
          </Text>
          <Text className="mt-2 text-[15px] leading-[24px] text-[#8B93A7]">
            Craft a reusable workflow others can save and remix.
          </Text>
        </View>

        <TouchableWithoutFeedback onPress={dismissKeyboard} accessible={false}>
          <View className="flex-1">
            {Platform.OS === "ios" ? (
              scrollView
            ) : (
              <KeyboardAvoidingView
                className="flex-1"
                behavior="height"
                keyboardVerticalOffset={keyboardVerticalOffset}
              >
                {scrollView}
              </KeyboardAvoidingView>
            )}
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>

      <View
        className="absolute left-0 right-0 px-7"
        pointerEvents="box-none"
        style={{ bottom: publishBottomOffset }}
      >
        {publishError ? (
          <View className="mb-3 flex-row items-start gap-2 rounded-xl border border-[#FF6B6B]/30 bg-[#2A1518]/90 px-3.5 py-2.5">
            <Ionicons name="alert-circle" size={16} color="#FF6B6B" />
            <Text className="flex-1 text-[12px] leading-[18px] text-[#FF8A8A]">
              {publishError}
            </Text>
          </View>
        ) : null}

        <PublishActionButton
          disabled={isButtonDisabled}
          isPublishing={isPublishing}
          isSuccess={isSuccess}
          onPress={handlePublish}
        />
      </View>
    </View>
  );
}
