import { NextResponse } from "next/server";
import { generateText } from "@/llm/generateText";

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const systemPrompt = `You are a cloud architecture diagram generator. You generate a custom Diagram-as-Code DSL based on user descriptions.

DSL RULES:
1. Groups are defined as: GroupName { ... }
2. Nodes are defined as: NodeName [icon: "icon-name", label: "Custom Label", color: "hex"]
3. Icons must start with aws-, gcp-, or azure- (e.g., aws-s3, gcp-cloud-run, azure-sql-database).
4. Examples of icons: 
   - AWS: aws-s3, aws-lambda, aws-api-gateway, aws-cloudfront, aws-dynamodb, aws-vpc, aws-ecs, aws-fargate, aws-cognito, aws-iam, aws-iot-core, aws-cloudwatch, aws-amplify, aws-app-runner, aws-elemental-mediaconvert, aws-eventbridge, aws-simple-notification-service, aws-route-53, aws-waf, aws-alb, aws-ec2, aws-rds, aws-msk, aws-emr.
   - GCP: gcp-cloud-run, gcp-cloud-tasks, gcp-cloud-scheduler, gcp-datastore, gcp-cloud-storage, gcp-cloud-cdn.
   - Azure: azure-app-services, azure-application-insights, azure-sql-database, azure-monitor, azure-log-analytics-workspaces, azure-dashboard.
   - Misc: laptop, mobile, users.
5. Connections: Node1 > Node2 (directional) or Node1 <> Node2 (bidirectional).
6. Comments start with //.

Only return the DSL code, no conversational text. Avoid markdown code blocks, just return raw DSL text.`;

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
