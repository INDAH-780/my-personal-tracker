"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DIARY_TYPE_LABELS, STATUS_LABELS, CATEGORY_LABELS, type OpportunityStatus } from "@/lib/constants";

export default function CalendarPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [diaryEntries, setDiaryEntries] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/opportunities").then((r) => r.json()),
      fetch("/api/diary").then((r) => r.json()),
    ]).then(([opps, diary]) => {
      setOpportunities(Array.isArray(opps) ? opps : []);
      setDiaryEntries(Array.isArray(diary) ? diary : []);
      setLoading(false);
    });
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const getEventsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const events: { type: string; label: string; href: string; color: string }[] = [];

    opportunities.forEach((o) => {
      if (o.deadline && o.deadline.split("T")[0] === dateStr) events.push({ type: "deadline", label: o.name, href: `/opportunities/${o.id}`, color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300" });
      if (o.startDate && o.startDate.split("T")[0] === dateStr) events.push({ type: "start", label: `${o.name} starts`, href: `/opportunities/${o.id}`, color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300" });
    });

    diaryEntries.forEach((d) => {
      if (d.date && d.date.split("T")[0] === dateStr) events.push({ type: "diary", label: d.title, href: `/diary/${d.id}`, color: "bg-[#F9ABDF]/20 text-gray-700 dark:bg-[#F9ABDF]/30 dark:text-gray-300" });
    });

    return events;
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const today = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleString("default", { month: "long" });

  if (loading) return (
    <div className="animate-pulse space-y-4">
      <div className="h-12 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
      <div className="h-96 bg-gray-200 rounded-xl dark:bg-gray-800"></div>
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold font-display">
            <span className="text-[#F9ABDF]">Calendar</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track your deadlines and events</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="w-10 h-10 rounded-xl bg-white border border-[#F9ABDF]/30 flex items-center justify-center hover:bg-[#F9ABDF]/10 transition-colors dark:bg-gray-900 dark:border-[#F9ABDF]/20 dark:hover:bg-[#F9ABDF]/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F9ABDF]">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button onClick={today} className="px-4 py-2 bg-[#F9ABDF] text-black rounded-xl text-sm font-medium hover:bg-[#e891c7] transition-colors">
            Today
          </button>
          <button onClick={nextMonth} className="w-10 h-10 rounded-xl bg-white border border-[#F9ABDF]/30 flex items-center justify-center hover:bg-[#F9ABDF]/10 transition-colors dark:bg-gray-900 dark:border-[#F9ABDF]/20 dark:hover:bg-[#F9ABDF]/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#F9ABDF]">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        {/* Month Header */}
        <div className="p-4 border-b border-[#F9ABDF]/20 dark:border-[#F9ABDF]/10">
          <h2 className="text-xl font-semibold text-center font-display">{monthName} {year}</h2>
        </div>

        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-[#F9ABDF]/20 dark:border-[#F9ABDF]/10">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="p-2 text-center text-xs font-semibold text-gray-500 bg-[#F9ABDF]/5 dark:bg-[#F9ABDF]/5 dark:text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {blanks.map((b) => (
            <div key={`b-${b}`} className="min-h-[100px] border-b border-r border-[#F9ABDF]/10 dark:border-[#F9ABDF]/5 bg-gray-50/50 dark:bg-gray-800/30"></div>
          ))}
          {days.map((day) => {
            const events = getEventsForDay(day);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            return (
              <div
                key={day}
                className={`min-h-[100px] border-b border-r border-[#F9ABDF]/10 dark:border-[#F9ABDF]/5 p-1 transition-colors ${
                  isToday
                    ? "bg-[#F9ABDF]/10 dark:bg-[#F9ABDF]/10"
                    : "hover:bg-[#F9ABDF]/5 dark:hover:bg-[#F9ABDF]/5"
                }`}
              >
                <div className={`text-xs font-medium mb-1 ${
                  isToday
                    ? "w-6 h-6 bg-[#F9ABDF] text-black rounded-full flex items-center justify-center"
                    : "text-gray-700 dark:text-gray-300"
                }`}>
                  {day}
                </div>
                <div className="space-y-0.5">
                  {events.slice(0, 3).map((e, i) => (
                    <Link
                      key={i}
                      href={e.href}
                      className={`block text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${e.color} hover:opacity-80 transition-opacity`}
                    >
                      {e.label}
                    </Link>
                  ))}
                  {events.length > 3 && (
                    <p className="text-[10px] text-[#F9ABDF] font-medium">+{events.length - 3} more</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h3 className="font-semibold font-display mb-4 text-[#F9ABDF]">Legend</h3>
        <div className="flex flex-wrap gap-6 text-sm">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-100 border border-red-300 dark:bg-red-900/30 dark:border-red-700"></span>
            <span className="text-gray-700 dark:text-gray-300">Deadline</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-300 dark:bg-green-900/30 dark:border-green-700"></span>
            <span className="text-gray-700 dark:text-gray-300">Start Date</span>
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-[#F9ABDF]/20 border border-[#F9ABDF]"></span>
            <span className="text-gray-700 dark:text-gray-300">Diary Entry</span>
          </span>
        </div>
      </div>
    </div>
  );
}
