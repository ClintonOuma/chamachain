solidity// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChamaVoting {

    struct LoanVote {
        string loanId;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 threshold;
        bool finalized;
        bool approved;
        mapping(address => bool) hasVoted;
        mapping(address => bool) votedYes;
    }

    mapping(string => LoanVote) public votes;
    string[] public voteIds;

    event VoteCreated(string indexed loanId, uint256 threshold);
    event VoteCast(string indexed loanId, address indexed voter, bool support);
    event VoteFinalized(string indexed loanId, bool approved);

    function createVote(string memory loanId, uint256 threshold) external {
        require(bytes(votes[loanId].loanId).length == 0, "Vote already exists");
        LoanVote storage vote = votes[loanId];
        vote.loanId = loanId;
        vote.threshold = threshold;
        vote.finalized = false;
        voteIds.push(loanId);
        emit VoteCreated(loanId, threshold);
    }

    function castVote(string memory loanId, bool support) external {
        LoanVote storage vote = votes[loanId];
        require(bytes(vote.loanId).length > 0, "Vote does not exist");
        require(!vote.finalized, "Vote already finalized");
        require(!vote.hasVoted[msg.sender], "Already voted");
        vote.hasVoted[msg.sender] = true;
        vote.votedYes[msg.sender] = support;
        if (support) {
            vote.yesVotes++;
        } else {
            vote.noVotes++;
        }
        emit VoteCast(loanId, msg.sender, support);
    }

    function finalizeVote(string memory loanId) external {
        LoanVote storage vote = votes[loanId];
        require(bytes(vote.loanId).length > 0, "Vote does not exist");
        require(!vote.finalized, "Already finalized");
        uint256 total = vote.yesVotes + vote.noVotes;
        require(total > 0, "No votes cast");
        vote.finalized = true;
        vote.approved = (vote.yesVotes * 100 / total) >= vote.threshold;
        emit VoteFinalized(loanId, vote.approved);
    }

    function getVote(string memory loanId) external view returns (
        uint256 yesVotes,
        uint256 noVotes,
        uint256 threshold,
        bool finalized,
        bool approved
    ) {
        LoanVote storage vote = votes[loanId];
        return (vote.yesVotes, vote.noVotes, vote.threshold, vote.finalized, vote.approved);
    }

    function hasVoted(string memory loanId, address voter) external view returns (bool) {
        return votes[loanId].hasVoted[voter];
    }

    function getVoteCount() external view returns (uint256) {
        return voteIds.length;
    }
}