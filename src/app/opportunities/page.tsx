"use client";

import { useEffect, useState, useRef, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  STATUS_COLORS,
  FUNDING_LABELS,
  TAGS,
  REGIONS,
  type OpportunityCategory,
  type OpportunityStatus,
  type FundingType,
} from "@/lib/constants";

export default function OpportunitiesPage() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [funding, setFunding] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [dateType, setDateType] = useState("deadline");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("deadline");
  const [sortOrder, setSortOrder] = useState("asc");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchOpps = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (categories.length) params.set("category", categories.join(","));
    if (statuses.length) params.set("status", statuses.join(","));
    if (funding.length) params.set("funding", funding.join(","));
    if (regions.length) params.set("region", regions.join(","));
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("dateType", dateType);
    params.set("sort", sortBy);
    params.set("order", sortOrder);

    fetch(`/api/opportunities?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setOpportunities(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setOpportunities([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOpps();
  }, [categories, statuses, funding, regions, dateFrom, dateTo, sortBy, sortOrder]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const clearFilters = () => {
    setSearch("");
    setCategories([]);
    setStatuses([]);
    setFunding([]);
    setRegions([]);
    setDateFrom("");
    setDateTo("");
  };

  const hasFilters = search || categories.length || statuses.length || funding.length || regions.length || dateFrom || dateTo;

  const handleStatusChange = async (oppId: string, newStatus: string) => {
    setUpdatingStatus(oppId);
    try {
      const res = await fetch(`/api/opportunities/${oppId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOpportunities((prev) =>
          prev.map((opp) => (opp.id === oppId ? { ...opp, status: newStatus } : opp))
        );
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
    setUpdatingStatus(null);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Opportunities</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{opportunities.length} items tracked</p>
        </div>
        <Link href="/opportunities/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 text-sm sm:text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Opportunity
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-[#F9ABDF]/30 shadow-sm mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/20">
        <div className="p-4 border-b border-[#F9ABDF]/20 dark:border-[#F9ABDF]/10">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F9ABDF]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search opportunities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchOpps()}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9ABDF]/5 border border-[#F9ABDF]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            <FilterDropdown
              label="Category"
              options={Object.entries(CATEGORY_LABELS)}
              selected={categories}
              onToggle={(val) => toggleFilter(categories, setCategories, val)}
            />

            <FilterDropdown
              label="Status"
              options={Object.entries(STATUS_LABELS)}
              selected={statuses}
              onToggle={(val) => toggleFilter(statuses, setStatuses, val)}
            />

            <FilterDropdown
              label="Funding"
              options={Object.entries(FUNDING_LABELS)}
              selected={funding}
              onToggle={(val) => toggleFilter(funding, setFunding, val)}
            />

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

        <div className="px-4 py-3 bg-[#F9ABDF]/5 dark:bg-[#F9ABDF]/5 rounded-b-2xl">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F9ABDF]">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <select
                value={dateType}
                onChange={(e) => setDateType(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 cursor-pointer dark:text-gray-300"
              >
                <option value="deadline">Deadline</option>
                <option value="startDate">Start Date</option>
                <option value="endDate">End Date</option>
                <option value="dateAdded">Date Added</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">From</span>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="bg-white border border-[#F9ABDF]/30 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">To</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="bg-white border border-[#F9ABDF]/30 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              />
            </div>

            {hasFilters && (
              <div className="flex flex-wrap gap-2 ml-auto">
                {categories.map((c) => (
                  <FilterTag
                    key={c}
                    label={CATEGORY_LABELS[c as OpportunityCategory]}
                    onRemove={() => toggleFilter(categories, setCategories, c)}
                  />
                ))}
                {statuses.map((s) => (
                  <FilterTag
                    key={s}
                    label={STATUS_LABELS[s as OpportunityStatus]}
                    onRemove={() => toggleFilter(statuses, setStatuses, s)}
                  />
                ))}
                {funding.map((f) => (
                  <FilterTag
                    key={f}
                    label={FUNDING_LABELS[f as FundingType]}
                    onRemove={() => toggleFilter(funding, setFunding, f)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

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

      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-[#F9ABDF]" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading opportunities...
            </div>
          </div>
        ) : opportunities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1 dark:text-gray-400">No opportunities found</p>
            <p className="text-sm text-gray-400">
              {hasFilters ? "Try adjusting your filters" : "Add your first opportunity to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F9ABDF]/10 dark:divide-[#F9ABDF]/5">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/5 text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
              <div className="col-span-4">Opportunity</div>
              <div className="col-span-2">Category</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Funding</div>
              <div className="col-span-2 text-right">Deadline</div>
            </div>

            {opportunities.map((opp) => (
              <div key={opp.id}>
                {/* Desktop Row */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors items-center group"
                >
                  <div
                    className="col-span-4 cursor-pointer"
                    onClick={() => router.push(`/opportunities/${opp.id}`)}
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-[#F9ABDF] transition-colors truncate dark:text-white">
                      {opp.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{opp.organization}</p>
                  </div>

                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F9ABDF]/20 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {CATEGORY_LABELS[opp.category as OpportunityCategory]}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <StatusDropdown
                      oppId={opp.id}
                      currentStatus={opp.status}
                      isUpdating={updatingStatus === opp.id}
                      onChange={handleStatusChange}
                    />
                  </div>

                  <div className="col-span-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {opp.funding ? FUNDING_LABELS[opp.funding as FundingType] : "—"}
                    </span>
                  </div>

                  <div className="col-span-2 text-right">
                    {opp.deadline ? (
                      <span className={`text-sm ${isUpcoming(opp.deadline) ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(opp.deadline)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">No deadline</span>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div
                  className="lg:hidden p-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/opportunities/${opp.id}`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{opp.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{opp.organization}</p>
                    </div>
                    {opp.deadline ? (
                      <span className={`text-xs font-medium shrink-0 ${isUpcoming(opp.deadline) ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(opp.deadline)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F9ABDF]/20 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      {CATEGORY_LABELS[opp.category as OpportunityCategory]}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown
                        oppId={opp.id}
                        currentStatus={opp.status}
                        isUpdating={updatingStatus === opp.id}
                        onChange={handleStatusChange}
                      />
                    </div>
                    {opp.funding && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {FUNDING_LABELS[opp.funding as FundingType]}
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

function StatusDropdown({ oppId, currentStatus, isUpdating, onChange }: {
  oppId: string;
  currentStatus: string;
  isUpdating: boolean;
  onChange: (oppId: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const statusConfig: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    DRAFTING: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/50", text: "text-gray-900 dark:text-white" },
    ACCEPTED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
    WAITLISTED: { bg: "bg-orange-100 dark:bg-orange-900/30", text: "text-orange-700 dark:text-orange-300" },
    WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400" },
    COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
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
        ref={buttonRef}
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
        {STATUS_LABELS[currentStatus as OpportunityStatus]}
      </button>

      {open && (
        <div>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed w-44 bg-white rounded-xl shadow-lg border border-[#F9ABDF]/20 py-1.5 z-[70] animate-slide-down dark:bg-gray-900 dark:border-[#F9ABDF]/10"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {(Object.keys(STATUS_LABELS) as OpportunityStatus[]).map((status) => {
              const config = statusConfig[status] || statusConfig.WISHLIST;
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(oppId, status);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9ABDF]/5 transition-colors dark:hover:bg-[#F9ABDF]/10 ${
                    status === currentStatus ? "bg-[#F9ABDF]/10" : ""
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${config.bg}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {STATUS_LABELS[status]}
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
        <div>
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
        </div>
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
