import { DiagramTemplate } from "../types";

// Design Tokens for diagrams that look good in both light and dark modes
const LOGO_BOX_FILL = "rgba(150, 150, 150, 0.07)";
const LOGO_BOX_STROKE = "rgba(150, 150, 150, 0.3)";
const TEXT_MUTED = "rgba(128, 128, 128, 0.8)";
const ARROW_COLOR = "rgba(100, 100, 100, 0.6)";

export const DIAGRAM_CATALOG: DiagramTemplate[] = [
  {
    name: "Enterprise Multi-Region Cloud Factory",
    description:
      "A massive, production-grade global architecture spanning two AWS regions with Route 53 failover, cross-region replication, and multi-tier security.",
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
          code: `Global Edge {
  Amazon Route 53 [icon: aws-route-53]
  Amazon CloudFront [icon: aws-cloudfront]
  AWS WAF [icon: aws-waf]
  Amazon S3 (Global) [icon: aws-s3]
}

Region: US-EAST-1 (Primary) {
  Public Subnet {
    ALB Primary [icon: aws-alb]
  }
  Private Subnet {
    App Cluster {
      EC2 Node A [icon: aws-ec2]
      EC2 Node B [icon: aws-ec2]
    }
    Aurora Master [icon: aws-rds]
  }
}

Region: US-WEST-2 (Failover) {
  Public Subnet {
    ALB Failover [icon: aws-alb]
  }
  Private Subnet {
    Aurora Replica [icon: aws-rds]
  }
}

Global Edge > Region: US-EAST-1 (Primary)
Global Edge > Region: US-WEST-2 (Failover)
ALB Primary > App Cluster
App Cluster > Aurora Master
Aurora Master <> Aurora Replica`
        }
      ]
    }
  },
  {
    name: "Enterprise Microservices Service Mesh",
    description:
      "Advanced polyglot microservices architecture with Istio mesh, Sidecars, Event Sourcing, and Distributed Tracing.",
    thumbnail: "LayoutGrid",
    shapes: {
      figures: [
        {
          id: "fig-mesh-ext",
          x: 0,
          y: 0,
          width: 1100,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Polyglot Service Mesh & Event-Driven Core",
          code: `Edge Gateway [icon: aws-api-gateway]

Services {
  Payment Service (Go) [icon: aws-lambda]
  Order Service (Rust) [icon: aws-lambda]
  Inventory Service (Py) [icon: seti-python]
}

Event Fabric {
  Amazon MSK [icon: aws-msk]
  Event Schema Registry [icon: database]
}

Observability {
  Prometheus [icon: database]
  Grafana [icon: database]
  Jaeger [icon: database]
}

Edge Gateway > Services
Services <> Event Fabric
Services > Observability`
        }
      ]
    }
  },
  {
    name: "Global Edge Wasm Runtime",
    description: "Highly distributed edge network using WebAssembly (Wasm) workers and globally replicated KV stores.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-edge-main",
          x: 0,
          y: 0,
          width: 950,
          height: 600,
          figureNumber: 1,
          title: "System Design: V8/Wasm Edge Computing Lattice",
          code: `Edge Lattice {
  Wasm Worker 1 [icon: globe]
  Wasm Worker 2 [icon: globe]
  KV Cache [icon: database]
}

Global Storage {
  TiDB Cluster [icon: database]
  Analytics [icon: aws-cloudwatch]
}

Edge Lattice > Global Storage
Global Storage > Analytics`
        }
      ]
    }
  },
  {
    name: "Masterclass: Multi-Cloud Data Mesh",
    description: "Highly complex data mesh architecture spanning AWS and GCP, using Snowflake, BigQuery, and cross-cloud event bridges.",
    thumbnail: "Database",
    shapes: {
      figures: [
        {
          id: "fig-dm-main",
          x: 0,
          y: 0,
          width: 1200,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Enterprise Multi-Cloud Data Mesh & Governance",
          code: `Bridge {
  Global Event Bus [icon: aws-eventbridge]
}

AWS Domain {
  S3 Data Lake [icon: aws-s3]
  Snowflake [icon: database]
}

GCP Domain {
  BigQuery Sink [icon: gcp-bigquery]
  Cloud Storage [icon: gcp-cloud-storage]
}

AWS Domain > Bridge
Bridge > GCP Domain`
        }
      ]
    }
  },




  {
    name: "Masterclass: Reactive Serverless Grid",
    description: "Highly complex serverless architecture with EventBridge pipes, SQS/SNS fan-out, and multi-region DynamoDB replication.",
    thumbnail: "Cpu",
    shapes: {
      figures: [
        {
          id: "fig-sv-main",
          x: 0,
          y: 0,
          width: 1200,
          height: 850,
          figureNumber: 1,
          title: "Architecture: Reactive Serverless Grid with Async Orchestration",
          code: `Entry {
  API Gateway [icon: aws-api-gateway]
  Cognito [icon: aws-cognito]
}

Processing {
  Lambda Worker [icon: aws-lambda]
  SQS Queue [icon: aws-sqs]
}

Data {
  DynamoDB [icon: aws-dynamodb]
  S3 Archive [icon: aws-s3]
}

Entry > Processing
Processing > Data`
        }
      ]
    }
  },
  {
    name: "Masterclass: AI/ML Observability & Feature Store",
    description: "Advanced model monitoring and feature management architecture, featuring real-time drift detection and automated feature engineering pipelines.",
    thumbnail: "BrainCircuit",
    shapes: {
      figures: [
        {
          id: "fig-ai-obs",
          x: 0,
          y: 0,
          width: 1000,
          height: 750,
          figureNumber: 1,
          title: "Architecture: Enterprise AI Observability & Feature Mesh",
          code: `Data Sources {
  Kafka Stream [icon: aws-msk]
  Database [icon: database]
}

Feature Engine {
  Spark Processor [icon: aws-emr]
  Drift Detector [icon: cloud-alert]
}

Storage {
  Feature Store [icon: aws-dynamodb]
  S3 Lake [icon: aws-s3]
}

Data Sources > Feature Engine
Feature Engine > Storage`
        }
      ]
    }
  },

  {
    name: "Masterclass: Distributed Load Testing (AWS)",
    description: "A comprehensive serverless architecture for global load testing, using AWS API Gateway, Lambda, Fargate, and IoT Core for real-time reporting.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-loadtest",
          x: 0,
          y: 0,
          width: 800,
          height: 600,
          figureNumber: 1,
          title: "Architecture: Distributed Load Testing Engine",
          code: `// Define groups and nodes
front end {
    web console {
    Amazon S3 WC [icon: aws-s3, label: "Amazon S3"]
    Amazon CloudFront [icon: aws-cloudfront]
    AWS Amplify [icon: aws-amplify]
  }

  load testing API {
    Amazon API Gateway [icon: aws-api-gateway]
    AWS Lambda LTA [icon: aws-lambda, label: "AWS Lambda"]
    Amazon Cognito [icon: aws-cognito]
    AWS IAM [icon: aws-iam]
  }
}

backend {
  load testing engine {
    Amazon S3 LTE [icon: aws-s3, label: "Amazon S3"]
    Amazon DynamoDB [icon: aws-dynamodb]
    Task runner [icon: aws-app-runner] {
      AWS Lambda LTE [icon: aws-lambda, label: "AWS Lambda"]
    }
  }
}

region {
  Regional load testing resources {
    VPC [icon: aws-vpc] {
      Amazon ECS [icon: aws-ecs]
      AWS Fargate [icon: aws-fargate]
    }
    AWS IoT Core [icon: aws-iot-core]
    AWS Lambda RLTR [icon: aws-lambda, label: "AWS Lambda"]
    Amazon CloudWatch [icon: aws-cloudwatch]
  }
}

Image repo {
  Taurus container image [icon: image]
  Public ECR image repository [icon: database]
}

// Define connections
Amazon S3 WC <> Amazon CloudFront
Amazon S3 WC <> AWS Amplify
Amazon API Gateway <> AWS Lambda LTA
Amazon API Gateway <> Amazon Cognito
Amazon Cognito <> AWS IAM
web console <> load testing API

front end <> backend

Amazon S3 LTE <> Task runner
Amazon DynamoDB <> Task runner

Task runner <> VPC
VPC > Amazon CloudWatch
Amazon CloudWatch > AWS Lambda RLTR
AWS Lambda RLTR > AWS IoT Core

Taurus container image > Public ECR image repository
Public ECR image repository <> VPC`
        }
      ]
    }
  },
  {
    name: "Masterclass: Global Video Streaming (Netflix Style)",
    description: "High-available video processing and delivery pipeline with adaptive bitrate streaming, content protection, and global CDN distribution.",
    thumbnail: "Play",
    shapes: {
      figures: [
        {
          id: "fig-video",
          x: 0,
          y: 0,
          width: 900,
          height: 700,
          figureNumber: 1,
          title: "Architecture: Global Video Delivery Pipeline",
          code: `Amazon S3 (source) [icon: aws-s3]
AWS Elemental MediaConvert [icon: aws-elemental-mediaconvert]
Amazon S3 (destination) [icon: aws-s3]
Amazon CloudFront [icon: aws-cloudfront]
AWS Lambda (job submit) [icon: aws-lambda]
Amazon CloudWatch [icon: aws-cloudwatch]
Amazon EventBridge [icon: aws-eventbridge]
AWS Lambda (job complete) [icon: aws-lambda]
Amazon Simple Notification Service [icon: aws-simple-notification-service]

Amazon S3 (source) > AWS Elemental MediaConvert > Amazon S3 (destination) > Amazon CloudFront
Amazon S3 (destination) > AWS Lambda (job complete) > Amazon S3 (source)
Amazon S3 (source) > AWS Lambda (job submit) > AWS Elemental MediaConvert > Amazon CloudWatch
AWS Elemental MediaConvert > Amazon EventBridge > AWS Lambda (job complete) > Amazon Simple Notification Service`
        }
      ]
    }
  },
  {
    name: "Masterclass: Real-time Marketplace (Uber Style)",
    description: "Low-latency scheduling and dispatch system using Google Cloud Platform core products for massive scale.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-marketplace",
          x: 0,
          y: 0,
          width: 1000,
          height: 800,
          figureNumber: 1,
          title: "Architecture: Real-time Logistics Engine",
          code: `Scheduler [icon: gcp-cloud-scheduler]
Cloud Run1 [icon: gcp-cloud-run, label: "Cloud Run"]
Tasks1 [icon: gcp-cloud-tasks, label: "Tasks"]
Cloud Run2 [icon: gcp-cloud-run, label: "Cloud Run"]
Tasks2 [icon: gcp-cloud-tasks, label: "Tasks"]
Data Store [icon: gcp-datastore]
Cloud Run3 [icon: gcp-cloud-run, label: "Cloud Run"]
Cloud Storage [icon: gcp-cloud-storage]
CDN [icon: gcp-cloud-cdn]
Client {
  Web [icon: laptop]
  Mobile [icon: mobile]
  Users [icon: users]
}
External data service [icon: file-pdf]

Scheduler > Cloud Run1
Cloud Run1 > Tasks1 
Tasks1 > Cloud Run2
Cloud Run2 > Data Store <> Cloud Run3 > Cloud Storage > CDN > Client
External data service <> Cloud Run2 > Tasks2 > Cloud Run3`
        }
      ]
    }
  },
  {
    name: "Masterclass: Real-time Messaging (Discord Style)",
    description: "Distributed chat architecture with real-time presence, state management, and asset offloading using Azure services.",
    thumbnail: "MessageSquare",
    shapes: {
      figures: [
        {
          id: "fig-messaging",
          x: 0,
          y: 0,
          width: 900,
          height: 700,
          figureNumber: 1,
          title: "Architecture: Real-time Messaging & Presence",
          code: `Request (browser) [icon: http]
Users [icon: users]
Azure [icon: azure] {
  App Service app [icon: azure-app-services]
  Application Insights [icon: azure-application-insights]
  SQL [icon: azure-sql-database]
  Azure Monitor [icon: azure-monitor]
  Log Analytics [icon: azure-log-analytics-workspaces]

  Insights {
    Dashboard [icon: azure-dashboard]
    Diagnostics [icon: azure-diagnostics-settings]
    Alerts [icon: bell]
  }
}

Users > Request (browser) > Application Insights
Request (browser) > App Service app > Application Insights > Insights
App Service app > SQL > Azure Monitor > Insights
Azure Monitor > Log Analytics > Insights`
        }
      ]
    }
  },
  {
    name: "AI Production Data Factory",
    description: "Highly automated pipeline for training and deploying machine learning models at scale, with integrated data lineage and validation.",
    thumbnail: "Brain",
    shapes: {
      figures: [
        {
          id: "fig-ai",
          x: 0,
          y: 0,
          width: 900,
          height: 600,
          figureNumber: 1,
          title: "Architecture: AI/ML Production Pipeline",
          code: `Data Ingestion [icon: aws-s3]
Data Validation [icon: aws-lambda]
Feature Store [icon: aws-dynamodb]
Model Training [icon: aws-ecs]
Model Registry [icon: database]
Model Serving [icon: aws-fargate]
Monitoring [icon: aws-cloudwatch]

Data Ingestion > Data Validation
Data Validation > Feature Store
Feature Store > Model Training
Model Training > Model Registry
Model Registry > Model Serving
Model Serving > Monitoring`
        }
      ]
    }
  },
  {
    name: "Global E-commerce Checkout & Order Management",
    description: "Rock-solid distributed checkout lifecycle with inventory locking, payment processing, and asynchronous shipping management.",
    thumbnail: "ShoppingCart",
    shapes: {
      figures: [
        {
          id: "fig-ec-main",
          x: 0,
          y: 0,
          width: 1100,
          height: 800,
          figureNumber: 1,
          title: "System Design: Scalable E-commerce Order Management Flow",
          code: `Frontend {
  Mobile App [icon: mobile]
  Web Web [icon: laptop]
}

Checkout {
  Order API [icon: aws-api-gateway]
  Payment Service [icon: aws-lambda]
}

Fulfillment {
  Inventory [icon: database]
  Shipping [icon: truck]
}

Frontend > Checkout
Checkout > Fulfillment`
        }
      ]
    }
  },
  {
    name: "Enterprise Kubernetes Cluster",
    description: "Multi-node Kubernetes cluster with advanced networking, security, and observability for mission-critical workloads.",
    thumbnail: "Box",
    shapes: {
      figures: [
        {
          id: "fig-k8s",
          x: 0,
          y: 0,
          width: 1000,
          height: 700,
          figureNumber: 1,
          title: "Architecture: Enterprise Kubernetes Mesh",
          code: `Internet [icon: globe]
Load Balancer [icon: aws-api-gateway]
Control Plane {
  API Server [icon: kubernetes]
  Scheduler [icon: gcp-cloud-scheduler]
  Etcd [icon: database]
}
Nodes {
  Worker 1 [icon: aws-ec2]
  Worker 2 [icon: aws-ec2]
  Worker 3 [icon: aws-ec2]
}

Internet > Load Balancer
Load Balancer > Control Plane
Control Plane <> Nodes`
        }
      ]
    }
  }
];
