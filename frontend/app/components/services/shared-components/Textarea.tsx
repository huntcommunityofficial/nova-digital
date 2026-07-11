export function Textarea({ value, onChange, placeholder, rows = 4, invalid, accent }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  rows?: number; invalid?: boolean; accent: string;
}) {
  const isErr = invalid && value.trim() === "";
  return (
    <>
      <textarea value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} rows={rows}
        className={`w-full bg-[#13161d] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25
          focus:outline-none focus:ring-1 transition-all resize-none
          ${isErr
            ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
            : "border-white/[0.07] focus:border-[#2EEBFF]/50 focus:ring-[#2EEBFF]/30"}`} />
      {isErr && <p className="text-red-500/70 text-xs mt-1">This field is required</p>}
    </>
  );
}