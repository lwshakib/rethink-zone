import { DiagramTemplate } from "../types";



export const DIAGRAM_CATALOG: DiagramTemplate[] = [
  {
    name: "Enterprise Multi-Region DR Engine",
    description:
      "A massive, production-grade global architecture spanning two AWS regions with Route 53 failover, cross-region replication, and multi-tier security perimeters.",
    thumbnail: "Network",
    shapes: {
      figures: [
        {
          id: "fig-global",
          x: 0,
          y: 0,
          width: 1200,
          height: 1000,
          figureNumber: 1,
          title: "Architecture: Global Multi-Region Disaster Recovery (SDR-999)",
          code: `Group: Global Traffic Management [color: "#2c3e50"] {
  users [icon: "users", label: "Global Users", desc: "Clients accessing from Web/Mobile"]
  aws-route53 [icon: "aws-route53", label: "Route 53", desc: "DNS Failover & Geolocation Routing"]
  aws-cloudfront [icon: "aws-cloudfront", label: "CloudFront CDN", desc: "Global Edge Content Delivery"]
  aws-waf [icon: "aws-waf", label: "AWS WAF", desc: "Layer 7 Security Filtering"]
}

Group: US-EAST-1 (Primary) [color: "#2980b9"] {
  aws-vpc-primary [icon: "aws-vpc", label: "Primary VPC", desc: "Production Network Environment"]
  aws-alb-primary [icon: "aws-alb", label: "ALB Primary", desc: "Application Load Balancer"]
  
  Group: Private Subner [color: "#34495e"] {
    aws-asg-primary [icon: "aws-asg", label: "App ASG", desc: "Auto-scaled EC2 Compute Fleet"]
    aws-rds-primary [icon: "aws-rds", label: "Aurora Multi-AZ", desc: "Primary Database (Writer Node)"]
  }
}

Group: US-WEST-2 (Failover) [color: "#e67e22"] {
  aws-vpc-failover [icon: "aws-vpc", label: "Failover VPC", desc: "Hot-Standby Environment"]
  aws-alb-failover [icon: "aws-alb", label: "ALB Failover", desc: "Passive Entry Point"]
  
  Group: Secondary Tier [color: "#34495e"] {
    aws-asg-failover [icon: "aws-asg", label: "App ASG (Standby)", desc: "Dormant Capacity"]
    aws-rds-replica [icon: "aws-rds", label: "Aurora Read-Replica", desc: "Secondary Database (Reader Node)"]
  }
}

# Traffic Flows
users > aws-route53
aws-route53 > aws-cloudfront
aws-cloudfront > aws-waf

aws-waf > aws-alb-primary [color: "#27ae60"]
aws-waf > aws-alb-failover [color: "#e74c3c", dashed: true]

aws-alb-primary > aws-asg-primary
aws-asg-primary > aws-rds-primary

aws-rds-primary <> aws-rds-replica [dashed: true]`
        }
      ]
    }
  },
  {
    name: "Kubernetes Service Mesh (Istio)",
    description:
      "Advanced Kubernetes microservices architecture with a full control plane, worker nodes, and an integrated Istio service mesh for traffic management and observability.",
    thumbnail: "Box",
    shapes: {
      figures: [
        {
          id: "fig-k8s-mesh",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Enterprise Kubernetes Mesh & Observability Stack",
          code: `Group: Ingress Layer [color: "#e74c3c"] {
  k8s-ing [icon: "k8s-ing", label: "NGINX Ingress", desc: "Cluster Entry point"]
  aws-waf [icon: "aws-waf", label: "WAF Protection", desc: "Edge Security"]
}

Group: Control Plane [color: "#34495e"] {
  k8s-master [icon: "k8s-node", label: "K8s API Server", desc: "Cluster Orchestrator"]
  etcd [icon: "database", label: "etcd", desc: "Cluster State Key-Value Store"]
}

Group: Worker Fleet [color: "#2980b9"] {
  Group: Frontend Service [color: "#27ae60"] {
    pod-web-1 [icon: "k8s-pod", label: "Web Pod A", desc: "React Frontend Container"]
    pod-web-2 [icon: "k8s-pod", label: "Web Pod B", desc: "React Frontend Container"]
  }
  
  Group: Payment API [color: "#8e44ad"] {
    pod-pay-1 [icon: "k8s-pod", label: "Payment API", desc: "Go/gRPC Secure Service"]
  }
}

Group: Observability [color: "#7f8c8d"] {
  prometheus [icon: "database", label: "Prometheus", desc: "Metrics Collection"]
  grafana [icon: "database", label: "Grafana", desc: "Analytics Dashboards"]
}

# Mesh Connections
aws-waf > k8s-ing
k8s-ing > pod-web-1
k8s-ing > pod-web-2

pod-web-1 > pod-pay-1
pod-web-2 > pod-pay-1

k8s-master <> etcd
Worker Fleet > prometheus [dashed: true]
prometheus > grafana`
        }
      ]
    }
  },
  {
    name: "Serverless Event-Driven Grid",
    description: "Highly scalable AWS serverless architecture using EventBridge pipes, SQS/SNS fan-out, and global DynamoDB tables for real-time reactive processing.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-serverless",
          x: 0,
          y: 0,
          width: 1000,
          height: 700,
          figureNumber: 1,
          title: "System Design: Reactive Serverless Orchestration Lattice",
          code: `Group: API Gateway Tier [color: "#3498db"] {
  users [icon: "users", label: "Clients", desc: "Mobile/Web Endpoints"]
  aws-api [icon: "aws-api-gateway", label: "API Gateway", desc: "REST & WebSocket Endpoints"]
}

Group: Async Processing [color: "#f39c12"] {
  aws-lambda-ingest [icon: "aws-lambda", label: "Ingestion Lambda", desc: "Validation & Transformation"]
  aws-sqs [icon: "aws-sqs", label: "Main Queue", desc: "Buffer for Surge Traffic"]
  aws-lambda-worker [icon: "aws-lambda", label: "Worker Lambda", desc: "Core Business Logic Processor"]
}

Group: Data Persistence [color: "#27ae60"] {
  aws-ddb [icon: "aws-dynamodb", label: "DynamoDB Global Table", desc: "Low-latency NoSQL Storage"]
  aws-s3 [icon: "aws-s3", label: "Media Bucket", desc: "Static Asset Storage"]
}

# Event Flows
users > aws-api
aws-api > aws-lambda-ingest
aws-lambda-ingest > aws-sqs
aws-sqs > aws-lambda-worker
aws-lambda-worker > aws-ddb
aws-lambda-worker > aws-s3 [dashed: true]`
        }
      ]
    }
  },
  {
    name: "AI Production Feature Factory",
    description: "Advanced AI/ML model deployment architecture, featuring real-time feature engineering, SageMaker training, and low-latency model serving.",
    thumbnail: "BrainCircuit",
    shapes: {
      figures: [
        {
          id: "fig-ai-full",
          x: 0,
          y: 0,
          width: 1200,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Production AI/ML Feature Mesh & Inference",
          code: `Group: Data Ingestion [color: "#34495e"] {
  aws-msk [icon: "aws-msk", label: "Managed Kafka", desc: "Real-time Event Stream"]
  aws-s3-raw [icon: "aws-s3", label: "Raw Lake", desc: "Unstructured Data Landing"]
}

Group: Feature Engineering [color: "#2980b9"] {
  aws-emr [icon: "aws-emr", label: "EMR Cluster", desc: "Spark Feature Extraction"]
  aws-ddb-features [icon: "aws-dynamodb", label: "Feature Store", desc: "Online Inference Features"]
}

Group: Model Serving [color: "#27ae60"] {
  aws-sm-train [icon: "aws-sagemaker", label: "SageMaker Training", desc: "Model Development"]
  aws-sm-infer [icon: "aws-sagemaker", label: "Real-time Inference", desc: "Production Model Endpoint"]
}

Group: Observability [color: "#e67e22"] {
  aws-cw [icon: "aws-cloudwatch", label: "CloudWatch", desc: "Logs & Metrics Tracking"]
  aws-drift [icon: "azure-application-insights", label: "Drift Monitor", desc: "Model Drift Detection"]
}

# Machine Learning Lifecycle
aws-msk > aws-emr
aws-s3-raw > aws-emr
aws-emr > aws-ddb-features

aws-ddb-features > aws-sm-infer
aws-sm-train > aws-sm-infer

aws-sm-infer > aws-cw
aws-cw > aws-drift`
        }
      ]
    }
  },
  {
    name: "Serverless Media Transcoding",
    description: "Scalable video processing pipeline using AWS Elemental MediaConvert with automated Lambda-driven orchestration and event-based notifications.",
    thumbnail: "Video",
    shapes: {
      figures: [
        {
          id: "fig-media-pipe",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Automated Media Conversion & Delivery (VOD-101)",
          code: `Group: Ingestion & Trigger [color: "#34495e"] {
  s3-source [icon: "aws-s3", label: "S3 Source", desc: "Upload Video"]
  lambda-submit [icon: "aws-lambda", label: "Job Submitter", desc: "Metadata & Validation"]
}

Group: Core Engine [color: "#e67e22"] {
  aws-convert [icon: "aws-mediaconvert", label: "MediaConvert", desc: "Transcoding Pipeline"]
}

Group: Output & Storage [color: "#27ae60"] {
  s3-dest [icon: "aws-s3", label: "S3 Destination", desc: "Optimized Media"]
  aws-cf [icon: "aws-cloudfront", label: "CloudFront", desc: "Global Distribution"]
}

Group: Events & Notification [color: "#8e44ad"] {
  aws-cw [icon: "aws-cloudwatch", label: "CloudWatch", desc: "Monitoring"]
  aws-eb [icon: "aws-eventbridge", label: "EventBridge", desc: "State Change Bus"]
  lambda-complete [icon: "aws-lambda", label: "Job Finisher", desc: "Finalize & Update"]
  aws-sns [icon: "aws-sns", label: "Alerting (SNS)", desc: "SMS/Email Alerts"]
}

# Pipeline Flows
s3-source > lambda-submit
s3-source > aws-convert
lambda-submit > aws-convert

aws-convert > s3-dest
aws-convert > aws-cw
aws-convert > aws-eb

s3-dest > aws-cf
s3-dest > lambda-complete
aws-eb > lambda-complete

lambda-complete > aws-sns
s3-source > lambda-complete [dashed: true]`
        }
      ]
    }
  },
  {
    name: "High-Throughput Batch Processor",
    description: "Multi-tier AWS architecture for massive data ingestion, queued processing, and distributed worker fleets within a secure VPC perimeter.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-batch-process",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Scalable Cloud Event & Batch Processing",
          code: `aws-api [icon: "aws-api-gateway", label: "API gateway", desc: "Ingress Point"]
aws-lambda [icon: "aws-lambda", label: "Lambda", desc: "Pre-processing"]
aws-s3 [icon: "aws-s3", label: "S3", desc: "Raw Storage"]

Group: VPC SUBNET [color: "#f39c12"] {
  Group: MAIN SERVER [color: "#34495e"] {
    server [icon: "aws-asg", label: "Server", desc: "Job Scheduler"]
    data [icon: "aws-dynamodb", label: "Data", desc: "State Management"]
  }
  
  queue [icon: "aws-sqs", label: "Queue", desc: "Task Buffer"]
  
  Group: COMPUTE NODES [color: "#e74c3c"] {
    worker1 [icon: "aws-asg", label: "Worker 1", desc: "Batch Worker"]
    worker2 [icon: "aws-asg", label: "Worker 2", desc: "Batch Worker"]
    worker3 [icon: "aws-asg", label: "Worker 3", desc: "Batch Worker"]
  }
}

analytics [icon: "aws-rds", label: "Analytics", desc: "Global Insights"]

# Data & Event Flow
aws-api > aws-lambda
aws-lambda > server
server > data
server > queue [via: "550,450"]
aws-s3 > data [via: "200,600"]

queue > worker1
queue > worker2
queue > worker3

VPC SUBNET > analytics`
        }
      ]
    }
  },
  {
    name: "Open Source Triage Flow",
    description: "Visual roadmap for open-source project issue management, handling bug reports, feature requests, and spec validation logic.",
    thumbnail: "GitBranch",
    shapes: {
      figures: [
        {
          id: "fig-triage-flow",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Flowchart: Contributor Issue Lifecycle & Triage path",
          code: `start [icon: "file-text", label: "Issue type?"]

Group: BUGPATH [color: "#e74c3c"] {
  bug [icon: "zap", label: "Bug"]
  dup [icon: "copy", label: "Duplicate?"]
  mark-dup [icon: "copy", label: "Mark duplicate"]
  repro [icon: "help-circle", label: "Has repro?"]
  ask-repro [icon: "terminal", label: "Ask for repro"]
}

Group: FEATUREPATH [color: "#27ae60"] {
  feature [icon: "zap", label: "Feature"]
  pkg [icon: "layers", label: "Can be package?"]
  spec [icon: "check-square", label: "Well specced?"]
  def-pkg [icon: "layout", label: "Define as package"]
}

finish [icon: "zap", label: "Issue ready to claim"]

# Triage Decision Tree
start > bug
start > feature

bug > dup
dup > mark-dup
dup > repro
repro > ask-repro
repro > finish

feature > pkg
pkg > spec
pkg > def-pkg
spec > finish
def-pkg > finish`
        }
      ]
    }
  },
  {
    name: "Azure Cloud Service Mesh",
    description: "Standard Azure enterprise web application template with integrated App Service, SQL database, and a full monitoring suite via Azure Monitor and Log Analytics.",
    thumbnail: "Cloud",
    shapes: {
      figures: [
        {
          id: "fig-azure-mesh",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Azure Managed Service Environment",
          code: `users [icon: "users", label: "Users"]
request [icon: "globe", label: "Request (browser)"]

Group: AZURE [color: "#f39c12"] {
  app [icon: "azure-app", label: "App Service app"]
  insights [icon: "azure-application-insights", label: "Application Insights"]
  sql [icon: "azure-sql", label: "SQL"]
  monitor [icon: "azure-monitor", label: "Azure Monitor"]
  log [icon: "azure-log-analytics", label: "Log Analytics"]
  
  Group: INSIGHTS [color: "#34495e"] {
    diag [icon: "azure-diagnostics", label: "Diagnostics"]
    dash [icon: "dashboard", label: "Dashboard"]
    alerts [icon: "azure-alerts", label: "Alerts"]
  }
}

# Monitoring & Request Flow
users > request
request > insights
request > app
app > insights
app <> sql
insights > diag
insights > dash
sql > monitor
monitor > log
log > alerts`
        }
      ]
    }
  },
  {
    name: "GCP Real-time Task Pipeline",
    description: "Google Cloud Platform serverless pipeline using Cloud Run orchestration, Cloud Tasks for scheduling, and global storage delivery.",
    thumbnail: "Activity",
    shapes: {
      figures: [
        {
          id: "fig-gcp-pipeline",
          x: 0,
          y: 0,
          width: 1100,
          height: 750,
          figureNumber: 1,
          title: "Architecture: GCP Scalable Serverless Task Lattice",
          code: `sched [icon: "gcp-scheduler", label: "Scheduler"]
run1 [icon: "gcp-run", label: "Cloud Run"]
tasks1 [icon: "gcp-tasks", label: "Tasks"]
run2 [icon: "gcp-run", label: "Cloud Run"]
tasks2 [icon: "gcp-tasks", label: "Tasks"]
run3 [icon: "gcp-run", label: "Cloud Run"]
storage [icon: "gcp-storage", label: "Cloud Storage"]
cdn [icon: "gcp-cdn", label: "CDN"]
store [icon: "gcp-datastore", label: "Data Store"]
ext [icon: "file-text", label: "External data service"]

Group: CLIENT [color: "#f39c12"] {
  web [icon: "laptop", label: "Web"]
  mobile [icon: "mobile", label: "Mobile"]
  users [icon: "users", label: "Users"]
}

# Pipeline Execution
sched > run1
run1 > tasks1
tasks1 > run2
run2 > tasks2
tasks2 > run3
run3 > storage
storage > cdn
cdn > CLIENT

run2 > store
store > run3
run2 <> ext [dashed: true]`
        }
      ]
    }
  },
  {
    name: "Azure Operational Intelligence",
    description: "Deep observability architecture for Azure, focused on separating application metrics from global log analytics and diagnostic dashboards.",
    thumbnail: "BarChart",
    shapes: {
      figures: [
        {
          id: "fig-azure-op-intel",
          x: 0,
          y: 0,
          width: 1000,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Azure Operational Monitoring & Alerting",
          code: `users [icon: "users", label: "Users"]
request [icon: "globe", label: "Request (browser)"]

Group: AZURE [color: "#f39c12"] {
  app [icon: "azure-app", label: "App Service app"]
  sql [icon: "azure-sql", label: "SQL"]
  insights [icon: "azure-application-insights", label: "Application Insights"]
  monitor [icon: "azure-monitor", label: "Azure Monitor"]
  log [icon: "azure-log-analytics", label: "Log Analytics"]

  Group: INSIGHTS [color: "#8e44ad"] {
    dash [icon: "dashboard", label: "Dashboard"]
    diag [icon: "azure-diagnostics", label: "Diagnostics"]
    alerts [icon: "azure-alerts", label: "Alerts"]
  }
}

# Dependency & Alerting Flow
users > request
request > app
app > insights
app > sql
insights > dash
monitor > diag
log > alerts
request > app [via: "150,400"]`
        }
      ]
    }
  },
  {
    name: "AWS Global Transit Hub",
    description: "Enterprise connectivity pattern using Transit Gateway to bridge multiple regional VPCs, on-prem networks, and shared service environments.",
    thumbnail: "Network",
    shapes: {
      figures: [
        {
          id: "fig-tgw-hub",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: Multi-VPC Transit Hub with Direct Connect",
          code: `Group: On-Premises [color: "#34495e"] {
  dc [icon: "database", label: "Corporate DC", desc: "Local Server Farm"]
  dx [icon: "aws-iam", label: "Direct Connect", desc: "10Gbps Dedicated Link"]
}

tgw [icon: "aws-vpc", label: "Transit Gateway", desc: "Global Network Hub"]

Group: Regional Workloads [color: "#2980b9"] {
  Group: VPC Production [color: "#27ae60"] {
    app-prod [icon: "aws-asg", label: "Prod App", desc: "User-facing services"]
  }
  Group: VPC Shared Services [color: "#f39c12"] {
    ad-fs [icon: "aws-iam", label: "Directory", desc: "Central Identity Hub"]
  }
}

# Hub & Spoke Connectivity
dc > dx
dx > tgw
tgw > app-prod
tgw > ad-fs
app-prod <> ad-fs [dashed: true, via: "600,700"]`
        }
      ]
    }
  },
  {
    name: "AWS Serverless MLOps",
    description: "Automated machine learning lifecycle using SageMaker, Lambda, and Step Functions to orchestrate training, deployment, and monitoring.",
    thumbnail: "Brain",
    shapes: {
      figures: [
        {
          id: "fig-mlops",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Automated MLOps Pipeline (SageMaker)",
          code: `s3-raw [icon: "aws-s3", label: "Raw Lake", desc: "Ingested Training Data"]
step-fn [icon: "aws-lambda", label: "Step Functions", desc: "Workflow Orchestrator"]

Group: ML Tier [color: "#8e44ad"] {
  sm-train [icon: "aws-sagemaker", label: "SM Training", desc: "GPU Training Cluster"]
  sm-model [icon: "aws-sagemaker", label: "Model Registry", desc: "Versioned Artifacts"]
  sm-infer [icon: "aws-sagemaker", label: "Endpoint", desc: "Real-time Inference"]
}

cw-metrics [icon: "aws-cloudwatch", label: "Monitor", desc: "Drift & Performance"]

# MLOps Flow
s3-raw > step-fn
step-fn > sm-train
sm-train > sm-model
sm-model > sm-infer
sm-infer > cw-metrics
cw-metrics > step-fn [dashed: true, via: "200,700"]`
        }
      ]
    }
  },
  {
    name: "AWS Managed Kafka Real-time",
    description: "High-throughput streaming architecture using AWS MSK for ingestion and Flink for real-time analytics and persistence.",
    thumbnail: "Activity",
    shapes: {
      figures: [
        {
          id: "fig-msk-stream",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Real-time Event Streaming with MSK",
          code: `producers [icon: "users", label: "IoT Devices", desc: "Edge Telemetry"]

Group: Streaming Core [color: "#3498db"] {
  msk [icon: "aws-msk", label: "Managed Kafka", desc: "3-Node Cluster (m5.large)"]
  flink [icon: "aws-emr", label: "Kinesis Analytics", desc: "SQL/Flink Stream Processing"]
}

Group: Sink Tier [color: "#27ae60"] {
  ddb [icon: "aws-dynamodb", label: "Hot Store", desc: "Real-time Dashboards"]
  s3-lake [icon: "aws-s3", label: "Data Lake", desc: "Long-term Persistence archive"]
}

# Stream Pipeline
producers > msk
msk > flink
flink > ddb
flink > s3-lake [via: "550,650"]`
        }
      ]
    }
  },
  {
    name: "AWS Global Accelerator Web",
    description: "Highly available global web application using Global Accelerator to route traffic to the nearest regional endpoint with sub-second failover.",
    thumbnail: "Globe",
    shapes: {
      figures: [
        {
          id: "fig-global-accel",
          x: 0,
          y: 0,
          width: 1200,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Low-Latency Global Web Service",
          code: `users [icon: "users", label: "Global Users"]
ga [icon: "aws-route53", label: "Global Accelerator", desc: "Stateless Anycast IPs"]

Group: US-EAST-1 [color: "#2980b9"] {
  alb-1 [icon: "aws-alb", label: "ALB East", desc: "Primary Entrance"]
  asg-1 [icon: "aws-asg", label: "App Fleet 1", desc: "Compute Pool"]
}

Group: EU-WEST-1 [color: "#e67e22"] {
  alb-2 [icon: "aws-alb", label: "ALB West", desc: "Secondary Entrance"]
  asg-2 [icon: "aws-asg", label: "App Fleet 2", desc: "Compute Pool"]
}

# Routing Flow
users > ga
ga > alb-1 [color: "#27ae60"]
ga > alb-2 [color: "#f39c12", dashed: true]
alb-1 > asg-1
alb-2 > asg-2`
        }
      ]
    }
  },
  {
    name: "AWS WAF Perimeter Security",
    description: "Comprehensive security edge architecture combining WAF, CloudFront, and Shield Advanced to protect against L7 and L3/4 attacks.",
    thumbnail: "Shield",
    shapes: {
      figures: [
        {
          id: "fig-perimeter-sec",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Perimeter Defense & Edge Security",
          code: `internet [icon: "users", label: "Traffic Source"]

Group: Security Edge [color: "#c0392b"] {
  shield [icon: "aws-iam", label: "Shield Advanced", desc: "Dedicated DDoS Team Support"]
  waf [icon: "aws-waf", label: "AWS WAF", desc: "Managed Rule Sets (IP Reputation)"]
  cf [icon: "aws-cloudfront", label: "CloudFront", desc: "Edge Caching & SSL Offload"]
}

Group: Origin Tier [color: "#2980b9"] {
  alb [icon: "aws-alb", label: "Prod ALB", desc: "Internal Balancer"]
  s3-assets [icon: "aws-s3", label: "Public Assets", desc: "Static Media Store"]
}

# Edge Flow
internet > shield
shield > waf
waf > cf
cf > alb
cf > s3-assets [via: "450,600"]`
        }
      ]
    }
  },
  {
    name: "AWS Batch Image Processor",
    description: "Event-driven asynchronous image processing pipeline using AWS Batch and Fargate to handle large-scale transformation jobs.",
    thumbnail: "Image",
    shapes: {
      figures: [
        {
          id: "fig-batch-img",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Large-scale Asynchronous Media Factory",
          code: `s3-upload [icon: "aws-s3", label: "Input Bucket", desc: "Raw 4K Raw media"]
eb [icon: "aws-eventbridge", label: "EventBridge", desc: "Triggers on Object Created"]

Group: Batch Tier [color: "#f39c12"] {
  batch-job [icon: "aws-asg", label: "AWS Batch", desc: "Job Queue & Scheduling"]
  fargate [icon: "aws-asg", label: "Fargate worker", desc: "Serverless Container Scaling"]
}

s3-output [icon: "aws-s3", label: "Result Storage", desc: "Optimized Web versions"]

# Process Flow
s3-upload > eb
eb > batch-job
batch-job > fargate
fargate > s3-output`
        }
      ]
    }
  },
  {
    name: "AWS AppSync Real-time Hub",
    description: "Modern GraphQL-centered architecture using AWS AppSync to provide real-time data sync across multiple storage backends.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-appsync-hub",
          x: 0,
          y: 0,
          width: 1150,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Serverless GraphQL Data Mesh (AppSync)",
          code: `client [icon: "mobile", label: "Mobile App", desc: "Real-time subscriptions"]
appsync [icon: "aws-api-gateway", label: "AppSync", desc: "Unified GraphQL Endpoint"]

Group: Data Sources [color: "#27ae60"] {
  ddb [icon: "aws-dynamodb", label: "KV Store", desc: "Low-latency user data"]
  aurora [icon: "aws-rds", label: "Aurora PG", desc: "Relational complex querying"]
  lb-proxy [icon: "aws-lambda", label: "Lambda Resolver", desc: "External microservice proxy"]
}

# Resolver Flows
client <> appsync
appsync > ddb
appsync > aurora
appsync > lb-proxy [via: "600,650"]`
        }
      ]
    }
  },
  {
    name: "AWS Compliance Audit Store",
    description: "Automated security and compliance auditing architecture using CloudTrail, Config, and Security Hub to maintain an enterprise audit trail.",
    thumbnail: "Search",
    shapes: {
      figures: [
        {
          id: "fig-audit-store",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Continuous Compliance & Audit Logging",
          code: `Group: Telemetry Sources [color: "#34495e"] {
  ct [icon: "aws-iam", label: "CloudTrail", desc: "API Call Logging"]
  config [icon: "aws-iam", label: "AWS Config", desc: "Resource Change History"]
}

Group: Analysis Tier [color: "#c0392b"] {
  sec-hub [icon: "aws-iam", label: "Security Hub", desc: "Consolidated Security view"]
  guard-duty [icon: "aws-iam", label: "GuardDuty", desc: "Intelligent Threat Detection"]
}

s3-audit [icon: "aws-s3", label: "Audit S3 Bucket", desc: "WORM-protected Long-term Archive"]

# Audit Flow
ct > s3-audit
config > s3-audit
ct > sec-hub
config > sec-hub
sec-hub > guard-duty [dashed: true]
guard-duty > s3-audit [via: "550,650"]`
        }
      ]
    }
  },
  {
    name: "AWS Multi-tenant SaaS Bridge",
    description: "Architecture for a multi-tenant SaaS platform using a shared application tier with tenant-isolated database environments.",
    thumbnail: "Users",
    shapes: {
      figures: [
        {
          id: "fig-saas-bridge",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: Multi-tenant Isolation with Tenant Router",
          code: `users [icon: "users", label: "SaaS Clients"]
router [icon: "aws-lambda", label: "Tenant Router", desc: "JWT-based tenant selection"]

Group: App Pool [color: "#2980b9"] {
  workers [icon: "aws-asg", label: "Shared Fleet", desc: "Multi-tenant processing app"]
}

Group: Data Perimeters [color: "#2c3e50"] {
  Group: Tenant 1 [color: "#27ae60"] {
    db1 [icon: "aws-rds", label: "RDS Isolated", desc: "Encryption Key A"]
  }
  Group: Tenant 2 [color: "#f39c12"] {
    db2 [icon: "aws-rds", label: "RDS Isolated", desc: "Encryption Key B"]
  }
  Group: Shared [color: "#34495e"] {
    cache [icon: "aws-elasticache", label: "Global Cache", desc: "Cross-tenant metadata"]
  }
}

# Tenant Flow
users > router
router > workers
workers > db1
workers > db2
workers > cache [via: "600,750"]`
        }
      ]
    }
  },
  {
    name: "Azure Enterprise Hub-and-Spoke",
    description: "Centralized network management using a Hub VNet for security services and Spoke VNets for isolated application workloads.",
    thumbnail: "Network",
    shapes: {
      figures: [
        {
          id: "fig-azure-hub-spoke",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: Azure Secure Hub-and-Spoke Topology",
          code: `Group: On-Premise [color: "#34495e"] {
  branch [icon: "database", label: "Branch Office", desc: "Secure local subnet"]
  er [icon: "azure-app", label: "ExpressRoute", desc: "Private high-speed link"]
}

Group: Hub VNet [color: "#c0392b"] {
  fw [icon: "azure-app", label: "Azure Firewall", desc: "Central Egress Controller"]
  gateway [icon: "azure-app", label: "VPN Gateway", desc: "S2S Tunnel Terminator"]
}

Group: Workload Spokes [color: "#2980b9"] {
  Group: Web Spoke [color: "#27ae60"] {
    web-tier [icon: "azure-app", label: "App Service", desc: "User interface pool"]
  }
  Group: Data Spoke [color: "#f39c12"] {
    sql-tier [icon: "azure-sql", label: "SQL Managed Inst", desc: "Persistent Data Layer"]
  }
}

# Peering & Routing
branch > er
er > gateway
gateway > fw
fw > web-tier
fw > sql-tier
web-tier <> sql-tier [dashed: true, via: "600,700"]`
        }
      ]
    }
  },
  {
    name: "Azure AKS Enterprise Lattice",
    description: "Secure Kubernetes orchestration using Azure Kubernetes Service with managed identity, Key Vault integration, and Application Gateway WAF.",
    thumbnail: "Box",
    shapes: {
      figures: [
        {
          id: "fig-aks-lattice",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: AKS Production Mesh with WAF Protection",
          code: `users [icon: "users", label: "End-Users"]
appgw [icon: "azure-frontdoor", label: "App Gateway", desc: "WAF v2 + HTTPS Termination"]

Group: AKS Cluster [color: "#0078d4"] {
  Group: System Nodes [color: "#34495e"] {
    coredns [icon: "azure-app", label: "CoreDNS", desc: "Service discovery"]
  }
  Group: User Workloads [color: "#27ae60"] {
    web-pod [icon: "k8s-pod", label: "Web Deployment", desc: "Containerized frontend"]
    api-pod [icon: "k8s-pod", label: "Go API", desc: "Backend logic fleet"]
  }
}

Group: Managed Services [color: "#7f8c8d"] {
  kv [icon: "azure-app", label: "Key Vault", desc: "CSI Secret Driver"]
  cosmos [icon: "azure-cosmos-db", label: "Cosmos DB", desc: "Global Global Scale"]
}

# Cluster Traffic
users > appgw
appgw > web-pod
web-pod > api-pod
api-pod <> kv [dashed: true]
api-pod > cosmos
api-pod > coredns [via: "500,600"]`
        }
      ]
    }
  },
  {
    name: "Azure Data Factory ELT Lattice",
    description: "Modern data engineering pipeline using Azure Data Factory for orchestration, Data Lake for storage, and Synapse Analytics for warehousing.",
    thumbnail: "Activity",
    shapes: {
      figures: [
        {
          id: "fig-adf-elt",
          x: 0,
          y: 0,
          width: 1150,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Cloud-Native ELT Pipeline (Data Factory)",
          code: `sources [icon: "database", label: "External DBs", desc: "On-prem & Cloud SQL"]
adf [icon: "azure-app", label: "Data Factory", desc: "Pipeline Orchestrator"]

Group: Storage Tier [color: "#2980b9"] {
  adls [icon: "azure-storage", label: "Data Lake Gen2", desc: "Raw & Bronze zones"]
}

Group: Processing Tier [color: "#f39c12"] {
  bricks [icon: "azure-app", label: "Databricks", desc: "Spark-based Clean/Gold Transformation"]
  synapse [icon: "azure-sql", label: "Synapse Warehouse", desc: "Reporting & BI Layer"]
}

# Data Movement
sources > adf
adf > adls
adls > bricks
bricks > synapse
synapse > adf [dashed: true, via: "600,750"]`
        }
      ]
    }
  },
  {
    name: "Azure Entra Hybrid Identity",
    description: "Secure hybrid identity synchronization between on-premises Active Directory and Azure Active Directory (Microsoft Entra ID).",
    thumbnail: "Users",
    shapes: {
      figures: [
        {
          id: "fig-hybrid-id",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Hybrid Identity Sync (Entra ID)",
          code: `Group: Corporate Office [color: "#34495e"] {
  local-ad [icon: "database", label: "Local AD Cluster", desc: "Domain Controller Windows Server"]
  sync-server [icon: "azure-app", label: "Entra Connect", desc: "Identity Sync Agent"]
}

Group: Microsoft Cloud [color: "#0078d4"] {
  entra [icon: "azure-app", label: "Entra ID", desc: "Cloud Directory Services"]
  apps [icon: "azure-app", label: "O365 / SaaS", desc: "App Registration & SAML"]
}

# Identity Sync
local-ad > sync-server
sync-server > entra
entra > apps
apps <> local-ad [dashed: true, via: "450,650"]`
        }
      ]
    }
  },
  {
    name: "Azure IoT Central Mesh",
    description: "Large-scale IoT monitoring architecture using Azure IoT Hub for device management and Stream Analytics for real-time telemetry processing.",
    thumbnail: "Activity",
    shapes: {
      figures: [
        {
          id: "fig-iot-central",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Real-time IoT Telemetry Mesh",
          code: `devices [icon: "users", label: "Smart Sensors", desc: "MQTT/AMQP Telemetry Source"]

Group: Ingestion Hub [color: "#c0392b"] {
  iot-hub [icon: "azure-app", label: "IoT Hub", desc: "Bi-directional Communication"]
  dps [icon: "azure-app", label: "Device Prov Service", desc: "Zero-touch onboarding"]
}

Group: Insights Tier [color: "#2980b9"] {
  stream [icon: "azure-monitor", label: "Stream Analytics", desc: "Time-window processing"]
  cosmos [icon: "azure-cosmos-db", label: "Telemetry Store", desc: "Hot path storage"]
}

# Signal Flow
devices > dps
dps > iot-hub
iot-hub > stream
stream > cosmos
cosmos > iot-hub [dashed: true, via: "550,700"]`
        }
      ]
    }
  },
  {
    name: "Azure SQL Global Failover",
    description: "Highly resilient database architecture using Azure SQL Managed Instance with Auto-Failover redundancy across multiple Azure regions.",
    thumbnail: "Database",
    shapes: {
      figures: [
        {
          id: "fig-sql-failover",
          x: 0,
          y: 0,
          width: 1150,
          height: 800,
          figureNumber: 1,
          title: "Architecture: SQL Managed Instance Global Failover",
          code: `users [icon: "users", label: "Global LB Traffic"]
tm [icon: "azure-frontdoor", label: "Traffic Manager", desc: "DNS Failover"]

Group: Region A (Active) [color: "#27ae60"] {
  sql-primary [icon: "azure-sql", label: "SQL MI Primary", desc: "Write/Read Endpoint"]
}

Group: Region B (Passive) [color: "#e67e22"] {
  sql-secondary [icon: "azure-sql", label: "SQL MI Replica", desc: "Read-only Standby"]
}

# DB Replication
users > tm
tm > sql-primary
sql-primary <> sql-secondary [dashed: true, label: "Replication"]
tm > sql-secondary [color: "#c0392b", dashed: true]`
        }
      ]
    }
  },
  {
    name: "Azure Media Delivery Lattice",
    description: "End-to-end video streaming architecture using Azure Media Services for encoding and CDN for global low-latency content distribution.",
    thumbnail: "Video",
    shapes: {
      figures: [
        {
          id: "fig-azure-media",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Azure Media VOD & Live Delivery",
          code: `cam [icon: "users", label: "Live Source", desc: "RTMP ingest"]

Group: Media Processing [color: "#8e44ad"] {
  ams [icon: "azure-app", label: "Media Services", desc: "Dynamic Packaging & AES encryption"]
  storage [icon: "azure-storage", label: "Asset Storage", desc: "Encoded 4K Master"]
}

cdn [icon: "azure-frontdoor", label: "Azure CDN", desc: "Global Edge Origin"]
player [icon: "mobile", label: "End-User Player", desc: "DASH/HLS Client"]

# Media Pipeline
cam > ams
ams <> storage
ams > cdn
cdn > player`
        }
      ]
    }
  },
  {
    name: "Azure Governance Perimeter",
    description: "Enterprise governance architecture using Azure Policy, Blueprints, and Management Groups to enforce compliance across all subscriptions.",
    thumbnail: "Shield",
    shapes: {
      figures: [
        {
          id: "fig-azure-gov",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Azure Enterprise Governance Hub",
          code: `auth [icon: "users", label: "Governance Team"]

Group: Management Root [color: "#2c3e50"] {
  blueprint [icon: "azure-app", label: "Blueprints", desc: "Environment templates"]
  policy [icon: "azure-app", label: "Azure Policy", desc: "Compliance audit & remediation"]
}

Group: Subscription A [color: "#2980b9"] {
  rg1 [icon: "azure-app", label: "Resources", desc: "Locked-down RG"]
}

# Policy Enforcement
auth > blueprint
blueprint > policy
policy > Subscription A
Subscription A > rg1 [dashed: true]`
        }
      ]
    }
  },
  {
    name: "Azure Site Recovery (DR)",
    description: "Disaster recovery architecture using Azure Site Recovery to provide VM replication and automated orchestration between primary and secondary regions.",
    thumbnail: "RefreshCcw",
    shapes: {
      figures: [
        {
          id: "fig-azure-asr",
          x: 0,
          y: 0,
          width: 1150,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Azure Site Recovery (ASR) Orchestration",
          code: `asv [icon: "azure-app", label: "Recovery Vault", desc: "Replication Orchestrator"]

Group: Primary Region [color: "#27ae60"] {
  vm-prod [icon: "azure-app", label: "Prod VMs", desc: "LOB Applications"]
  disk-p [icon: "azure-storage", label: "Managed Disks", desc: "Storage Tiers"]
}

Group: Target Region [color: "#e67e22"] {
  vm-dr [icon: "azure-app", label: "DR VMs (Dormant)", desc: "Standby Capacity"]
  disk-t [icon: "azure-storage", label: "Recovery Storage", desc: "Syncing..."]
}

# Replication Flow
vm-prod > asv
asv > vm-dr
disk-p <> disk-t [dashed: true, via: "600,750"]`
        }
      ]
    }
  },
  {
    name: "Azure Virtual Desktop Hub",
    description: "Modern remote work architecture using Azure Virtual Desktop (AVD) with FSLogix profile storage for scalable, high-performance virtual workstation fleets.",
    thumbnail: "Monitor",
    shapes: {
      figures: [
        {
          id: "fig-azure-avd",
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          figureNumber: 1,
          title: "Architecture: AVD Multi-session Remote Hub",
          code: `client [icon: "laptop", label: "Remote Client", desc: "MSRDC / HTML5 Access"]

Group: AVD Infrastructure [color: "#0078d4"] {
  gateway [icon: "azure-frontdoor", label: "AVD Portal", desc: "Broker/Gateway service"]
  pool [icon: "azure-app", label: "Host Pool", desc: "Windows 11 Multi-session VMs"]
}

Group: Profile Layer [color: "#7f8c8d"] {
  fslogix [icon: "azure-storage", label: "Azure Files", desc: "FSLogix User Profiles"]
  netapp [icon: "azure-storage", label: "NetApp Files", desc: "High-perf VHD cache"]
}

# Access Flow
client > gateway
gateway > pool
pool > fslogix
pool > netapp [via: "700,650"]`
        }
      ]
    }
  },
  {
    name: "GCP GKE Autopilot Mesh",
    description: "Advanced Kubernetes orchestration on Google Cloud using GKE Autopilot with managed Istio service mesh, Cloud Armor, and Cloud SQL.",
    thumbnail: "Box",
    shapes: {
      figures: [
        {
          id: "fig-gke-autopilot",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: GKE Autopilot Production Cluster",
          code: `users [icon: "users", label: "Global Users"]

Group: External Security [color: "#c0392b"] {
  armor [icon: "gcp-sql", label: "Cloud Armor", desc: "WAF & DDoS Protection"]
  glb [icon: "azure-frontdoor", label: "Global LB", desc: "Multi-region HTTP(S) Balancing"]
}

Group: GKE Autopilot [color: "#4285f4"] {
  asm [icon: "k8s-pod", label: "Service Mesh", desc: "Managed Istio Control Plane"]
  Group: Namespace: Prod [color: "#27ae60"] {
    web-deploy [icon: "k8s-deploy", label: "Web Service", desc: "Autoscaled pods"]
    api-deploy [icon: "k8s-deploy", label: "Backend API", desc: "Autoscaled pods"]
  }
}

Group: Backend [color: "#34495e"] {
  sql [icon: "gcp-sql", label: "Cloud SQL", desc: "Highly Available PostgreSQL"]
  secrets [icon: "gcp-run", label: "Secret Manager", desc: "CSI-integrated keys"]
}

# Cluster Flows
users > armor
armor > glb
glb > web-deploy
web-deploy > api-deploy
api-deploy > sql
api-deploy <> secrets [dashed: true, via: "550,700"]`
        }
      ]
    }
  },
  {
    name: "GCP BigQuery Data Warehouse",
    description: "Enterprise-scale data warehousing architecture using Google BigQuery for analytics, Dataflow for ETL, and Pub/Sub for real-time ingestion.",
    thumbnail: "Database",
    shapes: {
      figures: [
        {
          id: "fig-gcp-bq",
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Modern Data Warehouse (BigQuery)",
          code: `Group: Ingestion [color: "#3498db"] {
  pubsub [icon: "gcp-pubsub", label: "Pub/Sub", desc: "Real-time Event Stream"]
  gcs-raw [icon: "gcp-storage", label: "GCS Raw", desc: "Batch land zone"]
}

Group: Processing [color: "#f39c12"] {
  dataflow [icon: "gcp-run", label: "Dataflow", desc: "Apache Beam ETL (Streaming/Batch)"]
}

Group: Storage & BI [color: "#27ae60"] {
  bq [icon: "gcp-gke", label: "BigQuery", desc: "Serverless Petabyte-scale DW"]
  looker [icon: "azure-app", label: "Looker", desc: "BI & Visualization Dashboards"]
}

# Data Pipeline
pubsub > dataflow
gcs-raw > dataflow
dataflow > bq
bq > looker
bq <> gcs-raw [dashed: true, via: "600,650"]`
        }
      ]
    }
  },
  {
    name: "GCP Cloud Run Event-Driven",
    description: "Serverless reactive architecture using Eventarc to trigger Cloud Run services in response to Google Cloud Storage events and Pub/Sub messages.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-gcp-event-run",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Reactive Serverless Grid (Eventarc)",
          code: `gcs-upload [icon: "gcp-storage", label: "Upload Bucket", desc: "User asset landing"]
arc [icon: "gcp-pubsub", label: "Eventarc", desc: "Intelligent Event Router"]

Group: Serverless Compute [color: "#4285f4"] {
  run-proc [icon: "gcp-run", label: "Processor Service", desc: "High-concurrency Cloud Run"]
}

Group: Persistence [color: "#34495e"] {
  firestore [icon: "gcp-sql", label: "Firestore NoSQL", desc: "Real-time state storage"]
  gcs-final [icon: "gcp-storage", label: "Output Bucket", desc: "Processed assets"]
}

# Reactive Flow
gcs-upload > arc
arc > run-proc
run-proc > firestore
run-proc > gcs-final
firestore <> gcs-upload [dashed: true, via: "550,650"]`
        }
      ]
    }
  },
  {
    name: "GCP Anthos Hybrid Mesh",
    description: "Multicloud and hybrid cloud architecture using Anthos to manage Kubernetes clusters across on-premises and Google Cloud environments.",
    thumbnail: "Network",
    shapes: {
      figures: [
        {
          id: "fig-anthos-hybrid",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: Anthos Hybrid Cloud Service Mesh",
          code: `Group: Data Center [color: "#34495e"] {
  on-prem-gke [icon: "k8s-node", label: "On-Prem GKE", desc: "VMware-based K8s"]
}

interconnect [icon: "azure-app", label: "Interconnect", desc: "Dedicated 10Gbps Tunnel"]

Group: Google Cloud [color: "#4285f4"] {
  cloud-gke [icon: "gcp-gke", label: "Cloud GKE", desc: "Native managed K8s"]
  asm [icon: "k8s-pod", label: "Anthos Mesh", desc: "Cross-cluster Istio Control Plane"]
}

# Hybrid Connectivity
on-prem-gke > interconnect
interconnect > cloud-gke
asm > on-prem-gke [dashed: true]
asm > cloud-gke [dashed: true]
cloud-gke <> on-prem-gke [via: "600,750"]`
        }
      ]
    }
  },
  {
    name: "GCP Vertex AI Pipeline",
    description: "Full-lifecycle ML architecture on Google Cloud using Vertex AI for model training, metadata tracking, and real-time inference.",
    thumbnail: "Brain",
    shapes: {
      figures: [
        {
          id: "fig-vertex-ai",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Production AI/ML with Vertex AI",
          code: `notebooks [icon: "laptop", label: "Managed Notebooks", desc: "Data scientist IDE"]

Group: Vertex AI Platform [color: "#3498db"] {
  train [icon: "gcp-run", label: "Training Job", desc: "GPU-accelerated training"]
  registry [icon: "gcp-run", label: "Model Registry", desc: "Versioned ML Models"]
  infer [icon: "gcp-run", label: "Prediction Endpt", desc: "Auto-scaling HTTP Inference"]
}

gcs-data [icon: "gcp-storage", label: "Feature Store", desc: "Processed training data"]

# AI Lifecycle
notebooks > train
train > registry
registry > infer
infer <> gcs-data [dashed: true]
train <> gcs-data [via: "550,650"]`
        }
      ]
    }
  },
  {
    name: "GCP Apigee API Gateway",
    description: "Enterprise API management architecture using Apigee to provide security, traffic control, and analytics for backend microservices.",
    thumbnail: "Link",
    shapes: {
      figures: [
        {
          id: "fig-gcp-apigee",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Apigee Enterprise API Mesh",
          code: `client [icon: "users", label: "External Clients", desc: "API Consumers"]

Group: Apigee Platform [color: "#c0392b"] {
  proxy [icon: "gcp-pubsub", label: "Apigee Proxy", desc: "Throttling & OIDC Auth"]
  analytics [icon: "gcp-run", label: "API Analytics", desc: "Usage & Latency Tracking"]
}

Group: Backend [color: "#27ae60"] {
  run1 [icon: "gcp-run", label: "Cloud Run API", desc: "Internal logic A"]
  run2 [icon: "gcp-run", label: "Cloud Run API", desc: "Internal logic B"]
}

# API Traffic
client > proxy
proxy > run1
proxy > run2
proxy > analytics [dashed: true, via: "500,600"]`
        }
      ]
    }
  },
  {
    name: "GCP Cloud Spanner Global",
    description: "Massively scalable, globally distributed relational database architecture using Cloud Spanner for active-active multi-region replication.",
    thumbnail: "Database",
    shapes: {
      figures: [
        {
          id: "fig-gcp-spanner",
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Multi-regional Cloud Spanner Mesh",
          code: `users [icon: "users", label: "Global Traffic"]
lb [icon: "azure-frontdoor", label: "Global LB", desc: "Multi-region redirection"]

Group: Global DB Tier [color: "#4285f4"] {
  span-na [icon: "gcp-sql", label: "Spanner (US)", desc: "Primary Read/Write"]
  span-eu [icon: "gcp-sql", label: "Spanner (EU)", desc: "Synchronous Read/Write"]
  span-as [icon: "gcp-sql", label: "Spanner (AS)", desc: "Witness/Standby"]
}

# Synchronous Sync
users > lb
lb > span-na
lb > span-eu
lb > span-as
span-na <> span-eu [dashed: true]
span-eu <> span-as [dashed: true]`
        }
      ]
    }
  },
  {
    name: "GCP Cloud Functions OCR",
    description: "Asynchronous image processing pipeline using Cloud Functions and the Cloud Vision API for automated text extraction and indexing.",
    thumbnail: "Search",
    shapes: {
      figures: [
        {
          id: "fig-gcp-ocr",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Serverless OCR Pipeline (Vision API)",
          code: `img-s3 [icon: "gcp-storage", label: "Image Source", desc: "Uploaded scans"]

Group: OCR Processor [color: "#f39c12"] {
  cf-trigger [icon: "gcp-run", label: "Trigger Function", desc: "GCS event handler"]
  vision-api [icon: "gcp-run", label: "Vision API", desc: "Pre-trained ML extraction"]
}

Group: Final [color: "#27ae60"] {
  firestore [icon: "gcp-sql", label: "Text Index", desc: "Searchable Doc metadata"]
  pubsub [icon: "gcp-pubsub", label: "Notification", desc: "Success/Failure hook"]
}

# Processing Flow
img-s3 > cf-trigger
cf-trigger > vision-api
vision-api > firestore
vision-api > pubsub [via: "500,600"]`
        }
      ]
    }
  },
  {
    name: "GCP VPC Service Perimeter",
    description: "Zero Trust security architecture using VPC Service Controls to prevent data exfiltration from Google Cloud storage and analytics services.",
    thumbnail: "Shield",
    shapes: {
      figures: [
        {
          id: "fig-gcp-perimeter",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Secure VPC Service Perimeter",
          code: `Group: Trusted Zone [color: "#27ae60"] {
  vpc-net [icon: "gcp-sql", label: "VPC Network", desc: "Internal VM/Compute pool"]
  users [icon: "users", label: "Admin Access", desc: "IAM Authorized users"]
}

Group: Restricted Perimeter [color: "#c0392b"] {
  gcs [icon: "gcp-storage", label: "Managed GCS", desc: "Sensitive Data bucket"]
  bq [icon: "gcp-gke", label: "Managed BQ", desc: "Regulated Dataset analytics"]
}

# Perimeter Enforcement
vpc-net > gcs
users > bq
gcs <> bq [dashed: true]
# block
Internet > Restricted Perimeter [dashed: true, color: "#e74c3c"]`
        }
      ]
    }
  },
  {
    name: "GCP Firebase Live Lattice",
    description: "Modern real-time mobile backend architecture using Firebase Authentication, Firestore, and Cloud Functions to power live-syncing applications.",
    thumbnail: "Smartphone",
    shapes: {
      figures: [
        {
          id: "fig-firebase-live",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Real-time Backend-as-a-Service (Firebase)",
          code: `app [icon: "mobile", label: "iOS/Android App", desc: "Live Firestore listener"]

Group: Firebase Core [color: "#f39c12"] {
  auth [icon: "users", label: "Firebase Auth", desc: "OAuth & Phone sign-in"]
  firestore [icon: "gcp-sql", label: "Firestore DB", desc: "Live document sync mesh"]
  functions [icon: "gcp-run", label: "Cloud Functions", desc: "Background Logic"]
}

Group: Engagement [color: "#3498db"] {
  fcm [icon: "gcp-pubsub", label: "Push Notify", desc: "Cloud Messaging Hub"]
  analytics [icon: "gcp-run", label: "GA for Firebase", desc: "User behavior tracking"]
}

# Sync flows
app <> firestore
app > auth
firestore > functions
functions > fcm
fcm > app
app > analytics [via: "550,750"]`
        }
      ]
    }
  },
  {
    name: "Stripe E-commerce Pipeline",
    description: "Standard secure payment integration architecture using Stripe Checkout, Webhooks, and asynchronous order fulfillment services.",
    thumbnail: "CreditCard",
    shapes: {
      figures: [
        {
          id: "fig-stripe-pipe",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Secure Stripe Payment & Fulfillment",
          code: `users [icon: "users", label: "Shopper"]
checkout [icon: "stripe", label: "Stripe Checkout", desc: "Hosted PCI-compliant UI"]

Group: Merchant Backend [color: "#6772e5"] {
  api [icon: "react", label: "Order API", desc: "Next.js API Handler"]
  webhook [icon: "react", label: "Webhook Listener", desc: "Signature validation service"]
}

Group: Storage [color: "#34495e"] {
  db [icon: "database", label: "Postgres", desc: "Order & Inventory tables"]
}

# Transaction Flow
users > checkout
checkout > webhook
webhook > db
api > checkout
db <> api [dashed: true, via: "500,600"]`
        }
      ]
    }
  },
  {
    name: "Auth0 Modern Auth Grid",
    description: "Enterprise-grade authentication architecture using Auth0 to manage identity, MFA, and SSO across single-page applications and secure APIs.",
    thumbnail: "Lock",
    shapes: {
      figures: [
        {
          id: "fig-auth0-grid",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Modern Identity Mesh (Auth0)",
          code: `client [icon: "laptop", label: "React SPA", desc: "OIDC Client"]
auth0 [icon: "users", label: "Auth0 Platform", desc: "Universal Login + MFA"]

Group: Resource Servers [color: "#eb5424"] {
  api-gateway [icon: "aws-api-gateway", label: "Kong/Kong", desc: "JWT Verification Layer"]
  private-api [icon: "docker", label: "Service API", desc: "Protected data endpoints"]
}

db [icon: "database", label: "User Store", desc: "Tenant-specific profiles"]

# Authentication Flow
client <> auth0
client > api-gateway
api-gateway > private-api
private-api <> db
auth0 <> db [dashed: true, via: "550,700"]`
        }
      ]
    }
  },
  {
    name: "Pusher Real-time Chat Mesh",
    description: "Real-time communication architecture using Pusher Channels for WebSocket-based broadcasting and a reactive message queue for persistence.",
    thumbnail: "MessageSquare",
    shapes: {
      figures: [
        {
          id: "fig-pusher-chat",
          x: 0,
          y: 0,
          width: 1050,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Real-time WebSocket Messaging Hub",
          code: `users [icon: "users", label: "Chat Client", desc: "WebSocket Listener"]
pusher [icon: "zap", label: "Pusher Gateway", desc: "Global Pub/Sub Mesh"]

Group: Message Core [color: "#30b392"] {
  chat-api [icon: "react", label: "Chat API", desc: "Message validation"]
  mq [icon: "aws-sqs", label: "Message Queue", desc: "Asynchronous processing"]
}

db [icon: "database", label: "Message DB", desc: "History & Thread storage"]

# Messaging Pipeline
users <> pusher
users > chat-api
chat-api > mq
mq > pusher
mq > db
db <> chat-api [dashed: true, via: "525,650"]`
        }
      ]
    }
  },
  {
    name: "OpenSearch Log Analytics",
    description: "Scalable log analysis architecture using Fluent Bit for collection, Kinesis for buffering, and OpenSearch (Elasticsearch) for searching and visualization.",
    thumbnail: "Terminal",
    shapes: {
      figures: [
        {
          id: "fig-logs-analytics",
          x: 0,
          y: 0,
          width: 1150,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Enterprise Log Aggregation & Analysis",
          code: `fleet [icon: "docker", label: "App Fleet", desc: "EC2/EKS Nodes"]
fluent [icon: "github", label: "Fluent Bit", desc: "Log Shipping Agent"]

Group: Ingestion Tier [color: "#ff9900"] {
  kinesis [icon: "aws-sqs", label: "Kinesis Firehose", desc: "Near real-time buffering"]
}

Group: Analysis Tier [color: "#005a9e"] {
  opensearch [icon: "database", label: "OpenSearch", desc: "Elasticsearch Index Service"]
  dashboards [icon: "dashboard", label: "Dashboards", desc: "Visual analytics UI"]
}

# Log Pipeline
fleet > fluent
fluent > kinesis
kinesis > opensearch
opensearch > dashboards
dashboards <> fleet [dashed: true, via: "575,700"]`
        }
      ]
    }
  },
  {
    name: "Headless CMS Content Lattice",
    description: "Modern web content architecture using a headless CMS for content management and an automated build pipeline for static site generation.",
    thumbnail: "Layout",
    shapes: {
      figures: [
        {
          id: "fig-cms-lattice",
          x: 0,
          y: 0,
          width: 1100,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Headless CMS & Static Delivery",
          code: `editor [icon: "users", label: "Content Editor", desc: "Managing blog/media"]
cms [icon: "layout", label: "Strapi / Contentful", desc: "API-driven Content Engine"]

Group: Build & Deploy [color: "#000000"] {
  github [icon: "github", label: "GitHub Repo", desc: "Source code & Trigger"]
  vercel [icon: "react", label: "Vercel / Next.js", desc: "ISR / Static Generation"]
}

cdn [icon: "aws-cloudfront", label: "Global Edge", desc: "High-speed caching"]

# Content Flow
editor > cms
cms > vercel
github > vercel
vercel > cdn
cdn > editor [dashed: true]`
        }
      ]
    }
  },
  {
    name: "Real-time Gaming Mesh",
    description: "Highly optimized low-latency architecture for online gaming, featuring matchmaking, dedicated game instances, and sub-second state sync.",
    thumbnail: "Gamepad",
    shapes: {
      figures: [
        {
          id: "fig-gaming-mesh",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: Low-Latency Online Gaming Hub",
          code: `player [icon: "users", label: "Game Client", desc: "UDP/TCP Game Traffic"]

Group: Session Management [color: "#e74c3c"] {
  match [icon: "aws-lambda", label: "Matchmaker", desc: "Skill-based pairing"]
  lobby [icon: "react", label: "Lobby Service", desc: "Social & Team sync"]
}

Group: Game World [color: "#2980b9"] {
  fleet [icon: "aws-asg", label: "DGS Fleet", desc: "Dedicated Game Servers"]
  redis [icon: "database", label: "Redis State", desc: "In-memory world snapshot"]
}

stats [icon: "aws-rds", label: "Leaderboard", desc: "Persistent player metrics"]

# Game Flow
player > match
match > fleet
player <> fleet
fleet <> redis
fleet > stats
stats <> lobby [dashed: true, via: "600,750"]`
        }
      ]
    }
  },
  {
    name: "AdTech Real-time Bidder",
    description: "Massively scalable AdTech architecture capable of processing millions of bids per second with ultra-low latency profile lookups.",
    thumbnail: "Activity",
    shapes: {
      figures: [
        {
          id: "fig-adtech-bidder",
          x: 0,
          y: 0,
          width: 1200,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Real-time Bidding (RTB) Engine",
          code: `exchange [icon: "globe", label: "Ad Exchange", desc: "Bid requests (10ms limit)"]

Group: Bidding Engine [color: "#c0392b"] {
  bidder-fleet [icon: "aws-asg", label: "Bidders", desc: "Go/Rust high-perf fleet"]
  profiles [icon: "database", label: "Aerospike / Redis", desc: "100TB User Profile cache"]
}

Group: Analytics Sink [color: "#34495e"] {
  kafka [icon: "aws-msk", label: "Click Stream", desc: "High-throughput ingestion"]
  lake [icon: "aws-s3", label: "Data Lake", desc: "Long-term model training"]
}

# RTB Flow
exchange <> bidder-fleet
bidder-fleet <> profiles
bidder-fleet > kafka
kafka > lake
lake <> profiles [dashed: true, via: "600,650"]`
        }
      ]
    }
  },
  {
    name: "Healthcare Patient Portal",
    description: "HIPAA-compliant healthcare architecture using FHIR APIs, encrypted storage, and robust auditing for sensitive patient records.",
    thumbnail: "Stethoscope",
    shapes: {
      figures: [
        {
          id: "fig-health-portal",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "Architecture: HIPAA Secure Patient Data Mesh",
          code: `patient [icon: "users", label: "Patient App", desc: "End-to-end encrypted portal"]

Group: Secure Gateway [color: "#27ae60"] {
  fhir-api [icon: "azure-app", label: "FHIR Gateway", desc: "HL7/FHIR standardization layer"]
  kms [icon: "azure-app", label: "KMS Vault", desc: "BYOK Encryption management"]
}

Group: Vault Tier [color: "#34495e"] {
  phi-db [icon: "azure-sql", label: "Encrypted RDS", desc: "PHI Persistent Storage"]
  audit-s3 [icon: "azure-storage", label: "Audit Vault", desc: "WORM-locked access logs"]
}

# Health Data Flow
patient <> fhir-api
fhir-api <> kms
fhir-api > phi-db
phi-db > audit-s3
patient > audit-s3 [dashed: true, via: "550,700"]`
        }
      ]
    }
  },
  {
    name: "Vehicle Telematics Hub",
    description: "IoT architecture for real-time vehicle telematics, processing GPS coordinates, engine health, and driver behavior at scale.",
    thumbnail: "Car",
    shapes: {
      figures: [
        {
          id: "fig-telematics-hub",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: IoT Connected Vehicle Telemetry",
          code: `car [icon: "mobile", label: "OBD-II Device", desc: "CELLULAR MQTT stream"]

Group: Telemetry Ingest [color: "#3498db"] {
  iot-core [icon: "aws-api-gateway", label: "IoT Hub", desc: "Message Broker"]
  stream [icon: "aws-sqs", label: "Stream Processor", desc: "Logic & Alerting"]
}

Group: Geospatial Data [color: "#f39c12"] {
  geo-db [icon: "database", label: "TimescaleDB", desc: "Optimized trajectory storage"]
  map-api [icon: "mapbox", label: "Mapbox", desc: "Geofencing & Routing API"]
}

# Signal Flow
car > iot-core
iot-core > stream
stream > geo-db
stream > map-api
geo-db <> car [dashed: true]`
        }
      ]
    }
  },
  {
    name: "Supply Chain Blockchain",
    description: "Transparency-focused architecture for supply chain tracking, using a private blockchain to record immutable provenance and custody events.",
    thumbnail: "Package",
    shapes: {
      figures: [
        {
          id: "fig-supply-blockchain",
          x: 0,
          y: 0,
          width: 1150,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Immutable Provenance Tracking Ledger",
          code: `sensor [icon: "users", label: "RFID tag", desc: "Pallet-level tracking"]

Group: Ledger Network [color: "#2c3e50"] {
  node-peer [icon: "docker", label: "Fabric Peer", desc: "Consensus & Validation"]
  chaincode [icon: "react", label: "Smart Contract", desc: "Business logic of custody"]
}

Group: Portal [color: "#2980b9"] {
  api [icon: "react", label: "Tracking API", desc: "Partner dashboard gateway"]
  ui [icon: "users", label: "Partner UI", desc: "Public transparency view"]
}

# Provenance Flow
sensor > node-peer
node-peer > chaincode
chaincode > node-peer [dashed: true]
node-peer > api
api > ui
ui <> sensor [dashed: true, via: "575,700"]`
        }
      ]
    }
  },
  {
    name: "Modern E-Commerce Flow",
    description:
      "A hybrid architecture showcasing straight routing for core API flows and orthogonal rails for background event processing.",
    thumbnail: "ShoppingCart",
    shapes: {
      figures: [
        {
          id: "fig-ecommerce",
          x: 0,
          y: 0,
          width: 1000,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Hybrid Microservices & Event Grid",
          code: `Group: Client Layer [color: "#3498db"] {
  web [icon: "laptop", label: "Storefront", desc: "Next.js Web App"]
  mobile [icon: "mobile", label: "Mobile App", desc: "iOS/Android Client"]
}

Group: API Gateway [color: "#2c3e50"] {
  gw [icon: "aws-api-gateway", label: "Kong/APIGW", desc: "Entry Point & Auth"]
}

Group: Core Services [color: "#27ae60"] {
  cart [icon: "aws-asg", label: "Cart Service", desc: "Redis-backed Session"]
  order [icon: "aws-asg", label: "Order API", desc: "PostgreSQL Logic"]
}

Group: Event Bus [color: "#f39c12"] {
  bus [icon: "aws-msk", label: "Kafka Bus", desc: "Asynchronous Message Hub"]
}

Group: Background [color: "#8e44ad"] {
  ship [icon: "aws-lambda", label: "Shipping", desc: "Logistics Orchestration"]
  notify [icon: "aws-sns", label: "Notify", desc: "Customer Alerts"]
}

# Fast API Path (Straight)
web > gw [routing: "straight", color: "#3498db"]
mobile > gw [routing: "straight", color: "#3498db"]

gw > cart [routing: "straight", width: 3]
gw > order [routing: "straight", width: 3]

# Bidirectional Sync
cart <> order [dashed: true]

# Background Async (Orthogonal)
order > bus [label: "Order Created"]
bus > ship [routing: "elbow"]
bus > notify [routing: "elbow"]

# Notification feedback
notify > web [dashed: true, startArrow: true, endArrow: false]`
        }
      ]
    }
  }
];
