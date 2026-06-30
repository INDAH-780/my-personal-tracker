"use client";

import { useEffect, useState } from "react";
import { CATEGORY_LABELS, STATUS_LABELS, STATUS_COLORS, FUNDING_LABELS, DIARY_TYPE_LABELS, type OpportunityStatus } from "@/lib/constants";

export default function StatisticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
        ))}
      </div>
      <div className="h-64 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
    </div>
  );

  if (!stats) return <div className="text-gray-500 dark:text-gray-400">Failed to load stats</div>;

  const maxCat = Math.max(...stats.categoryCounts.map((c: any) => c.count), 1);
  const maxStatus = Math.max(...stats.statusCounts.map((s: any) => s.count), 1);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-display">
          <span className="text-[#F9ABDF]">Statistics</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your opportunity tracking insights</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 text-center dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <p className="text-3xl font-bold font-display text-[#F9ABDF]">{stats.totalOpps}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Total Opportunities</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 text-center dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <p className="text-3xl font-bold font-display text-green-500">{stats.statusCounts.find((s: any) => s.status === "ACCEPTED")?.count || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Accepted</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 text-center dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <p className="text-3xl font-bold font-display text-[#F9ABDF]">{stats.diaryCount}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Diary Entries</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 text-center dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <p className="text-3xl font-bold font-display text-red-500">{stats.upcomingDeadlines?.length || 0}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Upcoming Deadlines</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* By Status */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">By Status</h2>
          <div className="space-y-3">
            {stats.statusCounts.sort((a: any, b: any) => b.count - a.count).map((s: any) => (
              <div key={s.status} className="flex items-center gap-3">
                <span className="text-xs font-medium w-24 text-gray-700 dark:text-gray-300">
                  {STATUS_LABELS[s.status as OpportunityStatus]}
                </span>
                <div className="flex-1 bg-[#F9ABDF]/10 rounded-full h-3 dark:bg-[#F9ABDF]/20">
                  <div
                    className="bg-[#F9ABDF] rounded-full h-3 transition-all duration-500"
                    style={{ width: `${(s.count / maxStatus) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right text-gray-700 dark:text-gray-300">{s.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* By Category */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">By Category</h2>
          <div className="space-y-3">
            {stats.categoryCounts.sort((a: any, b: any) => b.count - a.count).slice(0, 8).map((c: any) => (
              <div key={c.category} className="flex items-center gap-3">
                <span className="text-xs font-medium w-32 truncate text-gray-700 dark:text-gray-300">
                  {CATEGORY_LABELS[c.category as keyof typeof CATEGORY_LABELS] || c.category}
                </span>
                <div className="flex-1 bg-[#F9ABDF]/10 rounded-full h-3 dark:bg-[#F9ABDF]/20">
                  <div
                    className="bg-[#F9ABDF] rounded-full h-3 transition-all duration-500"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right text-gray-700 dark:text-gray-300">{c.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* By Funding */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">By Funding</h2>
          <div className="space-y-3">
            {stats.fundingCounts.filter((f: any) => f.funding).map((f: any) => (
              <div key={f.funding} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {FUNDING_LABELS[f.funding as keyof typeof FUNDING_LABELS] || f.funding}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                  {f.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Diary by Type */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Diary by Type</h2>
          <div className="space-y-3">
            {stats.diaryTypeCounts.filter((d: any) => d.type).map((d: any) => (
              <div key={d.type} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {DIARY_TYPE_LABELS[d.type as keyof typeof DIARY_TYPE_LABELS] || d.type}
                </span>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#F9ABDF]/20 text-gray-700 dark:text-gray-300">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
