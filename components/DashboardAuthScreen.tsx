"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  User,
  signOut,
  deleteUser,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  registerUserWithQuotaCheck,
  checkUserRegistration,
  useRegisteredAccounts,
  MAX_ALLOWED_ACCOUNTS,
} from "@/lib/firestore-users";

interface DashboardAuthScreenProps {
  onAuthenticated?: (user: User) => void;
}

export default function DashboardAuthScreen({
  onAuthenticated,
}: DashboardAuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  const { count: registeredCount, remainingSlots, isFull } = useRegisteredAccounts();

  // Suppress Firebase Auth internal assertion errors from unhandled rejections/events
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      const msg = typeof reason === "string" ? reason : reason?.message || "";
      if (msg.includes("Pending promise was never set") || msg.includes("INTERNAL ASSERTION FAILED")) {
        event.preventDefault();
      }
    };
    const handleError = (event: ErrorEvent) => {
      const msg = event.message || "";
      if (msg.includes("Pending promise was never set") || msg.includes("INTERNAL ASSERTION FAILED")) {
        event.preventDefault();
      }
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);
    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleError);
    };
  }, []);

  const formatFirebaseError = (err: unknown) => {
    if (!err || typeof err !== "object") return "Authentication failed.";
    const code = (err as { code?: string }).code || "";
    if (code === "auth/invalid-credential" || code === "auth/wrong-password") {
      return "Invalid email or password. If you don't have an account yet, click 'Sign up' below.";
    }
    if (code === "auth/user-not-found") {
      return "No account found with this email. Click 'Sign up' below to create one.";
    }
    if (code === "auth/email-already-in-use") {
      return "This email is already in use. Please sign in instead.";
    }
    if (code === "auth/weak-password") {
      return "Password must be at least 6 characters long.";
    }
    if (code === "auth/invalid-email") {
      return "Please enter a valid email address.";
    }
    if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") {
      return "Sign in popup was closed or cancelled. Please try again or use Email/Password below.";
    }
    if (code === "auth/popup-blocked") {
      return "Sign in popup was blocked by your browser. Please allow popups or use Email/Password below.";
    }
    if (code === "auth/unauthorized-domain") {
      return "This domain is not authorized for OAuth in Firebase Console. Please use Email/Password below.";
    }
    if (code === "auth/operation-not-allowed") {
      return "Email/Password sign-in is not enabled in the Firebase Console yet. Please use 'Login with Google' or enable Email/Password provider in Firebase.";
    }
    if (code === "auth/too-many-requests") {
      return "Too many attempts. Please try again in a few moments or reset your password.";
    }
    if (code === "auth/network-request-failed") {
      return "Network connection issue. Please check your internet connection and try again.";
    }
    const message = (err as Error).message || "";
    if (message.includes("Pending promise was never set")) {
      return "Authentication popup closed. Please try again or use Email/Password below.";
    }
    return message || "An error occurred during authentication.";
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // Enforce 5 accounts max check before creating
        if (isFull) {
          setError("An error occurred. Please try again later.");
          setLoading(false);
          return;
        }

        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const regResult = await registerUserWithQuotaCheck(cred.user, "password");
        if (!regResult.success) {
          setError(regResult.error || "An error occurred. Please try again later.");
          return;
        }

        setNotice("Account created successfully!");
        if (onAuthenticated) onAuthenticated(cred.user);
      } else {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const regResult = await registerUserWithQuotaCheck(cred.user, "password");
        if (!regResult.success) {
          setError("Invalid email or password. Please try again later.");
          return;
        }
        if (onAuthenticated) onAuthenticated(cred.user);
      }
    } catch (err: unknown) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError("");
    setNotice("");
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      const cred = await signInWithPopup(auth, provider);
      
      const regResult = await registerUserWithQuotaCheck(cred.user, "google");
      if (!regResult.success) {
        try {
          await deleteUser(cred.user);
        } catch {
          try {
            await signOut(auth);
          } catch {}
        }
        setError(regResult.error || "An error occurred. Please try again later.");
        return;
      }

      if (onAuthenticated) onAuthenticated(cred.user);
    } catch (err: unknown) {
      setError(formatFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError("Please enter your email address in the field above to reset your password.");
      return;
    }
    setError("");
    setNotice("");
    try {
      await sendPasswordResetEmail(auth, cleanEmail);
      setNotice(`Password reset email sent to ${cleanEmail}. Please check your inbox.`);
    } catch (err: unknown) {
      setError(formatFirebaseError(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] text-white flex min-h-screen w-full overflow-y-auto selection:bg-zinc-800 selection:text-white antialiased">
      {/* LEFT COLUMN: Brand, Title, and Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-14 bg-[#09090b] relative z-10">
        {/* Top ELIMI Brand */}
        <div className="flex items-center space-x-2.5 select-none">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center p-1.5 shadow-xs overflow-hidden">
            <Image
              src="/assets/icons/ELIMI_LOGO.svg"
              alt="ELIMI Logo"
              width={24}
              height={24}
              className="w-full h-full object-contain filter invert brightness-200"
            />
          </div>
          <span className="text-[15px] font-semibold text-white tracking-tight">
            ELIMI
          </span>
        </div>

        {/* Center Container: Login Card matching the screenshot */}
        <div className="w-full max-w-[360px] mx-auto py-10 flex flex-col justify-center">
          {/* Heading and Subtitle */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
              {isSignUp ? "Create an account" : "Login to your account"}
            </h1>
            <p className="text-[13px] text-zinc-400 font-normal">
              {isSignUp
                ? "Enter your email below to create your account"
                : "Enter your credentials below to access the ELIMI portal"}
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-md bg-rose-950/40 border border-rose-900/60 text-rose-300 text-[12px] flex items-start space-x-2 animate-in fade-in duration-200">
              <span className="shrink-0 mt-0.5 font-bold">✕</span>
              <div className="flex-1 leading-relaxed">{error}</div>
            </div>
          )}

          {notice && (
            <div className="mb-4 p-3 rounded-md bg-emerald-950/40 border border-emerald-900/60 text-emerald-300 text-[12px] flex items-start space-x-2 animate-in fade-in duration-200">
              <span className="shrink-0 mt-0.5 font-bold">✓</span>
              <div className="flex-1 leading-relaxed">{notice}</div>
            </div>
          )}

          {/* Credentials Form */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="auth-email"
                className="block text-[13px] font-medium text-zinc-200 text-left"
              >
                Email
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="m@example.com"
                className="w-full h-10 px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-md text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="auth-password"
                  className="block text-[13px] font-medium text-zinc-200 text-left"
                >
                  Password
                </label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[12px] text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
                  >
                    Forgot your password?
                  </button>
                )}
              </div>
              <input
                id="auth-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 px-3 py-2 bg-zinc-900/90 border border-zinc-800 rounded-md text-[13px] text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500 transition-colors"
              />
            </div>

            {/* High-Contrast Light Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-10 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-[13px] transition-all duration-150 flex items-center justify-center shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-zinc-800 border-t-transparent rounded-full animate-spin" />
              ) : isSignUp ? (
                "Create Account"
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Divider: Or continue with */}
          <div className="relative my-5 select-none">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span className="bg-[#09090b] px-3 text-zinc-400 font-normal">
                Or continue with
              </span>
            </div>
          </div>

          {/* Login with Google (replaced Login with GitHub per prompt) */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full h-10 rounded-md bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border border-zinc-800 text-[13px] font-medium flex items-center justify-center gap-2.5 transition-colors cursor-pointer active:scale-[0.99] disabled:opacity-50"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Login with Google</span>
          </button>

          {/* Toggle between Login and Sign up */}
          <div className="text-center text-[13px] text-zinc-400 mt-6 select-none">
            {isSignUp ? (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                    setNotice("");
                  }}
                  className="text-zinc-200 hover:text-white underline underline-offset-4 cursor-pointer font-medium transition-colors"
                >
                  Log in
                </button>
              </>
            ) : (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                    setNotice("");
                  }}
                  className="text-zinc-200 hover:text-white underline underline-offset-4 cursor-pointer font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>

        {/* Bottom subtle note */}
        <div className="text-left text-[11px] text-zinc-600 select-none">
          Protected by Firebase Authentication &amp; Firestore Security Rules
        </div>
      </div>

      {/* RIGHT COLUMN: Mimics the screenshot with the dark surface & circular graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#18181b] items-center justify-center relative overflow-hidden select-none border-l border-zinc-900">
        {/* Subtle radial watermark pattern */}
        <div className="relative flex items-center justify-center w-[440px] h-[440px]">
          {/* Outer circle */}
          <div className="absolute inset-0 rounded-full border border-zinc-700/20" />

          {/* Middle circle */}
          <div className="absolute w-[300px] h-[300px] rounded-full border border-zinc-700/25" />

          {/* Inner circle */}
          <div className="absolute w-[160px] h-[160px] rounded-full border border-zinc-700/30" />

          {/* Radial Spokes (8 segments radiating outwards) */}
          <div className="absolute w-full h-px bg-zinc-700/20" />
          <div className="absolute w-px h-full bg-zinc-700/20" />
          <div className="absolute w-full h-px bg-zinc-700/20 rotate-45" />
          <div className="absolute w-full h-px bg-zinc-700/20 -rotate-45" />

          {/* Center Logo Frame */}
          <div className="relative w-16 h-16 rounded-xl border border-zinc-700/50 bg-[#18181b] flex items-center justify-center shadow-inner z-10 p-2.5 overflow-hidden">
            <Image
              src="/assets/icons/ELIMI_LOGO.svg"
              alt="ELIMI Logo"
              width={52}
              height={52}
              className="w-full h-full object-contain filter invert brightness-200"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
}
