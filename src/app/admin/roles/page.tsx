import prisma from '@/lib/db';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { updateUserAdminRoleAction } from '@/app/admin/actions';
import { requireAdminAction } from '@/lib/admin';

const roles = [
  ['SUPER_ADMIN', 'Accès complet au back-office.'],
  ['CONTENT_MANAGER', 'Contenu, pages, notifications, freelance et événements.'],
  ['MODERATOR', 'Utilisateurs, posts, commentaires et signalements.'],
  ['SUPPORT', 'Dashboard, notifications et consultation logs.'],
];

export default async function AdminRolesPage() {
  await requireAdminAction('roles:manage');
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, adminRole: true },
  });

  return (
    <AdminPageShell
      title="Rôles & permissions"
      description="Assignez des rôles admin granulaires. Les permissions sont vérifiées côté serveur."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <section className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          <h2 className="text-lg font-bold text-[#e8e8f0]">Utilisateurs</h2>
          <div className="mt-4 space-y-3">
            {users.map((user) => (
              <form key={user.id} action={updateUserAdminRoleAction} className="grid gap-3 rounded-xl bg-[#131318] p-4 md:grid-cols-[1fr_220px_auto] md:items-center">
                <input type="hidden" name="userId" value={user.id} />
                <div>
                  <p className="font-semibold text-[#d0d0dc]">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-[#555]">{user.email}</p>
                </div>
                <select
                  name="adminRole"
                  defaultValue={user.adminRole || ''}
                  className="rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
                >
                  <option value="">Aucun accès admin</option>
                  {roles.map(([role]) => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
                <button className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white">
                  Enregistrer
                </button>
              </form>
            ))}
          </div>
        </section>

        <aside className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          <h2 className="text-lg font-bold text-[#e8e8f0]">Matrice de permissions</h2>
          <div className="mt-4 space-y-3">
            {roles.map(([role, description]) => (
              <div key={role} className="rounded-xl bg-[#131318] p-4">
                <p className="font-semibold text-[#d0d0dc]">{role}</p>
                <p className="mt-1 text-sm text-[#888]">{description}</p>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  );
}
