export function getDatabaseSetupErrorMessage(error: unknown, fallback: string) {
  const code =
    typeof error === 'object' && error && 'code' in error ? String(error.code) : undefined;
  const message = error instanceof Error ? error.message : '';

  if (code === 'P1001' || code === 'P1002' || message.includes('Can\'t reach database server')) {
    return 'Base de données inaccessible. Vérifiez DATABASE_URL et démarrez PostgreSQL.';
  }

  if (
    code === 'P2021' ||
    code === 'P2022' ||
    message.includes('does not exist') ||
    message.includes('table')
  ) {
    return 'Base de données non initialisée. Lancez npm run prisma:migrate puis npm run db:seed.';
  }

  if (message.includes('Environment variable not found: DATABASE_URL')) {
    return 'DATABASE_URL est manquant. Copiez .env.example vers .env et .env.local puis configurez la base.';
  }

  return fallback;
}
