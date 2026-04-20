import { motion } from "framer-motion";
import { useMemo } from "react";

const LEAF_PATHS = [
  "M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.5-3 2-7 0-10S15.5 2 12 2z",
  "M8 2c-3 4-3 8 0 12s6 8 0 12c6-2 10-6 10-12S14 0 8 2z",
];

export default function FloatingLeaves() {
  const leaves = useMemo(() =>
    Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 10,
      size: 14 + Math.random() * 18,
      opacity: 0.06 + Math.random() * 0.08,
      path: LEAF_PATHS[i % 2],
    })), []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {leaves.map((leaf) => (
        <motion.div
          key={leaf.id}
          className="absolute"
          style={{ left: `${leaf.x}%`, top: "-5%" }}
          animate={{
            y: ["0vh", "110vh"],
            x: [0, Math.sin(leaf.id) * 60],
            rotate: [0, 360],
          }}
          transition={{
            duration: leaf.duration,
            delay: leaf.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <svg
            width={leaf.size}
            height={leaf.size}
            viewBox="0 0 24 24"
            fill="none"
            className="text-primary"
          >
            <path d={leaf.path} fill="currentColor" opacity={leaf.opacity} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}
