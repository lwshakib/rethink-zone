"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

/**
 * ResetPasswordContent
 * Handles the logic and UI for setting a new password.
 */
function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const token = searchParams.get("token");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await authClient.resetPassword({
        newPassword: password,
        token: token || undefined, // Send explicitly just in case
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
      } else {
        setIsSuccess(true);
        toast.success("Password reset successfully!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Side: Success State */}
        <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12 xl:px-24">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <CheckCircle2 className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Password Reset
              </h1>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                Your password has been successfully updated. You can now log in with your new credentials.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-11 w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Link href="/sign-in">Back to login</Link>
              </Button>
            </div>
          </div>
        </div>
        {/* Right Side: Image Placeholder */}
        <div className="hidden bg-zinc-100 lg:block lg:w-1/2 dark:bg-zinc-900/50">
          <div className="flex h-full items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
            <div className="relative h-full w-full opacity-20 contrast-125 grayscale">
              <div className="absolute inset-0 bg-linear-to-bl from-zinc-500/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12 xl:px-24">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Invalid Reset Link
              </h1>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                It looks like this password reset link is missing or invalid. Please request a new one.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Button asChild className="h-11 w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <Link href="/forgot-password">Request new link</Link>
              </Button>
            </div>
          </div>
        </div>
        <div className="hidden bg-zinc-100 lg:block lg:w-1/2 dark:bg-zinc-900/50">
          <div className="flex h-full items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
            <div className="relative h-full w-full opacity-20 contrast-125 grayscale">
              <div className="absolute inset-0 bg-linear-to-bl from-zinc-500/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side: Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12 xl:px-24">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-10 flex flex-col items-start">
            <Link href="/" aria-label="go home">
              <LogoIcon className="size-8" />
            </Link>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Set new password
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Please enter your new password below.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                New password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Confirm new password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
            <Button
              type="submit"
              className="mt-2 w-full h-11 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
                  Resetting password...
                </>
              ) : (
                "Reset password"
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side: Image Placeholder */}
      <div className="hidden bg-zinc-100 lg:block lg:w-1/2 dark:bg-zinc-900/50">
        <div className="flex h-full items-center justify-center border-l border-zinc-200 dark:border-zinc-800">
          <div className="relative h-full w-full opacity-20 contrast-125 grayscale">
            <div className="absolute inset-0 bg-linear-to-bl from-zinc-500/20 to-transparent" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * ResetPasswordPage
 * Wrapped in Suspense to handle useSearchParams.
 */
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <section className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-32 dark:bg-transparent">
        <Loader2 className="h-12 w-12 animate-spin text-zinc-500" />
      </section>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
