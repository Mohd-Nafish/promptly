import { SEED_PROMPTS } from "./seedPrompts";

export const mockPrompts = SEED_PROMPTS.map((item) => ({
  id: item.seedKey,
  title: item.title,
  category: item.category,
  saves: item.saves,
  prompt: item.prompt,
}));
