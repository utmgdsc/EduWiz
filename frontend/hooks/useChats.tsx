import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import { useCollectionData } from "react-firebase-hooks/firestore";

import { User } from "firebase/auth";

import { Chat } from "@/lib/firebase/schema";
import { firestore } from "@/lib/firebase";
import { chatConverter, CHAT_COLLECTION_NAME } from "@/lib/firebase/chat";

export function useChats(user: User | null | undefined) {  
    const chatQuery =
    user &&
    query(
      collection(firestore, CHAT_COLLECTION_NAME).withConverter(chatConverter),
      where("user_id", "==", user.uid),
      orderBy("created_at")
    );
  const [chats, loading, error, snapshot] = useCollectionData(chatQuery);
  return { chats, loading, error, snapshot };
}
