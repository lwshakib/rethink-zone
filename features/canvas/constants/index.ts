import {
  Activity,
  Airplay,
  AlertCircle,
  AlertOctagon,
  AlertTriangle,
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Anchor,
  Aperture,
  Archive,
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  ArrowRight as ArrowRightIcon,
  ArrowLeft as ArrowLeftIcon,
} from "lucide-react";
import { IconItem } from "../types";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 5;
export const ZOOM_STEP = 0.1;

export const GENERAL_ICONS: IconItem[] = [
  { name: "activity", icon: Activity },
  { name: "airplay", icon: Airplay },
  { name: "alert-circle", icon: AlertCircle },
  { name: "alert-octagon", icon: AlertOctagon },
  { name: "alert-triangle", icon: AlertTriangle },
  { name: "align-center", icon: AlignCenter },
  { name: "align-justify", icon: AlignJustify },
  { name: "align-left", icon: AlignLeft },
  { name: "align-right", icon: AlignRight },
  { name: "anchor", icon: Anchor },
  { name: "aperture", icon: Aperture },
  { name: "archive", icon: Archive },
  { name: "arrow-down", icon: ArrowDown },
  { name: "arrow-down-left", icon: ArrowDownLeft },
  { name: "arrow-down-right", icon: ArrowDownRight },
  { name: "arrow-left", icon: ArrowLeftIcon },
  { name: "arrow-right", icon: ArrowRightIcon },
  { name: "arrow-up", icon: ArrowUp },
  { name: "arrow-up-left", icon: ArrowUpLeft },
  { name: "arrow-up-right", icon: ArrowUpRight },
];
