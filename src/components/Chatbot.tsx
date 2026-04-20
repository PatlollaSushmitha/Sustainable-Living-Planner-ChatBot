import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect, useCallback } from "react";
import { useEcoStore } from "@/hooks/use-eco-store";

type Msg = { role: "user" | "assistant"; content: string; buttons?: { label: string; value: string }[] };

const ECO_QUESTIONS: { q: string; options: { label: string; value: string }[] }[] = [
  {
    q: "Hi there! 🌱 I'd love to create a personalized eco plan for you. First — are you a student or working professional?",
    options: [
      { label: "🎓 Student", value: "student" },
      { label: "💼 Professional", value: "professional" },
    ],
  },
  {
    q: "Do you use plastic items daily (bags, bottles, straws)?",
    options: [
      { label: "Yes, often", value: "yes_plastic" },
      { label: "Sometimes", value: "some_plastic" },
      { label: "Rarely / Never", value: "no_plastic" },
    ],
  },
  {
    q: "How do you usually travel? 🚗",
    options: [
      { label: "🚗 Car", value: "car" },
      { label: "🚍 Public Transport", value: "public" },
      { label: "🚲 Bike / Walk", value: "bike" },
    ],
  },
  {
    q: "Do you actively try to save electricity at home? 💡",
    options: [
      { label: "Yes", value: "save_elec" },
      { label: "Not really", value: "no_elec" },
    ],
  },
];

function generatePlan(answers: string[]) {
  const tips: string[] = [];
  tips.push("🌱 **Your Personalized Eco Plan:**\n");
  if (answers[1] === "yes_plastic" || answers[1] === "some_plastic") {
    tips.push("🛍️ Switch to reusable bags & bottles — cuts 500+ plastic items/year");
    tips.push("🥤 Say no to plastic straws — try bamboo or metal alternatives");
  }
  if (answers[2] === "car") {
    tips.push("🚍 Try public transport 2x/week — saves ~1 ton CO₂/year");
    tips.push("🚲 Walk or bike for trips under 2km");
  }
  if (answers[3] === "no_elec") {
    tips.push("💡 Switch to LED bulbs — uses 75% less energy");
    tips.push("🔌 Unplug chargers & devices when not in use");
  }
  if (answers[0] === "student") {
    tips.push("📚 Use digital notes instead of paper when possible");
    tips.push("🍱 Carry a reusable lunch box & water bottle to campus");
  } else {
    tips.push("☕ Bring your own mug to work — skip disposable cups");
    tips.push("🏠 Set up a home composting system for kitchen waste");
  }
  tips.push("\n🌍 *You're already making a difference by planning! Keep going!*");
  return tips.join("\n\n");
}

// Topic data — each topic supports multiple intents
type Intent = "thought" | "tips" | "explanation" | "steps" | "yesno" | "importance";

