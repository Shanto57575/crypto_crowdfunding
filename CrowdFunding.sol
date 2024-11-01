// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CrowdFunding {
    // Enums
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

    // Structs
    struct Donation {
        address donor;
        uint256 amount;
        bool isRefunded;
        uint256 timestamp;
    }

    struct DonorInfo {
        address donorAddress;
        uint256 totalDonated;
    }

    // Main storage struct
    struct Campaign {
        bytes32 id;  // Unique ID from frontend
        address owner;
        string metadataHash;
        uint256 target;
        uint256 deadline;
        uint256 amountCollected;
        bool claimed;
        CampaignStatus status;
        string category;
        mapping(address => uint256[]) donorToDonationIndices;
        Donation[] donations;
        DonorInfo[] donorList;
    }

    // View struct (for returning data)
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
    }

    // State Variables
    mapping(bytes32 => Campaign) public campaigns;
    mapping(address => bytes32[]) public ownerToCampaigns;
    mapping(bytes32 => bool) public campaignExists;
    bytes32[] private allCampaignIds; // New array to track all campaign IDs

    // Events
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

    event CampaignClaimed(
        bytes32 indexed campaignId,
        address indexed owner,
        uint256 amountCollected
    );

    // Campaign Management Functions
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
        require(_categoryIndex < 8, "Invalid category index");

        Campaign storage newCampaign = campaigns[_campaignId];

        newCampaign.id = _campaignId;
        newCampaign.owner = msg.sender;
        newCampaign.metadataHash = _metadataHash;
        newCampaign.target = _target;
        newCampaign.deadline = _deadline;
        newCampaign.amountCollected = 0;
        newCampaign.claimed = false;
        newCampaign.status = CampaignStatus.ACTIVE;

        string memory categoryName = getCategoryName(_categoryIndex);
        newCampaign.category = categoryName;

        ownerToCampaigns[msg.sender].push(_campaignId);
        campaignExists[_campaignId] = true;
        allCampaignIds.push(_campaignId); // Add to global campaign tracking

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
        require(msg.sender == campaign.owner, "Only owner can update the campaign");
        require(campaign.status == CampaignStatus.ACTIVE, "Cannot update an inactive campaign");
        require(_newDeadline > block.timestamp, "New deadline must be in the future");
        require(_newTarget > 0, "Target amount must be greater than 0");

        campaign.metadataHash = _newMetadataHash;
        campaign.target = _newTarget;
        campaign.deadline = _newDeadline;

        emit CampaignUpdated(_id, _newMetadataHash, _newTarget, _newDeadline);
    }

    function deleteCampaign(bytes32 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only owner can delete the campaign");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is already inactive");
        require(campaign.amountCollected == 0, "Cannot delete campaign with donations");

        campaign.status = CampaignStatus.INACTIVE;
        emit CampaignDeleted(_id);
    }

    function donateToCampaign(bytes32 _id) public payable {
        Campaign storage campaign = campaigns[_id];
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(block.timestamp < campaign.deadline, "Campaign has ended");
        require(msg.value > 0, "Donation must be greater than 0");
        
        uint256 donationIndex = campaign.donations.length;
        campaign.donations.push(Donation({
            donor: msg.sender,
            amount: msg.value,
            isRefunded: false,
            timestamp: block.timestamp
        }));
        
        campaign.donorToDonationIndices[msg.sender].push(donationIndex);
        campaign.amountCollected += msg.value;
        
        bool donorFound = false;
        for (uint i = 0; i < campaign.donorList.length; i++) {
            if (campaign.donorList[i].donorAddress == msg.sender) {
                campaign.donorList[i].totalDonated += msg.value;
                donorFound = true;
                break;
            }
        }
        
        if (!donorFound) {
            campaign.donorList.push(DonorInfo({
                donorAddress: msg.sender,
                totalDonated: msg.value
            }));
        }
        
        emit DonationReceived(_id, msg.sender, msg.value, donationIndex);
    }

    function refundDonation(bytes32 _campaignId, address _donor, uint256 _donationIndex) public {
        Campaign storage campaign = campaigns[_campaignId];
        require(msg.sender == campaign.owner, "Only owner can refund");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(_donationIndex < campaign.donations.length, "Invalid donation index");
        
        Donation storage donation = campaign.donations[_donationIndex];
        require(donation.donor == _donor, "Donor address doesn't match");
        require(!donation.isRefunded, "Donation already refunded");
        
        uint256 refundAmount = donation.amount;
        donation.isRefunded = true;
        campaign.amountCollected -= refundAmount;
        
        (bool sent, ) = payable(_donor).call{value: refundAmount}("");
        require(sent, "Failed to send refund");
        
        emit DonationRefunded(_campaignId, _donor, refundAmount, _donationIndex);
    }

    function claimFunds(bytes32 _id) public {
        Campaign storage campaign = campaigns[_id];
        require(msg.sender == campaign.owner, "Only owner can claim funds");
        require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
        require(block.timestamp > campaign.deadline, "Campaign has not ended yet");
        require(!campaign.claimed, "Funds already claimed");
        require(campaign.amountCollected > 0, "No funds to claim");
    
        uint256 amount = campaign.amountCollected;
        campaign.claimed = true;
        
        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send funds");
    
        emit CampaignClaimed(_id, campaign.owner, amount);
    }

    // Owner-specific view function
    function getCampaignsByOwner(address _owner) public view returns (CampaignInfo[] memory) {
        CampaignInfo[] memory ownerCampaigns = new CampaignInfo[](ownerToCampaigns[_owner].length);
        
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
                donorList: campaign.donorList
            });
        }
        
        return ownerCampaigns;
    }

    // Public view functions
    function getCampaignDetails(bytes32 _id) public view returns (CampaignInfo memory) {
        Campaign storage campaign = campaigns[_id];
        return CampaignInfo({
            id: campaign.id,
            owner: campaign.owner,
            metadataHash: campaign.metadataHash,
            target: campaign.target,
            deadline: campaign.deadline,
            amountCollected: campaign.amountCollected,
            claimed: campaign.claimed,
            status: campaign.status,
            category: campaign.category,
            donorList: campaign.donorList
        });
    }

    function getAllCampaigns() public view returns (CampaignInfo[] memory) {
        CampaignInfo[] memory allCampaigns = new CampaignInfo[](allCampaignIds.length);
        
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
                donorList: campaign.donorList
            });
        }
        
        return allCampaigns;
    }

    function getActiveCampaigns() public view returns (CampaignInfo[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            if (campaigns[campaignId].status == CampaignStatus.ACTIVE) {
                activeCount++;
            }
        }

        CampaignInfo[] memory activeCampaigns = new CampaignInfo[](activeCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            
            if (campaign.status == CampaignStatus.ACTIVE) {
                activeCampaigns[index] = CampaignInfo({
                    id: campaign.id,
                    owner: campaign.owner,
                    metadataHash: campaign.metadataHash,
                    target: campaign.target,
                    deadline: campaign.deadline,
                    amountCollected: campaign.amountCollected,
                    claimed: campaign.claimed,
                    status: campaign.status,
                    category: campaign.category,
                    donorList: campaign.donorList
                });
                index++;
            }
        }

        return activeCampaigns;
    }

    function getInactiveCampaigns() public view returns (CampaignInfo[] memory) {
        uint256 inactiveCount = 0;
        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            if (campaigns[campaignId].status == CampaignStatus.INACTIVE) {
                inactiveCount++;
            }
        }

        CampaignInfo[] memory inactiveCampaigns = new CampaignInfo[](inactiveCount);
        uint256 index = 0;

        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            
            if (campaign.status == CampaignStatus.INACTIVE) {
                inactiveCampaigns[index] = CampaignInfo({
                    id: campaign.id,
                    owner: campaign.owner,
                    metadataHash: campaign.metadataHash,
                    target: campaign.target,
                    deadline: campaign.deadline,
                    amountCollected: campaign.amountCollected,
                    claimed: campaign.claimed,
                    status: campaign.status,
                    category: campaign.category,
                    donorList: campaign.donorList
                });
                index++;
            }
        }

        return inactiveCampaigns;
    }

    // Helper Function
    function getCategoryName(uint8 _index) internal pure returns (string memory) {
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
