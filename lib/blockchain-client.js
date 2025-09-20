// lib/blockchain-client.ts
// PRD v1.3, Section 4: ethers.js utils for contract interaction
import { ethers } from "ethers";
import { AICallingAudit } from '../contracts/typechain/AICallingAudit';
const auditContract = require('../contracts/artifacts/contracts/AICallingAudit.sol/AICallingAudit.json');
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_AUDIT);
const contract = new ethers.Contract(process.env.POLYGON_CONTRACT_ADDRESS, AICallingAudit.abi, provider);
export async function getContractLogs(userAddress, page, pageSize) {
    return await contract.getLogs(userAddress, page, pageSize);
}
export async function requestErasure(signer, hash) {
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.erasePII(hash);
    await tx.wait();
}
