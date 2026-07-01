"use client";

import { useEffect, useState, useCallback } from "react";
import {
  PLAN_TYPE_LABELS,
  PLAN_TYPE_ICONS,
  GOAL_STATUS_LABELS,
  GOAL_STATUS_COLORS,
  type PlanType,
} from "@/lib/constants";

const PLAN_TYPES: PlanType[] = ["WEEKLY", "MONTHLY", "QUARTERLY", "SEMI_ANNUAL", "ANNUAL"];

const BIBLE_VERSES = [
  { text: "For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.", ref: "Jeremiah 29:11" },
  { text: "Commit to the Lord whatever you do, and he will establish your plans.", ref: "Proverbs 16:3" },
  { text: "Plans fail for lack of counsel, but with many advisers they succeed.", ref: "Proverbs 15:22" },
  { text: "May he give you the desire of your heart and make all your plans succeed.", ref: "Psalm 20:4" },
  { text: "Many are the plans in a person's heart, but it is the Lord's purpose that prevails.", ref: "Proverbs 19:21" },
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

export default function PlannerPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState<PlanType>("MONTHLY");
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [currentVerse] = useState(Math.floor(Math.random() * BIBLE_VERSES.length));

  const [planForm, setPlanForm] = useState({
    title: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    vision: "",
  });

  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "",
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

  const typePlans = plans.filter((p) => p.type === activeType);

  const getDefaultEndDate = (type: PlanType, start: string) => {
    const d = new Date(start);
    switch (type) {
      case "WEEKLY": d.setDate(d.getDate() + 6); break;
      case "MONTHLY": d.setMonth(d.getMonth() + 1); d.setDate(d.getDate() - 1); break;
      case "QUARTERLY": d.setMonth(d.getMonth() + 3); d.setDate(d.getDate() - 1); break;
      case "SEMI_ANNUAL": d.setMonth(d.getMonth() + 6); d.setDate(d.getDate() - 1); break;
      case "ANNUAL": d.setFullYear(d.getFullYear() + 1); d.setDate(d.getDate() - 1); break;
    }
    return d.toISOString().split("T")[0];
  };

  const handleCreatePlan = async () => {
    if (!planForm.title.trim()) return;
    setSaving(true);
    const endDate = planForm.endDate || getDefaultEndDate(activeType, planForm.startDate);
    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: planForm.title,
        type: activeType,
        startDate: planForm.startDate,
        endDate,
        vision: planForm.vision || null,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setShowCreateForm(false);
      setPlanForm({ title: "", startDate: new Date().toISOString().split("T")[0], endDate: "", vision: "" });
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
      setGoalForm({ title: "", description: "", category: "", tasks: "" });
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
      setGoalForm({ title: "", description: "", category: "", tasks: "" });
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
    if (tasks[taskIndex]) {
      tasks[taskIndex].done = !tasks[taskIndex].done;
    }
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
    if (res.ok) {
      const data = await res.json();
      setSelectedPlan(data);
    }
  };

  const handleDeletePlan = async () => {
    if (!selectedPlan || !confirm("Delete this entire plan and all its goals?")) return;
    await fetch(`/api/plans/${selectedPlan.id}`, { method: "DELETE" });
    setSelectedPlan(null);
    fetchPlans();
  };

  const startEditGoal = (goal: any) => {
    setEditingGoal(goal);
    setGoalForm({
      title: goal.title,
      description: goal.description || "",
      category: goal.category || "",
      tasks: goal.tasks || "",
    });
    setShowGoalForm(false);
  };

  const overallProgress = selectedPlan?.goals?.length
    ? Math.round(selectedPlan.goals.reduce((sum: number, g: any) => sum + (g.progress || 0), 0) / selectedPlan.goals.length)
    : 0;

  const verse = BIBLE_VERSES[currentVerse];

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

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
        {/* Left Sidebar - Plan Types & Plans */}
        <div className="space-y-4">
          {/* Plan Type Tabs */}
          <div className="notepad-card diary-paper relative pl-6 pr-4 py-5">
            <SpiralBinding />
            <div className="washi-tape washi-tape-top" style={{ width: "80px", height: "24px" }} />

            <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-3">Plan Duration</p>
            <div className="space-y-1.5 relative z-10">
              {PLAN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setActiveType(type);
                    setSelectedPlan(null);
                    setShowCreateForm(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                    activeType === type
                      ? "bg-[#F9ABDF] text-black shadow-sm"
                      : "hover:bg-[#F9ABDF]/10"
                  }`}
                  style={{ fontFamily: "var(--font-diary-heading), serif", letterSpacing: "0.03em" }}
                >
                  <span>{PLAN_TYPE_ICONS[type]}</span>
                  <span>{PLAN_TYPE_LABELS[type]}</span>
                  <span className={`ml-auto text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold ${
                    activeType === type ? "bg-black/20" : "bg-[#F9ABDF]/15 text-[#F9ABDF]"
                  }`}>
                    {plans.filter((p) => p.type === type).length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Existing Plans for this type */}
          <div className="notepad-card diary-paper relative pl-6 pr-4 py-5">
            <SpiralBinding />
            <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-3 relative z-10">
              {PLAN_TYPE_LABELS[activeType]} Plans
            </p>
            <div className="space-y-2 relative z-10">
              {typePlans.length === 0 ? (
                <p className="text-xs italic py-3 text-center" style={{ color: "var(--diary-ink-light)" }}>
                  No plans yet
                </p>
              ) : (
                typePlans.map((plan) => {
                  const goalCount = plan.goals?.length || 0;
                  const completed = plan.goals?.filter((g: any) => g.status === "COMPLETED").length || 0;
                  const progress = goalCount > 0 ? Math.round((plan.goals.reduce((s: number, g: any) => s + (g.progress || 0), 0)) / goalCount) : 0;
                  return (
                    <button
                      key={plan.id}
                      onClick={() => {
                        setSelectedPlan(plan);
                        setShowCreateForm(false);
                      }}
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
                        {formatDate(plan.startDate)} — {formatDate(plan.endDate)}
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

            {/* Create New Plan Button */}
            <button
              onClick={() => {
                setShowCreateForm(true);
                setSelectedPlan(null);
                setPlanForm({
                  title: "",
                  startDate: new Date().toISOString().split("T")[0],
                  endDate: "",
                  vision: "",
                });
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-[#F9ABDF]/30 text-xs font-medium transition-all hover:bg-[#F9ABDF]/10 relative z-10"
              style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              New {PLAN_TYPE_LABELS[activeType]} Plan
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
          {/* Create Plan Form */}
          {showCreateForm && (
            <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-6 mb-6">
              <SpiralBinding />
              <div className="washi-tape washi-tape-top" style={{ width: "100px" }} />

              <div className="relative z-10">
                <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-1">New Plan</p>
                <h2 className="diary-heading text-xl font-bold mb-5">
                  Create a {PLAN_TYPE_LABELS[activeType]} Plan
                </h2>

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
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={planForm.startDate}
                        onChange={(e) => setPlanForm({ ...planForm, startDate: e.target.value })}
                        className="diary-input text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-[0.1em] mb-1.5" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                        End Date
                      </label>
                      <input
                        type="date"
                        value={planForm.endDate || getDefaultEndDate(activeType, planForm.startDate)}
                        onChange={(e) => setPlanForm({ ...planForm, endDate: e.target.value })}
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
                      placeholder="What does success look like for this period?"
                      className="diary-textarea"
                      rows={3}
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

          {/* Selected Plan View */}
          {selectedPlan && !showCreateForm && (
            <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-6">
              <SpiralBinding />
              <div className="washi-tape washi-tape-top" />
              <div className="ribbon-bookmark" />

              {/* Plan Header */}
              <div className="relative z-10 mb-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="diary-date-stamp text-[9px] uppercase tracking-[0.12em] opacity-50 mb-1">
                      {PLAN_TYPE_LABELS[selectedPlan.type]} Plan
                    </p>
                    <h2 className="diary-heading text-2xl font-bold">{selectedPlan.title}</h2>
                    <p className="text-xs mt-1" style={{ color: "var(--diary-ink-light)" }}>
                      {formatDate(selectedPlan.startDate)} — {formatDate(selectedPlan.endDate)}
                    </p>
                  </div>
                  <button
                    onClick={handleDeletePlan}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20"
                    title="Delete plan"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>

                {/* Vision */}
                {selectedPlan.vision && (
                  <div className="mt-3 p-3 rounded-xl" style={{ background: "rgba(248,232,238,0.4)", border: "1px dashed var(--diary-rose)" }}>
                    <p className="text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}>
                      Vision
                    </p>
                    <p className="text-sm italic" style={{ color: "var(--diary-ink)" }}>{selectedPlan.vision}</p>
                  </div>
                )}

                {/* Overall Progress */}
                {selectedPlan.goals?.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-[0.1em]" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                        Overall Progress
                      </span>
                      <span className="text-sm font-bold" style={{ color: "var(--diary-rose-deep)" }}>
                        {overallProgress}%
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-[#F9ABDF]/15 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${overallProgress}%`,
                          background: `linear-gradient(90deg, var(--diary-rose), var(--diary-rose-deep))`,
                        }}
                      />
                    </div>
                    <p className="text-[9px] mt-1" style={{ color: "var(--diary-ink-light)" }}>
                      {selectedPlan.goals.filter((g: any) => g.status === "COMPLETED").length} of {selectedPlan.goals.length} goals completed
                    </p>
                  </div>
                )}
              </div>

              <div className="diary-divider relative z-10">
                <span className="diary-divider-icon">&#10048;</span>
              </div>

              {/* Goals */}
              <div className="relative z-10 mt-4 space-y-4">
                {selectedPlan.goals?.map((goal: any) => {
                  const tasks = goal.tasks ? JSON.parse(goal.tasks) : [];
                  const completedTasks = tasks.filter((t: any) => t.done).length;
                  return (
                    <div
                      key={goal.id}
                      className="p-4 rounded-xl transition-all"
                      style={{
                        background: goal.status === "COMPLETED" ? "rgba(220,252,231,0.3)" : "rgba(248,232,238,0.2)",
                        border: goal.status === "COMPLETED" ? "1px solid rgba(34,197,94,0.2)" : "1px solid var(--diary-rose)",
                        borderStyle: "dashed",
                      }}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold text-sm ${goal.status === "COMPLETED" ? "line-through opacity-60" : ""}`} style={{ color: "var(--diary-ink)" }}>
                              {goal.title}
                            </h4>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${GOAL_STATUS_COLORS[goal.status]}`}>
                              {GOAL_STATUS_LABELS[goal.status]}
                            </span>
                          </div>
                          {goal.description && (
                            <p className="text-xs italic" style={{ color: "var(--diary-ink-light)" }}>{goal.description}</p>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => startEditGoal(goal)}
                            className="p-1.5 rounded-lg hover:bg-[#F9ABDF]/10 transition-colors text-gray-400 hover:text-[#F9ABDF]"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 20h9" />
                              <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteGoal(goal.id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 transition-colors text-gray-400 hover:text-red-500 dark:hover:bg-red-900/20"
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-2">
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
                          <span className="text-xs font-bold" style={{ color: "var(--diary-rose-deep)" }}>
                            {goal.progress}%
                          </span>
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
                        <div className="space-y-1.5 mt-3">
                          {tasks.map((task: any, i: number) => (
                            <button
                              key={i}
                              onClick={() => handleToggleTask(goal, i)}
                              className="w-full flex items-center gap-2.5 text-left group"
                            >
                              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                task.done
                                  ? "bg-green-400 border-green-400"
                                  : "border-[#F9ABDF]/40 group-hover:border-[#F9ABDF]"
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
                          <p className="text-[9px] mt-1" style={{ color: "var(--diary-ink-light)" }}>
                            {completedTasks}/{tasks.length} tasks done
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Add Goal Form */}
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
                        placeholder="Why does this matter? (optional)"
                        className="diary-input text-sm"
                        rows={2}
                      />
                      <div>
                        <label className="block text-[9px] uppercase tracking-[0.1em] mb-1" style={{ color: "var(--diary-ink-light)", fontFamily: "var(--font-diary-heading), serif" }}>
                          Tasks (one per line)
                        </label>
                        <textarea
                          value={goalForm.tasks}
                          onChange={(e) => setGoalForm({ ...goalForm, tasks: e.target.value })}
                          placeholder={"Task 1\nTask 2\nTask 3"}
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
                          onClick={() => {
                            setShowGoalForm(false);
                            setEditingGoal(null);
                            setGoalForm({ title: "", description: "", category: "", tasks: "" });
                          }}
                          className="diary-btn-outline text-xs"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Add Goal Button */}
                {!showGoalForm && !editingGoal && (
                  <button
                    onClick={() => setShowGoalForm(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#F9ABDF]/30 text-xs font-medium transition-all hover:bg-[#F9ABDF]/10"
                    style={{ color: "var(--diary-rose-deep)", fontFamily: "var(--font-diary-heading), serif" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add a Goal
                  </button>
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
            </div>
          )}

          {/* Empty state - no plan selected */}
          {!selectedPlan && !showCreateForm && (
            <div className="notepad-card diary-paper relative pl-8 sm:pl-12 pr-4 sm:pr-6 py-12 text-center">
              <SpiralBinding />
              <div className="washi-tape washi-tape-top" style={{ width: "80px" }} />

              <div className="relative z-10">
                <div className="text-5xl mb-4 opacity-30">
                  {PLAN_TYPE_ICONS[activeType]}
                </div>
                <h3 className="diary-heading text-lg font-bold mb-2">
                  {typePlans.length > 0 ? "Select a Plan" : `Create your first ${PLAN_TYPE_LABELS[activeType].toLowerCase()} plan`}
                </h3>
                <p className="text-xs italic mb-5" style={{ color: "var(--diary-ink-light)" }}>
                  {typePlans.length > 0
                    ? "Choose a plan from the sidebar to view your goals"
                    : "Start planning your journey, one goal at a time"
                  }
                </p>
                {typePlans.length === 0 && (
                  <button
                    onClick={() => {
                      setShowCreateForm(true);
                      setPlanForm({
                        title: "",
                        startDate: new Date().toISOString().split("T")[0],
                        endDate: "",
                        vision: "",
                      });
                    }}
                    className="diary-btn text-xs"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Create {PLAN_TYPE_LABELS[activeType]} Plan
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
