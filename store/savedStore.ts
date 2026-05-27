import { create } from "zustand";
import type { Prompt } from "../types/prompt";

type SavedStore = {
  savedPrompts: Prompt[];
  addPrompt: (prompt: Prompt) => void;
  removePrompt: (id: string) => void;
  togglePrompt: (prompt: Prompt) => void;
  isSaved: (id: string) => boolean;
};

export const useSavedStore = create<SavedStore>((set, get) => ({
  savedPrompts: [],

  addPrompt: (prompt) => {
    if (!prompt.id) return;

    set((state) => {
      if (state.savedPrompts.some((item) => item.id === prompt.id)) {
        return state;
      }

      return { savedPrompts: [...state.savedPrompts, prompt] };
    });
  },

  removePrompt: (id) => {
    set((state) => ({
      savedPrompts: state.savedPrompts.filter((item) => item.id !== id),
    }));
  },

  togglePrompt: (prompt) => {
    if (!prompt.id) return;

    if (get().isSaved(prompt.id)) {
      get().removePrompt(prompt.id);
    } else {
      get().addPrompt(prompt);
    }
  },

  isSaved: (id) => get().savedPrompts.some((item) => item.id === id),
}));
