// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract ChamaVoting {
    struct LoanVote {
        bytes32 loanId;       // MongoDB loan _id as bytes32
        uint256 yesVotes;
        uint256 noVotes;
        uint256 threshold;    // votes needed for approval
        bool finalized;
        bool approved;
    }

    mapping(bytes32 => LoanVote) public votes;
    mapping(bytes32 => mapping(address => bool)) public hasVoted;

    event VoteCreated(bytes32 indexed loanId, uint256 threshold);
    event VoteCast(bytes32 indexed loanId, address voter, bool support);
    event VoteFinalized(bytes32 indexed loanId, bool approved);

    function createVote(bytes32 _loanId, uint256 _threshold) external {
        require(votes[_loanId].loanId == 0, "Vote already exists");
        votes[_loanId].loanId = _loanId;
        votes[_loanId].threshold = _threshold;
        votes[_loanId].finalized = false;
        
        emit VoteCreated(_loanId, _threshold);
    }

    function castVote(bytes32 _loanId, bool _support) external {
        LoanVote storage v = votes[_loanId];
        require(v.loanId != 0, "Vote does not exist");
        require(!v.finalized, "Vote already finalized");
        require(!hasVoted[_loanId][msg.sender], "Already voted");

        hasVoted[_loanId][msg.sender] = true;
        if (_support) {
            v.yesVotes++;
        } else {
            v.noVotes++;
        }

        emit VoteCast(_loanId, msg.sender, _support);

        // Auto-finalize if threshold met
        if (v.yesVotes >= v.threshold) {
            v.finalized = true;
            v.approved = true;
            emit VoteFinalized(_loanId, true);
        }
    }

    function finalizeVote(bytes32 _loanId) external {
        LoanVote storage v = votes[_loanId];
        require(v.loanId != 0, "Vote does not exist");
        require(!v.finalized, "Vote already finalized");

        v.finalized = true;
        v.approved = (v.yesVotes >= v.threshold);
        
        emit VoteFinalized(_loanId, v.approved);
    }

    function getVote(bytes32 _loanId) external view returns (uint256 yes, uint256 no, uint256 threshold, bool finalized, bool approved) {
        LoanVote storage v = votes[_loanId];
        return (v.yesVotes, v.noVotes, v.threshold, v.finalized, v.approved);
    }
}
