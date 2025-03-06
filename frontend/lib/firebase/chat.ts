import type { Chat } from "@/lib/firebase/schema";
import { firestore } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";

const CHAT_COLLECTION_NAME = "chat";

async function createChat(
  chat: Omit<Chat, "id" | "video">,
  db: Firestore = firestore,
  collection_name: string = CHAT_COLLECTION_NAME
): Promise<DocumentReference> {
  return await addDoc(collection(firestore, collection_name), chat);
}

async function updateChat(
  id: string,
  chat: Partial<Chat>,
  db: Firestore = firestore,
  collection_name: string = CHAT_COLLECTION_NAME
): Promise<void> {
  return await updateDoc(doc(db, collection_name, id), chat);
}
