import type { ConnectionPool } from 'mssql';
/**
 * SQL Auth (Docker/Linux): mssql + tedious
 * Windows Auth (local dev): msnodesqlv8 + ODBC Driver 18
 */
declare const sql: typeof import('mssql');
export declare function getPool(): Promise<ConnectionPool>;
export declare function closePool(): Promise<void>;
export { sql };
