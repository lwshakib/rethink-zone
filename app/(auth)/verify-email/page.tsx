"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

/**
 * VerifyEmailPage
 * A simple confirmation landing page shown after a user has successfully 
 * verified their email address via the backend link.
 */
export default function VerifyEmailPage() {
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
              Email Verified!
            </h1>
            <p className="mt-4 text-zinc-500 dark:text-zinc-400">
              Your email address has been successfully confirmed. 
              You can now access all features of Rethink.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Button asChild className="h-11 w-full bg-zinc-900 text-zinc-50 hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200">
              <Link href="/sign-in">Continue to login</Link>
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
