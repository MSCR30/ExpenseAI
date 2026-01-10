import type { Category, Expense, HabitAlert } from "@/lib/mockData";

export interface AIFlags {
  impulse: boolean;
  habit: boolean;
}

export interface ClassifyResult {
  flags: AIFlags;
  alert?: HabitAlert; // bad alert when applicable
}

export type SavingType = "PREVENTED" | "REDUCED" | "OPTIMIZED";

export interface SavingEntry {
  id: string;
  amount: number;
  sourceExpenseCategory: Category;
  reason: string;
  type: SavingType;
  date: string; // YYYY-MM-DD
  linkedExpenseId: string | null;
  createdAt: string;
}

export interface SavingsSummary {
  total: number;
  prevented: number;
  reduced: number;
  optimized: number;
}

export type RiskLevel = "Low" | "Medium" | "High";
export interface ExpenseInsight {
  category: Category;
  subType?: string;
  intent: "Planned" | "Impulse" | "Emotional" | "Unknown";
  risk: RiskLevel;
  habitLikelihood: number; // 0..1
  reasoning: string;
}

export interface AnalysisResult {
  insights: ExpenseInsight[];
  suggestions: string[];
  shortExplanations: string[];
  metrics: {
    impulseSpending: number;
    badHabitCount: number;
    potentialSavings: number;
  };
}

// Heuristic stub: replace with backend model calls later.
export function classifyExpense(expense: Expense, existing: Expense[]): ClassifyResult {
  const nonEssential: Category[] = ["food", "shopping", "entertainment"];
  const impulse = nonEssential.includes(expense.category) && expense.amount > 500;

  // Simple habit check: > 4 occurrences in same category this month
  const month = expense.date.getMonth();
  const year = expense.date.getFullYear();
  const freq = existing.filter(
    (e) => e.category === expense.category && e.date.getMonth() === month && e.date.getFullYear() === year,
  ).length;
  const habit = freq >= 4;

  let alert: HabitAlert | undefined;
  if (impulse) {
    alert = {
      id: `al_${Date.now()}`,
      title: "Impulse spending detected",
      description: `This ${expense.category} purchase seems impulsive based on amount and category.`,
      severity: "bad",
      category: expense.category,
      savingPotential: Math.round(Math.min(expense.amount * 0.3, 1000)),
      suggestion: "Consider a 24-hour cooling-off period before similar purchases.",
      createdAt: new Date(),
    };
  }

  return { flags: { impulse, habit }, alert };
}

