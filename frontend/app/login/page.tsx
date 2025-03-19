"use client";
import type { FormEvent } from "react";
import ProviderButton from "@/components/ProviderButton";
import Image from "next/image";
import clsx from "clsx";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { useAuthorization } from "@/lib/context/auth";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { FirebaseError } from "firebase/app";

export default function Login() {
  const router = useRouter();
  const greeting = useRef<string>(null);
  const toastID = useRef<string | number>(null);
  const {
    user,
    loading,
    error,
    SignInUser,
    SignInUserProvider,
    providers: [google, github],
  } = useAuthorization();

  const greetings = [
    "Let's keep learning",
    "Back so soon?",
    "Good to see you again!",
    "We missed you",
    "Hello again, scholar!",
  ];

  const handleFormSubmission = async (event: FormEvent) => {
    event.preventDefault();

    const { email, password } = Object.fromEntries(
      new FormData(event.target as HTMLFormElement)
    );

    let credentials = null;

    try {
      credentials = await SignInUser(email as string, password as string);
    } catch (error: any) {
      if (!(error instanceof FirebaseError)) {
        console.error(error);
        return;
      }
      switch (error.code) {
        case "auth/invalid-email":
          toast.error("The email address is badly formatted");
          break;
        case "auth/user-not-found":
          toast.error("No user found with this email");
          break;
        case "auth/wrong-password":
          toast.error("The password is incorrect");
          break;
        default:
          toast.error(`log in error ${error.code}`);
      }
      return;
    }

    if (credentials.user.emailVerified) {
      toast.success("Welcome back 👋");
      router.push("/learn");
    } else toast.info("Verify email");
  };

  useEffect(() => {
    greeting.current = greetings[Math.floor(Math.random() * greetings.length)];
  }, []);

  useEffect(() => {
    if (error) {
      if (toastID.current) {
        toast.dismiss(toastID.current);
        toastID.current = null;
      }
      toast.error("Someting went wrong 😕");
    }

    if (loading && !toastID.current) {
      toastID.current = toast.loading("Loading...");
    } else if (toastID.current) {
      toast.dismiss(toastID.current);
      toastID.current = null;
    }

    if (user && user.emailVerified) router.push("/");
  }, [user, loading, error]);

  return (
    <div className="min-height-screen h-screen grid place-items-center p-4">
      <Card className="max-w-[480px] w-full p-8 font-sans">
        <CardTitle className="text-3xl text-center font-mono">Log In</CardTitle>
        <CardDescription
          className={clsx(
            "text-center mt-2 font-mono",
            !greeting.current ? "p-2.5" : ""
          )}
        >
          {greeting.current || " "}
        </CardDescription>
        <CardContent className="mt-4 space-y-5 p-0">
          <form onSubmit={handleFormSubmission} className="space-y-8 font-mono">
            <section className="space-y-4">
              <fieldset className="space-y-1">
                <Label htmlFor="email" className="font-semibold font-sans">
                  Email
                </Label>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="EMAIL@DOMAIN.COM"
                  required
                />
              </fieldset>
              <fieldset className="space-y-1">
                <div className="w-full flex items-center justify-between">
                  <Label htmlFor="password" className="font-semibold font-sans">
                    Password
                  </Label>
                  <a
                    href="/reset_password"
                    className=" text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="SECRET"
                  minLength={5}
                  required
                />
              </fieldset>
            </section>

            <Button type="submit" className="w-full font-bold font-sans">
              Submit
            </Button>
          </form>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground font-mono">
              Or
            </span>
          </div>

          <section className="flex flex-col gap-4">
            <ProviderButton
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800"
              provider={google}
              onClick={() => SignInUserProvider(google.provider)}
            >
              Google
            </ProviderButton>
            <ProviderButton
              className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800"
              provider={github}
              onClick={() => SignInUserProvider(github.provider)}
            >
              Github
            </ProviderButton>
          </section>

          <section className="text-center">
            Don&apos;t already have an account?{" "}
            <a href="/signup" className="underline underline-offset-4">
              Sign Up
            </a>
          </section>
        </CardContent>
      </Card>

      {/* Backdrop decoration */}
      <Image
        className="absolute top-12 left-20 fill-white text-white -z-10 size-auto"
        src={"/icons/triangle.svg"}
        width={100}
        height={100}
        alt="triangle"
      />
      <Image
        className="absolute bottom-20 left-28 fill-white text-white -z-10 size-auto"
        src={"/icons/circle.svg"}
        width={120}
        height={120}
        alt="circle"
      />
      <Image
        className="absolute top-1/2 left-1/4 fill-white text-white -z-10 size-auto"
        src={"/icons/scribble.svg"}
        width={100}
        height={100}
        alt="scribble"
      />
      <Image
        className="absolute bottom-1/2 right-20 fill-white text-white -z-10 size-auto"
        src={"/icons/square.svg"}
        width={100}
        height={100}
        alt="square"
      />
      <Image
        priority
        className="absolute top-32 right-[20%] fill-white text-white -z-10 size-auto"
        src={"/icons/right_arrow.svg"}
        width={100}
        height={100}
        alt="vector"
      />
      <Image
        className="absolute bottom-20 right-1/4 fill-white text-white -z-10 size-auto"
        src={"/icons/plane.svg"}
        width={64}
        height={64}
        alt="plane"
      />
    </div>
  );
}
