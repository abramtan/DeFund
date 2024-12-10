import Web3 from "web3";
import {
  CAMPAIGN_ABI,
  CAMPAIGN_FACTORY_ABI,
  CAMPAIGN_FACTORY_ADDRESS,
} from "./const";

// Helper functions
export const getCampaignFactoryContract = () => {
  const web3 = getWeb3();
  return new web3.eth.Contract(CAMPAIGN_FACTORY_ABI, CAMPAIGN_FACTORY_ADDRESS);
};

export const getCampaignContract = (campaignAddress: string) => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(CAMPAIGN_ABI, campaignAddress);
};

export const getAccount = () => {
  const account = localStorage.getItem(LocalStorageKeys.Account);
  if (!account) {
    throw new Error("No account found. Please log in to your wallet.");
  }
  return account;
};

export const getGasEstimate = async (method: any) => {
  const account = getAccount();
  return await method.estimateGas({ from: account! });
};

export const getWeb3 = () => {
  return new Web3(window.ethereum);
};

export const convertEthToWei = (amountInEth: number) => {
  const web3 = getWeb3();
  return Number(web3.utils.toWei(amountInEth, "ether"));
};

export const convertWeiToEth = (amountInWei: number) => {
  const web3 = getWeb3();
  return Number(web3.utils.fromWei(amountInWei, "ether"));
};

export const convertToLocalStorageKey = (
  key: LocalStorageKeys,
  campaignAddress: string,
) => {
  return `${key}_${campaignAddress}`;
};

// Enum for localStorage keys for accounts and polling (notificaitons)
export enum LocalStorageKeys {
  DonationMade = "donationMade_latestBlock",
  CampaignFinalized = "campaignFinalized_latestBlock",
  RefundIssued = "refundIssued_latestBlock",
  FundsWithdrawn = "fundsWithdrawn_latestBlock",
  Account = "account",
}
