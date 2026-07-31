"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, type ProjectStatus } from "@/lib/constants";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchProjects = useCallback(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);

    fetch(`/api/projects?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => { setProjects([]); setLoading(false); });
  }, [search, statusFilter]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const statuses: ProjectStatus[] = ["PLANNING", "IN_PROGRESS", "ON_HOLD", "COMPLETED"];

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Projects</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">{projects.length} projects</p>
        </div>
        <Link href="/projects/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 text-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Project
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F9ABDF]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchProjects()}
              className="w-full pl-10 pr-4 py-2.5 bg-[#F9ABDF]/5 border border-[#F9ABDF]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white dark:placeholder-gray-500"
            />
          </div>
        </div>
        <div className="flex gap-1.5">
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(statusFilter === s ? "" : s)}
              className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                statusFilter === s
                  ? "bg-[#F9ABDF] text-black"
                  : "bg-white text-gray-600 border border-[#F9ABDF]/20 hover:bg-[#F9ABDF]/10 dark:bg-gray-900 dark:text-gray-400 dark:border-[#F9ABDF]/10"
              }`}
            >
              {PROJECT_STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-flex items-center gap-3 text-gray-500">
            <svg className="animate-spin h-5 w-5 text-[#F9ABDF]" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Loading projects...
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-[#F9ABDF]/10 rounded-2xl flex items-center justify-center mx-auto mb-4 dark:bg-[#F9ABDF]/20">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <p className="text-gray-600 font-medium mb-1 dark:text-gray-400">No projects yet</p>
          <p className="text-sm text-gray-400">Start tracking your first project</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => {
            const noteCount = project.notes?.length || 0;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all dark:bg-gray-900 dark:border-[#F9ABDF]/10 group"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-[#F9ABDF] transition-colors dark:text-white truncate">
                    {project.name}
                  </h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${PROJECT_STATUS_COLORS[project.status as ProjectStatus]}`}>
                    {PROJECT_STATUS_LABELS[project.status as ProjectStatus]}
                  </span>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{noteCount} note{noteCount !== 1 ? "s" : ""}</span>
                  {project.startDate && (
                    <span>
                      {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
