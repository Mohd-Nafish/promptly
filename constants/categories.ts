export const PROMPT_CATEGORIES = [
  "Development",
  "Marketing",
  "Content",
  "Productivity",
  "Study",
  "Design",
  "Business",
] as const;

export type PromptCategory = (typeof PROMPT_CATEGORIES)[number];

export const HOME_FEED_CATEGORIES = ["All", ...PROMPT_CATEGORIES] as const;
