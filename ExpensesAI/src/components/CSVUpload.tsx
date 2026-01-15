import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { parseCSV, bankRecordToExpense } from '@/services/database';
import { classifyExpense } from '@/services/ai';
import type { Expense } from '@/lib/mockData';

interface CSVUploadProps {
  onUploadSuccess: (expenses: Omit<Expense, 'id'>[]) => void;
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

      // Single-pass processing: filter debits and convert to expenses in one loop
      const expensesToAdd: Omit<Expense, 'id'>[] = [];
      const existing = existingExpenses ?? [];

      for (const record of bankRecords) {
        // Skip credit transactions
        if (record.type !== 'debit') continue;
        
        // Convert and classify in single pass
        const baseExpense = bankRecordToExpense(record);
        const { flags } = classifyExpense(baseExpense as Expense, existing);
        expensesToAdd.push({
          ...baseExpense,
          isImpulse: flags.impulse,
        });
      }

      if (expensesToAdd.length === 0) {
        throw new Error('No debit transactions found in CSV');
      }

      // Do not perform DB writes here to keep UI responsive.
      // Return parsed/typed expenses (without IDs) to the caller so the parent can
      // perform an optimistic UI update and batch the DB write in background.
      setUploadStatus('success');
      toast.success('CSV parsed successfully', {
        description: `Found ${expensesToAdd.length} debit transaction${expensesToAdd.length === 1 ? '' : 's'} in the CSV.`
      });

      onUploadSuccess(expensesToAdd);

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
