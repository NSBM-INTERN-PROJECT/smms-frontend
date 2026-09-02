import React from 'react';

export interface TableColumn<T> {
  key: string;
  title: string;
  render?: (record: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey: (record: T) => string;
}

export const Table = <T extends any>({ columns, data, rowKey }: TableProps<T>) => {
  return (
    <div className="table-container">
      <table className="custom-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>{col.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="table-empty-state">
                No data available
              </td>
            </tr>
          ) : (
            data.map((record) => (
              <tr key={rowKey(record)}>
                {columns.map((col) => (
                  <td key={col.key}>
                    {col.render ? col.render(record) : (record as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
