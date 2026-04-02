const { ethers } = require('ethers');
const dotenv = require('dotenv');

dotenv.config();

const contractAddress = process.env.CONTRACT_ADDRESS;
const rpcUrl = process.env.POLYGON_RPC_URL;
const privateKey = process.env.DEPLOYER_PRIVATE_KEY;

const abi = [
  "function createVote(bytes32 loanId, uint256 threshold) external",
  "function castVote(bytes32 loanId, bool support) external",
  "function finalizeVote(bytes32 loanId) external",
  "function getVote(bytes32 loanId) external view returns (uint256 yes, uint256 no, uint256 threshold, bool finalized, bool approved)",
  "event VoteCreated(bytes32 indexed loanId, uint256 threshold)",
  "event VoteCast(bytes32 indexed loanId, address voter, bool support)",
  "event VoteFinalized(bytes32 indexed loanId, bool approved)"
];

let provider;
let wallet;
let contract;

if (rpcUrl && privateKey && contractAddress) {
  provider = new ethers.JsonRpcProvider(rpcUrl);
  wallet = new ethers.Wallet(privateKey, provider);
  contract = new ethers.Contract(contractAddress, abi, wallet);
}

const createLoanVote = async (loanId, threshold) => {
  if (!contract) {
    console.warn('Blockchain contract not configured. Skipping on-chain vote creation.');
    return null;
  }
  const bytes32LoanId = ethers.id(loanId.toString());
  const tx = await contract.createVote(bytes32LoanId, threshold);
  return await tx.wait();
};

const castLoanVote = async (loanId, support) => {
  if (!contract) {
    console.warn('Blockchain contract not configured. Skipping on-chain vote.');
    return null;
  }
  const bytes32LoanId = ethers.id(loanId.toString());
  const tx = await contract.castVote(bytes32LoanId, support);
  return await tx.wait();
};

const getLoanVoteStatus = async (loanId) => {
  if (!contract) return null;
  const bytes32LoanId = ethers.id(loanId.toString());
  const result = await contract.getVote(bytes32LoanId);
  return {
    yes: result[0].toString(),
    no: result[1].toString(),
    threshold: result[2].toString(),
    finalized: result[3],
    approved: result[4]
  };
};

module.exports = {
  createLoanVote,
  castLoanVote,
  getLoanVoteStatus
};
