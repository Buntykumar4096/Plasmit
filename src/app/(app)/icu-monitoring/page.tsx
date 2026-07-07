import { Suspense } from "react";

import { IcuMonitoringPage } from "@/features/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IcuMonitoringPage />
    </Suspense>
  );
}
