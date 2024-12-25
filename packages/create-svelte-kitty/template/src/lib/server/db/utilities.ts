import { getTableColumns, type Table } from 'drizzle-orm';

export const pickTableColumns = <
	T extends Table, //
	const ColumnName extends keyof T['_']['columns']
>(
	table: T,
	columnNames: ColumnName[]
) => {
	type Picked = Pick<T['_']['columns'], ColumnName>;
	const picked: Partial<Picked> = {};
	const columns = getTableColumns(table);
	for (const columnName of columnNames) {
		picked[columnName] = columns[columnName];
	}
	return picked as Picked;
};
