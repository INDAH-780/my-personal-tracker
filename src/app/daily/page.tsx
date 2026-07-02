"use client";

import { useEffect, useState, useCallback } from "react";

const BIBLE_VERSES = [
  { text: "This is the day the Lord has made; let us rejoice and be glad in it.", ref: "Psalm 118:24" },
  { text: "In the morning, Lord, you hear my voice; in the morning I lay my requests before you and wait expectantly.", ref: "Psalm 5:3" },
  { text: "Satisfy us in the morning with your unfailing love, that we may sing for joy and be glad all our days.", ref: "Psalm 90:14" },
  { text: "Let the morning bring me word of your unfailing love, for I have put my trust in you.", ref: "Psalm 143:8" },
  { text: "But I will sing of your strength, in the morning I will sing of your love.", ref: "Psalm 59:16" },
  { text: "His mercies are new every morning; great is your faithfulness.", ref: "Lamentations 3:23" },
  { text: "Whatever you do, work at it with all your heart, as working for the Lord.", ref: "Colossians 3:23" },
];

function SpiralBinding() {
  return (
    <div className="spiral-binding hidden sm:flex">
      {Array.from({ length: 18 }).map((_, i) => (
        <div key={i} className="spiral-ring" />
      ))}
    </div>
  );
}

function FloralCorner({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 90 C20 70, 40 50, 60 35 C70 28, 80 20, 85 10" stroke="#e8a0b8" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M15 85 C25 65, 45 45, 55 35" stroke="#f9abdf" strokeWidth="0.8" fill="none" opacity="0.4" />
      <circle cx="60" cy="35" r="4" fill="#f9abdf" opacity="0.3" />
      <circle cx="85" cy="10" r="3" fill="#e8a0b8" opacity="0.3" />
      <circle cx="40" cy="55" r="2.5" fill="#c9a96e" opacity="0.2" />
    </svg>
  );
}

