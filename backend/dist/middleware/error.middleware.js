"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error('[ERROR]', err.message);
    // SQL Server Deadlock Error 1205
    if (err.message.includes('1205') || err.message.toLowerCase().includes('deadlock')) {
        res.status(409).json({
            success: false,
            message: 'Deadlock detected - Transaction was chosen as victim (Error 1205)',
            error: err.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: 'Lỗi server',
        error: err.message,
    });
}
