import {
  BarChart3,
  Beef,
  Bug,
  Cog,
  Leaf,
  Milk,
  Plane,
  ShieldCheck,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import type { IconKey } from "@/lib/site-content";

const map: Record<IconKey, LucideIcon> = {
  sprout: Sprout,
  cow: Beef,
  milk: Milk,
  drone: Plane,
  leaf: Leaf,
  bee: Bug,
  shield: ShieldCheck,
  chart: BarChart3,
};

export function EixoIcon({ name, className }: { name: IconKey; className?: string }) {
  const Icon = map[name] ?? Sprout;
  return <Icon className={className} aria-hidden />;
}
