"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";

import { Send } from "lucide-react";

import { toast } from "sonner";
import { FirebaseError } from "firebase/app";
import { useSendPasswordResetEmail } from "react-firebase-hooks/auth";

export default function ResetPassword() {
  const [emailSent, setEmailSent] = useState(false);
  const [sendPasswordResetEmail, loading, error] =
    useSendPasswordResetEmail(auth);

  const handleEmailSubmission = async (form: FormData) => {
    const email = form.get("email") as string;
    const success = await sendPasswordResetEmail(email, {
      url: `${process.env.NEXT_PUBLIC_URL}/login`,
    });

    if (!success) return;

    toast.success("Email Sent 🛩️", {
      duration: Infinity,
    });
    setEmailSent(true);
  };

  useEffect(() => {
    switch ((error as FirebaseError)?.code) {
      case undefined:
        break;
      case "auth/user-not-found":
        toast.error("User not found");
        break;
      default:
        toast.error("something went wrong");
    }
  }, [error, loading]);

  return (
    <div className="h-screen grid place-items-center p-4 font-mono">
      <section className="space-y-12">
        <div className="space-y-4 text-center">
          <h1 className="text-4xl text-muted-foreground font-semibold font-sans">
            Reset Password
          </h1>
          <h3 className="text-muted-foreground">Enter your email</h3>
        </div>
        <form
          className="flex flex-col gap-4 sm:flex-row"
          action={handleEmailSubmission}
        >
          <Input
            type="email"
            name="email"
            placeholder="EMAIL@DOMAIN.COM"
            className="w-80 sm:w-96"
            disabled={emailSent}
            required
          />
          <Button
            disabled={emailSent}
            type="submit"
            aria-label="Send reset link"
          >
            <Send />
          </Button>
        </form>
      </section>
    </div>
  );
}
