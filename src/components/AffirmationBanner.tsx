"use client";

import { useState, useEffect } from "react";

const AFFIRMATIONS = [
  "You are worthy of every opportunity that comes your way.",
  "Your hard work is paying off, even when you can't see it yet.",
  "You have the power to create the future you dream of.",
  "Every application you submit brings you closer to your goal.",
  "You are building a legacy of perseverance and growth.",
  "Your dedication to learning sets you apart from the crowd.",
  "You are exactly where you need to be on your journey.",
  "Trust the process. Your time is coming.",
  "You are capable of achieving greatness beyond your imagination.",
  "Your efforts today are shaping your tomorrow.",
  "You deserve success, and it is on its way to you.",
  "Keep showing up. That is your superpower.",
  "You are making progress, even on the days it doesn't feel like it.",
  "Your dreams are valid and achievable.",
  "You have overcome so much already. You can handle whatever comes next.",
  "You are a magnet for incredible opportunities.",
  "Your potential has no ceiling. Keep reaching higher.",
  "You are brave for chasing what sets your soul on fire.",
  "The universe is conspiring in your favor.",
  "You are enough, just as you are, right now.",
  "Your persistence will be rewarded in ways you cannot yet imagine.",
  "You are creating a life that inspires others.",
  "Every rejection is redirection to something better.",
  "You are resilient, resourceful, and ready for greatness.",
  "Your journey is unique and beautiful. Honor it.",
  "You are writing a story worth telling.",
  "Your courage to try is what matters most.",
  "You are surrounded by infinite possibilities.",
  "Your growth is happening in ways you don't always see.",
  "You are one decision away from a completely different life.",
];

const CYCLE_INTERVAL = 20000;

export default function AffirmationBanner() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
        setFading(false);
      }, 800);
    }, CYCLE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mb-4 -mx-1">
      <p
        className={`text-sm text-gray-400 dark:text-gray-500 italic transition-opacity duration-800 px-3 py-1.5 rounded-lg ${
          fading ? "opacity-0" : "opacity-100"
        }`}
        style={{ background: "linear-gradient(90deg, rgba(249,171,223,0.06), transparent)" }}
      >
        {AFFIRMATIONS[index]}
      </p>
    </div>
  );
}
