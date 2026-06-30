"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { COURSE_STATUS_LABELS, COURSE_PLATFORMS, type CourseStatus } from "@/lib/constants";

export default function CourseDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [course, setCourse] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/courses/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setCourse(data);
        setForm({
          ...data,
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          deadline: data.deadline ? data.deadline.split("T")[0] : "",
        });
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: string | number) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/courses/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setCourse(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this course?")) return;
    await fetch(`/api/courses/${id}`, { method: "DELETE" });
    router.push("/courses");
  };

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-48 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-32 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
    </div>
  );

  if (!course) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Course not found</p>
    </div>
  );

  const statusConfig: Record<string, { bg: string; text: string }> = {
    NOT_STARTED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    IN_PROGRESS: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    PAUSED: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
    DROPPED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  };

  const { bg, text } = statusConfig[course.status] || statusConfig.NOT_STARTED;

  return (
    <div className="max-w-4xl animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
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
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {editing ? (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => set("platform", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {COURSE_PLATFORMS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {(Object.keys(COURSE_STATUS_LABELS) as CourseStatus[]).map((k) => (
                    <option key={k} value={k}>{COURSE_STATUS_LABELS[k]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Instructor</label>
                <input
                  type="text"
                  value={form.instructor || ""}
                  onChange={(e) => set("instructor", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Course URL</label>
                <input
                  type="url"
                  value={form.url || ""}
                  onChange={(e) => set("url", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Progress ({form.progress}%)</label>
              <input
                type="range"
                min="0"
                max="100"
                value={form.progress}
                onChange={(e) => set("progress", parseInt(e.target.value))}
                className="w-full h-2 bg-[#F9ABDF]/10 rounded-lg appearance-none cursor-pointer dark:bg-[#F9ABDF]/20"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => set("startDate", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => set("endDate", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={4}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F9ABDF]">{course.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{course.platform}{course.instructor ? ` · ${course.instructor}` : ""}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text} shrink-0`}>
                {COURSE_STATUS_LABELS[course.status as CourseStatus]}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Progress</span>
                <span className="text-sm font-bold text-[#F9ABDF]">{course.progress}%</span>
              </div>
              <div className="w-full h-3 bg-[#F9ABDF]/10 rounded-full dark:bg-[#F9ABDF]/20">
                <div
                  className="h-3 bg-[#F9ABDF] rounded-full transition-all duration-500"
                  style={{ width: `${course.progress}%` }}
                />
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Platform" value={course.platform} />
              <InfoCard label="Category" value={course.category || "—"} />
              <InfoCard label="Deadline" value={course.deadline ? new Date(course.deadline).toLocaleDateString() : "—"} highlight={course.deadline && isUpcoming(course.deadline)} />
              <InfoCard label="Start Date" value={course.startDate ? new Date(course.startDate).toLocaleDateString() : "—"} />
            </div>

            {/* Notes */}
            {course.notes && (
              <div className="bg-[#F9ABDF]/10 border border-[#F9ABDF]/20 rounded-xl p-5 mb-6 dark:bg-[#F9ABDF]/5 dark:border-[#F9ABDF]/10">
                <p className="text-sm font-semibold text-[#F9ABDF] mb-2">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{course.notes}</p>
              </div>
            )}

            {/* Link */}
            {course.url && (
              <div className="flex flex-wrap gap-3">
                <a
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F9ABDF] text-black rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  </svg>
                  Open Course
                </a>
              </div>
            )}
          </>
        )}
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
