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
    uint256 public immutable deadline;
    uint32 public immutable fundingGoal;
    uint32 public totalFunds; // the amount raised
    bool public isActive; // if true, then the Campaign is ongoing, donations are allowed, and is not finalized; else, the Campaign has ended, and no further actions ar allowed
    mapping(address => uint32) private donations;
    address[] private donors; // array to store donor addresses for refunds
    address public admin;

    /**
     * @dev Creates the Campaign smart contract
     * @param _beneficiary The wallet address of the beneficiary that is creating this Campaign
     * @param _description The description of this Campaign
     * @param _fundingGoal Funding Goal for the Campaign in cryptocurrency (SepoliaETH)
     * @param _deadline Timestamp of when the Campaign should be fully funded before it becomes inactive
     */

    constructor(
        address _beneficiary,
        address _admin, // Admin address passed at deployment, @frontend to validate that _admin is not 0 when set
        string memory _name,
        string memory _description,
        uint32 _fundingGoal,
        uint256 _deadline
    ) {
        beneficiary = _beneficiary;
        admin = _admin;
        name = _name;
        description = _description;
        fundingGoal = _fundingGoal;
        deadline = _deadline;
        isActive = true; // mark the campaign as active initially
    }

    // events
    // to log donations and notify the beneficiary and the donor on the frontend that the donation has been successfully made
    event DonationMade(
        address indexed campaignAddress,
        address indexed beneficiary,
        uint32 amount
    );

    // to log fund withdrawals and notify the beneficiary and donors on the frontend that the fudns have been withdrawn from the Campaign
    event FundsWithdrawn(
        address indexed campaignAddress,
        address indexed beneficiary,
        uint32 amount
    );

    // to log refunds and notify the donors on the frontend that refunds have been issued to them
    event RefundIssued(
        address indexed campaignAddress,
        address indexed donor,
        uint32 amount
    );

    // to log the finalization of campaigns and notify the beneficiary and donors on the frontend of the Campaign's status; also notifies beneficiary of the refunds if the Campaign failed
    event CampaignFinalized(
        address indexed campaignAddress, // to help the frontend identify the campaigns that have been finalized and those that have not when querying emitted events
        address indexed beneficiary,
        bool success, // if success is true, it means that the Campaign met its fundingGoal before its deadline
        uint32 totalFunds
    );

    // modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access restricted to admin!");
        _;
    }
    modifier isActiveCampaign() {
        require(isActive, "The Campaign is not active!");
        _;
    }

    modifier deadlineExceeded() {
        require(
            block.timestamp > deadline,
            "The Campaign's deadline has not passed!"
        );
        _;
    }

    // functions
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

        emit DonationMade(address(this), beneficiary, amount);

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
        (bool success, ) = payable(beneficiary).call{value: fundsToRelease}("");
        require(success, "Unable to release funds!");

        emit FundsWithdrawn(address(this), beneficiary, fundsToRelease);
        emit CampaignFinalized(
            address(this),
            beneficiary,
            true,
            fundsToRelease
        );
    }

    // TODO: implement the access control to ensure that only the admin can call this function @carina
    /**
     * @dev Called when the Campaign's deadline has passed, and also handles the refund to all donors if the fundingGoal is not met by then
     * @dev Likely needs to be called from the frontend
     */
    function finalizeCampaign() external isActiveCampaign deadlineExceeded onlyAdmin{
        if (totalFunds >= fundingGoal) {
            //SX: Changed > to >=
            releaseFunds();
        } else {
            isActive = false; // Called here and not before if statement because releaseFunds() has isActive = False as well.

            // Refund totalFunds to all donors by calling the refund function for each donor
            uint256 totalDonors = donors.length; // Minimising gas used for repeatedly reading the array length inside the loop

            for (uint256 i = 0; i < totalDonors; i++) {
                address donor = donors[i];
                uint32 donationAmount = donations[donor];
                // Removed the use of `refund()` helper function to avoid gas costs associated with function jumps
                // Directly handled refund logic inside the loop
                if (donationAmount > 0) {
                    donations[donor] = 0;
                    payable(donor).transfer(donationAmount);

                    emit RefundIssued(address(this), donor, donationAmount);
                }
            }

            delete donors; // no longer needed, as this state variable is used to keep track of donor addresses

            emit CampaignFinalized(
                address(this),
                beneficiary,
                false,
                totalFunds
            );
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
    * @dev Get the total donation amount contributed by the caller to this Campaign
    * @dev This function allows donors to privately check how much they have donated to the Campaign
    * @return The total donation amount (in cryptocurrency) contributed by the caller
    */
    function getMyDonations() external view returns (uint32) {
    return donations[msg.sender];
    }


    /**
     * @dev Get all the Campaign details from its state variables
     */
    function getCampaignDetails()
        external
        view
        returns (
            address campaignBeneficiary,
            string memory campaignName,
            string memory campaignDescription,
            uint256 campaignDeadline,
            uint32 campaignFundingGoal,
            uint32 campaignTotalFunds,
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

    // /**
    //  * @dev Refunds the donor's donation
    //  * @dev It is some sort of a helper function
    //  * @param donor The donor wallet to refund the donation back to
    //  */
    // function refund(address donor) private {
    //     uint32 donationAmount = donations[donor];
    //     delete donations[donor]; // more gas efficient than donations[donor] = 0

    //     // refund to the donor
    //     payable(donor).transfer(donationAmount);

    //     emit RefundIssued(
    //         donor,
    //         donationAmount
    //     );
    // }
}
