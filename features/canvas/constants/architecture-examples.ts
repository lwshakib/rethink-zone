export const ARCHITECTURE_EXAMPLES = [
  // --- AWS ---
  { 
    title: "AWS E-commerce (High-Availability)", 
    prompt: "A robust multi-tier AWS e-commerce. Design an 'Edge Security' perimeter with CloudFront and WAF. Place the entry point in a 'Public Subnet' with an ALB. Create a 'Compute Fleet' group with Auto Scaling EC2 nodes. Finally, a 'Storage Tier' with RDS Aurora Multi-AZ and ElastiCache. Connect Edge > ALB > Compute > Storage." 
  },
  { 
    title: "AWS Serverless API (Event-Driven)", 
    prompt: "Advanced serverless architecture. Include an 'API Layer' with API Gateway. A 'Processing Engine' with Lambda functions inside a VPC. A 'State Layer' with DynamoDB and S3 for media. Integrate an 'Async Messaging' block with SQS and SNS for fan-out. Connect API > Processing > State and Processing > Async." 
  },
  { 
    title: "AWS Modern Data Lake", 
    prompt: "Enterprise Data Lake. Include an 'Ingestion' zone with Kinesis Firehose. A 'Bronze Lake' in S3 for raw data. A 'Processing' layer with AWS Glue and EMR. A 'Gold Lake' in S3 for curated data. Add an 'Analytics' block with Amazon Athena and QuickSight. Connect Ingestion > Raw > Processing > Curated > Analytics." 
  },
  { 
    title: "AWS Global Edge Static Site", 
    prompt: "Secure Static Hosting. Use Route 53 for DNS. A CloudFront distribution with Origin Access Control (OAC). A private S3 bucket in the 'Origin Storage' group. Add a 'Security' group with Lambda@Edge for headers and WAF for filtering. Connect Route 53 > CloudFront > Origin." 
  },
  { 
    title: "AWS Enterprise ML Ops", 
    prompt: "Production ML Lifecycle. Include a 'Data Prep' group with S3 and Glue. A 'Training Cluster' with SageMaker training jobs. A 'Model Management' block with SageMaker Model Registry. An 'Inference Tier' with ECS-hosted endpoints. Add a 'Monitoring' group with CloudWatch. Connect Prep > Training > Registry > Inference." 
  },

  // --- GCP ---
  { 
    title: "GCP Modern Serverless Web", 
    prompt: "Modern GCP web app. Use Cloud DNS and Cloud Load Balancing for global entry. An 'App Tier' with Cloud Run services and Cloud Functions. A 'Persistence' layer with Cloud SQL (Postgres) and Memorystore. Include 'Secret Management' with Secret Manager. Connect Load Balancing > App > Persistence." 
  },
  { 
    title: "GCP Big Data Analytics", 
    prompt: "Real-time GCP data stack. Use Pub/Sub for messaging. A 'Processing' layer with Dataflow jobs. A 'Warehouse' layer with BigQuery. Add a 'Machine Learning' block with Vertex AI for real-time predictions. Connect Pub/Sub > Dataflow > BigQuery > Vertex AI." 
  },
  { 
    title: "GCP GKE Service Mesh", 
    prompt: "Production K8s on GCP. Use a GKE Cluster inside a 'Private VPC'. Implement 'Anthos Service Mesh' (Istio) for internal traffic. Use 'Cloud SQL Auth Proxy' for secure DB access. Add a 'Monitoring' stack with Cloud Logging and Monitoring. Connect Entry > GKE > Database." 
  },

  // --- Azure ---
  { 
    title: "Azure Enterprise Hub-and-Spoke", 
    prompt: "Complex Azure network. Create a 'Hub VNet' with Azure Firewall and VPN Gateway. Create multiple 'Spoke VNets' for production. In the Hub, add an 'Azure Front Door' entry point. In the Spokes, place 'App Service Environments'. Connect Front Door > Hub Firewall > Spokes." 
  },
  { 
    title: "Azure Global Data Mesh", 
    prompt: "Highly available Azure data. Use Cosmos DB with Multi-region writes. An 'Identity' tier with Microsoft Entra ID. A 'Caching' layer with Azure Cache for Redis. Add 'Key Vault' for secure secrets. Connect App Service > Global DB and App Service > Redis." 
  },
  { 
    title: "Azure IoT Edge AI", 
    prompt: "Azure IoT Pipeline. 'Edge Devices' sending telemetry to 'IoT Hub'. A 'Stream Analytics' block for processing. Use 'Azure Functions' for real-time alerting. Store cold data in 'Blob Storage' and hot data in 'Cosmos DB'. Connect Devices > IoT Hub > Analytics > Storage." 
  },

  // --- Kubernetes Specific ---
  { 
    title: "K8s Microservices Grid", 
    prompt: "Detailed K8s architecture. Include an 'Ingress Layer' with NGINX Ingress Controller. A 'Service Mesh' (Istio) group managing 'Pod Sidecars'. Multiple 'Deployment' sets for Frontend, Backend, and Auth. Add a 'StatefulSet' group for Redis. Connect Ingress > Services > Pods > Redis." 
  },
  { 
    title: "K8s GitOps & Observability", 
    prompt: "Modern DevOps K8s. Include a 'GitOps Control' block with Flux CD or ArgoCD. A 'Monitoring' group with Prometheus, Grafana, and Alertmanager. A 'Worker Fleet' with multiple namespaces. Add 'Vault' for secret injection. Connect Repo > GitOps > Cluster and Cluster > Monitoring." 
  },
  
  // --- High Level / Conceptual ---
  { 
    title: "Standard 3-Tier Enterprise", 
    prompt: "A strictly isolated 3-tier app. 'Presentation-Tier' with Load Balancers. 'App-Tier' with containerized API services. 'Data-Tier' with clustered Databases. Add a 'Security Ops' group with IAM, Logging, and Intrusion Detection. Connect Pres > App > Data." 
  },
  { 
    title: "Zero Trust AI Inference", 
    prompt: "Secure AI Pipeline. Use an 'Identity Gateway' (IAP). A 'Model Service' tier with GPU-backed nodes. A 'Vector Store' group with Pinecone or Milvus. A 'Caching' layer with Redis. Connect Users > Gateway > Identity > Model > Vector Store." 
  },
  { 
    title: "Financial Core Banking Mesh", 
    prompt: "Highly secure FinTech architecture. Build an 'Isolated Network' with strict ACLs. A 'Transaction Engine' with high-concurrency Rust/Go services. A 'Mainframe Sync' block. A 'Fraud Detection' layer with real-time AI. Connect Gateway > Engine > Sync and Engine > Fraud."
  },
  { 
    title: "Global VOD Pipeline", 
    prompt: "High-scale video delivery. Use S3 for 'Source Assets'. A 'Processing' tier with Lambda and Elemental MediaConvert. A 'Distribution' group with CloudFront and multiple edge origins. Add 'EventBridge' for job status sync to a 'Dashboard' group. Connect Source > Processing > Distribution and Processing > EventBridge." 
  },
  { 
    title: "HIPAA Compliant Health-SaaS", 
    prompt: "Secure Medical Data Platform. Build a 'High-Trust' isolated VPC. A 'KMS/CloudTrail' security group for auditing. Use a 'Fargate API' tier behind an internal ALB. A 'Locked-down DB' with RDS Encryption-at-rest. Connect Users > WAF > ALB > API > Database." 
  },
  { 
    title: "Real-time Gaming Mesh", 
    prompt: "Low-latency multiplayer backend. Use G5 GPU nodes for 'Game Simulation'. A 'Global Accelerator' entry point. A 'Player Identity' group with Cognito. A 'Leaderboard' tier with Redis. Connect Multi-regional Users > Global Accelerator > Game Simulation > Leaderboard." 
  }
];
