// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedState.sol";

contract DonationManagement is SharedState {
    mapping(address => bytes32[]) public userDonatedCampaigns;

    event DonationReceived(
        bytes32 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 donationIndex
    );

    event DonationRefunded(
        bytes32 indexed campaignId,
        address indexed donor,
        uint256 amount,
        uint256 donationIndex
    );

    function donateToCampaign(bytes32 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender != campaign.owner, "Owner Cannot Donate");
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than 0");

        uint256 donationIndex = campaign.donations.length;
        campaign.donations.push(
            Donation({
                donor: msg.sender,
                amount: msg.value,
                isRefunded: false,
                timestamp: block.timestamp
            })
        );

        campaign.donorToDonationIndices[msg.sender].push(donationIndex);
        campaign.amountCollected += msg.value;
        campaign.canClaimed =
            campaign.amountCollected -
            campaign.claimedAlready;

        bool found = false;
        bytes32[] storage userCampaigns = userDonatedCampaigns[msg.sender];
        for (uint i = 0; i < userCampaigns.length; i++) {
            if (userCampaigns[i] == _id) {
                found = true;
                break;
            }
        }

        if (!found) {
            userDonatedCampaigns[msg.sender].push(_id);
        }

        bool donorFound = false;
        for (uint i = 0; i < campaign.donorList.length; i++) {
            if (campaign.donorList[i].donorAddress == msg.sender) {
                campaign.donorList[i].totalDonated += msg.value;
                donorFound = true;
                break;
            }
        }

        if (!donorFound) {
            campaign.donorList.push(
                DonorInfo({donorAddress: msg.sender, totalDonated: msg.value})
            );
        }

        emit DonationReceived(_id, msg.sender, msg.value, donationIndex);
    }

    function getMyDonationTotals() public view returns (DonorTotals memory) {
        bytes32[] memory myCampaignIds = userDonatedCampaigns[msg.sender];
        uint256 totalOverall = 0;
        CampaignDonation[] memory campaignDonations = new CampaignDonation[](
            myCampaignIds.length
        );

        for (uint i = 0; i < myCampaignIds.length; i++) {
            bytes32 campaignId = myCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            uint256[] memory indices = campaign.donorToDonationIndices[
                msg.sender
            ];

            uint256 campaignTotal = 0;

            // Sum up all donations for this campaign
            for (uint j = 0; j < indices.length; j++) {
                Donation storage donation = campaign.donations[indices[j]];
                if (!donation.isRefunded) {
                    campaignTotal += donation.amount;
                }
            }

            // Add to campaign donations array
            campaignDonations[i] = CampaignDonation({
                campaignId: campaignId,
                campaignCategory: campaign.category,
                totalDonated: campaignTotal
            });

            // Add to overall total
            totalOverall += campaignTotal;
        }

        return
            DonorTotals({
                totalDonationsAllCampaigns: totalOverall,
                campaignDonations: campaignDonations
            });
    }

    function getMyDonations() public view returns (MyDonationInfo[] memory) {
        bytes32[] memory myCampaignIds = userDonatedCampaigns[msg.sender];
        uint256 totalDonations = 0;

        // Count total donations
        for (uint i = 0; i < myCampaignIds.length; i++) {
            Campaign storage campaign = campaigns[myCampaignIds[i]];
            totalDonations += campaign
                .donorToDonationIndices[msg.sender]
                .length;
        }

        MyDonationInfo[] memory myDonations = new MyDonationInfo[](
            totalDonations
        );
        uint256 currentIndex = 0;

        // Get donations for each campaign
        for (uint i = 0; i < myCampaignIds.length; i++) {
            bytes32 campaignId = myCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            uint256[] memory indices = campaign.donorToDonationIndices[
                msg.sender
            ];

            for (uint j = 0; j < indices.length; j++) {
                Donation storage donation = campaign.donations[indices[j]];
                myDonations[currentIndex] = MyDonationInfo({
                    campaignId: campaignId,
                    amount: donation.amount,
                    timestamp: donation.timestamp,
                    isRefunded: donation.isRefunded,
                    category: campaign.category
                });
                currentIndex++;
            }
        }
        return myDonations;
    }
}
