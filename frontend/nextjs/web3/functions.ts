import Web3 from "web3";
import { CAMPAIGN_FACTORY_ABI, CAMPAIGN_FACTORY_ADDRESS } from "./const";

export const createCampaign = async (
  name: string,
  description: string,
  fundingGoal: number,
  deadline: number
) => {
  const account = getAccount();
  const contract = getCampaignFactoryContract();
  await contract.methods
    .createCampaign(name, description, fundingGoal, deadline)
    .send({ from: account! });
};

export const getActiveDeployedCampaigns = async () => {
  const contract = getCampaignFactoryContract();

  // TODO: query for the CampaignCreated event emitted from the CampaignFactory
}

// helper functions
const getCampaignFactoryContract = () => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(CAMPAIGN_FACTORY_ABI, CAMPAIGN_FACTORY_ADDRESS);
};

const getAccount = () => {
  return localStorage.getItem("account");
};
