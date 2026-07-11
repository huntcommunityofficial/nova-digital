export function Field({ label, required, children, className = "" }: { label: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
        {label}{required && <span className="text-[#3A8CFF] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}