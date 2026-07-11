import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { ACCENT } from "../webDesign";

export function StepNav({ onBack, onNext, accent }: { onBack?: () => void; onNext?: () => void; accent: string }) {
  return (
    <div className="mt-10 flex items-center justify-between gap-4">
      {onBack
        ? <button type="button" onClick={onBack}
          className="flex items-center gap-2 text-white/40 hover:text-white/70 transition-colors text-sm">
          <FontAwesomeIcon icon={faArrowLeft} className="text-xs" /> Back
        </button>
        : <div />}
      {onNext && (
        <button type="button" onClick={onNext}
          className="flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:opacity-90 hover:scale-[1.01]"
          style={{ background: accent, boxShadow: `0 0 24px ${accent}44` }}>
          Continue <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
        </button>
      )}
    </div>
  );
}
