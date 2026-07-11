export function Select({ value, onChange, options, placeholder, invalid, accent }: {
  value: string; onChange: (v: string) => void; options: string[];
  placeholder?: string; invalid?: boolean; accent: string;
}) {
  const isErr = invalid && value.trim() === "";
  return (
    <>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-[#13161d] border rounded-xl px-4 py-3 text-sm focus:outline-none
          focus:ring-1 transition-all appearance-none
          ${isErr
            ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
            : "border-white/[0.07] focus:border-[#2EEBFF]/50 focus:ring-[#2EEBFF]/30"}`}
        style={{ color: value ? "white" : "rgba(255,255,255,0.25)" }}>
        {placeholder && <option value="" disabled>{placeholder}</option>}
        {options.map((o) => <option key={o} value={o} className="bg-[#13161d]">{o}</option>)}
      </select>
      {isErr && <p className="text-red-500/70 text-xs mt-1">This field is required</p>}
    </>
  );
}