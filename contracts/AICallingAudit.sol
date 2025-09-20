// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// PRD v1.3, Section 4: Finalized contract with erasePII
contract AICallingAudit is Ownable, ReentrancyGuard {
    struct PIIHashLog {
        bytes32 hash;
        address userWallet;
        uint256 timestamp;
        string action;
        bytes32 zkProof; // Placeholder for future ZK integration
        bool isErased;
    }

    mapping(address => PIIHashLog[]) public logs;
    mapping(bytes32 => bool) public hashExists;

    event PIILogged(address indexed user, bytes32 indexed hash, string action);
    event DataErased(address indexed user, bytes32 indexed hash);

    modifier onlyUser(address _user) {
        require(msg.sender == _user, "Unauthorized: Caller is not the user");
        _;
    }

    function logPII(bytes32 _hash, string calldata _action) external nonReentrant onlyUser(msg.sender) {
        require(!hashExists[_hash], "Hash already logged");
        hashExists[_hash] = true;
        logs[msg.sender].push(PIIHashLog(_hash, msg.sender, block.timestamp, _action, bytes32(0), false));
        emit PIILogged(msg.sender, _hash, _action);
    }

    function erasePII(bytes32 _hash) external nonReentrant onlyUser(msg.sender) {
        for (uint i = 0; i < logs[msg.sender].length; i++) {
            if (logs[msg.sender][i].hash == _hash) {
                logs[msg.sender][i].isErased = true;
                emit DataErased(msg.sender, _hash);
                return;
            }
        }
        revert("Log not found");
    }

    function getLogs(address _user, uint256 _page, uint256 _pageSize) external view returns (PIIHashLog[] memory) {
        uint256 startIndex = _page * _pageSize;
        uint256 endIndex = startIndex + _pageSize;
        if (endIndex > logs[_user].length) {
            endIndex = logs[_user].length;
        }
        PIIHashLog[] memory result = new PIIHashLog[](endIndex - startIndex);
        for (uint i = startIndex; i < endIndex; i++) {
            result[i - startIndex] = logs[_user][i];
        }
        return result;
    }
}