import { Suspense } from "react";

import { NeuroEvdPage } from "@/features/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroEvdPage />
    </Suspense>
  );
}
