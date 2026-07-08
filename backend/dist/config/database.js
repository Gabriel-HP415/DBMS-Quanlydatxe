"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sql = void 0;
exports.getPool = getPool;
exports.closePool = closePool;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const server = process.env.DB_SERVER || 'localhost';
const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined;
const database = process.env.DB_NAME || 'BusBookingDB';
const useSqlAuth = Boolean(process.env.DB_USER && process.env.DB_PASSWORD);
/**
 * SQL Auth (Docker/Linux): mssql + tedious
 * Windows Auth (local dev): msnodesqlv8 + ODBC Driver 18
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sql = useSqlAuth ? require('mssql') : require('mssql/msnodesqlv8');
exports.sql = sql;
function getConfig() {
    if (useSqlAuth) {
        return {
            server,
            port,
            database,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            options: {
                encrypt: true,
                trustServerCertificate: true,
            },
            pool: {
                max: 10,
                min: 0,
                idleTimeoutMillis: 30000,
            },
        };
    }
    const connectionString = [
        'Driver={ODBC Driver 18 for SQL Server}',
        `Server=${server}`,
        `Database=${database}`,
        'Trusted_Connection=Yes',
        'TrustServerCertificate=Yes',
    ].join(';');
    return {
        connectionString,
        driver: 'msnodesqlv8',
    };
}
let pool = null;
async function getPool() {
    if (!pool) {
        pool = await new sql.ConnectionPool(getConfig()).connect();
        console.log(`[DB] Đã kết nối SQL Server: ${server}/${database} (${useSqlAuth ? 'SQL Auth' : 'Windows Auth'})`);
    }
    return pool;
}
async function closePool() {
    if (pool) {
        await pool.close();
        pool = null;
    }
}
