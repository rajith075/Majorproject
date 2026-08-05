import {
  LayoutDashboard,
  HeartPulse,
  Users,
  BrainCircuit,
  Pill,
  FileText,
  Bell,
  Settings,
} from "lucide-react";

export const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Health",
    href: "/health",
    icon: HeartPulse,
  },
    {
    title: "Medication",
    href: "/medication",
    icon: Pill,
  },
  {
    title: "Patients",
    href: "/patients",
    icon: Users,
  },
  {
    title: "AI Insights",
    href: "/ai",
    icon: BrainCircuit,
  },

  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: Bell,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];