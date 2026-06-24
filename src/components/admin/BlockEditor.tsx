'use client';

import { useMemo, useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export type EditableBlock = {
  id: string;
  type: 'text' | 'image' | 'button' | 'divider';
  content: Record<string, string>;
  settings?: Record<string, string>;
};

type BlockEditorProps = {
  initialBlocks: EditableBlock[];
  onChange?: (blocks: EditableBlock[]) => void;
};

const blockLabels = {
  text: 'Texte',
  image: 'Image',
  button: 'Bouton',
  divider: 'Séparateur',
};

export function BlockEditor({ initialBlocks, onChange }: BlockEditorProps) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [selectedBlockId, setSelectedBlockId] = useState<string>(initialBlocks[0]?.id);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const selectedBlock = useMemo(
    () => blocks.find((block) => block.id === selectedBlockId),
    [blocks, selectedBlockId],
  );

  const updateBlocks = (nextBlocks: EditableBlock[]) => {
    setBlocks(nextBlocks);
    onChange?.(nextBlocks);
  };

  const addBlock = (type: EditableBlock['type']) => {
    const block: EditableBlock = {
      id: crypto.randomUUID(),
      type,
      content:
        type === 'button'
          ? { label: 'Nouveau bouton', href: '/' }
          : type === 'image'
            ? { src: '', alt: '' }
            : type === 'divider'
              ? {}
              : { text: 'Nouveau texte' },
      settings: { align: 'left', color: '#d0d0dc' },
    };
    updateBlocks([...blocks, block]);
    setSelectedBlockId(block.id);
  };

  const updateBlock = (id: string, patch: Partial<EditableBlock>) => {
    updateBlocks(blocks.map((block) => (block.id === id ? { ...block, ...patch } : block)));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = blocks.findIndex((block) => block.id === active.id);
    const newIndex = blocks.findIndex((block) => block.id === over.id);
    updateBlocks(arrayMove(blocks, oldIndex, newIndex));
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
      <section className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
        <div className="mb-4 flex flex-wrap gap-2">
          {(['text', 'image', 'button', 'divider'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => addBlock(type)}
              className="rounded-lg border border-[#1e1e24] px-3 py-2 text-xs font-semibold text-[#888] hover:text-[#4f8ef7]"
            >
              + {blockLabels[type]}
            </button>
          ))}
        </div>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {blocks.map((block) => (
                <SortableBlock
                  key={block.id}
                  block={block}
                  selected={block.id === selectedBlockId}
                  onSelect={() => setSelectedBlockId(block.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </section>

      <aside className="rounded-xl border border-[#1e1e24] bg-[#0f0f14] p-4">
        <h3 className="font-semibold text-[#e8e8f0]">Inspecteur</h3>
        {selectedBlock ? (
          <div className="mt-4 space-y-3">
            <p className="text-xs uppercase tracking-wider text-[#555]">{blockLabels[selectedBlock.type]}</p>
            {Object.entries(selectedBlock.content).map(([key, value]) => (
              <label key={key} className="block text-xs font-semibold text-[#888]">
                {key}
                <input
                  value={value}
                  onChange={(event) =>
                    updateBlock(selectedBlock.id, {
                      content: { ...selectedBlock.content, [key]: event.target.value },
                    })
                  }
                  className="mt-2 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
                />
              </label>
            ))}
            <label className="block text-xs font-semibold text-[#888]">
              Couleur
              <input
                type="color"
                value={selectedBlock.settings?.color || '#d0d0dc'}
                onChange={(event) =>
                  updateBlock(selectedBlock.id, {
                    settings: { ...selectedBlock.settings, color: event.target.value },
                  })
                }
                className="mt-2 h-10 w-full rounded-lg border border-[#1e1e24] bg-[#0a0a0d]"
              />
            </label>
          </div>
        ) : (
          <p className="mt-4 text-sm text-[#555]">Sélectionnez un bloc.</p>
        )}
      </aside>
    </div>
  );
}

function SortableBlock({
  block,
  selected,
  onSelect,
}: {
  block: EditableBlock;
  selected: boolean;
  onSelect: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });

  return (
    <button
      ref={setNodeRef}
      type="button"
      onClick={onSelect}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`w-full rounded-xl border p-4 text-left ${
        selected ? 'border-[#4f8ef7] bg-[#0d2040]' : 'border-[#1e1e24] bg-[#131318]'
      }`}
      {...attributes}
      {...listeners}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-[#555]">{blockLabels[block.type]}</p>
      <div className="mt-2 text-sm text-[#d0d0dc]">
        {block.type === 'text' && (block.content.text || 'Texte vide')}
        {block.type === 'image' && (block.content.src || 'Image non définie')}
        {block.type === 'button' && (block.content.label || 'Bouton')}
        {block.type === 'divider' && <hr className="border-[#2a2a34]" />}
      </div>
    </button>
  );
}
