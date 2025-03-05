"use client";
import { createContext, useContext } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  type User,
  type UserCredential,
  AuthProvider,
  GithubAuthProvider,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signInWithRedirect,
  signOut,
} from "firebase/auth";

import { FaGithub, FaGoogle } from "react-icons/fa";

interface AuthorizationContext {
  user: User | null | undefined;
  error: Error | undefined;
  loading: boolean;
  SignUpUser: (email: string, password: string) => Promise<UserCredential>;
  SignInUser: (email: string, password: string) => Promise<UserCredential>;
  SignInUserProvider: (provider: AuthProvider) => void;
  SignOutUser: () => Promise<void>;
  providers: ProviderData[];
}

type ProviderData = {
  provider: AuthProvider;
  icon: React.ReactElement;
};

const UserAuthorization = createContext<AuthorizationContext>(
  {} as AuthorizationContext
);

function AuthorizationProvider({ children }: any) {
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

  function SignInUserProvider(provider: AuthProvider) {
    signInWithRedirect(auth, provider);
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