const TOPIC_DATA: Record<string, {
  keywords: string[];
  thought: string;
  tips: string[];
  explanation: string;
  steps: string[];
}> = {
  water: {
    keywords: ["water", "tap", "shower", "leak"],
    thought: "Every drop saved today secures tomorrow's tomorrow.",
    tips: ["Fix leaking taps", "Turn off tap while brushing", "Use a bucket instead of a shower", "Water plants in the morning", "Reuse cooking water for plants"],
    explanation: "Saving water reduces strain on freshwater sources and the energy used to treat and pump it. Simple habits at home — fixing leaks, shorter showers, and reusing greywater — can cut household water use by 30% or more.",
    steps: ["Check all taps and pipes for leaks", "Install low-flow showerheads and aerators", "Limit showers to 5 minutes", "Collect rainwater for plants", "Reuse rinse water where possible"],
  },
  plastic: {
    keywords: ["plastic", "bag", "bottle", "straw", "packaging"],
    thought: "Refusing one plastic item a day prevents hundreds from reaching the ocean.",
    tips: ["Carry a reusable bag and bottle", "Avoid single-use straws and cutlery", "Choose products with minimal packaging", "Use beeswax wraps instead of cling film", "Buy in bulk to reduce wrappers"],
    explanation: "Plastic takes hundreds of years to break down and pollutes oceans, soil, and even our food. Reducing plastic use protects wildlife, lowers fossil fuel demand, and cuts microplastic exposure.",
    steps: ["Audit your daily plastic use for one week", "Replace top 3 single-use items with reusables", "Switch to bar soap and shampoo", "Refuse plastic bags at checkout", "Recycle what you can't avoid"],
  },
  energy: {
    keywords: ["energy", "electric", "electricity", "power", "bulb", "light"],
    thought: "Unplugging idle devices is the easiest way to power down your carbon footprint.",
    tips: ["Switch to LED bulbs", "Unplug devices when not in use", "Use natural daylight when possible", "Air-dry clothes instead of using a dryer", "Set AC to 24°C or higher"],
    explanation: "Most home electricity comes from fossil fuels, so cutting usage directly reduces CO₂ emissions. LEDs, smart thermostats, and unplugging 'phantom loads' can lower electricity bills by 20-30%.",
    steps: ["Replace all bulbs with LEDs", "Use a power strip to cut phantom load", "Wash clothes in cold water", "Air-dry whenever possible", "Service your AC and fridge yearly"],
  },
  transport: {
    keywords: ["transport", "travel", "car", "bike", "commute", "fuel"],
    thought: "Choosing your feet, a bike, or a bus over a car is a vote for cleaner air.",
    tips: ["Walk or bike for short trips", "Use public transport when possible", "Carpool with colleagues", "Combine errands into one trip", "Maintain proper tyre pressure"],
    explanation: "Transport is one of the largest sources of CO₂ emissions. Switching even 2 car trips a week to walking, cycling, or transit can save hundreds of kg of CO₂ per year.",
    steps: ["Map trips under 2 km — walk or bike them", "Try public transit twice a week", "Set up a carpool with neighbours", "Service your vehicle for fuel efficiency", "Consider an EV or hybrid for your next car"],
  },
  food: {
    keywords: ["food", "eat", "meal", "diet", "vegetable", "compost"],
    thought: "A plant-rich plate is one of the most powerful climate actions you take daily.",
    tips: ["Eat more plant-based meals", "Buy local and seasonal produce", "Plan meals to reduce waste", "Compost kitchen scraps", "Avoid over-packaged foods"],
    explanation: "Food production accounts for ~25% of global emissions. Plant-based meals, local sourcing, and reducing food waste shrink your foodprint significantly.",
    steps: ["Plan a weekly meal list before shopping", "Add 2 plant-based dinners per week", "Store produce properly to extend life", "Start a small compost bin", "Use leftovers creatively"],
  },
  waste: {
    keywords: ["waste", "garbage", "recycle", "compost", "trash"],
    thought: "Waste is just a resource in the wrong place — sort it, and it becomes useful again.",
    tips: ["Separate dry, wet, and hazardous waste", "Compost food scraps", "Recycle paper, glass, and metals", "Repair before replacing", "Donate items you no longer use"],
    explanation: "Most household waste can be composted, recycled, or reused. Proper segregation keeps materials in circulation and out of landfills, where they release methane.",
    steps: ["Set up 3 bins: dry, wet, hazardous", "Start composting wet waste", "Take recyclables to a local centre weekly", "Repair items before discarding", "Buy second-hand when possible"],
  },
  pollution: {
    keywords: ["pollution", "air", "smog", "emission"],
    thought: "Cleaner choices today mean cleaner air for everyone tomorrow.",
    tips: ["Walk, bike, or use public transport", "Reduce home energy use", "Plant trees and indoor plants", "Avoid burning waste", "Support clean-energy policies"],
    explanation: "Air pollution comes mainly from vehicles, industry, and burning waste. Cutting energy use, choosing clean transport, and planting greenery all help reduce harmful emissions.",
    steps: ["Reduce car trips this week", "Lower home electricity use", "Plant or adopt one tree", "Never burn household waste", "Support local clean-air initiatives"],
  },
};

