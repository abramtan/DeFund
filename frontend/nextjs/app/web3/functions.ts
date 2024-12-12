// @ts-nocheck
import toast from "react-hot-toast";
import Web3 from "web3";
import { Campaign } from "./campaign";
import { Events } from "./events";
import {
  bytes32ToString,
  convertEthToWei,
  convertToLocalStorageKey,
  getAccount,
  getCampaignContract,
  getCampaignFactoryContract,
  getGasEstimate,
  getWeb3,
  LocalStorageKeys,
  stringToBytes32,
} from "./utils";

// Create a new campaign
export const createCampaign = async (
  name: string,
  description: string,
  fundingGoal: number,
  deadline: number,
) => {
  const web3 = getWeb3();
  const account = getAccount();
  const contract = getCampaignFactoryContract();
  const fundingGoalInWei = web3.utils.toWei(fundingGoal, "ether");
  console.log("Deadline received by createCampaign (seconds):", deadline);

  const method = contract.methods.createCampaign(
    stringToBytes32(name),
    stringToBytes32(description),
    fundingGoalInWei,
    deadline,
  );

  try {
    const estimatedGas = await getGasEstimate(method);
    alert(`Estimated gas: ${estimatedGas}`);

    await method.send({ from: account! });
  } catch (error) {
    console.error("Error during campaign creation:", error);
    throw new Error("User cancelled campaign creation!");
  }
};

// Fetch active campaigns
export const getActiveDeployedCampaigns = async (): Promise<Campaign[]> => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();

  // Get all deployed campaign deadl
  const events = await contract.getPastEvents(Events.CampaignCreated, {
    fromBlock: 0,
    toBlock: "latest",
  });
  const campaignAddresses = events.map(
    (event) => event.returnValues.campaignAddress,
  );

  // Get active campaigns
  const activeCampaigns: Campaign[] = await Promise.all(
    campaignAddresses.map(async (campaignAddress) => {
      const campaignContract = getCampaignContract(campaignAddress);
      const details = await campaignContract.methods
        .getCampaignDetails()
        .call({ from: account! });

      if (!details.campaignIsActive) return null; // Filter out inactive campaigns

      return {
        address: campaignAddress,
        beneficiary: details.campaignBeneficiary,
        name: details.campaignName,
        description: details.campaignDescription,
        deadline: Number(details.campaignDeadline),
        fundingGoal: Number(details.campaignFundingGoal),
        totalFunds: Number(details.campaignTotalFunds),
        isActive: details.campaignIsActive,
        contract: campaignContract,
      } as Campaign;
    }),
  );

  return activeCampaigns.filter(Boolean); // Remove null values
};

// Fetch all campaigns (active and inactive)
export const getAllDeployedCampaigns = async (): Promise<Campaign[]> => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();

  // Get all deployed campaign addresses
  const events = await contract.getPastEvents(Events.CampaignCreated, {
    fromBlock: 0,
    toBlock: "latest",
  });
  const campaignAddresses = events.map(
    (event) => event.returnValues.campaignAddress,
  );

  // Fetch details for all campaigns
  const allCampaigns: Campaign[] = await Promise.all(
    campaignAddresses.map(async (campaignAddress) => {
      const campaignContract = getCampaignContract(campaignAddress);
      const details = await campaignContract.methods
        .getCampaignDetails()
        .call({ from: account! });

      return {
        address: campaignAddress,
        beneficiary: details.campaignBeneficiary,
        name: details.campaignName,
        description: details.campaignDescription,
        deadline: Number(details.campaignDeadline),
        fundingGoal: Number(details.campaignFundingGoal),
        totalFunds: Number(details.campaignTotalFunds),
        isActive: details.campaignIsActive,
        contract: campaignContract,
      } as Campaign;
    }),
  );

  return allCampaigns.filter(Boolean); // Remove null or undefined values
};

