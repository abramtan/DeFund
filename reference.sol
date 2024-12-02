// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/** 
 * @title Campaign
 * @dev The smart contract for the created Campaign. It handles everything related to a specific Campaign that has been deployed
 */
contract Campaign {
    // state variables
    address public immutable beneficiary;
    string public name;
    string public description;
    uint public immutable deadline;
    uint32 public immutable fundingGoal;
    uint32 public totalFunds; // the amount raised
    bool public isActive; // if true, then the Campaign is ongoing, donations are allowed, and is not finalized; else, the Campaign has ended, and no further actions are allowed
    mapping(address => uint32) public donations;
    address[] public donors; // array to store donor addresses for refunds if needed.

    /** 
     * @dev Creates the Campaign smart contract
     * @param _beneficiary The wallet address of the beneficiary that is creating this Campaign
     * @param _description The description of this Campaign
     * @param _fundingGoal Funding Goal for the Campaign in cryptocurrency (SepoliaETH)
     * @param _deadline Timestamp of when the Campaign should be fully funded before it becomes inactive
     */
    constructor(
        address _beneficiary,
        string memory _name,
        string memory _description,
        uint32 _fundingGoal,
        uint _deadline
    ) {
        beneficiary = _beneficiary;
        name = _name;
        description = _description;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
        isActive = true; // mark the campaign as active initially
    }
    
    // events
    event DonationMade(
        address indexed donor, 
        uint32 amount
    );
    event FundsWithdrawn(
        address indexed beneficiary,
        uint32 amount
    );
    event RefundIssued(
        address indexed donor, 
        uint32 amount
    );
    event CampaignFinalized(
        address indexed campaignAddress, // to help the frontend identify the campaigns that have been finalized and those that have not when querying emitted events
        bool success, 
        uint32 totalFunds
    ); // if success is true, it means that the Campaign met its fundingGoal before its deadline

    // modifiers
    modifier isActiveCampaign() {
        require(isActive, "The Campaign is not active!");
        _;
    }

    modifier deadlineExceeded() {
        require(block.timestamp > deadline, "The Campaign's deadline has not passed!");
        _;
    }

    // functions

    // TODO: implement some kind of rate limiting here as donate() is vulnerable to DDoS attacks

    /** 
     * @dev Allows donors to donate to the Campaign
     */
    function donate() external payable isActiveCampaign {
        address donor = msg.sender;
        uint32 amount = uint32(msg.value);

        // Add donor to array if this is their first donation
        if (donations[donor] == 0) {
            donors.push(donor);
        }

        donations[donor] += amount;
        
        // store as a variable in memory so that we don't keep reading from the state variable, totalFunds, to save on gas fees
        uint32 newTotalFunds = totalFunds + amount;
        totalFunds = newTotalFunds;
        emit DonationMade(
            donor, 
            amount
        );

        // if the Campaign has been fully funded, then release all the funds to the beneficiary
        if (newTotalFunds >= fundingGoal) {
            releaseFunds();
        }
    }

    /** 
     * @dev Releases the totalFunds to the beneficiary
     * @dev It is called whenever the totalFunds exceed the fundingGoal before or by the deadline
     * @dev It is some sort of a helper function
     */
    function releaseFunds() private {
        uint32 fundsToRelease = totalFunds;
        delete totalFunds; // more gas efficient than totalFunds = 0
        isActive = false;

        // transfer the totalFunds to beneficiary
        (bool success,) = payable(beneficiary).call{value: fundsToRelease}("");
        require(success, "Unable to release funds!");

        emit FundsWithdrawn(
            beneficiary,
            fundsToRelease
        );
        emit CampaignFinalized(
            address(this), 
            true, 
            fundsToRelease
        );
    }

    // TODO: implement the access control to ensure that only the admin can call this function @carina
    /** 
     * @dev Called when the Campaign's deadline has passed, and also handles the refund to all donors if the fundingGoal is not met by then
     * @dev Likely needs to be called from the frontend
     */
    function finalizeCampaign() external isActiveCampaign deadlineExceeded {
        isActive = false; // Mark the campaign as inactive so no further donations can be made

        if (totalFunds >= fundingGoal) { // If the funding goal was met, release the funds
            releaseFunds();
        } else {
            // Refund totalFunds to all donors by calling the refund function for each donor
            for (uint i = 0; i < donors.length; i++) {
                address donor = donors[i];
                refund(donor);
            }

            emit CampaignFinalized(
                address(this), 
                false, 
                totalFunds
            );
        }
    }

    /** 
     * @dev Refunds the donor's donation
     * @dev It is some sort of a helper function
     * @param donor The donor wallet to refund the donation back to
     */
    function refund(address donor) private {
        uint32 donationAmount = donations[donor];
        delete donations[donor]; // more gas efficient than donations[donor] = 0
        
        // refund to the donor
        payable(donor).transfer(donationAmount);

        emit RefundIssued(
            donor, 
            donationAmount
        );
    }
}

/**
 * Summary of Changes:
 * 
 * 1. **New State Variable Added**: `address[] public donors` was added to track donor addresses. This helps to maintain a list of all donors to facilitate refunds when the campaign fails.
 * 
 * 2. **Updated `donate()` Function**:
 *    - Added logic to push the donor's address to the `donors` array if this is their **first donation** (i.e., if `donations[donor] == 0`).
 *    - This ensures that every donor is recorded, allowing refunds to be processed correctly.
 * 
 * 3. **Modified `finalizeCampaign()` Function**:
 *    - Updated to include logic for **looping through the `donors` array** and calling the `refund()` function for each donor if the campaign goal was **not met**.
 *    - Marked `isActive = false` to stop further donations.
 * 
 * **Before**: The `finalizeCampaign()` function attempted to handle refunds but did not have a mechanism to loop through donors because it lacked a list of addresses.
 * **After**: Now, it loops through the `donors` array to refund all participants individually.
 */
