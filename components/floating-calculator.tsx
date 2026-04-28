"use client";

import { Calculator, Delete, X } from "lucide-react";
import { useMemo, useState } from "react";
import { getTranslations } from "@/lib/translations";

const keys = [
  "7",
  "8",
  "9",
  "/",
  "4",
  "5",
  "6",
  "*",
  "1",
  "2",
  "3",
  "-",
  "0",
  ".",
  "=",
  "+"
] as const;

export function FloatingCalculator() {
  const t = getTranslations();
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState("");

  const preview = useMemo(() => {
    if (!expression) {
      return "0";
    }

    try {
      const sanitized = expression.replace(/[^0-9+\-*/.() ]/g, "");
      const value = Function(`"use strict"; return (${sanitized})`)();
      if (typeof value === "number" && Number.isFinite(value)) {
        return String(value);
      }
      return t.calculator.error;
    } catch {
      return t.calculator.pending;
    }
  }, [expression, t.calculator.error, t.calculator.pending]);

  function press(key: string) {
    if (key === "=") {
      if (preview !== t.calculator.error && preview !== t.calculator.pending) {
        setExpression(preview);
      }
      return;
    }

    setExpression((current) => current + key);
  }

  return (
    <div className={`floating-calculator ${open ? "open" : ""}`}>
      {open ? (
        <div className="calculator-panel">
          <div className="calculator-top">
            <strong>{t.calculator.quick}</strong>
            <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={t.calculator.close}>
              <X size={16} />
            </button>
          </div>
          <div className="calculator-screen">
            <span>{expression || "0"}</span>
            <strong>{preview}</strong>
          </div>
          <div className="calculator-actions">
            <button type="button" className="ghost-button" onClick={() => setExpression("")}>
              {t.calculator.clear}
            </button>
            <button type="button" className="ghost-button" onClick={() => setExpression((current) => current.slice(0, -1))}>
              <Delete size={14} />
            </button>
          </div>
          <div className="calculator-grid">
            {keys.map((key) => (
              <button key={key} type="button" className="calculator-key" onClick={() => press(key)}>
                {key}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <button type="button" className="calculator-toggle" onClick={() => setOpen((current) => !current)} aria-label={t.calculator.open}>
        <Calculator size={20} />
      </button>
    </div>
  );
}
