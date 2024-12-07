// @ts-nocheck
import Web3 from "web3";
import { Campaign } from "./campaign";
import {
  CAMPAIGN_ABI,
  CAMPAIGN_FACTORY_ABI,
  CAMPAIGN_FACTORY_ADDRESS,
} from "./const";
import { Events } from "./events";
import {
  getWeb3,
  getAccount,
  getCampaignFactoryContract,
  getGasEstimate,
  getCampaignContract,
  convertEthToWei,
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
    name,
    description,
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

  // Get all deployed campaign addresses
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

  try {
    // Check if the campaign can be finalized
    const blockchainTime = await getBlockchainTime();
    const campaignDeadline = await contract.methods.deadline().call();
    if (BigInt(blockchainTime) <= BigInt(campaignDeadline)) {
      alert("The campaign deadline has not passed yet!");
      return;
    }

    // Estimate gas and send the transaction
    const method = contract.methods.finalizeCampaign();
    console.log("Estimating gas...");
    const estimatedGas = await getGasEstimate(method);
    console.log(`Estimated Gas: ${estimatedGas}`);
    const receipt = await method.send({ from: account });
    console.log(`Transaction Receipt for finalize campagin function:`, receipt);
    alert("Campaign finalized successfully!");

    // Check for events
    console.log("Checking for CampaignFinalized event...");

    // Handle CampaignFinalized Event
    const campaignFinalizedEvent = receipt.events.CampaignFinalized;
    if (campaignFinalizedEvent) {
      console.log("CampaignFinalized event detected:", campaignFinalizedEvent);
      const { finalizedSuccessfully, totalFunds } =
        campaignFinalizedEvent.returnValues;
      if (finalizedSuccessfully) {
        alert(
          `Campaign finalized successfully! Total Funds Released: ${Web3.utils.fromWei(totalFunds, "ether")} ETH.`,
        );
      } else {
        alert(
          `Campaign did not meet the funding goal. Refunds have been issued to all donors.`,
        );
      }
    }

    // Handle RefundIssued Events
    console.log("Checking for RefundIssued event...");
    const refundIssuedEvent = receipt.events.RefundIssued;

    if (refundIssuedEvent) {
      if (Array.isArray(refundIssuedEvent)) {
        console.log("RefundIssued event detected:", refundIssuedEvent);

        // Multiple RefundIssued events
        refundIssuedEvent.forEach((event) => {
          const { campaignAddress, donor, donationAmount } = event.returnValues;
          alert(
            `Refund issued to ${donor} amounting to ${Web3.utils.fromWei(amount, "ether")} ETH.`,
          );
        });
      } else {
        // Single RefundIssued event
        console.log("Single RefundIssued event detected:", refundIssuedEvent);
        const { campaignAddress, donor, amount } =
          refundIssuedEvent.returnValues;
        alert(
          `Refund issued to ${donor} amounting to ${Web3.utils.fromWei(amount, "ether")} ETH.`,
        );
      }
    }

    // Handle FundsWithdrawn event
    const fundsWithdrawnEvent = receipt.events.FundsWithdrawn;
    if (fundsWithdrawnEvent) {
      const { beneficiary, fundsToRelease } = fundsWithdrawnEvent.returnValues;
      alert(
        `Funds have been withdrawn to ${beneficiary} amounting to ${Web3.utils.fromWei(fundsToRelease, "ether")} ETH.`,
      );
    } else {
      alert("Campaign finalized, but no funds were released.");
    }
  } catch (error) {
    console.error("Error during campaign finalization:", error);

    if (error.message.includes("The Campaign's deadline has not passed!")) {
      alert("The Campaign's deadline has not been reached yet.");
    } else {
      alert("An unexpected error occurred.");
    }
  }
};
