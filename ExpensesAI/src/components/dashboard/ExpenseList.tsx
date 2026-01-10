import { motion } from 'framer-motion';
import { Expense, categoryIcons, categoryColors } from '@/lib/mockData';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Zap } from 'lucide-react';

interface ExpenseListProps {
  expenses: Expense[];
  onDelete?: (id: string) => void;
}

export function ExpenseList({ expenses, onDelete }: ExpenseListProps) {
  return (
    <div className="space-y-3">
      {expenses.map((expense, index) => (
        <motion.div
          key={expense.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className={cn(
            'flex items-center gap-4 rounded-xl bg-card p-4 shadow-card transition-all hover:shadow-card-hover',
            expense.isImpulse && 'ring-2 ring-warning/30'
          )}
          onClick={() => {
            // Manual delete: only allow if source is MANUAL
            // No new UI elements: use native confirm
            if (expense.source === 'MANUAL' && onDelete) {
              const ok = window.confirm('Delete this expense? This action cannot be undone.');
              if (ok) onDelete(expense.id);
            }
          }}
          role={onDelete && expense.source === 'MANUAL' ? 'button' : undefined}
          tabIndex={onDelete && expense.source === 'MANUAL' ? 0 : undefined}
        >
          <div 
            className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
            style={{ backgroundColor: `${categoryColors[expense.category]}15` }}
          >
            {categoryIcons[expense.category]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-medium text-foreground truncate">{expense.description}</p>
              {expense.isImpulse && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                  <Zap className="h-3 w-3" />
                  Impulse
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {format(expense.date, 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
          
          <div className="text-right">
            <p className="font-semibold text-foreground">-₹{expense.amount.toFixed(2)}</p>
            <p 
              className="text-xs font-medium capitalize"
              style={{ color: categoryColors[expense.category] }}
            >
              {expense.category}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
