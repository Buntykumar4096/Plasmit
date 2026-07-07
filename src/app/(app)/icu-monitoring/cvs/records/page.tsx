import { Suspense } from "react";

import { CvsRecordsPage } from "@/features/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsRecordsPage />
    </Suspense>
  );
}
