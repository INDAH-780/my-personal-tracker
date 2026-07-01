"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { STATUS_LABELS, STATUS_COLORS, CATEGORY_LABELS } from "@/lib/constants";

interface Stats {
  totalOpps: number;
  statusCounts: { status: string; count: number }[];
  recentOpps: any[];
  upcomingDeadlines: any[];
  diaryCount: number;
  courseCount: number;
  scholarshipCount: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-[#F9ABDF]/10 rounded-2xl dark:bg-[#F9ABDF]/20"></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-[#F9ABDF]/10 rounded-2xl dark:bg-[#F9ABDF]/20"></div>
          ))}
        </div>
        <div className="h-64 bg-[#F9ABDF]/10 rounded-2xl dark:bg-[#F9ABDF]/20"></div>
      </div>
    );
  }

  const getStatusCount = (status: string) =>
    stats?.statusCounts.find((s) => s.status === status)?.count || 0;

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Dashboard</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here&apos;s your overview.</p>
        </div>
        <Link href="/opportunities/new" className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide flex items-center justify-center gap-2 text-sm sm:text-base">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Opportunity
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Opportunities"
          value={stats?.totalOpps || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
              <path d="M2 12h20" />
            </svg>
          }
          color="bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/20"
        />
        <StatCard
          label="Scholarships"
          value={stats?.scholarshipCount || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 1.1 2.7 2 6 2s6-.9 6-2v-5" />
            </svg>
          }
          color="bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/20"
        />
        <StatCard
          label="Courses"
          value={stats?.courseCount || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          }
          color="bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/20"
        />
        <StatCard
          label="Diary Entries"
          value={stats?.diaryCount || 0}
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="2">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          }
          color="bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/20"
        />
      </div>

      {/* Content Grid */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Upcoming Deadlines */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold font-display text-[#F9ABDF]">Upcoming Deadlines</h2>
            <Link href="/opportunities" className="text-sm text-[#F9ABDF] hover:underline font-medium">
              View All
            </Link>
          </div>
          {stats?.upcomingDeadlines?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#F9ABDF]/10 rounded-xl flex items-center justify-center mx-auto mb-3 dark:bg-[#F9ABDF]/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No upcoming deadlines</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.upcomingDeadlines?.map((opp: any) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9ABDF]/5 transition-colors group dark:hover:bg-[#F9ABDF]/5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm group-hover:text-[#F9ABDF] transition-colors truncate">
                      {opp.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {CATEGORY_LABELS[opp.category as keyof typeof CATEGORY_LABELS]}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-red-500 bg-red-50 px-2.5 py-1 rounded-lg shrink-0 ml-3 dark:bg-red-900/20">
                    {opp.deadline ? formatDate(opp.deadline) : "No date"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recently Added */}
        <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold font-display text-[#F9ABDF]">Recently Added</h2>
            <Link href="/opportunities" className="text-sm text-[#F9ABDF] hover:underline font-medium">
              View All
            </Link>
          </div>
          {stats?.recentOpps?.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-[#F9ABDF]/10 rounded-xl flex items-center justify-center mx-auto mb-3 dark:bg-[#F9ABDF]/20">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F9ABDF" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No opportunities yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats?.recentOpps?.map((opp: any) => (
                <Link
                  key={opp.id}
                  href={`/opportunities/${opp.id}`}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-[#F9ABDF]/5 transition-colors group dark:hover:bg-[#F9ABDF]/5"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-sm group-hover:text-[#F9ABDF] transition-colors truncate">
                      {opp.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{opp.organization}</p>
                  </div>
                  <StatusBadge status={opp.status} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="text-lg font-semibold font-display mb-5 text-[#F9ABDF]">Status Breakdown</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {(["WISHLIST", "DRAFTING", "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"] as const).map((s) => (
            <div key={s} className="text-center p-4 rounded-xl bg-[#F9ABDF]/5 hover:bg-[#F9ABDF]/10 transition-colors dark:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/10">
              <p className="text-2xl font-bold font-display mb-1">{getStatusCount(s)}</p>
              <StatusBadge status={s} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-5 hover:shadow-md transition-shadow dark:bg-gray-900 dark:border-[#F9ABDF]/10">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl sm:text-3xl font-bold font-display">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string }> = {
    WISHLIST: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400" },
    DRAFTING: { bg: "bg-[#F9ABDF]/20", text: "text-gray-700 dark:text-gray-300" },
    SUBMITTED: { bg: "bg-[#F9ABDF]", text: "text-black" },
    UNDER_REVIEW: { bg: "bg-[#F9ABDF]/40", text: "text-gray-900 dark:text-white" },
    ACCEPTED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-300" },
    REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-600 dark:text-red-400" },
  };

  const { bg, text } = config[status] || config.WISHLIST;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${bg} ${text}`}>
      {STATUS_LABELS[status as keyof typeof STATUS_LABELS]}
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
