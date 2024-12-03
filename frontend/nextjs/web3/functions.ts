import Web3 from "web3";
import { Campaign } from "./campaign";
import {
  CAMPAIGN_ABI,
  CAMPAIGN_FACTORY_ABI,
  CAMPAIGN_FACTORY_ADDRESS,
} from "./const";
import { Events } from "./events";

export const createCampaign = async (
  name: string,
  description: string,
  fundingGoal: number,
  deadline: number,
) => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();
  const method = contract.methods.createCampaign(
    name,
    description,
    fundingGoal,
    deadline,
  );

  try {
    const estimatedGas = await getGasEstimate(method);
    alert(`Estimated gas: ${estimatedGas}`);

    await method.send({ from: account! });
  } catch (error) {
    throw new Error("User cancelled campaign creation!");
  }
};

export const getActiveDeployedCampaigns = async (): Campaign[] => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();

  // get all deployed Campaign addresses
  const events = await contract.getPastEvents(Events.CampaignCreated, {
    fromBlock: 0,
    toBlock: "latest",
  });
  const campaignAddresses = events.map(
    (event) => event.returnValues.campaignAddress,
  );

  // get active Campaigns
  const activeCampaigns: Campaign[] = await Promise.all(
    campaignAddresses.map(async (campaignAddress) => {
      const campaignContract = getCampaignContract(campaignAddress);
      const {
        campaignBeneficiary,
        campaignName,
        campaignDescription,
        campaignDeadline,
        campaignFundingGoal,
        campaignTotalFunds,
        campaignIsActive,
      } = await campaignContract.methods
        .getCampaignDetails()
        .call({ from: account! });

      if (!campaignIsActive) return; // we do not want to display inactive Campaigns on the Campaigns and Home pages

      return {
        address: campaignAddress,
        beneficiary: campaignBeneficiary,
        name: campaignName,
        description: campaignDescription,
        deadline: Number(campaignDeadline),
        fundingGoal: Number(campaignFundingGoal),
        totalFunds: Number(campaignTotalFunds),
        isActive: campaignIsActive,
      } as Campaign;
    }),
  );

  return activeCampaigns;
};

// helper functions
const getCampaignFactoryContract = () => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(CAMPAIGN_FACTORY_ABI, CAMPAIGN_FACTORY_ADDRESS);
};

const getCampaignContract = (campaignAddress: string) => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(CAMPAIGN_ABI, campaignAddress);
};

const getAccount = () => {
  return localStorage.getItem("account");
};

const getGasEstimate = async (method: any) => {
  const account = getAccount();
  return await method.estimateGas({ from: account! });
};
