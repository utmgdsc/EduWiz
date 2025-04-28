import type { Chat } from "@/lib/firebase/schema";
import { firestore } from "@/lib/firebase";
import {
  addDoc,
  collection,
  doc,
  updateDoc,
  serverTimestamp,
  FirestoreDataConverter,
  type DocumentReference,
  type QueryDocumentSnapshot,
  type Firestore,
  getDoc,
} from "firebase/firestore";

const CHAT_COLLECTION_NAME = "chat";

const chatConverter: FirestoreDataConverter<Chat> = {
  toFirestore: (chat) => chat,
  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data();
    return {
      ...data,
      created_at: data.created_at.toDate(),
    } as Chat;
  },
};

async function createChat(
  chat: Omit<Chat, "id" | "video" | "created_at">,
  db: Firestore = firestore,
  collection_name: string = CHAT_COLLECTION_NAME
): Promise<DocumentReference> {
  return await addDoc(collection(firestore, collection_name), {
    ...chat,
    video: null,
    created_at: serverTimestamp(),
  });
}

async function updateChat(
  id: string,
  chat: Partial<Chat>,
  db: Firestore = firestore,
  collection_name: string = CHAT_COLLECTION_NAME
): Promise<void> {
  return await updateDoc(doc(db, collection_name, id), chat);
}

async function getChat(
  chatID: string,
  db: Firestore = firestore,
  collection_name: string = CHAT_COLLECTION_NAME
): Promise<Chat | null> {
  const chatRef = doc(db, collection_name, chatID);
  const chatSnap = await getDoc(chatRef);
  if (!chatSnap.exists()) return null;
  return chatSnap.data() as Chat;
}

export { chatConverter, createChat, updateChat, getChat, CHAT_COLLECTION_NAME };
