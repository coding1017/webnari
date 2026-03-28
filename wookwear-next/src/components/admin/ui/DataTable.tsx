"use client";

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
  loading = false,
}: {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  emptyMessage?: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ww-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-ww-border/50">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-ww-surface rounded animate-pulse w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-ww-dark border border-ww-border rounded-lg py-12 text-center">
        <p className="text-sm text-ww-muted">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-ww-dark border border-ww-border rounded-lg overflow-hidden overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-ww-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs font-medium text-ww-muted uppercase tracking-wider px-4 py-3 ${col.className || ""}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={row.id ?? i}
              onClick={() => onRowClick?.(row)}
              className={`border-b border-ww-border/50 last:border-0 transition-colors ${
                onRowClick
                  ? "cursor-pointer hover:bg-ww-surface/50"
                  : ""
              }`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-ww-text ${col.className || ""}`}
                >
                  {col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
