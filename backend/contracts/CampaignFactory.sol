// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import "backend/contracts/Campaign.sol";

/** 
 * @title CampaignFactory
 * @dev Creates and deploy a new Campaign smart contract whenever any beneficiary creates a campaign
 */
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
    /** 
     * @dev Allows beneficiaries to create a Campaign with the required details
     * @param _name Name of the Campaign
     * @param _purpose Purpose of the Campaign
     * @param _description Description of the Campaign
     * @param _fundingGoal Funding Goal for the Campaign in cryptocurrency (SepoliaETH)
     * @param _deadline Timestamp of when the Campaign should be fully funded before it becomes inactive
     */
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

    /** 
     * @dev Returns the list of active deployed Campaigns to the frontend
     */
    function getDeployedCampaigns() external view returns (address[] memory) {
        return deployedCampaigns;
    }
}