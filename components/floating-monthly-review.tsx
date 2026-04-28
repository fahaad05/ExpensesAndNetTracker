"use client";

import { FilePenLine, X } from "lucide-react";
import { useState } from "react";

import { MonthlyReviewForm } from "@/components/forms";
import { getTranslations } from "@/lib/translations";

export function FloatingMonthlyReview() {
  const t = getTranslations();
  const [open, setOpen] = useState(false);

  return (
    <div className={`floating-review ${open ? "open" : ""}`}>
      <div className={`floating-review-panel ${open ? "is-open" : "is-hidden"}`}>
        <div className="calculator-top">
          <strong>{t.floatingReview.quick}</strong>
          <button type="button" className="icon-button" onClick={() => setOpen(false)} aria-label={t.floatingReview.close}>
            <X size={16} />
          </button>
        </div>
        <MonthlyReviewForm />
      </div>

      <button
        type="button"
        className="review-toggle"
        onClick={() => setOpen((current) => !current)}
        aria-label={t.floatingReview.open}
      >
        <FilePenLine size={20} />
      </button>
    </div>
  );
}
