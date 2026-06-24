import prisma from '@/lib/db';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { StaticPageEditor } from '@/components/admin/StaticPageEditor';
import { upsertStaticPageAction } from '@/app/admin/actions';
import { requireAdminAction } from '@/lib/admin';

export default async function AdminStaticPagesPage() {
  await requireAdminAction('pages:manage');
  const pages = await prisma.staticPage.findMany({
    orderBy: { updatedAt: 'desc' },
    include: { blocks: { orderBy: { order: 'asc' } } },
  });
  const selectedPage = pages[0];

  return (
    <AdminPageShell
      title="Pages & contenu statique"
      description="Créez et modifiez des pages avec un éditeur de blocs visuel façon Gutenberg/Shopify."
    >
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-4 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          <h2 className="text-lg font-bold text-[#e8e8f0]">Pages</h2>
          <form action={upsertStaticPageAction} className="space-y-3 rounded-xl bg-[#131318] p-4">
            <input
              name="title"
              className="w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
              placeholder="Titre"
            />
            <input
              name="slug"
              className="w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
              placeholder="slug"
            />
            <select name="status" className="w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]">
              <option value="DRAFT">Brouillon</option>
              <option value="PUBLISHED">Publié</option>
            </select>
            <button className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white">
              Nouvelle page
            </button>
          </form>
          <div className="space-y-2">
            {pages.map((page) => (
              <div key={page.id} className="rounded-lg border border-[#1e1e24] bg-[#131318] p-3">
                <p className="font-semibold text-[#d0d0dc]">{page.title}</p>
                <p className="text-xs text-[#555]">/{page.slug} · {page.status}</p>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          {selectedPage ? (
            <>
              <h2 className="text-lg font-bold text-[#e8e8f0]">{selectedPage.title}</h2>
              <p className="mb-4 text-sm text-[#555]">/{selectedPage.slug}</p>
              <StaticPageEditor
                pageId={selectedPage.id}
                initialBlocks={selectedPage.blocks.map((block) => ({
                  id: block.id,
                  type: block.type as 'text' | 'image' | 'button' | 'divider',
                  content: block.content as Record<string, string>,
                  settings: (block.settings || {}) as Record<string, string>,
                }))}
              />
            </>
          ) : (
            <p className="text-[#888]">Créez une page pour commencer.</p>
          )}
        </section>
      </div>
    </AdminPageShell>
  );
}
