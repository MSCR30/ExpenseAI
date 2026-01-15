# ExpenseAI Codebase Guide for AI Agents

## Architecture Overview

ExpenseAI is a React/TypeScript expense tracking app with AI-driven insights built on:
- **Frontend**: Vite + React + TypeScript + shadcn/ui components
- **Backend**: Firebase (Firestore + Auth)
- **Build**: Bun, ESLint, Tailwind CSS
- **Key Pattern**: Three-layer architecture (Pages → Components → Services)

## Critical Data Flow

### Expense Lifecycle
1. **Input**: Manual entry via `AddExpenseModal` or auto-import via `CSVUpload` → `parseCSV()` → `bankRecordToExpense()`
2. **Storage**: `database.ts` → Firestore collection (user-scoped)
3. **Analysis**: `ai.ts` → `classifyExpense()` flags impulse/habit, generates `HabitAlert`
4. **UI Display**: `Index.tsx` → aggregates via useMemo, renders charts + alerts

### Category System
- 9 hardcoded categories (`food`, `transport`, `shopping`, `entertainment`, `bills`, `subscriptions`, `groceries`, `health`, `other`)
- Auto-categorization in `bankRecordToExpense()` uses keyword matching on description
- Each category has HSL color + emoji (see `categoryColors`, `categoryIcons` in mockData.ts)

## Key Files & Patterns

### Services Layer (`src/services/`)
- **ai.ts**: Core AI logic (250+ lines)
  - `classifyExpense()`: Heuristic impulse detection (>500 non-essential → impulse), habit detection (4+ same category/month)
  - `recomputeAlerts()`: Rebuilds alerts from expense history, deduplicates
  - `reconcileSavingsLedger()`: localStorage-backed savings tracking (PREVENTED/REDUCED/OPTIMIZED types)
  - Gemini integration stubs: `requestGeminiAnalysis()`, `requestGeminiChat()` (placeholders)
  
- **database.ts**: Firestore CRUD + CSV parsing
  - CSV must have columns: `date`, `description`, `amount`, `type` (debit/credit)
  - Validates row count, column count, date/amount formats

### Context & Auth (`src/context/AuthContext.tsx`)
- Firebase Auth with email/password + Google OAuth
- Graceful fallback if Firebase env vars missing (warning logged, auth disabled)
- User mapped to `{ uid, email }` for consistency

### Pages
- **Index.tsx** (dashboard): Main page—loads expenses, renders stats/charts/alerts
  - Global loading state via 25-second timeout (for AI operations)
  - 9 modal/sheet handlers + bot chat UI
  - Memoized computations for category breakdown, weekly trends
  
- **Login/Signup/Profile**: Auth flow pages
- **Landing**: Public homepage

### UI Component Library
- All shadcn/ui + Radix components in `src/components/ui/`
- Modular dashboard components: `StatCard`, `SpendingChart`, `ExpenseList`, `HabitAlertCard`
- No external UI framework—pure Tailwind

## Developer Workflows

### Setup
```bash
cd ExpensesAI
bun install
# Create .env.local with Firebase credentials (see FIREBASE_SETUP.md)
bun run dev  # Starts Vite on localhost:5173
```

### Build & Deploy
```bash
bun run build       # Production build → dist/
bun run build:dev   # Dev build (useful for testing)
bun run lint        # ESLint check
bun run preview     # Preview dist locally
```

