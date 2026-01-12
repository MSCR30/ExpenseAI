import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, TrendingDown, AlertTriangle, Target, BadgeCheck, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/layout/Header';
import { StatCard } from '@/components/dashboard/StatCard';
import { HabitAlertCard } from '@/components/dashboard/HabitAlertCard';
import { ExpenseList } from '@/components/dashboard/ExpenseList';
import { SpendingChart } from '@/components/dashboard/SpendingChart';
import { WeeklyTrendChart } from '@/components/dashboard/WeeklyTrendChart';
import { AddExpenseModal } from '@/components/dashboard/AddExpenseModal';
import { AddSavingModal } from '@/components/dashboard/AddSavingModal';
import { CSVUpload } from '@/components/CSVUpload';
import {
  Category,
  Expense,
  HabitAlert,
  categoryColors,
  type SpendingByCategory,
} from '@/lib/mockData';
import { toast } from '@/components/ui/sonner';
import {
  classifyExpense,
  computeCategoryCap,
  reconcileSavingsLedger,
  recordOptimizedSaving,
  recomputeAlerts,
  type SavingsSummary,
  requestGeminiAnalysis,
  requestGeminiChat,
  type AnalysisResult,
} from '@/services/ai';
import { useAuth } from '@/context/AuthContext';
import { getExpenses, addExpense, deleteExpense } from '@/services/database';

