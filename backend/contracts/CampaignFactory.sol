// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract CampaignFactory {
    // Creates and deploys a new Campaign smart contract whenever any beneficiary creates a campaign from the frontend

    // state variables
    mapping(uint => address) public deployedContracts; // all the deployed and active Campaigns

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

        // create a new campaign contract
    }

    // returns the list of active deployed Campaigns to the frontend
    function getDeployedContracts() public {
        
    }

    function getDeployedCampaigns() public {}
}