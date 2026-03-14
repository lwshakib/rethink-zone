import { NextResponse } from "next/server";
import { generateText, Message } from "@/llm/generateText";
import { analyzeRepo } from "@/lib/repo-analyzer";
import { ARCHITECTURE_SYSTEM_PROMPT } from "@/llm/prompts";

export async function POST(req: Request) {
  try {
    const { prompt, existingCode, repoUrl } = await req.json();

    if (!prompt && !repoUrl) {
      return NextResponse.json(
        { error: "Prompt or Repository URL is required" },
        { status: 400 }
      );
    }

    let repoContext = "";
    if (repoUrl) {
      try {
        const repoIndex = await analyzeRepo(repoUrl);
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
        // We don't fail the whole request, but we could add a warning to the response if we had a way
      }
    }

    const finalPrompt =
      prompt ||
      "Generate a comprehensive architecture diagram based on this codebase.";

    const messages: Message[] = [
      { role: "system", content: ARCHITECTURE_SYSTEM_PROMPT },
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

    const result = await generateText({
      messages,
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
