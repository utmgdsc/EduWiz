"use client";
import { Button } from "@/components/ui/button";
import { useChats } from "@/hooks/useChats";
import { useAuthorization } from "@/lib/context/auth";
import { createChat } from "@/lib/firebase/chat";
import { useEffect } from "react";

export default function page() {
  /* Example how to use apis */
  const { user } = useAuthorization();
  const { chats } = useChats(user);

  const createEntry = async () => {
    if (!user) return;
    await createChat({
      conversation: [],
      user_id: user.uid,
      prompt: Math.random().toString(32).slice(7),
    });
  };

  useEffect(() => {
    chats?.forEach(console.log);
  }, [chats]);

  return (
    <div>
      hey {user?.email}
      <Button onClick={createEntry} disabled={!user}>
        click
      </Button>
    </div>
  );
}
