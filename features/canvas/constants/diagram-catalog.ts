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
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-reg1",
          x: 40,
          y: 320,
          width: 540,
          height: 600,
          figureNumber: 2,
          title: "Region: US-East-1 (Primary Stack)",
          stroke: "rgba(59, 130, 246, 0.4)",
        },
        {
          id: "fig-reg2",
          x: 620,
          y: 320,
          width: 540,
          height: 600,
          figureNumber: 3,
          title: "Region: US-West-2 (Failover Stack)",
          stroke: "rgba(139, 92, 246, 0.4)",
        },
      ],
      rectangles: [
        {
          id: "r-edge",
          x: 40,
          y: 80,
          width: 1120,
          height: 180,
          fill: "rgba(0, 0, 0, 0.03)",
          stroke: "#22c55e",
        }, // Global Edge Layer
        {
          id: "r1-pub",
          x: 80,
          y: 400,
          width: 460,
          height: 110,
          fill: "rgba(59, 130, 246, 0.05)",
          stroke: "#3b82f6",
        }, // Region 1 Public Subnet
        {
          id: "r1-priv",
          x: 80,
          y: 530,
          width: 460,
          height: 350,
          fill: "rgba(16, 185, 129, 0.05)",
          stroke: "#10b981",
        }, // Region 1 Private Subnet
        {
          id: "r2-pub",
          x: 660,
          y: 400,
          width: 460,
          height: 110,
          fill: "rgba(139, 92, 246, 0.05)",
          stroke: "#8b5cf6",
        }, // Region 2 Public Subnet
        {
          id: "r2-priv",
          x: 660,
          y: 530,
          width: 460,
          height: 350,
          fill: "rgba(236, 72, 153, 0.05)",
          stroke: "#ec4899",
        }, // Region 2 Private Subnet
      ],
      images: [
        {
          id: "img-r53",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_Amazon-Route-53_48.svg",
          x: 100,
          y: 110,
          width: 60,
          height: 60,
        },
        {
          id: "img-cf",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_Amazon-CloudFront_48.svg",
          x: 350,
          y: 110,
          width: 60,
          height: 60,
        },
        {
          id: "img-waf",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Security-Identity-Compliance/48/Arch_AWS-WAF_48.svg",
          x: 600,
          y: 110,
          width: 60,
          height: 60,
        },
        {
          id: "img-s3g",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Storage/48/Arch_Amazon-Simple-Storage-Service_48.svg",
          x: 950,
          y: 110,
          width: 60,
          height: 60,
        },
        {
          id: "img-alb1",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_Elastic-Load-Balancing_48.svg",
          x: 285,
          y: 420,
          width: 50,
          height: 50,
        },
        {
          id: "img-ec2-1a",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_Amazon-EC2_48.svg",
          x: 150,
          y: 560,
          width: 50,
          height: 50,
        },
        {
          id: "img-ec2-1b",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_Amazon-EC2_48.svg",
          x: 420,
          y: 560,
          width: 50,
          height: 50,
        },
        {
          id: "img-rds1",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/48/Arch_Amazon-RDS_48.svg",
          x: 285,
          y: 750,
          width: 50,
          height: 50,
        },
        {
          id: "img-alb2",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_Elastic-Load-Balancing_48.svg",
          x: 865,
          y: 420,
          width: 50,
          height: 50,
        },
        {
          id: "img-rds2",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/48/Arch_Amazon-RDS_48.svg",
          x: 865,
          y: 750,
          width: 50,
          height: 50,
        },
      ],
      texts: [
        {
          id: "t-edge",
          x: 100,
          y: 220,
          text: "Global Edge Infrastructure (DNS & WAF Protected)",
          fontSize: 14,
          width: 400,
          height: 24,
          fontFamily: "Mono",
        },
        {
          id: "t-r1-alb",
          x: 210,
          y: 480,
          text: "Application Load Balancer",
          fontSize: 10,
          width: 200,
          height: 16,
          textAlign: "center",
        },
        {
          id: "t-r1-asg",
          x: 100,
          y: 630,
          text: "Auto Scaling Group - Node A & Node B",
          fontSize: 11,
          width: 420,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "t-r1-rds",
          x: 210,
          y: 820,
          text: "Primary Multi-AZ Aurora Master",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
        },
        {
          id: "t-r2-rds",
          x: 790,
          y: 820,
          text: "Cross-Region Read Replica",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
        },
      ],
      connectors: [
        {
          id: "c-geo",
          from: { kind: "rect", shapeId: "r-edge", anchor: "bottom" },
          to: { kind: "rect", shapeId: "r1-pub", anchor: "top" },
        },
        {
          id: "c-geo-fail",
          from: { kind: "rect", shapeId: "r-edge", anchor: "bottom" },
          to: { kind: "rect", shapeId: "r2-pub", anchor: "top" },
        },
        {
          id: "c1-alb-asg",
          from: { kind: "rect", shapeId: "r1-pub", anchor: "bottom" },
          to: { kind: "rect", shapeId: "r1-priv", anchor: "top" },
        },
        {
          id: "c1-asg-db",
          from: { kind: "rect", shapeId: "r1-priv", anchor: "bottom" },
          to: { kind: "rect", shapeId: "r1-priv", anchor: "bottom" },
        },
        {
          id: "c-repl",
          from: { kind: "rect", shapeId: "r1-priv", anchor: "right" },
          to: { kind: "rect", shapeId: "r2-priv", anchor: "left" },
        },
      ],
    },
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
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-ops",
          x: 820,
          y: 80,
          width: 250,
          height: 700,
          figureNumber: 2,
          title: "Observability & Ops Tier",
          stroke: "rgba(34, 197, 94, 0.4)",
        },
      ],
      rectangles: [
        { id: "m-gw", x: 50, y: 100, width: 140, height: 120, fill: "rgba(249, 115, 22, 0.05)", stroke: "#f97316" },
        { id: "m-side1", x: 250, y: 100, width: 120, height: 80, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "m-side2", x: 250, y: 250, width: 120, height: 80, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "m-side3", x: 250, y: 400, width: 120, height: 80, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "m-bus", x: 450, y: 80, width: 320, height: 600, fill: "rgba(0, 0, 0, 0.02)", stroke: ARROW_COLOR, strokeDashArray: [4,4] },
        { id: "m-mon", x: 850, y: 150, width: 180, height: 100, fill: "rgba(16, 185, 129, 0.05)", stroke: "#10b981" },
        { id: "m-log", x: 850, y: 300, width: 180, height: 100, fill: "rgba(59, 130, 246, 0.05)", stroke: "#3b82f6" },
        { id: "m-trace", x: 850, y: 450, width: 180, height: 100, fill: "rgba(139, 92, 246, 0.05)", stroke: "#8b5cf6" },
      ],
      images: [
        { id: "img-react", src: "/icons-library/seti-icons/react.svg", x: 100, y: 120, width: 40, height: 40 },
        { id: "img-go", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_AWS-Lambda_48.svg", x: 290, y: 110, width: 40, height: 40 },
        { id: "img-rust", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_AWS-Lambda_48.svg", x: 290, y: 260, width: 40, height: 40 },
        { id: "img-py", src: "/icons-library/seti-icons/python.svg", x: 290, y: 410, width: 40, height: 40 },
        { id: "img-kafka", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Analytics/48/Arch_Amazon-Managed-Streaming-for-Apache-Kafka_48.svg", x: 580, y: 120, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-gw", x: 50, y: 230, text: "Edge Gateway (Kong)", fontSize: 11, width: 140, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-svc1", x: 250, y: 190, text: "Payment (Go)", fontSize: 10, width: 120, height: 16, textAlign: "center" },
        { id: "t-svc2", x: 250, y: 340, text: "Order (Rust)", fontSize: 10, width: 120, height: 16, textAlign: "center" },
        { id: "t-svc3", x: 250, y: 490, text: "Inventory (Py)", fontSize: 10, width: 120, height: 16, textAlign: "center" },
        { id: "t-bus", x: 450, y: 690, text: "High-Throughput Event Bus Cluster", fontSize: 12, width: 320, height: 20, textAlign: "center", fontFamily: "Mono" },
        { id: "t-mon", x: 850, y: 260, text: "Prometheus / Grafana", fontSize: 10, width: 180, height: 16, textAlign: "center" },
      ],
      connectors: [
        { id: "c-gw-1", from: { kind: "rect", shapeId: "m-gw", anchor: "right" }, to: { kind: "rect", shapeId: "m-side1", anchor: "left" } },
        { id: "c-s1-bus", from: { kind: "rect", shapeId: "m-side1", anchor: "right" }, to: { kind: "rect", shapeId: "m-bus", anchor: "left" } },
      ],
    },
  },
  {
    name: "Global Edge Wasm Runtime",
    description: "Highly distributed edge network using WebAssembly (Wasm) workers and globally replicated KV stores.",
    thumbnail: "Zap",
    shapes: {
      figures: [
        {
          id: "fig-edge-main",
          x: 50,
          y: 50,
          width: 950,
          height: 600,
          figureNumber: 1,
          title: "System Design: V8/Wasm Edge Computing Lattice",
          stroke: ARROW_COLOR,
        },
      ],
      polygons: [
        { id: "p-h1", type: "hexagon", x: 100, y: 150, width: 120, height: 120, fill: "rgba(234, 179, 8, 0.05)", stroke: "#eab308" },
        { id: "p-h2", type: "hexagon", x: 100, y: 350, width: 120, height: 120, fill: "rgba(234, 179, 8, 0.05)", stroke: "#eab308" },
      ],
      rectangles: [
        { id: "r-kv", x: 350, y: 150, width: 250, height: 400, fill: "rgba(99, 102, 241, 0.05)", stroke: "#6366f1", strokeDashArray: [5,5] },
        { id: "r-anal", x: 720, y: 150, width: 200, height: 400, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
      ],
      texts: [
        { id: "t-worker", x: 100, y: 280, text: "Edge Runtime (Wasm)", fontSize: 11, width: 120, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-db", x: 350, y: 560, text: "Distributed KV (TiDB/Cockroach)", fontSize: 12, width: 250, height: 20, textAlign: "center", fontFamily: "Mono" },
      ],
    },
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
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-dm-aws",
          x: 40,
          y: 350,
          width: 530,
          height: 450,
          figureNumber: 2,
          title: "Cloud Domain: Amazon Web Services (Source)",
          stroke: "rgba(255, 153, 0, 0.4)",
        },
        {
          id: "fig-dm-gcp",
          x: 630,
          y: 350,
          width: 530,
          height: 450,
          figureNumber: 3,
          title: "Cloud Domain: Google Cloud Platform (Sink)",
          stroke: "rgba(66, 133, 244, 0.4)",
        },
      ],
      rectangles: [
        { id: "dm-bridge", x: 40, y: 80, width: 1120, height: 200, fill: "rgba(0,0,0,0.03)", stroke: "#6366f1", strokeDashArray: [8,8] },
        { id: "dm-aws-s3", x: 80, y: 420, width: 200, height: 120, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "dm-gcp-bq", x: 670, y: 420, width: 200, height: 120, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
      ],
      images: [
        { id: "img-eb", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_App-Integration/48/Arch_Amazon-EventBridge_48.svg", x: 570, y: 150, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-dm1", x: 500, y: 250, text: "Global Event Bus (Schema Discovery)", fontSize: 11, width: 200, height: 18, textAlign: "center", fontFamily: "Mono" },
      ],
      connectors: [
        { id: "dm-c1", from: { kind: "rect", shapeId: "dm-aws-s3", anchor: "top" }, to: { kind: "rect", shapeId: "dm-bridge", anchor: "bottom" } },
        { id: "dm-c2", from: { kind: "rect", shapeId: "dm-bridge", anchor: "bottom" }, to: { kind: "rect", shapeId: "dm-gcp-bq", anchor: "top" } },
      ],
    },
  },
  {
    name: "Masterclass: Global Video Streaming (Netflix Style)",
    description:
      "A massive, state-of-the-art architecture showing the intersection of AWS Cloud and the globally distributed Open Connect CDN.",
    thumbnail: "Play",
    shapes: {
      figures: [
        {
          id: "fig-nf-main",
          x: 0,
          y: 0,
          width: 1300,
          height: 1000,
          figureNumber: 1,
          title: "Architecture: The Netflix Content Delivery & Control Plane",
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-nf-oc",
          x: 40,
          y: 450,
          width: 320,
          height: 500,
          figureNumber: 2,
          title: "Open Connect CDN (Edge)",
          stroke: "rgba(229, 9, 20, 0.4)",
        },
        {
          id: "fig-nf-trans",
          x: 900,
          y: 80,
          width: 350,
          height: 870,
          figureNumber: 3,
          title: "Ingestion & Poly-Transcoding",
          stroke: "rgba(59, 130, 246, 0.4)",
        },
      ],
      rectangles: [
        { id: "nf-edge", x: 40, y: 80, width: 840, height: 120, fill: "rgba(0,0,0,0.03)", stroke: "#e50914" },
        { id: "nf-zuul", x: 100, y: 250, width: 220, height: 150, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "nf-ms-tier", x: 380, y: 250, width: 480, height: 400, fill: "rgba(100, 100, 100, 0.02)", stroke: ARROW_COLOR, strokeDashArray: [4,4] },
        { id: "nf-db-tier", x: 380, y: 700, width: 480, height: 250, fill: "rgba(59, 130, 246, 0.04)", stroke: "#3b82f6" },
      ],
      images: [
        { id: "img-oc1", src: "/logos/aws.svg", x: 170, y: 550, width: 60, height: 60 },
        { id: "img-zuul", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_Amazon-API-Gateway_48.svg", x: 185, y: 280, width: 50, height: 50 },
        { id: "img-trans", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Media-Services/48/Arch_AWS-Elemental-MediaConvert_48.svg", x: 1050, y: 150, width: 60, height: 60 },
        { id: "img-s3-nf", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Storage/48/Arch_Amazon-Simple-Storage-Service_48.svg", x: 1050, y: 500, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-nf1", x: 100, y: 160, text: "Global Traffic Management (Denominator/AWS Route53)", fontSize: 11, width: 400, height: 18, fontFamily: "Mono" },
        { id: "t-nf2", x: 100, y: 370, text: "Edge Gateway (Zuul 2)", fontSize: 11, width: 220, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-nf3", x: 380, y: 620, text: "Hystrix / Eureka / Archaias Tiers", fontSize: 10, width: 480, height: 16, textAlign: "center" },
        { id: "t-nf4", x: 900, y: 920, text: "Distributed Transcoding Engine (Mezzanine to Playable)", fontSize: 12, width: 350, height: 20, textAlign: "center", fontFamily: "Mono" },
      ],
      connectors: [
        { id: "nf-c1", from: { kind: "rect", shapeId: "nf-edge", anchor: "bottom" }, to: { kind: "rect", shapeId: "nf-zuul", anchor: "top" } },
        { id: "nf-c2", from: { kind: "rect", shapeId: "nf-zuul", anchor: "right" }, to: { kind: "rect", shapeId: "nf-ms-tier", anchor: "left" } },
        { id: "nf-c3", from: { kind: "rect", shapeId: "nf-ms-tier", anchor: "bottom" }, to: { kind: "rect", shapeId: "nf-db-tier", anchor: "top" } },
      ],
    },
  },
  {
    name: "Masterclass: Real-time Marketplace (Uber Style)",
    description: "Highly complex geo-spatial marketplace architecture featuring Ringpop sharding, TChannel networking, and supply/demand balancing.",
    thumbnail: "Navigation",
    shapes: {
      figures: [
        {
          id: "fig-ub-main",
          x: 0,
          y: 0,
          width: 1150,
          height: 900,
          figureNumber: 1,
          title: "System Design: Highly Scalable Uber Dispatching Lifecycle",
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-ub-geo",
          x: 450,
          y: 100,
          width: 350,
          height: 480,
          figureNumber: 2,
          title: "Geo-Spatial Dispatching Cluster",
          stroke: "rgba(34, 197, 94, 0.4)",
        },
        {
          id: "fig-ub-data",
          x: 820,
          y: 100,
          width: 300,
          height: 750,
          figureNumber: 3,
          title: "Data Warehouse & Lakehouse",
          stroke: "rgba(59, 130, 246, 0.4)",
        },
      ],
      rectangles: [
        { id: "ub-edge", x: 50, y: 120, width: 350, height: 150, fill: "rgba(0,0,0,0.05)", stroke: "#000000" },
        { id: "ub-sup", x: 80, y: 350, width: 300, height: 200, fill: "rgba(22, 163, 74, 0.05)", stroke: "#16a34a" },
        { id: "ub-kafka", x: 450, y: 620, width: 350, height: 230, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
      ],
      images: [
        { id: "img-ub-proxy", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Networking-Content-Delivery/48/Arch_AWS-Global-Accelerator_48.svg", x: 200, y: 150, width: 50, height: 50 },
        { id: "img-ub-ring", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_App-Integration/48/Arch_Amazon-EventBridge_48.svg", x: 600, y: 200, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-ub1", x: 50, y: 280, text: "Edge: GCLB & Zookeeper Tier", fontSize: 11, width: 350, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-ub2", x: 450, y: 550, text: "Ringpop / TChannel / GeoHash Layer", fontSize: 11, width: 350, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-ub3", x: 80, y: 560, text: "Supply/Demand Management Core", fontSize: 11, width: 300, height: 18, textAlign: "center", fontFamily: "Mono" },
      ],
      connectors: [
        { id: "ub-c1", from: { kind: "rect", shapeId: "ub-edge", anchor: "right" }, to: { kind: "rect", shapeId: "fig-ub-geo", anchor: "left" } },
        { id: "ub-c2", from: { kind: "rect", shapeId: "fig-ub-geo", anchor: "bottom" }, to: { kind: "rect", shapeId: "ub-kafka", anchor: "top" } },
        { id: "ub-c3", from: { kind: "rect", shapeId: "ub-kafka", anchor: "right" }, to: { kind: "rect", shapeId: "fig-ub-data", anchor: "left" } },
      ],
    },
  },
  {
    name: "Masterclass: Real-time Messaging (Discord Style)",
    description: "Architectural blueprint for massive-concurrency messaging with Websocket sharding, ScyllaDB persistence, and global presence management.",
    thumbnail: "MessageSquare",
    shapes: {
      figures: [
        {
          id: "fig-ch-main",
          x: 0,
          y: 0,
          width: 1200,
          height: 950,
          figureNumber: 1,
          title: "System Design: Discord-Scale Global Messaging Fabric",
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-ch-gw",
          x: 350,
          y: 120,
          width: 450,
          height: 500,
          figureNumber: 2,
          title: "Websocket Gateway Cluster (Sharded)",
          stroke: "rgba(16, 185, 129, 0.4)",
        },
        {
          id: "fig-ch-storage",
          x: 850,
          y: 120,
          width: 320,
          height: 800,
          figureNumber: 3,
          title: "Stateful Persistence Tier",
          stroke: "rgba(99, 102, 241, 0.4)",
        },
      ],
      rectangles: [
        { id: "ch-edge", x: 50, y: 150, width: 250, height: 400, fill: "rgba(0,0,0,0.03)", stroke: LOGO_BOX_STROKE },
        { id: "ch-pres", x: 380, y: 650, width: 400, height: 270, fill: "rgba(249, 115, 22, 0.05)", stroke: "#f97316" },
      ],
      images: [
        { id: "img-ch-ws", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_App-Integration/48/Arch_AWS-AppSync_48.svg", x: 550, y: 250, width: 60, height: 60 },
        { id: "img-ch-redis", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/48/Arch_Amazon-ElastiCache_48.svg", x: 550, y: 680, width: 50, height: 50 },
      ],
      texts: [
        { id: "t-ch-1", x: 50, y: 560, text: "Global Client Connect (Mobile/Desktop)", fontSize: 11, width: 250, height: 18, textAlign: "center" },
        { id: "t-ch-2", x: 350, y: 580, text: "Manages 10M+ Concurrent Websockets", fontSize: 11, width: 450, height: 18, textAlign: "center", fontFamily: "Mono" },
        { id: "t-ch-3", x: 380, y: 890, text: "Global Presence & Discovery (Gossip)", fontSize: 11, width: 400, height: 18, textAlign: "center", fontFamily: "Mono" },
      ],
      connectors: [
        { id: "ch-c1", from: { kind: "rect", shapeId: "ch-edge", anchor: "right" }, to: { kind: "rect", shapeId: "fig-ch-gw", anchor: "left" } },
        { id: "ch-c2", from: { kind: "rect", shapeId: "fig-ch-gw", anchor: "right" }, to: { kind: "rect", shapeId: "fig-ch-storage", anchor: "left" } },
      ],
    },
  },
  {
    name: "Masterclass: AI/ML Observability & Feature Store",
    description: "Production-grade ML pipeline with focused domains for feature engineering, model training, and drift monitoring.",
    thumbnail: "Brain",
    shapes: {
      figures: [
        {
          id: "fig-ml-main",
          x: 0,
          y: 0,
          width: 1200,
          height: 900,
          figureNumber: 1,
          title: "Architecture: MLOps Lifecycle with Real-time Inference & Drift Detection",
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-ml-lake",
          x: 40,
          y: 100,
          width: 300,
          height: 750,
          figureNumber: 2,
          title: "Feature Store & Data Lake",
          stroke: "rgba(59, 130, 246, 0.4)",
        },
      ],
      rectangles: [
        { id: "ml-train", x: 380, y: 100, width: 400, height: 350, fill: "rgba(139, 92, 246, 0.05)", stroke: "#8b5cf6" },
        { id: "ml-infer", x: 380, y: 500, width: 400, height: 350, fill: "rgba(16, 185, 129, 0.05)", stroke: "#10b981" },
        { id: "ml-obs", x: 820, y: 100, width: 340, height: 750, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
      ],
      images: [
        { id: "img-sm", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/48/Arch_Amazon-SageMaker-AI_48.svg", x: 550, y: 200, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-ml1", x: 380, y: 460, text: "Model Registry & Artifact Store (MLflow)", fontSize: 11, width: 400, height: 18, textAlign: "center", fontFamily: "Mono" },
      ],
    },
  },
  {
    name: "Enterprise Kubernetes Cluster",
    description: "Multi-node production Kubernetes cluster with Control Plane, Istio Mesh, and persistent volumes.",
    thumbnail: "Box",
    shapes: {
      figures: [
        {
          id: "fig-k8s-main",
          x: 50,
          y: 50,
          width: 1100,
          height: 750,
          figureNumber: 1,
          title: "Infrastructure: Managed Kubernetes Service (EKS/GKE)",
          stroke: ARROW_COLOR,
        },
        {
          id: "fig-k8s-cp",
          x: 100,
          y: 120,
          width: 250,
          height: 600,
          figureNumber: 2,
          title: "Control Plane",
          stroke: "rgba(59, 130, 246, 0.4)",
        },
      ],
      rectangles: [
        { id: "k-api", x: 130, y: 180, width: 190, height: 80, fill: LOGO_BOX_FILL, stroke: "#3b82f6" },
        { id: "k-etcd", x: 130, y: 300, width: 190, height: 80, fill: LOGO_BOX_FILL, stroke: "#3b82f6" },
        { id: "k-node1", x: 450, y: 120, width: 300, height: 280, fill: "rgba(16, 185, 129, 0.05)", stroke: "#10b981" },
        { id: "k-node2", x: 450, y: 440, width: 300, height: 280, fill: "rgba(16, 185, 129, 0.05)", stroke: "#10b981" },
        { id: "k-ing", x: 850, y: 150, width: 150, height: 400, fill: "rgba(249, 115, 22, 0.05)", stroke: "#f97316" },
      ],
      images: [
        { id: "img-k8s", src: "/logos/kubernetes.svg", x: 150, y: 60, width: 40, height: 40 },
        { id: "img-eks", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Containers/48/Arch_Amazon-Elastic-Kubernetes-Service_48.svg", x: 150, y: 400, width: 60, height: 60 },
      ],
      texts: [
        { id: "t-api", x: 130, y: 270, text: "API Server", fontSize: 10, width: 190, height: 16, textAlign: "center", fontFamily: "Mono" },
        { id: "t-etcd", x: 130, y: 390, text: "Distributed etcd Store", fontSize: 10, width: 190, height: 16, textAlign: "center", fontFamily: "Mono" },
        { id: "t-node", x: 450, y: 410, text: "Worker Node 01 - Primary", fontSize: 11, width: 300, height: 18, textAlign: "center" },
      ],
    },
  },
  {
    name: "Masterclass: Event-Driven Serverless Mesh",
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
          stroke: ARROW_COLOR,
        },
      ],
      rectangles: [
        { id: "sv-edge", x: 40, y: 100, width: 250, height: 650, fill: "rgba(249, 115, 22, 0.05)", stroke: "#f97316" },
        { id: "sv-pipe", x: 320, y: 100, width: 500, height: 400, fill: LOGO_BOX_FILL, stroke: LOGO_BOX_STROKE },
        { id: "sv-sink", x: 860, y: 100, width: 300, height: 750, fill: "rgba(59, 130, 246, 0.05)", stroke: "#3b82f6" },
      ],
      images: [
        { id: "img-lam-sv", src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_AWS-Lambda_48.svg", x: 540, y: 200, width: 60, height: 60 },
      ],
    },
  },
  {
    name: "AI Production Data Factory",
    description:
      "End-to-end AI system design architecture with 8+ stages, using Figures for parent boundaries and detailed inter-service routing.",
    thumbnail: "BrainCircuit",
    shapes: {
      figures: [
        {
          id: "ai-fig-main",
          x: 50,
          y: 50,
          width: 950,
          height: 600,
          figureNumber: 1,
          title: "System Design Architecture: Global AI Model Factory",
          stroke: ARROW_COLOR,
        },
        {
          id: "ai-fig-inference",
          x: 700,
          y: 120,
          width: 250,
          height: 480,
          figureNumber: 2,
          title: "Model Serving Tier",
          stroke: "#10b981",
        },
      ],
      rectangles: [
        {
          id: "ai-r1",
          x: 100,
          y: 150,
          width: 140,
          height: 100,
          fill: "rgba(249, 115, 22, 0.05)",
          stroke: "#f97316",
        }, // Ingestion
        {
          id: "ai-r2",
          x: 100,
          y: 350,
          width: 140,
          height: 100,
          fill: "rgba(139, 92, 246, 0.05)",
          stroke: "#8b5cf6",
        }, // Processing
        {
          id: "ai-r3",
          x: 350,
          y: 100,
          width: 250,
          height: 180,
          fill: LOGO_BOX_FILL,
          stroke: LOGO_BOX_STROKE,
        }, // Vault / Storage
        {
          id: "ai-r4",
          x: 350,
          y: 320,
          width: 250,
          height: 200,
          fill: "rgba(16, 185, 129, 0.05)",
          stroke: "#10b981",
        }, // Training Cluster
      ],
      images: [
        {
          id: "ai-img-kfk",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Analytics/48/Arch_Amazon-Managed-Streaming-for-Apache-Kafka_48.svg",
          x: 145,
          y: 160,
          width: 50,
          height: 50,
        },
        {
          id: "ai-img-lam",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_AWS-Lambda_48.svg",
          x: 145,
          y: 360,
          width: 50,
          height: 50,
        },
        {
          id: "ai-img-s3",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Storage/48/Arch_Amazon-Simple-Storage-Service_48.svg",
          x: 450,
          y: 120,
          width: 50,
          height: 50,
        },
        {
          id: "ai-img-gpu",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Compute/48/Arch_Amazon-EC2_48.svg",
          x: 450,
          y: 350,
          width: 50,
          height: 50,
        },
        {
          id: "ai-img-br",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Artificial-Intelligence/48/Arch_Amazon-Bedrock_48.svg",
          x: 800,
          y: 300,
          width: 60,
          height: 60,
        },
      ],
      texts: [
        {
          id: "ai-t1",
          x: 100,
          y: 260,
          text: "1. Raw Data Ingestion",
          fontSize: 12,
          width: 140,
          height: 20,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ai-t2",
          x: 100,
          y: 460,
          text: "2. ETL Processing",
          fontSize: 12,
          width: 140,
          height: 20,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ai-t3",
          x: 360,
          y: 180,
          text: "3. Feature Store (S3)",
          fontSize: 13,
          width: 230,
          height: 20,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ai-t4",
          x: 360,
          y: 420,
          text: "4. GPU Training Cluster",
          fontSize: 13,
          width: 230,
          height: 20,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ai-t5",
          x: 720,
          y: 150,
          text: "5. Model Evaluation",
          fontSize: 12,
          width: 210,
          height: 20,
          textAlign: "center",
        },
        {
          id: "ai-t6",
          x: 720,
          y: 400,
          text: "6. Managed Inference",
          fontSize: 12,
          width: 210,
          height: 20,
          textAlign: "center",
        },
        {
          id: "ai-t7",
          x: 720,
          y: 500,
          text: "7. User Gateway (API)",
          fontSize: 12,
          width: 210,
          height: 20,
          textAlign: "center",
        },
      ],
      connectors: [
        {
          id: "ai-c1",
          from: { kind: "rect", shapeId: "ai-r1", anchor: "bottom" },
          to: { kind: "rect", shapeId: "ai-r2", anchor: "top" },
        },
        {
          id: "ai-c2",
          from: { kind: "rect", shapeId: "ai-r2", anchor: "right" },
          to: { kind: "rect", shapeId: "ai-r3", anchor: "left" },
        },
        {
          id: "ai-c3",
          from: { kind: "rect", shapeId: "ai-r3", anchor: "bottom" },
          to: { kind: "rect", shapeId: "ai-r4", anchor: "top" },
        },
        {
          id: "ai-c4",
          from: { kind: "rect", shapeId: "ai-r4", anchor: "right" },
          to: { kind: "figure", shapeId: "ai-fig-inference", anchor: "left" },
        },
      ],
    },
  },
  {
    name: "Global E-commerce Checkout & Order Management",
    description:
      "Highly complex e-commerce system design involving synchronous checkout, asynchronous order processing, and distributed inventory management.",
    thumbnail: "ShoppingCart",
    shapes: {
      figures: [
        {
          id: "ec-fig-main",
          x: 50,
          y: 50,
          width: 1050,
          height: 700,
          figureNumber: 1,
          title: "System Design: Scalable E-commerce Order Management Flow",
          stroke: ARROW_COLOR,
        },
        {
          id: "ec-fig-checkout",
          x: 100,
          y: 120,
          width: 300,
          height: 550,
          figureNumber: 2,
          title: "Synchronous Checkout Tier",
          stroke: "#3b82f6",
        },
        {
          id: "ec-fig-async",
          x: 450,
          y: 120,
          width: 300,
          height: 550,
          figureNumber: 3,
          title: "Asynchronous Fulfillment Tier",
          stroke: "#f59e0b",
        },
        {
          id: "ec-fig-inventory",
          x: 800,
          y: 120,
          width: 220,
          height: 550,
          figureNumber: 4,
          title: "Inventory & ERP",
          stroke: "#10b981",
        },
      ],
      rectangles: [
        {
          id: "ec-r1",
          x: 150,
          y: 200,
          width: 200,
          height: 80,
          fill: "rgba(59, 130, 246, 0.05)",
          stroke: "#3b82f6",
        }, // Cart
        {
          id: "ec-r2",
          x: 150,
          y: 350,
          width: 200,
          height: 80,
          fill: "rgba(59, 130, 246, 0.05)",
          stroke: "#3b82f6",
        }, // Payments
        {
          id: "ec-r3",
          x: 500,
          y: 200,
          width: 200,
          height: 80,
          fill: "rgba(245, 158, 11, 0.05)",
          stroke: "#f59e0b",
        }, // Order Processor
        {
          id: "ec-r4",
          x: 500,
          y: 350,
          width: 200,
          height: 80,
          fill: "rgba(245, 158, 11, 0.05)",
          stroke: "#f59e0b",
        }, // Shipping Service
        {
          id: "ec-r5",
          x: 830,
          y: 250,
          width: 160,
          height: 300,
          fill: "rgba(16, 185, 129, 0.05)",
          stroke: "#10b981",
        }, // Global DB
      ],
      images: [
        {
          id: "ec-img-sqs",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_App-Integration/48/Arch_Amazon-Simple-Queue-Service_48.svg",
          x: 400,
          y: 220,
          width: 40,
          height: 40,
        },
        {
          id: "ec-img-db",
          src: "/icons-library/aws-icons/Architecture-Service-Icons_07312025/Arch_Database/48/Arch_Amazon-RDS_48.svg",
          x: 885,
          y: 350,
          width: 50,
          height: 50,
        },
      ],
      texts: [
        {
          id: "ec-t1",
          x: 150,
          y: 290,
          text: "Step 1: Shopping Cart Validation",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ec-t2",
          x: 150,
          y: 440,
          text: "Step 2: 3D Secure Payment Gate",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ec-t3",
          x: 500,
          y: 290,
          text: "Step 3: Async Order Persistence",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ec-t4",
          x: 500,
          y: 440,
          text: "Step 4: Logistics Global Routing",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ec-t5",
          x: 830,
          y: 210,
          text: "Step 5: Global Inventory Sync",
          fontSize: 11,
          width: 160,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
        {
          id: "ec-t6",
          x: 500,
          y: 550,
          text: "Step 6: Real-time Notification",
          fontSize: 11,
          width: 200,
          height: 18,
          textAlign: "center",
          fontFamily: "Mono",
        },
      ],
      connectors: [
        {
          id: "ec-c1",
          from: { kind: "rect", shapeId: "ec-r1", anchor: "bottom" },
          to: { kind: "rect", shapeId: "ec-r2", anchor: "top" },
        },
        {
          id: "ec-c2",
          from: { kind: "rect", shapeId: "ec-r2", anchor: "right" },
          to: { kind: "rect", shapeId: "ec-r3", anchor: "left" },
        },
        {
          id: "ec-c3",
          from: { kind: "rect", shapeId: "ec-r3", anchor: "bottom" },
          to: { kind: "rect", shapeId: "ec-r4", anchor: "top" },
        },
        {
          id: "ec-c4",
          from: { kind: "rect", shapeId: "ec-r3", anchor: "right" },
          to: { kind: "rect", shapeId: "ec-r5", anchor: "left" },
        },
      ],
    },
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
