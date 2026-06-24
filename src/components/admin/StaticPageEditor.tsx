'use client';

import { useState, useTransition } from 'react';
import { BlockEditor, EditableBlock } from '@/components/admin/BlockEditor';
import { updatePageBlocksAction } from '@/app/admin/actions';

export function StaticPageEditor({
  pageId,
  initialBlocks,
}: {
  pageId: string;
  initialBlocks: EditableBlock[];
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<string>();

  const saveBlocks = () => {
    startTransition(async () => {
      await updatePageBlocksAction(pageId, blocks);
      setStatus('Blocs enregistrés.');
    });
  };

  return (
    <div className="space-y-4">
      <BlockEditor initialBlocks={blocks} onChange={setBlocks} />
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={saveBlocks}
          disabled={isPending}
          className="rounded-lg bg-[#4f8ef7] px-4 py-2 text-sm font-semibold text-white disabled:bg-[#1d3461]"
        >
          {isPending ? 'Enregistrement...' : 'Enregistrer les blocs'}
        </button>
        {status && <span className="text-sm text-[#2dd4a0]">{status}</span>}
      </div>
    </div>
  );
}
