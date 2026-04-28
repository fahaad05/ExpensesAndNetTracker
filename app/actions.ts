"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import {
  deleteAllCashewImports,
  deleteCashewImportBySourceFile,
  deleteFixedExpense,
  deleteInvestment,
  deleteMonthlyReview,
  deleteQuarterlyReview,
  importCashewTransactions,
  importSharedTransactions,
  insertFixedExpense,
  insertInvestment,
  insertMonthlyReview,
  insertQuarterlyReview,
  renameCashewImport,
  deleteSharedTransaction,
  insertSharedTransaction,
  setCashewTransactionExcluded,
  updateSharedTransaction,
  updateInvestment,
  updateMonthlyReview,
  updateQuarterlyReview,
  updateFixedExpense
} from "@/lib/db";
import { parseCashewCsv, parseSharedAccountNotionCsv } from "@/lib/cashew";

const monthlyReviewSchema = z.object({
  reviewDate: z.string().min(8),
  income: z.coerce.number().nonnegative(),
  expenses: z.coerce.number().nonnegative(),
  investments: z.coerce.number().nonnegative(),
  extra: z.coerce.number().nonnegative(),
  fixedExpenses: z.coerce.number().nonnegative(),
  travel: z.coerce.number().nonnegative(),
  oneOffExpenses: z.coerce.number().nonnegative(),
  notes: z.string().default(""),
  wins: z.string().default(""),
  challenges: z.string().default(""),
  actions: z.string().default("")
});

const monthlyReviewUpdateSchema = monthlyReviewSchema.extend({
  id: z.coerce.number().int().positive()
});

const quarterlyReviewSchema = z.object({
  reviewDate: z.string().min(8),
  mainAccount: z.coerce.number(),
  emergencyFund: z.coerce.number().nonnegative(),
  investmentsValue: z.coerce.number().nonnegative(),
  crypto: z.coerce.number().nonnegative(),
  debts: z.coerce.number().nonnegative(),
  notes: z.string().default(""),
  wins: z.string().default(""),
  challenges: z.string().default(""),
  actions: z.string().default("")
});

const quarterlyReviewUpdateSchema = quarterlyReviewSchema.extend({
  id: z.coerce.number().int().positive()
});

const fixedExpenseSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  cadence: z.enum(["monthly", "yearly"])
});

const fixedExpenseUpdateSchema = fixedExpenseSchema.extend({
  id: z.coerce.number().int().positive()
});

const investmentSchema = z.object({
  name: z.string().min(2),
  account: z.string().min(2),
  investedDelta: z.coerce.number().nonnegative(),
  currentValue: z.coerce.number().nonnegative(),
  asOfDate: z.string().min(8)
});

const investmentUpdateSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(2),
  account: z.string().min(2),
  investedAmount: z.coerce.number().nonnegative(),
  currentValue: z.coerce.number().nonnegative(),
  asOfDate: z.string().min(8)
});

const sharedTransactionSchema = z.object({
  transactionDate: z.string().min(8),
  description: z.string().min(2),
  category: z.string().min(2),
  amount: z.coerce.number().positive(),
  usedBy: z.enum(["me", "other", "shared"]),
  notes: z.string().default("")
});

const sharedTransactionUpdateSchema = sharedTransactionSchema.extend({
  id: z.coerce.number().int().positive()
});

const cashewExcludeSchema = z.object({
  id: z.coerce.number().int().positive(),
  excluded: z.enum(["true", "false"])
});

const cashewDeleteFileSchema = z.object({
  sourceFile: z.string().min(1)
});

const cashewRenameFileSchema = z.object({
  sourceFile: z.string().min(1),
  importLabel: z.string().min(1).max(120)
});

const deleteByIdSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function saveMonthlyReview(formData: FormData) {
  const parsed = monthlyReviewSchema.parse(Object.fromEntries(formData));
  insertMonthlyReview(parsed);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function editMonthlyReview(formData: FormData) {
  const parsed = monthlyReviewUpdateSchema.parse(Object.fromEntries(formData));
  updateMonthlyReview(parsed);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function removeMonthlyReview(formData: FormData) {
  const parsed = deleteByIdSchema.parse(Object.fromEntries(formData));
  deleteMonthlyReview(parsed.id);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function saveQuarterlyReview(formData: FormData) {
  const parsed = quarterlyReviewSchema.parse(Object.fromEntries(formData));
  insertQuarterlyReview(parsed);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function editQuarterlyReview(formData: FormData) {
  const parsed = quarterlyReviewUpdateSchema.parse(Object.fromEntries(formData));
  updateQuarterlyReview(parsed);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function removeQuarterlyReview(formData: FormData) {
  const parsed = deleteByIdSchema.parse(Object.fromEntries(formData));
  deleteQuarterlyReview(parsed.id);
  revalidatePath("/");
  revalidatePath("/reviews");
}

export async function saveFixedExpense(formData: FormData) {
  const parsed = fixedExpenseSchema.parse(Object.fromEntries(formData));
  insertFixedExpense(parsed);
  revalidatePath("/");
}

export async function editFixedExpense(formData: FormData) {
  const parsed = fixedExpenseUpdateSchema.parse(Object.fromEntries(formData));
  updateFixedExpense(parsed);
  revalidatePath("/");
}

export async function removeFixedExpense(formData: FormData) {
  const parsed = deleteByIdSchema.parse(Object.fromEntries(formData));
  deleteFixedExpense(parsed.id);
  revalidatePath("/");
}

export async function saveInvestment(formData: FormData) {
  const parsed = investmentSchema.parse(Object.fromEntries(formData));
  insertInvestment(parsed);
  revalidatePath("/");
}

export async function editInvestment(formData: FormData) {
  const parsed = investmentUpdateSchema.parse(Object.fromEntries(formData));
  updateInvestment(parsed);
  revalidatePath("/");
}

export async function removeInvestment(formData: FormData) {
  const parsed = deleteByIdSchema.parse(Object.fromEntries(formData));
  deleteInvestment(parsed.id);
  revalidatePath("/");
}

export async function saveSharedTransaction(formData: FormData) {
  const parsed = sharedTransactionSchema.parse(Object.fromEntries(formData));
  insertSharedTransaction(parsed);
  revalidatePath("/");
  revalidatePath("/shared-account");
}

export async function editSharedTransaction(formData: FormData) {
  const parsed = sharedTransactionUpdateSchema.parse(Object.fromEntries(formData));
  updateSharedTransaction(parsed);
  revalidatePath("/");
  revalidatePath("/shared-account");
}

export async function removeSharedTransaction(formData: FormData) {
  const parsed = deleteByIdSchema.parse(Object.fromEntries(formData));
  deleteSharedTransaction(parsed.id);
  revalidatePath("/");
  revalidatePath("/shared-account");
}

export async function importSharedAccountNotionCsv(formData: FormData) {
  const file = formData.get("csvFile");

  if (!(file instanceof File)) {
    throw new Error("Expected a CSV file.");
  }

  const text = await file.text();
  const rows = parseSharedAccountNotionCsv(text);
  importSharedTransactions(rows);
  revalidatePath("/");
  revalidatePath("/shared-account");
}

export async function importCashewCsv(formData: FormData) {
  const file = formData.get("csvFile");

  if (!(file instanceof File)) {
    throw new Error("Expected a CSV file.");
  }

  const text = await file.text();
  const rows = parseCashewCsv(text);
  importCashewTransactions(rows, file.name);
  revalidatePath("/");
  revalidatePath("/imports");
}

export async function toggleCashewTransactionExclusion(formData: FormData) {
  const parsed = cashewExcludeSchema.parse(Object.fromEntries(formData));
  setCashewTransactionExcluded(parsed.id, parsed.excluded === "true");
  revalidatePath("/");
  revalidatePath("/imports");
}

export async function removeCashewImportFile(formData: FormData) {
  const parsed = cashewDeleteFileSchema.parse(Object.fromEntries(formData));
  deleteCashewImportBySourceFile(parsed.sourceFile);
  revalidatePath("/");
  revalidatePath("/imports");
}

export async function removeAllCashewImports() {
  deleteAllCashewImports();
  revalidatePath("/");
  revalidatePath("/imports");
}

export async function renameCashewImportFile(formData: FormData) {
  const parsed = cashewRenameFileSchema.parse(Object.fromEntries(formData));
  renameCashewImport(parsed.sourceFile, parsed.importLabel);
  revalidatePath("/");
  revalidatePath("/imports");
}