// Fetch all active campaign belonging to the user
// Used for polling for DonationMade events
export const getMyActiveCampaigns = async (): Promise<Campaign[]> => {
  const account = getAccount();
  const activeCampaigns = await getActiveDeployedCampaigns();
  const myActiveCampaigns = activeCampaigns.filter(
    (activeCampaign) => activeCampaign.beneficiary.toLowerCase() === account,
  );
  return myActiveCampaigns;
};

// Fetch all inactive campaigns
export const getInactiveCampaigns = async (): Promise<Campaign[]> => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();

  // Get all deployed campaign addresses
  const events = await contract.getPastEvents(Events.CampaignCreated, {
    fromBlock: 0,
    toBlock: "latest",
  });
  const campaignAddresses = events.map(
    (event) => event.returnValues.campaignAddress,
  );

  // Fetch details for all campaigns
  const inactiveCampaigns: Campaign[] = await Promise.all(
    campaignAddresses.map(async (campaignAddress) => {
      const campaignContract = getCampaignContract(campaignAddress);
      const details = await campaignContract.methods
        .getCampaignDetails()
        .call({ from: account! });

      // Filter out active campaigns, and only return inactive ones
      if (details.isActive) return null; // Only select inactive campaigns

      return {
        address: campaignAddress,
        beneficiary: details.campaignBeneficiary,
        name: details.campaignName,
        description: details.campaignDescription,
        deadline: Number(details.campaignDeadline),
        fundingGoal: Number(details.campaignFundingGoal),
        totalFunds: Number(details.campaignTotalFunds),
        isActive: details.isActive,
        contract: campaignContract,
      } as Campaign;
    }),
  );

  return inactiveCampaigns.filter(Boolean); // Remove null values (active campaigns)
};

// Donates to a specific campaign
export const donateToCampaign = async (
  campaignAddress: string,
  donationAmount: number,
) => {
  const account = getAccount();
  const contract = getCampaignContract(campaignAddress);
  const method = contract.methods.donate();
  const web3 = getWeb3();

  try {
    // Estimate gas for the transaction
    const estimatedGas = await getGasEstimate(method);
    alert(`Estimated gas: ${estimatedGas}`);

    // Convert donation amount to Wei
    const amountInWei = convertEthToWei(donationAmount);

    // Send the transaction to the campaign's `donate` method
    await method.send({ from: account, value: amountInWei });
  } catch (error) {
    console.error("Error during campaign donation:", error);
    throw error;
  }
};

// Fetch campaigns created by the user (my campaigns)
export const getMyCampaigns = async (): Promise<Campaign[]> => {
  const account = getAccount(); // Get the user's wallet address
  const contract = getCampaignFactoryContract();

  // Get all deployed campaign addresses
  const events = await contract.getPastEvents(Events.CampaignCreated, {
    fromBlock: 0,
    toBlock: "latest",
  });
  const campaignAddresses = events.map(
    (event) => event.returnValues.campaignAddress,
  );

  // Fetch details for campaigns owned by the user
  const myCampaigns: Campaign[] = await Promise.all(
    campaignAddresses.map(async (campaignAddress) => {
      const campaignContract = getCampaignContract(campaignAddress);
      const details = await campaignContract.methods
        .getCampaignDetails()
        .call({ from: account! });

      // Check if the beneficiary matches the user's address
      if (
        details.campaignBeneficiary.toLowerCase() !== account!.toLowerCase()
      ) {
        return null; // Skip campaigns not created by the user
      }
      return {
        address: campaignAddress,
        beneficiary: details.campaignBeneficiary,
        name: details.campaignName,
        description: details.campaignDescription,
        deadline: Number(details.campaignDeadline),
        fundingGoal: Number(details.campaignFundingGoal),
        totalFunds: Number(details.campaignTotalFunds),
        isActive: details.campaignIsActive,
        contract: campaignContract,
      } as Campaign;
    }),
  );

  return myCampaigns.filter(Boolean); // Remove null values
};

