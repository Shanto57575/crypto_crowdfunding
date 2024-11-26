// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CampaignStructs.sol";

contract SharedState is CampaignStructs {
    mapping(bytes32 => Campaign) public campaigns;
}
