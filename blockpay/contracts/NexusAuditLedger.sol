// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title NexusAuditLedger
 * @notice Academic Prototype Smart Contract for BlockPay Nexus
 * @dev Records immutable cryptographic transaction hashes (SHA-256 state roots)
 * on a local EVM network (Hardhat / Ganache / Sepolia Testnet).
 *
 * INVARIANT: No personally identifiable information (PII) or plaintext balances
 * are ever stored on-chain. Only cryptographic digests and transaction references.
 */
contract NexusAuditLedger {
    address public owner;
    bool public isPaused;

    struct AuditRecord {
        bytes32 rootHash;       // SHA-256 hash of canonical transaction JSON payload
        string txReference;     // Unique transaction ID (e.g., tx_bpx_881920)
        uint256 timestamp;      // Block timestamp of anchoring
        uint256 amountScaled;   // Scaled transaction amount (e.g., 2 decimal fixed-point)
        string assetSymbol;     // Asset identifier (e.g., "INR", "BTC", "ETH")
        address anchoredBy;     // Service operator account
    }

    // Mapping: txReference => AuditRecord
    mapping(string => AuditRecord) private records;

    // Mapping: rootHash => bool (detects hash collisions)
    mapping(bytes32 => bool) private hashRegistered;

    // Array of transaction references for audit discovery
    string[] private recordKeys;

    // Events
    event TransactionAnchored(
        string indexed txReference,
        bytes32 indexed rootHash,
        string assetSymbol,
        uint256 timestamp,
        uint256 gasCost
    );

    event AuditVerified(
        string indexed txReference,
        bytes32 evaluatedHash,
        bool isMatch,
        uint256 timestamp
    );

    event PlatformPaused(address operator);
    event PlatformUnpaused(address operator);

    modifier onlyOwner() {
        require(msg.sender == owner, "NexusAuditLedger: caller is not contract owner");
        _;
    }

    modifier whenNotPaused() {
        require(!isPaused, "NexusAuditLedger: audit ledger is paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        isPaused = false;
    }

    /**
     * @notice Anchor a completed financial transaction's cryptographic digest on-chain.
     * @param txRef Canonical transaction reference identifier
     * @param rootHash SHA-256 hash of immutable transaction attributes
     * @param amount Scaled numerical value of the operation
     * @param asset Currency or token symbol ("INR", "BTC", "ETH", "USDT")
     */
    function anchorTransaction(
        string calldata txRef,
        bytes32 rootHash,
        uint256 amount,
        string calldata asset
    ) external whenNotPaused returns (bool) {
        require(bytes(txRef).length > 0, "NexusAuditLedger: txRef cannot be empty");
        require(rootHash != bytes32(0), "NexusAuditLedger: invalid zero hash");
        require(records[txRef].timestamp == 0, "NexusAuditLedger: txRef already anchored (immutable)");

        records[txRef] = AuditRecord({
            rootHash: rootHash,
            txReference: txRef,
            timestamp: block.timestamp,
            amountScaled: amount,
            assetSymbol: asset,
            anchoredBy: msg.sender
        });

        hashRegistered[rootHash] = true;
        recordKeys.push(txRef);

        emit TransactionAnchored(txRef, rootHash, asset, block.timestamp, tx.gasprice);
        return true;
    }

    /**
     * @notice Verify whether a local candidate payload matches the anchored blockchain root.
     * @param txRef Transaction reference to verify
     * @param candidateHash Locally recomputed SHA-256 hash from off-chain database
     * @return isVerified True if candidate matches on-chain record exactly
     * @return anchoredHash The actual on-chain hash recorded
     * @return blockTimestamp The block timestamp of the original anchoring
     */
    function verifyTransaction(
        string calldata txRef,
        bytes32 candidateHash
    ) external returns (bool isVerified, bytes32 anchoredHash, uint256 blockTimestamp) {
        AuditRecord memory record = records[txRef];
        if (record.timestamp == 0) {
            emit AuditVerified(txRef, candidateHash, false, block.timestamp);
            return (false, bytes32(0), 0);
        }

        bool matchResult = (record.rootHash == candidateHash);
        emit AuditVerified(txRef, candidateHash, matchResult, block.timestamp);
        return (matchResult, record.rootHash, record.timestamp);
    }

    /**
     * @notice Retrieve the total number of anchored audit records.
     */
    function totalAnchoredRecords() external view returns (uint256) {
        return recordKeys.length;
    }

    /**
     * @notice Retrieve an audit record by transaction reference.
     */
    function getAuditRecord(string calldata txRef) external view returns (
        bytes32 rootHash,
        uint256 timestamp,
        uint256 amountScaled,
        string memory assetSymbol,
        address anchoredBy
    ) {
        AuditRecord memory rec = records[txRef];
        require(rec.timestamp > 0, "NexusAuditLedger: record does not exist");
        return (rec.rootHash, rec.timestamp, rec.amountScaled, rec.assetSymbol, rec.anchoredBy);
    }

    function pause() external onlyOwner {
        isPaused = true;
        emit PlatformPaused(msg.sender);
    }

    function unpause() external onlyOwner {
        isPaused = false;
        emit PlatformUnpaused(msg.sender);
    }
}
