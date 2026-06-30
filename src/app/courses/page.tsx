"use client";

import { useEffect, useState, type MouseEvent as ReactMouseEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  COURSE_STATUS_LABELS,
  COURSE_STATUS_COLORS,
  COURSE_PLATFORMS,
  type CourseStatus,
} from "@/lib/constants";

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statuses, setStatuses] = useState<string[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  const fetchCourses = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statuses.length) params.set("status", statuses.join(","));
    if (platforms.length) params.set("platform", platforms.join(","));
    params.set("sort", sortBy);
    params.set("order", sortOrder);

    fetch(`/api/courses?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setCourses(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setCourses([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchCourses();
  }, [statuses, platforms, sortBy, sortOrder]);

  const toggleFilter = (arr: string[], setArr: (v: string[]) => void, value: string) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const clearFilters = () => {
    setSearch("");
    setStatuses([]);
    setPlatforms([]);
  };

  const hasFilters = search || statuses.length || platforms.length;

  const uniquePlatforms = Array.from(new Set(courses.map((c) => c.platform))).filter(Boolean);

  const handleStatusChange = async (courseId: string, newStatus: string) => {
    setUpdatingStatus(courseId);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === courseId ? { ...c, status: newStatus } : c))
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
            <span className="text-[#F9ABDF]">Courses</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{courses.length} courses tracked</p>
        </div>
        <Link href="/courses/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 text-sm sm:text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Course
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
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && fetchCourses()}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#F9ABDF]/5 border border-[#F9ABDF]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white dark:placeholder-gray-500"
                />
              </div>
            </div>

            {/* Status Dropdown */}
            <FilterDropdown
              label="Status"
              options={Object.entries(COURSE_STATUS_LABELS)}
              selected={statuses}
              onToggle={(val) => toggleFilter(statuses, setStatuses, val)}
            />

            {/* Platform Dropdown */}
            <FilterDropdown
              label="Platform"
              options={uniquePlatforms.map((p) => [p, p])}
              selected={platforms}
              onToggle={(val) => toggleFilter(platforms, setPlatforms, val)}
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

        {/* Active Filters */}
        {hasFilters && (
          <div className="px-4 py-3 bg-[#F9ABDF]/5 dark:bg-[#F9ABDF]/5 rounded-b-2xl">
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <FilterTag
                  key={s}
                  label={COURSE_STATUS_LABELS[s as CourseStatus]}
                  onRemove={() => toggleFilter(statuses, setStatuses, s)}
                />
              ))}
              {platforms.map((p) => (
                <FilterTag
                  key={p}
                  label={p}
                  onRemove={() => toggleFilter(platforms, setPlatforms, p)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sort Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto hide-scrollbar pb-1">
          <span className="text-sm text-gray-500 dark:text-gray-400 shrink-0">Sort by:</span>
          {[
            { value: "createdAt", label: "Date Added" },
            { value: "name", label: "Name" },
            { value: "status", label: "Status" },
            { value: "progress", label: "Progress" },
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
              Loading courses...
            </div>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            </div>
            <p className="text-gray-600 font-medium mb-1 dark:text-gray-400">No courses found</p>
            <p className="text-sm text-gray-400">
              {hasFilters ? "Try adjusting your filters" : "Add your first course to get started"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F9ABDF]/10 dark:divide-[#F9ABDF]/5">
            {/* Desktop Table Header */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-3 bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/5 text-xs font-semibold text-gray-600 uppercase tracking-wider dark:text-gray-400">
              <div className="col-span-4">Course</div>
              <div className="col-span-2">Platform</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Progress</div>
              <div className="col-span-2 text-right">Deadline</div>
            </div>

            {/* Table Rows */}
            {courses.map((course) => (
              <div key={course.id}>
                {/* Desktop Row */}
                <div
                  className="hidden lg:grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors items-center group"
                >
                  <div
                    className="col-span-4 cursor-pointer"
                    onClick={() => router.push(`/courses/${course.id}`)}
                  >
                    <p className="font-semibold text-gray-900 group-hover:text-[#F9ABDF] transition-colors truncate dark:text-white">
                      {course.name}
                    </p>
                    {course.instructor && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{course.instructor}</p>
                    )}
                  </div>

                  <div className="col-span-2">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[#F9ABDF]/20 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {course.platform}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <StatusDropdown
                      courseId={course.id}
                      currentStatus={course.status}
                      isUpdating={updatingStatus === course.id}
                      onChange={handleStatusChange}
                    />
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-[#F9ABDF]/10 rounded-full dark:bg-[#F9ABDF]/20">
                        <div
                          className="h-2 bg-[#F9ABDF] rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400 w-10 text-right">
                        {course.progress}%
                      </span>
                    </div>
                  </div>

                  <div className="col-span-2 text-right">
                    {course.deadline ? (
                      <span className={`text-sm ${isUpcoming(course.deadline) ? "text-red-500 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(course.deadline)}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-300 dark:text-gray-600">No deadline</span>
                    )}
                  </div>
                </div>

                {/* Mobile Card */}
                <div
                  className="lg:hidden p-4 hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5 transition-colors cursor-pointer"
                  onClick={() => router.push(`/courses/${course.id}`)}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{course.name}</p>
                      {course.instructor && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{course.instructor}</p>
                      )}
                    </div>
                    {course.deadline ? (
                      <span className={`text-xs font-medium shrink-0 ${isUpcoming(course.deadline) ? "text-red-500" : "text-gray-500 dark:text-gray-400"}`}>
                        {formatDate(course.deadline)}
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#F9ABDF]/20 text-[11px] font-medium text-gray-700 dark:text-gray-300">
                      {course.platform}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <StatusDropdown
                        courseId={course.id}
                        currentStatus={course.status}
                        isUpdating={updatingStatus === course.id}
                        onChange={handleStatusChange}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-[#F9ABDF]/10 rounded-full dark:bg-[#F9ABDF]/20">
                      <div
                        className="h-2 bg-[#F9ABDF] rounded-full transition-all duration-500"
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">{course.progress}%</span>
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

function StatusDropdown({ courseId, currentStatus, isUpdating, onChange }: {
  courseId: string;
  currentStatus: string;
  isUpdating: boolean;
  onChange: (id: string, status: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });

  const statusConfig: Record<string, { bg: string; text: string }> = {
    NOT_STARTED: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-300" },
    IN_PROGRESS: { bg: "bg-[#F9ABDF]/30", text: "text-gray-700 dark:text-gray-300" },
    COMPLETED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    PAUSED: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-300" },
    DROPPED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-300" },
  };

  const { bg, text } = statusConfig[currentStatus] || statusConfig.NOT_STARTED;

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
        {COURSE_STATUS_LABELS[currentStatus as CourseStatus]}
      </button>

      {open && (
        <div>
          <div className="fixed inset-0 z-[60]" onClick={() => setOpen(false)} />
          <div
            className="fixed w-44 bg-white rounded-xl shadow-lg border border-[#F9ABDF]/20 py-1.5 z-[70] animate-slide-down dark:bg-gray-900 dark:border-[#F9ABDF]/10"
            style={{ top: dropdownPos.top, left: dropdownPos.left }}
          >
            {(Object.keys(COURSE_STATUS_LABELS) as CourseStatus[]).map((status) => {
              const config = statusConfig[status] || statusConfig.NOT_STARTED;
              return (
                <button
                  key={status}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(courseId, status);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-[#F9ABDF]/5 transition-colors dark:hover:bg-[#F9ABDF]/10 ${
                    status === currentStatus ? "bg-[#F9ABDF]/10" : ""
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${config.bg}`} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {COURSE_STATUS_LABELS[status]}
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
