export interface Prompt {
    id?: string;
    title: string;
    category: string;
    prompt: string;
    tags: string[];
    saves: number;
    createdAt: number;
    userId: string;
  }