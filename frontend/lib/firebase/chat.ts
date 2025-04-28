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
  query,
  where,
  getDocs,
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

async function getChat(chatID: string, userID: string) {
  const chatQuery = query(
    collection(firestore, CHAT_COLLECTION_NAME).withConverter(chatConverter),
    where("id", "==", chatID),
    where("user_id", "==", userID)
  );

  const querySnapshot = await getDocs(chatQuery);

  if (!querySnapshot.empty) {
    const chatDoc = querySnapshot.docs[0];
    return chatDoc.data();
  } else {
    return null;
  }
}

export { chatConverter, createChat, updateChat, getChat, CHAT_COLLECTION_NAME };
