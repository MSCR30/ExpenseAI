import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { SpendingByCategory, categoryIcons } from '@/lib/mockData';

interface SpendingChartProps {
  data: SpendingByCategory[];
}

export function SpendingChart({ data }: SpendingChartProps) {
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl bg-card p-6 shadow-card"
    >
      <h3 className="mb-4 text-lg font-semibold text-foreground font-display">Spending by Category</h3>
      
      <div className="flex items-center gap-6">
        <div className="relative h-48 w-48 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={3}
                dataKey="amount"
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    className="transition-all duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Amount']}
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px 12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-2xl font-bold text-foreground font-display">₹{total.toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">This Week</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-2">
          {data.slice(0, 5).map((item) => (
            <div key={item.category} className="flex items-center gap-3">
              <div 
                className="h-3 w-3 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-lg">{categoryIcons[item.category]}</span>
              <span className="flex-1 text-sm capitalize text-foreground">{item.category}</span>
              <span className="text-sm font-medium text-foreground">₹{item.amount.toFixed(0)}</span>
              <span className="text-xs text-muted-foreground w-10 text-right">{item.percentage}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
