export function StepHeader({ step, total, title, sub, accent }: { step: number; total: number; title: string; sub: string, accent:string }) {
  return (
    <div>
      <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: accent }}>
        Step {step} of {total}
      </p>
      <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight">{title}</h1>
      <p className="text-white/40 mt-2 text-sm leading-relaxed max-w-xl">{sub}</p>
    </div>
  );
}