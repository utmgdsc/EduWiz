"use client";
import type { FormEvent } from "react";
import ProviderButton from "@/components/ProviderButton";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthorization } from "@/lib/context/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function Login() {
  const router = useRouter();
  const {
    user,
    loading,
    error,
    SignInUser,
    SignInUserProvider,
    providers: [google, github],
  } = useAuthorization();

  const handleFormSubmission = async (event: FormEvent) => {
    event.preventDefault();

    const { email, password } = Object.fromEntries(
      new FormData(event.target as HTMLFormElement)
    );

    try {
      const result = await SignInUser(email as string, password as string);
    } catch (error: any) {
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
          toast.error("Sign in error:", error.message);
      }
      return;
    }

    toast.success("Welcome back 👋");
  };

  useEffect(() => {
    if (error) toast.error("Someting went wrong 😕");
    if (loading) toast.loading("Loading...");
    if (user) router.push("/");
  }, [user]);

  return (
    <div className="min-height-screen h-screen grid place-items-center p-4">
      <Card className="max-w-[480px] w-full p-8">
        <CardTitle className="text-3xl text-center">Log In</CardTitle>

        <CardContent className="mt-4 space-y-5 p-0">
          <form onSubmit={handleFormSubmission} className="space-y-8">
            <section className="space-y-4">
              <fieldset className="space-y-1">
                <Label htmlFor="email" className="font-semibold">
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
                <Label htmlFor="password" className="font-semibold">
                  Password
                </Label>
                <Input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="SECRET"
                  minLength={10}
                  required
                />
              </fieldset>
            </section>

            <Button type="submit" className="w-full font-bold">
              Submit
            </Button>
          </form>

          <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
            <span className="relative z-10 bg-background px-2 text-muted-foreground">
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
            <a href="#" className="underline underline-offset-4">
              Sign Up
            </a>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
