"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashPayload = hashPayload;
exports.hashLedgerEntry = hashLedgerEntry;
const crypto = require("crypto");
function hashPayload(payload) {
    const normalized = JSON.stringify(payload, Object.keys(payload).sort());
    return crypto.createHash('sha256').update(normalized).digest('hex');
}
function hashLedgerEntry(data) {
    const str = JSON.stringify(data);
    return crypto.createHash('sha256').update(str).digest('hex');
}
//# sourceMappingURL=hash.util.js.map