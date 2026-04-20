import { motion } from "framer-motion";
import { useState } from "react";

const TIPS = [
  {
    icon: "💧",
    title: "Save Water",
    color: "from-blue-500/20 to-cyan-500/10",
    tips: [
      "Take shorter showers (5 min saves ~40L)",
      "Fix leaking faucets — saves 11,000L/year",
      "Use a bowl to wash vegetables, reuse for plants",
      "Install low-flow showerheads",
    ],
  },
  {
    icon: "♻️",
    title: "Reduce Plastic",
    color: "from-primary/20 to-emerald-500/10",
    tips: [
      "Carry a reusable water bottle everywhere",
      "Use cloth bags instead of plastic bags",
      "Say no to plastic straws — use metal or bamboo",
      "Buy products with minimal packaging",
    ],
  },
  {
    icon: "💡",
    title: "Save Electricity",
    color: "from-yellow-500/20 to-amber-500/10",
    tips: [
      "Switch to LED bulbs — use 75% less energy",
      "Unplug devices when not in use",
      "Use natural light during the day",
      "Set AC to 24°C instead of 18°C",
    ],
  },
  {
    icon: "🌍",
    title: "Eco Lifestyle",
    color: "from-accent/20 to-lime-500/10",
    tips: [
      "Walk or bike for short distances",
      "Eat more plant-based meals",
      "Compost kitchen waste",
      "Support local & sustainable brands",
    ],
  },
];

export default function SustainabilityTips() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <section id="tips" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Sustainability <span className="gradient-text">Tips</span> 🌿
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simple changes that make a big difference. Start with one, build from there.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {TIPS.map((category, i) => (
            <motion.div
              key={category.title}
              className="glass-card-hover p-6 cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              onClick={() => setExpanded(expanded === i ? null : i)}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl`}>
                  {category.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-semibold">{category.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {category.tips.length} actionable tips
                  </p>
                </div>
                <motion.span
                  animate={{ rotate: expanded === i ? 180 : 0 }}
                  className="text-muted-foreground text-xl"
                >
                  ▾
                </motion.span>
              </div>

              <motion.div
                initial={false}
                animate={{ height: expanded === i ? "auto" : 0, opacity: expanded === i ? 1 : 0 }}
                className="overflow-hidden"
                transition={{ duration: 0.3 }}
              >
                <ul className="space-y-3 pt-2 border-t border-border/30">
                  {category.tips.map((tip) => (
                    <li key={tip} className="flex items-start gap-3 text-sm text-secondary-foreground">
                      <span className="mt-1 glow-dot shrink-0" />
                      {tip}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
