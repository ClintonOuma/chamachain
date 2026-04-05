const hre = require("hardhat");

async function main() {
  console.log("Deploying ChamaVoting contract...");
  const ChamaVoting = await hre.ethers.getContractFactory("ChamaVoting");
  const chamaVoting = await ChamaVoting.deploy();
  await chamaVoting.waitForDeployment();
  const address = await chamaVoting.getAddress();
  console.log("ChamaVoting deployed to:", address);
  console.log("Add this to your .env: CONTRACT_ADDRESS=" + address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});