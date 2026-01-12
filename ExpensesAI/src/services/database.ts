import { collection, doc, addDoc, getDocs, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '@/lib/firebase';
import { Expense, Category } from '@/lib/mockData';

export interface BankRecord {
  date: string;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
}

export const parseCSV = (csvContent: string): BankRecord[] => {
  const lines = csvContent.split('\n').filter(line => line.trim());
  if (lines.length < 2) {
    throw new Error('CSV file must have at least a header row and one data row');
  }

  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const requiredHeaders = ['date', 'description', 'amount', 'type'];

  for (const required of requiredHeaders) {
    if (!headers.includes(required)) {
      throw new Error(`CSV must contain column: ${required}`);
    }
  }

  const records: BankRecord[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has incorrect number of columns`);
    }

    const record: any = {};
    headers.forEach((header, index) => {
      record[header] = values[index];
    });

    // Validate and parse
    const date = new Date(record.date);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format in row ${i + 1}: ${record.date}`);
    }

    const amount = parseFloat(record.amount);
    if (isNaN(amount)) {
      throw new Error(`Invalid amount in row ${i + 1}: ${record.amount}`);
    }

    const type = record.type.toLowerCase();
    if (type !== 'debit' && type !== 'credit') {
      throw new Error(`Invalid type in row ${i + 1}: ${record.type}. Must be 'debit' or 'credit'`);
    }

    records.push({
      date: record.date,
      description: record.description,
      amount: Math.abs(amount), // Store positive amounts
      type: type as 'debit' | 'credit'
    });
  }

  return records;
};

export const bankRecordToExpense = (record: BankRecord): Omit<Expense, 'id'> => {
  // Simple categorization based on description keywords
  const description = record.description.toLowerCase();
  let category: Category = 'other';

  if (description.includes('food') || description.includes('restaurant') || description.includes('cafe') || description.includes('swiggy') || description.includes('zomato')) {
    category = 'food';
  } else if (description.includes('uber') || description.includes('ola') || description.includes('taxi') || description.includes('bus') || description.includes('metro')) {
    category = 'transport';
  } else if (description.includes('amazon') || description.includes('flipkart') || description.includes('myntra') || description.includes('shopping')) {
    category = 'shopping';
  } else if (description.includes('netflix') || description.includes('prime') || description.includes('hotstar') || description.includes('movie')) {
    category = 'entertainment';
  } else if (description.includes('electricity') || description.includes('water') || description.includes('gas') || description.includes('internet') || description.includes('phone')) {
    category = 'bills';
  } else if (description.includes('subscription') || description.includes('spotify') || description.includes('apple music')) {
    category = 'subscriptions';
  } else if (description.includes('grocery') || description.includes('supermarket') || description.includes('bigbasket')) {
    category = 'groceries';
  } else if (description.includes('hospital') || description.includes('medical') || description.includes('pharmacy')) {
    category = 'health';
  }

  return {
    description: record.description,
    amount: record.amount,
    category,
    date: new Date(record.date),
    isImpulse: false, // Will be determined by AI analysis
    source: 'AUTO'
  };
};

export const getExpenses = async (): Promise<Expense[]> => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const expensesRef = collection(db, 'expenses');
  const q = query(
    expensesRef,
    where('userId', '==', auth.currentUser.uid),
    orderBy('date', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const expenses: Expense[] = [];

  querySnapshot.forEach((doc) => {
    const data = doc.data();
    expenses.push({
      id: doc.id,
      description: data.description,
      amount: data.amount,
      category: data.category,
      date: data.date.toDate(),
      isImpulse: data.isImpulse,
      source: data.source
    });
  });

  return expenses;
};

export const addExpense = async (expense: Omit<Expense, 'id'>): Promise<string> => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  const expenseWithUserId = {
    ...expense,
    userId: auth.currentUser.uid,
    date: expense.date // Firestore will handle Date objects
  };

  const docRef = await addDoc(collection(db, 'expenses'), expenseWithUserId);
  return docRef.id;
};

export const addExpenses = async (expenses: Omit<Expense, 'id'>[]): Promise<string[]> => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  // Use Firestore batched writes to reduce network round-trips.
  // Firestore batches are limited to 500 writes per batch; chunk if needed.
  const MAX_BATCH = 500;
  const expensesRef = collection(db, 'expenses');
  const ids: string[] = [];

  for (let i = 0; i < expenses.length; i += MAX_BATCH) {
    const chunk = expenses.slice(i, i + MAX_BATCH);
    const batch = writeBatch(db);
    const refs: ReturnType<typeof doc>[] = [];

    for (const expense of chunk) {
      const ref = doc(expensesRef); // auto-id doc ref
      refs.push(ref);
      const expenseWithUserId = {
        ...expense,
        userId: auth.currentUser!.uid,
        date: expense.date,
      };
      batch.set(ref, expenseWithUserId as any);
    }

    await batch.commit();
    // collect ids in same order as chunk
    ids.push(...refs.map((r) => r.id));
  }

  return ids;
};

export const deleteExpense = async (id: string): Promise<void> => {
  const auth = getAuth();
  if (!auth.currentUser) {
    throw new Error('User not authenticated');
  }

  // First verify the expense belongs to the current user
  const expenseRef = doc(db, 'expenses', id);
  await deleteDoc(expenseRef);
};
