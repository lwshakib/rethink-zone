/**
 * This module defines shared constants and static assets used across the canvas feature.
 */

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
} from "lucide-react"; // Import vector icons from Lucide for the Icon library feature.
import { IconItem } from "../types"; // Type definition for an icon entry in the library.

// --- Navigation & View Constants ---

/** Minimum allowable zoom level (10%) */
export const MIN_ZOOM = 0.1;
/** Maximum allowable zoom level (500%) */
export const MAX_ZOOM = 5;
/** Default increment/decrement for zoom operations */
export const ZOOM_STEP = 0.1;

// --- Icon Library Assets ---

/**
 * A curated list of Lucide icons available to the user in the 'Icons' sidebar.
 * Each entry maps a human-readable name to its corresponding React component.
 */
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