// Fetch the current blockchain time
export const getBlockchainTime = async (): Promise<number> => {
  try {
    const web3 = getWeb3(); // Initialize Web3 instance
    const latestBlock = await web3.eth.getBlock("latest"); // Fetch the latest block

    if (!latestBlock || !latestBlock.timestamp) {
      throw new Error("Failed to fetch the latest block or its timestamp.");
    }

    // Convert the BigInt timestamp to a Number
    const blockchainTime = Number(latestBlock.timestamp); // Explicit conversion

    console.log("Current Blockchain Time (UNIX):", blockchainTime);
    console.log(
      "Current Blockchain Time (Readable):",
      new Date(blockchainTime * 1000), // Convert UNIX timestamp to milliseconds for Date
    );

    return blockchainTime; // Return the timestamp in seconds
  } catch (error) {
    console.error("Error fetching blockchain time:", error);
    throw new Error("Failed to fetch blockchain time.");
  }
};

export const finalizeCampaign = async (campaignAddress: string) => {
  const account = getAccount(); // Get the user's wallet address
  const contract = getCampaignContract(campaignAddress); // Get the campaign contract instance
  const details = await contract.methods
    .getCampaignDetails()
    .call({ from: account! });

  try {
    // Check if the campaign can be finalized
    const blockchainTime = await getBlockchainTime();
    // const campaignDeadline = await contract.methods.deadline().call();

    if (
      BigInt(blockchainTime) >= BigInt(details.campaignDeadline) ||
      details.campaignTotalFunds >= details.campaignFundingGoal
    ) {
      // continue;
    } else {
      alert("Campaign cannot be finalized yet");
      return false; // Failed to finalize campaign
    }

    // Estimate gas and send the transaction
    const method = contract.methods.finalizeCampaign();
    const estimatedGas = await getGasEstimate(method);
    alert(`Estimated gas: ${estimatedGas}`);
    await method.send({ from: account });
    return true; // Suceessfully
  } catch (error) {
    console.error("Error during campaign finalization:", error);

    if (error.message.includes("The Campaign's deadline has not passed!")) {
      alert("The Campaign's deadline has not been reached yet.");
    } else {
      alert("An unexpected error occurred.");
    }
  }
};

/**
 * Polls DonationMade events for a given campaign contract and updates the state.
 * @param campaignAddress - The contract address of the campaign to poll.
 * @param latestBlock - The latest block number already processed.
 * @param setDonations - Function to update the donations state.
 * @returns The latest block number processed.
 */
export const pollDonationMadeEvents = async (
  campaignAddress: string,
  latestBlock: number,
  setDonations: React.Dispatch<
    React.SetStateAction<
      { campaignAddress: string; donor: string; amount: string }[]
    >
  >,
): Promise<number> => {
  try {
    const web3 = getWeb3(); // Initialize web3 instance
    const campaignContract = getCampaignContract(campaignAddress); // Get the campaign contract instance
    const currentBlock = Number(await web3.eth.getBlockNumber()); // Get the current block number

    // Fetch events from the blockchain starting from the latest processed block
    //@ts-ignore
    const events = await campaignContract.getPastEvents(Events.DonationMade, {
      fromBlock: latestBlock + 1,
      toBlock: "latest",
    });

    const account = getAccount();
    const details = await campaignContract.methods
      .getCampaignDetails()
      .call({ from: account! });

    if (events.length > 0) {
      // Update the latest block number in localStorage
      localStorage.setItem(
        convertToLocalStorageKey(
          LocalStorageKeys.DonationMade,
          campaignAddress,
        ),
        String(currentBlock),
      );

      // Process each new event and update the donations state
      events.forEach((event) => {
        //@ts-ignore
        const { amount } = event.returnValues;
        const donationAmount = web3.utils.fromWei(amount, "ether"); // Convert donation amount from Wei to Ether

        // Create a toast to notify the beneficiary that a donor has donated to their campaign
        toast.success(
          //@ts-ignore
          `Beneficiary: Donation of ${donationAmount} ETH made to your Campaign "${bytes32ToString(details.campaignName)}"`,
        );

        setDonations((prevDonations) => [
          ...prevDonations,
          {
            campaignAddress,
            donor: campaignAddress,
            amount: donationAmount,
          },
        ]);
      });
    }

    return currentBlock; // Return the updated block number
  } catch (error) {
    console.error("Error polling DonationMade events:", error);
    return latestBlock; // Return the previous block number if an error occurs
  }
};

