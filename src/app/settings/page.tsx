"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useTheme } from "@/components/ThemeProvider";

export default function SettingsPage() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  const handleExport = async () => {
    const [opps, diary] = await Promise.all([
      fetch("/api/opportunities").then((r) => r.json()),
      fetch("/api/diary").then((r) => r.json()),
    ]);
    const blob = new Blob([JSON.stringify({ opportunities: opps, diaryEntries: diary }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `opportunity-tracker-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold font-display">
          <span className="text-[#F9ABDF]">Settings</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Appearance</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${
              theme === "dark" ? "bg-[#F9ABDF]" : "bg-gray-300"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 ${
                theme === "dark" ? "translate-x-7" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Profile</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
            <input
              type="email"
              value={session?.user?.email || ""}
              disabled
              className="w-full px-4 py-3 border border-[#F9ABDF]/20 rounded-xl bg-gray-50 text-gray-500 dark:bg-gray-800 dark:border-[#F9ABDF]/10 dark:text-gray-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-3 border border-[#F9ABDF]/30 rounded-xl focus:ring-2 focus:ring-[#F9ABDF] focus:border-transparent outline-none transition-all dark:bg-gray-800 dark:border-[#F9ABDF]/20 dark:text-white"
              rows={3}
              placeholder="Tell us about yourself..."
            />
          </div>
          {message && (
            <p className="text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {message}
            </p>
          )}
          <button
            onClick={() => {
              setSaving(true);
              setTimeout(() => {
                setSaving(false);
                setMessage("Profile updated!");
                setTimeout(() => setMessage(""), 3000);
              }, 1000);
            }}
            className="bg-[#F9ABDF] text-black px-6 py-3 rounded-full hover:bg-[#e891c7] transition-all duration-300 font-medium tracking-wide"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Data */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 mb-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Data</h2>
        <div className="space-y-3">
          <button
            onClick={handleExport}
            className="w-full px-6 py-3 bg-white text-black border-2 border-[#F9ABDF] rounded-full hover:bg-[#F9ABDF] hover:text-black transition-all duration-300 font-medium tracking-wide dark:bg-gray-900 dark:text-white dark:border-[#F9ABDF] dark:hover:bg-[#F9ABDF] dark:hover:text-black"
          >
            Export All Data (JSON)
          </button>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white rounded-2xl border border-[#F9ABDF]/20 shadow-sm p-6 dark:bg-gray-900 dark:border-[#F9ABDF]/10">
        <h2 className="font-semibold text-lg font-display mb-4 text-[#F9ABDF]">Account</h2>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full px-6 py-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 font-medium tracking-wide"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
