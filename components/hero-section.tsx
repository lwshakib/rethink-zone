import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FilePenLine,
  Kanban,
  LayoutPanelLeft,
  ShieldCheck,
  Sparkles,
  UsersRound,
  Zap,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Variants } from "framer-motion";

import { AnimatedGroup } from "@/components/ui/animated-group";
import { TextEffect } from "@/components/ui/text-effect";
import { HeroHeader } from "./header";

const transitionVariants = {
  item: {
    hidden: { opacity: 0, filter: "blur(12px)", y: 12 },
    visible: {
      opacity: 1,
      filter: "blur(0px)",
      y: 0,
      transition: { type: "spring", bounce: 0.3, duration: 1.5 },
    },
  },
} satisfies { item: Variants };

const featureCards = [
  {
    title: "Docs + canvas together",
    description:
      "Edit structured docs while sketching on an infinite canvas without switching tabs.",
    icon: LayoutPanelLeft,
  },
  {
    title: "Move ideas to delivery",
    description:
      "Track work with the built-in kanban board so brainstorms become shipped tasks.",
    icon: Kanban,
  },
  {
    title: "Rich writing experience",
    description:
      "Slash commands, block-based editing, and autosave keep notes fast and dependable.",
    icon: FilePenLine,
  },
  {
    title: "Secure by default",
    description:
      "Authentication, protected routes, and database-backed workspaces out of the box.",
    icon: ShieldCheck,
  },
  {
    title: "Realtime-ready UX",
    description:
      "Smooth motion, optimistic UI, and saved state so teams stay in flow.",
    icon: Sparkles,
  },
  {
    title: "Visual collaboration",
    description:
      "Drop diagrams, stickies, and arrows to map flows before you commit to code.",
    icon: ArrowRight,
  },
];

const steps = [
  {
    title: "Create a workspace",
    body: "Spin up a shared room for your initiative. Every workspace keeps docs, canvas, and board in sync.",
  },
  {
    title: "Capture in two modes",
    body: "Draft specs and sketch flows side-by-side. Toggle between document, canvas, or a combined view.",
  },
  {
    title: "Ship as one team",
    body: "Prioritize in kanban, keep context attached, and pick up where you left off with autosave.",
  },
];

