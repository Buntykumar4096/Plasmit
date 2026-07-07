import { Suspense } from "react";

import { Note1Page } from "@/features/notes/note1-page";

export default function Note1RoutePage() {
  return (
    <Suspense fallback={null}>
      <Note1Page />
    </Suspense>
  );
}
