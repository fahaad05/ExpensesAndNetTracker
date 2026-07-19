"use client";

import { Upload } from "lucide-react";
import { useState } from "react";

import { importSharedAccountNotionCsv } from "@/app/actions";
import { getTranslations } from "@/lib/translations";

export function SharedAccountImportForm() {
  const t = getTranslations();
  const [fileName, setFileName] = useState<string>(t.imports.noFileSelectedYet);

  return (
    <form action={importSharedAccountNotionCsv} className="entry-form compact-form">
      <div className="form-grid">
        <label className="field field-full">
          <span>Legacy shared-expenses CSV</span>
          <input
            className="sr-only"
            id="shared-account-csv-file"
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
              <span>Import a one-time legacy CSV export for shared expenses.</span>
            </div>
          </div>
        </label>
      </div>
      <button type="submit">Import legacy shared expenses CSV</button>
    </form>
  );
}
