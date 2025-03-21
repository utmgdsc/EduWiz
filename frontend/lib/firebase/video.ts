import type { Video } from "@/lib/firebase/schema";
import { firestore } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  FirestoreDataConverter,
  type DocumentReference,
  type QueryDocumentSnapshot,
  type Firestore,
} from "firebase/firestore";

const VIDEO_COLLECTION_NAME = "video";

const videoConverter: FirestoreDataConverter<Video> = {
  toFirestore: (chat: Video) => ({
    ...chat,
    created_at: serverTimestamp(),
  }),

  fromFirestore: (snapshot: QueryDocumentSnapshot) => {
    const data = snapshot.data();
    return {
      ...data,
      created_at: data.created_at.toDate(),
    } as Video;
  },
};

async function createVideo(
  video: Omit<Video, "id">,
  db: Firestore = firestore,
  collection_name: string = VIDEO_COLLECTION_NAME
): Promise<DocumentReference> {
  return await addDoc(
    collection(firestore, collection_name).withConverter(videoConverter),
    video
  );
}

export { videoConverter, createVideo, VIDEO_COLLECTION_NAME };
