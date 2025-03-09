import { getDatabase, ref, onValue, off } from "firebase/database";
import firebaseApp from "./firebase";

// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Types
export interface RenderRequest {
  prompt: string;
}

//STARTED_GENERATION = "started_generation",
//ENDED_GENERATION = "ended_generation",
//STARTED_RENDERING = "started_rendering",
//ENDED_RENDERING = "ended_rendering",
//COMPLETED = "completed",
//ERROR = "error"

export interface JobStatus {
  status: string | number;
  timestamp: number;
}

export const ManimRenderService = {

  /**
   * Test the API connection with a simple health check
   */
  async healthCheck(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return response.json();
  },

  /**
   * Submit a new video rendering job
   * @param prompt The text prompt for generating the video
   * @returns The job_id for the submitted render job
   */
  async submitRenderJob(prompt: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/render`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit render job: ${response.status}`);
    }

    const data = await response.json();
    return data.job_id;
  },

  /**
   * Get the URL for a rendered video
   * @param jobId The job ID of the rendered video
   */
  getVideoUrl(jobId: string): string {
    return `${API_BASE_URL}/render/${jobId}/video`;
  },

  /**
   * Subscribe to job status updates via Firebase Realtime Database
   * @param jobId The job ID to listen for
   * @param callback Function called when status changes
   */
  subscribeToJobStatus(jobId: string, callback: (status: JobStatus) => void) {
    const db = getDatabase(firebaseApp);
    const jobRef = ref(db, `jobs/${jobId}`);

    onValue(jobRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        callback(data);
      }
    });

    // Return unsubscribe function
    return () => off(jobRef);
  },

  /**
   * Helper function to check if a job has completed
   * @param status The job status string
   */
  isJobComplete(status: string): boolean {
    return status === "completed";
  },

  /**
   * Helper function to check if a job has encountered an error
   * @param status The job status string
   */
  hasJobError(status: string): boolean {
    return status === "error";
  }
};

export default ManimRenderService;



/**
 * This would be used in the frontend as follows:
 * First create a handler function that will deal with UI changes depending on the new status update
 *
 * 1. Call api.submitRenderJob(prompt) when user makes a video request
 * 2. Get the job_id from the submitRenderJob call
 * 3. Subscribe to firebase changes using api.subscribeToJobStatus(job_id, handler) and the handler function
 * 4. Unsubscribe to clean up after the job is complete, this can be done by storing the return value of the subscribeToJobStatus function and calling it when necessary, as it returns an unsubscribe function.
 */
