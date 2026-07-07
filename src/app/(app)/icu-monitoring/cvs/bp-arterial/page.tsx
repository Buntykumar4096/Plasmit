import { Suspense } from "react";

import { CvsParameterFormPage } from "@/features/icu-monitoring/icu-monitoring-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <CvsParameterFormPage parameter="bp-arterial" />
    </Suspense>
  );
}
