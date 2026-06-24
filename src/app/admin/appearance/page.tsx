import prisma from '@/lib/db';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
import { ColorPicker } from '@/components/admin/ColorPicker';
import { resetSiteSettingsAction, updateSiteSettingsAction } from '@/app/admin/actions';
import { requireAdminAction } from '@/lib/admin';

export default async function AdminAppearancePage() {
  await requireAdminAction('appearance:manage');
  const settings =
    (await prisma.siteSettings.findUnique({ where: { id: 'default' } })) ||
    (await prisma.siteSettings.create({ data: { id: 'default' } }));

  return (
    <AdminPageShell
      title="Apparence"
      description="Personnalisez les couleurs, le logo, les polices et les métadonnées SEO sans toucher au code."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
        <form action={updateSiteSettingsAction} className="space-y-4 rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          <label className="block text-sm font-semibold text-[#d0d0dc]">
            Nom du site
            <input
              name="siteName"
              defaultValue={settings.siteName}
              className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-[#d0d0dc]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#d0d0dc]">
            URL du logo
            <input
              name="logoUrl"
              defaultValue={settings.logoUrl || ''}
              className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-[#d0d0dc]"
              placeholder="/uploads/logo.png"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <ColorPicker label="Couleur principale" name="primaryColor" defaultValue={settings.primaryColor} />
            <ColorPicker label="Couleur accent" name="accentColor" defaultValue={settings.accentColor} />
            <ColorPicker label="Fond" name="backgroundColor" defaultValue={settings.backgroundColor} />
          </div>
          <label className="block text-sm font-semibold text-[#d0d0dc]">
            Police
            <select
              name="fontFamily"
              defaultValue={settings.fontFamily}
              className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-[#d0d0dc]"
            >
              <option value="Inter">Inter</option>
              <option value="DM Sans">DM Sans</option>
              <option value="Space Grotesk">Space Grotesk</option>
            </select>
          </label>
          <label className="block text-sm font-semibold text-[#d0d0dc]">
            Titre SEO
            <input
              name="seoTitle"
              defaultValue={settings.seoTitle}
              className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-[#d0d0dc]"
            />
          </label>
          <label className="block text-sm font-semibold text-[#d0d0dc]">
            Description SEO
            <textarea
              name="seoDescription"
              defaultValue={settings.seoDescription}
              rows={3}
              className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-[#d0d0dc]"
            />
          </label>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white">
              Enregistrer
            </button>
            <button
              formAction={resetSiteSettingsAction}
              className="rounded-lg border border-[#1e1e24] px-4 py-2 text-sm font-semibold text-[#888]"
            >
              Réinitialiser
            </button>
          </div>
        </form>

        <aside className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-5">
          <h2 className="text-lg font-bold text-[#e8e8f0]">Preview live</h2>
          <div
            className="mt-5 rounded-2xl border border-[#1e1e24] p-5"
            style={{ background: settings.backgroundColor, fontFamily: settings.fontFamily }}
          >
            <div className="flex items-center gap-3">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl text-white"
                style={{ background: settings.primaryColor }}
              >
                NX
              </div>
              <div>
                <p className="text-xl font-bold text-white">{settings.siteName}</p>
                <p className="text-sm text-white/60">{settings.seoDescription}</p>
              </div>
            </div>
            <button
              className="mt-6 rounded-lg px-4 py-2 text-sm font-semibold"
              style={{ background: settings.accentColor, color: '#04342c' }}
            >
              Bouton d’action
            </button>
          </div>
        </aside>
      </div>
    </AdminPageShell>
  );
}
