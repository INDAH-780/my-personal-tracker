"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DIARY_TYPE_LABELS, TAGS, type DiaryEntryType } from "@/lib/constants";

export default function NewDiaryEntryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [opportunities, setOpportunities] = useState<any[]>([]);
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

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Diary Entry</h1>
        <p className="text-gray-600">Record your thoughts, sessions, or updates.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={form.title} onChange={(e) => set("title", e.target.value)} className="input-field" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select value={form.type} onChange={(e) => set("type", e.target.value)} className="select-field">
                {(Object.keys(DIARY_TYPE_LABELS) as DiaryEntryType[]).map((t) => (
                  <option key={t} value={t}>{DIARY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content *</label>
            <textarea value={form.content} onChange={(e) => set("content", e.target.value)} className="input-field" rows={6} required placeholder="Write your notes, takeaways, reflections..." />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold">Links & Metadata</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link to Opportunity</label>
            <select value={form.linkedOppId} onChange={(e) => set("linkedOppId", e.target.value)} className="select-field">
              <option value="">None</option>
              {opportunities.map((o: any) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mood / Confidence</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => set("mood", form.mood === m ? 0 : m)}
                  className={`text-2xl p-2 rounded-lg ${form.mood === m ? "bg-blue-50 ring-2 ring-blue-300" : "hover:bg-gray-100"}`}
                >
                  {["", "😟", "😕", "😐", "🙂", "😊"][m]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <div className="flex flex-wrap gap-2">
              {TAGS.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`badge cursor-pointer ${form.tags.includes(tag) ? "bg-blue-100 text-blue-700 border border-blue-300" : "bg-gray-100 text-gray-600"}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-primary">{saving ? "Saving..." : "Save Entry"}</button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
