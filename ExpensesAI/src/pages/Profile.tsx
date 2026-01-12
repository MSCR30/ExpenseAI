import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";

export default function Profile() {
  const { user, updateEmail, updatePassword } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onUpdateEmail = async () => {
    if (!email) return toast({ title: "Email required", description: "Please enter an email" });
    setLoading(true);
    try {
      await updateEmail(email);
      toast({ title: "Email updated", description: "Your email has been updated successfully" });
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  const onUpdatePassword = async () => {
    if (!password || password.length < 6) return toast({ title: "Invalid password", description: "Password must be at least 6 characters" });
    if (password !== confirmPassword) return toast({ title: "Mismatch", description: "Passwords do not match" });
    setLoading(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirmPassword("");
      toast({ title: "Password updated", description: "Your password was updated" });
    } catch (e: any) {
      toast({ title: "Failed to update", description: e.message || String(e) });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-gray-300">You need to be signed in to view your profile.</p>
          <div className="mt-6">
            <Button onClick={() => navigate('/login')}>Sign in</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      {/* Gradient overlay for depth */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-900/50 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10">
        <Header />

        <main className="container mx-auto px-6 py-16 text-white">
          <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="font-semibold text-lg mb-3">Account details</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <Label>Email</Label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2" />
                </div>
                <div>
                  <Label>UID</Label>
                  <Input value={user.uid} disabled className="mt-2" />
                </div>
                <div className="mt-4">
                  <Button onClick={onUpdateEmail} disabled={loading}>
                    Update Email
                  </Button>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h2 className="font-semibold text-lg mb-3">Change password</h2>
              <div className="space-y-3 text-sm text-gray-300">
                <div>
                  <Label>New password</Label>
                  <Input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-2" />
                </div>
                <div>
                  <Label>Confirm password</Label>
                  <Input value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} type="password" className="mt-2" />
                </div>
                <div className="mt-4">
                  <Button onClick={onUpdatePassword} disabled={loading}>
                    Update Password
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
