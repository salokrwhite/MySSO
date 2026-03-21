export function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const match = value.match(/^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}:\d{2})/);
  if (match) {
    return `${match[1]} ${match[2]}`;
  }

  return value.replace("T", " ").replace(/Z$/, "");
}