export default function HeroSection() {
  return (
    <>
      <HeroHeader />
      <main className="overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 isolate hidden contain-strict lg:block"
        >
          <div className="w-140 h-320 -translate-y-87.5 absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(0,0%,85%,.08)_0,hsla(0,0%,55%,.02)_50%,hsla(0,0%,45%,0)_80%)]" />
          <div className="h-320 absolute left-0 top-0 w-60 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.06)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)] [translate:5%_-50%]" />
          <div className="h-320 -translate-y-87.5 absolute left-0 top-0 w-60 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(0,0%,85%,.04)_0,hsla(0,0%,45%,.02)_80%,transparent_100%)]" />
        </div>
        <section id="hero">
          <div className="relative pt-24">
            <div className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--color-background)_75%)]"></div>
            <div className="mx-auto max-w-5xl px-6">
              <div className="sm:mx-auto lg:mr-auto lg:mt-0">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="rounded-full border-foreground/15 bg-foreground/5 text-foreground/80">
                    Built for Rethink Zone
                  </Badge>
                  <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-full border border-border/60 px-3 py-1">
                      Docs + Canvas
                    </span>
                    <span className="rounded-full border border-border/60 px-3 py-1">
                      Kanban built-in
                    </span>
                    <span className="rounded-full border border-border/60 px-3 py-1">
                      Autosave & auth
                    </span>
                  </div>
                </div>
                <TextEffect
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  as="h1"
                  className="mt-6 max-w-3xl text-balance text-5xl font-semibold md:text-6xl lg:mt-10"
                >
                  Rethink the way you write, sketch, and ship in one workspace.
                </TextEffect>
                <TextEffect
                  per="line"
                  preset="fade-in-blur"
                  speedSegment={0.3}
                  delay={0.5}
                  as="p"
                  className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
                >
                  Rethink Zone combines rich documents, an infinite canvas, and
                  a kanban board so product teams can capture ideas, align
                  decisions, and move work forward without losing context.
                </TextEffect>

                <AnimatedGroup
                  variants={{
                    container: {
                      visible: {
                        transition: {
                          staggerChildren: 0.05,
                          delayChildren: 0.75,
                        },
                      },
                    },
                    ...transitionVariants,
                  }}
                  className="mt-12 flex items-center gap-2"
                >
                  <div
                    key={1}
                    className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5"
                  >
                    <Button
                      asChild
                      size="lg"
                      className="rounded-xl px-5 text-base"
                    >
                      <Link href="/sign-up">
                        <span className="text-nowrap">Start free</span>
                      </Link>
                    </Button>
                  </div>
                  <Button
                    key={2}
                    asChild
                    size="lg"
                    variant="ghost"
                    className="h-10.5 rounded-xl px-5 text-base"
                  >
                    <Link href="/workspaces">
                      <span className="text-nowrap">View workspaces</span>
                    </Link>
                  </Button>
                </AnimatedGroup>
                <div className="mt-6 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
                    <span
                      className="size-2 rounded-full bg-emerald-500"
                      aria-hidden
                    />
                    Autosaves every change
                  </div>
                  <div className="flex items-center gap-2 rounded-full border border-border/60 px-3 py-1">
                    <span
                      className="size-2 rounded-full bg-sky-500"
                      aria-hidden
                    />
                    Split view: document + canvas + kanban
                  </div>
                </div>
              </div>
            </div>
            <AnimatedGroup
              variants={{
                container: {
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.75,
                    },
                  },
                },
                ...transitionVariants,
              }}
            >
              <div className="mask-b-from-55% relative -mr-56 mt-10 overflow-hidden px-2 sm:mr-0 sm:mt-14 md:mt-20">
                <div className="inset-shadow-2xs ring-background dark:inset-shadow-white/20 bg-background relative mx-auto max-w-5xl overflow-hidden rounded-3xl border p-4 shadow-lg shadow-zinc-950/15 ring-1">
                  <Image
                    className="bg-background aspect-15/8 relative hidden rounded-2xl dark:block"
                    src="/app.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                  <Image
                    className="z-2 border-border/25 aspect-15/8 relative rounded-2xl border dark:hidden"
                    src="/app.png"
                    alt="app screen"
                    width="2700"
                    height="1440"
                  />
                </div>
              </div>
            </AnimatedGroup>
          </div>
        </section>
        <section id="features" className="bg-background pb-10 pt-16 md:pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-foreground/80">
                  Why teams pick Rethink Zone
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Purpose-built for the document, canvas, and kanban flow
                  already in the app.
                </p>
              </div>
              <Link
                href="/workspaces"
                className="text-sm font-medium text-foreground/80 hover:text-foreground inline-flex items-center gap-1"
              >
                Explore the product <ArrowRight className="size-4" />
              </Link>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {featureCards.map((feature) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-2xl border bg-gradient-to-b from-foreground/[0.04] to-transparent p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-foreground/20"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                      <feature.icon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-foreground">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="flow" className="bg-background pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 rounded-3xl border bg-gradient-to-br from-foreground/[0.03] via-transparent to-foreground/[0.04] p-8 md:grid-cols-[1.2fr_1fr] md:p-10">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground/80">Flow</p>
                <h3 className="text-3xl font-semibold leading-tight">
                  Capture ideas, design collaboratively, and organize delivery
                  without leaving your workspace.
                </h3>
                <p className="text-muted-foreground text-base">
                  The landing page now mirrors the core product: documents for
                  clarity, a whiteboard for exploration, and a kanban board for
                  execution.
                </p>
                <div className="grid gap-4 sm:grid-cols-3">
                  {steps.map((step) => (
                    <div
                      key={step.title}
                      className="rounded-2xl border bg-background/80 p-4"
                    >
                      <p className="text-sm font-semibold text-foreground">
                        {step.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {step.body}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-3 pt-2">
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Clerk auth baked in
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Drizzle ORM persistence
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Autosave & optimistic UI
                  </Badge>
                </div>
              </div>
              <div className="flex flex-col gap-4 rounded-2xl border bg-background/50 p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground/80">
                  What you get
                </p>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-emerald-500" />
                    Split tab that shows document and canvas simultaneously so
                    decisions stay connected.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-sky-500" />
                    Kanban that saves automatically as your boards change,
                    matching the in-app experience.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-indigo-500" />
                    Authenticated entry points (`/sign-in`, `/sign-up`) routing
                    directly into `/workspaces`.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-amber-500" />
                    Motion-powered hero with preview screens that align with the
                    product UI.
                  </li>
                </ul>
                <Button asChild size="lg" className="mt-auto rounded-xl">
                  <Link href="/sign-up">Create your account</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="views" className="bg-background pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-foreground/80">
                  Workspace views
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Every view in the product has a landing-page twin so visitors
                  know what they get.
                </p>
              </div>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="rounded-full"
              >
                <Link href="/workspaces">Open workspace</Link>
              </Button>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {[
                {
                  title: "Document view",
                  body: "Write specs, decisions, and meeting notes with slash commands and autosave.",
                  icon: FilePenLine,
                },
                {
                  title: "Canvas view",
                  body: "Sketch flows, add stickies, and align on architecture before you commit.",
                  icon: LayoutPanelLeft,
                },
                {
                  title: "Split view",
                  body: "See document and canvas side-by-side so narrative and visuals stay connected.",
                  icon: Sparkles,
                },
                {
                  title: "Kanban board",
                  body: "Move work from backlog to done without leaving context, just like in-app.",
                  icon: Kanban,
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border bg-gradient-to-b from-background to-foreground/[0.02] p-5 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex size-10 items-center justify-center rounded-xl border bg-background">
                      <card.icon className="size-5 text-foreground" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-foreground">
                        {card.title}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="guardrails" className="bg-background pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 rounded-3xl border bg-gradient-to-tr from-foreground/[0.03] via-transparent to-foreground/[0.04] p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
              <div className="space-y-4">
                <p className="text-sm font-semibold text-foreground/80">
                  Built-in guardrails
                </p>
                <h3 className="text-3xl font-semibold leading-tight">
                  Secure, performant, and ready to onboard teams.
                </h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 size-4 text-emerald-500" />
                    Clerk authentication and protected routes keep workspaces
                    private by default.
                  </li>
                  <li className="flex items-start gap-2">
                    <Database className="mt-0.5 size-4 text-sky-500" />
                    Drizzle ORM + API routes persist documents, canvas data, and
                    kanban boards.
                  </li>
                  <li className="flex items-start gap-2">
                    <Zap className="mt-0.5 size-4 text-amber-500" />
                    Autosave with optimistic updates mirrors the in-app behavior
                    shown above.
                  </li>
                  <li className="flex items-start gap-2">
                    <UsersRound className="mt-0.5 size-4 text-indigo-500" />
                    Multi-tab navigation (document, canvas, both, kanban) for
                    every workspace.
                  </li>
                </ul>
                <div className="flex flex-wrap gap-3">
                  <Badge className="rounded-full bg-foreground text-background">
                    Ships fast
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Motion-first UI
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Responsive layouts
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border bg-background/70 p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground/80">
                  In-product snapshot
                </p>
                <div className="mt-4 space-y-4 text-sm text-muted-foreground">
                  <p>
                    From the landing page, users jump into authenticated flows
                    at `/sign-up` or `/sign-in`, then land in `/workspaces` with
                    autosaved boards.
                  </p>
                  <p>
                    The detail page mirrors the tabs shown here: Both, Document,
                    Canvas, and Kanban—so expectations match reality.
                  </p>
                  <p>
                    Calls to action link directly to those routes to reduce
                    bounce and shorten time-to-value.
                  </p>
                </div>
                <Button asChild size="lg" className="mt-6 w-full rounded-xl">
                  <Link href="/sign-in">Sign in to explore</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="bg-background pb-20">
          <div className="mx-auto max-w-5xl px-6">
            <div className="rounded-3xl border bg-gradient-to-r from-foreground/[0.03] to-transparent p-8 md:p-10">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground/80">
                    Pricing
                  </p>
                  <h3 className="text-3xl font-semibold leading-tight">
                    Start free, grow with your team.
                  </h3>
                  <p className="text-muted-foreground text-base">
                    Unlimited drafts while you explore. Upgrade when you invite
                    teammates and need more storage.
                  </p>
                </div>
                <div className="rounded-2xl border bg-background/70 p-6 shadow-sm">
                  <p className="text-sm font-medium text-foreground/80">Team</p>
                  <p className="mt-2 text-3xl font-semibold">
                    $12
                    <span className="text-base text-muted-foreground">
                      {" "}
                      / user / mo
                    </span>
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <li>Shared workspaces with docs, canvas, and kanban</li>
                    <li>Autosave, history, and secure access</li>
                    <li>Priority support for product teams</li>
                  </ul>
                  <Button asChild size="lg" className="mt-6 w-full rounded-xl">
                    <Link href="/sign-up">Get started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="bg-background pb-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="grid gap-8 rounded-3xl border bg-gradient-to-b from-foreground/[0.02] to-transparent p-8 md:grid-cols-[1.2fr_0.8fr] md:p-10">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-foreground/80">
                  About
                </p>
                <h3 className="text-3xl font-semibold leading-tight">
                  Built for product teams who think in docs and diagrams.
                </h3>
                <p className="text-muted-foreground text-base">
                  Rethink Zone bundles writing, sketching, and delivery into one
                  flow. The landing page mirrors the in-app experience so
                  visitors know exactly what they get before signing in.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Docs + Canvas
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Kanban built-in
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-foreground/20 text-foreground/90"
                  >
                    Clerk auth
                  </Badge>
                </div>
              </div>
              <div className="rounded-2xl border bg-background/70 p-6 shadow-sm">
                <p className="text-sm font-semibold text-foreground/80">
                  Next steps
                </p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  <li>Sign up to create your first workspace.</li>
                  <li>Open the split view to keep docs and canvas aligned.</li>
                  <li>Track outcomes on the kanban board in the same tab.</li>
                </ul>
                <Button asChild size="lg" className="mt-6 w-full rounded-xl">
                  <Link href="/sign-up">Join Rethink Zone</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
