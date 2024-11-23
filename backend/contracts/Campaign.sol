// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

contract Campaign {
    // The smart contract for each created Campaign. It handles everything related to a specic Campaign that has been deployed

    // state variables
    uint public campaignId;
    address public beneficiary;
    string public name;
    string public purpose;
    string public description;
    uint public fundingGoal;
    uint public deadline;
    uint public totalFunds; // the amount raised
    bool public isActive; // if true, then the Campaign is ongoing, donations are allowed, and is not finalized; else, the Campaign has ended, and no further actions ar allowed
    mapping(address => uint) public donations;

    constructor(
        uint _campaignId,
        address _beneficiary,
        string memory _name,
        string memory _purpose,
        string memory _description,
        uint _fundingGoal,
        uint _deadline
    ) {
        campaignId = _campaignId;
        beneficiary = _beneficiary;
        name = _name;
        purpose = _purpose;
        description = _description;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
        isActive = true; // Mark the campaign as active initially
    }
    
    // events
    event DonationMade(address donor, uint amount, uint timestamp);
    event FundsWithdrawn(uint amount, uint timestamp);
    event RefundIssued(address donor, uint amount, uint timestamp);
    event CampaignFinalized(bool success, uint totalFunds, uint timestamp); // if success is true, it means that the Campaign met its fundingGoal before its deadline

    // functions
    // allows donors to donate to the Campaign
    function donate() public {}

    // releases the totalFunds to the beneficiary; called whenever the totalFunds exceed fundingGoal before or by the deadline
    // some sort of a helper function
    function releaseFunds() private {}

    // called when the Campaign's deadline has passed
    // it also handles he refund to all donors if the fundingGoal is not met
    // likely needs to be called from the frontend
    function finalizeCampaign() public {}

    // refunds the donor's donation
    // some sort of a helper function
    function refund(address donor) private {}
}