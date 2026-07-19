"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import {
  importCashewCsv,
  removeAllCashewImports,
  removeCashewImportFile,
  renameCashewImportFile,
  toggleCashewTransactionExclusion
} from "@/app/actions";
import { getTranslations } from "@/lib/translations";

export function CashewImportForm() {
  const t = getTranslations();
  const [fileName, setFileName] = useState<string>(t.imports.noFileSelectedYet);

  return (
    <form action={importCashewCsv} className="entry-form">
      <div className="form-grid">
        <label className="field field-full">
          <span>{t.imports.csvExport}</span>
          <input
            className="sr-only"
            id="cashew-csv-file"
            name="csvFile"
            type="file"
            accept=".csv,text/csv"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              setFileName(file?.name ?? t.imports.noFileSelectedYet);
            }}
          />
          <div className="file-upload-shell">
            <span className="file-upload-trigger" aria-hidden="true">
              <Upload size={16} />
              {t.imports.chooseCsvFile}
            </span>
            <div className="file-upload-meta">
              <strong>{fileName}</strong>
              <span>{t.imports.importWithoutPreprocessing}</span>
            </div>
          </div>
        </label>
      </div>
      <button type="submit">{t.imports.importCashewCsv}</button>
    </form>
  );
}

export function CashewExcludeToggle({
  id,
  excluded
}: {
  id: number;
  excluded: boolean;
}) {
  const t = getTranslations();
  return (
    <form action={toggleCashewTransactionExclusion} className="table-action-form">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="excluded" value={excluded ? "false" : "true"} />
      <button type="submit" className={`${excluded ? "ghost-button" : "warn-button"} table-action-button`}>
        {excluded ? t.imports.include : t.imports.exclude}
      </button>
    </form>
  );
}

export function CashewDeleteImportButton({ sourceFile }: { sourceFile: string }) {
  const t = getTranslations();
  return (
    <form action={removeCashewImportFile}>
      <input type="hidden" name="sourceFile" value={sourceFile} />
      <button type="submit" className="ghost-button">
        {t.imports.deleteFileImport}
      </button>
    </form>
  );
}

export function CashewDeleteAllImportsButton() {
  const t = getTranslations();
  return (
    <form action={removeAllCashewImports}>
      <button type="submit" className="warn-button">
        {t.imports.resetAllImports}
      </button>
    </form>
  );
}

export function CashewRenameImportForm({
  sourceFile,
  importLabel
}: {
  sourceFile: string;
  importLabel: string;
}) {
  const t = getTranslations();
  return (
    <form action={renameCashewImportFile} className="inline-rename-form">
      <input type="hidden" name="sourceFile" value={sourceFile} />
      <input
        name="importLabel"
        defaultValue={importLabel}
        className="rename-input"
        placeholder={t.imports.renamePlaceholder}
        required
      />
      <button type="submit" className="ghost-button">
        {t.imports.saveName}
      </button>
    </form>
  );
}
