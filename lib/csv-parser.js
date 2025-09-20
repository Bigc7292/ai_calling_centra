// lib/csv-parser.ts
// PRD v1.3, Section 5: PapaParse for CSV
import Papa from "papaparse";
import { ethers } from "ethers";
export function parseCSV(file) {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
            error: (error) => {
                reject(error);
            },
        });
    });
}
export function hashLead(lead, nonce) {
    const message = `${lead.name}|${lead.phone}|${lead.email}${nonce}`;
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message));
}
