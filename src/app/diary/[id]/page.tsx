"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { DIARY_TYPE_LABELS, DIARY_TYPE_COLORS, TAGS, type DiaryEntryType } from "@/lib/constants";

export default function DiaryDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/diary/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setEntry(data);
        setForm({
          ...data,
          date: data.date ? data.date.split("T")[0] : "",
          tags: data.tags ? data.tags.split(",") : [],
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
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/diary/${id}`, { method: "DELETE" });
    router.push("/diary");
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-48 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
    </div>
  );

  if (!entry) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Entry not found</p>
    </div>
  );

  return (
    <div className="max-w-3xl animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#F9ABDF] hover:text-[#e891c7] transition-colors font-medium"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back
        </button>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-white text-black border-2 border-[#F9ABDF] px-5 py-2.5 rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium text-sm dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-5 py-2.5 rounded-full hover:bg-red-600 transition-all duration-300 font-medium text-sm"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-[#F9ABDF] text-black px-5 py-2.5 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm"
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-white text-black border-2 border-[#F9ABDF] px-5 py-2.5 rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium text-sm dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => set("date", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {(Object.keys(DIARY_TYPE_LABELS) as DiaryEntryType[]).map((t) => (
                    <option key={t} value={t}>{DIARY_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => set("content", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={8}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Link to Opportunity</label>
              <select
                value={form.linkedOppId}
                onChange={(e) => set("linkedOppId", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              >
                <option value="">None</option>
                {opportunities.map((o: any) => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mood</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => set("mood", form.mood === m ? 0 : m)}
                    className={`text-2xl p-3 rounded-xl transition-all ${
                      form.mood === m
                        ? "bg-[#F9ABDF]/20 ring-2 ring-[#F9ABDF]"
                        : "hover:bg-[#F9ABDF]/10"
                    }`}
                  >
                    {["", "😟", "😕", "😐", "🙂", "😊"][m]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Title & Type */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold font-display text-[#F9ABDF]">{entry.title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  {new Date(entry.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <TypeBadge type={entry.type} />
            </div>

            {/* Content */}
            <div className="bg-[#F9ABDF]/5 rounded-xl p-6 mb-6 dark:bg-[#F9ABDF]/5">
              <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700 dark:text-gray-300 leading-relaxed">
                {entry.content}
              </div>
            </div>

            {/* Linked Opportunity */}
            {entry.opportunity && (
              <div className="flex items-center gap-3 mb-6 p-4 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/5">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
                <div>
                  <p className="text-xs font-semibold text-[#F9ABDF] uppercase tracking-wider">Linked Opportunity</p>
                  <a
                    href={`/opportunities/${entry.opportunity.id}`}
                    className="text-sm font-medium text-gray-700 hover:text-[#F9ABDF] transition-colors dark:text-gray-300"
                  >
                    {entry.opportunity.name}
                  </a>
                </div>
              </div>
            )}

            {/* Mood */}
            {entry.mood > 0 && (
              <div className="flex items-center gap-3 mb-6">
                <span className="text-sm font-semibold text-[#F9ABDF]">Mood:</span>
                <span className="text-2xl">{["", "😟", "😕", "😐", "🙂", "😊"][entry.mood]}</span>
              </div>
            )}

            {/* Tags */}
            {entry.tags && (
              <div className="flex flex-wrap gap-2">
                {entry.tags.split(",").map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    MENTORSHIP_SESSION: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    MEETING: { bg: "bg-[#F9ABDF]/20", text: "text-gray-700 dark:text-gray-300" },
    EVENT: { bg: "bg-[#F9ABDF]/40", text: "text-gray-700 dark:text-gray-300" },
    WORKSHOP: { bg: "bg-[#F9ABDF]/25", text: "text-gray-700 dark:text-gray-300" },
    REFLECTION: { bg: "bg-[#F9ABDF]/15", text: "text-gray-700 dark:text-gray-300" },
    GOAL_SETTING: { bg: "bg-[#F9ABDF]/35", text: "text-gray-700 dark:text-gray-300" },
    APPLICATION_UPDATE: { bg: "bg-[#F9ABDF]/20", text: "text-gray-700 dark:text-gray-300" },
    LEARNING_NOTE: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    GENERAL: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
  };

  const { bg, text } = config[type] || config.GENERAL;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {DIARY_TYPE_LABELS[type as DiaryEntryType]}
    </span>
  );
}