/**
 * Polls CampaignFinalized events for a given campaign contract and updates the state.
 * @param campaignAddress - The contract address of the campaign to poll.
 * @param latestBlock - The latest block number already processed.
 * @param setCampaignFinalized - Function to update the campaign finalization state.
 * @returns The latest block number processed.
 */
export const pollCampaignFinalizedEvents = async (
  campaignAddress: string,
  latestBlock: number,
  setCampaignFinalized: React.Dispatch<React.SetStateAction<any[]>>,
): Promise<number> => {
  try {
    const web3 = getWeb3(); // Initialize web3 instance
    const account = getAccount();
    const campaignContract = getCampaignContract(campaignAddress); // Get the campaign contract instance
    const currentBlock = Number(await web3.eth.getBlockNumber()); // Get the current block number

    // Fetch events from the blockchain starting from the latest processed block
    const events = await campaignContract.getPastEvents(
      Events.CampaignFinalized,
      {
        fromBlock: latestBlock + 1,
        toBlock: "latest",
      },
    );

    const details = await campaignContract.methods
      .getCampaignDetails()
      .call({ from: account! });

    if (events.length > 0) {
      // Update the latest block number in localStorage
      localStorage.setItem(
        convertToLocalStorageKey(
          LocalStorageKeys.CampaignFinalized,
          campaignAddress,
        ),
        String(currentBlock),
      );

      // Process each event and trigger notifications
      for (const event of events) {
        const { beneficiary, success, totalFunds } = event.returnValues;
        // Fetch the donor list dynamically
        const donors = await campaignContract.methods
          .getDonors()
          .call({ from: account! });

        // This is what is executed by the beneficiary only
        if (beneficiary.toLowerCase() === account) {
          // Notify the beneficiary about the outcome
          if (success) {
            toast.success(
              `Beneficiary: Campaign "${bytes32ToString(details.campaignName)}" is successful and finalized! Total Funds Released to you: ${Web3.utils.fromWei(totalFunds, "ether")} ETH.`,
            );
          } else {
            if (donors.length > 0) {
              toast.error(
                `Beneficiary: Campaign "${bytes32ToString(details.campaignName)}" is unsuccessful and all donors have been refunded.`,
              );
            } else {
              toast.error(
                `Beneficiary: Campaign "${bytes32ToString(details.campaignName)}" is unsuccessful and your campaign has been finalized.`,
              );
            }
          }
        }

        // Notify the donors
        donors.forEach((donor: string) => {
          if (donor.toLowerCase() === account) {
            if (success) {
              toast.success(
                `Donor: Campaign "${bytes32ToString(details.campaignName)}" is successful and finalized!`,
              );
            } else {
              toast.error(
                `Donor: Campaign "${bytes32ToString(details.campaignName)}" is unsuccessful. Refund in progress.`,
              );
            }
          }
        });

        // Update the state with finalized campaign events
        setCampaignFinalized((prevState) => [
          ...prevState,
          {
            campaignAddress,
            beneficiary,
            success,
            totalFunds: Web3.utils.fromWei(totalFunds, "ether"),
          },
        ]);
      }
    }

    return currentBlock; // Return the updated block number
  } catch (error) {
    console.error("Error polling CampaignFinalized events:", error);
    return latestBlock; // Return the previous block number if an error occurs
  }
};

