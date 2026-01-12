import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast({ title: "Email required", description: "Please enter your email address" });
    setLoading(true);
    try {
      await resetPassword(email);
      setSent(true);
      toast({ title: "Reset email sent", description: "If that account exists you will receive an email shortly. Check your spam folder." });
      // Do not redirect immediately; show confirmation so users know what to expect
    } catch (err: any) {
      if (err?.message?.includes("auth/network-request-failed")) {
        toast({ title: "Network error", description: "Cannot reach Firebase. Check your internet or firewall and try again." });
      } else {
        toast({ title: "Failed to send", description: err?.message || String(err) });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">Reset your password</h1>
          <p className="text-gray-400 mt-2">Enter the email associated with your account</p>
        </div>

        <div className="rounded-3xl bg-white/10 backdrop-blur-xl border border-white/20 p-8 shadow-2xl">
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 h-12 bg-white/5 border-white/20 text-white" />
              </div>

              <Button type="submit" className="w-full h-12 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-xl" disabled={loading}>
                {loading ? "SENDING..." : "Send reset link"}
              </Button>

              <p className="text-sm text-gray-400 text-center">
                Remembered your password? <Link to="/login" className="text-cyan-300 font-semibold">Sign in</Link>
              </p>
            </form>
          ) : (
            <div className="text-center py-8">
              <h3 className="text-lg font-semibold text-white">Check your email</h3>
              <p className="text-sm text-gray-300 mt-3">If an account exists for <span className="font-semibold text-white">{email}</span>, you'll receive password reset instructions shortly. Check your spam folder.</p>
              <div className="mt-6 flex justify-center gap-3">
                <Button onClick={() => navigate('/login')} className="bg-white text-slate-900">Back to sign in</Button>
                <Button variant="ghost" onClick={() => setSent(false)}>Send again</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}