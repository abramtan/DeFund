// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

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
        address indexed campaignAddress, // indexed for more efficient event filtering by frontend
        uint32 fundingGoal,
        uint256 deadline
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
        string calldata _name,
        string calldata _description,
        uint32 _fundingGoal,
        uint256 _deadline
    ) external {
        // create a new campaign smart contract
        Campaign campaign = new Campaign(
            msg.sender, // the beneficiary
            msg.sender,
            _name,
            _description,
            _fundingGoal,
            _deadline
        );

        // emit CampaignCreated event to allow the frontend to retrieve the Campaign's address by filtering the logs for the CampaignCreated event
        emit CampaignCreated(address(campaign), _fundingGoal, _deadline);
    }

    // TODO: consider adding some functions to let users independently check campaign status here; since we are not storing the Campaign addresses right here in CampaignFactory, there is a risk of partial centralization, as users need to trust the frontend to provide the correct list of deployed active contracts

    // /**
    //  * @dev Returns the list of active deployed Campaigns to the frontend
    //  */
    // function getDeployedCampaigns() external view returns (address[] memory) {
    //     return deployedCampaigns;
    // }
}
