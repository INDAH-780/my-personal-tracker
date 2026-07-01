"use client";

import { useEffect, useState, useCallback } from "react";
import { GOAL_STATUS_LABELS, GOAL_STATUS_COLORS } from "@/lib/constants";

const DURATION_OPTIONS = [
  { value: "WEEKLY", label: "1 Week", days: 7 },
  { value: "MONTHLY", label: "1 Month", days: 30 },
  { value: "TWO_MONTHS", label: "2 Months", days: 60 },
  { value: "THREE_MONTHS", label: "3 Months", days: 90 },
  { value: "FOUR_MONTHS", label: "4 Months", days: 120 },
  { value: "FIVE_MONTHS", label: "5 Months", days: 150 },
  { value: "SIX_MONTHS", label: "6 Months", days: 180 },
  { value: "SEVEN_MONTHS", label: "7 Months", days: 210 },
  { value: "EIGHT_MONTHS", label: "8 Months", days: 240 },
  { value: "NINE_MONTHS", label: "9 Months", days: 270 },
  { value: "TEN_MONTHS", label: "10 Months", days: 300 },
  { value: "ELEVEN_MONTHS", label: "11 Months", days: 330 },
  { value: "ANNUAL", label: "12 Months", days: 365 },
];

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "May he give you the desire of your heart and make all your plans succeed.", ref: "Psalm 20:4" },
  { text: "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.", ref: "Proverbs 19:21" },
  { text: "She is clothed with strength and dignity; she can laugh at the days to come.", ref: "Proverbs 31:25" },
];

