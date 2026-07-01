"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DIARY_TYPE_LABELS, TAGS, type DiaryEntryType } from "@/lib/constants";

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
  { text: "Trust in the Lord with all your heart and lean not on your own understanding.", ref: "Proverbs 3:5" },
  { text: "I can do all things through Christ who strengthens me.", ref: "Philippians 4:13" },
  { text: "Let all that you do be done in love.", ref: "1 Corinthians 16:14" },
];

function SpiralBinding() {
  return (
    <div className="spiral-binding hidden sm:flex">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  );
}

export default function NewDiaryEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [currentVerse] = useState(Math.floor(Math.random() * BIBLE_VERSES.length));
  const [form, setForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    type: "GENERAL",
    content: "",
    linkedOppId: "",
    mood: 0,
    tags: [] as string[],
  });

  useEffect(() => {
    fetch("/api/opportunities?sort=name&order=asc")
      .then((r) => r.json())
      .then((data) => setOpportunities(Array.isArray(data) ? data : []));
  }, []);

  const set = (field: string, value: string | string[] | number) => setForm({ ...form, [field]: value });

  const toggleTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/diary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, linkedOppId: form.linkedOppId || null }),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/diary/${data.id}`);
    } else {
      setSaving(false);
      alert("Failed to save");
    }
  };

  const verse = BIBLE_VERSES[currentVerse];

  const formattedDate = new Date(form.date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="diary-page-enter max-w-3xl">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-1.5 mb-6 transition-opacity hover:opacity-70"
        style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif", fontSize: "0.8rem", letterSpacing: "0.05em" }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to diary
      </button>

      {/* Notepad */}
      <form onSubmit={handleSubmit}>
        <div className="notepad-card diary-paper relative pl-12 sm:pl-16 pr-4 sm:pr-8 py-8 sm:py-10">
          <SpiralBinding />

          {/* Washi tape */}
          <div className="washi-tape washi-tape-top" />

          {/* Ribbon bookmark */}
          <div className="ribbon-bookmark" />

          {/* Bible verse */}
          <div className="verse-container">
            <p className="verse-text">&ldquo;{verse.text}&rdquo;</p>
            <p className="verse-reference">&mdash; {verse.ref}</p>
          </div>

          {/* Page heading */}
          <div className="relative z-10 mb-8">
            <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-1">
              New Entry
            </p>
            <h1 className="diary-heading text-2xl sm:text-3xl font-bold">
              Dear Diary...
            </h1>
            <div className="diary-divider">
              <span className="diary-divider-icon">&#10047;</span>
            </div>
          </div>

          {/* Date & Type row */}
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            <div>
              <label
                className="block mb-2 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Today&apos;s Date
              </label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
                className="diary-input text-sm"
              />
              <p className="mt-1.5 text-xs italic opacity-50" style={{ color: "var(--diary-ink-light)" }}>
                {formattedDate}
              </p>
            </div>
            <div>
              <label
                className="block mb-2 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Entry Type
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="diary-select w-full"
              >
                {(Object.keys(DIARY_TYPE_LABELS) as DiaryEntryType[]).map((t) => (
                  <option key={t} value={t}>{DIARY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div className="relative z-10 mb-8">
            <label
              className="block mb-2 text-xs uppercase tracking-[0.1em]"
              style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="diary-input text-xl"
              placeholder="Give this entry a title..."
              required
            />
          </div>

          {/* Content */}
          <div className="relative z-10 mb-8">
            <label
              className="block mb-2 text-xs uppercase tracking-[0.1em]"
              style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              What&apos;s on your mind?
            </label>
            <textarea
              value={form.content}
              onChange={(e) => set("content", e.target.value)}
              className="diary-textarea"
              rows={8}
              placeholder="Write your thoughts, dreams, takeaways..."
              required
            />
          </div>

          {/* Divider */}
          <div className="diary-divider relative z-10">
            <span className="diary-divider-icon">&#10048;</span>
          </div>

          {/* Links & Metadata */}
          <div className="relative z-10 space-y-6 mt-6">
            {/* Link to opportunity */}
            <div>
              <label
                className="block mb-2 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Related Opportunity
              </label>
              <select
                value={form.linkedOppId}
                onChange={(e) => set("linkedOppId", e.target.value)}
                className="diary-select w-full"
              >
                <option value="">None</option>
                {opportunities.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Mood */}
            <div>
              <label
                className="block mb-3 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                How are you feeling?
              </label>
              <div className="flex gap-3 items-center">
                {[
                  { val: 1, icon: "💔", label: "Heartbroken" },
                  { val: 2, icon: "😔", label: "Down" },
                  { val: 3, icon: "💛", label: "Okay" },
                  { val: 4, icon: "🌸", label: "Good" },
                  { val: 5, icon: "✨", label: "Amazing" },
                ].map((m) => (
                  <button
                    key={m.val}
                    type="button"
                    onClick={() => set("mood", form.mood === m.val ? 0 : m.val)}
                    className="mood-heart flex flex-col items-center gap-1"
                    data-active={form.mood === m.val ? "true" : "false"}
                    style={form.mood === m.val ? { filter: "grayscale(0)", opacity: 1, transform: "scale(1.1)" } : {}}
                    title={m.label}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <span
                      className="text-[9px] uppercase tracking-wider"
                      style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                    >
                      {m.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label
                className="block mb-3 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`diary-tag ${form.tags.includes(tag) ? "active" : ""}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-10">
            <button
              type="submit"
              disabled={saving}
              className="diary-btn"
            >
              {saving ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="inline-flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Save Entry
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="diary-btn-outline"
            >
              Discard
            </button>
          </div>

          {/* Ink blots */}
          <div className="ink-blot" style={{ bottom: "2rem", right: "3rem" }} />
        </div>
      </form>
    </div>
  );
}
