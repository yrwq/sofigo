export function formatClockTime(date = new Date()) {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

export function formatDisplayTime(value?: string | null) {
  if (!value) {
    return '';
  }
  const parts = value.split(':');
  if (parts.length >= 2) {
    return `${parts[0] ?? '--'}:${parts[1] ?? '--'}`;
  }
  return value;
}
