"use client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuthorization } from "@/lib/context/auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, SignOutUser } = useAuthorization();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/login");
  }, [user]);

  return (
    <main>
      <div>
        <div
          className="relative flex flex-col h-screen w-screen justify-end"
          style={{ padding: "20px 20px 20px 20px" }}
        >
          {/* Note: This will be removed, simply for login status as of now */}
          <h1 className="absolute inset-0 m-auto size-fit text-4xl font-mono text-muted-foreground font-semibold">
            {user ? user.displayName || user.email : "Anonymous"}
          </h1>
          {user && (
            <Button
              variant="outline"
              className="absolute right-10 top-10 font-mono font-bold"
              onClick={SignOutUser}
            >
              Sign Out
            </Button>
          )}

          <div className="flex items-center" style={{ gap: "10px" }}>
            <Textarea />
            <Button className="h-full">Send</Button>
          </div>
        </div>
      </div>
    </main>
  );
}
