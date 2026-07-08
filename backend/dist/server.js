"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const database_1 = require("./config/database");
const PORT = process.env.PORT || 3001;
async function start() {
    try {
        await (0, database_1.getPool)();
        app_1.default.listen(PORT, () => {
            console.log(`[API] Server chạy tại http://localhost:${PORT}`);
            console.log(`[API] Health check: http://localhost:${PORT}/health`);
            console.log(`[API] Trips:        http://localhost:${PORT}/api/trips`);
        });
    }
    catch (err) {
        console.error('[API] Không thể khởi động server:', err);
        process.exit(1);
    }
}
process.on('SIGINT', async () => {
    await (0, database_1.closePool)();
    process.exit(0);
});
start();
