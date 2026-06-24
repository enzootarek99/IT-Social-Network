'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/db';
import { logAdminAction, requireAdminAction } from '@/lib/admin';

export async function updateSiteSettingsAction(formData: FormData) {
  const admin = await requireAdminAction('appearance:manage');
  const before = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  const after = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      siteName: String(formData.get('siteName') || 'NexusIT'),
      logoUrl: String(formData.get('logoUrl') || '') || null,
      primaryColor: String(formData.get('primaryColor') || '#4f8ef7'),
      accentColor: String(formData.get('accentColor') || '#2dd4a0'),
      backgroundColor: String(formData.get('backgroundColor') || '#0a0a0d'),
      fontFamily: String(formData.get('fontFamily') || 'Inter'),
      seoTitle: String(formData.get('seoTitle') || 'NexusIT'),
      seoDescription: String(formData.get('seoDescription') || 'Réseau professionnel IT'),
    },
    create: {
      id: 'default',
      siteName: String(formData.get('siteName') || 'NexusIT'),
      logoUrl: String(formData.get('logoUrl') || '') || null,
      primaryColor: String(formData.get('primaryColor') || '#4f8ef7'),
      accentColor: String(formData.get('accentColor') || '#2dd4a0'),
      backgroundColor: String(formData.get('backgroundColor') || '#0a0a0d'),
      fontFamily: String(formData.get('fontFamily') || 'Inter'),
      seoTitle: String(formData.get('seoTitle') || 'NexusIT'),
      seoDescription: String(formData.get('seoDescription') || 'Réseau professionnel IT'),
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: 'settings.update',
    entityType: 'SiteSettings',
    entityId: 'default',
    before,
    after,
  });
  revalidatePath('/admin');
  revalidatePath('/');
}

export async function resetSiteSettingsAction() {
  const admin = await requireAdminAction('appearance:manage');
  const before = await prisma.siteSettings.findUnique({ where: { id: 'default' } });
  const after = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {
      siteName: 'NexusIT',
      logoUrl: null,
      primaryColor: '#4f8ef7',
      accentColor: '#2dd4a0',
      backgroundColor: '#0a0a0d',
      fontFamily: 'Inter',
      seoTitle: 'NexusIT',
      seoDescription: 'Réseau professionnel IT',
    },
    create: { id: 'default' },
  });

  await logAdminAction({
    actorId: admin.id,
    action: 'settings.reset',
    entityType: 'SiteSettings',
    entityId: 'default',
    before,
    after,
  });
  revalidatePath('/admin/appearance');
}

export async function updateUserAdminRoleAction(formData: FormData) {
  const admin = await requireAdminAction('roles:manage');
  const userId = String(formData.get('userId'));
  const adminRole = String(formData.get('adminRole'));
  const role = adminRole ? 'ADMIN' : 'USER';
  const before = await prisma.user.findUnique({ where: { id: userId } });
  const after = await prisma.user.update({
    where: { id: userId },
    data: {
      role,
      adminRole: adminRole ? (adminRole as 'SUPER_ADMIN' | 'CONTENT_MANAGER' | 'MODERATOR' | 'SUPPORT') : null,
    },
  });

  await logAdminAction({
    actorId: admin.id,
    action: 'user.role.update',
    entityType: 'User',
    entityId: userId,
    before,
    after,
  });
  revalidatePath('/admin/roles');
}

export async function upsertStaticPageAction(formData: FormData) {
  const admin = await requireAdminAction('pages:manage');
  const pageId = String(formData.get('pageId') || '');
  const slug = String(formData.get('slug') || '').trim();
  const title = String(formData.get('title') || '').trim();
  const status = String(formData.get('status') || 'DRAFT');

  if (!slug || !title) {
    throw new Error('Slug and title are required');
  }

  const before = pageId ? await prisma.staticPage.findUnique({ where: { id: pageId } }) : null;
  const after = pageId
    ? await prisma.staticPage.update({ where: { id: pageId }, data: { slug, title, status } })
    : await prisma.staticPage.create({ data: { slug, title, status } });

  await logAdminAction({
    actorId: admin.id,
    action: pageId ? 'page.update' : 'page.create',
    entityType: 'StaticPage',
    entityId: after.id,
    before,
    after,
  });
  revalidatePath('/admin/pages');
}

export async function updatePageBlocksAction(pageId: string, blocks: Array<{ id?: string; type: string; content: unknown; settings?: unknown }>) {
  const admin = await requireAdminAction('pages:manage');
  const before = await prisma.pageBlock.findMany({ where: { pageId }, orderBy: { order: 'asc' } });

  await prisma.$transaction([
    prisma.pageBlock.deleteMany({ where: { pageId } }),
    ...blocks.map((block, order) =>
      prisma.pageBlock.create({
        data: {
          pageId,
          type: block.type,
          order,
          content: block.content as object,
          settings: block.settings as object | undefined,
        },
      }),
    ),
  ]);

  const after = await prisma.pageBlock.findMany({ where: { pageId }, orderBy: { order: 'asc' } });
  await logAdminAction({
    actorId: admin.id,
    action: 'page.blocks.update',
    entityType: 'StaticPage',
    entityId: pageId,
    before,
    after,
  });
  revalidatePath('/admin/pages');
}
