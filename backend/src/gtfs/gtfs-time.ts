type ServiceDateInfo = {
  serviceDate: string;
  weekday: number;
};

type ServiceDateTimeInfo = {
  serviceDate: string;
  serviceTime: string;
  weekday: number;
};

export function resolveServiceDate(date?: string): ServiceDateInfo {
  const now = new Date();

  const parts = date?.split('-');
  const resolved =
    parts?.length === 3
      ? new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
      : now;

  const year = resolved.getFullYear();
  const month = String(resolved.getMonth() + 1).padStart(2, '0');
  const day = String(resolved.getDate()).padStart(2, '0');

  return {
    serviceDate: `${year}${month}${day}`,
    weekday: resolved.getDay(),
  };
}

export function resolveServiceDateTime(
  date?: string,
  time?: string,
): ServiceDateTimeInfo {
  const { serviceDate, weekday } = resolveServiceDate(date);
  const now = new Date();
  const serviceTime =
    time ??
    [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
      String(now.getSeconds()).padStart(2, '0'),
    ].join(':');

  return {
    serviceDate,
    serviceTime,
    weekday,
  };
}
