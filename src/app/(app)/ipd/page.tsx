import { Suspense } from "react";

import { IpdUnifiedModulePage } from "@/features/ipd/ipd-pages";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <IpdUnifiedModulePage />
    </Suspense>
  );
}
