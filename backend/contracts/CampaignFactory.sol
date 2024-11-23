// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "backend/contracts/Campaign.sol";

contract CampaignFactory {
    // Creates and deploys a new Campaign smart contract whenever any beneficiary creates a campaign from the frontend

    // state variables
    address[] public deployedCampaigns; // all the deployed and active Campaigns
    
    // events
    // logs the creation of a new Campaign
    event CampaignCreated(
        address campaignAddress,
        address beneficiary,
        uint32 fundingGoal,
        uint deadline
    );

    // functions
    // allows beneficiaries to create a Campaign with the required details
    function createCampaign(
        string memory _name,
        string memory _purpose,
        string memory _description,
        uint32 _fundingGoal,
        uint _deadline
    ) external {
        address beneficiary = msg.sender;

        // create a new campaign smart contract
        Campaign campaign = new Campaign(
            deployedCampaigns.length,
            beneficiary,
            _name,
            _purpose,
            _description,
            _fundingGoal,
            _deadline
        );

        // add campaign to deployed Campaigns
        address campaignAddress = address(campaign);
        deployedCampaigns.push(campaignAddress);

        emit CampaignCreated(campaignAddress, beneficiary, _fundingGoal, _deadline);
    }

    // returns the list of active deployed Campaigns to the frontend
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}