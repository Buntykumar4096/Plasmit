import { Suspense } from "react";

import { NeuroPupilPage } from "@/features/neuro-icu/neuro-icu-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <NeuroPupilPage />
    </Suspense>
  );
}
