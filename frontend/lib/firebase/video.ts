import type { Video } from "@/lib/firebase/schema";
import { firestore } from "@/lib/firebase";
import {
  addDoc,
  collection,
  type DocumentReference,
  type Firestore,
} from "firebase/firestore";

const VIDEO_COLLECTION_NAME = "video";

async function createVideo(
  video: Omit<Video, "id">,
  db: Firestore = firestore,
  collection_name: string = VIDEO_COLLECTION_NAME
): Promise<DocumentReference> {
  return await addDoc(collection(firestore, collection_name), video);
}
