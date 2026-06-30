"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Modal from "@/components/Modal";

export default function Home() {
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const router = useRouter();

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "register") {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }
    }

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("Invalid email or password");
    } else {
      router.push("/dashboard");
    }
    setLoading(false);
  };

  const openAuth = (authMode: "login" | "register") => {
    setMode(authMode);
    setError("");
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-black overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{
            background: "radial-gradient(circle, #F9ABDF 0%, transparent 70%)",
            left: mousePos.x / 10 - 100,
            top: mousePos.y / 10 - 100,
            transition: "left 0.3s ease-out, top 0.3s ease-out",
          }}
        />
        <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
        
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#F9ABDF 1px, transparent 1px), linear-gradient(90deg, #F9ABDF 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shrink-0">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="text-white text-lg sm:text-xl font-bold tracking-tight font-display hidden sm:block">Opportunity Tracker</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => openAuth("login")} className="text-white/70 hover:text-white transition-colors px-3 sm:px-4 py-2 text-sm sm:text-base">
            Sign In
          </button>
          <button onClick={() => openAuth("register")} className="btn-accent text-sm sm:text-base px-4 sm:px-6">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="animate-slide-up stagger-1 mb-4 sm:mb-6">
            <span className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-sm rounded-full text-primary text-xs sm:text-sm font-medium border border-white/10">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Track every opportunity in one place
            </span>
          </div>

          <h1 className="animate-slide-up stagger-2 font-display text-4xl sm:text-6xl md:text-8xl font-bold text-white mb-6 sm:mb-8 leading-[0.9] tracking-tight">
            Your Journey,
            <br />
            <span className="text-gradient">Organized</span>
          </h1>

          <p className="animate-slide-up stagger-3 text-base sm:text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-8 sm:mb-12 leading-relaxed">
            Fellowships, scholarships, research programs, mentorships — track deadlines, 
            manage applications, and document your path to success.
          </p>

          <div className="animate-slide-up stagger-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button onClick={() => openAuth("register")} className="btn-accent text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto">
              Start Tracking Free
            </button>
            <button onClick={() => openAuth("login")} className="btn-secondary border-white/20 text-white hover:bg-white hover:text-black text-base sm:text-lg px-8 sm:px-10 py-3 sm:py-4 w-full sm:w-auto">
              Sign In
            </button>
          </div>
        </div>

        {/* Feature cards */}
        <div className="animate-slide-up stagger-5 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-12 sm:mt-20 max-w-4xl w-full">
          {[
            { icon: "🎯", label: "Track Opportunities", desc: "Fellowships & more" },
            { icon: "📅", label: "Smart Calendar", desc: "Never miss a deadline" },
            { icon: "📓", label: "Personal Diary", desc: "Document your journey" },
            { icon: "📊", label: "Analytics", desc: "Visualize progress" },
          ].map((feature, i) => (
            <div
              key={i}
              className="group p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 hover:border-primary/30 transition-all duration-300 cursor-default"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-white font-semibold text-xs sm:text-sm">{feature.label}</h3>
              <p className="text-white/40 text-[10px] sm:text-xs mt-1">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Bottom decorative element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      {/* Auth Modal */}
      <Modal isOpen={showAuth} onClose={() => setShowAuth(false)}>
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-display">
              {mode === "login" ? "Welcome Back" : "Create Account"}
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              {mode === "login" ? "Sign in to continue your journey" : "Start tracking your opportunities today"}
            </p>
          </div>

          {/* Mode Toggle */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "login" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                mode === "register" ? "bg-white shadow-sm text-black" : "text-gray-500"
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm animate-slide-down">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="John Doe"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Please wait...
                </span>
              ) : mode === "login" ? "Sign In" : "Create Account"}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              className="text-primary-dark font-semibold hover:underline"
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </div>
      </Modal>
    </div>
  );
}