const Index = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isCSVOpen, setIsCSVOpen] = useState(false);
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [alerts, setAlerts] = useState<HabitAlert[]>([]);
  const [savedSummary, setSavedSummary] = useState<SavingsSummary>({ total: 0, prevented: 0, reduced: 0, optimized: 0 });
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [botLoading, setBotLoading] = useState(false);
  const [botInput, setBotInput] = useState('');
  const [botMessages, setBotMessages] = useState<Array<{ role: 'ai' | 'user'; text: string }>>([]);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);
  const { user } = useAuth();
  const loaderTimerRef = useRef<NodeJS.Timeout | null>(null);

  const userKey = user?.email ? user.email.toLowerCase() : 'guest';

  // Helper function to start global loading with exactly 25 second duration
  const startGlobalLoader = () => {
    // Clear any existing timer
    if (loaderTimerRef.current) {
      clearTimeout(loaderTimerRef.current);
    }
    // Set loader immediately
    setIsGlobalLoading(true);
    // Set timer to hide after exactly 25 seconds
    loaderTimerRef.current = setTimeout(() => {
      setIsGlobalLoading(false);
      loaderTimerRef.current = null;
    }, 25000);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (loaderTimerRef.current) {
        clearTimeout(loaderTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const expenses = await getExpenses();
        setExpenses(expenses);
        const computedAlerts = recomputeAlerts(expenses);
        setAlerts(computedAlerts);
      } catch (error) {
        console.error('Failed to load expenses:', error);
        setExpenses([]);
        setAlerts([]);
      }
    };
    loadExpenses();
  }, []);

  useEffect(() => {
    const { summary } = reconcileSavingsLedger({ userKey, expenses });
    setSavedSummary(summary);
  }, [expenses, userKey]);

  useEffect(() => {
    // Refresh background analysis whenever expenses change
    (async () => {
      const analysis = await requestGeminiAnalysis(expenses);
      setLastAnalysis(analysis);
      if (isBotOpen && analysis.suggestions?.length) {
        setBotMessages((msgs) => [{ role: 'ai', text: analysis.suggestions[0] }, ...msgs]);
      }
    })();
  }, [expenses]);

  const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const impulseSpending = expenses.filter(e => e.isImpulse).reduce((sum, exp) => sum + exp.amount, 0);
  const badAlerts = alerts.filter((a) => a.severity === 'bad');
  const potentialSavings = badAlerts.reduce((sum, alert) => sum + alert.savingPotential, 0);
  const [applySavings, setApplySavings] = useState(false);
  const displayedTotal = Math.max(0, totalSpent - (applySavings ? potentialSavings : 0));
  const savingsPct = totalSpent > 0 ? ((applySavings ? potentialSavings : 0) / totalSpent) * 100 : 0;

  const spendingByCategory: SpendingByCategory[] = (() => {
    const totals: Record<Category, number> = {
      food: 0,
      transport: 0,
      shopping: 0,
      entertainment: 0,
      bills: 0,
      subscriptions: 0,
      groceries: 0,
      health: 0,
      other: 0,
    };
    expenses.forEach((e) => {
      totals[e.category] += e.amount;
    });
    const total = Object.values(totals).reduce((s, n) => s + n, 0) || 0;
    return (Object.keys(totals) as Category[])
      .filter((cat) => totals[cat] > 0)
      .map((cat) => ({
        category: cat,
        amount: totals[cat],
        percentage: total ? parseFloat(((totals[cat] / total) * 100).toFixed(1)) : 0,
        color: categoryColors[cat],
      }));
  })();

  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
    const totals: Record<typeof days[number], number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 };
    expenses.forEach((e) => {
      const d = new Date(e.date);
      const key = days[d.getDay()];
      totals[key] += e.amount;
    });
    const order = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
    return order.map((day) => ({ day, amount: totals[day] }));
  })();

  const handleAddExpense = async (newExpense: { description: string; amount: number; category: Category }) => {
    // Close modal immediately
    setIsModalOpen(false);
    // Show loading overlay
    setIsGlobalLoading(true);

    const now = new Date();

    let finalAmount = newExpense.amount;
    if (applySavings) {
      const cap = computeCategoryCap({ expenses, alerts: badAlerts, category: newExpense.category, now });
      if (cap !== null) {
        const monthTotal = expenses
          .filter((e) => {
            const d = new Date(e.date);
            return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && e.category === newExpense.category;
          })
          .reduce((s, e) => s + e.amount, 0);
        const remaining = Math.max(0, cap - monthTotal);
        if (remaining <= 0) {
          toast('Spending capped', { description: `This ${newExpense.category} expense was blocked. ₹${newExpense.amount.toFixed(0)} counted as Saved.` });
          setIsGlobalLoading(false);
          return;
        }
        if (newExpense.amount > remaining) {
          const blocked = newExpense.amount - remaining;
          finalAmount = remaining;
          toast('Spending optimized', { description: `Reduced by ₹${blocked.toFixed(0)} and counted as Saved.` });
        }
      }
    }

    const expenseBase: Omit<Expense, 'id'> = {
      description: newExpense.description,
      amount: finalAmount,
      category: newExpense.category,
      date: now,
      isImpulse: false,
      source: 'MANUAL',
    };
    const { flags } = classifyExpense(expenseBase as Expense, expenses);
    const expenseToAdd = { ...expenseBase, isImpulse: flags.impulse };

    try {
      const id = await addExpense(expenseToAdd);
      const newExpenseWithId: Expense = { ...expenseToAdd, id };
      const nextExpenses = [newExpenseWithId, ...expenses];
      setExpenses(nextExpenses);
      const nextAlerts = recomputeAlerts(nextExpenses);
      setAlerts(nextAlerts);
      const { summary } = reconcileSavingsLedger({ userKey, expenses: nextExpenses, now });
      setSavedSummary(summary);
      // Trigger background analysis update
      requestGeminiAnalysis(nextExpenses).then(setLastAnalysis).catch(() => {});
      toast.success('Expense added', {
        description: `${newExpenseWithId.description} - ₹${newExpenseWithId.amount.toFixed(0)} (${newExpenseWithId.category})`,
      });
    } catch (error) {
      console.error('Failed to add expense:', error);
      toast.error('Failed to add expense', { description: 'Please try again.' });
    } finally {
      // Hide loading after processing completes
      setIsGlobalLoading(false);
    }
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
    toast('Alert dismissed', { description: 'This habit alert has been removed from the list.' });
  };

  const handleDeleteExpense = async (id: string) => {
    const target = expenses.find((e) => e.id === id);
    if (!target) return;
    if (target.source !== 'MANUAL') return; // guard

    try {
      await deleteExpense(id);
      const next = expenses.filter((e) => e.id !== id);
      setExpenses(next);
      const nextAlerts = recomputeAlerts(next);
      setAlerts(nextAlerts);
      const { summary } = reconcileSavingsLedger({ userKey, expenses: next });
      setSavedSummary(summary);
      requestGeminiAnalysis(next).then(setLastAnalysis).catch(() => {});
      toast('Expense deleted', { description: 'Dashboard recalculated.' });
    } catch (error) {
      console.error('Failed to delete expense:', error);
      toast.error('Failed to delete expense', { description: 'Please try again.' });
    }
  };

  const handleCSVUploadSuccess = (newExpenses: Expense[]) => {
    const nextExpenses = [...newExpenses, ...expenses];
    setExpenses(nextExpenses);
    const nextAlerts = recomputeAlerts(nextExpenses);
    setAlerts(nextAlerts);
    const { summary } = reconcileSavingsLedger({ userKey, expenses: nextExpenses });
    setSavedSummary(summary);
    requestGeminiAnalysis(nextExpenses).then(setLastAnalysis).catch(() => {});
    // Hide loading after CSV processing completes
    setIsGlobalLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed top-0 left-0 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="fixed top-0 right-0 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="fixed bottom-0 left-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

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

      {/* Global Loading Overlay */}
      {isGlobalLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-lg font-semibold">Please wait a moment while we process your expenses…</p>
          </div>
        </motion.div>
      )}

      <Header alertCount={alerts.length} />

      <main className="container mx-auto px-4 py-6 pb-24 relative z-10">
        {/* Stats Grid */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          <StatCard
            title="Total Spent"
            value={`₹${displayedTotal.toFixed(0)}`}
            subtitle={applySavings ? "This month (after savings)" : "This month"}
            icon={Wallet}
            trend={{ value: Math.round(applySavings ? savingsPct : 0), isPositive: applySavings }}
          />
          <StatCard
            title="Impulse Spending"
            value={`₹${impulseSpending.toFixed(0)}`}
            subtitle={`${((impulseSpending / totalSpent) * 100).toFixed(0)}% of total`}
            icon={TrendingDown}
            variant="warning"
          />
          <StatCard
            title="Bad Habits"
            value={badAlerts.length.toString()}
            subtitle="Detected patterns"
            icon={AlertTriangle}
            variant="default"
          />
          <StatCard
            title="Potential Savings"
            value={`₹${potentialSavings}`}
            subtitle="Per month"
            icon={Target}
            variant="primary"
          />
          <div className="lg:col-span-4">
            <Button
              variant={applySavings ? "outline" : "default"}
              onClick={() => {
                setApplySavings((v) => !v);
                if (!applySavings) {
                  toast.success('Potential savings applied', { description: `New total: ₹${Math.max(0, totalSpent - potentialSavings).toFixed(0)}` });
                } else {
                  toast('Savings removed', { description: `Total restored: ₹${totalSpent.toFixed(0)}` });
                }
              }}
            >
              {applySavings ? 'Remove Applied Savings' : 'Apply Potential Savings'}
            </Button>
          </div>
        </motion.section>

        {/* Alerts Section */}
        {badAlerts.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold font-display text-foreground">
                🚨 Bad Habit Alerts
              </h2>
              <Button variant="ghost" size="sm" className="text-muted-foreground">
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {badAlerts.map((alert, index) => (
                <HabitAlertCard 
                  key={alert.id} 
                  alert={alert} 
                  onDismiss={handleDismissAlert}
                  index={index}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* Charts Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2"
        >
          <SpendingChart data={spendingByCategory} />
          <WeeklyTrendChart data={weeklyData} />
        </motion.section>

        {/* Recent Expenses */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold font-display text-foreground">
              Recent Expenses
            </h2>
            <Button variant="ghost" size="sm" className="text-muted-foreground">
              See All
            </Button>
          </div>
          <ExpenseList expenses={expenses.slice(0, 6)} onDelete={handleDeleteExpense} />
        </motion.section>
      </main>

      {/* Floating Actions (bottom-left) */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.5, type: 'spring' }}
        className="fixed bottom-6 left-6 flex flex-col gap-3"
      >
        <Button
          onClick={() => setIsModalOpen(true)}
          disabled={isGlobalLoading}
          className="rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all px-5 h-12"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>
        <Button
          onClick={() => setIsCSVOpen(true)}
          disabled={isGlobalLoading}
          className="rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all px-5 h-12"
        >
          <Upload className="h-5 w-5 mr-2" />
          Upload CSV
        </Button>
        <Button
          onClick={() => {
            setIsSavedOpen(true);
          }}
          className="rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all px-5 h-12 text-primary-foreground"
        >
          <BadgeCheck className="h-5 w-5 mr-2" />
          Saved
        </Button>
        <Button
          onClick={async () => {
            setIsBotOpen((v) => !v);
            if (!isBotOpen) {
              setBotLoading(true);
              try {
                const analysis = await requestGeminiAnalysis(expenses);
                setLastAnalysis(analysis);
                setBotMessages([
                  { role: 'ai' as const, text: analysis.shortExplanations?.[0] || 'I will watch your spending patterns and suggest gentle improvements.' },
                  ...((analysis.suggestions?.slice(0, 2).map((s) => ({ role: 'ai' as const, text: s })) as Array<{ role: 'ai' | 'user'; text: string }>) || []),
                ]);
              } finally {
                setBotLoading(false);
              }
            }
          }}
          className="rounded-full gradient-primary shadow-glow hover:shadow-xl transition-all px-5 h-12 text-primary-foreground"
        >
          AI Suggestions
        </Button>
      </motion.div>

      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddExpense}
      />
      <AddSavingModal isOpen={isSavedOpen} onClose={() => setIsSavedOpen(false)} summary={savedSummary} />

      {/* CSV Upload Modal */}
      {isCSVOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-card rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload Bank Statement</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsCSVOpen(false)}>
                ✕
              </Button>
            </div>
            <CSVUpload
              existingExpenses={expenses}
              onUploadSuccess={(expenses) => {
                // Close modal immediately
                setIsCSVOpen(false);
                // Show loading overlay
                setIsGlobalLoading(true);
                // Process the CSV upload
                handleCSVUploadSuccess(expenses);
              }}
              onComplete={() => {}}
            />
          </div>
        </div>
      )}

      {/* Lightweight chat panel (overlay), not a new page/layout */}
      {isBotOpen && (
        <div className="fixed bottom-24 left-6 z-40 w-[min(420px,90vw)] rounded-2xl border border-border bg-card shadow-xl">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="text-sm font-semibold">AI Suggestions</div>
            <Button variant="ghost" size="sm" onClick={() => setIsBotOpen(false)}>Close</Button>
          </div>
          <div className="max-h-72 overflow-auto p-4 space-y-3">
            {botLoading && <div className="text-sm text-muted-foreground">Analyzing your expenses…</div>}
            {(!botLoading && botMessages.length === 0) && (
              <div className="text-sm text-muted-foreground">No messages yet. Ask for tips on a category or spending habit.</div>
            )}
            {botMessages.map((m, i) => (
              <div key={i} className={m.role === 'ai' ? 'text-sm text-foreground' : 'text-sm text-primary'}>
                {m.text}
              </div>
            ))}
          </div>
          <form
            className="flex gap-2 p-3 border-t border-border"
            onSubmit={async (e) => {
              e.preventDefault();
              const q = botInput.trim();
              if (!q) return;
              setBotMessages((msgs) => [...msgs, { role: 'user', text: q }]);
              setBotInput('');
              try {
                const { reply } = await requestGeminiChat(expenses, q);
                setBotMessages((msgs) => [...msgs, { role: 'ai', text: reply }]);
              } catch {
                setBotMessages((msgs) => [...msgs, { role: 'ai', text: 'I had trouble reaching the AI service. Try again shortly.' }]);
              }
            }}
          >
            <input
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Ask for help: e.g., reduce food delivery"
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
            />
            <Button type="submit" className="text-primary-foreground">Send</Button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Index;
