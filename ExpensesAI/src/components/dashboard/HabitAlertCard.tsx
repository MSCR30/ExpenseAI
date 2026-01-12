import { motion } from 'framer-motion';
import { AlertTriangle, AlertOctagon, CheckCircle, X, Lightbulb, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HabitAlert } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface HabitAlertCardProps {
  alert: HabitAlert;
  onDismiss?: (id: string) => void;
  index?: number;
}

const severityStyles = {
  bad: {
    container: 'border-l-4 border-l-red-500 bg-red-500/10 backdrop-blur-md border border-red-400/30',
    icon: 'text-red-400',
    badge: 'bg-red-500/30 border border-red-400/30 text-red-200',
  },
  warning: {
    container: 'border-l-4 border-l-orange-500 bg-orange-500/10 backdrop-blur-md border border-orange-400/30',
    icon: 'text-orange-400',
    badge: 'bg-orange-500/30 border border-orange-400/30 text-orange-200',
  },
  good: {
    container: 'border-l-4 border-l-green-500 bg-green-500/10 backdrop-blur-md border border-green-400/30',
    icon: 'text-green-400',
    badge: 'bg-green-500/30 border border-green-400/30 text-green-200',
  },
};

export function HabitAlertCard({ alert, onDismiss, index = 0 }: HabitAlertCardProps) {
  const styles = severityStyles[alert.severity];
  const SeverityIcon = alert.severity === 'good' ? CheckCircle : alert.severity === 'warning' ? AlertTriangle : AlertOctagon;
  const BadgeIcon = alert.severity === 'good' ? TrendingUp : alert.severity === 'warning' ? AlertTriangle : TrendingDown;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ delay: index * 0.1 }}
      className={cn(
        'relative rounded-xl p-5 shadow-lg',
        styles.container
      )}
    >
      <div className="flex items-start gap-4">
        <div className={cn('mt-0.5', styles.icon)}>
          <SeverityIcon className="h-5 w-5" />
        </div>
        
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white">{alert.title}</h3>
            {onDismiss && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0 text-gray-400 hover:text-white hover:bg-white/10"
                onClick={() => onDismiss(alert.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <p className="text-sm text-gray-300">{alert.description}</p>
          
          <div className="flex items-center gap-4">
            <div className={cn('inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium border', styles.badge)}>
              <BadgeIcon className="h-3 w-3" />
              {alert.severity === 'good' ? 'Healthy trend' : `Save ₹${alert.savingPotential}/month`}
            </div>
          </div>
          
          <div className="flex items-start gap-2 rounded-lg bg-white/5 border border-white/10 p-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
            <p className="text-sm text-gray-300">{alert.suggestion}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
