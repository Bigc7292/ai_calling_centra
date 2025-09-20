// Per TASK COMMAND: Hardhat deploy script
const hre = require("hardhat");

async function main() {
  console.log("Deploying AICallingAudit contract...");

  const auditContract = await hre.ethers.deployContract("AICallingAudit");

  await auditContract.waitForDeployment();

  const contractAddress = await auditContract.getAddress();
  console.log(`AICallingAudit contract deployed to: ${contractAddress}`);
  console.log("\n✅ Update NEXT_PUBLIC_AUDIT_CONTRACT_ADDRESS in your .env.local file with this address.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
