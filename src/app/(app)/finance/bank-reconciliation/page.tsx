import { FinanceSimplePage } from "@/features/finance/finance-pages";
import { mockBankEntries } from "@/data/finance";

export default function Page() {
  return <FinanceSimplePage title="Bank Reconciliation" description="Bank entries, system payments, matched/unmatched state, notes, manual match reason, and summary print." records={mockBankEntries} />;
}
