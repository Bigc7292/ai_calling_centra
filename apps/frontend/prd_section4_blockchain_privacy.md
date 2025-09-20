## 4. Blockchain-Enabled Data Privacy

### Scope & Rationale (Deepened)
- **PII Scope:** Strict to identifiers (name, phone, email, IP-derived geo); Operational data (transcripts, audio) off-chain, encrypted (AES-256-GCM), access-logged.
- **Rationale:** Enables "data sovereignty" – clients query their Polygon logs independently; ZK-SNARKs for proving compliance (e.g., "X calls scrubbed") without data reveal. Cost: <$0.02/tx avg; Throughput: 65k TPS on Polygon.

### Implementation Flow (Step-by-Step with Client/Server Split)
1. **Wallet Generation (`/signup` Client-Side):**
   - Use `ethers.Wallet.createRandom()`; Display mnemonic in secure modal (copy/QR); Optional: Hardware wallet connect (WalletConnect v2).
   - Store: LocalStorage (encrypted via Web Crypto API) – Never to server.
2. **PII Ingestion & Hashing (Upload Handler):**
   - JS: `const hash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(`${name}|${phone}|${email}`));` – Salt with user wallet nonce.
   - Batch: For CSV, map over rows → Sign tx envelope → Batch submit (Polygon multicall).
3. **Smart Contract (Full Solidity with ZK Teaser):**
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract AICallingAudit is Ownable, ReentrancyGuard {
    struct PIIHashLog {
        bytes32 hash;  // Keccak256(PII + salt)
        address userWallet;
        uint256 timestamp;
        string action;  // "insert", "update", "dnc_flag", "erase"
        bytes32 zkProof;  // Future: SNARK for verifiable compute
        bool isErased;  // GDPR toggle
    }

    mapping(address => PIIHashLog[]) public logs;
    mapping(bytes32 => bool) public hashExists;  // Prevent duplicates

    event PIILogged(address indexed user, bytes32 indexed hash, string action, bytes32 zkProof);
    event DataErased(address indexed user, bytes32 indexed hash);

    modifier onlyUser(address _user) {
        require(msg.sender == _user, "Unauthorized");
        _;
    }

    function logPII(bytes32 _hash, string calldata _action, bytes32 _zkProof)
        external
        nonReentrant
        onlyUser(msg.sender)
    {
        require(!hashExists[_hash], "Hash already logged");
        hashExists[_hash] = true;
        logs[msg.sender].push(PIIHashLog(_hash, msg.sender, block.timestamp, _action, _zkProof, false));
        emit PIILogged(msg.sender, _hash, _action, _zkProof);
    }

    function erasePII(bytes32 _hash) external onlyUser(msg.sender) {
        for (uint i = 0; i < logs[msg.sender].length; i++) {
            if (logs[msg.sender][i].hash == _hash) {
                logs[msg.sender][i].isErased = true;
                emit DataErased(msg.sender, _hash);
                return;
            }
        }
    }

    // View: Paginated logs for client dashboard
    function getLogs(address _user, uint256 _from, uint256 _limit)
        external
        view
        returns (PIIHashLog[] memory)
    {
        PIIHashLog[] memory userLogs = logs[_user];
        uint256 end = _from + _limit > userLogs.length ? userLogs.length : _from + _limit;
        PIIHashLog[] memory paginated = new PIIHashLog<a href="end - _from" target="_blank" rel="noopener noreferrer nofollow"></a>;
        for (uint i = _from; i < end; i++) {
            paginated[i - _from] = userLogs[i];
        }
        return paginated;
    }

    // Admin: Emergency pause (for exploits)
    bool public paused;
    function togglePause() external onlyOwner { paused = !paused; }
}
```
Deployment: Hardhat script for Mumbai → Mainnet; Verify on PolygonScan.
Storage Hybrid: Supabase: Encrypted ciphertext + hash ref; Client decrypts via wallet-derived key (PBKDF2).
ZK Extension (v1.4 Teaser): Integrate Semaphore for anonymous DNC proofs – "Prove I scrubbed without showing list".

Gemini Integration Prompt Addendum: "Enhance with ZK: Generate client-side proof gen using snarkjs. On logPII, include _zkProof param. Ensure all hashing uses wallet nonce for replay protection. Test: Simulate 100 PII inserts."
Compliance Edge: Art. 17 Erasure: Contract call + Supabase nuke; Audit API: "Query logs for user X, filter erased=false".