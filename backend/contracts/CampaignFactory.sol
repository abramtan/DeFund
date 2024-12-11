// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

import "backend/contracts/Campaign.sol";

/**
 * @title CampaignFactory
 * @dev Creates and deploy a new Campaign smart contract whenever any beneficiary creates a campaign
 */
contract CampaignFactory {
    // Creates and deploys a new Campaign smart contract whenever any beneficiary creates a campaign from the frontend

    // events
    // logs the creation of a new Campaign
    event CampaignCreated(
        address indexed campaignAddress // indexed for more efficient event filtering by frontend
    );

    // functions
    /**
     * @dev Allows beneficiaries to create a Campaign with the required details
     * @param _name Name of the Campaign
     * @param _description Description of the Campaign
     * @param _fundingGoal Funding Goal for the Campaign in cryptocurrency (SepoliaETH)
     * @param _deadline Timestamp of when the Campaign should be fully funded before it becomes inactive
     */
    function createCampaign(
        bytes32 _name,
        bytes32 _description,
        uint256 _fundingGoal,
        uint48 _deadline
    ) external {
        // create a new campaign smart contract
        Campaign campaign = new Campaign(
            msg.sender, // the beneficiary
            _name,
            _description,
            _fundingGoal,
            _deadline
        );

        // emit CampaignCreated event to allow the frontend to retrieve the Campaign's address by filtering the logs for the CampaignCreated event
        emit CampaignCreated(address(campaign));
    }
}
