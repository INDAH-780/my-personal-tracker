"use client";

import { useState, useEffect } from "react";

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "And we know that in all things God works for the good of those who love him.", ref: "Romans 8:28" },
  { text: "The Lord is my shepherd; I shall not want.", ref: "Psalm 23:1" },
  { text: "She speaks with wisdom, and faithful instruction is on her tongue.", ref: "Proverbs 31:26" },
  { text: "This is the day the Lord has made; let us rejoice and be glad in it.", ref: "Psalm 118:24" },
  { text: "His mercies are new every morning; great is your faithfulness.", ref: "Lamentations 3:23" },
  { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
  { text: "May he give you the desire of your heart and make all your plans succeed.", ref: "Psalm 20:4" },
  { text: "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.", ref: "Proverbs 19:21" },
  { text: "In the morning, Lord, you hear my voice; in the morning I lay my requests before you.", ref: "Psalm 5:3" },
  { text: "You are worthy of every opportunity that comes your way.", ref: "Affirmation" },
  { text: "Your hard work is paying off, even when you can't see it yet.", ref: "Affirmation" },
  { text: "You have the power to create the future you dream of.", ref: "Affirmation" },
  { text: "You are a magnet for incredible opportunities.", ref: "Affirmation" },
  { text: "Your potential has no ceiling. Keep reaching higher.", ref: "Affirmation" },
  { text: "You are brave for chasing what sets your soul on fire.", ref: "Affirmation" },
];

const CYCLE_INTERVAL = 15000;

export default function BibleVerse() {
  const [index, setIndex] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % BIBLE_VERSES.length);
        setFading(false);
      }, 800);
    }, CYCLE_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  const verse = BIBLE_VERSES[index];

  return (
    <div className="flex justify-end mb-4">
      <div
        className={`text-right max-w-xs transition-opacity duration-800 ${fading ? "opacity-0" : "opacity-100"}`}
      >
        <p
          className="text-[11px] italic leading-relaxed"
          style={{ color: "var(--diary-rose)", fontFamily: "var(--font-diary-heading), serif" }}
        >
          &ldquo;{verse.text}&rdquo;
        </p>
        <p
          className="text-[9px] mt-0.5 uppercase tracking-widest"
          style={{ color: "var(--diary-gold)", fontFamily: "var(--font-diary-heading), serif" }}
        >
          — {verse.ref}
        </p>
      </div>
    </div>
  );
}
