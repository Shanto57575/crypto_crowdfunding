// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedState.sol";

contract WithdrawalManagement is SharedState {
    mapping(bytes32 => DonorVote[]) public campaignVotes;
    mapping(bytes32 => bool) public campaignFundsClaimed;
    mapping(bytes32 => EarlyWithdraw) public earlyWithdraws;
    mapping(bytes32 => uint256) public currentRequestId;

    event CampaignFundsClaimed(
        bytes32 indexed campaignId,
        address indexed owner,
        uint256 amount
    );
    event DonorVoted(
        bytes32 indexed campaignId,
        address indexed donor,
        bool vote
    );
    event CampaignClaimed(
        bytes32 indexed campaignId,
        address indexed owner,
        uint256 amountCollected
    );

    function earlyWithdrawalRequest(
        bytes32 _campaignId,
        string memory _metadataHash,
        bool isVoting,
        uint256 _requestedAmount,
        bool vote
    ) public {
        Campaign storage campaign = campaigns[_campaignId];
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];

        if (msg.sender == campaign.owner && !isVoting) {
            require(!withdraw.isActive, "Previous request still active");

            currentRequestId[_campaignId]++;

            withdraw.metadataHash = _metadataHash;
            withdraw.isActive = true;
            withdraw.totalVotes = 0;
            withdraw.votesInFavor = 0;
            withdraw.requestedAmount = _requestedAmount;
            withdraw.requestId = currentRequestId[_campaignId];
        } else if (isVoting) {
            require(withdraw.isActive, "No active request");
            require(
                !withdraw.hasVoted[msg.sender][withdraw.requestId],
                "Already voted on this request"
            );

            withdraw.hasVoted[msg.sender][withdraw.requestId] = true;
            withdraw.totalVotes++;

            if (vote) {
                withdraw.votesInFavor++;
            }
        }
    }

    function checkWithdrawalStatus(
        bytes32 _campaignId
    )
        public
        view
        returns (
            bool isActive,
            string memory metadataHash,
            uint256 totalVotes,
            uint256 votesInFavor,
            uint256 votesAgainst,
            uint256 totalDonors,
            bool hasVoted,
            bool allVoted,
            bool canClaim,
            uint256 requested,
            uint256 currentRequest
        )
    {
        Campaign storage campaign = campaigns[_campaignId];
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];

        uint256 _votesAgainst = withdraw.totalVotes - withdraw.votesInFavor;
        bool allDonorsVoted = withdraw.totalVotes == campaign.donorList.length;

        requested = withdraw.isActive ? withdraw.requestedAmount : 0;
        bool _canClaim = false;
        if (allDonorsVoted && withdraw.totalVotes > 0) {
            _canClaim = withdraw.votesInFavor > (withdraw.totalVotes / 2);
        }

        return (
            withdraw.isActive,
            withdraw.metadataHash,
            withdraw.totalVotes,
            withdraw.votesInFavor,
            _votesAgainst,
            campaign.donorList.length,
            withdraw.hasVoted[msg.sender][withdraw.requestId],
            allDonorsVoted,
            _canClaim,
            requested,
            withdraw.requestId
        );
    }

    function withdrawFundsAfterVote(bytes32 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];

        require(withdraw.isActive, "No active withdrawal request");
        require(
            withdraw.totalVotes == campaign.donorList.length,
            "Not all donors have voted"
        );
        require(
            withdraw.votesInFavor > (withdraw.totalVotes / 2),
            "Not enough votes in favor"
        );

        uint256 amount = withdraw.requestedAmount;
        require(amount > 0, "No funds to withdraw");

        uint256 availableAmount = campaign.amountCollected -
            campaign.claimedAlready;
        require(
            amount <= availableAmount,
            "Requested amount exceeds available funds"
        );

        campaign.claimedAlready = campaign.claimedAlready + amount;
        campaign.canClaimed =
            campaign.amountCollected -
            campaign.claimedAlready;
        withdraw.isActive = false;

        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send funds");

        emit CampaignFundsClaimed(_campaignId, campaign.owner, amount);
    }

    function donorsRefuseEarlyWithdraw(bytes32 _campaignId) public {
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];
        withdraw.isActive = false;
    }

    function claimFunds(bytes32 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only owner can claim funds");
        require(
            campaign.status == CampaignStatus.ACTIVE,
            "Campaign is not active"
        );
        require(
            block.timestamp > campaign.deadline,
            "Campaign has not ended yet"
        );
        require(!campaign.claimed, "Funds already claimed");

        uint256 remainingAmount = campaign.amountCollected -
            campaign.claimedAlready;
        require(remainingAmount > 0, "No funds left to claim");

        campaign.claimed = true;
        campaign.claimedAlready = campaign.amountCollected;
        campaign.canClaimed = 0;

        (bool sent, ) = payable(campaign.owner).call{value: remainingAmount}(
            ""
        );
        require(sent, "Failed to send funds");

        emit CampaignClaimed(_id, campaign.owner, remainingAmount);
    }

    function voteOnFundsClaim(bytes32 _campaignId, bool _vote) public {
        DonorVote[] storage votes = campaignVotes[_campaignId];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].donor == msg.sender) {
                revert("You have already voted");
            }
        }
        votes.push(DonorVote({donor: msg.sender, vote: _vote}));

        emit DonorVoted(_campaignId, msg.sender, _vote);
    }
}
