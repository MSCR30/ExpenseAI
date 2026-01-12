import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'primary' | 'warning' | 'success';
}

const variantStyles = {
  default: 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/15 hover:border-white/30',
  primary: 'bg-gradient-to-br from-purple-500/30 to-cyan-500/30 backdrop-blur-md border border-cyan-400/30 text-white',
  warning: 'bg-gradient-to-br from-orange-500/30 to-red-500/30 backdrop-blur-md border border-orange-400/30 text-white',
  success: 'bg-gradient-to-br from-green-500/30 to-emerald-500/30 backdrop-blur-md border border-green-400/30 text-white',
};

const iconStyles = {
  default: 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/30',
  primary: 'bg-white/20 text-white border border-white/30',
  warning: 'bg-orange-500/30 text-orange-200 border border-orange-400/30',
  success: 'bg-green-500/30 text-green-200 border border-green-400/30',
};

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-6 shadow-2xl transition-all duration-300',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className={cn(
            'text-sm font-medium',
            variant === 'default' ? 'text-gray-300' : 'text-gray-200'
          )}>
            {title}
          </p>
          <p className="text-3xl font-bold font-display">{value}</p>
          {subtitle && (
            <p className={cn(
              'text-xs',
              variant === 'default' ? 'text-gray-400' : 'text-gray-300'
            )}>
              {subtitle}
            </p>
          )}
          {trend && (
            <div className={cn(
              'inline-flex items-center gap-1 text-xs font-medium',
              trend.isPositive ? 'text-green-300' : 'text-red-300'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% from last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          'rounded-xl p-3 border',
          iconStyles[variant]
        )}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      
      {/* Decorative element */}
      <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-current opacity-5" />
    </motion.div>
  );
}
