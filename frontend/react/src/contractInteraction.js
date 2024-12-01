import { ethers } from "ethers";
import { useContract, useSigner } from "wagmi";

const contractABI = [
    [{"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"campaignAddress","type":"address"},{"indexed":false,"internalType":"address","name":"beneficiary","type":"address"},{"indexed":false,"internalType":"uint32","name":"fundingGoal","type":"uint32"},{"indexed":false,"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"CampaignCreated","type":"event"},{"inputs":[{"internalType":"string","name":"_name","type":"string"},{"internalType":"string","name":"_purpose","type":"string"},{"internalType":"string","name":"_description","type":"string"},{"internalType":"uint32","name":"_fundingGoal","type":"uint32"},{"internalType":"uint256","name":"_deadline","type":"uint256"}],"name":"createCampaign","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"deployedCampaigns","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getDeployedCampaigns","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"}]
];

const contractAddress = "0x77459810eee8de62039ad5106e6a7e5519e6b492";

export function useYourContract() {
  const { data: signer } = useSigner();

  const contract = useContract({
    addressOrName: contractAddress,
    contractInterface: contractABI,
    signerOrProvider: signer,
  });

  return contract;
}
