import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import path from "path";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "demo-chat-app",
    firestore: {
      host: "localhost",
      port: 8080,
      rules: readFileSync(
        path.resolve(__dirname, "../firestore.rules"),
        "utf8",
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

describe('Chat Collection', () => {
    // Test data
    const validChatData = {
      user_id: 'user123',
      uid: 'user123',
      prompt: 'Test prompt',
      created_at: currentTimestamp
    };

    const invalidChatData = {
      uid: 'user123',
      // Missing prompt field
      created_at: currentTimestamp
    };

    const chatWithVideo = {
      user_id: 'user123',
      uid: 'user123',
      prompt: 'Test with video',
      video: { url: 'https://example.com/video.mp4' },
      created_at: currentTimestamp
    };

    test('authenticated users can create valid chats', async () => {
      // Setup authenticated context with verified email
      const auth = testEnv.authenticatedContext('user123', { email_verified: true });

      // Should succeed with valid data
      await assertSucceeds(
        auth.firestore()
          .collection('chat')
          .doc('chat1')
          .set(validChatData)
      );
    });

    test('authenticated users can create chat with video object', async () => {
      const auth = testEnv.authenticatedContext('user123', { email_verified: true });

      await assertSucceeds(
        auth.firestore()
          .collection('chat')
          .doc('chat2')
          .set(chatWithVideo)
      );
    });

    test('unauthenticated users cannot create chats', async () => {
      const unauth = testEnv.unauthenticatedContext();

      await assertFails(
        unauth.firestore()
          .collection('chat')
          .doc('chat3')
          .set(validChatData)
      );
    });

    test('users with unverified email cannot create chats', async () => {
      const unverifiedUser = testEnv.authenticatedContext('user123', { email_verified: false });

      await assertFails(
        unverifiedUser.firestore()
          .collection('chat')
          .doc('chat4')
          .set(validChatData)
      );
    });

    test('users cannot create chats with invalid data structure', async () => {
      const auth = testEnv.authenticatedContext('user123', { email_verified: true });

      await assertFails(
        auth.firestore()
          .collection('chat')
          .doc('chat5')
          .set(invalidChatData)
      );
    });

    test('users can read their own chats', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('chat')
        .doc('chat6')
        .set(validChatData);

      // Owner should be able to read it
      const owner = testEnv.authenticatedContext('user123', { email_verified: true });
      await assertSucceeds(
        owner.firestore()
          .collection('chat')
          .doc('chat6')
          .get()
      );
    });

    test('users cannot read others chats', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('chat')
        .doc('chat7')
        .set(validChatData);

      // Non-owner shouldn't be able to read it
      const nonOwner = testEnv.authenticatedContext('user456', { email_verified: true });
      await assertFails(
        nonOwner.firestore()
          .collection('chat')
          .doc('chat7')
          .get()
      );
    });

    test('users can update their own chats maintaining created_at', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('chat')
        .doc('chat8')
        .set(validChatData);

      // Update with same timestamp
      const owner = testEnv.authenticatedContext('user123', { email_verified: true });
      await assertSucceeds(
        owner.firestore()
          .collection('chat')
          .doc('chat8')
          .update({
            prompt: 'Updated prompt',
            user_id: 'user123',
            uid: 'user123',
            created_at: currentTimestamp
          })
      );
    });

    test('users cannot update created_at timestamp', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('chat')
        .doc('chat9')
        .set(validChatData);

      // Try to update with different timestamp
      const owner = testEnv.authenticatedContext('user123', { email_verified: true });
      await assertFails(
        owner.firestore()
          .collection('chat')
          .doc('chat9')
          .update({
            prompt: 'Updated prompt',
            user_id: 'user123',
            uid: 'user123',
            created_at: Timestamp.fromDate(new Date(Date.now() + 1000)) // Different timestamp
          })
      );
    });
  });

  // VIDEO COLLECTION TESTS
  describe('Video Collection', () => {
    // Test data
    const validVideoData = {
      uid: 'user123',
      video_url: 'https://example.com/video.mp4',
      context: 'Test video context',
      created_at: currentTimestamp
    };

    const invalidVideoData = {
      uid: 'user123',
      // Missing video_url
      context: 'Test video context',
      created_at: currentTimestamp
    };

    test('authenticated users can create valid videos', async () => {
      const auth = testEnv.authenticatedContext('user123', { email_verified: true });

      await assertSucceeds(
        auth.firestore()
          .collection('video')
          .doc('video1')
          .set(validVideoData)
      );
    });

    test('users cannot create videos with invalid data', async () => {
      const auth = testEnv.authenticatedContext('user123', { email_verified: true });

      await assertFails(
        auth.firestore()
          .collection('video')
          .doc('video2')
          .set(invalidVideoData)
      );
    });

    test('any authenticated user can read any video', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('video')
        .doc('video3')
        .set(validVideoData);

      // Owner should be able to read it
      const owner = testEnv.authenticatedContext('user123', { email_verified: true });
      await assertSucceeds(
        owner.firestore()
          .collection('video')
          .doc('video3')
          .get()
      );

      // Non-owner with verified email should also be able to read it
      const nonOwner = testEnv.authenticatedContext('user456', { email_verified: true });
      await assertSucceeds(
        nonOwner.firestore()
          .collection('video')
          .doc('video3')
          .get()
      );
    });

    test('unauthenticated users cannot read videos', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('video')
        .doc('video4')
        .set(validVideoData);

      // Unauthenticated user shouldn't be able to read it
      const unauth = testEnv.unauthenticatedContext();
      await assertFails(
        unauth.firestore()
          .collection('video')
          .doc('video4')
          .get()
      );
    });

    test('users can only update their own videos', async () => {
      // Setup the document as admin first
      const admin = testEnv.adminApp();
      await admin.firestore()
        .collection('video')
        .doc('video5')
        .set(validVideoData);

      // Owner should be able to update it
      const owner = testEnv.authenticatedContext('user123', { email_verified: true });
      await assertSucceeds(
        owner.firestore()
          .collection('video')
          .doc('video5')
          .update({
            context: 'Updated context',
            video_url: 'https://example.com/updated.mp4',
            uid: 'user123',
            created_at: currentTimestamp
          })
      );

      // Non-owner shouldn't be able to update it
      const nonOwner = testEnv.authenticatedContext('user456', { email_verified: true });
      await assertFails(
        nonOwner.firestore()
          .collection('video')
          .doc('video5')
          .update({
            context: 'Malicious update',
            video_url: 'https://example.com/malicious.mp4',
            uid: 'user456', // Trying to claim ownership
            created_at: currentTimestamp
          })
      );
    });
  });
});
