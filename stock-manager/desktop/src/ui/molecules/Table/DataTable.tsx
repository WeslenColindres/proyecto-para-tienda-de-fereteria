import React, { useState } from 'react';
import './DataTable.css';

export type SortDirection = 'asc' | 'desc';

export interface Column<T> {
    key: string;
    header: string;
    accessor?: keyof T | ((item: T) => React.ReactNode);
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
    className?: string;
    headerClassName?: string;
}

export interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyField: keyof T;
    selectedId?: string | null;
    onSelect?: (id: string) => void;
    onDoubleClick?: (item: T) => void;
    loading?: boolean;
    emptyMessage?: string;
    onSort?: (key: string, direction: SortDirection) => void;
    sortBy?: string;
    sortDirection?: SortDirection;
    className?: string;
    headerClassName?: string;
    rowClassName?: string;
}

export function DataTable<T>({
    data,
    columns,
    keyField,
    selectedId,
    onSelect,
    onDoubleClick,
    loading,
    emptyMessage = 'No hay datos disponibles',
    onSort,
    sortBy,
    sortDirection,
    className,
    headerClassName,
    rowClassName,
}: DataTableProps<T>) {
    const [internalSortBy, setInternalSortBy] = useState<string | undefined>(sortBy);
    const [internalSortDirection, setInternalSortDirection] = useState<SortDirection | undefined>(sortDirection);

    const currentSortBy = sortBy !== undefined ? sortBy : internalSortBy;
    const currentSortDirection = sortDirection !== undefined ? sortDirection : internalSortDirection;

    const handleSort = (column: Column<T>) => {
        if (!column.sortable) return;

        const newDirection = currentSortBy === column.key && currentSortDirection === 'asc' ? 'desc' : 'asc';

        if (onSort) {
            onSort(column.key, newDirection);
        } else {
            setInternalSortBy(column.key);
            setInternalSortDirection(newDirection);
        }
    };

    // Internal sorting logic if onSort is not provided
    const sortedData = React.useMemo(() => {
        if (onSort || !currentSortBy || !currentSortDirection) return data;

        return [...data].sort((a, b) => {
            const col = columns.find(c => c.key === currentSortBy);
            if (!col) return 0;

            const valA = col.accessor && typeof col.accessor !== 'function' ? a[col.accessor] : (a as any)[currentSortBy];
            const valB = col.accessor && typeof col.accessor !== 'function' ? b[col.accessor] : (b as any)[currentSortBy];

            if (valA < valB) return currentSortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, currentSortBy, currentSortDirection, onSort, columns]);

    return (
        <div className="data-table-wrapper">
            <table className={`data-table ${className || ''}`}>
                <thead className={headerClassName}>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key}
                                className={`${col.headerClassName || ''} ${col.sortable ? 'sortable' : ''} ${currentSortBy === col.key ? `sorted-${currentSortDirection}` : ''}`}
                                onClick={() => handleSort(col)}
                            >
                                <div className="th-content">
                                    {col.header}
                                    {col.sortable && (
                                        <span className="sort-icon">
                                            {currentSortBy === col.key ? (currentSortDirection === 'asc' ? ' ▲' : ' ▼') : ' ⇅'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {loading && (
                        <tr>
                            <td colSpan={columns.length} className="loading-cell">
                                Cargando datos...
                            </td>
                        </tr>
                    )}
                    {!loading && sortedData.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="empty-cell">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                    {!loading &&
                        sortedData.map((item) => {
                            const id = String(item[keyField]);
                            const isSelected = id === selectedId;
                            return (
                                <tr
                                    key={id}
                                    className={`${isSelected ? 'selected' : ''} ${rowClassName || ''}`}
                                    onClick={() => onSelect?.(id)}
                                    onDoubleClick={() => onDoubleClick?.(item)}
                                >
                                    {columns.map((col) => (
                                        <td key={`${id}-${col.key}`} className={col.className}>
                                            {col.render
                                                ? col.render(item)
                                                : typeof col.accessor === 'function'
                                                    ? col.accessor(item)
                                                    : col.accessor
                                                        ? (item[col.accessor] as React.ReactNode)
                                                        : (item as any)[col.key]}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                </tbody>
            </table>
        </div>
    );
}
