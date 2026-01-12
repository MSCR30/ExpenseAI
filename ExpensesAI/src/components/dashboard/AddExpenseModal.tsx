import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Category, categoryIcons } from '@/lib/mockData';
import { cn } from '@/lib/utils';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (expense: { description: string; amount: number; category: Category }) => void;
}

const categories: Category[] = ['food', 'transport', 'shopping', 'entertainment', 'bills', 'subscriptions', 'groceries', 'health', 'other'];

export function AddExpenseModal({ isOpen, onClose, onAdd }: AddExpenseModalProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>(categories);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    
    // Auto-categorization simulation
    if (value.length > 3) {
      setIsAnalyzing(true);
      setTimeout(() => {
        const lowerValue = value.toLowerCase();
        if (lowerValue.includes('uber') || lowerValue.includes('ola') || lowerValue.includes('metro')) {
          setSelectedCategory('transport');
          setSelectedCategoryLabel('transport');
        } else if (lowerValue.includes('swiggy') || lowerValue.includes('zomato') || lowerValue.includes('mcdonald') || lowerValue.includes('pizza')) {
          setSelectedCategory('food');
          setSelectedCategoryLabel('food');
        } else if (lowerValue.includes('amazon') || lowerValue.includes('flipkart') || lowerValue.includes('myntra')) {
          setSelectedCategory('shopping');
          setSelectedCategoryLabel('shopping');
        } else if (lowerValue.includes('netflix') || lowerValue.includes('spotify') || lowerValue.includes('hotstar')) {
          setSelectedCategory('subscriptions');
          setSelectedCategoryLabel('subscriptions');
        } else if (lowerValue.includes('electricity') || lowerValue.includes('water') || lowerValue.includes('rent')) {
          setSelectedCategory('bills');
          setSelectedCategoryLabel('bills');
        } else if (lowerValue.includes('grocery') || lowerValue.includes('vegetables') || lowerValue.includes('milk')) {
          setSelectedCategory('groceries');
          setSelectedCategoryLabel('groceries');
        }
        setIsAnalyzing(false);
      }, 500);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!description || !amount || !selectedCategory) {
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (parsedAmount <= 0) {
      return;
    }

    const descriptionWithLabel =
      selectedCategory === 'other' && selectedCategoryLabel
        ? `${description} [${selectedCategoryLabel}]`
        : description;
    
    const expense = {
      description: descriptionWithLabel,
      amount: parsedAmount,
      category: selectedCategory,
    };

    // Call the handler
    if (onAdd) {
      onAdd(expense);
    }

    // Clear form state
    setDescription('');
    setAmount('');
    setSelectedCategory(null);
    setSelectedCategoryLabel(null);
    
    // Close modal
    onClose();
  };

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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-display text-foreground">Add Expense</h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form
                className="space-y-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSubmit();
                }}
              >
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="relative">
                  <Input
                    id="description"
                    placeholder="e.g., Uber Eats - Pizza"
                    value={description}
                    onChange={(e) => handleDescriptionChange(e.target.value)}
                    className="pr-10"
                  />
                  {isAnalyzing && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Sparkles className="h-4 w-4 animate-pulse text-primary" />
                    </div>
                  )}
                </div>
                {selectedCategory && !isAnalyzing && (
                  <p className="flex items-center gap-1 text-xs text-primary">
                    <Sparkles className="h-3 w-3" />
                    AI suggested: {categoryIcons[selectedCategory]} {selectedCategory}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <div className="grid grid-cols-3 gap-2">
                  {categoriesList.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedCategory(category);
                        setSelectedCategoryLabel(category);
                      }}
                      className={cn(
                        'flex items-center gap-2 rounded-xl border-2 p-3 text-sm transition-all',
                        selectedCategory === category
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background hover:border-primary/50'
                      )}
                    >
                      <span>{categoryIcons[category]}</span>
                      <span className="capitalize truncate">{category}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory((v) => !v)}
                    className="flex items-center justify-center gap-2 rounded-xl border-2 p-3 text-sm transition-all border-dashed hover:border-primary/50"
                  >
                    + Add category
                  </button>
                </div>
                {isAddingCategory && (
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      placeholder="Category name"
                      value={newCategoryLabel}
                      onChange={(e) => setNewCategoryLabel(e.target.value)}
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const label = newCategoryLabel.trim().toLowerCase();
                        if (!label) return;
                        // We don't change types globally; map to 'other' internally
                        setSelectedCategory('other');
                        setSelectedCategoryLabel(label);
                        // Keep a local visual list by adding 'other' if not present (already present), no-op
                        setIsAddingCategory(false);
                        setNewCategoryLabel('');
                      }}
                    >
                      Add
                    </Button>
                  </div>
                )}
              </div>

                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground"
                  disabled={!description || !amount || !selectedCategory}
                >
                  Add Expense
                </Button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
