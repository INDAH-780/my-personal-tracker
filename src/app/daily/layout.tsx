"use client";

import AppShell from "@/components/AppShell";

export default function DailyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="relative min-h-screen">
        <div
          className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, #f9abdf 1px, transparent 1px),
              radial-gradient(circle at 80% 70%, #e8a0b8 1px, transparent 1px)`,
            backgroundSize: "60px 60px, 80px 80px",
          }}
        />
        {children}
      </div>
    </AppShell>
  );
}