export function recomputeAlerts(expenses: Expense[]): HabitAlert[] {
  // Recreate bad alerts from all expenses using the same logic to stay consistent.
  const alerts: HabitAlert[] = [];
  for (const e of expenses) {
    const { alert } = classifyExpense(e, expenses);
    if (alert) alerts.push(alert);
  }
  // De-duplicate by description+day to avoid spam
  const seen = new Set<string>();
  return alerts.filter((a) => {
    const key = `${a.category}-${a.title}-${a.createdAt.toDateString()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toDateKey(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function monthBounds(now: Date) {
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return { year, month, daysInMonth };
}

function ledgerStorageKey(userKey: string) {
  return `savings:${userKey}`;
}

function loadLedger(userKey: string): SavingEntry[] {
  try {
    const raw = localStorage.getItem(ledgerStorageKey(userKey));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLedger(userKey: string, entries: SavingEntry[]) {
  try {
    localStorage.setItem(ledgerStorageKey(userKey), JSON.stringify(entries));
  } catch {}
}

function isSameMonth(dateKey: string, now: Date) {
  const prefix = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-`;
  return dateKey.startsWith(prefix);
}

export function reconcileSavingsLedger(params: {
  userKey: string;
  expenses: Expense[];
  now?: Date;
}): { entries: SavingEntry[]; summary: SavingsSummary } {
  const now = params.now ?? new Date();
  const { year, month, daysInMonth } = monthBounds(now);
  const daysSoFar = Math.max(1, now.getDate());

  const monthExpenses = params.expenses.filter((e) => e.date.getFullYear() === year && e.date.getMonth() === month);

  const dailyTotals = new Map<string, number>();
  const monthTotals: Record<Category, number> = {
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
  const distinctDaysByCategory = new Map<Category, Set<string>>();

  for (const e of monthExpenses) {
    const dk = toDateKey(new Date(e.date));
    const key = `${dk}|${e.category}`;
    dailyTotals.set(key, (dailyTotals.get(key) ?? 0) + e.amount);
    monthTotals[e.category] += e.amount;
    const set = distinctDaysByCategory.get(e.category) ?? new Set<string>();
    set.add(dk);
    distinctDaysByCategory.set(e.category, set);
  }

  const habitCategories = (Object.keys(monthTotals) as Category[]).filter((cat) => {
    const distinct = distinctDaysByCategory.get(cat)?.size ?? 0;
    return distinct >= 4;
  });

  const derived: SavingEntry[] = [];
  for (const cat of habitCategories) {
    const distinct = distinctDaysByCategory.get(cat)?.size ?? 0;
    if (!distinct) continue;
    const avgDaily = monthTotals[cat] / distinct;
    if (!Number.isFinite(avgDaily) || avgDaily <= 0) continue;

    for (let day = 1; day <= daysSoFar; day++) {
      const dk = `${year}-${pad2(month + 1)}-${pad2(day)}`;
      const spent = dailyTotals.get(`${dk}|${cat}`) ?? 0;
      if (spent <= 0) {
        const amt = Math.round(avgDaily);
        if (amt > 0) {
          derived.push({
            id: `PREVENTED:${cat}:${dk}`,
            amount: amt,
            sourceExpenseCategory: cat,
            reason: "Habit avoided",
            type: "PREVENTED",
            date: dk,
            linkedExpenseId: null,
            createdAt: new Date().toISOString(),
          });
        }
      } else if (spent < avgDaily) {
        const amt = Math.round(avgDaily - spent);
        if (amt > 0) {
          derived.push({
            id: `REDUCED:${cat}:${dk}`,
            amount: amt,
            sourceExpenseCategory: cat,
            reason: "Spend reduced",
            type: "REDUCED",
            date: dk,
            linkedExpenseId: null,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
  }

  const existing = loadLedger(params.userKey);
  const kept = existing.filter((e) => {
    if (!isSameMonth(e.date, now)) return true;
    return e.type === "OPTIMIZED";
  });
  const next = [...kept, ...derived];
  saveLedger(params.userKey, next);

  const summary = summarizeSavings(next, now);
  return { entries: next, summary };
}

export function recordOptimizedSaving(params: {
  userKey: string;
  expenseId: string;
  category: Category;
  amount: number;
  reason: string;
  now?: Date;
}) {
  const now = params.now ?? new Date();
  const amt = Math.round(params.amount);
  if (!Number.isFinite(amt) || amt <= 0) return;
  const entry: SavingEntry = {
    id: `OPTIMIZED:${params.expenseId}`,
    amount: amt,
    sourceExpenseCategory: params.category,
    reason: params.reason,
    type: "OPTIMIZED",
    date: toDateKey(now),
    linkedExpenseId: params.expenseId,
    createdAt: now.toISOString(),
  };
  const existing = loadLedger(params.userKey);
  if (existing.some((e) => e.id === entry.id)) return;
  const next = [entry, ...existing];
  saveLedger(params.userKey, next);
}

export function summarizeSavings(entries: SavingEntry[], now: Date = new Date()): SavingsSummary {
  let prevented = 0;
  let reduced = 0;
  let optimized = 0;

  for (const e of entries) {
    if (!isSameMonth(e.date, now)) continue;
    if (e.type === "PREVENTED") prevented += e.amount;
    else if (e.type === "REDUCED") reduced += e.amount;
    else if (e.type === "OPTIMIZED") optimized += e.amount;
  }
  return {
    total: prevented + reduced + optimized,
    prevented,
    reduced,
    optimized,
  };
}

export function computeCategoryCap(params: {
  expenses: Expense[];
  alerts: HabitAlert[];
  category: Category;
  now?: Date;
}): number | null {
  const now = params.now ?? new Date();
  const { year, month, daysInMonth } = monthBounds(now);
  const daysSoFar = Math.max(1, now.getDate());

  const monthTotal = params.expenses
    .filter((e) => e.category === params.category && e.date.getFullYear() === year && e.date.getMonth() === month)
    .reduce((s, e) => s + e.amount, 0);

  const categoryPotential = params.alerts
    .filter((a) => a.severity === "bad" && a.category === params.category)
    .reduce((s, a) => s + (a.savingPotential || 0), 0);

  if (categoryPotential <= 0) return null;

  const projected = (monthTotal / daysSoFar) * daysInMonth;
  return Math.max(0, Math.round(projected - categoryPotential));
}

// Local heuristic analysis to be used as fallback when backend Gemini is unavailable
export function analyzeExpenses(expenses: Expense[]): AnalysisResult {
  const insights: ExpenseInsight[] = [];
  const suggestions: string[] = [];
  const shortExplanations: string[] = [];

  // Compute category/day statistics
  const now = new Date();
  const thisMonth = expenses.filter((e) => e.date.getFullYear() === now.getFullYear() && e.date.getMonth() === now.getMonth());
  const impulseSpending = thisMonth.filter((e) => ["food", "shopping", "entertainment"].includes(e.category) && e.amount > 500).reduce((s, e) => s + e.amount, 0);

  const byCategory = new Map<Category, Expense[]>();
  for (const e of thisMonth) {
    byCategory.set(e.category, [...(byCategory.get(e.category) ?? []), e]);
  }
  let badHabitCount = 0;
  let potentialSavings = 0;

  for (const [cat, list] of byCategory) {
    const days = new Set(list.map((e) => `${e.date.getFullYear()}-${e.date.getMonth()}-${e.date.getDate()}`));
    const distinctDays = days.size;
    const total = list.reduce((s, e) => s + e.amount, 0);
    const avg = total / Math.max(1, distinctDays);
    const weekendSpike = list.filter((e) => {
      const d = e.date.getDay();
      return d === 0 || d === 6;
    }).reduce((s, e) => s + e.amount, 0) > total * 0.5;
    const trendUp = list.length >= 3 && list[list.length - 1].amount > list[0].amount * 1.25;

    const intent: ExpenseInsight["intent"] = list.some((e) => e.amount > 500 && ["food", "shopping", "entertainment"].includes(cat)) ? "Impulse" : "Planned";
    const habitLikelihood = Math.min(1, distinctDays / 10 + (weekendSpike ? 0.1 : 0) + (trendUp ? 0.2 : 0));
    const risk: RiskLevel = (intent === "Impulse" || weekendSpike || trendUp) ? (trendUp ? "High" : "Medium") : "Low";

    if (risk !== "Low") {
      badHabitCount += 1;
      potentialSavings += Math.round(avg * 2 * 0.3);
    }

    insights.push({
      category: cat,
      subType: cat === "food" ? "Online Delivery" : undefined,
      intent,
      risk,
      habitLikelihood,
      reasoning: weekendSpike ? "Weekend spikes detected" : trendUp ? "Gradual amount increase detected" : distinctDays >= 4 ? "Repeated across multiple days" : "Typical spending pattern",
    });

    if (risk !== "Low") {
      suggestions.push(
        cat === "food"
          ? "You’ve ordered food often this month. Cooking twice this week could save ₹" + Math.round(avg * 2 * 0.5) + "."
          : `Consider setting a weekly cap for ${cat}.`
      );
      shortExplanations.push(`Detected patterns in ${cat} spending that may be costly. Consider small habit shifts.`);
    }
  }

  return {
    insights,
    suggestions: suggestions.slice(0, 5),
    shortExplanations: shortExplanations.slice(0, 5),
    metrics: {
      impulseSpending,
      badHabitCount,
      potentialSavings,
    },
  };
}

// Backend stubs: these hit /api endpoints (to be implemented server-side with Gemini). Frontend never includes API key.
export async function requestGeminiAnalysis(expenses: Expense[]): Promise<AnalysisResult> {
  try {
    const res = await fetch('/api/ai/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses }),
    });
    if (!res.ok) throw new Error('Bad status');
    return await res.json();
  } catch {
    return analyzeExpenses(expenses);
  }
}

export async function requestGeminiChat(expenses: Expense[], userMessage: string): Promise<{ reply: string }> {
  try {
    const res = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ expenses, message: userMessage }),
    });
    if (!res.ok) throw new Error('Bad status');
    return await res.json();
  } catch {
    // Local supportive fallback
    const analysis = analyzeExpenses(expenses);
    const hint = analysis.suggestions[0] ?? 'Track one category closely this week to build awareness.';
    return { reply: `Here’s a thought: ${hint}` };
  }
}
