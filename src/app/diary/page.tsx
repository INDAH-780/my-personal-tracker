"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIARY_TYPE_LABELS, DIARY_TYPE_COLORS, type DiaryEntryType } from "@/lib/constants";

export default function DiaryPage() {
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [types, setTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const fetchEntries = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (types.length) params.set("type", types.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("sort", sortBy);
    params.set("order", sortOrder);

    fetch(`/api/diary?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEntries(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEntries();
  }, [types, dateFrom, dateTo, sortBy, sortOrder]);

  const toggleType = (t: string) => {
    setTypes(types.includes(t) ? types.filter((x) => x !== t) : [...types, t]);
  };

  const clearFilters = () => {
    setSearch("");
    setTypes([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = search || types.length || dateFrom || dateTo;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Diary</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{entries.length} entries</p>
        </div>
        <Link href="/diary/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center gap-2">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Entry
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
                  placeholder="Search entries..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchEntries()}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9ABDF]/5 border border-[#F9ABDF]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Type Dropdown */}
            <FilterDropdown
              label="Type"
              options={Object.entries(DIARY_TYPE_LABELS)}
              selected={types}
              onToggle={toggleType}
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
              <span className="text-sm text-gray-500 dark:text-gray-400">Date Range</span>
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
                {types.map((t) => (
                  <FilterTag
                    key={t}
                    label={DIARY_TYPE_LABELS[t as DiaryEntryType]}
                    onRemove={() => toggleType(t)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">Sort by:</span>
          {[
            { value: "date", label: "Date" },
            { value: "title", label: "Title" },
            { value: "type", label: "Type" },
            { value: "createdAt", label: "Date Added" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                if (sortBy === opt.value) setSortOrder(sortOrder === "asc" ? "desc" : "asc");
                else { setSortBy(opt.value); setSortOrder("asc"); }
              }}
              className={`text-sm font-medium transition-colors ${
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
              Loading diary entries...
            </div>
          </div>
        ) : entries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1 dark:text-gray-400">No diary entries yet</p>
            <p className="text-sm text-gray-400">
              {hasFilters ? "Try adjusting your filters" : "Start journaling your journey"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F9ABDF]/10 dark:divide-[#F9ABDF]/5">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/5 text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
              <div className="col-span-5">Entry</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-2">Linked Opportunity</div>
              <div className="col-span-1">Mood</div>
              <div className="col-span-2 text-right">Date</div>
            </div>

            {/* Table Rows */}
            {entries.map((entry) => (
              <Link
                key={entry.id}
                href={`/diary/${entry.id}`}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors items-center group"
              >
                <div className="col-span-5">
                  <p className="font-semibold text-gray-900 group-hover:text-[#F9ABDF] transition-colors truncate dark:text-white">
                    {entry.title}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{entry.content}</p>
                </div>
                <div className="col-span-2">
                  <TypeBadge type={entry.type} />
                </div>
                <div className="col-span-2">
                  {entry.opportunity ? (
                    <span className="text-sm text-[#F9ABDF] truncate block">
                      {entry.opportunity.name}
                    </span>
                  ) : (
                    <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
                <div className="col-span-1">
                  {entry.mood ? (
                    <span className="text-lg">{["", "😟", "😕", "😐", "🙂", "😊"][entry.mood]}</span>
                  ) : (
                    <span className="text-sm text-gray-300 dark:text-gray-600">—</span>
                  )}
                </div>
                <div className="col-span-2 text-right">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text}`}>
      {DIARY_TYPE_LABELS[type as DiaryEntryType]}
    </span>
  );
}
