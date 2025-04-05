"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";
import { useAuthorization } from "@/lib/context/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";  // Make sure to import Firebase auth
import { useRouter } from "next/navigation";

export default function AccountSettings() {
  const { user, SignOutUser } = useAuthorization();
  const [name, setName] = useState(user?.displayName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async () => {
    if (!user) {
      toast.error("User not found!");
      return;
    }

    setLoading(true);  // Show loading state

    try {
      const currentUser = auth.currentUser;  // Get the current user from Firebase

      // Update email if it has changed
      if (email !== user.email) {
        await currentUser?.updateEmail(email);  // Update email using Firebase Auth method
        toast.success("Email updated successfully!");
      }
      
      // Update profile if the display name has changed
      if (name !== user.displayName) {
        await currentUser?.updateProfile({ displayName: name });  // Update profile using Firebase Auth method
        toast.success("Profile updated successfully!");
      }

      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Failed to update account: " + error.message);  // Handle errors gracefully
    }
  };

  const handleClearHistory = () => {
    // Placeholder for history clearing logic
    toast.success("History cleared successfully!");
  };

  return (
    <div className="min-h-screen h-screen grid place-items-center p-4">
      <Card className="max-w-[600px] w-full p-8">
        <CardTitle className="text-3xl text-center font-mono font-black">
          Account Settings
        </CardTitle>

        <CardDescription className="text-center mt-2 font-mono">
          Manage your account information
        </CardDescription>

        <CardContent className="mt-4 space-y-6 p-0">
          <div className="space-y-4">
            <fieldset className="space-y-1">
              <Label htmlFor="name" className="font-semibold font-sans">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
              />
            </fieldset>

            <fieldset className="space-y-1">
              <Label htmlFor="email" className="font-semibold font-sans">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="EMAIL@DOMAIN.COM"
              />
            </fieldset>

            {/* Password reset button */}
            <div className="space-y-1">
            <Button
      onClick={() => router.push('/reset_password')}  // Navigate to /reset_password
      className="w-full font-bold font-sans"
    >
      Reset Password
    </Button>

            </div>
          </div>

          <Button
            onClick={handleUpdate}
            className="w-full font-bold font-sans"
            disabled={loading}  // Disable the button when loading
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>

          <Button
            onClick={handleClearHistory}
            className="w-full font-bold font-sans bg-red-600 hover:bg-red-500"
          >
            Clear History
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