const GENERAL_THOUGHTS = [
  "Small daily eco-friendly actions create a big impact on the planet.",
  "Sustainability is not perfection — it's consistent, mindful choices.",
  "The greenest product is the one you already own.",
  "Refuse, reduce, reuse, recycle — in that order.",
  "Living simply allows others to simply live.",
];

const OFF_TOPIC = "Sorry, I can only answer questions about sustainable living.";
const UNSURE = "I'm not sure, but I can help with sustainable living tips.";

const SUSTAINABILITY_KEYWORDS = [
  "sustain", "eco", "green", "environment", "climate", "carbon", "planet", "earth", "nature",
  "water", "energy", "electric", "power", "plastic", "waste", "recycle", "compost", "pollution",
  "transport", "travel", "car", "bike", "food", "diet", "habit", "lifestyle", "save", "reduce",
  "reuse", "tree", "plant", "solar", "renewable", "organic",
];

function detectIntent(input: string): Intent {
  const t = input.toLowerCase().trim();
  // Yes/No questions
  if (/^(is|are|should|can|do|does|will|was|were|has|have|need)\b/.test(t) || /\bnecessary\b|\bneeded\b|\bworth\s+it\b/.test(t)) {
    return "yesno";
  }
  // Importance / why
  if (/\bimportance\b|\bimportant\b|\bwhy\b|\bbenefit|\badvantage|\bmatter/.test(t)) return "importance";
  if (/\bone\s+thought|a\s+thought|single\s+thought|quote|motivat/.test(t)) return "thought";
  if (/\bstep|how\s+to|guide|process|procedure/.test(t)) return "steps";
  if (/\bexplain|explanation|what\s+is|describe|detail/.test(t)) return "explanation";
  if (/\btip|tips|suggest|advice|idea|ways|methods/.test(t)) return "tips";
  return "tips";
}

function detectTopic(input: string): string | null {
  const t = input.toLowerCase();
  for (const [topic, data] of Object.entries(TOPIC_DATA)) {
    if (data.keywords.some((k) => t.includes(k))) return topic;
  }
  return null;
}

function isOnTopic(input: string): boolean {
  const t = input.toLowerCase();
  return SUSTAINABILITY_KEYWORDS.some((k) => t.includes(k)) || detectTopic(input) !== null;
}

const YESNO_REASONS: Record<string, string> = {
  water: "saving water is necessary because freshwater resources are limited and essential for all life.",
  plastic: "reducing plastic is necessary because it pollutes oceans, harms wildlife, and takes centuries to break down.",
  energy: "saving energy is necessary because it cuts emissions, conserves natural resources, and lowers your bills.",
  transport: "choosing greener transport is necessary because vehicle emissions are a major cause of air pollution and climate change.",
  food: "sustainable food choices are necessary because food production drives a quarter of global emissions.",
  waste: "managing waste responsibly is necessary because landfills release methane and pollute soil and water.",
  pollution: "reducing pollution is necessary because clean air and water are vital for human and ecosystem health.",
};

const GENERAL_IMPORTANCE = "Sustainable living is important because it protects natural resources, reduces pollution, and slows climate change. It ensures a healthier planet and a better future for the next generations. Small daily choices — saving water, energy, and reducing waste — add up to a major positive impact.";

