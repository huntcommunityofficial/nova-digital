import { useEffect, useState } from "react";

export default function useCounter(start: number, end: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(start);

  useEffect(() => {
    if (!active) return;

    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;

      const progress = Math.min((timestamp - startTime) / duration, 1);

      const current = Math.floor(start + (end - start) * progress);
      setValue(current);

      if (progress < 1) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [active, start, end, duration]);

  return value;
}
