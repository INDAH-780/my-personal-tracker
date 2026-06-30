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

const CYCLE_INTERVAL = 8000;

export default function AffirmationBanner() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
        setFading(false);
      }, 500);
    }, CYCLE_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gradient-to-r from-[#F9ABDF]/10 via-[#F9ABDF]/5 to-[#F9ABDF]/10 border-b border-[#F9ABDF]/10 dark:from-[#F9ABDF]/5 dark:via-transparent dark:to-[#F9ABDF]/5 dark:border-[#F9ABDF]/5">
      <div className="px-4 lg:px-8 py-2.5 text-center">
        <p
          className={`text-sm font-medium text-gray-600 dark:text-gray-400 transition-opacity duration-500 ${
            fading ? "opacity-0" : "opacity-100"
          }`}
        >
          {AFFIRMATIONS[index]}
        </p>
      </div>
    </div>
  );
}
