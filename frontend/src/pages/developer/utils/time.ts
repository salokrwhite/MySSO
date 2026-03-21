export function formatTimeLabel(input: string, locale = "zh-CN") {
  return new Date(input).toLocaleString(locale, { hour12: false });
}
