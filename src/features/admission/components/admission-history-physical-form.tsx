"use client";

import * as React from "react";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AdmissionPdfAssessmentForm } from "@/features/notes/note1-page";

export function AdmissionHistoryPhysicalForm() {
  const [form, setForm] = React.useState<Record<string, string>>({});
  const [saved, setSaved] = React.useState(false);

  function update(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
    setSaved(false);
  }

  return (
    <div className="space-y-4 py-4">
      <div className="rounded-lg border border-border bg-surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-foreground">Admission History and Physical Assessment Form</h1>
            <p className="mt-1 text-xs text-muted-foreground">To be filled up by the Resident Medical Officer on admission</p>
          </div>
          <Button onClick={() => setSaved(true)} type="button">
            <Save className="h-4 w-4" />
            Save
          </Button>
        </div>
        {saved ? <div className="mt-3 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs font-semibold text-success">Admission assessment saved.</div> : null}
      </div>

      <div className="rounded-lg border border-border bg-surface p-4">
        <AdmissionPdfAssessmentForm admission={form} onChange={update} />
      </div>
    </div>
  );
}
