import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Navbar({ onChatToggle, chatOpen }: { onChatToggle: () => void; chatOpen: boolean }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4 will-change-transform"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div
        className={`max-w-6xl mx-auto glass-card px-6 py-3 flex items-center justify-between transition-all duration-300 ${
          scrolled ? "shadow-lg shadow-primary/10 border-primary/20" : ""
        }`}
        style={scrolled ? { backdropFilter: "blur(28px)" } : undefined}
      >
        <a href="#top" className="font-heading font-bold text-lg flex items-center gap-2">
          🌿 <span className="gradient-text">EcoPlanner</span>
        </a>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="#tips" className="hidden sm:inline hover:text-foreground transition-colors">Tips</a>
          <a href="#dashboard" className="hidden sm:inline hover:text-foreground transition-colors">Dashboard</a>
          <button onClick={onChatToggle} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
            {chatOpen ? "✕ Close" : "🤖 Chat"}
          </button>
        </div>
      </div>
    </motion.nav>
  );
}
