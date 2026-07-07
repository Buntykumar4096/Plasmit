import { Suspense } from "react";

import { NeuroOverviewPage } from "@/features/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroOverviewPage />
    </Suspense>
  );
}
