"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORY_LABELS, STATUS_LABELS, FUNDING_LABELS, TAGS, REGIONS, type OpportunityCategory, type OpportunityStatus, type FundingType } from "@/lib/constants";

export default function NewOpportunityPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "FELLOWSHIP",
    organization: "",
    websiteUrl: "",
    applicationUrl: "",
    status: "WISHLIST",
    deadline: "",
    startDate: "",
    endDate: "",
    region: "Global",
    tags: [] as string[],
    funding: "UNKNOWN",
    description: "",
    personalNotes: "",
  });

  const set = (field: string, value: string | string[]) => setForm({ ...form, [field]: value });

  const toggleTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter((t) => t !== tag) : [...form.tags, tag] });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/opportunities", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      router.push(`/opportunities/${data.id}`);
    } else {
      setSaving(false);
      alert("Failed to save");
    }
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Opportunity</h1>
        <p className="text-gray-600">Fill in the details for a new opportunity.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Basic Info</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)} className="input-field" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => set("category", e.target.value)} className="select-field">
                {(Object.keys(CATEGORY_LABELS) as OpportunityCategory[]).map((k) => (
                  <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input type="text" value={form.organization} onChange={(e) => set("organization", e.target.value)} className="input-field" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website URL</label>
              <input type="url" value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Application URL</label>
              <input type="url" value={form.applicationUrl} onChange={(e) => set("applicationUrl", e.target.value)} className="input-field" />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Status & Dates</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} className="select-field">
                {(Object.keys(STATUS_LABELS) as OpportunityStatus[]).map((k) => (
                  <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Funding</label>
              <select value={form.funding} onChange={(e) => set("funding", e.target.value)} className="select-field">
                {(Object.keys(FUNDING_LABELS) as FundingType[]).map((k) => (
                  <option key={k} value={k}>{FUNDING_LABELS[k]}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
              <input type="date" value={form.deadline} onChange={(e) => set("deadline", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate", e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate", e.target.value)} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
            <select value={form.region} onChange={(e) => set("region", e.target.value)} className="select-field">
              {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Tags</h2>
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

        <div className="card space-y-4">
          <h2 className="font-semibold text-lg">Notes</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)} className="input-field" rows={3} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Personal Notes</label>
            <textarea value={form.personalNotes} onChange={(e) => set("personalNotes", e.target.value)} className="input-field" rows={3} placeholder="Why you're interested, what you've prepared..." />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? "Saving..." : "Save Opportunity"}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
