// src/app/report/core/pageFunctions.ts

import { Page } from "../../../types";

/**
 * Adds a new page to the existing list of pages.
 * @param pages - The current list of pages.
 * @param setPages - The state setter function for pages.
 */
export const addPage = (
  pages: Page[],
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
): void => {
  const newPage: Page = {
    id: Date.now(),
    name: `Page ${pages.length + 1}`,
    charts: [],
    remark: "This is an auto-generated remark. You can edit this section manually.",
  };
  setPages([...pages, newPage]);
};

/**
 * Deletes the current page from the list of pages.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 * @param setCurrentPageIndex - The state setter function for currentPageIndex.
 */
export const deleteCurrentPage = (
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>
): void => {
  if (pages.length === 1) {
    alert("Cannot delete the only remaining page.");
    return;
  }
  const confirmDelete = window.confirm(`Are you sure you want to delete ${pages[currentPageIndex].name}?`);
  if (!confirmDelete) return;
  const newPages = pages.filter((_, index) => index !== currentPageIndex);
  const newIndex = currentPageIndex >= newPages.length ? newPages.length - 1 : currentPageIndex;
  setPages(newPages);
  setCurrentPageIndex(newIndex);
};
