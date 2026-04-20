import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import { getScore, type EcoState } from "@/hooks/use-eco-store";

const STORAGE_KEY = "eco-planner-state";

function AnimatedNumber({ value, duration = 1.2 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / (duration * 60);
    const id = setInterval(() => {
      start += step;
      if (start >= value) { setDisplay(value); clearInterval(id); }
      else setDisplay(Math.round(start));
    }, 1000 / 60);
    return () => clearInterval(id);
  }, [inView, value, duration]);

  return <span ref={ref}>{display}</span>;
}

const BADGES = [
  { id: "eco_beginner", emoji: "🌱", name: "Eco Beginner", desc: "Started your journey", requirement: "Chat with the eco assistant" },
  { id: "water_saver", emoji: "💧", name: "Water Saver", desc: "Conserves water daily", requirement: "Pick 2+ water-saving actions" },
  { id: "plastic_free", emoji: "♻️", name: "Plastic Free", desc: "Cuts plastic usage", requirement: "Pick 2+ plastic-free actions" },
  { id: "energy_protector", emoji: "⚡", name: "Energy Protector", desc: "Saves electricity", requirement: "Pick 2+ energy-saving actions" },
  { id: "green_champion", emoji: "🏆", name: "Green Champion", desc: "Top sustainability hero", requirement: "Reach a score of 60+" },
];

export default function Dashboard() {
  const [state, setState] = useState<EcoState | null>(null);

  useEffect(() => {
    const empty: EcoState = {
      habitsCompleted: 0, chatQuestionsAnswered: 0, tipsFollowed: 0,
      dailyStreak: 0, lastActiveDate: "",
      waterActions: 0, plasticActions: 0, energyActions: 0, transportActions: 0,
      badges: {},
    };
    const load = () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setState({ ...empty, ...JSON.parse(raw) });
        else setState(empty);
      } catch {
        setState(empty);
      }
    };
    load();
    window.addEventListener("storage", load);
    const interval = setInterval(load, 1000);
    return () => { window.removeEventListener("storage", load); clearInterval(interval); };
  }, []);

  if (!state) return null;

  const { score, waterSaved, energySaved, co2Reduced } = getScore(state);

  const STATS = [
    { label: "Sustainability Score", value: score, max: 100, icon: "🌱", unit: "/100", color: "bg-primary" },
    { label: "Water Saved", value: Math.round(waterSaved), max: 500, icon: "💧", unit: "L", color: "bg-blue-500" },
    { label: "Energy Saved", value: Math.round(energySaved), max: 100, icon: "💡", unit: "kWh", color: "bg-yellow-500" },
    { label: "CO₂ Reduced", value: Math.round(co2Reduced), max: 50, icon: "🌍", unit: "kg", color: "bg-accent" },
  ];

  const earnedCount = BADGES.filter(b => state.badges[b.id]).length;

  return (
    <section id="dashboard" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">
            Your <span className="gradient-text">Progress</span> 📈
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Track your real eco impact. Use the chatbot to answer questions, complete habits, and watch your score grow!
          </p>
          <div className="flex justify-center gap-6 mt-4 text-sm text-muted-foreground">
            <span>🔥 {state.dailyStreak}-day streak</span>
            <span>✅ {state.habitsCompleted} habits</span>
            <span>🏅 {earnedCount}/{BADGES.length} badges</span>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              className="glass-card-hover p-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
              <p className="font-heading text-2xl font-bold mb-3">
                <AnimatedNumber value={stat.value} />
                <span className="text-sm text-muted-foreground font-normal">{stat.unit}</span>
              </p>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${stat.color}`}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(stat.value / stat.max) * 100}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.2, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-right">
                {Math.round((stat.value / stat.max) * 100)}%
              </p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h3 className="font-heading text-xl font-semibold mb-6">Reward Badges 🏅</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {BADGES.map((badge) => {
              const earned = !!state.badges[badge.id];
              return (
                <motion.div
                  key={badge.id}
                  className={`relative flex flex-col items-center gap-2 p-5 rounded-2xl text-center transition-all duration-300 ${
                    earned
                      ? "glass-card-hover border-primary/30"
                      : "border border-border/20 opacity-50 grayscale"
                  }`}
                  whileHover={earned ? { scale: 1.08, boxShadow: "0 0 24px hsl(145 65% 42% / 0.3)" } : {}}
                >
                  <span className="text-4xl">{badge.emoji}</span>
                  <span className="text-sm font-semibold">{badge.name}</span>
                  <span className="text-[10px] text-muted-foreground leading-tight">{badge.desc}</span>
                  {earned && (
                    <span className="absolute -top-1 -right-1 text-xs bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center">✓</span>
                  )}
                  {!earned && (
                    <span className="text-[9px] text-muted-foreground mt-1 italic">{badge.requirement}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
