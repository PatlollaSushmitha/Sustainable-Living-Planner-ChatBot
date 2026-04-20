import { useState, useEffect, useCallback } from "react";

export interface EcoState {
  habitsCompleted: number;
  chatQuestionsAnswered: number;
  tipsFollowed: number;
  dailyStreak: number;
  lastActiveDate: string;
  // Category-specific action counters (drive distinct badges)
  waterActions: number;
  plasticActions: number;
  energyActions: number;
  transportActions: number;
  badges: Record<string, boolean>;
}

const DEFAULT_STATE: EcoState = {
  habitsCompleted: 0,
  chatQuestionsAnswered: 0,
  tipsFollowed: 0,
  dailyStreak: 0,
  lastActiveDate: "",
  waterActions: 0,
  plasticActions: 0,
  energyActions: 0,
  transportActions: 0,
  badges: {
    eco_beginner: false,
    water_saver: false,
    plastic_free: false,
    energy_protector: false,
    green_champion: false,
  },
};

const STORAGE_KEY = "eco-planner-state";

function loadState(): EcoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...DEFAULT_STATE, ...JSON.parse(raw) };
  } catch {}
  return { ...DEFAULT_STATE };
}

function saveState(state: EcoState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getScore(state: EcoState) {
  const score = Math.min(100, Math.round(
    state.habitsCompleted * 4 +
    state.chatQuestionsAnswered * 2 +
    state.tipsFollowed * 3 +
    state.dailyStreak * 5
  ));
  const waterSaved = Math.min(500, state.waterActions * 60 + state.habitsCompleted * 10);
  const energySaved = Math.min(100, state.energyActions * 12 + state.habitsCompleted * 2);
  const co2Reduced = Math.min(50, state.transportActions * 6 + state.habitsCompleted * 1.2 + state.dailyStreak * 1.5);
  return { score, waterSaved, energySaved, co2Reduced };
}

function computeBadges(state: EcoState): Record<string, boolean> {
  const { score } = getScore(state);
  return {
    // First interaction with the assistant
    eco_beginner: state.chatQuestionsAnswered >= 1 || state.habitsCompleted >= 1,
    // Water-specific actions
    water_saver: state.waterActions >= 2,
    // Plastic-specific actions
    plastic_free: state.plasticActions >= 2,
    // Energy-specific actions
    energy_protector: state.energyActions >= 2,
    // High overall score
    green_champion: score >= 60,
  };
}

type Category = "water" | "plastic" | "energy" | "transport" | "general";

export function useEcoStore() {
  const [state, setState] = useState<EcoState>(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const applyUpdate = useCallback((updater: (prev: EcoState) => EcoState) => {
    setState((prev) => {
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const streak =
        prev.lastActiveDate === today
          ? prev.dailyStreak || 1
          : prev.lastActiveDate === yesterday
          ? prev.dailyStreak + 1
          : 1;
      const next = updater({ ...prev, dailyStreak: streak, lastActiveDate: today });
      next.badges = computeBadges(next);
      return next;
    });
  }, []);

  const completeHabit = useCallback((category: Category = "general") => {
    applyUpdate((prev) => ({
      ...prev,
      habitsCompleted: prev.habitsCompleted + 1,
      waterActions: prev.waterActions + (category === "water" ? 1 : 0),
      plasticActions: prev.plasticActions + (category === "plastic" ? 1 : 0),
      energyActions: prev.energyActions + (category === "energy" ? 1 : 0),
      transportActions: prev.transportActions + (category === "transport" ? 1 : 0),
    }));
  }, [applyUpdate]);

  const answerQuestion = useCallback((category: Category = "general") => {
    applyUpdate((prev) => ({
      ...prev,
      chatQuestionsAnswered: prev.chatQuestionsAnswered + 1,
      waterActions: prev.waterActions + (category === "water" ? 1 : 0),
      plasticActions: prev.plasticActions + (category === "plastic" ? 1 : 0),
      energyActions: prev.energyActions + (category === "energy" ? 1 : 0),
      transportActions: prev.transportActions + (category === "transport" ? 1 : 0),
    }));
  }, [applyUpdate]);

  const followTip = useCallback((category: Category = "general") => {
    applyUpdate((prev) => ({
      ...prev,
      tipsFollowed: prev.tipsFollowed + 1,
      waterActions: prev.waterActions + (category === "water" ? 1 : 0),
      plasticActions: prev.plasticActions + (category === "plastic" ? 1 : 0),
      energyActions: prev.energyActions + (category === "energy" ? 1 : 0),
      transportActions: prev.transportActions + (category === "transport" ? 1 : 0),
    }));
  }, [applyUpdate]);

  const resetAll = useCallback(() => {
    const fresh = { ...DEFAULT_STATE };
    setState(fresh);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { state, completeHabit, answerQuestion, followTip, resetAll, ...getScore(state) };
}
