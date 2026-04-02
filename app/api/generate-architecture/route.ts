import { NextResponse } from "next/server";
import { aiService } from "@/services/ai.services";
import { repositoryService } from "@/services/repository.services";
import { ARCHITECTURE_GENERATOR_SYSTEM_PROMPT } from "@/lib/prompts";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { prompt, existingCode, repoUrl } = await req.json();

    if (!prompt && !repoUrl) {
      return NextResponse.json(
        { error: "Prompt or Repository URL is required" },
        { status: 400 }
      );
    }

    // --- 1. AUTHENTICATION & CREDIT CONSUMPTION ---
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Fetch user and handle daily credit reset
    let user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const now = new Date();
    const lastReset = new Date(user.lastCreditReset);
    const todayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    if (lastReset < todayMidnight) {
      user = await prisma.user.update({
        where: { id: userId },
        data: {
          credits: 10,
          lastCreditReset: now,
        },
      });
    }

    // Check for sufficient credits
    if (user.credits < 1) {
      return NextResponse.json(
        { error: "Credits exhausted. You have to wait for daily limit reset." },
        { status: 403 }
      );
    }

    // CONSUME CREDIT IMMEDIATELY (Before Repo Analysis or AI Request)
    await prisma.user.update({
      where: { id: userId },
      data: {
        credits: {
          decrement: 1,
        },
      },
    });

    // --- 2. REPO ANALYSIS (IF REQUESTED) ---
    let repoContext = "";
    if (repoUrl) {
      try {
        const repoIndex = await repositoryService.analyzeRepo(repoUrl);
        repoContext = `CODEBASE INDEX FOR ANALYSIS:
Files: ${repoIndex.files.map((f) => f.path).join(", ")}
Significant Functions: ${repoIndex.functions.map((f) => `${f.name} (in ${f.file})`).join(", ")}
Classes/Modules: ${repoIndex.classes.map((c) => `${c.name} (in ${c.file})`).join(", ")}
Core Interactions: ${repoIndex.calls
          .slice(0, 50)
          .map((c) => `${c.from} -> ${c.to}`)
          .join(", ")}

INSTRUCTION: Use this codebase index to infer the actual software architecture. Map specific files/modules to appropriate cloud services or logical groups.`;
      } catch (e) {
        console.warn("Repo analysis failed, proceeding with prompt only:", e);
      }
    }

    // --- 3. AI GENERATION ---
    const finalPrompt =
      prompt ||
      "Generate a comprehensive architecture diagram based on this codebase.";

    const messages: { role: string; content: string }[] = [
      { role: "system", content: ARCHITECTURE_GENERATOR_SYSTEM_PROMPT },
    ];

    let userContent = "";
    if (repoContext) {
      userContent += `${repoContext}\n\n`;
    }

    if (existingCode) {
      userContent += `Current Architecture DSL:\n${existingCode}\n\nTask: ${finalPrompt}`;
    } else {
      userContent += finalPrompt;
    }

    messages.push({ role: "user", content: userContent });

    const result = await aiService.generateText(messages, {
      temperature: 0.2,
    });

    return NextResponse.json({
      result: result
        .replace(/```[a-z]*\n?/g, "")
        .replace(/\n?```/g, "")
        .trim(),
    });
  } catch (error) {
    console.error("API Generation Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
