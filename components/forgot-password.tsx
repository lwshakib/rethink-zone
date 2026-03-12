"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { LogoIcon } from "@/components/logo";
import { Loader2, MailCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
      } else {
        setIsSent(true);
        toast.success("Reset email sent!");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        {/* Left Side: Image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <Image
            src="/auth/forgot-password.png"
            alt="Forgot Password"
            fill
            className="object-cover contrast-110"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-br from-zinc-900/10 to-transparent" />
        </div>

        {/* Right Side: Success State */}
        <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12 xl:px-24">
          <div className="mx-auto w-full max-w-xl">
            <div className="mb-8 flex flex-col items-center text-center">
              <div className="mb-6 rounded-full bg-zinc-100 p-4 dark:bg-zinc-900">
                <MailCheck className="h-12 w-12 text-zinc-900 dark:text-zinc-100" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Check your email
              </h1>
              <p className="mt-4 text-zinc-500 dark:text-zinc-400">
                We&apos;ve sent a password reset link to <strong className="text-zinc-900 dark:text-zinc-100 font-medium">{email}</strong>.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Button asChild className="h-11 w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
                <a href="https://mail.google.com" target="_blank" rel="noopener noreferrer">
                  Go to Gmail
                </a>
              </Button>
              <Button asChild variant="outline" className="h-11 w-full border-zinc-200 dark:border-zinc-800">
                <Link href="/sign-in">Back to login</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side: Image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <Image
          src="/auth/forgot-password.png"
          alt="Forgot Password"
          fill
          className="object-cover contrast-110"
        />
        <div className="absolute inset-0 bg-linear-to-br from-zinc-900/10 to-transparent" />
      </div>

      {/* Right Side: Form */}
      <div className="flex w-full flex-col justify-center px-4 py-12 lg:w-1/2 lg:px-12 xl:px-24">
        <div className="mx-auto w-full max-w-xl">
          <div className="mb-10 flex flex-col items-start">
            <Link href="/" aria-label="go home">
              <LogoIcon className="size-8" />
            </Link>
            <h1 className="mt-8 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Forgot password?
            </h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">
              Enter your email address and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11 border-zinc-200 focus:ring-zinc-900 dark:border-zinc-800 dark:focus:ring-zinc-100"
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-zinc-400" />
                  Sending link...
                </>
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Remember your password?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
