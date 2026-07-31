"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_COLORS,
  PROJECT_NOTE_CATEGORY_LABELS,
  PROJECT_NOTE_CATEGORY_ICONS,
  type ProjectStatus,
  type ProjectNoteCategory,
} from "@/lib/constants";

const CATEGORIES: ProjectNoteCategory[] = ["EQUIPMENT", "PAPERS", "STRUCTURE", "ARTICLES", "GENERAL"];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [notes, setNotes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<ProjectNoteCategory>("EQUIPMENT");
  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ title: "", content: "", links: "" });
  const [noteSaving, setNoteSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setProject(data);
        setNotes(data.notes || []);
        setForm({
          ...data,
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
        });
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/projects/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setProject(data);
      setNotes(data.notes || []);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this project and all its notes?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    router.push("/projects");
  };

  const refreshNotes = useCallback(() => {
    fetch(`/api/projects/${id}`)
      .then((r) => r.json())
      .then((data) => { setProject(data); setNotes(data.notes || []); });
  }, [id]);

  const handleAddNote = async () => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    setNoteSaving(true);
    const res = await fetch(`/api/projects/${id}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: activeCategory, ...noteForm }),
    });
    if (res.ok) { setShowAddNote(false); setNoteForm({ title: "", content: "", links: "" }); refreshNotes(); }
    setNoteSaving(false);
  };

  const handleUpdateNote = async (noteId: string) => {
    if (!noteForm.title.trim() || !noteForm.content.trim()) return;
    setNoteSaving(true);
    const res = await fetch(`/api/projects/${id}/notes/${noteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category: activeCategory, ...noteForm }),
    });
    if (res.ok) { setEditingNote(null); setNoteForm({ title: "", content: "", links: "" }); refreshNotes(); }
    setNoteSaving(false);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!confirm("Delete this note?")) return;
    await fetch(`/api/projects/${id}/notes/${noteId}`, { method: "DELETE" });
    refreshNotes();
  };

  const startEditNote = (note: any) => {
    setEditingNote(note.id);
    setNoteForm({ title: note.title, content: note.content, links: note.links || "" });
    setShowAddNote(false);
  };

  const categoryNotes = notes.filter((n) => n.category === activeCategory);
  const categoryCounts = CATEGORIES.reduce((acc, cat) => { acc[cat] = notes.filter((n) => n.category === cat).length; return acc; }, {} as Record<string, number>);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-48 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
    </div>
  );

  if (!project) return (
    <div className="text-center py-12"><p className="text-gray-600 dark:text-gray-400">Project not found</p></div>
  );

  const { bg, text } = (PROJECT_STATUS_COLORS[project.status as ProjectStatus] || PROJECT_STATUS_COLORS.PLANNING).split(" ").reduce((acc: any, cls: string) => {
    if (cls.startsWith("bg-")) acc.bg = cls;
    else if (cls.startsWith("text-")) acc.text = cls;
    return acc;
  }, { bg: "", text: "" });

  return (
    <div className="max-w-5xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#F9ABDF] hover:text-[#e891c7] transition-colors font-medium">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back
        </button>
        <div className="flex gap-2">
          {!editing ? (
            <>
              <button onClick={() => setEditing(true)} className="bg-white text-black border-2 border-[#F9ABDF] px-5 py-2.5 rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium text-sm dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black">Edit</button>
              <button onClick={handleDelete} className="bg-red-500 text-white px-5 py-2.5 rounded-full hover:bg-red-600 transition-all duration-300 font-medium text-sm">Delete</button>
            </>
          ) : (
            <>
              <button onClick={handleSave} disabled={saving} className="bg-[#F9ABDF] text-black px-5 py-2.5 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(false)} className="bg-white text-black border-2 border-[#F9ABDF] px-5 py-2.5 rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium text-sm dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black">Cancel</button>
            </>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Name</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description || ""} onChange={(e) => set("description", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" rows={3} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white">
                  {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (<option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>))}
                </select>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
              <input type="text" value={form.tags || ""} onChange={(e) => set("tags", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" placeholder="IoT, ML, Healthcare" />
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F9ABDF]">{project.name}</h1>
                {project.description && <p className="text-gray-600 dark:text-gray-400 mt-1">{project.description}</p>}
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shrink-0 ${bg} ${text}`}>
                {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
              <InfoCard label="Status" value={PROJECT_STATUS_LABELS[project.status as ProjectStatus]} />
              <InfoCard label="Start Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : "—"} />
              <InfoCard label="End Date" value={project.endDate ? new Date(project.endDate).toLocaleDateString() : "—"} />
            </div>

            {project.tags && (
              <div className="flex flex-wrap gap-2">
                {project.tags.split(",").map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">{tag.trim()}</span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════ PROJECT NOTEBOOK ═══════════════ */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-[#F9ABDF]/20 rounded-lg flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>
          </div>
          <div>
            <h2 className="text-lg font-bold font-display text-[#F9ABDF]">Project Notebook</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Document every part of your project</p>
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pb-2 mb-5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setShowAddNote(false); setEditingNote(null); setNoteForm({ title: "", content: "", links: "" }); }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                activeCategory === cat ? "bg-[#F9ABDF] text-black shadow-sm" : "bg-white text-gray-600 border border-[#F9ABDF]/20 hover:bg-[#F9ABDF]/10 dark:bg-gray-900 dark:text-gray-400 dark:border-[#F9ABDF]/10"
              }`}
            >
              <span>{PROJECT_NOTE_CATEGORY_ICONS[cat]}</span>
              <span>{PROJECT_NOTE_CATEGORY_LABELS[cat]}</span>
              {categoryCounts[cat] > 0 && (
                <span className={`w-4.5 h-4.5 rounded-full text-[10px] flex items-center justify-center font-bold ${activeCategory === cat ? "bg-black/20 text-black" : "bg-[#F9ABDF]/20 text-[#F9ABDF]"}`}>
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Add {PROJECT_NOTE_CATEGORY_LABELS[activeCategory]} Note
          </button>
        )}

        {/* Add / Edit Note Form */}
        {(showAddNote || editingNote) && (
          <div className="bg-white rounded-2xl border border-[#F9ABDF]/30 shadow-sm p-5 mb-4 dark:bg-gray-900 dark:border-[#F9ABDF]/15">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">{PROJECT_NOTE_CATEGORY_ICONS[activeCategory]}</span>
              <h3 className="text-sm font-semibold text-[#F9ABDF]">{editingNote ? "Edit Note" : `New ${PROJECT_NOTE_CATEGORY_LABELS[activeCategory]} Note`}</h3>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Note title..." value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white" />
              <textarea placeholder="Write your notes here..." value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white" rows={5} />
              <input type="text" placeholder="Links (optional, comma-separated URLs)..." value={noteForm.links} onChange={(e) => setNoteForm({ ...noteForm, links: e.target.value })} className="w-full px-4 py-2.5 border border-[#F9ABDF]/25 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/15 dark:text-white" />
              <div className="flex gap-2 pt-1">
                <button onClick={() => editingNote ? handleUpdateNote(editingNote) : handleAddNote()} disabled={noteSaving || !noteForm.title.trim() || !noteForm.content.trim()} className="bg-[#F9ABDF] text-black px-5 py-2 rounded-full hover:bg-[#e891c7] transition-all font-medium text-xs disabled:opacity-50">
                  {noteSaving ? "Saving..." : editingNote ? "Update Note" : "Save Note"}
                </button>
                <button onClick={() => { setShowAddNote(false); setEditingNote(null); setNoteForm({ title: "", content: "", links: "" }); }} className="px-5 py-2 rounded-full border border-[#F9ABDF]/30 text-gray-600 hover:bg-[#F9ABDF]/10 transition-all font-medium text-xs dark:text-gray-400">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notes List */}
        <div className="space-y-3">
          {categoryNotes.length === 0 && !showAddNote ? (
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-[#F9ABDF]/20 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
              <div className="text-3xl mb-2 opacity-40">{PROJECT_NOTE_CATEGORY_ICONS[activeCategory]}</div>
              <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">No notes yet</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Start documenting {PROJECT_NOTE_CATEGORY_LABELS[activeCategory].toLowerCase()}</p>
            </div>
          ) : (
            categoryNotes.map((note) => (
              <div key={note.id} className="bg-white rounded-2xl border border-[#F9ABDF]/15 shadow-sm p-5 hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-[#F9ABDF]/10">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{note.title}</h4>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => startEditNote(note)} className="p-1.5 rounded-lg hover:bg-[#F9ABDF]/10 transition-colors text-gray-400 hover:text-[#F9ABDF]" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
                    </button>
                    <button onClick={() => handleDeleteNote(note.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed mb-3">{note.content}</p>
                {note.links && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {note.links.split(",").filter(Boolean).map((link: string, i: number) => (
                      <a key={i} href={link.trim()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[#F9ABDF] hover:text-[#e891c7] hover:underline">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                        {new URL(link.trim()).hostname}
                      </a>
                    ))}
                  </div>
                )}
                <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-2">{new Date(note.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#F9ABDF]/5 rounded-xl p-4 dark:bg-[#F9ABDF]/5">
      <p className="text-xs font-semibold text-[#F9ABDF] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{value}</p>
    </div>
  );
}
