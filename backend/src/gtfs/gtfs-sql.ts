import { Prisma } from '@prisma/client';

export function buildActiveServicesCte(serviceDate: string, weekday: number) {
  return Prisma.sql`
    WITH active_services AS (
      SELECT sc.service_id
      FROM service_calendars sc
      WHERE sc.start_date <= ${serviceDate}
        AND sc.end_date >= ${serviceDate}
        AND (
          CASE ${weekday}
            WHEN 0 THEN sc.sunday
            WHEN 1 THEN sc.monday
            WHEN 2 THEN sc.tuesday
            WHEN 3 THEN sc.wednesday
            WHEN 4 THEN sc.thursday
            WHEN 5 THEN sc.friday
            WHEN 6 THEN sc.saturday
          END
        )
      UNION
      SELECT se.service_id
      FROM service_exceptions se
      WHERE se.date = ${serviceDate}
        AND se.exception_type = 1
      EXCEPT
      SELECT se.service_id
      FROM service_exceptions se
      WHERE se.date = ${serviceDate}
        AND se.exception_type = 2
    )
  `;
}
