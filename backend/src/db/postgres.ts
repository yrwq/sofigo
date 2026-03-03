import postgres from 'postgres';

export function createSqlClient(connectionString: string) {
  return postgres(connectionString, {
    max: 1,
  });
}
