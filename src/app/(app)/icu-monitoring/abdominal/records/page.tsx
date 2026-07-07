import { Suspense } from "react";

import { AbdominalRecordsPage } from "@/features/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AbdominalRecordsPage />
    </Suspense>
  );
}
