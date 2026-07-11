export function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: "amber" }) {
  return (
    <div className="flex items-center justify-between text-xs">
      <span className="text-white/30">{label}</span>
      <span className={`font-medium max-w-[55%] text-right truncate ${
        accent === "amber" ? "text-amber-400/70" : "text-white/60"
      }`}>{value}</span>
    </div>
  );
}