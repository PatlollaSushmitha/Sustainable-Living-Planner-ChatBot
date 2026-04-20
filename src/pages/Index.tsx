import { useState } from "react";
import { motion } from "framer-motion";
import FloatingLeaves from "@/components/FloatingLeaves";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SustainabilityTips from "@/components/SustainabilityTips";
import Dashboard from "@/components/Dashboard";
import Chatbot from "@/components/Chatbot";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const handleGetStarted = () => {
    setChatOpen(true);
    setTimeout(() => {
      document.getElementById("dashboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 350);
  };

  return (
    <div id="top" className="relative min-h-screen overflow-x-hidden">
      <FloatingLeaves />
      <Navbar onChatToggle={() => setChatOpen((p) => !p)} chatOpen={chatOpen} />

      <div
        className="transition-all duration-500 ease-out pt-24"
        style={{ marginRight: chatOpen ? "min(400px, 90vw)" : 0 }}
      >
        <HeroSection onOpenChat={handleGetStarted} />
        <SustainabilityTips />
        <Dashboard />

        {/* Footer */}
        <footer className="py-12 px-4 text-center border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            🌍 AI Sustainable Living Planner — Making the world greener, one habit at a time.
          </p>
        </footer>
      </div>

      {/* Floating toggle button (visible when sidebar is closed) */}
      {!chatOpen && (
        <motion.button
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl shadow-lg"
          style={{ boxShadow: "0 0 30px hsl(145 65% 42% / 0.4)" }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setChatOpen(true)}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", damping: 20 }}
        >
          🤖
        </motion.button>
      )}

      <Chatbot open={chatOpen} onToggle={() => setChatOpen(false)} />
    </div>
  );
};

export default Index;
