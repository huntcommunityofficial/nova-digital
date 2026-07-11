export function Input({ value, onChange, placeholder, type = "text", invalid, emailInvalid, accent, phoneInvalid }: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  type?: string; invalid?: boolean; emailInvalid?: boolean; accent: string; phoneInvalid?: boolean;
}) {
  const isEmpty = invalid && value.trim() === "";
  const isBadEmail = emailInvalid && !isEmpty;
  const isBadPhone = phoneInvalid;
  const isErr = isEmpty || isBadEmail || !!phoneInvalid;
  return (
    <>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full bg-[#13161d] border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25
          focus:outline-none focus:ring-1 transition-all
          ${isErr
            ? "border-red-500/40 focus:border-red-500/60 focus:ring-red-500/20"
            : "border-white/[0.07] focus:border-[#2EEBFF]/50 focus:ring-[#2EEBFF]/30"}`} />
      {isEmpty && <p className="text-red-500/70 text-xs mt-1">This field is required</p>}
      {isBadEmail && <p className="text-red-500/70 text-xs mt-1">Please enter a valid email address</p>}
      {isBadPhone && <p className="text-red-500/70 text-xs mt-1">Please enter a valid phone number.</p>}
    </>
  );
}