export default function DailyPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTask, setNewTask] = useState("");
  const [newTime, setNewTime] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editTime, setEditTime] = useState("");
  const [currentVerse] = useState(Math.floor(Math.random() * BIBLE_VERSES.length));

  const fetchTasks = useCallback(() => {
    setLoading(true);
    fetch(`/api/daily-tasks?date=${selectedDate}`)
      .then((r) => r.json())
      .then((data) => {
        setTasks(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setTasks([]);
        setLoading(false);
      });
  }, [selectedDate]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleAddTask = async () => {
    if (!newTask.trim()) return;
    setAdding(true);
    const res = await fetch("/api/daily-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, title: newTask, time: newTime || null }),
    });
    if (res.ok) {
      setNewTask("");
      setNewTime("");
      fetchTasks();
    }
    setAdding(false);
  };

  const handleToggleDone = async (task: any) => {
    await fetch(`/api/daily-tasks/${task.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !task.done }),
    });
    fetchTasks();
  };

  const handleDeleteTask = async (taskId: string) => {
    await fetch(`/api/daily-tasks/${taskId}`, { method: "DELETE" });
    fetchTasks();
  };

  const handleUpdateTask = async (taskId: string) => {
    if (!editText.trim()) return;
    await fetch(`/api/daily-tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editText, time: editTime || null }),
    });
    setEditingTask(null);
    fetchTasks();
  };

  const startEdit = (task: any) => {
    setEditingTask(task.id);
    setEditText(task.title);
    setEditTime(task.time || "");
  };

  const doneCount = tasks.filter((t) => t.done).length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;

  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  const prevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const nextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split("T")[0]);
  };

  const goToday = () => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  };

  const verse = BIBLE_VERSES[currentVerse];

  const dateLabel = new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="diary-page-enter max-w-3xl">
      {/* Page Header */}
      <div className="mb-6">
        <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <h1 className="diary-heading text-3xl sm:text-4xl font-bold">Daily Planner</h1>
        <p className="mt-1 text-sm italic" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
          Plan your day, own your time
        </p>
        <div className="diary-divider">
          <span className="diary-divider-icon">&#10047;</span>
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevDay}
          className="p-2 rounded-xl hover:bg-[#F9ABDF]/10 transition-colors"
          style={{ color: "var(--diary-rose-deep)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <p className="diary-heading text-lg font-bold">{dateLabel}</p>
          {!isToday && (
            <button
              onClick={goToday}
              className="text-[10px] underline mt-0.5"
              style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              Go to Today
            </button>
          )}
        </div>
        <button
          onClick={nextDay}
          className="p-2 rounded-xl hover:bg-[#F9ABDF]/10 transition-colors"
          style={{ color: "var(--diary-rose-deep)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Main Notepad */}
      <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-8 sm:py-10">
        <SpiralBinding />
        <div className="washi-tape washi-tape-top" />
        <div className="ribbon-bookmark" />
        <FloralCorner className="floral-corner floral-corner-tl" />
        <FloralCorner className="floral-corner floral-corner-br" />

        {/* Bible verse top right */}
        <div className="verse-container">
          <p className="verse-text">&ldquo;{verse.text}&rdquo;</p>
          <p className="verse-reference">&mdash; {verse.ref}</p>
        </div>

        {/* Date & Progress Header */}
        <div className="relative z-10 mb-6">
          <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-2">
            {isToday ? "Today" : dateLabel}
          </p>
          <h2 className="diary-heading text-2xl font-bold mb-3">
            {isToday ? "My Day Today" : `My Day — ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}`}
          </h2>

          {/* Progress bar */}
          {totalCount > 0 && (
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                  Progress
                </span>
                <span className="text-sm font-bold" style={{ color: "var(--diary-rose-deep)" }}>
                  {doneCount}/{totalCount} done • {progress}%
                </span>
              </div>
              <div className="h-3 rounded-full bg-[#F9ABDF]/15 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${progress}%`, background: progress === 100 ? "#22c55e" : "linear-gradient(90deg, var(--diary-rose), var(--diary-rose-deep))" }}
                />
              </div>
            </div>
          )}

          <div className="diary-divider">
            <span className="diary-divider-icon">&#10048;</span>
          </div>
        </div>

        {/* Add Task */}
        <div className="relative z-10 mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              placeholder="Time"
              className="diary-input text-sm shrink-0"
              style={{ width: "100px", minWidth: "80px" }}
            />
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
              placeholder="What do you need to do today?"
              className="diary-input text-sm flex-1"
            />
            <button
              onClick={handleAddTask}
              disabled={adding || !newTask.trim()}
              className="diary-btn text-xs shrink-0 disabled:opacity-50"
            >
              {adding ? "..." : "Add"}
            </button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="relative z-10 space-y-2">
          {loading ? (
            <div className="text-center py-8">
              <div className="flex gap-1 justify-center">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--diary-rose)", animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3 opacity-30">🌸</div>
              <p className="text-sm font-medium" style={{ color: "var(--diary-ink)", fontFamily: "var(--font-diary-heading), serif" }}>
                {isToday ? "Plan your day" : "No tasks for this day"}
              </p>
              <p className="text-xs italic mt-0.5" style={{ color: "var(--diary-ink-light)" }}>
                {isToday ? "Add your first task above" : "Try a different date"}
              </p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl transition-all group"
                style={{
                  background: task.done ? "rgba(220,252,231,0.2)" : "rgba(248,232,238,0.15)",
                  border: task.done ? "1px solid rgba(34,197,94,0.15)" : "1px dashed rgba(200,160,180,0.2)",
                }}
              >
                {/* Checkbox */}
                <button
                  onClick={() => handleToggleDone(task)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                    task.done
                      ? "bg-green-400 border-green-400"
                      : "border-[#F9ABDF]/40 hover:border-[#F9ABDF]"
                  }`}
                >
                  {task.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </button>

                {/* Task content */}
                {editingTask === task.id ? (
                  <div className="flex-1 flex gap-2">
                    <input
                      type="text"
                      value={editTime}
                      onChange={(e) => setEditTime(e.target.value)}
                      placeholder="Time"
                      className="diary-input text-xs shrink-0"
                      style={{ width: "90px", minWidth: "70px" }}
                    />
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleUpdateTask(task.id)}
                      className="diary-input text-sm flex-1"
                      autoFocus
                    />
                    <button onClick={() => handleUpdateTask(task.id)} className="diary-btn text-[10px] py-1 px-3">Save</button>
                    <button onClick={() => setEditingTask(null)} className="diary-btn-outline text-[10px] py-1 px-3">Cancel</button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${task.done ? "line-through opacity-50" : ""}`} style={{ color: "var(--diary-ink)" }}>
                        {task.title}
                      </p>
                      {task.time && (
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--diary-ink-light)" }}>
                          {task.time}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1.5 rounded-lg hover:bg-[#F9ABDF]/10 transition-colors text-gray-400 hover:text-[#F9ABDF]"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20"
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {/* Completion message */}
        {progress === 100 && totalCount > 0 && (
          <div className="relative z-10 mt-6 text-center p-4 rounded-xl" style={{ background: "rgba(220,252,231,0.3)", border: "1px dashed rgba(34,197,94,0.3)" }}>
            <p className="text-lg mb-1">✨</p>
            <p className="text-sm font-medium" style={{ color: "var(--diary-ink)", fontFamily: "var(--font-diary-heading), serif" }}>
              All done for today!
            </p>
            <p className="text-xs italic" style={{ color: "var(--diary-ink-light)" }}>
              You completed all {totalCount} tasks. Well done!
            </p>
          </div>
        )}

        {/* Ink blots */}
        <div className="ink-blot" style={{ bottom: "2rem", right: "3rem" }} />
        <div className="ink-blot" style={{ bottom: "2.5rem", right: "4.5rem", width: "4px", height: "4px" }} />
      </div>

      {/* Bottom quote */}
      <div className="text-center pb-8 mt-4">
        <p className="text-xs italic opacity-40" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
          &ldquo;The secret of your future is hidden in your daily routine&rdquo;
        </p>
      </div>
    </div>
  );
}
