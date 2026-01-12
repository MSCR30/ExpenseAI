import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { parseCSV, bankRecordToExpense, addExpenses } from '@/services/database';
import { classifyExpense } from '@/services/ai';
import type { Expense } from '@/lib/mockData';

interface CSVUploadProps {
  onUploadSuccess: (expenses: Expense[]) => void;
  existingExpenses?: Expense[];
  onComplete?: () => void;
}

export const CSVUpload: React.FC<CSVUploadProps> = ({ onUploadSuccess, existingExpenses, onComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setUploadStatus('error');
      setErrorMessage('Please select a CSV file only.');
      toast.error('Invalid file type', { description: 'Only CSV files are accepted.' });
      return;
    }

    setIsUploading(true);
    setUploadStatus('idle');
    setErrorMessage('');

    try {
      const csvContent = await file.text();
      let bankRecords = parseCSV(csvContent);

      if (bankRecords.length === 0) {
        throw new Error('No valid records found in CSV');
      }

      // Ignore credit transactions (only import debits)
      const debitRecords = bankRecords.filter(r => r.type === 'debit');
      if (debitRecords.length === 0) {
        throw new Error('No debit transactions found in CSV');
      }

      // Convert to expenses and classify them using provided existing expenses
      const expensesToAdd: Omit<Expense, 'id'>[] = [];
      const existing = existingExpenses ?? [];

      for (const record of debitRecords) {
        const baseExpense = bankRecordToExpense(record);
        const { flags } = classifyExpense(baseExpense as Expense, existing);
        const expense: Omit<Expense, 'id'> = {
          ...baseExpense,
          isImpulse: flags.impulse,
        };
        expensesToAdd.push(expense);
      }

      // Add to database
      const ids = await addExpenses(expensesToAdd);

      // Create full Expense objects with IDs
      const newExpenses: Expense[] = expensesToAdd.map((exp, index) => ({
        ...exp,
        id: ids[index],
      }));

      setUploadStatus('success');
      toast.success('CSV uploaded successfully', {
        description: `Added ${newExpenses.length} expense${newExpenses.length === 1 ? '' : 's'} from bank statement.`
      });

      onUploadSuccess(newExpenses);

    } catch (error) {
      setUploadStatus('error');
      const message = error instanceof Error ? error.message : 'Failed to process CSV file';
      setErrorMessage(message);
      toast.error('Upload failed', { description: message });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Notify caller that processing is complete (success or error)
      try {
        onComplete?.();
      } catch {}
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
      />

      <Button
        onClick={handleButtonClick}
        disabled={isUploading}
        variant="outline"
        className="w-full"
      >
        {isUploading ? (
          <>
            <FileText className="h-4 w-4 mr-2 animate-pulse" />
            Processing...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            Upload Bank Statement CSV
          </>
        )}
      </Button>

      {uploadStatus === 'success' && (
        <div className="flex items-center text-green-600 text-sm">
          <CheckCircle className="h-4 w-4 mr-2" />
          Upload completed successfully
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex items-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4 mr-2" />
          {errorMessage}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        CSV must contain columns: date, description, amount, type (debit/credit)
      </div>
    </div>
  );
};