function getSmartResponse(input: string): string {
  const intent = detectIntent(input);

  if (intent === "thought") {
    const topic = detectTopic(input);
    if (topic) return TOPIC_DATA[topic].thought;
    if (isOnTopic(input) || /\bthought|quote|motivat/.test(input.toLowerCase())) {
      return GENERAL_THOUGHTS[Math.floor(Math.random() * GENERAL_THOUGHTS.length)];
    }
    return OFF_TOPIC;
  }

  if (!isOnTopic(input)) return OFF_TOPIC;

  const topic = detectTopic(input);

  if (intent === "yesno") {
    const reason = topic ? YESNO_REASONS[topic] : "sustainable living protects our planet and secures a better future for everyone.";
    return `Yes, ${reason}`;
  }

  if (intent === "importance") {
    if (topic) {
      const d = TOPIC_DATA[topic];
      return `${d.explanation} That's why it matters for both people and the planet.`;
    }
    return GENERAL_IMPORTANCE;
  }

  if (!topic) return UNSURE;

  const data = TOPIC_DATA[topic];
  switch (intent) {
    case "tips":
      return data.tips.map((t) => `• ${t}`).join("\n");
    case "steps":
      return data.steps.map((s, i) => `${i + 1}. ${s}`).join("\n");
    case "explanation":
      return data.explanation;
  }
  return UNSURE;
}

interface ChatbotProps {
  open: boolean;
  onToggle: () => void;
}

