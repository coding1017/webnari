import { Badge } from "@/types/product";
import { cn } from "@/lib/utils";

const BADGE_STYLES: Record<string, string> = {
  new: "bg-[image:var(--gradient)] text-ww-white",
  sold: "bg-[rgba(20,16,36,0.85)] text-ww-pink border border-ww-pink",
  oneofone: "bg-[linear-gradient(135deg,#39FF14,#00F0FF)] text-[#0A0514] font-black",
  collection: "bg-[linear-gradient(135deg,#A855F7,#FF2D9B)] text-ww-white",
};

const BADGE_LABELS: Record<string, string | ((count?: number) => string)> = {
  new: "New Drop",
  sold: "Sold Out",
  oneofone: "1 of 1",
  collection: (count?: number) => (count ? `${count} Styles` : "Collection"),
};

interface BadgePillProps {
  badge: Badge;
  variantCount?: number;
}

export function BadgePill({ badge, variantCount }: BadgePillProps) {
  if (!badge) return null;

  const style = BADGE_STYLES[badge] || "";
  const labelFn = BADGE_LABELS[badge];
  const label = typeof labelFn === "function" ? labelFn(variantCount) : labelFn;

  return (
    <span
      className={cn(
        "absolute top-3 left-3 px-2.5 py-1 font-head text-[10px] font-extrabold tracking-[0.12em] uppercase rounded-md z-10",
        style
      )}
    >
      {label}
    </span>
  );
}
