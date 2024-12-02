import Web3 from "web3";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./const";

export const createCampaign = async (
  name: string,
  description: string,
  fundingGoal: number,
  deadline: number
) => {
  const account = getAccount();
  const contract = getContract();
  await contract.methods
    .createCampaign(name, description, fundingGoal, deadline)
    .send({ from: account! });
};

// helper functions
const getContract = () => {
  const web3 = new Web3(window.ethereum);
  return new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
};

const getAccount = () => {
  return localStorage.getItem("account");
};
