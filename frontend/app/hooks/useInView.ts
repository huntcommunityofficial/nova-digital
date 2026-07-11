import { useEffect, useRef, useState } from "react";

export function useInView(options = { threshold: 0.3 }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isInView, setInView] = useState(false);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current!); // stop observing after first trigger
        }
      },
      options
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref, options]);

  return { ref, isInView };
}
