import { DiagramTemplate } from "../types";

// Design Tokens for diagrams that look good in both light and dark modes
const LOGO_BOX_FILL = "rgba(150, 150, 150, 0.07)";
const LOGO_BOX_STROKE = "rgba(150, 150, 150, 0.3)";
const TEXT_MUTED = "rgba(128, 128, 128, 0.8)";
const ARROW_COLOR = "rgba(100, 100, 100, 0.6)";

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
  }
];
