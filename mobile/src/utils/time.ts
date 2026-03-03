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

export function timeToSeconds(value?: string | null) {
  if (!value) {
    return null;
  }
  const [h, m, s] = value.split(':').map((part) => Number(part));
  if (Number.isNaN(h) || Number.isNaN(m)) {
    return null;
  }
  return (h ?? 0) * 3600 + (m ?? 0) * 60 + (Number.isNaN(s) ? 0 : (s ?? 0));
}
