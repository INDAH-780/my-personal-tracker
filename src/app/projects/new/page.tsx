"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PROJECT_STATUS_LABELS, type ProjectStatus } from "@/lib/constants";

export default function NewProjectPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    status: "PLANNING",
    startDate: "",
    endDate: "",
    tags: "",
  });

  const set = (field: string, value: string) => setForm({ ...form, [field]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/projects/${data.id}`);
    } else {
      setSaving(false);
      alert("Failed to save");
    }
  };

  return (
    <div className="max-w-3xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">
          <span className="text-[#F9ABDF]">New Project</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track a new project from start to finish</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Project Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Name *</label>
              <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" required placeholder="e.g., Sensor-Based Fall Detection System" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" rows={3} placeholder="What is this project about?" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select value={form.status} onChange={(e) => set("status", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white">
                  {(Object.keys(PROJECT_STATUS_LABELS) as ProjectStatus[]).map((s) => (
                    <option key={s} value={s}>{PROJECT_STATUS_LABELS[s]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
                <input type="text" value={form.tags} onChange={(e) => set("tags", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" placeholder="IoT, ML, Healthcare (comma-separated)" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start Date</label>
                <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End Date</label>
                <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide">
            {saving ? "Saving..." : "Create Project"}
          </button>
          <button type="button" onClick={() => router.back()} className="bg-white text-black border-2 border-[#F9ABDF] px-6 py-3 rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium tracking-wide dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
