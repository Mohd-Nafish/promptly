import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  type DocumentData,
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";
import { SEED_PROMPTS } from "../constants/seedPrompts";
import type { Prompt } from "../types/prompt";
import { auth, db } from "./firebase";

const PROMPTS_COLLECTION = "prompts";

export type CreatePromptInput = {
  title: string;
  category: string;
  prompt: string;
  tags: string[];
  userId: string;
  saves?: number;
};

function mapPromptDocument(id: string, data: DocumentData): Prompt {
  const createdAtValue = data.createdAt;
  let createdAt = Date.now();

  if (createdAtValue instanceof Timestamp) {
    createdAt = createdAtValue.toMillis();
  } else if (typeof createdAtValue === "number") {
    createdAt = createdAtValue;
  }

  return {
    id,
    title: String(data.title ?? ""),
    category: String(data.category ?? ""),
    prompt: String(data.prompt ?? ""),
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    saves: typeof data.saves === "number" ? data.saves : 0,
    createdAt,
    userId: String(data.userId ?? ""),
  };
}

export async function createPrompt(input: CreatePromptInput): Promise<string> {
  const docRef = await addDoc(collection(db, PROMPTS_COLLECTION), {
    title: input.title,
    category: input.category,
    prompt: input.prompt,
    tags: input.tags,
    saves: input.saves ?? 0,
    userId: input.userId,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function seedSamplePrompts(userId: string): Promise<number> {
  const existing = await getDocs(
    query(collection(db, PROMPTS_COLLECTION), limit(1))
  );

  if (!existing.empty) {
    return 0;
  }

  const now = Date.now();

  for (let index = 0; index < SEED_PROMPTS.length; index++) {
    const item = SEED_PROMPTS[index];

    await addDoc(collection(db, PROMPTS_COLLECTION), {
      title: item.title,
      category: item.category,
      prompt: item.prompt,
      tags: item.tags,
      saves: item.saves,
      userId,
      seedKey: item.seedKey,
      createdAt: Timestamp.fromMillis(now - index * 3_600_000),
    });
  }

  return SEED_PROMPTS.length;
}

export async function ensureSamplePrompts(): Promise<number> {
  const existing = await getDocs(
    query(collection(db, PROMPTS_COLLECTION), limit(1))
  );

  if (!existing.empty) {
    return 0;
  }

  let userId = auth.currentUser?.uid;

  if (!userId) {
    const credential = await signInAnonymously(auth);
    userId = credential.user.uid;
  }

  return seedSamplePrompts(userId);
}

export async function getPrompts(): Promise<Prompt[]> {
  const promptsQuery = query(
    collection(db, PROMPTS_COLLECTION),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(promptsQuery);

  return snapshot.docs.map((document) =>
    mapPromptDocument(document.id, document.data())
  );
}

export async function getPromptById(id: string): Promise<Prompt | null> {
  const snapshot = await getDoc(doc(db, PROMPTS_COLLECTION, id));

  if (!snapshot.exists()) {
    return null;
  }

  return mapPromptDocument(snapshot.id, snapshot.data());
}
