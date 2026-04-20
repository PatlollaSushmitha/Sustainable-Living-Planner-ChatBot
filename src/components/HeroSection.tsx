import { motion } from "framer-motion";

export default function HeroSection({ onOpenChat }: { onOpenChat?: () => void }) {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-accent/5 blur-[100px]" />

      <div className="relative z-10 text-center max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-muted-foreground mb-8">
            <span className="glow-dot" />
            AI-Powered Sustainability
          </span>
        </motion.div>

        <motion.h1
          className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          Live <span className="gradient-text">Greener</span>,{" "}
          <br className="hidden sm:block" />
          Live Smarter 🌍
        </motion.h1>

        <motion.p
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          Your personal AI companion for an eco-friendly lifestyle. Get personalized
          plans, track your habits, and make a real impact on the planet.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.45 }}
        >
          <button
            onClick={onOpenChat}
            className="inline-flex items-center justify-center h-12 px-8 rounded-full bg-primary text-primary-foreground font-semibold hover:brightness-110 transition-all duration-300 animate-pulse-glow"
          >
            Get Started 🌱
          </button>
          <a
            href="#tips"
            className="inline-flex items-center justify-center h-12 px-8 rounded-full glass-card text-foreground font-semibold hover:border-primary/40 transition-all duration-300"
          >
            Explore Tips
          </a>
        </motion.div>
      </div>
    </section>
  );
}
