// Softball-specific position data for the PositionShortcuts component
import { Target, Shield, Diamond, Circle, Zap } from "lucide-react";

export interface SoftballPosition {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  courseId: string;
  description: string;
  hasNewContent?: boolean;
}

export const softballPositions: SoftballPosition[] = [
  {
    id: "pitching",
    name: "Pitching",
    icon: Target,
    color: "#a855f7",
    courseId: "fastpitch-pitching-system",
    description: "Windmill, arsenal, velocity",
    hasNewContent: true,
  },
  {
    id: "catching",
    name: "Catching",
    icon: Shield,
    color: "#ec4899",
    courseId: "softball-fielding-system",
    description: "Framing, blocking, throws",
    hasNewContent: true,
  },
  {
    id: "infield",
    name: "Infield",
    icon: Diamond,
    color: "#f59e0b",
    courseId: "softball-fielding-system",
    description: "Transfers, double plays, range",
    hasNewContent: true,
  },
  {
    id: "outfield",
    name: "Outfield",
    icon: Circle,
    color: "#22c55e",
    courseId: "softball-fielding-system",
    description: "Routes, jumps, arm strength",
    hasNewContent: false,
  },
  {
    id: "hitting",
    name: "Hitting",
    icon: Zap,
    color: "#f97316",
    courseId: "softball-hitting-system",
    description: "Swing, slap, power",
    hasNewContent: true,
  },
];
