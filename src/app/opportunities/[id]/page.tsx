"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, FUNDING_LABELS, TAGS, REGIONS, PROGRAM_STATUS_LABELS, PROGRAM_STATUS_COLORS, type OpportunityCategory, type OpportunityStatus, type FundingType, type ProgramStatus } from "@/lib/constants";

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [opp, setOpp] = useState<any>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCert, setUploadingCert] = useState(false);

  useEffect(() => {
    fetch(`/api/opportunities/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setOpp(data);
        setForm({
          ...data,
          deadline: data.deadline ? data.deadline.split("T")[0] : "",
          startDate: data.startDate ? data.startDate.split("T")[0] : "",
          endDate: data.endDate ? data.endDate.split("T")[0] : "",
          tags: data.tags ? data.tags.split(",") : [],
          programStatus: data.programStatus || "NOT_STARTED",
          dropReason: data.dropReason || "",
        });
        setLoading(false);
      });
  }, [id]);

  const set = (field: string, value: string | string[]) => setForm({ ...form, [field]: value });

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setOpp(data);
      setEditing(false);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this opportunity?")) return;
    await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
    router.push("/opportunities");
  };

  const handleCertificateUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingCert(true);
    try {
      // Upload to Vercel Blob
      const formData = new FormData();
      formData.append("file", file);
      
      const uploadRes = await fetch(`/api/upload?filename=${encodeURIComponent(file.name)}`, {
        method: "POST",
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Upload failed");
      }

      const blob = await uploadRes.json();

      // Save the URL to the opportunity
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateUrl: blob.url,
          certificateName: file.name,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setOpp(data);
      }
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload certificate. Please try again.");
    }
    setUploadingCert(false);
  };

  const handleRemoveCertificate = async () => {
    const res = await fetch(`/api/opportunities/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ certificateUrl: null, certificateName: null }),
    });
    if (res.ok) {
      const data = await res.json();
      setOpp(data);
    }
  };

  const isAccepted = opp?.status === "ACCEPTED";

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-48 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
      <div className="h-32 bg-[#F9ABDF]/10 rounded-xl dark:bg-[#F9ABDF]/20"></div>
    </div>
  );

  if (!opp) return (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
        </svg>
      </div>
      <p className="text-gray-600 dark:text-gray-400">Opportunity not found</p>
    </div>
  );

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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {(Object.keys(CATEGORY_LABELS) as OpportunityCategory[]).map((k) => (
                    <option key={k} value={k}>{CATEGORY_LABELS[k]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application Status</label>
                <select
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {(Object.keys(STATUS_LABELS) as OpportunityStatus[]).map((k) => (
                    <option key={k} value={k}>{STATUS_LABELS[k]}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Program Status - only show when accepted */}
            {form.status === "ACCEPTED" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 dark:bg-green-900/10 dark:border-green-800">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-3">Program Tracking</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Program Status</label>
                    <select
                      value={form.programStatus}
                      onChange={(e) => set("programStatus", e.target.value)}
                      className="w-full px-4 py-3 border border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-green-700 dark:text-white"
                    >
                      {(Object.keys(PROGRAM_STATUS_LABELS) as ProgramStatus[]).map((k) => (
                        <option key={k} value={k}>{PROGRAM_STATUS_LABELS[k]}</option>
                      ))}
                    </select>
                  </div>
                  {form.programStatus === "DROPPED" && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reason for Dropping</label>
                      <input
                        type="text"
                        value={form.dropReason}
                        onChange={(e) => set("dropReason", e.target.value)}
                        className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-red-700 dark:text-white"
                        placeholder="Why did you stop?"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Region</label>
                <select
                  value={form.region}
                  onChange={(e) => set("region", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                >
                  {REGIONS.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => set("websiteUrl", e.target.value)}
                  className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Application URL</label>
                <input
                  type="url"
                  value={form.applicationUrl}
                  onChange={(e) => set("applicationUrl", e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Funding</label>
              <select
                value={form.funding}
                onChange={(e) => set("funding", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              >
                {(Object.keys(FUNDING_LABELS) as FundingType[]).map((k) => (
                  <option key={k} value={k}>{FUNDING_LABELS[k]}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
              <div className="flex flex-wrap gap-2">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter((t: string) => t !== tag) : [...form.tags, tag] })}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                      form.tags.includes(tag)
                        ? "bg-[#F9ABDF] text-black"
                        : "bg-[#F9ABDF]/10 text-gray-700 hover:bg-[#F9ABDF]/20 dark:text-gray-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => set("description", e.target.value)}
                className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Personal Notes</label>
              <textarea
                value={form.personalNotes}
                onChange={(e) => set("personalNotes", e.target.value)}
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
                <h1 className="text-3xl font-bold font-display text-[#F9ABDF]">{opp.name}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">{opp.organization}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusBadge status={opp.status} />
                {isAccepted && opp.programStatus && (
                  <ProgramStatusBadge status={opp.programStatus} />
                )}
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <InfoCard label="Category" value={CATEGORY_LABELS[opp.category as OpportunityCategory]} />
              <InfoCard label="Region" value={opp.region || "—"} />
              <InfoCard label="Funding" value={FUNDING_LABELS[(opp.funding || "UNKNOWN") as FundingType]} />
              <InfoCard label="Deadline" value={opp.deadline ? new Date(opp.deadline).toLocaleDateString() : "—"} highlight={opp.deadline && isUpcoming(opp.deadline)} />
            </div>

            {/* Program Tracking Section - Only show when accepted */}
            {isAccepted && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 dark:bg-green-900/10 dark:border-green-800">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Program Tracking
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Program Status</p>
                    <ProgramStatusBadge status={opp.programStatus || "NOT_STARTED"} />
                  </div>
                  {opp.programStatus === "DROPPED" && opp.dropReason && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Reason for Dropping</p>
                      <p className="text-sm text-red-600 dark:text-red-400">{opp.dropReason}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {opp.tags && (
              <div className="flex flex-wrap gap-2 mb-6">
                {opp.tags.split(",").map((tag: string) => (
                  <span key={tag} className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {opp.description && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-[#F9ABDF] mb-2 uppercase tracking-wider">Description</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{opp.description}</p>
              </div>
            )}

            {/* Personal Notes */}
            {opp.personalNotes && (
              <div className="bg-[#F9ABDF]/10 border border-[#F9ABDF]/20 rounded-xl p-5 mb-6 dark:bg-[#F9ABDF]/5 dark:border-[#F9ABDF]/10">
                <p className="text-sm font-semibold text-[#F9ABDF] mb-2">Personal Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{opp.personalNotes}</p>
              </div>
            )}

            {/* Certificate Section - Only show when completed */}
            {isAccepted && opp.programStatus === "COMPLETED" && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6 dark:bg-green-900/10 dark:border-green-800">
                <h3 className="text-sm font-semibold text-green-700 dark:text-green-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
                  </svg>
                  Certificate
                </h3>
                {opp.certificateUrl ? (
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{opp.certificateName || "Certificate"}</p>
                      <div className="flex gap-2 mt-2">
                        <a
                          href={opp.certificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-green-500 text-white rounded-full text-xs font-medium hover:bg-green-600 transition-colors"
                        >
                          View Certificate
                        </a>
                        <button
                          onClick={handleRemoveCertificate}
                          className="px-4 py-2 bg-red-100 text-red-600 rounded-full text-xs font-medium hover:bg-red-200 transition-colors dark:bg-red-900/20 dark:text-red-400"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="flex flex-col items-center gap-3 p-6 border-2 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-100 transition-colors dark:border-green-700 dark:hover:bg-green-900/20">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <div className="text-center">
                        <p className="text-sm font-medium text-green-700 dark:text-green-300">
                          {uploadingCert ? "Uploading..." : "Upload Certificate"}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, PNG, JPG up to 10MB</p>
                      </div>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={handleCertificateUpload}
                        className="hidden"
                        disabled={uploadingCert}
                      />
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Links */}
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {opp.websiteUrl && (
                <a
                  href={opp.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#F9ABDF] text-black rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium text-sm"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M2 12h20" />
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  </svg>
                  Website
                </a>
              )}
              {opp.applicationUrl && (
                <a
                  href={opp.applicationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 bg-white text-black border-2 border-[#F9ABDF] rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium text-sm dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  Apply
                </a>
              )}
            </div>
          </>
        )}
      </div>

      {/* Status Timeline */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="font-semibold text-lg font-display mb-5 text-[#F9ABDF]">Status Timeline</h2>
        {opp.statusHistory?.length > 0 ? (
          <div className="space-y-4">
            {opp.statusHistory.map((h: any, i: number) => (
              <div key={h.id} className="flex items-start gap-4">
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${i === 0 ? "bg-[#F9ABDF]" : "bg-[#F9ABDF]/30"}`} />
                  {i < opp.statusHistory.length - 1 && (
                    <div className="w-0.5 h-8 bg-[#F9ABDF]/20 mt-1" />
                  )}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(h.changedAt).toLocaleDateString()}
                    </span>
                    <StatusBadge status={h.toStatus} small />
                  </div>
                  {h.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{h.note}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#F9ABDF]/10 rounded-xl flex items-center justify-center mx-auto mb-3 dark:bg-[#F9ABDF]/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No status changes recorded</p>
          </div>
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

function StatusBadge({ status, small }: { status: string; small?: boolean }) {
  const config: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    DRAFTING: { bg: "bg-[#F9ABDF]/20", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/40", text: "text-gray-900 dark:text-white" },
    ACCEPTED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    WAITLISTED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
    WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400" },
    COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
  };

  const { bg, text } = config[status] || config.WISHLIST;

  return (
    <span className={`inline-flex items-center ${small ? "px-2 py-0.5 text-[10px]" : "px-3 py-1 text-xs"} rounded-full font-semibold ${bg} ${text}`}>
      {STATUS_LABELS[status as OpportunityStatus]}
    </span>
  );
}

function ProgramStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    NOT_STARTED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    IN_PROGRESS: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-300" },
    PAUSED: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
    COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    DROPPED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  };

  const { bg, text } = config[status] || config.NOT_STARTED;

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bg} ${text}`}>
      {PROGRAM_STATUS_LABELS[status as ProgramStatus]}
    </span>
  );
}

function isUpcoming(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 7;
}
