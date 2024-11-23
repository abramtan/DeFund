// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "backend/contracts/Campaign.sol";

contract CampaignFactory {
    // Creates and deploys a new Campaign smart contract whenever any beneficiary creates a campaign from the frontend

    // state variables
    mapping(uint256 => address) public deployedCampaigns; // all the deployed and active Campaigns
    uint private numOfCampaigns;
    
    // events
    // logs the creation of a new Campaign
    event CampaignCreated(
        address campaignAddress,
        address beneficiary,
        string name,
        uint fundingGoal,
        uint deadline
    );

    // functions
    // allows beneficiaries to create a Campaign with the required details
    function createCampaign(
        string memory _name,
        string memory _purpose,
        string memory _description,
        uint _fundingGoal,
        uint _deadline
    ) public {
        require(_fundingGoal > 0, "Funding goal must be greater than zero!");
        require(_deadline > block.timestamp, "Deadline must be in the future!");
        address beneficiary = msg.sender;

        // create a new campaign smart contract
        Campaign campaign = new Campaign(
            numOfCampaigns,
            beneficiary,
            _name,
            _purpose,
            _description,
            _fundingGoal,
            _deadline
        );

        // add campaign to deployed Campaigns
        address campaignAddress = address(campaign);
        deployedCampaigns[numOfCampaigns] = campaignAddress;
        numOfCampaigns++;

        emit CampaignCreated(campaignAddress, beneficiary, _name, _fundingGoal, _deadline);
    }

    // returns the list of active deployed Campaigns to the frontend
    function getDeployedCampaigns() public view returns (address[] memory) {
        address[] memory campaigns = new address[](numOfCampaigns);
        for (uint i = 0; i < numOfCampaigns; i++) {
            campaigns[i] = deployedCampaigns[i];
        }

        return campaigns;
    }
}