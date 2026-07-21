import { useEffect, useState } from "react";

/**
 * Bridges an external `open` boolean with a mount lifecycle that outlives the
 * closing animation. Return `mounted` to decide whether to render, and
 * `state` ("open" | "closed") to drive `data-state` CSS animations.
 */
export function useAnimatedOpen(open: boolean, duration = 200) {
  const [mounted, setMounted] = useState(open);
  const [state, setState] = useState<"open" | "closed">(open ? "open" : "closed");

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Let the DOM commit the "closed" state before flipping to "open" so
      // the enter animation actually plays.
      const raf = requestAnimationFrame(() => setState("open"));
      return () => cancelAnimationFrame(raf);
    }
    if (mounted) {
      setState("closed");
      const t = setTimeout(() => setMounted(false), duration);
      return () => clearTimeout(t);
    }
  }, [open, mounted, duration]);

  return { mounted, state } as const;
}
