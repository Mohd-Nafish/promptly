export type SeedPrompt = {
  seedKey: string;
  title: string;
  category: string;
  prompt: string;
  tags: string[];
  saves: number;
};

export const SEED_PROMPTS: SeedPrompt[] = [
  {
    seedKey: "viral-linkedin-post-generator",
    title: "Viral LinkedIn Post Generator",
    category: "Marketing",
    prompt:
      "Write a high-engagement LinkedIn post about learning React Native and building projects consistently.",
    tags: ["linkedin", "marketing", "social"],
    saves: 1240,
  },
  {
    seedKey: "react-native-folder-structure",
    title: "React Native Folder Structure",
    category: "Development",
    prompt:
      "Generate a scalable React Native folder structure using Expo Router and TypeScript. Include app routes, components, services, hooks, store, and types with clear separation of concerns.",
    tags: ["react-native", "expo", "architecture"],
    saves: 840,
  },
  {
    seedKey: "youtube-script-creator",
    title: "YouTube Script Creator",
    category: "Content",
    prompt:
      "Write a short-form YouTube script with a strong hook in the first 5 seconds, three value-packed sections, and a clear CTA at the end.",
    tags: ["youtube", "video", "script"],
    saves: 650,
  },
  {
    seedKey: "cold-email-outreach",
    title: "Cold Email Outreach Template",
    category: "Marketing",
    prompt:
      "Write a concise cold email to a startup founder introducing a mobile app development service. Keep it under 120 words, personalize the opening, and end with one low-friction CTA.",
    tags: ["email", "outreach", "sales"],
    saves: 920,
  },
  {
    seedKey: "daily-standup-summary",
    title: "Daily Standup Summary",
    category: "Productivity",
    prompt:
      "Turn my rough notes into a clean daily standup update with three sections: Yesterday, Today, and Blockers. Use bullet points and keep each section under 3 lines.",
    tags: ["standup", "team", "workflow"],
    saves: 410,
  },
  {
    seedKey: "ui-component-spec",
    title: "UI Component Spec Writer",
    category: "Design",
    prompt:
      "Create a UI spec for a dark-mode prompt card component. Include layout, typography, spacing, states (default, pressed, saved), and accessibility notes for React Native.",
    tags: ["design", "ui", "components"],
    saves: 580,
  },
  {
    seedKey: "exam-study-plan",
    title: "Exam Study Plan Builder",
    category: "Study",
    prompt:
      "Build a 14-day study plan for learning React Native fundamentals. Break each day into 2 focused sessions with topics, practice tasks, and a short review checklist.",
    tags: ["study", "learning", "planning"],
    saves: 730,
  },
  {
    seedKey: "pitch-deck-hook",
    title: "Pitch Deck Hook Generator",
    category: "Business",
    prompt:
      "Write 5 opening hooks for a pitch deck about an AI prompt marketplace app. Each hook should be one sentence, problem-first, and tailored for investors.",
    tags: ["startup", "pitch", "business"],
    saves: 1100,
  },
];
