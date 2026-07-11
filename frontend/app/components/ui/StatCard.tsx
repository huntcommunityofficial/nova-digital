"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useCounter from "@/app/hooks/useCounter";
import { useInView } from "@/app/hooks/useInView";

export default function StatCard({ icon, end, label }: any) {
  const { ref, isInView } = useInView({ threshold: 0.4 });
  const value = useCounter(0, end, isInView, 1200);

  return (
    <div className="flex items-center gap-6 bg-gray-800/30 p-5 rounded-2xl border border-white/5 hover:bg-gray-800/50 transition">
      
      {/* Icon */}
      <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-blue-600/20 rounded-xl">
        <FontAwesomeIcon icon={icon} className="text-3xl text-white" />
      </div>

      {/* Text */}
      <div ref={ref}>
        <div className="text-3xl font-bold text-white leading-none">
          {value}+
        </div>
        <div className="text-lg text-gray-400 mt-1">{label}</div>
      </div>

    </div>
  );
}
