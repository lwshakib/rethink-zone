/* eslint-disable @typescript-eslint/no-explicit-any */
import { makeId } from "./index";
import { 
  ShapeCollection, 
  FigureShape, 
  RectShape, 
  ImageShape, 
  TextShape, 
  Connector, 
  AnchorSide 
} from "../types";

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
  children: DSLNode[];
  parent?: DSLNode;
  isGroup: boolean;
}

interface DSLConnection {
  from: string;
  to: string;
  type: ">" | "<" | "<>";
  label?: string;
}

export function parseDSL(code: string): ShapeCollection {
  const lines = code.split('\n');
  const root: DSLNode = { id: 'root', name: 'root', children: [], isGroup: true };
  let current = root;
  const connections: DSLConnection[] = [];
  const nodeMap = new Map<string, DSLNode>();

  // Helper to find icon path
  const getIconPath = (iconName: string) => {
    const name = iconName.toLowerCase();
    
    if (name.startsWith('aws-')) {
      const service = name.replace('aws-', '');
      const base = '/icons-library/aws-icons/Architecture-Service-Icons_07312025';
      
      if (service === 's3') return `${base}/Arch_Storage/48/Arch_Amazon-Simple-Storage-Service_48.svg`;
      if (service === 'lambda') return `${base}/Arch_Compute/48/Arch_AWS-Lambda_48.svg`;
      if (service === 'api-gateway') return `${base}/Arch_Networking-Content-Delivery/48/Arch_Amazon-API-Gateway_48.svg`;
      if (service === 'cloudfront') return `${base}/Arch_Networking-Content-Delivery/48/Arch_Amazon-CloudFront_48.svg`;
      if (service === 'dynamodb') return `${base}/Arch_Database/48/Arch_Amazon-DynamoDB_48.svg`;
      if (service === 'vpc') return `${base}/Arch_Networking-Content-Delivery/48/Arch_Amazon-VPC_48.svg`;
      if (service === 'ecs') return `${base}/Arch_Compute/48/Arch_Amazon-Elastic-Container-Service_48.svg`;
      if (service === 'fargate') return `${base}/Arch_Compute/48/Arch_AWS-Fargate_48.svg`;
      if (service === 'cognito') return `${base}/Arch_Security-Identity-Compliance/48/Arch_Amazon-Cognito_48.svg`;
      if (service === 'iam') return `${base}/Arch_Security-Identity-Compliance/48/Arch_AWS-Identity-and-Access-Management_48.svg`;
      if (service === 'iot-core') return `${base}/Arch_Internet-of-Things/48/Arch_AWS-IoT-Core_48.svg`;
      if (service === 'cloudwatch') return `${base}/Arch_Management-Governance/48/Arch_Amazon-CloudWatch_48.svg`;
      if (service === 'amplify') return `${base}/Arch_Front-End-Web-Mobile/48/Arch_AWS-Amplify_48.svg`;
      if (service === 'app-runner') return `${base}/Arch_Compute/48/Arch_AWS-App-Runner_48.svg`;
      if (service === 'elemental-mediaconvert') return `${base}/Arch_Media-Services/48/Arch_AWS-Elemental-MediaConvert_48.svg`;
      if (service === 'eventbridge') return `${base}/Arch_App-Integration/48/Arch_Amazon-EventBridge_48.svg`;
      if (service === 'simple-notification-service') return `${base}/Arch_App-Integration/48/Arch_Amazon-Simple-Notification-Service_48.svg`;
      if (service === 'route-53') return `${base}/Arch_Networking-Content-Delivery/48/Arch_Amazon-Route-53_48.svg`;
      if (service === 'waf') return `${base}/Arch_Security-Identity-Compliance/48/Arch_AWS-WAF_48.svg`;
      if (service === 'alb') return `${base}/Arch_Networking-Content-Delivery/48/Arch_Elastic-Load-Balancing_48.svg`;
      if (service === 'ec2') return `${base}/Arch_Compute/48/Arch_Amazon-EC2_48.svg`;
      if (service === 'rds') return `${base}/Arch_Database/48/Arch_Amazon-RDS_48.svg`;
      if (service === 'msk') return `${base}/Arch_Analytics/48/Arch_Amazon-Managed-Streaming-for-Apache-Kafka_48.svg`;
      if (service === 'emr') return `${base}/Arch_Analytics/48/Arch_Amazon-EMR_48.svg`;
      
      return `${base}/Arch_Compute/48/Arch_AWS-Lambda_48.svg`; // Fallback
    }
    
    if (name.startsWith('gcp-')) {
      const service = name.replace('gcp-', '');
      const base = '/icons-library/gcp-icons/google-cloud-legacy-icons';
      
      if (service === 'cloud-run') return `${base}/cloud_run/svg/cloud_run.svg`;
      if (service === 'cloud-tasks') return `${base}/cloud_tasks/svg/cloud_tasks.svg`;
      if (service === 'cloud-scheduler') return `${base}/cloud_scheduler/svg/cloud_scheduler.svg`;
      if (service === 'datastore') return `${base}/datastore/svg/datastore.svg`;
      if (service === 'cloud-storage') return `${base}/cloud_storage/svg/cloud_storage.svg`;
      if (service === 'cloud-cdn') return `${base}/cloud_cdn/svg/cloud_cdn.svg`;
      
      return `${base}/cloud_run/svg/cloud_run.svg`; // Fallback
    }

    if (name.startsWith('azure-')) {
      const service = name.replace('azure-', '');
      const base = '/icons-library/azure-icons';
      
      if (service === 'app-services') return `${base}/web/app-services.svg`;
      if (service === 'application-insights') return `${base}/management + governance/application-insights.svg`;
      if (service === 'sql-database') return `${base}/databases/azure-sql-database.svg`;
      if (service === 'monitor') return `${base}/monitor/monitor.svg`;
      if (service === 'log-analytics-workspaces') return `${base}/monitor/log-analytics-workspaces.svg`;
      if (service === 'dashboard') return `${base}/general/dashboard.svg`;
      
      return `${base}/general/azure-ecosystem.svg`; // Fallback
    }

    if (name === 'laptop') return '/icons-library/seti-icons/react.svg'; // Placeholder
    if (name === 'mobile') return '/icons-library/seti-icons/react.svg'; // Placeholder
    if (name === 'users') return '/icons-library/seti-icons/react.svg'; // Placeholder

    return `/icons-library/seti-icons/react.svg`; // Generic fallback
  };

  // 1. Simple Tokenization & Hierarchy Building
  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('//')) continue;

    // Handle Closing Block
    if (line === '}') {
      if (current.parent) current = current.parent;
      continue;
    }

    // Handle Connections
    if (line.includes('>') || line.includes('<>') || line.includes('<')) {
      const parts = line.split(/([<>]+)/);
      if (parts.length >= 3) {
        const froms = parts[0].trim().split(',').map(s => s.trim());
        const type = parts[1].trim() as any;
        const tos = parts[2].split(':')[0].trim().split(',').map(s => s.trim());
        const label = parts[2].includes(':') ? parts[2].split(':')[1].trim() : undefined;

        froms.forEach(f => {
          tos.forEach(t => {
            connections.push({ from: f, to: t, type, label });
          });
        });
      }
      continue;
    }

    // Handle Node/Block Definition
    // Name [props] { or Name [props]
    const blockStart = line.endsWith('{');
    const cleanLine = blockStart ? line.slice(0, -1).trim() : line;
    
    const propMatch = cleanLine.match(/\[(.*?)\]/);
    const namePart = propMatch ? cleanLine.split('[')[0].trim() : cleanLine;
    const props = propMatch ? propMatch[1] : '';

    const node: DSLNode = {
      id: makeId(),
      name: namePart,
      children: [],
      parent: current,
      isGroup: blockStart
    };

    // Parse Properties
    if (props) {
      const pairs = props.split(',').map(p => p.trim());
      pairs.forEach(pair => {
        const [k, v] = pair.split(':').map(s => s.trim().replace(/["']/g, ''));
        if (k === 'icon') node.icon = getIconPath(v);
        if (k === 'label') node.label = v;
        if (k === 'color') node.color = v;
        if (k === 'shape') node.shape = v;
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
    connectors: []
  };

  const MARGIN = 40;
  const HEADER_HEIGHT = 60;
  const NODE_SIZE = 80;
  const GRID_GAP = 60;

  function layoutNode(node: DSLNode, startX: number, startY: number): { width: number, height: number } {
    const isRoot = node.id === 'root';
    
    if (node.isGroup || isRoot) {
      const COLS = isRoot ? 2 : (node.children.length > 4 ? 3 : 2);
      const m = isRoot ? 0 : MARGIN;
      const gh = isRoot ? 0 : HEADER_HEIGHT;
      
      let maxW = isRoot ? 0 : 240;
      let currentY = gh;
      let rowMaxH = 0;
      let currentXInRow = m;

      node.children.forEach((child, index) => {
        const size = layoutNode(child, startX + currentXInRow, startY + currentY);
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

      (node as any).bounds = { x: startX, y: startY, width: totalW, height: totalH };
      return { width: totalW, height: totalH };
    } else {
      // Individual Node
      const rect: RectShape = {
        id: node.id,
        x: startX,
        y: startY,
        width: NODE_SIZE,
        height: NODE_SIZE,
        fill: 'rgba(255,255,255,0.05)',
        stroke: node.color || 'rgba(255,255,255,0.2)'
      };
      result.rectangles!.push(rect);

      if (node.icon) {
        result.images!.push({
          id: makeId(),
          src: node.icon,
          x: startX + 20,
          y: startY + 10,
          width: 40,
          height: 40
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
        textAlign: 'center'
      });

      (node as any).bounds = { x: startX, y: startY, width: NODE_SIZE, height: NODE_SIZE };
      return { width: NODE_SIZE, height: NODE_SIZE };
    }
  }

  const layoutSize = layoutNode(root, 0, 0);

  // 3. Smart Connection Resolution
  connections.forEach(conn => {
    const fromNode = nodeMap.get(conn.from);
    const toNode = nodeMap.get(conn.to);

    if (fromNode && toNode) {
      const fb = (fromNode as any).bounds;
      const tb = (toNode as any).bounds;
      
      let fromAnchor: AnchorSide = 'right';
      let toAnchor: AnchorSide = 'left';
      
      if (fb && tb) {
        const dx = (tb.x + tb.width/2) - (fb.x + fb.width/2);
        const dy = (tb.y + tb.height/2) - (fb.y + fb.height/2);
        
        if (Math.abs(dx) > Math.abs(dy)) {
          fromAnchor = dx > 0 ? 'right' : 'left';
          toAnchor = dx > 0 ? 'left' : 'right';
        } else {
          fromAnchor = dy > 0 ? 'bottom' : 'top';
          toAnchor = dy > 0 ? 'top' : 'bottom';
        }
      }

      const connector: Connector = {
        id: makeId(),
        from: {
          kind: fromNode.isGroup ? 'figure' : 'rect',
          shapeId: fromNode.id,
          anchor: fromAnchor
        },
        to: {
          kind: toNode.isGroup ? 'figure' : 'rect',
          shapeId: toNode.id,
          anchor: toAnchor
        }
      };
      result.connectors!.push(connector);
    }
  });

  return { ...result, ...layoutSize };
}