export default function Chatbot({ open, onToggle }: ChatbotProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [phase, setPhase] = useState<"onboard" | "plan" | "track" | "chat">("onboard");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { completeHabit, answerQuestion, followTip, resetAll } = useEcoStore();

  const scrollToBottom = useCallback(() => {
    setTimeout(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }), 50);
  }, []);

  useEffect(scrollToBottom, [messages, typing, scrollToBottom]);

  useEffect(() => {
    if (open && messages.length === 0) {
      setTyping(true);
      setTimeout(() => {
        setMessages([{
          role: "assistant",
          content: ECO_QUESTIONS[0].q,
          buttons: ECO_QUESTIONS[0].options,
        }]);
        setTyping(false);
      }, 800);
    }
  }, [open, messages.length]);

  const addBotMessage = (content: string, buttons?: { label: string; value: string }[]) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content, buttons }]);
      setTyping(false);
    }, 600 + Math.random() * 400);
  };

  const handleOption = (value: string, label: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    setMessages((prev) => [...prev, { role: "user", content: label }]);

    if (phase === "onboard") {
      const positiveCategoryMap: Record<string, "water" | "plastic" | "energy" | "transport" | "general"> = {
        no_plastic: "plastic",
        some_plastic: "plastic",
        public: "transport",
        bike: "transport",
        save_elec: "energy",
      };
      const category = positiveCategoryMap[value] ?? "general";
      answerQuestion(category);
      if (category !== "general") followTip(category);

      const nextStep = step + 1;
      if (nextStep < ECO_QUESTIONS.length) {
        setStep(nextStep);
        addBotMessage(ECO_QUESTIONS[nextStep].q, ECO_QUESTIONS[nextStep].options);
      } else {
        setPhase("plan");
        followTip("water");
        addBotMessage(generatePlan(newAnswers));
        setTimeout(() => {
          addBotMessage("Did you follow any eco habits today? ♻️", [
            { label: "✅ YES", value: "yes_track" },
            { label: "❌ NO", value: "no_track" },
          ]);
        }, 2000);
      }
    } else if (phase === "plan" || phase === "track") {
      setPhase("chat");
      if (value === "yes_track") {
        completeHabit("general");
        addBotMessage("Great job! 🌱🎉 You're making the planet proud! Your progress has been updated.\n\nFeel free to ask me anything about sustainability! 💚");
      } else {
        addBotMessage("No worries — tomorrow is a new chance! 💪🌍 Every small step matters.\n\nAsk me anything about eco-friendly living! 💚");
      }
    }
  };

  const categoryFromText = (text: string): "water" | "plastic" | "energy" | "transport" | "general" => {
    const t = text.toLowerCase();
    if (t.includes("water")) return "water";
    if (t.includes("plastic")) return "plastic";
    if (t.includes("electric") || t.includes("energy") || t.includes("power")) return "energy";
    if (t.includes("transport") || t.includes("travel") || t.includes("car") || t.includes("bike")) return "transport";
    return "general";
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setPhase("chat");
    const cat = categoryFromText(userMsg);
    answerQuestion(cat);
    if (cat !== "general") followTip(cat);
    addBotMessage(getSmartResponse(userMsg));
  };

  const handleReset = () => {
    resetAll();
    setMessages([]);
    setPhase("onboard");
    setStep(0);
    setAnswers([]);
    setInput("");
    setTyping(false);
    // Re-trigger onboarding
    setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setMessages([{
          role: "assistant",
          content: ECO_QUESTIONS[0].q,
          buttons: ECO_QUESTIONS[0].options,
        }]);
        setTyping(false);
      }, 800);
    }, 100);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.aside
          className="fixed top-0 right-0 z-50 h-full flex flex-col border-l border-border/20"
          style={{
            width: "min(400px, 90vw)",
            background: "hsl(150 20% 7% / 0.95)",
            backdropFilter: "blur(32px)",
            boxShadow: "-8px 0 60px hsl(0 0% 0% / 0.5), 0 0 80px hsl(145 65% 42% / 0.06)",
          }}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 px-5 py-4 border-b border-border/20 shrink-0"
            style={{ background: "linear-gradient(135deg, hsl(145 65% 42% / 0.08), hsl(80 60% 50% / 0.04))" }}
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg ring-2 ring-primary/30">
              🌱
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-heading font-semibold text-sm">Eco Assistant</p>
              <p className="text-xs text-primary flex items-center gap-1">
                <span className="glow-dot" /> Online
              </p>
            </div>
            <motion.button
              onClick={handleReset}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium border border-destructive/30 text-destructive/80 hover:bg-destructive/10 hover:text-destructive transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Reset all progress and start over"
            >
              🔄 Reset
            </motion.button>
            <motion.button
              onClick={onToggle}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              ✕
            </motion.button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {msg.role === "assistant" && (
                  <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0 mt-1">
                    🌿
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div
                    className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "rounded-br-md text-primary-foreground"
                        : "bg-secondary text-secondary-foreground rounded-bl-md"
                    }`}
                    style={
                      msg.role === "user"
                        ? { background: "linear-gradient(135deg, hsl(145 65% 42%), hsl(145 65% 36%))" }
                        : undefined
                    }
                  >
                    {msg.content}
                  </div>
                  {msg.buttons && (
                    <div className="flex flex-wrap gap-2">
                      {msg.buttons.map((btn) => (
                        <motion.button
                          key={btn.value}
                          onClick={() => handleOption(btn.value, btn.label)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium border border-primary/40 text-primary hover:bg-primary/15 transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {btn.label}
                        </motion.button>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === "user" && (
                  <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center text-xs shrink-0 mt-1">
                    👤
                  </div>
                )}
              </motion.div>
            ))}
            {typing && (
              <motion.div
                className="flex gap-2 justify-start"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs shrink-0">
                  🌿
                </div>
                <div className="bg-secondary text-secondary-foreground px-4 py-3 rounded-2xl rounded-bl-md text-sm flex items-center gap-1.5">
                  <span className="animate-bounce text-primary" style={{ animationDelay: "0ms" }}>●</span>
                  <span className="animate-bounce text-primary" style={{ animationDelay: "150ms" }}>●</span>
                  <span className="animate-bounce text-primary" style={{ animationDelay: "300ms" }}>●</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Quick replies */}
          {phase === "chat" && (
            <div className="px-4 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
              {["How to save water?", "Reduce plastic", "Save electricity", "Sustainable food"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput("");
                    setMessages((prev) => [...prev, { role: "user", content: q }]);
                    const cat = categoryFromText(q);
                    answerQuestion(cat);
                    if (cat !== "general") followTip(cat);
                    addBotMessage(getSmartResponse(q));
                  }}
                  className="px-3 py-1 rounded-full text-[11px] whitespace-nowrap border border-border/30 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors shrink-0"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border/20 shrink-0">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about sustainability..."
                className="flex-1 h-10 px-4 rounded-full bg-muted text-foreground text-sm placeholder:text-muted-foreground outline-none focus:ring-1 focus:ring-primary/50"
              />
              <motion.button
                type="submit"
                className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                ↑
              </motion.button>
            </form>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
