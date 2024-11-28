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
    bool public isActive; // if true, then the Campaign is ongoing, donations are allowed, and is not finalized; else, the Campaign has ended, and no further actions ar allowed
    mapping(address => uint32) public donations;

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
    event DonationMade(address donor, uint32 amount, uint timestamp);
    event FundsWithdrawn(uint32 amount, uint timestamp);
    event RefundIssued(address donor, uint32 amount, uint timestamp);
    event CampaignFinalized(bool success, uint32 totalFunds, uint timestamp); // if success is true, it means that the Campaign met its fundingGoal before its deadline

    // modifiers
    modifier isActiveCampaign() {
        require(block.timestamp <= deadline, "The Camapign's deadline has passed!");
        require(isActive, "The Campaign is not active!");
        _;
    }

    modifier deadlineExceeded() {
        require(block.timestamp > deadline, "The Camapign's deadline has not passed!");
        _;
    }

    // functions
    /** 
     * @dev Allows donors to donate to the Campaign
     */
    function donate() external payable isActiveCampaign {
        address donor = msg.sender;
        uint32 amount = uint32(msg.value);
        donations[donor] += amount;
        
        // store as a variable in memory so that we don't keep reading from the state variable, totalFunds, to save on gas fees
        uint32 newTotalFunds = totalFunds + amount;
        totalFunds = newTotalFunds;
        emit DonationMade(donor, amount, block.timestamp);

        // if the Campaign has been fully funded, then release all the funds to the beneficiary
        if (newTotalFunds >= fundingGoal) {
            releaseFunds();
        }

        // free up unused variables
        delete newTotalFunds;
    }

    /** 
     * @dev Releases the totalFunds to the beneficiary
     * @dev It is called whenever the totalFunds exceed the fundingGoal before or by the deadline
     * @dev It is some sort of a helper function
     */
    function releaseFunds() private {
        isActive = false;
        uint32 fundsToRelease = totalFunds;
        totalFunds = 0;

        // transfer the totalFunds to beneficiary
        (bool success,) = payable(beneficiary).call{value: fundsToRelease}("");
        require(success, "Unable to release funds!");

        emit FundsWithdrawn(fundsToRelease, block.timestamp);
        emit CampaignFinalized(true, fundsToRelease, block.timestamp);

        // free up unused variables
        delete fundsToRelease;
    }

    // TODO: implement the access control to ensure that only the admin can call this function @carina
    /** 
     * @dev Called when the Campaign's deadline has passed, and also handles the refund to all donors if the fundingGoal is not met by then
     * @dev Likely needs to be called from the frontend
     */
    function finalizeCampaign() external isActiveCampaign deadlineExceeded {
        isActive = false;

        if (totalFunds > fundingGoal) {
            releaseFunds();
        } else {
            // refund totalFunds to all donors by calling the refund(0 for each donor
            // TODO @sheng xiang to optimise the refund() function
        }
    }

    /** 
     * @dev Refunds the donor's donation
     * @dev It is some sort of a helper function
     * @param donor The donor wallet to refund the donation back to
     */
    function refund(address donor) private {
        uint32 donationAmount = donations[donor];
        donations[donor] = 0;
        
        // refund to the donor
        payable(donor).transfer(donationAmount);

        emit RefundIssued(donor, donationAmount, block.timestamp);

        // free up unused variables
        delete donationAmount;
    }
}
