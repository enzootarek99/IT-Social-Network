import prisma from '@/lib/db';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { formatDate } from '@/lib/utils';
import { requireAdminAction } from '@/lib/admin';

export default async function AdminLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ action?: string; entityType?: string }>;
}) {
  await requireAdminAction('logs:read');
  const params = await searchParams;
  const logs = await prisma.adminLog.findMany({
    where: {
      ...(params.action ? { action: { contains: params.action, mode: 'insensitive' } } : {}),
      ...(params.entityType ? { entityType: { contains: params.entityType, mode: 'insensitive' } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { actor: { select: { firstName: true, lastName: true, email: true } } },
  });

  return (
    <AdminPageShell
      title="Logs & activité"
      description="Historique des actions administrateur avec acteur, entité, date et détails avant/après."
    >
      <form className="grid gap-3 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4 md:grid-cols-3">
        <input
          name="action"
          defaultValue={params.action || ''}
          className="rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
          placeholder="Filtrer par action"
        />
        <input
          name="entityType"
          defaultValue={params.entityType || ''}
          className="rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
          placeholder="Filtrer par entité"
        />
        <button className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white">
          Filtrer
        </button>
      </form>

      <section className="mt-6 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="text-[#555]">
              <tr>
                <th className="py-3">Date</th>
                <th>Admin</th>
                <th>Action</th>
                <th>Entité</th>
                <th>ID</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-[#111115]">
                  <td className="py-3 text-[#888]">{formatDate(log.createdAt)}</td>
                  <td className="text-[#d0d0dc]">
                    {log.actor ? `${log.actor.firstName} ${log.actor.lastName}` : 'Système'}
                    {log.actor?.email && <p className="text-xs text-[#555]">{log.actor.email}</p>}
                  </td>
                  <td className="font-semibold text-[#4f8ef7]">{log.action}</td>
                  <td className="text-[#888]">{log.entityType}</td>
                  <td className="font-mono text-xs text-[#555]">{log.entityId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  );
}
