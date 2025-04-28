import { LLMMessage } from "@/lib/firebase/schema";
import { API_BASE_URL } from "@/lib/api";

type ChatInvocation = {
  prompt: string;
  initial_prompt: string;
  video_context: string;
  messages: Array<LLMMessage>;
};

const chat = async (
  chatInvocation: ChatInvocation,
  token: string
): Promise<LLMMessage> => {
  const response = await fetch(`${API_BASE_URL}/message_video`, {
    method: "POST",
    body: JSON.stringify(chatInvocation),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch chat response: ${response.status} ${response.statusText}`
    );
  }
  return (await response.json()) as LLMMessage;
};

export { chat, type ChatInvocation };
