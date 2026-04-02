import hre from "hardhat";

async function main() {
  const ChamaVoting = await hre.ethers.getContractFactory("ChamaVoting");
  const chamaVoting = await ChamaVoting.deploy();

  await chamaVoting.waitForDeployment();

  console.log(`ChamaVoting deployed to: ${await chamaVoting.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
