import type { BundleCategory, BundleItem } from "@/features/bundle/bundle-types";
import { alertStatusBundle } from "@/features/bundle/items/alert-status-bundle";
import { boxBundle } from "@/features/bundle/items/box-bundle";
import { buttonBundle } from "@/features/bundle/items/button-bundle";
import { drawerBundle } from "@/features/bundle/items/drawer-bundle";
import { emptyLoadingBundle } from "@/features/bundle/items/empty-loading-bundle";
import { formControlsBundle } from "@/features/bundle/items/form-controls-bundle";
import { navbarBundle } from "@/features/bundle/items/navbar-bundle";
import { searchBoxBundle } from "@/features/bundle/items/search-box-bundle";
import { sidebarBundle } from "@/features/bundle/items/sidebar-bundle";
import { tableBundle } from "@/features/bundle/items/table-bundle";
import { tabsBundle } from "@/features/bundle/items/tabs-bundle";
import { textareaBundle } from "@/features/bundle/items/textarea-bundle";
import { textboxBundle } from "@/features/bundle/items/textbox-bundle";
import { toastBundle } from "@/features/bundle/items/toast-bundle";

export const bundleItems: BundleItem[] = [
  buttonBundle,
  textboxBundle,
  textareaBundle,
  searchBoxBundle,
  formControlsBundle,
  navbarBundle,
  sidebarBundle,
  boxBundle,
  tabsBundle,
  alertStatusBundle,
  drawerBundle,
  toastBundle,
  tableBundle,
  emptyLoadingBundle,
];

export const bundleCategories: BundleCategory[] = ["Actions", "Forms", "Layout", "Feedback", "Data"];

export function getBundleItem(itemId?: string) {
  return bundleItems.find((item) => item.id === itemId) ?? bundleItems[0];
}
