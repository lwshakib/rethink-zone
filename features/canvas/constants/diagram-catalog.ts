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
users > aws-route53 [label: "DNS Query"]
aws-route53 > aws-cloudfront [label: "Request Traffic"]
aws-cloudfront > aws-waf [label: "Traffic Inspection"]

aws-waf > aws-alb-primary [label: "Healthy Path", color: "#27ae60"]
aws-waf > aws-alb-failover [label: "Failover Path", color: "#e74c3c", dashed: true]

aws-alb-primary > aws-asg-primary [label: "Load Balancing"]
aws-asg-primary > aws-rds-primary [label: "SQL Persistence"]

aws-rds-primary <> aws-rds-replica [label: "Cross-Region Replication", dashed: true]`
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
aws-waf > k8s-ing [label: "Filtered Traffic"]
k8s-ing > pod-web-1 [label: "HTTP Routing"]
k8s-ing > pod-web-2 [label: "HTTP Routing"]

pod-web-1 > pod-pay-1 [label: "mTLS Call"]
pod-web-2 > pod-pay-1 [label: "mTLS Call"]

k8s-master <> etcd [label: "State Management"]
Worker Fleet > prometheus [label: "Metrics Scrape", dashed: true]
prometheus > grafana [label: "Data Source"]`
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
users > aws-api [label: "Request"]
aws-api > aws-lambda-ingest [label: "Trigger"]
aws-lambda-ingest > aws-sqs [label: "Enqueue Msg"]
aws-sqs > aws-lambda-worker [label: "Poll & Process"]
aws-lambda-worker > aws-ddb [label: "Write DB"]
aws-lambda-worker > aws-s3 [label: "Upload Asset", dashed: true]`
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
aws-msk > aws-emr [label: "Stream Data"]
aws-s3-raw > aws-emr [label: "Batch Data"]
aws-emr > aws-ddb-features [label: "Write Features"]

aws-ddb-features > aws-sm-infer [label: "Feature Lookup"]
aws-sm-train > aws-sm-infer [label: "Deploy Model"]

aws-sm-infer > aws-cw [label: "Log Performance"]
aws-cw > aws-drift [label: "Alerting"]`
        }
      ]
    }
  }
];
