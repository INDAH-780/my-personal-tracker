"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIARY_TYPE_LABELS, type DiaryEntryType } from "@/lib/constants";

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.", ref: "Proverbs 3:5-6" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
  { text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures.", ref: "Psalm 23:1-2" },
  { text: "She speaks with wisdom, and faithful instruction is on her tongue.", ref: "Proverbs 31:26" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "And we know that in all things God works for the good of those who love him.", ref: "Romans 8:28" },
];

function FloralCorner({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 C20 70, 40 50, 60 35 C70 28, 80 20, 85 10" stroke="#e8a0b8" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M15 85 C25 65, 45 45, 55 35" stroke="#f9abdf" strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="60" cy="35" r="4" fill="#f9abdf" opacity="0.3" />
      <circle cx="85" cy="10" r="3" fill="#e8a0b8" opacity="0.3" />
      <circle cx="40" cy="55" r="2.5" fill="#c9a96e" opacity="0.2" />
      <path d="M55 30 C58 25, 65 22, 68 28" stroke="#e8a0b8" strokeWidth="0.6" fill="none" opacity="0.4" />
      <path d="M57 32 C60 38, 55 42, 50 38" stroke="#f9abdf" strokeWidth="0.6" fill="none" opacity="0.3" />
      <circle cx="30" cy="70" r="2" fill="#c9a96e" opacity="0.15" />
      <path d="M20 80 Q35 60, 50 50" stroke="#e8a0b8" strokeWidth="0.5" fill="none" opacity="0.3" />
    </svg>
  );
}