function SpiralBinding() {
  return (
    <div className="spiral-binding hidden sm:flex">
      {Array.from({ length: 16 }).map((_, i) => (
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

function getDurationLabel(type: string) {
  return DURATION_OPTIONS.find((d) => d.value === type)?.label || type;
}

function renderTextWithBullets(text: string) {
  if (!text) return null;
  const lines = text.split("\n");
  const hasBullets = lines.some((l) => /^\s*[-•*]\s/.test(l));
  if (hasBullets) {
    return (
      <ul className="space-y-1.5">
        {lines.map((line, i) => {
          const cleaned = line.replace(/^\s*[-•*]\s*/, "").trim();
          if (!cleaned) return null;
          return (
            <li key={i} className="flex items-start gap-2">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-[#F9ABDF] shrink-0" />
              <span>{cleaned}</span>
            </li>
          );
        })}
      </ul>
    );
  }
  return <span className="whitespace-pre-wrap">{text}</span>;
}

export default function PlannerPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [currentVerse] = useState(Math.floor(Math.random() * BIBLE_VERSES.length));

  const [planForm, setPlanForm] = useState({
    title: "",
    duration: "MONTHLY",
    startDate: new Date().toISOString().split("T")[0],
    vision: "",
  });

  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    tasks: "",
  });

  const fetchPlans = useCallback(() => {
    fetch(`/api/plans`)
      .then((r) => r.json())
      .then((data) => {
        setPlans(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setPlans([]);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const getEndDate = (start: string, duration: string) => {
    const d = new Date(start);
    const opt = DURATION_OPTIONS.find((o) => o.value === duration);
    d.setDate(d.getDate() + (opt?.days || 30));
    return d.toISOString().split("T")[0];
  };

  const handleCreatePlan = async () => {
    if (!planForm.title.trim()) return;
    setSaving(true);
    const endDate = getEndDate(planForm.startDate, planForm.duration);
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: planForm.title,
        type: planForm.duration,
        startDate: planForm.startDate,
        endDate,
        vision: planForm.vision || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowCreateForm(false);
      setPlanForm({ title: "", duration: "MONTHLY", startDate: new Date().toISOString().split("T")[0], vision: "" });
      fetchPlans();
      setSelectedPlan(data);
    }
    setSaving(false);
  };

  const handleAddGoal = async () => {
    if (!goalForm.title.trim() || !selectedPlan) return;
    setSaving(true);
    const res = await fetch(`/api/plans/${selectedPlan.id}/goals`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalForm),
    });
    if (res.ok) {
      setShowGoalForm(false);
      setGoalForm({ title: "", description: "", tasks: "" });
      refreshPlan(selectedPlan.id);
    }
    setSaving(false);
  };

  const handleUpdateGoal = async () => {
    if (!editingGoal || !selectedPlan) return;
    setSaving(true);
    const res = await fetch(`/api/plans/${selectedPlan.id}/goals/${editingGoal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goalForm),
    });
    if (res.ok) {
      setEditingGoal(null);
      setGoalForm({ title: "", description: "", tasks: "" });
      refreshPlan(selectedPlan.id);
    }
    setSaving(false);
  };

  const handleDeleteGoal = async (goalId: string) => {
    if (!selectedPlan || !confirm("Remove this goal?")) return;
    await fetch(`/api/plans/${selectedPlan.id}/goals/${goalId}`, { method: "DELETE" });
    refreshPlan(selectedPlan.id);
  };

  const handleToggleTask = async (goal: any, taskIndex: number) => {
    const tasks = goal.tasks ? JSON.parse(goal.tasks) : [];
    if (tasks[taskIndex]) tasks[taskIndex].done = !tasks[taskIndex].done;
    const completedCount = tasks.filter((t: any) => t.done).length;
    const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
    const status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";

    await fetch(`/api/plans/${selectedPlan.id}/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tasks: JSON.stringify(tasks), progress, status }),
    });
    refreshPlan(selectedPlan.id);
  };

  const handleUpdateGoalProgress = async (goal: any, progress: number) => {
    const status = progress === 100 ? "COMPLETED" : progress > 0 ? "IN_PROGRESS" : "NOT_STARTED";
    await fetch(`/api/plans/${selectedPlan.id}/goals/${goal.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ progress, status }),
    });
    refreshPlan(selectedPlan.id);
  };

  const refreshPlan = async (planId: string) => {
    const res = await fetch(`/api/plans/${planId}`);
    if (res.ok) setSelectedPlan(await res.json());
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan || !confirm("Delete this entire plan and all its goals?")) return;
    await fetch(`/api/plans/${selectedPlan.id}`, { method: "DELETE" });
    setSelectedPlan(null);
    fetchPlans();
  };

  const startEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalForm({ title: goal.title, description: goal.description || "", tasks: goal.tasks || "" });
    setShowGoalForm(false);
  };

  const overallProgress = selectedPlan?.goals?.length
    ? Math.round(selectedPlan.goals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / selectedPlan.goals.length)
    : 0;

  const verse = BIBLE_VERSES[currentVerse];
  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  return (
    <div className="diary-page-enter">
      {/* Page Header */}
      <div className="mb-8">
        <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-2">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
        <h1 className="diary-heading text-3xl sm:text-4xl font-bold">My Planner</h1>
        <p className="mt-1 text-sm italic" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
          Dream it. Plan it. Do it.
        </p>
        <div className="diary-divider">
          <span className="diary-divider-icon">&#10047;</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Sidebar - Plans List */}
        <div className="space-y-4">
          <div className="notepad-card diary-paper relative pl-6 pr-4 py-5">
            <SpiralBinding />
            <div className="washi-tape washi-tape-top" style={{ width: "80px", height: "24px" }} />

            <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-3 relative z-10">My Plans</p>

            <div className="space-y-2 relative z-10">
              {plans.length === 0 ? (
                <p className="text-xs italic py-3 text-center" style={{ color: "var(--diary-ink-light)" }}>
                  No plans yet
                </p>
              ) : (
                plans.map((plan) => {
                  const goalCount = plan.goals?.length || 0;
                  const completed = plan.goals?.filter((g: any) => g.status === "COMPLETED").length || 0;
                  const progress = goalCount > 0 ? Math.round(plan.goals.reduce((s: number, g: any) => s + (g.progress || 0), 0) / goalCount) : 0;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => { setSelectedPlan(plan); setShowCreateForm(false); setShowGoalForm(false); setEditingGoal(null); }}
                      className={`w-full text-left p-3 rounded-xl transition-all ${
                        selectedPlan?.id === plan.id
                          ? "bg-[#F9ABDF]/20 border border-[#F9ABDF]/30"
                          : "hover:bg-[#F9ABDF]/10 border border-transparent"
                      }`}
                    >
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--diary-ink)" }}>
                        {plan.title}
                      </p>
                      <p className="text-[10px] mt-0.5" style={{ color: "var(--diary-ink-light)" }}>
                        {getDurationLabel(plan.type)} • {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
                      </p>
                      {goalCount > 0 && (
                        <div className="mt-1.5">
                          <div className="h-1.5 rounded-full bg-[#F9ABDF]/15 overflow-hidden">
                            <div className="h-full rounded-full bg-[#F9ABDF] transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <p className="text-[9px] mt-0.5" style={{ color: "var(--diary-ink-light)" }}>
                            {completed}/{goalCount} goals • {progress}%
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <button
              onClick={() => { setShowCreateForm(true); setSelectedPlan(null); }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-[#F9ABDF]/30 text-xs font-medium transition-all hover:bg-[#F9ABDF]/10 relative z-10"
              style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create New Plan
            </button>
          </div>

          {/* Bible Verse */}
          <div className="notepad-card px-4 py-4 text-center">
            <p className="text-xs italic leading-relaxed" style={{ color: "var(--diary-rose)" }}>
              &ldquo;{verse.text}&rdquo;
            </p>
            <p className="text-[9px] mt-1.5 uppercase tracking-widest" style={{ color: "var(--diary-gold)" }}>
              — {verse.ref}
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        <div>
          {/* ═══ CREATE PLAN FORM ═══ */}
          {showCreateForm && (
            <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-6 mb-6">
              <SpiralBinding />
              <div className="washi-tape washi-tape-top" style={{ width: "100px" }} />

              <div className="relative z-10">
                <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-1">New Plan</p>
                <h2 className="diary-heading text-xl font-bold mb-5">Create a Plan</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                      Plan Title
                    </label>
                    <input
                      type="text"
                      value={planForm.title}
                      onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
                      placeholder="e.g., Focus on applications, Build my network..."
                      className="diary-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                        Duration
                      </label>
                      <select
                        value={planForm.duration}
                        onChange={(e) => setPlanForm({ ...planForm, duration: e.target.value })}
                        className="diary-select w-full"
                      >
                        {DURATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={planForm.startDate}
                        onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                        className="diary-input text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                      Vision / Big Picture (optional)
                    </label>
                    <textarea
                      value={planForm.vision}
                      onChange={(e) => setPlanForm({ ...planForm, vision: e.target.value })}
                      placeholder={"Write your vision here. Use bullet points:\n- Goal 1\n- Goal 2\n- Goal 3"}
                      className="diary-textarea"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button onClick={handleCreatePlan} disabled={saving || !planForm.title.trim()} className="diary-btn text-xs disabled:opacity-50">
                      {saving ? "Creating..." : "Create Plan"}
                    </button>
                    <button onClick={() => setShowCreateForm(false)} className="diary-btn-outline text-xs">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═══ SELECTED PLAN — DIARY ENTRY STYLE ═══ */}
          {selectedPlan && !showCreateForm && (
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

              {/* ── Plan Header (diary entry style) ── */}
              <div className="relative z-10">
                <p className="diary-date-stamp text-[10px] uppercase tracking-[0.15em] opacity-60 mb-2">
                  {formatDate(selectedPlan.startDate)} — {formatDate(selectedPlan.endDate)}
                </p>

                <h1 className="diary-heading text-2xl sm:text-3xl font-bold mb-2">
                  {selectedPlan.title}
                </h1>

                <span
                  className="inline-block text-[10px] px-3 py-0.5 rounded-full mb-6"
                  style={{
                    background: "var(--diary-blush)",
                    color: "var(--diary-rose-deep)",
                    fontFamily: "var(--font-diary-heading), serif",
                    letterSpacing: "0.05em",
                  }}
                >
                  {getDurationLabel(selectedPlan.type)} Plan
                </span>

                {/* Edit & Delete buttons */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => { setShowGoalForm(true); setEditingGoal(null); setGoalForm({ title: "", description: "", tasks: "" }); }}
                    className="diary-btn-outline text-[10px] py-1.5 px-4 inline-flex items-center gap-1.5"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Goal
                  </button>
                  <button
                    onClick={handleDeletePlan}
                    className="text-[10px] py-1.5 px-4 rounded-full border transition-all hover:bg-red-50 inline-flex items-center gap-1.5"
                    style={{ color: "#c0392b", borderColor: "rgba(192, 57, 43, 0.3)" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    Delete Plan
                  </button>
                </div>

                <div className="diary-divider">
                  <span className="diary-divider-icon">&#10047;</span>
                </div>
              </div>

              {/* ── Vision (rendered with bullets) ── */}
              {selectedPlan.vision && (
                <div className="relative z-10 mt-6 mb-6">
                  <p
                    className="text-[10px] uppercase tracking-[0.1em] mb-2"
                    style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
                  >
                    Vision
                  </p>
                  <div
                    className="diary-handwritten leading-[2.85rem]"
                    style={{ color: "var(--diary-ink)" }}
                  >
                    {renderTextWithBullets(selectedPlan.vision)}
                  </div>
                </div>
              )}

              {/* ── Overall Progress ── */}
              {selectedPlan.goals?.length > 0 && (
                <div className="relative z-10 mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="text-[10px] uppercase tracking-[0.1em]"
                      style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                    >
                      Overall Progress
                    </span>
                    <span className="text-sm font-bold" style={{ color: "var(--diary-rose-deep)" }}>
                      {overallProgress}%
                    </span>
                  </div>
                  <div className="h-3 rounded-full bg-[#F9ABDF]/15 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${overallProgress}%`, background: "linear-gradient(90deg, var(--diary-rose), var(--diary-rose-deep))" }}
                    />
                  </div>
                  <p className="text-[9px] mt-1" style={{ color: "var(--diary-ink-light)" }}>
                    {selectedPlan.goals.filter((g: any) => g.status === "COMPLETED").length} of {selectedPlan.goals.length} goals completed
                  </p>
                </div>
              )}

              <div className="diary-divider relative z-10">
                <span className="diary-divider-icon">&#10048;</span>
              </div>

              {/* ── Goals ── */}
              <div className="relative z-10 mt-6 space-y-5">
                {selectedPlan.goals?.map((goal: any) => {
                  const tasks = goal.tasks ? JSON.parse(goal.tasks) : [];
                  const completedTasks = tasks.filter((t: any) => t.done).length;
                  return (
                    <div key={goal.id} className="mb-6">
                      {/* Goal header */}
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3
                              className={`diary-heading text-lg font-bold ${goal.status === "COMPLETED" ? "line-through opacity-50" : ""}`}
                            >
                              {goal.title}
                            </h3>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${GOAL_STATUS_COLORS[goal.status]}`}>
                              {GOAL_STATUS_LABELS[goal.status]}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button onClick={() => startEditGoal(goal)} className="p-1.5 rounded-lg hover:bg-[#F9ABDF]/10 transition-colors text-gray-400 hover:text-[#F9ABDF]">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteGoal(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Goal description with bullets */}
                      {goal.description && (
                        <div
                          className="diary-handwritten text-sm mb-3 leading-[2rem]"
                          style={{ color: "var(--diary-ink-light)" }}
                        >
                          {renderTextWithBullets(goal.description)}
                        </div>
                      )}

                      {/* Progress bar with quick-set buttons */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex gap-1">
                            {[0, 25, 50, 75, 100].map((val) => (
                              <button
                                key={val}
                                onClick={() => handleUpdateGoalProgress(goal, val)}
                                className={`text-[8px] px-1.5 py-0.5 rounded transition-all ${
                                  goal.progress >= val ? "bg-[#F9ABDF] text-black" : "bg-[#F9ABDF]/10 text-gray-400 hover:bg-[#F9ABDF]/20"
                                }`}
                              >
                                {val}%
                              </button>
                            ))}
                          </div>
                          <span className="text-xs font-bold" style={{ color: "var(--diary-rose-deep)" }}>{goal.progress}%</span>
                        </div>
                        <div className="h-2 rounded-full bg-[#F9ABDF]/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${goal.progress}%`,
                              background: goal.status === "COMPLETED" ? "#22c55e" : "linear-gradient(90deg, var(--diary-rose), var(--diary-rose-deep))",
                            }}
                          />
                        </div>
                      </div>

                      {/* Tasks checklist */}
                      {tasks.length > 0 && (
                        <div
                          className="p-3 rounded-lg"
                          style={{ background: "rgba(248,232,238,0.15)", border: "1px dashed rgba(200,160,180,0.2)" }}
                        >
                          <p
                            className="text-[9px] uppercase tracking-[0.1em] mb-2"
                            style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}
                          >
                            Tasks
                          </p>
                          <div className="space-y-1.5">
                            {tasks.map((task: any, i: number) => (
                              <button key={i} onClick={() => handleToggleTask(goal, i)} className="w-full flex items-center gap-2.5 text-left group">
                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                  task.done ? "bg-green-400 border-green-400" : "border-[#F9ABDF]/40 group-hover:border-[#F9ABDF]"
                                }`}>
                                  {task.done && (
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </div>
                                <span className={`text-xs ${task.done ? "line-through opacity-50" : ""}`} style={{ color: "var(--diary-ink)" }}>
                                  {task.text}
                                </span>
                              </button>
                            ))}
                          </div>
                          <p className="text-[9px] mt-2" style={{ color: "var(--diary-ink-light)" }}>
                            {completedTasks}/{tasks.length} done
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* ── Add / Edit Goal Form ── */}
                {(showGoalForm || editingGoal) && (
                  <div className="p-4 rounded-xl" style={{ background: "rgba(248,232,238,0.3)", border: "1px dashed var(--diary-rose)" }}>
                    <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}>
                      {editingGoal ? "Edit Goal" : "New Goal"}
                    </h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={goalForm.title}
                        onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })}
                        placeholder="Goal title..."
                        className="diary-input text-sm"
                      />
                      <textarea
                        value={goalForm.description}
                        onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })}
                        placeholder={"Details (use bullet points):\n- Step 1\n- Step 2\n- Step 3"}
                        className="diary-input text-sm"
                        rows={3}
                      />
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                          Tasks (one per line)
                        </label>
                        <textarea
                          value={goalForm.tasks}
                          onChange={(e) => setGoalForm({ ...goalForm, tasks: e.target.value })}
                          placeholder={"Buy application materials\nWrite personal statement\nGet recommendation letters"}
                          className="diary-input text-sm"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => editingGoal ? handleUpdateGoal() : handleAddGoal()}
                          disabled={saving || !goalForm.title.trim()}
                          className="diary-btn text-xs disabled:opacity-50"
                        >
                          {saving ? "Saving..." : editingGoal ? "Update Goal" : "Add Goal"}
                        </button>
                        <button
                          onClick={() => { setShowGoalForm(false); setEditingGoal(null); setGoalForm({ title: "", description: "", tasks: "" }); }}
                          className="diary-btn-outline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty state */}
                {selectedPlan.goals?.length === 0 && !showGoalForm && (
                  <div className="text-center py-8">
                    <div className="text-3xl mb-2 opacity-30">🎯</div>
                    <p className="text-sm font-medium" style={{ color: "var(--diary-ink)", fontFamily: "var(--font-diary-heading), serif" }}>
                      No goals yet
                    </p>
                    <p className="text-xs italic mt-0.5" style={{ color: "var(--diary-ink-light)" }}>
                      Start by adding your first goal
                    </p>
                  </div>
                )}
              </div>

              {/* Ink blots */}
              <div className="ink-blot" style={{ bottom: "2rem", right: "3rem" }} />
            </div>
          )}

          {/* ═══ EMPTY STATE ═══ */}
          {!selectedPlan && !showCreateForm && (
            <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-12 text-center">
              <SpiralBinding />
              <div className="washi-tape washi-tape-top" style={{ width: "80px" }} />

              <div className="relative z-10">
                <div className="text-5xl mb-4 opacity-30">📋</div>
                <h3 className="diary-heading text-lg font-bold mb-2">
                  {plans.length > 0 ? "Select a Plan" : "Create your first plan"}
                </h3>
                <p className="text-xs italic mb-5" style={{ color: "var(--diary-ink-light)" }}>
                  {plans.length > 0
                    ? "Choose a plan from the sidebar to view your goals"
                    : "Start planning your journey, one goal at a time"
                  }
                </p>
                {plans.length === 0 && (
                  <button onClick={() => setShowCreateForm(true)} className="diary-btn text-xs">
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Create Plan
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
