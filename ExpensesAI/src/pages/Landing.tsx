import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Lock, Bell, ArrowRight, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import HeroMockup from "@/components/HeroMockup";

export default function Landing() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 pointer-events-none"></div>

      {/* Decorative mesh */}
      <svg className="fixed left-[-20%] top-20 w-[700px] h-[700px] opacity-20 pointer-events-none hidden md:block" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="decGrad" x1="0" x2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        <g stroke="url(#decGrad)" strokeWidth="1" strokeOpacity="0.35">
          {Array.from({ length: 30 }).map((_, i) => (
            <line key={i} x1={i * 20} y1="0" x2="0" y2={i * 20} strokeOpacity="0.08" />
          ))}
        </g>
      </svg>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes glow {
          0%, 100% { text-shadow: 0 0 20px rgba(34, 197, 94, 0.5); }
          50% { text-shadow: 0 0 30px rgba(34, 197, 94, 0.8); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-white/10 bg-slate-900/80 backdrop-blur-xl">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50">
              <span className="text-white font-bold text-sm">EA</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ExpenseAI</h1>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Features</a>
            <a href="#security" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Security</a>
            <a href="#pricing" className="text-gray-300 hover:text-cyan-400 transition-colors text-sm font-medium">Pricing</a>
            <Button
              variant="ghost"
              className="text-gray-300 hover:text-white hover:bg-white/10"
              onClick={() => navigate("/login")}
            >
              Log in
            </Button>
            <Button
              className="bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated hover:from-cyan-600 hover:to-blue-600 text-white font-semibold shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all duration-300 focus-ring"
              onClick={() => navigate("/signup")}
            >
              Get Started <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => navigate("/login")}>Log in</Button>
            <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated focus-ring" onClick={() => navigate("/signup")}>Sign up</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="container mx-auto px-6 py-32 min-h-[90vh] flex items-center">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8 items-center" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
            {/* Left: Text content */}
            <div className="space-y-8 text-center md:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full mb-4 hover:border-cyan-500/50 transition-all duration-300">
                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                <span className="text-cyan-300 text-sm font-medium">✨ AI-Powered Financial Management</span>
              </div>

              {/* Main heading with gradient */}
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
                <span className="text-white">The future of</span>
                <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-green-400 bg-clip-text text-transparent animate-glow">
                  expense tracking
                </span>
                <br />
                <span className="text-white">starts here</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-gray-300 max-w-2xl leading-relaxed">
                Automate budgets, track expenses with AI-powered insights, and take control of your financial future with <span className="text-cyan-300 font-semibold">next-generation tools</span>.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start pt-6">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated text-white font-bold px-8 py-5 text-lg rounded-xl shadow-2xl hover:shadow-cyan-500/70 transition-all duration-300 hover:scale-105 group focus-ring"
                  onClick={() => navigate("/signup")}
                >
                  Get Started Free
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="flex flex-col sm:flex-row gap-8 pt-8 text-gray-400 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">✓</div>
                  <span>100% Secure & Encrypted</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">✓</div>
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center">✓</div>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </div>

            {/* Right: Mockup */}
            <div className="flex justify-center md:justify-end">
              <HeroMockup />
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <ChevronDown size={28} className="text-cyan-400" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="container mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Powerful Features for <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Smart Spending</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">Everything you need to manage finances intelligently</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📊", title: "AI Analytics", desc: "Get intelligent insights into your spending patterns" },
              { icon: "🎯", title: "Smart Budgets", desc: "Set and manage budgets with AI recommendations" },
              { icon: "⚡", title: "Real-time Sync", desc: "Instant updates across all your devices" },
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-500 backdrop-blur-sm hover:shadow-2xl hover:shadow-cyan-500/20 hover:-translate-y-2">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Security Section */}
        <section id="security" className="container mx-auto px-6 py-20">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-4">
              Your data is <span className="bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">fortress-secure</span>
            </h2>
            <p className="text-xl text-gray-400 mb-12">Enterprise-grade security features protect your financial data</p>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Features List */}
              <div className="space-y-8">
                {[
                  { icon: Smartphone, title: "Multi-Device Sessions", desc: "Monitor and manage all active sessions" },
                  { icon: Lock, title: "Biometric Auth", desc: "Fingerprint & face recognition for secure access" },
                  { icon: Bell, title: "Real-time Alerts", desc: "Instant notifications for security events" },
                ].map((feature, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="flex-shrink-0 mt-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 group-hover:border-cyan-400 group-hover:shadow-lg group-hover:shadow-cyan-500/50 transition-all duration-300">
                        <feature.icon className="h-6 w-6 text-cyan-300" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">{feature.title}</h3>
                      <p className="text-gray-400 text-sm mt-1">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Sessions Card */}
              <div className="rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-8 hover:border-cyan-500/50 transition-all duration-500 shadow-2xl">
                <h4 className="text-white font-bold mb-6 text-lg">Active Sessions</h4>
                <div className="space-y-4">
                  {[
                    { device: "Chrome - Mumbai", status: "Active now", color: "bg-green-500/30 border-green-400/50", textColor: "text-green-400" },
                    { device: "iPhone - Delhi", status: "2 hours ago", color: "bg-blue-500/30 border-blue-400/50", textColor: "text-blue-400" },
                    { device: "Unknown - Bangalore", status: "Block", color: "bg-orange-500/30 border-orange-400/50", textColor: "text-orange-400" },
                  ].map((session, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${session.color} border flex items-center justify-center text-sm font-bold ${session.textColor}`}>
                          {i === 0 ? "✓" : i === 1 ? "📱" : "⚠"}
                        </div>
                        <div>
                          <p className="text-white text-sm font-semibold">{session.device}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-semibold ${session.textColor}`}>{session.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-6 py-20">
          <div className="rounded-3xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 p-12 md:p-16 text-center backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ready to take control of your finances?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Join thousands of users managing their money smarter</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-cyan-500 to-blue-500 cta-animated hover:from-cyan-600 hover:to-blue-600 text-white font-bold px-10 py-7 rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 transition-all hover:scale-105 focus-ring"
                onClick={() => navigate("/signup")}
              >
                Get Started Free
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="border-t border-white/10 bg-gradient-to-b from-transparent to-blue-950/30 mt-20">
          <div className="container mx-auto px-6 py-12">
            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500">
                    <span className="text-white text-xs font-bold flex items-center justify-center h-full">EA</span>
                  </div>
                  <span className="text-white font-bold">ExpenseAI</span>
                </div>
                <p className="text-gray-400 text-sm">Transforming financial management with AI</p>
              </div>
              <div className="flex gap-8">
                <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Privacy</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Terms</a>
                <a href="#" className="text-gray-400 hover:text-cyan-400 text-sm transition-colors">Contact</a>
              </div>
              <div className="flex gap-4 justify-end">
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">f</a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">𝕏</a>
                <a href="#" className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-400/50 transition-all">in</a>
              </div>
            </div>
            <div className="border-t border-white/10 pt-8">
              <p className="text-gray-500 text-sm text-center">© 2026 ExpenseAI. All rights reserved</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
