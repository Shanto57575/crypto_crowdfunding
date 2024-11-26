// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedState.sol";

contract CampaignManagement is SharedState {
    mapping(address => bytes32[]) public ownerToCampaigns;
    mapping(bytes32 => bool) public campaignExists;
    bytes32[] private allCampaignIds;

    event CampaignCreated(
        bytes32 indexed id,
        address indexed owner,
        string metadataHash,
        uint256 target,
        uint256 deadline,
        string category
    );
    event CampaignUpdated(
        bytes32 indexed id,
        string metadataHash,
        uint256 newTarget,
        uint256 newDeadline
    );

    event CampaignDeleted(bytes32 indexed id);

    function createCampaign(
        bytes32 _campaignId,
        string memory _metadataHash,
        uint256 _target,
        uint256 _deadline,
        uint8 _categoryIndex
    ) public returns (bytes32) {
        require(!campaignExists[_campaignId], "Campaign ID already exists");
        require(_deadline > block.timestamp, "Deadline must be in the future");
        require(_target > 0, "Target amount must be greater than 0");
        Campaign storage newCampaign = campaigns[_campaignId];

        newCampaign.id = _campaignId;
        newCampaign.owner = msg.sender;
        newCampaign.metadataHash = _metadataHash;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.claimedAlready = 0;
        newCampaign.canClaimed = 0;
        newCampaign.claimed = false;
        newCampaign.status = CampaignStatus.ACTIVE;
        string memory categoryName = getCategoryName(_categoryIndex);
        newCampaign.category = categoryName;
        ownerToCampaigns[msg.sender].push(_campaignId);
        campaignExists[_campaignId] = true;
        allCampaignIds.push(_campaignId);
        emit CampaignCreated(
            _campaignId,
            msg.sender,
            _metadataHash,
            _target,
            _deadline,
            categoryName
        );
        return _campaignId;
    }

    function updateCampaign(
        bytes32 _id,
        string memory _newMetadataHash,
        uint256 _newTarget,
        uint256 _newDeadline
    ) public {
        Campaign storage campaign = campaigns[_id];
        require(
            msg.sender == campaign.owner,
            "Only owner can update the campaign"
        );
        require(
            campaign.status == CampaignStatus.ACTIVE,
            "Cannot update an inactive campaign"
        );
        require(
            _newDeadline > block.timestamp,
            "New deadline must be in the future"
        );
        require(_newTarget > 0, "Target amount must be greater than 0");
        campaign.metadataHash = _newMetadataHash;
        campaign.target = _newTarget;
        campaign.deadline = _newDeadline;
        emit CampaignUpdated(_id, _newMetadataHash, _newTarget, _newDeadline);
    }

    function deleteCampaign(bytes32 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(
            msg.sender == campaign.owner,
            "Only owner can delete the campaign"
        );
        require(
            campaign.status == CampaignStatus.ACTIVE,
            "Campaign is already inactive"
        );
        require(
            campaign.amountCollected == 0,
            "Cannot delete campaign with donations"
        );
        campaign.status = CampaignStatus.INACTIVE;
        emit CampaignDeleted(_id);
    }

    function getCampaignsByOwner(
        address _owner
    ) public view returns (CampaignInfo[] memory) {
        CampaignInfo[] memory ownerCampaigns = new CampaignInfo[](
            ownerToCampaigns[_owner].length
        );

        for (uint256 i = 0; i < ownerToCampaigns[_owner].length; i++) {
            bytes32 campaignId = ownerToCampaigns[_owner][i];
            Campaign storage campaign = campaigns[campaignId];

            ownerCampaigns[i] = CampaignInfo({
                id: campaign.id,
                owner: campaign.owner,
                metadataHash: campaign.metadataHash,
                target: campaign.target,
                deadline: campaign.deadline,
                amountCollected: campaign.amountCollected,
                claimed: campaign.claimed,
                status: campaign.status,
                category: campaign.category,
                donorList: campaign.donorList,
                canClaimed: campaign.canClaimed
            });
        }
        return ownerCampaigns;
    }

    function getCampaignDetails(
        bytes32 _id
    ) public view returns (CampaignInfo memory) {
        Campaign storage campaign = campaigns[_id];

        return
            CampaignInfo({
                id: campaign.id,
                owner: campaign.owner,
                metadataHash: campaign.metadataHash,
                target: campaign.target,
                deadline: campaign.deadline,
                amountCollected: campaign.amountCollected,
                claimed: campaign.claimed,
                status: campaign.status,
                category: campaign.category,
                donorList: campaign.donorList,
                canClaimed: campaign.canClaimed
            });
    }

    function getAllCampaigns() public view returns (CampaignInfo[] memory) {
        CampaignInfo[] memory allCampaigns = new CampaignInfo[](
            allCampaignIds.length
        );

        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];

            allCampaigns[i] = CampaignInfo({
                id: campaign.id,
                owner: campaign.owner,
                metadataHash: campaign.metadataHash,
                target: campaign.target,
                deadline: campaign.deadline,
                amountCollected: campaign.amountCollected,
                claimed: campaign.claimed,
                status: campaign.status,
                category: campaign.category,
                donorList: campaign.donorList,
                canClaimed: campaign.canClaimed
            });
        }
        return allCampaigns;
    }

    function getCampaignsByCategory(
        uint8 _index
    ) public view returns (CampaignInfo[] memory) {
        string memory categoryName = getCategoryName(_index);
        uint256 count = 0;

        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            if (
                keccak256(bytes(campaign.category)) ==
                keccak256(bytes(categoryName))
            ) {
                count++;
            }
        }

        CampaignInfo[] memory filteredCampaigns = new CampaignInfo[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];

            if (
                keccak256(bytes(campaign.category)) ==
                keccak256(bytes(categoryName))
            ) {
                filteredCampaigns[index] = CampaignInfo({
                    id: campaign.id,
                    owner: campaign.owner,
                    metadataHash: campaign.metadataHash,
                    target: campaign.target,
                    deadline: campaign.deadline,
                    amountCollected: campaign.amountCollected,
                    claimed: campaign.claimed,
                    status: campaign.status,
                    category: campaign.category,
                    donorList: campaign.donorList,
                    canClaimed: campaign.canClaimed
                });
                index++;
            }
        }
        return filteredCampaigns;
    }

    function getCategoryName(
        uint8 _index
    ) internal pure returns (string memory) {
        if (_index == 0) return "Medical Treatment";
        else if (_index == 1) return "Disaster Relief";
        else if (_index == 2) return "Education";
        else if (_index == 3) return "Startup Business";
        else if (_index == 4) return "Creative Projects";
        else if (_index == 5) return "Community Service";
        else if (_index == 6) return "Technology";
        else if (_index == 7) return "Environmental";
        else revert("Invalid category index");
    }
}
