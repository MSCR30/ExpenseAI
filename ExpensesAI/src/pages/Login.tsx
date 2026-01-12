import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";

const Login = () => {
  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation() as any;
  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

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
      `}</style>

      <div className="w-full max-w-md relative">
        {/* Logo and branding */}
        <div className="text-center mb-12">
          <Link to="/" className="inline-flex items-center gap-3 mb-8 group">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/50 group-hover:shadow-cyan-500/70 transition-all duration-300 group-hover:scale-110">
              <span className="text-white font-bold text-lg">EA</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">ExpenseAI</span>
          </Link>
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-gray-400 text-base">Log in to your account to continue</p>
        </div>

        {/* Floating card with glassmorphism effect */}
        <div className="relative z-10 rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl hover:border-white/30 transition-all duration-300">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white font-medium text-sm block">Email address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:bg-white/10 h-12 rounded-xl transition-all duration-200"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-white font-medium text-sm">Password</Label>
                <Link to="/forgot-password" className="text-cyan-400 hover:text-cyan-300 text-xs font-semibold transition-colors">
                  FORGOT PASSWORD?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400/60 group-focus-within:text-cyan-400 transition-colors w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-12 pr-12 bg-white/5 border-white/20 text-white placeholder:text-gray-500 focus:border-cyan-400/50 focus:bg-white/10 h-12 rounded-xl transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-300 text-sm flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}
            
            <Button
              className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 disabled:opacity-50 transition-all duration-300 hover:scale-105 active:scale-95 group"
              type="submit"
              disabled={loading}
            >
              {loading ? "SIGNING IN..." : "SIGN IN"}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-gray-400">OR CONTINUE WITH</span>
            </div>
          </div>

          {/* Social Login Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              type="button"
              onClick={handleGoogle}
              className="h-11 w-full bg-white text-slate-900 font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-3"
              disabled={loading}
              aria-label="Continue with Google"
            >
              <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 278.4c0-18.5-1.5-37.6-4.6-55.6H272v105.3h147.1c-6.4 34.6-25 64-53.4 83.6v69h86.3c50.4-46.5 80.5-115 80.5-201.3z" fill="#4285F4"/>
                <path d="M272 544.3c72.6 0 133.6-24 178.1-65.4l-86.3-69c-24 16.2-54.6 25.8-91.8 25.8-70.6 0-130.5-47.6-151.9-111.6H30.5v70.4C74.7 486.9 166 544.3 272 544.3z" fill="#34A853"/>
                <path d="M120.1 327.1c-10.8-31.2-10.8-64.6 0-95.8V160.9H30.5c-39.4 76.5-39.4 167.1 0 243.6l89.6-77.4z" fill="#FBBC05"/>
                <path d="M272 107.7c38.8 0 73.6 13.3 101.1 39l75.8-75.8C405.6 26.2 345.4 0 272 0 166 0 74.7 57.4 30.5 160.9l89.6 70.9C141.5 155.3 201.4 107.7 272 107.7z" fill="#EA4335"/>
              </svg>
              <span className="text-sm">Continue with Google</span>
            </Button>
          </div>

          {/* Signup Link */}
          <p className="text-center text-gray-400 text-sm mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-cyan-400 hover:text-cyan-300 font-bold transition-colors">
              CREATE ONE
            </Link>
          </p>
        </div>

        {/* Trust Footer */}
        <div className="text-center mt-8 text-gray-500 text-xs space-y-2">
          <p className="flex items-center justify-center gap-2">
            <span>🔒</span> Your data is encrypted and secure
          </p>
          <p>© 2026 ExpenseAI. All rights reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