### Key Environment Variables
- `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc. (6 vars total)
- Checked in `firebase.ts`—missing vars = disabled auth + console warning

## Project-Specific Conventions

1. **Component Props**: Modals (`AddExpenseModal`, `AddSavingModal`) expect `isOpen`, `setIsOpen` + specific callbacks
2. **Date Handling**: Mix of `Date` objects (expenses) and `YYYY-MM-DD` strings (savings ledger keys)
3. **Error Handling**: `errorFormatter.ts` exports formatting utilities; toast notifications via `sonner`
4. **CSV Source**: Bank records are tagged with `source: 'AUTO'`; manual adds are `'MANUAL'`
5. **Lazy Loading**: Profile page uses React.Suspense fallback
6. **Protected Routes**: `ProtectedRoute` wrapper checks `AuthContext.user` before rendering

## Integration Points

- **Gemini API**: Called in `Index.tsx` via `requestGeminiAnalysis()` + `requestGeminiChat()` (stubs—needs backend)
- **Firestore Queries**: User-scoped via `where(userId, '==', user.uid)` in `database.ts`
- **Google OAuth**: Configured in `AuthContext.tsx` + Firebase console

## Habits & Alerts
- **Habit Detection**: 4+ expenses in same category during current month → habit flag
- **Alerts**: Created for impulse buys (>500) + habits; deduped by category+title+date
- **Severity Levels**: `'good'` | `'warning'` | `'bad'` (UI filters on 'bad')

## Common Tasks

| Task | Location | Notes |
|------|----------|-------|
| Add new category | `mockData.ts` | Update `Category` type, colors, icons, parsing logic in `bankRecordToExpense()` |
| Modify impulse threshold | `ai.ts`, `classifyExpense()` | Currently 500; adjust `nonEssential.includes() && amount > 500` |
| Tweak habit detection | `ai.ts`, `classifyExpense()` | Frequency threshold is 4; change as needed |
| Add Gemini feature | `ai.ts` + `Index.tsx` | Integrate real Gemini calls (stubs exist for analysis + chat) |
| Adjust savings types | `ai.ts` + `Index.tsx` | Extend `SavingType` enum and reconciliation logic |

## Netlify Deployment Workflow

### Prerequisites
1. Push code to GitHub (create repo + commit all changes)
2. Have Firebase credentials ready (API key, auth domain, project ID, etc.)
3. Netlify account connected to GitHub

### Step-by-Step Deployment

#### Step 1: Push to GitHub
```bash
cd ExpenseAI  # root directory with .git
git add .
git commit -m "Initial ExpenseAI deployment"
git push origin main  # or your branch
```

#### Step 2: Configure Netlify Build Settings
In Netlify UI (or netlify.toml):
- **Build Command**: `bun install && bun run build`
- **Publish Directory**: `dist/`
- **Node Version**: 18+ (Netlify default is fine)

#### Step 3: Add Environment Variables in Netlify
In Netlify dashboard → Site settings → Build & deploy → Environment:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

#### Step 4: Configure Redirects (Already in Place)
File `public/_redirects` handles SPA routing:
```
/* /index.html 200
```
This ensures all routes load index.html so React Router works correctly.

#### Step 5: Deploy
- Connect GitHub repo to Netlify
- Netlify auto-deploys on push to main
- Monitor deploy logs at Netlify dashboard
- Once deployed, test at `https://your-site.netlify.app`

### Verify Firebase Works on Netlify
After deployment:
1. **Login Page**: Test email/password signup + Google OAuth
2. **Add Expense**: Verify data saves to Firestore (check Firebase console)
3. **CSV Upload**: Test bank record import → should appear in dashboard
4. **Alerts & Charts**: Confirm expense classification + UI renders

### Troubleshooting Netlify + Firebase

| Issue | Solution |
|-------|----------|
| "Firebase not initialized" on deployed site | Check env vars in Netlify dashboard match your Firebase config |
| CSV upload fails after deployment | Verify Firestore security rules allow reads/writes for authenticated users |
| Auth redirect loops | Ensure `VITE_FIREBASE_AUTH_DOMAIN` matches Firebase project domain |
| 404 on page refresh | `_redirects` file missing or not in `public/` folder |
| Slow initial load | Normal with Vite—gzip compression auto-enabled on Netlify |

## Testing & Validation
- No test suite configured; add Jest/Vitest as needed
- Mock data in `mockData.ts` used for local dev
- CSV validation in `parseCSV()` throws on malformed input—catch in UI
- **Pre-deployment**: Run `bun run build` locally to catch errors before pushing
