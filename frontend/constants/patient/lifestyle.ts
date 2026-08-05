import {
  PersonStanding,
  Accessibility,
  AccessibilityIcon,
  Bed,
  Brain,
  Smile,
  AlertTriangle,
  ShieldAlert,
} from "lucide-react";

export const MOBILITY_OPTIONS = [
  {
    title: "Independent",
    icon: PersonStanding,
    description: "Can walk without assistance",
  },
  {
    title: "Walking Stick",
    icon: AccessibilityIcon,
    description: "Requires walking stick",
  },
  {
    title: "Walker",
    icon: Accessibility,
    description: "Uses walker for support",
  },
  {
    title: "Wheelchair",
    icon: Accessibility,
    description: "Wheelchair dependent",
  },
  {
    title: "Bedridden",
    icon: Bed,
    description: "Unable to leave bed",
  },
];

export const MEMORY_OPTIONS = [
  {
    title: "Normal",
    icon: Brain,
    description: "Healthy memory",
  },
  {
    title: "Mild Forgetfulness",
    icon: Smile,
    description: "Occasional memory loss",
  },
  {
    title: "Mild Dementia",
    icon: AlertTriangle,
    description: "Requires monitoring",
  },
  {
    title: "Alzheimer's",
    icon: ShieldAlert,
    description: "Advanced memory impairment",
  },
];