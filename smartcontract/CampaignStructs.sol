// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CampaignStructs {
    enum CampaignStatus {
        ACTIVE,
        INACTIVE
    }

    enum CampaignCategory {
        MEDICAL_TREATMENT,
        DISASTER_RELIEF,
        EDUCATION,
        STARTUP_BUSINESS,
        CREATIVE_PROJECTS,
        COMMUNITY_SERVICE,
        TECHNOLOGY,
        ENVIRONMENTAL
    }

    struct EarlyWithdraw {
        string metadataHash;
        uint256 totalVotes;
        uint256 votesInFavor;
        bool isActive;
        uint256 requestedAmount;
        uint256 requestId;
        mapping(address => mapping(uint256 => bool)) hasVoted;
    }

    struct Donation {
        address donor;
        uint256 amount;
        bool isRefunded;
        uint256 timestamp;
    }

    struct CampaignDonation {
        bytes32 campaignId;
        string campaignCategory;
        uint256 totalDonated;
    }

    struct DonorVote {
        address donor;
        bool vote;
    }

    struct DonorTotals {
        uint256 totalDonationsAllCampaigns;
        CampaignDonation[] campaignDonations;
    }

    struct DonorInfo {
        address donorAddress;
        uint256 totalDonated;
    }

    struct Campaign {
        bytes32 id;
        address owner;
        string metadataHash;
        uint256 target;
        uint256 deadline;
        uint256 claimedAlready;
        uint256 canClaimed;
        uint256 amountCollected;
        bool claimed;
        CampaignStatus status;
        string category;
        mapping(address => uint256[]) donorToDonationIndices;
        Donation[] donations;
        DonorInfo[] donorList;
    }

    struct CampaignInfo {
        bytes32 id;
        address owner;
        string metadataHash;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool claimed;
        CampaignStatus status;
        string category;
        DonorInfo[] donorList;
        uint256 canClaimed;
    }

    struct MyDonationInfo {
        bytes32 campaignId;
        uint256 amount;
        uint256 timestamp;
        bool isRefunded;
        string category;
    }
}
