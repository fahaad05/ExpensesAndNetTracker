import type { CashewImportRow, SharedTransaction } from "@/lib/db";

export function parseCsv(text: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const nextChar = text[index + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        index += 1;
      }
      currentRow.push(currentField);
      if (currentRow.some((field) => field.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

function normalizeBoolean(value: string) {
  return value.trim().toLowerCase() === "true";
}

export function parseCashewCsv(csvText: string) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  const getIndex = (headerName: string) => headers.indexOf(headerName);

  return rows.slice(1).flatMap((row): CashewImportRow[] => {
    if (!row.length) {
      return [];
    }

    const amount = Number(row[getIndex("amount")] ?? "");
    const transactionDate = (row[getIndex("date")] ?? "").trim();
    const title = (row[getIndex("title")] ?? "").trim();

    if (Number.isNaN(amount) || !transactionDate || !title) {
      return [];
    }

    return [
      {
        account: (row[getIndex("account")] ?? "").trim(),
        amount,
        currency: (row[getIndex("currency")] ?? "").trim() || "CHF",
        title,
        note: (row[getIndex("note")] ?? "").trim(),
        transactionDate,
        income: normalizeBoolean(row[getIndex("income")] ?? ""),
        transactionType: (row[getIndex("type")] ?? "").trim(),
        categoryName: (row[getIndex("category name")] ?? "").trim(),
        subcategoryName: (row[getIndex("subcategory name")] ?? "").trim()
      }
    ];
  });
}

function parseNotionAmount(value: string) {
  const normalized = value.replace(/\s/g, "").replace("CHF", "").replaceAll(",", "");
  const amount = Number(normalized);
  return Number.isFinite(amount) ? amount : NaN;
}

function parseNotionDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function mapNotionUsedBy(value: string): SharedTransaction["usedBy"] | null {
  const normalized = value.trim().toLowerCase();

  if (normalized === "io") return "me";
  if (normalized === "chanda") return "other";
  if (normalized === "condiviso") return "shared";

  return null;
}

export function parseSharedAccountNotionCsv(csvText: string) {
  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map((header) => header.trim());
  const getIndex = (headerName: string) => headers.indexOf(headerName);

  return rows.slice(1).flatMap((row): Array<Omit<SharedTransaction, "id">> => {
    if (!row.length) {
      return [];
    }

    const description = (row[getIndex("Descrizione")] ?? "").trim();
    const transactionDate = parseNotionDate((row[getIndex("Data Spesa")] ?? "").trim());
    const amount = parseNotionAmount((row[getIndex("Importo")] ?? "").trim());
    const usedBy = mapNotionUsedBy((row[getIndex("Usato Da")] ?? "").trim());

    if (!description || !transactionDate || Number.isNaN(amount) || !usedBy) {
      return [];
    }

    return [
      {
        transactionDate,
        description,
        category: "Legacy import",
        amount,
        usedBy,
        notes: "Imported from legacy shared-expenses CSV"
      }
    ];
  });
}
