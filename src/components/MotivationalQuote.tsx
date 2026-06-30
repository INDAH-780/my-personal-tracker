"use client";

import { useState, useEffect, useCallback } from "react";

interface Quote {
  quote: string;
  author: string;
}

const FALLBACK_QUOTES: Quote[] = [
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { quote: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { quote: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela" },
  { quote: "The expert in anything was once a beginner.", author: "Helen Hayes" },
  { quote: "An investment in knowledge pays the best interest.", author: "Benjamin Franklin" },
  { quote: "A leader is one who knows the way, goes the way, and shows the way.", author: "John C. Maxwell" },
  { quote: "The strength of the team is each individual member. The strength of each member is the team.", author: "Phil Jackson" },
  { quote: "Leadership is not about being in charge. It is about taking care of those in your charge.", author: "Simon Sinek" },
  { quote: "Your network is your net worth.", author: "Porter Gale" },
  { quote: "The richest people in the world look for and build networks. Everyone else looks for work.", author: "Robert Kiyosaki" },
  { quote: "Alone we can do so little; together we can do so much.", author: "Helen Keller" },
  { quote: "If you want to go fast, go alone. If you want to go far, go together.", author: "African Proverb" },
  { quote: "Networking is not about just connecting people. It is about connecting people with people, people with ideas, and people with opportunities.", author: "Michele Jennae" },
  { quote: "The function of leadership is to produce more leaders, not more followers.", author: "Ralph Nader" },
  { quote: "Research is formalized curiosity. It is poking and prying with a purpose.", author: "Zora Neale Hurston" },
  { quote: "The important thing is not to stop questioning. Curiosity has its own reason for existing.", author: "Albert Einstein" },
  { quote: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { quote: "Persistence guarantees that results are inevitable.", author: "Yogananda" },
  { quote: "Every accomplishment starts with the decision to try.", author: "John F. Kennedy" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson" },
  { quote: "Nothing is impossible. The word itself says I'm possible.", author: "Audrey Hepburn" },
  { quote: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
  { quote: "The best way to predict the future is to create it.", author: "Peter Drucker" },
  { quote: "Great leaders do not desire to lead but to serve.", author: "Myles Munroe" },
  { quote: "Research is what I'm doing when I don't know what I'm doing.", author: "Wernher von Braun" },
  { quote: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King" },
  { quote: "Success usually comes to those who are too busy to be looking for it.", author: "Henry David Thoreau" },
  { quote: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { quote: "Coming together is a beginning; keeping together is progress; working together is success.", author: "Henry Ford" },
  { quote: "The greatest leader is not the one who does the greatest things, but the one who gets people to do the greatest things.", author: "Ronald Reagan" },
  { quote: "Opportunity is missed by most people because it is dressed in overalls and looks like work.", author: "Thomas Edison" },
  { quote: "Success is walking from failure to failure with no loss of enthusiasm.", author: "Winston Churchill" },
];

const SHOW_DURATION = 60 * 1000;
const INTERVAL = 5 * 60 * 1000;

export default function MotivationalQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [visible, setVisible] = useState(false);

  const fetchQuote = useCallback(async () => {
    try {
      const res = await fetch("https://zenquotes.io/api/random");
      if (!res.ok) throw new Error("API failed");
      const data = await res.json();
      setQuote({ quote: data[0].q, author: data[0].a });
    } catch {
      const fallback = FALLBACK_QUOTES[Math.floor(Math.random() * FALLBACK_QUOTES.length)];
      setQuote(fallback);
    }
    setVisible(true);
  }, []);

  useEffect(() => {
    fetchQuote();

    const hideTimer = setInterval(() => {
      setVisible(false);
    }, INTERVAL);

    const showTimer = setInterval(() => {
      fetchQuote();
    }, INTERVAL);

    return () => {
      clearInterval(hideTimer);
      clearInterval(showTimer);
    };
  }, [fetchQuote]);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), SHOW_DURATION);
    return () => clearTimeout(timer);
  }, [visible, quote]);

  if (!visible || !quote) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up max-w-sm">
      <div className="bg-white rounded-2xl shadow-lg border border-[#F9ABDF]/30 p-5 dark:bg-gray-900 dark:border-[#F9ABDF]/20 backdrop-blur-sm">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 bg-[#F9ABDF]/20 rounded-xl flex items-center justify-center shrink-0 dark:bg-[#F9ABDF]/10">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
              <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-800 dark:text-gray-200 font-medium leading-relaxed italic">
              &ldquo;{quote.quote}&rdquo;
            </p>
            <p className="text-xs text-[#F9ABDF] font-semibold mt-2">
              &mdash; {quote.author}
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
