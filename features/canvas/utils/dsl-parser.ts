/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeId } from "./index";
import { ShapeCollection, RectShape, Connector, AnchorSide } from "../types";

/**
 * Primitive Parser for the custom Diagram-as-Code DSL.
 * Supports nested blocks, nodes with icons, and connections.
 */

interface DSLNode {
  id: string;
  name: string;
  icon?: string;
  label?: string;
  color?: string;
  shape?: string;
  description?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  children: DSLNode[];
  parent?: DSLNode;
  isGroup: boolean;
}

interface DSLConnection {
  from: string;
  to: string;
  type: ">" | "<" | "<>";
  label?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeDashArray?: number[];
  waypoints?: { x: number; y: number }[];
  routingType?: "elbow" | "straight";
  startArrowHead?: boolean;
  endArrowHead?: boolean;
}

export function parseDSL(
  code: string,
  iconRegistry: string[] = []
): ShapeCollection {
  const lines = code.split("\n");
  const root: DSLNode = {
    id: "root",
    name: "root",
    children: [],
    isGroup: true,
  };
  let current = root;
  const connections: DSLConnection[] = [];
  const nodeMap = new Map<string, DSLNode>();

  // Fuzzy Search for Icon Registry
  const fuzzySearchIcon = (
    slug: string,
    providerHint?: string
  ): string | null => {
    if (!iconRegistry || iconRegistry.length === 0) return null;
    const parts = slug.split("-");
    const searchTerms = parts
      .map((p) => p.trim().toLowerCase())
      .filter((p) => p.length > 0);

    const matches = iconRegistry.filter((path) => {
      const lowerPath = path.toLowerCase();
      return searchTerms.every((term) => lowerPath.includes(term));
    });

    if (matches.length > 0) {
      if (providerHint) {
        const providerMatch = matches.find((m) =>
          m.toLowerCase().includes(providerHint.toLowerCase())
        );
        if (providerMatch) return providerMatch;
      }
      return matches[0];
    }
    return null;
  };

  // Helper to find icon path - Production Implementation using Heuristics
  const getIconPath = (slug: string) => {
    const raw = slug.toLowerCase();
    const parts = raw.split("-");
    const provider = parts[0];
    const service = parts.slice(1).join("-");

    // 1. AWS Architecture (Tiered Heuristics)
    if (provider === "aws") {
      const base =
        "/icons-library/aws-icons/Architecture-Service-Icons_07312025";
      const categories: Record<string, string> = {
        s3: "Arch_Storage",
        ebs: "Arch_Storage",
        efs: "Arch_Storage",
        lambda: "Arch_Compute",
        ec2: "Arch_Compute",
        asg: "Arch_Compute",
        fargate: "Arch_Compute",
        ecs: "Arch_Containers",
        eks: "Arch_Containers",
        rds: "Arch_Database",
        dynamodb: "Arch_Database",
        aurora: "Arch_Database",
        elasticache: "Arch_Database",
        sqs: "Arch_App-Integration",
        sns: "Arch_App-Integration",
        eventbridge: "Arch_App-Integration",
        "api-gateway": "Arch_Networking-Content-Delivery",
        cloudfront: "Arch_Networking-Content-Delivery",
        vpc: "Arch_Networking-Content-Delivery",
        route53: "Arch_Networking-Content-Delivery",
        alb: "Arch_Networking-Content-Delivery",
        waf: "Arch_Security-Identity-Compliance",
        iam: "Arch_Security-Identity-Compliance",
        cloudwatch: "Arch_Management-Governance",
        mediaconvert: "Arch_Media-Services",
      };

      const cat = categories[service];
      let fileName = service;
      if (service === "s3") fileName = "Amazon-Simple-Storage-Service";
      if (service === "lambda") fileName = "AWS-Lambda";
      if (service === "api-gateway") fileName = "Amazon-API-Gateway";
      if (service === "cloudfront") fileName = "Amazon-CloudFront";
      if (service === "dynamodb") fileName = "Amazon-DynamoDB";
      if (service === "vpc") fileName = "Amazon-Virtual-Private-Cloud";
      if (service === "route53") fileName = "Amazon-Route-53";
      if (service === "sqs") fileName = "Amazon-Simple-Queue-Service";
      if (service === "sns") fileName = "Amazon-Simple-Notification-Service";
      if (service === "rds") fileName = "Amazon-RDS";
      if (service === "ec2") fileName = "Amazon-EC2";
      if (service === "asg") fileName = "Amazon-EC2-Auto-Scaling";
      if (service === "alb") fileName = "Elastic-Load-Balancing";
      if (service === "iam") fileName = "AWS-Identity-and-Access-Management";
      if (service === "waf") fileName = "AWS-WAF";
      if (service === "ecs") fileName = "Amazon-Elastic-Container-Service";
      if (service === "eks") fileName = "Amazon-Elastic-Kubernetes-Service";
      if (service === "cloudwatch") fileName = "Amazon-CloudWatch";
      if (service === "elasticache") fileName = "Amazon-ElastiCache";
      if (service === "mediaconvert") fileName = "AWS-Elemental-MediaConvert";
      if (service === "eventbridge") fileName = "Amazon-EventBridge";
      if (service === "sns") fileName = "Amazon-Simple-Notification-Service";

      // Special case: S3, RDS, VPC etc need strict casing in the heuristic
      let formattedName = fileName
        .split("-")
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
        .join("-");
      if (fileName.includes("RDS")) formattedName = fileName;
      if (fileName.includes("VPC")) formattedName = fileName;
      if (fileName.includes("WAF")) formattedName = fileName;
      if (fileName.includes("EC2")) formattedName = fileName;
      if (fileName.includes("CloudWatch")) formattedName = fileName;
      if (fileName.includes("ElastiCache")) formattedName = fileName;
      if (fileName.includes("MediaConvert")) formattedName = fileName;
      if (fileName.includes("EventBridge")) formattedName = fileName;
      if (fileName.includes("Notification-Service")) formattedName = fileName;
      if (fileName.includes("S3"))
        formattedName = "Amazon-Simple-Storage-Service";

      if (cat) return `${base}/${cat}/48/Arch_${formattedName}_48.svg`;

      const fuzzy = fuzzySearchIcon(service, "aws");
      if (fuzzy) return fuzzy;
      return `${base}/Arch_Compute/48/Arch_AWS-Lambda_48.svg`;
    }

    // 2. Google Cloud Platform
    if (provider === "gcp") {
      const base = "/icons-library/gcp-icons/google-cloud-legacy-icons";
      const mapping: Record<string, string> = {
        run: "cloud_run",
        functions: "cloud_functions",
        storage: "cloud_storage",
        sql: "cloud_sql",
        cdn: "cloud_cdn",
        pubsub: "cloud_pubsub",
        gke: "container_engine",
        compute: "compute_engine",
      };
      const key = mapping[service] || service.replace(/-/g, "_");
      const fuzzy = fuzzySearchIcon(service, "gcp");
      if (fuzzy) return fuzzy;
      return `${base}/${key}/svg/${key}.svg`;
    }

    // --- Azure ---
    if (provider === "azure") {
      const base = "/icons-library/azure-icons";

      // Explicit mappings for primary Azure services (verified paths)
      if (service === "frontdoor" || service === "cdn")
        return `${base}/networking/10073-icon-service-Front-Door-and-CDN-Profiles.svg`;
      if (service === "cosmos-db" || service === "cosmos")
        return `${base}/databases/10121-icon-service-Azure-Cosmos-DB.svg`;
      if (service === "sql" || service === "database")
        return `${base}/databases/10130-icon-service-SQL-Database.svg`;
      if (service === "vnet")
        return `${base}/networking/10061-icon-service-Virtual-Networks.svg`;
      if (service === "nsg")
        return `${base}/networking/10067-icon-service-Network-Security-Groups.svg`;
      if (service === "app" || service === "web")
        return `${base}/web/10035-icon-service-App-Services.svg`;
      if (service === "functions")
        return `${base}/compute/10029-icon-service-Function-Apps.svg`;
      if (service === "redis")
        return `${base}/databases/10137-icon-service-Cache-Redis.svg`;
      if (service === "storage" || service === "blob")
        return `${base}/storage/10086-icon-service-Storage-Accounts.svg`;
      if (service === "dns")
        return `${base}/networking/10064-icon-service-DNS-Zones.svg`;
      if (service === "subnet")
        return `${base}/networking/02742-icon-service-Subnet.svg`;
      if (service === "log" || service === "log-analytics")
        return `${base}/monitor/00474-icon-service-Log-Analytics-Workspaces.svg`;
      if (service === "appinsights")
        return `${base}/monitor/00475-icon-service-Application-Insights.svg`;

      const fuzzy = fuzzySearchIcon(service, "azure");
      if (fuzzy) return fuzzy;
      return `${base}/general/00001-icon-service-General.svg`;
    }

    // 4. Kubernetes
    if (provider === "k8s" || provider === "kubernetes") {
      const base = "/icons-library/kubernetes-icons/svg";
      const mapping: Record<string, string> = {
        pod: "resources/unlabeled/pod",
        svc: "resources/unlabeled/svc",
        service: "resources/unlabeled/svc",
        deploy: "resources/unlabeled/deploy",
        deployment: "resources/unlabeled/deploy",
        node: "infrastructure_components/unlabeled/node",
        "control-plane": "infrastructure_components/unlabeled/control-plane",
        ing: "resources/unlabeled/ing",
        ingress: "resources/unlabeled/ing",
        ns: "resources/unlabeled/ns",
        namespace: "resources/unlabeled/ns",
        pv: "resources/unlabeled/pv",
        pvc: "resources/unlabeled/pvc",
        cm: "resources/unlabeled/cm",
        configmap: "resources/unlabeled/cm",
        secret: "resources/unlabeled/secret",
      };
      const key = mapping[service] || `resources/unlabeled/${service}`;
      return `${base}/${key}.svg`;
    }

    // 5. General/Misc & Common SaaS (Architecture Grade)
    if (raw === "laptop")
      return "/icons-library/azure-icons/general/10783-icon-service-Browser.svg";
    if (raw === "mobile" || raw === "phone")
      return "/icons-library/azure-icons/general/10822-icon-service-Mobile.svg";
    if (raw === "user" || raw === "users")
      return "/icons-library/kubernetes-icons/svg/resources/unlabeled/user.svg";
    if (raw === "cloudinary")
      return "/icons-library/azure-icons/general/10812-icon-service-Image.svg";
    if (raw === "mapbox")
      return "/icons-library/azure-icons/general/10834-icon-service-Search.svg";
    if (raw === "stripe")
      return "/icons-library/azure-icons/general/10008-icon-service-Marketplace.svg";
    if (raw === "database" || raw === "db")
      return "/icons-library/azure-icons/databases/10130-icon-service-SQL-Database.svg";
    if (raw === "github")
      return "/icons-library/azure-icons/general/10782-icon-service-Branch.svg";
    if (raw === "docker")
      return "/icons-library/kubernetes-icons/svg/resources/unlabeled/pod.svg";
    if (raw === "react")
      return "/icons-library/azure-icons/general/10783-icon-service-Browser.svg";

    return "/icons-library/azure-icons/general/10001-icon-service-All-Resources.svg"; // Final fallback
  };

  // 1. Simple Tokenization & Hierarchy Building
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith("//") || line.startsWith("#")) continue;

    // Skip headers like "Connections:" or others that don't start a block
    if (line.endsWith(":") && !line.includes("[")) continue;

    // Handle Closing Block
    if (line === "}") {
      if (current.parent) current = current.parent;
      continue;
    }

    // Handle Connections
    if (line.includes(">") || line.includes("<>") || line.includes("<")) {
      const parts = line.split(/([<>]+)/);
      if (parts.length >= 3) {
        const froms = parts[0]
          .trim()
          .split(",")
          .map((s) => s.trim());
        const type = parts[1].trim() as any;
        const rest = parts[2].trim();

        let targetPart = rest;
        let propsPart = "";

        if (rest.includes("[")) {
          const m = rest.match(/(.*?)\[(.*?)\]/);
          if (m) {
            targetPart = m[1].trim();
            propsPart = m[2].trim();
          }
        } else if (rest.includes(":")) {
          // Legacy colon label support
          const m = rest.split(":");
          targetPart = m[0].trim();
          propsPart = `label: "${m[1].trim()}"`;
        }

        const tos = targetPart.split(",").map((s) => s.trim());
        const connProps: Record<string, any> = {};

        if (propsPart) {
          propsPart.split(",").forEach((p) => {
            const [k, v] = p
              .split(":")
              .map((s) => s.trim().replace(/["']/g, ""));
            if (k === "label") connProps.label = v;
            if (k === "color" || k === "stroke") connProps.stroke = v;
            if (k === "width") connProps.strokeWidth = parseInt(v);
            if (k === "dashed") connProps.strokeDashArray = [5, 5];
            if (k === "dotted") connProps.strokeDashArray = [2, 2];
            if (k === "routing")
              connProps.routingType = v === "straight" ? "straight" : "elbow";
            if (k === "startArrow") connProps.startArrowHead = v === "true";
            if (k === "endArrow") connProps.endArrowHead = v === "true";
            if (k === "via") {
              connProps.waypoints = v
                .split(";")
                .map((pt) => {
                  const [x, y] = pt.split(",").map((s) => parseFloat(s.trim()));
                  return { x, y };
                })
                .filter((pt) => !isNaN(pt.x) && !isNaN(pt.y));
            }
          });
        }

        // Logic based on connection type symbol
        if (type === "<>") {
          if (connProps.startArrowHead === undefined)
            connProps.startArrowHead = true;
          if (connProps.endArrowHead === undefined)
            connProps.endArrowHead = true;
        } else if (type === "<") {
          if (connProps.startArrowHead === undefined)
            connProps.startArrowHead = true;
          if (connProps.endArrowHead === undefined)
            connProps.endArrowHead = false;
        } else if (type === ">") {
          if (connProps.startArrowHead === undefined)
            connProps.startArrowHead = false;
          // endArrowHead is true by default
        }

        froms.forEach((f) => {
          tos.forEach((t) => {
            connections.push({ from: f, to: t, type, ...connProps });
          });
        });
      }
      continue;
    }

    // Handle Node/Block Definition
    const blockStart = line.endsWith("{");
    const cleanLine = blockStart ? line.slice(0, -1).trim() : line;

    const propMatch = cleanLine.match(/\[(.*?)\]/);
    const namePart = propMatch ? cleanLine.split("[")[0].trim() : cleanLine;
    const props = propMatch ? propMatch[1] : "";

    const node: DSLNode = {
      id: makeId(),
      name: namePart,
      children: [],
      parent: current,
      isGroup: blockStart,
    };

    // Parse Properties
    if (props) {
      const pairs = props.split(",").map((p) => p.trim());
      pairs.forEach((pair) => {
        const [k, v] = pair
          .split(":")
          .map((s) => s.trim().replace(/["']/g, ""));
        if (k === "icon") node.icon = getIconPath(v);
        if (k === "label") node.label = v;
        if (k === "color") node.color = v;
        if (k === "shape") node.shape = v;
        if (k === "desc" || k === "description") node.description = v;
        if (k === "width") node.strokeWidth = parseInt(v);
        if (k === "dashed") node.strokeDashArray = [5, 5];
      });
    }

    current.children.push(node);
    nodeMap.set(namePart, node);
    if (blockStart) current = node;
  }

  // 2. Visual Layout Generation (Simplified recursive Grid/Flex logic)
  const result: ShapeCollection = {
    rectangles: [],
    images: [],
    texts: [],
    figures: [],
    connectors: [],
  };

  const MARGIN = 40;
  const HEADER_HEIGHT = 60;
  const NODE_SIZE = 80;
  const GRID_GAP = 80;

  function layoutNode(
    node: DSLNode,
    startX: number,
    startY: number
  ): { width: number; height: number } {
    const isRoot = node.id === "root";

    if (node.isGroup || isRoot) {
      const COLS = isRoot ? 2 : node.children.length > 4 ? 3 : 2;
      const m = isRoot ? 0 : MARGIN;
      const gh = isRoot ? 0 : HEADER_HEIGHT;

      let maxW = isRoot ? 0 : 240;
      let currentY = gh;
      let rowMaxH = 0;
      let currentXInRow = m;

      node.children.forEach((child, index) => {
        const size = layoutNode(
          child,
          startX + currentXInRow,
          startY + currentY
        );
        rowMaxH = Math.max(rowMaxH, size.height);
        currentXInRow += size.width + GRID_GAP;

        if ((index + 1) % COLS === 0 || index === node.children.length - 1) {
          maxW = Math.max(maxW, currentXInRow - GRID_GAP + m);
          currentY += rowMaxH + GRID_GAP;
          currentXInRow = m;
          rowMaxH = 0;
        }
      });

      const totalH = Math.max(isRoot ? 0 : 120, currentY + m - GRID_GAP);
      const totalW = maxW;

      if (!isRoot) {
        const groupRect: RectShape = {
          id: node.id,
          x: startX,
          y: startY,
          width: totalW,
          height: totalH,
          fill: "rgba(150, 150, 150, 0.03)",
          stroke: node.color || "rgba(150, 150, 150, 0.2)",
          strokeDashArray: [5, 5],
        };
        result.rectangles!.push(groupRect);

        // Add a title text for the group container
        result.texts!.push({
          id: makeId(),
          x: startX + 20,
          y: startY + 15,
          width: totalW - 40,
          height: 24,
          text: (node.label || node.name).toUpperCase(),
          fontSize: 10,
          textAlign: "left",
          fontFamily: "Mono",
          fill: node.color || "rgba(255, 255, 255, 0.5)",
        });
      }

      (node as any).bounds = {
        x: startX,
        y: startY,
        width: totalW,
        height: totalH,
      };
      return { width: totalW, height: totalH };
    } else {
      // Individual Node
      const rect: RectShape = {
        id: node.id,
        x: startX,
        y: startY,
        width: NODE_SIZE,
        height: NODE_SIZE,
        fill:
          node.shape === "note"
            ? "rgba(255, 235, 59, 0.15)"
            : "rgba(255,255,255,0.05)",
        stroke:
          node.shape === "note"
            ? "#fbc02d"
            : node.color || "rgba(255,255,255,0.2)",
        strokeDashArray:
          node.shape === "note" ? undefined : node.strokeDashArray,
      };
      if (node.strokeWidth !== undefined) rect.strokeWidth = node.strokeWidth;
      result.rectangles!.push(rect);

      if (node.icon) {
        result.images!.push({
          id: makeId(),
          src: node.icon,
          x: startX + 20,
          y: startY + 10,
          width: 40,
          height: 40,
        });
      }

      result.texts!.push({
        id: makeId(),
        x: startX,
        y: startY + 55,
        width: NODE_SIZE,
        height: 20,
        text: node.label || node.name,
        fontSize: 10,
        fontWeight: 600,
        textAlign: "center",
      });

      if ((node as any).description) {
        result.texts!.push({
          id: makeId(),
          x: startX,
          y: startY + 68,
          width: NODE_SIZE,
          height: 30,
          text: (node as any).description,
          fontSize: 7,
          fill: "rgba(255,255,255,0.4)",
          textAlign: "center",
        });
      }

      (node as any).bounds = {
        x: startX,
        y: startY,
        width: NODE_SIZE,
        height: NODE_SIZE,
      };
      return { width: NODE_SIZE, height: NODE_SIZE };
    }
  }

  const layoutSize = layoutNode(root, 0, 0);

  // 3. Smart Connection Resolution
  connections.forEach((conn) => {
    const fromNode = nodeMap.get(conn.from);
    const toNode = nodeMap.get(conn.to);

    if (fromNode && toNode) {
      const fb = (fromNode as any).bounds;
      const tb = (toNode as any).bounds;

      let fromAnchor: AnchorSide = "right";
      let toAnchor: AnchorSide = "left";

      if (fb && tb) {
        const dx = tb.x + tb.width / 2 - (fb.x + fb.width / 2);
        const dy = tb.y + tb.height / 2 - (fb.y + fb.height / 2);

        if (Math.abs(dx) > Math.abs(dy)) {
          fromAnchor = dx > 0 ? "right" : "left";
          toAnchor = dx > 0 ? "left" : "right";
        } else {
          fromAnchor = dy > 0 ? "bottom" : "top";
          toAnchor = dy > 0 ? "top" : "bottom";
        }
      }

      const connector: Connector = {
        id: makeId(),
        from: {
          kind: fromNode.isGroup ? "figure" : "rect",
          shapeId: fromNode.id,
          anchor: fromAnchor,
        },
        to: {
          kind: toNode.isGroup ? "figure" : "rect",
          shapeId: toNode.id,
          anchor: toAnchor,
        },
        label: conn.label,
        stroke: conn.stroke,
        strokeWidth: conn.strokeWidth,
        strokeDashArray: conn.strokeDashArray,
        waypoints: conn.waypoints,
        routingType: conn.routingType,
        startArrowHead: conn.startArrowHead,
        endArrowHead: conn.endArrowHead,
      };
      result.connectors!.push(connector);
    }
  });

  return { ...result, ...layoutSize };
}
