export function logPerformanceEntryByName(name: string) {
  console.log(formatPerformanceEntries(performance.getEntriesByName(name)));
}

function formatPerformanceEntries(performanceEntries: PerformanceEntry[]) {
  return performanceEntries.map(formatPerformanceEntry).join('\n');
}

const formatter = Intl.NumberFormat('de', {
  useGrouping: true,
  maximumFractionDigits: 0
});

function formatPerformanceEntry(performanceEntry: PerformanceEntry) {
  return 'It took ' + performanceEntry.name + ' ' + formatter.format(performanceEntry.duration) + 'ms to complete';
}