"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DIARY_TYPE_LABELS, type DiaryEntryType } from "@/lib/constants";

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
  { text: "The Lord will fight for you; you need only to be still.", ref: "Exodus 14:14" },
  { text: "Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.", ref: "Joshua 1:9" },
  { text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles.", ref: "Isaiah 40:31" },
  { text: "And we know that in all things God works for the good of those who love him.", ref: "Romans 8:28" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
];

function FloralCorner({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 C20 70, 40 50, 60 35 C70 28, 80 20, 85 10" stroke="#e8a0b8" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M15 85 C25 65, 45 45, 55 35" stroke="#f9abdf" strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="60" cy="35" r="4" fill="#f9abdf" opacity="0.3" />
      <circle cx="85" cy="10" r="3" fill="#e8a0b8" opacity="0.3" />
      <circle cx="40" cy="55" r="2.5" fill="#c9a96e" opacity="0.2" />
    </svg>
  );
}

function SpiralBinding() {
  return (
    <div className="spiral-binding hidden sm:flex">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  );
}

export default function DiaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [currentVerse] = useState(Math.floor(Math.random() * BIBLE_VERSES.length));

  useEffect(() => {
    fetch(`/api/diary/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setEntry(data);
        setForm({
          ...data,
          date: data.date ? data.date.split("T")[0] : "",
          linkedOppId: data.linkedOppId || "",
        });
        setLoading(false);
      });
    fetch("/api/opportunities?sort=name&order=asc")
      .then((r) => r.json())
      .then((data) => setOpportunities(Array.isArray(data) ? data : []));
  }, [id]);

  const set = (field: string, value: string | string[] | number) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/diary/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, linkedOppId: form.linkedOppId || null }),
    });
    if (res.ok) {
      const data = await res.json();
      setEntry(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this diary entry? This cannot be undone.")) return;
    await fetch(`/api/diary/${id}`, { method: "DELETE" });
    router.push("/diary");
  };

  const verse = BIBLE_VERSES[currentVerse];

  if (loading) return (
    <div className="diary-page-enter max-w-3xl">
      <div className="notepad-card relative pl-12 sm:pl-16 pr-4 sm:pr-8 py-8 sm:py-10">
        <div className="space-y-6 animate-pulse">
          <div className="h-4 rounded w-32" style={{ background: "var(--diary-blush)" }} />
          <div className="h-8 rounded w-64" style={{ background: "var(--diary-blush)" }} />
          <div className="h-px w-full" style={{ background: "var(--diary-blush)" }} />
          <div className="space-y-3">
            <div className="h-4 rounded w-full" style={{ background: "var(--diary-blush)" }} />
            <div className="h-4 rounded w-5/6" style={{ background: "var(--diary-blush)" }} />
            <div className="h-4 rounded w-4/6" style={{ background: "var(--diary-blush)" }} />
            <div className="h-4 rounded w-3/4" style={{ background: "var(--diary-blush)" }} />
          </div>
        </div>
      </div>
    </div>
  );

  if (!entry) return (
    <div className="text-center py-16">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--diary-rose)" strokeWidth="1" className="mx-auto mb-4 opacity-30">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
        <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
      </svg>
      <p className="diary-heading text-lg mb-1">This page is missing...</p>
      <p className="text-sm italic" style={{ color: "var(--diary-ink-light)" }}>
        Entry not found
      </p>
    </div>
  );

  return (
    <div className="diary-page-enter max-w-3xl">
      {/* Back & Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-70"
          style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif", fontSize: "0.8rem", letterSpacing: "0.05em" }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to diary
        </button>

        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="diary-btn-outline text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="text-xs py-1.5 px-4 rounded-full border transition-all hover:bg-red-50"
                style={{ color: "#c0392b", borderColor: "rgba(192, 57, 43, 0.3)" }}
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="diary-btn text-xs py-1.5 px-5 inline-flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
                      <polyline points="17 21 17 13 7 13 7 21" />
                      <polyline points="7 3 7 8 15 8" />
                    </svg>
                    Save
                  </>
                )}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="diary-btn-outline text-xs py-1.5 px-4"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Notepad */}
      <div className="notepad-card diary-paper relative pl-12 sm:pl-16 pr-4 sm:pr-8 py-8 sm:py-10">
        <SpiralBinding />

        {/* Washi tape */}
        <div className="washi-tape washi-tape-top" />

        {/* Ribbon bookmark */}
        <div className="ribbon-bookmark" />

        {/* Floral corners */}
        <FloralCorner className="floral-corner floral-corner-tl" />
        <FloralCorner className="floral-corner floral-corner-br" />

        {/* Bible verse */}
        <div className="verse-container">
          <p className="verse-text">&ldquo;{verse.text}&rdquo;</p>
          <p className="verse-reference">&mdash; {verse.ref}</p>
        </div>

        {editing ? (
          /* EDIT MODE */
          <div className="relative z-10 space-y-6">
            {/* Date & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label
                  className="block mb-2 text-xs uppercase tracking-[0.1em]"
                  style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                >
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="diary-input text-sm"
                />
              </div>
              <div>
                <label
                  className="block mb-2 text-xs uppercase tracking-[0.1em]"
                  style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                >
                  Type
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
            <div>
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
              />
            </div>

            {/* Content */}
            <div>
              <label
                className="block mb-2 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Content
              </label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className="diary-textarea"
                rows={8}
              />
            </div>

            {/* Link */}
            <div>
              <label
                className="block mb-2 text-xs uppercase tracking-[0.1em]"
                style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
              >
                Linked Opportunity
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
                Mood
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

          </div>
        ) : (
          /* READ MODE */
          <div className="relative z-10">
            {/* Date stamp */}
            <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-2">
              {new Date(entry.date).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>

            {/* Title */}
            <h1 className="diary-heading text-2xl sm:text-3xl font-bold mb-2">
              {entry.title}
            </h1>

            {/* Type badge */}
            <span
              className="inline-block text-[10px] px-3 py-0.5 rounded-full mb-6"
              style={{
                background: "var(--diary-blush)",
                color: "var(--diary-rose-deep)",
                fontFamily: "var(--font-diary-heading), serif",
                letterSpacing: "0.05em",
              }}
            >
              {DIARY_TYPE_LABELS[entry.type as DiaryEntryType]}
            </span>

            {/* Divider */}
            <div className="diary-divider">
              <span className="diary-divider-icon">&#10047;</span>
            </div>

            {/* Content */}
            <div className="mt-6 mb-8">
              <div
                className="diary-handwritten whitespace-pre-wrap leading-[2.85rem]"
                style={{ color: "var(--diary-ink)" }}
              >
                {entry.content}
              </div>
            </div>

            {/* Linked Opportunity */}
            {entry.opportunity && (
              <div
                className="flex items-center gap-3 p-4 rounded-xl mb-6"
                style={{ background: "rgba(248, 232, 238, 0.4)", border: "1px dashed var(--diary-rose)" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--diary-rose)" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <div>
                  <p
                    className="text-[9px] uppercase tracking-[0.1em] mb-0.5"
                    style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
                  >
                    Related Opportunity
                  </p>
                  <a
                    href={`/opportunities/${entry.opportunity.id}`}
                    className="text-sm font-medium no-underline hover:underline"
                    style={{ color: "var(--diary-ink)", fontFamily: "var(--font-diary-heading), serif" }}
                  >
                    {entry.opportunity.name}
                  </a>
                </div>
              </div>
            )}

            {/* Mood */}
            {entry.mood > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <span
                  className="text-[10px] uppercase tracking-[0.1em]"
                  style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                >
                  Mood:
                </span>
                <span className="text-xl">
                  {["", "💔", "😔", "💛", "🌸", "✨"][entry.mood]}
                </span>
                <span
                  className="text-xs italic"
                  style={{ color: "var(--diary-ink-light)" }}
                >
                  {["", "Heartbroken", "Down", "Okay", "Good", "Amazing"][entry.mood]}
                </span>
              </div>
            )}

            {/* Bottom divider */}
            <div className="diary-divider mt-10">
              <span className="diary-divider-icon">&#10048;</span>
            </div>

            {/* Timestamp */}
            <p
              className="text-center text-[10px] mt-4 italic opacity-40"
              style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              Written on {new Date(entry.createdAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })} at {new Date(entry.createdAt).toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}

        {/* Ink blots */}
        <div className="ink-blot" style={{ bottom: "2rem", right: "3rem" }} />
        <div className="ink-blot" style={{ bottom: "2.5rem", right: "4.5rem", width: "4px", height: "4px" }} />
      </div>
    </div>
  );
}
