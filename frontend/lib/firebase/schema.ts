export enum RENDER_STATUS {
  PROCESSING,
  COMPLETE,
  FAILED,
}

export type LLMMessage = {
  type: "user" | "assistant" | "system";
  message: string;
};

export type Chat = {
  id: string;
  user_id: string;
  prompt: string;
  conversation: Array<LLMMessage>;
  video: Video | null;
  created_at: Date;
};

export type Video = {
  id: string;
  video_url: string;
  context: string;
  created_at: Date;
  status: RENDER_STATUS;
  embedding: Array<number>;
};
