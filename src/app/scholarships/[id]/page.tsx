"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  SCHOLARSHIP_STATUS_LABELS,
  RESEARCH_CATEGORY_LABELS,
  RESEARCH_CATEGORY_ICONS,
  type ScholarshipStatus,
  type ResearchCategory,
} from "@/lib/constants";

const CATEGORIES: ResearchCategory[] = [
  "SCHOOL",
  "SCHOLARSHIP",
  "FACULTY",
  "DEPARTMENT",
  "PROGRAMS",
  "PEOPLE",
  "PAPERS",
  "GENERAL",
];

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Research state
  const [research, setResearch] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<ResearchCategory>("SCHOOL");
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", links: "" });
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/scholarships/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setScholarship(data);
        setForm({
          ...data,
          deadline: data.deadline ? data.deadline.split("T")[0] : "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
        });
        setLoading(false);
      });
  }, [id]);

  const fetchResearch = useCallback(() => {
    fetch(`/api/scholarships/${id}/research`)
      .then((r) => r.json())
      .then((data) => setResearch(Array.isArray(data) ? data : []));
  }, [id]);

  useEffect(() => {
    fetchResearch();
  }, [fetchResearch]);

  const set = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/scholarships/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setScholarship(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this scholarship and all its research notes?")) return;
    await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
    router.push("/scholarships");
  };

  const handleAddNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    setNoteSaving(true);
    const res = await fetch(`/api/scholarships/${id}/research`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: activeCategory,
        title: noteForm.title,
        content: noteForm.content,
        links: noteForm.links || null,
      }),
    });
    if (res.ok) {
      setShowAddNote(false);
      setNoteForm({ title: "", content: "", links: "" });
      fetchResearch();
    }
    setNoteSaving(false);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    setNoteSaving(true);
    const res = await fetch(`/api/scholarships/${id}/research/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: activeCategory,
        title: noteForm.title,
        content: noteForm.content,
        links: noteForm.links || null,
      }),
    });
    if (res.ok) {
      setEditingNote(null);
      setNoteForm({ title: "", content: "", links: "" });
      fetchResearch();
    }
    setNoteSaving(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this research note?")) return;
    await fetch(`/api/scholarships/${id}/research/${noteId}`, { method: "DELETE" });
    fetchResearch();
  };

  const startEditNote = (note: any) => {
    setEditingNote(note.id);
    setNoteForm({ title: note.title, content: note.content, links: note.links || "" });
    setShowAddNote(false);
  };

  const categoryNotes = research.filter((r) => r.category === activeCategory);

  const categoryCounts = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = research.filter((r) => r.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    PREPARING: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/50", text: "text-gray-900 dark:text-white" },
    AWARDED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    WAITLISTED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-48 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-32 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
    </div>
  );

  if (!scholarship) return (
    <div className="text-center py-12">
      <p className="text-gray-600 dark:text-gray-400">Scholarship not found</p>
    </div>
  );

  const { bg, text } = statusConfig[scholarship.status] || statusConfig.WISHLIST;

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
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

      {/* Main Scholarship Card */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Scholarship Name</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization</label>
                <input type="text" value={form.organization} onChange={(e) => set("organization", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white">
                  {(Object.keys(SCHOLARSHIP_STATUS_LABELS) as ScholarshipStatus[]).map((k) => (
                    <option key={k} value={k}>{SCHOLARSHIP_STATUS_LABELS[k]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
                <input type="text" value={form.amount || ""} onChange={(e) => set("amount", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input type="url" value={form.url || ""} onChange={(e) => set("url", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Major</label>
                <input type="text" value={form.major || ""} onChange={(e) => set("major", e.target.value)} placeholder="e.g. Computer Science" className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Minor</label>
                <input type="text" value={form.minor || ""} onChange={(e) => set("minor", e.target.value)} placeholder="e.g. Data Science" className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
                <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements</label>
              <textarea value={form.requirements || ""} onChange={(e) => set("requirements", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Personal Notes</label>
              <textarea value={form.notes || ""} onChange={(e) => set("notes", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" rows={3} />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F9ABDF]">{scholarship.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{scholarship.organization}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text} shrink-0`}>
                {SCHOLARSHIP_STATUS_LABELS[scholarship.status as ScholarshipStatus]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Amount" value={scholarship.amount || "—"} />
              <InfoCard label="Major" value={scholarship.major || "—"} />
              <InfoCard label="Minor" value={scholarship.minor || "—"} />
              <InfoCard label="Deadline" value={scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "—"} highlight={scholarship.deadline && isUpcoming(scholarship.deadline)} />
            </div>

            {scholarship.requirements && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-[#F9ABDF] mb-2 uppercase tracking-wider">Requirements</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{scholarship.requirements}</p>
              </div>
            )}

            {scholarship.description && (
              <div className="mb-5">
                <h3 className="text-xs font-semibold text-[#F9ABDF] mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-sm">{scholarship.description}</p>
              </div>
            )}

            {scholarship.notes && (
              <div className="bg-[#F9ABDF]/10 border border-[#F9ABDF]/20 rounded-xl p-5 mb-5 dark:bg-[#F9ABDF]/5 dark:border-[#F9ABDF]/10">
                <p className="text-xs font-semibold text-[#F9ABDF] mb-2 uppercase">Personal Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scholarship.notes}</p>
              </div>
            )}

            {scholarship.tags && (
              <div className="flex flex-wrap gap-2 mb-5">
                {scholarship.tags.split(",").map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {scholarship.url && (
              <a href={scholarship.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F9ABDF] text-black rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                </svg>
                Visit Website
              </a>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════
          RESEARCH NOTEBOOK SECTION
          ═══════════════════════════════════════════ */}
      <div className="mb-8">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#F9ABDF]/20 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-[#F9ABDF]">Research Notebook</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Document your scholarship research journey</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setShowAddNote(false);
                setEditingNote(null);
                setNoteForm({ title: "", content: "", links: "" });
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat
                  ? "bg-[#F9ABDF] text-black shadow-sm"
                  : "bg-white text-gray-600 border border-[#F9ABDF]/20 hover:bg-[#F9ABDF]/10 dark:bg-gray-900 dark:text-gray-400 dark:border-[#F9ABDF]/10 dark:hover:bg-[#F9ABDF]/10"
              }`}
            >
              <span>{RESEARCH_CATEGORY_ICONS[cat]}</span>
              <span>{RESEARCH_CATEGORY_LABELS[cat]}</span>
              {categoryCounts[cat] > 0 && (
                <span className={`w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeCategory === cat ? "bg-black/20 text-black" : "bg-[#F9ABDF]/20 text-[#F9ABDF]"
                }`}>
                  {categoryCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Add Note Button */}
        {!showAddNote && !editingNote && (
          <button
            onClick={() => setShowAddNote(true)}
            className="mb-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium border border-dashed border-[#F9ABDF]/40 text-[#F9ABDF] hover:bg-[#F9ABDF]/10 transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add {RESEARCH_CATEGORY_LABELS[activeCategory]} Note
          </button>
        )}

        {/* Add / Edit Note Form */}
        {(showAddNote || editingNote) && (
          <div className="bg-white rounded-2xl border border-[#F9ABDF]/30 shadow-sm p-5 mb-4 dark:bg-gray-900 dark:border-[#F9ABDF]/15">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{RESEARCH_CATEGORY_ICONS[activeCategory]}</span>
              <h3 className="text-sm font-semibold text-[#F9ABDF]">
                {editingNote ? "Edit Note" : `New ${RESEARCH_CATEGORY_LABELS[activeCategory]} Note`}
              </h3>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Note title..."
                value={noteForm.title}
                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white"
              />
              <textarea
                placeholder="Write your research notes here..."
                value={noteForm.content}
                onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white"
                rows={5}
              />
              <input
                type="text"
                placeholder="Links (optional, comma-separated URLs)..."
                value={noteForm.links}
                onChange={(e) => setNoteForm({ ...noteForm, links: e.target.value })}
                className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white"
              />
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => editingNote ? handleUpdateNote(editingNote) : handleAddNote()}
                  disabled={noteSaving || !noteForm.title.trim() || !noteForm.content.trim()}
                  className="bg-[#F9ABDF] text-black px-5 py-2 rounded-full hover:bg-[#e891c7] transition-all font-medium text-xs disabled:opacity-50"
                >
                  {noteSaving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                </button>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setEditingNote(null);
                    setNoteForm({ title: "", content: "", links: "" });
                  }}
                  className="px-5 py-2 rounded-full border border-[#F9ABDF]/30 text-gray-600 hover:bg-[#F9ABDF]/10 transition-all font-medium text-xs dark:text-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Research Notes List */}
        <div className="space-y-3">
          {categoryNotes.length === 0 && !showAddNote ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#F9ABDF]/20 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
              <div className="text-3xl mb-2 opacity-40">{RESEARCH_CATEGORY_ICONS[activeCategory]}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notes yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Start researching {RESEARCH_CATEGORY_LABELS[activeCategory].toLowerCase()}
              </p>
            </div>
          ) : (
            categoryNotes.map((note) => (
              <div
                key={note.id}
                className="bg-white rounded-2xl border border-[#F9ABDF]/15 shadow-sm p-5 hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-[#F9ABDF]/10"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{note.title}</h4>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => startEditNote(note)}
                      className="p-1.5 rounded-lg hover:bg-[#F9ABDF]/10 transition-colors text-gray-400 hover:text-[#F9ABDF]"
                      title="Edit"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20"
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed mb-3">
                  {note.content}
                </p>
                {note.links && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {note.links.split(",").filter(Boolean).map((link: string, i: number) => (
                      <a
                        key={i}
                        href={link.trim()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-[#F9ABDF] hover:text-[#e891c7] hover:underline"
                      >
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                        {new URL(link.trim()).hostname}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">
                  {new Date(note.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="bg-[#F9ABDF]/5 rounded-xl p-4 dark:bg-[#F9ABDF]/5">
      <p className="text-xs font-semibold text-[#F9ABDF] uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-sm font-medium ${highlight ? "text-red-500" : "text-gray-700 dark:text-gray-300"}`}>
        {value}
      </p>
    </div>
  );
}

function isUpcoming(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 7;
}
