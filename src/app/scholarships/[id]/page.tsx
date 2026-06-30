"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { SCHOLARSHIP_STATUS_LABELS, type ScholarshipStatus } from "@/lib/constants";

export default function ScholarshipDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [scholarship, setScholarship] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
    if (!confirm("Delete this scholarship?")) return;
    await fetch(`/api/scholarships/${id}`, { method: "DELETE" });
    router.push("/scholarships");
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
      <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
          <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Scholarship not found</p>
    </div>
  );

  const statusConfig: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    PREPARING: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/50", text: "text-gray-900 dark:text-white" },
    AWARDED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    WAITLISTED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  };

  const { bg, text } = statusConfig[scholarship.status] || statusConfig.WISHLIST;

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Scholarship Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Organization</label>
                <input
                  type="text"
                  value={form.organization}
                  onChange={(e) => set("organization", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {(Object.keys(SCHOLARSHIP_STATUS_LABELS) as ScholarshipStatus[]).map((k) => (
                    <option key={k} value={k}>{SCHOLARSHIP_STATUS_LABELS[k]}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Amount</label>
                <input
                  type="text"
                  value={form.amount || ""}
                  onChange={(e) => set("amount", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={form.url || ""}
                  onChange={(e) => set("url", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Deadline</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => set("deadline", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
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
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements</label>
              <textarea
                value={form.requirements || ""}
                onChange={(e) => set("requirements", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description || ""}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Personal Notes</label>
              <textarea
                value={form.notes || ""}
                onChange={(e) => set("notes", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={3}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Title & Status */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-display text-[#F9ABDF]">{scholarship.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{scholarship.organization}</p>
              </div>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text} shrink-0`}>
                {SCHOLARSHIP_STATUS_LABELS[scholarship.status as ScholarshipStatus]}
              </span>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Organization" value={scholarship.organization} />
              <InfoCard label="Amount" value={scholarship.amount || "—"} />
              <InfoCard label="Deadline" value={scholarship.deadline ? new Date(scholarship.deadline).toLocaleDateString() : "—"} highlight={scholarship.deadline && isUpcoming(scholarship.deadline)} />
              <InfoCard label="Start Date" value={scholarship.startDate ? new Date(scholarship.startDate).toLocaleDateString() : "—"} />
            </div>

            {/* Requirements */}
            {scholarship.requirements && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#F9ABDF] mb-2 uppercase tracking-wider">Requirements</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{scholarship.requirements}</p>
              </div>
            )}

            {/* Description */}
            {scholarship.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#F9ABDF] mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{scholarship.description}</p>
              </div>
            )}

            {/* Personal Notes */}
            {scholarship.notes && (
              <div className="bg-[#F9ABDF]/10 border border-[#F9ABDF]/20 rounded-xl p-5 mb-6 dark:bg-[#F9ABDF]/5 dark:border-[#F9ABDF]/10">
                <p className="text-sm font-semibold text-[#F9ABDF] mb-2">Personal Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{scholarship.notes}</p>
              </div>
            )}

            {/* Tags */}
            {scholarship.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {scholarship.tags.split(",").map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Link */}
            {scholarship.url && (
              <div className="flex flex-wrap gap-3">
                <a
                  href={scholarship.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F9ABDF] text-black rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  </svg>
                  Visit Website
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
