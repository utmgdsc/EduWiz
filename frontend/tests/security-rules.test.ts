import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import path from "path";

let testEnv: RulesTestEnvironment;

const users = {
  user1: { uid: "user1", claims: { email_verified: true } },
  owner: { uid: "owner1", claims: { email_verified: true } },
  attacker: { uid: "attacker1", claims: { email_verified: true } },
  unauthenticated: null,
};

function getAuthedFirestore(user: { uid: string; claims: any } | null) {
  if (!user) {
    return testEnv.unauthenticatedContext().firestore();
  }
  return testEnv.authenticatedContext(user.uid, user.claims).firestore();
}

function as(userKey: keyof typeof users) {
  return getAuthedFirestore(users[userKey]);
}

const validChat = (uid: string, id: string) => ({
  id,
  uid,
  prompt: "Hello world",
  video: null,
  conversation: [],
  created_at: new Date(),
});

const validVideo = (uid: string, id: string) => ({
  id,
  uid,
  video_url: "https://example.com/video.mp4",
  context: "Test context",
  created_at: new Date(),
  status: "rendered",
  embedding: [0.1, 0.2, 0.3],
});

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-chat-app",
    firestore: {
      host: "localhost",
      port: 8080,
      rules: readFileSync(
        path.resolve(__dirname, "../firestore.rules"),
        "utf8"
      ),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// --- TESTS ---

describe("General Rules", () => {
  it("denies unauthenticated read", async () => {
    const db = as("unauthenticated");
    const chatRef = doc(db, "chat/testChat");
    await assertFails(getDoc(chatRef));
  });

  it("denies unauthenticated write", async () => {
    const db = as("unauthenticated");
    const chatRef = doc(db, "chat/testChat");
    await assertFails(
      setDoc(chatRef, {
        id: "testChat",
        uid: "someone",
        prompt: "hello",
        created_at: new Date(),
        conversation: [],
        video: null,
      })
    );
  });
});

describe("Chat Document Rules", () => {
  it("allows owner to create valid chat", async () => {
    const db = as("user1");
    await assertSucceeds(
      setDoc(doc(db, "chat/chat1"), validChat(users.user1.uid, "chat1"))
    );
  });

  it("denies creating chat with wrong id", async () => {
    const db = as("user1");
    const invalidChat = validChat(users.user1.uid, "wrongId");
    await assertFails(setDoc(doc(db, "chat/chat1"), invalidChat));
  });

  it("denies creating chat with extra fields", async () => {
    const db = as("user1");
    const invalidChat = {
      ...validChat(users.user1.uid, "chat1"),
      extraField: "bad",
    };
    await assertFails(setDoc(doc(db, "chat/chat1"), invalidChat));
  });

  it("denies creating chat with non-list conversation", async () => {
    const db = as("user1");
    const invalidChat = {
      ...validChat(users.user1.uid, "chat1"),
      conversation: "notalist",
    };
    await assertFails(setDoc(doc(db, "chat/chat1"), invalidChat));
  });

  it("allows owner to update their chat correctly", async () => {
    const db = as("user1");
    const ref = doc(db, "chat/chat1");
    const data = validChat(users.user1.uid, "chat1");
    await setDoc(ref, data);

    await assertSucceeds(
      updateDoc(ref, { prompt: "New prompt", created_at: data.created_at })
    );
  });

  it("denies update that changes created_at", async () => {
    const db = as("user1");
    const ref = doc(db, "chat/chat1");
    const data = validChat(users.user1.uid, "chat1");
    await setDoc(ref, data);

    await assertFails(updateDoc(ref, { created_at: new Date() }));
  });

  it("denies reading someone else's chat", async () => {
    const ownerDb = as("owner");
    const otherDb = as("user1");

    const ref = doc(ownerDb, "chat/chat1");
    await setDoc(ref, validChat(users.owner.uid, "chat1"));

    await assertFails(getDoc(doc(otherDb, "chat/chat1")));
  });

  it("allows owner to delete their chat", async () => {
    const db = as("user1");
    const ref = doc(db, "chat/chat1");

    await setDoc(ref, validChat(users.user1.uid, "chat1"));
    await assertSucceeds(deleteDoc(ref));
  });

  it("denies non-owner deleting chat", async () => {
    const ownerDb = as("owner");
    const otherDb = as("user1");

    const ref = doc(ownerDb, "chat/chat1");
    await setDoc(ref, validChat(users.owner.uid, "chat1"));

    await assertFails(deleteDoc(doc(otherDb, "chat/chat1")));
  });
});

describe("Video Document Rules", () => {
  it("allows owner to create valid video", async () => {
    const db = as("user1");
    await assertSucceeds(
      setDoc(doc(db, "video/video1"), validVideo(users.user1.uid, "video1"))
    );
  });

  it("denies creating video with wrong id", async () => {
    const db = as("user1");
    const invalidVideo = validVideo(users.user1.uid, "wrongId");
    await assertFails(setDoc(doc(db, "video/video1"), invalidVideo));
  });

  it("denies creating video with bad embedding", async () => {
    const db = as("user1");
    const invalidVideo = {
      ...validVideo(users.user1.uid, "video1"),
      embedding: ["bad", "data"],
    };
    await assertFails(setDoc(doc(db, "video/video1"), invalidVideo));
  });

  it("denies creating video with non-string status", async () => {
    const db = as("user1");
    const invalidVideo = {
      ...validVideo(users.user1.uid, "video1"),
      status: 123,
    };
    await assertFails(setDoc(doc(db, "video/video1"), invalidVideo));
  });

  it("allows any authenticated user to read video", async () => {
    const ownerDb = as("owner");
    const otherDb = as("user1");

    await setDoc(
      doc(ownerDb, "video/video1"),
      validVideo(users.owner.uid, "video1")
    );

    await assertSucceeds(getDoc(doc(otherDb, "video/video1")));
  });

  it("denies non-owner updating video", async () => {
    const ownerDb = as("owner");
    const otherDb = as("user1");

    await setDoc(
      doc(ownerDb, "video/video1"),
      validVideo(users.owner.uid, "video1")
    );

    await assertFails(
      updateDoc(doc(otherDb, "video/video1"), { context: "hacked" })
    );
  });

  it("allows owner to delete their video", async () => {
    const db = as("user1");
    const ref = doc(db, "video/video1");

    await setDoc(ref, validVideo(users.user1.uid, "video1"));
    await assertSucceeds(deleteDoc(ref));
  });

  it("denies non-owner deleting video", async () => {
    const ownerDb = as("owner");
    const otherDb = as("user1");

    const ref = doc(ownerDb, "video/video1");
    await setDoc(ref, validVideo(users.owner.uid, "video1"));

    await assertFails(deleteDoc(doc(otherDb, "video/video1")));
  });
});
