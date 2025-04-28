"use client";
import { createContext, PropsWithChildren, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  type User,
  type UserCredential,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";

import { FaGithub, FaGoogle } from "react-icons/fa";

interface AuthorizationContext {
  user: User | null | undefined;
  error: Error | undefined;
  loading: boolean;
  SignUpUser: (email: string, password: string) => Promise<UserCredential>;
  SignInUser: (email: string, password: string) => Promise<UserCredential>;
  SignInUserProvider: (provider: AuthProvider) => Promise<UserCredential>;
  SignOutUser: () => Promise<void>;
  providers: ProviderData[];
}

type ProviderData = {
  provider: AuthProvider;
  icon: React.ReactElement;
};

const UserAuthorization = createContext<AuthorizationContext>(
  {} as AuthorizationContext,
);

function AuthorizationProvider({ children }: PropsWithChildren) {
  const [user, loading, error] = useAuthState(auth);

  const providers: ProviderData[] = [
    { provider: new GoogleAuthProvider(), icon: <FaGoogle /> },
    { provider: new GithubAuthProvider(), icon: <FaGithub /> },
  ];

  async function SignUpUser(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result;
  }

  async function SignInUser(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result;
  }

  async function SignInUserProvider(provider: AuthProvider) {
    const result = await signInWithPopup(auth, provider);
    return result;
  }

  async function SignOutUser() {
    return await signOut(auth);
  }

  return (
    <UserAuthorization.Provider
      value={{
        user,
        loading,
        error,
        SignUpUser,
        SignInUser,
        SignOutUser,
        SignInUserProvider,
        providers,
      }}
    >
      {children}
    </UserAuthorization.Provider>
  );
}

function useAuthorization() {
  return useContext(UserAuthorization);
}

export { AuthorizationProvider, useAuthorization };
export type { ProviderData, AuthorizationContext };
