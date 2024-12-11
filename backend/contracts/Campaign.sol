// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.2 <0.9.0;

/**
 * @title Campaign
 * @dev The smart contract for the created Campaign. It handles everything related to a specific Campaign that has been deployed
 */
contract Campaign {
    // state variables; each storage slot is 32 bytes
    address public immutable beneficiary; // 20 bytes
    uint48 public immutable deadline; // 6 bytes
    bool public isActive; // if true, then the Campaign is ongoing, donations are allowed, and is not finalized; else, the Campaign has ended, and no further actions are allowed, 1 byte
    uint256 public immutable fundingGoal; // stored in wei, 32 bytes
    uint256 public totalFunds; // the amount raised in wei, 32 bytes
    bytes32 public immutable name; // 32 bytes
    bytes32 public immutable description; // 32 bytes
    mapping(address => uint256) private donations; // the value is stored in wei, variable storage
    address[] private donors; // array to store donor addresses for refunds, variable storage

    /**
     * @dev Creates the Campaign smart contract
     * @param _beneficiary The wallet address of the beneficiary that is creating this Campaign
     * @param _description The description of this Campaign
     * @param _fundingGoal Funding Goal for the Campaign in cryptocurrency (SepoliaETH)
     * @param _deadline Timestamp of when the Campaign should be fully funded before it becomes inactive
     */
    constructor(
        address _beneficiary,
        bytes32 _name,
        bytes32 _description,
        uint256 _fundingGoal,
        uint48 _deadline
    ) {
        beneficiary = _beneficiary;
        name = _name;
        description = _description;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
        isActive = true; // mark the campaign as active initially
    }

    // events
    // to log donations and notify the beneficiary on the frontend that the donation has been successfully made
    // since frontend is already querying the CampaignCreated events (in CampaignFactory) for the Campaigns that belong to the beneficiary, there is no need to put beneficiary address
    event DonationMade(uint256 amount);

    // to log refunds and notify the donors on the frontend that refunds have been issued to them
    event RefundIssued(address indexed donor, uint256 amount);

    // to log the finalization of campaigns and notify the beneficiary and donors on the frontend of the Campaign's status; also notifies beneficiary of the refunds if the Campaign failed
    event CampaignFinalized(
        address indexed beneficiary,
        bool success, // if success is true, it means that the Campaign met its fundingGoal before its deadline
        uint256 totalFunds
    );

    // to log the meeting of the fundingGoal by the totalFunds and notify the beneficiary on the frontend to release the funds
    event FundingGoalMet();

    // modifiers
    modifier onlyBeneficiary() {
        require(msg.sender == beneficiary, "Beneficiary only");
        _;
    }

    modifier isActiveCampaign() {
        require(isActive, "Inactive Campaign");
        _;
    }

    modifier deadlineExceeded() {
        require(block.timestamp > deadline, "Deadline not exceeded");
        _;
    }

    modifier beforeDeadline() {
        require(block.timestamp <= deadline, "Deadline exceeded");
        _;
    }

    modifier fundingGoalNotMet() {
        require(totalFunds < fundingGoal, "Funding goal met");
        _;
    }

    // functions
    /**
     * @dev Allows donors to donate to the Campaign
     * @dev To be called from the frontend by the donor
     */
    function donate()
        external
        payable
        beforeDeadline
        isActiveCampaign
        fundingGoalNotMet
    {
        address donor = msg.sender;
        uint256 amount = uint256(msg.value);

        // Add donor to array if this is their first donation
        if (donations[donor] == 0) {
            donors.push(donor);
        }

        donations[donor] += amount;

        // store as a variable in memory so that we don't keep reading from the state variable, totalFunds, to save on gas fees
        uint256 newTotalFunds = totalFunds + amount;
        totalFunds = newTotalFunds;

        emit DonationMade(amount);

        // if the Campaign has been fully funded, notify the benefiary to release the funds, so that they incur the gas fees to do so, instead of making the donors unknowingly spend gas fees releasing funds to the beneficiary
        if (newTotalFunds >= fundingGoal) {
            emit FundingGoalMet();
        }
    }

    /**
     * @dev Called when the Campaign's deadline has passed, and also handles the refund to all donors if the fundingGoal is not met by then
     * @dev To be called from the frontend by the beneficiary
     */
    function finalizeCampaign()
        external
        isActiveCampaign
        deadlineExceeded
        onlyBeneficiary
    {
        if (totalFunds >= fundingGoal) {
            releaseFunds();
        } else {
            isActive = false; // Called here and not before if statement because releaseFunds() has isActive = False as well.
            emit CampaignFinalized(beneficiary, false, totalFunds);
        }
    }

    /**
     * @dev Releases the totalFunds to the beneficiary
     * @dev It is called whenever the beneficiary releases the funds (to themselves) from the frontend, only if the totalFunds exceed the fundingGoal, or if they trigger the finalizeCampaign() from the frontend due to the deadline being met
     * @dev It is some sort of a helper function
     */
    function releaseFunds() private {
        uint256 fundsToRelease = totalFunds;
        isActive = false;
        delete totalFunds; // more gas efficient than totalFunds = 0

        // transfer the totalFunds to beneficiary
        payable(beneficiary).transfer(fundsToRelease);

        emit CampaignFinalized(beneficiary, true, fundsToRelease);
    }

    /**
     * @dev Called when the Campaign is finalized but did not meet its fundingGoal
     * @dev Refunds all the donors in batches
     * @dev To be called from the frontend by the beneficiary
     */
    function processRefundsBatch(uint256 start, uint256 end)
        external
        onlyBeneficiary
    {
        for (uint256 i = start; i < end; i++) {
            address donor = donors[i];
            uint256 donationAmount = donations[donor];

            if (donationAmount > 0) {
                delete donations[donor]; // reset the donation amount
                payable(donor).transfer(donationAmount);

                emit RefundIssued(donor, donationAmount);
            }
        }
    }

    /**
     * @dev Get all the donors of this Campaign
     * @dev Likely to be used by the frontend to notify just donors on events such as FundsWithdrawn and CampaignFinalized
     */
    function getDonors() external view returns (address[] memory) {
        return donors;
    }

    /**
     * @dev Get all the Campaign details from its state variables
     */
    function getCampaignDetails()
        external
        view
        returns (
            address campaignBeneficiary,
            bytes32 campaignName,
            bytes32 campaignDescription,
            uint48 campaignDeadline,
            uint256 campaignFundingGoal,
            uint256 campaignTotalFunds,
            bool campaignIsActive
        )
    {
        campaignBeneficiary = beneficiary;
        campaignName = name;
        campaignDescription = description;
        campaignDeadline = deadline;
        campaignFundingGoal = fundingGoal;
        campaignTotalFunds = totalFunds;
        campaignIsActive = isActive;
    }
}
