import api, { VideoStatus } from "../lib/api"
import firebaseApp from "../lib/firebase";
import { getDatabase, ref, set, get, remove } from "firebase/database";

describe("API Integration Tests", () => {
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  jest.setTimeout(30000);

  describe("Firebase Connection", () => {
    it("should connect to the Firebase Realtime Database properly", async () => {
      const db = getDatabase(firebaseApp);
      const testRef = ref(db, "test/connection");

      const testData = {
        connected: true,
        timestamp: Date.now(),
      };

      await set(testRef, testData);

      const snapshot = await get(testRef);
      expect(snapshot.exists()).toBe(true);
      expect(snapshot.val()).toEqual(testData);
      console.log("Firebase connection test data:", snapshot.val());

      await remove(testRef);
    });
  });

  describe("Health Check", () => {
    it("should confirm the API is healthy", async () => {
      const response = await api.healthCheck();
      expect(response).toHaveProperty("message");
      console.log("Health check message:", response.message);
    });
  });

  describe("Render Job", () => {
    let submittedJobId: string;
    const testPrompt = "Integration test: Generate a short video";

    it("should submit a new render job", async () => {
      submittedJobId = await api.submitRenderJob(testPrompt);
      expect(submittedJobId).toBeTruthy();
      console.log("Submitted job id:", submittedJobId);
    });


    it("Should receive status updates", (done) => {
      const unsubscribe = api.subscribeToJobStatus(submittedJobId, (status) => {
        console.log("Received status update:", status);
        unsubscribe();
        done();
      });
    });

    it("should provide a valid video URL", () => {
      const url = api.getVideoUrl(submittedJobId);
      expect(url).toContain(`${API_BASE_URL}/render/${submittedJobId}/video`);
      console.log("Video URL:", url);
    });
  });


  describe("Helper Functions", () => {
    it("isJobComplete should return true when status is COMPLETED", () => {
      expect(api.isJobComplete(VideoStatus.COMPLETED)).toBe(true);
      expect(api.isJobComplete(VideoStatus.ENDED_RENDERING)).toBe(false);
    });

    it("hasJobError should return true when status is ERROR", () => {
      expect(api.hasJobError(VideoStatus.ERROR)).toBe(true);
      expect(api.hasJobError(VideoStatus.STARTED_GENERATION)).toBe(false);
    });
  });

});