/**
 * Polls FundingGoalMet events for a given campaign contract and notifies the beneficiary.
 * @param campaignAddress - The contract address of the campaign to poll.
 * @param latestBlock - The latest block number already processed.
 * @returns The latest block number processed.
 */
export const pollFundingGoalMetEvents = async (
  campaignAddress: string,
  latestBlock: number,
): Promise<number> => {
  try {
    const web3 = getWeb3(); // Initialize web3 instance
    const account = getAccount(); // Get the current user's account
    const campaignContract = getCampaignContract(campaignAddress); // Get the campaign contract instance
    const currentBlock = Number(await web3.eth.getBlockNumber()); // Get the current block number

    // Fetch FundingGoalMet events from the blockchain starting from the latest processed block
    const events = await campaignContract.getPastEvents(Events.FundingGoalMet, {
      fromBlock: latestBlock + 1,
      toBlock: "latest",
    });

    // Get campaign details
    const details = await campaignContract.methods
      .getCampaignDetails()
      .call({ from: account! });

    if (events.length > 0) {
      // Update the latest block number in localStorage
      localStorage.setItem(
        convertToLocalStorageKey(
          LocalStorageKeys.FundingGoalMet,
          campaignAddress,
        ),
        String(currentBlock),
      );

      // Check if the current user is the beneficiary
      if (details.campaignBeneficiary.toLowerCase() === account) {
        // Notify the beneficiary
        toast.success(
          `Beneficiary: Your campaign "${bytes32ToString(details.campaignName)}" has met its funding goal! Please proceed to finalize the campaign.`,
        );
      }
    }

    return currentBlock; // Return the updated block number
  } catch (error) {
    console.error("Error polling FundingGoalMet events:", error);
    return latestBlock; // Return the previous block number if an error occurs
  }
};

/**
 * Polls RefundIssued events for a given campaign contract and notifies the respective donors.
 * @param campaignAddress - The contract address of the campaign to poll.
 * @param latestBlock - The latest block number already processed.
 * @returns The latest block number processed.
 */
export const pollRefundIssuedEvents = async (
  campaignAddress: string,
  latestBlock: number,
): Promise<number> => {
  try {
    const web3 = getWeb3(); // Initialize web3 instance
    const account = getAccount(); // Get the current user's account
    const campaignContract = getCampaignContract(campaignAddress); // Get the campaign contract instance
    const currentBlock = Number(await web3.eth.getBlockNumber()); // Get the current block number

    // Fetch RefundIssued events from the blockchain starting from the latest processed block
    const events = await campaignContract.getPastEvents(Events.RefundIssued, {
      fromBlock: latestBlock + 1,
      toBlock: "latest",
    });

    const details = await campaignContract.methods
      .getCampaignDetails()
      .call({ from: account! });

    if (events.length > 0) {
      // Update the latest block number in localStorage
      localStorage.setItem(
        convertToLocalStorageKey(
          LocalStorageKeys.RefundIssued,
          campaignAddress,
        ),
        String(currentBlock),
      );

      // Process each event and trigger refund notification to each donor
      events.forEach(async (event, index) => {
        const { donor, amount } = event.returnValues;
        const donationAmount = web3.utils.fromWei(amount, "ether"); // Convert donation amount from Wei to Ether
        if (donor.toLowerCase() === account) {
          toast.success(
            `Donor: You have been refunded ${donationAmount} ETH from campaign "${bytes32ToString(details.campaignName)}".`,
          );
        }
      });
    }

    return currentBlock; // Return the updated block number
  } catch (error) {
    console.error("Error polling RefundIssued events:", error);
    return latestBlock; // Return the previous block number if an error occurs
  }
};

export const getNumDonors = async (campaignAddress: string): number => {
  const account = getAccount();
  const contract = getCampaignContract(campaignAddress);
  const donors = await contract.methods.getDonors().call({ from: account! });
  return donors.length;
};
