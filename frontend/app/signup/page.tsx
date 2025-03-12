"use client";
import type { FormEvent } from "react";
import ProviderButton from "@/components/ProviderButton";
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useAuthorization } from "@/lib/context/auth";

import { auth } from "@/lib/firebase";

import { useSendEmailVerification } from "react-firebase-hooks/auth";
import { FirebaseError } from "firebase/app";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function SignUp() {
  const router = useRouter();
  const toastID = useRef<string | number>(null);
  const {
    user,
    loading,
    error,
    SignUpUser,
    SignInUserProvider,
    providers: [google, github],
  } = useAuthorization();
  const [sendEmailVerification] = useSendEmailVerification(auth);

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const { email, password, password_confirm } = Object.fromEntries(
      new FormData(event.target as HTMLFormElement)
    );

    if (password !== password_confirm) {
      toast.warning("Passwords do not match!");
      return;
    }

    toast.promise(SignUpUser(email as string, password as string), {
      loading: "Loading...",
      success: async (data) => {
        const success = await sendEmailVerification();
        return success
          ? `Sent a verification email to ${data.user.email}`
          : `Could not send email to ${data.user.email}`;
      },
      error: (err) => {
        if (!(err instanceof FirebaseError)) return "Something went wrong";
        const tokenized_message = (err as FirebaseError).code
          .split("/")[1]
          .split("-");

        tokenized_message[0] =
          tokenized_message[0].charAt(0).toUpperCase() +
          tokenized_message[0].slice(1);

        return tokenized_message.join(" ");
      },
    });
  };

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
      <Card className="max-w-[480px] w-full p-8">
        <CardTitle className="text-3xl text-center font-mono font-black">
          Sign Up
        </CardTitle>

        <CardDescription className="text-center mt-2 font-mono">
          Create an account
        </CardDescription>

        <CardContent className="mt-4 space-y-5 p-0">
          <form onSubmit={onSubmit} className="space-y-8">
            <section className="space-y-4 font-mono">
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
                <Label htmlFor="password" className="font-semibold font-sans">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="SECRET"
                  minLength={5}
                  required
                />
              </fieldset>
              <fieldset className="space-y-1">
                <Label
                  htmlFor="password_confirm"
                  className="font-semibold font-sans"
                >
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
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

          <section className="flex flex-col gap-4 font-sans">
            <ProviderButton
              className="bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800"
              provider={google}
              onClick={() => SignInUserProvider(google.provider)}
            >
              Google
            </ProviderButton>
            <ProviderButton
              className="bg-zinc-900 hover:bg-zinc-800 text-gray-300 border border-zinc-800 font-"
              provider={github}
              onClick={() => SignInUserProvider(github.provider)}
            >
              Github
            </ProviderButton>
          </section>

          <section className="text-center font-sans">
            Already have an account?{" "}
            <a href="/login" className="underline underline-offset-4">
              Log In
            </a>
          </section>
        </CardContent>
      </Card>

      {/* Background decoration */}
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
        alt="plane"
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
