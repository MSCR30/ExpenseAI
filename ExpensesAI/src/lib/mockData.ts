export type Category = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'entertainment' 
  | 'bills' 
  | 'subscriptions' 
  | 'groceries'
  | 'health'
  | 'other';

export type HabitSeverity = 'good' | 'warning' | 'bad';

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: Date;
  isImpulse?: boolean;
  source: 'MANUAL' | 'AUTO';
}

export interface HabitAlert {
  id: string;
  title: string;
  description: string;
  severity: HabitSeverity;
  category: Category;
  savingPotential: number;
  suggestion: string;
  createdAt: Date;
}

export interface SpendingByCategory {
  category: Category;
  amount: number;
  percentage: number;
  color: string;
}

export const categoryColors: Record<Category, string> = {
  food: 'hsl(38, 92%, 50%)',
  transport: 'hsl(210, 70%, 50%)',
  shopping: 'hsl(330, 70%, 50%)',
  entertainment: 'hsl(280, 70%, 50%)',
  bills: 'hsl(160, 70%, 40%)',
  subscriptions: 'hsl(0, 70%, 50%)',
  groceries: 'hsl(120, 50%, 45%)',
  health: 'hsl(180, 60%, 45%)',
  other: 'hsl(220, 15%, 50%)',
};

export const categoryIcons: Record<Category, string> = {
  food: '🍔',
  transport: '🚗',
  shopping: '🛍️',
  entertainment: '🎮',
  bills: '📄',
  subscriptions: '📺',
  groceries: '🛒',
  health: '💊',
  other: '📦',
};

export const mockExpenses: Expense[] = [
  { id: '1', description: 'Uber Eats - McDonalds', amount: 18.50, category: 'food', date: new Date(2025, 0, 9, 12, 30), isImpulse: true, source: 'MANUAL' },
  { id: '2', description: 'Netflix Subscription', amount: 15.99, category: 'subscriptions', date: new Date(2025, 0, 8), source: 'MANUAL' },
  { id: '3', description: 'Grocery Store', amount: 67.40, category: 'groceries', date: new Date(2025, 0, 8), source: 'MANUAL' },
  { id: '4', description: 'Swiggy - Pizza Hut', amount: 24.00, category: 'food', date: new Date(2025, 0, 7, 20, 0), isImpulse: true, source: 'MANUAL' },
  { id: '5', description: 'Amazon - Electronics', amount: 89.99, category: 'shopping', date: new Date(2025, 0, 7), isImpulse: true, source: 'MANUAL' },
  { id: '6', description: 'Electricity Bill', amount: 145.00, category: 'bills', date: new Date(2025, 0, 6), source: 'MANUAL' },
  { id: '7', description: 'Spotify Premium', amount: 9.99, category: 'subscriptions', date: new Date(2025, 0, 5), source: 'MANUAL' },
  { id: '8', description: 'Uber Ride', amount: 12.50, category: 'transport', date: new Date(2025, 0, 5), source: 'MANUAL' },
  { id: '9', description: 'Zomato - Dominos', amount: 19.50, category: 'food', date: new Date(2025, 0, 4, 21, 30), isImpulse: true, source: 'MANUAL' },
  { id: '10', description: 'Gaming Store', amount: 59.99, category: 'entertainment', date: new Date(2025, 0, 3), source: 'MANUAL' },
  { id: '11', description: 'Pharmacy', amount: 23.00, category: 'health', date: new Date(2025, 0, 2), source: 'MANUAL' },
  { id: '12', description: 'Swiggy - KFC', amount: 16.00, category: 'food', date: new Date(2025, 0, 1, 13, 0), isImpulse: true, source: 'MANUAL' },
];

export const mockHabitAlerts: HabitAlert[] = [
  {
    id: '1',
    title: 'Food Delivery Addiction Detected! 🚨',
    description: 'You\'ve ordered food delivery 5 times this week, spending ₹78 more than cooking at home.',
    severity: 'bad',
    category: 'food',
    savingPotential: 312,
    suggestion: 'Try meal prepping on Sundays. You could save ₹1,248/month!',
    createdAt: new Date(2025, 0, 9),
  },
  {
    id: '2',
    title: 'Impulse Shopping Alert ⚠️',
    description: 'Late-night purchases detected. 3 unplanned shopping sprees this month.',
    severity: 'warning',
    category: 'shopping',
    savingPotential: 150,
    suggestion: 'Enable a 24-hour cooling period before making purchases over ₹50.',
    createdAt: new Date(2025, 0, 8),
  },
  {
    id: '3',
    title: 'Unused Subscription Found 💸',
    description: 'You haven\'t used your gym membership in 45 days but paid ₹89.',
    severity: 'warning',
    category: 'subscriptions',
    savingPotential: 89,
    suggestion: 'Consider canceling or switching to a pay-per-visit plan.',
    createdAt: new Date(2025, 0, 7),
  },
];

export const mockSpendingByCategory: SpendingByCategory[] = [
  { category: 'food', amount: 78.00, percentage: 15.5, color: categoryColors.food },
  { category: 'subscriptions', amount: 25.98, percentage: 5.2, color: categoryColors.subscriptions },
  { category: 'groceries', amount: 67.40, percentage: 13.4, color: categoryColors.groceries },
  { category: 'shopping', amount: 89.99, percentage: 17.9, color: categoryColors.shopping },
  { category: 'bills', amount: 145.00, percentage: 28.8, color: categoryColors.bills },
  { category: 'transport', amount: 12.50, percentage: 2.5, color: categoryColors.transport },
  { category: 'entertainment', amount: 59.99, percentage: 11.9, color: categoryColors.entertainment },
  { category: 'health', amount: 23.00, percentage: 4.6, color: categoryColors.health },
];

export const weeklySpendingData = [
  { day: 'Mon', amount: 45 },
  { day: 'Tue', amount: 89 },
  { day: 'Wed', amount: 32 },
  { day: 'Thu', amount: 78 },
  { day: 'Fri', amount: 156 },
  { day: 'Sat', amount: 67 },
  { day: 'Sun', amount: 35 },
];

export const monthlyTrendData = [
  { month: 'Sep', amount: 1850, budget: 2000 },
  { month: 'Oct', amount: 2100, budget: 2000 },
  { month: 'Nov', amount: 1920, budget: 2000 },
  { month: 'Dec', amount: 2450, budget: 2000 },
  { month: 'Jan', amount: 502, budget: 2000 },
];
