export function OptionPills({ options, value, onChange, accent, accent_dim, accent_glow }: {
  options: string[]; value: string; onChange: (v: string) => void; accent: string; accent_dim:string; accent_glow:string;
}) {
  return (
    <div className="flex flex-wrap gap-2 mt-1">
      {options.map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)}
          className={`px-4 py-2 rounded-xl text-sm border transition-all duration-200 ${
            value === o
              ? "border-[#2EEBFF] text-white"
              : "border-white/[0.07] text-white/40 hover:border-white/20 hover:text-white/60"
          }`}
          style={value === o
            ? { background: accent_dim, boxShadow: `0 0 12px ${accent_glow}` }
            : { background: "rgba(255,255,255,0.02)" }}>
          {o}
        </button>
      ))}
    </div>
  );
}