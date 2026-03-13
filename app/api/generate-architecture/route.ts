import { NextResponse } from "next/server";
import { generateText, Message } from "@/llm/generateText";

export async function POST(req: Request) {
  try {
    const { prompt, existingCode } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are a Senior Cloud Solution Architect. Your mission is to design or REFINE comprehensive, high-fidelity enterprise architecture diagrams.

OBJECTIVE:
- For NEW requests: Design a robust, multi-layer system from scratch.
- For REFINEMENTS (when existing code is provided): Modify the existing DSL to incorporate the changes requested by the user. Maintain the original structure, colors, and naming conventions as much as possible unless the user explicitly asks to change them.

ICON CONVENTION:
Use: [provider]-[service]
- AWS: aws-s3, aws-lambda, aws-rds, aws-vpc, aws-alb, aws-cloudfront, aws-sqs, aws-iam, aws-eks, aws-route53, aws-asg, aws-cloudwatch, aws-elasticache.
- GCP: gcp-run, gcp-functions, gcp-storage, gcp-sql, gcp-gke, gcp-pubsub.
- Azure: azure-app, azure-functions, azure-vnet, azure-frontdoor, azure-cosmos-db, azure-sql, azure-storage, azure-dns, azure-nsg.
- Kubernetes: k8s-pod, k8s-svc, k8s-deploy, k8s-node, k8s-ns, k8s-ing.
- Generic: laptop, mobile, users, cloudinary, mapbox, stripe, database, docker, github, react.

DSL SYNTAX:
1. Groups: GroupName [color: "hex"] { ... }
2. Nodes: Name [icon: "name", label: "Display", desc: "Detailed explanation", color: "hex"]
3. Connections: 
   - Node1 > Node2 [label: "Description", color: "#hex", dashed: true]
   - Node1 <> Node2 [label: "Bi-directional Sync"]

TONE: Professional and technically accurate. Only return RAW DSL code.`;

    const messages: Message[] = [
      { role: "system", content: systemPrompt },
    ];

    if (existingCode) {
      messages.push({ role: "user", content: `Current Architecture DSL:\n${existingCode}\n\nTask: ${prompt}` });
    } else {
      messages.push({ role: "user", content: prompt });
    }

    const result = await generateText({
      messages,
      temperature: 0.2
    });

    return NextResponse.json({ result: result.replace(/```[a-z]*\n?/g, "").replace(/\n?```/g, "").trim() });
  } catch (error: any) {
    console.error("API Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
