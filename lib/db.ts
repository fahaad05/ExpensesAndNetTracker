import Database from "better-sqlite3";
import { createHash } from "node:crypto";
import path from "node:path";
import { mkdirSync } from "node:fs";

const configuredDbPath = process.env.TRACKER_DB_PATH?.trim();
const dbPath = configuredDbPath
  ? path.resolve(configuredDbPath)
  : path.join(process.cwd(), "data", "tracker.sqlite");
const dataDir = path.dirname(dbPath);

mkdirSync(dataDir, { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

type MetricRow = {
  label: string;
  amount: number;
};

export type MonthlyReview = {
  id: number;
  month: string;
  reviewDate: string;
  income: number;
  expenses: number;
  expenseRate: number;
  investments: number;
  investmentRate: number;
  extra: number;
  extraRate: number;
  fixedExpenses: number;
  fixedExpenseRate: number;
  travel: number;
  oneOffExpenses: number;
  notes: string;
  wins: string;
  challenges: string;
  actions: string;
};

export type QuarterlyReview = {
  id: number;
  quarter: string;
  reviewDate: string;
  mainAccount: number;
  emergencyFund: number;
  investmentsValue: number;
  crypto: number;
  debts: number;
  totalActive: number;
  netWorth: number;
  notes: string;
  wins: string;
  challenges: string;
  actions: string;
};

export type FixedExpense = {
  id: number;
  name: string;
  category: string;
  amount: number;
  cadence: "monthly" | "yearly";
};

export type Investment = {
  id: number;
  name: string;
  category: string;
  account: string;
  investedAmount: number;
  currentValue: number;
  asOfDate: string;
};

type InvestmentInput = {
  name: string;
  account: string;
  investedDelta: number;
  currentValue: number;
  asOfDate: string;
};

type InvestmentSeriesRow = {
  id: number;
  name: string;
  account: string;
  investedDelta: number;
  asOfDate: string;
};

export type SharedTransaction = {
  id: number;
  transactionDate: string;
  description: string;
  category: string;
  amount: number;
  usedBy: "me" | "other" | "shared";
  notes: string;
};

export type DashboardData = {
  monthlyReviews: MonthlyReview[];
  quarterlyReviews: QuarterlyReview[];
  fixedExpenses: FixedExpense[];
  investments: Investment[];
  sharedTransactions: SharedTransaction[];
  cashewTransactions: CashewTransaction[];
  cashewImports: CashewImportFile[];
  monthlyTrend: MetricRow[];
  netWorthTrend: MetricRow[];
  fixedExpenseSummary: {
    monthlyTotal: number;
    yearlyTotal: number;
  };
  sharedAccountSummary: {
    total: number;
    myUsage: number;
    otherUsage: number;
  };
  investmentSummary: {
    totalInvested: number;
    currentValue: number;
    gainLoss: number;
  };
  cashewImportSummary: {
    totalRows: number;
    includedRows: number;
    excludedRows: number;
    includedSpendingChf: number;
    foreignCurrencyRows: number;
    byCategory: Array<{
      category: string;
      amount: number;
    }>;
  };
};

export type CashewImportFile = {
  sourceFile: string;
  importLabel: string;
  rows: number;
  importedAt: string;
};

export type CashewTransaction = {
  id: number;
  externalKey: string;
  sourceFile: string;
  account: string;
  amount: number;
  currency: string;
  title: string;
  note: string;
  transactionDate: string;
  income: boolean;
  transactionType: string;
  categoryName: string;
  subcategoryName: string;
  excluded: boolean;
  exclusionReason: string;
  importedAt: string;
  reportCurrency: "CHF" | "foreign";
};

export type CashewImportRow = {
  account: string;
  amount: number;
  currency: string;
  title: string;
  note: string;
  transactionDate: string;
  income: boolean;
  transactionType: string;
  categoryName: string;
  subcategoryName: string;
};

type MonthlyReviewInput = {
  reviewDate: string;
  income: number;
  expenses: number;
  investments: number;
  extra: number;
  fixedExpenses: number;
  travel: number;
  oneOffExpenses: number;
  notes: string;
  wins: string;
  challenges: string;
  actions: string;
};

type MonthlyReviewUpdateInput = MonthlyReviewInput & {
  id: number;
};

type QuarterlyReviewInput = {
  reviewDate: string;
  mainAccount: number;
  emergencyFund: number;
  investmentsValue: number;
  crypto: number;
  debts: number;
  notes: string;
  wins: string;
  challenges: string;
  actions: string;
};

type QuarterlyReviewUpdateInput = QuarterlyReviewInput & {
  id: number;
};

function getQuarterFromDate(reviewDate: string) {
  const [year, month] = reviewDate.split("-").map(Number);
  const quarter = Math.floor((month - 1) / 3) + 1;
  return `${year}-Q${quarter}`;
}

function computeMonthlyRates(review: Pick<MonthlyReview, "income" | "expenses" | "investments" | "extra" | "fixedExpenses">) {
  if (review.income <= 0) {
    return {
      expenseRate: 0,
      investmentRate: 0,
      extraRate: 0,
      fixedExpenseRate: 0
    };
  }

  return {
    expenseRate: (review.expenses / review.income) * 100,
    investmentRate: (review.investments / review.income) * 100,
    extraRate: (review.extra / review.income) * 100,
    fixedExpenseRate: (review.fixedExpenses / review.income) * 100
  };
}

function buildCashewExternalKey(row: CashewImportRow) {
  return createHash("sha256")
    .update(
      [
        row.account,
        row.amount,
        row.currency,
        row.title,
        row.note,
        row.transactionDate,
        row.income,
        row.transactionType,
        row.categoryName,
        row.subcategoryName
      ].join("|")
    )
    .digest("hex");
}

function getCashewAutoExclusionReason(row: CashewImportRow) {
  const title = row.title.toLowerCase();
  const note = row.note.toLowerCase();
  const category = row.categoryName.toLowerCase();
  const type = row.transactionType.toLowerCase();

  if (category.includes("correzione saldo") || note.includes("saldo aggiornato")) {
    return "Auto-excluded: balance correction";
  }

  if (type.includes("transfer")) {
    return "Auto-excluded: transfer";
  }

  if (title.includes("transfer")) {
    return "Auto-excluded: transfer-like title";
  }

  return "";
}

function getCashewReportCurrency(row: Pick<CashewImportRow, "currency">) {
  return row.currency.toUpperCase() === "CHF" ? "CHF" : "foreign";
}

function deriveCashewImportLabel(rows: CashewImportRow[]) {
  const reviewMonths = [...new Set(rows.map((row) => getCashewReviewMonth(row.transactionDate)))].sort();

  if (reviewMonths.length === 0) {
    return "Untitled import";
  }

  const formatter = new Intl.DateTimeFormat("en", {
    month: "long",
    year: "numeric"
  });

  const formatMonth = (value: string) => formatter.format(new Date(`${value}-01T00:00:00Z`));

  if (reviewMonths.length === 1) {
    return formatMonth(reviewMonths[0]);
  }

  return `${formatMonth(reviewMonths[0])} - ${formatMonth(reviewMonths.at(-1) ?? reviewMonths[0])}`;
}

function getCashewReviewMonth(transactionDate: string) {
  const date = new Date(`${transactionDate.slice(0, 10)}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 7);
  return date.toISOString().slice(0, 7);
}

function addColumnIfMissing(tableName: string, columnName: string, definition: string) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all() as Array<{ name: string }>;
  if (!columns.some((column) => column.name === columnName)) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      review_date TEXT NOT NULL DEFAULT '',
      income REAL NOT NULL,
      expenses REAL NOT NULL,
      savings REAL NOT NULL,
      expense_rate REAL NOT NULL DEFAULT 0,
      investments REAL NOT NULL DEFAULT 0,
      investment_rate REAL NOT NULL DEFAULT 0,
      extra REAL NOT NULL DEFAULT 0,
      extra_rate REAL NOT NULL DEFAULT 0,
      fixed_expenses REAL NOT NULL DEFAULT 0,
      fixed_expense_rate REAL NOT NULL DEFAULT 0,
      travel REAL NOT NULL DEFAULT 0,
      one_off_expenses REAL NOT NULL DEFAULT 0,
      notes TEXT NOT NULL DEFAULT '',
      wins TEXT NOT NULL,
      challenges TEXT NOT NULL,
      actions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS quarterly_reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quarter TEXT NOT NULL UNIQUE,
      review_date TEXT NOT NULL DEFAULT '',
      main_account REAL NOT NULL DEFAULT 0,
      emergency_fund REAL NOT NULL DEFAULT 0,
      investments_value REAL NOT NULL DEFAULT 0,
      crypto REAL NOT NULL DEFAULT 0,
      debts REAL NOT NULL DEFAULT 0,
      total_active REAL NOT NULL DEFAULT 0,
      total_assets REAL NOT NULL,
      total_liabilities REAL NOT NULL,
      net_worth REAL NOT NULL,
      invested_capital REAL NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      wins TEXT NOT NULL,
      challenges TEXT NOT NULL,
      actions TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS fixed_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      cadence TEXT NOT NULL CHECK(cadence IN ('monthly', 'yearly'))
    );

    CREATE TABLE IF NOT EXISTS investments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      account TEXT NOT NULL,
      invested_delta REAL NOT NULL DEFAULT 0,
      invested_amount REAL NOT NULL,
      current_value REAL NOT NULL,
      as_of_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS shared_account_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      transaction_date TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      used_by TEXT NOT NULL CHECK(used_by IN ('me', 'other', 'shared')),
      notes TEXT NOT NULL DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS cashew_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      external_key TEXT NOT NULL UNIQUE,
      source_file TEXT NOT NULL,
      import_label TEXT NOT NULL DEFAULT '',
      account TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL,
      title TEXT NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      transaction_date TEXT NOT NULL,
      income INTEGER NOT NULL DEFAULT 0,
      transaction_type TEXT NOT NULL DEFAULT '',
      category_name TEXT NOT NULL DEFAULT '',
      subcategory_name TEXT NOT NULL DEFAULT '',
      excluded INTEGER NOT NULL DEFAULT 0,
      exclusion_reason TEXT NOT NULL DEFAULT '',
      imported_at TEXT NOT NULL
    );
  `);

  addColumnIfMissing("monthly_reviews", "review_date", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("monthly_reviews", "expense_rate", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "investments", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "investment_rate", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "extra", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "extra_rate", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "fixed_expenses", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "fixed_expense_rate", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "travel", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "one_off_expenses", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("monthly_reviews", "notes", "TEXT NOT NULL DEFAULT ''");

  addColumnIfMissing("quarterly_reviews", "review_date", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("quarterly_reviews", "main_account", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "emergency_fund", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "investments_value", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "crypto", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "debts", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "total_active", "REAL NOT NULL DEFAULT 0");
  addColumnIfMissing("quarterly_reviews", "notes", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("cashew_transactions", "import_label", "TEXT NOT NULL DEFAULT ''");
  addColumnIfMissing("investments", "invested_delta", "REAL NOT NULL DEFAULT 0");

  db.exec(`
    UPDATE monthly_reviews
    SET review_date = CASE
      WHEN review_date = '' THEN month || '-01'
      ELSE review_date
    END;

    UPDATE quarterly_reviews
    SET review_date = CASE
      WHEN review_date = '' THEN substr(quarter, 1, 4) || '-' ||
        CASE substr(quarter, 7, 1)
          WHEN '1' THEN '03-31'
          WHEN '2' THEN '06-30'
          WHEN '3' THEN '09-30'
          ELSE '12-31'
        END
      ELSE review_date
    END;

    UPDATE quarterly_reviews
    SET total_active = CASE
      WHEN total_active = 0 THEN total_assets
      ELSE total_active
    END,
    debts = CASE
      WHEN debts = 0 THEN total_liabilities
      ELSE debts
    END;

    UPDATE cashew_transactions
    SET import_label = CASE
      WHEN import_label = '' THEN source_file
      ELSE import_label
    END;
  `);
}

function hasSeedData() {
  const result = db.prepare("SELECT COUNT(*) AS count FROM monthly_reviews").get() as { count: number };
  return result.count > 0;
}

function shouldAutoSeedDemoData() {
  const value = process.env.DEMO_SEED_ON_BOOT?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

function normalizeInvestmentSeries(name: string, account: string) {
  const rows = db
    .prepare(
      `SELECT
         id,
         name,
         account,
         invested_delta AS investedDelta,
         as_of_date AS asOfDate
       FROM investments
       WHERE name = ? AND account = ?
       ORDER BY as_of_date ASC, id ASC`
    )
    .all(name, account) as InvestmentSeriesRow[];

  let cumulative = 0;
  const updateStatement = db.prepare(
    `UPDATE investments
     SET invested_amount = ?, category = ?
     WHERE id = ?`
  );

  for (const row of rows) {
    cumulative += row.investedDelta;
    updateStatement.run(cumulative, row.name, row.id);
  }
}

function normalizeAllInvestmentSeries() {
  const series = db
    .prepare(
      `SELECT DISTINCT name, account
       FROM investments`
    )
    .all() as Array<{ name: string; account: string }>;

  const backfillStatement = db.prepare(
    `SELECT
       id,
       invested_amount AS investedAmount,
       as_of_date AS asOfDate
     FROM investments
     WHERE name = ? AND account = ?
     ORDER BY as_of_date ASC, id ASC`
  );
  const setDeltaStatement = db.prepare(`UPDATE investments SET invested_delta = ? WHERE id = ?`);

  db.transaction(() => {
    for (const { name, account } of series) {
      const rows = backfillStatement.all(name, account) as Array<{
        id: number;
        investedAmount: number;
        asOfDate: string;
      }>;

      let previousCumulative = 0;
      for (const row of rows) {
        const delta = row.investedAmount - previousCumulative;
        setDeltaStatement.run(delta, row.id);
        previousCumulative = row.investedAmount;
      }

      normalizeInvestmentSeries(name, account);
    }
  })();
}

function seedStarterDataCore() {
  const monthly = db.prepare(`
    INSERT INTO monthly_reviews (
      month, review_date, income, expenses, savings, expense_rate, investments, investment_rate,
      extra, extra_rate, fixed_expenses, fixed_expense_rate, travel, one_off_expenses, notes,
      wins, challenges, actions
    )
    VALUES (
      @month, @reviewDate, @income, @expenses, @savings, @expenseRate, @investments, @investmentRate,
      @extra, @extraRate, @fixedExpenses, @fixedExpenseRate, @travel, @oneOffExpenses, @notes,
      @wins, @challenges, @actions
    )
  `);

  const quarterly = db.prepare(`
    INSERT INTO quarterly_reviews (
      quarter, review_date, main_account, emergency_fund, investments_value, crypto, debts,
      total_active, total_assets, total_liabilities, net_worth, invested_capital, notes,
      wins, challenges, actions
    )
    VALUES (
      @quarter, @reviewDate, @mainAccount, @emergencyFund, @investmentsValue, @crypto, @debts,
      @totalActive, @totalAssets, @totalLiabilities, @netWorth, @investedCapital, @notes,
      @wins, @challenges, @actions
    )
  `);

  const fixed = db.prepare(`
    INSERT INTO fixed_expenses (name, category, amount, cadence)
    VALUES (@name, @category, @amount, @cadence)
  `);

  const investment = db.prepare(`
    INSERT INTO investments (name, category, account, invested_amount, current_value, as_of_date)
    VALUES (@name, @category, @account, @investedAmount, @currentValue, @asOfDate)
  `);

  const shared = db.prepare(`
    INSERT INTO shared_account_transactions (transaction_date, description, category, amount, used_by, notes)
    VALUES (@transactionDate, @description, @category, @amount, @usedBy, @notes)
  `);

  const cashew = db.prepare(`
    INSERT INTO cashew_transactions (
      external_key, source_file, import_label, account, amount, currency, title, note, transaction_date,
      income, transaction_type, category_name, subcategory_name, excluded, exclusion_reason, imported_at
    )
    VALUES (
      @externalKey, @sourceFile, @importLabel, @account, @amount, @currency, @title, @note, @transactionDate,
      @income, @transactionType, @categoryName, @subcategoryName, @excluded, @exclusionReason, @importedAt
    )
  `);

  db.transaction(() => {
    [
      {
        month: "2026-01",
        income: 6200,
        expenses: 3810,
        reviewDate: "2026-01-31",
        savings: 1890,
        expenseRate: 61.45,
        investments: 500,
        investmentRate: 8.06,
        extra: 260,
        extraRate: 4.19,
        fixedExpenses: 2850,
        fixedExpenseRate: 45.97,
        travel: 280,
        oneOffExpenses: 420,
        notes: "Quiet month overall with good cost control.",
        wins: "Stayed under travel budget and cleared one annual subscription early.",
        challenges: "Restaurant spending spiked during a busy work month.",
        actions: "Cap dining-out at 250 next month and schedule a weekly meal prep block."
      },
      {
        month: "2026-02",
        income: 6200,
        expenses: 4025,
        reviewDate: "2026-02-28",
        savings: 1625,
        expenseRate: 64.92,
        investments: 550,
        investmentRate: 8.87,
        extra: 410,
        extraRate: 6.61,
        fixedExpenses: 2890,
        fixedExpenseRate: 46.61,
        travel: 310,
        oneOffExpenses: 415,
        notes: "A few lifestyle purchases pushed the month up.",
        wins: "Investment contributions stayed consistent despite a few surprises.",
        challenges: "Bought tech accessories outside the planned budget.",
        actions: "Create a sinking fund for gadgets and delay discretionary purchases by 72 hours."
      },
      {
        month: "2026-03",
        income: 6350,
        expenses: 3950,
        reviewDate: "2026-03-31",
        savings: 1825,
        expenseRate: 62.2,
        investments: 575,
        investmentRate: 9.06,
        extra: 345,
        extraRate: 5.43,
        fixedExpenses: 2910,
        fixedExpenseRate: 45.83,
        travel: 290,
        oneOffExpenses: 405,
        notes: "Shared-account reconciliation still took too much manual effort.",
        wins: "Fixed expenses stayed stable and side income boosted savings.",
        challenges: "Shared account grocery reconciliation was still manual.",
        actions: "Log shared-account purchases weekly and review categories every Sunday."
      },
      {
        month: "2026-04",
        income: 6350,
        expenses: 3885,
        reviewDate: "2026-04-30",
        savings: 1815,
        expenseRate: 61.18,
        investments: 650,
        investmentRate: 10.24,
        extra: 290,
        extraRate: 4.57,
        fixedExpenses: 2895,
        fixedExpenseRate: 45.59,
        travel: 265,
        oneOffExpenses: 435,
        notes: "Good month, but the investing review still felt fragmented.",
        wins: "Maintained savings rate above target and reduced low-value subscriptions.",
        challenges: "Quarterly investing overview took too long to piece together.",
        actions: "Use the dashboard to update invested capital and current values at month end."
      }
    ].forEach((entry) => monthly.run(entry));

    [
      {
        quarter: "2025-Q4",
        reviewDate: "2025-12-29",
        mainAccount: 2400,
        emergencyFund: 17850,
        investmentsValue: 27850,
        crypto: 1320,
        debts: 18600,
        totalActive: 49420,
        totalAssets: 49420,
        totalLiabilities: 18600,
        netWorth: 30820,
        investedCapital: 29170,
        notes: "Cash buffer improved by year end.",
        wins: "Finished the year with a stronger cash buffer.",
        challenges: "No single place to compare investment contributions versus current value.",
        actions: "Track invested capital by account each quarter."
      },
      {
        quarter: "2026-Q1",
        reviewDate: "2026-03-29",
        mainAccount: 495,
        emergencyFund: 19890,
        investmentsValue: 18790,
        crypto: 1140,
        debts: 63128,
        totalActive: 40315,
        totalAssets: 40315,
        totalLiabilities: 63128,
        netWorth: -22813,
        investedCapital: 19930,
        notes: "Debts still dominate the picture, so liquidity and repayment strategy matter most.",
        wins: "Net worth grew steadily while liabilities kept trending down.",
        challenges: "Shared account spending was hard to separate between personal and common use.",
        actions: "Tag every shared transaction as me, other, or shared."
      }
    ].forEach((entry) => quarterly.run(entry));

    [
      { name: "Rent", category: "Housing", amount: 1450, cadence: "monthly" },
      { name: "Internet", category: "Utilities", amount: 49, cadence: "monthly" },
      { name: "Health Insurance", category: "Insurance", amount: 290, cadence: "monthly" },
      { name: "Gym", category: "Health", amount: 39, cadence: "monthly" },
      { name: "Home Insurance", category: "Insurance", amount: 420, cadence: "yearly" },
      { name: "Prime Membership", category: "Subscriptions", amount: 99, cadence: "yearly" }
    ].forEach((entry) => fixed.run(entry));

    [
      {
        name: "Global Equity Fund",
        category: "ETF",
        account: "Brokerage Account",
        investedAmount: 18200,
        currentValue: 20150,
        asOfDate: "2026-04-01"
      },
      {
        name: "Retirement Account",
        category: "Retirement",
        account: "Retirement Provider",
        investedAmount: 9100,
        currentValue: 9750,
        asOfDate: "2026-04-01"
      },
      {
        name: "Digital Assets",
        category: "Crypto",
        account: "Exchange Account",
        investedAmount: 4850,
        currentValue: 4630,
        asOfDate: "2026-04-01"
      }
    ].forEach((entry) => investment.run(entry));

    [
      {
        transactionDate: "2026-04-04",
        description: "Groceries",
        category: "Food",
        amount: 128,
        usedBy: "shared",
        notes: "Weekly household shopping"
      },
      {
        transactionDate: "2026-04-08",
        description: "Train tickets",
        category: "Transport",
        amount: 62,
        usedBy: "me",
        notes: "Weekend trip paid from shared card by mistake"
      },
      {
        transactionDate: "2026-04-12",
        description: "Cleaning supplies",
        category: "Home",
        amount: 44,
        usedBy: "shared",
        notes: ""
      },
      {
        transactionDate: "2026-04-17",
        description: "Pharmacy",
        category: "Health",
        amount: 27,
        usedBy: "other",
        notes: "Personal item for partner"
      }
    ].forEach((entry) => shared.run(entry));

    const importedAt = "2026-04-25T10:15:00.000Z";
    const sourceFile = "demo-cashew-march-april.csv";
    const importLabel = "March - April 2026";

    [
      {
        account: "Main Card",
        amount: -82.4,
        currency: "CHF",
        title: "Groceries",
        note: "Weekly household shopping",
        transactionDate: "2026-03-26",
        income: false,
        transactionType: "expense",
        categoryName: "Food",
        subcategoryName: "Groceries"
      },
      {
        account: "Main Card",
        amount: -24.9,
        currency: "CHF",
        title: "Streaming Subscription",
        note: "",
        transactionDate: "2026-03-28",
        income: false,
        transactionType: "expense",
        categoryName: "Subscriptions",
        subcategoryName: "Entertainment"
      },
      {
        account: "Travel Card",
        amount: -110,
        currency: "EUR",
        title: "Hotel Deposit",
        note: "Weekend city break",
        transactionDate: "2026-04-02",
        income: false,
        transactionType: "expense",
        categoryName: "Travel",
        subcategoryName: "Accommodation"
      },
      {
        account: "Main Card",
        amount: -64.5,
        currency: "CHF",
        title: "Train Pass",
        note: "",
        transactionDate: "2026-04-06",
        income: false,
        transactionType: "expense",
        categoryName: "Transport",
        subcategoryName: "Public transport"
      },
      {
        account: "Main Account",
        amount: 6350,
        currency: "CHF",
        title: "Salary",
        note: "",
        transactionDate: "2026-04-25",
        income: true,
        transactionType: "income",
        categoryName: "Income",
        subcategoryName: "Salary"
      },
      {
        account: "Main Card",
        amount: -420,
        currency: "CHF",
        title: "Tax advance",
        note: "",
        transactionDate: "2026-04-11",
        income: false,
        transactionType: "expense",
        categoryName: "Taxes",
        subcategoryName: "Advance payment"
      },
      {
        account: "Main Card",
        amount: -58,
        currency: "CHF",
        title: "Balance correction",
        note: "saldo aggiornato",
        transactionDate: "2026-04-15",
        income: false,
        transactionType: "expense",
        categoryName: "Correzione saldo",
        subcategoryName: "Adjustment"
      }
    ].forEach((row) => {
      const exclusionReason = getCashewAutoExclusionReason(row);
      cashew.run({
        ...row,
        externalKey: buildCashewExternalKey(row),
        sourceFile,
        importLabel,
        importedAt,
        income: row.income ? 1 : 0,
        excluded: exclusionReason ? 1 : 0,
        exclusionReason
      });
    });
  })();
}

export function ensureDatabase() {
  initSchema();
  normalizeAllInvestmentSeries();

  if (shouldAutoSeedDemoData() && !hasSeedData()) {
    seedStarterDataCore();
    normalizeAllInvestmentSeries();
  }
}

export function seedStarterData() {
  ensureDatabase();

  if (hasSeedData()) {
    return;
  }

  seedStarterDataCore();
}

export function getDashboardData(): DashboardData {
  ensureDatabase();

  const monthlyReviews = db
    .prepare(
      `SELECT
         id,
         month,
         review_date AS reviewDate,
         income,
         expenses,
         expense_rate AS expenseRate,
         investments,
         investment_rate AS investmentRate,
         extra,
         extra_rate AS extraRate,
         fixed_expenses AS fixedExpenses,
         fixed_expense_rate AS fixedExpenseRate,
         travel,
         one_off_expenses AS oneOffExpenses,
         notes,
         wins,
         challenges,
         actions
       FROM monthly_reviews
       ORDER BY month ASC`
    )
    .all() as MonthlyReview[];

  const quarterlyReviews = db
    .prepare(
      `SELECT
         id,
         quarter,
         review_date AS reviewDate,
         main_account AS mainAccount,
         emergency_fund AS emergencyFund,
         investments_value AS investmentsValue,
         crypto,
         debts,
         total_active AS totalActive,
         net_worth AS netWorth,
         notes,
         wins,
         challenges,
         actions
       FROM quarterly_reviews
       ORDER BY review_date ASC`
    )
    .all() as QuarterlyReview[];

  const fixedExpenses = db
    .prepare(
      `SELECT id, name, category, amount, cadence
       FROM fixed_expenses
       ORDER BY cadence ASC, amount DESC`
    )
    .all() as FixedExpense[];

  const investments = db
    .prepare(
      `SELECT
         id,
         name,
         category,
         account,
         invested_amount AS investedAmount,
         current_value AS currentValue,
         as_of_date AS asOfDate
       FROM investments
       ORDER BY as_of_date DESC, current_value DESC`
    )
    .all() as Investment[];

  const sharedTransactions = db
    .prepare(
      `SELECT
         id,
         transaction_date AS transactionDate,
         description,
         category,
         amount,
         used_by AS usedBy,
         notes
       FROM shared_account_transactions
       ORDER BY transaction_date DESC, id DESC`
    )
    .all() as SharedTransaction[];

  const cashewTransactions = db
    .prepare(
      `SELECT
         id,
         external_key AS externalKey,
         source_file AS sourceFile,
         import_label AS importLabel,
         account,
         amount,
         currency,
         title,
         note,
         transaction_date AS transactionDate,
         income,
         transaction_type AS transactionType,
         category_name AS categoryName,
         subcategory_name AS subcategoryName,
         excluded,
         exclusion_reason AS exclusionReason,
         imported_at AS importedAt
       FROM cashew_transactions
       ORDER BY transaction_date DESC, id DESC`
    )
    .all()
    .map((row) => ({
      ...(row as Omit<CashewTransaction, "income" | "excluded">),
      income: Boolean((row as { income: number }).income),
      excluded: Boolean((row as { excluded: number }).excluded),
      reportCurrency: ((row as { currency: string }).currency.toUpperCase() === "CHF" ? "CHF" : "foreign") as CashewTransaction["reportCurrency"]
    })) as CashewTransaction[];

  const cashewImports = db
    .prepare(
      `SELECT
         source_file AS sourceFile,
         MAX(import_label) AS importLabel,
         COUNT(*) AS rows,
         MAX(imported_at) AS importedAt
       FROM cashew_transactions
       GROUP BY source_file
       ORDER BY importedAt DESC`
    )
    .all() as CashewImportFile[];

  const monthlyTrend = monthlyReviews.map((review) => ({
    label: review.month,
    amount: review.income - review.expenses - review.investments
  }));

  const netWorthTrend = quarterlyReviews.map((review) => ({
    label: review.quarter,
    amount: review.netWorth
  }));

  const fixedExpenseSummary = fixedExpenses.reduce(
    (summary, expense) => {
      if (expense.cadence === "monthly") {
        summary.monthlyTotal += expense.amount;
      } else {
        summary.yearlyTotal += expense.amount;
      }
      return summary;
    },
    { monthlyTotal: 0, yearlyTotal: 0 }
  );

  const sharedAccountSummary = sharedTransactions.reduce(
    (summary, tx) => {
      summary.total += tx.amount;
      if (tx.usedBy === "me") {
        summary.myUsage += tx.amount;
      } else if (tx.usedBy === "other") {
        summary.otherUsage += tx.amount;
      } else {
        summary.myUsage += tx.amount / 2;
        summary.otherUsage += tx.amount / 2;
      }
      return summary;
    },
    { total: 0, myUsage: 0, otherUsage: 0 }
  );

  const investmentSummary = investments.reduce(
    (summary, investmentItem) => {
      summary.totalInvested += investmentItem.investedAmount;
      summary.currentValue += investmentItem.currentValue;
      return summary;
    },
    { totalInvested: 0, currentValue: 0, gainLoss: 0 }
  );

  investmentSummary.gainLoss = investmentSummary.currentValue - investmentSummary.totalInvested;

  const includedCashewRows = cashewTransactions.filter(
    (row) => !row.excluded && row.amount < 0 && !row.income && row.reportCurrency === "CHF"
  );
  const cashewByCategoryMap = new Map<string, number>();
  for (const row of includedCashewRows) {
    const key = row.subcategoryName || row.categoryName || "Uncategorized";
    cashewByCategoryMap.set(key, (cashewByCategoryMap.get(key) ?? 0) + Math.abs(row.amount));
  }

  const cashewImportSummary = {
    totalRows: cashewTransactions.length,
    includedRows: cashewTransactions.filter((row) => !row.excluded).length,
    excludedRows: cashewTransactions.filter((row) => row.excluded).length,
    includedSpendingChf: includedCashewRows.reduce((sum, row) => sum + Math.abs(row.amount), 0),
    foreignCurrencyRows: cashewTransactions.filter((row) => row.reportCurrency === "foreign").length,
    byCategory: [...cashewByCategoryMap.entries()]
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 8)
  };

  return {
    monthlyReviews,
    quarterlyReviews,
    fixedExpenses,
    investments,
    sharedTransactions,
    cashewTransactions,
    cashewImports,
    monthlyTrend,
    netWorthTrend,
    fixedExpenseSummary,
    sharedAccountSummary,
    investmentSummary,
    cashewImportSummary
  };
}

export function insertMonthlyReview(input: MonthlyReviewInput) {
  ensureDatabase();
  const month = input.reviewDate.slice(0, 7);
  const rates = computeMonthlyRates(input);
  const savings = input.income - input.expenses - input.investments;
  db.prepare(
    `INSERT INTO monthly_reviews (
       month, review_date, income, expenses, savings, expense_rate, investments, investment_rate,
       extra, extra_rate, fixed_expenses, fixed_expense_rate, travel, one_off_expenses, notes,
       wins, challenges, actions
     )
     VALUES (
       @month, @reviewDate, @income, @expenses, @savings, @expenseRate, @investments, @investmentRate,
       @extra, @extraRate, @fixedExpenses, @fixedExpenseRate, @travel, @oneOffExpenses, @notes,
       @wins, @challenges, @actions
     )
     ON CONFLICT(month) DO UPDATE SET
       review_date = excluded.review_date,
       income = excluded.income,
       expenses = excluded.expenses,
       savings = excluded.savings,
       expense_rate = excluded.expense_rate,
       investments = excluded.investments,
       investment_rate = excluded.investment_rate,
       extra = excluded.extra,
       extra_rate = excluded.extra_rate,
       fixed_expenses = excluded.fixed_expenses,
       fixed_expense_rate = excluded.fixed_expense_rate,
       travel = excluded.travel,
       one_off_expenses = excluded.one_off_expenses,
       notes = excluded.notes,
       wins = excluded.wins,
       challenges = excluded.challenges,
       actions = excluded.actions`
  ).run({
    ...input,
    month,
    ...rates,
    savings
  });
}

export function updateMonthlyReview(input: MonthlyReviewUpdateInput) {
  ensureDatabase();
  const month = input.reviewDate.slice(0, 7);
  const rates = computeMonthlyRates(input);
  const savings = input.income - input.expenses - input.investments;

  db.prepare(
    `UPDATE monthly_reviews
     SET
       month = @month,
       review_date = @reviewDate,
       income = @income,
       expenses = @expenses,
       savings = @savings,
       expense_rate = @expenseRate,
       investments = @investments,
       investment_rate = @investmentRate,
       extra = @extra,
       extra_rate = @extraRate,
       fixed_expenses = @fixedExpenses,
       fixed_expense_rate = @fixedExpenseRate,
       travel = @travel,
       one_off_expenses = @oneOffExpenses,
       notes = @notes,
       wins = @wins,
       challenges = @challenges,
       actions = @actions
     WHERE id = @id`
  ).run({
    ...input,
    month,
    ...rates,
    savings
  });
}

export function deleteMonthlyReview(id: number) {
  ensureDatabase();
  db.prepare(`DELETE FROM monthly_reviews WHERE id = ?`).run(id);
}

export function insertQuarterlyReview(input: QuarterlyReviewInput) {
  ensureDatabase();
  const quarter = getQuarterFromDate(input.reviewDate);
  const totalActive = input.mainAccount + input.emergencyFund + input.investmentsValue + input.crypto;
  const netWorth = totalActive - input.debts;
  db.prepare(
    `INSERT INTO quarterly_reviews (
       quarter, review_date, main_account, emergency_fund, investments_value, crypto, debts,
       total_active, total_assets, total_liabilities, net_worth, invested_capital, notes,
       wins, challenges, actions
     ) VALUES (
       @quarter, @reviewDate, @mainAccount, @emergencyFund, @investmentsValue, @crypto, @debts,
       @totalActive, @totalAssets, @totalLiabilities, @netWorth, @investedCapital, @notes,
       @wins, @challenges, @actions
     )
     ON CONFLICT(quarter) DO UPDATE SET
       review_date = excluded.review_date,
       main_account = excluded.main_account,
       emergency_fund = excluded.emergency_fund,
       investments_value = excluded.investments_value,
       crypto = excluded.crypto,
       debts = excluded.debts,
       total_active = excluded.total_active,
       total_assets = excluded.total_assets,
       total_liabilities = excluded.total_liabilities,
       net_worth = excluded.net_worth,
       invested_capital = excluded.invested_capital,
       notes = excluded.notes,
       wins = excluded.wins,
       challenges = excluded.challenges,
       actions = excluded.actions`
  ).run({
    ...input,
    quarter,
    totalActive,
    totalAssets: totalActive,
    totalLiabilities: input.debts,
    netWorth,
    investedCapital: input.investmentsValue + input.crypto
  });
}

export function updateQuarterlyReview(input: QuarterlyReviewUpdateInput) {
  ensureDatabase();
  const quarter = getQuarterFromDate(input.reviewDate);
  const totalActive = input.mainAccount + input.emergencyFund + input.investmentsValue + input.crypto;
  const netWorth = totalActive - input.debts;

  db.prepare(
    `UPDATE quarterly_reviews
     SET
       quarter = @quarter,
       review_date = @reviewDate,
       main_account = @mainAccount,
       emergency_fund = @emergencyFund,
       investments_value = @investmentsValue,
       crypto = @crypto,
       debts = @debts,
       total_active = @totalActive,
       total_assets = @totalAssets,
       total_liabilities = @totalLiabilities,
       net_worth = @netWorth,
       invested_capital = @investedCapital,
       notes = @notes,
       wins = @wins,
       challenges = @challenges,
       actions = @actions
     WHERE id = @id`
  ).run({
    ...input,
    quarter,
    totalActive,
    totalAssets: totalActive,
    totalLiabilities: input.debts,
    netWorth,
    investedCapital: input.investmentsValue + input.crypto
  });
}

export function deleteQuarterlyReview(id: number) {
  ensureDatabase();
  db.prepare(`DELETE FROM quarterly_reviews WHERE id = ?`).run(id);
}

export function insertFixedExpense(input: Omit<FixedExpense, "id">) {
  ensureDatabase();
  db.prepare(
    `INSERT INTO fixed_expenses (name, category, amount, cadence)
     VALUES (@name, @category, @amount, @cadence)`
  ).run(input);
}

export function updateFixedExpense(input: FixedExpense) {
  ensureDatabase();
  db.prepare(
    `UPDATE fixed_expenses
     SET name = @name, category = @category, amount = @amount, cadence = @cadence
     WHERE id = @id`
  ).run(input);
}

export function deleteFixedExpense(id: number) {
  ensureDatabase();
  db.prepare(`DELETE FROM fixed_expenses WHERE id = ?`).run(id);
}

export function insertInvestment(input: InvestmentInput) {
  ensureDatabase();
  db.transaction(() => {
    db.prepare(
      `INSERT INTO investments (name, category, account, invested_delta, invested_amount, current_value, as_of_date)
       VALUES (@name, @category, @account, @investedDelta, 0, @currentValue, @asOfDate)`
    ).run({
      ...input,
      category: input.name
    });

    normalizeInvestmentSeries(input.name, input.account);
  })();
}

export function updateInvestment(input: Omit<Investment, "category">) {
  ensureDatabase();
  const existing = db
    .prepare(
      `SELECT
         id,
         name,
         account,
         invested_delta AS investedDelta,
         invested_amount AS investedAmount,
         as_of_date AS asOfDate
       FROM investments
       WHERE id = ?`
    )
    .get(input.id) as (InvestmentSeriesRow & { investedAmount: number }) | undefined;

  if (!existing) {
    return;
  }

  db.transaction(() => {
    const previousInTargetSeries = db
      .prepare(
        `SELECT invested_amount AS investedAmount
         FROM investments
         WHERE name = ?
           AND account = ?
           AND id != ?
           AND (as_of_date < ? OR (as_of_date = ? AND id < ?))
         ORDER BY as_of_date DESC, id DESC
         LIMIT 1`
      )
      .get(input.name, input.account, input.id, input.asOfDate, input.asOfDate, input.id) as { investedAmount: number } | undefined;

    const nextDelta = input.investedAmount - (previousInTargetSeries?.investedAmount ?? 0);

    db.prepare(
      `UPDATE investments
       SET
         name = @name,
         category = @name,
         account = @account,
         invested_delta = @investedDelta,
         current_value = @currentValue,
         as_of_date = @asOfDate
       WHERE id = @id`
    ).run({
      ...input,
      investedDelta: nextDelta
    });

    normalizeInvestmentSeries(existing.name, existing.account);
    if (existing.name !== input.name || existing.account !== input.account) {
      normalizeInvestmentSeries(input.name, input.account);
    } else {
      normalizeInvestmentSeries(input.name, input.account);
    }
  })();
}

export function deleteInvestment(id: number) {
  ensureDatabase();
  const existing = db
    .prepare(
      `SELECT name, account
       FROM investments
       WHERE id = ?`
    )
    .get(id) as { name: string; account: string } | undefined;

  if (!existing) {
    return;
  }

  db.transaction(() => {
    db.prepare(`DELETE FROM investments WHERE id = ?`).run(id);
    normalizeInvestmentSeries(existing.name, existing.account);
  })();
}

export function insertSharedTransaction(input: Omit<SharedTransaction, "id">) {
  ensureDatabase();
  db.prepare(
    `INSERT INTO shared_account_transactions (
       transaction_date, description, category, amount, used_by, notes
     ) VALUES (
       @transactionDate, @description, @category, @amount, @usedBy, @notes
     )`
  ).run(input);
}

export function updateSharedTransaction(input: SharedTransaction) {
  ensureDatabase();
  db.prepare(
    `UPDATE shared_account_transactions
     SET
       transaction_date = @transactionDate,
       description = @description,
       category = @category,
       amount = @amount,
       used_by = @usedBy,
       notes = @notes
     WHERE id = @id`
  ).run(input);
}

export function deleteSharedTransaction(id: number) {
  ensureDatabase();
  db.prepare(`DELETE FROM shared_account_transactions WHERE id = ?`).run(id);
}

export function importSharedTransactions(rows: Array<Omit<SharedTransaction, "id">>) {
  ensureDatabase();

  const exists = db.prepare(
    `SELECT id
     FROM shared_account_transactions
     WHERE transaction_date = ?
       AND description = ?
       AND amount = ?
       AND used_by = ?
     LIMIT 1`
  );

  const insert = db.prepare(
    `INSERT INTO shared_account_transactions (
       transaction_date, description, category, amount, used_by, notes
     ) VALUES (
       @transactionDate, @description, @category, @amount, @usedBy, @notes
     )`
  );

  db.transaction(() => {
    for (const row of rows) {
      const existing = exists.get(row.transactionDate, row.description, row.amount, row.usedBy);
      if (!existing) {
        insert.run(row);
      }
    }
  })();
}

export function exportSnapshot() {
  return getDashboardData();
}

export function importCashewTransactions(rows: CashewImportRow[], sourceFile: string) {
  ensureDatabase();
  const importLabel = deriveCashewImportLabel(rows);

  const statement = db.prepare(
    `INSERT INTO cashew_transactions (
       external_key, source_file, import_label, account, amount, currency, title, note, transaction_date,
       income, transaction_type, category_name, subcategory_name, excluded, exclusion_reason, imported_at
     ) VALUES (
       @externalKey, @sourceFile, @importLabel, @account, @amount, @currency, @title, @note, @transactionDate,
       @income, @transactionType, @categoryName, @subcategoryName, @excluded, @exclusionReason, @importedAt
     )
     ON CONFLICT(external_key) DO UPDATE SET
       source_file = excluded.source_file,
       import_label = excluded.import_label,
       account = excluded.account,
       amount = excluded.amount,
       currency = excluded.currency,
       title = excluded.title,
       note = excluded.note,
       transaction_date = excluded.transaction_date,
       income = excluded.income,
       transaction_type = excluded.transaction_type,
       category_name = excluded.category_name,
       subcategory_name = excluded.subcategory_name`
  );

  const importedAt = new Date().toISOString();
  db.transaction(() => {
    for (const row of rows) {
      const exclusionReason = getCashewAutoExclusionReason(row);
      statement.run({
        ...row,
        externalKey: buildCashewExternalKey(row),
        sourceFile,
        importLabel,
        excluded: exclusionReason ? 1 : 0,
        exclusionReason,
        income: row.income ? 1 : 0,
        importedAt
      });
    }
  })();
}

export function setCashewTransactionExcluded(id: number, excluded: boolean) {
  ensureDatabase();

  const current = db
    .prepare(`SELECT exclusion_reason AS exclusionReason FROM cashew_transactions WHERE id = ?`)
    .get(id) as { exclusionReason: string } | undefined;

  const nextReason = excluded
    ? current?.exclusionReason || "Manually excluded"
    : "";

  db.prepare(
    `UPDATE cashew_transactions
     SET excluded = ?, exclusion_reason = ?
     WHERE id = ?`
  ).run(excluded ? 1 : 0, nextReason, id);
}

export function deleteCashewImportBySourceFile(sourceFile: string) {
  ensureDatabase();
  db.prepare(`DELETE FROM cashew_transactions WHERE source_file = ?`).run(sourceFile);
}

export function deleteAllCashewImports() {
  ensureDatabase();
  db.prepare(`DELETE FROM cashew_transactions`).run();
}

export function renameCashewImport(sourceFile: string, importLabel: string) {
  ensureDatabase();
  db.prepare(`UPDATE cashew_transactions SET import_label = ? WHERE source_file = ?`).run(importLabel, sourceFile);
}
