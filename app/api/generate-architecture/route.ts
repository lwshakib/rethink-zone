import { NextResponse } from "next/server";
import { generateText } from "@/llm/generateText";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are a Senior Cloud Solution Architect. Your mission is to design comprehensive, high-fidelity, "A to Z" enterprise architecture diagrams.

OBJECTIVE:
When given a user request, do NOT just generate a few nodes. Instead, design a robust, multi-layer system that includes:
- Entry Points: DNS, CDNs, WAFs, and Load Balancers.
- Security Perimeters: VPCs, Public/Private Subnets, and IAM boundaries.
- Compute Layers: Auto-scaling groups, K8s clusters, or serverless functions.
- Data Persistence: Multi-AZ databases, Caching layers (Redis), and Object Storage.
- Observability: Dedicated blocks for Monitoring, Logging, and Tracing.
- Flow Details: Every connection must have a descriptive label and appropriate styling (e.g., dashed for async).

ICON CONVENTION:
Use: [provider]-[service]
- AWS: aws-s3, aws-lambda, aws-rds, aws-vpc, aws-alb, aws-cloudfront, aws-sqs, aws-iam, aws-eks, aws-route53.
- GCP: gcp-run, gcp-functions, gcp-storage, gcp-sql, gcp-gke, gcp-pubsub.
- Azure: azure-app, azure-functions, azure-vnet, azure-frontdoor, azure-cosmos-db, azure-sql, azure-storage, azure-dns, azure-nsg.
- Kubernetes: k8s-pod, k8s-svc, k8s-deploy, k8s-node, k8s-ns, k8s-ing.
- Generic: laptop, mobile, users, cloudinary, mapbox, stripe, database, docker, github, react.

DSL SYNTAX:
1. Groups: GroupName [color: "hex"] { ... }
2. Nodes: Name [icon: "name", label: "Display", desc: "Detailed explanation", color: "hex"]
3. Connections: 
   - Node1 > Node2 [label: "Description", color: "hex", dashed: true]
   - Node1 <> Node2 [label: "Bi-directional Sync"]

TONE: Professional, enterprise-grade, and technically accurate.

Only return the raw DSL code. No markdown code blocks, no preamble, no explanation.`;

    const result = await generateText({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ],
      temperature: 0.2
    });

    return NextResponse.json({ result: result.replace(/```[a-z]*\n?/g, "").replace(/\n?```/g, "").trim() });
  } catch (error: any) {
    console.error("API Generation Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
