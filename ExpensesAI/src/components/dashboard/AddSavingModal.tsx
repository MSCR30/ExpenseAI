import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SavingsSummary } from "@/services/ai";

interface AddSavingModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SavingsSummary;
}

export function AddSavingModal({ isOpen, onClose, summary }: AddSavingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/20 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold font-display text-foreground">Saved</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-5">
                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm text-muted-foreground">Total saved this month</div>
                  <div className="mt-1 text-3xl font-bold text-foreground">₹{summary.total.toFixed(0)}</div>
                </div>

                <div className="rounded-xl border border-border bg-background p-4">
                  <div className="text-sm font-semibold text-foreground">Breakdown</div>
                  <div className="mt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Prevented</span>
                      <span className="font-medium text-foreground">₹{summary.prevented.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Reduced</span>
                      <span className="font-medium text-foreground">₹{summary.reduced.toFixed(0)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Optimized</span>
                      <span className="font-medium text-foreground">₹{summary.optimized.toFixed(0)}</span>
                    </div>
                  </div>
                </div>

                <Button className="w-full gradient-primary text-primary-foreground" onClick={onClose}>
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
