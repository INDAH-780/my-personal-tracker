"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SCHOLARSHIP_STATUS_LABELS,
  SCHOLARSHIP_STATUS_COLORS,
  type ScholarshipStatus,
} from "@/lib/constants";

export default function ScholarshipsPage() {
  const router = useRouter();
  const [scholarships, setScholarships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [sortOrder, setSortOrder] = useState("asc");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchScholarships = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statuses.length) params.set("status", statuses.join(","));
    params.set("sort", sortBy);
    params.set("order", sortOrder);

    fetch(`/api/scholarships?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setScholarships(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setScholarships([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchScholarships();
  }, [statuses, sortBy, sortOrder]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const clearFilters = () => {
    setSearch("");
    setStatuses([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = search || statuses.length || dateFrom || dateTo;

  const handleStatusChange = async (scholarshipId: string, newStatus: string) => {
    setUpdatingStatus(scholarshipId);
    try {
      const res = await fetch(`/api/scholarships/${scholarshipId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setScholarships((prev) =>
          prev.map((s) => (s.id === scholarshipId ? { ...s, status: newStatus } : s))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setUpdatingStatus(null);
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Scholarships</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{scholarships.length} scholarships tracked</p>
        </div>
        <Link href="/scholarships/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 text-sm sm:text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Scholarship
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/30 shadow-sm mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/20">
        <div className="p-4 border-b border-[#F9ABDF]/20 dark:border-[#F9ABDF]/10">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F9ABDF]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search scholarships..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchScholarships()}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9ABDF]/5 border border-[#F9ABDF]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <FilterDropdown
              label="Status"
              options={Object.entries(SCHOLARSHIP_STATUS_LABELS)}
              selected={statuses}
              onToggle={(val) => toggleFilter(statuses, setStatuses, val)}
            />

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-[#F9ABDF] hover:text-[#e891c7] transition-colors px-3 py-2 font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Date Filter Row */}
        <div className="px-4 py-3 bg-[#F9ABDF]/5 dark:bg-[#F9ABDF]/5 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F9ABDF]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span className="text-sm text-gray-500 dark:text-gray-400">Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white border border-[#F9ABDF]/30 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white border border-[#F9ABDF]/30 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>

            {/* Active Filters */}
            {hasFilters && (
              <div className="flex flex-wrap gap-2 ml-auto">
                {statuses.map((s) => (
                  <FilterTag
                    key={s}
                    label={SCHOLARSHIP_STATUS_LABELS[s as ScholarshipStatus]}
                    onRemove={() => toggleFilter(statuses, setStatuses, s)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Sort by:</span>
          {[
            { value: "deadline", label: "Deadline" },
            { value: "name", label: "Name" },
            { value: "status", label: "Status" },
            { value: "createdAt", label: "Date Added" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (sortBy === opt.value) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy(opt.value); setSortOrder("asc"); }
              }}
              className={`text-sm font-medium transition-colors shrink-0 ${
                sortBy === opt.value
                  ? "text-[#F9ABDF]"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              }`}
            >
              {opt.label}
              {sortBy === opt.value && (
                <span className="ml-1">{sortOrder === "asc" ? "↑" : "↓"}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-[#F9ABDF]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading scholarships...
            </div>
          </div>
        ) : scholarships.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1 dark:text-gray-400">No scholarships found</p>
            <p className="text-sm text-gray-400">
              {hasFilters ? "Try adjusting your filters" : "Add your first scholarship to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F9ABDF]/10 dark:divide-[#F9ABDF]/5">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/5 text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
              <div className="col-span-4">Scholarship</div>
              <div className="col-span-2">Organization</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-2 text-right">Deadline</div>
            </div>

            {/* Table Rows */}
            {scholarships.map((scholarship) => (
              <div key={scholarship.id}>
                {/* Desktop Row */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors items-center group"
                >
                  <div
                    className="col-span-4 cursor-pointer"
                    onClick={() => router.push(`/scholarships/${scholarship.id}`)}
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-[#F9ABDF] transition-colors truncate dark:text-white">
                      {scholarship.name}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                      {scholarship.organization}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <StatusDropdown
                      scholarshipId={scholarship.id}
                      currentStatus={scholarship.status}
                      isUpdating={updatingStatus === scholarship.id}
                      onChange={handleStatusChange}
                    />
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {scholarship.amount || "—"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    {scholarship.deadline ? (
                      <span className={`text-sm ${isUpcoming(scholarship.deadline) ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(scholarship.deadline)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">No deadline</span>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div
                  className="lg:hidden p-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/scholarships/${scholarship.id}`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{scholarship.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{scholarship.organization}</p>
                    </div>
                    {scholarship.deadline ? (
                      <span className={`text-xs font-medium shrink-0 ${isUpcoming(scholarship.deadline) ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(scholarship.deadline)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown
                        scholarshipId={scholarship.id}
                        currentStatus={scholarship.status}
                        isUpdating={updatingStatus === scholarship.id}
                        onChange={handleStatusChange}
                      />
                    </div>
                    {scholarship.amount && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {scholarship.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Status Dropdown Component
function StatusDropdown({ scholarshipId, currentStatus, isUpdating, onChange }: {
  scholarshipId: string;
  currentStatus: string;
  isUpdating: boolean;
  onChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const statusConfig: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    PREPARING: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/50", text: "text-gray-900 dark:text-white" },
    AWARDED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    WAITLISTED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
  };

  const { bg, text } = statusConfig[currentStatus] || statusConfig.WISHLIST;

  const handleOpen = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.left });
    setOpen(!open);
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        disabled={isUpdating}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer hover:opacity-80 ${bg} ${text} ${isUpdating ? "opacity-50" : ""}`}
      >
        {isUpdating ? (
          <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        )}
        {SCHOLARSHIP_STATUS_LABELS[currentStatus as ScholarshipStatus]}
      </button>

      {open && (
        <div>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed w-44 bg-white rounded-xl shadow-lg border border-[#F9ABDF]/20 py-1.5 z-[70] animate-slide-down dark:bg-gray-900 dark:border-[#F9ABDF]/10"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {(Object.keys(SCHOLARSHIP_STATUS_LABELS) as ScholarshipStatus[]).map((status) => {
              const config = statusConfig[status] || statusConfig.WISHLIST;
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(scholarshipId, status);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9ABDF]/5 transition-colors dark:hover:bg-[#F9ABDF]/10 ${
                    status === currentStatus ? "bg-[#F9ABDF]/10" : ""
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${config.bg}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {SCHOLARSHIP_STATUS_LABELS[status]}
                  </span>
                  {status === currentStatus && (
                    <svg className="ml-auto w-4 h-4 text-[#F9ABDF]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Components
function FilterDropdown({ label, options, selected, onToggle }: {
  label: string;
  options: [string, string][];
  selected: string[];
  onToggle: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
          selected.length
            ? "bg-[#F9ABDF] text-black"
            : "bg-[#F9ABDF]/10 text-gray-700 hover:bg-[#F9ABDF]/20 dark:bg-[#F9ABDF]/10 dark:text-gray-300 dark:hover:bg-[#F9ABDF]/20"
        }`}
      >
        {label}
        {selected.length > 0 && (
          <span className="w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center font-bold dark:bg-white dark:text-black">
            {selected.length}
          </span>
        )}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-[#F9ABDF]/20 py-2 z-50 animate-slide-down max-h-64 overflow-y-auto dark:bg-gray-900 dark:border-[#F9ABDF]/10">
            {options.map(([key, value]) => (
              <label
                key={key}
                className="flex items-center gap-3 px-4 py-2 hover:bg-[#F9ABDF]/5 cursor-pointer transition-colors dark:hover:bg-[#F9ABDF]/10"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(key)}
                  onChange={() => onToggle(key)}
                  className="w-4 h-4 rounded border-[#F9ABDF] text-[#F9ABDF] focus:ring-[#F9ABDF]"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{value}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-[#F9ABDF]/20 text-gray-900 dark:text-white">
      {label}
      <button onClick={onRemove} className="hover:opacity-70 transition-opacity">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </span>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (days < 0) return "Passed";
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  if (days <= 7) return `${days} days`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isUpcoming(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days >= 0 && days <= 7;
}
