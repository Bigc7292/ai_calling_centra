// per TASK COMMAND: ethers helpers (gen, hash, QR)
import { ethers } from 'ethers';

/**
 * Generates a new random Ethereum wallet.
 * @returns {ethers.Wallet} A new wallet instance.
 * @see PRD Sec 2.2: "Use ethers.Wallet.createRandom()"
 */
export const createNewWallet = (): ethers.Wallet => {
  // Per Sec 4: Client-side ethers 6.13 for wallet/Polygon
  return ethers.Wallet.createRandom();
};

/**
 * Hashes a string using Keccak256, consistent with Solidity's hashing.
 * @param {string} value - The string to hash.
 * @returns {string} The Keccak256 hash of the string.
 * @see PRD Sec 4: "Client-side ethers.js hashing to Polygon Audit contract"
 */
export const hashPII = (value: string): string => {
  return ethers.keccak256(ethers.toUtf8Bytes(value));
};

/**
 * Encrypts a wallet's mnemonic phrase using the Web Crypto API and stores it in localStorage.
 * @param {string} mnemonic - The mnemonic phrase to encrypt.
 * @param {string} password - The user's password, used to derive an encryption key.
 * @returns {Promise<void>}
 * @see PRD Sec 2.2: "Encrypt to localStorage (Web Crypto API)"
 */
export const storeEncryptedMnemonic = async (mnemonic: string, password: string): Promise<void> => {
  try {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    const key = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      true,
      ['encrypt', 'decrypt']
    );
    const encryptedMnemonic = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      new TextEncoder().encode(mnemonic)
    );

    // Store salt, iv, and encrypted data together
    const storedData = {
      salt: Buffer.from(salt).toString('hex'),
      iv: Buffer.from(iv).toString('hex'),
      encryptedData: Buffer.from(encryptedMnemonic).toString('hex'),
    };
    localStorage.setItem('wallet_backup', JSON.stringify(storedData));
  } catch (error) {
    console.error('Failed to encrypt and store mnemonic:', error);
    // Per PRD Sec 5: Errors: Exponential retry + Sentry stubs.
    // Sentry.captureException(error);
    throw new Error('Could not securely store wallet backup.');
  }
};

/**
 * Placeholder for emitting a blockchain event.
 * In a real implementation, this would interact with a connected wallet (e.g., MetaMask)
 * or a client-side ethers provider to send a transaction.
 * @param {string} walletAddress - The user's wallet address.
 * @param {string} piiHash - The hash of the PII to be logged.
 * @returns {Promise<string>} The transaction hash.
 * @see TASK COMMAND: "Blockchain Emit: Client-side tx stub in frontend"
 */
export const emitBlockchainAuditStub = async (walletAddress: string, piiHash: string): Promise<string> => {
  console.log(`// STUB: Per Sec 4 - Client-side transaction would be initiated here.`);
  console.log(`// Calling contract.logPII with action="insert"`);
  console.log(`// Wallet: ${walletAddress}`);
  console.log(`// PII Hash: ${piiHash}`);

  // This is a stub. A real implementation would require:
  // 1. An ethers.js Provider connected to Polygon Mumbai RPC.
  // 2. The user's wallet (signer) to sign and send the transaction.
  // const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_MUMBAI_RPC_URL);
  // const contract = new ethers.Contract(process.env.NEXT_PUBLIC_AUDIT_CONTRACT_ADDRESS!, ABI, provider);
  // const signer = new ethers.Wallet('PRIVATE_KEY_HERE', provider); // DANGER: Never expose private key on client.
  // const tx = await contract.connect(signer).logPII(piiHash, "insert", "0x...");
  // await tx.wait();
  // return tx.hash;

  // Returning a fake hash for demonstration purposes.
  const fakeTxHash = ethers.keccak256(ethers.toUtf8Bytes(`fake-tx-for-${piiHash}`));
  console.log(`// Fake TX Hash: ${fakeTxHash}`);
  return fakeTxHash;
};
