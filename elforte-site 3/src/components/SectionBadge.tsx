interface SectionBadgeProps {
  children: string;
  variant?: "default" | "light" | "red";
}

export default function SectionBadge({ children, variant = "default" }: SectionBadgeProps) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em]";

  const variants = {
    default: "border border-[#B8D4E8] bg-white/60 text-[#3D6A8A]",
    light: "border border-[#B8D4E8] bg-white/40 text-[#3D6A8A]",
    red: "border border-[#FF8A95]/50 bg-white/10 text-white/90",
  };

  return (
    <span className={`${base} ${variants[variant]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-60" />
      {children}
    </span>
  );
}
