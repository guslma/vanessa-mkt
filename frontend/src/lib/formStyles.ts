export function inputClass(hasError?: boolean) {
  return `mt-1 w-full rounded-lg border bg-white px-3 py-2 text-base text-slate-800 focus:outline-none focus:ring-1 dark:bg-slate-700 dark:text-slate-100 md:text-sm ${
    hasError
      ? 'border-red-400 focus:border-red-500 focus:ring-red-400'
      : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500 dark:border-slate-600'
  }`;
}
