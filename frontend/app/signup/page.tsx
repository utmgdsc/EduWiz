"use client";
import type { FormEvent } from "react";
import ProviderButton from "@/components/ProviderButton";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthorization } from "@/lib/context/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";

export default function SignUp() {
  const router = useRouter();
  const {
    user,
    loading,
    error,
    SignUpUser,
    SignInUserProvider,
    providers: [google, github],
  } = useAuthorization();

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
      success: "Welcome 👋",
      error: "A user with this email already exists",
      loading: "Loading...",
    });
  };

  useEffect(() => {
    if (error) toast.error("Someting went wrong 😕");
    if (loading) toast.loading("Loading...");
    if (user) router.push("/");
  }, [user]);

  return (
    <div className="min-height-screen h-screen grid place-items-center p-4">
      <Card className="max-w-[480px] w-full p-8">
        <CardTitle className="text-3xl text-center">Sign Up</CardTitle>

        <CardDescription className="text-center mt-2">
          Create an account
        </CardDescription>

        <CardContent className="mt-4 space-y-5 p-0">
          <form onSubmit={onSubmit} className="space-y-8">
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
              <fieldset className="space-y-1">
                <Label htmlFor="password_confirm" className="font-semibold">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  id="password_confirm"
                  name="password_confirm"
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
            Already have an account?{" "}
            <a href="#" className="underline underline-offset-4">
              Log In
            </a>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
