'use client';

import { useMemo, useState } from 'react';

export type DataTableColumn<T> = {
  key: keyof T & string;
  label: string;
  sortable?: boolean;
  editable?: boolean;
  render?: (row: T) => React.ReactNode;
};

type DataTableProps<T extends { id: string }> = {
  title: string;
  rows: T[];
  columns: DataTableColumn<T>[];
  onBulkDelete?: (ids: string[]) => void;
  onInlineEdit?: (id: string, key: string, value: string) => void;
};

export function DataTable<T extends { id: string }>({
  title,
  rows,
  columns,
  onBulkDelete,
  onInlineEdit,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [visibleColumns, setVisibleColumns] = useState(columns.map((column) => column.key));
  const pageSize = 10;

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.toLowerCase();
    const baseRows = rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(normalizedSearch),
    );

    if (!sortKey) {
      return baseRows;
    }

    return [...baseRows].sort((a, b) => {
      const aValue = String((a as Record<string, unknown>)[sortKey] ?? '');
      const bValue = String((b as Record<string, unknown>)[sortKey] ?? '');
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    });
  }, [rows, search, sortDirection, sortKey]);

  const visibleColumnDefs = columns.filter((column) => visibleColumns.includes(column.key));
  const pageCount = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = filteredRows.slice((page - 1) * pageSize, page * pageSize);

  const toggleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const exportCsv = () => {
    const header = visibleColumnDefs.map((column) => column.label).join(',');
    const body = filteredRows
      .map((row) =>
        visibleColumnDefs
          .map((column) => JSON.stringify(String((row as Record<string, unknown>)[column.key] ?? '')))
          .join(','),
      )
      .join('\n');
    const blob = new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${title.toLowerCase().replace(/\s+/g, '-')}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl border border-[#1a1a20] bg-[#0f0f14] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#e8e8f0]">{title}</h2>
          <p className="text-xs text-[#555]">{filteredRows.length} résultat(s)</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-[#1e1e24] bg-[#0a0a0d] px-3 py-2 text-sm text-[#d0d0dc]"
            placeholder="Rechercher..."
          />
          <button
            type="button"
            onClick={exportCsv}
            className="rounded-lg border border-[#1e1e24] px-3 py-2 text-sm font-semibold text-[#888] hover:text-[#4f8ef7]"
          >
            Export CSV
          </button>
          {onBulkDelete && selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => onBulkDelete(selectedIds)}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white"
            >
              Supprimer ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      <details className="mt-4 text-sm text-[#888]">
        <summary className="cursor-pointer">Colonnes</summary>
        <div className="mt-3 flex flex-wrap gap-3">
          {columns.map((column) => (
            <label key={column.key} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={visibleColumns.includes(column.key)}
                onChange={(event) =>
                  setVisibleColumns((current) =>
                    event.target.checked
                      ? [...current, column.key]
                      : current.filter((key) => key !== column.key),
                  )
                }
              />
              {column.label}
            </label>
          ))}
        </div>
      </details>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-[#555]">
            <tr>
              <th className="py-3">
                <input
                  type="checkbox"
                  checked={paginatedRows.length > 0 && selectedIds.length === paginatedRows.length}
                  onChange={(event) =>
                    setSelectedIds(event.target.checked ? paginatedRows.map((row) => row.id) : [])
                  }
                />
              </th>
              {visibleColumnDefs.map((column) => (
                <th
                  key={column.key}
                  className="cursor-pointer py-3"
                  onClick={() => column.sortable && toggleSort(column.key)}
                >
                  {column.label}
                  {sortKey === column.key ? (sortDirection === 'asc' ? ' ↑' : ' ↓') : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedRows.map((row) => (
              <tr key={row.id} className="border-t border-[#111115]">
                <td className="py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(row.id)}
                    onChange={(event) =>
                      setSelectedIds((current) =>
                        event.target.checked
                          ? [...current, row.id]
                          : current.filter((id) => id !== row.id),
                      )
                    }
                  />
                </td>
                {visibleColumnDefs.map((column) => (
                  <td
                    key={column.key}
                    className="py-3 text-[#d0d0dc]"
                    onDoubleClick={() => {
                      if (!column.editable || !onInlineEdit) return;
                      const value = prompt('Nouvelle valeur', String((row as Record<string, unknown>)[column.key] ?? ''));
                      if (value !== null) onInlineEdit(row.id, column.key, value);
                    }}
                  >
                    {column.render ? column.render(row) : String((row as Record<string, unknown>)[column.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-sm text-[#888]">
        <span>
          Page {page} / {pageCount}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(1, current - 1))}
            className="rounded-lg border border-[#1e1e24] px-3 py-2"
          >
            Précédent
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
            className="rounded-lg border border-[#1e1e24] px-3 py-2"
          >
            Suivant
          </button>
        </div>
      </div>
    </section>
  );
}
