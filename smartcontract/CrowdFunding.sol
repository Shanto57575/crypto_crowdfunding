// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./SharedState.sol";
import "./CampaignManagement.sol";
import "./DonationManagement.sol";
import "./WithdrawalManagement.sol";

contract CrowdFunding is
    SharedState,
    CampaignManagement,
    DonationManagement,
    WithdrawalManagement
{}