function SpiralBinding() {
  return (
    <div className="spiral-binding hidden sm:flex">
      {Array.from({ length: 12 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  );
}

export default function DiaryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");
  const [currentVerse, setCurrentVerse] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const fetchEntries = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (types.length) params.set("type", types.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("sort", sortBy);
    params.set("order", sortOrder);

    fetch(`/api/diary?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, [types, dateFrom, dateTo, sortBy, sortOrder]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentVerse((prev) => (prev + 1) % BIBLE_VERSES.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const toggleType = (t: string) => {
    setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);
  };

  const clearFilters = () => {
    setSearch("");
    setTypes([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = search || types.length || dateFrom || dateTo;

  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const verse = BIBLE_VERSES[currentVerse];

  return (
    <div className="diary-page-enter">
      {/* Page Header - looks like diary cover */}
      <div className="relative mb-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="diary-date-stamp text-xs uppercase tracking-[0.15em] mb-2 opacity-70">
              {dateStr}
            </p>
            <h1 className="diary-heading text-3xl sm:text-4xl font-bold">
              My Diary
            </h1>
            <p
              className="mt-1 text-sm italic"
              style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              {entries.length} {entries.length === 1 ? "entry" : "entries"} written
            </p>
          </div>
          <Link
            href="/diary/new"
            className="diary-btn inline-flex items-center gap-2 no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
            New Entry
          </Link>
        </div>

        {/* Decorative divider */}
        <div className="diary-divider">
          <span className="diary-divider-icon">&#10047;</span>
        </div>
      </div>

      {/* Main Notepad */}
      <div className="notepad-card diary-paper relative pl-12 sm:pl-16 pr-4 sm:pr-8 py-8 sm:py-10 mb-8">
        <SpiralBinding />

        {/* Washi tape */}
        <div className="washi-tape washi-tape-top" />

        {/* Ribbon bookmark */}
        <div className="ribbon-bookmark" />

        {/* Floral corners */}
        <FloralCorner className="floral-corner floral-corner-tl" />
        <FloralCorner className="floral-corner floral-corner-br" />

        {/* Bible verse - top right, fading */}
        <div className="verse-container">
          <p className="verse-text">&ldquo;{verse.text}&rdquo;</p>
          <p className="verse-reference">&mdash; {verse.ref}</p>
        </div>

        {/* Search & Filter area */}
        <div className="relative z-10 mb-8">
          {/* Search bar */}
          <div className="relative mb-4">
            <svg
              className="absolute left-0 top-1/2 -translate-y-1/2 opacity-40"
              style={{ color: "var(--diary-rose)" }}
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search through your diary..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchEntries()}
              className="diary-input pl-7"
            />
          </div>

          {/* Filter toggle */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="diary-btn-outline text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              {showFilters ? "Hide Filters" : "Filters"}
              {hasFilters && (
                <span
                  className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold"
                  style={{ background: "var(--diary-rose)", color: "white" }}
                >
                  {(types.length || 0) + (dateFrom ? 1 : 0) + (dateTo ? 1 : 0)}
                </span>
              )}
            </button>

            {/* Sort buttons */}
            <div className="flex items-center gap-1 ml-auto">
              {[
                { value: "date", label: "Date" },
                { value: "title", label: "Title" },
                { value: "type", label: "Type" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    if (sortBy === opt.value) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                    else {
                      setSortBy(opt.value);
                      setSortOrder("asc");
                    }
                  }}
                  className="text-xs px-2.5 py-1 rounded-full transition-all"
                  style={{
                    fontFamily: "var(--font-diary-heading), serif",
                    letterSpacing: "0.04em",
                    background: sortBy === opt.value ? "var(--diary-blush)" : "transparent",
                    color: sortBy === opt.value ? "var(--diary-rose-deep)" : "var(--diary-ink-light)",
                  }}
                >
                  {opt.label}
                  {sortBy === opt.value && (
                    <span className="ml-0.5">{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Expanded filters */}
          {showFilters && (
            <div
              className="mt-4 p-4 rounded-xl"
              style={{ background: "rgba(248, 232, 238, 0.3)", border: "1px dashed var(--diary-rose)" }}
            >
              <div className="flex flex-wrap gap-2 mb-3">
                {(Object.entries(DIARY_TYPE_LABELS) as [DiaryEntryType, string][]).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => toggleType(key)}
                    className={`diary-tag ${types.includes(key) ? "active" : ""}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className="text-xs"
                  style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                >
                  Date range:
                </span>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="diary-input text-sm"
                  style={{ maxWidth: "150px" }}
                />
                <span className="text-xs" style={{ color: "var(--diary-ink-light)" }}>to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="diary-input text-sm"
                  style={{ maxWidth: "150px" }}
                />
                {hasFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs underline ml-auto"
                    style={{ color: "var(--diary-rose-deep)" }}
                  >
                    Clear all
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diary Entries */}
        <div className="relative z-10">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-flex flex-col items-center gap-3">
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        background: "var(--diary-rose)",
                        animationDelay: `${i * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <span
                  className="text-sm italic"
                  style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                >
                  Turning the pages...
                </span>
              </div>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-16">
              <div className="mb-4 opacity-30">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--diary-rose)" strokeWidth="1" className="mx-auto">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
              </div>
              <p
                className="text-lg mb-1"
                style={{ color: "var(--diary-ink)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                {hasFilters ? "No entries match your search" : "Your diary awaits..."}
              </p>
              <p
                className="text-sm italic"
                style={{ color: "var(--diary-ink-light)" }}
              >
                {hasFilters ? "Try different filters" : "Start writing your story today"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <Link
                  key={entry.id}
                  href={`/diary/${entry.id}`}
                  className="diary-entry-card block p-5 sm:p-6 no-underline group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      {/* Date */}
                      <p
                        className="diary-date-stamp text-[10px] uppercase tracking-[0.12em] mb-1.5 opacity-60"
                      >
                        {new Date(entry.date).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>

                      {/* Title */}
                      <h3
                        className="diary-heading text-lg sm:text-xl font-bold mb-2 group-hover:opacity-80 transition-opacity"
                      >
                        {entry.title}
                      </h3>

                      {/* Content preview */}
                      <p
                        className="diary-handwritten text-sm leading-relaxed line-clamp-2 opacity-70"
                        style={{ lineHeight: "1.8rem" }}
                      >
                        {entry.content}
                      </p>

                      {/* Tags & meta */}
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <span
                          className="text-[10px] px-2.5 py-0.5 rounded-full"
                          style={{
                            background: "var(--diary-blush)",
                            color: "var(--diary-rose-deep)",
                            fontFamily: "var(--font-diary-heading), serif",
                            letterSpacing: "0.05em",
                          }}
                        >
                          {DIARY_TYPE_LABELS[entry.type as DiaryEntryType]}
                        </span>
                        {entry.opportunity && (
                          <span
                            className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{
                              border: "1px solid var(--diary-gold-light)",
                              color: "var(--diary-gold)",
                              fontFamily: "var(--font-diary-heading), serif",
                            }}
                          >
                            {entry.opportunity.name}
                          </span>
                        )}
                        {entry.mood > 0 && (
                          <span className="text-sm">
                            {["", "💔", "😔", "💛", "🌸", "✨"][entry.mood]}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Decorative corner */}
                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--diary-rose)" strokeWidth="1.5" opacity="0.4">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom ink blots decoration */}
        <div className="ink-blot" style={{ bottom: "2rem", right: "3rem" }} />
        <div className="ink-blot" style={{ bottom: "2.5rem", right: "4rem", width: "4px", height: "4px" }} />
      </div>

      {/* Bottom decorative note */}
      <div className="text-center pb-8">
        <p
          className="text-xs italic opacity-40"
          style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
        >
          &ldquo;Every day is a new page in your story&rdquo;
        </p>
      </div>
    </div>
  );
}
