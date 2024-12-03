// src/app/report/core/chartFunctions.ts

import { Chart, ChartType, Page } from "../../../types";
import { generateSampleData } from "../../../utils/chartUtils";

/**
 * Adds a new chart to the current page.
 * @param type - The type of chart to add.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 * @param setSelectedChartId - The state setter function for selectedChartId.
 */
export const addChart = (
  type: ChartType,
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setSelectedChartId: React.Dispatch<React.SetStateAction<number | null>>
): void => {
  const newChart: Chart = {
    id: Date.now(),
    type,
    title: "",
    xAxis: "",
    yAxis: "",
    data: generateSampleData(type),
    x: 50,
    y: 50,
    width: 200,
    height: 200,
    xAxisColor: "",
    yAxisColor: ""
  };
  const updatedPages = pages.map((page, index) =>
    index === currentPageIndex ? { ...page, charts: [...page.charts, newChart] } : page
  );
  setPages(updatedPages);
  setSelectedChartId(newChart.id);
};

/**
 * Removes a chart from the current page.
 * @param id - The ID of the chart to remove.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 * @param setSelectedChartId - The state setter function for selectedChartId.
 */
export const removeChart = (
  id: number,
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setSelectedChartId: React.Dispatch<React.SetStateAction<number | null>>
): void => {
  const updatedPages = pages.map((page, index) =>
    index === currentPageIndex
      ? { ...page, charts: page.charts.filter((chart) => chart.id !== id) }
      : page
  );
  setPages(updatedPages);
  setSelectedChartId((prevId) => (prevId === id ? null : prevId));
};

/**
 * Updates the position of a chart on the canvas.
 * @param id - The ID of the chart to update.
 * @param x - The new x-coordinate.
 * @param y - The new y-coordinate.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 */
export const updateChartPosition = (
  id: number,
  x: number,
  y: number,
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
): void => {
  const updatedPages = pages.map((page, index) =>
    index === currentPageIndex
      ? {
          ...page,
          charts: page.charts.map((chart) =>
            chart.id === id ? { ...chart, x, y } : chart
          ),
        }
      : page
  );
  setPages(updatedPages);
};

/**
 * Updates the size of a chart on the canvas.
 * @param id - The ID of the chart to update.
 * @param width - The new width.
 * @param height - The new height.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 */
export const updateChartSize = (
  id: number,
  width: number,
  height: number,
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
): void => {
  const updatedPages = pages.map((page, index) =>
    index === currentPageIndex
      ? {
          ...page,
          charts: page.charts.map((chart) =>
            chart.id === id ? { ...chart, width, height } : chart
          ),
        }
      : page
  );
  setPages(updatedPages);
};

/**
 * Updates a specific property of a chart.
 * @param id - The ID of the chart to update.
 * @param property - The property to update.
 * @param value - The new value for the property.
 * @param pages - The current list of pages.
 * @param currentPageIndex - The index of the current page.
 * @param setPages - The state setter function for pages.
 */
export const updateChartProperty = (
  id: number,
  property: keyof Omit<Chart, "data">,
  value: string | number,
  pages: Page[],
  currentPageIndex: number,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>
): void => {
  const updatedPages = pages.map((page, index) =>
    index === currentPageIndex
      ? {
          ...page,
          charts: page.charts.map((chart) =>
            chart.id === id ? { ...chart, [property]: value } : chart
          ),
        }
      : page
  );
  setPages(updatedPages);
};
