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


// Add this struct at the top of contract
  struct EarlyWithdraw {
        string metadataHash;      
        uint256 totalVotes;       
        uint256 votesInFavor;     
        bool isActive;            
        uint256 requestedAmount;  
        uint256 requestId;        // Added: Track request number
        mapping(address => mapping(uint256 => bool)) hasVoted;  // Modified: Track votes per request
    }
    // Structs
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

    // Main storage struct
   struct Campaign {
    bytes32 id;
    address owner;
    string metadataHash;
    uint256 target;
    uint256 deadline;
    uint256 claimedAlready;
    uint256 canClaimed;        // It's here in the main struct
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
    uint256 canClaimed;  // Add this line
}
    // New struct for donation details
    struct MyDonationInfo {
        bytes32 campaignId;
        uint256 amount;
        uint256 timestamp;
        bool isRefunded;
        string category;
    }

    // State Variables
    mapping(bytes32 => Campaign) public campaigns;
    mapping(address => bytes32[]) public ownerToCampaigns;
    mapping(bytes32 => bool) public campaignExists;
    bytes32[] private allCampaignIds;
     mapping(bytes32 => DonorVote[]) public campaignVotes;
    mapping(bytes32 => bool) public campaignFundsClaimed;
mapping(bytes32 => EarlyWithdraw) public earlyWithdraws;
    mapping(bytes32 => uint256) public currentRequestId;


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
  // New event for funds claim
    event CampaignFundsClaimed(bytes32 indexed campaignId, address indexed owner, uint256 amount);
    // New event for donor voting
    event DonorVoted(bytes32 indexed campaignId, address indexed donor, bool vote);
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
function getMyDonationTotals() public view returns (DonorTotals memory) {
    bytes32[] memory myCampaignIds = userDonatedCampaigns[msg.sender];
    uint256 totalOverall = 0;
    CampaignDonation[] memory campaignDonations = new CampaignDonation[](myCampaignIds.length);
   
    // Calculate totals for each campaign
    for(uint i = 0; i < myCampaignIds.length; i++) {
        bytes32 campaignId = myCampaignIds[i];
        Campaign storage campaign = campaigns[campaignId];
        uint256[] memory indices = campaign.donorToDonationIndices[msg.sender];
       
        uint256 campaignTotal = 0;
       
        // Sum up all donations for this campaign
        for(uint j = 0; j < indices.length; j++) {
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
   
    return DonorTotals({
        totalDonationsAllCampaigns: totalOverall,
        campaignDonations: campaignDonations
    });
}
 // Add this mapping to store which campaigns a user has donated to
mapping(address => bytes32[]) public userDonatedCampaigns;

// Modify donateToCampaign function to track user's donated campaigns
function donateToCampaign(bytes32 _id) public payable {
    Campaign storage campaign = campaigns[_id];
    require(msg.sender != campaign.owner, "Owner Cannot Donate");
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
    // Add this line to update canClaimed when receiving donations
    campaign.canClaimed = campaign.amountCollected - campaign.claimedAlready;
    
    // Rest of the function remains the same...
    bool found = false;
    bytes32[] storage userCampaigns = userDonatedCampaigns[msg.sender];
    for(uint i = 0; i < userCampaigns.length; i++) {
        if(userCampaigns[i] == _id) {
            found = true;
            break;
        }
    }
    if(!found) {
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
        campaign.donorList.push(DonorInfo({
            donorAddress: msg.sender,
            totalDonated: msg.value
        }));
    }
   
    emit DonationReceived(_id, msg.sender, msg.value, donationIndex);
}
 function earlyWithdrawalRequest(
        bytes32 _campaignId,
        string memory _metadataHash,
        bool isVoting,
        uint256 _requestedAmount,
        bool vote
    ) public {
        Campaign storage campaign = campaigns[_campaignId];
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];

        // If campaign owner is creating request
        if (msg.sender == campaign.owner && !isVoting) {
            require(!withdraw.isActive, "Previous request still active");
            
            // Increment request ID for new request
            currentRequestId[_campaignId]++;
            
            withdraw.metadataHash = _metadataHash;
            withdraw.isActive = true;
            withdraw.totalVotes = 0;
            withdraw.votesInFavor = 0;
            withdraw.requestedAmount = _requestedAmount;
            withdraw.requestId = currentRequestId[_campaignId];
        }
        // If donor is voting
        else if (isVoting) {
            require(withdraw.isActive, "No active request");
            require(!withdraw.hasVoted[msg.sender][withdraw.requestId], "Already voted on this request");
            
            withdraw.hasVoted[msg.sender][withdraw.requestId] = true;
            withdraw.totalVotes++;
            
            if (vote) {
                withdraw.votesInFavor++;
            }
        }
    }

    // Modified check status function
    function checkWithdrawalStatus(bytes32 _campaignId) public view returns (
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
    ) {
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

    // Modified withdraw funds function
    function withdrawFundsAfterVote(bytes32 _campaignId) public {
        Campaign storage campaign = campaigns[_campaignId];
        EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];
        
        require(withdraw.isActive, "No active withdrawal request");
        require(withdraw.totalVotes == campaign.donorList.length, "Not all donors have voted");
        require(withdraw.votesInFavor > (withdraw.totalVotes / 2), "Not enough votes in favor");
        
        uint256 amount = withdraw.requestedAmount;
        require(amount > 0, "No funds to withdraw");
        
        uint256 availableAmount = campaign.amountCollected - campaign.claimedAlready;
        require(amount <= availableAmount, "Requested amount exceeds available funds");

        campaign.claimedAlready = campaign.claimedAlready + amount;
        campaign.canClaimed = campaign.amountCollected - campaign.claimedAlready;
        withdraw.isActive = false;
        
        (bool sent, ) = payable(campaign.owner).call{value: amount}("");
        require(sent, "Failed to send funds");
        
        emit CampaignFundsClaimed(_campaignId, campaign.owner, amount);
    }

function donorsRefuseEarlyWithdraw(bytes32 _campaignId) public {
    EarlyWithdraw storage withdraw = earlyWithdraws[_campaignId];
    withdraw.isActive = false;
}
 

// New getMyDonations function
function getMyDonations() public view returns (MyDonationInfo[] memory) {
    bytes32[] memory myCampaignIds = userDonatedCampaigns[msg.sender];
    uint256 totalDonations = 0;
   
    // Count total donations
    for(uint i = 0; i < myCampaignIds.length; i++) {
        Campaign storage campaign = campaigns[myCampaignIds[i]];
        totalDonations += campaign.donorToDonationIndices[msg.sender].length;
    }
   
    MyDonationInfo[] memory myDonations = new MyDonationInfo[](totalDonations);
    uint256 currentIndex = 0;
   
    // Get donations for each campaign
    for(uint i = 0; i < myCampaignIds.length; i++) {
        bytes32 campaignId = myCampaignIds[i];
        Campaign storage campaign = campaigns[campaignId];
        uint256[] memory indices = campaign.donorToDonationIndices[msg.sender];
       
        for(uint j = 0; j < indices.length; j++) {
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
   
    // Updated claimFunds function
function claimFunds(bytes32 _id) public {
    Campaign storage campaign = campaigns[_id];
    require(msg.sender == campaign.owner, "Only owner can claim funds");
    require(campaign.status == CampaignStatus.ACTIVE, "Campaign is not active");
    require(block.timestamp > campaign.deadline, "Campaign has not ended yet");
    require(!campaign.claimed, "Funds already claimed");
    
    // Calculate remaining claimable amount
    uint256 remainingAmount = campaign.amountCollected - campaign.claimedAlready;
    require(remainingAmount > 0, "No funds left to claim");

    campaign.claimed = true;
    campaign.claimedAlready = campaign.amountCollected; // Update final claimed amount
    campaign.canClaimed = 0; // No more funds can be claimed
    
    (bool sent, ) = payable(campaign.owner).call{value: remainingAmount}("");
    require(sent, "Failed to send funds");

    emit CampaignClaimed(_id, campaign.owner, remainingAmount);
}
    // New function for donors to vote on funds claim
    function voteOnFundsClaim(bytes32 _campaignId, bool _vote) public {
   
        // Check if donor has already voted
        DonorVote[] storage votes = campaignVotes[_campaignId];
        for (uint256 i = 0; i < votes.length; i++) {
            if (votes[i].donor == msg.sender) {
                revert("You have already voted");
            }
        }
        // Add the new vote
        votes.push(DonorVote({
            donor: msg.sender,
            vote: _vote
        }));

  // Emit event
        emit DonorVoted(_campaignId, msg.sender, _vote);
    }
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
    donorList: campaign.donorList,
    canClaimed: campaign.canClaimed  // Add this line
            });
        }
       
        return ownerCampaigns;
    }

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
    donorList: campaign.donorList,
    canClaimed: campaign.canClaimed  // Add this line
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
    donorList: campaign.donorList,
    canClaimed: campaign.canClaimed  // Add this line
            });
        }
       
        return allCampaigns;
    }

    function getCampaignsByCategory(uint8 _index) public view returns (CampaignInfo[] memory) {
        string memory categoryName = getCategoryName(_index);
        uint256 count = 0;

        // Count the number of campaigns in the specified category
        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
            if (keccak256(bytes(campaign.category)) == keccak256(bytes(categoryName))) {
                count++;
            }
        }
        // Create a new array for campaigns that match the category
        CampaignInfo[] memory filteredCampaigns = new CampaignInfo[](count);
        uint256 index = 0;
        // Populate the array with matching campaigns
        for (uint256 i = 0; i < allCampaignIds.length; i++) {
            bytes32 campaignId = allCampaignIds[i];
            Campaign storage campaign = campaigns[campaignId];
           
            if (keccak256(bytes(campaign.category)) == keccak256(bytes(categoryName))) {
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
    canClaimed: campaign.canClaimed  // Add this line
                });
                index++;
            }
        }
    return filteredCampaigns;
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
















